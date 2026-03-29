"use strict";
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
exports.RateLimitService = void 0;
var config_1 = require("./config");
var logger_1 = require("../../logger");
var authUtils_1 = require("../../utils/authUtils");
var sentry_1 = require("../../observability/sentry");
var config_2 = require("../../config");
var KVRateLimitStore_1 = require("./KVRateLimitStore");
var errors_1 = require("../../../shared/types/errors");
var RateLimitService = /** @class */ (function () {
    function RateLimitService() {
    }
    RateLimitService.buildRateLimitKey = function (rateLimitType, identifier) {
        return "platform:".concat(rateLimitType, ":").concat(identifier);
    };
    RateLimitService.getUserIdentifier = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, "user:".concat(user.id)];
            });
        });
    };
    RateLimitService.getRequestIdentifier = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenResult, encoder, data, hashBuffer, hashArray, hashHex, metadata;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tokenResult = (0, authUtils_1.extractTokenWithMetadata)(request);
                        if (!tokenResult.token) return [3 /*break*/, 2];
                        encoder = new TextEncoder();
                        data = encoder.encode(tokenResult.token);
                        return [4 /*yield*/, crypto.subtle.digest('SHA-256', data)];
                    case 1:
                        hashBuffer = _b.sent();
                        hashArray = Array.from(new Uint8Array(hashBuffer));
                        hashHex = hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
                        return [2 /*return*/, "token:".concat(hashHex.slice(0, 16))];
                    case 2:
                        metadata = (0, authUtils_1.extractRequestMetadata)(request);
                        return [2 /*return*/, "ip:".concat(metadata.ipAddress)];
                }
            });
        });
    };
    RateLimitService.getUniversalIdentifier = function (user, request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                if (user) {
                    return [2 /*return*/, this.getUserIdentifier(user)];
                }
                return [2 /*return*/, this.getRequestIdentifier(request)];
            });
        });
    };
    /**
     * Durable Object-based rate limiting using bucketed sliding window algorithm
     * Provides better consistency and performance compared to KV
     */
    RateLimitService.enforceDORateLimit = function (env, key, config) {
        return __awaiter(this, void 0, void 0, function () {
            var stub, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        stub = env.DORateLimitStore.getByName(key);
                        return [4 /*yield*/, stub.increment(key, {
                                limit: config.limit,
                                period: config.period,
                                burst: config.burst,
                                burstWindow: config.burstWindow,
                                bucketSize: config.bucketSize
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result.success];
                    case 2:
                        error_1 = _b.sent();
                        this.logger.error('Failed to enforce DO rate limit', {
                            key: key,
                            error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        });
                        return [2 /*return*/, true]; // Fail open
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RateLimitService.applyUserConfigs = function (env, config, user, limitType) {
        return __awaiter(this, void 0, void 0, function () {
            var userConfigs;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(config[limitType].store !== config_1.RateLimitStore.RATE_LIMITER && user)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, config_2.getUserConfigurableSettings)(env, user.id, { security: { rateLimit: config } })];
                    case 1:
                        userConfigs = _b.sent();
                        config = userConfigs.security.rateLimit;
                        _b.label = 2;
                    case 2: return [2 /*return*/, config];
                }
            });
        });
    };
    RateLimitService.enforce = function (env, key, user, config, limitType) {
        return __awaiter(this, void 0, void 0, function () {
            var rateLimitConfig, success, _b, result, result;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.applyUserConfigs(env, config, user, limitType)];
                    case 1:
                        config = _c.sent();
                        rateLimitConfig = config[limitType];
                        success = false;
                        _b = rateLimitConfig.store;
                        switch (_b) {
                            case config_1.RateLimitStore.RATE_LIMITER: return [3 /*break*/, 2];
                            case config_1.RateLimitStore.KV: return [3 /*break*/, 4];
                            case config_1.RateLimitStore.DURABLE_OBJECT: return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2: return [4 /*yield*/, env[rateLimitConfig.bindingName].limit({ key: key })];
                    case 3:
                        result = _c.sent();
                        success = result.success;
                        return [3 /*break*/, 9];
                    case 4: return [4 /*yield*/, KVRateLimitStore_1.KVRateLimitStore.increment(env.VibecoderStore, key, rateLimitConfig)];
                    case 5:
                        result = _c.sent();
                        success = result.success;
                        return [3 /*break*/, 9];
                    case 6: return [4 /*yield*/, this.enforceDORateLimit(env, key, rateLimitConfig)];
                    case 7:
                        success = _c.sent();
                        return [3 /*break*/, 9];
                    case 8: return [2 /*return*/, false];
                    case 9: return [2 /*return*/, success];
                }
            });
        });
    };
    RateLimitService.enforceGlobalApiRateLimit = function (env, config, user, request) {
        return __awaiter(this, void 0, void 0, function () {
            var identifier, key, success, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!config[config_1.RateLimitType.API_RATE_LIMIT].enabled) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getUniversalIdentifier(user, request)];
                    case 1:
                        identifier = _b.sent();
                        key = this.buildRateLimitKey(config_1.RateLimitType.API_RATE_LIMIT, identifier);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.enforce(env, key, user, config, config_1.RateLimitType.API_RATE_LIMIT)];
                    case 3:
                        success = _b.sent();
                        if (!success) {
                            this.logger.warn('Global API rate limit exceeded', {
                                identifier: identifier,
                                key: key,
                                userAgent: request.headers.get('User-Agent'),
                                ip: request.headers.get('CF-Connecting-IP')
                            });
                            (0, sentry_1.captureSecurityEvent)('rate_limit_exceeded', {
                                limitType: config_1.RateLimitType.API_RATE_LIMIT,
                                identifier: identifier,
                                key: key,
                                userAgent: request.headers.get('User-Agent') || undefined,
                                ip: request.headers.get('CF-Connecting-IP') || undefined,
                            });
                            throw new errors_1.RateLimitExceededError("Global API rate limit exceeded", config_1.RateLimitType.API_RATE_LIMIT);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _b.sent();
                        if (error_2 instanceof errors_1.RateLimitExceededError || error_2 instanceof errors_1.SecurityError) {
                            throw error_2;
                        }
                        this.logger.error('Failed to enforce global API rate limit', error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RateLimitService.enforceAuthRateLimit = function (env, config, user, request) {
        return __awaiter(this, void 0, void 0, function () {
            var identifier, key, success, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!config[config_1.RateLimitType.AUTH_RATE_LIMIT].enabled) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getUniversalIdentifier(user, request)];
                    case 1:
                        identifier = _b.sent();
                        key = this.buildRateLimitKey(config_1.RateLimitType.AUTH_RATE_LIMIT, identifier);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.enforce(env, key, user, config, config_1.RateLimitType.AUTH_RATE_LIMIT)];
                    case 3:
                        success = _b.sent();
                        if (!success) {
                            this.logger.warn('Auth rate limit exceeded', {
                                identifier: identifier,
                                key: key,
                                userAgent: request.headers.get('User-Agent'),
                                ip: request.headers.get('CF-Connecting-IP')
                            });
                            (0, sentry_1.captureSecurityEvent)('rate_limit_exceeded', {
                                limitType: config_1.RateLimitType.AUTH_RATE_LIMIT,
                                identifier: identifier,
                                key: key,
                                userAgent: request.headers.get('User-Agent') || undefined,
                                ip: request.headers.get('CF-Connecting-IP') || undefined,
                            });
                            throw new errors_1.RateLimitExceededError("Auth rate limit exceeded", config_1.RateLimitType.AUTH_RATE_LIMIT);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _b.sent();
                        if (error_3 instanceof errors_1.RateLimitExceededError || error_3 instanceof errors_1.SecurityError) {
                            throw error_3;
                        }
                        this.logger.error('Failed to enforce auth rate limit', error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RateLimitService.enforceAppCreationRateLimit = function (env, config, user, request) {
        return __awaiter(this, void 0, void 0, function () {
            var identifier, key, success, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!config[config_1.RateLimitType.APP_CREATION].enabled) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getUserIdentifier(user)];
                    case 1:
                        identifier = _b.sent();
                        key = this.buildRateLimitKey(config_1.RateLimitType.APP_CREATION, identifier);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.enforce(env, key, user, config, config_1.RateLimitType.APP_CREATION)];
                    case 3:
                        success = _b.sent();
                        if (!success) {
                            this.logger.warn('App creation rate limit exceeded', {
                                identifier: identifier,
                                key: key,
                                userAgent: request.headers.get('User-Agent'),
                                ip: request.headers.get('CF-Connecting-IP')
                            });
                            (0, sentry_1.captureSecurityEvent)('rate_limit_exceeded', {
                                limitType: config_1.RateLimitType.APP_CREATION,
                                identifier: identifier,
                                key: key,
                                userAgent: request.headers.get('User-Agent') || undefined,
                                ip: request.headers.get('CF-Connecting-IP') || undefined,
                            });
                            throw new errors_1.RateLimitExceededError("App creation rate limit exceeded. Maximum ".concat(config.appCreation.limit, " apps per ").concat(config.appCreation.period / 3600, " hour").concat(config.appCreation.period >= 7200 ? 's' : ''), config_1.RateLimitType.APP_CREATION, config.appCreation.limit, config.appCreation.period, ['Please try again in an hour when the limit resets for you.']);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _b.sent();
                        if (error_4 instanceof errors_1.RateLimitExceededError || error_4 instanceof errors_1.SecurityError) {
                            throw error_4;
                        }
                        this.logger.error('Failed to enforce app creation rate limit', error_4);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RateLimitService.enforceLLMCallsRateLimit = function (env, config, user) {
        return __awaiter(this, void 0, void 0, function () {
            var identifier, key, success, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!config[config_1.RateLimitType.LLM_CALLS].enabled) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getUserIdentifier(user)];
                    case 1:
                        identifier = _b.sent();
                        key = this.buildRateLimitKey(config_1.RateLimitType.LLM_CALLS, identifier);
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.enforce(env, key, user, config, config_1.RateLimitType.LLM_CALLS)];
                    case 3:
                        success = _b.sent();
                        if (!success) {
                            this.logger.warn('LLM calls rate limit exceeded', {
                                identifier: identifier,
                                key: key,
                            });
                            (0, sentry_1.captureSecurityEvent)('rate_limit_exceeded', {
                                limitType: config_1.RateLimitType.LLM_CALLS,
                                identifier: identifier,
                                key: key,
                            });
                            throw new errors_1.RateLimitExceededError("AI inference rate limit exceeded. Maximum ".concat(config.llmCalls.limit, " calls per ").concat(config.llmCalls.period / 3600, " hour").concat(config.llmCalls.period >= 7200 ? 's' : '', ". Consider using your own API keys to remove this limit."), config_1.RateLimitType.LLM_CALLS, config.llmCalls.limit, config.llmCalls.period, ['Please try again in an hour when the limit resets for you.']);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _b.sent();
                        if (error_5 instanceof errors_1.RateLimitExceededError || error_5 instanceof errors_1.SecurityError) {
                            throw error_5;
                        }
                        this.logger.error('Failed to enforce LLM calls rate limit', error_5);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    var _a;
    _a = RateLimitService;
    RateLimitService.logger = (0, logger_1.createObjectLogger)(_a, 'RateLimitService');
    return RateLimitService;
}());
exports.RateLimitService = RateLimitService;
