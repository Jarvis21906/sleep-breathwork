import { state, resetState } from './state.js';
import { techniques } from './techniques/index.js';
import * as ui from './ui.js';
import * as engine from './engine.js';
import { initStarfield } from './animations.js';
import { initAudio } from './audio.js';

function handleTechniqueChange(e) {
    const selectedKey = e.target.dataset.technique;
    if (selectedKey === state.currentTechnique) return;
    
    if (state.isRunning) {
        engine.stop();
    }
    resetState(selectedKey);

    const TechniqueClass = techniques[selectedKey];
    const newTechniqueInstance = new TechniqueClass();
    engine.setTechnique(newTechniqueInstance);
    
    ui.setTechnique(selectedKey, newTechniqueInstance.description);
    ui.resetToIdleState();
}

function handleStartClick() {
    initAudio();
    engine.start();
}

function init() {
    document.addEventListener('DOMContentLoaded', () => {
        // Setup Event Listeners
        ui.techniqueButtons.forEach(button => button.addEventListener('click', handleTechniqueChange));
        ui.startBtn.addEventListener('click', handleStartClick);
        ui.pauseBtn.addEventListener('click', engine.pause);
        ui.resumeBtn.addEventListener('click', engine.resume);
        ui.stopBtn.addEventListener('click', engine.stop);
        
        initStarfield();

        const initialKey = state.currentTechnique;
        const InitialTechniqueClass = techniques[initialKey];
        const initialInstance = new InitialTechniqueClass();

        engine.setTechnique(initialInstance);
        ui.resetToIdleState();

        // === FIX: Using the INSTANCE to get the description, not the prototype ===
        ui.setTechnique(initialKey, initialInstance.description);
        // ========================================================================
    });
}

init();