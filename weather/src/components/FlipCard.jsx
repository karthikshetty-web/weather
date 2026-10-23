import React, { useState, useRef } from 'react';
import { RotateCw } from 'lucide-react';

export default function FlipCard({
  front,
  back,
  className = '',
  style = {},
  allowTilt = true,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!allowTilt || isFlipped || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    });
  };

  const handleCardClick = (e) => {
    // Avoid flipping if user clicked a link or interactive button inside
    if (e.target.closest('button') && !e.target.closest('.flip-trigger-btn')) {
      return;
    }
    setIsFlipped((prev) => !prev);
  };

  return (
    <div
      ref={cardRef}
      className={`flip-card-container ${isFlipped ? 'is-flipped' : ''} ${className}`}
      style={{
        ...style,
        ...(!isFlipped ? tiltStyle : {}),
        transition: 'transform 0.15s ease-out',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <div className="flip-card-inner glass-panel" style={{ height: '100%', minHeight: '190px' }}>
        {/* Front Face */}
        <div className="flip-card-front" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', opacity: 0.45 }}>
            <RotateCw size={14} className="flip-trigger-btn" />
          </div>
          {front}
        </div>

        {/* Back Face */}
        <div className="flip-card-back glass-panel" style={{ padding: '1.25rem', height: '100%' }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', opacity: 0.45 }}>
            <RotateCw size={14} className="flip-trigger-btn" />
          </div>
          {back}
        </div>
      </div>
    </div>
  );
}
