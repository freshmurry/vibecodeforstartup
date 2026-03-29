"use strict";
/**
 * Main Authentication Service
 * Orchestrates all auth operations including login, registration, and OAuth
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
exports.AuthService = void 0;
var schema = require("../schema");
var drizzle_orm_1 = require("drizzle-orm");
var jwtUtils_1 = require("../../utils/jwtUtils");
var cryptoUtils_1 = require("../../utils/cryptoUtils");
var SessionService_1 = require("./SessionService");
var passwordService_1 = require("../../utils/passwordService");
var google_1 = require("../../services/oauth/google");
var github_1 = require("../../services/oauth/github");
var base_1 = require("../../services/oauth/base");
var errors_1 = require("../../../shared/types/errors");
var idGenerator_1 = require("../../utils/idGenerator");
var authUtils_1 = require("../../utils/authUtils");
var logger_1 = require("../../logger");
var validationUtils_1 = require("../../utils/validationUtils");
var authUtils_2 = require("../../utils/authUtils");
var BaseService_1 = require("./BaseService");
var logger = (0, logger_1.createLogger)('AuthService');
/**
 * Main Authentication Service
 */
var AuthService = /** @class */ (function (_super) {
    __extends(AuthService, _super);
    function AuthService(env) {
        var _this = _super.call(this, env) || this;
        _this.sessionService = new SessionService_1.SessionService(env);
        _this.passwordService = new passwordService_1.PasswordService();
        return _this;
    }
    /**
     * Register a new user
     */
    AuthService.prototype.register = function (data, request) {
        return __awaiter(this, void 0, void 0, function () {
            var emailValidation, passwordValidation, existingUser, passwordHash, userId, now, newUser, _a, accessToken, session, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 9]);
                        emailValidation = (0, validationUtils_1.validateEmail)(data.email);
                        if (!emailValidation.valid) {
                            throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, emailValidation.error || 'Invalid email format', 400);
                        }
                        passwordValidation = (0, validationUtils_1.validatePassword)(data.password, undefined, {
                            email: data.email,
                            name: data.name
                        });
                        if (!passwordValidation.valid) {
                            throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, passwordValidation.errors.join(', '), 400);
                        }
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.users)
                                .where((0, drizzle_orm_1.eq)(schema.users.email, data.email.toLowerCase()))
                                .get()];
                    case 1:
                        existingUser = _b.sent();
                        if (existingUser) {
                            throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'Email already registered', 400);
                        }
                        return [4 /*yield*/, this.passwordService.hash(data.password)];
                    case 2:
                        passwordHash = _b.sent();
                        userId = (0, idGenerator_1.generateId)();
                        now = new Date();
                        // Store user as verified immediately (no OTP verification required)
                        return [4 /*yield*/, this.database.insert(schema.users).values({
                                id: userId,
                                email: data.email.toLowerCase(),
                                passwordHash: passwordHash,
                                displayName: data.name || data.email.split('@')[0],
                                emailVerified: true, // Set as verified immediately
                                provider: 'email',
                                providerId: userId,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 3:
                        // Store user as verified immediately (no OTP verification required)
                        _b.sent();
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.users)
                                .where((0, drizzle_orm_1.eq)(schema.users.id, userId))
                                .get()];
                    case 4:
                        newUser = _b.sent();
                        if (!newUser) {
                            throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'Failed to retrieve created user', 500);
                        }
                        // Log successful registration
                        return [4 /*yield*/, this.logAuthAttempt(data.email, 'register', true, request)];
                    case 5:
                        // Log successful registration
                        _b.sent();
                        logger.info('User registered and logged in directly', { userId: userId, email: data.email });
                        return [4 /*yield*/, this.sessionService.createSession(userId, request)];
                    case 6:
                        _a = _b.sent(), accessToken = _a.accessToken, session = _a.session;
                        return [2 /*return*/, {
                                user: (0, authUtils_1.mapUserResponse)(newUser),
                                sessionId: session.sessionId,
                                expiresAt: session.expiresAt,
                                accessToken: accessToken,
                            }];
                    case 7:
                        error_1 = _b.sent();
                        return [4 /*yield*/, this.logAuthAttempt(data.email, 'register', false, request)];
                    case 8:
                        _b.sent();
                        if (error_1 instanceof errors_1.SecurityError) {
                            throw error_1;
                        }
                        logger.error('Registration error', error_1);
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'Registration failed', 500);
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Login with email and password
     */
    AuthService.prototype.login = function (credentials, request) {
        return __awaiter(this, void 0, void 0, function () {
            var user, passwordValid, _a, accessToken, session, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.users)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.email, credentials.email.toLowerCase()), (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " IS NULL"], ["", " IS NULL"])), schema.users.deletedAt)))
                                .get()];
                    case 1:
                        user = _b.sent();
                        if (!(!user || !user.passwordHash)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.logAuthAttempt(credentials.email, 'login', false, request)];
                    case 2:
                        _b.sent();
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.UNAUTHORIZED, 'Invalid email or password', 401);
                    case 3: return [4 /*yield*/, this.passwordService.verify(credentials.password, user.passwordHash)];
                    case 4:
                        passwordValid = _b.sent();
                        if (!!passwordValid) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.logAuthAttempt(credentials.email, 'login', false, request)];
                    case 5:
                        _b.sent();
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.UNAUTHORIZED, 'Invalid email or password', 401);
                    case 6: return [4 /*yield*/, this.sessionService.createSession(user.id, request)];
                    case 7:
                        _a = _b.sent(), accessToken = _a.accessToken, session = _a.session;
                        // Log successful attempt
                        return [4 /*yield*/, this.logAuthAttempt(credentials.email, 'login', true, request)];
                    case 8:
                        // Log successful attempt
                        _b.sent();
                        logger.info('User logged in', { userId: user.id, email: user.email });
                        return [2 /*return*/, {
                                user: (0, authUtils_1.mapUserResponse)(user),
                                accessToken: accessToken,
                                sessionId: session.sessionId,
                                expiresAt: session.expiresAt,
                            }];
                    case 9:
                        error_2 = _b.sent();
                        if (error_2 instanceof errors_1.SecurityError) {
                            throw error_2;
                        }
                        logger.error('Login error', error_2);
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.UNAUTHORIZED, 'Login failed', 500);
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Logout
     */
    AuthService.prototype.logout = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sessionService.revokeSessionId(sessionId)];
                    case 1:
                        _a.sent();
                        logger.info('User logged out', { sessionId: sessionId });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        logger.error('Logout error', error_3);
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.UNAUTHORIZED, 'Logout failed', 500);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AuthService.prototype.getOauthProvider = function (provider, request) {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                url = new URL(request.url).origin;
                switch (provider) {
                    case 'google':
                        return [2 /*return*/, google_1.GoogleOAuthProvider.create(this.env, url)];
                    case 'github':
                        return [2 /*return*/, github_1.GitHubOAuthProvider.create(this.env, url)];
                    default:
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, "OAuth provider ".concat(provider, " not configured"), 400);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get OAuth authorization URL
     */
    AuthService.prototype.getOAuthAuthorizationUrl = function (provider, request, intendedRedirectUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var oauthProvider, validatedRedirectUrl, state, codeVerifier, authUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getOauthProvider(provider, request)];
                    case 1:
                        oauthProvider = _a.sent();
                        if (!oauthProvider) {
                            throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, "OAuth provider ".concat(provider, " not configured"), 400);
                        }
                        // Clean up expired OAuth states first
                        return [4 /*yield*/, this.cleanupExpiredOAuthStates()];
                    case 2:
                        // Clean up expired OAuth states first
                        _a.sent();
                        validatedRedirectUrl = null;
                        if (intendedRedirectUrl) {
                            validatedRedirectUrl = this.validateRedirectUrl(intendedRedirectUrl, request);
                        }
                        state = (0, cryptoUtils_1.generateSecureToken)();
                        codeVerifier = base_1.BaseOAuthProvider.generateCodeVerifier();
                        // Store OAuth state with intended redirect URL
                        return [4 /*yield*/, this.database.insert(schema.oauthStates).values({
                                id: (0, idGenerator_1.generateId)(),
                                state: state,
                                provider: provider,
                                codeVerifier: codeVerifier,
                                redirectUri: validatedRedirectUrl || oauthProvider['redirectUri'],
                                createdAt: new Date(),
                                expiresAt: new Date(Date.now() + 600000), // 10 minutes
                                isUsed: false,
                                scopes: [],
                                userId: null,
                                nonce: null
                            })];
                    case 3:
                        // Store OAuth state with intended redirect URL
                        _a.sent();
                        return [4 /*yield*/, oauthProvider.getAuthorizationUrl(state, codeVerifier)];
                    case 4:
                        authUrl = _a.sent();
                        logger.info('OAuth authorization initiated', { provider: provider });
                        return [2 /*return*/, authUrl];
                }
            });
        });
    };
    /**
     * Clean up expired OAuth states
     */
    AuthService.prototype.cleanupExpiredOAuthStates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        now = new Date();
                        return [4 /*yield*/, this.database
                                .delete(schema.oauthStates)
                                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.lt)(schema.oauthStates.expiresAt, now), (0, drizzle_orm_1.eq)(schema.oauthStates.isUsed, true)))];
                    case 1:
                        _a.sent();
                        logger.debug('Cleaned up expired OAuth states');
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        logger.error('Error cleaning up OAuth states', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle OAuth callback
     */
    AuthService.prototype.handleOAuthCallback = function (provider, code, state, request) {
        return __awaiter(this, void 0, void 0, function () {
            var oauthProvider, now, oauthState, tokens, oauthUserInfo, user, _a, sessionAccessToken, session, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 11]);
                        return [4 /*yield*/, this.getOauthProvider(provider, request)];
                    case 1:
                        oauthProvider = _b.sent();
                        if (!oauthProvider) {
                            throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, "OAuth provider ".concat(provider, " not configured"), 400);
                        }
                        now = new Date();
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.oauthStates)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.oauthStates.state, state), (0, drizzle_orm_1.eq)(schema.oauthStates.provider, provider), (0, drizzle_orm_1.eq)(schema.oauthStates.isUsed, false)))
                                .get()];
                    case 2:
                        oauthState = _b.sent();
                        if (!oauthState || new Date(oauthState.expiresAt) < now) {
                            throw new errors_1.SecurityError(errors_1.SecurityErrorType.CSRF_VIOLATION, 'Invalid or expired OAuth state', 400);
                        }
                        // Mark state as used
                        return [4 /*yield*/, this.database
                                .update(schema.oauthStates)
                                .set({ isUsed: true })
                                .where((0, drizzle_orm_1.eq)(schema.oauthStates.id, oauthState.id))];
                    case 3:
                        // Mark state as used
                        _b.sent();
                        return [4 /*yield*/, oauthProvider.exchangeCodeForTokens(code, oauthState.codeVerifier || undefined)];
                    case 4:
                        tokens = _b.sent();
                        return [4 /*yield*/, oauthProvider.getUserInfo(tokens.accessToken)];
                    case 5:
                        oauthUserInfo = _b.sent();
                        return [4 /*yield*/, this.findOrCreateOAuthUser(provider, oauthUserInfo)];
                    case 6:
                        user = _b.sent();
                        return [4 /*yield*/, this.sessionService.createSession(user.id, request)];
                    case 7:
                        _a = _b.sent(), sessionAccessToken = _a.accessToken, session = _a.session;
                        // Log auth attempt
                        return [4 /*yield*/, this.logAuthAttempt(user.email, "oauth_".concat(provider), true, request)];
                    case 8:
                        // Log auth attempt
                        _b.sent();
                        logger.info('OAuth login successful', { userId: user.id, provider: provider });
                        return [2 /*return*/, {
                                user: (0, authUtils_1.mapUserResponse)(user),
                                accessToken: sessionAccessToken,
                                sessionId: session.sessionId,
                                expiresAt: session.expiresAt,
                                redirectUrl: oauthState.redirectUri || undefined
                            }];
                    case 9:
                        error_5 = _b.sent();
                        return [4 /*yield*/, this.logAuthAttempt('', "oauth_".concat(provider), false, request)];
                    case 10:
                        _b.sent();
                        if (error_5 instanceof errors_1.SecurityError) {
                            throw error_5;
                        }
                        logger.error('OAuth callback error', error_5);
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.UNAUTHORIZED, 'OAuth authentication failed', 500);
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find or create OAuth user
     */
    AuthService.prototype.findOrCreateOAuthUser = function (provider, oauthUserInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var user, userId, now;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.database
                            .select()
                            .from(schema.users)
                            .where((0, drizzle_orm_1.eq)(schema.users.email, oauthUserInfo.email.toLowerCase()))
                            .get()];
                    case 1:
                        user = _a.sent();
                        if (!!user) return [3 /*break*/, 4];
                        userId = (0, idGenerator_1.generateId)();
                        now = new Date();
                        return [4 /*yield*/, this.database.insert(schema.users).values({
                                id: userId,
                                email: oauthUserInfo.email.toLowerCase(),
                                displayName: oauthUserInfo.name || oauthUserInfo.email.split('@')[0],
                                avatarUrl: oauthUserInfo.picture,
                                emailVerified: oauthUserInfo.emailVerified || false,
                                provider: provider,
                                providerId: oauthUserInfo.id,
                                createdAt: now,
                                updatedAt: now
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.users)
                                .where((0, drizzle_orm_1.eq)(schema.users.id, userId))
                                .get()];
                    case 3:
                        user = _a.sent();
                        return [3 /*break*/, 7];
                    case 4: 
                    // Always update OAuth info and user data on login
                    return [4 /*yield*/, this.database
                            .update(schema.users)
                            .set({
                            displayName: oauthUserInfo.name || user.displayName,
                            avatarUrl: oauthUserInfo.picture || user.avatarUrl,
                            provider: provider,
                            providerId: oauthUserInfo.id,
                            emailVerified: oauthUserInfo.emailVerified || user.emailVerified,
                            updatedAt: new Date()
                        })
                            .where((0, drizzle_orm_1.eq)(schema.users.id, user.id))];
                    case 5:
                        // Always update OAuth info and user data on login
                        _a.sent();
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.users)
                                .where((0, drizzle_orm_1.eq)(schema.users.id, user.id))
                                .get()];
                    case 6:
                        // Refresh user data after updates
                        user = _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/, user];
                }
            });
        });
    };
    /**
     * Log authentication attempt
     */
    AuthService.prototype.logAuthAttempt = function (identifier, attemptType, success, request) {
        return __awaiter(this, void 0, void 0, function () {
            var requestMetadata, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        requestMetadata = (0, authUtils_2.extractRequestMetadata)(request);
                        return [4 /*yield*/, this.database.insert(schema.authAttempts).values({
                                identifier: identifier.toLowerCase(),
                                attemptType: attemptType,
                                success: success,
                                ipAddress: requestMetadata.ipAddress
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        logger.error('Failed to log auth attempt', error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate and sanitize redirect URL to prevent open redirect attacks
     */
    AuthService.prototype.validateRedirectUrl = function (redirectUrl, request) {
        try {
            var requestUrl = new URL(request.url);
            // Handle relative URLs by constructing absolute URL with same origin
            var redirectUrlObj_1 = redirectUrl.startsWith('/')
                ? new URL(redirectUrl, requestUrl.origin)
                : new URL(redirectUrl);
            // Only allow same-origin redirects for security
            if (redirectUrlObj_1.origin !== requestUrl.origin) {
                logger.warn('OAuth redirect URL rejected: different origin', {
                    redirectUrl: redirectUrl,
                    requestOrigin: requestUrl.origin,
                    redirectOrigin: redirectUrlObj_1.origin
                });
                return null;
            }
            // Prevent redirecting to authentication endpoints to avoid loops
            var authPaths = ['/api/auth/', '/logout'];
            if (authPaths.some(function (path) { return redirectUrlObj_1.pathname.startsWith(path); })) {
                logger.warn('OAuth redirect URL rejected: auth endpoint', {
                    redirectUrl: redirectUrl,
                    pathname: redirectUrlObj_1.pathname
                });
                return null;
            }
            return redirectUrl;
        }
        catch (error) {
            logger.warn('Invalid OAuth redirect URL format', { redirectUrl: redirectUrl, error: error });
            return null;
        }
    };
    /**
     * Generate and store verification OTP for email
     */
    AuthService.prototype.generateAndStoreVerificationOtp = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var otp, expiresAt, _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        otp = Math.floor(100000 + Math.random() * 900000).toString();
                        expiresAt = new Date(Date.now() + 15 * 60 * 1000);
                        _b = (_a = this.database.insert(schema.verificationOtps)).values;
                        _c = {
                            id: (0, idGenerator_1.generateId)(),
                            email: email.toLowerCase()
                        };
                        return [4 /*yield*/, this.passwordService.hash(otp)];
                    case 1: // 15 minutes expiry
                    // Store OTP in database (you may need to create a verification_otps table)
                    return [4 /*yield*/, _b.apply(_a, [(_c.otp = _d.sent(),
                                _c.expiresAt = expiresAt,
                                _c.createdAt = new Date(),
                                _c)])];
                    case 2:
                        // Store OTP in database (you may need to create a verification_otps table)
                        _d.sent();
                        // TODO: Send email with OTP (integrate with email service)
                        logger.info('Verification OTP generated', { email: email, otp: otp.slice(0, 2) + '****' });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verify email with OTP
     */
    AuthService.prototype.verifyEmailWithOtp = function (email, otp, request) {
        return __awaiter(this, void 0, void 0, function () {
            var storedOtp, otpValid, user, _a, accessToken, session, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 10]);
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.verificationOtps)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.verificationOtps.email, email.toLowerCase()), (0, drizzle_orm_1.eq)(schema.verificationOtps.used, false), (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", " > ", ""], ["", " > ", ""])), schema.verificationOtps.expiresAt, new Date())))
                                .orderBy((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", " DESC"], ["", " DESC"])), schema.verificationOtps.createdAt))
                                .get()];
                    case 1:
                        storedOtp = _b.sent();
                        if (!storedOtp) {
                            throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'Invalid or expired verification code', 400);
                        }
                        return [4 /*yield*/, this.passwordService.verify(otp, storedOtp.otp)];
                    case 2:
                        otpValid = _b.sent();
                        if (!otpValid) {
                            throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'Invalid verification code', 400);
                        }
                        // Mark OTP as used
                        return [4 /*yield*/, this.database
                                .update(schema.verificationOtps)
                                .set({ used: true, usedAt: new Date() })
                                .where((0, drizzle_orm_1.eq)(schema.verificationOtps.id, storedOtp.id))];
                    case 3:
                        // Mark OTP as used
                        _b.sent();
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.users)
                                .where((0, drizzle_orm_1.eq)(schema.users.email, email.toLowerCase()))
                                .get()];
                    case 4:
                        user = _b.sent();
                        if (!user) {
                            throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'User not found', 404);
                        }
                        // Update user as verified
                        return [4 /*yield*/, this.database
                                .update(schema.users)
                                .set({ emailVerified: true, updatedAt: new Date() })
                                .where((0, drizzle_orm_1.eq)(schema.users.id, user.id))];
                    case 5:
                        // Update user as verified
                        _b.sent();
                        return [4 /*yield*/, this.sessionService.createSession(user.id, request)];
                    case 6:
                        _a = _b.sent(), accessToken = _a.accessToken, session = _a.session;
                        // Log successful verification
                        return [4 /*yield*/, this.logAuthAttempt(email, 'email_verification', true, request)];
                    case 7:
                        // Log successful verification
                        _b.sent();
                        logger.info('Email verified successfully', { email: email, userId: user.id });
                        return [2 /*return*/, {
                                user: (0, authUtils_1.mapUserResponse)(__assign(__assign({}, user), { emailVerified: true })),
                                accessToken: accessToken,
                                sessionId: session.sessionId,
                                expiresAt: session.expiresAt,
                            }];
                    case 8:
                        error_7 = _b.sent();
                        return [4 /*yield*/, this.logAuthAttempt(email, 'email_verification', false, request)];
                    case 9:
                        _b.sent();
                        if (error_7 instanceof errors_1.SecurityError) {
                            throw error_7;
                        }
                        logger.error('Email verification error', error_7);
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'Email verification failed', 500);
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get user for authentication (for middleware)
     */
    AuthService.prototype.getUserForAuth = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.database
                                .select({
                                id: schema.users.id,
                                email: schema.users.email,
                                displayName: schema.users.displayName,
                                username: schema.users.username,
                                avatarUrl: schema.users.avatarUrl,
                                bio: schema.users.bio,
                                timezone: schema.users.timezone,
                                provider: schema.users.provider,
                                emailVerified: schema.users.emailVerified,
                                createdAt: schema.users.createdAt,
                            })
                                .from(schema.users)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.users.id, userId), (0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["", " IS NULL"], ["", " IS NULL"])), schema.users.deletedAt)))
                                .get()];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, (0, authUtils_1.mapUserResponse)(user)];
                    case 2:
                        error_8 = _a.sent();
                        logger.error('Error getting user for auth', error_8);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate token and return user (for middleware)
     */
    AuthService.prototype.validateTokenAndGetUser = function (token, env) {
        return __awaiter(this, void 0, void 0, function () {
            var jwtUtils, payload, user, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        jwtUtils = jwtUtils_1.JWTUtils.getInstance(env);
                        return [4 /*yield*/, jwtUtils.verifyToken(token)];
                    case 1:
                        payload = _a.sent();
                        if (!payload || payload.type !== 'access') {
                            return [2 /*return*/, null];
                        }
                        // Check if token is expired
                        if (payload.exp * 1000 < Date.now()) {
                            logger.debug('Token expired', { exp: payload.exp });
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.getUserForAuth(payload.sub)];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                user: user,
                                sessionId: payload.sessionId,
                            }];
                    case 3:
                        error_9 = _a.sent();
                        logger.error('Token validation error', error_9);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resend verification OTP
     */
    AuthService.prototype.resendVerificationOtp = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.database
                                .select()
                                .from(schema.users)
                                .where((0, drizzle_orm_1.eq)(schema.users.email, email.toLowerCase()))
                                .get()];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'No account found with this email', 404);
                        }
                        if (user.emailVerified) {
                            throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'Email is already verified', 400);
                        }
                        // Invalidate existing OTPs
                        return [4 /*yield*/, this.database
                                .update(schema.verificationOtps)
                                .set({ used: true, usedAt: new Date() })
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.verificationOtps.email, email.toLowerCase()), (0, drizzle_orm_1.eq)(schema.verificationOtps.used, false)))];
                    case 2:
                        // Invalidate existing OTPs
                        _a.sent();
                        // Generate new OTP
                        return [4 /*yield*/, this.generateAndStoreVerificationOtp(email.toLowerCase())];
                    case 3:
                        // Generate new OTP
                        _a.sent();
                        logger.info('Verification OTP resent', { email: email });
                        return [3 /*break*/, 5];
                    case 4:
                        error_10 = _a.sent();
                        if (error_10 instanceof errors_1.SecurityError) {
                            throw error_10;
                        }
                        logger.error('Resend verification OTP error', error_10);
                        throw new errors_1.SecurityError(errors_1.SecurityErrorType.INVALID_INPUT, 'Failed to resend verification code', 500);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return AuthService;
}(BaseService_1.BaseService));
exports.AuthService = AuthService;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
