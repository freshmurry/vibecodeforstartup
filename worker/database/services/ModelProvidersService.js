"use strict";
/**
 * Model Providers Service
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.ModelProvidersService = void 0;
var BaseService_1 = require("./BaseService");
var schema = require("../schema");
var drizzle_orm_1 = require("drizzle-orm");
var idGenerator_1 = require("../../utils/idGenerator");
var ModelProvidersService = /** @class */ (function (_super) {
    __extends(ModelProvidersService, _super);
    function ModelProvidersService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Check if provider name exists for user
     */
    ModelProvidersService.prototype.providerExists = function (userId, name) {
        return __awaiter(this, void 0, void 0, function () {
            var existing;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema.userModelProviders)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userModelProviders.userId, userId), (0, drizzle_orm_1.eq)(schema.userModelProviders.name, name)))
                            .get()];
                    case 1:
                        existing = _a.sent();
                        return [2 /*return*/, !!existing];
                }
            });
        });
    };
    /**
     * Create a new model provider
     */
    ModelProvidersService.prototype.createProvider = function (userId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var providerId, provider, created;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        providerId = (0, idGenerator_1.generateId)();
                        provider = {
                            id: providerId,
                            userId: userId,
                            name: data.name,
                            baseUrl: data.baseUrl,
                            secretId: data.secretId,
                            isActive: true,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        return [4 /*yield*/, this.database
                                .insert(schema.userModelProviders)
                                .values(provider)
                                .returning()];
                    case 1:
                        created = (_a.sent())[0];
                        return [2 /*return*/, created];
                }
            });
        });
    };
    /**
     * Get all providers for a user
     */
    ModelProvidersService.prototype.getUserProviders = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema.userModelProviders)
                            .where((0, drizzle_orm_1.eq)(schema.userModelProviders.userId, userId))
                            .all()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get a specific provider by ID
     */
    ModelProvidersService.prototype.getProvider = function (userId, providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema.userModelProviders)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userModelProviders.id, providerId), (0, drizzle_orm_1.eq)(schema.userModelProviders.userId, userId)))
                            .get()];
                    case 1:
                        provider = _a.sent();
                        return [2 /*return*/, provider || null];
                }
            });
        });
    };
    /**
     * Get a provider by name
     */
    ModelProvidersService.prototype.getProviderByName = function (userId, name) {
        return __awaiter(this, void 0, void 0, function () {
            var provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema.userModelProviders)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userModelProviders.userId, userId), (0, drizzle_orm_1.eq)(schema.userModelProviders.name, name)))
                            .get()];
                    case 1:
                        provider = _a.sent();
                        return [2 /*return*/, provider || null];
                }
            });
        });
    };
    /**
     * Update a provider
     */
    ModelProvidersService.prototype.updateProvider = function (userId, providerId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, updated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateData = __assign(__assign({}, data), { updatedAt: new Date() });
                        return [4 /*yield*/, this.database
                                .update(schema.userModelProviders)
                                .set(updateData)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userModelProviders.id, providerId), (0, drizzle_orm_1.eq)(schema.userModelProviders.userId, userId)))
                                .returning()];
                    case 1:
                        updated = (_a.sent())[0];
                        return [2 /*return*/, updated || null];
                }
            });
        });
    };
    /**
     * Delete a provider
     */
    ModelProvidersService.prototype.deleteProvider = function (userId, providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .delete(schema.userModelProviders)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.userModelProviders.id, providerId), (0, drizzle_orm_1.eq)(schema.userModelProviders.userId, userId)))
                            .returning()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length > 0];
                }
            });
        });
    };
    /**
     * Toggle provider active status
     */
    ModelProvidersService.prototype.toggleProviderStatus = function (userId, providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getProvider(userId, providerId)];
                    case 1:
                        provider = _a.sent();
                        if (!provider) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.updateProvider(userId, providerId, {
                                isActive: !provider.isActive
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get provider count for user
     */
    ModelProvidersService.prototype.getProviderCount = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select({ count: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                            .from(schema.userModelProviders)
                            .where((0, drizzle_orm_1.eq)(schema.userModelProviders.userId, userId))
                            .get()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, (result === null || result === void 0 ? void 0 : result.count) || 0];
                }
            });
        });
    };
    return ModelProvidersService;
}(BaseService_1.BaseService));
exports.ModelProvidersService = ModelProvidersService;
var templateObject_1;
