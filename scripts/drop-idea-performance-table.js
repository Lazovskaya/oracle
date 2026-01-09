const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

async function dropTable() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  console.log("Dropping idea_performance table...");
  
  try {
    await client.execute("DROP TABLE IF EXISTS idea_performance");
    console.log("✅ Table dropped successfully");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

dropTable();
