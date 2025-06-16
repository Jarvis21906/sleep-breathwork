// js/engine.js

import { state } from './state.js';
import * as ui from './ui.js';
import * as audio from './audio.js';

let currentTechniqueInstance = null;
let lastPhaseName = '';

function loop(timestamp) {
    if (!state.isRunning) {
        if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
        }
        return;
    }
    if (state.isPaused) {
        state.lastTimestamp = timestamp;
        state.animationFrameId = requestAnimationFrame(loop);
        return;
    }
    if (!state.lastTimestamp) state.lastTimestamp = timestamp;

    const deltaTime = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;

    currentTechniqueInstance.update(deltaTime);
    const { phase, progress, cycleCount } = currentTechniqueInstance.getUIState();

    if (phase.name !== lastPhaseName) {
        audio.updateAudioPhase(phase);
        lastPhaseName = phase.name;
    }

    ui.updatePhase(phase);
    ui.updateProgressBar(progress);
    ui.updateCycleCount(cycleCount);
    ui.updateGlow(phase, progress);

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
    lastPhaseName = '';

    currentTechniqueInstance.start();
    ui.showRunningState();
    audio.startAudio();

    const initialPhase = currentTechniqueInstance.getUIState().phase;
    audio.updateAudioPhase(initialPhase);
    lastPhaseName = initialPhase.name;
    
    if (!state.animationFrameId) {
        state.animationFrameId = requestAnimationFrame(loop);
    }
}

export function stop() {
    if (!state.isRunning) return;
    state.isRunning = false;
    audio.stopAudio();
    currentTechniqueInstance.stop();
    ui.resetToIdleState();
}

export function pause() {
    if (!state.isRunning || state.isPaused) return;
    state.isPaused = true;
    audio.muteAudio();
    currentTechniqueInstance.pause();
    ui.showPausedState();
}

export function resume() {
    if (!state.isRunning || !state.isPaused) return;
    state.isPaused = false;
    currentTechniqueInstance.resume();
    
    const currentPhase = currentTechniqueInstance.getUIState().phase;
    const elapsedTime = currentTechniqueInstance.timeInPhase;
    audio.resumeAudio(currentPhase, elapsedTime);
    
    ui.showResumedState(currentPhase);
}