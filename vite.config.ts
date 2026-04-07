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
		sourcemap: false,

		rollupOptions: {
			output: {
				manualChunks: (id: string) => {
					// Monaco editor — isolate it, it's enormous and self-contained
					if (id.includes('monaco-editor')) return 'monaco';

					// Stripe — small, isolated, no React dependency
					if (id.includes('@stripe')) return 'stripe';

					// NOTE: Do NOT split react/react-dom/vendor separately.
					// Doing so creates circular chunk imports → createContext undefined crash.
					// Let Rollup colocate everything that shares React in one vendor chunk.
				},
			},
		},

		chunkSizeWarningLimit: 2000,
	},
});
