import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';

function Spinner3D() {
  const outerRing = React.useRef();
  const innerRing = React.useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRing.current) {
      outerRing.current.rotation.x = t * 1.5;
      outerRing.current.rotation.y = t * 1.8;
    }
    if (innerRing.current) {
      innerRing.current.rotation.x = -t * 2;
      innerRing.current.rotation.z = t * 1.2;
    }
  });

  return (
    <group>
      <mesh ref={outerRing}>
        <torusGeometry args={[1.5, 0.08, 16, 48]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1} />
      </mesh>
      <mesh ref={innerRing}>
        <torusGeometry args={[1.0, 0.08, 16, 48]} />
        <meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

export function LoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1.5rem',
      }}
    >
      <div style={{ width: 140, height: 140 }}>
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.9} />
          <pointLight position={[5, 5, 5]} intensity={1.5} color="#38bdf8" />
          <Spinner3D />
        </Canvas>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
          Calibrating Atmospheric Models...
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Gathering live meteorological telemetry and calculating 3D cloud layers
        </p>
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry, isOffline }) {
  return (
    <div
      className="glass-panel"
      style={{
        maxWidth: '520px',
        margin: '4rem auto',
        padding: '2.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: isOffline ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isOffline ? '#ef4444' : '#f59e0b',
        }}
      >
        {isOffline ? <WifiOff size={28} /> : <AlertTriangle size={28} />}
      </div>

      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
        {isOffline ? 'You Are Currently Offline' : 'Weather Telemetry Unavailable'}
      </h3>

      <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
        {error || 'Unable to communicate with meteorological servers. If cached data is available, it will be displayed automatically.'}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '0.5rem',
            padding: '0.65rem 1.4rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            border: 'none',
            color: '#0f172a',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <RefreshCw size={16} /> Try Again
        </button>
      )}
    </div>
  );
}
