const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkSubscriptionExpiry() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    const result = await db.execute({
      sql: `SELECT 
              email, 
              subscription_tier, 
              subscription_status,
              subscription_end_date,
              CASE 
                WHEN subscription_end_date IS NULL THEN 'No expiration set'
                WHEN datetime(subscription_end_date) > datetime('now') THEN 'Active ✅'
                ELSE 'Expired ❌'
              END as status_check
            FROM users 
            WHERE email = ?`,
      args: ['wlazovskaya1@gmail.com'],
    });

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }

    const user = result.rows[0];
    console.log('\n📅 Subscription Expiration Info');
    console.log('================================');
    console.log('Email:', user.email);
    console.log('Tier:', user.subscription_tier);
    console.log('Status:', user.subscription_status);
    console.log('Expires:', user.subscription_end_date || 'No expiration set');
    console.log('Current Status:', user.status_check);

    if (user.subscription_end_date) {
      const expiryDate = new Date(user.subscription_end_date);
      const now = new Date();
      const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0) {
        console.log(`⏰ Days remaining: ${daysRemaining} days`);
      } else {
        console.log(`⏰ Expired ${Math.abs(daysRemaining)} days ago`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

checkSubscriptionExpiry();
