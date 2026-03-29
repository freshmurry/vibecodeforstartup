"use strict";
/**
 * ID Generation Utility
 * Simple wrapper around crypto.randomUUID() for consistent ID generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
function generateId() {
    return crypto.randomUUID();
}
