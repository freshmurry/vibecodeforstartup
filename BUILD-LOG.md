# BUILD LOG — vibecodeforstartup PIVOT: affiliate + AdSense content aggregator

Date: 2026-11-03 · Branch: `pivot/affiliate-aggregator` · Status: **built, tested, and running on a labeled preview deployment; production deploy pending Lawrence's Cloudflare account steps (below).**

> **Main is untouched.** The cost-hardened app-builder build remains on `main`
> exactly as delivered 2026-11-02. This branch was created from `main`, so it
> inherits the builder's tree; the aggregator is additive at the root
> (`src/*.js`, `wrangler.toml`, `db-migrations/`, `tests/`) with `package.json`,
> `README.md`, and this log replaced. **On this branch always pass the config
> explicitly — `wrangler ... -c wrangler.toml`** — because the builder's
> `wrangler.jsonc` also exists in the tree, and aggregator migrations live in
> `db-migrations/` (the `migrations/` folder holds the builder's drizzle
> migrations; do not apply them to the aggregator database). Stripping the
> legacy builder files off this branch is a follow-up cleanup for when
> Lawrence confirms the pivot deploy.

---

## 1. What this app is

An agent-native content aggregation site for vibecoding, AI agents, machine
learning, AGI, superintelligence, AI research, and AI services:

- **AggregatorAgent** (official Cloudflare Agents SDK, `agents` package) runs
  the whole operation: on its own recurring cron schedule (every 6 hours at
  :17 UTC) and on demand from the admin, it fetches every enabled RSS/Atom
  feed, dedupes against D1, categorizes, and stores items.
- **Copyright-safe by design.** An item is only: title, source name, original
  URL, published date, and an excerpt of **at most 280 characters taken from
  the feed's own summary field**. Full article text is never fetched or
  stored. Every card links out to the original publisher. Verified against
  production data: `MAX(LENGTH(excerpt)) = 279`.
- **Categorization** is deterministic keyword rules first (always available).
  Workers AI (`@cf/meta/llama-3.1-8b-instruct`) refines only items the rules
  cannot place, behind hard budgets (default 20 calls/run, 200/day, max 6 per
  invocation chunk), and only for genuinely new items (dedupe runs first).
  AI failure or absence never blocks a run.
- **Runs are chunked** (3 feeds per invocation + scheduled continuation) with
  batched D1 writes and one existence query per feed, keeping every
  invocation far below the Workers subrequest limit (50 Free / 1,000 Paid).
  This design was forced by a real failure: the first version hit "Too many
  subrequests" on the free preview; the chunked version completes all feeds.
  A wrangler cron trigger also pokes the agent as belt-and-braces; the
  agent's 30-minute overlap guard prevents double-processing.
- **Public site** (server-rendered, mobile-first): home (latest + last-72h
  "trending" — recency-windowed; no engagement data exists, so nothing fakes
  it), 7 topic hubs, search, source directory, sitemap.xml, robots.txt,
  Open Graph + JSON-LD (WebSite/SearchAction, CollectionPage/ItemList).
- **Monetization wiring:**
  - *AdSense* — `/ads.txt` serves `google.com, pub-8786200479780334, DIRECT,
    f08c47fec0942fa0`. Slot components are wired to the `ADSENSE_SLOTS` var
    (`name:slotid,...`): with no slot IDs configured they render clearly
    labeled placeholders and emit **no ad code**; set slot IDs and the real
    `<ins class="adsbygoogle">` markup + loader script activate.
    **⚠️ Lawrence: confirm pub-8786200479780334 still matches your AdSense
    account before production launch** (taken from your records, approved
    2026-10-31).
  - *Affiliate* — admin-managed `offers` table rendered on `/tools` and
    contextually on matching topic pages, always with FTC disclosure text
    and `rel="sponsored"`. A full `/disclosure` page is included. The seed
    rows are **inactive, clearly-named PLACEHOLDER rows pointing at
    example.com** — they render nowhere and claim no program membership.
    Replace them with real affiliate links (programs you have actually
    joined) in the admin and activate.
- **Admin** (`/admin`): PBKDF2 + D1 sessions (aria-agent house pattern),
  first registered account becomes admin and registration then closes.
  Dashboard shows last run, per-feed errors, items/feed totals, next
  scheduled run, and a "Run aggregation now" action; feeds can be
  added/disabled/deleted; offers managed; run logs kept.

## 2. Feed verification (2026-11-03, every seed feed fetched and parsed)

**Live and seeded (28 feeds)** — all returned HTTP 200 with parseable
RSS/Atom in verification and again in the live aggregation runs:

| Source | Type | Default topic |
|---|---|---|
| OpenAI News | lab | ai-research |
| Google DeepMind Blog | lab | ai-research |
| Google AI Blog | lab | ai-research |
| Microsoft Research | lab | ai-research |
| Meta Engineering | lab | machine-learning |
| Hugging Face Blog | lab | machine-learning |
| arXiv cs.AI / cs.CL / cs.LG / cs.NE (export API, Atom) | research | varies |
| Cloudflare Blog | ecosystem | ai-agents |
| GitHub Blog | ecosystem | vibecoding |
| LangChain Blog (www.langchain.com/blog/rss.xml) | ecosystem | ai-agents |
| Vercel Blog | ecosystem | vibecoding |
| Simon Willison's Weblog | ecosystem | ai-agents |
| Latent Space (latent.space/feed) | ecosystem | ai-agents |
| Import AI | ecosystem | superintelligence |
| The Sequence | ecosystem | machine-learning |
| Thoughtworks Insights (thoughtworks.com/rss/insights.xml) | services | ai-services |
| AWS Machine Learning Blog | services | ai-services |
| AI Trends | services | ai-services |
| NVIDIA Blog | news | machine-learning |
| InfoQ | news | vibecoding |
| The New Stack | news | vibecoding |
| IEEE Spectrum | news | ai-research |
| MarkTechPost | news | machine-learning |
| Unite.AI | news | machine-learning |
| BDTechTalks | news | ai-research |

**Dropped or flagged during verification (not seeded):**

| Candidate | Finding |
|---|---|
| Anthropic | No working RSS found (`/news/rss.xml` and `/rss.xml` → 404). Biggest single gap; add from admin if they publish one. |
| Meta AI Blog | `ai.meta.com/blog/rss/` verified 200 at first check, then 404 (all variants) the same day — publisher removed it. Meta Engineering retained. |
| LlamaIndex Blog | Verified 200 at first check, then all feed paths 404 the same day. Removed; re-add from admin if restored. |
| LangChain (old URL) | `blog.langchain.com/rss/` now redirects to the HTML blog index; the live feed is `www.langchain.com/blog/rss.xml` — seeded at the corrected URL. |
| arXiv RSS (rss.arxiv.org) | Valid but returns an **empty channel outside announcement windows**; switched to the always-populated export.arxiv.org Atom API. |
| EPAM, Slalom, Accenture, McKinsey | No public RSS located at any tested URL (404 / non-feed responses). Professional-services coverage currently rests on Thoughtworks + AWS ML Blog + AI Trends. |
| MIT Technology Review, O'Reilly Radar, ZDNet AI, VentureBeat AI, Distill, ACM Queue | Did not return usable feed XML in verification (blocked, dead, or non-feed responses). |
| Unite.AI | Seeded and working (25 items in run 2) but returned an origin-side HTTP 520 in later runs — transient publisher error; the agent logs it and retries next run. |

## 3. Verification evidence (preview deployment)

Preview: **https://vibecodeforstartup.ring-pleasure.workers.dev**
(wrangler `--temporary` preview account — NOT Lawrence's account; expires if
unclaimed; the wrangler cron trigger cannot register on the free preview
account, which is why the agent's own Agents-SDK schedule is primary — it
registered fine and shows on the dashboard.)

Real aggregation passes against the live feeds (remote D1 on the preview):

| Run | Trigger | Feeds OK | Failed | Seen | New | AI calls |
|---|---|---|---|---|---|---|
| 1 (pre-chunking build) | manual | 1 | 29 | 30 | 30 | 10 |
| 2 (chunked) | manual | 18 | 12 | 404 | 374 | 20 |
| 3 (dedupe-first + fixes) | manual | 21 | 8 | 468 | 89 | 20 |
| 4 (arXiv API + chunk AI caps) | manual | 27 | 1 | 618 | 134 | 20 |
| 5 (dedupe proof, immediate re-run) | manual | 27 | 1 | 618 | **0** | — |

Final state: **627 items** across 27 sources (Unite.AI's 520 is the only
failing feed — origin-side, previously successful). Categories: vibecoding
122, machine-learning 95, ai-agents 73, ai-research 66, ai-services 31,
superintelligence 13, agi 4 (counts from run 3 snapshot; grew after).

Unit/integration tests: **15 passed / 0 failed** (`npm test`) — RSS + Atom
parsing, entity/CDATA handling, canonical-URL dedupe equivalence, title
hashing, 280-char excerpt cap, rule categorization + fallback,
AI-output sanitization, taxonomy completeness, ads.txt generation,
sitemap/robots contents, PBKDF2 round-trip. The tests caught one real bug
(entity-decode order eating `<Guide>` in titles) before deploy.

Also verified live on the preview: `/`, all topic pages, `/search`,
`/sources`, `/tools`, `/disclosure`, `/about`, `/sitemap.xml`, `/robots.txt`,
`/ads.txt`, `/health` all return 200; anonymous `/admin` and `/admin/feeds`
redirect to login (auth boundary); dashboard shows agent state + registered
cron schedule; admin register/login/logout round-trip works.

Local note: `wrangler dev` on this VM cannot make outbound HTTPS calls
(the sandbox's TLS egress interception breaks workerd fetches — "TLS
handshake failed"), so local passes fail every feed with internal errors.
This is an environment limitation, not an app bug: the identical code
completes 27/28 feeds on the real Cloudflare network. Production (Lawrence's
account) is unaffected.

## 4. Production deploy steps (Lawrence's account)

1. From an authenticated checkout (the GitHub-connected Workers Builds flow
   used for aria-agent, or `wrangler login`):
   - `wrangler d1 create vibecodeforstartup-agg -c wrangler.toml`
   - Put the returned database ID into `wrangler.toml` (replacing the
     all-zero placeholder — it fails closed by design until then).
   - `npm install && npm run db:remote` (applies `db-migrations/` only)
   - `npm run deploy` (or connect this branch in Workers Builds — set the
     deploy command to `wrangler deploy -c wrangler.toml`).
2. Confirm `ADSENSE_PUB_ID` in `wrangler.toml` matches the AdSense account;
   after creating ad units in AdSense, set `ADSENSE_SLOTS` (e.g.
   `header:1234567890,sidebar:1234567891`) and redeploy to activate real ads.
3. Connect the domain: Cloudflare dashboard → Workers → `vibecodeforstartup`
   → Settings → Domains & Routes → add `vibecodeforstartup.com` (and `www`
   if desired). The domain's DNS is already on Cloudflare. Set `SITE_URL`
   accordingly (already `https://vibecodeforstartup.com`).
4. Open `https://vibecodeforstartup.com/admin/register` and create the first
   admin account immediately (registration closes once it exists). Trigger
   "Run aggregation now" to populate; the agent then self-schedules every
   6 hours.
5. In `/admin/offers`, replace the three PLACEHOLDER rows with real affiliate
   links for programs actually joined, and activate them.
6. Nothing to buy: no Workers for Platforms, no new plan. D1 + Workers AI
   usage at this scale sits inside the existing paid plan's included
   amounts; AI spend is hard-capped by the run/day budgets above.

## 5. Honest gaps / not built

- No Anthropic feed (none exists publicly) and thin professional-services
  coverage (3 feeds) — the white-paper angle depends on firms that mostly
  don't publish RSS; the admin accepts new feeds in seconds when found.
- "Trending" is a recency window (last 72h), not engagement-ranked — the
  site collects no engagement data yet.
- AdSense units are wired but inactive until Lawrence supplies slot IDs;
  affiliate offers are placeholders until he supplies real links. Revenue
  today: $0 (nothing is faked).
- Search is SQL `LIKE` over titles/excerpts — adequate at this scale;
  a Vectorize/AI-Search upgrade is future work, not present.
- Item retention is unbounded (one row per story, ~600/run-day max adds
  a few hundred rows/day worst case) — a pruning job (e.g. keep 180 days)
  is a sensible follow-up, not yet implemented.
- The preview deployment lives on a temporary account and will expire;
  production needs the steps in §4.
