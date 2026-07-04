CREATE TABLE IF NOT EXISTS design_inputs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  input_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS design_facts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  fact TEXT NOT NULL,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscription_states (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  plan_id TEXT,
  current_period_end INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS relationship_comparisons (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  target_person_id TEXT NOT NULL,
  comparison_data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
