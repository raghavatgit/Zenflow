// Smooth Exponential Audio Fade-Out Timer
// Schedules audio volume de-escalation to preserve tranquility at session conclusion.

export class SessionFadeOut {
    public static fadeOutGain(
        gainNode: GainNode,
        audioContext: AudioContext,
        durationSeconds: number = 10,
        onComplete?: () => void
    ): void {
        const now = audioContext.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        // Exponential ramp to near-zero (-60dB equivalent: 0.001)
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

        setTimeout(() => {
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            if (onComplete) onComplete();
        }, durationSeconds * 1000);
    }
}
