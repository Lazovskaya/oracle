// Check the latest oracle run and verify all translations exist
(async () => {
  try {
    const dbModule = require("../lib/db");
    const db = dbModule.db ?? dbModule;

    console.log("Fetching latest oracle run...\n");
    
    const result = await db.execute({
      sql: `SELECT id, run_date, market_phase, 
             LENGTH(result) as en_length,
             LENGTH(result_ru) as ru_length, 
             LENGTH(result_fr) as fr_length,
             LENGTH(result_es) as es_length, 
             LENGTH(result_zh) as zh_length,
             created_at
            FROM oracle_runs 
            ORDER BY created_at DESC 
            LIMIT 1`,
      args: []
    });

    if (result.rows.length === 0) {
      console.log("No oracle runs found");
      process.exit(0);
    }

    const run = result.rows[0];
    console.log("📊 Latest Oracle Run:");
    console.log("━".repeat(60));
    console.log(`ID: ${run.id}`);
    console.log(`Date: ${run.run_date}`);
    console.log(`Market Phase: ${run.market_phase}`);
    console.log(`Created: ${run.created_at}`);
    console.log("\n📝 Translation Lengths:");
    console.log("━".repeat(60));
    console.log(`🇬🇧 English (EN):  ${run.en_length} characters`);
    console.log(`🇷🇺 Russian (RU):  ${run.ru_length || 0} characters ${run.ru_length ? '✅' : '❌'}`);
    console.log(`🇫🇷 French (FR):   ${run.fr_length || 0} characters ${run.fr_length ? '✅' : '❌'}`);
    console.log(`🇪🇸 Spanish (ES):  ${run.es_length || 0} characters ${run.es_length ? '✅' : '❌'}`);
    console.log(`🇨🇳 Chinese (ZH):  ${run.zh_length || 0} characters ${run.zh_length ? '✅' : '❌'}`);
    
    const allPresent = run.en_length && run.ru_length && run.fr_length && run.es_length && run.zh_length;
    console.log("\n" + "━".repeat(60));
    if (allPresent) {
      console.log("✅ All 5 language translations generated successfully!");
    } else {
      console.log("⚠️ Some translations are missing");
    }
    
    // Show first 200 chars of English
    const fullResult = await db.execute({
      sql: `SELECT result FROM oracle_runs WHERE id = ?`,
      args: [run.id]
    });
    
    if (fullResult.rows[0]?.result) {
      const preview = fullResult.rows[0].result.substring(0, 200);
      console.log("\n📄 English Preview:");
      console.log("━".repeat(60));
      console.log(preview + "...");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
