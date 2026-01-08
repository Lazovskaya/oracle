const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function addSubscriptionColumns() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  console.log('🔧 Adding subscription columns to users table...');

  try {
    // Try to add columns one by one (SQLite doesn't support ADD COLUMN IF NOT EXISTS)
    const columnsToAdd = [
      { name: 'subscription_tier', sql: "ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'free'" },
      { name: 'subscription_status', sql: 'ALTER TABLE users ADD COLUMN subscription_status TEXT' },
      { name: 'stripe_customer_id', sql: 'ALTER TABLE users ADD COLUMN stripe_customer_id TEXT' },
      { name: 'subscription_end_date', sql: 'ALTER TABLE users ADD COLUMN subscription_end_date DATETIME' },
    ];

    for (const col of columnsToAdd) {
      try {
        await db.execute(col.sql);
        console.log(`✅ Added column: ${col.name}`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`ℹ️  Column ${col.name} already exists, skipping`);
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 Subscription columns migration complete!');
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    throw error;
  }
}

addSubscriptionColumns().catch(console.error);
