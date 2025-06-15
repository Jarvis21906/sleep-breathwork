// js/audio.js

let audioContext;
let oscillator;
let masterGain;
let envelope; // This is the crucial new part: a dedicated gain node for volume control

const LOW_FREQ = 220;
const HIGH_FREQ = 440;
const FADE_TIME = 0.5; // Smooth fade duration for all volume changes

export function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.gain.setValueAtTime(0.3, audioContext.currentTime);
        masterGain.connect(audioContext.destination);
    } catch (e) {
        console.error("Web Audio API is not supported in this browser");
    }
}

export function startAudio() {
    // FIX for "Second run doesn't work": Always create a fresh oscillator and envelope.
    if (oscillator) {
        // If a previous oscillator exists, force stop it before creating a new one.
        stopAudio();
    }
    
    if (!audioContext) return;
    if (audioContext.state === 'suspended') audioContext.resume();

    // 1. Create the sound source (oscillator)
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(LOW_FREQ, audioContext.currentTime);

    // 2. Create the volume envelope
    envelope = audioContext.createGain();
    envelope.gain.setValueAtTime(0, audioContext.currentTime); // Start silent

    // 3. Connect the audio graph: oscillator -> envelope -> master volume -> speakers
    oscillator.connect(envelope);
    envelope.connect(masterGain);
    
    oscillator.start();
}

export function stopAudio() {
    if (!envelope || !oscillator) return;

    // Fade out the envelope, then stop the oscillator completely.
    envelope.gain.linearRampToValueAtTime(0.0001, audioContext.currentTime + FADE_TIME);
    oscillator.stop(audioContext.currentTime + FADE_TIME);
    
    // Mark as cleaned up
    oscillator = null;
    envelope = null;
}

// FIX for "Pause button" and "Hold sound" issues: Smoothly mute the sound
export function muteAudio() {
    if (!envelope) return;
    envelope.gain.linearRampToValueAtTime(0.0001, audioContext.currentTime + FADE_TIME);
}

// FIX for "Pause button" and "Hold sound" issues: Smoothly unmute the sound
export function unmuteAudio() {
    if (!envelope) return;
    envelope.gain.linearRampToValueAtTime(1, audioContext.currentTime + FADE_TIME);
}

// This function now correctly handles all phases
export function updateAudioPhase(phase) {
    if (!oscillator) return;

    const freqParam = oscillator.frequency;
    const now = audioContext.currentTime;
    const duration = phase.duration;

    if (phase.name.includes('In')) {
        unmuteAudio(); // Fade sound in
        freqParam.linearRampToValueAtTime(HIGH_FREQ, now + duration);
    } else if (phase.name.includes('Out')) {
        unmuteAudio(); // Fade sound in
        freqParam.linearRampToValueAtTime(LOW_FREQ, now + duration);
    } else if (phase.name.includes('Hold')) {
        muteAudio(); // Fade sound out for the hold phase
    }
}