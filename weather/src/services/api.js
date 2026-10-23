// Open-Meteo API Service with in-memory & localStorage caching, debouncing, past + future history, and IP geolocation fallback

const CACHE_PREFIX = 'skyscape_cache_';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch (e) {
    // LocalStorage quota or access denied, ignore gracefully
  }
}

// Fetch Full Weather Forecast from Open-Meteo with 7 PAST DAYS + 14 FUTURE DAYS
export async function fetchWeather(lat, lon, timezone = 'auto', signal = null) {
  const cacheKey = `weather_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  const cached = getCached(cacheKey);

  // past_days=7 allows users to see history; forecast_days=14 allows looking into future
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,precipitation_probability,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index,visibility&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max&timezone=${encodeURIComponent(timezone)}&past_days=7&forecast_days=14`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.statusText}`);
    const data = await res.json();
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    if (signal?.aborted) throw err;
    if (cached) {
      console.warn('Network failed, serving cached weather data:', err);
      return { ...cached, isCached: true };
    }
    throw err;
  }
}

// Fetch Air Quality from Open-Meteo
export async function fetchAirQuality(lat, lon, timezone = 'auto', signal = null) {
  const cacheKey = `aqi_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  const cached = getCached(cacheKey);

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=${encodeURIComponent(timezone)}`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Air quality fetch failed: ${res.statusText}`);
    const data = await res.json();
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    if (signal?.aborted) throw err;
    if (cached) {
      return { ...cached, isCached: true };
    }
    return {
      current: {
        us_aqi: 42,
        pm2_5: 8.5,
        pm10: 16.2,
        carbon_monoxide: 210,
        nitrogen_dioxide: 14.1,
        sulphur_dioxide: 4.8,
        ozone: 48,
      },
      isFallback: true,
    };
  }
}

// City Search Autocomplete via Open-Meteo Geocoding
export async function searchCities(query, signal = null) {
  if (!query || query.trim().length < 2) return [];
  const clean = query.trim();

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=10&language=en&format=json`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    if (signal?.aborted) return [];
    console.error('City search failed:', err);
    return [];
  }
}

// IP-based Geolocation fallback (works immediately without prompting GPS permission)
export async function getIPLocation() {
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          name: data.city || data.region || 'Nearby You',
          admin1: data.region || '',
          country: data.country || '',
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone?.id || 'auto',
          isIP: true,
        };
      }
    }
  } catch (e) {
    console.warn('ipwho.is failed, trying fallback IP lookup...');
  }

  try {
    const res2 = await fetch('https://api.bigdatacloud.net/data/client-info');
    if (res2.ok) {
      const data = await res2.json();
      if (data.location) {
        return {
          name: data.location.city || data.location.principalSubdivision || 'Nearby You',
          admin1: data.location.principalSubdivision || '',
          country: data.location.countryName || '',
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          timezone: 'auto',
          isIP: true,
        };
      }
    }
  } catch (e) {
    console.warn('Secondary IP lookup failed');
  }

  return null;
}

// Reverse Geocode using browser coordinates
export async function reverseGeocode(lat, lon) {
  try {
    // 1st attempt: BigDataCloud reverse geocode (fast, no CORS restriction)
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(bdcUrl);
    if (res.ok) {
      const data = await res.json();
      const locality = data.locality || data.city || data.principalSubdivision || 'Current Location';
      return {
        name: locality,
        admin1: data.principalSubdivision || '',
        country: data.countryName || '',
        latitude: lat,
        longitude: lon,
        localityInfo: data.localityInfo?.informative || [],
      };
    }
  } catch (e) {
    console.warn('BigDataCloud reverse geocode failed, trying fallback...');
  }

  try {
    // 2nd attempt: Nominatim OpenStreetMap
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(osmUrl, {
      headers: { 'Accept-Language': 'en' },
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const locality = addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.village || 'Current Location';
      return {
        name: locality,
        admin1: addr.state || '',
        country: addr.country || '',
        latitude: lat,
        longitude: lon,
      };
    }
  } catch (e) {
    console.warn('Nominatim reverse geocode failed');
  }

  return {
    name: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
    admin1: '',
    country: '',
    latitude: lat,
    longitude: lon,
  };
}

// Fetch nearby locations around coordinates
export async function getNearbyAreas(lat, lon) {
  // Generate slightly offset coordinates representing nearby surrounding spots (North, South, East, West ~10-25km away)
  const offsets = [
    { label: 'North Sector', dLat: 0.12, dLon: 0 },
    { label: 'South Sector', dLat: -0.12, dLon: 0 },
    { label: 'East Sector', dLat: 0, dLon: 0.14 },
    { label: 'West Sector', dLat: 0, dLon: -0.14 },
  ];

  try {
    const results = await Promise.all(
      offsets.map(async (off) => {
        const spotLat = lat + off.dLat;
        const spotLon = lon + off.dLon;
        const place = await reverseGeocode(spotLat, spotLon);
        return {
          ...place,
          label: off.label,
        };
      })
    );
    // filter duplicates
    const unique = [];
    const seen = new Set();
    for (const item of results) {
      if (!seen.has(item.name)) {
        seen.add(item.name);
        unique.push(item);
      }
    }
    return unique;
  } catch (e) {
    return [];
  }
}
