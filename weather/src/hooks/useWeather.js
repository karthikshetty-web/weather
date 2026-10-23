import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeather, fetchAirQuality, getIPLocation, reverseGeocode } from '../services/api';

const SAVED_CITY_KEY = 'skyscape_last_active_city';

export function useWeather() {
  const [city, setCity] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_CITY_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [weatherData, setWeatherData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const abortControllerRef = useRef(null);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-detect nearby location on initial load if no city saved yet
  useEffect(() => {
    if (!city) {
      let isSubscribed = true;

      // 1. First try browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (!isSubscribed) return;
            const { latitude, longitude } = pos.coords;
            try {
              const place = await reverseGeocode(latitude, longitude);
              setCity(place);
              localStorage.setItem(SAVED_CITY_KEY, JSON.stringify(place));
            } catch (e) {
              fallbackIP();
            }
          },
          () => {
            fallbackIP();
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        fallbackIP();
      }


      async function fallbackIP() {
        if (!isSubscribed) return;
        try {
          const ipPlace = await getIPLocation();
          if (ipPlace && isSubscribed) {
            setCity(ipPlace);
            localStorage.setItem(SAVED_CITY_KEY, JSON.stringify(ipPlace));
            return;
          }
        } catch (e) {}

        // Fallback default only if everything fails
        if (isSubscribed) {
          const fallback = {
            name: 'London',
            country: 'United Kingdom',
            admin1: 'England',
            latitude: 51.5074,
            longitude: -0.1278,
            timezone: 'Europe/London',
          };
          setCity(fallback);
          localStorage.setItem(SAVED_CITY_KEY, JSON.stringify(fallback));
        }
      }

      return () => {
        isSubscribed = false;
      };
    }
  }, [city]);

  const loadData = useCallback(async (targetCity = city, isSilent = false) => {
    if (!targetCity || targetCity.latitude == null || targetCity.longitude == null) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!isSilent) setLoading(true);
    setError(null);

    try {
      const [weather, aqi] = await Promise.all([
        fetchWeather(targetCity.latitude, targetCity.longitude, targetCity.timezone || 'auto', controller.signal),
        fetchAirQuality(targetCity.latitude, targetCity.longitude, targetCity.timezone || 'auto', controller.signal),
      ]);

      setWeatherData(weather);
      setAqiData(aqi);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Weather load error:', err);
      setError(err.message || 'Unable to retrieve weather data.');
      setLoading(false);
    }
  }, [city]);

  // Load when city changes
  useEffect(() => {
    if (city) {
      loadData(city);
      try {
        localStorage.setItem(SAVED_CITY_KEY, JSON.stringify(city));
      } catch (e) {}
    }
  }, [city, loadData]);

  // Auto-refresh every 5 minutes (300,000 ms)
  useEffect(() => {
    if (!city) return;
    const interval = setInterval(() => {
      loadData(city, true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [city, loadData]);

  const selectCity = useCallback((newCity) => {
    if (!newCity) return;
    setCity(newCity);
  }, []);

  const refresh = useCallback(() => {
    return loadData(city, false);
  }, [city, loadData]);

  return {
    city,
    weatherData,
    aqiData,
    loading,
    error,
    lastUpdated,
    isOffline,
    selectCity,
    refresh,
  };
}
