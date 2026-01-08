# Oracle All-Styles Generation Setup

## Overview
The oracle now generates predictions for all 3 trading styles (Conservative, Balanced, Aggressive) at once. This allows users to instantly switch between styles without waiting for new predictions.

## Manual Execution

### PowerShell Script
```powershell
.\scripts\run-all-styles.ps1
```

### Direct API Call
```powershell
Invoke-RestMethod -Uri "https://your-site.com/api/run-oracle-all-styles" -Method POST
```

Or with curl:
```bash
curl -X POST https://your-site.com/api/run-oracle-all-styles
```

## Scheduled Execution (2x Daily)

### Windows Task Scheduler

1. **Create Basic Task**:
   - Open Task Scheduler
   - Create Basic Task → "Oracle All Styles Generation"

2. **Trigger**: Daily at 9:00 AM and 9:00 PM
   - Start: 9:00 AM
   - Recur every: 1 days
   - Repeat task every: 12 hours
   - Duration: Indefinitely

3. **Action**: Start a program
   - Program: `powershell.exe`
   - Arguments: `-File "C:\Users\C5327544\Projects\oracle\scripts\run-all-styles.ps1"`
   - Start in: `C:\Users\C5327544\Projects\oracle`

### Vercel Cron Jobs (Recommended for Production)

1. Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/run-oracle-all-styles",
      "schedule": "0 9,21 * * *"
    }
  ]
}
```

2. Deploy to Vercel - cron runs automatically at 9 AM and 9 PM UTC

### Alternative: GitHub Actions

Create `.github/workflows/oracle-cron.yml`:
```yaml
name: Generate Oracle Predictions
on:
  schedule:
    - cron: '0 9,21 * * *'  # 9 AM and 9 PM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Oracle Generation
        run: |
          curl -X POST ${{ secrets.SITE_URL }}/api/run-oracle-all-styles
```

## How It Works

1. **Generation** (5-10 minutes):
   - Fetches current market prices
   - Generates Conservative predictions (tight stops, lower risk)
   - Generates Balanced predictions (moderate risk/reward)
   - Generates Aggressive predictions (wider stops, higher targets)
   - Translates all to EN, RU, ES, ZH
   - Stores in database with `trading_style` column

2. **User Experience**:
   - User clicks 🛡️ Conservative → **Instant switch** (pre-generated)
   - User clicks ⚖️ Balanced → **Instant switch** (pre-generated)
   - User clicks 🚀 Aggressive → **Instant switch** (pre-generated)
   - No waiting, no loading screens

3. **Database Structure**:
```sql
oracle_runs (
  id, 
  run_date, 
  market_phase, 
  result, 
  result_ru, 
  result_es, 
  result_zh,
  trading_style,  -- NEW: 'conservative' | 'balanced' | 'aggressive'
  asset_preference, -- NEW: 'crypto' | 'stocks' | 'both'
  created_at
)
```

## Monitoring

Check generation logs:
```powershell
# View recent generations
Get-Content logs\oracle.log -Tail 50
```

Check database:
```sql
SELECT trading_style, COUNT(*) 
FROM oracle_runs 
WHERE run_date = date('now') 
GROUP BY trading_style;
```

Should show 3 rows (one per style) for today.

## Cost Estimation

- **API Calls**: 3 generations × 2 runs/day = 6 OpenAI API calls/day
- **Tokens**: ~3,600 completion tokens/day (600 per generation)
- **Cost**: ~$0.02/day with GPT-4 Turbo (~$7/year)

## Troubleshooting

**Problem**: Only balanced predictions available
- **Solution**: Run `.\scripts\run-all-styles.ps1` manually first

**Problem**: Timeout errors
- **Solution**: Increase `maxDuration` in route.ts (currently 300s)

**Problem**: Missing predictions after generation
- **Solution**: Check database for `trading_style` column and verify data
