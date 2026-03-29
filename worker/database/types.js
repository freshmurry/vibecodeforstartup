"use strict";
/**
 * Centralized Database Types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isErrorWithMessage = isErrorWithMessage;
/**
 * Type guard to check if error is an object with message
 */
function isErrorWithMessage(error) {
    return (typeof error === 'object' &&
        error !== null &&
        ('message' in error || ('error' in error && typeof error.error === 'object')));
}
