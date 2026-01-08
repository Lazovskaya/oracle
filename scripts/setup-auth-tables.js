const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function setupAuthTables() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  console.log('🔧 Setting up authentication and subscription tables...');

  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        subscription_tier TEXT DEFAULT 'free',
        subscription_status TEXT,
        stripe_customer_id TEXT,
        subscription_end_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create magic_links table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS magic_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Magic links table created');

    // Create idea_performance table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS idea_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        oracle_run_id INTEGER NOT NULL,
        symbol TEXT NOT NULL,
        entry_price REAL,
        stop_price REAL,
        target_prices TEXT,
        category TEXT,
        status TEXT DEFAULT 'pending',
        outcome_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (oracle_run_id) REFERENCES oracle_runs(id)
      )
    `);
    console.log('✅ Idea performance table created');

    console.log('🎉 All authentication tables set up successfully!');
  } catch (error) {
    console.error('❌ Error setting up tables:', error);
    throw error;
  }
}

setupAuthTables().catch(console.error);
