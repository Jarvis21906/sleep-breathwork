// This class is a blueprint. It's not meant to be used directly.
export class BaseTechnique {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.cycleCount = 0;
        this.isRunning = false;
        this.isPaused = false;
    }

    // This method will be called on every frame by the engine
    update(deltaTime) {
        // Each child class MUST implement this method
        throw new Error("Update method must be implemented by subclass");
    }

    // Returns the current state for the UI to display
    getUIState() {
        // Each child class MUST implement this method
        throw new Error("getUIState method must be implemented by subclass");
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.cycleCount = 0;
    }

    stop() {
        this.isRunning = false;
    }

    pause() {
        if (this.isRunning) this.isPaused = true;
    }

    resume() {
        if (this.isRunning) this.isPaused = false;
    }
}