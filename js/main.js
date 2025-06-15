import { state, resetState } from './state.js';
import { techniques } from './techniques/index.js';
import * as ui from './ui.js';
import * as engine from './engine.js';
import { initStarfield } from './animations.js';

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

// Initialize the application
function init() {
    document.addEventListener('DOMContentLoaded', () => {
        // Setup Event Listeners
        ui.techniqueButtons.forEach(button => button.addEventListener('click', handleTechniqueChange));
        ui.startBtn.addEventListener('click', engine.start);
        ui.pauseBtn.addEventListener('click', engine.pause);
        ui.resumeBtn.addEventListener('click', engine.resume);
        ui.stopBtn.addEventListener('click', engine.stop);

        // =======================================================
        // == THIS BLOCK CONTAINS THE FIX FOR THE DESCRIPTION ==
        // =======================================================
        initStarfield();

        // 1. Get the key for the initial technique
        const initialKey = state.currentTechnique;
        
        // 2. Get the corresponding Class from our techniques map
        const InitialTechniqueClass = techniques[initialKey];

        // 3. Create an actual instance of the technique
        const initialInstance = new InitialTechniqueClass();

        // 4. Give this instance to the engine to manage
        engine.setTechnique(initialInstance);
        
        // 5. Reset the UI to its idle state
        ui.resetToIdleState();

        // 6. Now, use the INSTANCE to get the description and update the UI
        ui.setTechnique(initialKey, initialInstance.description);
        // =======================================================
    });
}

init();