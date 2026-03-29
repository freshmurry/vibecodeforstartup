"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_RATE_LIMIT_SETTINGS = exports.RateLimitType = exports.RateLimitStore = void 0;
var RateLimitStore;
(function (RateLimitStore) {
    RateLimitStore["KV"] = "kv";
    RateLimitStore["RATE_LIMITER"] = "rate_limiter";
    RateLimitStore["DURABLE_OBJECT"] = "durable_object";
})(RateLimitStore || (exports.RateLimitStore = RateLimitStore = {}));
var RateLimitType;
(function (RateLimitType) {
    RateLimitType["API_RATE_LIMIT"] = "apiRateLimit";
    RateLimitType["AUTH_RATE_LIMIT"] = "authRateLimit";
    RateLimitType["APP_CREATION"] = "appCreation";
    RateLimitType["LLM_CALLS"] = "llmCalls";
})(RateLimitType || (exports.RateLimitType = RateLimitType = {}));
exports.DEFAULT_RATE_LIMIT_SETTINGS = {
    apiRateLimit: {
        enabled: true,
        store: RateLimitStore.RATE_LIMITER,
        bindingName: 'API_RATE_LIMITER',
    },
    authRateLimit: {
        enabled: true,
        store: RateLimitStore.RATE_LIMITER,
        bindingName: 'AUTH_RATE_LIMITER',
    },
    appCreation: {
        enabled: true,
        store: RateLimitStore.DURABLE_OBJECT,
        limit: 10,
        period: 3600, // 1 hour
    },
    llmCalls: {
        enabled: true,
        store: RateLimitStore.DURABLE_OBJECT,
        limit: 100,
        period: 3600, // 1 hour
        excludeBYOKUsers: true,
    },
};
