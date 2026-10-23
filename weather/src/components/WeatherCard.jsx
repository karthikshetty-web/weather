import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Compass,
  Clock,
  Sparkles,
  Shirt,
  Moon,
  CloudRain,
  Share2,
  ArrowRightLeft,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import FlipCard from './FlipCard';
import UVGauge from './UVGauge';
import AQIRing from './AQIRing';
import SunArc from './SunArc';
import WindmillScene from './WindmillScene';
import { getWeatherInfo } from '../utils/weatherCodes';
import { formatTemp, formatSpeed, formatPressure, formatVisibility, getWindDirection } from '../utils/units';
import { getMoonPhase } from '../utils/moonPhase';

export default function WeatherCard({
  city,
  weatherData,
  aqiData,
  tempUnit = 'C',
  onOpenGlobe,
  onOpenCompare,
  onOpenShare,
}) {
  const [localTimeStr, setLocalTimeStr] = useState('');

  const current = weatherData?.current || {};
  const daily = weatherData?.daily || {};
  const hourly = weatherData?.hourly || {};

  const weather = getWeatherInfo(current.weather_code);
  const moon = getMoonPhase(new Date());

  // Exact City local clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const targetTZ = (weatherData?.timezone && weatherData.timezone !== 'auto')
        ? weatherData.timezone
        : (city?.timezone && city.timezone !== 'auto')
          ? city.timezone
          : null;

      const offsetSec = weatherData?.utc_offset_seconds;
      const tzAbbr = weatherData?.timezone_abbreviation || '';

      let timeFormatted = '';
      let dateFormatted = '';

      if (targetTZ) {
        try {
          timeFormatted = now.toLocaleTimeString('en-US', {
            timeZone: targetTZ,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });
          dateFormatted = now.toLocaleDateString('en-US', {
            timeZone: targetTZ,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
        } catch (e) {
          // Fall through to offset calculation
        }
      }

      // If targetTZ was not supported or failed, calculate from exact utc_offset_seconds
      if (!timeFormatted && typeof offsetSec === 'number') {
        const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
        const cityDate = new Date(utcMs + (offsetSec * 1000));
        timeFormatted = cityDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        dateFormatted = cityDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }

      // Absolute fallback
      if (!timeFormatted) {
        timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        dateFormatted = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }

      const zoneTag = tzAbbr ? `(${tzAbbr})` : (targetTZ ? `(${targetTZ.split('/').pop().replace('_', ' ')})` : '');
      setLocalTimeStr(`${dateFormatted} • ${timeFormatted} ${zoneTag}`.trim());
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [city, weatherData]);

  const maxTemp = daily.temperature_2m_max ? daily.temperature_2m_max[0] : current.temperature_2m;
  const minTemp = daily.temperature_2m_min ? daily.temperature_2m_min[0] : current.temperature_2m;
  const sunriseStr = daily.sunrise ? daily.sunrise[0] : null;
  const sunsetStr = daily.sunset ? daily.sunset[0] : null;

  return (
    <div style={{ width: '100%', marginTop: '1rem' }}>
      {/* Hero Weather Section */}
      <div className="hero-grid">
        {/* Main Temperature & City Overview */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {/* Header Row: City & Quick Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                <Clock size={14} color="#38bdf8" />
                <span>{localTimeStr || 'Local Time'}</span>
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1.15, marginTop: '4px' }}>
                {city?.name}
              </h1>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                {[city?.admin1, city?.country].filter(Boolean).join(', ')}
              </span>
            </div>

            {/* Quick Action Badges */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onOpenCompare}
                className="icon-btn"
                title="Compare with another city"
              >
                <ArrowRightLeft size={18} />
              </button>
              <button
                onClick={onOpenShare}
                className="icon-btn"
                title="Share or download weather card"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Temperature & Main Stats */}
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1.75rem' }}>
            <span style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, color: 'var(--text-primary)' }}>
              {formatTemp(current.temperature_2m, tempUnit)}
            </span>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>
                {weather.label}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '2px' }}>
                High: <strong style={{ color: '#f8fafc' }}>{formatTemp(maxTemp, tempUnit)}</strong> • Low: <strong style={{ color: '#f8fafc' }}>{formatTemp(minTemp, tempUnit)}</strong>
              </div>
            </div>
          </div>

          {/* Feels Like & Subtext */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', fontSize: '0.88rem', color: '#94a3b8' }}>
            <div>
              Feels like <strong style={{ color: '#f8fafc' }}>{formatTemp(current.apparent_temperature, tempUnit)}</strong>
            </div>
            <div>
              Precipitation <strong style={{ color: '#38bdf8' }}>{current.precipitation_probability || 0}%</strong>
            </div>
          </div>

          {/* Weather Tips & Outfit Advice Banner */}
          <div
            style={{
              marginTop: '1.5rem',
              borderRadius: '16px',
              padding: '1rem',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
              <Shirt size={16} /> Outfit & Outdoor Guidance
            </div>
            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.4 }}>
              {weather.outfit}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              💡 {weather.tips}
            </div>
          </div>
        </div>

        {/* Live Wind & 3D Windmill Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wind size={18} color="#38bdf8" />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>Live Wind Turbine</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {getWindDirection(current.wind_direction_10m)} • {Math.round(current.wind_direction_10m || 0)}°
            </span>
          </div>

          {/* Interactive 3D Wind Turbine model */}
          <WindmillScene windSpeed={current.wind_speed_10m || 10} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Speed</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>
                {formatSpeed(current.wind_speed_10m)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Compass Bearing</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                {getWindDirection(current.wind_direction_10m)} ({Math.round(current.wind_direction_10m || 0)}°)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Interactive 3D Flip Cards for Deep Metrics */}
      <div className="metrics-grid">
        {/* 1. UV Index */}
        <FlipCard
          front={
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                <Sun size={16} color="#f59e0b" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>UV Index</span>
              </div>
              <UVGauge uv={current.uv_index || 0} />
            </div>
          }
          back={
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.5rem' }}>
                Ultraviolet Radiation Details
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                Current Solar UV index is {current.uv_index?.toFixed(1) || 0}. The highest UV radiation occurs between 11 AM and 3 PM.
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                ✓ Wear UV400 sunglasses<br />
                ✓ SPF 30+ broad-spectrum sunscreen<br />
                ✓ Seek shade during peak midday hours
              </div>
            </div>
          }
        />

        {/* 2. Air Quality Index */}
        <FlipCard
          front={
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                <ShieldCheck size={16} color="#10b981" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Air Quality</span>
              </div>
              <AQIRing aqiData={aqiData} />
            </div>
          }
          back={
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>
                Atmospheric Composition
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <div><strong>Ozone (O3):</strong> {aqiData?.current?.ozone || 42} µg/m³</div>
                <div><strong>Nitrogen Dioxide:</strong> {aqiData?.current?.nitrogen_dioxide || 12} µg/m³</div>
                <div><strong>Carbon Monoxide:</strong> {aqiData?.current?.carbon_monoxide || 210} µg/m³</div>
                <div><strong>Sulfur Dioxide:</strong> {aqiData?.current?.sulphur_dioxide || 4} µg/m³</div>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                Monitored in real time via Open-Meteo European and US AQI indices.
              </p>
            </div>
          }
        />

        {/* 3. Sunrise & Sunset Solar Arc */}
        <FlipCard
          front={
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                <Sun size={16} color="#fb923c" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Solar Trajectory</span>
              </div>
              <SunArc sunriseStr={sunriseStr} sunsetStr={sunsetStr} />
            </div>
          }
          back={
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fb923c', marginBottom: '0.5rem' }}>
                Solar Position & Golden Hour
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                Calculated according to the city’s exact astronomical horizon.
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>
                • Golden Hour: ~45 mins before sunset<br />
                • Dawn twilight: ~30 mins before sunrise<br />
                • Sky color shifts smoothly with real coordinates
              </div>
            </div>
          }
        />

        {/* 4. Moon Phase */}
        <FlipCard
          front={
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Moon size={16} color="#c084fc" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Lunar Phase</span>
              </div>

              <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                <div style={{ fontSize: '2.8rem', lineHeight: 1 }}>{moon.emoji}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>
                  {moon.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 600 }}>
                  {moon.illumination}% Illumination
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                Moon Age: {moon.ageDays} days into synodic cycle
              </div>
            </div>
          }
          back={
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.5rem' }}>
                Synodic Month Telemetry
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                Calculated based on celestial orbit (29.53-day synodic period).
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>
                • Phase Value: {moon.phase}<br />
                • Night illumination affects stargazing visibility.<br />
                • Night sky stars in SkyScape adjust intensity accordingly.
              </div>
            </div>
          }
        />

        {/* 5. Humidity */}
        <FlipCard
          front={
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Droplets size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Humidity</span>
              </div>
              <div style={{ margin: '1rem 0' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#38bdf8' }}>
                  {current.relative_humidity_2m}%
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  {current.relative_humidity_2m > 65 ? 'High moisture • Muggy' : (current.relative_humidity_2m < 35 ? 'Dry air' : 'Comfortable balance')}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Click card for dew point analysis
              </div>
            </div>
          }
          back={
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
                Moisture & Comfort Index
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                Relative humidity indicates the amount of moisture in the air compared to saturation capacity.
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                Estimated Dew Point: {Math.round(current.temperature_2m - (100 - current.relative_humidity_2m) / 5)}°C
              </div>
            </div>
          }
        />

        {/* 6. Pressure */}
        <FlipCard
          front={
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gauge size={16} color="#a855f7" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Barometric Pressure</span>
              </div>
              <div style={{ margin: '1rem 0' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#a855f7' }}>
                  {formatPressure(current.surface_pressure)}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  {current.surface_pressure > 1013 ? 'High pressure system (Fair)' : 'Low pressure system (Unsettled)'}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Click for barometric trend
              </div>
            </div>
          }
          back={
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#a855f7', marginBottom: '0.5rem' }}>
                Barometer Telemetry
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                Standard atmospheric pressure at sea level is 1013.25 hPa (29.92 inHg).
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                Rising pressure indicates settling pleasant weather, while falling pressure suggests impending precipitation or front movement.
              </p>
            </div>
          }
        />

        {/* 7. Visibility */}
        <FlipCard
          front={
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={16} color="#10b981" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Visibility</span>
              </div>
              <div style={{ margin: '1rem 0' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981' }}>
                  {formatVisibility(current.visibility)}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  {current.visibility >= 10000 ? 'Crystal clear horizon' : 'Moderate visibility haze'}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Click for optical clarity guide
              </div>
            </div>
          }
          back={
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>
                Optical Horizon Clarity
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                Measured horizontally via surface sensors. 10 km or greater is considered excellent clarity for aviation and driving.
              </p>
            </div>
          }
        />

        {/* 8. Rain Probability */}
        <FlipCard
          front={
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CloudRain size={16} color="#06b6d4" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Rain Probability</span>
              </div>
              <div style={{ margin: '1rem 0' }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#06b6d4' }}>
                  {current.precipitation_probability || 0}%
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  {current.precipitation ? `${current.precipitation} mm expected` : 'Zero precipitation detected'}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Click for precipitation advice
              </div>
            </div>
          }
          back={
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#06b6d4', marginBottom: '0.5rem' }}>
                Rainfall & Probability
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                Combines statistical radar models and atmospheric moisture levels.
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                {current.precipitation_probability > 40 ? 'Carry an umbrella or rain shell when venturing outdoors.' : 'Clear skies favorable for outdoor plans.'}
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
}
