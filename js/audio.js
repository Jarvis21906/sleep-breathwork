// js/audio.js

let audioContext;
let masterGain;

// This function must be called by a user interaction (e.g., a click)
export function initAudio() {
    if (audioContext) return; // Already initialized

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.gain.setValueAtTime(0.5, audioContext.currentTime); // Set master volume to 50%
        masterGain.connect(audioContext.destination);
    } catch (e) {
        console.error("Web Audio API is not supported in this browser");
    }
}

// A helper function to play a single beep
function playBeep(frequency, duration = 0.2) {
    if (!audioContext) return;
    
    // Resume the context if it was suspended (common in modern browsers)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // Create an Oscillator node (the sound wave)
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // A smooth, clean tone
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Create a Gain node to control the volume envelope (fade out)
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    // Fade the sound out smoothly to avoid a "click"
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    // Connect the nodes: Oscillator -> Gain -> Master Volume -> Speakers
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);

    // Start and stop the sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// --- Public functions to be called by the engine ---

export function playInhaleSound() {
    // A higher, uplifting pitch for inhaling
    playBeep(440.00); // A4 note
}

export function playExhaleSound() {
    // A lower, grounding pitch for exhaling
    playBeep(329.63); // E4 note
}

// Audio management for the Sleep Breathwork app
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.audioBuffers = new Map();
        this.isInitialized = false;
        this.volume = 0.5;
    }

    // Initialize audio context (must be called after user interaction)
    async initialize() {
        try {
            if (this.isInitialized) return;
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.audioContext.resume();
            this.isInitialized = true;
            console.log('Audio context initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            throw error;
        }
    }

    // Load and cache an audio file
    async loadSound(name, filePath) {
        try {
            if (!this.isInitialized) {
                throw new Error('Audio context not initialized. Call initialize() first.');
            }

            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load audio file: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioBuffers.set(name, audioBuffer);
            console.log(`Audio file ${name} loaded successfully`);
        } catch (error) {
            console.error(`Error loading sound ${name}:`, error);
            throw error;
        }
    }

    // Play a loaded sound
    playSound(name) {
        try {
            if (!this.isInitialized) {
                throw new Error('Audio context not initialized. Call initialize() first.');
            }

            const buffer = this.audioBuffers.get(name);
            if (!buffer) {
                throw new Error(`Sound ${name} not loaded. Call loadSound() first.`);
            }

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            gainNode.gain.value = this.volume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start(0);
            return { source, gainNode };
        } catch (error) {
            console.error(`Error playing sound ${name}:`, error);
            throw error;
        }
    }

    // Set volume (0.0 to 1.0)
    setVolume(value) {
        if (value < 0 || value > 1) {
            throw new Error('Volume must be between 0 and 1');
        }
        this.volume = value;
    }

    // Stop all audio playback
    stopAll() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
            this.isInitialized = false;
            this.audioBuffers.clear();
        }
    }
}

// Export the AudioManager class
export default AudioManager;