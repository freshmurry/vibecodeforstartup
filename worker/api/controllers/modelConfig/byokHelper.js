"use strict";
/**
 * BYOK (Bring Your Own Key) Helper Functions
 * Handles provider discovery and model filtering for users with custom API keys
 * Completely dynamic - no hardcoded provider lists
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
exports.getUserProviderStatus = getUserProviderStatus;
exports.getByokModels = getByokModels;
exports.getPlatformEnabledProviders = getPlatformEnabledProviders;
exports.getPlatformAvailableModels = getPlatformAvailableModels;
exports.validateModelAccessForEnvironment = validateModelAccessForEnvironment;
exports.getProviderFromModel = getProviderFromModel;
var config_types_1 = require("../../../agents/inferutils/config.types");
var SecretsService_1 = require("../../../database/services/SecretsService");
var secretsTemplates_1 = require("../../../types/secretsTemplates");
/**
 * Get user's provider status for BYOK functionality
 */
function getUserProviderStatus(userId, env) {
    return __awaiter(this, void 0, void 0, function () {
        var secretsService, byokTemplates, userSecrets, providerStatuses, _loop_1, _i, byokTemplates_1, template, error_1, byokTemplates, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 8]);
                    secretsService = new SecretsService_1.SecretsService(env);
                    return [4 /*yield*/, (0, secretsTemplates_1.getBYOKTemplates)()];
                case 1:
                    byokTemplates = _b.sent();
                    return [4 /*yield*/, secretsService.getUserSecrets(userId)];
                case 2:
                    userSecrets = _b.sent();
                    providerStatuses = [];
                    _loop_1 = function (template) {
                        // Find secret for this BYOK template
                        var providerSecret = userSecrets.find(function (secret) {
                            return secret.secretType === template.envVarName &&
                                secret.isActive;
                        });
                        providerStatuses.push({
                            provider: template.provider,
                            hasValidKey: !!providerSecret,
                            keyPreview: providerSecret === null || providerSecret === void 0 ? void 0 : providerSecret.keyPreview,
                        });
                    };
                    for (_i = 0, byokTemplates_1 = byokTemplates; _i < byokTemplates_1.length; _i++) {
                        template = byokTemplates_1[_i];
                        _loop_1(template);
                    }
                    return [2 /*return*/, providerStatuses];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error getting user provider status:', error_1);
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, secretsTemplates_1.getBYOKTemplates)()];
                case 5:
                    byokTemplates = _b.sent();
                    return [2 /*return*/, byokTemplates.map(function (template) { return ({
                            provider: template.provider,
                            hasValidKey: false,
                        }); })];
                case 6:
                    _a = _b.sent();
                    return [2 /*return*/, []]; // Complete fallback
                case 7: return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get models available for BYOK providers that user has keys for
 */
function getByokModels(providerStatuses) {
    var modelsByProvider = {};
    providerStatuses
        .filter(function (status) { return status.hasValidKey; })
        .forEach(function (status) {
        // Get models for this provider dynamically from AIModels enum
        var providerModels = Object.values(config_types_1.AIModels).filter(function (model) {
            return model.startsWith("".concat(status.provider, "/"));
        });
        if (providerModels.length > 0) {
            modelsByProvider[status.provider] = providerModels;
        }
    });
    return modelsByProvider;
}
/**
 * Get providers that have platform API keys configured in environment
 */
function getPlatformEnabledProviders(env) {
    var enabledProviders = [];
    // Check for provider API keys in environment variables
    // Using the same pattern as core.ts getApiKey function
    var providerList = [
        'anthropic',
        'openai',
        'google-ai-studio',
        'cerebras',
        'groq',
    ];
    for (var _i = 0, providerList_1 = providerList; _i < providerList_1.length; _i++) {
        var provider = providerList_1[_i];
        // Convert provider name to env var format (same as core.ts)
        var providerKeyString = provider.toUpperCase().replaceAll('-', '_');
        var envKey = "".concat(providerKeyString, "_API_KEY");
        var apiKey = env[envKey];
        // Use the same validation logic as core.ts isValidApiKey function
        if (apiKey &&
            apiKey.trim() !== '' &&
            apiKey.trim().toLowerCase() !== 'default' &&
            apiKey.trim().toLowerCase() !== 'none' &&
            apiKey.trim().length >= 10) {
            enabledProviders.push(provider);
        }
    }
    return enabledProviders;
}
/**
 * Get models available on platform based on environment configuration
 */
function getPlatformAvailableModels(env) {
    var platformEnabledProviders = getPlatformEnabledProviders(env);
    console.log("Platform enabled providers: ", platformEnabledProviders);
    // Filter models to only include those from providers with platform API keys
    return Object.values(config_types_1.AIModels).filter(function (model) {
        var provider = getProviderFromModel(model);
        return platformEnabledProviders.includes(provider);
    });
}
/**
 * Validate if a model can be accessed based on environment config and user BYOK status
 */
function validateModelAccessForEnvironment(model, env, userProviderStatus) {
    var provider = getProviderFromModel(model);
    // Allow access if either:
    // 1. Provider has platform API key configured, OR
    // 2. User has valid BYOK key for this provider
    var hasPlatformKey = getPlatformEnabledProviders(env).includes(provider);
    var hasUserKey = userProviderStatus.some(function (status) { return status.provider === provider && status.hasValidKey; });
    return hasPlatformKey || hasUserKey;
}
/**
 * Get provider name from model string
 */
function getProviderFromModel(model) {
    if (typeof model === 'string' && model.includes('/')) {
        return model.split('/')[0];
    }
    return 'cloudflare';
}
