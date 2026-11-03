// ============================================================================
// admin.js — admin dashboard rendering (authenticated area)
// ============================================================================
import { esc } from './render.js';
import { TAXONOMY, categoryName } from './categorize.js';

function shell(title, body, user) {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(title) + ' — Admin</title>' +
    '<meta name="robots" content="noindex">' +
    '<style>body{margin:0;background:#0b0e14;color:#e8ecf3;font:15px/1.55 system-ui,sans-serif}.wrap{max-width:1000px;margin:0 auto;padding:0 16px 48px}' +
    'a{color:#6ee7ff}header{border-bottom:1px solid #1e2637;padding:12px 0;margin-bottom:8px}header .wrap{display:flex;gap:14px;align-items:center;flex-wrap:wrap}' +
    'h1{font-size:24px}h2{font-size:18px;margin-top:28px}.card{background:#121826;border:1px solid #1e2637;border-radius:12px;padding:14px 16px;margin:10px 0}' +
    'table{width:100%;border-collapse:collapse;font-size:14px}th,td{border-bottom:1px solid #1e2637;padding:7px 6px;text-align:left;vertical-align:top}' +
    'input,select,textarea{background:#121826;border:1px solid #1e2637;color:#e8ecf3;border-radius:8px;padding:8px 10px;width:100%}label{display:block;font-size:13px;color:#8b94a7;margin:10px 0 4px}' +
    '.btn{background:#6ee7ff;color:#04121a;border:0;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer}.btn.ghost{background:transparent;color:#6ee7ff;border:1px solid #1e2637}' +
    '.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.kpi{background:#121826;border:1px solid #1e2637;border-radius:12px;padding:12px}.kpi b{font-size:22px;display:block}.kpi span{color:#8b94a7;font-size:13px}' +
    '.err{color:#f87171}.ok{color:#34d399}.mut{color:#8b94a7}.row{display:flex;gap:8px;flex-wrap:wrap;align-items:end}.row>div{flex:1;min-width:160px}</style></head><body>' +
    '<header><div class="wrap"><strong>Aggregator Admin</strong><nav style="display:flex;gap:12px;flex-wrap:wrap">' +
    '<a href="/admin">Dashboard</a><a href="/admin/feeds">Feeds</a><a href="/admin/offers">Affiliate Offers</a><a href="/admin/runs">Run Logs</a><a href="/">View Site</a>' +
    (user ? '<span class="mut">' + esc(user.email) + '</span><form method="post" action="/admin/logout" style="display:inline"><button class="btn ghost" type="submit">Log out</button></form>' : '') +
    '</nav></div></header><main class="wrap">' + body + '</main></body></html>';
}

export function loginPage(error, allowRegister) {
  return shell('Log in',
    '<h1>Admin log in</h1>' + (error ? '<p class="err">' + esc(error) + '</p>' : '') +
    '<div class="card"><form method="post" action="/admin/login">' +
    '<label>Email</label><input type="email" name="email" required autocomplete="username">' +
    '<label>Password</label><input type="password" name="password" required autocomplete="current-password">' +
    '<p><button class="btn" type="submit">Log in</button></p></form>' +
    (allowRegister ? '<p class="mut">No admin account exists yet. <a href="/admin/register">Create the first admin account</a>.</p>' : '') +
    '</div>', null);
}

export function registerPage(error) {
  return shell('Create admin',
    '<h1>Create the first admin account</h1>' + (error ? '<p class="err">' + esc(error) + '</p>' : '') +
    '<p class="mut">Registration is open only until the first account exists. That account becomes the admin.</p>' +
    '<div class="card"><form method="post" action="/admin/register">' +
    '<label>Email</label><input type="email" name="email" required autocomplete="username">' +
    '<label>Password (min 10 chars)</label><input type="password" name="password" required autocomplete="new-password">' +
    '<p><button class="btn" type="submit">Create admin account</button></p></form></div>', null);
}

export function dashboardPage(user, status, lastRun, totals) {
  const st = (status && status.state) || {};
  const sched = (status && status.schedules) || [];
  const cron = sched.find(s => s.type === 'cron');
  const stats = st.lastStats || {};
  let perFeed = '';
  if (lastRun) {
    let errs = [];
    try { errs = JSON.parse(lastRun.errors || '[]'); } catch { /* ignore */ }
    perFeed = '<h2>Last run detail</h2><div class="card"><p class="mut">Run #' + lastRun.id + ' · trigger: ' + esc(lastRun.trigger) + ' · started ' + esc(lastRun.started_at || '') + ' · finished ' + esc(lastRun.finished_at || '—') + '</p>' +
      (errs.length ? '<table><thead><tr><th>Feed</th><th>Error</th></tr></thead><tbody>' + errs.map(e => '<tr><td>' + esc(e.feed) + '</td><td class="err">' + esc(e.error) + '</td></tr>').join('') + '</tbody></table>' : '<p class="ok">No feed errors.</p>') + '</div>';
  }
  const body = '<h1>Dashboard</h1>' +
    '<div class="kpis">' +
    '<div class="kpi"><b>' + (totals.items || 0) + '</b><span>stories stored</span></div>' +
    '<div class="kpi"><b>' + (totals.feeds || 0) + '</b><span>feeds enabled</span></div>' +
    '<div class="kpi"><b>' + esc(st.lastRunAt || 'never') + '</b><span>last run (' + esc(st.lastTrigger || '—') + ')</span></div>' +
    '<div class="kpi"><b>' + (stats.itemsNew != null ? stats.itemsNew : '—') + '</b><span>new in last run</span></div>' +
    '<div class="kpi"><b>' + (stats.feedsFailed != null ? stats.feedsFailed : '—') + '</b><span>feeds failed last run</span></div>' +
    '<div class="kpi"><b>' + esc(cron ? 'every 6h (:17 UTC)' : 'not scheduled') + '</b><span>next scheduled run (cron)</span></div>' +
    '</div>' +
    '<div class="card"><form method="post" action="/admin/run"><button class="btn" type="submit">Run aggregation now</button> ' +
    '<span class="mut">' + (st.running ? 'A run is in progress…' : 'Fetches all enabled feeds, dedupes, categorizes, stores new items.') + '</span></form></div>' +
    perFeed;
  return shell('Dashboard', body, user);
}

export function feedsPage(user, feeds) {
  const catOpts = (sel) => TAXONOMY.map(t => '<option value="' + t.slug + '"' + (t.slug === sel ? ' selected' : '') + '>' + esc(t.name) + '</option>').join('');
  const rows = feeds.map(f =>
    '<tr><td><strong>' + esc(f.name) + '</strong><br><span class="mut">' + esc(f.url) + '</span></td>' +
    '<td>' + esc(f.kind) + '</td><td>' + esc(categoryName(f.default_category)) + '</td>' +
    '<td>' + (f.last_status === 'ok' ? '<span class="ok">ok</span>' : f.last_status === 'error' ? '<span class="err">' + esc(f.last_error || 'error') + '</span>' : '—') + '<br><span class="mut">+' + (f.last_new_count || 0) + ' last run</span></td>' +
    '<td>' + (f.enabled ? 'on' : 'off') + '</td>' +
    '<td><form method="post" action="/admin/feeds/' + f.id + '/toggle" style="display:inline"><button class="btn ghost" type="submit">' + (f.enabled ? 'Disable' : 'Enable') + '</button></form> ' +
    '<form method="post" action="/admin/feeds/' + f.id + '/delete" style="display:inline" onsubmit="return confirm(\'Delete this feed? Stored items stay.\')"><button class="btn ghost" type="submit">Delete</button></form></td></tr>').join('');
  const body = '<h1>Feeds</h1>' +
    '<div class="card"><h2 style="margin-top:0">Add a feed</h2><form method="post" action="/admin/feeds">' +
    '<div class="row"><div><label>Name</label><input name="name" required></div>' +
    '<div><label>Feed URL (RSS/Atom)</label><input type="url" name="url" required placeholder="https://example.com/feed.xml"></div></div>' +
    '<div class="row"><div><label>Home URL</label><input type="url" name="home_url" placeholder="https://example.com"></div>' +
    '<div><label>Kind</label><select name="kind"><option>blog</option><option>lab</option><option>research</option><option>ecosystem</option><option>services</option><option>news</option></select></div>' +
    '<div><label>Default topic</label><select name="default_category">' + catOpts('ai-research') + '</select></div></div>' +
    '<p><button class="btn" type="submit">Add feed</button></p></form></div>' +
    '<table><thead><tr><th>Feed</th><th>Kind</th><th>Default topic</th><th>Last fetch</th><th>Enabled</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
  return shell('Feeds', body, user);
}

export function offersPage(user, offers) {
  const catOpts = (sel) => TAXONOMY.map(t => '<option value="' + t.slug + '"' + (t.slug === sel ? ' selected' : '') + '>' + esc(t.name) + '</option>').join('');
  const rows = offers.map(o =>
    '<tr><td><strong>' + esc(o.name) + '</strong><br><span class="mut">' + esc(o.blurb) + '</span></td>' +
    '<td style="word-break:break-all">' + esc(o.affiliate_url) + '</td><td>' + esc(categoryName(o.category)) + '</td>' +
    '<td>' + (o.active ? '<span class="ok">live</span>' : 'inactive') + '</td>' +
    '<td><form method="post" action="/admin/offers/' + o.id + '/toggle" style="display:inline"><button class="btn ghost" type="submit">' + (o.active ? 'Deactivate' : 'Activate') + '</button></form> ' +
    '<form method="post" action="/admin/offers/' + o.id + '/delete" style="display:inline"><button class="btn ghost" type="submit">Delete</button></form></td></tr>').join('');
  const body = '<h1>Affiliate Offers</h1>' +
    '<p class="mut">Only activate offers for programs you have actually joined, with your real affiliate links. Inactive offers never render on the public site. Rows named PLACEHOLDER are seed rows waiting for real links.</p>' +
    '<div class="card"><h2 style="margin-top:0">Add an offer</h2><form method="post" action="/admin/offers">' +
    '<div class="row"><div><label>Tool / product name</label><input name="name" required></div>' +
    '<div><label>Affiliate URL</label><input type="url" name="affiliate_url" required placeholder="https://…your-affiliate-link"></div>' +
    '<div><label>Topic</label><select name="category">' + catOpts('ai-agents') + '</select></div></div>' +
    '<label>Blurb (honest, no invented claims)</label><textarea name="blurb" rows="2"></textarea>' +
    '<p><button class="btn" type="submit">Add offer (starts inactive)</button></p></form></div>' +
    '<table><thead><tr><th>Offer</th><th>URL</th><th>Topic</th><th>Status</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
  return shell('Affiliate Offers', body, user);
}

export function runsPage(user, runs) {
  const rows = runs.map(r => {
    let errs = 0; try { errs = JSON.parse(r.errors || '[]').length; } catch { /* ignore */ }
    return '<tr><td>#' + r.id + '</td><td>' + esc(r.started_at || '') + '</td><td>' + esc(r.trigger) + '</td>' +
      '<td>' + r.feeds_ok + ' ok / ' + r.feeds_failed + ' failed</td><td>+' + r.items_new + ' new / ' + r.items_seen + ' seen</td>' +
      '<td>' + r.ai_calls + '</td><td>' + (errs ? '<span class="err">' + errs + ' errors</span>' : '<span class="ok">clean</span>') + '</td></tr>';
  }).join('');
  const body = '<h1>Run Logs</h1><table><thead><tr><th>Run</th><th>Started</th><th>Trigger</th><th>Feeds</th><th>Items</th><th>AI calls</th><th>Errors</th></tr></thead><tbody>' + rows + '</tbody></table>';
  return shell('Run Logs', body, user);
}
