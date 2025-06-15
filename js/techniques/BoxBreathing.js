import { BaseTechnique } from './BaseTechnique.js';

const PHASES = [
    { name: 'Breathe In', duration: 4 },
    { name: 'Hold', duration: 4 },
    { name: 'Breathe Out', duration: 4 },
    { name: 'Hold', duration: 4 },
];
const TOTAL_CYCLE_DURATION = PHASES.reduce((sum, p) => sum + p.duration, 0);

export class BoxBreathing extends BaseTechnique {
    constructor() {
        super(
            'Box Breathing',
            'A simple technique to calm your nerves and regulate automatic bodily functions. Helps with stress and focus.'
        );
        this.phases = PHASES;
        this.currentPhaseIndex = 0;
        this.timeInPhase = 0;
    }

    start() {
        super.start();
        this.currentPhaseIndex = 0;
        this.timeInPhase = 0;
    }

    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;

        this.timeInPhase += deltaTime;

        if (this.timeInPhase >= this.phases[this.currentPhaseIndex].duration) {
            this.timeInPhase = 0;
            this.currentPhaseIndex++;

            if (this.currentPhaseIndex >= this.phases.length) {
                this.currentPhaseIndex = 0;
                this.cycleCount++;
            }
        }
    }

    getUIState() {
        const timeElapsedInCycle = this.phases.slice(0, this.currentPhaseIndex).reduce((sum, p) => sum + p.duration, 0) + this.timeInPhase;
        const progress = (timeElapsedInCycle / TOTAL_CYCLE_DURATION) * 100;

        return {
            phase: this.phases[this.currentPhaseIndex],
            progress: progress,
            cycleCount: this.cycleCount,
        };
    }
}