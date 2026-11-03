/**
 * PublishService — static publishing for generated apps.
 *
 * WHY THIS EXISTS
 * ---------------
 * The upstream VibeSDK pattern deploys every generated app as its own
 * Worker into a Workers-for-Platforms dispatch namespace. WfP is a
 * SEPARATE $25/month plan that is not included in the $5 Workers Paid
 * plan, so on this account generated apps are instead published as
 * STATIC SITES:
 *
 *   1. The agent's file tree (template + generated files) is pulled from
 *      the CodeGeneratorAgent Durable Object.
 *   2. TS/TSX/JSX sources are transpiled in-worker with Sucrase (types
 *      stripped, JSX compiled to the automatic React runtime). No Vite
 *      build, no sandbox container, no user Worker is ever created.
 *   3. Bare module imports (react, lucide-react, ...) are rewritten at
 *      serve time by an import map injected into index.html, pointing
 *      at esm.sh — the browser loads libraries from the CDN, the
 *      platform account executes ZERO user code.
 *   4. Files are written to R2 (APPS_BUCKET) under apps/<slug>/ and the
 *      main worker serves them at https://<slug>.<CUSTOM_DOMAIN> with
 *      per-app request metering and caps (see guardrails service).
 *
 * KNOWN LIMITS (honest list)
 * --------------------------
 * - No server-side code in generated apps (API routes, SSR) — the
 *   generated template is a client SPA, so this covers the standard
 *   output. Apps that truly need a backend Worker require WfP mode.
 * - Vite-specific features degrade: import.meta.env is shimmed to {},
 *   asset imports (images) are mapped to the file's published path when
 *   the file exists in the tree, CSS @import of packages is dropped.
 * - Tailwind v4 (@import "tailwindcss") is served via the Tailwind Play
 *   CDN script, which compiles utilities in the browser. Very close for
 *   utility classes; v4-only theme syntax may differ slightly.
 * - Library versions resolve through esm.sh (pinned for react /
 *   react-dom from the app's own package.json when present).
 */

import { transform } from 'sucrase';
import { createLogger } from '../../logger';

const logger = createLogger('PublishService');

export interface PublishInputFile {
    path: string;
    contents: string;
}

export interface PublishResult {
    slug: string;
    deploymentUrl: string;
    fileCount: number;
}

const SKIP_PATTERNS: RegExp[] = [
    /(^|\/)node_modules\//,
    /(^|\/)dist\//,
    /(^|\/)\.git\//,
    /^package-lock\.json$/,
    /^bun\.lockb?$/,
    /^wrangler\.(jsonc?|toml)$/,
    /^tsconfig.*\.json$/,
    /^vite\.config\./,
    /^eslint/,
    /^\.eslintrc/,
    /^Dockerfile/,
    /\.d\.ts$/,
    /(^|\/)components\.json$/,
    /(^|\/)template\.json$/,
    /(^|\/)README\.md$/,
];

const BINARY_EXTENSIONS = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.avif',
    '.woff', '.woff2', '.ttf', '.otf', '.eot', '.mp4', '.mp3', '.pdf', '.zip',
]);

const CONTENT_TYPES: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.map': 'application/json; charset=utf-8',
};

export function contentTypeForPath(path: string): string {
    const dot = path.lastIndexOf('.');
    if (dot === -1) return 'application/octet-stream';
    return CONTENT_TYPES[path.slice(dot).toLowerCase()] ?? 'application/octet-stream';
}

export function slugify(title: string, appId: string): string {
    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'app';
    return `${base}-${appId.replace(/-/g, '').slice(0, 8)}`;
}

function extOf(path: string): string {
    const dot = path.lastIndexOf('.');
    return dot === -1 ? '' : path.slice(dot).toLowerCase();
}

function normalizePath(p: string): string {
    let out = p.replace(/^\.\//, '').replace(/^\/+/, '');
    if (out.startsWith('public/')) out = out.slice('public/'.length);
    return out;
}

const ASSET_IMPORT_EXT = /\.(png|jpe?g|gif|webp|avif|ico|mp4|mp3|woff2?|ttf)$/i;

function resolveRelative(fromPath: string, spec: string): string {
    const dir = fromPath.split('/').slice(0, -1);
    for (const part of spec.split('/')) {
        if (part === '.' || part === '') continue;
        if (part === '..') dir.pop();
        else dir.push(part);
    }
    return dir.join('/');
}

/**
 * Rewrite Vite-style module specifiers so a plain browser can load the
 * transpiled tree: relative imports gain their .js extension, CSS
 * imports become <link> tags (collected in cssLinks), and asset imports
 * become URL string constants (as Vite would emit).
 */
function rewriteModuleSpecifiers(
    code: string,
    fromPath: string,
    cssLinks: Set<string>,
): string {
    const fixRelative = (spec: string): string => {
        if (/\.(tsx?|jsx|mjs)$/.test(spec)) return spec.replace(/\.(tsx?|jsx|mjs)$/, '.js');
        if (!/\.[a-z0-9]+$/i.test(spec)) return `${spec}.js`;
        return spec;
    };
    // import <clause> from 'spec'
    code = code.replace(
        /import\s+([^'"]*?)\s+from\s*(['"])([^'"]+)\2/g,
        (whole, clause: string, q: string, spec: string) => {
            if (!spec.startsWith('.')) return whole;
            if (spec.endsWith('.css')) {
                cssLinks.add(resolveRelative(fromPath, spec));
                return '';
            }
            if (ASSET_IMPORT_EXT.test(spec)) {
                const url = `/${resolveRelative(fromPath, spec)}`;
                const def = clause.trim().match(/^([A-Za-z_$][\w$]*)/);
                return def ? `const ${def[1]} = ${JSON.stringify(url)};` : '';
            }
            return `import ${clause} from ${q}${fixRelative(spec)}${q}`;
        },
    );
    // export ... from 'spec'
    code = code.replace(
        /export\s+([^'"]*?)\s+from\s*(['"])([^'"]+)\2/g,
        (whole, clause: string, q: string, spec: string) => {
            if (!spec.startsWith('.')) return whole;
            return `export ${clause} from ${q}${fixRelative(spec)}${q}`;
        },
    );
    // side-effect import 'spec'
    code = code.replace(
        /import\s*(['"])([^'"]+)\1\s*;?/g,
        (whole, q: string, spec: string) => {
            if (!spec.startsWith('.')) return whole;
            if (spec.endsWith('.css')) {
                cssLinks.add(resolveRelative(fromPath, spec));
                return '';
            }
            return `import ${q}${fixRelative(spec)}${q};`;
        },
    );
    return code;
}

/** Find bare (non-relative) module specifiers in transformed JS. */
function collectBareImports(code: string, into: Set<string>): void {
    const re = /(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
        const spec = m[1] ?? m[2] ?? m[3];
        if (spec && !spec.startsWith('.') && !spec.startsWith('/') && !spec.startsWith('http')) {
            into.add(spec);
        }
    }
}

function esmUrl(spec: string, pkgVersions: Map<string, string>): string {
    // Split package root from subpath (handles @scope/pkg/sub)
    const parts = spec.split('/');
    const root = spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
    const version = pkgVersions.get(root);
    if (spec === root) {
        return version ? `https://esm.sh/${root}@${version}` : `https://esm.sh/${root}`;
    }
    const sub = spec.slice(root.length + 1);
    return version
        ? `https://esm.sh/${root}@${version}/${sub}`
        : `https://esm.sh/${root}/${sub}`;
}

export class PublishService {
    /**
     * Transform the agent's file tree and write it to R2, then mark the
     * app deployed in D1. Returns the public URL.
     */
    static async publishApp(
        env: Env,
        args: { appId: string; title: string; files: PublishInputFile[] },
    ): Promise<PublishResult> {
        const { appId, title, files } = args;
        const bucket = env.APPS_BUCKET;
        if (!bucket) {
            throw new Error('APPS_BUCKET binding is not configured');
        }

        // Reuse the existing slug so republication keeps a stable URL.
        let slug: string | null = null;
        try {
            const row = await env.DB
                .prepare('SELECT slug FROM apps WHERE id = ?')
                .bind(appId)
                .first<{ slug: string | null }>();
            slug = row?.slug ?? null;
        } catch {
            slug = null;
        }
        if (!slug) slug = slugify(title, appId);

        // Package versions from the app's own package.json (pinning).
        const pkgVersions = new Map<string, string>();
        const pkgFile = files.find((f) => normalizePath(f.path) === 'package.json');
        if (pkgFile) {
            try {
                const pkg = JSON.parse(pkgFile.contents) as {
                    dependencies?: Record<string, string>;
                    devDependencies?: Record<string, string>;
                };
                for (const deps of [pkg.dependencies ?? {}, pkg.devDependencies ?? {}]) {
                    for (const [name, range] of Object.entries(deps)) {
                        const clean = range.replace(/^[\^~>=<\s]+/, '').split(' ')[0];
                        if (/^\d+\.\d+\.\d+/.test(clean)) pkgVersions.set(name, clean);
                    }
                }
            } catch {
                // Non-JSON package.json: fall back to unpinned esm.sh resolution.
            }
        }
        if (!pkgVersions.has('react')) pkgVersions.set('react', '19.1.1');
        if (!pkgVersions.has('react-dom')) pkgVersions.set('react-dom', '19.1.1');

        const bareImports = new Set<string>();
        const cssLinks = new Set<string>();
        let usesTailwind = false;
        const outputs: { key: string; body: string; contentType: string }[] = [];
        let indexHtml: string | null = null;
        let entryPath: string | null = null;

        for (const file of files) {
            const rawPath = file.path;
            if (SKIP_PATTERNS.some((re) => re.test(rawPath))) continue;
            const path = normalizePath(rawPath);
            const ext = extOf(path);
            if (BINARY_EXTENSIONS.has(ext)) continue; // platform file store is text

            if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx' || ext === '.mjs') {
                const isTs = ext === '.ts' || ext === '.tsx';
                let code: string;
                try {
                    code = transform(file.contents, {
                        transforms: isTs ? ['typescript', 'jsx'] : ['jsx'],
                        jsxRuntime: 'automatic',
                        jsxImportSource: 'react',
                        filePath: rawPath,
                        production: true,
                    }).code;
                } catch (error) {
                    logger.warn(`Sucrase failed for ${rawPath}, skipping file`, { error: String(error) });
                    continue;
                }
                // Shim Vite-isms that do not exist in a plain browser context.
                code = code.replace(/import\.meta\.env/g, '({})');
                code = code.replace(/import\.meta\.glob/g, '(() => ({}))');
                code = rewriteModuleSpecifiers(code, path, cssLinks);
                collectBareImports(code, bareImports);
                const outPath = path.replace(/\.(tsx?|jsx|mjs)$/, '.js');
                outputs.push({ key: outPath, body: code, contentType: CONTENT_TYPES['.js'] });
                continue;
            }

            if (ext === '.css') {
                let css = file.contents;
                if (css.includes('tailwindcss') || css.includes('@tailwind')) {
                    usesTailwind = true;
                    css = css
                        .replace(/@import\s+["']tailwindcss["'];?/g, '')
                        .replace(/@tailwind\s+(base|components|utilities);?/g, '');
                }
                // Drop package CSS imports (cannot be resolved statically).
                css = css.replace(/@import\s+["'](?!\.|http|\/)[^"']+["'];?/g, '');
                outputs.push({ key: path, body: css, contentType: CONTENT_TYPES['.css'] });
                continue;
            }

            if (path === 'index.html') {
                indexHtml = file.contents;
                continue;
            }

            outputs.push({ key: path, body: file.contents, contentType: contentTypeForPath(path) });
        }

        if (!indexHtml) {
            throw new Error('Generated app has no index.html to publish');
        }

        // Rewrite the entry script in index.html to the transpiled file.
        indexHtml = indexHtml.replace(
            /(<script[^>]*type="module"[^>]*src=")([^"]+)(")/,
            (_m, pre: string, src: string, post: string) => {
                const cleaned = src.replace(/^\//, '').replace(/\.(tsx?|jsx)$/, '.js');
                entryPath = cleaned;
                return `${pre}/${cleaned}${post}`;
            },
        );

        // Import map for bare specifiers (plus the JSX runtime sucrase emits).
        bareImports.add('react/jsx-runtime');
        bareImports.add('react');
        bareImports.add('react-dom');
        bareImports.add('react-dom/client');
        const imports: Record<string, string> = {};
        for (const spec of bareImports) {
            imports[spec] = esmUrl(spec, pkgVersions);
        }
        const cssTags = [...cssLinks]
            .map((href) => `<link rel="stylesheet" href="/${href}">`)
            .join('');
        const importMapTag = `${cssTags}<script type="importmap">${JSON.stringify({ imports })}</script>`;
        const tailwindTag = usesTailwind
            ? '<script src="https://cdn.tailwindcss.com"></script>'
            : '';
        const headInjection = `${importMapTag}${tailwindTag}`;
        if (indexHtml.includes('</head>')) {
            indexHtml = indexHtml.replace('</head>', `${headInjection}</head>`);
        } else {
            indexHtml = headInjection + indexHtml;
        }

        // Write everything to R2.
        const prefix = `apps/${slug}/`;
        for (const out of outputs) {
            await bucket.put(prefix + out.key, out.body, {
                httpMetadata: { contentType: out.contentType },
            });
        }
        await bucket.put(prefix + 'index.html', indexHtml, {
            httpMetadata: { contentType: CONTENT_TYPES['.html'] },
        });

        const domain = env.CUSTOM_DOMAIN || 'vibecodeforstartup.com';
        const isLocal = domain.includes('localhost');
        const deploymentUrl = `${isLocal ? 'http' : 'https'}://${slug}.${domain}`;

        await env.DB.prepare(
            `UPDATE apps
             SET slug = ?, deployment_url = ?, status = 'completed',
                 last_deployed_at = ?, updated_at = ?
             WHERE id = ?`,
        )
            .bind(slug, deploymentUrl, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000), appId)
            .run();

        logger.info('Published app statically', {
            appId,
            slug,
            fileCount: outputs.length + 1,
            entryPath,
            usesTailwind,
        });

        return { slug, deploymentUrl, fileCount: outputs.length + 1 };
    }
}
