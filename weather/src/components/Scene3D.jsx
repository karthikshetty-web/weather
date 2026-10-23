import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import confetti from 'canvas-confetti';

// Calculate solar position based on sunrise/sunset and current time
function getSunPosition(now, sunriseStr, sunsetStr) {
  if (!sunriseStr || !sunsetStr) {
    const hours = now.getHours() + now.getMinutes() / 60;
    const angle = ((hours - 6) / 12) * Math.PI;
    const isDay = hours >= 6 && hours <= 18;
    const x = Math.cos(angle) * 35;
    const y = Math.sin(angle) * 30;
    const z = -25;
    return { sunPos: [x, Math.max(-10, y), z], moonPos: [-x, -Math.max(-10, y), z], isDay };
  }

  const sunrise = new Date(sunriseStr).getTime();
  const sunset = new Date(sunsetStr).getTime();
  const current = now.getTime();
  const isDay = current >= sunrise && current <= sunset;

  let progress = 0;
  if (isDay) {
    progress = (current - sunrise) / (sunset - sunrise); // 0 to 1
  } else {
    // night progress
    const nightDuration = 24 * 3600 * 1000 - (sunset - sunrise);
    const nightElapsed = current > sunset ? (current - sunset) : (current + 24 * 3600 * 1000 - sunset);
    progress = nightElapsed / nightDuration;
  }

  const angle = progress * Math.PI;
  const x = Math.cos(Math.PI - angle) * 40;
  const y = Math.sin(angle) * 32;
  const z = -25;

  return {
    sunPos: isDay ? [x, Math.max(-5, y), z] : [-x, -y - 15, z],
    moonPos: !isDay ? [x, Math.max(-5, y), z] : [-x, -y - 15, z],
    isDay,
  };
}

// Interactive Sun with Easter Egg (Clicking makes it smile & pop confetti)
function SunMesh({ position, isDay, onClickSun }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const [smiling, setSmiling] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.z = t * 0.1;
      const s = 1 + Math.sin(t * 2) * 0.04;
      meshRef.current.scale.set(s, s, s);
    }
    if (glowRef.current) {
      const g = 1 + Math.cos(t * 1.5) * 0.08;
      glowRef.current.scale.set(g, g, g);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setSmiling(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.3 },
      colors: ['#f59e0b', '#fbbf24', '#fde047', '#38bdf8', '#ffedd5']
    });
    if (onClickSun) onClickSun();
    setTimeout(() => setSmiling(false), 3000);
  };

  if (!isDay && position[1] < 0) return null;

  return (
    <group position={position}>
      {/* Outer Glow Halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[5.2, 32, 32]} />
        <meshBasicMaterial
          color="#fde047"
          transparent
          opacity={0.22}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Sun Core */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <sphereGeometry args={[3.4, 32, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#fbbf24"
          emissiveIntensity={1.2}
          roughness={0.2}
        />
      </mesh>

      {/* Easter Egg Smiling Eyes and Mouth */}
      {smiling && (
        <group position={[0, 0, 3.5]}>
          {/* Left Eye */}
          <mesh position={[-0.9, 0.7, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshBasicMaterial color="#78350f" />
          </mesh>
          {/* Right Eye */}
          <mesh position={[0.9, 0.7, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshBasicMaterial color="#78350f" />
          </mesh>
          {/* Smile Arc */}
          <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[1.1, 0.16, 16, 32, Math.PI * 0.8]} />
            <meshBasicMaterial color="#78350f" />
          </mesh>
        </group>
      )}

      {/* Sun Light Source */}
      <pointLight color="#ffe8b3" intensity={2.4} distance={90} decay={1.5} />
    </group>
  );
}

// 3D Glowing Moon with procedural crater marks
function MoonMesh({ position, isNight }) {
  const moonRef = useRef();

  useFrame(({ clock }) => {
    if (moonRef.current) {
      moonRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  if (!isNight && position[1] < 0) return null;

  return (
    <group position={position}>
      {/* Moon Halo */}
      <mesh>
        <sphereGeometry args={[3.8, 32, 32]} />
        <meshBasicMaterial
          color="#93c5fd"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Moon Body */}
      <mesh ref={moonRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshStandardMaterial
          color="#e2e8f0"
          emissive="#94a3b8"
          emissiveIntensity={0.65}
          roughness={0.8}
        />
      </mesh>

      {/* Crater Details */}
      <group position={[0, 0, 0]}>
        <mesh position={[0.6, 0.4, 2.3]}>
          <circleGeometry args={[0.35, 16]} />
          <meshBasicMaterial color="#cbd5e1" transparent opacity={0.6} />
        </mesh>
        <mesh position={[-0.8, -0.5, 2.2]}>
          <circleGeometry args={[0.5, 16]} />
          <meshBasicMaterial color="#cbd5e1" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.3, -0.9, 2.2]}>
          <circleGeometry args={[0.25, 16]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.5} />
        </mesh>
      </group>

      <pointLight color="#bfdbfe" intensity={1.8} distance={70} decay={1.8} />
    </group>
  );
}

// Starfield with twinkling particles for night skies
function StarsField({ count = 800, opacity = 0.8 }) {
  const pointsRef = useRef();

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 45 + Math.random() * 25;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.sin(phi) * Math.sin(theta)) + 2; // Keep in sky dome
      pos[i * 3 + 2] = -r * Math.abs(Math.cos(phi)) - 10;
      sc[i] = Math.random();
    }
    return [pos, sc];
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.65}
        color="#ffffff"
        transparent
        opacity={opacity}
        sizeAttenuation
      />
    </points>
  );
}

// Volumetric Layered 3D Clouds drifting with wind
function CloudsGroup({ count = 12, windSpeed = 10, isOvercast = false }) {
  const groupRef = useRef();

  const cloudPuffs = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      x: (Math.random() - 0.5) * 60,
      y: 8 + Math.random() * 12,
      z: -15 - Math.random() * 25,
      scale: 1.8 + Math.random() * 2.5,
      speedMultiplier: 0.7 + Math.random() * 0.6,
    }));
  }, [count]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const speed = Math.max(1, windSpeed) * 0.08 * delta;
      groupRef.current.children.forEach((child, i) => {
        child.position.x += speed * (cloudPuffs[i]?.speedMultiplier || 1);
        if (child.position.x > 45) {
          child.position.x = -45;
        }
      });
    }
  });

  const puffColor = isOvercast ? '#64748b' : '#f8fafc';
  const puffOpacity = isOvercast ? 0.75 : 0.55;

  return (
    <group ref={groupRef}>
      {cloudPuffs.map((puff, idx) => (
        <group key={idx} position={[puff.x, puff.y, puff.z]} scale={puff.scale}>
          {/* Clustered spheres forming a fluffy cloud */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshStandardMaterial
              color={puffColor}
              transparent
              opacity={puffOpacity}
              roughness={0.9}
            />
          </mesh>
          <mesh position={[1.2, -0.3, 0.2]}>
            <sphereGeometry args={[1.2, 16, 16]} />
            <meshStandardMaterial
              color={puffColor}
              transparent
              opacity={puffOpacity * 0.9}
              roughness={0.9}
            />
          </mesh>
          <mesh position={[-1.1, -0.2, -0.1]}>
            <sphereGeometry args={[1.3, 16, 16]} />
            <meshStandardMaterial
              color={puffColor}
              transparent
              opacity={puffOpacity * 0.9}
              roughness={0.9}
            />
          </mesh>
          <mesh position={[0.4, 0.7, -0.2]}>
            <sphereGeometry args={[1.0, 16, 16]} />
            <meshStandardMaterial
              color={puffColor}
              transparent
              opacity={puffOpacity * 0.85}
              roughness={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 3D Falling Rain with Ground Splash Ripples
function RainSystem({ count = 900, isHeavy = false }) {
  const rainRef = useRef();
  const splashRef = useRef();

  const [positions, velocities] = useMemo(() => {
    const actualCount = isHeavy ? count * 1.5 : count;
    const pos = new Float32Array(actualCount * 3);
    const vel = new Float32Array(actualCount);
    for (let i = 0; i < actualCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 55;
      pos[i * 3 + 1] = Math.random() * 40 - 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 35;
      vel[i] = 0.5 + Math.random() * 0.6;
    }
    return [pos, vel];
  }, [count, isHeavy]);

  useFrame((_, delta) => {
    if (rainRef.current) {
      const attr = rainRef.current.geometry.attributes.position;
      const arr = attr.array;
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3 + 1] -= velocities[i] * (isHeavy ? 45 : 32) * delta;
        arr[i * 3] -= 4 * delta; // slight wind slant
        if (arr[i * 3 + 1] < -12) {
          arr[i * 3 + 1] = 25;
          arr[i * 3] = (Math.random() - 0.5) * 55;
        }
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <group>
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isHeavy ? 0.35 : 0.22}
          color="#38bdf8"
          transparent
          opacity={isHeavy ? 0.8 : 0.6}
          sizeAttenuation
        />
      </points>

      {/* Ground splash plane reflection */}
      <mesh position={[0, -12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.15}
          metalness={0.8}
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}

// 3D Drifting Snow with gentle side-to-side oscillation
function SnowSystem({ count = 500 }) {
  const snowRef = useRef();

  const [positions, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const offs = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = Math.random() * 35 - 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 35;
      offs[i] = Math.random() * Math.PI * 2;
    }
    return [pos, offs];
  }, [count]);

  useFrame(({ clock }, delta) => {
    if (snowRef.current) {
      const t = clock.getElapsedTime();
      const attr = snowRef.current.geometry.attributes.position;
      const arr = attr.array;
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] -= (1.5 + Math.sin(offs[i]) * 0.5) * 4 * delta;
        arr[i * 3] += Math.sin(t * 1.5 + offs[i]) * 1.2 * delta;
        if (arr[i * 3 + 1] < -12) {
          arr[i * 3 + 1] = 25;
          arr[i * 3] = (Math.random() - 0.5) * 50;
        }
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <points ref={snowRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        color="#ffffff"
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

// 3D Fog Planes with drifting oscillation
function FogSystem() {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 0.15;
      groupRef.current.children.forEach((mesh, idx) => {
        mesh.position.x = Math.sin(t + idx) * 3;
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, -2, -10]}>
      {[-8, -4, 0, 4].map((z, idx) => (
        <mesh key={idx} position={[0, idx * 1.5 - 2, z]}>
          <planeGeometry args={[60, 18]} />
          <meshBasicMaterial
            color="#64748b"
            transparent
            opacity={0.16}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Lightning Flash Generator for Thunderstorms
function LightningEffect() {
  const [flashIntensity, setFlashIntensity] = useState(0);

  useEffect(() => {
    let timeoutId;
    const triggerFlash = () => {
      // Sudden sharp flash
      setFlashIntensity(5.0);
      setTimeout(() => setFlashIntensity(0.8), 80);
      setTimeout(() => setFlashIntensity(4.2), 160);
      setTimeout(() => setFlashIntensity(0), 320);

      // Random wait between 4 to 10 seconds for next flash
      const nextDelay = 4000 + Math.random() * 6000;
      timeoutId = setTimeout(triggerFlash, nextDelay);
    };

    timeoutId = setTimeout(triggerFlash, 2500);
    return () => clearTimeout(timeoutId);
  }, []);

  if (flashIntensity <= 0) return null;

  return (
    <group>
      <pointLight
        position={[0, 15, -10]}
        color="#c084fc"
        intensity={flashIntensity}
        distance={90}
        decay={1}
      />
      <ambientLight color="#e9d5ff" intensity={flashIntensity * 0.6} />
    </group>
  );
}

// Floating slowly spinning 3D Weather Icons (Sun, Cloud, Snowflake, Umbrella)
function FloatingWeatherDecorations({ condition }) {
  const sunGroup = useRef();
  const cloudGroup = useRef();
  const umbrellaGroup = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sunGroup.current) {
      sunGroup.current.position.y = 8 + Math.sin(t * 0.8) * 0.8;
      sunGroup.current.rotation.y = t * 0.4;
    }
    if (cloudGroup.current) {
      cloudGroup.current.position.y = 4 + Math.cos(t * 0.6) * 0.6;
      cloudGroup.current.position.x = -14 + Math.sin(t * 0.3) * 1.2;
    }
    if (umbrellaGroup.current) {
      umbrellaGroup.current.position.y = -4 + Math.sin(t * 0.7 + 1) * 0.5;
      umbrellaGroup.current.rotation.z = Math.sin(t * 0.5) * 0.15;
    }
  });

  return (
    <group>
      {/* Decorative floating mini sun in distance */}
      {condition === 'clear' && (
        <group ref={sunGroup} position={[15, 8, -20]} scale={0.7}>
          <mesh>
            <sphereGeometry args={[1.2, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.8} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.8]} />
                <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={0.5} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Floating mini umbrella if raining */}
      {(condition === 'rain' || condition === 'heavy_rain') && (
        <group ref={umbrellaGroup} position={[-16, -2, -18]} scale={0.85}>
          {/* Canopy */}
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[1.4, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          {/* Handle */}
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 1.8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Parallax Camera Controller
function ParallaxCamera() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.targetX = (e.clientX / window.innerWidth - 0.5) * 4;
      mouse.current.targetY = -(e.clientY / window.innerHeight - 0.5) * 3;
    };

    const handleOrientation = (e) => {
      if (e.gamma != null && e.beta != null) {
        mouse.current.targetX = (e.gamma / 45) * 3;
        mouse.current.targetY = ((e.beta - 45) / 45) * 2;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useFrame(() => {
    // Smooth damping
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.04;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.04;

    camera.position.x = mouse.current.x;
    camera.position.y = mouse.current.y;
    camera.lookAt(0, 0, -20);
  });

  return null;
}

// Main 3D Scene Component
export default function Scene3D({ theme, weatherCondition, sunrise, sunset, windSpeed = 10, utcOffsetSeconds }) {
  const [cityNow, setCityNow] = useState(() => {
    const d = new Date();
    if (typeof utcOffsetSeconds === 'number') {
      const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
      return new Date(utcMs + utcOffsetSeconds * 1000);
    }
    return d;
  });

  useEffect(() => {
    const update = () => {
      const d = new Date();
      if (typeof utcOffsetSeconds === 'number') {
        const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
        setCityNow(new Date(utcMs + utcOffsetSeconds * 1000));
      } else {
        setCityNow(d);
      }
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [utcOffsetSeconds]);

  const { sunPos, moonPos, isDay } = useMemo(() => {
    return getSunPosition(cityNow, sunrise, sunset);
  }, [cityNow, sunrise, sunset]);

  const condition = weatherCondition || 'clear';
  const isNight = !isDay;
  const isOvercast = condition === 'cloudy' || condition === 'thunderstorm';

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60, near: 0.1, far: 200 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        {/* Parallax Controller */}
        <ParallaxCamera />

        {/* Dynamic Atmospheric Lighting */}
        <ambientLight color={theme?.sky?.ambientLight || '#ffffff'} intensity={isNight ? 0.35 : 0.85} />
        <directionalLight
          position={isDay ? sunPos : moonPos}
          intensity={isDay ? (theme?.sky?.sunIntensity || 1.2) : (theme?.sky?.moonIntensity || 0.6)}
          color={isDay ? (theme?.sky?.sunLight || '#ffeaa7') : '#bfdbfe'}
        />

        {/* Dynamic Sky Dome Background Color */}
        <color attach="background" args={[theme?.sky?.top || '#0b1329']} />

        {/* Stars on clear/night sky */}
        {isNight && <StarsField count={window.innerWidth < 768 ? 400 : 900} opacity={theme?.sky?.starOpacity || 0.8} />}

        {/* Sun & Moon */}
        <SunMesh position={sunPos} isDay={isDay} />
        <MoonMesh position={moonPos} isNight={isNight} />

        {/* Atmospheric Clouds */}
        <CloudsGroup
          count={isOvercast ? 18 : (condition === 'partly_cloudy' ? 8 : 4)}
          windSpeed={windSpeed}
          isOvercast={isOvercast}
        />

        {/* Rain Systems */}
        {(condition === 'rain' || condition === 'drizzle') && (
          <RainSystem count={window.innerWidth < 768 ? 400 : 900} isHeavy={false} />
        )}
        {condition === 'heavy_rain' && (
          <RainSystem count={window.innerWidth < 768 ? 700 : 1400} isHeavy={true} />
        )}

        {/* Thunderstorm Lightning */}
        {condition === 'thunderstorm' && (
          <>
            <RainSystem count={1200} isHeavy={true} />
            <LightningEffect />
          </>
        )}

        {/* Snow System */}
        {condition === 'snow' && (
          <SnowSystem count={window.innerWidth < 768 ? 300 : 600} />
        )}

        {/* Fog System */}
        {condition === 'fog' && <FogSystem />}

        {/* Floating Playful Weather Props */}
        <FloatingWeatherDecorations condition={condition} />
      </Canvas>
    </div>
  );
}
