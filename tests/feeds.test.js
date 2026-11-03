// Unit tests: feed parsing, dedupe canonicalization, excerpt truncation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFeed, canonicalUrl, titleHash, truncateExcerpt, SEED_FEEDS } from '../src/feeds.js';

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel><title>Example</title>
<item><title>Agents &amp; Tools: A &lt;Guide&gt;</title>
<link>https://example.com/post?utm_source=feed&amp;id=7</link>
<pubDate>Mon, 03 Nov 2026 12:00:00 GMT</pubDate>
<description><![CDATA[<p>Hello <b>world</b> of agents.</p>]]></description></item>
<item><title>Second Post</title><link>https://example.com/second/</link>
<dc:date>2026-11-02T10:00:00Z</dc:date><description>Short summary</description></item>
<item><title>No link item</title><description>skip me</description></item>
</channel></rss>`;

const ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>AtomEx</title>
<entry><title>Atom Entry One</title>
<link rel="self" href="https://example.com/feed.atom"/>
<link rel="alternate" href="https://example.com/entry-one"/>
<published>2026-11-01T08:30:00Z</published><summary>Atom summary text</summary></entry>
</feed>`;

test('parses RSS 2.0 items with title, link, date, summary', () => {
  const items = parseFeed(RSS);
  assert.equal(items.length, 2); // the no-link item is dropped
  assert.equal(items[0].title, 'Agents & Tools: A <Guide>');
  assert.equal(items[0].url, 'https://example.com/post?utm_source=feed&id=7');
  assert.equal(items[0].publishedAt, '2026-11-03T12:00:00.000Z');
  assert.match(items[0].summary, /Hello/);
  assert.equal(items[1].publishedAt, '2026-11-02T10:00:00.000Z');
});

test('parses Atom entries and prefers the alternate link', () => {
  const items = parseFeed(ATOM);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Atom Entry One');
  assert.equal(items[0].url, 'https://example.com/entry-one');
  assert.equal(items[0].summary, 'Atom summary text');
});

test('canonicalUrl strips tracking params, fragments, trailing slash', () => {
  assert.equal(canonicalUrl('https://Example.com/post/?utm_source=x&id=3#frag'), 'https://example.com/post?id=3');
  assert.equal(canonicalUrl('https://example.com/a?fbclid=zzz&keep=1'), 'https://example.com/a?keep=1');
  assert.equal(canonicalUrl('https://example.com/'), 'https://example.com/');
});

test('dedupe: same story via different tracking URLs canonicalizes identically', () => {
  const a = canonicalUrl('https://site.com/story?utm_medium=rss');
  const b = canonicalUrl('https://site.com/story/?gclid=abc');
  assert.equal(a, b);
  assert.equal(titleHash('Hello, World!'), titleHash('hello world'));
  assert.notEqual(titleHash('Hello World'), titleHash('Hello Worlds'));
});

test('truncateExcerpt enforces the 280-char copyright cap and strips HTML', () => {
  const long = '<p>' + 'word '.repeat(200) + '</p>';
  const out = truncateExcerpt(long);
  assert.ok(out.length <= 280, 'length ' + out.length);
  assert.ok(!out.includes('<'));
  assert.ok(out.endsWith('…'));
  assert.equal(truncateExcerpt('short text'), 'short text');
  assert.equal(truncateExcerpt(''), '');
});

test('seed registry is well-formed', () => {
  assert.ok(SEED_FEEDS.length >= 25);
  for (const f of SEED_FEEDS) {
    assert.match(f.url, /^https:\/\//);
    assert.ok(f.name && f.default_category);
  }
});
