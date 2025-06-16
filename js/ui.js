// js/ui.js

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

export function updateGlow(phase, progress) {
    if (!breathingCircle) return;

    if (phase.name.includes('In') || phase.name.includes('Out')) {
        const glowProgress = progress / 100;
        const maxBlur = 40;
        const maxAlpha = 0.3;
        const currentBlur = maxBlur * glowProgress;
        const currentAlpha = maxAlpha * glowProgress;
        breathingCircle.style.boxShadow = `0 0 ${currentBlur}px rgba(167, 119, 227, ${currentAlpha})`;
    } else {
        breathingCircle.style.boxShadow = 'none';
    }
}

export function updatePhase(phase) {
    breathingCircle.style.transition = 'transform 4s ease-in-out';
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
    const currentTransform = getComputedStyle(breathingCircle).transform;
    breathingCircle.style.transition = 'none';
    breathingCircle.style.transform = currentTransform;

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
    breathingCircle.style.boxShadow = 'none';
    breathingCircle.style.transition = 'none';
    breathingCircle.style.transform = 'scale(1)';
    setTimeout(() => {
        breathingCircle.style.transition = 'transform 4s ease-in-out';
    }, 20);

    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.add('hidden');
    stopBtn.classList.add('hidden');

    phaseText.textContent = '';
    updateCycleCount(0);
    updateProgressBar(0);
    breathingCircle.classList.remove('animating');
}