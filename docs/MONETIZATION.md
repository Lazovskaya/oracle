# 💰 Monetization Guide

## Overview

Market Oracle uses a **freemium subscription model** targeting international traders and investors who need professional decision support without hype.

## 🎯 What We Sell

### ✅ We Sell:
- **Decision Engine** - AI-powered market analysis
- **Risk Map** - Clear entry/stop/target levels  
- **Market Regime Detector** - Elliott Wave structure analysis

### ❌ We Don't Sell:
- "Signals" (implies guaranteed outcomes)
- "100% accuracy" (unrealistic promises)
- Get-rich-quick schemes

## 💳 Pricing Tiers

### Free Tier
- Market phase analysis
- Wave structure overview
- Trade idea summaries
- **Hidden:** Entry/stop/target levels

### Basic - €9/month
- Everything in Free
- **Full entry/stop/target levels**
- Risk management guidance
- Crypto & stocks ideas

### Pro - €29/month
- Everything in Basic
- Performance tracking
- Win rate statistics
- Historical idea archive
- Priority support

## 🔐 Why Premium?

**Free content:**
- Market education and context
- Analysis methodology
- General market regime

**Premium content:**
- Precise execution levels
- Actionable risk parameters
- Performance accountability

Think of it like a portfolio manager's letter: **headlines are public, detailed positions are for subscribers.**

## 🛠️ Technical Setup

### 1. Database Migration

```bash
node scripts/setup-auth-tables.js
```

Creates:
- `users` - User accounts and subscription status
- `magic_links` - Passwordless authentication tokens
- `idea_performance` - Track trade outcomes

### 2. Stripe Configuration

1. Create Stripe account
2. Create products:
   - **Basic**: €9/month recurring
   - **Pro**: €29/month recurring
3. Copy Price IDs to `.env.local`:
   ```
   STRIPE_BASIC_PRICE_ID=price_xxx
   STRIPE_PRO_PRICE_ID=price_xxx
   ```
4. Set up webhook endpoint: `/api/stripe/webhook`
5. Copy webhook secret to `.env.local`

### 3. Email Provider (Optional)

For production, integrate with:
- **Resend** (recommended)
- SendGrid
- Postmark

Update `/api/auth/send-magic-link/route.ts` with email sending logic.

## 🚀 User Flow

### Registration
1. User enters email at `/login`
2. System sends magic link (15min expiry)
3. User clicks link → authenticated
4. Default tier: **Free**

### Upgrade
1. User visits `/pricing`
2. Clicks "Subscribe Now" on Basic/Pro
3. Redirects to Stripe Checkout
4. After payment → tier updated via webhook
5. User sees full entry/stop/target levels

### Subscription Management
- Users manage billing via Stripe Customer Portal
- Cancellations: graceful downgrade at period end
- Failed payments: auto-downgrade after retry period

## 📊 Key Metrics to Track

### Performance Statistics (Pro tier)
- Total ideas generated: X
- Ideas that hit target: Y (Z%)
- Ideas that hit stop: W (V%)
- Average R:R ratio: N:1

### Business Metrics
- Free → Basic conversion rate
- Basic → Pro upgrade rate
- Churn rate by tier
- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (LTV)

## 🌍 International Considerations

### Language Support
Already implemented: EN, RU, ES, ZH

### Payment Methods
Stripe supports:
- Credit/debit cards (global)
- SEPA Direct Debit (EU)
- iDEAL (Netherlands)
- Apple Pay / Google Pay

### Compliance
- **GDPR** (EU): User data export/deletion
- **PCI DSS**: Handled by Stripe
- **VAT/GST**: Stripe Tax (enable in dashboard)

## 📈 Growth Strategy

### Content Marketing
- Blog posts explaining Elliott Wave theory
- YouTube: Market analysis walkthroughs
- Twitter: Daily market regime updates

### Positioning
- **Not:** "Get rich quick signals"
- **Yes:** "Professional decision support for traders"

### Messaging
- "Like having a portfolio manager's analysis"
- "Clear risk management, no hype"
- "Transparent performance tracking"

## 🔒 Security

- Magic link auth (no passwords to leak)
- HttpOnly cookies for sessions
- Stripe handles all payment data
- Database access tokens (Turso)

## 📝 Legal Requirements

### Terms of Service
Include:
- No financial advice disclaimer
- Past performance ≠ future results
- User assumes all trading risk
- Service is for educational/informational use

### Privacy Policy
Comply with GDPR/CCPA:
- What data you collect (email, subscription status)
- How you use it (authentication, billing)
- Third parties (Stripe, OpenAI)
- User rights (export, delete)

## 🎨 UI/UX Best Practices

### Free Users
- Show analysis clearly
- Display "🔒 Premium" badges on locked content
- Subtle "Upgrade" CTAs (not annoying)

### Premium Users
- Remove all upgrade prompts
- Show performance statistics prominently
- Personalized dashboard

## 🚨 Risk Management

### For Users (Built-in)
- Clear stop-loss levels
- Position sizing guidance
- Risk:reward ratios
- Confidence levels per idea

### For Business
- Disclaimers on every page
- No guaranteed returns language
- Transparent methodology
- Track and display win rates

## 📞 Support

### Free Users
- FAQ / documentation
- Email support (48h response)

### Premium Users
- Priority email support (24h response)
- Feature requests prioritized
- Early access to new features

## 🎯 Success Metrics

Target after 6 months:
- 1000 free users
- 100 Basic subscribers (10% conversion)
- 20 Pro subscribers (2% of total)
- MRR: €1,480
- Churn: <5% monthly

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Authentication
- ✅ Stripe integration
- ✅ Free/Premium tiers
- ✅ Performance tracking schema

### Phase 2
- Stripe Customer Portal integration
- Email notifications (new oracle run)
- Performance dashboard (Pro)
- Historical archive

### Phase 3
- Mobile app (React Native)
- Telegram bot notifications
- Custom watchlists
- API access (Pro)

---

**Remember:** We're selling **clarity and structure**, not dreams. Professional traders and investors will pay for reliable decision support with transparent risk management.
