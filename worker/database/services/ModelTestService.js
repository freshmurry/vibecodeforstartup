"use strict";
/**
 * Model Test Service
 * Handles testing of model configurations with user API keys
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
exports.ModelTestService = void 0;
var BaseService_1 = require("./BaseService");
var config_types_1 = require("../../agents/inferutils/config.types");
var core_1 = require("../../agents/inferutils/core");
var common_1 = require("../../agents/inferutils/common");
var types_1 = require("../types");
var ModelTestService = /** @class */ (function (_super) {
    __extends(ModelTestService, _super);
    function ModelTestService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Test a model configuration by making a simple chat request using core inference
     */
    ModelTestService.prototype.testModelConfig = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var startTime, modelName, cleanModelName, testMessage, response, endTime, latencyMs, content, error_1, endTime, latencyMs, rawError;
            var _c;
            var modelConfig = _b.modelConfig, userApiKeys = _b.userApiKeys, _d = _b.testPrompt, testPrompt = _d === void 0 ? "Hello! Please respond with 'Test successful' to confirm the connection is working." : _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        startTime = Date.now();
                        modelName = modelConfig.name;
                        cleanModelName = modelName.replace(/\[.*?\]/, '');
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        testMessage = (0, common_1.createUserMessage)(testPrompt);
                        return [4 /*yield*/, (0, core_1.infer)({
                                env: this.env,
                                metadata: { agentId: "test-".concat(Date.now()), userId: 'system' }, // Generate unique test ID
                                messages: [testMessage],
                                modelName: modelName,
                                maxTokens: Math.min(modelConfig.max_tokens || 100, 100), // Limit to 100 tokens for test
                                temperature: modelConfig.temperature || 0.1,
                                reasoning_effort: modelConfig.reasoning_effort,
                                userApiKeys: userApiKeys
                            })];
                    case 2:
                        response = _e.sent();
                        endTime = Date.now();
                        latencyMs = endTime - startTime;
                        content = response.string || '';
                        return [2 /*return*/, {
                                success: true,
                                responsePreview: content.length > 100 ? content.substring(0, 100) + '...' : content,
                                latencyMs: latencyMs,
                                modelUsed: cleanModelName,
                            }];
                    case 3:
                        error_1 = _e.sent();
                        endTime = Date.now();
                        latencyMs = endTime - startTime;
                        rawError = 'Unknown error occurred';
                        if (error_1 instanceof core_1.InferError) {
                            rawError = error_1.message;
                        }
                        else if (error_1 instanceof Error) {
                            rawError = error_1.message;
                        }
                        else if ((0, types_1.isErrorWithMessage)(error_1)) {
                            // Handle error objects from the core system
                            if (error_1.message) {
                                rawError = error_1.message;
                            }
                            else if ((_c = error_1.error) === null || _c === void 0 ? void 0 : _c.message) {
                                rawError = error_1.error.message;
                            }
                            else {
                                rawError = JSON.stringify(error_1);
                            }
                        }
                        else {
                            rawError = String(error_1);
                        }
                        return [2 /*return*/, {
                                success: false,
                                error: rawError,
                                latencyMs: latencyMs,
                                modelUsed: cleanModelName
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test a specific provider's API key using core inference
     */
    ModelTestService.prototype.testProviderKey = function (provider, apiKey) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, testModel, testApiKeys, testMessage, response, endTime, cleanModelName, error_2, endTime, latencyMs, rawError;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        testModel = this.getTestModelForProvider(provider);
                        if (!testModel) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "No test model available for provider: ".concat(provider)
                                }];
                        }
                        testApiKeys = new Map();
                        testApiKeys.set(provider, apiKey);
                        testMessage = (0, common_1.createUserMessage)('Test connection. Please respond with "OK".');
                        return [4 /*yield*/, (0, core_1.infer)({
                                env: this.env,
                                metadata: { agentId: "provider-test-".concat(Date.now()), userId: 'system' }, // Generate unique test ID
                                messages: [testMessage],
                                modelName: testModel,
                                maxTokens: 10,
                                temperature: 0,
                                userApiKeys: Object.fromEntries(testApiKeys)
                            })];
                    case 2:
                        response = _b.sent();
                        endTime = Date.now();
                        cleanModelName = testModel.replace(/\[.*?\]/, '');
                        if (response.string && response.string.trim()) {
                            return [2 /*return*/, {
                                    success: true,
                                    model: cleanModelName,
                                    latencyMs: endTime - startTime
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'No response received from model'
                                }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _b.sent();
                        endTime = Date.now();
                        latencyMs = endTime - startTime;
                        rawError = 'Connection test failed';
                        if (error_2 instanceof core_1.InferError) {
                            rawError = error_2.message;
                        }
                        else if (error_2 instanceof Error) {
                            rawError = error_2.message;
                        }
                        else if ((0, types_1.isErrorWithMessage)(error_2)) {
                            // Handle error objects from the core system
                            if (error_2.message) {
                                rawError = error_2.message;
                            }
                            else if ((_a = error_2.error) === null || _a === void 0 ? void 0 : _a.message) {
                                rawError = error_2.error.message;
                            }
                            else {
                                rawError = JSON.stringify(error_2);
                            }
                        }
                        else {
                            rawError = String(error_2);
                        }
                        return [2 /*return*/, {
                                success: false,
                                error: rawError,
                                latencyMs: latencyMs
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a simple test model for a given provider
     */
    ModelTestService.prototype.getTestModelForProvider = function (provider) {
        var testModels = {
            'openai': config_types_1.AIModels.OPENAI_5_MINI,
            'anthropic': config_types_1.AIModels.CLAUDE_4_SONNET,
            'google-ai-studio': config_types_1.AIModels.GEMINI_2_5_FLASH,
            'gemini': config_types_1.AIModels.GEMINI_2_5_FLASH,
            // 'openrouter': AIModels.OPENROUTER_QWEN_3_CODER, // Removed - not available
            'cerebras': config_types_1.AIModels.CEREBRAS_GPT_OSS
        };
        return testModels[provider] || null;
    };
    return ModelTestService;
}(BaseService_1.BaseService));
exports.ModelTestService = ModelTestService;
