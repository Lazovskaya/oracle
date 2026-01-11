const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkOracleRuns() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
  });

  try {
    const result = await client.execute({
      sql: 'SELECT trading_style, LENGTH(result) as len, CASE WHEN result LIKE "{%" THEN "Valid JSON" ELSE "Invalid JSON" END as format FROM oracle_runs ORDER BY created_at DESC LIMIT 5',
      args: []
    });

    console.log('Recent oracle runs:');
    console.table(result.rows);
    
    // Get one full result from each style
    for (const style of ['conservative', 'balanced', 'aggressive']) {
      const styleResult = await client.execute({
        sql: 'SELECT result FROM oracle_runs WHERE trading_style = ? ORDER BY created_at DESC LIMIT 1',
        args: [style]
      });
      
      if (styleResult.rows.length > 0) {
        console.log(`\n=== ${style.toUpperCase()} RESULT ===`);
        const result = styleResult.rows[0].result;
        try {
          const parsed = JSON.parse(result);
          console.log(`Market phase: ${parsed.market_phase || 'N/A'}`);
          console.log(`Ideas count: ${parsed.ideas ? parsed.ideas.length : 0}`);
          if (parsed.ideas && parsed.ideas.length > 0) {
            console.log('First idea symbol:', parsed.ideas[0].symbol);
          }
        } catch (e) {
          console.log('Parse error:', e.message);
          console.log('First 500 chars:', result.substring(0, 500));
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

checkOracleRuns();
