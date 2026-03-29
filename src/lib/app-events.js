/**
 * Simple event system for app-related events
 * Allows different parts of the app to communicate about app state changes
 */
class AppEventEmitter {
    listeners = new Map();
    on(eventType, listener) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(listener);
        // Return cleanup function
        return () => {
            this.listeners.get(eventType)?.delete(listener);
        };
    }
    emit(event) {
        const listeners = this.listeners.get(event.type);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(event);
                }
                catch (error) {
                    console.error('Error in app event listener:', error);
                }
            });
        }
    }
    // Convenience methods
    emitAppDeleted(appId) {
        this.emit({ type: 'app-deleted', appId });
    }
    emitAppCreated(appId, data) {
        this.emit({ type: 'app-created', appId, data });
    }
    emitAppUpdated(appId, data) {
        this.emit({ type: 'app-updated', appId, data });
    }
}
// Export singleton instance
export const appEvents = new AppEventEmitter();
