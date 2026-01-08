// Build a clear structured prompt for the LLM. Kept concise and deterministic.
// The prompt asks for a structured JSON-ish output with <=5 ideas and required fields.
export function buildOraclePrompt(
  currentPrices?: Record<string, { price: number; change24h: number }>,
  tradingStyle?: 'conservative' | 'balanced' | 'aggressive',
  assetPreference?: 'crypto' | 'stocks' | 'both'
): string {
  
  let pricesContext = '';
  if (currentPrices && Object.keys(currentPrices).length > 0) {
    pricesContext = '\n\n**CURRENT REAL-TIME MARKET PRICES:**\n';
    for (const [symbol, data] of Object.entries(currentPrices)) {
      pricesContext += `${symbol}: $${data.price.toFixed(2)} (${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(2)}% 24h)\n`;
    }
    pricesContext += '\n**CRITICAL:** You MUST use these current prices as the basis for your entry/stop/target levels. Entry should be within 5% of current price, stops should be realistic (5-10% away), targets should be achievable within the timeframe.\n';
  }

  // Build trading style context
  let styleContext = '';
  if (tradingStyle) {
    if (tradingStyle === 'conservative') {
      styleContext = '\n\n**TRADING STYLE: CONSERVATIVE**\n- Use tighter stop-losses (3-5% max)\n- Favor lower-risk, higher-probability setups\n- Prefer smaller position sizes and lower leverage\n- Choose more established, less volatile assets\n- Target more modest returns (10-20%)\n';
    } else if (tradingStyle === 'balanced') {
      styleContext = '\n\n**TRADING STYLE: BALANCED**\n- Use moderate stop-losses (5-10%)\n- Balance risk and reward\n- Standard position sizing\n- Mix of established and emerging opportunities\n- Target moderate returns (20-40%)\n';
    } else if (tradingStyle === 'aggressive') {
      styleContext = '\n\n**TRADING STYLE: AGGRESSIVE**\n- Use wider stop-losses (10-15%)\n- Focus on high-reward opportunities\n- Allow for higher volatility and risk\n- Include more speculative plays\n- Target higher returns (40%+)\n';
    }
  }

  // Build asset preference context
  let assetContext = '';
  if (assetPreference === 'crypto') {
    assetContext = '\n\n**ASSET PREFERENCE: CRYPTO ONLY**\n- ONLY provide ideas for cryptocurrencies (BTC, ETH, and top altcoins)\n- DO NOT include any stocks, ETFs, or traditional equities\n- Focus on crypto-specific market dynamics\n';
  } else if (assetPreference === 'stocks') {
    assetContext = '\n\n**ASSET PREFERENCE: STOCKS ONLY**\n- ONLY provide ideas for US stocks and ETFs\n- DO NOT include any cryptocurrencies\n- Focus on traditional equity market dynamics\n';
  } else if (assetPreference === 'both') {
    assetContext = '\n\n**ASSET PREFERENCE: BOTH (CRYPTO & STOCKS)**\n- Include a mix of cryptocurrencies AND US stocks/ETFs\n- Diversify across asset classes\n';
  }
  
  return `
You are MarketOracle, a professional swing-trading analyst. Your goal is to generate **3–5 high-quality swing trade ideas (2–6 week horizon)** for US stocks, ETFs, and large-cap crypto (BTC, ETH, top altcoins).
${pricesContext}${styleContext}${assetContext}
Requirements:
1. Independently select symbols to trade — do not rely on a predefined list. Pick well-known, liquid tickers or coins.
2. Estimate **current market prices** based on historical knowledge, recent trends, and macro context.
3. Determine overall **market phase** (risk-on/risk-off, macro trend) in one sentence.
4. Perform **Elliott Wave reasoning**, describing wave structure (Wave 2/4 correction, Wave 3/5 impulse, ABC correction).
5. Calculate **numeric entry, stop, and targets**:
   - Entry: at retracement zone of last impulsive wave
   - Stop: logical invalidation level
   - Targets: extensions of prior wave, 1–3 levels
6. Output **machine-readable JSON only**, with this format:

{
  "market_phase": "<one-sentence summary>",
  "wave_structure": "<brief Elliott Wave context>",
  "ideas": [
    {
      "symbol": "<ticker>",
      "bias": "bullish | bearish | neutral",
      "wave_context": "<wave description>",
      "rationale": "<1–3 sentence reasoning>",
      "entry": { "type": "price", "value": <numeric> },
      "stop": { "type": "price", "value": <numeric> },
      "targets": [
        { "type": "price", "value": <numeric> },
        { "type": "price", "value": <numeric> }
      ],
      "timeframe": "2–6 weeks",
      "confidence": "low | medium | high",
      "risk_note": "optional if higher risk"
    }
  ]
}

Constraints:
- Max 5 ideas.
- No scalping or intraday trades.
- Use USD pairs for crypto.
- Output numeric prices based on GPT's best estimate, not percentages.
- Prefer asymmetric setups (risk/reward ≥ 1:3).
- Keep text concise and actionable.


`.trim();
}
