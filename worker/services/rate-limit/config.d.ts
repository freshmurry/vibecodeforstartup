export declare enum RateLimitStore {
    KV = "kv",
    RATE_LIMITER = "rate_limiter",
    DURABLE_OBJECT = "durable_object"
}
export interface RateLimitConfigBase {
    enabled: boolean;
    store: RateLimitStore;
}
export interface KVRateLimitConfig extends RateLimitConfigBase {
    store: RateLimitStore.KV;
    limit: number;
    period: number;
    burst?: number;
    burstWindow?: number;
    bucketSize?: number;
}
export interface RLRateLimitConfig extends RateLimitConfigBase {
    store: RateLimitStore.RATE_LIMITER;
    bindingName: string;
}
export interface DORateLimitConfig extends RateLimitConfigBase {
    store: RateLimitStore.DURABLE_OBJECT;
    limit: number;
    period: number;
    burst?: number;
    burstWindow?: number;
    bucketSize?: number;
}
export type LLMCallsRateLimitConfig = (KVRateLimitConfig | DORateLimitConfig) & {
    excludeBYOKUsers: boolean;
};
export type RateLimitConfig = RLRateLimitConfig | KVRateLimitConfig | DORateLimitConfig | LLMCallsRateLimitConfig;
export declare enum RateLimitType {
    API_RATE_LIMIT = "apiRateLimit",
    AUTH_RATE_LIMIT = "authRateLimit",
    APP_CREATION = "appCreation",
    LLM_CALLS = "llmCalls"
}
export interface RateLimitSettings {
    [RateLimitType.API_RATE_LIMIT]: RLRateLimitConfig | DORateLimitConfig;
    [RateLimitType.AUTH_RATE_LIMIT]: RLRateLimitConfig | DORateLimitConfig;
    [RateLimitType.APP_CREATION]: KVRateLimitConfig | DORateLimitConfig;
    [RateLimitType.LLM_CALLS]: LLMCallsRateLimitConfig | DORateLimitConfig;
}
export declare const DEFAULT_RATE_LIMIT_SETTINGS: RateLimitSettings;
