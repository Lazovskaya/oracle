# Internal Cron Scheduler

**Platform-independent cron system** that works on any hosting provider (Vercel Free, Railway, Render, etc.)

## Features

✅ No dependency on Vercel Pro plan
✅ Works on any Node.js hosting
✅ Configurable via environment variables
✅ Can be manually triggered for testing
✅ Automatic initialization on app startup

## Setup

### 1. Environment Variables

Add to your `.env.local` (development) and production environment:

```bash
# Enable internal cron scheduler
ENABLE_INTERNAL_CRON=true

# Cron schedule (default: 9 AM UTC daily)
CRON_SCHEDULE=0 9 * * *

# Cron secret for authentication
CRON_SECRET=your-secret-key-change-in-production

# Base URL for API calls
NEXT_PUBLIC_URL=https://finforesee.com
```

### 2. Cron Schedule Format

Uses standard cron syntax:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Examples:**

```bash
# Daily at 9 AM UTC
CRON_SCHEDULE="0 9 * * *"

# Every 6 hours
CRON_SCHEDULE="0 */6 * * *"

# Every 15 minutes (for testing)
CRON_SCHEDULE="*/15 * * * *"

# Twice daily (9 AM and 9 PM UTC)
CRON_SCHEDULE="0 9,21 * * *"
```

### 3. Initialize Cron

The cron scheduler needs to be started once. Two methods:

#### Method A: Auto-start on app deployment

Add to your startup script or call from layout/middleware:

```typescript
// Call once when app starts
import { startCronScheduler } from '@/lib/cronScheduler';
startCronScheduler();
```

#### Method B: Call initialization endpoint

After deploying, make one GET request:

```bash
curl https://finforesee.com/api/cron-init
```

This starts the scheduler and it will keep running.

## How It Works

1. **Scheduler starts** → Reads `CRON_SCHEDULE` from env
2. **At scheduled time** → Calls `/api/cron-heartbeat` internally
3. **Cron heartbeat** → Updates market data + generates trading ideas
4. **Process repeats** → According to schedule

```
┌─────────────────┐
│  Cron Scheduler │ (node-cron)
│   (internal)    │
└────────┬────────┘
         │ At scheduled time
         │
         ▼
┌─────────────────────┐
│ /api/cron-heartbeat │
│  (with auth token)  │
└────────┬────────────┘
         │
         ├──► Update market data
         │
         └──► Generate oracle predictions
              (conservative, balanced, aggressive)
```

## Testing

### Manual Trigger

Test the cron without waiting:

```bash
node scripts/trigger-cron.js
```

This immediately runs the cron job once.

### Check Logs

Production logs will show:

```
🕐 Starting internal cron scheduler...
   Schedule: 0 9 * * *
   Endpoint: https://finforesee.com/api/cron-heartbeat
✅ Internal cron scheduler started
   Next run: Daily at 09:00 UTC

🔔 Cron triggered at 2026-01-15T09:00:00.000Z
   Calling /api/cron-heartbeat...
✅ Cron heartbeat successful
```

## Deployment

### Vercel (Free or Pro)

Add environment variables in Vercel Dashboard → Settings → Environment Variables:

```
ENABLE_INTERNAL_CRON=true
CRON_SCHEDULE=0 9 * * *
CRON_SECRET=your-secret-key
NEXT_PUBLIC_URL=https://your-domain.vercel.app
```

After deployment, call `/api/cron-init` once to start.

### Railway

Add environment variables in Railway Dashboard → Variables:

```
ENABLE_INTERNAL_CRON=true
CRON_SCHEDULE=0 9 * * *
CRON_SECRET=your-secret-key
NEXT_PUBLIC_URL=https://your-app.up.railway.app
```

Railway keeps the app running, so cron will work automatically.

### Render

Add environment variables in Render Dashboard → Environment:

```
ENABLE_INTERNAL_CRON=true
CRON_SCHEDULE=0 9 * * *
CRON_SECRET=your-secret-key
NEXT_PUBLIC_URL=https://your-app.onrender.com
```

## Advantages vs Vercel Cron

| Feature | Vercel Cron | Internal Cron |
|---------|-------------|---------------|
| Cost | Requires Pro ($20/mo) | Free |
| Platform | Vercel only | Any hosting |
| Configuration | vercel.json | Environment variables |
| Testing | Hard to test | Easy manual trigger |
| Reliability | High | Depends on hosting |

## Important Notes

⚠️ **Keep-Alive Required**: Some hosting platforms (Render, Railway) may sleep after inactivity. Use a keep-alive service or upgrade to always-on hosting.

⚠️ **Serverless Limitations**: On serverless platforms (Vercel, Netlify), the cron process may not persist between requests. Consider using external cron services for critical production workloads.

✅ **Best For**: Dedicated hosting (Railway, Render, VPS) where the Node.js process stays running.

## Troubleshooting

### Cron not running

1. Check `ENABLE_INTERNAL_CRON=true` is set
2. Verify `/api/cron-init` was called after deployment
3. Check application logs for "Internal cron scheduler started"

### Invalid schedule

Error: "Invalid cron schedule"

→ Verify schedule format at https://crontab.guru/

### Authentication errors

Error: "Unauthorized"

→ Verify `CRON_SECRET` matches in both scheduler and heartbeat endpoint

## Migration from Vercel Cron

1. Add environment variables (above)
2. Deploy the new code
3. Call `/api/cron-init` once
4. Remove `vercel.json` crons section (optional)

Both systems can coexist - internal cron will work everywhere, Vercel cron will work on Pro plans.
