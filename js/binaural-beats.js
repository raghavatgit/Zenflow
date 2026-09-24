// Binaural Beat Frequency Generator
// Renders subtle offset tones in left and right stereo channels to induce brainwave states.

export class BinauralGenerator {
    private ctx: AudioContext;
    private oscLeft: OscillatorNode | null = null;
    private oscRight: OscillatorNode | null = null;
    private masterGain: GainNode;

    constructor(audioContext: AudioContext) {
        this.ctx = audioContext;
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.05; // Gentle volume
        this.masterGain.connect(this.ctx.destination);
    }

    public startBeats(baseFreq: number = 200, beatOffset: number = 6): void {
        this.stop();

        const panLeft = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        const panRight = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

        this.oscLeft = this.ctx.createOscillator();
        this.oscLeft.frequency.value = baseFreq;

        this.oscRight = this.ctx.createOscillator();
        this.oscRight.frequency.value = baseFreq + beatOffset;

        if (panLeft && panRight) {
            panLeft.pan.value = -1.0;
            panRight.pan.value = 1.0;
            this.oscLeft.connect(panLeft).connect(this.masterGain);
            this.oscRight.connect(panRight).connect(this.masterGain);
        } else {
            this.oscLeft.connect(this.masterGain);
            this.oscRight.connect(this.masterGain);
        }

        this.oscLeft.start();
        this.oscRight.start();
    }

    public stop(): void {
        if (this.oscLeft) { this.oscLeft.stop(); this.oscLeft.disconnect(); this.oscLeft = null; }
        if (this.oscRight) { this.oscRight.stop(); this.oscRight.disconnect(); this.oscRight = null; }
    }
}
