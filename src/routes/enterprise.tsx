import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSEO } from '@/components/seo/PageSEO';

const enterpriseFeatures = [
	{
		icon: '🛡️',
		title: 'Enterprise Security',
		description: 'SOC 2 Type II certified with advanced security controls, audit logs, and compliance features.',
	},
	{
		icon: '👥',
		title: 'Unlimited Team Members',
		description: 'Collaborate with your entire organization. No per-seat pricing or user limits.',
	},
	{
		icon: '🌍',
		title: 'Global Infrastructure',
		description: 'Deploy in any region with our global CDN and edge computing capabilities.',
	},
	{
		icon: '🔒',
		title: 'Advanced Privacy',
		description: 'Your code and data never leaves your designated region. GDPR and SOC 2 compliant.',
	},
	{
		icon: '⚡',
		title: 'Priority AI Models',
		description: 'First access to new AI models, higher rate limits, and dedicated compute resources.',
	},
	{
		icon: '🎧',
		title: 'Dedicated Support',
		description: '24/7 priority support with dedicated success managers and phone support.',
	},
];

export default function Enterprise() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-bg-1 via-bg-2 to-bg-3">
			<PageSEO />
			
			{/* Hero Section */}
			<div className="px-6 py-20 text-center">
				<div className="max-w-4xl mx-auto">
					<Badge className="mb-6 bg-accent/10 text-accent border-accent/20">
						Enterprise Solution
					</Badge>
					<h1 className="text-5xl font-bold text-text-primary mb-6">
						Scale Development with <span className="text-accent">Enterprise AI</span>
					</h1>
					<p className="text-xl text-text-primary/70 mb-8 max-w-2xl mx-auto">
						Empower your entire organization with enterprise-grade AI development tools, 
						advanced security, and dedicated support.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
							<Link to="/contact?type=enterprise">
								Schedule Demo
							</Link>
						</Button>
						<Button variant="outline" size="lg" className="border-border-primary text-text-primary">
							<Link to="/pricing">
								View Pricing
							</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Features Grid */}
			<div className="px-6 pb-20">
				<div className="max-w-6xl mx-auto">
					<h2 className="text-3xl font-bold text-text-primary text-center mb-12">
						Built for Enterprise Scale
					</h2>
					
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
						{enterpriseFeatures.map((feature) => {
							const icon = feature.icon;
							return (
								<Card key={feature.title} className="bg-bg-1/50 border-border-primary">
									<CardHeader>
										<span className="text-4xl mb-3 block">{icon}</span>
										<CardTitle className="text-xl text-text-primary">
											{feature.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-text-primary/70">
											{feature.description}
										</p>
									</CardContent>
								</Card>
							);
						})}
					</div>

					{/* Stats */}
					<div className="bg-accent/5 rounded-lg p-8 mb-16">
						<div className="grid md:grid-cols-4 gap-8 text-center">
							<div>
								<div className="text-3xl font-bold text-accent mb-2">99.9%</div>
								<div className="text-text-primary/70">Uptime SLA</div>
							</div>
							<div>
								<div className="text-3xl font-bold text-accent mb-2">50+</div>
								<div className="text-text-primary/70">Enterprise Customers</div>
							</div>
							<div>
								<div className="text-3xl font-bold text-accent mb-2">24/7</div>
								<div className="text-text-primary/70">Support Available</div>
							</div>
							<div>
								<div className="text-3xl font-bold text-accent mb-2">SOC 2</div>
								<div className="text-text-primary/70">Type II Certified</div>
							</div>
						</div>
					</div>

					{/* Security Section */}
					<div className="text-center mb-16">
						<div className="text-6xl mx-auto mb-6">🛡️</div>
						<h2 className="text-3xl font-bold text-text-primary mb-4">
							Enterprise-Grade Security
						</h2>
						<p className="text-text-primary/70 max-w-2xl mx-auto mb-8">
							Your code, data, and intellectual property are protected by industry-leading 
							security measures and compliance certifications.
						</p>
						<div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
							{[
								'SOC 2 Type II Certified',
								'GDPR Compliant',
								'End-to-End Encryption',
								'Regular Security Audits',
								'Role-Based Access Control',
								'Audit Logging'
							].map((item) => (
								<div key={item} className="flex items-center gap-3 text-text-primary">
									<span className="text-green-500 text-lg">✓</span>
									{item}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-accent">
				<div className="px-6 py-20 text-center">
					<div className="max-w-2xl mx-auto">
						<h2 className="text-3xl font-bold text-white mb-4">
							Ready to Transform Your Development?
						</h2>
						<p className="text-white/90 mb-8 text-lg">
							Join leading enterprises who trust VibeCoding for their AI development needs.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" className="bg-white text-accent hover:bg-gray-50">
								<Link to="/contact?type=enterprise">
									Schedule Enterprise Demo
								</Link>
							</Button>
							<Button 
								variant="outline" 
								size="lg" 
								className="border-white text-white hover:bg-white/10"
							>
								<Link to="/contact">
									Contact Sales
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}