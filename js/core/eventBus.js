/**
 * EventBus - Centralized event system for loose coupling between components
 */
class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - The name of the event
     * @param {Function} callback - The callback function to execute
     */
    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - The name of the event
     * @param {Function} callback - The callback function to remove
     */
    off(eventName, callback) {
        if (!this.listeners.has(eventName)) return;

        const callbacks = this.listeners.get(eventName);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * Emit an event
     * @param {string} eventName - The name of the event
     * @param {*} data - Data to pass to the callbacks
     */
    emit(eventName, data) {
        if (!this.listeners.has(eventName)) return;

        const callbacks = this.listeners.get(eventName);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
            }
        });
    }

    /**
     * Subscribe to an event only once
     * @param {string} eventName - The name of the event
     * @param {Function} callback - The callback function to execute
     */
    once(eventName, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(eventName, onceCallback);
        };
        this.on(eventName, onceCallback);
    }
}
