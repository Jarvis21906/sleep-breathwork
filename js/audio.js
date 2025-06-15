// js/audio.js

let audioContext;
let currentOscillator = null;

const LOW_FREQ = 220;
const HIGH_FREQ = 440;
const QUICK_FADE = 0.2;

// --- THIS IS THE DEFINITIVE FIX FOR ALL ISSUES ---
// It is both SILENT (no blip) and ACTIVE (unlocks mobile).
export function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // The key to unlocking mobile browsers without a click/pop sound.
        // We check the state, and if it's 'suspended', we resume it immediately.
        // Since this whole function is called by a user click, this is allowed.
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    } catch (e) {
        console.error("Web Audio API is not supported in this browser");
    }
}

function stopAllAudio() {
    if (currentOscillator) {
        const envelope = currentOscillator.envelope;
        envelope.gain.cancelScheduledValues(audioContext.currentTime);
        envelope.gain.linearRampToValueAtTime(0.0001, audioContext.currentTime + QUICK_FADE);
        currentOscillator.source.stop(audioContext.currentTime + QUICK_FADE);
        currentOscillator = null;
    }
}

export function updateAudioPhase(phase) {
    if (!audioContext) return;
    
    // We keep this check as a robust fallback, but initAudio should handle the first unlock.
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // The rest of the logic is correct: let the old sound fade out on its own.
    // Only create a new sound if the phase requires it.
    if (phase.name.includes('In') || phase.name.includes('Out')) {
        // Stop any previous sound immediately before starting a new one. This prevents overlap if the user switches techniques quickly.
        stopAllAudio();
        
        const now = audioContext.currentTime;
        const duration = phase.duration;
        const endTime = now + duration;

        const oscillator = audioContext.createOscillator();
        const envelope = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.connect(envelope).connect(audioContext.destination);
        
        const isUp = phase.name.includes('In');
        const peakVolume = 0.4;
        const peakTime = now + (duration / 2);
        const startFreq = isUp ? LOW_FREQ : HIGH_FREQ;
        const endFreq = isUp ? HIGH_FREQ : LOW_FREQ;
        
        oscillator.frequency.setValueAtTime(startFreq, now);
        oscillator.frequency.linearRampToValueAtTime(endFreq, endTime);
        
        envelope.gain.setValueAtTime(0.0001, now);
        envelope.gain.linearRampToValueAtTime(peakVolume, peakTime);
        envelope.gain.linearRampToValueAtTime(0.0001, endTime);

        oscillator.start(now);
        oscillator.stop(endTime + 0.1);

        currentOscillator = { source: oscillator, envelope: envelope };
    }
}