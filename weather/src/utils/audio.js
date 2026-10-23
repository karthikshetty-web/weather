// Web Audio API procedural sound engine for immersive weather soundscapes

class WeatherSoundEngine {
  constructor() {
    this.ctx = null;
    this.rainNode = null;
    this.windNode = null;
    this.masterGain = null;
    this.isMuted = true;
    this.currentCondition = 'clear';
    this.thunderInterval = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (!this.ctx) {
      if (!muted) this.init();
      else return;
    }
    if (this.ctx.state === 'suspended' && !muted) {
      this.ctx.resume();
    }
    const target = muted ? 0.0001 : 0.35;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.2);
  }

  playThunder() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Deep thunder rumble using bandpass noise + low oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 1.8);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 2.3);
  }

  createRainNoise() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    // Pink noise generation
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.12;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    whiteNoise.start();

    return { source: whiteNoise, gain, filter };
  }

  createWindSound() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    whiteNoise.start();

    return { source: whiteNoise, gain, filter };
  }

  updateWeather(condition) {
    this.currentCondition = condition;
    if (this.isMuted) return;
    this.init();

    // Clean up past loops
    if (this.rainNode) {
      try { this.rainNode.source.stop(); } catch (e) {}
      this.rainNode = null;
    }
    if (this.windNode) {
      try { this.windNode.source.stop(); } catch (e) {}
      this.windNode = null;
    }
    if (this.thunderInterval) {
      clearInterval(this.thunderInterval);
      this.thunderInterval = null;
    }

    if (condition === 'rain' || condition === 'heavy_rain' || condition === 'drizzle') {
      this.rainNode = this.createRainNoise();
      if (condition === 'heavy_rain' && this.rainNode) {
        this.rainNode.filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
        this.rainNode.gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      }
    } else if (condition === 'thunderstorm') {
      this.rainNode = this.createRainNoise();
      this.windNode = this.createWindSound();
      this.playThunder();
      this.thunderInterval = setInterval(() => {
        if (!this.isMuted && Math.random() > 0.4) {
          this.playThunder();
        }
      }, 7000);
    } else if (condition === 'clear') {
      this.windNode = this.createWindSound();
      if (this.windNode) {
        this.windNode.gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      }
    }
  }

  dispose() {
    if (this.thunderInterval) clearInterval(this.thunderInterval);
    if (this.rainNode) {
      try { this.rainNode.source.stop(); } catch (e) {}
    }
    if (this.windNode) {
      try { this.windNode.source.stop(); } catch (e) {}
    }
    if (this.ctx) {
      try { this.ctx.close(); } catch (e) {}
    }
  }
}

export const soundEngine = new WeatherSoundEngine();
