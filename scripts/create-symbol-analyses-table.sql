-- Table for tracking custom symbol analyses
CREATE TABLE IF NOT EXISTS symbol_analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  symbol TEXT NOT NULL,
  analysis TEXT NOT NULL, -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_email, symbol, created_at)
);

CREATE INDEX IF NOT EXISTS idx_symbol_analyses_user_date 
ON symbol_analyses(user_email, created_at);

CREATE INDEX IF NOT EXISTS idx_symbol_analyses_symbol 
ON symbol_analyses(symbol);
