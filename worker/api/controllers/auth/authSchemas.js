"use strict";
/**
 * Authentication Validation Schemas
 * Zod schemas for validating auth-related requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthProviderSchema = exports.verifyEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.oauthCallbackSchema = exports.registerSchema = exports.loginSchema = void 0;
var zod_1 = require("zod");
var inputValidator_1 = require("../../../utils/inputValidator");
/**
 * Login request schema
 */
exports.loginSchema = zod_1.z.object({
    email: inputValidator_1.commonSchemas.email,
    password: zod_1.z.string().min(1, 'Password is required')
});
/**
 * Registration request schema
 */
exports.registerSchema = zod_1.z.object({
    email: inputValidator_1.commonSchemas.email,
    password: inputValidator_1.commonSchemas.password,
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100).optional()
});
/**
 * OAuth callback schema
 */
exports.oauthCallbackSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Authorization code is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    error: zod_1.z.string().optional(),
    error_description: zod_1.z.string().optional()
});
/**
 * Change password schema
 */
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: inputValidator_1.commonSchemas.password,
    confirmPassword: zod_1.z.string()
}).refine(function (data) { return data.newPassword === data.confirmPassword; }, {
    message: "Passwords don't match",
    path: ['confirmPassword']
});
/**
 * Forgot password schema
 */
exports.forgotPasswordSchema = zod_1.z.object({
    email: inputValidator_1.commonSchemas.email
});
/**
 * Reset password schema
 */
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: inputValidator_1.commonSchemas.password,
    confirmPassword: zod_1.z.string()
}).refine(function (data) { return data.newPassword === data.confirmPassword; }, {
    message: "Passwords don't match",
    path: ['confirmPassword']
});
/**
 * Verify email schema
 */
exports.verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Verification token is required')
});
/**
 * OAuth provider schema
 */
exports.oauthProviderSchema = zod_1.z.enum(['google', 'github']);
