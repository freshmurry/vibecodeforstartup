import { createLogger } from './logger';
import { SmartCodeGeneratorAgent } from './agents/core/smartGeneratorAgent';
import { proxyToSandbox } from '@cloudflare/sandbox';
import { isDispatcherAvailable } from './utils/dispatcherUtils';
import { createApp } from './app';
import * as Sentry from '@sentry/cloudflare';
import { sentryOptions } from './observability/sentry';
import { DORateLimitStore as BaseDORateLimitStore } from './services/rate-limit/DORateLimitStore';
import { getPreviewDomain } from './utils/urls';
import { GuardrailsService } from './services/guardrails/guardrails';
import { contentTypeForPath } from './services/publish/publish';

// Durable Object and Service exports
export { UserAppSandboxService, DeployerService } from './services/sandbox/sandboxSdkClient';

export const CodeGeneratorAgent = Sentry.instrumentDurableObjectWithSentry(sentryOptions, SmartCodeGeneratorAgent);
// @ts-ignore - Sentry DO instrumentation generic mismatch, safe to ignore
export const DORateLimitStore = Sentry.instrumentDurableObjectWithSentry(sentryOptions, BaseDORateLimitStore);

// Logger for the main application and handlers
const logger = createLogger('App');

/**
 * Handles requests for user-deployed applications on subdomains.
 */
async function handleUserAppRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const servingMode = (env.APP_SERVING_MODE || 'static').toLowerCase();
	if (servingMode === 'wfp') {
		return handleUserAppRequestWfp(request, env);
	}
	return handleUserAppRequestStatic(request, env, ctx);
}

/**
 * Static mode (default): serve the published app files from R2.
 * No user code executes on this account — the browser runs the app and
 * libraries load from esm.sh. Requests are metered in D1 and capped per
 * app and globally (see GuardrailsService).
 */
async function handleUserAppRequestStatic(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const url = new URL(request.url);
	const slug = url.hostname.split('.')[0];
	if (!slug || !env.APPS_BUCKET) {
		return new Response('App not found', { status: 404 });
	}

	let app: { id: string } | null = null;
	try {
		app = await env.DB
			.prepare('SELECT id FROM apps WHERE slug = ?')
			.bind(slug)
			.first<{ id: string }>();
	} catch {
		return new Response('Service temporarily unavailable', { status: 503 });
	}
	if (!app) {
		return new Response('App not found', { status: 404 });
	}

	const allowed = await GuardrailsService.appRequestAllowed(env, app.id);
	if (!allowed) {
		return new Response('This app has reached its daily traffic limit. Please check back tomorrow.', {
			status: 429,
			headers: { 'content-type': 'text/plain; charset=utf-8' },
		});
	}
	ctx.waitUntil(GuardrailsService.recordBestEffort(env, { appId: app.id, kind: 'app_request' }));

	let path = decodeURIComponent(url.pathname).replace(/^\/+/, '');
	if (!path || path.endsWith('/')) path += 'index.html';

	const prefix = `apps/${slug}/`;
	let object = await env.APPS_BUCKET.get(prefix + path);
	if (!object && !path.includes('.')) {
		// SPA fallback: client-side routes serve index.html.
		object = await env.APPS_BUCKET.get(prefix + 'index.html');
		path = 'index.html';
	}
	if (!object) {
		return new Response('Not found', { status: 404 });
	}

	const headers = new Headers();
	headers.set('content-type', contentTypeForPath(path));
	headers.set('cache-control', path === 'index.html' ? 'no-cache' : 'public, max-age=3600');
	headers.set(
		'content-security-policy',
		"default-src 'self' https: data: blob:; " +
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://esm.sh https://cdn.tailwindcss.com; " +
			"style-src 'self' 'unsafe-inline' https:; " +
			"img-src 'self' data: blob: https:; " +
			"font-src 'self' data: https:; " +
			"connect-src 'self' https: wss:; " +
			"frame-ancestors 'none'",
	);
	headers.set('x-content-type-options', 'nosniff');
	return new Response(object.body, { headers });
}

/**
 * Workers-for-Platforms mode: legacy behavior — proxy to a live sandbox
 * preview when one exists, otherwise dispatch to the user Worker in the
 * dispatch namespace. Requires the WfP plan ($25/mo, NOT included in the
 * $5 Workers Paid plan) and the DISPATCHER binding in wrangler.jsonc.
 */
async function handleUserAppRequestWfp(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const { hostname } = url;
	logger.info(`Handling user app request (wfp) for: ${hostname}`);

	const sandboxResponse = await proxyToSandbox(request, env);
	if (sandboxResponse) {
		logger.info(`Serving response from sandbox for: ${hostname}`);
		return sandboxResponse;
	}

	logger.info(`Sandbox miss for ${hostname}, attempting dispatch to permanent worker.`);
	if (!isDispatcherAvailable(env)) {
		logger.warn(`Dispatcher not available, cannot serve: ${hostname}`);
		return new Response('This application is not currently available.', { status: 404 });
	}

	const appName = hostname.split('.')[0];
	const dispatcher = env['DISPATCHER'];

	try {
		const worker = dispatcher.get(appName);
		return await worker.fetch(request);
	} catch (error: any) {
		logger.warn(`Error dispatching to worker '${appName}': ${error.message}`);
		return new Response('An error occurred while loading this application.', { status: 500 });
	}
}

/**
 * Main Worker fetch handler.
 */
const worker = {
	async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
		const url = new URL(request.url);
		const { hostname, pathname } = url;

		// Security: Reject IP address requests
		const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
		if (ipRegex.test(hostname)) {
			return new Response('Access denied. Please use the assigned domain name.', { status: 403 });
		}

		// Determine preview domain — gracefully handle if not configured
		const previewDomain = getPreviewDomain(env);

		// Domain-based routing
		const isMainDomainRequest =
			!previewDomain ||                              // No domain configured → treat as main
			hostname === env.CUSTOM_DOMAIN ||
			hostname === 'localhost' ||
			hostname.endsWith('.workers.dev') ||           // Support workers.dev
			hostname.endsWith('.pages.dev');               // Support pages.dev

		const isSubdomainRequest = previewDomain && (
			hostname.endsWith(`.${previewDomain}`) ||
			(hostname.endsWith('.localhost') && hostname !== 'localhost')
		);

		// Route 1: Main platform — API requests go to Hono, everything else to static assets
		if (isMainDomainRequest) {
			if (pathname.startsWith('/api/')) {
				logger.info(`Handling API request: ${url}`);
				const app = createApp(env);
				return app.fetch(request, env, ctx);
			}

			// Serve the React SPA for all non-API requests (including /, /dashboard, etc.)
			logger.info(`Serving static asset: ${pathname}`);
			return env.ASSETS.fetch(request);
		}

		// Route 2: User app subdomain
		if (isSubdomainRequest) {
			return handleUserAppRequest(request, env, ctx);
		}

		// Fallback: serve assets (handles cases like direct workers.dev access)
		return env.ASSETS.fetch(request);
	},
} satisfies any;

// Wrap the entire worker with Sentry for comprehensive error monitoring.
export default Sentry.withSentry(sentryOptions, worker);
