// js/audio.js

let audioContext;
let currentOscillator = null;

const LOW_FREQ = 220;
const HIGH_FREQ = 440;
const QUICK_FADE = 0.2;

export function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.error("Web Audio API is not supported in this browser");
    }
}

// This function is for ABRUPT stops only (pause/stop buttons)
export function stopAllAudio() {
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
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // --- THE DEFINITIVE FIX ---
    // The redundant `stopAllAudio()` call has been REMOVED from here.
    // We let the previous sound finish its own graceful, pre-scheduled fade-out.
    // We only create a new sound if the phase requires it.
    // --------------------------

    if (phase.name.includes('In') || phase.name.includes('Out')) {
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
        // This sound is now perfectly self-destructing.
        oscillator.stop(endTime + 0.1); 

        currentOscillator = { source: oscillator, envelope: envelope };
    }
}