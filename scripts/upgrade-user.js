const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function upgradeUser() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    const email = 'wlazovskaya1@gmail.com';
    const tier = 'premium'; // or 'pro'
    
    // Set subscription end date to 30 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    console.log('\n🔄 Upgrading user...');
    console.log('Email:', email);
    console.log('New Tier:', tier);
    console.log('Valid Until:', endDate.toISOString());

    await db.execute({
      sql: `UPDATE users 
            SET subscription_tier = ?, 
                subscription_status = 'active',
                subscription_end_date = ?
            WHERE email = ?`,
      args: [tier, endDate.toISOString(), email],
    });

    // Verify the update
    const result = await db.execute({
      sql: 'SELECT subscription_tier, subscription_status, subscription_end_date FROM users WHERE email = ?',
      args: [email],
    });

    console.log('\n✅ User upgraded successfully!');
    console.log('New subscription details:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

upgradeUser();
