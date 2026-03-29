"use strict";
/**
 * Password Service using Web Crypto API
 * Provides secure password hashing and validation
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
exports.PasswordService = void 0;
var validationUtils_1 = require("./validationUtils");
var logger_1 = require("../logger");
var cryptoUtils_1 = require("./cryptoUtils");
var logger = (0, logger_1.createLogger)('PasswordService');
/**
 * Password Service for secure password operations
 * Uses PBKDF2 with Web Crypto API (since Argon2 is not available in Workers)
 */
var PasswordService = /** @class */ (function () {
    function PasswordService() {
        this.saltLength = 16;
        this.iterations = 100000; // OWASP recommended minimum
        this.keyLength = 32; // 256 bits
    }
    /**
     * Hash a password
     */
    PasswordService.prototype.hash = function (password) {
        return __awaiter(this, void 0, void 0, function () {
            var salt, hash, combined, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        salt = crypto.getRandomValues(new Uint8Array(this.saltLength));
                        return [4 /*yield*/, (0, cryptoUtils_1.pbkdf2)(password, salt, this.iterations, this.keyLength)];
                    case 1:
                        hash = _a.sent();
                        combined = new Uint8Array(salt.length + hash.length);
                        combined.set(salt);
                        combined.set(hash, salt.length);
                        // Encode as base64
                        return [2 /*return*/, btoa(String.fromCharCode.apply(String, combined))];
                    case 2:
                        error_1 = _a.sent();
                        logger.error('Error hashing password', error_1);
                        throw new Error('Failed to hash password');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verify a password against a hash
     */
    PasswordService.prototype.verify = function (password, hashedPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var combined, salt, originalHash, newHash, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        combined = Uint8Array.from(atob(hashedPassword), function (c) { return c.charCodeAt(0); });
                        salt = combined.slice(0, this.saltLength);
                        originalHash = combined.slice(this.saltLength);
                        return [4 /*yield*/, (0, cryptoUtils_1.pbkdf2)(password, salt, this.iterations, this.keyLength)];
                    case 1:
                        newHash = _a.sent();
                        // Compare hashes
                        return [2 /*return*/, (0, cryptoUtils_1.timingSafeEqualBytes)(originalHash, newHash)];
                    case 2:
                        error_2 = _a.sent();
                        logger.error('Error verifying password', error_2);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate password strength using centralized validation
     */
    PasswordService.prototype.validatePassword = function (password, userInfo) {
        return (0, validationUtils_1.validatePassword)(password, undefined, userInfo);
    };
    /**
     * Generate a secure random password
     */
    PasswordService.prototype.generatePassword = function (length) {
        if (length === void 0) { length = 16; }
        var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        var values = crypto.getRandomValues(new Uint8Array(length));
        var password = '';
        for (var i = 0; i < length; i++) {
            password += charset[values[i] % charset.length];
        }
        return password;
    };
    return PasswordService;
}());
exports.PasswordService = PasswordService;
