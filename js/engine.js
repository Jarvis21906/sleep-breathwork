import { state } from './state.js';
import * as ui from './ui.js';

let currentTechniqueInstance = null;

function loop(timestamp) {
    if (!state.isRunning || state.isPaused) {
        state.lastTimestamp = timestamp; // Keep track for accurate deltaTime on resume
        state.animationFrameId = requestAnimationFrame(loop);
        return;
    }
    if (!state.lastTimestamp) state.lastTimestamp = timestamp;

    const deltaTime = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;

    // The engine tells the technique to update itself
    currentTechniqueInstance.update(deltaTime);

    // The engine asks the technique for its current state
    const { phase, progress, cycleCount } = currentTechniqueInstance.getUIState();
    
    // The engine tells the UI to render that state
    ui.updatePhase(phase);
    ui.updateProgressBar(progress);
    ui.updateCycleCount(cycleCount);

    state.animationFrameId = requestAnimationFrame(loop);
}

export function setTechnique(techniqueInstance) {
    currentTechniqueInstance = techniqueInstance;
}

export function start() {
    if (state.isRunning) return;
    state.isRunning = true;
    state.isPaused = false;
    state.lastTimestamp = 0;

    currentTechniqueInstance.start();
    ui.showRunningState();
    
    // Start the main animation loop if it's not already running
    if (!state.animationFrameId) {
        state.animationFrameId = requestAnimationFrame(loop);
    }
}

export function stop() {
    if (!state.isRunning) return;
    state.isRunning = false;
    
    currentTechniqueInstance.stop();
    ui.resetToIdleState();
}

export function pause() {
    if (!state.isRunning || state.isPaused) return;
    state.isPaused = true;
    currentTechniqueInstance.pause();
    ui.showPausedState();
}

export function resume() {
    if (!state.isRunning || !state.isPaused) return;
    state.isPaused = false;
    currentTechniqueInstance.resume();
    
    const { phase } = currentTechniqueInstance.getUIState();
    ui.showResumedState(phase);
}