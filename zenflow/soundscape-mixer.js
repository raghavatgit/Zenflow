/**
 * Multi-Channel Ambient Soundscape Mixer
 * Manages independent Web Audio gain channels for pink noise,
 * binaural alpha waves (10Hz), and synthetic rain.
 */

export class SoundscapeMixer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.channels = new Map();
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  createChannel(channelName, initialVolume = 0.5) {
    this.init();
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(initialVolume, this.ctx.currentTime);
    gainNode.connect(this.masterGain);

    this.channels.set(channelName, { gainNode, source: null });
    return gainNode;
  }

  setChannelVolume(channelName, volume) {
    const channel = this.channels.get(channelName);
    if (channel && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      channel.gainNode.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.05);
    }
  }

  setMasterVolume(volume) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.05);
    }
  }
}
