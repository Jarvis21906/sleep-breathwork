import { state } from './state.js';
import * as ui from './ui.js';
import * as audio from './audio.js'; // The audio module is correct, we just need to call it properly.

let currentTechniqueInstance = null;
let lastPhaseName = ''; // Used to track phase changes for sound triggers

function loop(timestamp) {
    // === FIX: This is now the ONLY loop function ===
    if (!state.isRunning) {
        // If stopped, cancel the loop entirely.
        if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
        }
        return;
    }

    if (state.isPaused) {
        // If paused, just keep the loop alive but do nothing.
        state.lastTimestamp = timestamp;
        state.animationFrameId = requestAnimationFrame(loop);
        return;
    }

    if (!state.lastTimestamp) state.lastTimestamp = timestamp;

    const deltaTime = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;

    // The core logic remains the same
    currentTechniqueInstance.update(deltaTime);
    const { phase, progress, cycleCount } = currentTechniqueInstance.getUIState();

    // === FIX: Sound trigger logic placed correctly in the single loop ===
    if (phase.name !== lastPhaseName) {
        if (phase.name.includes('In')) {
            audio.playInhaleSound();
        } else if (phase.name.includes('Out')) {
            audio.playExhaleSound();
        }
        lastPhaseName = phase.name;
    }
    // ================================================================

    ui.updatePhase(phase);
    ui.updateProgressBar(progress);
    ui.updateCycleCount(cycleCount);

    state.animationFrameId = requestAnimationFrame(loop);
}

export function setTechnique(techniqueInstance) {
    currentTechniqueInstance = techniqueInstance;
}

export function start() {
    // === FIX: This is now the ONLY start function ===
    if (state.isRunning) return;
    state.isRunning = true;
    state.isPaused = false;
    state.lastTimestamp = 0;
    lastPhaseName = ''; // Reset phase tracking

    currentTechniqueInstance.start();
    ui.showRunningState();

    // Trigger the sound for the very first phase immediately
    const initialPhase = currentTechniqueInstance.getUIState().phase;
    if (initialPhase.name.includes('In')) {
        audio.playInhaleSound();
    }
    lastPhaseName = initialPhase.name;
    
    // Start the single, unified loop
    if (!state.animationFrameId) {
        state.animationFrameId = requestAnimationFrame(loop);
    }
}

export function stop() {
    if (!state.isRunning) return;
    state.isRunning = false; // The loop function will see this and stop itself.
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