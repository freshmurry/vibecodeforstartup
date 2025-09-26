import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { HelmetProvider } from 'react-helmet-async';
import { initSentry } from './utils/sentry';

import { routes } from './routes.ts';
import './index.css';

// Initialize Sentry before rendering
initSentry();

// Type for React Router hydration data  
import type { RouterState } from 'react-router';

declare global {
  interface Window {
    __staticRouterHydrationData?: Partial<Pick<RouterState, 'loaderData' | 'actionData' | 'errors'>>;
  }
}

const router = createBrowserRouter(routes, {
	hydrationData: window.__staticRouterHydrationData,
});

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>
);
