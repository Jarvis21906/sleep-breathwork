// js/audio.js

let audioContext;
let oscillator;
let envelope;

const LOW_FREQ = 220;
const HIGH_FREQ = 440;
const PEAK_VOLUME = 0.4;
const QUICK_FADE = 0.3;

export function initAudio() {
    if (audioContext) {
        if (audioContext.state === 'suspended') audioContext.resume();
        return;
    }
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { console.error("Web Audio API is not supported in this browser"); }
}

export function startAudio() {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') audioContext.resume();
    if (oscillator) stopAudio();

    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    envelope = audioContext.createGain();
    
    oscillator.connect(envelope).connect(audioContext.destination);
    
    envelope.gain.setValueAtTime(0, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(LOW_FREQ, audioContext.currentTime);
    oscillator.start();
}

export function stopAudio() {
    if (!envelope || !oscillator) return;
    const now = audioContext.currentTime;
    envelope.gain.cancelScheduledValues(now);
    envelope.gain.linearRampToValueAtTime(0.0001, now + QUICK_FADE);
    oscillator.stop(now + QUICK_FADE);
    oscillator.disconnect();
    envelope.disconnect();
    oscillator = null;
    envelope = null;
}

export function muteAudio() {
    if (!envelope) return;
    const now = audioContext.currentTime;
    envelope.gain.cancelScheduledValues(now);
    envelope.gain.linearRampToValueAtTime(0.0001, now + QUICK_FADE);
}

export function updateAudioPhase(phase) {
    if (!oscillator || !envelope) return;

    const freqParam = oscillator.frequency;
    const gainParam = envelope.gain;
    const now = audioContext.currentTime;
    
    freqParam.cancelScheduledValues(now);
    gainParam.cancelScheduledValues(now);

    if (phase.name.includes('In') || phase.name.includes('Out')) {
        const isUp = phase.name.includes('In');
        const startFreq = isUp ? LOW_FREQ : HIGH_FREQ;
        const endFreq = isUp ? HIGH_FREQ : LOW_FREQ;

        gainParam.setValueAtTime(0.0001, now);
        gainParam.linearRampToValueAtTime(PEAK_VOLUME, now + phase.duration);
        freqParam.setValueAtTime(startFreq, now);
        freqParam.linearRampToValueAtTime(endFreq, now + phase.duration);

    } else if (phase.name.includes('Hold')) {
        muteAudio();
    }
}

export function resumeAudio(phase, elapsedTime) {
    if (!oscillator || !envelope) return;

    const freqParam = oscillator.frequency;
    const gainParam = envelope.gain;
    const now = audioContext.currentTime;
    
    freqParam.cancelScheduledValues(now);
    gainParam.cancelScheduledValues(now);

    if (phase.name.includes('In') || phase.name.includes('Out')) {
        const totalDuration = phase.duration;
        let remainingDuration = totalDuration - elapsedTime;
        if (remainingDuration < 0) remainingDuration = 0;

        const progress = elapsedTime / totalDuration;
        const isUp = phase.name.includes('In');
        
        const startFreq = isUp ? LOW_FREQ : HIGH_FREQ;
        const endFreq = isUp ? HIGH_FREQ : LOW_FREQ;
        
        const currentFreq = startFreq + (endFreq - startFreq) * progress;
        const currentVolume = PEAK_VOLUME * progress;

        gainParam.setValueAtTime(currentVolume, now);
        freqParam.setValueAtTime(currentFreq, now);

        gainParam.linearRampToValueAtTime(PEAK_VOLUME, now + remainingDuration);
        freqParam.linearRampToValueAtTime(endFreq, now + remainingDuration);
        
    } else if (phase.name.includes('Hold')) {
        muteAudio();
    }
}