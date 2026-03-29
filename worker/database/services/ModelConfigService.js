"use strict";
/**
 * Model Configuration Service
 * Handles CRUD operations for user model configurations
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
exports.ModelConfigService = void 0;
var BaseService_1 = require("./BaseService");
var schema_1 = require("../schema");
var drizzle_orm_1 = require("drizzle-orm");
var config_1 = require("../../agents/inferutils/config");
var idGenerator_1 = require("../../utils/idGenerator");
var ModelConfigService = /** @class */ (function (_super) {
    __extends(ModelConfigService, _super);
    function ModelConfigService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Safely cast database string to ReasoningEffort type
     */
    ModelConfigService.prototype.castToReasoningEffort = function (value) {
        if (!value)
            return undefined;
        return value;
    };
    /**
     * Get all model configurations for a user (merged with defaults)
     */
    ModelConfigService.prototype.getUserModelConfigs = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userConfigs, result, _loop_1, this_1, _i, _a, _b, actionKey, defaultConfig;
            var _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema_1.userModelConfigs)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userModelConfigs.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userModelConfigs.isActive, true)))];
                    case 1:
                        userConfigs = _g.sent();
                        result = {};
                        _loop_1 = function (actionKey, defaultConfig) {
                            var userConfig = userConfigs.find(function (uc) { return uc.agentActionName === actionKey; });
                            if (userConfig) {
                                // Merge user config with defaults (user config takes precedence, null values use defaults)
                                result[actionKey] = {
                                    name: (_c = userConfig.modelName) !== null && _c !== void 0 ? _c : defaultConfig.name,
                                    max_tokens: (_d = userConfig.maxTokens) !== null && _d !== void 0 ? _d : defaultConfig.max_tokens,
                                    temperature: userConfig.temperature !== null ? userConfig.temperature : defaultConfig.temperature,
                                    reasoning_effort: (_e = this_1.castToReasoningEffort(userConfig.reasoningEffort)) !== null && _e !== void 0 ? _e : defaultConfig.reasoning_effort,
                                    fallbackModel: (_f = userConfig.fallbackModel) !== null && _f !== void 0 ? _f : defaultConfig.fallbackModel,
                                    isUserOverride: true,
                                    userConfigId: userConfig.id
                                };
                            }
                            else {
                                // Use default config
                                result[actionKey] = __assign(__assign({}, defaultConfig), { isUserOverride: false });
                            }
                        };
                        this_1 = this;
                        // Start with all default configurations
                        for (_i = 0, _a = Object.entries(config_1.AGENT_CONFIG); _i < _a.length; _i++) {
                            _b = _a[_i], actionKey = _b[0], defaultConfig = _b[1];
                            _loop_1(actionKey, defaultConfig);
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Get a specific model configuration for a user (merged with defaults for UI display)
     */
    ModelConfigService.prototype.getUserModelConfig = function (userId, agentActionName) {
        return __awaiter(this, void 0, void 0, function () {
            var userConfig, defaultConfig, config;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema_1.userModelConfigs)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userModelConfigs.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userModelConfigs.agentActionName, agentActionName), (0, drizzle_orm_1.eq)(schema_1.userModelConfigs.isActive, true)))
                            .limit(1)];
                    case 1:
                        userConfig = _e.sent();
                        defaultConfig = config_1.AGENT_CONFIG[agentActionName];
                        if (userConfig.length > 0) {
                            config = userConfig[0];
                            return [2 /*return*/, {
                                    name: (_a = config.modelName) !== null && _a !== void 0 ? _a : defaultConfig.name,
                                    max_tokens: (_b = config.maxTokens) !== null && _b !== void 0 ? _b : defaultConfig.max_tokens,
                                    temperature: config.temperature !== null ? config.temperature : defaultConfig.temperature,
                                    reasoning_effort: (_c = this.castToReasoningEffort(config.reasoningEffort)) !== null && _c !== void 0 ? _c : defaultConfig.reasoning_effort,
                                    fallbackModel: (_d = config.fallbackModel) !== null && _d !== void 0 ? _d : defaultConfig.fallbackModel,
                                    isUserOverride: true,
                                    userConfigId: config.id
                                }];
                        }
                        return [2 /*return*/, __assign(__assign({}, defaultConfig), { isUserOverride: false })];
                }
            });
        });
    };
    /**
     * Get raw user model configuration without merging with defaults
     * Returns null if user has no custom config (for executeInference usage)
     */
    ModelConfigService.prototype.getRawUserModelConfig = function (userId, agentActionName) {
        return __awaiter(this, void 0, void 0, function () {
            var userConfig, config, hasOverrides, defaultConfig, modelConfig;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema_1.userModelConfigs)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userModelConfigs.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userModelConfigs.agentActionName, agentActionName), (0, drizzle_orm_1.eq)(schema_1.userModelConfigs.isActive, true)))
                            .limit(1)];
                    case 1:
                        userConfig = _b.sent();
                        if (userConfig.length > 0) {
                            config = userConfig[0];
                            hasOverrides = config.modelName || config.maxTokens ||
                                config.temperature !== null || config.reasoningEffort ||
                                config.fallbackModel;
                            if (hasOverrides) {
                                defaultConfig = config_1.AGENT_CONFIG[agentActionName];
                                modelConfig = {
                                    name: config.modelName || defaultConfig.name,
                                    max_tokens: config.maxTokens || defaultConfig.max_tokens,
                                    temperature: config.temperature !== null ? config.temperature : defaultConfig.temperature,
                                    reasoning_effort: (_a = this.castToReasoningEffort(config.reasoningEffort)) !== null && _a !== void 0 ? _a : defaultConfig.reasoning_effort,
                                    fallbackModel: config.fallbackModel || defaultConfig.fallbackModel,
                                };
                                return [2 /*return*/, modelConfig];
                            }
                        }
                        // Return null if user has no custom config - let AGENT_CONFIG defaults rule
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Update or create a user model configuration
     */
    ModelConfigService.prototype.upsertUserModelConfig = function (userId, agentActionName, config) {
        return __awaiter(this, void 0, void 0, function () {
            var existingConfig, configData, updated, newConfig, created;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema_1.userModelConfigs)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userModelConfigs.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userModelConfigs.agentActionName, agentActionName)))
                            .limit(1)];
                    case 1:
                        existingConfig = _a.sent();
                        configData = {
                            userId: userId,
                            agentActionName: agentActionName,
                            modelName: config.name || null,
                            maxTokens: config.max_tokens || null,
                            temperature: config.temperature !== undefined ? config.temperature : null,
                            reasoningEffort: (config.reasoning_effort && config.reasoning_effort !== 'minimal') ? config.reasoning_effort : null,
                            fallbackModel: config.fallbackModel || null,
                            isActive: true,
                            updatedAt: new Date()
                        };
                        if (!(existingConfig.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.database
                                .update(schema_1.userModelConfigs)
                                .set(configData)
                                .where((0, drizzle_orm_1.eq)(schema_1.userModelConfigs.id, existingConfig[0].id))
                                .returning()];
                    case 2:
                        updated = _a.sent();
                        return [2 /*return*/, updated[0]];
                    case 3:
                        newConfig = __assign(__assign({ id: (0, idGenerator_1.generateId)() }, configData), { createdAt: new Date() });
                        return [4 /*yield*/, this.database
                                .insert(schema_1.userModelConfigs)
                                .values(newConfig)
                                .returning()];
                    case 4:
                        created = _a.sent();
                        return [2 /*return*/, created[0]];
                }
            });
        });
    };
    /**
     * Delete/reset a user model configuration (revert to default)
     */
    ModelConfigService.prototype.deleteUserModelConfig = function (userId, agentActionName) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.database
                            .delete(schema_1.userModelConfigs)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userModelConfigs.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userModelConfigs.agentActionName, agentActionName)))];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, (((_a = result.meta) === null || _a === void 0 ? void 0 : _a.changes) || 0) > 0];
                }
            });
        });
    };
    /**
     * Get default configurations (from AGENT_CONFIG)
     */
    ModelConfigService.prototype.getDefaultConfigs = function () {
        return config_1.AGENT_CONFIG;
    };
    /**
     * Reset all user configurations to defaults
     */
    ModelConfigService.prototype.resetAllUserConfigs = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.database
                            .delete(schema_1.userModelConfigs)
                            .where((0, drizzle_orm_1.eq)(schema_1.userModelConfigs.userId, userId))];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, ((_a = result.meta) === null || _a === void 0 ? void 0 : _a.changes) || 0];
                }
            });
        });
    };
    return ModelConfigService;
}(BaseService_1.BaseService));
exports.ModelConfigService = ModelConfigService;
