import { state, resetState } from './state.js';
import { TECHNIQUES } from './config.js';
import * as ui from './ui.js';
import * as engine from './engine.js';
import { initStarfield } from './animations.js';

function handleTechniqueChange(e) {
    const selectedKey = e.target.dataset.technique;
    if (selectedKey === state.currentTechnique) return;
    
    state.currentTechnique = selectedKey;
    
    ui.setTechnique(selectedKey, TECHNIQUES[selectedKey].description);
    
    if (state.isRunning) {
        engine.stop();
        engine.start();
    } else {
        resetState(selectedKey);
        ui.resetToIdleState();
    }
}

// Initialize the application
function init() {
    document.addEventListener('DOMContentLoaded', () => {
        // Setup Event Listeners
        ui.techniqueButtons.forEach(button => button.addEventListener('click', handleTechniqueChange));
        ui.startBtn.addEventListener('click', engine.start);
        ui.pauseBtn.addEventListener('click', engine.pause);
        ui.resumeBtn.addEventListener('click', engine.resume);
        ui.stopBtn.addEventListener('click', engine.stop);

        // Initial UI setup
        initStarfield();
        ui.resetToIdleState();
        ui.setTechnique(state.currentTechnique, TECHNIQUES[state.currentTechnique].description);
    });
}

init();