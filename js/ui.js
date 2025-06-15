// Export DOM element references
export const breathingCircle = document.getElementById('breathing-circle');
export const phaseText = document.getElementById('phase-text');
export const cycleCounter = document.getElementById('cycle-counter');
export const progressBar = document.getElementById('progress-bar');
export const techniqueButtons = document.querySelectorAll('.technique-buttons button');
export const techniqueDescription = document.getElementById('technique-description');
export const startBtn = document.getElementById('start-btn');
export const resumeBtn = document.getElementById('resume-btn');
export const pauseBtn = document.getElementById('pause-btn');
export const stopBtn = document.getElementById('stop-btn');

// UI Update Functions
export function updatePhase(phase) {
    phaseText.textContent = phase.name;
    breathingCircle.style.transitionDuration = `${phase.duration}s`;

    if (phase.name.includes('In')) {
        breathingCircle.style.transform = 'scale(1.5)';
    } else if (phase.name.includes('Out')) {
        breathingCircle.style.transform = 'scale(1)';
    }
}

export function updateCycleCount(count) {
    cycleCounter.textContent = `Cycles: ${count}`;
}

export function updateProgressBar(progress) {
    progressBar.style.width = `${progress}%`;
}

export function setTechnique(selectedKey, description) {
    techniqueButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.technique === selectedKey);
    });
    techniqueDescription.textContent = description;
}

export function showRunningState() {
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    resumeBtn.classList.remove('hidden');
    stopBtn.classList.remove('hidden');

    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    breathingCircle.classList.add('animating');
}

export function showPausedState() {
    phaseText.textContent = 'Paused';
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
    breathingCircle.classList.remove('animating');
}

export function showResumedState(phase) {
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    breathingCircle.classList.add('animating');
    updatePhase(phase);
}

export function resetToIdleState() {
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.add('hidden');
    stopBtn.classList.add('hidden');

    phaseText.textContent = '';
    updateCycleCount(0);
    updateProgressBar(0);
    breathingCircle.style.transform = 'scale(1)';
    breathingCircle.style.transitionDuration = '4s';
    breathingCircle.classList.remove('animating');
}