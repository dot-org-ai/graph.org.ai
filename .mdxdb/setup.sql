-- Setup script for mdxdb SQLite database

CREATE TABLE IF NOT EXISTS things (
  ns TEXT NOT NULL,
  type TEXT NOT NULL,
  id TEXT NOT NULL,
  url TEXT PRIMARY KEY NOT NULL,
  data TEXT,
  code TEXT,
  content TEXT,
  meta TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS things_ns_idx ON things(ns);
CREATE INDEX IF NOT EXISTS things_type_idx ON things(type);
CREATE INDEX IF NOT EXISTS things_ns_type_idx ON things(ns, type);
CREATE INDEX IF NOT EXISTS things_id_idx ON things(id);

CREATE TABLE IF NOT EXISTS relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  "from" TEXT NOT NULL,
  predicate TEXT NOT NULL,
  reverse TEXT,
  "to" TEXT NOT NULL,
  data TEXT,
  content TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  text TEXT NOT NULL,
  embedding BLOB,
  meta TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS searches_url_idx ON searches(url);
