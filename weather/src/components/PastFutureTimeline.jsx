import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { History, CalendarDays, Clock, Droplets, Wind, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatTemp } from '../utils/units';
import { getWeatherInfo } from '../utils/weatherCodes';

function CustomTimelineTooltip({ active, payload, tempUnit }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const weather = getWeatherInfo(data.code);
    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${data.isPast ? '#a855f7' : (data.isToday ? '#f59e0b' : '#38bdf8')}`,
          borderRadius: '12px',
          padding: '10px 14px',
          color: '#f8fafc',
          fontSize: '0.82rem',
          boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontWeight: 700 }}>{data.dateLabel}</span>
          <span
            style={{
              fontSize: '0.7rem',
              padding: '2px 6px',
              borderRadius: '999px',
              background: data.isPast ? 'rgba(168, 85, 247, 0.2)' : (data.isToday ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)'),
              color: data.isPast ? '#c084fc' : (data.isToday ? '#fbbf24' : '#38bdf8'),
            }}
          >
            {data.isPast ? 'PAST' : (data.isToday ? 'TODAY' : 'FUTURE')}
          </span>
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
          High: {formatTemp(data.maxTemp, tempUnit)} • Low: {formatTemp(data.minTemp, tempUnit)}
        </div>
        <div style={{ color: '#cbd5e1', marginTop: '2px' }}>{weather.label}</div>
        {data.precipSum > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#60a5fa', marginTop: '4px' }}>
            <Droplets size={12} />
            <span>Rainfall: {data.precipSum.toFixed(1)} mm</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default function PastFutureTimeline({ daily, tempUnit = 'C' }) {
  const [tab, setTab] = useState('all'); // 'past', 'future', or 'all'

  if (!daily || !daily.time) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const allDays = daily.time.map((timeStr, idx) => {
    const d = new Date(timeStr);
    const dateFormatted = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const dayName = d.toLocaleDateString([], { weekday: 'short' });
    const isToday = timeStr === todayStr || Math.abs(d - new Date()) < 24 * 3600 * 1000 && d.getDate() === new Date().getDate();
    const isPast = !isToday && d < new Date();
    const maxTemp = daily.temperature_2m_max[idx];
    const minTemp = daily.temperature_2m_min[idx];
    const avgTemp = (maxTemp + minTemp) / 2;
    const code = daily.weather_code[idx];
    const precipSum = daily.precipitation_sum ? daily.precipitation_sum[idx] : 0;
    const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[idx] : 0;

    return {
      index: idx,
      timeStr,
      dateLabel: `${dayName}, ${dateFormatted}`,
      dayName,
      maxTemp,
      minTemp,
      avgTemp,
      code,
      precipSum,
      precipProb,
      isPast,
      isToday,
      weather: getWeatherInfo(code),
    };
  });

  const pastDays = allDays.filter((d) => d.isPast);
  const futureDays = allDays.filter((d) => !d.isPast && !d.isToday);
  const todayDay = allDays.find((d) => d.isToday) || allDays[7];

  const displayedDays = tab === 'past' ? pastDays : (tab === 'future' ? futureDays : allDays);

  // Past 7 days vs Future comparison insights
  const pastAvgMax = pastDays.length
    ? (pastDays.reduce((acc, d) => acc + d.maxTemp, 0) / pastDays.length).toFixed(1)
    : 0;
  const futureAvgMax = futureDays.length
    ? (futureDays.reduce((acc, d) => acc + d.maxTemp, 0) / futureDays.length).toFixed(1)
    : 0;
  const totalPastRain = pastDays.reduce((acc, d) => acc + (d.precipSum || 0), 0).toFixed(1);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', width: '100%', marginTop: '1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #a855f7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <History size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              Past 7 Days History & 14-Day Future Outlook
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Continuous atmospheric timeline across time
            </span>
          </div>
        </div>

        {/* Tab Filters */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '3px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <button
            onClick={() => setTab('past')}
            style={{
              padding: '4px 12px',
              borderRadius: '8px',
              border: 'none',
              background: tab === 'past' ? '#a855f7' : 'transparent',
              color: tab === 'past' ? '#ffffff' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setTab('all')}
            style={{
              padding: '4px 12px',
              borderRadius: '8px',
              border: 'none',
              background: tab === 'all' ? '#38bdf8' : 'transparent',
              color: tab === 'all' ? '#0f172a' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Full Timeline
          </button>
          <button
            onClick={() => setTab('future')}
            style={{
              padding: '4px 12px',
              borderRadius: '8px',
              border: 'none',
              background: tab === 'future' ? '#38bdf8' : 'transparent',
              color: tab === 'future' ? '#0f172a' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Next 14 Days
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            background: 'rgba(168, 85, 247, 0.12)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '12px',
            padding: '10px 14px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>
            Past 7 Days Avg High
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            {formatTemp(pastAvgMax, tempUnit)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Accumulated rain: <strong style={{ color: '#60a5fa' }}>{totalPastRain} mm</strong>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '10px 14px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>
            Today's High
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            {formatTemp(todayDay?.maxTemp, tempUnit)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {todayDay?.weather.label}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '12px',
            padding: '10px 14px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
            Next 14 Days Avg High
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            {formatTemp(futureAvgMax, tempUnit)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {Number(futureAvgMax) > Number(pastAvgMax) ? (
              <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ArrowUpRight size={14} /> Trending warmer by {(futureAvgMax - pastAvgMax).toFixed(1)}°
              </span>
            ) : (
              <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ArrowDownRight size={14} /> Trending cooler by {(pastAvgMax - futureAvgMax).toFixed(1)}°
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Continuous Past-to-Future Recharts Area Graph */}
      <div style={{ width: '100%', height: '220px', marginBottom: '1.25rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={allDays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="timelineAreaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
                <stop offset="35%" stopColor="#f59e0b" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="dateLabel"
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 3', 'dataMax + 3']}
            />
            <Tooltip content={<CustomTimelineTooltip tempUnit={tempUnit} />} />
            <ReferenceLine x={todayDay?.dateLabel} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'TODAY', fill: '#f59e0b', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="maxTemp"
              stroke="#38bdf8"
              strokeWidth={2.5}
              fill="url(#timelineAreaGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Scrollable Day-by-Day Cards */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          scrollbarWidth: 'thin',
        }}
      >
        {displayedDays.map((item, i) => (
          <div
            key={item.timeStr || i}
            style={{
              flexShrink: 0,
              width: '135px',
              padding: '12px',
              borderRadius: '14px',
              background: item.isToday
                ? 'rgba(245, 158, 11, 0.15)'
                : item.isPast
                ? 'rgba(168, 85, 247, 0.08)'
                : 'rgba(15, 23, 42, 0.6)',
              border: item.isToday
                ? '1px solid #f59e0b'
                : item.isPast
                ? '1px solid rgba(168, 85, 247, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: item.isPast ? '#c084fc' : item.isToday ? '#fbbf24' : '#38bdf8',
                }}
              >
                {item.isPast ? 'Past' : item.isToday ? 'Today' : 'Future'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {item.dayName}
              </span>
            </div>

            <div style={{ margin: '8px 0' }}>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>
                {item.dateLabel.split(', ')[1]}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {formatTemp(item.maxTemp, tempUnit)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Low: {formatTemp(item.minTemp, tempUnit)}
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.weather.label}
              </div>
              {item.precipSum > 0 && (
                <div style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                  <Droplets size={10} /> {item.precipSum} mm
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
