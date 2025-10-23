/**
 * Analytics Controller Types
 * Type definitions for analytics controller requests and responses
 */

import {
	UserAnalyticsData,
	ChatAnalyticsData,
} from '../../../services/analytics/types';

/**
 * User analytics response data
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserAnalyticsResponseData extends UserAnalyticsData {}

/**
 * Agent analytics response data
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AgentAnalyticsResponseData extends ChatAnalyticsData {}
