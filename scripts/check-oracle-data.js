const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

(async () => {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  
  const r = await db.execute({
    sql: "SELECT id, run_date, LENGTH(result) as len FROM oracle_runs ORDER BY id DESC LIMIT 5"
  });
  
  console.log("Last 5 oracle runs:");
  r.rows.forEach(row => {
    console.log("ID:", row.id, "Date:", row.run_date, "Length:", row.len);
  });
  
  const latest = await db.execute({
    sql: "SELECT result FROM oracle_runs ORDER BY id DESC LIMIT 1"
  });
  
  if (latest.rows[0]) {
    const result = latest.rows[0].result;
    let clean = result.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*\n/, "").replace(/\n```\s*$/, "");
    }
    
    try {
      const parsed = JSON.parse(clean);
      console.log("\nLatest prediction is valid JSON");
      console.log("Ideas count:", parsed.ideas?.length || 0);
      if (parsed.ideas?.length > 0) {
        console.log("Symbols:", parsed.ideas.map(i => i.symbol).join(", "));
      }
    } catch (e) {
      console.log("\nERROR: Latest prediction has invalid JSON");
      console.log("Error:", e.message);
      console.log("First 500 chars:", result.substring(0, 500));
    }
  }
  
  process.exit(0);
})();
