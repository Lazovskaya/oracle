/**
 * Price fetching service for stocks and cryptocurrencies
 * Uses CoinGecko for crypto and Yahoo Finance alternative for stocks
 */

interface PriceData {
  symbol: string;
  currentPrice: number | null;
  change24h: number | null;
  currency: string;
  lastUpdated: string;
}

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Mapping of common symbols to CoinGecko IDs
const CRYPTO_ID_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'MATIC': 'matic-network',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
};

/**
 * Fetch crypto price from CoinGecko
 */
async function fetchCryptoPrice(symbol: string): Promise<PriceData | null> {
  try {
    const cryptoId = CRYPTO_ID_MAP[symbol.toUpperCase()];
    if (!cryptoId) {
      console.warn(`Unknown crypto symbol: ${symbol}`);
      return null;
    }

    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${cryptoId}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    );

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const priceData = data[cryptoId];

    if (!priceData) return null;

    return {
      symbol: symbol.toUpperCase(),
      currentPrice: priceData.usd,
      change24h: priceData.usd_24h_change,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch stock price from free API
 */
async function fetchStockPrice(symbol: string): Promise<PriceData | null> {
  try {
    // Using Yahoo Finance API alternative (free, no key required)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    );

    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    
    if (!result) return null;

    const meta = result.meta;
    const currentPrice = meta?.regularMarketPrice;
    const previousClose = meta?.previousClose;
    
    const change24h = currentPrice && previousClose
      ? ((currentPrice - previousClose) / previousClose) * 100
      : null;

    return {
      symbol: symbol.toUpperCase(),
      currentPrice: currentPrice,
      change24h: change24h,
      currency: meta?.currency || 'USD',
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Determine if symbol is crypto or stock and fetch appropriate price
 */
export async function fetchPrice(symbol: string): Promise<PriceData | null> {
  // Clean symbol: remove -USD, -USDT, etc., and special characters
  const cleanSymbol = symbol
    .replace(/-USD(T)?$/i, '')  // Remove -USD or -USDT suffix
    .replace(/[^A-Z]/gi, '')     // Remove non-letters
    .toUpperCase();
  
  // Check if it's a known crypto
  if (CRYPTO_ID_MAP[cleanSymbol]) {
    return fetchCryptoPrice(cleanSymbol);
  }
  
  // Otherwise treat as stock
  return fetchStockPrice(cleanSymbol);
}

/**
 * Fetch multiple prices in parallel
 */
export async function fetchMultiplePrices(symbols: string[]): Promise<Record<string, PriceData | null>> {
  const uniqueSymbols = [...new Set(symbols)];
  
  const prices = await Promise.all(
    uniqueSymbols.map(async (symbol) => ({
      symbol,
      data: await fetchPrice(symbol),
    }))
  );

  return prices.reduce((acc, { symbol, data }) => {
    acc[symbol] = data;
    return acc;
  }, {} as Record<string, PriceData | null>);
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  if (price >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } else {
    // For small crypto prices, show more decimals
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  }
}

/**
 * Format percentage change
 */
export function formatChange(change: number): string {
  const formatted = change.toFixed(2);
  return change >= 0 ? `+${formatted}%` : `${formatted}%`;
}
