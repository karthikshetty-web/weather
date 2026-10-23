import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Droplets, Wind, Calendar } from 'lucide-react';
import { getWeatherInfo } from '../utils/weatherCodes';
import { formatTemp } from '../utils/units';

export default function ForecastCarousel({ daily, tempUnit = 'C' }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!daily || !daily.time) return null;

  const days = daily.time.map((dateStr, idx) => {
    const d = new Date(dateStr);
    const dayName = idx === 0 ? 'Today' : d.toLocaleDateString([], { weekday: 'short' });
    const formattedDate = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const maxTemp = daily.temperature_2m_max[idx];
    const minTemp = daily.temperature_2m_min[idx];
    const code = daily.weather_code[idx];
    const precip = daily.precipitation_probability_max ? daily.precipitation_probability_max[idx] : 0;
    const wind = daily.wind_speed_10m_max ? daily.wind_speed_10m_max[idx] : 0;
    const weather = getWeatherInfo(code);

    return {
      index: idx,
      dayName,
      formattedDate,
      maxTemp,
      minTemp,
      code,
      precip,
      wind,
      weather,
    };
  });

  const nextSlide = () => {
    setActiveIndex((prev) => (prev < days.length - 1 ? prev + 1 : 0));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : days.length - 1));
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', width: '100%', marginTop: '1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
            }}
          >
            <Calendar size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              7-Day 3D Forecast
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Extended atmospheric outlook
            </span>
          </div>
        </div>

        {/* Carousel Prev / Next Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={prevSlide}
            className="icon-btn"
            style={{ width: 34, height: 34, borderRadius: 8 }}
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextSlide}
            className="icon-btn"
            style={{ width: 34, height: 34, borderRadius: 8 }}
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 3D Coverflow Perspective Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '230px',
          perspective: '1200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '1rem 0',
        }}
      >
        {days.map((item, idx) => {
          const offset = idx - activeIndex;
          const isActive = offset === 0;

          // 3D positioning transform
          const translateX = offset * 180;
          const translateZ = -Math.abs(offset) * 110;
          const rotateY = offset * -22;
          const opacity = Math.max(0.2, 1 - Math.abs(offset) * 0.35);
          const zIndex = 20 - Math.abs(offset);

          return (
            <div
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{
                position: 'absolute',
                width: '180px',
                height: '210px',
                background: isActive ? 'rgba(30, 41, 59, 0.88)' : 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                borderRadius: '18px',
                border: isActive ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isActive
                  ? '0 15px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.35)'
                  : '0 8px 20px rgba(0, 0, 0, 0.3)',
                padding: '1.2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                opacity,
                zIndex,
                transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {/* Day header */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: isActive ? '#38bdf8' : '#f8fafc',
                  }}
                >
                  {item.dayName}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {item.formattedDate}
                </div>
              </div>

              {/* Weather condition label */}
              <div
                style={{
                  fontSize: '0.78rem',
                  color: '#cbd5e1',
                  textAlign: 'center',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                }}
              >
                {item.weather.label}
              </div>

              {/* Temp High / Low */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                  {formatTemp(item.maxTemp, tempUnit)}
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#94a3b8' }}>
                  {formatTemp(item.minTemp, tempUnit)}
                </span>
              </div>

              {/* Stats Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#60a5fa' }}>
                  <Droplets size={12} />
                  <span>{item.precip}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Wind size={12} />
                  <span>{Math.round(item.wind)} km/h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Day indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '1rem' }}>
        {days.map((_, i) => (
          <div
            key={i}
            onClick={() => setActiveIndex(i)}
            style={{
              width: i === activeIndex ? '20px' : '6px',
              height: '6px',
              borderRadius: '999px',
              background: i === activeIndex ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
