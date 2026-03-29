"use strict";
/**
 * CSRF Protection Service
 * Implements double-submit cookie pattern for CSRF protection
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsrfService = void 0;
var logger_1 = require("../../logger");
var errors_1 = require("../../../shared/types/errors");
var cryptoUtils_1 = require("../../utils/cryptoUtils");
var authUtils_1 = require("../../utils/authUtils");
var security_1 = require("../../config/security");
var sentry_1 = require("../../observability/sentry");
var logger = (0, logger_1.createLogger)('CsrfService');
var CsrfService = /** @class */ (function () {
    function CsrfService() {
    }
    /**
     * Get CSRF config for the given environment
     */
    CsrfService.getConfig = function (env) {
        return (0, security_1.getCSRFConfig)(env);
    };
    /**
     * Generate a cryptographically secure CSRF token
     */
    CsrfService.generateToken = function () {
        return (0, cryptoUtils_1.generateSecureToken)(32);
    };
    /**
     * Set CSRF token cookie with timestamp
     */
    CsrfService.setTokenCookie = function (response, token, env, maxAge) {
        var config = this.getConfig(env);
        var tokenData = {
            token: token,
            timestamp: Date.now()
        };
        var cookie = (0, authUtils_1.createSecureCookie)({
            name: this.COOKIE_NAME,
            value: JSON.stringify(tokenData),
            sameSite: 'Strict',
            maxAge: maxAge || Math.floor(config.tokenTTL / 1000)
        });
        response.headers.append('Set-Cookie', cookie);
    };
    /**
     * Extract CSRF token from cookies with validation
     */
    CsrfService.getTokenFromCookie = function (request, env) {
        var config = this.getConfig(env);
        var cookieHeader = request.headers.get('Cookie');
        if (!cookieHeader)
            return null;
        var cookies = (0, authUtils_1.parseCookies)(cookieHeader);
        var cookieValue = cookies[this.COOKIE_NAME];
        if (!cookieValue)
            return null;
        try {
            var tokenData = JSON.parse(cookieValue);
            var now = Date.now();
            var tokenAge = now - tokenData.timestamp;
            if (tokenAge > config.tokenTTL) {
                logger.debug('CSRF token expired', {
                    tokenAge: tokenAge,
                    maxAge: config.tokenTTL
                });
                return null;
            }
            return tokenData.token;
        }
        catch (error) {
            // Handle legacy tokens (plain string) for backward compatibility
            if (typeof cookieValue === 'string' && cookieValue.length > 0) {
                logger.debug('Using legacy CSRF token format');
                return cookieValue;
            }
            logger.warn('Invalid CSRF token format', error);
            return null;
        }
    };
    /**
     * Extract CSRF token from request header
     */
    CsrfService.getTokenFromHeader = function (request) {
        return request.headers.get(this.HEADER_NAME);
    };
    /**
     * Validate CSRF token (double-submit cookie pattern)
     */
    CsrfService.validateToken = function (request, env) {
        var _a, _b;
        var method = request.method.toUpperCase();
        // Skip validation for safe methods
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            return true;
        }
        // Skip for WebSocket upgrades
        var upgradeHeader = request.headers.get('upgrade');
        if ((upgradeHeader === null || upgradeHeader === void 0 ? void 0 : upgradeHeader.toLowerCase()) === 'websocket') {
            return true;
        }
        var cookieToken = this.getTokenFromCookie(request, env);
        var headerToken = this.getTokenFromHeader(request);
        // Both tokens must exist and match
        if (!cookieToken || !headerToken) {
            logger.warn('CSRF validation failed: missing token', {
                hasCookie: !!cookieToken,
                hasHeader: !!headerToken,
                method: method,
                path: new URL(request.url).pathname,
                userAgent: (_a = request.headers.get('User-Agent')) === null || _a === void 0 ? void 0 : _a.substring(0, 100),
                origin: request.headers.get('Origin'),
                referer: request.headers.get('Referer')
            });
            (0, sentry_1.captureSecurityEvent)('csrf_violation', {
                reason: 'missing_token',
                hasCookie: !!cookieToken,
                hasHeader: !!headerToken,
                method: method,
                path: new URL(request.url).pathname,
                origin: request.headers.get('Origin'),
                referer: request.headers.get('Referer'),
            });
            return false;
        }
        if (cookieToken !== headerToken) {
            logger.warn('CSRF validation failed: token mismatch', {
                method: method,
                path: new URL(request.url).pathname,
                userAgent: (_b = request.headers.get('User-Agent')) === null || _b === void 0 ? void 0 : _b.substring(0, 100),
                origin: request.headers.get('Origin'),
                referer: request.headers.get('Referer'),
                cookieTokenPrefix: cookieToken.substring(0, 8),
                headerTokenPrefix: headerToken.substring(0, 8)
            });
            (0, sentry_1.captureSecurityEvent)('csrf_violation', {
                reason: 'token_mismatch',
                method: method,
                path: new URL(request.url).pathname,
                origin: request.headers.get('Origin'),
                referer: request.headers.get('Referer'),
                cookieTokenPrefix: cookieToken.substring(0, 8),
                headerTokenPrefix: headerToken.substring(0, 8)
            });
            return false;
        }
        logger.debug('CSRF validation successful', {
            method: method,
            path: new URL(request.url).pathname
        });
        return true;
    };
    /**
     * Middleware to enforce CSRF protection with configuration
     */
    CsrfService.enforce = function (request, env, response) {
        return __awaiter(this, void 0, void 0, function () {
            var existingToken, newToken;
            return __generator(this, function (_a) {
                // Generate and set token for GET requests (to establish cookie)
                if (request.method === 'GET' && response) {
                    existingToken = this.getTokenFromCookie(request, env);
                    if (!existingToken) {
                        newToken = this.generateToken();
                        this.setTokenCookie(response, newToken, env);
                        logger.debug('New CSRF token generated for GET request');
                    }
                    return [2 /*return*/];
                }
                // Validate token for state-changing requests
                if (!this.validateToken(request, env)) {
                    throw new errors_1.SecurityError(errors_1.SecurityErrorType.CSRF_VIOLATION, 'CSRF token validation failed', 403);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get or generate CSRF token for a request with proper rotation
     */
    CsrfService.getOrGenerateToken = function (request, env, forceNew) {
        if (forceNew === void 0) { forceNew = false; }
        if (forceNew) {
            var newToken_1 = this.generateToken();
            logger.debug('Forced generation of new CSRF token');
            return newToken_1;
        }
        var existingToken = this.getTokenFromCookie(request, env);
        if (existingToken) {
            logger.debug('Using existing valid CSRF token');
            return existingToken;
        }
        var newToken = this.generateToken();
        logger.debug('Generated new CSRF token due to missing/expired token');
        return newToken;
    };
    /**
     * Rotate CSRF token (generate new token and invalidate old one)
     */
    CsrfService.rotateToken = function (response, env) {
        var newToken = this.generateToken();
        this.setTokenCookie(response, newToken, env);
        logger.info('CSRF token rotated');
        return newToken;
    };
    /**
     * Clear CSRF token cookie
     */
    CsrfService.clearTokenCookie = function (response) {
        var cookie = (0, authUtils_1.createSecureCookie)({
            name: this.COOKIE_NAME,
            value: '',
            sameSite: 'Strict',
            maxAge: 0
        });
        response.headers.append('Set-Cookie', cookie);
    };
    CsrfService.COOKIE_NAME = 'csrf-token';
    CsrfService.HEADER_NAME = 'X-CSRF-Token';
    return CsrfService;
}());
exports.CsrfService = CsrfService;
