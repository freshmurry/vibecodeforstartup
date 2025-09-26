import React from 'react';
import { Link, useLocation } from 'react-router';
import { VibeCodingLogo } from './icons/logos';
import { Button } from './ui/button';
import clsx from 'clsx';

interface NavbarProps {
	className?: string;
	children?: React.ReactNode;
}

const navLinks = [
	{ href: '/resources', label: 'Resources' },
	{ href: '/pricing', label: 'Pricing' },
	{ href: '/learn', label: 'Learn' },
	{ href: '/enterprise', label: 'Enterprise' },
];

export function Navbar({ className, children }: NavbarProps) {
	const location = useLocation();

	return (
		<nav
			className={clsx(
				'h-16 shrink-0 w-full px-6 border-b border-border-primary bg-bg-1/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-50',
				className,
			)}
		>
			{/* Logo and Brand */}
			<div className="flex items-center gap-8">
			<Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
				<VibeCodingLogo
					className="h-8 w-8"
					aria-label="VibeCode for Startups"
				/>
				<span className="text-xl font-bold text-text-primary"></span>
			</Link>				{/* Navigation Links */}
				<div className="hidden md:flex items-center gap-6">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							to={link.href}
							className={clsx(
								'text-sm font-medium transition-colors hover:text-accent',
								location.pathname === link.href
									? 'text-accent'
									: 'text-text-primary/80'
							)}
						>
							{link.label}
						</Link>
					))}
				</div>
			</div>

			{/* Right side actions */}
			<div className="flex items-center gap-4">
				{children}
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/profile">Log in</Link>
					</Button>
					<Button size="sm" asChild>
						<Link to="/chat/new">Get started</Link>
					</Button>
				</div>
			</div>
		</nav>
	);
}