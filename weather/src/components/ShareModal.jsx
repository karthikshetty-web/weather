import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Download, Share2, Check, Sparkles } from 'lucide-react';
import { formatTemp } from '../utils/units';
import { getWeatherInfo } from '../utils/weatherCodes';

export default function ShareModal({ isOpen, onClose, city, weatherData, tempUnit = 'C' }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !weatherData) return null;

  const current = weatherData.current || {};
  const weather = getWeatherInfo(current.weather_code);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: '#0b1329',
      });
      const link = document.createElement('a');
      link.download = `SkyScape_${city?.name || 'Weather'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
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
          maxWidth: '540px',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Header */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
              Share Weather Snapshot
            </h3>
          </div>
          <button onClick={onClose} className="icon-btn" style={{ width: 34, height: 34 }}>
            <X size={18} />
          </button>
        </div>

        {/* Branded Card to Capture */}
        <div
          ref={cardRef}
          style={{
            width: '100%',
            borderRadius: '24px',
            padding: '2rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c1a30 100%)',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.25)',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative',
          }}
        >
          {/* Top Brand Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em', color: '#38bdf8' }}>
                SKYSCAPE 3D
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* City & Temperature */}
          <div style={{ marginTop: '0.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
              {city?.name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {[city?.admin1, city?.country].filter(Boolean).join(', ')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '3.8rem', fontWeight: 900, color: '#38bdf8' }}>
                {formatTemp(current.temperature_2m, tempUnit)}
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0' }}>
                {weather.label}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div>Feels like: <strong style={{ color: '#fff' }}>{formatTemp(current.apparent_temperature, tempUnit)}</strong></div>
              <div>Humidity: <strong style={{ color: '#fff' }}>{current.relative_humidity_2m}%</strong></div>
              <div>Wind: <strong style={{ color: '#fff' }}>{current.wind_speed_10m} km/h</strong></div>
            </div>
          </div>

          {/* Tip Banner */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              borderRadius: '12px',
              padding: '0.6rem 0.9rem',
              fontSize: '0.75rem',
              color: '#bae6fd',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            💡 {weather.tips}
          </div>
        </div>

        {/* Download Action Button */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem', width: '100%' }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              border: 'none',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <Download size={18} />
            {downloading ? 'Exporting Image...' : 'Download Image'}
          </button>
        </div>
      </div>
    </div>
  );
}
