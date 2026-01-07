/**
 * Run migrations against Turso (libsql). Expects DATABASE_URL and (optionally) DATABASE_AUTH_TOKEN.
 * Usage:
 *   DATABASE_URL="https://<ns>.libsql.sh" DATABASE_AUTH_TOKEN="<token>" node scripts/migrate-schema.js
 *
 * Note: this is plain JS (no TypeScript annotations) so it runs with node directly.
 */
(async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("Set DATABASE_URL to your Turso libsql URL before running this script.");
    }

    const { createClient } = require("@libsql/client");
    const client = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });

    // Inspect existing table columns
    const info = await client.execute({ sql: "PRAGMA table_info('oracle_runs')" });
    const rows = info.rows || [];
    const cols = rows.map((r) => String(r.name || r.NAME || "")).filter(Boolean);

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
      await client.execute({ sql: s });
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err && err.message ? err.message : err);
    process.exit(1);
  }
})();