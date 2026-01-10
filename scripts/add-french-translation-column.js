// Migration script to add result_fr column to oracle_runs table
/**
 * Adds result_fr column to oracle_runs table if it doesn't exist.
 * Usage:
 *   node scripts/add-french-translation-column.js
 */

(async () => {
  try {
    const dbModule = require("../lib/db");
    const db = dbModule.db ?? dbModule;

    console.log("Adding result_fr column to oracle_runs table...");
    
    // Check if column already exists
    try {
      const info = await db.execute({ sql: "PRAGMA table_info('oracle_runs')" });
      const rows = info.rows ?? [];
      const cols = rows.map((r) => (r.name || r.NAME || r.column_name || "").toString());
      
      if (cols.includes("result_fr")) {
        console.log("✅ Column result_fr already exists");
        process.exit(0);
      }
    } catch (err) {
      // PRAGMA might not work on Turso, try ALTER anyway
      console.log("Note: Could not check existing columns, attempting ALTER...");
    }

    // Add the column
    await db.execute({
      sql: `ALTER TABLE oracle_runs ADD COLUMN result_fr TEXT`,
      args: [],
    });

    console.log("✅ Successfully added result_fr column");
    console.log("\nNext oracle runs will include French translations");
    console.log("\n🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    // Check if column already exists
    if (error.message && error.message.includes("duplicate column name")) {
      console.log("✅ Column result_fr already exists");
      console.log("\n🎉 Migration completed successfully!");
      process.exit(0);
    } else {
      console.error("❌ Migration failed:", error);
      console.error("\n💥 Migration failed:", error);
      process.exit(1);
    }
  }
})();
