import React, { useMemo } from 'react';
import { Sunrise, Sunset } from 'lucide-react';

export default function SunArc({ sunriseStr, sunsetStr }) {
  const { progress, isDay, sunriseTime, sunsetTime, daylightHours } = useMemo(() => {
    if (!sunriseStr || !sunsetStr) {
      return { progress: 0.5, isDay: true, sunriseTime: '06:30 AM', sunsetTime: '06:30 PM', daylightHours: '12h 0m' };
    }

    const sunrise = new Date(sunriseStr);
    const sunset = new Date(sunsetStr);
    const now = new Date();

    const sunriseT = sunrise.getTime();
    const sunsetT = sunset.getTime();
    const nowT = now.getTime();

    const isDay = nowT >= sunriseT && nowT <= sunsetT;
    let prog = 0;

    if (isDay) {
      prog = Math.max(0, Math.min(1, (nowT - sunriseT) / (sunsetT - sunriseT)));
    } else if (nowT > sunsetT) {
      prog = 1;
    } else {
      prog = 0;
    }

    const dayDiffMs = sunsetT - sunriseT;
    const hours = Math.floor(dayDiffMs / (1000 * 60 * 60));
    const mins = Math.floor((dayDiffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      progress: prog,
      isDay,
      sunriseTime: sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sunsetTime: sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      daylightHours: `${hours}h ${mins}m`,
    };
  }, [sunriseStr, sunsetStr]);

  // Coordinates on SVG arc: width 240, height 120
  // Arc center: (120, 100), radius: 85
  // angle from PI (left) to 0 (right)
  const angle = Math.PI - progress * Math.PI;
  const sunX = 120 + 85 * Math.cos(angle);
  const sunY = 100 - 85 * Math.sin(angle);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '240px', height: '115px' }}>
        <svg viewBox="0 0 240 120" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="sunArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="sunFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(253, 224, 71, 0.15)" />
              <stop offset="100%" stopColor="rgba(253, 224, 71, 0.0)" />
            </linearGradient>
          </defs>

          {/* Area fill under arc */}
          <path
            d="M 35 100 A 85 85 0 0 1 205 100 Z"
            fill="url(#sunFillGrad)"
          />

          {/* Dashed background arc */}
          <path
            d="M 35 100 A 85 85 0 0 1 205 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {/* Horizon Line */}
          <line
            x1="20"
            y1="100"
            x2="220"
            y2="100"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.5"
          />

          {/* Completed Day Path */}
          {progress > 0 && (
            <path
              d={`M 35 100 A 85 85 0 0 1 ${sunX} ${sunY}`}
              fill="none"
              stroke="url(#sunArcGrad)"
              strokeWidth="3.5"
            />
          )}

          {/* Glowing Sun Token */}
          <circle
            cx={sunX}
            cy={sunY}
            r="8"
            fill="#fde047"
            stroke="#f59e0b"
            strokeWidth="2.5"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.9))',
              transition: 'all 0.5s ease',
            }}
          />
        </svg>
      </div>

      {/* Sunrise & Sunset Labels */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.25rem',
          padding: '0 0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sunrise size={16} color="#fb923c" />
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Sunrise</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
              {sunriseTime}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Daylight</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fde047' }}>
            {daylightHours}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'right' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Sunset</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
              {sunsetTime}
            </div>
          </div>
          <Sunset size={16} color="#ea580c" />
        </div>
      </div>
    </div>
  );
}
