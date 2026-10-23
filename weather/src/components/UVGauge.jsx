import React from 'react';
import { getUVDescription } from '../utils/units';

export default function UVGauge({ uv = 0 }) {
  const uvInfo = getUVDescription(uv);
  const maxUV = 12;
  const clampedUV = Math.min(maxUV, Math.max(0, uv));
  // Needle angle: -90 deg (UV 0) to +90 deg (UV 12)
  const angle = -90 + (clampedUV / maxUV) * 180;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ position: 'relative', width: '160px', height: '85px', overflow: 'hidden' }}>
        {/* Semi-circle Gauge Track */}
        <svg viewBox="0 0 160 80" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="uvGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="30%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#f97316" />
              <stop offset="85%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d="M 15 75 A 65 65 0 0 1 145 75"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Value Arc */}
          <path
            d="M 15 75 A 65 65 0 0 1 145 75"
            fill="none"
            stroke="url(#uvGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="204"
            strokeDashoffset={204 - (clampedUV / maxUV) * 204}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>

        {/* Needle Indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '50%',
            width: '4px',
            height: '62px',
            background: '#ffffff',
            borderRadius: '2px',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              left: '-4px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: uvInfo.color,
              border: '2px solid #fff',
            }}
          />
        </div>

        {/* Center Pin */}
        <div
          style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          }}
        />
      </div>

      <div style={{ marginTop: '0.6rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: uvInfo.color }}>
            {uv?.toFixed(1) || '0'}
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: uvInfo.color }}>
            {uvInfo.level}
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
          {uvInfo.advice}
        </p>
      </div>
    </div>
  );
}
