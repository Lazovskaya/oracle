const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function fixTier() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    await db.execute({
      sql: `UPDATE users SET subscription_tier = 'premium' WHERE email = ?`,
      args: ['wlazovskaya1@gmail.com'],
    });

    const result = await db.execute({
      sql: 'SELECT email, subscription_tier, subscription_status FROM users WHERE email = ?',
      args: ['wlazovskaya1@gmail.com'],
    });

    console.log('✅ Updated to premium:', result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

fixTier();
