# Cron Architecture: User-Agnostic Market Data Updates

## Overview

The cron system operates **completely independently of users**. It's a system-wide background process that keeps market data fresh for all users simultaneously.

## How It Works Without Users

### 1. System-Wide Data Updates

```
┌─────────────────────────────────────────────────────────────┐
│  Vercel Cron (Daily at 9 AM)                                │
│  No User Context Required                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  /api/cron-heartbeat                                         │
│  - Authenticated with CRON_SECRET (not user token)          │
│  - Fetches prices from CoinGecko, Finnhub                   │
│  - Updates market_assets table (200 crypto + 200+ stocks)   │
│  - Shared across ALL users                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Database: market_assets table                               │
│  - Same data visible to all users                           │
│  - Updated once per day                                      │
│  - No user_id column - it's shared infrastructure           │
└─────────────────────────────────────────────────────────────┘
```

### 2. User Preferences Only Affect Filtering

```
User A (Conservative, Crypto)           User B (Aggressive, Stocks)
         │                                        │
         ▼                                        ▼
    Same Market Data                         Same Market Data
  (market_assets table)                    (market_assets table)
         │                                        │
         ▼                                        ▼
  Filter: Mean Reversion                   Filter: High Volatility
  Crypto assets only                       Stock assets only
         │                                        │
         ▼                                        ▼
    20-30 Assets                             20-30 Assets
    (curated for User A)                    (curated for User B)
         │                                        │
         ▼                                        ▼
    LLM Oracle                               LLM Oracle
```

**Key Point:** Users share the same market data but see different **filtered views** based on their preferences.

## Authentication Model

### Daily Cron: CRON_SECRET

```typescript
// In /api/cron-heartbeat/route.ts
const authHeader = req.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

- **Who calls it:** Vercel's cron scheduler (configured in `vercel.json`)
- **Authentication:** `CRON_SECRET` environment variable
- **User context:** None - runs as system task
- **Frequency:** Once per day at 9 AM

### Background Refresh: Public, Rate-Limited

```typescript
// In /api/update-market-data-bg/route.ts
const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

// Rate limit: 15 minutes per IP
if (lastRefreshTime && now - lastRefreshTime < 15 * 60 * 1000) {
  return Response.json({ 
    message: 'Rate limit: wait 15 minutes',
    cached: true 
  });
}
```

- **Who calls it:** Client-side hook (`useMarketDataRefresh`)
- **Authentication:** None (public market data)
- **Rate limiting:** 15 minutes per IP address
- **User context:** None - updates shared data
- **Smart caching:** Skips if data already fresh (<10 min)

## Data Flow

### Morning Update (System-Wide)

```
9:00 AM - Vercel Cron Triggers
  ↓
9:00:01 - /api/cron-heartbeat called with CRON_SECRET
  ↓
9:00:02 - Fetch 200 crypto prices from CoinGecko
9:00:05 - Fetch 200+ stock prices from Finnhub
  ↓
9:00:10 - Update market_assets table (UPSERT all rows)
  ↓
9:00:15 - Generate oracle for "conservative" style
9:00:20 - Generate oracle for "balanced" style
9:00:25 - Generate oracle for "aggressive" style
  ↓
9:00:30 - Complete (all users now have fresh data)
```

### User Activity (Anytime)

```
User visits /oracle page at 2:00 PM
  ↓
Client-side hook checks: "Is data fresh?"
  ↓
If last update > 10 minutes ago:
  ↓
Call /api/update-market-data-bg
  ↓
Check IP rate limit (15 min)
  ↓
If allowed: Update market_assets table
  ↓
All users benefit from this refresh
```

## Multiple Users Scenario

### Scenario: 100 Users Active Throughout Day

```
9:00 AM - Daily cron updates data (ALL users see fresh data)
10:30 AM - User 47 visits → triggers background refresh
          (IP rate limit: no refresh within 15 min of last update)
11:45 AM - User 12 visits → triggers background refresh
          (15 min passed, update runs - ALL users benefit)
2:15 PM - User 89 visits → triggers background refresh
          (15 min passed, update runs - ALL users benefit)
5:00 PM - User 3 visits → triggers background refresh
          (15 min passed, update runs - ALL users benefit)
```

**Result:** Market data stays fresh all day through organic user activity, without requiring user authentication.

## Why This Design?

### 1. Market Data Is Public

- Stock prices are the same for everyone
- No user-specific pricing data
- Authentication would add unnecessary complexity

### 2. Vercel Free Tier Constraint

- Only 1 cron job allowed per day
- Can't run cron every 30 minutes
- Solution: Single daily cron + client-triggered refreshes

### 3. Efficient Resource Usage

- Shared data reduces API calls
- Multiple users don't trigger duplicate fetches (rate limiting)
- Smart caching prevents unnecessary updates

### 4. Scalability

```
1 user:    1 daily cron + ~10 background refreshes/day
100 users: 1 daily cron + ~30 background refreshes/day
1000 users: 1 daily cron + ~50 background refreshes/day
```

Rate limiting prevents linear scaling of API costs.

## Database Schema (User-Agnostic)

```sql
CREATE TABLE market_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL UNIQUE,
  asset_type TEXT NOT NULL,
  current_price REAL NOT NULL,
  change_1h REAL,
  change_24h REAL,
  change_7d REAL,
  change_30d REAL,
  volume_24h REAL,
  market_cap REAL,
  volatility_score REAL,
  rsi REAL,
  is_trending BOOLEAN DEFAULT 0,
  updated_at TEXT NOT NULL
  -- Note: NO user_id column - data is shared
);
```

## User Preferences Table (Separate)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  trading_style TEXT DEFAULT 'balanced',  -- conservative/balanced/aggressive
  asset_preference TEXT DEFAULT 'both',   -- crypto/stocks/both
  created_at TEXT NOT NULL
);
```

**Key Separation:**
- `market_assets` = System-wide shared data (no user reference)
- `users` = User preferences (controls filtering only)

## Environment Variables

```bash
# Cron Authentication
CRON_SECRET=your-secure-random-string  # For daily cron only

# API Keys (System-wide)
COINGECKO_API_KEY=optional  # CoinGecko Pro (optional)
FINNHUB_API_KEY=required    # Finnhub stocks

# No user-related credentials needed for cron
```

## Testing Without Users

```bash
# Test daily cron (simulate Vercel scheduler)
curl -X GET http://localhost:3000/api/cron-heartbeat \
  -H "Authorization: Bearer your-cron-secret"

# Test background refresh (no auth)
curl -X POST http://localhost:3000/api/update-market-data-bg

# Check market data (should see same data for all requests)
curl http://localhost:3000/api/market-snapshot
```

## Monitoring

### Logs to Track

1. **Daily Cron Success**
   ```
   [CRON] Market data updated: 400 assets
   [CRON] Generated 3 oracles (conservative, balanced, aggressive)
   [CRON] Total time: 28 seconds
   ```

2. **Background Refresh**
   ```
   [BG-REFRESH] IP: 192.168.1.1 - Update triggered
   [BG-REFRESH] Rate limit: OK (last refresh 17 min ago)
   [BG-REFRESH] Market data updated: 400 assets
   ```

3. **Rate Limit Hits**
   ```
   [BG-REFRESH] IP: 192.168.1.1 - Rate limited (9 min since last)
   [BG-REFRESH] Serving cached data
   ```

### Vercel Dashboard

- **Cron Logs:** Check if daily cron runs successfully
- **Function Logs:** Monitor `/api/cron-heartbeat` and `/api/update-market-data-bg`
- **Database Logs:** Verify `market_assets` table updates

## Common Questions

### Q: What if no users visit the site all day?

**A:** Data still updates once at 9 AM via the daily cron. The site remains functional with slightly stale data (max 24 hours old).

### Q: What if 1000 users visit simultaneously?

**A:** Rate limiting ensures only one refresh per 15 minutes per IP. Concurrent requests from the same IP will see cached data.

### Q: How does user preference affect data?

**A:** User preferences (trading_style, asset_preference) only control which 20-30 assets are **filtered** from the shared market_assets table. The raw data is identical for all users.

### Q: Can users trigger manual refreshes?

**A:** Yes, but it's rate-limited (15 min per IP) and updates shared data (benefits all users).

### Q: What happens during market hours vs after hours?

**A:** Cron runs regardless of market hours. APIs return last known prices when markets are closed. This is normal behavior.

## Summary

✅ **Cron runs without any user context**  
✅ **All users share the same market data**  
✅ **User preferences only affect filtering/display**  
✅ **Authentication: CRON_SECRET for daily cron, none for background**  
✅ **Rate limiting prevents abuse of background refresh**  
✅ **Scalable design: 1 or 1000 users = similar API costs**

This is how professional trading platforms work: **shared market feed, personalized views**.
