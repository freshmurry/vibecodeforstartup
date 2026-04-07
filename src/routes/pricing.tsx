import { useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useCallback } from 'react';
import { Check, X, Zap, Users, Building2, Star } from 'lucide-react';
import { PageSEO } from '@/components/seo/PageSEO';
import { useAuthModal } from '@/components/auth/AuthModalProvider';
import { useAuth } from '@/contexts/auth-context';
import { createCheckoutSession } from '@/lib/stripe';

const PLANS = [
	{
		id: 'free',
		name: 'Free',
		monthlyPrice: 0,
		annualPrice: 0,
		period: 'forever',
		credits: 45,
		maxApps: 2,
		description: 'Try out vibe coding — no credit card needed.',
		popular: false,
		icon: Zap,
		features: [
			'45 credits / month',
			'2 apps max',
			'Basic AI models',
			'Community support',
			'Basic templates',
			'Public projects',
		],
		limitations: ['No custom domains', 'No priority support', '1 GB storage'],
		cta: 'Get Started Free',
		monthlyPriceId: null as string | null,
		annualPriceId: null as string | null,
	},
	{
		id: 'pro',
		name: 'Pro',
		monthlyPrice: 29,
		annualPrice: 23,
		period: 'per month',
		credits: 500,
		maxApps: null as number | null,
		description: 'For serious builders who ship fast.',
		popular: true,
		icon: Star,
		features: [
			'500 credits / month',
			'Unlimited apps',
			'All AI models (GPT-4, Claude, Gemini)',
			'Priority email support',
			'Premium templates',
			'Private repositories',
			'Custom domains',
			'Advanced analytics',
			'Team collaboration (up to 3)',
		],
		limitations: ['No phone support'],
		cta: 'Start Pro',
		monthlyPriceId: (import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID ?? '') as string,
		annualPriceId: (import.meta.env.VITE_STRIPE_PRO_ANNUAL_PRICE_ID ?? '') as string,
	},
	{
		id: 'team',
		name: 'Team',
		monthlyPrice: 99,
		annualPrice: 79,
		period: 'per month',
		credits: 2000,
		maxApps: null as number | null,
		description: 'For growing teams and agencies.',
		popular: false,
		icon: Users,
		features: [
			'2,000 shared credits / month',
			'Unlimited apps',
			'All AI models + early access',
			'Priority support — 24h response',
			'White-label options',
			'Team dashboard & permissions',
			'SSO integration',
			'Up to 10 team members',
			'Advanced deployment options',
		],
		limitations: [],
		cta: 'Start Team Plan',
		monthlyPriceId: (import.meta.env.VITE_STRIPE_TEAM_MONTHLY_PRICE_ID ?? '') as string,
		annualPriceId: (import.meta.env.VITE_STRIPE_TEAM_ANNUAL_PRICE_ID ?? '') as string,
	},
	{
		id: 'enterprise',
		name: 'Enterprise',
		monthlyPrice: null as number | null,
		annualPrice: null as number | null,
		period: 'tailored pricing',
		credits: null as number | null,
		maxApps: null as number | null,
		description: 'Custom infrastructure, SLAs, and dedicated support.',
		popular: false,
		icon: Building2,
		features: [
			'Unlimited credits',
			'Unlimited apps',
			'Dedicated AI infrastructure',
			'24/7 phone + email support',
			'Custom integrations',
			'On-premise deployment',
			'Advanced security & compliance',
			'Custom SLA',
			'Unlimited team members',
			'Dedicated success manager',
		],
		limitations: [],
		cta: 'Contact Sales',
		monthlyPriceId: null as string | null,
		annualPriceId: null as string | null,
	},
];

const FAQ = [
	{
		q: 'What are credits?',
		a: 'Credits power AI operations. Simple prompts use 1 credit; complex code generation uses 2–3. Credits reset monthly.',
	},
	{
		q: 'Can I change plans anytime?',
		a: 'Yes. Upgrades take effect immediately (prorated). Downgrades apply at the next billing cycle.',
	},
	{
		q: 'Is there a free trial?',
		a: 'Pro and Team plans come with a 14-day free trial — no credit card required to start.',
	},
	{
		q: 'What payment methods do you accept?',
		a: 'All major credit/debit cards via Stripe. Annual plans save up to 20%.',
	},
];

type Plan = typeof PLANS[0];

export default function Pricing() {
	const [isAnnual, setIsAnnual] = useState(false);
	const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
	const [searchParams] = useSearchParams();
	const { showAuthModal } = useAuthModal();
	const { user, isLoading: authLoading } = useAuth();

	const highlightPlan = searchParams.get('highlight');

	const handlePlanClick = useCallback(async (plan: Plan) => {
		if (plan.id === 'enterprise') {
			window.location.href = 'mailto:hello@vibecodeforstartup.com?subject=Enterprise Inquiry';
			return;
		}
		if (plan.id === 'free') {
			if (!user) showAuthModal('Sign up to start building for free');
			return;
		}
		if (!user) {
			showAuthModal(`Sign up to start your ${plan.name} plan`);
			return;
		}

		const priceId = isAnnual ? plan.annualPriceId : plan.monthlyPriceId;
		if (!priceId) return;

		try {
			setLoadingPlanId(plan.id);
			const result = await createCheckoutSession({
				priceId,
				userId: user.id,
				email: user.email,
			}) as { url?: string; sessionId?: string };
			if (result.url) window.location.href = result.url;
		} catch (err) {
			console.error('Checkout error:', err);
		} finally {
			setLoadingPlanId(null);
		}
	}, [user, isAnnual, showAuthModal]);

	return (
		<>
			<PageSEO
				title="Pricing — VibeCode for Startup"
				description="Choose a plan that fits your team. Free forever, or unlock unlimited power with Pro or Team."
			/>

			<div className="min-h-screen bg-bg-3">
				{/* Hero */}
				<div className="bg-white border-b border-border-primary py-16 px-4 text-center">
					<Badge className="mb-4 bg-brand/10 text-brand border-brand/20 hover:bg-brand/15">
						Simple, transparent pricing
					</Badge>
					<h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight">
						Build without limits
					</h1>
					<p className="text-lg text-text-secondary max-w-xl mx-auto mb-8">
						Start free. Upgrade when you're ready. No hidden fees, no surprises.
					</p>

					{/* Annual toggle */}
					<div className="inline-flex items-center gap-3 bg-bg-1 rounded-full px-4 py-2 border border-border-primary">
						<button
							onClick={() => setIsAnnual(false)}
							className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
								!isAnnual
									? 'bg-brand text-white shadow-sm'
									: 'text-text-secondary hover:text-text-primary'
							}`}
						>
							Monthly
						</button>
						<button
							onClick={() => setIsAnnual(true)}
							className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
								isAnnual
									? 'bg-brand text-white shadow-sm'
									: 'text-text-secondary hover:text-text-primary'
							}`}
						>
							Annual
							<span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
								isAnnual ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
							}`}>
								Save 20%
							</span>
						</button>
					</div>
				</div>

				{/* Plans Grid */}
				<div className="max-w-7xl mx-auto px-4 py-16">
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
						{PLANS.map((plan) => {
							const Icon = plan.icon;
							const isHighlighted = highlightPlan === plan.id;
							const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
							const isLoadingThis = loadingPlanId === plan.id;

							return (
								<Card
									key={plan.id}
									className={`relative flex flex-col border transition-all duration-200 hover:shadow-lg ${
										plan.popular
											? 'border-brand shadow-md ring-2 ring-brand/20'
											: isHighlighted
											? 'border-brand/50 shadow-md'
											: 'border-border-primary hover:border-brand/30'
									}`}
								>
									{plan.popular && (
										<div className="absolute -top-3 left-1/2 -translate-x-1/2">
											<Badge className="bg-brand text-white border-0 px-3 py-1 text-xs font-semibold shadow">
												Most Popular
											</Badge>
										</div>
									)}

									<CardHeader className="pb-4">
										<div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
											plan.popular ? 'bg-brand text-white' : 'bg-brand/10 text-brand'
										}`}>
											<Icon className="w-5 h-5" />
										</div>
										<CardTitle className="text-xl font-bold text-text-primary">
											{plan.name}
										</CardTitle>
										<CardDescription className="text-text-secondary text-sm">
											{plan.description}
										</CardDescription>
									</CardHeader>

									<CardContent className="flex flex-col flex-1 gap-6">
										{/* Price */}
										<div>
											{price !== null ? (
												<div className="flex items-end gap-1">
													<span className="text-4xl font-bold text-text-primary">
														${price}
													</span>
													{price > 0 && (
														<span className="text-text-tertiary text-sm mb-1">/mo</span>
													)}
												</div>
											) : (
												<div className="text-4xl font-bold text-text-primary">Custom</div>
											)}
											{isAnnual && price !== null && price > 0 && (
												<p className="text-xs text-text-tertiary mt-1">
													Billed annually (${price * 12}/yr)
												</p>
											)}
											<div className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary">
												{plan.credits !== null ? (
													<>
														<Zap className="w-3.5 h-3.5 text-brand" />
														<span>{plan.credits.toLocaleString()} credits/mo</span>
													</>
												) : (
													<>
														<Zap className="w-3.5 h-3.5 text-brand" />
														<span>Unlimited credits</span>
													</>
												)}
											</div>
										</div>

										{/* CTA Button */}
										<Button
											onClick={() => handlePlanClick(plan)}
											disabled={isLoadingThis || authLoading}
											className={`w-full font-semibold transition-all ${
												plan.popular
													? 'bg-brand hover:bg-brand/90 text-white'
													: 'bg-bg-1 hover:bg-brand hover:text-white text-text-primary border border-border-primary'
											}`}
										>
											{isLoadingThis ? 'Loading…' : plan.cta}
										</Button>

										{/* Features */}
										<ul className="space-y-2 flex-1">
											{plan.features.map((f) => (
												<li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
													<Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
													<span>{f}</span>
												</li>
											))}
											{plan.limitations.map((l) => (
												<li key={l} className="flex items-start gap-2 text-sm text-text-tertiary">
													<X className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
													<span>{l}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>

				{/* FAQ */}
				<div className="max-w-3xl mx-auto px-4 pb-20">
					<h2 className="text-2xl font-bold text-text-primary text-center mb-10">
						Frequently asked questions
					</h2>
					<div className="space-y-6">
						{FAQ.map(({ q, a }) => (
							<div key={q} className="border-b border-border-primary pb-6">
								<h3 className="font-semibold text-text-primary mb-2">{q}</h3>
								<p className="text-text-secondary text-sm leading-relaxed">{a}</p>
							</div>
						))}
					</div>

					<div className="mt-12 text-center bg-white border border-border-primary rounded-2xl p-8">
						<h3 className="text-xl font-bold text-text-primary mb-2">Still have questions?</h3>
						<p className="text-text-secondary text-sm mb-4">
							We're happy to help you find the right plan.
						</p>
						<Button asChild className="bg-brand hover:bg-brand/90 text-white">
							<a href="mailto:hello@vibecodeforstartup.com">Talk to us</a>
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
