# 📡 Market Oracle - AI-Powered Trading Insights

Beautiful AI-powered swing trading recommendations for stocks and cryptocurrencies. Get high-quality market analysis and trade ideas powered by OpenAI's GPT models.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## ✨ Features

- 🤖 **AI-Powered Analysis** - Uses OpenAI GPT models for market insights
- 📊 **Swing Trading Ideas** - 2-6 week trade setups with entry/exit points
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode support
- 🚀 **Vercel Ready** - Optimized for serverless deployment
- 💾 **Turso Database** - Fast, distributed SQLite database
- 📱 **Mobile Responsive** - Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- Turso database ([create free account](https://turso.tech/))

### Local Development

1. **Clone and install dependencies:**
   ```bash
   cd oracle
   npm install
   ```

2. **Set up your environment variables:**
   
   Copy `.env.local` and fill in your credentials:
   ```bash
   # Get Turso credentials
   turso db create oracle-db
   turso db show oracle-db --url
   turso db tokens create oracle-db
   ```

   Update `.env.local`:
   ```env
   DATABASE_URL=libsql://your-database.turso.io
   DATABASE_AUTH_TOKEN=your_turso_token
   OPENAI_API_KEY=sk-your-openai-key
   OPENAI_MODEL=gpt-4o-mini
   ```

3. **Initialize the database:**
   ```bash
   # Connect to your Turso database
   turso db shell oracle-db < oracle-app/db/schema.sql
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📦 Deploy to Vercel

### Option 1: Deploy via CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Add environment variables:**
   ```bash
   vercel env add DATABASE_URL
   vercel env add DATABASE_AUTH_TOKEN
   vercel env add OPENAI_API_KEY
   vercel env add OPENAI_MODEL
   ```

4. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/oracle.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`
     - `DATABASE_AUTH_TOKEN`
     - `OPENAI_API_KEY`
     - `OPENAI_MODEL` (set to `gpt-4o-mini`)
   - Click "Deploy"

## 🗄️ Database Setup (Turso)

### Create Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create oracle-db

# Get connection details
turso db show oracle-db --url
turso db tokens create oracle-db

# Initialize schema
turso db shell oracle-db < oracle-app/db/schema.sql
```

### Schema

```sql
CREATE TABLE IF NOT EXISTS oracle_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_date TEXT,
  market_phase TEXT,
  result TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Usage

### Trigger Oracle Run

**Via UI:**
- Visit `/oracle` page
- Click "🔮 Run Oracle Now" button

**Via API:**
```bash
curl -X POST https://your-app.vercel.app/api/run-oracle
```

**Response:**
```json
{
  "ok": true,
  "model": "gpt-4o-mini",
  "inserted": { /* database info */ }
}
```

### View Results

Navigate to `/oracle` to see:
- Latest market phase analysis
- Wave structure insights
- Specific trade ideas with:
  - Entry points
  - Stop losses
  - Price targets
  - Risk notes
  - Confidence levels

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** Turso (libSQL)
- **AI:** OpenAI GPT-4o-mini
- **Deployment:** Vercel

## 📁 Project Structure

```
oracle/
├── app/
│   ├── api/
│   │   ├── health/         # Health check endpoint
│   │   └── run-oracle/     # Oracle execution endpoint
│   ├── oracle/             # Oracle results page
│   │   ├── page.tsx
│   │   └── RunButton.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx            # Landing page
├── lib/
│   ├── db.ts              # Database client
│   └── oraclePrompt.ts    # AI prompt builder
├── oracle-app/
│   └── db/
│       └── schema.sql      # Database schema
├── types/
│   └── oracle.ts           # TypeScript types
└── vercel.json             # Vercel configuration
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Turso database URL | ✅ |
| `DATABASE_AUTH_TOKEN` | Turso auth token | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `OPENAI_MODEL` | Model to use (default: gpt-4o-mini) | Optional |

### Scheduled Runs

To schedule automatic oracle runs, you can use:

**Vercel Cron Jobs:**
Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/run-oracle",
    "schedule": "0 8,20 * * *"
  }]
}
```

This runs at 08:00 and 20:00 UTC daily.

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `DATABASE_URL is not set`

**Solution:** Ensure `.env.local` exists with correct Turso credentials

### OpenAI API Error

**Error:** `OPENAI_API_KEY is not set`

**Solution:** Add your OpenAI API key to environment variables

### Build Errors on Vercel

**Solution:**
1. Check all environment variables are set in Vercel dashboard
2. Ensure Turso database is accessible
3. Check build logs for specific errors

## 📝 License

MIT License - feel free to use this project however you'd like!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review Turso and OpenAI docs

---

**Built with ❤️ using Next.js, OpenAI, and Turso**

Deploy now: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/oracle)
