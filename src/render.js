// ============================================================================
// render.js — server-rendered public pages (mobile-first, SEO-serious)
// ============================================================================
// Copyright posture: cards show title, source, date and a <=280-char excerpt
// from the feed's own summary, and link OUT to the original article.
// ============================================================================
import { TAXONOMY, categoryName } from './categorize.js';

export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function siteUrl(env) { return (env.SITE_URL || 'https://vibecodeforstartup.com').replace(/\/$/, ''); }
export function siteName(env) { return env.SITE_NAME || 'VibeCode Intel'; }

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

// ---------------------------------------------------------------------------
// AdSense slot. Real <ins> markup is emitted ONLY when a slot ID is
// configured via ADSENSE_SLOTS ("name:slotid,..."). Otherwise a clearly
// labeled placeholder renders — no ad code, no fake impressions.
// ---------------------------------------------------------------------------
export function adSlot(env, name) {
  const pub = env.ADSENSE_PUB_ID || '';
  const slots = {};
  for (const part of String(env.ADSENSE_SLOTS || '').split(',')) {
    const [k, v] = part.split(':').map(s => (s || '').trim());
    if (k && v) slots[k] = v;
  }
  if (pub && slots[name]) {
    return '<div class="ad" aria-label="Advertisement"><span class="ad-label">Advertisement</span>' +
      '<ins class="adsbygoogle" style="display:block" data-ad-client="' + esc(pub) + '" data-ad-slot="' + esc(slots[name]) + '" data-ad-format="auto" data-full-width-responsive="true"></ins></div>';
  }
  return '<div class="ad ad-placeholder" aria-label="Advertisement placeholder"><span class="ad-label">Advertisement</span><p>Ad slot: ' + esc(name) + ' — activates when an AdSense unit ID is configured.</p></div>';
}

export const adsenseScript = (env) => {
  const pub = env.ADSENSE_PUB_ID || '';
  const hasSlots = String(env.ADSENSE_SLOTS || '').trim().length > 0;
  if (!pub || !hasSlots) return '';
  return '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + esc(pub) + '" crossorigin="anonymous"></script><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>';
};

export function adsTxt(env) {
  const pub = (env.ADSENSE_PUB_ID || '').replace(/^pub-/, '');
  return 'google.com, pub-' + pub + ', DIRECT, f08c47fec0942fa0\n';
}

// ---------------------------------------------------------------------------
const CSS = `
:root{--bg:#0b0e14;--panel:#121826;--panel2:#0f141f;--ink:#e8ecf3;--mut:#8b94a7;--acc:#6ee7ff;--acc2:#a78bfa;--line:#1e2637;--ok:#34d399;--warn:#fbbf24}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--acc);text-decoration:none}a:hover{text-decoration:underline}
header.top{position:sticky;top:0;background:rgba(11,14,20,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);z-index:10}
.wrap{max-width:1080px;margin:0 auto;padding:0 16px}
.top-in{display:flex;align-items:center;gap:14px;padding:12px 0;flex-wrap:wrap}
.logo{font-weight:800;font-size:20px;color:var(--ink)}.logo span{color:var(--acc)}
nav.topics{display:flex;gap:6px;flex-wrap:wrap}
nav.topics a{color:var(--mut);font-size:14px;padding:5px 10px;border:1px solid var(--line);border-radius:999px}
nav.topics a.on,nav.topics a:hover{color:var(--ink);border-color:var(--acc);text-decoration:none}
form.search{margin-left:auto;display:flex;gap:6px}
form.search input{background:var(--panel);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:7px 10px;min-width:150px}
form.search button,.btn{background:var(--acc);color:#04121a;border:0;border-radius:8px;padding:7px 14px;font-weight:700;cursor:pointer}
h1{font-size:28px;line-height:1.2;margin:22px 0 6px}h2{font-size:20px;margin:26px 0 10px}
.sub{color:var(--mut);margin:0 0 14px}
.grid{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:760px){.grid{grid-template-columns:1fr 1fr}.cols{display:grid;grid-template-columns:2fr 1fr;gap:22px}}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.card h3{margin:4px 0 6px;font-size:17px;line-height:1.35}.card h3 a{color:var(--ink)}
.card p{color:var(--mut);margin:0;font-size:14.5px}
.meta{display:flex;gap:8px;flex-wrap:wrap;font-size:12.5px;color:var(--mut);align-items:center}
.tag{background:var(--panel2);border:1px solid var(--line);border-radius:999px;padding:1px 8px;color:var(--acc2);font-size:12px}
.src{font-weight:600;color:var(--ink)}
.ad{border:1px dashed var(--line);border-radius:12px;padding:12px 16px;margin:16px 0;background:var(--panel2)}
.ad-label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.ad-placeholder p{color:var(--mut);margin:4px 0 0;font-size:13px}
footer{border-top:1px solid var(--line);margin-top:36px;padding:20px 0 40px;color:var(--mut);font-size:14px}
footer a{color:var(--mut);text-decoration:underline}
table{width:100%;border-collapse:collapse;font-size:14.5px}th,td{border-bottom:1px solid var(--line);padding:8px 6px;text-align:left;vertical-align:top}
input[type=text],input[type=url],input[type=email],input[type=password],select,textarea{background:var(--panel);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:8px 10px;width:100%}
label{display:block;font-size:13px;color:var(--mut);margin:10px 0 4px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:14px 0}
.kpi{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px}.kpi b{font-size:22px;display:block}.kpi span{color:var(--mut);font-size:13px}
.err{color:#f87171}.ok{color:var(--ok)}
.disc{font-size:12.5px;color:var(--mut);border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:var(--panel2)}
`;

export function layout(env, { title, description, path = '/', jsonLd = '', body, headExtra = '' }) {
  const base = siteUrl(env);
  const fullTitle = title ? title + ' — ' + siteName(env) : siteName(env) + ' — Vibe Coding, AI Agents & Frontier AI, Aggregated';
  const desc = description || 'The latest on vibe coding, AI agents, machine learning, AGI and superintelligence — aggregated from AI labs, arXiv, and the agent ecosystem, with every story linked to its original source.';
  const topics = TAXONOMY.map(t => '<a href="/topic/' + t.slug + '">' + esc(t.name) + '</a>').join('');
  return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(fullTitle) + '</title>' +
    '<meta name="description" content="' + esc(desc) + '">' +
    '<link rel="canonical" href="' + esc(base + path) + '">' +
    '<meta property="og:type" content="website"><meta property="og:site_name" content="' + esc(siteName(env)) + '">' +
    '<meta property="og:title" content="' + esc(fullTitle) + '"><meta property="og:description" content="' + esc(desc) + '">' +
    '<meta property="og:url" content="' + esc(base + path) + '">' +
    '<meta name="twitter:card" content="summary"><meta name="theme-color" content="#0b0e14">' +
    (jsonLd ? '<script type="application/ld+json">' + jsonLd + '</script>' : '') +
    headExtra + '<style>' + CSS + '</style></head><body>' +
    '<header class="top"><div class="wrap top-in"><a class="logo" href="/">' + esc(siteName(env).split(' ')[0]) + ' <span>' + esc(siteName(env).split(' ').slice(1).join(' ') || 'Intel') + '</span></a>' +
    '<nav class="topics">' + topics + '</nav>' +
    '<form class="search" action="/search" method="get"><input name="q" type="search" placeholder="Search stories…" aria-label="Search stories"><button type="submit">Search</button></form>' +
    '</div></header><main class="wrap">' + body + '</main>' +
    '<footer><div class="wrap"><p>' + esc(siteName(env)) + ' aggregates headlines and short excerpts from public RSS feeds and links to the original publishers. All stories belong to their respective sources.</p>' +
    '<p><a href="/sources">Sources</a> · <a href="/tools">Tools &amp; Resources</a> · <a href="/disclosure">Affiliate Disclosure</a> · <a href="/about">About</a> · <a href="/admin">Admin</a></p></div></footer>' +
    adsenseScript(env) + '</body></html>';
}

export function itemCard(item) {
  return '<article class="card"><div class="meta"><span class="src">' + esc(item.source_name) + '</span>' +
    (item.published_at ? '<time datetime="' + esc(item.published_at) + '">' + fmtDate(item.published_at) + '</time>' : '') +
    '<a class="tag" href="/topic/' + esc(item.category) + '">' + esc(categoryName(item.category)) + '</a></div>' +
    '<h3><a href="' + esc(item.url) + '" target="_blank" rel="noopener">' + esc(item.title) + '</a></h3>' +
    (item.excerpt ? '<p>' + esc(item.excerpt) + '</p>' : '') +
    '<div class="meta" style="margin-top:8px"><a href="' + esc(item.url) + '" target="_blank" rel="noopener">Read at ' + esc(item.source_name) + ' →</a></div></article>';
}

// ---------------------------------------------------------------------------
export function homePage(env, { latest, trending, counts }) {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'WebSite', name: siteName(env), url: siteUrl(env) + '/',
    potentialAction: { '@type': 'SearchAction', target: siteUrl(env) + '/search?q={query}', 'query-input': 'required name=query' },
  });
  const chips = TAXONOMY.map(t => '<a class="tag" href="/topic/' + t.slug + '">' + esc(t.name) + ' (' + (counts[t.slug] || 0) + ')</a>').join(' ');
  const body =
    '<h1>Vibe coding, AI agents &amp; frontier AI — the day\'s essential reading</h1>' +
    '<p class="sub">Aggregated automatically from AI labs, arXiv, and the agent ecosystem. Summaries are short excerpts; every story links to its original source.</p>' +
    '<div class="meta" style="margin-bottom:14px">' + chips + '</div>' +
    adSlot(env, 'header') +
    '<div class="cols"><section><h2>Latest</h2><div class="grid">' +
    (latest.length ? latest.map(itemCard).join('') : '<p class="sub">No stories yet — the aggregator runs every 6 hours.</p>') +
    '</div></section>' +
    '<aside><h2>Trending (last 72h)</h2><div class="grid">' +
    (trending.length ? trending.map(itemCard).join('') : '<p class="sub">Nothing in the last 72 hours yet.</p>') +
    '</div>' + adSlot(env, 'sidebar') + '</aside></div>';
  return layout(env, { title: '', path: '/', jsonLd, body });
}

export function topicPage(env, slug, items) {
  const t = TAXONOMY.find(x => x.slug === slug);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: t.name, url: siteUrl(env) + '/topic/' + slug,
    mainEntity: { '@type': 'ItemList', itemListElement: items.slice(0, 20).map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: it.url, name: it.title })) },
  });
  const body = '<h1>' + esc(t.name) + '</h1><p class="sub">' + esc(t.blurb) + '</p>' + adSlot(env, 'header') +
    '<div class="grid">' + (items.length ? items.map(itemCard).join('') : '<p class="sub">No stories in this topic yet.</p>') + '</div>';
  return layout(env, { title: t.name, description: t.blurb, path: '/topic/' + slug, jsonLd, body });
}

export function searchPage(env, q, items) {
  const body = '<h1>Search</h1><p class="sub">' + items.length + ' result(s) for “' + esc(q) + '”</p>' +
    '<div class="grid">' + (items.length ? items.map(itemCard).join('') : '<p class="sub">No matches. Try “agents”, “transformer”, “cursor”, or “alignment”.</p>') + '</div>';
  return layout(env, { title: 'Search: ' + q, path: '/search?q=' + encodeURIComponent(q), body });
}

export function sourcesPage(env, feeds) {
  const rows = feeds.map(f =>
    '<tr><td><a href="' + esc(f.home_url || f.url) + '" target="_blank" rel="noopener">' + esc(f.name) + '</a></td>' +
    '<td>' + esc(f.kind) + '</td><td>' + esc(categoryName(f.default_category)) + '</td>' +
    '<td>' + (f.last_status === 'ok' ? '<span class="ok">live</span>' : f.last_status === 'error' ? '<span class="err">error</span>' : 'pending') + '</td>' +
    '<td>' + (f.item_count || 0) + '</td></tr>').join('');
  const body = '<h1>Sources</h1><p class="sub">Every feed the aggregator reads. Stories are stored as a headline plus a short excerpt and always link back to the publisher.</p>' +
    '<table><thead><tr><th>Source</th><th>Type</th><th>Default topic</th><th>Status</th><th>Stories</th></tr></thead><tbody>' + rows + '</tbody></table>';
  return layout(env, { title: 'Sources', path: '/sources', body });
}

export function toolsPage(env, offers) {
  const cards = offers.length ? offers.map(o =>
    '<article class="card"><div class="meta"><a class="tag" href="/topic/' + esc(o.category) + '">' + esc(categoryName(o.category)) + '</a></div>' +
    '<h3><a href="' + esc(o.affiliate_url) + '" target="_blank" rel="sponsored noopener">' + esc(o.name) + '</a></h3><p>' + esc(o.blurb) + '</p>' +
    '<div class="meta" style="margin-top:8px"><a href="' + esc(o.affiliate_url) + '" target="_blank" rel="sponsored noopener">Visit →</a></div></article>').join('')
    : '<p class="sub">No tools listed yet. Offers appear here once they are added and activated in the admin.</p>';
  const body = '<h1>Tools &amp; Resources</h1>' +
    '<p class="disc"><strong>Disclosure:</strong> Links on this page may be affiliate links. If you buy through them, this site may earn a commission at no extra cost to you. See the <a href="/disclosure">full disclosure</a>.</p>' +
    adSlot(env, 'header') + '<div class="grid" style="margin-top:14px">' + cards + '</div>';
  return layout(env, { title: 'Tools & Resources', description: 'AI coding tools, agent platforms, and learning resources for the vibe-coding era.', path: '/tools', body });
}

export function disclosurePage(env) {
  const body = '<h1>Affiliate Disclosure</h1>' +
    '<p>' + esc(siteName(env)) + ' (vibecodeforstartup.com) is reader-supported. Some outbound links on this site — clearly presented on the <a href="/tools">Tools &amp; Resources</a> page and in contextual placements — are affiliate links. If you click one and make a purchase, we may earn a commission from the merchant at no additional cost to you.</p>' +
    '<p>We only list products through affiliate programs we have actually joined, and listings are labeled. Aggregation content (headlines and excerpts) is never paid placement: stories are collected automatically from public RSS feeds and ranked by recency, not by any commercial relationship.</p>' +
    '<p>This disclosure is provided in accordance with the U.S. Federal Trade Commission\'s guidelines on endorsements and testimonials (16 CFR Part 255). Questions: contact the site operator via the About page.</p>' +
    '<h2>Advertising</h2><p>This site may display advertisements served by Google AdSense. Google may use cookies to serve ads based on your prior visits to this and other websites. You can opt out of personalized advertising in your Google account settings.</p>';
  return layout(env, { title: 'Affiliate Disclosure', path: '/disclosure', body });
}

export function aboutPage(env) {
  const body = '<h1>About</h1>' +
    '<p>' + esc(siteName(env)) + ' is an automated research digest for the vibe-coding and AI-agent era. A Cloudflare Agents SDK agent reads public RSS feeds from AI labs (OpenAI, DeepMind, Meta AI, Microsoft Research, Hugging Face), arXiv, the agent ecosystem (LangChain, LlamaIndex, Cloudflare, GitHub), and professional-services publications several times a day.</p>' +
    '<p>For each story we store only the headline, the source, the publication date, and a short excerpt (max 280 characters) taken from the feed\'s own summary — then link you to the original publisher for the full piece. If you are a publisher and want your feed removed, contact the operator and it will be disabled.</p>' +
    '<p>Operated by Murry Consultancy LLC.</p>';
  return layout(env, { title: 'About', path: '/about', body });
}

export function sitemapXml(env, items) {
  const base = siteUrl(env);
  const urls = ['/', '/sources', '/tools', '/disclosure', '/about', ...TAXONOMY.map(t => '/topic/' + t.slug)];
  const entries = urls.map(u => '<url><loc>' + base + u + '</loc></url>').join('');
  return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + entries + '</urlset>';
}

export function robotsTxt(env) {
  return 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ' + siteUrl(env) + '/sitemap.xml\n';
}
