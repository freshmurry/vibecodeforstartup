import { Link, useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { PageSEO } from '@/components/seo/PageSEO';
import { useAuthModal } from '@/components/auth/AuthModalProvider';

const pricingPlans = [
	{
		name: 'Free',
		price: '$0',
		annualPrice: '$0',
		period: 'forever',
		credits: 45,
		maxApps: 2,
		description: 'Perfect for trying out VibeCoding for Startups',
		popular: false,
		features: [
			'45 credits per month',
			'2 apps maximum',
			'Basic AI models (GPT-3.5, Claude Haiku)',
			'Community support',
			'Basic templates',
			'Public projects only',
		],
		limitations: [
			'No custom domains',
			'No priority support',
			'Limited storage (1GB)',
		],
		cta: 'Get Started Free',
	},
	{
		name: 'Pro',
		price: '$29',
		annualPrice: '$23',
		period: 'per month',
		credits: 500,
		maxApps: 'unlimited',
		description: 'For serious builders and growing startups',
		popular: true,
		features: [
			'500 credits per month',
			'Unlimited apps',
			'All AI models (GPT-4, Claude Sonnet, Gemini)',
			'Priority email support',
			'Premium templates',
			'Private repositories',
			'Custom domains',
			'Advanced analytics',
			'Team collaboration (up to 3 members)',
		],
		limitations: [
			'No phone support',
			'Standard deployment regions',
		],
		cta: 'Start Pro Trial',
	},
	{
		name: 'Team',
		price: '$99',
		annualPrice: '$79',
		period: 'per month',
		credits: 2000,
		maxApps: 'unlimited',
		description: 'For growing teams and agencies',
		popular: false,
		features: [
			'2,000 credits per month',
			'Unlimited apps',
			'All AI models + early access to new models',
			'Priority support with 24h response',
			'White-label options',
			'Team management dashboard',
			'Advanced permissions',
			'SSO integration',
			'Team collaboration (up to 10 members)',
			'Advanced deployment options',
		],
		limitations: [
			'Setup fee may apply for enterprise features',
		],
		cta: 'Start Team Trial',
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		annualPrice: 'Contact us',
		period: 'tailored pricing',
		credits: 'unlimited',
		maxApps: 'unlimited',
		description: 'For large organizations with custom needs',
		popular: false,
		features: [
			'Unlimited credits',
			'Unlimited apps',
			'Dedicated AI models and infrastructure',
			'24/7 phone + email support',
			'Custom integrations',
			'On-premise deployment options',
			'Advanced security & compliance',
			'Custom SLA agreements',
			'Unlimited team members',
			'Dedicated success manager',
			'Custom training and onboarding',
		],
		limitations: [],
		cta: 'Contact Sales',
	},
];

const faqData = [
	{
		question: 'What are credits and how do they work?',
		answer: 'Credits are used to power AI operations in VibeCoding. Different actions consume different amounts of credits based on complexity. Simple prompts use 1 credit, while complex code generation might use 2-3 credits. Credits reset monthly.'
	},
	{
		question: 'Can I change my plan anytime?',
		answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated amount immediately. When downgraging, the change takes effect at your next billing cycle.'
	},
	{
		question: 'What happens if I exceed my credit limit?',
		answer: 'If you exceed your monthly credit limit, your account will be temporarily restricted until the next billing cycle or you can purchase additional credits. Enterprise customers have unlimited credits.'
	},
	{
		question: 'Do you offer refunds?',
		answer: 'We offer a 14-day money-back guarantee for all paid plans. If you\'re not satisfied, contact our support team for a full refund within the first 14 days.'
	},
	{
		question: 'Is there a student discount?',
		answer: 'Yes! We offer a 50% discount on Pro plans for verified students. Contact our support team with your student email address to apply for the discount.'
	},
	{
		question: 'What AI models do you support?',
		answer: 'We support OpenAI (GPT-3.5, GPT-4), Anthropic (Claude), Google (Gemini), and other leading AI models. Higher tier plans get access to more advanced models and early access to new releases.'
	}
];

export default function Pricing() {
	const [searchParams] = useSearchParams();
	const [isAnnual, setIsAnnual] = useState(false);
	const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null);
	const { showAuthModal } = useAuthModal();

	useEffect(() => {
		const plan = searchParams.get('plan');
		if (plan) {
			setHighlightedPlan(plan);
			setTimeout(() => setHighlightedPlan(null), 2000);
		}
	}, [searchParams]);

	const handlePlanSignup = (planName: string) => {
		if (planName === 'Free') {
			// For free plan, just show the signup modal
			showAuthModal(`Sign up for ${planName} plan`, () => {
				// After successful signup, redirect or show success
				console.log(`Signed up for ${planName} plan`);
			});
		} else if (planName === 'Enterprise') {
			// For enterprise, redirect to contact
			window.location.href = '/enterprise';
		} else {
			// For paid plans, show signup modal with plan context
			showAuthModal(`Sign up for ${planName} plan`, () => {
				// After successful signup, redirect to payment or app creation
				console.log(`Signed up for ${planName} plan`);
			});
		}
	};

	// Structured data for pricing
	const pricingStructuredData = [
		{
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: 'VibeCoding',
			url: 'https://vibesdk.com',
			description: 'AI-Powered App Development Platform',
			sameAs: [
				'https://twitter.com/vibecoding',
				'https://github.com/vibecoding'
			]
		},
		{
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: 'VibeCoding Platform',
			description: 'AI-Powered App Development Platform with multiple pricing tiers',
			brand: {
				'@type': 'Brand',
				name: 'VibeCoding'
			},
			offers: pricingPlans.filter(plan => plan.price !== 'Custom').map(plan => ({
				'@type': 'Offer',
				name: plan.name,
				description: plan.description,
				price: plan.price.replace('$', ''),
				priceCurrency: 'USD',
				availability: 'https://schema.org/InStock',
				url: `https://vibesdk.com/pricing`,
				priceSpecification: {
					'@type': 'PriceSpecification',
					price: plan.price.replace('$', ''),
					priceCurrency: 'USD',
					billingIncrement: plan.period === 'forever' ? 'one-time' : 'monthly'
				}
			}))
		}
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
			<PageSEO structuredData={pricingStructuredData} />
			
			{/* Hero Section */}
			<div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
				<div className="mx-auto max-w-4xl text-center">
					<h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
						Choose Your
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
							{' '}Development Plan
						</span>
					</h1>
					<p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
						Start building amazing apps with AI assistance. Choose the plan that fits your needs, 
						from individual developers to enterprise teams.
					</p>

					{/* Annual Toggle */}
					<div className="mt-10 flex items-center justify-center gap-4">
						<span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
							Monthly
						</span>
						<button
							onClick={() => setIsAnnual(!isAnnual)}
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
								isAnnual ? 'bg-blue-600' : 'bg-gray-200'
							}`}
						>
							<span
								className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
									isAnnual ? 'translate-x-6' : 'translate-x-1'
								}`}
							/>
						</button>
						<span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
							Annual
						</span>
						<Badge variant="secondary" className="text-green-700 bg-green-100">
							Save 20%
						</Badge>
					</div>
				</div>
			</div>

			{/* Pricing Cards */}
			<div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
					{pricingPlans.map((plan) => (
						<Card 
							key={plan.name} 
							className={`relative ${plan.popular ? 'ring-2 ring-blue-600 shadow-lg scale-105' : 'shadow-sm'} 
							${highlightedPlan === plan.name.toLowerCase() ? 'ring-2 ring-purple-500 animate-pulse' : ''} 
							transition-all duration-200 hover:shadow-lg`}
						>
							{plan.popular && (
								<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
									<Badge className="bg-blue-600 text-white px-4 py-1">
										Most Popular
									</Badge>
								</div>
							)}
							
							<CardHeader className="pb-8 pt-6">
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
										<span className="text-blue-600 font-bold text-sm">
											{plan.name.charAt(0)}
										</span>
									</div>
									<CardTitle className="text-xl">{plan.name}</CardTitle>
								</div>
								<div className="flex items-baseline gap-2">
									<span className="text-3xl font-bold">
										{isAnnual && plan.annualPrice !== plan.price ? plan.annualPrice : plan.price}
									</span>
									{plan.price !== 'Custom' && (
										<span className="text-gray-500 text-sm">/{plan.period}</span>
									)}
								</div>
								<CardDescription className="text-sm">
									{plan.description}
								</CardDescription>
							</CardHeader>

							<CardContent className="space-y-6">
								{/* Key Stats */}
								<div className="space-y-2">
									<div className="flex justify-between items-center py-2 border-b border-gray-100">
										<span className="text-sm text-gray-600">Credits/month:</span>
										<span className="font-semibold">{plan.credits}</span>
									</div>
									<div className="flex justify-between items-center py-2 border-b border-gray-100">
										<span className="text-sm text-gray-600">Max apps:</span>
										<span className="font-semibold">{plan.maxApps}</span>
									</div>
								</div>

								{/* Features */}
								<div className="space-y-3">
									<h4 className="font-semibold text-gray-900">Included features:</h4>
									<ul className="space-y-2">
										{plan.features.map((feature) => (
											<li key={feature} className="flex items-start gap-2">
												<span className="text-green-500 text-sm">✓</span>
												<span className="text-sm text-gray-600">{feature}</span>
											</li>
										))}
									</ul>
								</div>

								{/* Limitations */}
								{plan.limitations.length > 0 && (
									<div className="space-y-3">
										<h4 className="font-semibold text-gray-900">Limitations:</h4>
										<ul className="space-y-2">
											{plan.limitations.map((limitation) => (
												<li key={limitation} className="flex items-start gap-2">
													<span className="text-red-400 text-sm">✗</span>
													<span className="text-sm text-gray-500">{limitation}</span>
												</li>
											))}
										</ul>
									</div>
								)}

								{/* CTA Button */}
								<Button 
									onClick={() => handlePlanSignup(plan.name)}
									className={`w-full mt-8 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}
								>
									{plan.cta}
								</Button>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Additional Info */}
				<div className="mt-12 text-center">
					<p className="text-gray-600">
						All plans include access to our community, basic templates, and regular updates.{' '}
						<Link to="/enterprise" className="text-blue-600 hover:underline">
							Need something custom?
						</Link>
					</p>
				</div>
			</div>

			{/* FAQ Section */}
			<div className="bg-white">
				<div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
					<div className="mx-auto max-w-4xl">
						<h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
							Frequently Asked Questions
						</h2>
						<p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
							Have questions about our pricing? We've got answers.
						</p>
						<div className="mt-20">
							<dl className="space-y-10">
								{faqData.map((faq) => (
									<div key={faq.question}>
										<dt className="text-lg font-semibold leading-7 text-gray-900">
											{faq.question}
										</dt>
										<dd className="mt-2 text-gray-600 leading-7">
											{faq.answer}
										</dd>
									</div>
								))}
							</dl>
						</div>
					</div>
				</div>
			</div>

			{/* Final CTA */}
			<div className="bg-blue-600">
				<div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
							Ready to start building?
						</h2>
						<p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
							Join thousands of developers who are already building amazing apps with VibeCoding.
						</p>
						<div className="mt-10 flex items-center justify-center gap-x-6">
							<Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
								<Link to="/chat/new">
									✨ Start Building Now
								</Link>
							</Button>
							<Link 
								to="/contact" 
								className="text-sm font-semibold leading-6 text-white hover:text-blue-100"
							>
								Contact sales →
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}