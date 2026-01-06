/**
 * Adds missing columns to oracle_runs if they don't exist.
 * Usage:
 *   # local sqlite (uses lib/db.ts fallback)
 *   node scripts/migrate-schema.js
 *
 *   # against Turso/libSQL (set env before running)
 *   DATABASE_URL="https://<...>" DATABASE_AUTH_TOKEN="<token>" node scripts/migrate-schema.js
 */
(async () => {
  try {
    const dbModule = require("../lib/db");
    const db = dbModule.db ?? dbModule;
    // PRAGMA for sqlite; libsql will return empty rows for PRAGMA but we handle both.
    const info = await db.execute({ sql: "PRAGMA table_info('oracle_runs')" });
    const rows = info.rows ?? [];
    const cols = rows.map((r) => (r.name || r.NAME || r.column_name || "").toString());
    const stmts = [];

    if (!cols.includes("id")) {
      stmts.push(`
        CREATE TABLE IF NOT EXISTS oracle_runs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          run_date TEXT,
          market_phase TEXT,
          result TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      if (!cols.includes("run_date")) stmts.push("ALTER TABLE oracle_runs ADD COLUMN run_date TEXT;");
      if (!cols.includes("market_phase")) stmts.push("ALTER TABLE oracle_runs ADD COLUMN market_phase TEXT;");
      if (!cols.includes("result")) stmts.push("ALTER TABLE oracle_runs ADD COLUMN result TEXT;");
    }

    if (stmts.length === 0) {
      console.log("No schema changes required.");
      process.exit(0);
    }

    for (const s of stmts) {
      console.log("Applying:", s.trim().split("\n")[0]);
      await db.execute({ sql: s });
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();