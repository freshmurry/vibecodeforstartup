"use strict";
/**
 * Model Configuration Controller
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
exports.ModelConfigController = void 0;
var baseController_1 = require("../baseController");
var ModelConfigService_1 = require("../../../database/services/ModelConfigService");
var SecretsService_1 = require("../../../database/services/SecretsService");
var ModelTestService_1 = require("../../../database/services/ModelTestService");
var config_1 = require("../../../agents/inferutils/config");
var byokHelper_1 = require("./byokHelper");
var zod_1 = require("zod");
var logger_1 = require("../../../logger");
// Validation schemas
var modelConfigUpdateSchema = zod_1.z.object({
    modelName: zod_1.z.string().min(1).max(100).nullable().optional(),
    maxTokens: zod_1.z.number().min(1).max(200000).nullable().optional(),
    temperature: zod_1.z.number().min(0).max(2).nullable().optional(),
    reasoningEffort: zod_1.z.enum(['low', 'medium', 'high']).nullable().optional(),
    providerOverride: zod_1.z.enum(['cloudflare', 'direct']).nullable().optional(),
    fallbackModel: zod_1.z.string().min(1).max(100).nullable().optional(),
    isUserOverride: zod_1.z.boolean().optional()
});
var modelTestSchema = zod_1.z.object({
    agentActionName: zod_1.z.string(),
    testPrompt: zod_1.z.string().optional(),
    useUserKeys: zod_1.z.boolean().default(true),
    tempConfig: modelConfigUpdateSchema.optional()
});
var ModelConfigController = /** @class */ (function (_super) {
    __extends(ModelConfigController, _super);
    function ModelConfigController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Get all model configurations for the current user
     * GET /api/model-configs
     */
    ModelConfigController.getModelConfigs = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, modelConfigService, configs, defaults, responseData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        modelConfigService = new ModelConfigService_1.ModelConfigService(env);
                        return [4 /*yield*/, modelConfigService.getUserModelConfigs(user.id)];
                    case 1:
                        configs = _a.sent();
                        defaults = modelConfigService.getDefaultConfigs();
                        responseData = {
                            configs: configs,
                            defaults: defaults,
                            message: 'Model configurations retrieved successfully'
                        };
                        return [2 /*return*/, ModelConfigController.createSuccessResponse(responseData)];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error getting model configurations:', error_1);
                        return [2 /*return*/, ModelConfigController.createErrorResponse('Failed to get model configurations', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a specific model configuration
     * GET /api/model-configs/:agentAction
     */
    ModelConfigController.getModelConfig = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, url, agentAction, modelConfigService, config, defaultConfig, responseData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        url = new URL(request.url);
                        agentAction = url.pathname.split('/').pop();
                        if (!agentAction || !(agentAction in config_1.AGENT_CONFIG)) {
                            return [2 /*return*/, ModelConfigController.createErrorResponse('Invalid agent action name', 400)];
                        }
                        modelConfigService = new ModelConfigService_1.ModelConfigService(env);
                        return [4 /*yield*/, modelConfigService.getUserModelConfig(user.id, agentAction)];
                    case 1:
                        config = _a.sent();
                        defaultConfig = modelConfigService.getDefaultConfigs()[agentAction];
                        responseData = {
                            config: config,
                            defaultConfig: defaultConfig,
                            message: 'Model configuration retrieved successfully'
                        };
                        return [2 /*return*/, ModelConfigController.createSuccessResponse(responseData)];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error('Error getting model configuration:', error_2);
                        return [2 /*return*/, ModelConfigController.createErrorResponse('Failed to get model configuration', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update a specific model configuration
     * PUT /api/model-configs/:agentAction
     */
    ModelConfigController.updateModelConfig = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, url, agentAction, bodyResult, validatedData, modelConfig, userProviderStatus, isValidAccess, provider, isValidAccess, provider, modelConfigService, updatedConfig, responseData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        user = context.user;
                        url = new URL(request.url);
                        agentAction = url.pathname.split('/').pop();
                        if (!agentAction || !(agentAction in config_1.AGENT_CONFIG)) {
                            return [2 /*return*/, ModelConfigController.createErrorResponse('Invalid agent action name', 400)];
                        }
                        return [4 /*yield*/, ModelConfigController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _a.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        validatedData = modelConfigUpdateSchema.parse(bodyResult.data);
                        modelConfig = {};
                        if (validatedData.modelName !== null && validatedData.modelName !== undefined) {
                            modelConfig.name = validatedData.modelName;
                        }
                        if (validatedData.maxTokens !== null && validatedData.maxTokens !== undefined) {
                            modelConfig.max_tokens = validatedData.maxTokens;
                        }
                        if (validatedData.temperature !== null && validatedData.temperature !== undefined) {
                            modelConfig.temperature = validatedData.temperature;
                        }
                        if (validatedData.reasoningEffort !== null && validatedData.reasoningEffort !== undefined) {
                            modelConfig.reasoning_effort = validatedData.reasoningEffort;
                        }
                        if (validatedData.fallbackModel !== null && validatedData.fallbackModel !== undefined) {
                            modelConfig.fallbackModel = validatedData.fallbackModel;
                        }
                        if (!(modelConfig.name || modelConfig.fallbackModel)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, byokHelper_1.getUserProviderStatus)(user.id, env)];
                    case 2:
                        userProviderStatus = _a.sent();
                        // Validate primary model
                        if (modelConfig.name) {
                            isValidAccess = (0, byokHelper_1.validateModelAccessForEnvironment)(modelConfig.name, env, userProviderStatus);
                            if (!isValidAccess) {
                                provider = modelConfig.name.split('/')[0];
                                return [2 /*return*/, ModelConfigController.createErrorResponse("Model requires API key for provider '".concat(provider, "'. Please add your API key in the BYOK settings or contact your platform administrator."), 403)];
                            }
                        }
                        // Validate fallback model
                        if (modelConfig.fallbackModel) {
                            isValidAccess = (0, byokHelper_1.validateModelAccessForEnvironment)(modelConfig.fallbackModel, env, userProviderStatus);
                            if (!isValidAccess) {
                                provider = modelConfig.fallbackModel.split('/')[0];
                                return [2 /*return*/, ModelConfigController.createErrorResponse("Fallback model requires API key for provider '".concat(provider, "'. Please add your API key in the BYOK settings or contact your platform administrator."), 403)];
                            }
                        }
                        _a.label = 3;
                    case 3:
                        modelConfigService = new ModelConfigService_1.ModelConfigService(env);
                        return [4 /*yield*/, modelConfigService.upsertUserModelConfig(user.id, agentAction, modelConfig)];
                    case 4:
                        updatedConfig = _a.sent();
                        responseData = {
                            config: updatedConfig,
                            message: 'Model configuration updated successfully'
                        };
                        return [2 /*return*/, ModelConfigController.createSuccessResponse(responseData)];
                    case 5:
                        error_3 = _a.sent();
                        if (error_3 instanceof zod_1.z.ZodError) {
                            return [2 /*return*/, ModelConfigController.createErrorResponse('Validation failed: ' + JSON.stringify(error_3.errors), 400)];
                        }
                        this.logger.error('Error updating model configuration:', error_3);
                        return [2 /*return*/, ModelConfigController.createErrorResponse('Failed to update model configuration', 500)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete/reset a model configuration to default
     * DELETE /api/model-configs/:agentAction
     */
    ModelConfigController.deleteModelConfig = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, url, agentAction, modelConfigService, deleted, responseData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        url = new URL(request.url);
                        agentAction = url.pathname.split('/').pop();
                        if (!agentAction || !(agentAction in config_1.AGENT_CONFIG)) {
                            return [2 /*return*/, ModelConfigController.createErrorResponse('Invalid agent action name', 400)];
                        }
                        modelConfigService = new ModelConfigService_1.ModelConfigService(env);
                        return [4 /*yield*/, modelConfigService.deleteUserModelConfig(user.id, agentAction)];
                    case 1:
                        deleted = _a.sent();
                        if (!deleted) {
                            return [2 /*return*/, ModelConfigController.createErrorResponse('Configuration not found or already using defaults', 404)];
                        }
                        responseData = {
                            message: 'Model configuration reset to default successfully'
                        };
                        return [2 /*return*/, ModelConfigController.createSuccessResponse(responseData)];
                    case 2:
                        error_4 = _a.sent();
                        this.logger.error('Error deleting model configuration:', error_4);
                        return [2 /*return*/, ModelConfigController.createErrorResponse('Failed to delete model configuration', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test a model configuration
     * POST /api/model-configs/test
     */
    ModelConfigController.testModelConfig = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, bodyResult, validatedData, agentAction, modelConfigService, secretsService, modelTestService, baseConfig, configToTest, userApiKeys, userApiKeysMap, testResult, responseData, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        user = context.user;
                        return [4 /*yield*/, ModelConfigController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _a.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        validatedData = modelTestSchema.parse(bodyResult.data);
                        agentAction = validatedData.agentActionName;
                        if (!(agentAction in config_1.AGENT_CONFIG)) {
                            return [2 /*return*/, ModelConfigController.createErrorResponse('Invalid agent action name', 400)];
                        }
                        modelConfigService = new ModelConfigService_1.ModelConfigService(env);
                        secretsService = new SecretsService_1.SecretsService(env);
                        modelTestService = new ModelTestService_1.ModelTestService(env);
                        return [4 /*yield*/, modelConfigService.getUserModelConfig(user.id, agentAction)];
                    case 2:
                        baseConfig = _a.sent();
                        configToTest = validatedData.tempConfig ? __assign(__assign(__assign(__assign(__assign(__assign(__assign({}, baseConfig), (validatedData.tempConfig.modelName != null && { name: validatedData.tempConfig.modelName })), (validatedData.tempConfig.maxTokens != null && { max_tokens: validatedData.tempConfig.maxTokens })), (validatedData.tempConfig.temperature != null && { temperature: validatedData.tempConfig.temperature })), (validatedData.tempConfig.reasoningEffort != null && { reasoning_effort: validatedData.tempConfig.reasoningEffort })), (validatedData.tempConfig.fallbackModel != null && { fallbackModel: validatedData.tempConfig.fallbackModel })), (validatedData.tempConfig.providerOverride != null && { providerOverride: validatedData.tempConfig.providerOverride })) : baseConfig;
                        userApiKeys = void 0;
                        if (!validatedData.useUserKeys) return [3 /*break*/, 4];
                        return [4 /*yield*/, secretsService.getUserBYOKKeysMap(user.id)];
                    case 3:
                        userApiKeysMap = _a.sent();
                        userApiKeys = Object.fromEntries(userApiKeysMap);
                        _a.label = 4;
                    case 4: return [4 /*yield*/, modelTestService.testModelConfig({
                            modelConfig: configToTest,
                            userApiKeys: userApiKeys,
                            testPrompt: validatedData.testPrompt
                        })];
                    case 5:
                        testResult = _a.sent();
                        responseData = {
                            testResult: testResult,
                            message: testResult.success
                                ? 'Model configuration test successful'
                                : 'Model configuration test failed'
                        };
                        return [2 /*return*/, ModelConfigController.createSuccessResponse(responseData)];
                    case 6:
                        error_5 = _a.sent();
                        if (error_5 instanceof zod_1.z.ZodError) {
                            return [2 /*return*/, ModelConfigController.createErrorResponse('Validation failed: ' + JSON.stringify(error_5.errors), 400)];
                        }
                        this.logger.error('Error testing model configuration:', error_5);
                        return [2 /*return*/, ModelConfigController.createErrorResponse('Failed to test model configuration', 500)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reset all model configurations to defaults
     * POST /api/model-configs/reset-all
     */
    ModelConfigController.resetAllConfigs = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, modelConfigService, resetCount, responseData, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        modelConfigService = new ModelConfigService_1.ModelConfigService(env);
                        return [4 /*yield*/, modelConfigService.resetAllUserConfigs(user.id)];
                    case 1:
                        resetCount = _a.sent();
                        responseData = {
                            resetCount: resetCount,
                            message: "".concat(resetCount, " model configurations reset to defaults")
                        };
                        return [2 /*return*/, ModelConfigController.createSuccessResponse(responseData)];
                    case 2:
                        error_6 = _a.sent();
                        this.logger.error('Error resetting all model configurations:', error_6);
                        return [2 /*return*/, ModelConfigController.createErrorResponse('Failed to reset model configurations', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get default configurations
     * GET /api/model-configs/defaults
     */
    ModelConfigController.getDefaults = function (_request, env, _ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var modelConfigService, defaults, responseData;
            return __generator(this, function (_a) {
                try {
                    modelConfigService = new ModelConfigService_1.ModelConfigService(env);
                    defaults = modelConfigService.getDefaultConfigs();
                    responseData = {
                        defaults: defaults,
                        message: 'Default configurations retrieved successfully'
                    };
                    return [2 /*return*/, ModelConfigController.createSuccessResponse(responseData)];
                }
                catch (error) {
                    this.logger.error('Error getting default configurations:', error);
                    return [2 /*return*/, ModelConfigController.createErrorResponse('Failed to get default configurations', 500)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get BYOK providers and available models
     * GET /api/model-configs/byok-providers
     */
    ModelConfigController.getByokProviders = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, providers, modelsByProvider, platformModels, responseData, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        return [4 /*yield*/, (0, byokHelper_1.getUserProviderStatus)(user.id, env)];
                    case 1:
                        providers = _a.sent();
                        modelsByProvider = (0, byokHelper_1.getByokModels)(providers);
                        platformModels = (0, byokHelper_1.getPlatformAvailableModels)(env);
                        responseData = {
                            providers: providers,
                            modelsByProvider: modelsByProvider,
                            platformModels: platformModels
                        };
                        return [2 /*return*/, ModelConfigController.createSuccessResponse(responseData)];
                    case 2:
                        error_7 = _a.sent();
                        this.logger.error('Error getting BYOK providers:', error_7);
                        return [2 /*return*/, ModelConfigController.createErrorResponse('Failed to get BYOK providers', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelConfigController.logger = (0, logger_1.createLogger)('ModelConfigController');
    return ModelConfigController;
}(baseController_1.BaseController));
exports.ModelConfigController = ModelConfigController;
