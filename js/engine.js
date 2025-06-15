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
        audio.updateAudioPhase(phase); // This now handles muting for "Hold" automatically
        lastPhaseName = phase.name;
    }

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
    lastPhaseName = '';

    currentTechniqueInstance.start();
    ui.showRunningState();

    audio.startAudio(); // Creates the new audio components

    const initialPhase = currentTechniqueInstance.getUIState().phase;
    audio.updateAudioPhase(initialPhase); // Tell audio what the first phase is
    lastPhaseName = initialPhase.name;
    
    if (!state.animationFrameId) {
        state.animationFrameId = requestAnimationFrame(loop);
    }
}

export function stop() {
    if (!state.isRunning) return;
    state.isRunning = false;
    
    audio.stopAudio(); // Correctly stops and cleans up audio
    
    currentTechniqueInstance.stop();
    ui.resetToIdleState();
}

export function pause() {
    if (!state.isRunning || state.isPaused) return;
    state.isPaused = true;
    
    audio.muteAudio(); // FIX: Mute audio on pause

    currentTechniqueInstance.pause();
    ui.showPausedState();
}

export function resume() {
    if (!state.isRunning || !state.isPaused) return;
    state.isPaused = false;
    
    audio.unmuteAudio(); // FIX: Unmute audio on resume

    currentTechniqueInstance.resume();
    
    // Re-sync the audio ramp to the current phase
    const currentPhase = currentTechniqueInstance.getUIState().phase;
    audio.updateAudioPhase(currentPhase);
    
    ui.showResumedState(currentPhase);
}