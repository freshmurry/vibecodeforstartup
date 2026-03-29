"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdGenerator = void 0;
/**
 * Utility functions for generating unique IDs
 */
var IdGenerator = /** @class */ (function () {
    function IdGenerator() {
    }
    /**
     * Generate a unique conversation ID
     * Format: conv-{timestamp}-{random}
     */
    IdGenerator.generateConversationId = function () {
        return "conv-".concat(Date.now(), "-").concat(Math.random().toString(36).substring(2, 9));
    };
    /**
     * Generate a generic unique ID with custom prefix
     */
    IdGenerator.generateId = function (prefix) {
        if (prefix === void 0) { prefix = 'id'; }
        return "".concat(prefix, "-").concat(Date.now(), "-").concat(Math.random().toString(36).substring(2, 9));
    };
    return IdGenerator;
}());
exports.IdGenerator = IdGenerator;
