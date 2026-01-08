# New Features Setup Guide

## 1. Historical Performance Page (Promo)

A new `/promo` page has been created to showcase historical trading ideas and their outcomes.

### Features:
- Display of resolved trading ideas (hit target or stopped out)
- Win rate statistics
- Performance metrics for each idea
- CTA buttons to current ideas and pricing

### Setup:
No additional setup needed. Page will automatically display data from the `idea_performance` table.

To manually track ideas, insert into the database:
```sql
INSERT INTO idea_performance (
  oracle_run_id, symbol, entry_price, stop_price, 
  target_prices, category, status, outcome_date
) VALUES (
  1, 'BTC', 45000, 43000, 
  '48000, 50000', 'crypto', 'hit_target', '2026-01-01'
);
```

## 2. AI Model Tracking

The system now tracks which AI model generated each prediction.

### Database Changes:
- Added `model_used` column to `oracle_runs` table
- Stores model name (e.g., 'gpt-4o-mini', 'gpt-5.2')
- Automatically populated when predictions are generated

### Migration:
Already completed via `scripts/add-model-column.js`

### Viewing Model Info:
Model information is now stored with each oracle run and can be displayed in the UI if needed.

## 3. Google Authentication

### Setup Steps:

#### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: External
   - App name: Market Oracle
   - Support email: your-email@example.com
   - Authorized domains: your-domain.com

6. Create OAuth Client ID:
   - Application type: Web application
   - Name: Market Oracle Web
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://your-domain.com/api/auth/callback/google` (production)

7. Copy **Client ID** and **Client Secret**

#### Step 2: Update Environment Variables

Edit `.env.local`:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

For production (Vercel), add to environment variables:
```bash
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### Step 3: Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in `.env.local`

Or use PowerShell:
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

#### Step 4: Test Google Login

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000/login`
3. Click "Continue with Google"
4. Sign in with Google account
5. You'll be redirected to `/oracle` page

### How It Works:

1. User clicks "Continue with Google" on `/login` page
2. NextAuth redirects to Google OAuth
3. User authorizes the application
4. Google redirects back with authorization code
5. NextAuth exchanges code for user profile
6. System checks if user exists in database
7. If new user, creates account with 'free' tier
8. If existing user, logs them in
9. Session includes: email, subscription_tier, trading_style, asset_preference

### Features:

- **Seamless Integration**: Works alongside existing magic link authentication
- **Auto User Creation**: New Google users automatically get free accounts
- **Session Management**: User preferences loaded into session
- **Existing Users**: If user previously signed up via magic link with same email, they can now also use Google login

### Testing Checklist:

- [ ] Google login creates new user account
- [ ] Existing email users can login via Google
- [ ] Session includes subscription tier
- [ ] Account page shows correct user info
- [ ] Logout works correctly
- [ ] Magic link still works independently

### Production Deployment:

1. Add Google OAuth credentials to Vercel environment variables
2. Update authorized redirect URIs in Google Console
3. Set `NEXTAUTH_URL` to production domain
4. Deploy to Vercel

### Troubleshooting:

**Error: "Redirect URI mismatch"**
- Solution: Add exact callback URL to Google Console authorized URIs

**Error: "Invalid client"**
- Solution: Double-check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

**Error: "NEXTAUTH_SECRET is not set"**
- Solution: Generate and add NEXTAUTH_SECRET to environment variables

**Users can't see their subscription after Google login**
- Solution: Check that email matches existing user in database

## Navigation Updates

Added "Performance" button to oracle page header:
- Shows historical track record
- Links to `/promo` page
- Icon: 📊 bar chart

## Summary

All three features are now implemented:

✅ **Historical Performance Page** (`/promo`)
   - Displays resolved trading ideas
   - Shows win rate and statistics
   - Marketing/social proof page

✅ **Model Tracking** (`model_used` column)
   - Tracks which AI model generated predictions
   - Stored in database automatically
   - Can be displayed in UI

✅ **Google Authentication**
   - One-click Google sign-in
   - Auto-creates user accounts
   - Works alongside magic links
   - Session management integrated

Next steps:
1. Configure Google OAuth credentials
2. Update environment variables
3. Test Google login flow
4. Add historical performance data
5. Deploy to production
