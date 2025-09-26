import { Link } from 'react-router';
import { VibeCodingLogo } from './icons/logos';

const footerSections = {
	Company: [
		{ label: 'Careers', href: '/careers' },
		{ label: 'Press & media', href: '/press' },
		{ label: 'Enterprise', href: '/enterprise' },
		{ label: 'Security', href: '/security' },
		{ label: 'Trust center', href: '/trust' },
		{ label: 'Partnerships', href: '/partnerships' },
	],
	Product: [
		{ label: 'Pricing', href: '/pricing' },
		{ label: 'Student discount', href: '/student-discount' },
		{ label: 'Solutions', href: '/solutions' },
		{ label: 'Connections', href: '/connections' },
		{ label: 'Import from Figma', href: '/import-figma' },
		{ label: 'Changelog', href: '/changelog' },
		{ label: 'Status', href: '/status' },
	],
	Resources: [
		{ label: 'Learn', href: '/learn' },
		{ label: 'How-to guides', href: '/guides' },
		{ label: 'Videos', href: '/videos' },
		{ label: 'Blog', href: '/blog' },
		{ label: 'Launched', href: '/launched' },
		{ label: 'Support', href: '/support' },
	],
	Legal: [
		{ label: 'Privacy policy', href: '/privacy' },
		{ label: 'Cookie settings', href: '/cookies' },
		{ label: 'Terms of Service', href: '/terms' },
		{ label: 'Platform rules', href: '/rules' },
		{ label: 'Report abuse', href: '/report-abuse' },
		{ label: 'Report security concerns', href: '/report-security' },
	],
	Community: [
		{ label: 'Become a partner', href: '/become-partner' },
		{ label: 'Hire a partner', href: '/hire-partner' },
		{ label: 'Affiliates', href: '/affiliates' },
		{ label: 'Discord', href: 'https://discord.gg/vibecodeforstartups' },
		{ label: 'Reddit', href: 'https://reddit.com/r/vibecodeforstartups' },
		{ label: 'X / Twitter', href: 'https://twitter.com/vibecodeforstartups' },
		{ label: 'YouTube', href: 'https://youtube.com/@vibecodeforstartups' },
		{ label: 'LinkedIn', href: 'https://linkedin.com/company/vibecodeforstartups' },
	],
};

export function Footer() {
	return (
		<footer className="w-full bg-bg-2 border-t border-border-primary mt-auto">
			<div className="max-w-7xl mx-auto px-6 py-12">
				{/* Main footer content */}
				<div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
					{/* Logo section */}
					<div className="col-span-2 md:col-span-1">
						<Link to="/" className="flex items-center gap-2 mb-4">
							<VibeCodingLogo className="h-8 w-8" />
						</Link>
						<p className="text-sm text-text-primary/70 leading-relaxed">
							Create apps and websites by chatting with AI. Build something amazing for startups.
						</p>
					</div>

					{/* Footer link sections */}
					{Object.entries(footerSections).map(([sectionName, links]) => (
						<div key={sectionName} className="col-span-1">
							<h3 className="text-sm font-semibold text-text-primary mb-4">
								{sectionName}
							</h3>
							<ul className="space-y-2">
								{links.map((link) => (
									<li key={link.href}>
										{link.href.startsWith('http') ? (
											<a
												href={link.href}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-text-primary/70 hover:text-accent transition-colors"
											>
												{link.label}
											</a>
										) : (
											<Link
												to={link.href}
												className="text-sm text-text-primary/70 hover:text-accent transition-colors"
											>
												{link.label}
											</Link>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Bottom section */}
				<div className="pt-8 border-t border-border-primary flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-4 text-sm text-text-primary/60">
						<button className="flex items-center gap-1 hover:text-text-primary transition-colors">
							🌐 EN
						</button>
					</div>
					<div className="text-sm text-text-primary/60">
						© 2025 VibeCode for Startup. All rights reserved.
					</div>
				</div>
			</div>
		</footer>
	);
}