const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkUser() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: ['wlazovskaya1@gmail.com'],
    });

    console.log('\n📋 User Database Record:');
    console.log('========================');
    if (result.rows.length === 0) {
      console.log('❌ User not found in database');
    } else {
      const user = result.rows[0];
      console.log('Email:', user.email);
      console.log('Subscription Tier:', user.subscription_tier);
      console.log('Subscription Status:', user.subscription_status);
      console.log('Stripe Customer ID:', user.stripe_customer_id);
      console.log('Stripe Subscription ID:', user.stripe_subscription_id);
      console.log('Subscription End Date:', user.subscription_end_date);
      console.log('Created At:', user.created_at);
      console.log('Is Admin:', user.is_admin);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

checkUser();
