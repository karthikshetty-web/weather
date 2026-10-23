// Lunar phase calculation using Synodic Month (29.53058867 days)

export function getMoonPhase(date = new Date()) {
  // Known new moon reference: Jan 11, 2024 at 11:57 UTC
  const knownNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57, 0)).getTime();
  const targetTime = new Date(date).getTime();
  const diffDays = (targetTime - knownNewMoon) / (1000 * 60 * 60 * 24);
  const synodicMonth = 29.53058867;

  // Normalized phase from 0 to 1
  let phase = (diffDays % synodicMonth) / synodicMonth;
  if (phase < 0) phase += 1;

  // Illumination calculation (0 to 100%)
  const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);

  let name = '';
  let icon = 'Moon';
  let emoji = '🌑';

  if (phase < 0.03 || phase > 0.97) {
    name = 'New Moon';
    emoji = '🌑';
  } else if (phase < 0.22) {
    name = 'Waxing Crescent';
    emoji = '🌒';
  } else if (phase < 0.28) {
    name = 'First Quarter';
    emoji = '🌓';
  } else if (phase < 0.47) {
    name = 'Waxing Gibbous';
    emoji = '🌔';
  } else if (phase < 0.53) {
    name = 'Full Moon';
    emoji = '🌕';
  } else if (phase < 0.72) {
    name = 'Waning Gibbous';
    emoji = '🌖';
  } else if (phase < 0.78) {
    name = 'Last Quarter';
    emoji = '🌗';
  } else {
    name = 'Waning Crescent';
    emoji = '🌘';
  }

  const ageDays = (phase * synodicMonth).toFixed(1);

  return {
    phase: parseFloat(phase.toFixed(3)),
    illumination,
    name,
    icon,
    emoji,
    ageDays,
  };
}
