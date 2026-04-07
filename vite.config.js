// import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

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
        alias: {
            debug: 'debug/src/browser',
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            'shared': fileURLToPath(new URL('./shared', import.meta.url)),
            'worker': fileURLToPath(new URL('./worker', import.meta.url)),
        },
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
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
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('monaco-editor')) return 'monaco';
                    if (id.includes('@stripe')) return 'stripe';
                    if (id.includes('recharts') || id.includes('framer-motion')) return 'charts';
                    if (id.includes('@radix-ui')) return 'radix';
                    if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react';
                    if (id.includes('node_modules')) return 'vendor';
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
});
