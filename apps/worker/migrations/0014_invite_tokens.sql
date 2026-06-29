CREATE TABLE IF NOT EXISTS invite_tokens (
  id TEXT PRIMARY KEY,
  email TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  used_by TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
