import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { X, Navigation, Compass } from 'lucide-react';

// Preset famous world cities with exact coordinates for one-click selection
export const WORLD_CITIES = [
  { name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { name: 'London', country: 'United Kingdom', admin1: 'England', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'Tokyo', country: 'Japan', admin1: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Paris', country: 'France', admin1: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Dubai', country: 'United Arab Emirates', admin1: 'Dubai', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Sydney', country: 'Australia', admin1: 'New South Wales', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Singapore', country: 'Singapore', admin1: 'Central Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Mumbai', country: 'India', admin1: 'Maharashtra', latitude: 19.076, longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { name: 'Cairo', country: 'Egypt', admin1: 'Cairo', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { name: 'Rio de Janeiro', country: 'Brazil', admin1: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729, timezone: 'America/Sao_Paulo' },
  { name: 'Reykjavik', country: 'Iceland', admin1: 'Capital Region', latitude: 64.1466, longitude: -21.9426, timezone: 'Atlantic/Reykjavik' },
  { name: 'San Francisco', country: 'United States', admin1: 'California', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' },
];

// Convert latitude & longitude to 3D spherical coordinates on globe
function latLonToVector3(lat, lon, radius = 5) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Procedural Canvas Texture for High-Quality Earth Continents and Oceans
function createEarthCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0c1a30');
  oceanGrad.addColorStop(0.5, '#0a2540');
  oceanGrad.addColorStop(1, '#081426');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle latitude & longitude grid lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.lineWidth = 1;

  for (let lat = 0; lat <= 512; lat += 32) {
    ctx.beginPath();
    ctx.moveTo(0, lat);
    ctx.lineTo(1024, lat);
    ctx.stroke();
  }
  for (let lon = 0; lon <= 1024; lon += 64) {
    ctx.beginPath();
    ctx.moveTo(lon, 0);
    ctx.lineTo(lon, 512);
    ctx.stroke();
  }

  // Draw landmass contours in glowing emerald/cyan
  ctx.fillStyle = '#10b981';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 12;

  // North America
  ctx.beginPath();
  ctx.ellipse(220, 140, 95, 75, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // South America
  ctx.beginPath();
  ctx.ellipse(320, 320, 60, 95, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Europe
  ctx.beginPath();
  ctx.ellipse(520, 130, 65, 45, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Africa
  ctx.beginPath();
  ctx.ellipse(540, 260, 75, 90, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Asia
  ctx.beginPath();
  ctx.ellipse(730, 160, 130, 85, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Australia
  ctx.beginPath();
  ctx.ellipse(840, 350, 65, 50, -0.2, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function CityPin({ city, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const pos = useMemo(() => latLonToVector3(city.latitude, city.longitude, 5.08), [city]);
  const markerRef = useRef();

  useFrame(({ clock }) => {
    if (markerRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.25;
      markerRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={pos}>
      <mesh
        ref={markerRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(city);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[isSelected ? 0.2 : 0.14, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? '#f43f5e' : (hovered ? '#fbbf24' : '#38bdf8')}
          emissive={isSelected ? '#f43f5e' : (hovered ? '#fbbf24' : '#0284c7')}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* City Ring Pulse */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.24, 16]} />
        <meshBasicMaterial
          color={isSelected ? '#f43f5e' : '#38bdf8'}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function EarthGlobe({ selectedCity, onSelectCity, targetRotation }) {
  const globeGroupRef = useRef();
  const earthTexture = useMemo(() => createEarthCanvasTexture(), []);
  const isDragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (globeGroupRef.current) {
      if (!isDragging.current && !targetRotation.current.active) {
        // Slow peaceful ambient spin
        globeGroupRef.current.rotation.y += 0.12 * delta;
      } else if (targetRotation.current.active) {
        // Fly-to animation interpolation
        globeGroupRef.current.rotation.y +=
          (targetRotation.current.targetY - globeGroupRef.current.rotation.y) * 0.08;
        globeGroupRef.current.rotation.x +=
          (targetRotation.current.targetX - globeGroupRef.current.rotation.x) * 0.08;

        if (
          Math.abs(targetRotation.current.targetY - globeGroupRef.current.rotation.y) < 0.01 &&
          Math.abs(targetRotation.current.targetX - globeGroupRef.current.rotation.x) < 0.01
        ) {
          targetRotation.current.active = false;
        }
      }
    }
  });

  const handlePointerDown = (e) => {
    isDragging.current = true;
    targetRotation.current.active = false;
    previousPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || !globeGroupRef.current) return;
    const deltaX = e.clientX - previousPointer.current.x;
    const deltaY = e.clientY - previousPointer.current.y;
    previousPointer.current = { x: e.clientX, y: e.clientY };

    globeGroupRef.current.rotation.y += deltaX * 0.006;
    globeGroupRef.current.rotation.x += deltaY * 0.006;
    globeGroupRef.current.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, globeGroupRef.current.rotation.x));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <group
      ref={globeGroupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Outer Atmosphere Glow Shell */}
      <mesh>
        <sphereGeometry args={[5.35, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main Earth Sphere */}
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.7}
          metalness={0.15}
        />
      </mesh>

      {/* City Markers */}
      {WORLD_CITIES.map((c) => (
        <CityPin
          key={c.name}
          city={c}
          isSelected={selectedCity?.name === c.name}
          onSelect={onSelectCity}
        />
      ))}
    </group>
  );
}

export default function GlobeModal({ isOpen, onClose, selectedCity, onSelectCity }) {
  const targetRotation = useRef({ active: false, targetX: 0, targetY: 0 });

  const handlePickCity = (city) => {
    // Calculate rotation to focus city in front of camera
    const lon = city.longitude;
    const lat = city.latitude;
    const targetY = -((lon + 90) * (Math.PI / 180));
    const targetX = (lat * (Math.PI / 180)) * 0.6;

    targetRotation.current = {
      active: true,
      targetX,
      targetY,
    };

    onSelectCity(city);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 10, 24, 0.88)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      {/* Header controls */}
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Compass size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc' }}>
              Interactive 3D Earth Globe
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Drag to spin the globe, or click any glowing city pin to view its real-time weather
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="icon-btn"
          style={{ width: 40, height: 40 }}
          title="Close Globe"
        >
          <X size={20} />
        </button>
      </div>

      {/* 3D Canvas Box */}
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          height: '65vh',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          overflow: 'hidden',
          background: 'radial-gradient(circle at center, #0e1e38 0%, #030712 100%)',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.2)',
        }}
      >
        <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[15, 10, 10]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-15, -10, -5]} intensity={0.5} color="#38bdf8" />
          <EarthGlobe
            selectedCity={selectedCity}
            onSelectCity={handlePickCity}
            targetRotation={targetRotation}
          />
        </Canvas>

        {/* Selected City Ribbon Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            padding: '0.6rem 1.4rem',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Navigation size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
            {selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : 'Select a city'}
          </span>
        </div>
      </div>

      {/* World Cities Quick Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          padding: '1rem 0 0.5rem 0',
        }}
      >
        {WORLD_CITIES.map((c) => {
          const isAct = selectedCity?.name === c.name;
          return (
            <button
              key={c.name}
              onClick={() => handlePickCity(c)}
              style={{
                flexShrink: 0,
                padding: '0.45rem 0.9rem',
                borderRadius: '12px',
                border: isAct ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                background: isAct ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                color: isAct ? '#38bdf8' : '#e2e8f0',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
