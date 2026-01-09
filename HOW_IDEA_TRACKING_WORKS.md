# How Idea Performance Tracking Works

## Overview
Track which of your Oracle predictions and symbol analyses actually made money, so you can learn what works and improve over time.

## Workflow

### 1️⃣ Save an Idea (Already Working)
When you see a good prediction or analysis, you save it to your account (this already exists in your app).

**Example:** You save Oracle's prediction for BTC at $45,000 with target $48,000 and stop at $43,000.

---

### 2️⃣ Enter a Trade
When you decide to take the trade, create a performance tracking record:

```javascript
// POST /api/idea-performance
fetch('/api/idea-performance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    saved_idea_id: 123, // ID from saved_ideas table
    user_email: 'user@example.com',
    symbol: 'BTC',
    idea_type: 'daily_oracle',
    
    // Entry details
    entry_price: 45000,
    entry_date: '2024-01-10T10:00:00Z',
    position_size: 0.1, // 0.1 BTC
    position_value: 4500, // $4,500 invested
    
    // Original plan
    original_target: 48000,
    original_stop_loss: 43000,
    expected_timeframe: '2-4 weeks',
    
    status: 'active' // Trade is open
  })
});
```

**The system automatically:**
- Generates a unique tracking ID
- Sets status to 'active'
- Records the timestamp

---

### 3️⃣ Close the Trade
When you exit (hit target, stop loss, or manual exit), update the record:

```javascript
// POST /api/idea-performance (same endpoint, include id to update)
fetch('/api/idea-performance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 456, // The tracking ID from step 2
    user_email: 'user@example.com',
    
    // Exit details
    exit_price: 47000,
    exit_date: '2024-01-20T15:30:00Z',
    exit_reason: 'target_hit', // or 'stop_loss', 'manual_exit', 'time_based'
    
    // Optional: track price extremes
    highest_price: 47500,
    lowest_price: 44200,
    
    // Optional: notes
    notes: 'Exited early due to market uncertainty',
    lessons_learned: 'Should have held for full target'
  })
});
```

**The system automatically calculates:**
- ✅ Profit/Loss: +$200 (47000 - 45000) × 0.1 BTC
- ✅ P/L Percentage: +4.44%
- ✅ Risk/Reward Ratio: 2:1 (gained $2000 vs risked $1000)
- ✅ Duration: 10 days
- ✅ Status: 'winner' (because profit > 0)

---

### 4️⃣ View Your Performance
Get comprehensive statistics:

```javascript
// GET /api/idea-performance/stats?user_email=user@example.com
const response = await fetch('/api/idea-performance/stats?user_email=user@example.com');
const data = await response.json();

console.log(data.stats);
```

**Returns:**
```json
{
  "stats": {
    "totalTrades": 25,
    "activeTrades": 3,
    "closedTrades": 22,
    
    "winners": 14,
    "losers": 7,
    "breakeven": 1,
    
    "winRate": 63.64,
    "avgWin": 450.00,
    "avgLoss": 280.00,
    "avgWinLoss": 1.61,
    
    "totalProfitLoss": 3240.00,
    "totalProfitLossPercentage": 18.50,
    
    "bestTrade": {
      "symbol": "ETH",
      "profit": 1200.00,
      "percentage": 12.5
    },
    
    "worstTrade": {
      "symbol": "SOL",
      "loss": -580.00,
      "percentage": -8.2
    },
    
    "avgDuration": 8.5,
    "avgRiskReward": 1.85,
    "profitFactor": 2.25
  },
  
  "bySymbol": [
    {
      "symbol": "BTC",
      "count": 8,
      "stats": { "winRate": 75, "totalProfitLoss": 1240 }
    },
    {
      "symbol": "ETH",
      "count": 6,
      "stats": { "winRate": 66.67, "totalProfitLoss": 980 }
    }
  ]
}
```

---

## Real-World Examples

### Example 1: Winning Trade
```javascript
// Step 1: Enter
POST /api/idea-performance
{
  symbol: 'XRP',
  entry_price: 0.60,
  position_value: 1000,
  original_target: 0.70,
  original_stop_loss: 0.54
}

// Step 2: Exit (target hit)
POST /api/idea-performance
{
  id: 789,
  exit_price: 0.70,
  exit_reason: 'target_hit'
}

// Result: +$166.67 profit (16.67%)
```

### Example 2: Losing Trade
```javascript
// Step 1: Enter
POST /api/idea-performance
{
  symbol: 'SOL',
  entry_price: 100,
  position_value: 2000,
  original_target: 115,
  original_stop_loss: 95
}

// Step 2: Exit (stop loss hit)
POST /api/idea-performance
{
  id: 790,
  exit_price: 95,
  exit_reason: 'stop_loss'
}

// Result: -$100 loss (-5%)
```

---

## Key Metrics Explained

**Win Rate:** Percentage of trades that made money
- Formula: (winners / total closed trades) × 100
- Example: 14 winners out of 22 trades = 63.64% win rate

**Profit Factor:** How much you make per dollar lost
- Formula: total wins ÷ total losses
- Example: $6300 wins ÷ $2800 losses = 2.25 profit factor
- Good: > 1.5, Excellent: > 2.0

**Average Win/Loss Ratio:** Size of wins vs losses
- Formula: average win ÷ average loss
- Example: $450 avg win ÷ $280 avg loss = 1.61 ratio
- Good: > 1.5

**Risk/Reward Ratio:** How much you gained vs what you risked
- Formula: (exit - entry) ÷ (entry - stop)
- Example: Target $48k, Entry $45k, Stop $43k
  - If hit target: ($48k - $45k) ÷ ($45k - $43k) = 1.5:1
  - If hit stop: ($43k - $45k) ÷ ($45k - $43k) = -1:1

---

## What You Can Learn

### 1. Which Ideas Work Best
```javascript
// Get stats by symbol
data.bySymbol.forEach(s => {
  console.log(`${s.symbol}: ${s.stats.winRate}% win rate, $${s.stats.totalProfitLoss} profit`);
});

// Output:
// BTC: 75% win rate, $1240 profit ✅
// ETH: 66.67% win rate, $980 profit ✅
// SOL: 42.86% win rate, -$320 loss ❌
```

**Insight:** Maybe stop trading SOL, focus on BTC!

### 2. If You Follow Your Plan
```javascript
// Check if you actually follow stop losses
trades.filter(t => t.exit_reason === 'manual_exit').forEach(t => {
  if (t.exit_price < t.original_stop_loss) {
    console.log(`${t.symbol}: Exited worse than planned stop!`);
  }
});
```

**Insight:** Do you let losers run too long?

### 3. Optimal Holding Period
```javascript
const avgDurationWinners = winners.reduce((sum, t) => sum + t.duration_days, 0) / winners.length;
const avgDurationLosers = losers.reduce((sum, t) => sum + t.duration_days, 0) / losers.length;

console.log(`Winners held: ${avgDurationWinners} days`);
console.log(`Losers held: ${avgDurationLosers} days`);
```

**Insight:** If losers held longer, maybe exit faster!

---

## Query Examples

### Get all active trades
```javascript
GET /api/idea-performance?user_email=user@example.com&status=active
```

### Get BTC trades only
```javascript
GET /api/idea-performance?user_email=user@example.com&symbol=BTC
```

### Get performance for last 30 days
```javascript
const startDate = new Date(Date.now() - 30*24*60*60*1000).toISOString();
GET /api/idea-performance/stats?user_email=user@example.com&start_date=${startDate}
```

---

## Tips for Success

1. **Always track entries AND exits** - Partial data is useless
2. **Be honest** - Track losses too, not just wins
3. **Add notes** - Why did you exit? What did you learn?
4. **Review monthly** - Look at stats and adjust strategy
5. **Track paper trades first** - Practice before real money

---

## Next Steps

You can now build a UI in your account page to:
- Show active trades (open positions)
- Display performance statistics
- Add "Track This Trade" button on saved ideas
- Show win/loss history with charts
