/**
 * Drift-Compensated High Precision Timer
 * Uses performance.now() epoch delta tracking to eliminate
 * background tab throttling latency in standard setInterval.
 */

export class DriftCompensatedTimer {
  constructor(onTick, onComplete) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.targetDurationMs = 0;
    this.remainingMs = 0;
    this.startTime = 0;
    this.timerId = null;
    this.isRunning = false;
  }

  start(durationSeconds) {
    this.targetDurationMs = durationSeconds * 1000;
    this.remainingMs = this.targetDurationMs;
    this.startTime = performance.now();
    this.isRunning = true;

    this.tick();
  }

  tick() {
    if (!this.isRunning) return;

    const elapsed = performance.now() - this.startTime;
    this.remainingMs = Math.max(0, this.targetDurationMs - elapsed);

    if (this.onTick) {
      const remainingSeconds = Math.ceil(this.remainingMs / 1000);
      this.onTick(remainingSeconds);
    }

    if (this.remainingMs <= 0) {
      this.stop();
      if (this.onComplete) this.onComplete();
    } else {
      // Calculate micro-sleep to next whole second boundary
      const delay = Math.min(1000, this.remainingMs % 1000 || 1000);
      this.timerId = window.setTimeout(() => this.tick(), delay);
    }
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timerId) clearTimeout(this.timerId);
    this.targetDurationMs = this.remainingMs;
  }

  resume() {
    if (this.isRunning || this.remainingMs <= 0) return;
    this.startTime = performance.now();
    this.isRunning = true;
    this.tick();
  }

  stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
