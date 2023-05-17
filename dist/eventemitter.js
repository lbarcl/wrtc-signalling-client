export class EventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(eventName, listener) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(listener);
    }
    off(eventName, listener) {
        if (this.listeners[eventName]) {
            this.listeners[eventName] = this.listeners[eventName].filter((l) => l !== listener);
        }
    }
    emit(eventName, data) {
        const event = {
            name: eventName,
            data: data,
        };
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach((listener) => listener(event));
        }
    }
}
