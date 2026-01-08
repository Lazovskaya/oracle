const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function addTradingStyleColumn() {
  console.log('📊 Adding trading_style column to users table...');

  try {
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN trading_style TEXT DEFAULT 'balanced'
    `);

    console.log('✅ Column added successfully');
    console.log('🎯 Default style: balanced');
    console.log('🎉 Setup complete!');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ Column already exists');
    } else {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }
}

addTradingStyleColumn();
