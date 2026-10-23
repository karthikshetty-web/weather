import React, { useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function SoundController({ isMuted, onToggleMute, condition }) {
  useEffect(() => {
    soundEngine.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (!isMuted) {
      soundEngine.updateWeather(condition);
    }
  }, [condition, isMuted]);

  return (
    <button
      onClick={onToggleMute}
      className="icon-btn"
      title={isMuted ? 'Unmute weather atmospheric audio' : 'Mute audio'}
      style={{
        color: !isMuted ? '#38bdf8' : 'var(--text-muted)',
        borderColor: !isMuted ? 'rgba(56, 189, 248, 0.4)' : undefined,
      }}
    >
      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}
