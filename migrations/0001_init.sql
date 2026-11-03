-- vibecodeforstartup aggregator — initial schema
-- Copyright-safe by design: items store title, source, URL, date and a
-- <=280-char excerpt from the feed's own summary field. Never full text.

CREATE TABLE IF NOT EXISTS feeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  home_url TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'blog',            -- lab | research | ecosystem | services | news
  default_category TEXT NOT NULL DEFAULT 'ai-research',
  enabled INTEGER NOT NULL DEFAULT 1,
  last_fetched_at TEXT,
  last_status TEXT,                              -- ok | error
  last_error TEXT,
  last_new_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feed_id INTEGER NOT NULL REFERENCES feeds(id),
  source_name TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,                             -- original article URL (link-out)
  canonical_url TEXT NOT NULL UNIQUE,            -- dedupe key (normalized)
  title_hash TEXT NOT NULL,                      -- dedupe support (normalized title)
  excerpt TEXT NOT NULL DEFAULT '',              -- <=280 chars, feed summary only
  published_at TEXT,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
  category TEXT NOT NULL DEFAULT 'ai-research',
  ai_categorized INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_items_published ON items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_title_hash ON items(title_hash);
CREATE INDEX IF NOT EXISTS idx_items_feed ON items(feed_id);

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  trigger TEXT NOT NULL DEFAULT 'manual',        -- cron | schedule | manual
  feeds_ok INTEGER NOT NULL DEFAULT 0,
  feeds_failed INTEGER NOT NULL DEFAULT 0,
  items_new INTEGER NOT NULL DEFAULT 0,
  items_seen INTEGER NOT NULL DEFAULT 0,
  ai_calls INTEGER NOT NULL DEFAULT 0,
  errors TEXT NOT NULL DEFAULT '[]'              -- JSON [{feed,error}]
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  blurb TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'ai-agents',
  active INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
