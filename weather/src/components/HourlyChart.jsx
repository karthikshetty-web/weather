import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { convertTemp, formatTemp } from '../utils/units';
import { getWeatherInfo } from '../utils/weatherCodes';
import HourlyBars3D from './HourlyBars3D';
import { Box, Activity, Droplets } from 'lucide-react';

function CustomTooltip({ active, payload, label, tempUnit }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const weather = getWeatherInfo(data.code);
    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '14px',
          padding: '10px 14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          color: '#f8fafc',
          fontSize: '0.82rem',
        }}
      >
        <div style={{ fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
          {data.fullTime}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
            {data.tempDisplay}
          </span>
          <span style={{ color: '#cbd5e1' }}>{weather.label}</span>
        </div>
        {data.precipProb != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#60a5fa' }}>
            <Droplets size={12} />
            <span>Precipitation: {data.precipProb}%</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default function HourlyChart({ hourly, tempUnit = 'C' }) {
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or '3d'

  if (!hourly || !hourly.time) return null;

  // Format 24 hours of data
  const chartData = hourly.time.slice(0, 24).map((time, idx) => {
    const d = new Date(time);
    const hourLabel = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    const fullTime = d.toLocaleTimeString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    const rawTemp = hourly.temperature_2m[idx];
    const converted = convertTemp(rawTemp, tempUnit);
    const code = hourly.weather_code ? hourly.weather_code[idx] : 0;
    const precipProb = hourly.precipitation_probability ? hourly.precipitation_probability[idx] : 0;

    return {
      time: hourLabel,
      fullTime,
      temp: converted,
      tempDisplay: formatTemp(rawTemp, tempUnit),
      rawTemp,
      code,
      precipProb,
    };
  });

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', width: '100%', marginTop: '1.5rem' }}>
      {/* Header with 2D / 3D toggle button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Hourly Forecast
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Next 24 Hours</span>
          </div>
        </div>

        {/* View Mode Switch */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '3px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <button
            onClick={() => setViewMode('chart')}
            style={{
              padding: '4px 12px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'chart' ? '#38bdf8' : 'transparent',
              color: viewMode === 'chart' ? '#0f172a' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <Activity size={14} /> 2D Area
          </button>
          <button
            onClick={() => setViewMode('3d')}
            style={{
              padding: '4px 12px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === '3d' ? '#38bdf8' : 'transparent',
              color: viewMode === '3d' ? '#0f172a' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <Box size={14} /> 3D Bars
          </button>
        </div>
      </div>

      {viewMode === '3d' ? (
        <HourlyBars3D hourly={hourly} tempUnit={tempUnit} />
      ) : (
        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip content={<CustomTooltip tempUnit={tempUnit} />} />
              <Area
                type="natural"
                dataKey="temp"
                stroke="#38bdf8"
                strokeWidth={3}
                fill="url(#tempAreaGrad)"
                dot={false}
                activeDot={{ r: 6, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
