import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageSEO } from '@/components/seo/PageSEO';

const resources = [
	{
		category: 'Getting Started',
		items: [
			{ title: 'Quick Start Guide', href: '/docs/quick-start', type: 'Internal' },
			{ title: 'API Documentation', href: '/docs/api', type: 'Internal' },
			{ title: 'SDK Reference', href: '/docs/sdk', type: 'Internal' },
			{ title: 'Examples Repository', href: 'https://github.com/vibecoding/examples', type: 'External' },
		]
	},
	{
		category: 'Tutorials',
		items: [
			{ title: 'Building Your First App', href: '/tutorials/first-app', type: 'Internal' },
			{ title: 'Advanced Configurations', href: '/tutorials/advanced', type: 'Internal' },
			{ title: 'Best Practices', href: '/tutorials/best-practices', type: 'Internal' },
			{ title: 'Performance Optimization', href: '/tutorials/performance', type: 'Internal' },
		]
	},
	{
		category: 'Developer Tools',
		items: [
			{ title: 'CLI Tools', href: '/tools/cli', type: 'Internal' },
			{ title: 'VS Code Extension', href: 'https://marketplace.visualstudio.com/items?itemName=vibecoding.vscode', type: 'External' },
			{ title: 'Playground', href: '/playground', type: 'Internal' },
			{ title: 'Debug Console', href: '/debug', type: 'Internal' },
		]
	},
	{
		category: 'Community',
		items: [
			{ title: 'Discord Community', href: 'https://discord.gg/vibecoding', type: 'External' },
			{ title: 'GitHub Discussions', href: 'https://github.com/vibecoding/discussions', type: 'External' },
			{ title: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/vibecoding', type: 'External' },
			{ title: 'Reddit Community', href: 'https://reddit.com/r/vibecoding', type: 'External' },
		]
	}
];

const categoryIcons = {
	'Getting Started': '💡',
	'Tutorials': '📚',
	'Developer Tools': '⚙️',
	'Community': '👥'
};

export default function Resources() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-bg-1 via-bg-2 to-bg-3">
			<PageSEO />
			<div className="max-w-7xl mx-auto px-6 py-20">
				{/* Header */}
				<div className="text-center mb-16">
					<div className="text-6xl mx-auto mb-6">📚</div>
					<h1 className="text-5xl font-bold text-text-primary mb-6">
						Developer Resources
					</h1>
					<p className="text-xl text-text-primary/80 max-w-3xl mx-auto">
						Everything you need to build amazing applications. Documentation, tutorials, 
						tools, and community support to help you succeed.
					</p>
				</div>

				{/* Resource Categories */}
				<div className="grid md:grid-cols-2 gap-8 mb-16">
					{resources.map((category) => {
						const icon = categoryIcons[category.category as keyof typeof categoryIcons];
						return (
							<Card key={category.category} className="bg-bg-1/50 border-border-primary">
								<CardHeader>
									<CardTitle className="flex items-center gap-3 text-text-primary">
										<span className="text-2xl">{icon}</span>
										{category.category}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{category.items.map((item) => (
											<div key={item.title} className="flex items-center justify-between group">
												<a
													href={item.href}
													target={item.type === 'External' ? '_blank' : undefined}
													rel={item.type === 'External' ? 'noopener noreferrer' : undefined}
													className="flex items-center gap-2 text-text-primary/80 hover:text-accent transition-colors"
												>
													<span className="group-hover:underline">{item.title}</span>
													{item.type === 'External' && <span className="text-sm">↗</span>}
												</a>
												<Badge variant={item.type === 'External' ? 'secondary' : 'outline'}>
													{item.type}
												</Badge>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Help Section */}
				<Card className="bg-bg-2 border-border-primary">
					<CardContent className="p-8 text-center">
						<div className="text-4xl mx-auto mb-4">👥</div>
						<h2 className="text-2xl font-semibold text-text-primary mb-4">
							Need More Help?
						</h2>
						<p className="text-text-primary/80 mb-6 max-w-2xl mx-auto">
							Join thousands of startups using VibeCoding for Startups to build their next big idea.
							Get help from our community and support team.
						</p>
						<div className="flex flex-wrap justify-center gap-4">
							<Button asChild className="bg-accent hover:bg-accent/90">
								<a href="https://discord.gg/vibecoding" target="_blank" rel="noopener noreferrer">
									Join Discord
								</a>
							</Button>
							<Button variant="outline" asChild className="border-border-primary">
								<a href="mailto:support@vibecoding.com">
									Contact Support
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}