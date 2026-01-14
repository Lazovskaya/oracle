# Subscription Management - Upgrade/Downgrade Fix

## ❌ **Problem Found**

Your subscription system had a **critical billing issue**:

### Before the fix:
1. User with **Premium** ($9/mo) clicks "Subscribe to Pro" ($19/mo)
2. System creates **NEW Stripe subscription** for Pro
3. **Old Premium subscription stays active** ❌
4. **User gets charged TWICE** - $9 + $19 = $28/month! 💸

Same problem when downgrading Pro → Premium.

---

## ✅ **Solution Implemented**

### 1. Database Schema Update
Added `stripe_subscription_id` column to track active subscriptions:

```sql
ALTER TABLE users 
ADD COLUMN stripe_subscription_id TEXT;
```

### 2. Smart Checkout Logic
[app/api/stripe/create-checkout/route.ts](app/api/stripe/create-checkout/route.ts)

Before creating new subscription:
- ✅ Check if user has existing subscription
- ✅ Cancel old subscription automatically
- ✅ Clear old subscription ID
- ✅ Then create new subscription

```typescript
// Check existing subscription
const userData = await db.execute({
  sql: 'SELECT stripe_subscription_id FROM users WHERE email = ?',
  args: [userEmail],
});

// Cancel old subscription first
if (userData?.stripe_subscription_id) {
  await stripe.subscriptions.cancel(userData.stripe_subscription_id);
}
```

### 3. Enhanced Webhook Handler
[app/api/stripe/webhook/route.ts](app/api/stripe/webhook/route.ts)

Now handles:
- ✅ `checkout.session.completed` - Save subscription ID
- ✅ `customer.subscription.updated` - Track changes
- ✅ `customer.subscription.deleted` - Downgrade to free
- ✅ `invoice.payment_failed` - Payment issues

### 4. Migration Script
[scripts/add-subscription-id-column.js](scripts/add-subscription-id-column.js)

Run once to update existing database:
```bash
node scripts/add-subscription-id-column.js
```

---

## 🔄 **How It Works Now**

### Upgrade: Premium → Pro
1. User clicks "Subscribe to Pro" ($19/mo)
2. System finds existing Premium subscription
3. **Cancels Premium subscription immediately** ✅
4. Creates new Pro subscription
5. User only charged $19/mo ✅

### Downgrade: Pro → Premium  
1. User clicks "Subscribe to Premium" ($9/mo)
2. System finds existing Pro subscription
3. **Cancels Pro subscription immediately** ✅
4. Creates new Premium subscription
5. User only charged $9/mo ✅

### Result
✅ **Only ONE active subscription at a time**
✅ **No double billing**
✅ **Clean subscription switching**

---

## 📋 **Deployment Checklist**

Before deploying to production:

1. **Run migration script:**
   ```bash
   node scripts/add-subscription-id-column.js
   ```

2. **Test Stripe webhooks are configured:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Ensure webhook endpoint: `https://finforesee.com/api/stripe/webhook`
   - Required events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`

3. **Test upgrade/downgrade flow:**
   - Create test Premium subscription
   - Switch to Pro → Check only 1 subscription in Stripe
   - Switch back to Premium → Check only 1 subscription in Stripe

4. **Monitor logs for:**
   - `🔄 Canceling existing subscription...`
   - `✅ Old subscription canceled successfully`
   - `✅ Subscription activated for...`

---

## 🛡️ **Safety Features**

1. **Idempotent**: Can cancel already-canceled subscriptions without errors
2. **Logged**: All subscription changes logged with emojis for easy debugging
3. **Webhook-driven**: Stripe confirms all changes via webhooks
4. **Database-synced**: Local database always reflects Stripe state

---

## 🧪 **Testing Recommendations**

Use Stripe Test Mode:
```bash
# Test cards
4242 4242 4242 4242 - Success
4000 0000 0000 0341 - Decline
```

Test scenarios:
- ✅ New user → Premium
- ✅ Premium → Pro (upgrade)
- ✅ Pro → Premium (downgrade)  
- ✅ Cancel subscription
- ✅ Subscription expires naturally
- ✅ Payment fails

---

## 📊 **Database Changes**

### Old Schema:
```sql
users (
  stripe_customer_id TEXT
  -- Missing: stripe_subscription_id ❌
)
```

### New Schema:
```sql
users (
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT  -- ✅ Tracks active subscription
)
```

---

## 🚀 **Next Steps**

After deploying:

1. Monitor first few upgrades/downgrades closely
2. Check Stripe dashboard for canceled subscriptions
3. Verify no users have 2+ active subscriptions
4. Consider adding admin panel view for subscription debugging

---

**Commit:** `424240a` - "fix: prevent double billing - cancel old subscription when upgrading/downgrading"
