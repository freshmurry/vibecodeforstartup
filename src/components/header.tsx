import React from 'react';
import clsx from 'clsx';
import { VibeCodingLogo } from './icons/logos';
import { Link } from 'react-router';

export function Header({
	className,
	children,
}: React.ComponentProps<'header'>) {
	return (
		<header
			className={clsx(
				'h-13 shrink-0 w-full px-4 border-b flex items-center',
				className,
			)}
		>
			<h1 className="flex items-center gap-2 mx-4">
				<Link to="/">
					<VibeCodingLogo
						className="h-6 w-6"
						aria-label="VibeCode for Startups"
					/>
				</Link>
			</h1>
			<div className="flex-1"></div>
			<div className="flex items-center gap-4">
				{children}
			</div>
		</header>
	);
}
