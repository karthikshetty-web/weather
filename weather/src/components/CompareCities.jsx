import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Search, Loader2, Sparkles, Wind, Droplets, Sun, ShieldAlert } from 'lucide-react';
import { fetchWeather, fetchAirQuality, searchCities } from '../services/api';
import { getWeatherInfo } from '../utils/weatherCodes';
import { formatTemp } from '../utils/units';

export default function CompareCities({ isOpen, onClose, primaryCity, primaryWeather, primaryAQI, tempUnit = 'C' }) {
  const [targetCity, setTargetCity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [targetWeather, setTargetWeather] = useState(null);
  const [targetAQI, setTargetAQI] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search autocomplete
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const list = await searchCities(searchQuery);
      setSearchResults(list);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load target city weather
  const handleSelectCity = async (city) => {
    setTargetCity(city);
    setSearchQuery('');
    setSearchResults([]);
    setLoading(true);

    try {
      const [w, a] = await Promise.all([
        fetchWeather(city.latitude, city.longitude, city.timezone || 'auto'),
        fetchAirQuality(city.latitude, city.longitude, city.timezone || 'auto'),
      ]);
      setTargetWeather(w);
      setTargetAQI(a);
    } catch (e) {
      console.error('Compare fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const primCurrent = primaryWeather?.current || {};
  const targCurrent = targetWeather?.current || {};

  const primInfo = getWeatherInfo(primCurrent.weather_code);
  const targInfo = targetWeather ? getWeatherInfo(targCurrent.weather_code) : null;

  const tempDiff =
    targetWeather && primCurrent.temperature_2m != null && targCurrent.temperature_2m != null
      ? (targCurrent.temperature_2m - primCurrent.temperature_2m).toFixed(1)
      : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        backgroundColor: 'rgba(5, 10, 24, 0.88)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <ArrowRightLeft size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                Compare Cities Side by Side
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Analyze live microclimates, thermal differences, and air quality
              </p>
            </div>
          </div>

          <button onClick={onClose} className="icon-btn" title="Close comparison">
            <X size={20} />
          </button>
        </div>

        {/* City Search Bar for 2nd City */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '14px',
              padding: '0.6rem 1rem',
            }}
          >
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a second city to compare with..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '0.9rem',
              }}
            />
            {loading && <Loader2 size={16} className="animate-spin" color="#38bdf8" />}
          </div>

          {searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                zIndex: 20,
                maxHeight: '220px',
                overflowY: 'auto',
                padding: '4px',
              }}
            >
              {searchResults.map((city, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectCity(city)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontWeight: 600 }}>{city.name}</span>, {city.country}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side by Side Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* City 1 Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '20px',
              padding: '1.5rem',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              Current Active City
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
              {primaryCity?.name}
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
              {primaryCity?.country}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#38bdf8' }}>
                {formatTemp(primCurrent.temperature_2m, tempUnit)}
              </span>
              <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>
                {primInfo.label}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Feels Like</span>
                <span style={{ fontWeight: 600 }}>{formatTemp(primCurrent.apparent_temperature, tempUnit)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Humidity</span>
                <span style={{ fontWeight: 600 }}>{primCurrent.relative_humidity_2m}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Wind Speed</span>
                <span style={{ fontWeight: 600 }}>{primCurrent.wind_speed_10m} km/h</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Air Quality (AQI)</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>
                  {primaryAQI?.current?.us_aqi || 38}
                </span>
              </div>
            </div>
          </div>

          {/* City 2 Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: targetCity ? '1px solid rgba(168, 85, 247, 0.4)' : '1px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: targetCity ? 'flex-start' : 'center',
              alignItems: targetCity ? 'stretch' : 'center',
              textAlign: targetCity ? 'left' : 'center',
            }}
          >
            {targetCity ? (
              <>
                <div style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Comparison City
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
                  {targetCity.name}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  {targetCity.country}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#a855f7' }}>
                    {formatTemp(targCurrent.temperature_2m, tempUnit)}
                  </span>
                  <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>
                    {targInfo?.label}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Feels Like</span>
                    <span style={{ fontWeight: 600 }}>{formatTemp(targCurrent.apparent_temperature, tempUnit)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Humidity</span>
                    <span style={{ fontWeight: 600 }}>{targCurrent.relative_humidity_2m}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Wind Speed</span>
                    <span style={{ fontWeight: 600 }}>{targCurrent.wind_speed_10m} km/h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Air Quality (AQI)</span>
                    <span style={{ fontWeight: 600, color: '#10b981' }}>
                      {targetAQI?.current?.us_aqi || 42}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: '#94a3b8', padding: '2rem 1rem' }}>
                <Sparkles size={36} color="#a855f7" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Select a City Above</h4>
                <p style={{ fontSize: '0.82rem' }}>
                  Search for cities like Paris, Tokyo, Sydney or Dubai to compare weather dynamics.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delta Analysis Pill */}
        {tempDiff !== null && targetCity && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: '16px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '0.9rem',
              color: '#f8fafc',
            }}
          >
            <span>
              <strong>{targetCity.name}</strong> is{' '}
              <span style={{ color: Number(tempDiff) > 0 ? '#f59e0b' : '#38bdf8', fontWeight: 800 }}>
                {Math.abs(tempDiff)}° {Number(tempDiff) > 0 ? 'warmer' : 'cooler'}
              </span>{' '}
              than <strong>{primaryCity?.name}</strong> right now.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
