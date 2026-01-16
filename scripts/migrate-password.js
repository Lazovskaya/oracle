const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    console.log('Adding password authentication fields...');
    
    try {
      await db.execute({
        sql: 'ALTER TABLE users ADD COLUMN password_hash TEXT'
      });
      console.log(' Added password_hash column');
    } catch (e) {
      if (e.message && e.message.includes('duplicate')) {
        console.log(' password_hash already exists');
      } else throw e;
    }

    try {
      await db.execute({
        sql: 'ALTER TABLE users ADD COLUMN session_expires_at DATETIME'
      });
      console.log(' Added session_expires_at column');
    } catch (e) {
      if (e.message && e.message.includes('duplicate')) {
        console.log(' session_expires_at already exists');
      } else throw e;
    }

    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    });
    console.log(' password_reset_tokens table created');

    console.log('\n Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error(' Error:', err);
    process.exit(1);
  }
}

migrate();
