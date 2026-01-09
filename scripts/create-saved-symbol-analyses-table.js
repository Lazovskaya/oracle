import { config } from 'dotenv';
import { createClient } from '@libsql/client';

// Load environment variables from .env.local
config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function createTable() {
  try {
    console.log('Creating saved_symbol_analyses table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS saved_symbol_analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        symbol TEXT NOT NULL,
        current_price REAL,
        entry TEXT,
        stop_loss TEXT,
        targets TEXT,
        market_context TEXT,
        confidence TEXT,
        timeframe TEXT,
        full_analysis TEXT,
        saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Table created successfully');
    
    // Create index for faster queries
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_saved_analyses_user_email 
      ON saved_symbol_analyses(user_email)
    `);
    
    console.log('✅ Index created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createTable();
