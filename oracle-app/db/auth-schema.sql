-- Authentication and subscription schema
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'premium', or 'pro'
  subscription_status TEXT, -- 'active', 'canceled', 'expired'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT, -- Current active subscription ID
  subscription_end_date DATETIME,
  is_admin INTEGER DEFAULT 0, -- 0 = regular user, 1 = admin
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS magic_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS idea_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  oracle_run_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  entry_price REAL,
  stop_price REAL,
  target_prices TEXT, -- JSON array
  category TEXT, -- 'crypto' or 'stocks'
  status TEXT DEFAULT 'pending', -- 'pending', 'hit_target', 'hit_stop', 'in_progress'
  outcome_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (oracle_run_id) REFERENCES oracle_runs(id)
);
