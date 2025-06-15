// js/audio.js

let audioContext;
let oscillator;
let envelope; // A dedicated gain node for volume envelope control

const LOW_FREQ = 220;  // A3 - A deep, calming note
const HIGH_FREQ = 440; // A4 - An octave higher
const QUICK_FADE = 0.3; // A short, smooth fade for pause/stop

export function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.error("Web Audio API is not supported in this browser");
    }
}

export function startAudio() {
    if (!audioContext) return;
    // FIX for "Second run doesn't work": Clean up any previous instances
    if (oscillator) {
        stopAudio();
    }
    
    if (audioContext.state === 'suspended') audioContext.resume();

    // Create the continuous sound source
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(LOW_FREQ, audioContext.currentTime);

    // Create the volume control envelope
    envelope = audioContext.createGain();
    envelope.gain.setValueAtTime(0, audioContext.currentTime); // Start silent

    // Connect the graph
    oscillator.connect(envelope).connect(audioContext.destination);
    
    oscillator.start();
}

export function stopAudio() {
    if (!envelope || !oscillator) return;

    // Fade out quickly and then stop the source
    envelope.gain.cancelScheduledValues(audioContext.currentTime);
    envelope.gain.linearRampToValueAtTime(0.0001, audioContext.currentTime + QUICK_FADE);
    oscillator.stop(audioContext.currentTime + QUICK_FADE);
    
    oscillator = null;
    envelope = null;
}

// FIX for "Pause button doesn't stop sound"
export function muteAudio() {
    if (!envelope) return;
    // Cancel any future scheduled ramps and fade out now
    envelope.gain.cancelScheduledValues(audioContext.currentTime);
    envelope.gain.linearRampToValueAtTime(0.0001, audioContext.currentTime + QUICK_FADE);
}

// FIX for "Abrupt sound cutoff after inhale"
export function updateAudioPhase(phase) {
    if (!oscillator || !envelope) return;

    const freqParam = oscillator.frequency;
    const gainParam = envelope.gain;
    const now = audioContext.currentTime;
    const duration = phase.duration;

    // Cancel any previously scheduled ramps to start fresh
    freqParam.cancelScheduledValues(now);
    gainParam.cancelScheduledValues(now);

    if (phase.name.includes('In') || phase.name.includes('Out')) {
        // --- This is the "breathing arc" logic ---
        const isUp = phase.name.includes('In');
        const peakVolume = 0.4;
        const peakTime = now + (duration / 2);
        const endTime = now + duration;

        // Schedule pitch ramp for the full duration
        freqParam.linearRampToValueAtTime(isUp ? HIGH_FREQ : LOW_FREQ, endTime);
        
        // Schedule volume to ramp UP to a peak, then DOWN to silence
        gainParam.linearRampToValueAtTime(peakVolume, peakTime);
        gainParam.linearRampToValueAtTime(0.0001, endTime);

    } else if (phase.name.includes('Hold')) {
        // For the hold phase, we ensure it's silent. The previous phase has already
        // scheduled its own fade-out, but this is a safeguard.
        gainParam.linearRampToValueAtTime(0.0001, now + QUICK_FADE);
    }
}