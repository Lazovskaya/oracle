-- Schema for Oracle runs (compatible with libSQL/Turso and SQLite)
CREATE TABLE IF NOT EXISTS oracle_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_date TEXT NOT NULL,
  market_phase TEXT,
  result TEXT NOT NULL,
  result_ru TEXT,
  result_fr TEXT,
  result_es TEXT,
  result_zh TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking commissions and taxes
CREATE TABLE IF NOT EXISTS commissions_taxes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- User identification
  user_id TEXT NOT NULL,
  user_email TEXT,
  
  -- Transaction details
  payment_date DATETIME NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL,
  payment_currency TEXT DEFAULT 'USD',
  payment_method TEXT, -- stripe, paypal, crypto, etc.
  transaction_id TEXT UNIQUE, -- external payment processor ID
  
  -- Subscription details
  subscription_type TEXT NOT NULL, -- 'pro', 'premium', etc.
  subscription_start_date DATETIME NOT NULL,
  subscription_end_date DATETIME NOT NULL,
  billing_cycle TEXT, -- 'monthly', 'yearly', 'lifetime'
  
  -- Geographic and tax information
  user_country TEXT NOT NULL, -- ISO country code (US, GB, DE, etc.)
  user_state TEXT, -- for US/Canada states
  user_city TEXT,
  user_postal_code TEXT,
  user_ip_address TEXT, -- for verification
  
  -- Tax calculation fields
  tax_rate DECIMAL(5, 4), -- e.g., 0.2000 for 20%
  tax_amount DECIMAL(10, 2), -- calculated tax
  vat_number TEXT, -- for EU businesses
  is_reverse_charge BOOLEAN DEFAULT 0, -- EU B2B transactions
  
  -- Commission tracking
  gross_amount DECIMAL(10, 2), -- before fees
  payment_processor_fee DECIMAL(10, 2), -- Stripe/PayPal fees
  net_amount DECIMAL(10, 2), -- after processor fees
  platform_commission DECIMAL(10, 2), -- your commission
  
  -- Additional metadata
  invoice_number TEXT,
  receipt_url TEXT,
  refund_status TEXT DEFAULT 'none', -- 'none', 'partial', 'full'
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  refund_date DATETIME,
  
  -- Audit fields
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions_taxes(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_payment_date ON commissions_taxes(payment_date);
CREATE INDEX IF NOT EXISTS idx_commissions_country ON commissions_taxes(user_country);
CREATE INDEX IF NOT EXISTS idx_commissions_transaction_id ON commissions_taxes(transaction_id);

-- Table for tracking idea performance (win/loss tracking)
CREATE TABLE IF NOT EXISTS idea_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Reference to saved idea
  saved_idea_id INTEGER, -- references saved_ideas(id)
  saved_analysis_id INTEGER, -- references saved_symbol_analyses(id)
  
  -- Idea details
  user_email TEXT NOT NULL,
  symbol TEXT NOT NULL,
  idea_type TEXT NOT NULL, -- 'daily_oracle', 'symbol_analysis'
  
  -- Entry information
  entry_price REAL,
  entry_date DATETIME,
  position_size REAL, -- number of units/shares
  position_value REAL, -- total $ value
  
  -- Exit information
  exit_price REAL,
  exit_date DATETIME,
  exit_reason TEXT, -- 'target_hit', 'stop_loss', 'manual_exit', 'time_based'
  
  -- Performance metrics
  status TEXT DEFAULT 'active', -- 'active', 'winner', 'loser', 'breakeven', 'cancelled'
  profit_loss REAL, -- $ amount gained/lost
  profit_loss_percentage REAL, -- % gain/loss
  risk_reward_ratio REAL, -- actual R:R achieved
  
  -- Target/Stop tracking
  original_target REAL,
  original_stop_loss REAL,
  targets_hit TEXT, -- JSON array of which targets were hit
  highest_price REAL, -- highest price reached
  lowest_price REAL, -- lowest price reached
  
  -- Time metrics
  duration_days INTEGER, -- how many days position was held
  expected_timeframe TEXT, -- original timeframe (e.g., "2-6 weeks")
  
  -- User notes
  notes TEXT,
  lessons_learned TEXT,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME
);

-- Indexes for performance tracking
CREATE INDEX IF NOT EXISTS idx_performance_user_email ON idea_performance(user_email);
CREATE INDEX IF NOT EXISTS idx_performance_symbol ON idea_performance(symbol);
CREATE INDEX IF NOT EXISTS idx_performance_status ON idea_performance(status);
CREATE INDEX IF NOT EXISTS idx_performance_entry_date ON idea_performance(entry_date);
CREATE INDEX IF NOT EXISTS idx_performance_closed_at ON idea_performance(closed_at);