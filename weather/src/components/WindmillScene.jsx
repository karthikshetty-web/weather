import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Wind Turbine model whose rotor spins according to live wind speed
function WindmillModel({ windSpeed = 12 }) {
  const rotorRef = useRef();
  const particlesRef = useRef();

  // Speed in RPM mapped from km/h
  // 0 km/h -> 0.2 rad/s, 50 km/h -> 8 rad/s
  const rotationRate = Math.max(0.3, (windSpeed / 10) * 1.5);

  useFrame((_, delta) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.z += rotationRate * delta;
    }
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      const streamSpeed = Math.max(2, (windSpeed / 4)) * delta;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3] += streamSpeed;
        if (positions[i * 3] > 10) {
          positions[i * 3] = -10;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Wind particle stream
  const particlePositions = React.useMemo(() => {
    const count = 70;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6 + 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, []);

  return (
    <group position={[0, -2, 0]}>
      {/* Tower Pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.15, 0.3, 4.2, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Nacelle housing */}
      <mesh position={[0, 4.1, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.25, 0.8, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} />
      </mesh>

      {/* Rotor hub & 3 Aerodynamic blades */}
      <group ref={rotorRef} position={[0, 4.1, 0.65]}>
        {/* Hub nose cone */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.26, 0.45, 16]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>

        {/* 3 Blades at 120 deg intervals */}
        {[0, 1, 2].map((i) => {
          const angle = (i * Math.PI * 2) / 3;
          return (
            <group key={i} rotation={[0, 0, angle]}>
              <mesh position={[0, 1.4, 0]}>
                <boxGeometry args={[0.16, 2.7, 0.04]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.4} />
              </mesh>
              {/* Aerodynamic blade tip red stripes */}
              <mesh position={[0, 2.5, 0.01]}>
                <boxGeometry args={[0.17, 0.4, 0.05]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Wind Particles Stream */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#38bdf8"
          transparent
          opacity={0.65}
          sizeAttenuation
        />
      </points>

      {/* Gentle ground mound */}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 32]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

export default function WindmillScene({ windSpeed = 12 }) {
  return (
    <div style={{ width: '100%', height: '140px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 2, 7], fov: 45 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 10, 5]} intensity={1.4} color="#e0f2fe" />
        <WindmillModel windSpeed={windSpeed} />
      </Canvas>
    </div>
  );
}
