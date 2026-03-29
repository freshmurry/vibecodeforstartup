"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationError = void 0;
/**
 * Utility for consistent error handling in operations
 */
var OperationError = /** @class */ (function () {
    function OperationError() {
    }
    /**
     * Log error and re-throw with consistent format
     */
    OperationError.logAndThrow = function (logger, operation, error) {
        var errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("Error in ".concat(operation, ":"), error);
        throw new Error("".concat(operation, " failed: ").concat(errorMessage));
    };
    /**
     * Log error and return default value instead of throwing
     */
    OperationError.logAndReturn = function (logger, operation, error, defaultValue) {
        var errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("Error in ".concat(operation, ":"), error);
        logger.warn("Returning default value for ".concat(operation, " due to error: ").concat(errorMessage));
        return defaultValue;
    };
    return OperationError;
}());
exports.OperationError = OperationError;
