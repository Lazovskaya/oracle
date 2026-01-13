# 🔐 Authentication & Monetization Setup

## Quick Start

### 1. Install Dependencies
Already done (Stripe installed)

### 2. Setup Database Tables
```bash
node scripts/setup-auth-tables.js
```

✅ **Done!** Tables created:
- `users` - Authentication and subscription management
- `magic_links` - Passwordless login tokens  
- `idea_performance` - Trade outcome tracking

### 3. Configure Stripe

#### A. Create Stripe Account
1. Go to https://stripe.com and create an account
2. Use **Test Mode** for development

#### B. Create Products & Prices
1. Go to Stripe Dashboard → Products
2. Create two subscription products:

**Product 1: Basic**
- Name: Basic Plan
- Price: €9.00 EUR / month
- Copy the **Price ID** (starts with `price_...`)

**Product 2: Pro**
- Name: Pro Plan  
- Price: €29.00 EUR / month
- Copy the **Price ID** (starts with `price_...`)

#### C. Get API Keys
1. Stripe Dashboard → Developers → API Keys
2. Copy:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

#### D. Setup Webhook
1. Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `http://localhost:3000/api/stripe/webhook` (for testing)
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_...`)

#### E. Add to `.env.local`
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Price IDs
STRIPE_BASIC_PRICE_ID=price_basic_id_here
STRIPE_PRO_PRICE_ID=price_pro_id_here

# App URL
NEXT_PUBLIC_URL=http://localhost:3000
```

### 4. Test Locally

#### A. Start Dev Server
```bash
npm run dev
```

#### B. Test Stripe Webhooks (Optional)
Install Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook signing secret for local testing.

#### C. Test Authentication Flow
1. Go to http://localhost:3000/login
2. Enter email
3. Check console for magic link (in development it's logged)
4. Click link to authenticate
5. You'll be redirected to `/oracle` as **free tier**

#### D. Test Pricing Page
1. Go to http://localhost:3000/pricing
2. View the three tiers (Free, Basic, Pro)
3. See the "Why Premium" explanation

### 5. Email Integration (Production)

For production, integrate an email service:

#### Option A: Resend (Recommended)
```bash
npm install resend
```

Update `/app/api/auth/send-magic-link/route.ts`:
```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Market Oracle <oracle@yourdomain.com>',
  to: email,
  subject: 'Your Market Oracle Login Link',
  html: `<p>Click to login: <a href="${magicLink}">Access Market Oracle</a></p>`
});
```

## Usage

### User Flow

#### Free User
1. Login at `/login`
2. See oracle analysis at `/oracle`
3. **Cannot see:** Entry/stop/target levels (locked with 🔒)
4. Can upgrade from pricing page

#### Premium User (Basic/Pro)
1. Login at `/login`
2. Visit `/pricing` and click "Subscribe Now"
3. Complete Stripe checkout
4. Webhook updates subscription tier
5. Return to `/oracle` → now sees **full entry/stop/target levels**

### Testing Subscriptions

Use Stripe test card numbers:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002

Any future expiry date and CVC will work.

## Architecture

### Authentication
- **Magic links** (passwordless)
- 15-minute expiry
- Email-based identity
- HttpOnly cookie sessions

### Authorization
- Free: See analysis, no execution levels
- Basic (€9): Full execution levels
- Pro (€29): + Performance tracking

### Stripe Integration
- Checkout sessions for subscriptions
- Webhooks for status updates
- Customer portal for management

### Database Schema
```sql
users:
  - email (unique)
  - subscription_tier (free/premium)
  - subscription_status (active/canceled/expired)
  - stripe_customer_id
  - subscription_end_date

magic_links:
  - email
  - token (unique)
  - expires_at
  - used (boolean)

idea_performance:
  - oracle_run_id
  - symbol
  - entry_price, stop_price, target_prices
  - category (crypto/stocks)
  - status (pending/hit_target/hit_stop)
```

## Deployment

### Environment Variables (Production)
```env
DATABASE_URL=libsql://your-turso-db.turso.io
DATABASE_AUTH_TOKEN=your_token
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-5.2

STRIPE_SECRET_KEY=sk_live_...  # Use live keys!
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_BASIC_PRICE_ID=price_...  # Live price IDs
STRIPE_PRO_PRICE_ID=price_...

NEXT_PUBLIC_URL=https://finforesee.com

RESEND_API_KEY=re_...  # Email service
```

### Webhook URL
Update Stripe webhook to production URL:
```
https://yourdomain.com/api/stripe/webhook
```

## Troubleshooting

### "Not authenticated" when visiting /oracle
- Clear cookies
- Login again at `/login`
- Check that user exists in database

### Magic link not working
- Check token hasn't expired (15 min)
- Check token hasn't been used already
- Verify DATABASE_URL is correct

### Subscription not activating
- Check Stripe webhook is configured
- View webhook events in Stripe Dashboard
- Check server logs for webhook errors
- Verify STRIPE_WEBHOOK_SECRET is correct

### Entry/stop/target still locked after payment
- Check user's `subscription_tier` in database
- Should be 'premium' after successful checkout
- Check webhook received `checkout.session.completed`

## Security Checklist

✅ Magic links expire after 15 minutes  
✅ Tokens marked as "used" after login  
✅ Session cookies are HttpOnly  
✅ Stripe handles all payment data (PCI compliant)  
✅ Database tokens secured  
✅ Webhook signatures verified  

## Next Steps

1. ✅ **Setup complete** - Tables created, routes ready
2. 🔲 **Configure Stripe** - Add keys to .env.local
3. 🔲 **Test locally** - Login flow and pricing page
4. 🔲 **Add email service** - Resend for production
5. 🔲 **Deploy** - Update webhook URL
6. 🔲 **Create prices** - Live Stripe products
7. 🔲 **Go live!** - Switch to live Stripe keys

## Support

See [MONETIZATION.md](./MONETIZATION.md) for:
- Business strategy
- Pricing rationale
- Growth tactics
- Legal requirements
- Success metrics

---

**Remember:** We're selling **Decision Engine**, **Risk Map**, and **Market Regime Detector** — not "signals" or "100% accuracy". Professional positioning for serious traders.
