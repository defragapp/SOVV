CREATE TABLE IF NOT EXISTS library (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    workspace_source TEXT NOT NULL CHECK(workspace_source IN ('DEFRAG', 'COVENANT', 'ALIGNMENT')),
    title TEXT,
    payload JSON,
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_library_user_id_source ON library (user_id, workspace_source);