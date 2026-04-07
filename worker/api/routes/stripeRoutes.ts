/**
 * Stripe Subscription Routes
 * Handles checkout sessions, webhooks, and customer portal.
 * Owner email (ALLOWED_EMAIL env var) always has full access — no subscription required.
 */

import { Hono } from 'hono';
import { AppEnv } from '../../types/appenv';
import { AuthConfig, setAuthLevel } from '../../middleware/auth/routeAuth';
import Stripe from 'stripe';

function getStripe(env: Env): Stripe {
	return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' });
}

/** Returns true if this user is the platform owner — bypasses all subscription checks */
function isOwner(email: string, env: Env): boolean {
	return email === env.ALLOWED_EMAIL;
}

export function setupStripeRoutes(app: Hono<AppEnv>): void {

	// ── Create Checkout Session ─────────────────────────────────────────────
	app.post('/api/stripe/create-checkout-session', setAuthLevel(AuthConfig.authenticated), async (c) => {
		const user = c.get('user');
		if (!user) return c.json({ error: 'Unauthorized' }, 401);
		if (isOwner(user.email, c.env)) {
			return c.json({ error: 'Owner account has complimentary access' }, 400);
		}

		const body = await c.req.json<{
			priceId: string;
			successUrl?: string;
			cancelUrl?: string;
		}>();

		const stripe = getStripe(c.env);
		const origin = new URL(c.req.url).origin;

		const session = await stripe.checkout.sessions.create({
			mode: 'subscription',
			payment_method_types: ['card'],
			customer_email: user.email,
			line_items: [{ price: body.priceId, quantity: 1 }],
			success_url: body.successUrl ?? `${origin}/settings?tab=billing&session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: body.cancelUrl ?? `${origin}/pricing`,
			metadata: { userId: user.id, userEmail: user.email },
			subscription_data: { metadata: { userId: user.id } },
		});

		return c.json({ url: session.url, sessionId: session.id });
	});

	// ── Create Customer Portal Session ──────────────────────────────────────
	app.post('/api/stripe/create-portal-session', setAuthLevel(AuthConfig.authenticated), async (c) => {
		const user = c.get('user');
		if (!user) return c.json({ error: 'Unauthorized' }, 401);
		if (isOwner(user.email, c.env)) {
			return c.json({ error: 'Owner account has complimentary access' }, 400);
		}

		const body = await c.req.json<{ customerId?: string }>();
		if (!body.customerId) return c.json({ error: 'customerId required' }, 400);

		const stripe = getStripe(c.env);
		const origin = new URL(c.req.url).origin;

		const portalSession = await stripe.billingPortal.sessions.create({
			customer: body.customerId,
			return_url: `${origin}/settings?tab=billing`,
		});

		return c.json({ url: portalSession.url });
	});

	// ── Get Subscription Status ─────────────────────────────────────────────
	app.get('/api/stripe/subscription', setAuthLevel(AuthConfig.authenticated), async (c) => {
		const user = c.get('user');
		if (!user) return c.json({ error: 'Unauthorized' }, 401);

		// Owner always gets unlimited pro access
		if (isOwner(user.email, c.env)) {
			return c.json({
				status: 'active',
				plan: 'owner',
				planName: 'Owner (Complimentary)',
				credits: Infinity,
				maxApps: Infinity,
				isOwner: true,
			});
		}

		const stripe = getStripe(c.env);

		// Look up customer by email
		const customers = await stripe.customers.list({ email: user.email, limit: 1 });
		if (!customers.data.length) {
			return c.json({ status: 'free', plan: 'free', planName: 'Free', credits: 45, maxApps: 2, isOwner: false });
		}

		const customer = customers.data[0];
		const subscriptions = await stripe.subscriptions.list({
			customer: customer.id,
			status: 'active',
			limit: 1,
			expand: ['data.items.data.price'],
		});

		if (!subscriptions.data.length) {
			return c.json({
				status: 'free',
				plan: 'free',
				planName: 'Free',
				credits: 45,
				maxApps: 2,
				customerId: customer.id,
				isOwner: false,
			});
		}

		const sub = subscriptions.data[0];
		const priceId = sub.items.data[0]?.price?.id ?? '';

		// Map price IDs to plan metadata
		const planMap: Record<string, { plan: string; planName: string; credits: number; maxApps: number }> = {
			[c.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '']: { plan: 'pro', planName: 'Pro', credits: 500, maxApps: Infinity },
			[c.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? '']: { plan: 'pro', planName: 'Pro (Annual)', credits: 500, maxApps: Infinity },
			[c.env.STRIPE_TEAM_MONTHLY_PRICE_ID ?? '']: { plan: 'team', planName: 'Team', credits: 2000, maxApps: Infinity },
			[c.env.STRIPE_TEAM_ANNUAL_PRICE_ID ?? '']: { plan: 'team', planName: 'Team (Annual)', credits: 2000, maxApps: Infinity },
		};

		const planMeta = planMap[priceId] ?? { plan: 'pro', planName: 'Pro', credits: 500, maxApps: Infinity };

		return c.json({
			status: sub.status,
			...planMeta,
			customerId: customer.id,
			subscriptionId: sub.id,
			currentPeriodEnd: new Date((sub as any).current_period_end * 1000).toISOString(),
			cancelAtPeriodEnd: sub.cancel_at_period_end,
			isOwner: false,
		});
	});

	// ── Stripe Webhook ──────────────────────────────────────────────────────
	app.post('/api/stripe/webhook', setAuthLevel(AuthConfig.public), async (c) => {
		const sig = c.req.header('stripe-signature');
		if (!sig) return c.json({ error: 'Missing signature' }, 400);

		const stripe = getStripe(c.env);
		const rawBody = await c.req.text();

		let event: Stripe.Event;
		try {
			event = await stripe.webhooks.constructEventAsync(rawBody, sig, c.env.STRIPE_WEBHOOK_SECRET ?? '');
		} catch (err) {
			return c.json({ error: `Webhook signature verification failed` }, 400);
		}

		// Handle relevant events
		switch (event.type) {
			case 'customer.subscription.created':
			case 'customer.subscription.updated':
			case 'customer.subscription.deleted': {
				// Subscriptions are looked up live via Stripe API on each request
				// KV or D1 caching can be added here for high-traffic scenarios
				console.log(`Stripe subscription event: ${event.type}`, event.data.object);
				break;
			}
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;
				console.log(`Checkout completed for user: ${session.metadata?.userEmail}`);
				break;
			}
			default:
				console.log(`Unhandled Stripe event: ${event.type}`);
		}

		return c.json({ received: true });
	});
}
