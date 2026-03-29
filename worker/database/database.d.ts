/**
 * Core Database Service
 * Provides database connection, core utilities, and base operations∂ƒ
 */
import { drizzle } from 'drizzle-orm/d1';
import type { HealthStatusResult } from './types';
export interface DatabaseEnv {
    DB: D1Database;
}
export type { User, NewUser, Session, NewSession, App, NewApp, AppLike, NewAppLike, AppComment, NewAppComment, AppView, NewAppView, OAuthState, NewOAuthState, SystemSetting, NewSystemSetting, UserSecret, NewUserSecret, UserModelConfig, NewUserModelConfig, } from './schema';
/**
 * Core Database Service - Connection and Base Operations
 *
 * Provides database connection, shared utilities, and core operations.
 * Domain-specific operations are handled by dedicated service classes.
 */
export declare class DatabaseService {
    readonly db: ReturnType<typeof drizzle>;
    constructor(env: DatabaseEnv);
    getHealthStatus(): Promise<HealthStatusResult>;
}
/**
 * Factory function to create database service instance
 */
export declare function createDatabaseService(env: DatabaseEnv): DatabaseService;
