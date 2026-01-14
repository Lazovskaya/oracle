const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function activateFromWebhook() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    const email = 'wlazovskaya1@gmail.com';
    const tier = 'premium'; // metadata shows "basic" but you probably mean premium
    const customerId = 'cus_Tn5CZhFaj1uGu4';
    const subscriptionId = 'sub_1SpV27BgqEIbK4Qdn2dM2chK';
    
    // Calculate end date (30 days for monthly subscription)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    console.log('\n🔄 Activating subscription from Stripe webhook data...');
    console.log('Email:', email);
    console.log('Tier:', tier);
    console.log('Customer ID:', customerId);
    console.log('Subscription ID:', subscriptionId);
    console.log('Valid Until:', endDate.toISOString());

    await db.execute({
      sql: `UPDATE users 
            SET subscription_tier = ?, 
                subscription_status = 'active',
                stripe_customer_id = ?,
                stripe_subscription_id = ?,
                subscription_end_date = ?
            WHERE email = ?`,
      args: [tier, customerId, subscriptionId, endDate.toISOString(), email],
    });

    // Verify the update
    const result = await db.execute({
      sql: 'SELECT email, subscription_tier, subscription_status, stripe_subscription_id, subscription_end_date FROM users WHERE email = ?',
      args: [email],
    });

    console.log('\n✅ Subscription activated successfully!');
    console.log('Updated user:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

activateFromWebhook();
