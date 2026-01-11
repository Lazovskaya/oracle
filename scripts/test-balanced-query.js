const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function testBalancedQuery() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
  });

  try {
    const assetTypesFilter = "'crypto','stock','etf'";
    const perCategory = Math.floor(25 / 3);
    
    console.log('Testing balanced_mix query with perCategory =', perCategory);
    
    // Test the exact query from balanced_mix
    const result = await client.execute({
      sql: `
        SELECT * FROM (
          SELECT 
            symbol, name, asset_type, price, change_24h, change_7d,
            volume_24h, volatility_14d, rsi_14d, trend_50_200,
            is_trending, is_volatile, 'gainer' as category
          FROM market_assets
          WHERE asset_type IN (${assetTypesFilter})
            AND is_liquid = 1
            AND change_7d > 3
            AND last_updated > datetime('now', '-2 hours')
          ORDER BY change_7d DESC
          LIMIT ?
          UNION ALL
          SELECT 
            symbol, name, asset_type, price, change_24h, change_7d,
            volume_24h, volatility_14d, rsi_14d, trend_50_200,
            is_trending, is_volatile, 'reversion' as category
          FROM market_assets
          WHERE asset_type IN (${assetTypesFilter})
            AND is_liquid = 1
            AND change_7d < -2
            AND last_updated > datetime('now', '-2 hours')
          ORDER BY change_7d ASC
          LIMIT ?
          UNION ALL
          SELECT 
            symbol, name, asset_type, price, change_24h, change_7d,
            volume_24h, volatility_14d, rsi_14d, trend_50_200,
            is_trending, is_volatile, 'trending' as category
          FROM market_assets
          WHERE asset_type IN (${assetTypesFilter})
            AND is_liquid = 1
            AND is_trending = 1
            AND last_updated > datetime('now', '-2 hours')
          ORDER BY volume_24h DESC
          LIMIT ?
        ) AS combined
      `,
      args: [perCategory, perCategory, perCategory]
    });

    console.log('\nQuery returned', result.rows.length, 'assets');
    
    if (result.rows.length > 0) {
      console.log('\nFirst 5 assets:');
      console.table(result.rows.slice(0, 5).map(r => ({
        symbol: r.symbol,
        asset_type: r.asset_type,
        price: r.price,
        change_7d: r.change_7d,
        category: r.category
      })));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

testBalancedQuery();
