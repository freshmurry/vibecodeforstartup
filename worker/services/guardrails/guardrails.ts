import { createLogger } from '../../logger';
import { generateId } from '../../utils/idGenerator';

/**
 * GuardrailsService — hard cost controls for the whole platform.
 *
 * Design rules:
 *  - Every billable action is checked BEFORE it happens and recorded AFTER
 *    (or as part of) it happening, in the D1 `usage_events` table.
 *  - Fail closed: if the metering store (D1) cannot be read or written,
 *    generation / deploys are REFUSED. Unmetered work never runs.
 *  - Caps resolve in this order: system_settings (runtime-editable)
 *    -> env vars (bootstrap) -> hard-coded defaults below.
 *  - The kill switch exists in both places: env GENERATION_KILL_SWITCH=1
 *    (instant, redeploy-free via `wrangler secret`/var change + deploy, or
 *    dashboard var edit) and system_settings guardrails.generation_enabled.
 */

const logger = createLogger('Guardrails');

export class GuardrailError extends Error {
	status: number;
	code: string;
	constructor(message: string, status = 429, code = 'GUARDRAIL_LIMIT') {
		super(message);
		this.status = status;
		this.code = code;
	}
}

export interface GuardrailConfig {
	generationEnabled: boolean;
	userDailyGenerations: number;
	globalDailyGenerations: number;
	userMaxApps: number;
	globalMaxDeployedApps: number;
	globalDailyAiCalls: number;
	agentMaxAiCalls: number;
	appDailyRequestCap: number;
	globalDailyAppRequests: number;
}

const DEFAULTS: GuardrailConfig = {
	generationEnabled: true,
	userDailyGenerations: 2,
	globalDailyGenerations: 5,
	userMaxApps: 5,
	globalMaxDeployedApps: 25,
	globalDailyAiCalls: 1500,
	agentMaxAiCalls: 300,
	appDailyRequestCap: 5000,
	globalDailyAppRequests: 50000,
};

const SETTING_KEYS: Record<keyof GuardrailConfig, string> = {
	generationEnabled: 'guardrails.generation_enabled',
	userDailyGenerations: 'guardrails.user_daily_generations',
	globalDailyGenerations: 'guardrails.global_daily_generations',
	userMaxApps: 'guardrails.user_max_apps',
	globalMaxDeployedApps: 'guardrails.global_max_deployed_apps',
	globalDailyAiCalls: 'guardrails.global_daily_ai_calls',
	agentMaxAiCalls: 'guardrails.agent_max_ai_calls',
	appDailyRequestCap: 'guardrails.app_daily_request_cap',
	globalDailyAppRequests: 'guardrails.global_daily_app_requests',
};

const ENV_KEYS: Partial<Record<keyof GuardrailConfig, string>> = {
	generationEnabled: 'GENERATION_ENABLED',
	userDailyGenerations: 'GUARDRAIL_USER_DAILY_GENERATIONS',
	globalDailyGenerations: 'GUARDRAIL_GLOBAL_DAILY_GENERATIONS',
	userMaxApps: 'GUARDRAIL_USER_MAX_APPS',
	globalMaxDeployedApps: 'GUARDRAIL_GLOBAL_MAX_DEPLOYED_APPS',
	globalDailyAiCalls: 'GUARDRAIL_GLOBAL_DAILY_AI_CALLS',
	agentMaxAiCalls: 'GUARDRAIL_AGENT_MAX_AI_CALLS',
	appDailyRequestCap: 'GUARDRAIL_APP_DAILY_REQUEST_CAP',
	globalDailyAppRequests: 'GUARDRAIL_GLOBAL_DAILY_APP_REQUESTS',
};

function todayUtc(): string {
	return new Date().toISOString().slice(0, 10);
}

function parsePositiveInt(value: unknown, fallback: number): number {
	const n = typeof value === 'string' ? parseInt(value, 10) : (value as number);
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export class GuardrailsService {
	/**
	 * Resolve the effective guardrail configuration.
	 * Throws GuardrailError(503) if D1 is unreachable — callers that gate
	 * billable work must treat that as "refuse" (fail closed).
	 */
	static async getConfig(env: Env): Promise<GuardrailConfig> {
		const config: GuardrailConfig = { ...DEFAULTS };

		// Env bootstrap layer
		const envAny = env as unknown as Record<string, string | undefined>;
		for (const field of Object.keys(ENV_KEYS) as (keyof GuardrailConfig)[]) {
			const envKey = ENV_KEYS[field];
			if (!envKey) continue;
			const raw = envAny[envKey];
			if (raw === undefined) continue;
			if (field === 'generationEnabled') {
				config.generationEnabled = raw !== 'false' && raw !== '0';
			} else {
				(config[field] as number) = parsePositiveInt(raw, config[field] as number);
			}
		}
		// Env kill switch always wins, in both directions of the settings layer.
		const killSwitch = envAny['GENERATION_KILL_SWITCH'];
		if (killSwitch === '1' || killSwitch === 'true') {
			config.generationEnabled = false;
		}

		// Runtime settings layer (D1 system_settings)
		try {
			const keys = Object.values(SETTING_KEYS);
			const placeholders = keys.map(() => '?').join(',');
			const rows = await env.DB.prepare(
				`SELECT key, value FROM system_settings WHERE key IN (${placeholders})`,
			)
				.bind(...keys)
				.all<{ key: string; value: string | null }>();
			const byKey = new Map((rows.results ?? []).map((r) => [r.key, r.value]));
			for (const field of Object.keys(SETTING_KEYS) as (keyof GuardrailConfig)[]) {
				const raw = byKey.get(SETTING_KEYS[field]);
				if (raw === undefined || raw === null) continue;
				if (field === 'generationEnabled') {
					if (killSwitch !== '1' && killSwitch !== 'true') {
						config.generationEnabled = raw !== 'false' && raw !== '0';
					}
				} else {
					(config[field] as number) = parsePositiveInt(raw, config[field] as number);
				}
			}
		} catch (error) {
			logger.error('Failed to read guardrail settings from D1 — failing closed', error);
			throw new GuardrailError(
				'Usage metering is unavailable, so this action is refused. Please try again later.',
				503,
				'METERING_UNAVAILABLE',
			);
		}
		return config;
	}

	private static async countEvents(
		env: Env,
		where: string,
		binds: unknown[],
	): Promise<number> {
		const row = await env.DB.prepare(
			`SELECT COALESCE(SUM(units), 0) AS total FROM usage_events WHERE ${where}`,
		)
			.bind(...binds)
			.first<{ total: number }>();
		return row?.total ?? 0;
	}

	/**
	 * Record a billable event. Throws on D1 failure so callers can fail closed.
	 */
	static async record(
		env: Env,
		event: {
			userId?: string | null;
			appId?: string | null;
			kind: 'generation' | 'ai_call' | 'deploy' | 'app_request' | 'app_request_blocked';
			units?: number;
			meta?: Record<string, unknown>;
		},
	): Promise<void> {
		await env.DB.prepare(
			`INSERT INTO usage_events (id, user_id, app_id, kind, units, day, meta)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		)
			.bind(
				generateId(),
				event.userId ?? null,
				event.appId ?? null,
				event.kind,
				event.units ?? 1,
				todayUtc(),
				event.meta ? JSON.stringify(event.meta) : null,
			)
			.run();
	}

	/**
	 * Non-throwing variant for best-effort metering (e.g. app-request serving,
	 * where refusing traffic because a counter write failed would be worse
	 * than an uncounted request; caps are still enforced from reads).
	 */
	static async recordBestEffort(
		env: Env,
		event: Parameters<typeof GuardrailsService.record>[1],
	): Promise<void> {
		try {
			await GuardrailsService.record(env, event);
		} catch (error) {
			logger.warn('Best-effort usage record failed', error);
		}
	}

	/**
	 * Gate for starting a generation session. Must be called BEFORE any AI
	 * call, sandbox session, or template work happens.
	 */
	static async assertGenerationAllowed(env: Env, userId: string): Promise<GuardrailConfig> {
		const config = await GuardrailsService.getConfig(env);
		if (!config.generationEnabled) {
			throw new GuardrailError(
				'Generation is currently disabled by the platform operator.',
				503,
				'GENERATION_DISABLED',
			);
		}
		const day = todayUtc();
		const [userToday, globalToday, userApps] = await Promise.all([
			GuardrailsService.countEvents(env, 'user_id = ? AND day = ? AND kind = ?', [userId, day, 'generation']),
			GuardrailsService.countEvents(env, 'day = ? AND kind = ?', [day, 'generation']),
			env.DB.prepare('SELECT COUNT(*) AS n FROM apps WHERE user_id = ?')
				.bind(userId)
				.first<{ n: number }>()
				.then((r) => r?.n ?? 0),
		]);
		if (userToday >= config.userDailyGenerations) {
			throw new GuardrailError(
				`Daily generation limit reached (${config.userDailyGenerations} per user per day).`,
				429,
				'USER_DAILY_GENERATION_LIMIT',
			);
		}
		if (globalToday >= config.globalDailyGenerations) {
			throw new GuardrailError(
				'The platform daily generation budget is exhausted. Please try again tomorrow.',
				429,
				'GLOBAL_DAILY_GENERATION_LIMIT',
			);
		}
		if (userApps >= config.userMaxApps) {
			throw new GuardrailError(
				`App limit reached (${config.userMaxApps} apps per user). Delete an app to create another.`,
				429,
				'USER_MAX_APPS',
			);
		}
		return config;
	}

	/**
	 * Gate for a single AI inference call inside a generation session.
	 * Enforces the global daily AI budget and a per-session runaway brake.
	 * Throws on cap breach AND on metering failure (fail closed).
	 */
	static async assertAiCallAllowed(
		env: Env,
		params: { userId?: string | null; agentId?: string | null },
	): Promise<void> {
		const config = await GuardrailsService.getConfig(env);
		if (!config.generationEnabled) {
			throw new GuardrailError('Generation is disabled by the platform operator.', 503, 'GENERATION_DISABLED');
		}
		const day = todayUtc();
		const globalToday = await GuardrailsService.countEvents(env, 'day = ? AND kind = ?', [day, 'ai_call']);
		if (globalToday >= config.globalDailyAiCalls) {
			throw new GuardrailError('Platform daily AI budget exhausted.', 429, 'GLOBAL_DAILY_AI_LIMIT');
		}
		if (params.agentId) {
			const sessionCalls = await GuardrailsService.countEvents(
				env,
				'app_id = ? AND kind = ?',
				[params.agentId, 'ai_call'],
			);
			if (sessionCalls >= config.agentMaxAiCalls) {
				throw new GuardrailError(
					`This generation session hit its AI call ceiling (${config.agentMaxAiCalls}).`,
					429,
					'AGENT_AI_CALL_LIMIT',
				);
			}
		}
	}

	/**
	 * Gate for publishing/deploying an app. Enforces kill switch and the
	 * global deployed-app ceiling (only counts a first publish as new).
	 */
	static async assertDeployAllowed(
		env: Env,
		params: { appId: string },
	): Promise<GuardrailConfig> {
		const config = await GuardrailsService.getConfig(env);
		if (!config.generationEnabled) {
			throw new GuardrailError('Deploys are currently disabled by the platform operator.', 503, 'GENERATION_DISABLED');
		}
		const existing = await env.DB.prepare(
			`SELECT status, deployment_url FROM apps WHERE id = ?`,
		)
			.bind(params.appId)
			.first<{ status: string; deployment_url: string | null }>();
		const alreadyDeployed = !!existing?.deployment_url;
		if (!alreadyDeployed) {
			const deployed = await env.DB.prepare(
				`SELECT COUNT(*) AS n FROM apps WHERE deployment_url IS NOT NULL`,
			).first<{ n: number }>();
			if ((deployed?.n ?? 0) >= config.globalMaxDeployedApps) {
				throw new GuardrailError(
					`Platform published-app ceiling reached (${config.globalMaxDeployedApps}).`,
					429,
					'GLOBAL_MAX_DEPLOYED_APPS',
				);
			}
		}
		return config;
	}

	/**
	 * Gate for serving one request to a published app (static mode).
	 * Returns true when the request may be served.
	 */
	static async appRequestAllowed(env: Env, appId: string): Promise<boolean> {
		try {
			const config = await GuardrailsService.getConfig(env);
			const day = todayUtc();
			const [appToday, globalToday] = await Promise.all([
				GuardrailsService.countEvents(env, 'app_id = ? AND day = ? AND kind = ?', [appId, day, 'app_request']),
				GuardrailsService.countEvents(env, 'day = ? AND kind = ?', [day, 'app_request']),
			]);
			return appToday < config.appDailyRequestCap && globalToday < config.globalDailyAppRequests;
		} catch {
			// Metering read failure on the serving path: refuse rather than
			// serve unbounded traffic.
			return false;
		}
	}

	/** Summary for the admin usage view. */
	static async getUsageSummary(env: Env): Promise<Record<string, unknown>> {
		const config = await GuardrailsService.getConfig(env);
		const day = todayUtc();
		const monthPrefix = day.slice(0, 7);
		const byKindToday = await env.DB.prepare(
			`SELECT kind, COALESCE(SUM(units),0) AS total FROM usage_events WHERE day = ? GROUP BY kind`,
		)
			.bind(day)
			.all<{ kind: string; total: number }>();
		const byKindMonth = await env.DB.prepare(
			`SELECT kind, COALESCE(SUM(units),0) AS total FROM usage_events WHERE day LIKE ? GROUP BY kind`,
		)
			.bind(`${monthPrefix}%`)
			.all<{ kind: string; total: number }>();
		const topUsers = await env.DB.prepare(
			`SELECT user_id, COALESCE(SUM(units),0) AS total FROM usage_events
			 WHERE day = ? AND user_id IS NOT NULL GROUP BY user_id ORDER BY total DESC LIMIT 10`,
		)
			.bind(day)
			.all<{ user_id: string; total: number }>();
		const deployed = await env.DB.prepare(
			`SELECT COUNT(*) AS n FROM apps WHERE deployment_url IS NOT NULL`,
		).first<{ n: number }>();
		return {
			day,
			config,
			today: Object.fromEntries((byKindToday.results ?? []).map((r) => [r.kind, r.total])),
			month: Object.fromEntries((byKindMonth.results ?? []).map((r) => [r.kind, r.total])),
			topUsersToday: topUsers.results ?? [],
			deployedApps: deployed?.n ?? 0,
		};
	}
}
