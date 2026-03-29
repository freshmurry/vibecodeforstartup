/**
 * User Service
 * Handles all user-related database operations including sessions, teams, and profiles
 */
import { BaseService } from './BaseService';
import * as schema from '../schema';
import type { EnhancedAppData, AppQueryOptions, EnhancedUserStats, UserActivity } from '../types';
/**
 * User Service Class
 */
export declare class UserService extends BaseService {
    createUser(userData: schema.NewUser): Promise<schema.User>;
    findUserByEmail(email: string): Promise<schema.User | null>;
    findUserById(id: string): Promise<schema.User | null>;
    findUserByProvider(provider: string, providerId: string): Promise<schema.User | null>;
    updateUserActivity(userId: string): Promise<void>;
    createSession(sessionData: schema.NewSession): Promise<schema.Session>;
    findValidSession(sessionId: string): Promise<schema.Session | null>;
    cleanupExpiredSessions(): Promise<void>;
    /**
     * Get user apps with analytics data integrated
     */
    getUserAppsWithAnalytics(userId: string, options?: Partial<AppQueryOptions>): Promise<EnhancedAppData[]>;
    /**
     * Get total count of user apps with filters (for pagination)
     */
    getUserAppsCount(userId: string, options?: Partial<AppQueryOptions>): Promise<number>;
    /**
     * Update user profile directly
     */
    updateUserProfile(userId: string, profileData: {
        displayName?: string;
        username?: string;
        bio?: string;
        avatarUrl?: string;
        timezone?: string;
    }): Promise<void>;
    /**
     * Check if username is available
     */
    isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean>;
    /**
     * Update user profile with comprehensive validation
     */
    updateUserProfileWithValidation(userId: string, profileData: {
        username?: string;
        displayName?: string;
        bio?: string;
        theme?: 'light' | 'dark' | 'system';
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get basic user statistics efficiently
     */
    getUserStatisticsBasic(userId: string): Promise<{
        totalApps: number;
        appsThisMonth: number;
    }>;
    /**
     * Get comprehensive user statistics for stats controller
     */
    getUserStatisticsEnhanced(userId: string): Promise<EnhancedUserStats>;
    /**
     * Get user activity timeline for stats controller
     */
    getUserActivityTimeline(userId: string, limit?: number): Promise<UserActivity[]>;
}
