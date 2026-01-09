/**
 * Migration script to create idea_performance table
 * Run with: node scripts/migrate-idea-performance-table.js
 */

const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

async function migrate() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  console.log("Creating idea_performance table...");

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS idea_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        
        -- Reference to saved idea
        saved_idea_id INTEGER,
        saved_analysis_id INTEGER,
        
        -- Idea details
        user_email TEXT NOT NULL,
        symbol TEXT NOT NULL,
        idea_type TEXT NOT NULL,
        
        -- Entry information
        entry_price REAL,
        entry_date DATETIME,
        position_size REAL,
        position_value REAL,
        
        -- Exit information
        exit_price REAL,
        exit_date DATETIME,
        exit_reason TEXT,
        
        -- Performance metrics
        status TEXT DEFAULT 'active',
        profit_loss REAL,
        profit_loss_percentage REAL,
        risk_reward_ratio REAL,
        
        -- Target/Stop tracking
        original_target REAL,
        original_stop_loss REAL,
        targets_hit TEXT,
        highest_price REAL,
        lowest_price REAL,
        
        -- Time metrics
        duration_days INTEGER,
        expected_timeframe TEXT,
        
        -- User notes
        notes TEXT,
        lessons_learned TEXT,
        
        -- Metadata
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        closed_at DATETIME
      )
    `);

    console.log("✅ Table created successfully");

    // Create indexes
    console.log("Creating indexes...");
    
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_performance_user_email 
      ON idea_performance(user_email)
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_performance_symbol 
      ON idea_performance(symbol)
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_performance_status 
      ON idea_performance(status)
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_performance_entry_date 
      ON idea_performance(entry_date)
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_performance_closed_at 
      ON idea_performance(closed_at)
    `);

    console.log("✅ Indexes created successfully");
    console.log("✅ Migration completed!");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
