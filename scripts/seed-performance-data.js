import { createClient } from '@libsql/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const sampleIdeas = [
  // Winners - Stocks
  {
    symbol: 'NVDA',
    entry_price: 485.50,
    stop_price: 465.00,
    target_prices: '520, 545',
    category: 'stock',
    status: 'hit_target',
    outcome_date: '2025-10-28',
  },
  {
    symbol: 'TSLA',
    entry_price: 242.80,
    stop_price: 228.00,
    target_prices: '268, 285',
    category: 'stock',
    status: 'hit_target',
    outcome_date: '2025-11-15',
  },
  {
    symbol: 'AAPL',
    entry_price: 178.20,
    stop_price: 172.50,
    target_prices: '186, 192',
    category: 'stock',
    status: 'hit_target',
    outcome_date: '2025-12-08',
  },
  {
    symbol: 'META',
    entry_price: 348.50,
    stop_price: 335.00,
    target_prices: '368, 385',
    category: 'stock',
    status: 'hit_target',
    outcome_date: '2025-11-22',
  },
  {
    symbol: 'MSFT',
    entry_price: 385.40,
    stop_price: 375.00,
    target_prices: '402, 415',
    category: 'stock',
    status: 'hit_target',
    outcome_date: '2025-12-18',
  },
  {
    symbol: 'AMD',
    entry_price: 142.30,
    stop_price: 136.00,
    target_prices: '155, 165',
    category: 'stock',
    status: 'hit_target',
    outcome_date: '2025-10-15',
  },
  
  // Winners - Crypto
  {
    symbol: 'BTC',
    entry_price: 42800,
    stop_price: 40500,
    target_prices: '46500, 49200',
    category: 'crypto',
    status: 'hit_target',
    outcome_date: '2025-11-08',
  },
  {
    symbol: 'ETH',
    entry_price: 2280,
    stop_price: 2150,
    target_prices: '2480, 2620',
    category: 'crypto',
    status: 'hit_target',
    outcome_date: '2025-12-01',
  },
  {
    symbol: 'SOL',
    entry_price: 98.50,
    stop_price: 92.00,
    target_prices: '110, 122',
    category: 'crypto',
    status: 'hit_target',
    outcome_date: '2025-11-28',
  },
  {
    symbol: 'AVAX',
    entry_price: 36.80,
    stop_price: 33.50,
    target_prices: '42, 46',
    category: 'crypto',
    status: 'hit_target',
    outcome_date: '2025-12-12',
  },
  
  // Losers - Stocks
  {
    symbol: 'NFLX',
    entry_price: 458.20,
    stop_price: 442.00,
    target_prices: '485, 505',
    category: 'stock',
    status: 'hit_stop',
    outcome_date: '2025-10-22',
  },
  {
    symbol: 'DIS',
    entry_price: 92.40,
    stop_price: 87.50,
    target_prices: '99, 104',
    category: 'stock',
    status: 'hit_stop',
    outcome_date: '2025-11-11',
  },
  {
    symbol: 'COIN',
    entry_price: 168.50,
    stop_price: 158.00,
    target_prices: '185, 198',
    category: 'stock',
    status: 'hit_stop',
    outcome_date: '2025-12-05',
  },
  
  // Losers - Crypto
  {
    symbol: 'ADA',
    entry_price: 0.58,
    stop_price: 0.53,
    target_prices: '0.65, 0.71',
    category: 'crypto',
    status: 'hit_stop',
    outcome_date: '2025-10-30',
  },
  {
    symbol: 'DOT',
    entry_price: 6.85,
    stop_price: 6.30,
    target_prices: '7.60, 8.20',
    category: 'crypto',
    status: 'hit_stop',
    outcome_date: '2025-11-18',
  },
  {
    symbol: 'XRP',
    entry_price: 0.62,
    stop_price: 0.57,
    target_prices: '0.70, 0.76',
    category: 'crypto',
    status: 'hit_stop',
    outcome_date: '2025-12-22',
  },
  
  // Recent active trades (January 2026)
  {
    symbol: 'GOOGL',
    entry_price: 142.80,
    stop_price: 137.00,
    target_prices: '152, 158',
    category: 'stock',
    status: 'hit_target',
    outcome_date: '2026-01-06',
  },
  {
    symbol: 'LINK',
    entry_price: 14.50,
    stop_price: 13.20,
    target_prices: '16.80, 18.50',
    category: 'crypto',
    status: 'hit_target',
    outcome_date: '2026-01-08',
  },
];

async function insertSampleData() {
  try {
    console.log('Fetching latest oracle runs...\n');
    
    // Get recent oracle run IDs
    const runs = await db.execute({
      sql: 'SELECT id FROM oracle_runs ORDER BY created_at DESC LIMIT 20',
    });
    
    if (runs.rows.length === 0) {
      console.error('❌ No oracle runs found. Please run the oracle first.');
      process.exit(1);
    }
    
    console.log(`Found ${runs.rows.length} oracle runs\n`);
    console.log('Inserting sample performance data...\n');

    for (let i = 0; i < sampleIdeas.length; i++) {
      const idea = sampleIdeas[i];
      // Distribute ideas across different runs
      const runId = runs.rows[i % runs.rows.length].id;
      
      await db.execute({
        sql: `
          INSERT INTO idea_performance (
            oracle_run_id, symbol, entry_price, stop_price, target_prices, 
            category, status, outcome_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          runId,
          idea.symbol,
          idea.entry_price,
          idea.stop_price,
          idea.target_prices,
          idea.category,
          idea.status,
          idea.outcome_date,
        ],
      });
      
      const emoji = idea.status === 'hit_target' ? '✅' : '❌';
      console.log(`${emoji} ${idea.symbol} - ${idea.status} (${idea.outcome_date})`);
    }

    console.log(`\n✅ Successfully inserted ${sampleIdeas.length} trade ideas`);
    
    // Calculate statistics
    const winners = sampleIdeas.filter(i => i.status === 'hit_target').length;
    const losers = sampleIdeas.filter(i => i.status === 'hit_stop').length;
    const winRate = ((winners / sampleIdeas.length) * 100).toFixed(1);
    
    console.log(`\nStatistics:`);
    console.log(`- Winners: ${winners}`);
    console.log(`- Losers: ${losers}`);
    console.log(`- Win Rate: ${winRate}%`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting data:', error);
    process.exit(1);
  }
}

insertSampleData();
