/**
 * Initialize market_assets table
 * Run this once to create the new market data layer
 * Usage:
 *   node scripts/init-market-assets.js
 */
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const dbModule = require("../lib/db");
    const db = dbModule.db ?? dbModule;
    
    console.log("Reading market_assets schema...");
    const schemaPath = path.join(__dirname, '../oracle-app/db/market_assets_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (const stmt of statements) {
      try {
        await db.execute({ sql: stmt });
        const firstLine = stmt.split('\n')[0];
        console.log(`✓ ${firstLine.substring(0, 60)}...`);
      } catch (err) {
        // Ignore "table already exists" errors
        if (err.message && err.message.includes('already exists')) {
          console.log(`  (already exists, skipping)`);
        } else {
          throw err;
        }
      }
    }
    
    console.log("\n✅ Market assets schema initialized successfully!");
    console.log("\nNext steps:");
    console.log("1. Set FINNHUB_API_KEY or POLYGON_API_KEY in your .env");
    console.log("2. Run the market data update: POST /api/update-market-data");
    console.log("3. Cron will automatically update prices every 30 minutes");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Initialization failed:", err);
    process.exit(1);
  }
})();
