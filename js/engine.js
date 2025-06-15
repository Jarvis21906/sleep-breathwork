import { state } from './state.js';
import { TECHNIQUES } from './config.js';
import * as ui from './ui.js';

function loop(timestamp) {
    if (!state.isRunning || state.isPaused) {
        state.lastTimestamp = timestamp;
        return;
    }
    if (!state.lastTimestamp) state.lastTimestamp = timestamp;

    const deltaTime = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;
    state.timeInPhase += deltaTime;

    const technique = TECHNIQUES[state.currentTechnique];
    const phase = technique.phases[state.currentPhaseIndex];
    const totalCycleDuration = technique.phases.reduce((sum, p) => sum + p.duration, 0);
    const timeElapsedInCycle = technique.phases.slice(0, state.currentPhaseIndex).reduce((sum, p) => sum + p.duration, 0) + state.timeInPhase;

    ui.updateProgressBar((timeElapsedInCycle / totalCycleDuration) * 100);

    if (state.timeInPhase >= phase.duration) {
        state.timeInPhase = 0;
        state.currentPhaseIndex++;

        if (state.currentPhaseIndex >= technique.phases.length) {
            state.currentPhaseIndex = 0;
            state.cycleCount++;
            ui.updateCycleCount(state.cycleCount);
        }
        ui.updatePhase(technique.phases[state.currentPhaseIndex]);
    }

    state.animationFrameId = requestAnimationFrame(loop);
}

export function start() {
    if (state.isRunning) return;
    state.isRunning = true;
    state.isPaused = false;
    
    ui.showRunningState();
    ui.updateCycleCount(0);
    
    const initialPhase = TECHNIQUES[state.currentTechnique].phases[0];
    ui.updatePhase(initialPhase);

    state.animationFrameId = requestAnimationFrame(loop);
}

export function stop() {
    state.isRunning = false;
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
    }
    state.cycleCount = 0;
    state.currentPhaseIndex = 0;
    state.timeInPhase = 0;
    ui.resetToIdleState();
}

export function pause() {
    if (!state.isRunning || state.isPaused) return;
    state.isPaused = true;
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
    }
    ui.showPausedState();
}

export function resume() {
    if (!state.isRunning || !state.isPaused) return;
    state.isPaused = false;
    const currentPhase = TECHNIQUES[state.currentTechnique].phases[state.currentPhaseIndex];
    ui.showResumedState(currentPhase);
    state.animationFrameId = requestAnimationFrame(loop);
}