import { createLogger } from './logger';
import { SmartCodeGeneratorAgent } from './agents/core/smartGeneratorAgent';
import { proxyToSandbox } from '@cloudflare/sandbox';
import { isDispatcherAvailable } from './utils/dispatcherUtils';
import { createApp } from './app';
import * as Sentry from '@sentry/cloudflare';
import { sentryOptions } from './observability/sentry';
import { DORateLimitStore as BaseDORateLimitStore } from './services/rate-limit/DORateLimitStore';
import { getPreviewDomain } from './utils/urls';

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
async function handleUserAppRequest(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const { hostname } = url;
	logger.info(`Handling user app request for: ${hostname}`);

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
			return handleUserAppRequest(request, env);
		}

		// Fallback: serve assets (handles cases like direct workers.dev access)
		return env.ASSETS.fetch(request);
	},
} satisfies any;

// Wrap the entire worker with Sentry for comprehensive error monitoring.
export default Sentry.withSentry(sentryOptions, worker);
