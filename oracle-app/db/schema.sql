-- Schema for Oracle runs (compatible with libSQL/Turso and SQLite)
CREATE TABLE IF NOT EXISTS oracle_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_date TEXT NOT NULL,
  market_phase TEXT,
  result TEXT NOT NULL,
  result_ru TEXT,
  result_es TEXT,
  result_zh TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);