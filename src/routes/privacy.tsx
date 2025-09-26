import { Shield, Lock, Eye, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Privacy() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-bg-1 via-bg-2 to-bg-3">
			<div className="max-w-4xl mx-auto px-6 py-20">
				<div className="text-center mb-12">
					<Shield className="size-16 text-accent mx-auto mb-6" />
					<h1 className="text-5xl font-bold text-text-primary mb-6">
						Privacy Policy
					</h1>
					<p className="text-xl text-text-primary/80">
						Your privacy is important to us. This policy explains how we collect, use, and protect your data.
					</p>
					<p className="text-sm text-text-primary/60 mt-4">
						Last updated: September 24, 2025
					</p>
				</div>

				<div className="space-y-8">
					<Card className="bg-bg-1/50 border-border-primary">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-text-primary">
								<Database className="size-6 text-accent" />
								Information We Collect
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-text-primary/80">
							<p>We collect information you provide directly to us, such as when you:</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Create an account and use our services</li>
								<li>Build applications using our AI tools</li>
								<li>Contact us for support or feedback</li>
								<li>Subscribe to our newsletters or updates</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="bg-bg-1/50 border-border-primary">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-text-primary">
								<Eye className="size-6 text-accent" />
								How We Use Your Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-text-primary/80">
							<p>We use the information we collect to:</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Provide, maintain, and improve our services</li>
								<li>Process your AI-powered development requests</li>
								<li>Communicate with you about your account and our services</li>
								<li>Protect against fraud and abuse</li>
								<li>Comply with legal obligations</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="bg-bg-1/50 border-border-primary">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-text-primary">
								<Lock className="size-6 text-accent" />
								Data Security
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-text-primary/80">
							<p>We implement appropriate technical and organizational security measures to protect your personal information:</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Encryption in transit and at rest</li>
								<li>Regular security audits and assessments</li>
								<li>Access controls and authentication</li>
								<li>SOC 2 Type II compliance</li>
							</ul>
						</CardContent>
					</Card>
				</div>

				<div className="mt-12 p-6 bg-bg-2 rounded-lg border border-border-primary">
					<h2 className="text-xl font-semibold text-text-primary mb-4">Contact Us</h2>
					<p className="text-text-primary/80">
						If you have any questions about this Privacy Policy, please contact us at{' '}
						<a href="mailto:privacy@vibecoding.com" className="text-accent hover:underline">
							privacy@vibecoding.com
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}