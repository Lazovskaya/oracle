# ⚡ Quick Start - Market Oracle

Get your Market Oracle running in under 5 minutes!

## 🏃‍♂️ Super Quick Setup

### 1. Fill in .env.local file (it's already created!)

You need 3 things:

1. **Turso Database** (Free, 2 minutes):
   ```bash
   # Install Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Or on Windows with PowerShell:
   irm https://get.tur.so/install.ps1 | iex
   
   # Create database
   turso db create oracle-db
   turso db show oracle-db --url          # Copy this
   turso db tokens create oracle-db       # Copy this
   
   # Initialize schema
   turso db shell oracle-db < oracle-app/db/schema.sql
   ```

2. **OpenAI API Key** (1 minute):
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

3. **Update .env.local**:
   ```env
   DATABASE_URL=libsql://your-db.turso.io
   DATABASE_AUTH_TOKEN=your_turso_token_here
   OPENAI_API_KEY=sk-your-key-here
   OPENAI_MODEL=gpt-4o-mini
   ```

### 2. Run Locally

```bash
npm install
npm run dev
```

Open: http://localhost:3000

### 3. Deploy to Vercel

```bash
# Option A: Via GitHub (Recommended)
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/oracle.git
git push -u origin main

# Then go to vercel.com → Import Project → Add environment variables

# Option B: Via Vercel CLI
npm i -g vercel
vercel
# Follow prompts to add environment variables
```

## 📖 Full Documentation

- **[README.md](README.md)** - Complete feature overview and tech stack
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Detailed deployment guide with troubleshooting

## 🎯 What You Get

✅ Beautiful AI-powered trading insights dashboard
✅ Swing trading ideas with entry/exit points  
✅ Real-time market analysis
✅ Dark mode support
✅ Mobile responsive design
✅ Deployed to Vercel in minutes

## 🆘 Need Help?

**Database not connecting?**
- Make sure DATABASE_URL starts with `libsql://`
- Check DATABASE_AUTH_TOKEN is complete (no spaces)

**OpenAI errors?**
- Verify your API key is active
- Check you have credits in your OpenAI account
- Try changing OPENAI_MODEL to `gpt-3.5-turbo` if cheaper

**Build fails on Vercel?**
- Ensure all 4 environment variables are set in Vercel dashboard
- Check Vercel logs for specific errors
- Test build locally first: `npm run build`

## 🚀 Quick Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Deploy script
.\deploy.ps1         # Quick push to GitHub & auto-deploy

# Database commands
turso db shell oracle-db                    # Access database
turso db shell oracle-db "SELECT * FROM oracle_runs"  # View runs
```

## 💡 Pro Tips

1. **Test locally first** before deploying to Vercel
2. **Monitor your OpenAI costs** - gpt-4o-mini is cost-effective (~$0.15/1M tokens)
3. **Set up cron jobs** in vercel.json for automatic daily runs
4. **Use Turso CLI** to inspect database: `turso db shell oracle-db`
5. **Check Vercel logs** if something goes wrong

---

**You're ready to go! 🎉**

Questions? Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting.
