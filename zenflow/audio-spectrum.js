/**
 * Web Audio API Frequency Spectrum Visualizer
 * Binds AnalyserNode FFT byte frequency data to HTML5 Canvas.
 */

export class AudioSpectrumVisualizer {
  constructor(canvas, analyserNode) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.analyser = analyserNode;
    this.analyser.fftSize = 64;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.animationFrameId = null;
  }

  start() {
    const draw = () => {
      this.animationFrameId = requestAnimationFrame(draw);
      this.analyser.getByteFrequencyData(this.dataArray);

      const width = this.canvas.width;
      const height = this.canvas.height;
      this.ctx.clearRect(0, 0, width, height);

      const barWidth = (width / this.bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < this.bufferLength; i++) {
        const barHeight = (this.dataArray[i] / 255) * height;

        this.ctx.fillStyle = "rgba(100, 180, 255, 0.7)";
        this.ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    draw();
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
