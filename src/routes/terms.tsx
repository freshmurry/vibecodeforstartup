import { FileText, Scale, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Terms() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-bg-1 via-bg-2 to-bg-3">
			<div className="max-w-4xl mx-auto px-6 py-20">
				<div className="text-center mb-12">
					<Scale className="size-16 text-accent mx-auto mb-6" />
					<h1 className="text-5xl font-bold text-text-primary mb-6">
						Terms of Service
					</h1>
					<p className="text-xl text-text-primary/80">
						Please read these terms carefully before using our service.
					</p>
					<p className="text-sm text-text-primary/60 mt-4">
						Last updated: September 24, 2025
					</p>
				</div>

				<div className="space-y-8">
					<Card className="bg-bg-1/50 border-border-primary">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-text-primary">
								<FileText className="size-6 text-accent" />
								Acceptance of Terms
							</CardTitle>
						</CardHeader>
						<CardContent className="text-text-primary/80">
							<p>
								By accessing and using VibeCoding for Startups, you accept and agree to be bound by the terms and provision of this agreement. 
								If you do not agree to abide by the above, please do not use this service.
							</p>
						</CardContent>
					</Card>

					<Card className="bg-bg-1/50 border-border-primary">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-text-primary">
								<Users className="size-6 text-accent" />
								User Responsibilities
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-text-primary/80">
							<p>As a user of our service, you agree to:</p>
							<ul className="list-disc pl-6 space-y-2">
								<li>Use the service in compliance with all applicable laws</li>
								<li>Not use the service for illegal or harmful activities</li>
								<li>Respect intellectual property rights</li>
								<li>Maintain the security of your account</li>
								<li>Not attempt to reverse engineer or hack our systems</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="bg-bg-1/50 border-border-primary">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-text-primary">
								<AlertCircle className="size-6 text-accent" />
								Limitation of Liability
							</CardTitle>
						</CardHeader>
						<CardContent className="text-text-primary/80">
							<p>
								VibeCoding for Startups shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
								including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
								resulting from your use of the service.
							</p>
						</CardContent>
					</Card>
				</div>

				<div className="mt-12 p-6 bg-bg-2 rounded-lg border border-border-primary">
					<h2 className="text-xl font-semibold text-text-primary mb-4">Questions?</h2>
					<p className="text-text-primary/80">
						If you have any questions about these Terms of Service, please contact us at{' '}
						<a href="mailto:legal@vibecoding.com" className="text-accent hover:underline">
							legal@vibecoding.com
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}