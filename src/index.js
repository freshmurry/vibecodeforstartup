// ============================================================================
// index.js — worker entry: public site, admin, agent routing, cron poke
// ============================================================================
import { getAgentByName, routeAgentRequest } from 'agents';
import { AggregatorAgent } from './agent.js';
import * as R from './render.js';
import * as A from './admin.js';
import { hashPassword, verifyPassword, createSession, currentUser, destroySession, isAdminUser, nowISO } from './auth.js';
import { TAXONOMY } from './categorize.js';

export { AggregatorAgent };

const HTML = { 'content-type': 'text/html; charset=utf-8' };
const html = (body, status = 200) => new Response(body, { status, headers: HTML });
const redirect = (to) => new Response(null, { status: 302, headers: { Location: to } });

async function agentStub(env) {
  return getAgentByName(env.AggregatorAgent, 'main');
}
async function agentCall(env, path, init) {
  const stub = await agentStub(env);
  const res = await stub.fetch(new Request('https://agent' + path, init));
  return res.json();
}

// ---------------------------------------------------------------------------
// Public handlers
// ---------------------------------------------------------------------------
async function home(env) {
  const db = env.DB;
  const latest = (await db.prepare('SELECT * FROM items ORDER BY COALESCE(published_at, fetched_at) DESC LIMIT 24').all()).results || [];
  const trending = (await db.prepare("SELECT * FROM items WHERE COALESCE(published_at, fetched_at) > datetime('now', '-72 hours') ORDER BY COALESCE(published_at, fetched_at) DESC LIMIT 10").all()).results || [];
  const countRows = (await db.prepare('SELECT category, COUNT(*) AS n FROM items GROUP BY category').all()).results || [];
  const counts = {};
  for (const r of countRows) counts[r.category] = r.n;
  return html(R.homePage(env, { latest, trending, counts }));
}

async function topic(env, slug) {
  if (!TAXONOMY.some(t => t.slug === slug)) return html('Not found', 404);
  const items = (await env.DB.prepare('SELECT * FROM items WHERE category = ? ORDER BY COALESCE(published_at, fetched_at) DESC LIMIT 60').bind(slug).all()).results || [];
  let page = R.topicPage(env, slug, items);
  const active = (await env.DB.prepare('SELECT * FROM offers WHERE active = 1 AND category = ? ORDER BY sort, id LIMIT 3').bind(slug).all()).results || [];
  if (active.length) {
    const box = '<aside class="card" style="margin:18px 0"><h3 style="margin-top:0">Tools for this topic</h3>' +
      active.map(o => '<p><a href="' + R.esc(o.affiliate_url) + '" target="_blank" rel="sponsored noopener"><strong>' + R.esc(o.name) + '</strong></a> — ' + R.esc(o.blurb) + '</p>').join('') +
      '<p class="disc">Affiliate links — we may earn a commission. <a href="/disclosure">Disclosure</a>.</p></aside>';
    page = page.replace('</main>', box + '</main>');
  }
  return html(page);
}

async function search(env, q) {
  const like = '%' + q.replace(/[%_]/g, '') + '%';
  const items = q
    ? (await env.DB.prepare('SELECT * FROM items WHERE title LIKE ? OR excerpt LIKE ? OR source_name LIKE ? ORDER BY COALESCE(published_at, fetched_at) DESC LIMIT 60').bind(like, like, like).all()).results || []
    : [];
  return html(R.searchPage(env, q, items));
}

// ---------------------------------------------------------------------------
// Admin handlers
// ---------------------------------------------------------------------------
async function requireAdmin(env, request) {
  const user = await currentUser(env.DB, request);
  if (!user) return { user: null, response: redirect('/admin/login') };
  if (!isAdminUser(env, user)) return { user: null, response: html('Forbidden — admin only.', 403) };
  return { user, response: null };
}

async function adminRoute(env, request, url) {
  const db = env.DB;
  const path = url.pathname;

  if (path === '/admin/login') {
    if (request.method === 'POST') {
      const form = await request.formData();
      const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(String(form.get('email') || '').toLowerCase()).first();
      if (user && await verifyPassword(String(form.get('password') || ''), user.password_hash)) {
        const cookie = await createSession(db, request, user.id);
        return new Response(null, { status: 302, headers: { Location: '/admin', 'Set-Cookie': cookie } });
      }
      return html(A.loginPage('Invalid email or password.', false));
    }
    const anyUser = await db.prepare('SELECT COUNT(*) AS n FROM users').first();
    return html(A.loginPage(null, anyUser && anyUser.n === 0));
  }

  if (path === '/admin/register') {
    const anyUser = await db.prepare('SELECT COUNT(*) AS n FROM users').first();
    if (anyUser && anyUser.n > 0) return redirect('/admin/login');
    if (request.method === 'POST') {
      const form = await request.formData();
      const email = String(form.get('email') || '').toLowerCase().trim();
      const password = String(form.get('password') || '');
      if (!email.includes('@')) return html(A.registerPage('Enter a valid email.'));
      if (password.length < 10) return html(A.registerPage('Password must be at least 10 characters.'));
      const hash = await hashPassword(password);
      const ins = await db.prepare('INSERT INTO users (email, password_hash, is_admin) VALUES (?, ?, 1) RETURNING id').bind(email, hash).first();
      const cookie = await createSession(db, request, ins.id);
      return new Response(null, { status: 302, headers: { Location: '/admin', 'Set-Cookie': cookie } });
    }
    return html(A.registerPage(null));
  }

  if (path === '/admin/logout' && request.method === 'POST') {
    await destroySession(db, request);
    return new Response(null, { status: 302, headers: { Location: '/', 'Set-Cookie': 'vibe_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' } });
  }

  const { user, response } = await requireAdmin(env, request);
  if (response) return response;

  if (path === '/admin' || path === '/admin/') {
    const status = await agentCall(env, '/status').catch(() => null);
    const lastRun = await db.prepare('SELECT * FROM runs ORDER BY id DESC LIMIT 1').first();
    const totals = {
      items: (await db.prepare('SELECT COUNT(*) AS n FROM items').first()).n,
      feeds: (await db.prepare('SELECT COUNT(*) AS n FROM feeds WHERE enabled = 1').first()).n,
    };
    return html(A.dashboardPage(user, status, lastRun, totals));
  }

  if (path === '/admin/run' && request.method === 'POST') {
    await agentCall(env, '/run', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ trigger: 'manual' }) });
    return redirect('/admin');
  }

  if (path === '/admin/feeds') {
    if (request.method === 'POST') {
      const form = await request.formData();
      await db.prepare('INSERT OR IGNORE INTO feeds (name, url, home_url, kind, default_category) VALUES (?, ?, ?, ?, ?)')
        .bind(String(form.get('name') || '').trim(), String(form.get('url') || '').trim(), String(form.get('home_url') || '').trim(), String(form.get('kind') || 'blog'), String(form.get('default_category') || 'ai-research')).run();
      return redirect('/admin/feeds');
    }
    const feeds = (await db.prepare('SELECT * FROM feeds ORDER BY name').all()).results || [];
    return html(A.feedsPage(user, feeds));
  }
  const feedAction = path.match(/^\/admin\/feeds\/(\d+)\/(toggle|delete)$/);
  if (feedAction && request.method === 'POST') {
    const id = parseInt(feedAction[1], 10);
    if (feedAction[2] === 'toggle') await db.prepare('UPDATE feeds SET enabled = 1 - enabled WHERE id = ?').bind(id).run();
    else await db.prepare('DELETE FROM feeds WHERE id = ?').bind(id).run();
    return redirect('/admin/feeds');
  }

  if (path === '/admin/offers') {
    if (request.method === 'POST') {
      const form = await request.formData();
      await db.prepare('INSERT INTO offers (name, affiliate_url, blurb, category, active) VALUES (?, ?, ?, ?, 0)')
        .bind(String(form.get('name') || '').trim(), String(form.get('affiliate_url') || '').trim(), String(form.get('blurb') || '').trim(), String(form.get('category') || 'ai-agents')).run();
      return redirect('/admin/offers');
    }
    const offers = (await db.prepare('SELECT * FROM offers ORDER BY active DESC, sort, id').all()).results || [];
    return html(A.offersPage(user, offers));
  }
  const offerAction = path.match(/^\/admin\/offers\/(\d+)\/(toggle|delete)$/);
  if (offerAction && request.method === 'POST') {
    const id = parseInt(offerAction[1], 10);
    if (offerAction[2] === 'toggle') await db.prepare('UPDATE offers SET active = 1 - active WHERE id = ?').bind(id).run();
    else await db.prepare('DELETE FROM offers WHERE id = ?').bind(id).run();
    return redirect('/admin/offers');
  }

  if (path === '/admin/runs') {
    const runs = (await db.prepare('SELECT * FROM runs ORDER BY id DESC LIMIT 50').all()).results || [];
    return html(A.runsPage(user, runs));
  }

  return html('Admin page not found', 404);
}

// ---------------------------------------------------------------------------
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Agents SDK routing (websocket/RPC surface for the AggregatorAgent).
    const agentResponse = await routeAgentRequest(request, env);
    if (agentResponse) return agentResponse;

    try {
      if (path === '/ads.txt') return new Response(R.adsTxt(env), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
      if (path === '/robots.txt') return new Response(R.robotsTxt(env), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
      if (path === '/sitemap.xml') return new Response(R.sitemapXml(env), { headers: { 'content-type': 'application/xml; charset=utf-8' } });
      if (path === '/') return home(env);
      if (path.startsWith('/topic/')) return topic(env, decodeURIComponent(path.slice(7)));
      if (path === '/search') return search(env, url.searchParams.get('q') || '');
      if (path === '/sources') {
        const feeds = (await env.DB.prepare('SELECT f.*, (SELECT COUNT(*) FROM items i WHERE i.feed_id = f.id) AS item_count FROM feeds f WHERE f.enabled = 1 ORDER BY f.name').all()).results || [];
        return html(R.sourcesPage(env, feeds));
      }
      if (path === '/tools') {
        const offers = (await env.DB.prepare('SELECT * FROM offers WHERE active = 1 ORDER BY sort, id').all()).results || [];
        return html(R.toolsPage(env, offers));
      }
      if (path === '/disclosure') return html(R.disclosurePage(env));
      if (path === '/about') return html(R.aboutPage(env));
      if (path === '/health') {
        const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM items').first().catch(() => ({ n: -1 }));
        return Response.json({ ok: true, items: n.n, time: nowISO() });
      }
      if (path.startsWith('/admin')) return adminRoute(env, request, url);
      return html('Not found', 404);
    } catch (e) {
      return new Response('Server error: ' + (e && e.message || e), { status: 500 });
    }
  },

  // Wrangler cron trigger -> poke the agent (its own Agents-SDK schedule is
  // the primary timer; runAggregation's overlap guard prevents double work).
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      const stub = await agentStub(env);
      await stub.fetch(new Request('https://agent/run', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ trigger: 'cron' }),
      }));
    })());
  },
};
