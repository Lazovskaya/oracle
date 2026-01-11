/**
 * Market Data Service
 * Fetches real-time prices from external APIs and updates market_assets table
 */

import db from './db';

// Types
export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change_1h?: number;
  change_24h?: number;
  change_7d?: number;
  change_30d?: number;
  volume_24h?: number;
  market_cap?: number;
}

export interface StockPrice {
  symbol: string;
  name: string;
  price: number;
  change_24h?: number;
  change_7d?: number;
  volume_24h?: number;
  market_cap?: number;
}

// CoinGecko API for crypto prices
export async function fetchCryptoPrices(limit = 100): Promise<CryptoPrice[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=1h,24h,7d,30d`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change_1h: coin.price_change_percentage_1h_in_currency,
      change_24h: coin.price_change_percentage_24h,
      change_7d: coin.price_change_percentage_7d_in_currency,
      change_30d: coin.price_change_percentage_30d_in_currency,
      volume_24h: coin.total_volume,
      market_cap: coin.market_cap
    }));
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return [];
  }
}

// Polygon.io for stock prices (free tier: 5 calls/min)
export async function fetchStockPrices(symbols: string[]): Promise<StockPrice[]> {
  const apiKey = process.env.POLYGON_API_KEY;
  
  if (!apiKey) {
    console.warn('POLYGON_API_KEY not set, skipping stock price updates');
    return [];
  }

  const results: StockPrice[] = [];
  
  for (const symbol of symbols) {
    try {
      // Fetch previous close and current snapshot
      const [prevCloseRes, snapshotRes] = await Promise.all([
        fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`),
        fetch(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${apiKey}`)
      ]);

      if (prevCloseRes.ok && snapshotRes.ok) {
        const prevClose = await prevCloseRes.json();
        const snapshot = await snapshotRes.json();
        
        if (prevClose.results?.[0] && snapshot.ticker) {
          const price = snapshot.ticker.lastTrade?.p || prevClose.results[0].c;
          const prevPrice = prevClose.results[0].c;
          const change_24h = ((price - prevPrice) / prevPrice) * 100;
          
          results.push({
            symbol: symbol.toUpperCase(),
            name: snapshot.ticker.name || symbol,
            price: price,
            change_24h: change_24h,
            volume_24h: snapshot.ticker.day?.v,
            market_cap: snapshot.ticker.market_cap
          });
        }
      }
      
      // Rate limiting - wait 200ms between calls (5 calls/sec max)
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
    }
  }
  
  return results;
}

// Finnhub for stock prices (alternative, free tier)
export async function fetchStockPricesFinnhub(symbols: string[]): Promise<StockPrice[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  
  if (!apiKey) {
    console.warn('FINNHUB_API_KEY not set, skipping stock price updates');
    return [];
  }

  const results: StockPrice[] = [];
  
  for (const symbol of symbols) {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.c && data.c > 0) {
          results.push({
            symbol: symbol.toUpperCase(),
            name: symbol, // Finnhub doesn't return name in quote endpoint
            price: data.c, // current price
            change_24h: data.dp, // percent change
            volume_24h: data.v
          });
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
    }
  }
  
  return results;
}

// Calculate technical indicators
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const squaredDiffs = prices.map(p => Math.pow(p - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / prices.length;
  
  return Math.sqrt(variance);
}

function calculateRSI(prices: number[], period = 14): number | null {
  if (prices.length < period + 1) return null;
  
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }
  
  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Update market_assets table with fresh data
export async function updateMarketAssets() {
  console.log('Updating market assets...');
  
  // Fetch crypto prices (top 200 by market cap)
  const cryptoPrices = await fetchCryptoPrices(200);
  console.log(`Fetched ${cryptoPrices.length} crypto prices`);
  
  // Default stock list (S&P 500 top holdings + popular tickers)
  const stockSymbols = [
    // Mega caps
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'LLY',
    // Tech
    'AVGO', 'AMD', 'INTC', 'CSCO', 'ORCL', 'ADBE', 'CRM', 'NFLX', 'QCOM', 'TXN',
    'INTU', 'NOW', 'UBER', 'AMAT', 'PANW', 'SNPS', 'CDNS', 'CRWD', 'PLTR', 'SNOW',
    // Finance
    'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW',
    'AXP', 'SPGI', 'CB', 'MMC', 'PGR', 'TFC', 'USB', 'PNC',
    // Healthcare
    'UNH', 'JNJ', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'PFE', 'BMY', 'AMGN',
    'GILD', 'CVS', 'CI', 'MDT', 'REGN', 'VRTX', 'ISRG', 'SYK',
    // Consumer
    'WMT', 'HD', 'COST', 'PG', 'KO', 'PEP', 'MCD', 'NKE', 'SBUX', 'TGT',
    'LOW', 'TJX', 'DG', 'CMG', 'YUM', 'MDLZ', 'CL', 'KMB',
    // Energy
    'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL',
    // Industrials
    'CAT', 'GE', 'BA', 'UNP', 'RTX', 'HON', 'UPS', 'LMT', 'DE', 'MMM',
    // Communications
    'DIS', 'CMCSA', 'VZ', 'T', 'TMUS', 'CHTR', 'EA', 'TTWO',
    // Retail & E-commerce
    'SHOP', 'BKNG', 'ABNB', 'DASH', 'ETSY', 'W', 'CHWY',
    // Semiconductors
    'TSM', 'ASML', 'MU', 'LRCX', 'KLAC', 'MCHP', 'NXPI', 'ON',
    // EV & Auto
    'F', 'GM', 'RIVN', 'LCID', 'NIO', 'LI', 'XPEV',
    // AI & Cloud
    'AI', 'DDOG', 'NET', 'ZS', 'OKTA', 'TEAM', 'MDB', 'DOCU',
    // FinTech
    'SQ', 'PYPL', 'COIN', 'HOOD', 'AFRM', 'SOFI',
    // Biotech
    'MRNA', 'BNTX', 'BIIB', 'ILMN', 'ALNY', 'CRSP', 'NTLA',
    // Other Growth
    'SPOT', 'RBLX', 'U', 'ZM', 'DKNG', 'PINS', 'SNAP',
    
    // European Stocks (ADRs or direct listings)
    // UK
    'BP', 'SHEL', 'HSBC', 'GSK', 'AZN', 'ULVR.L', 'RDSB', 'VOD', 'BARC',
    // France
    'MC.PA', 'OR.PA', 'SAN.PA', 'TTE', 'BNP', 'AI.PA', 'SU.PA',
    // Germany
    'SAP', 'ASML', 'SIE.DE', 'ALV.DE', 'VOW3.DE', 'BAS.DE', 'BAYN.DE',
    // Switzerland
    'NESN.SW', 'ROG.SW', 'NOVN.SW', 'UHR.SW',
    // Netherlands
    'ASML', 'HEIA.AS', 'INGA.AS',
    // Spain/Italy
    'ITX.MC', 'IBE.MC', 'TEF', 'ENI', 'UCG',
    
    // Asian Stocks (ADRs or direct listings)
    // China
    'BABA', 'JD', 'PDD', 'BIDU', 'TCEHY', 'NIO', 'LI', 'XPEV', 'TME', 'BILI',
    // Japan
    'TM', 'SNE', 'SONY', 'NTT', 'MUFG', 'HMC', 'SMFG',
    // South Korea
    '005930.KS', 'SSNLF', 'LPL',
    // Taiwan
    'TSM', 'UMC', '2330.TW',
    // India
    'INFY', 'WIT', 'HDB', 'IBN', 'SIFY',
    // Southeast Asia
    'SE', 'GRAB', 'BABA', 'TCEHY'
  ];
  
  const etfSymbols = [
    // Major indices
    'SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'VOO', 'VEA', 'VWO', 'EEM', 'IEFA',
    // Sectors
    'XLF', 'XLK', 'XLE', 'XLV', 'XLI', 'XLP', 'XLY', 'XLU', 'XLB', 'XLRE',
    'XLC', 'XBI', 'XRT', 'XHB', 'XME', 'XOP',
    // Bonds & Fixed Income
    'TLT', 'IEF', 'SHY', 'AGG', 'BND', 'LQD', 'HYG', 'JNK', 'TIP',
    // Commodities
    'GLD', 'SLV', 'GDX', 'GDXJ', 'USO', 'UNG', 'DBA', 'DBC',
    // Volatility & Inverse
    'VXX', 'UVXY', 'VIXY', 'SH', 'PSQ', 'SQQQ',
    // International
    'EFA', 'FXI', 'EWJ', 'EWZ', 'EWY', 'EWT', 'EWG', 'EWU',
    // Thematic
    'ARKK', 'ARKW', 'ARKG', 'ARKF', 'ICLN', 'TAN', 'LIT', 'JETS', 'BOTZ', 'SKYY'
  ];
  
  // Add commodity symbols (these work with some APIs)
  const commoditySymbols = [
    'XAU', 'XAG', 'GC=F', 'SI=F', 'CL=F', 'NG=F' // Gold, Silver, Oil, Gas
  ];
  
  // Try Finnhub first (simpler API), fallback to Polygon
  let stockPrices = await fetchStockPricesFinnhub([...stockSymbols, ...etfSymbols]);
  
  if (stockPrices.length === 0) {
    stockPrices = await fetchStockPrices([...stockSymbols, ...etfSymbols]);
  }
  
  console.log(`Fetched ${stockPrices.length} stock/ETF prices`);
  
  // Insert/update crypto assets
  for (const crypto of cryptoPrices) {
    const volatility14d = crypto.change_7d ? Math.abs(crypto.change_7d) : null;
    const isTrending = (crypto.change_7d && Math.abs(crypto.change_7d) > 10) ? 1 : 0;
    const isVolatile = (volatility14d && volatility14d > 20) ? 1 : 0;
    const isLiquid = (crypto.volume_24h && crypto.volume_24h > 1000000) ? 1 : 0;
    
    await db.execute({
      sql: `
        INSERT INTO market_assets (
          symbol, name, asset_type, price, change_1h, change_24h, change_7d, change_30d,
          volume_24h, market_cap, volatility_14d, is_trending, is_volatile, is_liquid,
          last_updated, data_source
        ) VALUES (?, ?, 'crypto', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'coingecko')
        ON CONFLICT(symbol) DO UPDATE SET
          price = excluded.price,
          change_1h = excluded.change_1h,
          change_24h = excluded.change_24h,
          change_7d = excluded.change_7d,
          change_30d = excluded.change_30d,
          volume_24h = excluded.volume_24h,
          market_cap = excluded.market_cap,
          volatility_14d = excluded.volatility_14d,
          is_trending = excluded.is_trending,
          is_volatile = excluded.is_volatile,
          is_liquid = excluded.is_liquid,
          last_updated = datetime('now')
      `,
      args: [
        crypto.symbol ?? '',
        crypto.name ?? crypto.symbol ?? '',
        crypto.price ?? 0,
        crypto.change_1h ?? null,
        crypto.change_24h ?? null,
        crypto.change_7d ?? null,
        crypto.change_30d ?? null,
        crypto.volume_24h ?? null,
        crypto.market_cap ?? null,
        volatility14d,
        isTrending,
        isVolatile,
        isLiquid
      ]
    });
  }
  
  // Insert/update stock/ETF assets
  for (const stock of stockPrices) {
    const assetType = etfSymbols.includes(stock.symbol) ? 'etf' : 'stock';
    const volatility14d = stock.change_24h ? Math.abs(stock.change_24h) : null;
    const isTrending = (stock.change_7d && Math.abs(stock.change_7d) > 5) ? 1 : 0;
    const isVolatile = (volatility14d && volatility14d > 3) ? 1 : 0;
    const isLiquid = (stock.volume_24h && stock.volume_24h > 500000) ? 1 : 0;
    
    await db.execute({
      sql: `
        INSERT INTO market_assets (
          symbol, name, asset_type, price, change_24h, change_7d,
          volume_24h, market_cap, volatility_14d, is_trending, is_volatile, is_liquid,
          last_updated, data_source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
        ON CONFLICT(symbol) DO UPDATE SET
          price = excluded.price,
          change_24h = excluded.change_24h,
          change_7d = excluded.change_7d,
          volume_24h = excluded.volume_24h,
          market_cap = excluded.market_cap,
          volatility_14d = excluded.volatility_14d,
          is_trending = excluded.is_trending,
          is_volatile = excluded.is_volatile,
          is_liquid = excluded.is_liquid,
          last_updated = datetime('now')
      `,
      args: [
        stock.symbol ?? '',
        stock.name ?? stock.symbol ?? '',
        assetType,
        stock.price ?? 0,
        stock.change_24h ?? null,
        stock.change_7d ?? null,
        stock.volume_24h ?? null,
        stock.market_cap ?? null,
        volatility14d,
        isTrending,
        isVolatile,
        isLiquid,
        'finnhub'
      ]
    });
  }
  
  console.log('Market assets updated successfully');
  
  return {
    cryptoCount: cryptoPrices.length,
    stockCount: stockPrices.length,
    total: cryptoPrices.length + stockPrices.length
  };
}
