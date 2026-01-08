const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function createSuperUser() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const superUserEmail = 'wlazovskaya@gmail.com'; // Your email

  console.log('👑 Creating super user with premium account...');

  try {
    // Check if user exists
    const existing = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [superUserEmail],
    });

    if (existing.rows.length > 0) {
      // Update existing user to premium
      await db.execute({
        sql: `UPDATE users 
              SET subscription_tier = 'premium', 
                  subscription_status = 'active',
                  subscription_end_date = datetime('now', '+1 year')
              WHERE email = ?`,
        args: [superUserEmail],
      });
      console.log('✅ Updated existing user to premium');
    } else {
      // Create new premium user
      await db.execute({
        sql: `INSERT INTO users (email, subscription_tier, subscription_status, subscription_end_date) 
              VALUES (?, 'premium', 'active', datetime('now', '+1 year'))`,
        args: [superUserEmail],
      });
      console.log('✅ Created new premium user');
    }

    console.log(`🎉 Super user created: ${superUserEmail}`);
    console.log('📊 Subscription: Premium (active for 1 year)');
  } catch (error) {
    console.error('❌ Error creating super user:', error);
    throw error;
  }
}

createSuperUser().catch(console.error);
