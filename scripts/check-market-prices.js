const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkPrices() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    // Count total records
    const count = await db.execute({
      sql: 'SELECT COUNT(*) as total FROM market_assets',
    });
    
    console.log(`\n📊 Total assets in database: ${count.rows[0].total}\n`);
    
    // Show sample records
    const sample = await db.execute({
      sql: 'SELECT symbol, price, change_24h FROM market_assets LIMIT 10',
    });
    
    if (sample.rows.length > 0) {
      console.log('Latest 10 assets:');
      console.log('─'.repeat(50));
      sample.rows.forEach(row => {
        const changeStr = row.change_24h ? ((row.change_24h > 0 ? '+' : '') + row.change_24h.toFixed(2) + '%') : 'N/A';
        console.log(`${row.symbol.padEnd(10)} | $${(row.price?.toFixed(2) || 'N/A').toString().padStart(10)} | ${changeStr.padEnd(8)}`);
      });
    } else {
      console.log('❌ No assets found in market_assets table!');
      console.log('\n💡 Run the cron job to populate prices:');
      console.log('   $headers = @{ "Authorization" = "Bearer dev-secret-change-in-production" }');
      console.log('   Invoke-WebRequest -Uri "http://localhost:3000/api/cron-heartbeat" -Headers $headers');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkPrices();
