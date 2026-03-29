"use strict";
// Crypto utilities for Cloudflare Workers
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
exports.base64url = base64url;
exports.sha256Hash = sha256Hash;
exports.timingSafeEqual = timingSafeEqual;
exports.timingSafeEqualBytes = timingSafeEqualBytes;
exports.generateSecureToken = generateSecureToken;
exports.generateApiKey = generateApiKey;
exports.verifyApiKey = verifyApiKey;
exports.pbkdf2 = pbkdf2;
/**
 * Secure base64url encoding for Cloudflare Workers
 * Prevents stack overflow and encoding corruption with large buffers
 */
function base64url(buffer) {
    // Handle empty buffer
    if (buffer.length === 0) {
        return '';
    }
    // For large buffers, process in chunks to prevent stack overflow
    var CHUNK_SIZE = 8192; // 8KB chunks - safe for all JS engines
    var result = '';
    for (var i = 0; i < buffer.length; i += CHUNK_SIZE) {
        var chunk = buffer.slice(i, i + CHUNK_SIZE);
        var chars = Array.from(chunk, function (byte) { return String.fromCharCode(byte); });
        result += btoa(chars.join(''));
    }
    // Convert to base64url format (URL-safe)
    return result
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
function sha256Hash(text) {
    return __awaiter(this, void 0, void 0, function () {
        var encoder, data, hashBuffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encoder = new TextEncoder();
                    data = encoder.encode(text);
                    return [4 /*yield*/, crypto.subtle.digest('SHA-256', data)];
                case 1:
                    hashBuffer = _a.sent();
                    return [2 /*return*/, base64url(new Uint8Array(hashBuffer))];
            }
        });
    });
}
function timingSafeEqual(a, b) {
    return __awaiter(this, void 0, void 0, function () {
        var encoder, aBuffer, bBuffer;
        return __generator(this, function (_a) {
            encoder = new TextEncoder();
            aBuffer = encoder.encode(a);
            bBuffer = encoder.encode(b);
            if (aBuffer.length !== bBuffer.length) {
                return [2 /*return*/, false];
            }
            return [2 /*return*/, crypto.subtle.timingSafeEqual(aBuffer, bBuffer)];
        });
    });
}
function timingSafeEqualBytes(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return crypto.subtle.timingSafeEqual(a, b);
}
function generateSecureToken(length) {
    if (length === void 0) { length = 32; }
    var array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
}
function generateApiKey() {
    return __awaiter(this, void 0, void 0, function () {
        var keyBytes, key, keyHash, keyPreview;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    keyBytes = new Uint8Array(32);
                    crypto.getRandomValues(keyBytes);
                    key = base64url(keyBytes);
                    return [4 /*yield*/, sha256Hash(key)];
                case 1:
                    keyHash = _a.sent();
                    keyPreview = "".concat(key.slice(0, 8), "...").concat(key.slice(-4));
                    return [2 /*return*/, { key: key, keyHash: keyHash, keyPreview: keyPreview }];
            }
        });
    });
}
function verifyApiKey(providedKey, storedHash) {
    return __awaiter(this, void 0, void 0, function () {
        var providedKeyHash, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, sha256Hash(providedKey)];
                case 1:
                    providedKeyHash = _b.sent();
                    return [4 /*yield*/, timingSafeEqual(providedKeyHash, storedHash)];
                case 2: return [2 /*return*/, _b.sent()];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function pbkdf2(password_1, salt_1) {
    return __awaiter(this, arguments, void 0, function (password, salt, iterations, keyLength) {
        var encoder, passwordKey, derivedBits;
        if (iterations === void 0) { iterations = 100000; }
        if (keyLength === void 0) { keyLength = 32; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encoder = new TextEncoder();
                    return [4 /*yield*/, crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])];
                case 1:
                    passwordKey = _a.sent();
                    return [4 /*yield*/, crypto.subtle.deriveBits({
                            name: 'PBKDF2',
                            salt: salt,
                            iterations: iterations,
                            hash: 'SHA-256'
                        }, passwordKey, keyLength * 8)];
                case 2:
                    derivedBits = _a.sent();
                    return [2 /*return*/, new Uint8Array(derivedBits)];
            }
        });
    });
}
