"use strict";
/**
 * Route Authentication Middleware
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
exports.AuthConfig = void 0;
exports.routeAuthChecks = routeAuthChecks;
exports.enforceAuthRequirement = enforceAuthRequirement;
exports.setAuthLevel = setAuthLevel;
exports.checkAppOwnership = checkAppOwnership;
var factory_1 = require("hono/factory");
var logger_1 = require("../../logger");
var database_1 = require("../../database");
var auth_1 = require("./auth");
var rateLimits_1 = require("../../services/rate-limit/rateLimits");
var responses_1 = require("../../api/responses");
var errors_1 = require("../../../shared/types/errors");
var Sentry = require("@sentry/cloudflare");
var logger = (0, logger_1.createLogger)('RouteAuth');
/**
 * Common auth requirement configurations
 */
exports.AuthConfig = {
    // Public route - no authentication required
    public: {
        required: false,
        level: 'public'
    },
    // Require full authentication (no anonymous users)
    authenticated: {
        required: true,
        level: 'authenticated'
    },
    // Require resource ownership (for app editing)
    ownerOnly: {
        required: true,
        level: 'owner-only',
        resourceOwnershipCheck: checkAppOwnership
    },
    // Public read access, but owner required for modifications
    publicReadOwnerWrite: {
        required: false
    }
};
/**
 * Route authentication logic that enforces authentication requirements
 */
function routeAuthChecks(user, env, requirement, params) {
    return __awaiter(this, void 0, void 0, function () {
        var isOwner, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    // Public routes always pass
                    console.log('requirement', requirement, 'for user', user);
                    if (requirement.level === 'public') {
                        return [2 /*return*/, { success: true }];
                    }
                    // For authenticated routes
                    if (requirement.level === 'authenticated') {
                        if (!user) {
                            return [2 /*return*/, {
                                    success: false,
                                    response: createAuthRequiredResponse()
                                }];
                        }
                        return [2 /*return*/, { success: true }];
                    }
                    if (!(requirement.level === 'owner-only')) return [3 /*break*/, 4];
                    if (!user) {
                        return [2 /*return*/, {
                                success: false,
                                response: createAuthRequiredResponse('Account required')
                            }];
                    }
                    if (!requirement.resourceOwnershipCheck) return [3 /*break*/, 3];
                    if (!params) return [3 /*break*/, 2];
                    return [4 /*yield*/, requirement.resourceOwnershipCheck(user, params, env)];
                case 1:
                    isOwner = _a.sent();
                    return [2 /*return*/, {
                            success: isOwner,
                            response: isOwner ? undefined : createForbiddenResponse('You can only access your own resources')
                        }];
                case 2: return [2 /*return*/, {
                        success: false,
                        response: createForbiddenResponse('Invalid resource ownership')
                    }];
                case 3: return [2 /*return*/, { success: true }];
                case 4: 
                // Default fallback
                return [2 /*return*/, { success: true }];
                case 5:
                    error_1 = _a.sent();
                    logger.error('Error in route auth middleware', error_1);
                    return [2 /*return*/, {
                            success: false,
                            response: new Response(JSON.stringify({
                                success: false,
                                error: 'Authentication check failed'
                            }), {
                                status: 500,
                                headers: { 'Content-Type': 'application/json' }
                            })
                        }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/*
 * Enforce authentication requirement
 */
function enforceAuthRequirement(c) {
    return __awaiter(this, void 0, void 0, function () {
        var user, requirement, userSession, error_2, params, env, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = c.get('user') || null;
                    requirement = c.get('authLevel');
                    if (!requirement) {
                        logger.error('No authentication level found');
                        return [2 /*return*/, (0, responses_1.errorResponse)('No authentication level found', 500)];
                    }
                    if (!(!user && (requirement.level === 'authenticated' || requirement.level === 'owner-only'))) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, auth_1.authMiddleware)(c.req.raw, c.env)];
                case 1:
                    userSession = _a.sent();
                    if (!userSession) {
                        return [2 /*return*/, (0, responses_1.errorResponse)('Authentication required', 401)];
                    }
                    user = userSession.user;
                    c.set('user', user);
                    c.set('sessionId', userSession.sessionId);
                    Sentry.setUser({ id: user.id, email: user.email });
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, rateLimits_1.RateLimitService.enforceAuthRateLimit(c.env, c.get('config').security.rateLimit, user, c.req.raw)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    if (error_2 instanceof errors_1.RateLimitExceededError) {
                        return [2 /*return*/, (0, responses_1.errorResponse)(error_2, 429)];
                    }
                    logger.error('Error enforcing auth rate limit', error_2);
                    return [2 /*return*/, (0, responses_1.errorResponse)('Internal server error', 500)];
                case 5:
                    params = c.req.param();
                    env = c.env;
                    return [4 /*yield*/, routeAuthChecks(user, env, requirement, params)];
                case 6:
                    result = _a.sent();
                    if (!result.success) {
                        logger.warn('Authentication check failed', result.response);
                        return [2 /*return*/, result.response];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function setAuthLevel(requirement) {
    var _this = this;
    return (0, factory_1.createMiddleware)(function (c, next) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    c.set('authLevel', requirement);
                    return [4 /*yield*/, next()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); });
}
/**
 * Create standardized authentication required response
 */
function createAuthRequiredResponse(message) {
    return new Response(JSON.stringify({
        success: false,
        error: {
            type: 'AUTHENTICATION_REQUIRED',
            message: message || 'Authentication required',
            action: 'login'
        }
    }), {
        status: 401,
        headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Bearer realm="API"'
        }
    });
}
/**
 * Create standardized forbidden response
 */
function createForbiddenResponse(message) {
    return new Response(JSON.stringify({
        success: false,
        error: {
            type: 'FORBIDDEN',
            message: message,
            action: 'insufficient_permissions'
        }
    }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
    });
}
/**
 * Check if user owns an app by agent/app ID
 */
function checkAppOwnership(user, params, env) {
    return __awaiter(this, void 0, void 0, function () {
        var agentId, appService, ownershipResult, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    agentId = params.agentId || params.id;
                    if (!agentId) {
                        return [2 /*return*/, false];
                    }
                    appService = new database_1.AppService(env);
                    return [4 /*yield*/, appService.checkAppOwnership(agentId, user.id)];
                case 1:
                    ownershipResult = _a.sent();
                    return [2 /*return*/, ownershipResult.isOwner];
                case 2:
                    error_3 = _a.sent();
                    logger.error('Error checking app ownership', error_3);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
