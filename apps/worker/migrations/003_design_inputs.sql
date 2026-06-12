-- Migration: 003_design_inputs
CREATE TABLE IF NOT EXISTS design_inputs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  input_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);