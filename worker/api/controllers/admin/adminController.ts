/**
 * Admin Controller — operator-only usage metering and guardrail config.
 *
 * Access is restricted to the platform owner: the signed-in user's email
 * must equal the ALLOWED_EMAIL env var (same convention as stripeRoutes).
 *
 *   GET /api/admin/usage       → caps + today/month usage + top users
 *   PUT /api/admin/guardrails  → update one cap in system_settings
 *                                body: { key: 'global_daily_generations', value: '5' }
 */

import { BaseController } from '../baseController';
import { RouteContext } from '../../types/route-context';
import { GuardrailsService } from '../../../services/guardrails/guardrails';

const EDITABLE_KEYS = new Set([
    'generation_enabled',
    'user_daily_generations',
    'global_daily_generations',
    'user_max_apps',
    'global_max_deployed_apps',
    'global_daily_ai_calls',
    'agent_max_ai_calls',
    'app_daily_request_cap',
    'global_daily_app_requests',
]);

export class AdminController extends BaseController {
    private static isAdmin(env: Env, email: string | undefined): boolean {
        return Boolean(env.ALLOWED_EMAIL) && email === env.ALLOWED_EMAIL;
    }

    static async getUsage(
        _request: Request,
        env: Env,
        _: ExecutionContext,
        context: RouteContext,
    ): Promise<Response> {
        const { user } = context;
        if (!user) return this.createErrorResponse('Authentication required', 401);
        if (!this.isAdmin(env, user.email)) {
            return this.createErrorResponse('Admin access required', 403);
        }
        try {
            const summary = await GuardrailsService.getUsageSummary(env);
            return this.createSuccessResponse(summary);
        } catch (error) {
            this.logger.error('Failed to load usage summary', error);
            return this.createErrorResponse('Failed to load usage summary', 500);
        }
    }

    static async updateGuardrail(
        request: Request,
        env: Env,
        _: ExecutionContext,
        context: RouteContext,
    ): Promise<Response> {
        const { user } = context;
        if (!user) return this.createErrorResponse('Authentication required', 401);
        if (!this.isAdmin(env, user.email)) {
            return this.createErrorResponse('Admin access required', 403);
        }
        const parsed = await this.parseJsonBody<{ key?: string; value?: string | number | boolean }>(request);
        if (!parsed.success || !parsed.data) {
            return parsed.response ?? this.createErrorResponse('Invalid request body', 400);
        }
        const { key } = parsed.data;
        if (!key || !EDITABLE_KEYS.has(key)) {
            return this.createErrorResponse(
                `Unknown guardrail key. Editable keys: ${[...EDITABLE_KEYS].join(', ')}`,
                400,
            );
        }
        const value = String(parsed.data.value);
        if (key === 'generation_enabled') {
            if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
                return this.createErrorResponse('generation_enabled must be true or false', 400);
            }
        } else if (!/^\d+$/.test(value)) {
            return this.createErrorResponse(`${key} must be a non-negative integer`, 400);
        }
        try {
            await env.DB.prepare(
                `INSERT INTO system_settings (id, key, value, updated_at) VALUES (?, ?, ?, ?)
                 ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
            )
                .bind(`guardrails-${key.replace(/_/g, '-')}`, `guardrails.${key}`, value, Date.now())
                .run();
            const config = await GuardrailsService.getConfig(env);
            return this.createSuccessResponse({ key, value, config });
        } catch (error) {
            this.logger.error('Failed to update guardrail', error);
            return this.createErrorResponse('Failed to update guardrail', 500);
        }
    }
}
