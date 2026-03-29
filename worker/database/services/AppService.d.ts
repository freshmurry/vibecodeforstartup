/**
 * App Service
 * Handles all app-related database operations including favorites, views, stars, and forking
 */
import { BaseService } from './BaseService';
import * as schema from '../schema';
import type { EnhancedAppData, AppWithFavoriteStatus, FavoriteToggleResult, PaginatedResult, PaginationOptions, AppQueryOptions, PublicAppQueryOptions, OwnershipResult, AppVisibilityUpdateResult } from '../types';
/**
 * App with only favorite apps (always true) - Service specific
 */
interface FavoriteAppResult extends schema.App {
    isFavorite: true;
    updatedAtFormatted: string;
}
/**
 * App Service Class
 * Comprehensive app management operations
 */
export declare class AppService extends BaseService {
    /**
     * Algorithm configuration constants for popularity and trending ranking
     * Based on industry-standard practices from Reddit, Hacker News, etc.
     */
    private readonly RANKING_CONFIG;
    /**
     * Helper function to create favorite status query
     */
    private createFavoriteStatusQuery;
    /**
     * Create a new app with full schema data
     */
    createApp(appData: schema.NewApp): Promise<schema.App>;
    getUserApps(userId: string, options?: AppQueryOptions): Promise<schema.App[]>;
    /**
     * Get public apps with user stats and pagination
     * Uses optimized queries with aggregations for performance
     */
    getPublicAppsEnhanced(options?: PublicAppQueryOptions): Promise<PaginatedResult<EnhancedAppData>>;
    /**
     * Helper to build common app filters (framework and search)
     * Used by both user apps and public apps to avoid duplication
     */
    private buildCommonAppFilters;
    /**
     * Helper to build public app query conditions
     */
    private buildPublicAppConditions;
    /**
     * Update app record in database
     */
    updateApp(appId: string, updates: Partial<typeof schema.apps.$inferInsert>): Promise<boolean>;
    /**
     * Update app deployment ID
     */
    updateDeploymentId(appId: string, deploymentId: string): Promise<boolean>;
    /**
     * Update app with GitHub repository URL and visibility
     */
    updateGitHubRepository(appId: string, repositoryUrl: string, repositoryVisibility: 'public' | 'private'): Promise<boolean>;
    /**
     * Update app with screenshot data
     */
    updateAppScreenshot(appId: string, screenshotUrl: string): Promise<boolean>;
    /**
     * Get user apps with favorite status
     */
    getUserAppsWithFavorites(userId: string, options?: PaginationOptions): Promise<AppWithFavoriteStatus[]>;
    /**
     * Get recent user apps with favorite status
     */
    getRecentAppsWithFavorites(userId: string, limit?: number): Promise<AppWithFavoriteStatus[]>;
    /**
     * Get only favorited apps for a user
     */
    getFavoriteAppsOnly(userId: string): Promise<FavoriteAppResult[]>;
    /**
     * Toggle favorite status for an app
     */
    toggleAppFavorite(userId: string, appId: string): Promise<FavoriteToggleResult>;
    /**
     * Check if user owns an app
     */
    checkAppOwnership(appId: string, userId: string): Promise<OwnershipResult>;
    /**
     * Get single app with favorite status for user
     */
    getSingleAppWithFavoriteStatus(appId: string, userId: string): Promise<AppWithFavoriteStatus | null>;
    /**
     * Update app visibility with ownership check
     */
    updateAppVisibility(appId: string, userId: string, visibility: 'private' | 'public'): Promise<AppVisibilityUpdateResult>;
    /**
     * Get enhanced app details with user info and stats for app view controller
     * Combines app data, user info, and analytics in single optimized query
     */
    getAppDetailsEnhanced(appId: string, userId?: string): Promise<EnhancedAppData | null>;
    /**
     * Toggle star status for an app (star/unstar)
     * Uses same pattern as toggleAppFavorite
     */
    toggleAppStar(userId: string, appId: string): Promise<{
        isStarred: boolean;
        starCount: number;
    }>;
    /**
     * Record app view with duplicate prevention
     */
    recordAppView(appId: string, userId: string): Promise<void>;
    /**
     * Get app for forking with permission checks
     * Single query with built-in ownership/visibility validation
     */
    getAppForFork(appId: string, userId: string): Promise<{
        app: schema.App | null;
        canFork: boolean;
    }>;
    /**
     * Create forked app using same patterns as createSimpleApp
     */
    createForkedApp(originalApp: schema.App, newAgentId: string, userId: string): Promise<schema.App>;
    /**
     * Get user apps with analytics data integrated
     * Uses unified analytics approach for consistency with proper sorting
     */
    getUserAppsWithAnalytics(userId: string, options?: Partial<AppQueryOptions>): Promise<EnhancedAppData[]>;
    /**
     * Get total count of user apps with filters (for pagination)
     */
    getUserAppsCount(userId: string, options?: Partial<AppQueryOptions>): Promise<number>;
    /**
     * Unified analytics enhancement for app collections
     * OPTIMIZED: Uses batch queries to eliminate N+1 problems and minimize database round trips
     * All analytics data fetched in 6 total queries regardless of app count
     */
    private enhanceAppsWithAnalytics;
    /**
     * Get date threshold for time period filtering
     */
    private getTimePeriodThreshold;
    /**
     * Optimized query for popular/trending apps using efficient aggregations
     * Prevents N+1 query problem by using JOINs instead of subqueries
     */
    private getEnhancedAppsWithAggregations;
    /**
     * Optimized user apps query with aggregations for popular/trending sorting
     */
    private getUserAppsWithAggregations;
    /**
     * Create advanced scoring expression based on industry-standard algorithms
     * Implements velocity-based trending inspired by Reddit, Hacker News, GitHub, and Product Hunt
     */
    private createAdvancedScoreExpression;
    /**
     * Create velocity-based trending score using efficient aggregated stats
     * This approach uses the pre-aggregated view/star/fork stats with velocity weighting
     */
    private createVelocityTrendingScore;
    /**
     * Get velocity multiplier based on time period for trending boost
     * Shorter periods get higher multipliers to show recent momentum
     */
    private getVelocityMultiplier;
    /**
     * Delete an app with ownership verification and cascade delete related records
     * Returns success/error result for proper error handling
     */
    deleteApp(appId: string, userId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export {};
