-- Add user consent table for subscription compliance
CREATE TABLE IF NOT EXISTS user_consent (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  country TEXT NOT NULL,
  terms_accepted BOOLEAN NOT NULL DEFAULT 1,
  risk_accepted BOOLEAN NOT NULL DEFAULT 1,
  tier TEXT NOT NULL, -- 'basic', 'pro', 'basic-yearly', 'pro-yearly'
  ip_address TEXT, -- optional: capture IP for compliance
  user_agent TEXT, -- optional: capture user agent
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for consent lookup
CREATE INDEX IF NOT EXISTS idx_consent_user_email ON user_consent(user_email);
CREATE INDEX IF NOT EXISTS idx_consent_created_at ON user_consent(created_at);
