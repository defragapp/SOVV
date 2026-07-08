# SOVV D1 Database Schema — vibesdk-db
*Knowledge file for Sovereign Build Agent GPT. Use this for d1Query calls and understanding data structure.*

## Connection
- Database: `vibesdk-db`
- ID: `c8c2fd8d-5297-46fc-8594-7629c8bad74d`
- Access: SELECT only via `/cf/d1/query` broker endpoint

---

## Tables (cumulative — all migrations applied)

### users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  tier TEXT DEFAULT 'free',           -- 'free' | 'pro' | 'admin'
  role TEXT DEFAULT 'user',           -- 'user' | 'admin'
  stripe_customer_id TEXT,
  email_verified INTEGER DEFAULT 0,   -- 0=false, 1=true (added migration 0020)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### sessions
```sql
CREATE TABLE sessions (
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,        -- unix timestamp
  last_active INTEGER,                -- unix timestamp (added migration 0019)
  FOREIGN KEY (user_id) REFERENCES users(id)
);
-- Indexes: token (unique), expires_at
```

### interactions (legacy)
```sql
CREATE TABLE interactions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT,
  content TEXT,
  mode TEXT,
  question TEXT,
  text TEXT,
  people TEXT,
  result TEXT,
  confidence TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### library (archive of saved results)
```sql
CREATE TABLE library (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  space TEXT NOT NULL,                -- 'defrag' | 'alignment' | 'covenant'
  title TEXT,
  content TEXT,                       -- JSON result
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### baselines (Baseline Design data)
```sql
-- design_inputs (migration 0005)
CREATE TABLE design_inputs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  birth_date TEXT,
  birth_time TEXT,
  birth_location TEXT,
  compiled_at DATETIME,
  status TEXT DEFAULT 'pending',      -- 'pending' | 'compiled' | 'error'
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- design_facts (migration 0008) — compiled baseline output
CREATE TABLE design_facts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT,
  key TEXT,
  value TEXT,
  source TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### defrag_results
```sql
-- From migration 0003
CREATE TABLE defrag_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE defrag_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,                 -- 'user' | 'assistant'
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES defrag_sessions(id)
);
```

### subscriptions
```sql
-- From migrations 0004, 0009
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'inactive',     -- 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
  tier TEXT DEFAULT 'free',           -- 'free' | 'pro'
  current_period_end INTEGER,         -- unix timestamp
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### stripe_events (idempotency log)
```sql
-- Migration 0010
CREATE TABLE stripe_events (
  id TEXT PRIMARY KEY,                -- Stripe event ID
  type TEXT,
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### relationship_comparisons
```sql
-- Migration 0011
CREATE TABLE relationship_comparisons (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  person_a_id TEXT,
  person_b_id TEXT,
  result TEXT,                        -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### invites
```sql
-- Migrations 0006, 0012, 0014, 0022
CREATE TABLE invites (
  id TEXT PRIMARY KEY,
  inviter_id TEXT NOT NULL,
  invitee_email TEXT,
  token TEXT UNIQUE,
  accepted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  space TEXT,                         -- which space the invite is for
  role TEXT DEFAULT 'user',
  FOREIGN KEY (inviter_id) REFERENCES users(id)
);
```

### password_reset_tokens
```sql
-- Migration 0013
CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### people (contacts for multi-person defrag)
```sql
-- Migration 0018
CREATE TABLE people (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relation TEXT,
  birth_date TEXT,
  birth_time TEXT,
  birth_location TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### email_notifications
```sql
-- Migration 0023
CREATE TABLE email_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,                 -- 'day3_nurture' | 'day7_nurture' | etc.
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### admin_audit_log
```sql
-- Migration 0024
CREATE TABLE admin_audit_log (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT,
  details TEXT,                       -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### referrals & affiliates
```sql
-- Migration 0025
CREATE TABLE referral_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE referral_conversions (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,
  converted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE affiliates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE NOT NULL,
  commission_rate REAL DEFAULT 0.2,   -- 20%
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Useful Query Examples

```sql
-- Active pro users
SELECT u.id, u.email, u.tier, s.status, s.current_period_end
FROM users u
LEFT JOIN subscriptions s ON s.user_id = u.id
WHERE u.tier = 'pro' AND s.status = 'active'
ORDER BY u.created_at DESC;

-- Recent signups (last 7 days)
SELECT id, email, tier, email_verified, created_at
FROM users
WHERE created_at >= datetime('now', '-7 days')
ORDER BY created_at DESC;

-- Users with baselines compiled
SELECT u.email, d.status, d.compiled_at
FROM users u
JOIN design_inputs d ON d.user_id = u.id
WHERE d.status = 'compiled';

-- Invite funnel
SELECT 
  COUNT(*) as total_invites,
  COUNT(accepted_at) as accepted,
  ROUND(COUNT(accepted_at) * 100.0 / COUNT(*), 1) as accept_rate
FROM invites;

-- Referral leaderboard
SELECT rc.code, COUNT(rv.id) as conversions
FROM referral_codes rc
LEFT JOIN referral_conversions rv ON rv.referrer_id = rc.user_id
GROUP BY rc.code
ORDER BY conversions DESC
LIMIT 10;
```