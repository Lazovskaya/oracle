/**
 * Creates magic_links table if it doesn't exist
 * Usage:
 *   # local sqlite
 *   node scripts/migrate-auth-schema.js
 *
 *   # against Turso/libSQL (set env before running)
 *   DATABASE_URL="https://<...>" DATABASE_AUTH_TOKEN="<token>" node scripts/migrate-auth-schema.js
 */
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

(async () => {
  try {
    const db = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });

    console.log("Creating magic_links table if not exists...");

    await db.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS magic_links (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          used INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
    });

    console.log("✅ magic_links table ready");

    // Verify table exists
    const tables = await db.execute({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='magic_links'",
    });

    if (tables.rows.length > 0) {
      console.log("✅ Verified: magic_links table exists");
      
      // Show table structure
      const info = await db.execute({
        sql: "PRAGMA table_info('magic_links')",
      });
      
      console.log("\nTable structure:");
      info.rows.forEach(row => {
        console.log(`  - ${row.name}: ${row.type}`);
      });
    } else {
      console.log("❌ Warning: Could not verify table creation");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
})();
