/**
 * Web Audio API Noise Generator
 * Generates synthetic white, pink, and brown ambient audio buffers
 * for distraction-free deep work sessions.
 */

export class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.noiseNode = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
  }

  generatePinkNoiseBuffer(durationSeconds = 5) {
    this.init();
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    return buffer;
  }

  playPinkNoise() {
    this.init();
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.stop();

    const buffer = this.generatePinkNoiseBuffer(5);
    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;
    this.noiseNode.connect(this.gainNode);
    this.noiseNode.start();
    this.isPlaying = true;
  }

  stop() {
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch (e) {
        // Node already stopped
      }
      this.noiseNode = null;
    }
    this.isPlaying = false;
  }

  setVolume(volume) {
    if (this.gainNode && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.gainNode.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.05);
    }
  }
}
