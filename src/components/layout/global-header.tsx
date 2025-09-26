import { SidebarTrigger } from '@/components/ui/sidebar';
import { AuthButton } from '../auth/auth-button';
import { ThemeToggle } from '../theme-toggle';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/supabase-auth-context';

export function GlobalHeader() {
	const { user } = useAuth();

	return (
		<motion.header
			initial={{ y: -10, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.2, ease: 'easeOut' }}
			className="sticky top-0 z-50"
		>
			<div className="relative">
				{/* Subtle gradient accent */}
				<div className="absolute inset-0" />

				{/* Main content - thinner height */}
				<div className="relative flex items-center justify-between px-5 h-12">
					{/* Left section */}
					{user ? (
						<motion.div
							whileTap={{ scale: 0.95 }}
							transition={{
								type: 'spring',
								stiffness: 400,
								damping: 17,
							}}
							className='flex items-center'
						>
							<SidebarTrigger className="h-8 w-8 text-text-primary rounded-md hover:bg-orange-50/40 transition-colors duration-200" />
							<motion.div
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.1 }}
								className="ml-3 flex items-center"
							>
								<h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
									VibeCode
								</h1>
								<span className="ml-2 text-sm font-medium bg-gradient-to-r from-orange-600 via-purple-600 to-blue-600 bg-clip-text text-transparent border border-gray-300 dark:border-gray-600 rounded-full px-2 py-0.5 bg-gray-50 dark:bg-gray-800">
									for Startup
								</span>
							</motion.div>
						</motion.div>
					) : (
						<motion.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 }}
							className="flex items-center"
						>
							<div className="flex items-center">
								<h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
									VibeCode
								</h1>
								<span className="ml-2 text-sm font-medium bg-gradient-to-r from-orange-600 via-purple-600 to-blue-600 bg-clip-text text-transparent border border-gray-300 dark:border-gray-600 rounded-full px-2 py-0.5 bg-gray-50 dark:bg-gray-800">
									for Startup
								</span>
							</div>
						</motion.div>
					)}

					{/* Right section */}
					<motion.div
						initial={{ opacity: 0, x: 10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
						className="flex items-center gap-2"
					>
						
                        {/* Disable cost display for now */}
						{/* {user && (
							<CostDisplay
								{...extractUserAnalyticsProps(analytics)}
								loading={analyticsLoading}
								variant="inline"
							/>
						)} */}
						<ThemeToggle />
						<AuthButton />
					</motion.div>
				</div>
			</div>
		</motion.header>
	);
}
