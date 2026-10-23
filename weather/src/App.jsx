import React, { useState, useEffect, useMemo } from 'react';
import Scene3D from './components/Scene3D';
import WeatherCard from './components/WeatherCard';
import HourlyChart from './components/HourlyChart';
import ForecastCarousel from './components/ForecastCarousel';
import PastFutureTimeline from './components/PastFutureTimeline';
import Search from './components/Search';
import GlobeModal from './components/Globe';
import MapPicker from './components/MapPicker';
import CompareCities from './components/CompareCities';
import ShareModal from './components/ShareModal';
import SoundController from './components/SoundController';
import CursorTrail from './components/CursorTrail';
import { LoadingScreen, ErrorState } from './components/Skeleton';

import { useWeather } from './hooks/useWeather';
import { useGeolocation } from './hooks/useGeolocation';
import { useLocalStorage } from './hooks/useLocalStorage';

import { getTheme, getTimeOfDay } from './utils/theme';
import { getWeatherInfo } from './utils/weatherCodes';

import {
  Globe,
  MapPin,
  Map,
  Sun,
  Moon,
  CloudSun,
  RefreshCw,
  Sparkles,
  WifiOff,
  Star,
  Navigation,
} from 'lucide-react';

export default function App() {
  // Persistent Settings
  const [tempUnit, setTempUnit] = useLocalStorage('skyscape_temp_unit', 'C');
  const [isDark, setIsDark] = useLocalStorage('skyscape_dark_mode', true);
  const [isMuted, setIsMuted] = useLocalStorage('skyscape_audio_muted', true);
  const [favorites, setFavorites] = useLocalStorage('skyscape_favorites', [
    { name: 'Tokyo', country: 'Japan', admin1: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
    { name: 'London', country: 'United Kingdom', admin1: 'England', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
    { name: 'Paris', country: 'France', admin1: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  ]);
  const [recentSearches, setRecentSearches] = useLocalStorage('skyscape_recents', []);

  // Modal States
  const [isGlobeOpen, setIsGlobeOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Weather Hook (Auto-detects user's actual nearby location on first visit)
  const {
    city,
    weatherData,
    aqiData,
    loading,
    error,
    lastUpdated,
    isOffline,
    selectCity,
    refresh,
  } = useWeather();

  // Geolocation Hook
  const { getCurrentLocation, loading: locationLoading, error: geoError } = useGeolocation();

  // Handle City Change
  const handleSelectCity = (newCity) => {
    selectCity(newCity);
    setRecentSearches((prev) => {
      const filtered = prev.filter((c) => c.name !== newCity.name);
      return [newCity, ...filtered].slice(0, 6);
    });
  };

  // Toggle Favorite
  const handleToggleFavorite = (target) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.name === target.name);
      if (exists) {
        return prev.filter((f) => f.name !== target.name);
      } else {
        return [...prev, target];
      }
    });
  };

  // Handle Use My Location
  const handleUseLocation = async () => {
    try {
      const place = await getCurrentLocation();
      if (place) {
        handleSelectCity(place);
      }
    } catch (e) {
      console.warn('Location detection:', e);
    }
  };

  // Current weather condition & solar phase
  const currentCondition = useMemo(() => {
    if (!weatherData?.current) return 'clear';
    const info = getWeatherInfo(weatherData.current.weather_code);
    return info.condition;
  }, [weatherData]);

  const sunriseStr = weatherData?.daily?.sunrise ? weatherData.daily.sunrise[0] : null;
  const sunsetStr = weatherData?.daily?.sunset ? weatherData.daily.sunset[0] : null;
  const utcOffsetSec = weatherData?.utc_offset_seconds ?? 0;

  // Exact current local time for the selected city
  const cityNow = useMemo(() => {
    const d = new Date();
    if (typeof weatherData?.utc_offset_seconds === 'number') {
      const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
      return new Date(utcMs + weatherData.utc_offset_seconds * 1000);
    }
    return d;
  }, [weatherData]);

  const timeOfDay = useMemo(() => {
    return getTimeOfDay(cityNow, sunriseStr, sunsetStr);
  }, [cityNow, sunriseStr, sunsetStr]);

  const theme = useMemo(() => {
    return getTheme(currentCondition, timeOfDay, isDark);
  }, [currentCondition, timeOfDay, isDark]);

  // Sync Dynamic CSS Variables with current theme
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--sky-top', theme.sky.top);
    root.style.setProperty('--sky-bottom', theme.sky.bottom);
    root.style.setProperty('--accent', theme.accentColor);
    root.style.setProperty('--card-bg', theme.cardBg);
    root.style.setProperty('--card-border', theme.cardBorder);
    root.style.setProperty('--accent-glow', theme.glowColor);

    if (isDark) {
      document.body.classList.remove('theme-light');
    } else {
      document.body.classList.add('theme-light');
    }
  }, [theme, isDark]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      {/* 1. Full-screen 3D Weather Scene Canvas */}
      <Scene3D
        theme={theme}
        weatherCondition={currentCondition}
        sunrise={sunriseStr}
        sunset={sunsetStr}
        windSpeed={weatherData?.current?.wind_speed_10m || 10}
        utcOffsetSeconds={utcOffsetSec}
      />


      {/* 2. Interactive Cursor Particle Trail */}
      <CursorTrail condition={currentCondition} isNight={timeOfDay === 'night'} />

      {/* 3. Main Glassmorphic Application UI */}
      <div className="app-container">
        {/* Navigation Bar */}
        <header className="header">
          {/* Brand Logo & Near Me Indicator */}
          <div className="brand-wrapper" onClick={() => setIsMapPickerOpen(true)}>
            <div className="brand-logo-icon">
              <CloudSun size={24} />
            </div>
            <div>
              <div className="brand-title">SkyScape</div>
              <div className="brand-subtitle">3D Atmospheric Real-Time Weather</div>
            </div>
          </div>

          {/* Search Bar with Autocomplete & Voice */}
          <Search
            currentCity={city}
            onSelectCity={handleSelectCity}
            onUseLocation={handleUseLocation}
            isLocationLoading={locationLoading}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            recentSearches={recentSearches}
            onClearRecent={() => setRecentSearches([])}
          />

          {/* Quick Controls Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Map Area Picker Button */}
            <button
              onClick={() => setIsMapPickerOpen(true)}
              className="icon-btn"
              title="Pick any exact area on interactive map"
              style={{
                color: '#38bdf8',
                borderColor: 'rgba(56, 189, 248, 0.4)',
                background: 'rgba(56, 189, 248, 0.15)',
              }}
            >
              <Map size={18} />
            </button>

            {/* Globe View Button */}
            <button
              onClick={() => setIsGlobeOpen(true)}
              className="icon-btn"
              title="Open Interactive 3D Earth Globe"
            >
              <Globe size={18} />
            </button>

            {/* Sound Controller */}
            <SoundController
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((prev) => !prev)}
              condition={currentCondition}
            />

            {/* Temperature Unit Toggle */}
            <button
              onClick={() => setTempUnit((u) => (u === 'C' ? 'F' : 'C'))}
              className="icon-btn"
              style={{ fontWeight: 800, fontSize: '0.85rem' }}
              title="Toggle Celsius / Fahrenheit"
            >
              °{tempUnit}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDark((d) => !d)}
              className="icon-btn"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={18} color="#fde047" /> : <Moon size={18} color="#6366f1" />}
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={() => refresh()}
              disabled={loading}
              className="icon-btn"
              title="Refresh meteorological telemetry"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Offline Warning Banner */}
        {isOffline && (
          <div
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0.75rem 0',
            }}
          >
            <WifiOff size={16} />
            <span>
              You are currently offline. Showing cached meteorological telemetry from{' '}
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'previous session'}.
            </span>
          </div>
        )}

        {/* Geolocation Notification */}
        {geoError && (
          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fcd34d',
              fontSize: '0.82rem',
              margin: '0.5rem 0',
            }}
          >
            {geoError}
          </div>
        )}

        {/* Location Quick Bar: Current City Pill + Near Me GPS + Map Picker shortcut */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            margin: '0.5rem 0 0.8rem 0',
          }}
        >
          {/* Active Location Indicator */}
          <div
            onClick={() => setIsMapPickerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              padding: '4px 12px',
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              color: '#38bdf8',
              fontWeight: 600,
            }}
            title="Click to change location or view nearby areas on map"
          >
            <MapPin size={14} />
            <span>Target: {city?.name || 'Local Area'}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 400 }}>
              ({city?.latitude?.toFixed(2)}°, {city?.longitude?.toFixed(2)}°)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleUseLocation}
              disabled={locationLoading}
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#10b981',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Navigation size={12} className={locationLoading ? 'animate-spin' : ''} />
              {locationLoading ? 'Locating...' : 'Near By Me'}
            </button>

            <button
              onClick={() => setIsMapPickerOpen(true)}
              style={{
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                color: '#c084fc',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Map size={12} />
              Select on Map
            </button>
          </div>
        </div>

        {/* Favorites Quick Bar */}
        {favorites.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              padding: '0.2rem 0 0.8rem 0',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
              <Star size={12} fill="#f59e0b" color="#f59e0b" /> Favorites:
            </span>
            {favorites.map((fav) => {
              const isActive = city?.name === fav.name;
              return (
                <button
                  key={fav.name}
                  onClick={() => handleSelectCity(fav)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#38bdf8' : '#e2e8f0',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {fav.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Content Body: Loading / Error / Main Cards */}
        {loading && !weatherData ? (
          <LoadingScreen />
        ) : error && !weatherData ? (
          <ErrorState error={error} onRetry={refresh} isOffline={isOffline} />
        ) : (
          <main>
            {/* Primary Weather Hero Card & Metric Flip Cards */}
            <WeatherCard
              city={city}
              weatherData={weatherData}
              aqiData={aqiData}
              tempUnit={tempUnit}
              onOpenGlobe={() => setIsGlobeOpen(true)}
              onOpenCompare={() => setIsCompareOpen(true)}
              onOpenShare={() => setIsShareOpen(true)}
            />

            {/* 24-Hour Forecast Chart (2D Area & 3D Interactive Bars) */}
            <HourlyChart hourly={weatherData?.hourly} tempUnit={tempUnit} />

            {/* Past 7 Days History & Next 14 Days Future Outlook */}
            <PastFutureTimeline daily={weatherData?.daily} tempUnit={tempUnit} />

            {/* 7-Day 3D Coverflow Forecast Carousel */}
            <ForecastCarousel daily={weatherData?.daily} tempUnit={tempUnit} />
          </main>
        )}

        {/* Footer */}
        <footer
          style={{
            marginTop: '3.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <div>
            <strong style={{ color: '#94a3b8' }}>SkyScape 3D Weather</strong> • Live Open-Meteo Telemetry & Leaflet Map
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>Auto-refreshes every 5 mins</span>
            {lastUpdated && (
              <span>Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
        </footer>
      </div>

      {/* 4. Interactive Map Area & Nearby Picker Modal */}
      <MapPicker
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        currentCity={city}
        onSelectLocation={handleSelectCity}
      />

      {/* 5. Interactive 3D Earth Globe Modal */}
      <GlobeModal
        isOpen={isGlobeOpen}
        onClose={() => setIsGlobeOpen(false)}
        selectedCity={city}
        onSelectCity={(newCity) => {
          handleSelectCity(newCity);
          setIsGlobeOpen(false);
        }}
      />

      {/* 6. City Comparison Side-by-Side Modal */}
      <CompareCities
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        primaryCity={city}
        primaryWeather={weatherData}
        primaryAQI={aqiData}
        tempUnit={tempUnit}
      />

      {/* 7. Share / Download Weather Card Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        city={city}
        weatherData={weatherData}
        tempUnit={tempUnit}
      />
    </div>
  );
}
