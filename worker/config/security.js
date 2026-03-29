"use strict";
/**
 * Centralized Security Configuration
 * Provides comprehensive security settings for Hono middleware
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigurableSecurityDefaults = getConfigurableSecurityDefaults;
exports.getCORSConfig = getCORSConfig;
exports.getCSRFConfig = getCSRFConfig;
exports.getSecureHeadersConfig = getSecureHeadersConfig;
var config_1 = require("../services/rate-limit/config");
function getConfigurableSecurityDefaults() {
    return {
        rateLimit: config_1.DEFAULT_RATE_LIMIT_SETTINGS,
    };
}
/**
 * Get allowed origins based on environment
 */
function getAllowedOrigins(env) {
    var origins = [];
    // Production domains
    if (env.CUSTOM_DOMAIN) {
        origins.push("https://".concat(env.CUSTOM_DOMAIN));
    }
    // Development origins (only in development)
    if (env.ENVIRONMENT === 'dev') {
        origins.push('http://localhost:3000');
        origins.push('http://localhost:5173');
        origins.push('http://127.0.0.1:3000');
        origins.push('http://127.0.0.1:5173');
    }
    return origins;
}
/**
 * CORS Configuration
 * Strict origin validation with environment-aware settings
 */
function getCORSConfig(env) {
    return {
        origin: getAllowedOrigins(env),
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowHeaders: [
            'Content-Type',
            'Authorization',
            'X-Request-ID',
            'X-Session-Token',
            'X-CSRF-Token'
        ],
        exposeHeaders: [
            'X-Request-ID',
            'X-RateLimit-Limit',
            'X-RateLimit-Remaining',
            'X-RateLimit-Reset'
        ],
        maxAge: 86400, // 24 hours
        credentials: true
    };
}
/**
 * CSRF Protection Configuration
 * Double-submit cookie pattern with origin validation
 */
function getCSRFConfig(env) {
    var allowedOrigins = getAllowedOrigins(env);
    return {
        origin: function (origin) {
            // Reject missing origin headers for CSRF protection
            if (!origin)
                return false;
            // Check against allowed origins
            return allowedOrigins.includes(origin);
        },
        tokenTTL: 2 * 60 * 60 * 1000, // 2 hours
        rotateOnAuth: true,
        cookieName: 'csrf-token',
        headerName: 'X-CSRF-Token'
    };
}
/**
 * Secure Headers Configuration
 * Comprehensive security headers with CSP
 */
function getSecureHeadersConfig(env) {
    var isDevelopment = env.ENVIRONMENT === 'dev';
    return {
        // Content Security Policy - strict by default
        contentSecurityPolicy: {
            defaultSrc: ["'self'"],
            scriptSrc: __spreadArray([
                "'self'",
                // Allow inline scripts with nonce (Hono will add nonce automatically)
                "'strict-dynamic'"
            ], (isDevelopment ? ["'unsafe-eval'"] : []), true),
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // Required for Tailwind CSS
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "data:"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https://avatars.githubusercontent.com", // GitHub avatars
                "https://lh3.googleusercontent.com", // Google avatars
                "https://*.cloudflare.com" // Cloudflare assets
            ],
            connectSrc: [
                "'self'",
                // WebSocket connections
                "ws://localhost:*",
                "wss://localhost:*",
                "wss://".concat(env.CUSTOM_DOMAIN || '*'),
                // API endpoints
                "https://api.github.com",
                "https://api.cloudflare.com"
            ],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            workerSrc: ["'self'", "blob:"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            manifestSrc: ["'self'"],
            upgradeInsecureRequests: !isDevelopment ? [] : undefined
        },
        // Strict Transport Security (HSTS)
        strictTransportSecurity: isDevelopment
            ? undefined // Don't set in development
            : 'max-age=31536000; includeSubDomains; preload',
        // X-Frame-Options - Prevent clickjacking
        xFrameOptions: 'DENY',
        // X-Content-Type-Options - Prevent MIME sniffing
        xContentTypeOptions: 'nosniff',
        // X-XSS-Protection - Legacy XSS protection
        xXssProtection: '1; mode=block',
        // Referrer Policy - Privacy-focused
        referrerPolicy: 'strict-origin-when-cross-origin',
        // Cross-Origin policies
        crossOriginEmbedderPolicy: 'require-corp',
        crossOriginResourcePolicy: 'same-origin',
        crossOriginOpenerPolicy: 'same-origin',
        // Origin Agent Cluster
        originAgentCluster: '?1',
        // X-DNS-Prefetch-Control
        xDnsPrefetchControl: 'off',
        // X-Download-Options - IE specific
        xDownloadOptions: 'noopen',
        // X-Permitted-Cross-Domain-Policies
        xPermittedCrossDomainPolicies: 'none',
        // Permissions Policy - Feature restrictions
        permissionsPolicy: {
            camera: [],
            microphone: [],
            geolocation: [],
            usb: [],
            payment: [],
            magnetometer: [],
            gyroscope: [],
            accelerometer: [],
            autoplay: ['self'],
            fullscreen: ['self'],
            clipboard: ['self']
        }
    };
}
