// Dynamic Theme Generator based on Weather Condition & Solar Position

export function getTimeOfDay(now, sunriseStr, sunsetStr) {
  if (!sunriseStr || !sunsetStr) {
    const hour = now.getHours();
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 17) return 'day';
    if (hour >= 17 && hour < 19) return 'sunset';
    return 'night';
  }

  const sunrise = new Date(sunriseStr).getTime();
  const sunset = new Date(sunsetStr).getTime();
  const current = now.getTime();

  const dawnStart = sunrise - 45 * 60 * 1000;
  const goldenHourStart = sunset - 60 * 60 * 1000;
  const duskEnd = sunset + 45 * 60 * 1000;

  if (current >= dawnStart && current < sunrise + 30 * 60 * 1000) {
    return 'dawn';
  } else if (current >= sunrise + 30 * 60 * 1000 && current < goldenHourStart) {
    return 'day';
  } else if (current >= goldenHourStart && current < duskEnd) {
    return 'sunset';
  } else {
    return 'night';
  }
}

export function getTheme(condition = 'clear', timeOfDay = 'day', isDark = true) {
  // Base configurations for timeOfDay
  let sky = {
    top: '#102042',
    bottom: '#254a7c',
    fog: '#1a335a',
    sunLight: '#ffe5a3',
    ambientLight: '#8da4c4',
    sunIntensity: 1.2,
    moonIntensity: 0.2,
    starOpacity: 0.1,
  };

  let accentColor = '#38bdf8';
  let cardBg = 'rgba(15, 23, 42, 0.65)';
  let cardBorder = 'rgba(255, 255, 255, 0.12)';
  let glowColor = 'rgba(56, 189, 248, 0.25)';

  if (timeOfDay === 'dawn') {
    sky = {
      top: '#1e1b4b',
      bottom: '#fb923c',
      fog: '#f472b6',
      sunLight: '#ffedd5',
      ambientLight: '#fed7aa',
      sunIntensity: 0.9,
      moonIntensity: 0.3,
      starOpacity: 0.3,
    };
    accentColor = '#f97316';
    glowColor = 'rgba(249, 115, 22, 0.3)';
  } else if (timeOfDay === 'sunset') {
    sky = {
      top: '#31103f',
      bottom: '#ea580c',
      fog: '#c2410c',
      sunLight: '#fde047',
      ambientLight: '#fdba74',
      sunIntensity: 1.1,
      moonIntensity: 0.2,
      starOpacity: 0.2,
    };
    accentColor = '#fb923c';
    glowColor = 'rgba(251, 146, 60, 0.35)';
  } else if (timeOfDay === 'night') {
    sky = {
      top: '#030712',
      bottom: '#0f172a',
      fog: '#090d16',
      sunLight: '#38bdf8',
      ambientLight: '#1e293b',
      sunIntensity: 0.0,
      moonIntensity: 1.4,
      starOpacity: 0.95,
    };
    accentColor = '#818cf8';
    glowColor = 'rgba(129, 140, 248, 0.25)';
  }

  // Weather Condition adjustments
  if (condition === 'rain' || condition === 'heavy_rain' || condition === 'drizzle') {
    sky.top = timeOfDay === 'night' ? '#050a14' : '#1e293b';
    sky.bottom = timeOfDay === 'night' ? '#0b1324' : '#334155';
    sky.fog = '#1e293b';
    sky.sunIntensity *= 0.3;
    sky.ambientLight = '#475569';
    accentColor = '#06b6d4';
    glowColor = 'rgba(6, 182, 212, 0.3)';
  } else if (condition === 'thunderstorm') {
    sky.top = '#020617';
    sky.bottom = '#0f172a';
    sky.fog = '#090d16';
    sky.sunIntensity = 0.1;
    sky.ambientLight = '#1e293b';
    accentColor = '#a855f7';
    glowColor = 'rgba(168, 85, 247, 0.4)';
  } else if (condition === 'snow') {
    sky.top = timeOfDay === 'night' ? '#090f1d' : '#cbd5e1';
    sky.bottom = timeOfDay === 'night' ? '#172554' : '#f1f5f9';
    sky.fog = timeOfDay === 'night' ? '#111c33' : '#e2e8f0';
    sky.sunIntensity *= 0.6;
    accentColor = '#38bdf8';
    glowColor = 'rgba(56, 189, 248, 0.35)';
  } else if (condition === 'fog') {
    sky.top = '#334155';
    sky.bottom = '#64748b';
    sky.fog = '#475569';
    sky.sunIntensity *= 0.4;
    accentColor = '#94a3b8';
    glowColor = 'rgba(148, 163, 184, 0.3)';
  } else if (condition === 'cloudy') {
    sky.top = timeOfDay === 'night' ? '#090d16' : '#273549';
    sky.bottom = timeOfDay === 'night' ? '#131b2e' : '#4b5563';
    sky.fog = '#374151';
    sky.sunIntensity *= 0.5;
  }

  // Adjust card background if user chose Light Mode
  if (!isDark) {
    cardBg = 'rgba(255, 255, 255, 0.75)';
    cardBorder = 'rgba(255, 255, 255, 0.8)';
  }

  return {
    timeOfDay,
    condition,
    isDark,
    sky,
    accentColor,
    cardBg,
    cardBorder,
    glowColor,
  };
}
