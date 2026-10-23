import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { formatTemp } from '../utils/units';

function Bar({ index, count, temp, unit, timeStr, isSelected, onHover }) {
  const meshRef = useRef();
  // Map temp between 0.5 and 5 height units
  const targetHeight = Math.max(0.6, (temp + 10) * 0.12);
  const currentHeight = useRef(0.1);

  // Position along X axis
  const spacing = 1.1;
  const x = (index - count / 2) * spacing;

  // Color according to temperature
  let color = '#38bdf8';
  if (temp > 28) color = '#ef4444';
  else if (temp > 20) color = '#f59e0b';
  else if (temp > 10) color = '#10b981';
  else if (temp < 0) color = '#818cf8';

  useFrame((_, delta) => {
    // Grow up animation
    currentHeight.current += (targetHeight - currentHeight.current) * 0.1;
    if (meshRef.current) {
      meshRef.current.scale.y = currentHeight.current;
      meshRef.current.position.y = currentHeight.current / 2;
    }
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover({ index, temp, timeStr });
        }}
        onPointerOut={() => onHover(null)}
      >
        <boxGeometry args={[0.7, 1, 0.7]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.9 : 0.35}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Base glow plate */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.08, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export default function HourlyBars3D({ hourly, tempUnit = 'C' }) {
  const [hoveredData, setHoveredData] = useState(null);

  // Take next 24 hours
  const hours = (hourly?.time || []).slice(0, 24);
  const temps = (hourly?.temperature_2m || []).slice(0, 24);

  return (
    <div style={{ position: 'relative', width: '100%', height: '240px', borderRadius: '16px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 4, 18], fov: 42 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} color="#ffffff" />
        <group position={[0, -1.5, 0]}>
          {hours.map((time, idx) => {
            const date = new Date(time);
            const timeStr = date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
            return (
              <Bar
                key={idx}
                index={idx}
                count={hours.length}
                temp={temps[idx] || 0}
                unit={tempUnit}
                timeStr={timeStr}
                isSelected={hoveredData?.index === idx}
                onHover={setHoveredData}
              />
            );
          })}
        </group>
      </Canvas>

      {/* Hover Info Tooltip */}
      {hoveredData && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid #38bdf8',
            borderRadius: '12px',
            padding: '6px 14px',
            fontSize: '0.85rem',
            color: '#fff',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
          }}
        >
          <span style={{ color: '#94a3b8' }}>{hoveredData.timeStr}</span>
          <span style={{ fontWeight: 700, color: '#38bdf8' }}>
            {formatTemp(hoveredData.temp, tempUnit)}
          </span>
        </div>
      )}
    </div>
  );
}
