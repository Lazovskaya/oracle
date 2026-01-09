import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function createTable() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS symbol_analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        symbol TEXT NOT NULL,
        analysis TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_email, symbol, created_at)
      )
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_symbol_analyses_user_date 
      ON symbol_analyses(user_email, created_at)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_symbol_analyses_symbol 
      ON symbol_analyses(symbol)
    `);

    console.log('✅ symbol_analyses table created successfully');
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  } finally {
    db.close();
  }
}

createTable();
