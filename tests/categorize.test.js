// Unit tests: categorization rules + fallback, taxonomy integrity,
// ads.txt / sitemap / robots generation, admin auth primitives.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categorizeByRules, sanitizeCategory, TAXONOMY, CATEGORY_SLUGS } from '../src/categorize.js';
import { adsTxt, sitemapXml, robotsTxt } from '../src/render.js';
import { hashPassword, verifyPassword } from '../src/auth.js';

const ENV = { ADSENSE_PUB_ID: 'pub-8786200479780334', SITE_URL: 'https://vibecodeforstartup.com', SITE_NAME: 'VibeCode Intel', ADSENSE_SLOTS: '' };

test('rules categorize a vibe-coding story', () => {
  const r = categorizeByRules('Cursor ships a new AI coding agent', 'The IDE update improves code generation for developers.', 'ai-research');
  assert.equal(r.category, 'vibecoding');
  assert.ok(r.score > 0);
});

test('rules categorize an agents story', () => {
  const r = categorizeByRules('LangGraph adds multi-agent orchestration', 'The agent framework now supports tool use across autonomous agents.', 'ai-research');
  assert.equal(r.category, 'ai-agents');
});

test('rules categorize superintelligence/alignment above generic research', () => {
  const r = categorizeByRules('New mechanistic interpretability results for frontier safety', 'Alignment research on superintelligence and ai governance.', 'ai-research');
  assert.equal(r.category, 'superintelligence');
});

test('fallback: no keyword signal returns the feed default with score 0', () => {
  const r = categorizeByRules('Company posts quarterly update', 'A short note about office logistics.', 'ai-services');
  assert.equal(r.score, 0);
  assert.equal(r.category, 'ai-services');
  const r2 = categorizeByRules('Company posts quarterly update', 'A short note.', 'bogus-slug');
  assert.equal(r2.category, 'ai-research');
});

test('sanitizeCategory validates AI output against the taxonomy', () => {
  assert.equal(sanitizeCategory('ai-agents', 'ai-research'), 'ai-agents');
  assert.equal(sanitizeCategory('The category is machine-learning.', 'ai-research'), 'machine-learning');
  assert.equal(sanitizeCategory('banana', 'ai-research'), 'ai-research');
  assert.equal(sanitizeCategory('', null), null);
});

test('taxonomy covers the required topics', () => {
  for (const slug of ['vibecoding', 'ai-agents', 'machine-learning', 'agi', 'superintelligence', 'ai-research', 'ai-services']) {
    assert.ok(CATEGORY_SLUGS.includes(slug), slug);
    assert.ok(TAXONOMY.find(t => t.slug === slug).blurb.length > 10);
  }
});

test('ads.txt is generated from the configured publisher ID', () => {
  assert.equal(adsTxt(ENV), 'google.com, pub-8786200479780334, DIRECT, f08c47fec0942fa0\n');
});

test('sitemap includes home, topics, tools, disclosure; robots references it', () => {
  const sm = sitemapXml(ENV);
  for (const path of ['/', '/tools', '/disclosure', '/topic/vibecoding', '/topic/superintelligence', '/sources']) {
    assert.ok(sm.includes('https://vibecodeforstartup.com' + path), path);
  }
  const rb = robotsTxt(ENV);
  assert.ok(rb.includes('Sitemap: https://vibecodeforstartup.com/sitemap.xml'));
  assert.ok(rb.includes('Disallow: /admin'));
});

test('password hashing round-trips and rejects wrong passwords (admin auth boundary primitive)', async () => {
  const hash = await hashPassword('correct horse battery');
  assert.match(hash, /^pbkdf2\$100000\$/);
  assert.equal(await verifyPassword('correct horse battery', hash), true);
  assert.equal(await verifyPassword('wrong password', hash), false);
  assert.equal(await verifyPassword('correct horse battery', 'garbage'), false);
});
