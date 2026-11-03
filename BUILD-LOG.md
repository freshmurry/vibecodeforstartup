# BUILD LOG — vibecodeforstartup end-to-end repair + cost hardening

Date: 2026-11-02/03 · Branch: `main` ·  Status: **code complete, locally smoke-tested; production deploy pending account authentication (see "Deploy blockers")**

> GitHub sync note: the substantive files (all modifications + new files,
> including this log) were pushed via the GitHub MCP `push_files` tool.
> The 427 stale-duplicate deletions exist in the local commit but
> could not be pushed from the build VM (no git HTTPS credentials; SSH is
> proxy-blocked; the MCP path cannot express bulk deletions). One
> `git push origin main` from any authenticated checkout syncs them.

---

## 1. What was broken in the VibeSDK wiring, and what fixed it

The app is Cloudflare's VibeSDK platform (React SPA + Hono Worker, D1/Drizzle,
R2, KV, Sandbox containers, Durable Object coding agent). Generation existed,
but a generated app could never become a reachable, listed product:

1. **The deploy path was amputated.** The Workers-for-Platforms dispatch
   namespace binding was commented out in `wrangler.jsonc`, the
   `DISPATCH_NAMESPACE` var was commented out, and the Sandbox SDK deploy
   path throws when that var is absent. The containers block and the
   `UserAppSandboxService` Durable Object binding were also commented out,
   so template loading / preview builds had no sandbox either.
2. **There was nowhere for a live URL to live.** The `apps` table had no
   `deployment_url` or slug column at all — a deployment URL existed only
   transiently in a websocket message, never persisted, never listed.
3. **Asset shadowing.** `assets.run_worker_first` was `false`, so on app
   subdomains any path colliding with a platform file (`/`, `/assets/*`)
   was served the *platform's* SPA instead of the user's app. Verified
   locally and fixed (`run_worker_first: true`; the worker's fetch handler
   already delegates main-domain page loads to `ASSETS`).
4. **Stale script config.** `package.json` db scripts targeted a database
   named `vibesdk-db` (upstream leftover); the real D1 is
   `vibecodeforstartup-db`. Fixed.
5. **Dual database story.** Supabase schema/client files sat beside the D1
   implementation. Quarantined to `docs/legacy/` (schema, JS client, types,
   setup docs). D1 is now the single database story; verified zero imports
   of the Supabase client remain in `src/`. (The `SUPABASE_*` entries in
   `worker/types/secretsTemplates.ts` are secret templates for
   *user-generated* apps — a product feature, deliberately kept.)
6. **Compiled duplicates.** 428 stale compiled `.js`/`.d.ts` files sat next
   to their `.ts`/`.tsx` sources and shadowed them. Removed (the
   `container/` copies were restored — the Sandbox image compiles both
   forms itself via `bun run build`).
7. **`index.html` title was literally "Build"** with no description. Fixed
   and rebuilt into `dist/`.

## 2. Architecture decision: why apps are NOT deployed via Workers for Platforms

Researched against current Cloudflare docs (2026-11-02):

- **Workers for Platforms is a separate $25/month plan.** It is *not*
  included in the $5 Workers Paid plan. The task constraint was "no plan
  upgrades, no paid spend," so WfP cannot be enabled on this account.
- **Containers ARE included in Workers Paid** (25 GiB-hours memory,
  375 vCPU-minutes, 200 GB-hours disk per month included).

So the platform now runs in two serving modes (`APP_SERVING_MODE`):

### `static` (default, active)
Prompt → agent generates the app (sandbox session, as upstream) → on
Publish/Deploy, the agent's file tree is pulled from its Durable Object,
**transpiled in-worker with Sucrase** (types stripped, JSX → automatic
React runtime, Vite-style specifiers rewritten: extensionless relative
imports gain `.js`, CSS imports become `<link>` tags, asset imports become
URL constants, `import.meta.env` shimmed), bare imports are resolved via
an **import map to esm.sh** (versions pinned from the app's own
`package.json`), Tailwind apps get the Play CDN, and everything is written
to **R2** under `apps/<slug>/`. The main worker serves
`https://<slug>.vibecodeforstartup.com` from R2 with SPA fallback, a
restrictive CSP, per-app metering and caps. **No user code ever executes
on this account** — the browser runs the app; libraries load from
esm.sh's CDN, not from Cloudflare billing.

New pieces: `worker/services/publish/publish.ts`,
`SimpleCodeGeneratorAgent.getFilesForPublish()` + `publishStaticApp()`,
`POST /api/agent/:agentId/publish`, `apps.slug` + `apps.deployment_url`
columns (migration `0003_guardrails.sql`), the `APPS_BUCKET` R2 binding,
and a wildcard zone route `*.vibecodeforstartup.com/*`.

### `wfp` (optional, fully wired but disabled)
The original sandbox → dispatch-namespace path is preserved intact behind
`APP_SERVING_MODE=wfp`. `wrangler.jsonc` documents the exact enablement
steps (subscribe to WfP, `wrangler dispatch-namespace create
vibecodeforstartup-default-namespace`, uncomment the binding + var, set
`CLOUDFLARE_ACCOUNT_ID`/`CLOUDFLARE_API_TOKEN` worker secrets, flip the
mode). Flipping it on is a billing decision for the account owner.

### Generation sessions (containers, downsized)
Containers are re-enabled for generation/preview sessions only, at the
smallest size: `instance_type: "basic"` (¼ vCPU, 1 GiB), `max_instances: 3`,
`MAX_SANDBOX_INSTANCES=3`, `SANDBOX_INSTANCE_TYPE=basic`.

## 3. Cost guardrails (the core of this build)

All enforcement is server-side, in `worker/services/guardrails/guardrails.ts`,
metered into the D1 `usage_events` table. Caps resolve
`system_settings` (runtime-editable) → `GUARDRAIL_*` env vars → defaults.

| Guardrail | Default cap | Enforced where |
|---|---|---|
| Authentication required | always | `POST /api/agent` is `authenticated`; publish is `ownerOnly` + ownership check. Registration is additionally restricted to `ALLOWED_EMAIL` (single-operator instance as configured upstream) |
| User daily generations | **2 / user / UTC day** | `startCodeGeneration`, *before* template/sandbox/AI work |
| Global daily generations | **5 / day** | same |
| User max apps | **5** | same (counts `apps` rows) |
| Global AI calls / day | **1,500** | `executeInference` — the single funnel for every AI call |
| Per-session AI calls | **300** | same (runaway-agent brake) |
| Global deployed apps | **25** | publish/deploy path |
| Per-app requests | **5,000 / app / day** | subdomain serving |
| Global app requests | **50,000 / day** | subdomain serving |
| Sandbox footprint | 3 × basic (¼ vCPU / 1 GiB) | `wrangler.jsonc` containers + vars |
| Kill switch | `generation_enabled=false` in D1 **or** `GENERATION_KILL_SWITCH=1` env | checked in generation, inference, preview, and deploy paths |
| Fail closed | metering read/write failure ⇒ **503, work refused** | `getConfig()`/`record()` throw; callers refuse |

Existing DO/KV rate limiting (`RateLimitService` + unsafe ratelimit
bindings, 1000/min) still applies on top — note it *fails open* on binding
errors by upstream design; the guardrails above are the fail-closed layer.

**Worst-case math vs. the $5 plan's included amounts**
- Containers: 5 generations/day × ~8 min awake on basic = ~20 GiB-hrs
  memory (< 25 included), ~300 vCPU-min (< 375), ~80 GB-hrs disk (< 200).
- App traffic: 50,000 requests/day ≈ 1.5M/mo worker requests (< 10M
  included); R2 reads are Class B (1M/mo free tier inside paid plans is
  separate — R2 has no per-request charge beyond its own included amounts;
  see residual risks).
- D1 metering writes: ≤ ~52k/day worst case (< 50M rows written/mo incl.).
- AI tokens are billed by the *AI providers* (OpenAI etc.), not Cloudflare;
  the 1,500 calls/day global cap is the hard bound on that spend.

**Admin surface**
- `GET /api/admin/usage` — owner-email only (`ALLOWED_EMAIL`): live cap
  config, today/month totals by kind, top users today, deployed-app count.
- `PUT /api/admin/guardrails` — owner-only; body `{key, value}` updates one
  cap in `system_settings` (e.g. the kill switch), effective immediately,
  no deploy needed.

## 4. Stripe state (names only — values are secrets, never read)

- Implemented: checkout session creation, customer portal, subscription
  lookup, and a **signature-verified** webhook (`constructEventAsync` with
  `STRIPE_WEBHOOK_SECRET`) in `worker/api/routes/stripeRoutes.ts`.
- Config presence: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` are worker
  **secrets** (set via `wrangler secret put`, not in the repo — presence on
  the account cannot be verified without account auth).
- `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_ANNUAL_PRICE_ID`,
  `STRIPE_TEAM_MONTHLY_PRICE_ID`, `STRIPE_TEAM_ANNUAL_PRICE_ID` vars exist
  in `wrangler.jsonc` but are **empty strings** — checkout cannot succeed
  until real price IDs are set.
- **Test vs. live cannot be determined from the repo** — it depends on
  which key mode the secrets hold. Verify in the Stripe dashboard before
  taking money.

## 5. Smoke-test evidence (local, `wrangler dev` + `wrangler.local.jsonc`)

Local emulation only (see blockers): all 4 migrations apply cleanly
including `0003_guardrails.sql` (seeds verified in `system_settings`;
`apps.slug`/`deployment_url` columns present).

- `GET /api/health` → `{"status":"ok"}`
- Unauthenticated `POST /api/agent` → blocked (403 CSRF / 401 without
  session); unauthenticated `GET /api/admin/usage` → **401**
- Register (whitelisted email) → session JWT cookie issued; admin usage →
  200 with the exact cap table above
- Generation attempt ×2 → guardrail **recorded** both in `usage_events`,
  then failed downstream at template fetch ("Failed to fetch templates
  from sandbox service") because no sandbox exists in local emulation —
  the gate order (auth → rate limit → guardrail → record → work) is proven
- Generation attempt ×3 → **HTTP 429** "Daily generation limit reached
  (2 per user per day)"
- Kill switch via admin API (`generation_enabled=false`) → generation →
  **HTTP 503** "Generation is currently disabled by the platform
  operator." Restored to `true`
- Env kill switch (second instance, `GENERATION_KILL_SWITCH=1`) →
  generation → **HTTP 503** (takes precedence over quota)
- Publish pipeline unit tests (`worker/services/publish/publish.test.ts`,
  `npx vitest run --config vitest.publish.config.ts`): **4/4 pass** —
  TSX transpile, `.js` import rewriting, importmap with versions pinned
  from the fixture's own `package.json` (react@19.1.1,
  lucide-react@0.541.0), CSS `<link>` + Tailwind CDN injection, R2 keys,
  D1 deployment update, refusal when no `index.html`
- Serving: fixture app seeded to local R2 + D1 → `GET
  http://fixture-app-12345678.localhost/` → **200** with the fixture HTML
  and JS asset served as `application/javascript`; unknown slug → **404**;
  requests metered as `app_request` in `usage_events`
- Request cap: with `app_daily_request_cap` set to the already-metered
  count (3) → next request **HTTP 429** "This app has reached its daily
  traffic limit." Restored to 5000 → **200** again
- Gallery: `GET /api/apps` lists the published app with `slug` +
  `deploymentUrl`
- Admin usage totals after the run: `generation: 2`, `app_request: 4`,
  `deployedApps: 1` — matches the actions taken
- `npx tsc -b` → clean; `vite build` → succeeds, `dist/index.html` carries
  the new title

**Final shipped state: generation ENABLED, all caps at the defaults in
the table above, kill switch OFF.** Switch locations: D1
`system_settings` key `guardrails.generation_enabled` (admin API or SQL),
or the `GENERATION_KILL_SWITCH` var in `wrangler.jsonc`.

## 6. Deploy blockers (what stands between this code and the live URL)

Deployment from the build VM is **blocked on account authentication** —
this is the one step that needs Lawrence (or the parent agent) in a
browser:

1. `npx wrangler login` (or provide a `CLOUDFLARE_API_TOKEN` via the
   secure credential flow). `wrangler whoami` currently returns
   "You are not authenticated", and there is no Cloudflare connector.
2. One-time resource creation:
   - `npx wrangler r2 bucket create vibecodeforstartup-apps`
   - `npx wrangler d1 migrations apply vibecodeforstartup-db --remote`
   - Add the wildcard DNS record in the `vibecodeforstartup.com` zone:
     `*` → AAAA `100::` (proxied) so `*.vibecodeforstartup.com` resolves
3. Build the sandbox image once (needs Docker, absent on this VM — build
   happens automatically via Cloudflare Containers on first deploy from
   an authenticated machine, or run `npm run deploy` which uses
   `scripts/deploy.ts` + `.prod.vars`):
   - `npm run deploy` (sets secrets from `.prod.vars`, deploys, migrates)
4. Set the four `STRIPE_*_PRICE_ID` vars + confirm Stripe secret mode
   (test vs live) before enabling paid plans.
5. Set at least one AI provider key as a worker secret
   (`OPENAI_API_KEY` etc.) — real generation cannot run without one.

Alternative deploy path already used by Lawrence's other apps: connect
the repo in **Workers Builds** (git-connected deploys) with the build
command `npm run build` and deploy command `npx wrangler deploy`, after
steps 2–3 are done once.

## 7. Honest residual risks

- **Static mode is not full Vite.** Generated apps with server-side code,
  exotic Vite plugins, `import.meta.glob`, or binary assets imported from
  `src/` will degrade (images may 404; the app still runs). The standard
  template output (client SPA + Tailwind + lucide) is covered and tested.
  Apps that truly need a backend Worker require WfP mode ($25/mo decision).
- **Workers AI neuron metering** (if Workers AI models are selected) is
  billed per neuron past a 10,000/day allotment and cannot be perfectly
  bounded by call counts — the 1,500-call/day cap bounds it to a small,
  known worst case, but it is not zero.
- **R2 / D1 overage**: caps keep projected usage inside included amounts
  with margin, but Cloudflare bills overages rather than hard-stopping;
  the caps are enforced in *our* code, so a code bug is the failure mode.
  The fail-closed design (refuse when metering is broken) is the
  mitigation. Watch `GET /api/admin/usage` after launch.
- **Registration is owner-only** (`ALLOWED_EMAIL` gate in the upstream
  auth controller). Public sign-ups require removing that gate — a
  product decision, intentionally left as-is for cost safety.
- **`npm test` harness is broken upstream**: `vitest.config.ts` points at
  `wrangler.test.jsonc` and `test/setup.ts`, neither of which exists in
  the repo. The publish tests ship with their own
  `vitest.publish.config.ts` (node pool) and pass under it.
- **`wrangler types` drift**: `worker-configuration.d.ts` was hand-extended
  for the new bindings/vars; re-running `npm run cf-typegen` will
  regenerate it (keep the additions).
- **Drizzle snapshot**: migration `0003_guardrails.sql` was hand-written;
  run `npm run db:generate` before creating the next drizzle migration so
  the journal/snapshot include the guardrail tables and app columns.
- A cosmetic "Supabase fallback" comment remains in
  `src/components/auth/auth-modal.tsx` (comment only; no code path).

## 8. Files of interest

- `worker/services/guardrails/guardrails.ts` — caps, kill switch, metering
- `worker/services/publish/publish.ts` — static publishing pipeline
- `migrations/0003_guardrails.sql` — usage_events, cap seeds, app columns
- `worker/api/controllers/admin/adminController.ts` +
  `worker/api/routes/adminRoutes.ts` — usage view + cap editing
- `wrangler.jsonc` — production config (containers downsized, APPS_BUCKET,
  wildcard route, documented WfP block, guardrail vars)
- `wrangler.local.jsonc` — local smoke-test config (dummy secrets only)
- `docs/legacy/` — quarantined Supabase artifacts
