"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWebSocketOrigin = validateWebSocketOrigin;
exports.getWebSocketSecurityHeaders = getWebSocketSecurityHeaders;
var security_1 = require("../../config/security");
var logger_1 = require("../../logger");
var logger = (0, logger_1.createLogger)('WebSocketSecurity');
function validateWebSocketOrigin(request, env) {
    var origin = request.headers.get('Origin');
    if (!origin) {
        logger.warn('WebSocket connection attempt without Origin header');
        return false;
    }
    var corsConfig = (0, security_1.getCORSConfig)(env);
    var allowedOrigins = corsConfig.origin;
    // Handle different origin config types
    if (typeof allowedOrigins === 'string') {
        return origin === allowedOrigins;
    }
    else if (Array.isArray(allowedOrigins)) {
        return allowedOrigins.includes(origin);
    }
    else if (typeof allowedOrigins === 'function') {
        // Create a minimal context for validation
        var context = {};
        var result = allowedOrigins(origin, context);
        return result === origin;
    }
    logger.warn('WebSocket connection rejected from unauthorized origin', { origin: origin });
    return false;
}
function getWebSocketSecurityHeaders() {
    return {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block'
    };
}
