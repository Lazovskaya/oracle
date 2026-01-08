const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function addMagicLinksColumns() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  console.log('🔧 Adding missing column to magic_links table...');

  try {
    await db.execute('ALTER TABLE magic_links ADD COLUMN used INTEGER DEFAULT 0');
    console.log('✅ Added column: used');
    console.log('🎉 Magic links table migration complete!');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  Column already exists, skipping');
    } else {
      console.error('❌ Error adding column:', error);
      throw error;
    }
  }
}

addMagicLinksColumns().catch(console.error);
