// ============================================================================
// agent.js — AggregatorAgent (official Cloudflare Agents SDK)
// ============================================================================
// The agent does the work: on a recurring Agents-SDK cron schedule (and on
// demand from the admin dashboard) it fetches every enabled feed, dedupes
// against D1, categorizes (keyword rules first; Workers AI refines only the
// items rules cannot place, under a hard budget), and stores copyright-safe
// items (title / source / URL / date / <=280-char feed-summary excerpt).
//
// Reachable from the main worker via stub.fetch():
//   POST /run     {trigger}  -> run an aggregation pass now
//   GET  /status             -> { state, schedules }
// ============================================================================
import { Agent } from 'agents';
import { parseFeed, canonicalUrl, titleHash, truncateExcerpt, SEED_FEEDS } from './feeds.js';
import { categorizeByRules, sanitizeCategory, CATEGORY_SLUGS } from './categorize.js';

const CRON_EXPR = '17 */6 * * *';           // every 6 hours at :17 UTC
const MAX_ITEMS_PER_FEED = 30;
const FETCH_TIMEOUT_MS = 15000;

export class AggregatorAgent extends Agent {
  initialState = {
    lastRunAt: null,
    lastTrigger: null,
    lastStats: null,
    running: false,
    seeded: false,
  };

  async onStart() {
    // Ensure the recurring schedule exists exactly once.
    try {
      const schedules = await this.getSchedules({ type: 'cron' });
      if (!schedules.some(s => s.callback === 'runScheduled')) {
        await this.schedule(CRON_EXPR, 'runScheduled', {});
      }
    } catch (e) {
      console.error('schedule setup failed', e);
    }
    if (!this.state.seeded) {
      await this.seedFeeds();
      this.setState({ ...this.state, seeded: true });
    }
    // Crash recovery: an interrupted run leaves runCtx behind; close its
    // run row as 'interrupted' instead of blocking all future runs.
    if (this.state.runCtx) {
      try {
        await this.env.DB.prepare("UPDATE runs SET finished_at = ?, errors = ? WHERE id = ? AND finished_at IS NULL")
          .bind(new Date().toISOString(), JSON.stringify([{ feed: '(run)', error: 'interrupted by agent restart; partial stats lost' }]), this.state.runCtx.runId).run();
      } catch { /* best effort */ }
      this.setState({ ...this.state, runCtx: null, running: false });
    }
  }

  async runScheduled() {
    await this.runAggregation('schedule');
  }

  async onRequest(request) {
    const url = new URL(request.url);
    if (url.pathname.endsWith('/run') && request.method === 'POST') {
      let trigger = 'manual';
      try { trigger = (await request.json()).trigger || 'manual'; } catch { /* default */ }
      const stats = await this.runAggregation(trigger);
      return Response.json({ ok: true, stats });
    }
    if (url.pathname.endsWith('/status')) {
      let schedules = [];
      try { schedules = await this.getSchedules(); } catch { /* ignore */ }
      return Response.json({
        state: this.state,
        schedules: schedules.map(s => ({ id: s.id, type: s.type, cron: s.cron || null, time: s.time || null, callback: s.callback })),
      });
    }
    return new Response('not found', { status: 404 });
  }

  // -------------------------------------------------------------------------
  async seedFeeds() {
    const db = this.env.DB;
    for (const f of SEED_FEEDS) {
      await db.prepare(
        'INSERT OR IGNORE INTO feeds (name, url, home_url, kind, default_category) VALUES (?, ?, ?, ?, ?)'
      ).bind(f.name, f.url, f.home_url, f.kind, f.default_category).run();
    }
    // Seed affiliate offers as INACTIVE placeholders. They render nowhere
    // until the admin replaces the URL with a real affiliate link and
    // activates them. No affiliate relationship is claimed by these rows.
    const existing = await db.prepare('SELECT COUNT(*) AS n FROM offers').first();
    if (!existing || existing.n === 0) {
      const placeholders = [
        ['PLACEHOLDER — AI coding tool #1', 'https://example.com/replace-with-your-affiliate-link', 'Placeholder row. Replace with a real affiliate link for an AI coding tool you actually use, then activate.', 'vibecoding'],
        ['PLACEHOLDER — Agent platform #1', 'https://example.com/replace-with-your-affiliate-link', 'Placeholder row. Replace with a real affiliate link for an agent platform you have joined, then activate.', 'ai-agents'],
        ['PLACEHOLDER — AI learning resource #1', 'https://example.com/replace-with-your-affiliate-link', 'Placeholder row. Replace with a real affiliate link for a course/book you can honestly recommend, then activate.', 'machine-learning'],
      ];
      for (const [name, url, blurb, cat] of placeholders) {
        await db.prepare('INSERT INTO offers (name, affiliate_url, blurb, category, active) VALUES (?, ?, ?, ?, 0)')
          .bind(name, url, blurb, cat).run();
      }
    }
  }

  // -------------------------------------------------------------------------
  aiBudget() {
    return {
      perRun: parseInt(this.env.AI_MAX_CALLS_PER_RUN || '20', 10),
      perDay: parseInt(this.env.AI_MAX_CALLS_PER_DAY || '200', 10),
    };
  }

  async aiCallsToday() {
    const day = new Date().toISOString().slice(0, 10);
    const row = await this.env.DB.prepare('SELECT value FROM settings WHERE key = ?')
      .bind('ai_calls_' + day).first();
    return row ? parseInt(row.value, 10) || 0 : 0;
  }

  async bumpAiCalls(n) {
    const day = new Date().toISOString().slice(0, 10);
    const key = 'ai_calls_' + day;
    const cur = await this.aiCallsToday();
    await this.env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .bind(key, String(cur + n)).run();
  }

  /** Workers AI categorization refinement — returns a slug or null. */
  async aiCategorize(title, excerpt) {
    if (!this.env.AI) return null;
    try {
      const res = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: 'You classify AI news headlines into exactly one category slug. Reply with ONLY the slug, nothing else. Slugs: ' + CATEGORY_SLUGS.join(', ') },
          { role: 'user', content: 'Title: ' + title + '\nSummary: ' + excerpt },
        ],
        max_tokens: 16,
      });
      const text = (res && (res.response || res.result || '')) || '';
      const slug = sanitizeCategory(text, null);
      return slug && CATEGORY_SLUGS.includes(slug) ? slug : null;
    } catch {
      return null; // AI unavailable -> rules/default stand. Never block a run.
    }
  }

  // -------------------------------------------------------------------------
  // Aggregation runs are CHUNKED: each invocation processes at most
  // FEEDS_PER_CHUNK feeds, then (if work remains) schedules a continuation
  // alarm a second later. D1 writes are batched and existence is checked in
  // one query per feed. This keeps every invocation far below the Workers
  // subrequest limit (50 on Free, 1000 default on Paid) no matter how many
  // feeds/items a run touches — the pattern that lets the same code run
  // unchanged on the free preview and the paid production account.
  // -------------------------------------------------------------------------
  async runAggregation(trigger = 'manual') {
    if (this.state.runCtx) return { skipped: 'already-running' };
    // Cron + wrangler-trigger overlap guard: non-manual runs dedupe by time.
    if (trigger !== 'manual' && this.state.lastRunAt) {
      const ageMs = Date.now() - new Date(this.state.lastRunAt).getTime();
      if (ageMs < 30 * 60 * 1000) return { skipped: 'too-soon', ageMs };
    }
    const db = this.env.DB;
    const runInsert = await db.prepare('INSERT INTO runs (started_at, trigger) VALUES (?, ?) RETURNING id')
      .bind(new Date().toISOString(), trigger).first();
    const feeds = (await db.prepare('SELECT id FROM feeds WHERE enabled = 1 ORDER BY id').all()).results || [];
    const ctx = {
      runId: runInsert.id,
      trigger,
      feedIds: feeds.map(f => f.id),
      next: 0,
      aiUsedTodayAtStart: await this.aiCallsToday(),
      stats: { feedsOk: 0, feedsFailed: 0, itemsNew: 0, itemsSeen: 0, aiCalls: 0, errors: [] },
    };
    this.setState({ ...this.state, runCtx: ctx, running: true });
    await this.processChunk();
    const done = !this.state.runCtx;
    return { started: true, runId: ctx.runId, feedsTotal: ctx.feedIds.length, completedSynchronously: done, stats: this.state.lastStats || ctx.stats };
  }

  async continueRun() {
    if (this.state.runCtx) await this.processChunk();
  }

  async processChunk() {
    const db = this.env.DB;
    const ctx = this.state.runCtx;
    if (!ctx) return;
    const budget = this.aiBudget();
    const FEEDS_PER_CHUNK = 3;
    const AI_PER_CHUNK = 6;
    let aiThisChunk = 0;
    const slice = ctx.feedIds.slice(ctx.next, ctx.next + FEEDS_PER_CHUNK);
    const statusUpdates = [];

    for (const feedId of slice) {
      const feed = await db.prepare('SELECT * FROM feeds WHERE id = ?').bind(feedId).first();
      if (!feed) { ctx.next++; continue; }
      try {
        const resp = await fetch(feed.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VibeCodeIntel/1.0; +https://vibecodeforstartup.com/about)', 'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          redirect: 'follow',
        });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const xml = await resp.text();
        const parsed = parseFeed(xml).slice(0, MAX_ITEMS_PER_FEED);
        if (parsed.length === 0) {
          // A valid XML feed with zero items (e.g. arXiv on a no-announcement
          // day) is a healthy empty fetch, not an error. Non-XML responses
          // (HTML error pages, moved blogs) are real errors.
          if (/<rss[\s>]|<feed[\s>]|<\?xml/i.test(xml)) {
            ctx.stats.feedsOk++;
            statusUpdates.push(db.prepare('UPDATE feeds SET last_fetched_at = ?, last_status = ?, last_error = NULL, last_new_count = 0 WHERE id = ?')
              .bind(new Date().toISOString(), 'ok', feed.id));
            ctx.next++;
            continue;
          }
          throw new Error('no parseable items');
        }
        ctx.stats.itemsSeen += parsed.length;

        // Dedupe FIRST (one existence query for the whole candidate set) so
        // AI/rule categorization is only spent on genuinely new items.
        const candidates = parsed.map(raw => ({ raw, canonical: canonicalUrl(raw.url), th: titleHash(raw.title) }));
        const placeholders = candidates.map(() => '?').join(',');
        const existing = (await db.prepare('SELECT canonical_url FROM items WHERE canonical_url IN (' + placeholders + ')')
          .bind(...candidates.map(r => r.canonical)).all()).results || [];
        const seenSet = new Set(existing.map(r => r.canonical_url));
        const freshCandidates = candidates.filter(r => !seenSet.has(r.canonical));

        const rows = [];
        for (const cand of freshCandidates) {
          const raw = cand.raw;
          const excerpt = truncateExcerpt(raw.summary || '', 280);
          const rule = categorizeByRules(raw.title, excerpt, feed.default_category);
          let category = rule.category;
          let aiCategorized = 0;
          if (rule.score === 0 && ctx.stats.aiCalls < budget.perRun && aiThisChunk < AI_PER_CHUNK && ctx.aiUsedTodayAtStart + ctx.stats.aiCalls < budget.perDay) {
            const aiSlug = await this.aiCategorize(raw.title, excerpt);
            ctx.stats.aiCalls++;
            aiThisChunk++;
            if (aiSlug) { category = aiSlug; aiCategorized = 1; }
          }
          rows.push({ raw, excerpt, category, aiCategorized, canonical: cand.canonical, th: cand.th });
        }
        const fresh = rows;

        let added = 0;
        if (fresh.length) {
          const stmts = fresh.map(r => db.prepare(
            `INSERT OR IGNORE INTO items (feed_id, source_name, title, url, canonical_url, title_hash, excerpt, published_at, category, ai_categorized)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(feed.id, feed.name, r.raw.title, r.raw.url, r.canonical, r.th, r.excerpt, r.raw.publishedAt, r.category, r.aiCategorized));
          const results = await db.batch(stmts);
          for (const res of results) if (res.meta && res.meta.changes > 0) added++;
        }
        ctx.stats.itemsNew += added;
        ctx.stats.feedsOk++;
        statusUpdates.push(db.prepare('UPDATE feeds SET last_fetched_at = ?, last_status = ?, last_error = NULL, last_new_count = ? WHERE id = ?')
          .bind(new Date().toISOString(), 'ok', added, feed.id));
      } catch (e) {
        const msg = String(e && e.message || e).slice(0, 300);
        ctx.stats.feedsFailed++;
        ctx.stats.errors.push({ feed: feed.name, error: msg });
        statusUpdates.push(db.prepare('UPDATE feeds SET last_fetched_at = ?, last_status = ?, last_error = ? WHERE id = ?')
          .bind(new Date().toISOString(), 'error', msg, feed.id));
      }
      ctx.next++;
    }
    if (statusUpdates.length) await db.batch(statusUpdates);
    this.setState({ ...this.state, runCtx: ctx });

    if (ctx.next < ctx.feedIds.length) {
      await this.schedule(1, 'continueRun', {});
      return;
    }
    // Finalize.
    if (ctx.stats.aiCalls > 0) await this.bumpAiCalls(ctx.stats.aiCalls);
    await db.prepare('UPDATE runs SET finished_at = ?, feeds_ok = ?, feeds_failed = ?, items_new = ?, items_seen = ?, ai_calls = ?, errors = ? WHERE id = ?')
      .bind(new Date().toISOString(), ctx.stats.feedsOk, ctx.stats.feedsFailed, ctx.stats.itemsNew, ctx.stats.itemsSeen, ctx.stats.aiCalls, JSON.stringify(ctx.stats.errors), ctx.runId).run();
    this.setState({
      ...this.state,
      runCtx: null,
      running: false,
      lastRunAt: new Date().toISOString(),
      lastTrigger: ctx.trigger,
      lastStats: { feedsOk: ctx.stats.feedsOk, feedsFailed: ctx.stats.feedsFailed, itemsNew: ctx.stats.itemsNew, itemsSeen: ctx.stats.itemsSeen, aiCalls: ctx.stats.aiCalls },
      seeded: true,
    });
  }
}
