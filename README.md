# VibeCode Intel — vibecodeforstartup (pivot build)

Branch `pivot/affiliate-aggregator` of freshmurry/vibecodeforstartup.
(The app-builder build remains untouched on `main`.)

An agent-native content aggregation site covering vibe coding, AI agents,
machine learning, AGI, superintelligence, AI research, and AI services —
monetized with AdSense slots and an admin-managed affiliate tools directory.

- `src/agent.js` — AggregatorAgent on the official Cloudflare Agents SDK:
  scheduled + on-demand aggregation, dedupe, categorization (keyword rules
  with budget-capped Workers AI refinement), chunked runs that respect
  Workers subrequest limits.
- `src/index.js` / `src/render.js` / `src/admin.js` — public site + admin.
- Copyright-safe: only title, source, URL, date, and a ≤280-char excerpt
  from each feed's own summary are stored; every story links out.
- See `BUILD-LOG.md` for feed verification, live run evidence, production
  deploy steps, and honest gaps.

Dev: `npm install && npm test && npx wrangler dev` ·
Seed data lives in `src/feeds.js`; schema in `migrations/`.
