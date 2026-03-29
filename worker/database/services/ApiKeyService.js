"use strict";
/**
 * API Key Service
 * Handles all API key-related database operations
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
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.ApiKeyService = void 0;
var BaseService_1 = require("./BaseService");
var schema = require("../schema");
var drizzle_orm_1 = require("drizzle-orm");
var idGenerator_1 = require("../../utils/idGenerator");
var logger_1 = require("../../logger");
var logger = (0, logger_1.createLogger)('ApiKeyService');
/**
 * API Key Service for managing API keys
 */
var ApiKeyService = /** @class */ (function (_super) {
    __extends(ApiKeyService, _super);
    function ApiKeyService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Get all API keys for a user
     */
    ApiKeyService.prototype.getUserApiKeys = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.database
                                .select({
                                id: schema.apiKeys.id,
                                name: schema.apiKeys.name,
                                keyPreview: schema.apiKeys.keyPreview,
                                createdAt: schema.apiKeys.createdAt,
                                lastUsed: schema.apiKeys.lastUsed,
                                isActive: schema.apiKeys.isActive
                            })
                                .from(schema.apiKeys)
                                .where((0, drizzle_orm_1.eq)(schema.apiKeys.userId, userId))
                                .orderBy((0, drizzle_orm_1.desc)(schema.apiKeys.createdAt))
                                .all()];
                    case 1:
                        keys = _a.sent();
                        return [2 /*return*/, keys];
                    case 2:
                        error_1 = _a.sent();
                        logger.error('Error fetching user API keys', error_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new API key
     */
    ApiKeyService.prototype.createApiKey = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var keyId, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        keyId = (0, idGenerator_1.generateId)();
                        return [4 /*yield*/, this.database.insert(schema.apiKeys).values({
                                id: keyId,
                                userId: data.userId,
                                name: data.name,
                                keyHash: data.keyHash,
                                keyPreview: data.keyPreview,
                                scopes: JSON.stringify([]),
                                createdAt: new Date(),
                                updatedAt: new Date(),
                                isActive: true
                            })];
                    case 1:
                        _a.sent();
                        logger.info('API key created', { keyId: keyId, userId: data.userId });
                        return [2 /*return*/, keyId];
                    case 2:
                        error_2 = _a.sent();
                        logger.error('Error creating API key', error_2);
                        throw new Error('Failed to create API key');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Revoke an API key
     */
    ApiKeyService.prototype.revokeApiKey = function (keyId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.database
                                .update(schema.apiKeys)
                                .set({
                                isActive: false,
                                updatedAt: new Date()
                            })
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.apiKeys.id, keyId), (0, drizzle_orm_1.eq)(schema.apiKeys.userId, userId)))];
                    case 1:
                        _a.sent();
                        logger.info('API key revoked', { keyId: keyId, userId: userId });
                        return [2 /*return*/, true];
                    case 2:
                        error_3 = _a.sent();
                        logger.error('Error revoking API key', error_3);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find API key by hash
     */
    ApiKeyService.prototype.findApiKeyByHash = function (keyHash) {
        return __awaiter(this, void 0, void 0, function () {
            var key, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.apiKeys)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.apiKeys.keyHash, keyHash), (0, drizzle_orm_1.eq)(schema.apiKeys.isActive, true)))
                                .get()];
                    case 1:
                        key = _a.sent();
                        return [2 /*return*/, key || null];
                    case 2:
                        error_4 = _a.sent();
                        logger.error('Error finding API key by hash', error_4);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update API key last used time
     */
    ApiKeyService.prototype.updateApiKeyLastUsed = function (keyId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.database
                                .update(schema.apiKeys)
                                .set({
                                lastUsed: new Date(),
                                updatedAt: new Date()
                            })
                                .where((0, drizzle_orm_1.eq)(schema.apiKeys.id, keyId))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        logger.error('Error updating API key last used', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if API key name is unique for user
     */
    ApiKeyService.prototype.isApiKeyNameUnique = function (userId, name) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.database
                                .select({ id: schema.apiKeys.id })
                                .from(schema.apiKeys)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.apiKeys.userId, userId), (0, drizzle_orm_1.eq)(schema.apiKeys.name, name), (0, drizzle_orm_1.eq)(schema.apiKeys.isActive, true)))
                                .get()];
                    case 1:
                        existing = _a.sent();
                        return [2 /*return*/, !existing];
                    case 2:
                        error_6 = _a.sent();
                        logger.error('Error checking API key name uniqueness', error_6);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get active API key count for user
     */
    ApiKeyService.prototype.getActiveApiKeyCount = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.database
                                .select({ count: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["COUNT(*)"], ["COUNT(*)"]))) })
                                .from(schema.apiKeys)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.apiKeys.userId, userId), (0, drizzle_orm_1.eq)(schema.apiKeys.isActive, true)))
                                .get()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, Number(result === null || result === void 0 ? void 0 : result.count) || 0];
                    case 2:
                        error_7 = _a.sent();
                        logger.error('Error counting active API keys', error_7);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ApiKeyService;
}(BaseService_1.BaseService));
exports.ApiKeyService = ApiKeyService;
var templateObject_1;
