-- Schema for Oracle runs (compatible with libSQL/Turso and SQLite)
CREATE TABLE IF NOT EXISTS oracle_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_date TEXT,
  market_phase TEXT,
  result TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);