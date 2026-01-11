/**
 * Oracle Runner Service
 * Generates oracle predictions for different trading styles
 */

import { buildOraclePrompt } from './oraclePrompt';
import { getMarketSnapshot, formatMarketSnapshotForPrompt, getFilterStrategy } from './marketFilterService';
import { translateOracleToAllLanguages } from './translateOracle';
import db from './db';
import OpenAI from 'openai';

const FALLBACK_MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-4"];

/**
 * Call OpenAI with retry and fallback logic
 */
async function callLLM(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const client = new OpenAI({ apiKey });
  const requested = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const candidates = [requested, ...FALLBACK_MODELS.filter(m => m !== requested)];

  for (const model of candidates) {
    try {
      console.info(`OpenAI: trying model=${model}`);
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 1200,
      });

      const text = completion?.choices?.[0]?.message?.content ?? "";
      if (text && text.trim().length > 0) {
        return { text, modelUsed: model };
      }

      console.warn(`OpenAI: model=${model} returned empty content, trying next candidate.`);
    } catch (err: any) {
      console.error(`OpenAI call failed for model=${model}:`, String(err?.message ?? err));
    }
  }

  throw new Error("OpenAI returned no content from any candidate models");
}

/**
 * Generate oracle for a specific trading style
 */
export async function generateOracleForStyle(
  tradingStyle: 'conservative' | 'balanced' | 'aggressive',
  assetPreference: 'crypto' | 'stocks' | 'both' = 'both',
  englishOnly: boolean = true // Default to English only for cron jobs
) {
  console.log(`Generating oracle for ${tradingStyle} style, ${assetPreference} assets, englishOnly=${englishOnly}`);

  // Determine asset types
  const assetTypes: ('crypto' | 'stock' | 'etf')[] = 
    assetPreference === 'crypto' ? ['crypto'] :
    assetPreference === 'stocks' ? ['stock', 'etf'] :
    ['crypto', 'stock', 'etf'];

  // Get filter strategy
  const filterStrategy = getFilterStrategy(tradingStyle, assetPreference);

  // Fetch curated market snapshot
  const marketAssets = await getMarketSnapshot({
    strategy: filterStrategy,
    assetTypes,
    limit: 25,
    tradingStyle
  });

  console.log(`Fetched ${marketAssets.length} assets for ${tradingStyle} analysis`);

  // Format for prompt
  const marketSnapshotText = formatMarketSnapshotForPrompt(marketAssets);

  // Get model
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  // Build prompt with model-specific optimization
  const prompt = buildOraclePrompt(marketSnapshotText, tradingStyle, assetPreference, model);

  // Call LLM
  const { text: raw, modelUsed } = await callLLM(prompt);

  // Parse market phase
  let market_phase: string | null = null;
  try {
    const parsed = JSON.parse(raw);
    market_phase = parsed.market_phase ?? null;
  } catch {
    market_phase = raw.split("\n")[0].slice(0, 200);
  }

  const run_date = new Date().toISOString().slice(0, 10);

  // Translate to all languages (skip if englishOnly)
  let translations = { ru: '', fr: '', es: '', zh: '' };
  if (!englishOnly) {
    console.log("Translating oracle result...");
    translations = await translateOracleToAllLanguages(raw);
  } else {
    console.log("Skipping translations (englishOnly=true)");
  }

  // Store in database
  const res = await db.execute({
    sql: `
      INSERT INTO oracle_runs (
        run_date, market_phase, result, 
        result_ru, result_fr, result_es, result_zh, 
        model_used, trading_style, asset_preference
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      run_date, 
      market_phase, 
      raw,
      translations.ru, 
      translations.fr, 
      translations.es, 
      translations.zh,
      modelUsed,
      tradingStyle,
      assetPreference
    ],
  });

  return {
    success: true,
    runDate: run_date,
    marketPhase: market_phase,
    modelUsed,
    tradingStyle,
    assetPreference,
    assetsAnalyzed: marketAssets.length
  };
}
