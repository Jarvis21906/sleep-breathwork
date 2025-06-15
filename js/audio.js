// js/audio.js

let audioContext;
let oscillator;
let envelope; // Volume control envelope

const LOW_FREQ = 220;
const HIGH_FREQ = 440;
const QUICK_FADE = 0.3;

// FIX for Mobile Audio: The init function is now more robust.
export function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // --- The "Silent Sound" Unlock Technique ---
        // This is the most reliable way to unlock audio on mobile.
        // It must be called from within a user-initiated event (like our 'start' button click).
        const buffer = audioContext.createBuffer(1, 1, 22050); // 1 frame, tiny buffer
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0); // Play immediately
        // --- End of Unlock Technique ---

    } catch (e) {
        console.error("Web Audio API is not supported in this browser");
    }
}

export function startAudio() {
    if (!audioContext) return;
    if (oscillator) stopAudio();
    
    // Resume context if it was suspended (important for robustness)
    if (audioContext.state === 'suspended') audioContext.resume();

    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(LOW_FREQ, audioContext.currentTime);

    envelope = audioContext.createGain();
    envelope.gain.setValueAtTime(0, audioContext.currentTime); // Start silent

    oscillator.connect(envelope).connect(audioContext.destination);
    oscillator.start();
}

export function stopAudio() {
    if (!envelope || !oscillator) return;
    envelope.gain.cancelScheduledValues(audioContext.currentTime);
    envelope.gain.linearRampToValueAtTime(0.0001, audioContext.currentTime + QUICK_FADE);
    oscillator.stop(audioContext.currentTime + QUICK_FADE);
    oscillator = null;
    envelope = null;
}

export function muteAudio() {
    if (!envelope) return;
    envelope.gain.cancelScheduledValues(audioContext.currentTime);
    envelope.gain.linearRampToValueAtTime(0.0001, audioContext.currentTime + QUICK_FADE);
}

export function updateAudioPhase(phase) {
    if (!oscillator || !envelope) return;

    const freqParam = oscillator.frequency;
    const gainParam = envelope.gain;
    const now = audioContext.currentTime;
    const duration = phase.duration;

    freqParam.cancelScheduledValues(now);
    gainParam.cancelScheduledValues(now);

    if (phase.name.includes('In') || phase.name.includes('Out')) {
        const isUp = phase.name.includes('In');
        const peakVolume = 0.4;
        const peakTime = now + (duration / 2);
        const endTime = now + duration;
        
        // FIX for "Tap" Sound: Explicitly set the starting point for the ramp.
        const startFreq = isUp ? LOW_FREQ : HIGH_FREQ;
        const endFreq = isUp ? HIGH_FREQ : LOW_FREQ;
        
        // Set the definitive starting point to prevent a "jump" from a default value.
        freqParam.setValueAtTime(startFreq, now);
        // Then, schedule the ramp from that known point.
        freqParam.linearRampToValueAtTime(endFreq, endTime);
        
        // Do the same for volume to ensure a smooth start from silence.
        gainParam.setValueAtTime(0.0001, now);
        gainParam.linearRampToValueAtTime(peakVolume, peakTime);
        gainParam.linearRampToValueAtTime(0.0001, endTime);

    } else if (phase.name.includes('Hold')) {
        // Ensure silence during hold, as before.
        gainParam.linearRampToValueAtTime(0.0001, now + QUICK_FADE);
    }
}