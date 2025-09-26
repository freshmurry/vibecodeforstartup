import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSEO } from '@/components/seo/PageSEO';

const learningPaths = [
	{
		title: 'Beginner Path',
		description: 'New to AI-powered development? Start here!',
		duration: '2-3 hours',
		difficulty: 'Beginner',
		icon: '📚',
		color: 'text-green-500',
		modules: [
			'Introduction to VibeCoding for Startups',
			'Your First AI-Generated App',
			'Understanding AI Models',
			'Basic Customization',
		],
	},
	{
		title: 'Intermediate Path',
		description: 'Ready to build more complex applications',
		duration: '4-6 hours',
		difficulty: 'Intermediate',
		icon: '💻',
		color: 'text-blue-500',
		modules: [
			'Advanced AI Prompting',
			'Custom Components',
			'Database Integration',
			'Deployment Strategies',
		],
	},
	{
		title: 'Expert Path',
		description: 'Master advanced techniques and best practices',
		duration: '8-10 hours',
		difficulty: 'Advanced',
		icon: '🏆',
		color: 'text-purple-500',
		modules: [
			'Custom AI Model Integration',
			'Performance Optimization',
			'Enterprise Features',
			'Building at Scale',
		],
	},
];

const featuredContent = [
	{
		type: 'Video Tutorial',
		title: 'Building a SaaS App in 10 Minutes',
		description: 'Watch as we create a complete SaaS application from scratch using AI.',
		duration: '12 min',
		difficulty: 'Beginner',
		thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
		href: '/learn/video/saas-tutorial',
	},
	{
		type: 'Written Guide',
		title: 'Mastering AI Prompts for Better Results',
		description: 'Learn the art and science of writing effective prompts for AI code generation.',
		duration: '15 min read',
		difficulty: 'Intermediate',
		thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
		href: '/learn/guide/ai-prompts',
	},
	{
		type: 'Interactive Tutorial',
		title: 'Database Design with AI Assistance',
		description: 'Step-by-step tutorial on designing and implementing databases.',
		duration: '30 min',
		difficulty: 'Intermediate',
		thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=200&fit=crop',
		href: '/learn/interactive/database-design',
	},
];

export default function Learn() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-bg-1 via-bg-2 to-bg-3">
			<PageSEO />
			{/* Hero Section */}
			<div className="px-6 py-20 text-center">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-5xl font-bold text-text-primary mb-6">
						Learn to Build with <span className="text-accent">AI</span>
					</h1>
					<p className="text-xl text-text-primary/80 mb-8 leading-relaxed">
						Master AI-powered development with our comprehensive tutorials, guides, and interactive courses.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" asChild>
							<Link to="/learn/getting-started">
								<span className="text-lg mr-2">▶️</span>
								Start Learning
							</Link>
						</Button>
						<Button variant="outline" size="lg" asChild>
							<Link to="/learn/paths">
								<span className="text-lg mr-2">💡</span>
								Browse Paths
							</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Learning Paths */}
			<div className="max-w-7xl mx-auto px-6 py-12">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-text-primary mb-4">
						Choose Your Learning Path
					</h2>
					<p className="text-lg text-text-primary/80">
						Structured courses designed to take you from beginner to expert
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8 mb-16">
					{learningPaths.map((path) => {
						const icon = path.icon;
						return (
							<Card key={path.title} className="bg-bg-1/50 border-border-primary hover:shadow-lg transition-all">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<span className="text-3xl">{icon}</span>
										<div className="flex gap-2">
											<Badge variant="secondary" className="text-xs">
												{path.difficulty}
											</Badge>
											<Badge variant="outline" className="text-xs">
												{path.duration}
											</Badge>
										</div>
									</div>
									<CardTitle className="text-xl text-text-primary">
										{path.title}
									</CardTitle>
									<CardDescription className="text-text-primary/70">
										{path.description}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-2 mb-6">
										{path.modules.map((module, index) => (
											<div key={module} className="flex items-center gap-2 text-sm text-text-primary/80">
												<span className="w-5 h-5 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-medium">
													{index + 1}
												</span>
												{module}
											</div>
										))}
									</div>
									<Button className="w-full" asChild>
										<Link to={`/learn/path/${path.title.toLowerCase().replace(' ', '-')}`}>
											Start Path
										</Link>
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Featured Content */}
			<div className="bg-bg-2 border-t border-border-primary">
				<div className="max-w-7xl mx-auto px-6 py-16">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-text-primary mb-4">
							Featured Learning Content
						</h2>
						<p className="text-lg text-text-primary/80">
							Hand-picked tutorials and guides from our expert team
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{featuredContent.map((content) => (
							<Card key={content.title} className="bg-bg-1/50 border-border-primary overflow-hidden hover:shadow-lg transition-all">
								<div className="aspect-video bg-bg-3 relative">
									{content.type === 'Video Tutorial' && (
										<div className="absolute inset-0 flex items-center justify-center">
											<span className="text-4xl text-white/80">▶️</span>
										</div>
									)}
									<div className="absolute top-2 right-2">
										<Badge variant="secondary" className="text-xs">
											{content.type}
										</Badge>
									</div>
								</div>
								<CardHeader>
									<CardTitle className="text-lg text-text-primary line-clamp-2">
										{content.title}
									</CardTitle>
									<CardDescription className="text-text-primary/70 line-clamp-3">
										{content.description}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between mb-4">
										<div className="flex gap-2">
											<Badge variant="outline" className="text-xs">
												{content.difficulty}
											</Badge>
											<Badge variant="outline" className="text-xs">
												{content.duration}
											</Badge>
										</div>
									</div>
									<Button variant="outline" className="w-full" asChild>
										<Link to={content.href}>
											{content.type === 'Video Tutorial' ? 'Watch Now' : 'Read More'}
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>

			{/* Community Section */}
			<div className="bg-bg-3 border-t border-border-primary">
				<div className="max-w-4xl mx-auto px-6 py-16 text-center">
					<div className="text-6xl mx-auto mb-6">👥</div>
					<h2 className="text-3xl font-bold text-text-primary mb-4">
						Join the Learning Community
					</h2>
					<p className="text-lg text-text-primary/80 mb-8">
						Connect with other learners, share your projects, and get help from experts.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" asChild>
							<a href="https://discord.gg/vibecoding" target="_blank" rel="noopener noreferrer">
								Join Discord
							</a>
						</Button>
						<Button variant="outline" size="lg" asChild>
							<Link to="/community/showcase">
								View Showcase
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}