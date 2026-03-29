/**
 * Analytics and Count Queries Service
 */
import { BaseService } from './BaseService';
import type { AppStats, UserStats, EnhancedUserStats, UserActivity, BatchAppStats } from '../types';
/**
 * Comment statistics (service-specific type)
 */
interface CommentStats {
    likeCount: number;
    replyCount: number;
}
export declare class AnalyticsService extends BaseService {
    /**
     * Get app statistics
     */
    getAppStats(appId: string): Promise<AppStats>;
    /**
     * Get comment statistics
     */
    getCommentStats(commentId: string): Promise<CommentStats>;
    /**
     * Batch get statistics for multiple entities
     * More efficient when loading lists of items
     */
    batchGetAppStats(appIds: string[]): Promise<BatchAppStats>;
    /**
     * Get user statistics
     */
    getUserStats(userId: string): Promise<UserStats>;
    /**
     * Get enhanced user statistics with all metrics for stats controller
     * Extends basic getUserStats with additional calculations
     */
    getEnhancedUserStats(userId: string): Promise<EnhancedUserStats>;
    /**
     * Calculate consecutive days of user activity
     * Based on app creation and update dates
     */
    private calculateUserStreak;
    /**
     * Get user activity timeline
     * Returns recent activities for user dashboard
     */
    getUserActivityTimeline(userId: string, limit?: number): Promise<UserActivity[]>;
}
export {};
