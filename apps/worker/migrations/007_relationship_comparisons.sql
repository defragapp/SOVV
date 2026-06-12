-- Migration: 007_relationship_comparisons
CREATE TABLE IF NOT EXISTS relationship_comparisons (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  target_person_id TEXT NOT NULL,
  comparison_data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);