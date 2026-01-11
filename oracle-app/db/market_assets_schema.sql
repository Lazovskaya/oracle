-- Market Assets Table - Real-time price data layer
-- Separates market data from LLM decisions
CREATE TABLE IF NOT EXISTS market_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Asset identification
  symbol TEXT NOT NULL UNIQUE,
  name TEXT,
  asset_type TEXT NOT NULL, -- 'crypto' | 'stock' | 'etf'
  
  -- Price data
  price REAL NOT NULL,
  change_1h REAL,
  change_24h REAL,
  change_7d REAL,
  change_30d REAL,
  
  -- Volume and liquidity
  volume_24h REAL,
  volume_7d_avg REAL,
  market_cap REAL,
  
  -- Technical indicators
  volatility_7d REAL, -- 7-day standard deviation
  volatility_14d REAL, -- 14-day standard deviation
  rsi_14d REAL, -- RSI indicator
  
  -- Trend analysis
  trend_50_200 TEXT, -- 'up' | 'down' | 'flat' (50/200 MA relationship)
  support_level REAL,
  resistance_level REAL,
  
  -- Market context
  is_trending BOOLEAN DEFAULT 0, -- high momentum flag
  is_volatile BOOLEAN DEFAULT 0, -- high volatility flag
  is_liquid BOOLEAN DEFAULT 1, -- sufficient volume flag
  
  -- Data freshness
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_source TEXT, -- 'coingecko' | 'polygon' | 'finnhub'
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_asset_type CHECK (asset_type IN ('crypto', 'stock', 'etf'))
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_market_assets_symbol ON market_assets(symbol);
CREATE INDEX IF NOT EXISTS idx_market_assets_type ON market_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_market_assets_updated ON market_assets(last_updated);
CREATE INDEX IF NOT EXISTS idx_market_assets_trending ON market_assets(is_trending) WHERE is_trending = 1;
CREATE INDEX IF NOT EXISTS idx_market_assets_volatile ON market_assets(is_volatile) WHERE is_volatile = 1;

-- View for quick market snapshot queries
CREATE VIEW IF NOT EXISTS market_snapshot AS
SELECT 
  symbol,
  name,
  asset_type,
  price,
  change_24h,
  change_7d,
  volume_24h,
  volatility_14d,
  rsi_14d,
  trend_50_200,
  is_trending,
  is_volatile,
  last_updated
FROM market_assets
WHERE is_liquid = 1
  AND last_updated > datetime('now', '-2 hours')
ORDER BY volume_24h DESC;

-- Market buckets for specialized oracle runs
CREATE TABLE IF NOT EXISTS market_buckets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bucket_name TEXT NOT NULL UNIQUE, -- 'crypto_trending' | 'stocks_growth' | etc
  description TEXT,
  filter_criteria TEXT, -- JSON with filter rules
  asset_count_target INTEGER DEFAULT 20, -- how many assets to select
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_bucket_name CHECK (
    bucket_name IN (
      'crypto_trending',
      'crypto_mean_reversion', 
      'stocks_growth',
      'stocks_defensive',
      'etf_sector_rotation',
      'high_volatility',
      'breakout_candidates'
    )
  )
);

-- Seed initial market buckets
INSERT OR IGNORE INTO market_buckets (bucket_name, description, filter_criteria, asset_count_target) VALUES
('crypto_trending', 'Top trending cryptocurrencies with high momentum', '{"asset_type": "crypto", "is_trending": true, "order_by": "volume_24h DESC"}', 15),
('crypto_mean_reversion', 'Oversold cryptos for reversal plays', '{"asset_type": "crypto", "rsi_14d": "<30", "order_by": "change_7d ASC"}', 10),
('stocks_growth', 'High growth stocks with strong trends', '{"asset_type": "stock", "trend_50_200": "up", "change_30d": ">10", "order_by": "change_30d DESC"}', 20),
('stocks_defensive', 'Low volatility defensive stocks', '{"asset_type": "stock", "volatility_14d": "<15", "order_by": "volatility_14d ASC"}', 15),
('etf_sector_rotation', 'Sector ETFs with momentum', '{"asset_type": "etf", "change_7d": ">2", "order_by": "change_7d DESC"}', 10),
('high_volatility', 'High volatility plays for aggressive traders', '{"is_volatile": true, "order_by": "volatility_14d DESC"}', 20),
('breakout_candidates', 'Assets near resistance levels', '{"price": "near_resistance", "order_by": "volume_24h DESC"}', 15);
