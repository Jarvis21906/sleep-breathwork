// js/state.js

export let state = {
    currentTechnique: '4-7-8',
    isRunning: false,
    isPaused: false,
    cycleCount: 0,
    currentPhaseIndex: 0,
    timeInPhase: 0,
    animationFrameId: null,
    lastTimestamp: 0
};

export function resetState(technique = '4-7-8') {
    state.currentTechnique = technique;
    state.isRunning = false;
    state.isPaused = false;
    state.cycleCount = 0;
    state.currentPhaseIndex = 0;
    state.timeInPhase = 0;
    state.animationFrameId = null;
    state.lastTimestamp = 0;
}