import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByEmail } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { db } from '@/lib/db';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Rate limiting: Track daily usage per user
async function checkRateLimit(userEmail: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  const result = await db.execute({
    sql: `
      SELECT COUNT(*) as count 
      FROM symbol_analyses 
      WHERE user_email = ? AND DATE(created_at) = ?
    `,
    args: [userEmail, today],
  });
  
  const used = Number((result.rows[0] as any)?.count || 0);
  const limit = 30; // PRO limit: 30 requests per day
  
  return {
    allowed: used < limit,
    used,
    limit
  };
}

// Save analysis to database for rate limiting and history
async function saveAnalysis(userEmail: string, symbol: string, analysis: any) {
  await db.execute({
    sql: `
      INSERT INTO symbol_analyses (user_email, symbol, analysis, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `,
    args: [userEmail, symbol.toUpperCase(), JSON.stringify(analysis)],
  });
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const cookieEmail = cookieStore.get('user_email')?.value;
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;
    const userEmail = sessionEmail || cookieEmail;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is PRO
    const user = await getUserByEmail(userEmail);
    if (!user || user.subscription_tier !== 'pro') {
      return NextResponse.json({ 
        error: 'PRO subscription required',
        message: 'Custom symbol analysis is available for PRO members only. Upgrade to unlock this feature.'
      }, { status: 403 });
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(userEmail);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: 'Rate limit exceeded',
        message: `You've reached your daily limit of ${rateLimit.limit} symbol analyses. Resets at midnight UTC.`,
        used: rateLimit.used,
        limit: rateLimit.limit
      }, { status: 429 });
    }

    // Get symbol from request
    const { symbol } = await req.json();
    
    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    
    if (cleanSymbol.length < 1 || cleanSymbol.length > 10) {
      return NextResponse.json({ error: 'Invalid symbol format' }, { status: 400 });
    }

    // Fetch current price from database
    let currentPriceFromDB: number | null = null;
    try {
      const priceResult = await db.execute({
        sql: 'SELECT price FROM market_assets WHERE symbol = ? LIMIT 1',
        args: [cleanSymbol]
      });
      if (priceResult.rows.length > 0) {
        currentPriceFromDB = priceResult.rows[0].price as number;
        console.log(`✅ Found price in DB for ${cleanSymbol}: $${currentPriceFromDB}`);
      } else {
        console.log(`⚠️  No price found in DB for ${cleanSymbol}`);
      }
    } catch (e) {
      console.error('Error fetching price from DB for', cleanSymbol, e);
    }

    // Construct prompt for LLM
    const priceContext = currentPriceFromDB 
      ? `\n\n**IMPORTANT - CURRENT MARKET DATA:**\nThe current price of ${cleanSymbol} is $${currentPriceFromDB.toFixed(2)} (from live market data).\nYou MUST use this exact price as your reference point. Calculate all entry, stop loss, and target levels relative to this current price.\nDo NOT use outdated prices from your training data.\n\n`
      : '';

    const prompt = `You are MarketOracle, a professional trading assistant.
Your task is to provide scenario-based, educational swing trading analysis (2–6 weeks) for **any financial instrument**: stocks, ETFs, or crypto (use USD pairs for crypto).
${priceContext}
Requirements:
1. Analyze current market context for the symbol: ${cleanSymbol}
2. Identify the technical structure using Elliott Wave or other common patterns, if relevant.
3. Provide **conditional trade scenarios**, not direct buy/sell instructions.
4. Include:
   - tradeable: true/false (whether the asset is suitable for swing trading now)
   - current_price: ${currentPriceFromDB ? `MUST be ${currentPriceFromDB.toFixed(2)} (from live data provided above)` : 'estimated current price (number)'}
   - market_context: one sentence summary
   - entry: suggested entry price or range (string) - must be realistic relative to current_price
   - stop_loss: suggested stop loss price (string) - must be realistic relative to current_price
   - targets: array of target prices (array of strings) - must be realistic relative to current_price
   - scenarios: 
       - bull_case: {condition, entry_zone, risk, targets}
       - bear_case: {condition, entry_zone, risk, targets}
   - do_not_trade_if: list of conditions
   - confidence: low/medium/high
   - timeframe: 2–6 weeks
5. Format output **strictly as JSON**.
6. Never use HTML, markdown, or emojis.
7. Include numeric prices for entry, stop_loss, targets, and current_price.
8. **CRITICAL: All price levels must be calculated from the current_price provided above, not from memory**
9. **Do not give financial advice**; make clear this is informational and educational.
10. If the symbol is invalid, illiquid, or has insufficient data, set "tradeable": false and explain in market_context.

Example output (prices are illustrative only - use actual current_price from above):

{
  "symbol": "TSLA",
  "tradeable": true,
  "current_price": 260,
  "entry": "255-260",
  "stop_loss": "240",
  "targets": ["285", "300", "320"],
  "market_context": "High volatility, Wave 4 correction ending, trending higher",
  "scenarios": {
    "bull_case": {
      "condition": "Break above 265 with volume",
      "entry_zone": "265–270",
      "risk": "medium",
      "targets": ["285", "300"]
    },
    "bear_case": {
      "condition": "Lose 245 support",
      "entry_zone": "240–245",
      "risk": "high",
      "targets": ["225"]
    }
  },
  "do_not_trade_if": [
    "Earnings within 48 hours",
    "Low volume or choppy structure"
  ],
  "confidence": "medium",
  "timeframe": "2–4 weeks"
}

Now analyze: ${cleanSymbol}`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a professional trading analysis assistant. Provide only educational, scenario-based analysis. Never give direct buy/sell advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content || '';

    console.log('LLM response length:', analysisText.length);
    console.log('Response preview:', analysisText.substring(0, 200));

    // Parse JSON response
    let analysis;
    try {
      // Clean up response (remove markdown code blocks if present)
      let cleanText = analysisText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
      }
      
      // Check if JSON is complete
      if (!cleanText.endsWith('}')) {
        console.error('Incomplete JSON detected. Response may have been cut off.');
        console.error('Last 200 chars:', cleanText.substring(cleanText.length - 200));
        return NextResponse.json({ 
          error: 'Analysis response was incomplete. This may be due to complexity - try again or use a simpler symbol.',
          raw: analysisText.substring(0, 500) + '...'
        }, { status: 500 });
      }
      
      analysis = JSON.parse(cleanText);
      analysis.symbol = cleanSymbol; // Ensure symbol is uppercase
    } catch (e) {
      console.error('Failed to parse LLM response:', e);
      console.error('Response text:', analysisText);
      return NextResponse.json({ 
        error: 'Failed to parse analysis. The AI response was not in the expected format.',
        raw: analysisText.substring(0, 500) + '...'
      }, { status: 500 });
    }

    // Save to database
    await saveAnalysis(userEmail, cleanSymbol, analysis);

    // Return analysis with rate limit info
    return NextResponse.json({
      ...analysis,
      rateLimit: {
        used: rateLimit.used + 1,
        limit: rateLimit.limit,
        remaining: rateLimit.limit - rateLimit.used - 1
      },
      disclaimer: 'This analysis is for informational and educational purposes only and does not constitute investment advice. Always do your own research and consult with a licensed financial advisor.'
    });

  } catch (error: any) {
    console.error('Error analyzing symbol:', error);
    return NextResponse.json({ 
      error: 'Analysis failed',
      message: error.message 
    }, { status: 500 });
  }
}

// GET endpoint to fetch analysis history
export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookieEmail = cookieStore.get('user_email')?.value;
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;
    const userEmail = sessionEmail || cookieEmail;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserByEmail(userEmail);
    if (!user || user.subscription_tier !== 'premium') {
      return NextResponse.json({ error: 'PRO subscription required' }, { status: 403 });
    }

    // Get today's usage for rate limit display
    const rateLimit = await checkRateLimit(userEmail);

    // Get recent analyses (last 30 days)
    const result = await db.execute({
      sql: `
        SELECT symbol, analysis, created_at 
        FROM symbol_analyses 
        WHERE user_email = ? AND created_at >= datetime('now', '-30 days')
        ORDER BY created_at DESC 
        LIMIT 50
      `,
      args: [userEmail],
    });

    const history = result.rows.map((row: any) => ({
      symbol: row.symbol,
      analysis: JSON.parse(row.analysis),
      created_at: row.created_at
    }));

    return NextResponse.json({
      history,
      rateLimit
    });

  } catch (error: any) {
    console.error('Error fetching analysis history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
