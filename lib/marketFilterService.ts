/**
 * Market Asset Pre-filtering Service
 * Smart asset selection based on market buckets and trading conditions
 */

import db from './db';

export interface MarketAsset {
  symbol: string;
  name: string;
  asset_type: 'crypto' | 'stock' | 'etf';
  price: number;
  change_24h?: number;
  change_7d?: number;
  volume_24h?: number;
  volatility_14d?: number;
  rsi_14d?: number;
  trend_50_200?: string;
  is_trending: boolean;
  is_volatile: boolean;
}

export type PreFilterStrategy = 
  | 'top_gainers'
  | 'top_losers'
  | 'high_volatility'
  | 'trending'
  | 'mean_reversion'
  | 'breakout_candidates'
  | 'balanced_mix';

export interface PreFilterOptions {
  strategy: PreFilterStrategy;
  assetTypes?: ('crypto' | 'stock' | 'etf')[];
  limit?: number;
  tradingStyle?: 'conservative' | 'balanced' | 'aggressive';
}

/**
 * Get curated market snapshot based on filter strategy
 */
export async function getMarketSnapshot(options: PreFilterOptions): Promise<MarketAsset[]> {
  const {
    strategy,
    assetTypes = ['crypto', 'stock', 'etf'],
    limit = 25,
    tradingStyle = 'balanced'
  } = options;

  // Build asset type filter - ensure it's never empty
  const safeAssetTypes = assetTypes && assetTypes.length > 0 ? assetTypes : ['crypto', 'stock', 'etf'];
  const assetTypesFilter = safeAssetTypes.map(t => `'${t}'`).join(',');
  
  // Validate the filter was constructed properly
  if (!assetTypesFilter || assetTypesFilter === '') {
    console.error('Asset types filter is empty, using default');
    return [];
  }
  
  console.log(`[MarketFilter] Strategy: ${strategy}, Assets: ${safeAssetTypes.join(',')}, Filter: ${assetTypesFilter}`);

  let query = '';
  let args: any[] = [];

  switch (strategy) {
    case 'top_gainers':
      // Assets with highest positive momentum
      query = `
        SELECT 
          symbol, name, asset_type, price, change_24h, change_7d,
          volume_24h, volatility_14d, rsi_14d, trend_50_200,
          is_trending, is_volatile
        FROM market_assets
        WHERE asset_type IN (${assetTypesFilter})
          AND is_liquid = 1
          AND COALESCE(change_7d, change_24h * 3, 0) > 3
          AND last_updated > datetime('now', '-2 hours')
        ORDER BY COALESCE(change_7d, change_24h * 3, 0) DESC
        LIMIT ?
      `;
      args = [limit];
      break;

    case 'top_losers':
      // Oversold assets for reversal plays
      query = `
        SELECT 
          symbol, name, asset_type, price, change_24h, change_7d,
          volume_24h, volatility_14d, rsi_14d, trend_50_200,
          is_trending, is_volatile
        FROM market_assets
        WHERE asset_type IN (${assetTypesFilter})
          AND is_liquid = 1
          AND COALESCE(change_7d, change_24h * 3, 0) < -3
          AND last_updated > datetime('now', '-2 hours')
        ORDER BY COALESCE(change_7d, change_24h * 3, 0) ASC
        LIMIT ?
      `;
      args = [limit];
      break;

    case 'high_volatility':
      // High volatility plays for aggressive traders
      query = `
        SELECT 
          symbol, name, asset_type, price, change_24h, change_7d,
          volume_24h, volatility_14d, rsi_14d, trend_50_200,
          is_trending, is_volatile
        FROM market_assets
        WHERE asset_type IN (${assetTypesFilter})
          AND is_liquid = 1
          AND is_volatile = 1
          AND last_updated > datetime('now', '-2 hours')
        ORDER BY volatility_14d DESC
        LIMIT ?
      `;
      args = [limit];
      break;

    case 'trending':
      // High momentum trending assets
      query = `
        SELECT 
          symbol, name, asset_type, price, change_24h, change_7d,
          volume_24h, volatility_14d, rsi_14d, trend_50_200,
          is_trending, is_volatile
        FROM market_assets
        WHERE asset_type IN (${assetTypesFilter})
          AND is_liquid = 1
          AND is_trending = 1
          AND last_updated > datetime('now', '-2 hours')
        ORDER BY volume_24h DESC
        LIMIT ?
      `;
      args = [limit];
      break;

    case 'mean_reversion':
      // Oversold assets - pullbacks in trending markets
      query = `
        SELECT 
          symbol, name, asset_type, price, change_24h, change_7d,
          volume_24h, volatility_14d, rsi_14d, trend_50_200,
          is_trending, is_volatile
        FROM market_assets
        WHERE asset_type IN (${assetTypesFilter})
          AND is_liquid = 1
          AND COALESCE(change_7d, change_24h * 3, 0) < -2
          AND last_updated > datetime('now', '-2 hours')
        ORDER BY COALESCE(change_7d, change_24h * 3, 0) ASC
        LIMIT ?
      `;
      args = [limit];
      break;

    case 'breakout_candidates':
      // Assets showing compression or consolidation
      query = `
        SELECT 
          symbol, name, asset_type, price, change_24h, change_7d,
          volume_24h, volatility_14d, rsi_14d, trend_50_200,
          is_trending, is_volatile
        FROM market_assets
        WHERE asset_type IN (${assetTypesFilter})
          AND is_liquid = 1
          AND abs(change_7d) < 5
          AND volume_24h > (
            SELECT avg(volume_24h) * 1.2
            FROM market_assets
            WHERE asset_type IN (${assetTypesFilter})
          )
          AND last_updated > datetime('now', '-2 hours')
        ORDER BY volume_24h DESC
        LIMIT ?
      `;
      args = [limit];
      break;

    case 'balanced_mix':
    default:
      // Mix of different setups - volatile movers and trending assets
      query = `
        SELECT 
          symbol, name, asset_type, price, change_24h, change_7d,
          volume_24h, volatility_14d, rsi_14d, trend_50_200,
          is_trending, is_volatile
        FROM market_assets
        WHERE asset_type IN (${assetTypesFilter})
          AND is_liquid = 1
          AND (
            COALESCE(change_7d, change_24h * 3, 0) > 3 
            OR COALESCE(change_7d, change_24h * 3, 0) < -2 
            OR is_trending = 1
          )
          AND last_updated > datetime('now', '-2 hours')
        ORDER BY ABS(COALESCE(change_7d, change_24h * 3, 0)) DESC
        LIMIT ?
      `;
      args = [limit];
      break;
  }

  try {
    console.log(`[MarketFilter] Executing query with args:`, args);
    const result = await db.execute({ sql: query, args });
    console.log(`[MarketFilter] Retrieved ${result.rows.length} assets`);
    return result.rows as any[];
  } catch (error) {
    console.error('Error fetching market snapshot:', error);
    console.error('Query:', query);
    console.error('Args:', args);
    return [];
  }
}

/**
 * Get strategy based on trading style and asset preference
 */
export function getFilterStrategy(
  tradingStyle: 'conservative' | 'balanced' | 'aggressive',
  assetPreference?: 'crypto' | 'stocks' | 'both'
): PreFilterStrategy {
  if (tradingStyle === 'conservative') {
    return 'mean_reversion'; // Lower risk reversal plays
  } else if (tradingStyle === 'aggressive') {
    return 'high_volatility'; // High risk/reward setups
  } else {
    return 'balanced_mix'; // Mix of strategies
  }
}

/**
 * Format market snapshot for LLM prompt
 */
export function formatMarketSnapshotForPrompt(assets: MarketAsset[]): string {
  if (assets.length === 0) {
    return 'No market data available. Please use general market knowledge.';
  }

  let formatted = '**CURATED MARKET SNAPSHOT** (real-time data, updated recently):\n\n';
  
  // Group by asset type
  const crypto = assets.filter(a => a.asset_type === 'crypto');
  const stocks = assets.filter(a => a.asset_type === 'stock');
  const etfs = assets.filter(a => a.asset_type === 'etf');

  if (crypto.length > 0) {
    formatted += '📊 **Cryptocurrencies:**\n';
    crypto.forEach(asset => {
      const change7d = asset.change_7d ? `${asset.change_7d >= 0 ? '+' : ''}${asset.change_7d.toFixed(2)}%` : 'N/A';
      const vol = asset.volatility_14d ? `Vol: ${asset.volatility_14d.toFixed(1)}%` : '';
      const trend = asset.is_trending ? '🔥' : '';
      formatted += `  ${asset.symbol}: $${asset.price.toFixed(2)} (7d: ${change7d}) ${vol} ${trend}\n`;
    });
    formatted += '\n';
  }

  if (stocks.length > 0) {
    formatted += '📈 **Stocks:**\n';
    stocks.forEach(asset => {
      const change7d = asset.change_7d ? `${asset.change_7d >= 0 ? '+' : ''}${asset.change_7d.toFixed(2)}%` : 'N/A';
      const trend = asset.is_trending ? '🔥' : '';
      formatted += `  ${asset.symbol}: $${asset.price.toFixed(2)} (7d: ${change7d}) ${trend}\n`;
    });
    formatted += '\n';
  }

  if (etfs.length > 0) {
    formatted += '📊 **ETFs:**\n';
    etfs.forEach(asset => {
      const change7d = asset.change_7d ? `${asset.change_7d >= 0 ? '+' : ''}${asset.change_7d.toFixed(2)}%` : 'N/A';
      formatted += `  ${asset.symbol}: $${asset.price.toFixed(2)} (7d: ${change7d})\n`;
    });
    formatted += '\n';
  }

  formatted += '⚠️ **CRITICAL INSTRUCTIONS:**\n';
  formatted += '- You MUST select symbols ONLY from this list\n';
  formatted += '- DO NOT invent or suggest symbols not shown above\n';
  formatted += '- Use the provided prices as reference for entry/stop/target calculations\n';
  formatted += '- Base your analysis on the actual market data shown\n';
  formatted += '- Prices are real and recently updated\n';

  return formatted;
}

/**
 * Get top assets by volume (for symbol analyzer default suggestions)
 */
export async function getTopAssetsByVolume(
  assetType: 'crypto' | 'stock' | 'etf',
  limit: number = 20
): Promise<string[]> {
  try {
    const result = await db.execute({
      sql: `
        SELECT symbol
        FROM market_assets
        WHERE asset_type = ?
          AND is_liquid = 1
          AND last_updated > datetime('now', '-2 hours')
        ORDER BY volume_24h DESC
        LIMIT ?
      `,
      args: [assetType, limit]
    });
    
    return result.rows.map((row: any) => row.symbol);
  } catch (error) {
    console.error('Error fetching top assets:', error);
    return [];
  }
}
