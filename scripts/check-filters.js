const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkFilters() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
  });

  try {
    // Check timestamp filter
    const timeCheck = await client.execute({
      sql: "SELECT COUNT(*) as count FROM market_assets WHERE last_updated > datetime('now', '-2 hours')",
      args: []
    });
    console.log('Assets updated in last 2 hours:', timeCheck.rows[0].count);

    // Check update range
    const rangeCheck = await client.execute({
      sql: 'SELECT MIN(last_updated) as oldest, MAX(last_updated) as newest FROM market_assets',
      args: []
    });
    console.log('Update range:', rangeCheck.rows[0]);

    // Test the actual balanced_mix query
    const perCategory = Math.floor(25 / 3);
    const assetTypesFilter = "'crypto','stock','etf'";
    
    console.log('\n=== Testing balanced_mix query ===');
    
    // Test each part separately
    const gainers = await client.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM market_assets
        WHERE asset_type IN (${assetTypesFilter})
          AND is_liquid = 1
          AND change_7d > 3
          AND last_updated > datetime('now', '-2 hours')
      `,
      args: []
    });
    console.log('Gainers matching all criteria:', gainers.rows[0].count);

    const reversions = await client.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM market_assets
        WHERE asset_type IN (${assetTypesFilter})
          AND is_liquid = 1
          AND change_7d < -2
          AND last_updated > datetime('now', '-2 hours')
      `,
      args: []
    });
    console.log('Reversions matching all criteria:', reversions.rows[0].count);

    const trending = await client.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM market_assets
        WHERE asset_type IN (${assetTypesFilter})
          AND is_liquid = 1
          AND is_trending = 1
          AND last_updated > datetime('now', '-2 hours')
      `,
      args: []
    });
    console.log('Trending matching all criteria:', trending.rows[0].count);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

checkFilters();
