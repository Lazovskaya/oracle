// Migration script to add result_fr column to oracle_runs table
import { createClient } from "@libsql/client";
import "dotenv/config";

async function addFrenchColumn() {
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  }

  const db = createClient({ url: dbUrl, authToken });

  try {
    console.log("Adding result_fr column to oracle_runs table...");
    
    // Add the column if it doesn't exist
    await db.execute({
      sql: `ALTER TABLE oracle_runs ADD COLUMN result_fr TEXT`,
      args: [],
    });

    console.log("✅ Successfully added result_fr column");
    console.log("\nNext oracle runs will include French translations");
  } catch (error) {
    // Check if column already exists
    if (error.message && error.message.includes("duplicate column name")) {
      console.log("✅ Column result_fr already exists");
    } else {
      console.error("❌ Migration failed:", error);
      throw error;
    }
  }
}

addFrenchColumn()
  .then(() => {
    console.log("\n🎉 Migration completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n💥 Migration failed:", err);
    process.exit(1);
  });
