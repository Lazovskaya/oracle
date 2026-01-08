const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function createSavedIdeasTable() {
  console.log('📊 Creating saved_ideas table...');

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS saved_ideas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        oracle_run_id INTEGER NOT NULL,
        symbol TEXT NOT NULL,
        entry TEXT,
        stop TEXT,
        targets TEXT,
        rationale TEXT,
        confidence TEXT,
        bias TEXT,
        timeframe TEXT,
        wave_context TEXT,
        risk_note TEXT,
        saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_email) REFERENCES users(email),
        UNIQUE(user_email, oracle_run_id, symbol)
      )
    `);

    console.log('✅ Table created successfully');

    // Create index for faster queries
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_saved_ideas_user 
      ON saved_ideas(user_email)
    `);

    console.log('✅ Index created');
    console.log('🎉 Setup complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSavedIdeasTable();
