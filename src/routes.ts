import type { RouteObject } from 'react-router';
import React from 'react';

import App from './App';
import Home from './routes/home';
import Chat from './routes/chat/chat';
import Profile from './routes/profile';
import Settings from './routes/settings/index';
import AppsPage from './routes/apps';
import AppView from './routes/app';
import DiscoverPage from './routes/discover';
// import Resources from './routes/resources';
// Uncomment and update the path below if the file exists elsewhere:
// import Resources from './routes/your-correct-path/resources';
import Pricing from './routes/pricing';
import Learn from './routes/learn';
// import Enterprise from './routes/enterprise';
// import Privacy from './routes/privacy';
import Terms from './routes/terms';
// Uncomment and update the path below if the file exists elsewhere:
// import Terms from './routes/your-correct-path/terms';
import Dashboard from './routes/dashboard';
import AdminDashboard from './routes/admin';
import AuthCallback from './routes/auth/callback';
import StripeTest from './routes/stripe-test';
import { ProtectedRoute } from './routes/protected-route';
import Resources from './routes/resources';

const routes = [
	{
		path: '/',
		Component: App,
		children: [
			{
				index: true,
				Component: Home,
			},
			{
				path: 'chat/:chatId',
				Component: Chat,
			},
			{
				path: 'profile',
				element: React.createElement(ProtectedRoute, { children: React.createElement(Profile) }),
			},
			{
				path: 'dashboard',
				element: React.createElement(ProtectedRoute, { children: React.createElement(Dashboard) }),
			},
			{
				path: 'admin',
				element: React.createElement(ProtectedRoute, { children: React.createElement(AdminDashboard) }),
			},
			{
				path: 'settings',
				element: React.createElement(ProtectedRoute, { children: React.createElement(Settings) }),
			},
			{
				path: 'apps',
				element: React.createElement(ProtectedRoute, { children: React.createElement(AppsPage) }),
			},
			{
				path: 'app/:id',
				Component: AppView,
			},
			{
				path: 'discover',
				Component: DiscoverPage,
			},
			{
				path: 'resources',
				Component: Resources,
			},
			{
				path: 'pricing',
				Component: Pricing,
			},
			{
				path: 'learn',
				Component: Learn,
			},
			// 			{
			// 				path: 'enterprise',
			// 				Component: Enterprise,
			// 			},
			{
				path: 'privacy',
			// 			{
			// 				path: 'terms',
			// 				Component: Terms,
			// 			},
				Component: Terms,
			},
			{
				path: 'auth/callback',
				Component: AuthCallback,
			},
			{
				path: 'stripe-test',
				Component: StripeTest,
			},
		],
	},
] satisfies RouteObject[];

export { routes };
