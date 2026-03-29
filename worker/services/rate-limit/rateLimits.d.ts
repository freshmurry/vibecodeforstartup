import { RateLimitType, RateLimitSettings } from './config';
import { AuthUser } from '../../types/auth-types';
export declare class RateLimitService {
    static logger: import("../../logger").StructuredLogger;
    static buildRateLimitKey(rateLimitType: RateLimitType, identifier: string): string;
    static getUserIdentifier(user: AuthUser): Promise<string>;
    static getRequestIdentifier(request: Request): Promise<string>;
    static getUniversalIdentifier(user: AuthUser | null, request: Request): Promise<string>;
    /**
     * Durable Object-based rate limiting using bucketed sliding window algorithm
     * Provides better consistency and performance compared to KV
     */
    private static enforceDORateLimit;
    static applyUserConfigs(env: Env, config: RateLimitSettings, user: AuthUser | null, limitType: RateLimitType): Promise<RateLimitSettings>;
    static enforce(env: Env, key: string, user: AuthUser | null, config: RateLimitSettings, limitType: RateLimitType): Promise<boolean>;
    static enforceGlobalApiRateLimit(env: Env, config: RateLimitSettings, user: AuthUser | null, request: Request): Promise<void>;
    static enforceAuthRateLimit(env: Env, config: RateLimitSettings, user: AuthUser | null, request: Request): Promise<void>;
    static enforceAppCreationRateLimit(env: Env, config: RateLimitSettings, user: AuthUser, request: Request): Promise<void>;
    static enforceLLMCallsRateLimit(env: Env, config: RateLimitSettings, user: AuthUser): Promise<void>;
}
