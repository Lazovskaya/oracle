/**
 * Seed script to add realistic dummy trading ideas to idea_performance table
 * Run with: node scripts/seed-idea-performance.js
 */

const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

const DUMMY_IDEAS = [
  // Winners
  {
    user_email: 'demo@example.com',
    symbol: 'BTC',
    idea_type: 'daily_oracle',
    entry_price: 42000,
    exit_price: 46500,
    original_target: 46000,
    original_stop_loss: 40000,
    entry_date: '2025-11-15T10:00:00Z',
    exit_date: '2025-12-02T15:30:00Z',
    exit_reason: 'target_hit',
    status: 'winner',
    expected_timeframe: '2-4 weeks',
    notes: 'Clean breakout above 43k resistance',
  },
  {
    user_email: 'demo@example.com',
    symbol: 'ETH',
    idea_type: 'symbol_analysis',
    entry_price: 2200,
    exit_price: 2450,
    original_target: 2500,
    original_stop_loss: 2100,
    entry_date: '2025-11-20T09:00:00Z',
    exit_date: '2025-12-10T14:00:00Z',
    exit_reason: 'target_hit',
    status: 'winner',
    expected_timeframe: '3-5 weeks',
    notes: 'Strong momentum follow-through',
  },
  {
    user_email: 'demo@example.com',
    symbol: 'AAPL',
    idea_type: 'daily_oracle',
    entry_price: 180,
    exit_price: 192,
    original_target: 195,
    original_stop_loss: 175,
    entry_date: '2025-10-25T10:30:00Z',
    exit_date: '2025-11-18T16:00:00Z',
    exit_reason: 'target_hit',
    status: 'winner',
    expected_timeframe: '2-4 weeks',
    notes: 'Earnings catalyst played out well',
  },
  {
    user_email: 'demo@example.com',
    symbol: 'SOL',
    idea_type: 'symbol_analysis',
    entry_price: 95,
    exit_price: 115,
    original_target: 120,
    original_stop_loss: 88,
    entry_date: '2025-11-05T11:00:00Z',
    exit_date: '2025-12-05T13:00:00Z',
    exit_reason: 'target_hit',
    status: 'winner',
    expected_timeframe: '3-6 weeks',
    notes: 'Perfect Elliott Wave 5th wave extension',
  },
  {
    user_email: 'demo@example.com',
    symbol: 'TSLA',
    idea_type: 'daily_oracle',
    entry_price: 240,
    exit_price: 265,
    original_target: 270,
    original_stop_loss: 230,
    entry_date: '2025-11-28T10:00:00Z',
    exit_date: '2025-12-20T15:00:00Z',
    exit_reason: 'target_hit',
    status: 'winner',
    expected_timeframe: '2-4 weeks',
    notes: 'Tech sector strength lifted all boats',
  },

  // Losers
  {
    user_email: 'demo@example.com',
    symbol: 'XRP',
    idea_type: 'symbol_analysis',
    entry_price: 0.62,
    exit_price: 0.54,
    original_target: 0.70,
    original_stop_loss: 0.55,
    entry_date: '2025-10-15T09:30:00Z',
    exit_date: '2025-10-28T14:00:00Z',
    exit_reason: 'stop_loss',
    status: 'loser',
    expected_timeframe: '2-6 weeks',
    notes: 'Failed to hold support, quick stop out',
    lessons_learned: 'Should have waited for stronger confirmation',
  },
  {
    user_email: 'demo@example.com',
    symbol: 'NVDA',
    idea_type: 'daily_oracle',
    entry_price: 495,
    exit_price: 470,
    original_target: 530,
    original_stop_loss: 475,
    entry_date: '2025-10-08T10:00:00Z',
    exit_date: '2025-10-22T13:30:00Z',
    exit_reason: 'stop_loss',
    status: 'loser',
    expected_timeframe: '3-5 weeks',
    notes: 'Market sold off on Fed news',
    lessons_learned: 'Don\'t ignore macro headwinds',
  },
  {
    user_email: 'demo@example.com',
    symbol: 'DOGE',
    idea_type: 'symbol_analysis',
    entry_price: 0.095,
    exit_price: 0.082,
    original_target: 0.11,
    original_stop_loss: 0.085,
    entry_date: '2025-11-12T11:00:00Z',
    exit_date: '2025-11-25T10:00:00Z',
    exit_reason: 'stop_loss',
    status: 'loser',
    expected_timeframe: '2-4 weeks',
    notes: 'Crypto weakness spread from BTC',
    lessons_learned: 'Meme coins too volatile for this timeframe',
  },

  // Breakeven
  {
    user_email: 'demo@example.com',
    symbol: 'SPY',
    idea_type: 'daily_oracle',
    entry_price: 450,
    exit_price: 451,
    original_target: 465,
    original_stop_loss: 445,
    entry_date: '2025-12-05T09:30:00Z',
    exit_date: '2025-12-18T15:00:00Z',
    exit_reason: 'manual_exit',
    status: 'breakeven',
    expected_timeframe: '2-3 weeks',
    notes: 'Choppy range-bound action, exited flat',
    lessons_learned: 'Market needs volatility for swing trades',
  },

  // Active trades
  {
    user_email: 'demo@example.com',
    symbol: 'BTC',
    idea_type: 'daily_oracle',
    entry_price: 44500,
    original_target: 48000,
    original_stop_loss: 42500,
    entry_date: '2025-12-28T10:00:00Z',
    status: 'active',
    expected_timeframe: '2-4 weeks',
    notes: 'New breakout setup, looking strong',
  },
  {
    user_email: 'demo@example.com',
    symbol: 'MATIC',
    idea_type: 'symbol_analysis',
    entry_price: 0.85,
    original_target: 1.05,
    original_stop_loss: 0.78,
    entry_date: '2026-01-03T11:30:00Z',
    status: 'active',
    expected_timeframe: '3-6 weeks',
    notes: 'Layer 2 narrative gaining traction',
  },
];

async function seedIdeas() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  console.log(`Seeding ${DUMMY_IDEAS.length} trading ideas...`);

  try {
    for (const idea of DUMMY_IDEAS) {
      // Calculate metrics for closed trades
      let profit_loss = null;
      let profit_loss_percentage = null;
      let risk_reward_ratio = null;
      let duration_days = null;
      let closed_at = null;
      let highest_price = null;
      let lowest_price = null;

      if (idea.exit_price && idea.entry_price) {
        // Calculate profit/loss
        profit_loss = idea.exit_price - idea.entry_price;
        profit_loss_percentage = ((idea.exit_price - idea.entry_price) / idea.entry_price) * 100;
        
        // Calculate risk/reward ratio
        const reward = Math.abs(idea.exit_price - idea.entry_price);
        const risk = Math.abs(idea.entry_price - idea.original_stop_loss);
        risk_reward_ratio = risk > 0 ? reward / risk : 0;
        
        // Calculate duration
        const entryDate = new Date(idea.entry_date);
        const exitDate = new Date(idea.exit_date);
        duration_days = Math.ceil((exitDate - entryDate) / (1000 * 60 * 60 * 24));
        
        closed_at = idea.exit_date;
        
        // Simulate price extremes
        if (idea.status === 'winner') {
          highest_price = idea.exit_price * 1.02; // Went 2% higher
          lowest_price = idea.entry_price * 0.98; // Dipped 2% lower initially
        } else {
          highest_price = idea.entry_price * 1.01; // Briefly went higher
          lowest_price = idea.exit_price * 0.99; // Went a bit lower than stop
        }
      }

      const sql = `
        INSERT INTO idea_performance (
          user_email, symbol, idea_type,
          entry_price, entry_date,
          exit_price, exit_date, exit_reason,
          status, profit_loss, profit_loss_percentage, risk_reward_ratio,
          original_target, original_stop_loss,
          highest_price, lowest_price,
          duration_days, expected_timeframe,
          notes, lessons_learned, closed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await client.execute({
        sql,
        args: [
          idea.user_email,
          idea.symbol,
          idea.idea_type,
          idea.entry_price,
          idea.entry_date,
          idea.exit_price || null,
          idea.exit_date || null,
          idea.exit_reason || null,
          idea.status,
          profit_loss,
          profit_loss_percentage,
          risk_reward_ratio,
          idea.original_target,
          idea.original_stop_loss,
          highest_price,
          lowest_price,
          duration_days,
          idea.expected_timeframe,
          idea.notes || null,
          idea.lessons_learned || null,
          closed_at,
        ],
      });

      console.log(`✅ Added ${idea.symbol} (${idea.status})`);
    }

    console.log(`\n✅ Successfully seeded ${DUMMY_IDEAS.length} ideas!`);
    
    // Show statistics
    const winners = DUMMY_IDEAS.filter(i => i.status === 'winner').length;
    const losers = DUMMY_IDEAS.filter(i => i.status === 'loser').length;
    const active = DUMMY_IDEAS.filter(i => i.status === 'active').length;
    const winRate = ((winners / (winners + losers)) * 100).toFixed(1);
    
    console.log(`\nStatistics:`);
    console.log(`- Winners: ${winners}`);
    console.log(`- Losers: ${losers}`);
    console.log(`- Active: ${active}`);
    console.log(`- Win Rate: ${winRate}%`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedIdeas();
