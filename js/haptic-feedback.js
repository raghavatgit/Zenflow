// Breathing Rhythm Haptic Feedback
// Provides subtle physical vibrations for eyes-closed mindfulness exercises.

export class BreathingHaptics {
    public static canVibrate(): boolean {
        return 'vibrate' in navigator;
    }

    public static onInhale(): void {
        if (this.canVibrate()) {
            navigator.vibrate([40, 60, 40]);
        }
    }

    public static onHold(): void {
        if (this.canVibrate()) {
            navigator.vibrate(25);
        }
    }

    public static onExhale(): void {
        if (this.canVibrate()) {
            navigator.vibrate([80]);
        }
    }
}
