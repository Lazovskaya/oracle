# 🚀 Deployment Guide - Market Oracle

Quick reference for deploying your Market Oracle to Vercel.

## Prerequisites Checklist

- [ ] Turso database created and initialized
- [ ] OpenAI API key obtained
- [ ] GitHub repository (for automatic deployments)
- [ ] Vercel account created

## Step-by-Step Deployment

### 1. Prepare Your Database (Turso)

```bash
# Install Turso CLI (if not already installed)
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# Create your database
turso db create oracle-db

# Get your credentials (save these!)
turso db show oracle-db --url
turso db tokens create oracle-db

# Initialize the schema
turso db shell oracle-db < oracle-app/db/schema.sql
```

**Save these values:**
- `DATABASE_URL`: libsql://[your-db].turso.io
- `DATABASE_AUTH_TOKEN`: eyJ... (long token)

### 2. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy and save the key (starts with `sk-`)

### 3. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: Market Oracle - AI trading insights"

# Create main branch
git branch -M main

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/oracle.git

# Push to GitHub
git push -u origin main
```

### 4. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. Click **"Add New..."** → **"Project"**
3. **Import** your GitHub repository
4. **Configure** your project:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: **./** (leave default)
5. **Add Environment Variables:**
   
   Click "Environment Variables" and add:
   
   ```
   DATABASE_URL = libsql://your-database.turso.io
   DATABASE_AUTH_TOKEN = eyJhbGc...
   OPENAI_API_KEY = sk-proj-...
   OPENAI_MODEL = gpt-4o-mini
   ```
   
6. Click **"Deploy"**
7. Wait 2-3 minutes for deployment
8. Visit your live site! 🎉

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Add environment variables
vercel env add DATABASE_URL production
# Paste your Turso URL when prompted

vercel env add DATABASE_AUTH_TOKEN production
# Paste your Turso token when prompted

vercel env add OPENAI_API_KEY production
# Paste your OpenAI key when prompted

vercel env add OPENAI_MODEL production
# Enter: gpt-4o-mini

# Deploy to production
vercel --prod
```

### 5. Verify Deployment

1. **Visit your site**: `https://your-project.vercel.app`
2. **Test the homepage**: Should see beautiful landing page
3. **Visit /oracle**: Should see Oracle page
4. **Click "Run Oracle Now"**: Should trigger analysis
5. **Check results**: Should see trade ideas displayed

### 6. Set Up Automatic Runs (Optional)

To run the oracle automatically at specific times:

1. **Edit vercel.json** and add:

```json
{
  "crons": [{
    "path": "/api/run-oracle",
    "schedule": "0 8,20 * * *"
  }]
}
```

2. **Commit and push:**

```bash
git add vercel.json
git commit -m "feat: add scheduled oracle runs"
git push
```

3. **Vercel will auto-deploy** with cron jobs enabled

This runs the oracle at:
- 8:00 AM UTC (morning analysis)
- 8:00 PM UTC (evening analysis)

## Environment Variables Reference

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `DATABASE_URL` | `libsql://oracle-db.turso.io` | `turso db show oracle-db --url` |
| `DATABASE_AUTH_TOKEN` | `eyJhbGc...` | `turso db tokens create oracle-db` |
| `OPENAI_API_KEY` | `sk-proj-...` | https://platform.openai.com/api-keys |
| `OPENAI_MODEL` | `gpt-4o-mini` | Choose from OpenAI models |

## Troubleshooting

### Issue: Build Failed

**Check:**
1. All environment variables are set correctly
2. No syntax errors in code
3. Dependencies are installed properly

**Fix:**
```bash
# Test build locally
npm run build

# If successful, push changes
git add .
git commit -m "fix: resolve build issues"
git push
```

### Issue: Database Connection Error

**Error Message:** `DATABASE_URL is not set`

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `DATABASE_URL` and `DATABASE_AUTH_TOKEN` are set
3. Redeploy from Deployments tab

### Issue: OpenAI API Error

**Error Message:** `OPENAI_API_KEY is not set` or `Invalid API key`

**Fix:**
1. Check your OpenAI API key is valid
2. Ensure you have credits in your OpenAI account
3. Verify environment variable in Vercel dashboard
4. Redeploy

### Issue: Oracle Returns No Results

**Check:**
1. Database schema is initialized: `turso db shell oracle-db < oracle-app/db/schema.sql`
2. API endpoint is accessible: Visit `https://your-app.vercel.app/api/health`
3. Check Vercel function logs for errors

## Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to Project Settings → Domains
   - Click "Add"
   - Enter your domain (e.g., `oracle.yourdomain.com`)
   - Follow DNS configuration instructions

2. **Update DNS:**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Wait for propagation (5-30 minutes)

3. **SSL Certificate:**
   - Vercel automatically provisions SSL
   - Your site will be available via HTTPS

## Monitoring

### View Logs

```bash
# Real-time logs via CLI
vercel logs your-deployment-url --follow

# Or view in Vercel Dashboard:
# Project → Deployments → Click deployment → Functions → View logs
```

### Check Analytics

- **Vercel Dashboard**: Project → Analytics
- Monitor: Page views, API calls, performance

### Set Up Alerts

- **Vercel Dashboard**: Project → Settings → Notifications
- Get notified for: Failed deployments, errors, downtime

## Updating Your Deployment

### For Code Changes:

```bash
# Make your changes
# Commit and push to GitHub
git add .
git commit -m "feat: your changes"
git push

# Vercel auto-deploys on push to main!
```

### For Environment Variables:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Update the variable
3. Redeploy from Deployments tab (Vercel may prompt you)

## Cost Estimation

### Free Tier Includes:
- **Vercel**: 100GB bandwidth, unlimited deployments
- **Turso**: 9GB storage, 1 billion row reads/month
- **OpenAI**: Pay per use (~$0.15 per 1M input tokens for gpt-4o-mini)

### Estimated Monthly Cost:
- **Small usage** (10-20 oracle runs/day): ~$5-10/month (mainly OpenAI)
- **Medium usage** (50+ runs/day): ~$15-30/month
- **Vercel & Turso**: Usually free on hobby plan

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Turso Docs**: https://docs.turso.tech
- **OpenAI Docs**: https://platform.openai.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**🎉 You're all set! Your Market Oracle is now live and helping traders make better decisions.**

Remember to:
- ✅ Monitor your OpenAI usage and costs
- ✅ Keep your API keys secure
- ✅ Review oracle outputs regularly
- ✅ Update dependencies periodically

Happy trading! 📈
