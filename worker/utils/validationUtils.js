"use strict";
/**
 * Centralized Validation Utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = validateEmail;
exports.validatePassword = validatePassword;
exports.validateUsername = validateUsername;
var zod_1 = require("zod");
/**
 * Default email validation configuration
 */
var DEFAULT_EMAIL_CONFIG = {
    allowPlusAddressing: true,
    allowInternational: true,
    maxLength: 254, // RFC 5321 limit
    blockedDomains: ['10minutemail.com', 'tempmail.org'], // Add known temp email domains
};
/**
 * Comprehensive email validation
 */
function validateEmail(email, config) {
    var _a, _b;
    if (config === void 0) { config = DEFAULT_EMAIL_CONFIG; }
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email is required' };
    }
    // Length check
    var maxLength = config.maxLength || DEFAULT_EMAIL_CONFIG.maxLength;
    if (email.length > maxLength) {
        return {
            valid: false,
            error: "Email must be less than ".concat(maxLength, " characters"),
        };
    }
    // Basic format validation
    var emailRegex = config.allowInternational
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic international-friendly regex
        : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // ASCII only
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' };
    }
    // Domain validation
    var domain = (_a = email.split('@')[1]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if ((_b = config.blockedDomains) === null || _b === void 0 ? void 0 : _b.includes(domain)) {
        return { valid: false, error: 'Email domain is not allowed' };
    }
    // Plus addressing check (if disabled)
    if (!config.allowPlusAddressing && email.includes('+')) {
        return { valid: false, error: 'Plus addressing is not allowed' };
    }
    return { valid: true };
}
/**
 * Zod schema for password validation
 */
var passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');
/**
 * Password validation using Zod
 */
function validatePassword(password, _config, _userInfo) {
    if (!password || typeof password !== 'string') {
        return {
            valid: false,
            errors: ['Password is required'],
            score: 0,
            requirements: {
                minLength: false,
                hasLowercase: false,
                hasUppercase: false,
                hasNumbers: false,
                hasSpecialChars: false,
                notCommon: false,
                noSequential: false,
            },
        };
    }
    var result = passwordSchema.safeParse(password);
    var requirements = {
        minLength: password.length >= 8,
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumbers: /[0-9]/.test(password),
        hasSpecialChars: /[^a-zA-Z0-9]/.test(password),
        notCommon: true,
        noSequential: true,
    };
    // Calculate score based on strength
    var score = 0;
    if (requirements.minLength)
        score++;
    if (requirements.hasLowercase && requirements.hasUppercase)
        score++;
    if (requirements.hasNumbers)
        score++;
    if (requirements.hasSpecialChars)
        score++;
    if (password.length >= 12)
        score = Math.min(4, score + 1);
    // Generate suggestions
    var suggestions = [];
    if (password.length < 12) {
        suggestions.push('Use at least 12 characters for better security');
    }
    if (!requirements.hasSpecialChars) {
        suggestions.push('Add special characters for enhanced security');
    }
    if (!result.success) {
        return {
            valid: false,
            errors: result.error.errors.map(function (e) { return e.message; }),
            score: score,
            requirements: requirements,
            suggestions: suggestions.length > 0 ? suggestions : undefined,
        };
    }
    return {
        valid: true,
        score: score,
        requirements: requirements,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
}
/**
 * Validate username format
 */
function validateUsername(username, config) {
    var _a = config || {}, _b = _a.minLength, minLength = _b === void 0 ? 3 : _b, _c = _a.maxLength, maxLength = _c === void 0 ? 30 : _c, _d = _a.allowSpecialChars, allowSpecialChars = _d === void 0 ? false : _d, _e = _a.reservedNames, reservedNames = _e === void 0 ? ['admin', 'root', 'api', 'www', 'mail', 'support'] : _e;
    if (!username || typeof username !== 'string') {
        return { valid: false, error: 'Username is required' };
    }
    if (username.length < minLength) {
        return {
            valid: false,
            error: "Username must be at least ".concat(minLength, " characters"),
        };
    }
    if (username.length > maxLength) {
        return {
            valid: false,
            error: "Username must be less than ".concat(maxLength, " characters"),
        };
    }
    // Format validation
    var validPattern = allowSpecialChars
        ? /^[a-zA-Z0-9_.-]+$/
        : /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(username)) {
        return {
            valid: false,
            error: allowSpecialChars
                ? 'Username can only contain letters, numbers, underscores, dots, and hyphens'
                : 'Username can only contain letters, numbers, and underscores',
        };
    }
    // Reserved names check
    if (reservedNames.includes(username.toLowerCase())) {
        return { valid: false, error: 'Username is reserved' };
    }
    // Must start with letter or number
    if (!/^[a-zA-Z0-9]/.test(username)) {
        return {
            valid: false,
            error: 'Username must start with a letter or number',
        };
    }
    return { valid: true };
}
