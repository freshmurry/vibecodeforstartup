"use strict";
/**
 * Secrets Controller
 * Handles API endpoints for user secrets and API keys management
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
exports.SecretsController = void 0;
var baseController_1 = require("../baseController");
var SecretsService_1 = require("../../../database/services/SecretsService");
var secretsTemplates_1 = require("../../../types/secretsTemplates");
var SecretsController = /** @class */ (function (_super) {
    __extends(SecretsController, _super);
    function SecretsController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Get all user secrets including inactive ones
     * GET /api/secrets
     */
    SecretsController.getAllSecrets = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, secretsService, secrets, responseData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        secretsService = new SecretsService_1.SecretsService(env);
                        return [4 /*yield*/, secretsService.getAllUserSecrets(user.id)];
                    case 1:
                        secrets = _a.sent();
                        responseData = { secrets: secrets };
                        return [2 /*return*/, SecretsController.createSuccessResponse(responseData)];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error getting all user secrets:', error_1);
                        return [2 /*return*/, SecretsController.createErrorResponse('Failed to get all user secrets', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Store a new secret
     * POST /api/secrets
     */
    SecretsController.storeSecret = function (request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, bodyResult, _a, templateId_1, name, envVarName, value, description, secretData, templates, template, secretsService, storedSecret, responseData, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        user = context.user;
                        return [4 /*yield*/, SecretsController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _b.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        _a = bodyResult.data, templateId_1 = _a.templateId, name = _a.name, envVarName = _a.envVarName, value = _a.value, description = _a.description;
                        // Validate required fields
                        if (!value) {
                            return [2 /*return*/, SecretsController.createErrorResponse('Missing required field: value', 400)];
                        }
                        secretData = void 0;
                        if (templateId_1) {
                            templates = (0, secretsTemplates_1.getTemplatesData)();
                            template = templates.find(function (t) { return t.id === templateId_1; });
                            if (!template) {
                                return [2 /*return*/, SecretsController.createErrorResponse('Invalid template ID', 400)];
                            }
                            // Validate against template validation if provided
                            if (template.validation && !new RegExp(template.validation).test(value)) {
                                return [2 /*return*/, SecretsController.createErrorResponse("Invalid format for ".concat(template.displayName, ". Expected format: ").concat(template.placeholder), 400)];
                            }
                            secretData = {
                                name: template.displayName,
                                provider: template.provider,
                                secretType: template.envVarName,
                                value: value.trim(),
                                description: template.description,
                                expiresAt: null
                            };
                        }
                        else {
                            // Custom secret
                            if (!name || !envVarName) {
                                return [2 /*return*/, SecretsController.createErrorResponse('Missing required fields for custom secret: name, envVarName', 400)];
                            }
                            // Validate environment variable name format
                            if (!/^[A-Z][A-Z0-9_]*$/.test(envVarName)) {
                                return [2 /*return*/, SecretsController.createErrorResponse('Environment variable name must be uppercase and contain only letters, numbers, and underscores', 400)];
                            }
                            secretData = {
                                name: name.trim(),
                                provider: 'custom',
                                secretType: envVarName.trim().toUpperCase(),
                                value: value.trim(),
                                description: (description === null || description === void 0 ? void 0 : description.trim()) || null,
                                expiresAt: null
                            };
                        }
                        secretsService = new SecretsService_1.SecretsService(env);
                        return [4 /*yield*/, secretsService.storeSecret(user.id, secretData)];
                    case 2:
                        storedSecret = _b.sent();
                        responseData = {
                            secret: storedSecret,
                            message: 'Secret stored successfully'
                        };
                        return [2 /*return*/, SecretsController.createSuccessResponse(responseData)];
                    case 3:
                        error_2 = _b.sent();
                        this.logger.error('Error storing secret:', error_2);
                        return [2 /*return*/, SecretsController.createErrorResponse('Failed to store secret', 500)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a secret
     * DELETE /api/secrets/:secretId
     */
    SecretsController.deleteSecret = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, secretId, secretsService, responseData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        secretId = context.pathParams.secretId;
                        if (!secretId) {
                            return [2 /*return*/, SecretsController.createErrorResponse('Secret ID is required', 400)];
                        }
                        secretsService = new SecretsService_1.SecretsService(env);
                        return [4 /*yield*/, secretsService.deleteSecret(user.id, secretId)];
                    case 1:
                        _a.sent();
                        responseData = {
                            message: 'Secret deleted successfully'
                        };
                        return [2 /*return*/, SecretsController.createSuccessResponse(responseData)];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error('Error deleting secret:', error_3);
                        return [2 /*return*/, SecretsController.createErrorResponse('Failed to delete secret', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Toggle secret active status
     * PATCH /api/secrets/:secretId/toggle
     */
    SecretsController.toggleSecret = function (_request, env, _ctx, context) {
        return __awaiter(this, void 0, void 0, function () {
            var user, secretId, secretsService, toggledSecret, responseData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = context.user;
                        secretId = context.pathParams.secretId;
                        if (!secretId) {
                            return [2 /*return*/, SecretsController.createErrorResponse('Secret ID is required', 400)];
                        }
                        secretsService = new SecretsService_1.SecretsService(env);
                        return [4 /*yield*/, secretsService.toggleSecretActiveStatus(user.id, secretId)];
                    case 1:
                        toggledSecret = _a.sent();
                        responseData = {
                            secret: toggledSecret,
                            message: "Secret ".concat(toggledSecret.isActive ? 'activated' : 'deactivated', " successfully")
                        };
                        return [2 /*return*/, SecretsController.createSuccessResponse(responseData)];
                    case 2:
                        error_4 = _a.sent();
                        this.logger.error('Error toggling secret status:', error_4);
                        return [2 /*return*/, SecretsController.createErrorResponse('Failed to toggle secret status', 500)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get predefined secret templates for common providers
     * GET /api/secrets/templates
     */
    SecretsController.getTemplates = function (request, _env, _ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var url, category_1, templates, responseData;
            return __generator(this, function (_a) {
                try {
                    url = new URL(request.url);
                    category_1 = url.searchParams.get('category');
                    templates = (0, secretsTemplates_1.getTemplatesData)();
                    if (category_1) {
                        templates = templates.filter(function (template) { return template.category === category_1; });
                    }
                    responseData = { templates: templates };
                    return [2 /*return*/, SecretsController.createSuccessResponse(responseData)];
                }
                catch (error) {
                    this.logger.error('Error getting secret templates:', error);
                    return [2 /*return*/, SecretsController.createErrorResponse('Failed to get secret templates', 500)];
                }
                return [2 /*return*/];
            });
        });
    };
    return SecretsController;
}(baseController_1.BaseController));
exports.SecretsController = SecretsController;
