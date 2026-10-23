import React, { useEffect } from 'react';

export default function CursorTrail({ condition = 'clear', isNight = false }) {
  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let lastSpawn = 0;
    const spawnRate = 45; // ms throttle

    const handlePointerMove = (e) => {
      const now = performance.now();
      if (now - lastSpawn < spawnRate) return;
      lastSpawn = now;

      const particle = document.createElement('div');
      particle.className = 'cursor-particle';

      const size = Math.random() * 8 + 6;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${e.clientX}px`;
      particle.style.top = `${e.clientY}px`;

      if (condition === 'rain' || condition === 'heavy_rain' || condition === 'drizzle') {
        // Raindrop blue
        particle.style.background = '#38bdf8';
        particle.style.boxShadow = '0 0 8px #0ea5e9';
        particle.style.borderRadius = '50% 50% 50% 0';
        particle.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
      } else if (condition === 'snow') {
        // Snow crystal white
        particle.style.background = '#ffffff';
        particle.style.boxShadow = '0 0 10px #ffffff';
      } else if (isNight) {
        // Starlight lavender
        particle.style.background = '#c084fc';
        particle.style.boxShadow = '0 0 10px #a855f7';
      } else {
        // Sun golden sparkle
        particle.style.background = '#fde047';
        particle.style.boxShadow = '0 0 12px #f59e0b';
      }

      document.body.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 750);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [condition, isNight]);

  return null;
}
