const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkTable() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    console.log('Checking magic_links table structure...\n');
    
    const info = await db.execute({
      sql: "PRAGMA table_info('magic_links')",
    });

    if (info.rows.length === 0) {
      console.log('❌ magic_links table does NOT exist');
    } else {
      console.log('✅ magic_links table exists with columns:');
      info.rows.forEach(row => {
        console.log(`  ${row.cid}. ${row.name} - ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.dflt_value ? `DEFAULT ${row.dflt_value}` : ''}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkTable();
