/**
 * PublishService smoke tests (run with a node-pool vitest config; the
 * repo's workers-pool harness references wrangler.test.jsonc which does
 * not exist — pre-existing breakage, see BUILD-LOG.md).
 *
 *   npx vitest run worker/services/publish/publish.test.ts --config vitest.publish.config.ts
 */
import { describe, it, expect } from 'vitest';
import { PublishService, slugify, contentTypeForPath } from './publish';

class FakeR2 {
    objects = new Map<string, { body: string; contentType?: string }>();
    async put(key: string, body: string, opts?: { httpMetadata?: { contentType?: string } }) {
        this.objects.set(key, { body, contentType: opts?.httpMetadata?.contentType });
        return null;
    }
    async get(key: string) {
        const hit = this.objects.get(key);
        return hit ? { body: hit.body } : null;
    }
}

function fakeEnv(bucket: FakeR2) {
    const updates: unknown[][] = [];
    const env = {
        APPS_BUCKET: bucket,
        CUSTOM_DOMAIN: 'example.com',
        DB: {
            prepare(sql: string) {
                return {
                    bind(...args: unknown[]) {
                        return {
                            async first() {
                                if (sql.includes('SELECT slug FROM apps')) return { slug: null };
                                return null;
                            },
                            async run() {
                                updates.push(args);
                                return { success: true };
                            },
                        };
                    },
                };
            },
        },
    };
    return { env: env as unknown as Env, updates };
}

const FIXTURE_FILES = [
    {
        path: 'index.html',
        contents:
            '<!doctype html><html><head><title>Todo</title></head><body><div id="root"></div>' +
            '<script type="module" src="/src/main.tsx"></script></body></html>',
    },
    {
        path: 'package.json',
        contents: JSON.stringify({ dependencies: { react: '^19.1.1', 'react-dom': '^19.1.1', 'lucide-react': '^0.541.0' } }),
    },
    {
        path: 'src/main.tsx',
        contents:
            "import React from 'react';\nimport { createRoot } from 'react-dom/client';\n" +
            "import App from './App';\nimport './index.css';\n" +
            "createRoot(document.getElementById('root')!).render(<App />);\n",
    },
    {
        path: 'src/App.tsx',
        contents:
            "import { useState } from 'react';\nimport { Check } from 'lucide-react';\n" +
            'export default function App() { const [n, setN] = useState<number>(0); ' +
            'return <button onClick={() => setN(n + 1)}><Check /> {n}</button>; }\n',
    },
    {
        path: 'src/index.css',
        contents: '@import "tailwindcss";\n.custom { color: red; }\n',
    },
];

describe('PublishService.publishApp', () => {
    it('transpiles TSX, rewrites imports, injects importmap + css + tailwind, writes R2, updates D1', async () => {
        const bucket = new FakeR2();
        const { env, updates } = fakeEnv(bucket);
        const result = await PublishService.publishApp(env, {
            appId: 'abcd1234-0000-0000-0000-000000000000',
            title: 'My Todo App!',
            files: FIXTURE_FILES,
        });

        expect(result.slug).toBe('my-todo-app-abcd1234');
        expect(result.deploymentUrl).toBe('https://my-todo-app-abcd1234.example.com');

        const prefix = 'apps/my-todo-app-abcd1234/';
        const index = bucket.objects.get(prefix + 'index.html');
        expect(index).toBeTruthy();
        // Entry rewritten from TSX to transpiled JS
        expect(index!.body).toContain('src="/src/main.js"');
        // Import map injected with pinned esm.sh URLs
        expect(index!.body).toContain('type="importmap"');
        expect(index!.body).toContain('https://esm.sh/react@19.1.1');
        expect(index!.body).toContain('https://esm.sh/lucide-react@0.541.0');
        // CSS link + Tailwind Play CDN injected
        expect(index!.body).toContain('<link rel="stylesheet" href="/src/index.css">');
        expect(index!.body).toContain('https://cdn.tailwindcss.com');

        const main = bucket.objects.get(prefix + 'src/main.js');
        expect(main).toBeTruthy();
        // CSS import removed from JS; relative import gained .js extension
        expect(main!.body).not.toContain('index.css');
        expect(main!.body).toContain("from './App.js'");
        // JSX compiled away (automatic runtime)
        expect(main!.body).not.toContain('<App />');

        const app = bucket.objects.get(prefix + 'src/App.js');
        expect(app).toBeTruthy();
        expect(app!.body).toContain('useState'); // types stripped, code intact

        const css = bucket.objects.get(prefix + 'src/index.css');
        expect(css!.body).not.toContain('tailwindcss');
        expect(css!.body).toContain('.custom');

        // D1 deployment update recorded (slug, url, seconds timestamps)
        expect(updates.length).toBe(1);
        expect(updates[0]).toContain('my-todo-app-abcd1234');
    });

    it('refuses when the app has no index.html', async () => {
        const bucket = new FakeR2();
        const { env } = fakeEnv(bucket);
        await expect(
            PublishService.publishApp(env, {
                appId: 'abcd1234-0000-0000-0000-000000000000',
                title: 'Broken',
                files: [{ path: 'src/main.tsx', contents: 'export {};' }],
            }),
        ).rejects.toThrow(/index\.html/);
    });
});

describe('helpers', () => {
    it('slugify produces DNS-safe slugs', () => {
        expect(slugify('Hello, World! 2026', 'ffffffff-1111')).toBe('hello-world-2026-ffffffff');
        expect(slugify('!!!', 'ffffffff-1111')).toBe('app-ffffffff');
    });
    it('content types are sane', () => {
        expect(contentTypeForPath('a/b.js')).toContain('javascript');
        expect(contentTypeForPath('index.html')).toContain('text/html');
    });
});
