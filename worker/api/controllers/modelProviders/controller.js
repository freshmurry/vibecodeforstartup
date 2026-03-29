"use strict";
/**
 * Model Providers Controller
 * Handles CRUD operations for user custom model providers
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
exports.ModelProvidersController = void 0;
var baseController_1 = require("../baseController");
var SecretsService_1 = require("../../../database/services/SecretsService");
var ModelProvidersService_1 = require("../../../database/services/ModelProvidersService");
var zod_1 = require("zod");
var logger_1 = require("../../../logger");
// Validation schemas
var createProviderSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    baseUrl: zod_1.z.string().url(),
    apiKey: zod_1.z.string().min(1)
});
var updateProviderSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    baseUrl: zod_1.z.string().url().optional(),
    apiKey: zod_1.z.string().min(1).optional(),
    isActive: zod_1.z.boolean().optional()
});
var testProviderSchema = zod_1.z.object({
    providerId: zod_1.z.string().optional(),
    baseUrl: zod_1.z.string().url().optional(),
    apiKey: zod_1.z.string().min(1).optional()
}).refine(function (data) { return data.providerId || (data.baseUrl && data.apiKey); }, "Either providerId or both baseUrl and apiKey must be provided");
var ModelProvidersController = /** @class */ (function (_super) {
    __extends(ModelProvidersController, _super);
    function ModelProvidersController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Get all custom providers for the authenticated user
     */
    ModelProvidersController.getProviders = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, modelProvidersService, providers, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        modelProvidersService = new ModelProvidersService_1.ModelProvidersService(env);
                        return [4 /*yield*/, modelProvidersService.getUserProviders(user.id)];
                    case 1:
                        providers = _a.sent();
                        return [2 /*return*/, ModelProvidersController.createSuccessResponse({
                                providers: providers.filter(function (p) { return p.isActive; })
                            })];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error getting providers:', error_1);
                        return [2 /*return*/, ModelProvidersController.createErrorResponse('Failed to get providers', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a specific provider by ID
     */
    ModelProvidersController.getProvider = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, url, providerId, modelProvidersService, provider, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        url = new URL(request.url);
                        providerId = url.pathname.split('/').pop();
                        if (!providerId) {
                            return [2 /*return*/, ModelProvidersController.createErrorResponse('Provider ID is required', 400)];
                        }
                        modelProvidersService = new ModelProvidersService_1.ModelProvidersService(env);
                        return [4 /*yield*/, modelProvidersService.getProvider(user.id, providerId)];
                    case 1:
                        provider = _a.sent();
                        if (!provider) {
                            throw new Error('Provider not found');
                        }
                        return [2 /*return*/, ModelProvidersController.createSuccessResponse({
                                provider: provider
                            })];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error('Error getting provider:', error_2);
                        return [2 /*return*/, ModelProvidersController.createErrorResponse('Failed to get provider', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new custom provider
     */
    ModelProvidersController.createProvider = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, bodyResult, validation, _a, name, baseUrl, apiKey, modelProvidersService, exists, secretsService, secretResult, provider, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        user = context.user;
                        return [4 /*yield*/, ModelProvidersController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _b.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        validation = createProviderSchema.safeParse(bodyResult.data);
                        if (!validation.success) {
                            return [2 /*return*/, ModelProvidersController.createErrorResponse("Validation error: ".concat(validation.error.errors.map(function (e) { return e.message; }).join(', ')), 400)];
                        }
                        _a = validation.data, name = _a.name, baseUrl = _a.baseUrl, apiKey = _a.apiKey;
                        modelProvidersService = new ModelProvidersService_1.ModelProvidersService(env);
                        return [4 /*yield*/, modelProvidersService.providerExists(user.id, name)];
                    case 2:
                        exists = _b.sent();
                        if (exists) {
                            throw new Error('Provider name already exists');
                        }
                        secretsService = new SecretsService_1.SecretsService(env);
                        return [4 /*yield*/, secretsService.storeSecret(user.id, {
                                name: "".concat(name, " API Key"),
                                provider: 'custom',
                                secretType: 'api_key',
                                value: apiKey,
                                description: "API key for custom provider: ".concat(name),
                                expiresAt: null
                            })];
                    case 3:
                        secretResult = _b.sent();
                        return [4 /*yield*/, modelProvidersService.createProvider(user.id, {
                                name: name,
                                baseUrl: baseUrl,
                                secretId: secretResult.id
                            })];
                    case 4:
                        provider = _b.sent();
                        return [2 /*return*/, ModelProvidersController.createSuccessResponse({
                                provider: provider
                            })];
                    case 5:
                        error_3 = _b.sent();
                        return [2 /*return*/, ModelProvidersController.createErrorResponse('Failed to create provider', 500)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update an existing provider
     */
    ModelProvidersController.updateProvider = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, url, providerId, bodyResult, validation, updates, modelProvidersService, secretsService, existingProvider, secretId, secretResult, updatedProvider, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        user = context.user;
                        url = new URL(request.url);
                        providerId = url.pathname.split('/').pop();
                        if (!providerId) {
                            return [2 /*return*/, ModelProvidersController.createErrorResponse('Provider ID is required', 400)];
                        }
                        return [4 /*yield*/, ModelProvidersController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _a.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        validation = updateProviderSchema.safeParse(bodyResult.data);
                        if (!validation.success) {
                            return [2 /*return*/, ModelProvidersController.createErrorResponse("Validation error: ".concat(validation.error.errors.map(function (e) { return e.message; }).join(', ')), 400)];
                        }
                        updates = validation.data;
                        modelProvidersService = new ModelProvidersService_1.ModelProvidersService(env);
                        secretsService = new SecretsService_1.SecretsService(env);
                        return [4 /*yield*/, modelProvidersService.getProvider(user.id, providerId)];
                    case 2:
                        existingProvider = _a.sent();
                        if (!existingProvider) {
                            throw new Error('Provider not found');
                        }
                        secretId = existingProvider.secretId;
                        if (!updates.apiKey) return [3 /*break*/, 6];
                        if (!existingProvider.secretId) return [3 /*break*/, 4];
                        return [4 /*yield*/, secretsService.deleteSecret(user.id, existingProvider.secretId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, secretsService.storeSecret(user.id, {
                            name: "".concat(updates.name || existingProvider.name, " API Key"),
                            provider: 'custom',
                            secretType: 'api_key',
                            value: updates.apiKey,
                            description: "API key for custom provider: ".concat(updates.name || existingProvider.name),
                            expiresAt: null
                        })];
                    case 5:
                        secretResult = _a.sent();
                        secretId = secretResult.id;
                        _a.label = 6;
                    case 6: return [4 /*yield*/, modelProvidersService.updateProvider(user.id, providerId, {
                            name: updates.name,
                            baseUrl: updates.baseUrl,
                            isActive: updates.isActive,
                            secretId: secretId
                        })];
                    case 7:
                        updatedProvider = _a.sent();
                        if (!updatedProvider) {
                            throw new Error('Failed to update provider');
                        }
                        return [2 /*return*/, ModelProvidersController.createSuccessResponse({
                                provider: updatedProvider
                            })];
                    case 8:
                        error_4 = _a.sent();
                        this.logger.error('Error updating provider:', error_4);
                        return [2 /*return*/, ModelProvidersController.createErrorResponse('Failed to update provider', 500)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a provider
     */
    ModelProvidersController.deleteProvider = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, url, providerId, modelProvidersService, secretsService, existingProvider, updated, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        user = context.user;
                        url = new URL(request.url);
                        providerId = url.pathname.split('/').pop();
                        if (!providerId) {
                            return [2 /*return*/, ModelProvidersController.createErrorResponse('Provider ID is required', 400)];
                        }
                        modelProvidersService = new ModelProvidersService_1.ModelProvidersService(env);
                        secretsService = new SecretsService_1.SecretsService(env);
                        return [4 /*yield*/, modelProvidersService.getProvider(user.id, providerId)];
                    case 1:
                        existingProvider = _a.sent();
                        if (!existingProvider) {
                            throw new Error('Provider not found');
                        }
                        if (!existingProvider.secretId) return [3 /*break*/, 3];
                        return [4 /*yield*/, secretsService.deleteSecret(user.id, existingProvider.secretId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, modelProvidersService.updateProvider(user.id, providerId, {
                            isActive: false
                        })];
                    case 4:
                        updated = _a.sent();
                        return [2 /*return*/, ModelProvidersController.createSuccessResponse({
                                success: !!updated,
                                providerId: providerId
                            })];
                    case 5:
                        error_5 = _a.sent();
                        this.logger.error('Error deleting provider:', error_5);
                        return [2 /*return*/, ModelProvidersController.createErrorResponse('Failed to delete provider', 500)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test provider connection
     */
    ModelProvidersController.testProvider = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, bodyResult, validation, baseUrl, apiKey, modelProvidersService, secretsService, provider, secretValue, startTime, testUrl, response, responseTime, errorText, error_6, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 13, , 14]);
                        user = context.user;
                        return [4 /*yield*/, ModelProvidersController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _a.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        validation = testProviderSchema.safeParse(bodyResult.data);
                        if (!validation.success) {
                            return [2 /*return*/, ModelProvidersController.createErrorResponse("Validation error: ".concat(validation.error.errors.map(function (e) { return e.message; }).join(', ')), 400)];
                        }
                        baseUrl = void 0;
                        apiKey = void 0;
                        if (!validation.data.providerId) return [3 /*break*/, 4];
                        modelProvidersService = new ModelProvidersService_1.ModelProvidersService(env);
                        secretsService = new SecretsService_1.SecretsService(env);
                        return [4 /*yield*/, modelProvidersService.getProvider(user.id, validation.data.providerId)];
                    case 2:
                        provider = _a.sent();
                        if (!provider) {
                            throw new Error('Provider not found');
                        }
                        if (!provider.secretId) {
                            throw new Error('Provider has no API key');
                        }
                        return [4 /*yield*/, secretsService.getSecretValue(user.id, provider.secretId)];
                    case 3:
                        secretValue = _a.sent();
                        if (!secretValue) {
                            throw new Error('API key not found');
                        }
                        baseUrl = provider.baseUrl;
                        apiKey = secretValue;
                        return [3 /*break*/, 5];
                    case 4:
                        baseUrl = validation.data.baseUrl;
                        apiKey = validation.data.apiKey;
                        _a.label = 5;
                    case 5:
                        startTime = Date.now();
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 11, , 12]);
                        testUrl = "".concat(baseUrl.replace(/\/$/, ''), "/models");
                        return [4 /*yield*/, fetch(testUrl, {
                                method: 'GET',
                                headers: {
                                    'Authorization': "Bearer ".concat(apiKey),
                                    'Content-Type': 'application/json'
                                }
                            })];
                    case 7:
                        response = _a.sent();
                        responseTime = Date.now() - startTime;
                        if (!response.ok) return [3 /*break*/, 8];
                        return [2 /*return*/, ModelProvidersController.createSuccessResponse({
                                success: true,
                                responseTime: responseTime
                            })];
                    case 8: return [4 /*yield*/, response.text()];
                    case 9:
                        errorText = _a.sent();
                        return [2 /*return*/, ModelProvidersController.createErrorResponse("API request failed: ".concat(response.status, " ").concat(errorText), 500)];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_6 = _a.sent();
                        return [2 /*return*/, ModelProvidersController.createErrorResponse("Connection failed: ".concat(error_6 instanceof Error ? error_6.message : 'Unknown error'), 500)];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        error_7 = _a.sent();
                        this.logger.error('Error testing provider:', error_7);
                        return [2 /*return*/, ModelProvidersController.createErrorResponse('Failed to test provider', 500)];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    ModelProvidersController.logger = (0, logger_1.createLogger)('ModelProvidersController');
    return ModelProvidersController;
}(baseController_1.BaseController));
exports.ModelProvidersController = ModelProvidersController;
