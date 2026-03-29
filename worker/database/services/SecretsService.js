"use strict";
/**
 * Secrets Service
 * Handles encryption/decryption and management of user API keys and secrets
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.SecretsService = void 0;
var BaseService_1 = require("./BaseService");
var schema = require("../schema");
var drizzle_orm_1 = require("drizzle-orm");
var chacha_js_1 = require("@noble/ciphers/chacha.js");
var secretsTemplates_1 = require("../../types/secretsTemplates");
var SecretsService = /** @class */ (function (_super) {
    __extends(SecretsService, _super);
    function SecretsService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Encrypt a secret value using XChaCha20-Poly1305
     */
    SecretsService.prototype.encryptSecret = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var salt, keyMaterial, nonce, cipher, encoder, data, encrypted, combined, encryptedValue, keyPreview, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.env.SECRETS_ENCRYPTION_KEY) {
                            throw new Error('SECRETS_ENCRYPTION_KEY environment variable not set');
                        }
                        salt = crypto.getRandomValues(new Uint8Array(16));
                        return [4 /*yield*/, this.deriveKey(this.env.SECRETS_ENCRYPTION_KEY, salt)];
                    case 1:
                        keyMaterial = _a.sent();
                        nonce = crypto.getRandomValues(new Uint8Array(24));
                        cipher = (0, chacha_js_1.xchacha20poly1305)(keyMaterial, nonce);
                        encoder = new TextEncoder();
                        data = encoder.encode(value);
                        encrypted = cipher.encrypt(data);
                        combined = new Uint8Array(salt.length + nonce.length + encrypted.length);
                        combined.set(salt, 0);
                        combined.set(nonce, salt.length);
                        combined.set(encrypted, salt.length + nonce.length);
                        encryptedValue = btoa(String.fromCharCode.apply(String, combined));
                        keyPreview = value.length > 8
                            ? "".concat(value.slice(0, 4)).concat('*'.repeat(Math.max(0, value.length - 8))).concat(value.slice(-4))
                            : '*'.repeat(value.length);
                        return [2 /*return*/, { encryptedValue: encryptedValue, keyPreview: keyPreview }];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error encrypting secret:', error_1);
                        throw new Error('Failed to encrypt secret');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Decrypt a secret value
     */
    SecretsService.prototype.decryptSecret = function (encryptedValue) {
        return __awaiter(this, void 0, void 0, function () {
            var combined, salt, nonce, encrypted, keyMaterial, cipher, decrypted, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.env.SECRETS_ENCRYPTION_KEY) {
                            throw new Error('SECRETS_ENCRYPTION_KEY environment variable not set');
                        }
                        combined = new Uint8Array(Array.from(atob(encryptedValue), function (c) { return c.charCodeAt(0); }));
                        salt = combined.slice(0, 16);
                        nonce = combined.slice(16, 40);
                        encrypted = combined.slice(40);
                        return [4 /*yield*/, this.deriveKey(this.env.SECRETS_ENCRYPTION_KEY, salt)];
                    case 1:
                        keyMaterial = _a.sent();
                        cipher = (0, chacha_js_1.xchacha20poly1305)(keyMaterial, nonce);
                        decrypted = cipher.decrypt(encrypted);
                        return [2 /*return*/, new TextDecoder().decode(decrypted)];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error('Error decrypting secret:', error_2);
                        throw new Error('Failed to decrypt secret');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Derive a key using PBKDF2
     */
    SecretsService.prototype.deriveKey = function (password, salt) {
        return __awaiter(this, void 0, void 0, function () {
            var encoder, passwordBuffer, keyMaterial, derivedBits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        encoder = new TextEncoder();
                        passwordBuffer = encoder.encode(password);
                        return [4 /*yield*/, crypto.subtle.importKey('raw', passwordBuffer, { name: 'PBKDF2' }, false, ['deriveBits'])];
                    case 1:
                        keyMaterial = _a.sent();
                        return [4 /*yield*/, crypto.subtle.deriveBits({
                                name: 'PBKDF2',
                                salt: salt,
                                iterations: 100000, // OWASP recommended minimum
                                hash: 'SHA-256'
                            }, keyMaterial, 256 // 32 bytes
                            )];
                    case 2:
                        derivedBits = _a.sent();
                        return [2 /*return*/, new Uint8Array(derivedBits)];
                }
            });
        });
    };
    /**
     * Store a new secret for a user
     */
    SecretsService.prototype.storeSecret = function (_userId, _secretData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // DISABLED: BYOK Disabled for security reasons
                throw new Error('BYOK is not supported for now');
            });
        });
    };
    /**
     * Get all secrets for a user (without decrypted values)
     */
    SecretsService.prototype.getUserSecrets = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var secrets, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.userSecrets)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userSecrets.userId, userId), (0, drizzle_orm_1.eq)(schema.userSecrets.isActive, true)))
                                .orderBy(schema.userSecrets.createdAt)];
                    case 1:
                        secrets = _a.sent();
                        return [2 /*return*/, secrets.map(function (secret) { return _this.formatSecretResponse(secret); })];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error('Failed to get user secrets', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all secrets for a user (both active and inactive)
     */
    SecretsService.prototype.getAllUserSecrets = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var secrets, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.userSecrets)
                                .where((0, drizzle_orm_1.eq)(schema.userSecrets.userId, userId))
                                .orderBy(schema.userSecrets.createdAt)];
                    case 1:
                        secrets = _a.sent();
                        return [2 /*return*/, secrets.map(function (secret) { return _this.formatSecretResponse(secret); })];
                    case 2:
                        error_4 = _a.sent();
                        this.logger.error('Failed to get all user secrets', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get decrypted secret value (for code generation use)
     */
    SecretsService.prototype.getSecretValue = function (userId, secretId) {
        return __awaiter(this, void 0, void 0, function () {
            var secret, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.userSecrets)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userSecrets.id, secretId), (0, drizzle_orm_1.eq)(schema.userSecrets.userId, userId), (0, drizzle_orm_1.eq)(schema.userSecrets.isActive, true)))
                                .get()];
                    case 1:
                        secret = _a.sent();
                        if (!secret) {
                            throw new Error('Secret not found');
                        }
                        // Update last used
                        return [4 /*yield*/, this.database
                                .update(schema.userSecrets)
                                .set({
                                lastUsed: new Date(),
                                usageCount: (secret.usageCount || 0) + 1
                            })
                                .where((0, drizzle_orm_1.eq)(schema.userSecrets.id, secretId))];
                    case 2:
                        // Update last used
                        _a.sent();
                        return [4 /*yield*/, this.decryptSecret(secret.encryptedValue)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_5 = _a.sent();
                        this.logger.error('Failed to get secret value', error_5);
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a secret permanently
     */
    SecretsService.prototype.deleteSecret = function (_userId, _secretId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // DISABLED: BYOK Disabled for security reasons
                throw new Error('BYOK is not supported for now');
            });
        });
    };
    /**
     * Get BYOK (Bring Your Own Key) API keys as a map (provider -> decrypted key)
     */
    SecretsService.prototype.getUserBYOKKeysMap = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var byokTemplates, secrets, keyMap, _loop_1, this_1, _i, byokTemplates_1, template, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        byokTemplates = (0, secretsTemplates_1.getBYOKTemplates)();
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.userSecrets)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userSecrets.userId, userId), (0, drizzle_orm_1.eq)(schema.userSecrets.isActive, true)))];
                    case 1:
                        secrets = _a.sent();
                        keyMap = new Map();
                        _loop_1 = function (template) {
                            var secret, decryptedKey, error_7;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        secret = secrets.find(function (s) { return s.secretType === template.envVarName; });
                                        if (!secret) return [3 /*break*/, 4];
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, this_1.decryptSecret(secret.encryptedValue)];
                                    case 2:
                                        decryptedKey = _b.sent();
                                        keyMap.set(template.provider, decryptedKey);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_7 = _b.sent();
                                        this_1.logger.error("Failed to decrypt BYOK key for provider ".concat(template.provider, ":"), error_7);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, byokTemplates_1 = byokTemplates;
                        _a.label = 2;
                    case 2:
                        if (!(_i < byokTemplates_1.length)) return [3 /*break*/, 5];
                        template = byokTemplates_1[_i];
                        return [5 /*yield**/, _loop_1(template)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        this.logger.info("Loaded ".concat(keyMap.size, " BYOK API keys from secrets system"), { userId: userId });
                        return [2 /*return*/, keyMap];
                    case 6:
                        error_6 = _a.sent();
                        this.logger.error('Failed to get user BYOK keys map', error_6);
                        return [2 /*return*/, new Map()];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Toggle secret active status
     */
    SecretsService.prototype.toggleSecretActiveStatus = function (_userId, _secretId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // DISABLED: BYOK Disabled for security reasons
                throw new Error('BYOK is not supported for now');
            });
        });
    };
    /**
     * Format secret response (remove sensitive data)
     */
    SecretsService.prototype.formatSecretResponse = function (secret) {
        return {
            id: secret.id,
            userId: secret.userId,
            name: secret.name,
            provider: secret.provider,
            secretType: secret.secretType,
            keyPreview: secret.keyPreview,
            description: secret.description,
            expiresAt: secret.expiresAt,
            lastUsed: secret.lastUsed,
            usageCount: secret.usageCount,
            isActive: secret.isActive,
            createdAt: secret.createdAt,
            updatedAt: secret.updatedAt
        };
    };
    return SecretsService;
}(BaseService_1.BaseService));
exports.SecretsService = SecretsService;
