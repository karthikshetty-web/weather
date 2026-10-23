import React from 'react';
import { getAQIDescription } from '../utils/units';

export default function AQIRing({ aqiData }) {
  const current = aqiData?.current || {};
  const aqiVal = current.us_aqi || 35;
  const pm25 = current.pm2_5 || 8.5;
  const pm10 = current.pm10 || 16.2;
  const ozone = current.ozone || 45;

  const aqiInfo = getAQIDescription(aqiVal);

  // SVG parameters
  const size = 150;
  const strokeWidth = 8;
  const center = size / 2;

  // Ring 1 (Outer: AQI)
  const r1 = 60;
  const circ1 = 2 * Math.PI * r1;
  const pct1 = Math.min(1, aqiVal / 300);
  const offset1 = circ1 - pct1 * circ1;

  // Ring 2 (Middle: PM2.5)
  const r2 = 47;
  const circ2 = 2 * Math.PI * r2;
  const pct2 = Math.min(1, pm25 / 75);
  const offset2 = circ2 - pct2 * circ2;

  // Ring 3 (Inner: PM10)
  const r3 = 34;
  const circ3 = 2 * Math.PI * r3;
  const pct3 = Math.min(1, pm10 / 150);
  const offset3 = circ3 - pct3 * circ3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background tracks */}
          <circle cx={center} cy={center} r={r1} stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="none" />
          <circle cx={center} cy={center} r={r2} stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="none" />
          <circle cx={center} cy={center} r={r3} stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="none" />

          {/* Active Colored Rings */}
          {/* Ring 1 - AQI */}
          <circle
            cx={center}
            cy={center}
            r={r1}
            stroke={aqiInfo.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circ1}
            strokeDashoffset={offset1}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />

          {/* Ring 2 - PM2.5 */}
          <circle
            cx={center}
            cy={center}
            r={r2}
            stroke="#38bdf8"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circ2}
            strokeDashoffset={offset2}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />

          {/* Ring 3 - PM10 */}
          <circle
            cx={center}
            cy={center}
            r={r3}
            stroke="#a855f7"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circ3}
            strokeDashoffset={offset3}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>

        {/* Center Text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: aqiInfo.color, lineHeight: 1 }}>
            {Math.round(aqiVal)}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AQI
          </span>
        </div>
      </div>

      {/* Ring Legend & Pollutant values */}
      <div style={{ marginTop: '0.75rem', width: '100%', textAlign: 'center' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: `${aqiInfo.color}25`,
            color: aqiInfo.color,
            border: `1px solid ${aqiInfo.color}60`,
            marginBottom: '0.5rem',
          }}
        >
          {aqiInfo.status}
        </span>

        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.72rem', color: '#94a3b8' }}>
          <div>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>PM2.5:</span> {pm25} µg/m³
          </div>
          <div>
            <span style={{ color: '#a855f7', fontWeight: 600 }}>PM10:</span> {pm10} µg/m³
          </div>
        </div>
      </div>
    </div>
  );
}
