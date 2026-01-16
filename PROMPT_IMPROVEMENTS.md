# Prompt Improvements & Multi-Step Chain Approach

## Current Prompt Issues

### 1. **Symbol Hallucination** (Critical)
**Problem**: LLM suggests symbols NOT in the market snapshot despite explicit instructions.

**Current Prompt Weakness**:
```
"YOU MUST ONLY USE SYMBOLS FROM THE MARKET SNAPSHOT ABOVE"
```

**Why It Fails**:
- Instruction is buried in long prompt
- LLM's training data overrides instructions
- Single-pass generation doesn't allow for validation
- No structured symbol selection phase

**Examples of Failures**:
- Snapshot has: `BTC, ETH, SOL, AVAX`
- LLM suggests: `BTC, ETH, LINK, DOT` (LINK, DOT not in snapshot)

### 2. **Price Staleness** (Critical)
**Problem**: Entry/stop/targets calculated from training data prices, not current prices.

**Current Prompt**:
```
"Use EXACT current prices from market snapshot - calculate all levels relative to these prices"
```

**Why It Fails**:
- Training data prices (e.g., XRP at $0.60) override current prices ($2.10)
- No explicit price validation step
- LLM doesn't "anchor" strongly enough to provided data

**Examples**:
- Current: `XRP: $2.10, +54% (7d)`
- LLM suggests: Entry $0.65, Stop $0.55, Target $0.80
- These are 2022 prices, not current market!

### 3. **Inconsistent Idea Count**
**Problem**: Sometimes 2 ideas, sometimes 6+ ideas.

**Current Prompt**:
```
"Generate 3-5 high-quality swing trade ideas"
"MINIMUM 3 ideas required (ideally 4-5)"
```

**Why It Fails**:
- "3-5" is a range, not a strict requirement
- LLM may interpret "minimum 3" as acceptable even if below ideal
- No enforcement mechanism

### 4. **Output Format Issues**
**Problem**: Markdown blocks, JavaScript comments, trailing commas.

**Current Mitigation**: Post-processing cleanup (works but reactive)

**Why It Happens**:
- LLM trained on code examples with markdown
- Instinct to "explain" JSON with comments
- No strong format enforcement

### 5. **Elliott Wave Reliability**
**Problem**: Wave counts often incorrect or inconsistent.

**Current Prompt**:
```
"Perform Elliott Wave reasoning, describing wave structure"
```

**Why It Fails**:
- Elliott Wave is complex technical analysis requiring specific training
- LLMs lack specialized Elliott Wave knowledge
- No validation against wave rules (e.g., Wave 3 can't be shortest)

---

## Multi-Step Chain Approach

### Concept: Break single prompt into specialized phases

Instead of asking LLM to do everything at once:
1. Analyze market
2. Select symbols
3. Calculate levels
4. Format output

We create a **chain of prompts** where each step has a focused responsibility.

---

## Proposed Chain Architecture

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Market Analysis                                │
│  Input: Market snapshot (20-30 assets)                  │
│  Output: Market regime, sector analysis, top candidates │
│  Focus: Understanding market context                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 2: Symbol Selection & Validation                  │
│  Input: Step 1 output + market snapshot                 │
│  Output: 4-5 valid symbols with rationale               │
│  Focus: Selecting ONLY from snapshot, no hallucination  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 3: Technical Level Calculation                    │
│  Input: Selected symbols + current prices               │
│  Output: Entry, stop, targets with calculations         │
│  Focus: Price anchoring, realistic levels               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 4: Final Assembly & Formatting                    │
│  Input: All previous outputs                            │
│  Output: Structured JSON predictions                    │
│  Focus: Clean format, final validation                  │
└─────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Prompt Design

### STEP 1: Market Analysis

**Purpose**: Understand market regime and identify promising candidates

**Prompt**:
```
You are a market analyst reviewing current market conditions.

MARKET DATA:
${marketSnapshot}

TRADING STYLE: ${tradingStyle}
ASSET PREFERENCE: ${assetPreference}

Your task: Analyze the market and identify 8-10 promising candidates for swing trades (2-6 weeks).

OUTPUT FORMAT (plain text, no JSON):

1. MARKET REGIME:
   - Overall sentiment: risk-on / risk-off / mixed
   - Dominant trend: bullish / bearish / range-bound
   - Volatility: low / moderate / high
   - Key drivers: [what's moving the market]

2. SECTOR ANALYSIS:
   - Strongest sectors: [list 2-3]
   - Weakest sectors: [list 2-3]
   - Emerging opportunities: [patterns, breakouts, reversals]

3. TOP CANDIDATES:
   For each of 8-10 symbols from the data above:
   - Symbol: [EXACT symbol from data]
   - Current Price: [EXACT price from data]
   - Reason: [1 sentence - momentum/reversal/breakout]
   - Bias: bullish/bearish/neutral
   - Confidence: low/medium/high

CRITICAL RULES:
- ONLY use symbols from the market data provided above
- ONLY use current prices from the market data
- List EXACTLY 8-10 candidates (not more, not less)
- Copy symbol names EXACTLY as shown (e.g., "BTC", not "Bitcoin")
```

**Why This Works**:
- Focused task: just analyze and list candidates
- No JSON formatting pressure
- Explicit symbol/price extraction
- Clear count requirement (8-10)

**Example Output**:
```
1. MARKET REGIME:
   - Overall sentiment: risk-on
   - Dominant trend: bullish
   - Volatility: moderate
   - Key drivers: Crypto momentum, tech earnings optimism

2. SECTOR ANALYSIS:
   - Strongest: Cryptocurrencies, semiconductor stocks
   - Weakest: Traditional finance, utilities
   - Emerging opportunities: Altcoin breakouts, AI stock consolidation

3. TOP CANDIDATES:
   1. BTC - $96,500 - Strong uptrend continuation, high volume - bullish - high
   2. ETH - $3,313 - Following BTC with solid fundamentals - bullish - high
   3. SOL - $205 - Breaking resistance, momentum building - bullish - medium
   4. NVDA - $145 - Pullback to support, AI narrative intact - bullish - medium
   5. AAPL - $235 - Consolidation near highs, earnings catalyst - bullish - medium
   6. AVAX - $38 - Oversold bounce potential - bullish - low
   7. DASH - $93 - Explosive move, continuation setup - bullish - high
   8. XMR - $711 - Strong weekly trend - bullish - medium
```

---

### STEP 2: Symbol Selection & Validation

**Purpose**: Narrow to 4-5 best symbols with strict validation

**Prompt**:
```
You are a trade selector reviewing analyst recommendations.

MARKET ANALYSIS FROM STEP 1:
${step1Output}

AVAILABLE SYMBOLS (the ONLY symbols you can choose):
${symbolList} // Extract from market snapshot

Your task: Select the BEST 4-5 trading ideas from the candidates.

SELECTION CRITERIA:
- Highest confidence setups
- Diversification across assets (mix crypto/stocks if applicable)
- Balance of timeframes and risk profiles
- Liquidity and tradability

OUTPUT FORMAT:
List EXACTLY 4-5 symbols, one per line:
Symbol | Current Price | Selection Reason (1 sentence)

Example:
BTC | $96,500 | Strongest momentum with institutional buying
ETH | $3,313 | High-conviction breakout above resistance
NVDA | $145 | Quality pullback with AI narrative support
SOL | $205 | Emerging altcoin leader with volume confirmation

CRITICAL RULES:
- Choose EXACTLY 4-5 symbols (not 3, not 6)
- ONLY use symbols from the available list above
- Copy prices EXACTLY as shown
- Each symbol must appear in available list
```

**Why This Works**:
- Explicit validation: symbols must be in provided list
- Forced to reference the list repeatedly
- Exact count (4-5, not 3-5)
- Simple format reduces hallucination

**Validation After Step 2**:
```typescript
function validateSymbolSelection(output: string, validSymbols: Set<string>): boolean {
  const lines = output.split('\n').filter(l => l.includes('|'));
  
  if (lines.length < 4 || lines.length > 5) {
    console.error(`Invalid count: ${lines.length} ideas (expected 4-5)`);
    return false;
  }
  
  for (const line of lines) {
    const symbol = line.split('|')[0].trim();
    if (!validSymbols.has(symbol)) {
      console.error(`Invalid symbol: ${symbol} not in snapshot`);
      return false;
    }
  }
  
  return true;
}

// If validation fails, retry with stronger prompt or use fallback
```

---

### STEP 3: Technical Level Calculation

**Purpose**: Calculate precise entry/stop/targets anchored to current prices

**Prompt**:
```
You are a technical analyst calculating trade levels.

SELECTED TRADES:
${step2Output}

CURRENT MARKET PRICES (YOUR ANCHOR):
${priceTable} // Symbol | Current Price

Your task: Calculate precise entry, stop-loss, and target levels for each trade.

CALCULATION RULES:
1. START with the CURRENT PRICE shown above as your anchor
2. Entry: 
   - Bullish: 1-3% below current (pullback entry) OR at current (momentum entry)
   - Bearish: 1-3% above current
3. Stop-loss:
   - Conservative: 3-5% from entry
   - Balanced: 5-10% from entry
   - Aggressive: 10-15% from entry
4. Targets:
   - Target 1: 1.5x risk (conservative)
   - Target 2: 3x risk (moderate)
   - Target 3: 5x risk (aggressive)

OUTPUT FORMAT:
For each symbol:
Symbol: [symbol]
Current: $[exact current price from table above]
Entry: $[calculated entry]
Stop: $[calculated stop]
Target 1: $[calculated]
Target 2: $[calculated]
Target 3: $[calculated]
Risk/Reward: [ratio]

Example calculation for BTC at $96,500:
- Entry: $95,000 (pullback entry, ~1.5% below current)
- Stop: $90,500 (5% below entry = $4,500 risk)
- Target 1: $101,750 ($4,500 * 1.5 = $6,750 gain)
- Target 2: $108,500 ($4,500 * 3 = $13,500 gain)
- Target 3: $117,500 ($4,500 * 5 = $22,500 gain)

CRITICAL RULES:
- ALWAYS reference the current price table above
- Calculate entry RELATIVE to current price (not from memory)
- Show your math: [risk amount] * [multiplier] = [target distance]
- If entry is far from current price (>5%), explain the breakout logic
```

**Why This Works**:
- Forces LLM to reference price table explicitly
- Structured calculation process
- Math verification step
- Catches unrealistic levels

**Validation After Step 3**:
```typescript
function validatePriceLevels(symbol: string, current: number, entry: number, stop: number, targets: number[]) {
  // Entry should be near current price (within 5%)
  const entryDeviation = Math.abs((entry - current) / current);
  if (entryDeviation > 0.05) {
    console.warn(`${symbol}: Entry $${entry} is ${(entryDeviation * 100).toFixed(1)}% away from current $${current}`);
  }
  
  // Stop should be beyond entry (for long) or below entry (for short)
  const riskAmount = Math.abs(entry - stop);
  const riskPct = (riskAmount / entry) * 100;
  
  if (riskPct < 2 || riskPct > 20) {
    console.warn(`${symbol}: Risk ${riskPct.toFixed(1)}% seems unusual`);
  }
  
  // Targets should be progressive
  for (let i = 1; i < targets.length; i++) {
    if (targets[i] <= targets[i-1]) {
      console.error(`${symbol}: Target ${i+1} ($${targets[i]}) not greater than Target ${i} ($${targets[i-1]})`);
      return false;
    }
  }
  
  return true;
}
```

---

### STEP 4: Final Assembly

**Purpose**: Combine all steps into clean JSON output

**Prompt**:
```
You are assembling the final trading report.

MARKET ANALYSIS:
${step1MarketRegime}

SELECTED TRADES:
${step2Selections}

TECHNICAL LEVELS:
${step3Calculations}

Your task: Create a final JSON report combining all the information above.

OUTPUT FORMAT (PURE JSON, NO MARKDOWN, NO COMMENTS):
{
  "market_phase": "<1 sentence from market regime>",
  "wave_structure": "<brief Elliott Wave context>",
  "ideas": [
    {
      "symbol": "<exact symbol>",
      "bias": "bullish",
      "wave_context": "<Wave 3 impulse / Wave 2 correction / etc>",
      "rationale": "<combine selection reason + technical context, 2-3 sentences>",
      "entry": { "type": "price", "value": <number> },
      "stop": { "type": "price", "value": <number> },
      "targets": [
        { "type": "price", "value": <number> },
        { "type": "price", "value": <number> },
        { "type": "price", "value": <number> }
      ],
      "timeframe": "2–6 weeks",
      "confidence": "low|medium|high",
      "risk_note": "<optional risk warning>"
    }
  ]
}

CRITICAL RULES:
- Output ONLY valid JSON (no markdown, no ```, no comments)
- Include ALL 4-5 symbols from the selections
- Use EXACT prices from technical levels
- No trailing commas
- No extra text before or after JSON
```

**Post-Processing**:
```typescript
function assembleFinalOutput(step1: string, step2: string, step3: string, step4: string) {
  let json = step4.trim();
  
  // Final cleaning
  json = json.replace(/^```(?:json)?\s*/gm, '').replace(/\s*```\s*$/gm, '');
  json = json.replace(/\/\/[^\n]*/g, '');
  json = json.replace(/\/\*[\s\S]*?\*\//g, '');
  json = json.replace(/,(\s*[}\]])/g, '$1');
  
  try {
    const parsed = JSON.parse(json);
    
    // Final validation
    if (!parsed.ideas || parsed.ideas.length < 4 || parsed.ideas.length > 5) {
      throw new Error(`Invalid idea count: ${parsed.ideas.length}`);
    }
    
    return parsed;
  } catch (e) {
    console.error('Final assembly failed:', e);
    throw new Error('Unable to generate valid predictions');
  }
}
```

---

## Implementation Strategy

### Option 1: Sequential Chain (Recommended)

**Pros**:
- Maximum control and validation at each step
- Easy to debug which step fails
- Can retry individual steps
- Transparent reasoning

**Cons**:
- 4 LLM calls = higher cost (~4x)
- Slower (4-5 seconds per step = 16-20 seconds total)
- More complex code

**Implementation**:
```typescript
export async function runOracleWithChain(
  marketAssets: MarketAsset[],
  tradingStyle: string,
  assetPreference: string
): Promise<OraclePrediction> {
  
  // Step 1: Market Analysis
  const step1Prompt = buildStep1Prompt(marketAssets, tradingStyle, assetPreference);
  const step1Result = await callLLM(step1Prompt, 'gpt-4o-mini'); // Cheaper model for analysis
  
  // Step 2: Symbol Selection
  const validSymbols = new Set(marketAssets.map(a => a.symbol));
  const step2Prompt = buildStep2Prompt(step1Result, validSymbols);
  const step2Result = await callLLM(step2Prompt, 'gpt-4o-mini');
  
  // Validate symbols
  if (!validateSymbolSelection(step2Result, validSymbols)) {
    console.error('Symbol validation failed, retrying with stricter prompt...');
    const step2RetryPrompt = buildStep2Prompt(step1Result, validSymbols, { strict: true });
    const step2Result = await callLLM(step2RetryPrompt, 'gpt-4o-mini');
  }
  
  // Step 3: Level Calculation
  const selectedSymbols = extractSymbolsFromStep2(step2Result);
  const priceTable = buildPriceTable(marketAssets, selectedSymbols);
  const step3Prompt = buildStep3Prompt(step2Result, priceTable, tradingStyle);
  const step3Result = await callLLM(step3Prompt, 'gpt-4o'); // More powerful for calculations
  
  // Validate price levels
  const levels = extractLevelsFromStep3(step3Result);
  for (const level of levels) {
    if (!validatePriceLevels(level.symbol, level.current, level.entry, level.stop, level.targets)) {
      console.warn(`Price validation warning for ${level.symbol}`);
    }
  }
  
  // Step 4: Final Assembly
  const step4Prompt = buildStep4Prompt(step1Result, step2Result, step3Result);
  const step4Result = await callLLM(step4Prompt, 'gpt-4o-mini'); // Cheaper for formatting
  
  // Parse and validate final JSON
  return assembleFinalOutput(step1Result, step2Result, step3Result, step4Result);
}
```

### Option 2: Parallel with Merge

**Concept**: Run Step 1 (analysis) + Step 2 (selection) in parallel, then Step 3 + 4

**Pros**:
- Faster (2 sequential phases instead of 4)
- Lower cost than sequential

**Cons**:
- Step 2 can't use Step 1 output (lower quality)
- Less validation opportunities

### Option 3: Hybrid (Best Balance)

**Concept**: 
- Step 1 + 2 combined (analysis + selection) → 1 call
- Step 3 (calculation with validation) → 1 call
- Step 4 (assembly) → 1 call

**Pros**:
- 3 LLM calls (reasonable cost/time)
- Still maintains key validations
- Faster than full chain

**Implementation**:
```typescript
// Combined Step 1+2: Analysis and Selection
const analysisPrompt = buildAnalysisAndSelectionPrompt(marketAssets, tradingStyle);
const analysisResult = await callLLM(analysisPrompt, 'gpt-4o');

// Step 3: Calculation (with strict price anchoring)
const calculationPrompt = buildCalculationPrompt(analysisResult, priceTable);
const calculationResult = await callLLM(calculationPrompt, 'gpt-4o');

// Step 4: Assembly
const assemblyPrompt = buildAssemblyPrompt(analysisResult, calculationResult);
const finalResult = await callLLM(assemblyPrompt, 'gpt-4o-mini');
```

---

## Enhanced Single-Prompt Alternative

If multi-step is too complex initially, here's an improved single prompt:

### Critical Fixes to Current Prompt

**1. Symbol Validation Section** (add at top):
```
CRITICAL: SYMBOL VALIDATION CHECKPOINT

Before generating ideas, you must:
1. List ALL symbols from the market snapshot below
2. Mark which 4-5 symbols you will analyze
3. Verify your selected symbols are in the snapshot

Example:
Available symbols: BTC, ETH, SOL, AVAX, MATIC, DOT, LINK, NVDA, AAPL
Selected symbols: BTC ✓, ETH ✓, NVDA ✓, AAPL ✓, SOL ✓

If you catch yourself suggesting a symbol NOT in the available list, STOP and choose a different symbol.
```

**2. Price Anchoring Section** (add before calculations):
```
PRICE ANCHORING CHECKPOINT

Before calculating entry/stop/targets:
1. Write down the CURRENT PRICE from the snapshot for each symbol
2. Calculate your entry as: current_price ± [percentage]
3. Show your math: "BTC current: $96,500 → Entry: $95,000 (1.5% pullback)"

DO NOT use prices from your training data. ONLY use prices from the snapshot above.

If your entry is >5% away from current price, explain why (e.g., "Waiting for breakout above $100,000 resistance").
```

**3. Idea Count Enforcement**:
```
STRICT REQUIREMENT: Generate EXACTLY 4 ideas

- Not 3 (too few for diversification)
- Not 5 (acceptable but not required)
- Not 6+ (too many, reduces quality)
- EXACTLY 4 ideas

Count your ideas before outputting to ensure you have 4.
```

**4. Format Enforcement**:
```
OUTPUT FORMAT RULES:

✅ DO:
- Output pure JSON
- Use double quotes for strings
- No trailing commas
- Numeric values without quotes

❌ DON'T:
- Don't wrap in ```json markers
- Don't add // comments
- Don't add explanatory text
- Don't use single quotes

If you find yourself adding markdown or comments, DELETE them and output only JSON.
```

---

## Recommended Approach

### Phase 1: Enhanced Single Prompt (Week 1)
- Implement all 4 checkpoint sections above
- Add post-processing validation (symbol check, price check)
- Retry with stricter prompt if validation fails
- Measure improvement in accuracy

### Phase 2: Hybrid 3-Step Chain (Week 2-3)
- If Phase 1 doesn't achieve >90% reliability
- Implement 3-step hybrid approach
- Monitor cost vs quality tradeoff

### Phase 3: Full 4-Step Chain (Month 2)
- If extreme accuracy needed (e.g., for paid API customers)
- Maximum transparency and debuggability
- Accept higher cost for institutional-grade predictions

---

## Success Metrics

Track these to measure improvement:

1. **Symbol Accuracy**: % of ideas with valid symbols from snapshot
   - Current: ~85%
   - Target: 100%

2. **Price Realism**: % of entries within 5% of current price
   - Current: ~70%
   - Target: 95%+

3. **Idea Count Consistency**: % of runs with exactly 4-5 ideas
   - Current: ~60%
   - Target: 100%

4. **Format Validity**: % of runs with clean JSON (no retry needed)
   - Current: ~80%
   - Target: 95%+

5. **End-to-End Success Rate**: % of runs requiring no manual intervention
   - Current: ~50%
   - Target: 90%+

---

## Cost Analysis

### Current Single Prompt:
- 1 call per style (3 calls total for conservative/balanced/aggressive)
- ~2000 input tokens + ~1500 output tokens per call
- Cost: ~$0.01 per run (with gpt-4o-mini)
- Total: $0.03 per complete oracle cycle

### Hybrid 3-Step Chain:
- 9 calls total (3 steps × 3 styles)
- ~1500 input + ~1000 output tokens per call (smaller focused prompts)
- Cost: ~$0.03 per style = $0.09 per cycle
- **3x cost increase**

### Full 4-Step Chain:
- 12 calls total (4 steps × 3 styles)
- Cost: ~$0.04 per style = $0.12 per cycle
- **4x cost increase**

**Recommendation**: Start with Enhanced Single Prompt (no cost increase), measure improvement, then decide if chain is needed.

---

## Implementation Priority

1. **Immediate (Week 1)**:
   - ✅ Add checkpoint sections to current prompt
   - ✅ Implement post-processing validation
   - ✅ Add retry logic with stricter prompt
   - Measure success metrics

2. **Short-term (Week 2-3)**:
   - If success rate <90%, implement Hybrid 3-Step Chain
   - A/B test: single vs chain
   - Optimize for cost/quality balance

3. **Medium-term (Month 2)**:
   - Consider Full 4-Step Chain for premium tier
   - Build self-healing system (auto-retry bad steps)
   - Add human-in-loop validation for edge cases

---

## Conclusion

**The Problem**: Current single-prompt approach overwhelms LLM with too many responsibilities, leading to hallucination and errors.

**The Solution**: 
1. **Quick Win**: Enhanced single prompt with explicit checkpoints and validation
2. **Next Level**: 3-step hybrid chain for better accuracy
3. **Premium**: 4-step full chain for maximum reliability

**Key Insight**: Breaking complex tasks into focused steps prevents LLM from "skipping ahead" and helps enforce constraints at each phase.

Start with Enhanced Single Prompt → measure → iterate based on results.
