# Stripe Webhook Setup Guide

## 🚨 Why Your Webhook Isn't Triggered

Your webhook isn't working because:
1. **Not configured in Stripe Dashboard** - Stripe doesn't know where to send events
2. **Missing webhook secret** - Can't verify webhook signatures
3. **Local testing** - Stripe can't reach `localhost`

---

## 📋 Setup for Production (Live Site)

### Step 1: Go to Stripe Dashboard
👉 https://dashboard.stripe.com/webhooks

### Step 2: Click "Add endpoint"

### Step 3: Enter your webhook URL
```
https://finforesee.com/api/stripe/webhook
```

### Step 4: Select events to listen to
**Required events:**
- ✅ `checkout.session.completed` - When payment succeeds
- ✅ `customer.subscription.updated` - When subscription changes
- ✅ `customer.subscription.deleted` - When subscription cancels
- ✅ `invoice.payment_failed` - When payment fails

Or select "Select all subscription events"

### Step 5: Copy the signing secret
After creating the endpoint, you'll see:
```
Signing secret: whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Step 6: Add to environment variables
In Vercel/production environment:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Step 7: Deploy
After adding the secret, redeploy your app so it picks up the new environment variable.

---

## 🧪 Setup for Local Testing

### Option 1: Stripe CLI (Recommended)

#### Install Stripe CLI
**Windows:**
```powershell
scoop install stripe
```
Or download from: https://github.com/stripe/stripe-cli/releases

#### Login to Stripe
```bash
stripe login
```

#### Forward webhooks to localhost
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### Add to .env.local
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### Test a payment
In another terminal:
```bash
stripe trigger checkout.session.completed
```

---

### Option 2: Manual Database Update (Quick Fix)

If you just need to test without webhooks, manually update the database:

```bash
node scripts/upgrade-user.js
```

---

## 🔍 How to Check if Webhook is Working

### 1. Check Stripe Dashboard
👉 https://dashboard.stripe.com/webhooks
- Click on your webhook endpoint
- See "Recent deliveries" section
- Should show successful deliveries with 200 status

### 2. Check Application Logs
In production logs, you should see:
```
✅ Subscription activated for user@email.com - Tier: premium, Until: 2026-02-13...
```

### 3. Check Database
```bash
node scripts/check-user.js
```

Should show:
```
Subscription Tier: premium
Subscription Status: active
Stripe Subscription ID: sub_xxxxx
```

---

## ⚠️ Common Issues

### Issue 1: Webhook returns 400
**Problem:** Signature verification failed
**Solution:** Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

### Issue 2: Webhook returns 500
**Problem:** Database error or code issue
**Solution:** Check application logs for error details

### Issue 3: No webhook calls at all
**Problem:** Webhook URL not configured in Stripe
**Solution:** Add webhook endpoint in Stripe Dashboard

### Issue 4: Test mode vs Live mode
**Problem:** Using live keys but webhook configured for test mode (or vice versa)
**Solution:** Make sure webhook and API keys match (both test or both live)

---

## 🧪 Testing Checklist

After webhook is configured:

- [ ] Create test subscription in Stripe
- [ ] Check webhook receives `checkout.session.completed` event
- [ ] Verify user upgraded in database (`node scripts/check-user.js`)
- [ ] Cancel subscription in Stripe
- [ ] Check webhook receives `customer.subscription.deleted` event
- [ ] Verify user downgraded to free in database

---

## 📊 Current State

Based on check:
```
Email: wlazovskaya1@gmail.com
Subscription Tier: free ❌
Stripe Customer ID: null ❌
Stripe Subscription ID: null ❌
```

**Problem:** Payment went through Stripe but webhook never updated your database.

**Solution:** 
1. Set up webhook as described above
2. For now, manually upgrade: `node scripts/upgrade-user.js`

---

## 🚀 Quick Fix Right Now

To upgrade your test user immediately:

```bash
node scripts/upgrade-user.js
```

This will:
- Set subscription_tier to "premium"
- Set subscription_status to "active"  
- Set subscription_end_date to 30 days from now
- No webhook needed

---

## 📝 Webhook URL by Environment

| Environment | Webhook URL |
|-------------|-------------|
| Production | `https://finforesee.com/api/stripe/webhook` |
| Local (Stripe CLI) | `http://localhost:3000/api/stripe/webhook` |

**Important:** 
- Production webhooks: Configure in Stripe Dashboard
- Local testing: Use Stripe CLI `stripe listen --forward-to`
