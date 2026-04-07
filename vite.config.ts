// import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath, URL } from 'node:url';

// import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
	optimizeDeps: {
		exclude: ['format', 'editor.all'],
		include: ['monaco-editor/esm/vs/editor/editor.api'],
		force: true,
	},

	plugins: [
		react(),
		svgr(),
		tailwindcss(),
	],

	resolve: {
		// Dedupe React to ensure only ONE copy is ever bundled
		dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
		alias: {
			debug: 'debug/src/browser',
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'shared': fileURLToPath(new URL('./shared', import.meta.url)),
			'worker': fileURLToPath(new URL('./worker', import.meta.url)),
		},
	},

	define: {
		'process.env.NODE_ENV': JSON.stringify(
			process.env.NODE_ENV || 'development',
		),
		global: 'globalThis',
	},

	worker: {
		format: 'es',
	},

	server: {
		allowedHosts: true,
	},

	cacheDir: 'node_modules/.vite',

	build: {
		// Disable sourcemaps in CI — they eat ~800MB of heap on 4500+ modules
		sourcemap: false,

		// Manual chunk splitting to keep individual chunk sizes manageable
		rollupOptions: {
			output: {
				manualChunks: (id: string) => {
					// Monaco editor is enormous — isolate it
					if (id.includes('monaco-editor')) return 'monaco';

					// Stripe
					if (id.includes('@stripe')) return 'stripe';

					// Heavy UI / charting libs
					if (id.includes('recharts') || id.includes('framer-motion')) return 'charts';

					// Radix UI components
					if (id.includes('@radix-ui')) return 'radix';

					// React core — must come BEFORE vendor catch-all
					// Keep react/react-dom together so they share the same module instance
					if (
						id.includes('node_modules/react/') ||
						id.includes('node_modules/react-dom/') ||
						id.includes('node_modules/react-router') ||
						id.includes('node_modules/scheduler/')
					) return 'react-core';

					// Everything else in node_modules gets a shared vendor chunk
					if (id.includes('node_modules')) return 'vendor';
				},
			},
		},

		// Give Rollup a reasonable chunk size budget (warn, not fail)
		chunkSizeWarningLimit: 1000,
	},
});
