"use strict";
/**
 * Secure Authentication Controller
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
exports.AuthController = void 0;
var AuthService_1 = require("../../../database/services/AuthService");
var SessionService_1 = require("../../../database/services/SessionService");
var UserService_1 = require("../../../database/services/UserService");
var ApiKeyService_1 = require("../../../database/services/ApiKeyService");
var cryptoUtils_1 = require("../../../utils/cryptoUtils");
var authSchemas_1 = require("./authSchemas");
var errors_1 = require("../../../../shared/types/errors");
var authUtils_1 = require("../../../utils/authUtils");
// import { ExecutionContext } from '../../types/execution-context';
// FIX: Update the import path if the file exists elsewhere, or create the file if missing.
var security_1 = require("../../../config/security");
// If the file does not exist, create '../../types/executionContext.ts' and export the type.
var auth_1 = require("../../../middleware/auth/auth");
var CsrfService_1 = require("../../../services/csrf/CsrfService");
var baseController_1 = require("../baseController");
var logger_1 = require("../../../logger");
/**
 * Authentication Controller
 */
var AuthController = /** @class */ (function (_super) {
    __extends(AuthController, _super);
    function AuthController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Check if OAuth providers are configured
     */
    AuthController.hasOAuthProviders = function (env) {
        return (!!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET) ||
            (!!env.GITHUB_CLIENT_ID && !!env.GITHUB_CLIENT_SECRET);
    };
    /**
     * Register a new user
     * POST /api/auth/register
     */
    AuthController.register = function (request, env, _ctx, _routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var bodyResult, validatedData, authService, result, response, config, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Check if OAuth providers are configured - if yes, block email/password registration
                        if (AuthController.hasOAuthProviders(env)) {
                            return [2 /*return*/, AuthController.createErrorResponse('Email/password registration is not available when OAuth providers are configured. Please use OAuth login instead.', 403)];
                        }
                        return [4 /*yield*/, AuthController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _a.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        validatedData = authSchemas_1.registerSchema.parse(bodyResult.data);
                        if (env.ALLOWED_EMAIL && validatedData.email !== env.ALLOWED_EMAIL) {
                            return [2 /*return*/, AuthController.createErrorResponse('Email Whitelisting is enabled. Please use the allowed email to register.', 403)];
                        }
                        authService = new AuthService_1.AuthService(env);
                        return [4 /*yield*/, authService.register(validatedData, request)];
                    case 2:
                        result = _a.sent();
                        response = AuthController.createSuccessResponse((0, authUtils_1.formatAuthResponse)(result.user, result.sessionId, result.expiresAt));
                        (0, authUtils_1.setSecureAuthCookies)(response, {
                            accessToken: result.accessToken,
                            accessTokenExpiry: SessionService_1.SessionService.config.sessionTTL
                        });
                        config = (0, security_1.getCSRFConfig)(env);
                        if (config.rotateOnAuth) {
                            CsrfService_1.CsrfService.rotateToken(response, env);
                        }
                        return [2 /*return*/, response];
                    case 3:
                        error_1 = _a.sent();
                        if (error_1 instanceof errors_1.SecurityError) {
                            return [2 /*return*/, AuthController.createErrorResponse(error_1.message, error_1.statusCode)];
                        }
                        return [2 /*return*/, AuthController.handleError(error_1, 'register user')];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Login with email and password
     * POST /api/auth/login
     */
    AuthController.login = function (request, env, _ctx, _routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var bodyResult, validatedData, authService, result, response, config, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Check if OAuth providers are configured - if yes, block email/password login
                        if (AuthController.hasOAuthProviders(env)) {
                            return [2 /*return*/, AuthController.createErrorResponse('Email/password login is not available when OAuth providers are configured. Please use OAuth login instead.', 403)];
                        }
                        return [4 /*yield*/, AuthController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _a.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        validatedData = authSchemas_1.loginSchema.parse(bodyResult.data);
                        if (env.ALLOWED_EMAIL && validatedData.email !== env.ALLOWED_EMAIL) {
                            return [2 /*return*/, AuthController.createErrorResponse('Email Whitelisting is enabled. Please use the allowed email to login.', 403)];
                        }
                        authService = new AuthService_1.AuthService(env);
                        return [4 /*yield*/, authService.login(validatedData, request)];
                    case 2:
                        result = _a.sent();
                        response = AuthController.createSuccessResponse((0, authUtils_1.formatAuthResponse)(result.user, result.sessionId, result.expiresAt));
                        (0, authUtils_1.setSecureAuthCookies)(response, {
                            accessToken: result.accessToken,
                            accessTokenExpiry: SessionService_1.SessionService.config.sessionTTL
                        });
                        config = (0, security_1.getCSRFConfig)(env);
                        if (config.rotateOnAuth) {
                            CsrfService_1.CsrfService.rotateToken(response, env);
                        }
                        return [2 /*return*/, response];
                    case 3:
                        error_2 = _a.sent();
                        if (error_2 instanceof errors_1.SecurityError) {
                            return [2 /*return*/, AuthController.createErrorResponse(error_2.message, error_2.statusCode)];
                        }
                        return [2 /*return*/, AuthController.handleError(error_2, 'login user')];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Logout current user
     * POST /api/auth/logout
     */
    AuthController.logout = function (request, env, _ctx, _routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, sessionService, error_3, response, error_4, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        sessionId = (0, authUtils_1.extractSessionId)(request);
                        if (!sessionId) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        sessionService = new SessionService_1.SessionService(env);
                        return [4 /*yield*/, sessionService.revokeSessionId(sessionId)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        this.logger.debug('Failed to properly logout session', error_3);
                        return [3 /*break*/, 4];
                    case 4:
                        response = AuthController.createSuccessResponse({
                            success: true,
                            message: 'Logged out successfully'
                        });
                        (0, authUtils_1.clearAuthCookies)(response);
                        // Clear CSRF token on logout
                        CsrfService_1.CsrfService.clearTokenCookie(response);
                        return [2 /*return*/, response];
                    case 5:
                        error_4 = _a.sent();
                        this.logger.error('Logout failed', error_4);
                        response = AuthController.createSuccessResponse({
                            success: true,
                            message: 'Logged out'
                        });
                        (0, authUtils_1.clearAuthCookies)(response);
                        // Clear CSRF token on logout
                        CsrfService_1.CsrfService.clearTokenCookie(response);
                        return [2 /*return*/, response];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current user profile
     * GET /api/auth/profile
     */
    AuthController.getProfile = function (_request, _env, _ctx, routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (!routeContext.user) {
                        return [2 /*return*/, AuthController.createErrorResponse('Unauthorized', 401)];
                    }
                    return [2 /*return*/, AuthController.createSuccessResponse({
                            user: (0, authUtils_1.mapUserResponse)(routeContext.user),
                            sessionId: routeContext.sessionId
                        })];
                }
                catch (error) {
                    return [2 /*return*/, AuthController.handleError(error, 'get profile')];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update user profile
     * PUT /api/auth/profile
     */
    AuthController.updateProfile = function (request, env, _ctx, routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var user, bodyResult, updateData, userService, isAvailable, updatedUser, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        user = routeContext.user;
                        if (!user) {
                            return [2 /*return*/, AuthController.createErrorResponse('Unauthorized', 401)];
                        }
                        return [4 /*yield*/, AuthController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _a.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        updateData = bodyResult.data;
                        userService = new UserService_1.UserService(env);
                        if (!updateData.username) return [3 /*break*/, 3];
                        return [4 /*yield*/, userService.isUsernameAvailable(updateData.username, user.id)];
                    case 2:
                        isAvailable = _a.sent();
                        if (!isAvailable) {
                            return [2 /*return*/, AuthController.createErrorResponse('Username already taken', 400)];
                        }
                        _a.label = 3;
                    case 3: return [4 /*yield*/, userService.updateUserProfile(user.id, {
                            displayName: updateData.displayName,
                            username: updateData.username,
                            bio: updateData.bio,
                            avatarUrl: undefined,
                            timezone: updateData.timezone
                        })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, userService.findUserById(user.id)];
                    case 5:
                        updatedUser = _a.sent();
                        if (!updatedUser) {
                            return [2 /*return*/, AuthController.createErrorResponse('User not found', 404)];
                        }
                        return [2 /*return*/, AuthController.createSuccessResponse({
                                user: (0, authUtils_1.mapUserResponse)(updatedUser),
                                message: 'Profile updated successfully'
                            })];
                    case 6:
                        error_5 = _a.sent();
                        return [2 /*return*/, AuthController.handleError(error_5, 'update profile')];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initiate OAuth flow
     * GET /api/auth/oauth/:provider
     */
    AuthController.initiateOAuth = function (request, env, _ctx, routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedProvider, intendedRedirectUrl, authService, authUrl, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        validatedProvider = authSchemas_1.oauthProviderSchema.parse(routeContext.pathParams.provider);
                        intendedRedirectUrl = routeContext.queryParams.get('redirect_url') || undefined;
                        authService = new AuthService_1.AuthService(env);
                        return [4 /*yield*/, authService.getOAuthAuthorizationUrl(validatedProvider, request, intendedRedirectUrl)];
                    case 1:
                        authUrl = _a.sent();
                        return [2 /*return*/, Response.redirect(authUrl, 302)];
                    case 2:
                        error_6 = _a.sent();
                        this.logger.error('OAuth initiation failed', error_6);
                        if (error_6 instanceof errors_1.SecurityError) {
                            return [2 /*return*/, AuthController.createErrorResponse(error_6.message, error_6.statusCode)];
                        }
                        return [2 /*return*/, AuthController.handleError(error_6, 'initiate OAuth')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle OAuth callback
     * GET /api/auth/callback/:provider
     */
    AuthController.handleOAuthCallback = function (request, env, _ctx, routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedProvider, code, state, error, baseUrl_1, baseUrl_2, authService, result, baseUrl, redirectLocation, response, error_7, baseUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        validatedProvider = authSchemas_1.oauthProviderSchema.parse(routeContext.pathParams.provider);
                        code = routeContext.queryParams.get('code');
                        state = routeContext.queryParams.get('state');
                        error = routeContext.queryParams.get('error');
                        if (error) {
                            this.logger.error('OAuth provider returned error', { provider: validatedProvider, error: error });
                            baseUrl_1 = new URL(request.url).origin;
                            return [2 /*return*/, Response.redirect("".concat(baseUrl_1, "/?error=oauth_failed"), 302)];
                        }
                        if (!code || !state) {
                            baseUrl_2 = new URL(request.url).origin;
                            return [2 /*return*/, Response.redirect("".concat(baseUrl_2, "/?error=missing_params"), 302)];
                        }
                        authService = new AuthService_1.AuthService(env);
                        return [4 /*yield*/, authService.handleOAuthCallback(validatedProvider, code, state, request)];
                    case 1:
                        result = _a.sent();
                        baseUrl = new URL(request.url).origin;
                        redirectLocation = result.redirectUrl || "".concat(baseUrl, "/");
                        response = new Response(null, {
                            status: 302,
                            headers: {
                                'Location': redirectLocation
                            }
                        });
                        (0, authUtils_1.setSecureAuthCookies)(response, {
                            accessToken: result.accessToken,
                        });
                        return [2 /*return*/, response];
                    case 2:
                        error_7 = _a.sent();
                        this.logger.error('OAuth callback failed', error_7);
                        baseUrl = new URL(request.url).origin;
                        return [2 /*return*/, Response.redirect("".concat(baseUrl, "/?error=auth_failed"), 302)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check authentication status
     * GET /api/auth/check
     */
    AuthController.checkAuth = function (request, env, _ctx, _routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var userSession, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, auth_1.authMiddleware)(request, env)];
                    case 1:
                        userSession = _a.sent();
                        if (!userSession) {
                            return [2 /*return*/, AuthController.createSuccessResponse({
                                    authenticated: false,
                                    user: null
                                })];
                        }
                        return [2 /*return*/, AuthController.createSuccessResponse({
                                authenticated: true,
                                user: {
                                    id: userSession.user.id,
                                    email: userSession.user.email,
                                    displayName: userSession.user.displayName
                                },
                                sessionId: userSession.sessionId
                            })];
                    case 2:
                        error_8 = _a.sent();
                        return [2 /*return*/, AuthController.createSuccessResponse({
                                authenticated: false,
                                user: null
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get active sessions for current user
     * GET /api/auth/sessions
     */
    AuthController.getActiveSessions = function (_request, env, _ctx, routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var user, sessionService, sessions, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = routeContext.user;
                        if (!user) {
                            return [2 /*return*/, AuthController.createErrorResponse('Unauthorized', 401)];
                        }
                        sessionService = new SessionService_1.SessionService(env);
                        return [4 /*yield*/, sessionService.getUserSessions(user.id)];
                    case 1:
                        sessions = _a.sent();
                        return [2 /*return*/, AuthController.createSuccessResponse({
                                sessions: sessions
                            })];
                    case 2:
                        error_9 = _a.sent();
                        return [2 /*return*/, AuthController.handleError(error_9, 'get active sessions')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Revoke a specific session
     * DELETE /api/auth/sessions/:sessionId
     */
    AuthController.revokeSession = function (_request, env, _ctx, routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var user, sessionIdToRevoke, sessionService, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = routeContext.user;
                        if (!user) {
                            return [2 /*return*/, AuthController.createErrorResponse('Unauthorized', 401)];
                        }
                        sessionIdToRevoke = routeContext.pathParams.sessionId;
                        sessionService = new SessionService_1.SessionService(env);
                        return [4 /*yield*/, sessionService.revokeUserSession(sessionIdToRevoke, user.id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, AuthController.createSuccessResponse({
                                message: 'Session revoked successfully'
                            })];
                    case 2:
                        error_10 = _a.sent();
                        return [2 /*return*/, AuthController.handleError(error_10, 'revoke session')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get API keys for current user
     * GET /api/auth/api-keys
     */
    AuthController.getApiKeys = function (_request, env, _ctx, routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var user, apiKeyService, keys, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = routeContext.user;
                        if (!user) {
                            return [2 /*return*/, AuthController.createErrorResponse('Unauthorized', 401)];
                        }
                        apiKeyService = new ApiKeyService_1.ApiKeyService(env);
                        return [4 /*yield*/, apiKeyService.getUserApiKeys(user.id)];
                    case 1:
                        keys = _a.sent();
                        return [2 /*return*/, AuthController.createSuccessResponse({
                                keys: keys.map(function (key) { return ({
                                    id: key.id,
                                    name: key.name,
                                    keyPreview: key.keyPreview,
                                    createdAt: key.createdAt,
                                    lastUsed: key.lastUsed,
                                    isActive: !!key.isActive
                                }); })
                            })];
                    case 2:
                        error_11 = _a.sent();
                        return [2 /*return*/, AuthController.handleError(error_11, 'get API keys')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new API key
     * POST /api/auth/api-keys
     */
    AuthController.createApiKey = function (request, env, _ctx, routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var user, bodyResult, name, sanitizedName, _a, key, keyHash, keyPreview, apiKeyService, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        user = routeContext.user;
                        if (!user) {
                            return [2 /*return*/, AuthController.createErrorResponse('Unauthorized', 401)];
                        }
                        return [4 /*yield*/, AuthController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _b.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        name = bodyResult.data.name;
                        if (!name || typeof name !== 'string' || name.trim().length === 0) {
                            return [2 /*return*/, AuthController.createErrorResponse('API key name is required', 400)];
                        }
                        sanitizedName = name.trim().substring(0, 100);
                        return [4 /*yield*/, (0, cryptoUtils_1.generateApiKey)()];
                    case 2:
                        _a = _b.sent(), key = _a.key, keyHash = _a.keyHash, keyPreview = _a.keyPreview;
                        apiKeyService = new ApiKeyService_1.ApiKeyService(env);
                        return [4 /*yield*/, apiKeyService.createApiKey({
                                userId: user.id,
                                name: sanitizedName,
                                keyHash: keyHash,
                                keyPreview: keyPreview
                            })];
                    case 3:
                        _b.sent();
                        this.logger.info('API key created', { userId: user.id, name: sanitizedName });
                        return [2 /*return*/, AuthController.createSuccessResponse({
                                key: key, // Return the actual key only once
                                keyPreview: keyPreview,
                                name: sanitizedName,
                                message: 'API key created successfully'
                            })];
                    case 4:
                        error_12 = _b.sent();
                        return [2 /*return*/, AuthController.handleError(error_12, 'create API key')];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Revoke an API key
     * DELETE /api/auth/api-keys/:keyId
     */
    AuthController.revokeApiKey = function (_request, env, _ctx, routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var user, keyId, apiKeyService, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = routeContext.user;
                        if (!user) {
                            return [2 /*return*/, AuthController.createErrorResponse('Unauthorized', 401)];
                        }
                        keyId = routeContext.pathParams.keyId;
                        apiKeyService = new ApiKeyService_1.ApiKeyService(env);
                        return [4 /*yield*/, apiKeyService.revokeApiKey(keyId, user.id)];
                    case 1:
                        _a.sent();
                        this.logger.info('API key revoked', { userId: user.id, keyId: keyId });
                        return [2 /*return*/, AuthController.createSuccessResponse({
                                message: 'API key revoked successfully'
                            })];
                    case 2:
                        error_13 = _a.sent();
                        return [2 /*return*/, AuthController.handleError(error_13, 'revoke API key')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verify email with OTP
     * POST /api/auth/verify-email
     */
    AuthController.verifyEmail = function (request, env, _ctx, _routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var bodyResult, _a, email, otp, authService, result, response, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, AuthController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _b.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        _a = bodyResult.data, email = _a.email, otp = _a.otp;
                        if (!email || !otp) {
                            return [2 /*return*/, AuthController.createErrorResponse('Email and OTP are required', 400)];
                        }
                        authService = new AuthService_1.AuthService(env);
                        return [4 /*yield*/, authService.verifyEmailWithOtp(email, otp, request)];
                    case 2:
                        result = _b.sent();
                        response = AuthController.createSuccessResponse((0, authUtils_1.formatAuthResponse)(result.user, result.sessionId, result.expiresAt));
                        (0, authUtils_1.setSecureAuthCookies)(response, {
                            accessToken: result.accessToken,
                            accessTokenExpiry: SessionService_1.SessionService.config.sessionTTL
                        });
                        return [2 /*return*/, response];
                    case 3:
                        error_14 = _b.sent();
                        if (error_14 instanceof errors_1.SecurityError) {
                            return [2 /*return*/, AuthController.createErrorResponse(error_14.message, error_14.statusCode)];
                        }
                        return [2 /*return*/, AuthController.handleError(error_14, 'verify email')];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resend verification OTP
     * POST /api/auth/resend-verification
     */
    AuthController.resendVerificationOtp = function (request, env, _ctx, _routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var bodyResult, email, authService, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, AuthController.parseJsonBody(request)];
                    case 1:
                        bodyResult = _a.sent();
                        if (!bodyResult.success) {
                            return [2 /*return*/, bodyResult.response];
                        }
                        email = bodyResult.data.email;
                        if (!email) {
                            return [2 /*return*/, AuthController.createErrorResponse('Email is required', 400)];
                        }
                        authService = new AuthService_1.AuthService(env);
                        return [4 /*yield*/, authService.resendVerificationOtp(email)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, AuthController.createSuccessResponse({
                                message: 'Verification code sent successfully'
                            })];
                    case 3:
                        error_15 = _a.sent();
                        if (error_15 instanceof errors_1.SecurityError) {
                            return [2 /*return*/, AuthController.createErrorResponse(error_15.message, error_15.statusCode)];
                        }
                        return [2 /*return*/, AuthController.handleError(error_15, 'resend verification OTP')];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get CSRF token with proper expiration and rotation
     * GET /api/auth/csrf-token
     */
    AuthController.getCsrfToken = function (request, _env, _ctx, _routeContext) {
        return __awaiter(this, void 0, void 0, function () {
            var config, token, response;
            return __generator(this, function (_a) {
                try {
                    config = (0, security_1.getCSRFConfig)(_env);
                    token = CsrfService_1.CsrfService.getOrGenerateToken(request, _env, false);
                    response = AuthController.createSuccessResponse({
                        token: token,
                        headerName: config.headerName,
                        expiresIn: Math.floor(config.tokenTTL / 1000)
                    });
                    // Set the token in cookie with proper expiration
                    CsrfService_1.CsrfService.setTokenCookie(response, token, _env);
                    return [2 /*return*/, response];
                }
                catch (error) {
                    return [2 /*return*/, AuthController.handleError(error, 'get CSRF token')];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get available authentication providers
     * GET /api/auth/providers
     */
    AuthController.getAuthProviders = function (request, env, _ctx, _context) {
        return __awaiter(this, void 0, void 0, function () {
            var providers, config, csrfToken, response;
            return __generator(this, function (_a) {
                try {
                    providers = {
                        google: !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET,
                        github: !!env.GITHUB_CLIENT_ID && !!env.GITHUB_CLIENT_SECRET,
                        email: true
                    };
                    config = (0, security_1.getCSRFConfig)(env);
                    csrfToken = CsrfService_1.CsrfService.getOrGenerateToken(request, env, false);
                    response = AuthController.createSuccessResponse({
                        providers: providers,
                        hasOAuth: providers.google || providers.github,
                        requiresEmailAuth: !providers.google && !providers.github,
                        csrfToken: csrfToken,
                        csrfExpiresIn: Math.floor(config.tokenTTL / 1000)
                    });
                    // Set CSRF token cookie with proper expiration
                    CsrfService_1.CsrfService.setTokenCookie(response, csrfToken, env);
                    return [2 /*return*/, response];
                }
                catch (error) {
                    console.error('Get auth providers error:', error);
                    return [2 /*return*/, AuthController.createErrorResponse('Failed to get authentication providers', 500)];
                }
                return [2 /*return*/];
            });
        });
    };
    AuthController.logger = (0, logger_1.createLogger)('AuthController');
    return AuthController;
}(baseController_1.BaseController));
exports.AuthController = AuthController;
