// Units conversion and formatting helpers

export function formatTemp(celsius, unit = 'C') {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
  if (unit === 'F') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°`;
  }
  return `${Math.round(celsius)}°`;
}

export function convertTemp(celsius, unit = 'C') {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return 0;
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatSpeed(kmh, unit = 'km/h') {
  if (kmh === undefined || kmh === null || isNaN(kmh)) return '--';
  if (unit === 'mph') {
    return `${(kmh * 0.621371).toFixed(1)} mph`;
  }
  if (unit === 'm/s') {
    return `${(kmh / 3.6).toFixed(1)} m/s`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function getWindDirection(deg) {
  if (deg === undefined || deg === null) return 'N';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

export function formatVisibility(meters, unit = 'metric') {
  if (meters === undefined || meters === null || isNaN(meters)) return '--';
  if (unit === 'imperial') {
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

export function formatPressure(hPa, unit = 'metric') {
  if (hPa === undefined || hPa === null || isNaN(hPa)) return '--';
  if (unit === 'imperial') {
    const inHg = hPa * 0.02953;
    return `${inHg.toFixed(2)} inHg`;
  }
  return `${Math.round(hPa)} hPa`;
}

export function getUVDescription(uv) {
  if (uv === undefined || uv === null) return { level: 'Low', color: '#10b981', advice: 'No protection required.' };
  if (uv < 3) return { level: 'Low', color: '#10b981', advice: 'Minimal sun protection needed.' };
  if (uv < 6) return { level: 'Moderate', color: '#f59e0b', advice: 'Wear sunglasses & SPF 30 sunscreen.' };
  if (uv < 8) return { level: 'High', color: '#f97316', advice: 'Cover up, wear hat and seek midday shade.' };
  if (uv < 11) return { level: 'Very High', color: '#ef4444', advice: 'Extra protection essential; avoid midday sun.' };
  return { level: 'Extreme', color: '#a855f7', advice: 'Dangerous levels. Stay indoors if possible.' };
}

export function getAQIDescription(aqi) {
  if (aqi === undefined || aqi === null) return { status: 'Good', color: '#10b981', desc: 'Air quality is satisfactory.' };
  if (aqi <= 50) return { status: 'Good', color: '#10b981', desc: 'Air quality is satisfactory and poses little risk.' };
  if (aqi <= 100) return { status: 'Moderate', color: '#eab308', desc: 'Acceptable quality; sensitive groups may take care.' };
  if (aqi <= 150) return { status: 'Unhealthy for Sensitive Groups', color: '#f97316', desc: 'Sensitive individuals may experience minor irritation.' };
  if (aqi <= 200) return { status: 'Unhealthy', color: '#ef4444', desc: 'Everyone may begin to experience health effects.' };
  if (aqi <= 300) return { status: 'Very Unhealthy', color: '#a855f7', desc: 'Health alert: increased risk for everyone.' };
  return { status: 'Hazardous', color: '#7e22ce', desc: 'Emergency warnings of severe health conditions.' };
}
