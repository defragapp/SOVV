CREATE TABLE IF NOT EXISTS invites (
    token TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    library_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, completed
    invitee_id TEXT,
    comparison_result JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (library_id) REFERENCES library(id)
);
