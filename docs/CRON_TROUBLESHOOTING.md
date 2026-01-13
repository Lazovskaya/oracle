# Vercel Cron Configuration Issues and Solutions

## Current Configuration

In `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron-heartbeat",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs at 9:00 AM UTC daily.

## Common Issues Why Cron Doesn't Work

### 1. ⚠️ Vercel Cron Requires Pro Plan
**Vercel Cron Jobs are only available on Pro and Enterprise plans**

Free (Hobby) plans: ❌ No cron support
Pro plans: ✅ Cron support included

**Solution**: Upgrade to Vercel Pro or use external cron services.

---

### 2. ❌ Missing Authorization Header

Vercel automatically adds this header to cron requests:
```
Authorization: Bearer <CRON_SECRET>
```

But you need to:
1. Set `CRON_SECRET` environment variable in Vercel
2. Make sure your endpoint checks for it

**Current code** (in `/api/cron-heartbeat/route.ts`):
```typescript
const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production';
if (authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Action Required**:
- Go to Vercel Dashboard → Settings → Environment Variables
- Add: `CRON_SECRET=<random-secure-string>`
- Redeploy

---

### 3. ⚠️ Wrong Path in vercel.json

The path must match your API route **exactly**.

Current: `/api/cron-heartbeat`  
File: `app/api/cron-heartbeat/route.ts` ✅

This is correct!

---

### 4. 🕐 Timezone Confusion

Schedule `"0 9 * * *"` = **9:00 AM UTC**

- UTC time, not local time
- Runs once daily at 9 AM UTC
- If you're in EST: that's 4 AM EST
- If you're in CET: that's 10 AM CET

---

## How to Test if Cron is Working

### Check Vercel Logs:
1. Go to Vercel Dashboard → Deployments → [latest deployment]
2. Click "Functions" tab
3. Look for `/api/cron-heartbeat` logs
4. Should see logs around 9:00 AM UTC

### Manual Test:
```bash
curl -X GET https://finforesee.com/api/cron-heartbeat \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Should return:
```json
{
  "success": true,
  "message": "Cron heartbeat completed",
  "results": { ... }
}
```

---

## Alternative Solutions (if Vercel Cron doesn't work)

### Option 1: External Cron Service (Free)

Use **cron-job.org** or **EasyCron**:

1. Create free account at https://cron-job.org
2. Add new cron job:
   - URL: `https://finforesee.com/api/cron-heartbeat`
   - Schedule: `0 9 * * *` (daily at 9 AM)
   - Add header: `Authorization: Bearer YOUR_CRON_SECRET`

### Option 2: GitHub Actions (Free)

Create `.github/workflows/daily-cron.yml`:

```yaml
name: Daily Oracle Update

on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM UTC daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  run-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel Cron
        run: |
          curl -X GET https://finforesee.com/api/cron-heartbeat \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add `CRON_SECRET` to GitHub repository secrets.

### Option 3: Uptime Robot (Free)

1. Sign up at https://uptimerobot.com (free)
2. Create HTTP(s) monitor:
   - URL: `https://finforesee.com/api/cron-heartbeat`
   - Type: HTTP(s)
   - Interval: Every 24 hours
   - Custom headers: `Authorization: Bearer YOUR_CRON_SECRET`

---

## Recommended Configuration

### For Production (Vercel Pro):

```json
{
  "crons": [
    {
      "path": "/api/cron-heartbeat",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron-heartbeat",
      "schedule": "0 18 * * *"
    }
  ]
}
```

This runs twice daily: 6 AM and 6 PM UTC.

### For Free Plan:

Use GitHub Actions or external cron service as described above.

---

## Environment Variables Needed

In Vercel Dashboard → Settings → Environment Variables:

```bash
CRON_SECRET=<generate-random-secure-string>
ADMIN_API_TOKEN=<optional-for-manual-triggers>
```

Generate secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Debugging Checklist

- [ ] Vercel Pro plan active?
- [ ] `CRON_SECRET` set in Vercel?
- [ ] Deployment successful?
- [ ] Check logs in Vercel dashboard after 9 AM UTC
- [ ] Manual curl test works?
- [ ] Route file exists at correct path?
- [ ] No 401 errors in logs?

---

## Current Schedule

**Current**: `0 9 * * *` = Once daily at 9:00 AM UTC

**What it does**:
1. ✅ Updates market data (stocks & crypto prices)
2. ✅ Runs oracle predictions for all 3 styles:
   - Conservative
   - Balanced
   - Aggressive
3. ✅ Stores timestamp in database

**If you want twice daily**:

```json
{
  "crons": [
    {
      "path": "/api/cron-heartbeat",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron-heartbeat",
      "schedule": "0 21 * * *"
    }
  ]
}
```

This runs at 9 AM and 9 PM UTC.
