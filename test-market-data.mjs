/**
 * Quick test script to verify market data service
 */

// Use dynamic import for ESM modules
async function testMarketData() {
  try {
    console.log('🧪 Testing Market Data Service...\n');
    
    // Test 1: Fetch crypto prices
    console.log('1️⃣ Fetching crypto prices from CoinGecko...');
    const cryptoResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=1h,24h,7d'
    );
    
    if (cryptoResponse.ok) {
      const cryptoData = await cryptoResponse.json();
      console.log(`✅ Fetched ${cryptoData.length} crypto assets`);
      console.log('   Sample:', cryptoData.slice(0, 3).map(c => `${c.symbol.toUpperCase()}: $${c.current_price}`).join(', '));
    } else {
      console.log(`❌ CoinGecko API error: ${cryptoResponse.status}`);
    }
    
    // Test 2: Fetch stock price from Finnhub (if API key exists)
    console.log('\n2️⃣ Testing Finnhub API (stocks)...');
    const finnhubKey = process.env.FINNHUB_API_KEY;
    
    if (finnhubKey) {
      const stockResponse = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${finnhubKey}`
      );
      
      if (stockResponse.ok) {
        const stockData = await stockResponse.json();
        console.log(`✅ AAPL price: $${stockData.c}`);
      } else {
        console.log(`❌ Finnhub API error: ${stockResponse.status}`);
      }
    } else {
      console.log('⚠️  FINNHUB_API_KEY not set - skipping stock test');
      console.log('   Get free key at: https://finnhub.io/register');
    }
    
    // Test 3: Test database connection
    console.log('\n3️⃣ Testing database connection...');
    const testDbResponse = await fetch('http://localhost:3000/api/health');
    
    if (testDbResponse.ok) {
      console.log('✅ Database connection OK');
    } else {
      console.log('❌ Database connection failed');
    }
    
    console.log('\n✨ Market data service tests completed!\n');
    console.log('📝 Next steps:');
    console.log('   1. Set FINNHUB_API_KEY in .env.local (get free key at finnhub.io)');
    console.log('   2. Call POST http://localhost:3000/api/update-market-data to populate database');
    console.log('   3. Call POST http://localhost:3000/api/run-oracle to test new architecture');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMarketData();
