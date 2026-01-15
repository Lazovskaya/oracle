const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function addCreatedAtColumn() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    console.log('Adding created_at column to magic_links table...\n');
    
    // Add column without default (SQLite limitation with ALTER TABLE)
    await db.execute({
      sql: "ALTER TABLE magic_links ADD COLUMN created_at DATETIME",
    });

    console.log('✅ Column added successfully\n');
    
    // Update existing rows to have a created_at value
    await db.execute({
      sql: "UPDATE magic_links SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL",
    });
    
    console.log('✅ Updated existing rows\n');
    
    // Verify
    const info = await db.execute({
      sql: "PRAGMA table_info('magic_links')",
    });

    console.log('Updated table structure:');
    info.rows.forEach(row => {
      console.log(`  ${row.cid}. ${row.name} - ${row.type}`);
    });

    process.exit(0);
  } catch (err) {
    if (err.message && err.message.includes('duplicate column name')) {
      console.log('✅ Column already exists');
      process.exit(0);
    }
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

addCreatedAtColumn();
