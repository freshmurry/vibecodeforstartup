// ============================================================================
// feeds.js — seed feed registry + RSS/Atom parsing + URL/text utilities
// ============================================================================
// Pure functions (no Workers APIs) so they are unit-testable under node --test.
// Every seed feed below was verified live on 2026-11-03 (HTTP 200 + parseable
// XML). Feeds that failed verification are listed in BUILD-LOG.md, not here.
// ============================================================================

export const SEED_FEEDS = [
  // --- AI lab blogs ---------------------------------------------------------
  { name: 'OpenAI News', url: 'https://openai.com/news/rss.xml', home_url: 'https://openai.com/news', kind: 'lab', default_category: 'ai-research' },
  { name: 'Google DeepMind Blog', url: 'https://deepmind.google/blog/rss.xml', home_url: 'https://deepmind.google/blog', kind: 'lab', default_category: 'ai-research' },
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', home_url: 'https://blog.google/technology/ai/', kind: 'lab', default_category: 'ai-research' },
  { name: 'Microsoft Research', url: 'https://www.microsoft.com/en-us/research/feed/', home_url: 'https://www.microsoft.com/en-us/research/', kind: 'lab', default_category: 'ai-research' },
  // Meta AI Blog removed 2026-11-03: ai.meta.com/blog/rss/ verified live at first check, then went 404 (all variants) the same day. Meta Engineering below still carries Meta's feed presence.
  { name: 'Meta Engineering', url: 'https://engineering.fb.com/feed/', home_url: 'https://engineering.fb.com', kind: 'lab', default_category: 'machine-learning' },
  { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml', home_url: 'https://huggingface.co/blog', kind: 'lab', default_category: 'machine-learning' },

  // --- Research (arXiv Atom/RSS by subject) ---------------------------------
  { name: 'arXiv cs.AI — Artificial Intelligence', url: 'https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=30', home_url: 'https://arxiv.org/list/cs.AI/recent', kind: 'research', default_category: 'ai-research' },
  { name: 'arXiv cs.CL — Computation & Language', url: 'https://export.arxiv.org/api/query?search_query=cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=30', home_url: 'https://arxiv.org/list/cs.CL/recent', kind: 'research', default_category: 'machine-learning' },
  { name: 'arXiv cs.LG — Machine Learning', url: 'https://export.arxiv.org/api/query?search_query=cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=30', home_url: 'https://arxiv.org/list/cs.LG/recent', kind: 'research', default_category: 'machine-learning' },
  { name: 'arXiv cs.NE — Neural & Evolutionary Computing', url: 'https://export.arxiv.org/api/query?search_query=cat:cs.NE&sortBy=submittedDate&sortOrder=descending&max_results=30', home_url: 'https://arxiv.org/list/cs.NE/recent', kind: 'research', default_category: 'machine-learning' },

  // --- Agent / dev ecosystem -------------------------------------------------
  { name: 'Cloudflare Blog', url: 'https://blog.cloudflare.com/rss/', home_url: 'https://blog.cloudflare.com', kind: 'ecosystem', default_category: 'ai-agents' },
  { name: 'GitHub Blog', url: 'https://github.blog/feed/', home_url: 'https://github.blog', kind: 'ecosystem', default_category: 'vibecoding' },
  { name: 'LangChain Blog', url: 'https://www.langchain.com/blog/rss.xml', home_url: 'https://www.langchain.com/blog', kind: 'ecosystem', default_category: 'ai-agents' },
  // LlamaIndex removed 2026-11-03: feed verified live at first check, then the
  // publisher's RSS endpoints (blog/rss.xml, rss.xml, feed, feed.xml) all went
  // 404 the same day. Re-add from the admin if they restore a feed.
  { name: 'Vercel Blog', url: 'https://vercel.com/blog/rss.xml', home_url: 'https://vercel.com/blog', kind: 'ecosystem', default_category: 'vibecoding' },
  { name: 'Simon Willison’s Weblog', url: 'https://simonwillison.net/atom/everything/', home_url: 'https://simonwillison.net', kind: 'ecosystem', default_category: 'ai-agents' },
  { name: 'Latent Space', url: 'https://latent.space/feed', home_url: 'https://www.latent.space', kind: 'ecosystem', default_category: 'ai-agents' },
  { name: 'Import AI', url: 'https://importai.substack.com/feed', home_url: 'https://importai.substack.com', kind: 'ecosystem', default_category: 'superintelligence' },
  { name: 'The Sequence', url: 'https://thesequence.substack.com/feed', home_url: 'https://thesequence.substack.com', kind: 'ecosystem', default_category: 'machine-learning' },

  // --- Professional services / consulting ------------------------------------
  { name: 'Thoughtworks Insights', url: 'https://www.thoughtworks.com/rss/insights.xml', home_url: 'https://www.thoughtworks.com/insights', kind: 'services', default_category: 'ai-services' },
  { name: 'AWS Machine Learning Blog', url: 'https://aws.amazon.com/blogs/machine-learning/feed/', home_url: 'https://aws.amazon.com/blogs/machine-learning/', kind: 'services', default_category: 'ai-services' },
  { name: 'AI Trends', url: 'https://www.aitrends.com/feed/', home_url: 'https://www.aitrends.com', kind: 'services', default_category: 'ai-services' },

  // --- News & analysis ---------------------------------------------------------
  { name: 'NVIDIA Blog', url: 'https://blogs.nvidia.com/feed/', home_url: 'https://blogs.nvidia.com', kind: 'news', default_category: 'machine-learning' },
  { name: 'InfoQ', url: 'https://www.infoq.com/feed/', home_url: 'https://www.infoq.com', kind: 'news', default_category: 'vibecoding' },
  { name: 'The New Stack', url: 'https://thenewstack.io/feed/', home_url: 'https://thenewstack.io', kind: 'news', default_category: 'vibecoding' },
  { name: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/rss/fulltext', home_url: 'https://spectrum.ieee.org', kind: 'news', default_category: 'ai-research' },
  { name: 'MarkTechPost', url: 'https://www.marktechpost.com/feed/', home_url: 'https://www.marktechpost.com', kind: 'news', default_category: 'machine-learning' },
  { name: 'Unite.AI', url: 'https://www.unite.ai/feed/', home_url: 'https://www.unite.ai', kind: 'news', default_category: 'machine-learning' },
  { name: 'BDTechTalks', url: 'https://bdtechtalks.com/feed/', home_url: 'https://bdtechtalks.com', kind: 'news', default_category: 'ai-research' },
];

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------
export function decodeEntities(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
}

export function stripTags(s) {
  // Order matters: unwrap CDATA and strip real tags BEFORE decoding
  // entities, so an entity-encoded "<Guide>" in a title survives as text.
  const noCdata = String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  return decodeEntities(noCdata.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/** Copyright-safe excerpt: feed summary only, hard-capped at 280 chars. */
export function truncateExcerpt(text, max = 280) {
  const clean = stripTags(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

// ---------------------------------------------------------------------------
// URL canonicalization + title hash (dedupe)
// ---------------------------------------------------------------------------
const TRACKING_PARAMS = /^(utm_|fbclid$|gclid$|dclid$|ref$|ref_src$|spm$|igshid$|mc_cid$|mc_eid$)/i;

export function canonicalUrl(raw) {
  try {
    const u = new URL(String(raw).trim());
    u.hash = '';
    u.hostname = u.hostname.toLowerCase();
    for (const key of [...u.searchParams.keys()]) {
      if (TRACKING_PARAMS.test(key)) u.searchParams.delete(key);
    }
    let path = u.pathname;
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    u.pathname = path;
    return u.toString();
  } catch {
    return String(raw || '').trim();
  }
}

export function titleHash(title) {
  const norm = String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  let h = 0x811c9dc5; // FNV-1a 32-bit
  for (let i = 0; i < norm.length; i++) {
    h ^= norm.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return 't' + h.toString(16).padStart(8, '0');
}

// ---------------------------------------------------------------------------
// RSS 2.0 / Atom parsing (regex-based; Workers has no DOMParser)
// ---------------------------------------------------------------------------
function tagText(block, names) {
  for (const name of names) {
    const m = block.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + name + '>', 'i'));
    if (m) return m[1].trim(); // raw inner text; callers clean/decode
  }
  return '';
}

function atomLink(block) {
  const links = [...block.matchAll(/<link\s+([^>]*?)\/?>/gi)];
  for (const [, attrs] of links) {
    const rel = (attrs.match(/rel="([^"]*)"/i) || [])[1] || 'alternate';
    const href = (attrs.match(/href="([^"]*)"/i) || [])[1];
    if (href && (rel === 'alternate' || rel === 'self' && false)) return decodeEntities(href);
  }
  const first = links.length ? (links[0][1].match(/href="([^"]*)"/i) || [])[1] : '';
  return first ? decodeEntities(first) : '';
}

function toISO(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Parse an RSS 2.0 or Atom document into normalized items:
 * [{ title, url, publishedAt, summary }] — summary is RAW feed text;
 * callers must pass it through truncateExcerpt() before storing.
 */
export function parseFeed(xml) {
  const text = String(xml || '');
  const isAtom = /<feed[\s>]/i.test(text) && /<entry[\s>]/i.test(text);
  const blocks = isAtom
    ? [...text.matchAll(/<entry[\s>][\s\S]*?<\/entry>/gi)].map(m => m[0])
    : [...text.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)].map(m => m[0]);
  const items = [];
  for (const block of blocks) {
    const title = stripTags(tagText(block, ['title']));
    const url = isAtom ? atomLink(block) : decodeEntities(tagText(block, ['link'])).trim();
    if (!title || !url) continue;
    const publishedAt = toISO(tagText(block, isAtom
      ? ['published', 'updated']
      : ['pubDate', 'dc:date', 'date', 'published']));
    const summary = tagText(block, isAtom
      ? ['summary', 'content']
      : ['description', 'summary', 'content:encoded']);
    items.push({ title, url, publishedAt, summary });
  }
  return items;
}
