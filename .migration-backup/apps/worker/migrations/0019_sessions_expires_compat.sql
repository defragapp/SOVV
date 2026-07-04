-- Compatibility migration for legacy auth verification query.
--
-- The canonical sessions expiry column is expires_at. Some auth verification
-- code still reads s.expires, so this migration adds a mirrored compatibility
-- column to keep that route functional until the route query is simplified.

ALTER TABLE sessions ADD COLUMN expires INTEGER;

UPDATE sessions
SET expires = expires_at
WHERE expires IS NULL;

CREATE TRIGGER IF NOT EXISTS sessions_expires_insert
AFTER INSERT ON sessions
FOR EACH ROW
WHEN NEW.expires IS NULL
BEGIN
  UPDATE sessions
  SET expires = NEW.expires_at
  WHERE token = NEW.token;
END;

CREATE TRIGGER IF NOT EXISTS sessions_expires_at_update
AFTER UPDATE OF expires_at ON sessions
FOR EACH ROW
BEGIN
  UPDATE sessions
  SET expires = NEW.expires_at
  WHERE token = NEW.token;
END;
