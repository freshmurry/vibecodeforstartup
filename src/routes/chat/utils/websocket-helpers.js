/**
 * Check if WebSocket is ready for communication
 */
export function isWebSocketReady(websocket) {
    return !!websocket && websocket.readyState === 1; // OPEN state
}
/**
 * Send a message via WebSocket if connection is ready
 */
export function sendWebSocketMessage(websocket, type, data) {
    if (!isWebSocketReady(websocket)) {
        console.warn(`WebSocket not ready for message type: ${type}`);
        return false;
    }
    websocket.send(JSON.stringify({ type, ...data }));
    return true;
}
