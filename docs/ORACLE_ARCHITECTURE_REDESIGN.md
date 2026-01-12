# Oracle Architecture Redesign - Market Data Layer

## 🎯 Overview

This redesign implements a **professional data-driven architecture** where:
- ✅ **Real market prices stored in database** (not hallucinated by LLM)
- ✅ **Pre-filtered asset selection** (20-30 curated assets per oracle run)
- ✅ **LLM makes decisions, not data lookups** (decision engine, not search engine)
- ✅ **Automated price updates** (cron job every 30 minutes)
- ✅ **Trading style-based filtering** (conservative, balanced, aggressive)

## 📊 Architecture Layers

### Layer 1: Market Data (Database)
**Table: `market_assets`**
- Stores real-time prices for 100+ crypto + 60+ stocks/ETFs
- Updated every 30 minutes via cron job
- Includes technical indicators: volatility, RSI, trends
- Flags: is_trending, is_volatile, is_liquid

### Layer 2: Pre-Filter (Smart Selection)
**Service: `marketFilterService.ts`**
- Selects 20-30 best assets based on strategy
- Strategies:
  - `top_gainers` - High momentum winners
  - `top_losers` - Oversold reversal plays
  - `high_volatility` - Aggressive high-risk setups
  - `trending` - Strong momentum plays
  - `mean_reversion` - Oversold bounces
  - `balanced_mix` - Diverse opportunities

### Layer 3: LLM Decision Engine
**Updated Prompt Architecture**
- LLM receives curated market snapshot (not entire market)
- Must select ONLY from provided symbols
- Cannot hallucinate prices or symbols
- Focuses on wave analysis and strategy

### Layer 4: Smart Cron System (Vercel Free Tier Compatible)
**Single Daily Cron + Background Updates**
- `/api/cron-heartbeat` - Runs once daily at 9 AM (Vercel free tier limit)
  - Updates all market data
  - Generates oracle for all 3 trading styles
- `/api/update-market-data-bg` - Client-triggered background updates
  - Keeps data fresh throughout the day
  - Rate limited: 1 update per 15 minutes per IP
  - Triggered automatically when users visit the site

## 🚀 Setup Instructions

### 1. Initialize Database Schema

```bash
node scripts/init-market-assets.js
```

This creates the `market_assets` table and market buckets.

### 2. Set API Keys

Add to your `.env` or `.env.local`:

```bash
# Choose ONE of these (Finnhub is simpler for free tier)
FINNHUB_API_KEY=your_key_here
# OR
POLYGON_API_KEY=your_key_here

# Cron secret for security
CRON_SECRET=your-secure-random-string

# Admin token for manual triggers
ADMIN_API_TOKEN=your-admin-token
```

**Free API Keys:**
- Finnhub: https://finnhub.io/register (60 calls/minute free)
- CoinGecko: No key needed for crypto (built-in)
- Polygon: https://polygon.io/ (5 calls/minute free)

### 3. Initial Data Load

Trigger the first heartbeat to load all data:

```bash
# Using curl (cron secret required)
curl -X GET http://localhost:3000/api/cron-heartbeat \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Or in production
curl -X GET https://your-app.vercel.app/api/cron-heartbeat \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

This will:
1. ✅ Update market data (100+ crypto + 60+ stocks)
2. ✅ Generate oracle predictions for all 3 trading styles
3. ✅ Store heartbeat timestamp in database

### 4. Verify Data

Check that market data was loaded:

```sql
-- Should return 100+ rows
SELECT COUNT(*) FROM market_assets;

-- Check crypto assets
SELECT symbol, price, change_7d, is_trending 
FROM market_assets 
WHERE asset_type = 'crypto' 
LIMIT 10;

-- Check stock assets
SELECT symbol, price, change_7d 
FROM market_assets 
WHERE asset_type = 'stock' 
LIMIT 10;
```

### 5. Test Oracle Run

The oracle will now automatically use market data:

```bash
# Trigger oracle manually
curl -X POST http://localhost:3000/api/run-oracle
```

## 📁 New Files Created

```
lib/
  marketDataService.ts          - Fetches prices from APIs
  marketFilterService.ts        - Pre-filters assets for LLM
  oracleRunner.ts              - Generates oracle for specific styles
  hooks/
    useMarketDataRefresh.ts    - Client-side background refresh

app/api/
  cron-heartbeat/
    route.ts                   - Daily cron orchestrator
  update-market-data/
    route.ts                   - Admin manual update endpoint
  update-market-data-bg/
    route.ts                   - Background refresh endpoint

oracle-app/db/
  market_assets_schema.sql     - Database schema

scripts/
  init-market-assets.js        - One-time setup script
```

## 🔄 How It Works

### Before (Old Architecture)
```
User → LLM → Hallucinates prices → Random symbols
```

### After (New Architecture)
```
Daily Cron (9 AM)     → Update Market Data → Generate 3 Oracle Styles
                      ↓
User Visit           → Background Refresh (if 30+ min old)
                      ↓
Oracle Page          → Pre-Filter 25 Assets → LLM Decision → Trading Ideas
```

### Smart Data Freshness
1. **Daily Cron (9 AM)**: Full update + oracle generation
2. **User Visits**: Automatic background refresh if data is 30+ minutes old
3. **Rate Limited**: Max 1 refresh per 15 min per IP to prevent abuse
4. **Smart Caching**: Skips refresh if data updated in last 10 minutes

## 🎨 Pre-Filter Strategies Explained

### Conservative (Capital Protection)
```typescript
strategy: 'mean_reversion'
// Selects oversold assets with RSI < 40
// Focus: Lower risk, reversal plays
```

### Balanced (Trend Following)
```typescript
strategy: 'balanced_mix'
// Selects mix of gainers + reversions + trending
// Focus: Diversified opportunities
```

### Aggressive (Momentum Hunt)
```typescript
strategy: 'high_volatility'
// Selects high volatility breakout candidates
// Focus: High risk/reward setups
```

## 🔧 Configuration

### Market Buckets (Advanced)

You can create specialized oracle runs using market buckets:

```sql
SELECT * FROM market_buckets;
```

Pre-configured buckets:
- `crypto_trending` - Top trending cryptocurrencies
- `crypto_mean_reversion` - Oversold cryptos
- `stocks_growth` - High growth stocks
- `stocks_defensive` - Low volatility defensive
- `etf_sector_rotation` - Sector momentum
- `high_volatility` - Aggressive plays
- `breakout_candidates` - Consolidation breakouts

### Asset Universe

**Crypto (100 assets)**
- CoinGecko top 100 by market cap
- Updated every 30 minutes
- Includes: BTC, ETH, SOL, and top altcoins

**Stocks (40 assets)**
- S&P 500 top holdings
- Popular growth stocks
- Updated daily (or every 30min with good API)

**ETFs (20 assets)**
- Major index ETFs (SPY, QQQ, IWM)
- Sector ETFs (XLF, XLK, XLE, etc.)
- Updated daily

## 📊 Monitoring

### Check Data Freshness

```sql
-- Should be within last 2 hours
SELECT 
  asset_type,
  COUNT(*) as count,
  MAX(last_updated) as most_recent
FROM market_assets
GROUP BY asset_type;
```

### Check Cron Health

View Vercel cron logs:
```bash
vercel logs --follow
```

Look for:
```
✓ Fetched 100 crypto prices
✓ Fetched 60 stock/ETF prices
✓ Market assets updated successfully
```

## 🚨 Troubleshooting

### No market data in oracle results
**Problem**: LLM still inventing symbols
**Solution**: 
1. Check `market_assets` table has data
2. Trigger manual cron: `GET /api/cron-heartbeat`
3. Check API keys are set

### Prices not updating
**Problem**: Cron job failing
**Solution**:
1. Check Vercel cron logs
2. Verify API keys are valid
3. Check rate limits not exceeded
4. Trigger manual: `POST /api/cron-heartbeat` (with admin token)

### Data seems stale
**Problem**: Background refresh not working
**Solution**:
1. Check browser console for refresh logs
2. Verify `/api/update-market-data-bg` is accessible
3. Check IP rate limiting (15 min cooldown)
4. Try different browser/clear cookies

### Vercel Cron Limits
**Problem**: "Only 1 cron job allowed on free tier"
**Solution**: We use single daily cron + client-triggered background updates
- This is intentional and working as designed
- Market data stays fresh via user activity
- No additional cron jobs needed

## 🎯 Benefits

✅ **No more hallucinated prices** - All prices are real
✅ **Variety every run** - Pre-filter selects different assets
✅ **Faster responses** - LLM gets curated list, not entire market
✅ **Better accuracy** - Real data = better decisions
✅ **Scalable** - Can add more assets easily
✅ **Professional** - Separates data layer from decision layer
✅ **Vercel Free Tier Compatible** - Single daily cron + smart background updates
✅ **Always Fresh Data** - User activity keeps market data current

## 🔮 Future Enhancements

### Phase 2 (Optional)
- [ ] Historical price data for better wave analysis
- [ ] More technical indicators (MACD, Bollinger Bands)
- [ ] Support/resistance level detection
- [ ] Sector rotation detection
- [ ] Market regime classification

### Phase 3 (Advanced)
- [ ] Multiple specialized oracles per bucket
- [ ] "NO TRADE" recommendations
- [ ] Backtesting framework
- [ ] Performance tracking against market data
- [ ] Real-time WebSocket price updates

## 📝 Migration Notes

### Breaking Changes
- `buildOraclePrompt()` signature changed
  - Before: `buildOraclePrompt(currentPrices, style, assets)`
  - After: `buildOraclePrompt(marketSnapshot, style, assets)`

### Backwards Compatibility
- Old oracle runs still work (stored in database)
- No user-facing changes
- Seamless transition for existing users

## 🎓 Learning Resources

**Architecture Pattern**: Data Layer Separation
**Inspiration**: How hedge funds structure trading systems
**Key Principle**: LLM = Decision Engine, NOT Data Provider

---

**Created**: January 11, 2026
**Branch**: `feature/oracle-architecture-redesign`
**Status**: Ready for testing
