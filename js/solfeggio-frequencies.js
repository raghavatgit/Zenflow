// Solfeggio Resonant Frequency Generator
// Synthesizes harmonic pure-sine meditation frequencies (396Hz, 432Hz, 528Hz, 639Hz, 741Hz, 852Hz).

export class SolfeggioGenerator {
    private ctx: AudioContext;
    private osc: OscillatorNode | null = null;
    private gain: GainNode;

    public static FREQUENCIES: Record<string, number> = {
        'LIBERATION_396': 396.0,
        'VERDI_A_432': 432.0,
        'TRANSFORMATION_528': 528.0,
        'RELATIONSHIPS_639': 639.0,
        'INTUITION_741': 741.0,
        'SPIRITUAL_852': 852.0
    };

    constructor(audioContext: AudioContext) {
        this.ctx = audioContext;
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.08;
        this.gain.connect(this.ctx.destination);
    }

    public playFrequency(freq: number): void {
        this.stop();
        this.osc = this.ctx.createOscillator();
        this.osc.type = 'sine';
        this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        this.osc.connect(this.gain);
        this.osc.start();
    }

    public stop(): void {
        if (this.osc) {
            this.osc.stop();
            this.osc.disconnect();
            this.osc = null;
        }
    }
}
