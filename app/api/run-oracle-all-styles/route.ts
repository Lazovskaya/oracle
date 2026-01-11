// Generate predictions for all three trading styles
// This endpoint should be called 2x per day via cron job or manual trigger
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildOraclePrompt } from "@/lib/oraclePrompt";
import { getMarketSnapshot, formatMarketSnapshotForPrompt, getFilterStrategy } from "@/lib/marketFilterService";
import { translateOracleToAllLanguages } from "@/lib/translateOracle";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max for generating all styles

const FALLBACK_MODELS = ["gpt-5-mini", "gpt-5.1", "gpt-4o-mini", "gpt-4o", "gpt-4-turbo"];

async function callLLM(prompt: string, preferredModel?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const client = new OpenAI({ apiKey });

  const requested = preferredModel || process.env.OPENAI_MODEL || "gpt-5-mini";
  const candidates = [requested, ...FALLBACK_MODELS.filter(m => m !== requested)];

  for (const model of candidates) {
    try {
      console.info(`OpenAI: trying model=${model}`);
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 1800,
      });

      const text = completion?.choices?.[0]?.message?.content ?? "";
      const finishReason = completion?.choices?.[0]?.finish_reason;
      
      if (text && text.trim().length > 0) {
        console.info(`✅ OpenAI: model=${model} succeeded, length=${text.length}, finish_reason=${finishReason}`);
        return { text, modelUsed: model };
      }

      console.warn(`⚠️  OpenAI: model=${model} returned empty content (finish_reason=${finishReason}), trying next candidate.`);
    } catch (err: any) {
      console.error(`OpenAI call failed for model=${model}:`, String(err?.message ?? err));
    }
  }

  throw new Error("OpenAI returned no content from any candidate models");
}

async function generateForStyle(
  style: 'conservative' | 'balanced' | 'aggressive',
  run_date: string,
  englishOnly: boolean = false,
  preferredModel?: string
): Promise<{ style: string; ideasCount: number }> {
  console.log(`\n=== Generating ${style.toUpperCase()} predictions ===`);
  
  // Generate for both asset preferences
  const assetPref = 'both';
  
  console.log(`Style: ${style}, Assets: ${assetPref}`);
  
  // Determine asset types (both crypto and stocks)
  const assetTypes: ('crypto' | 'stock' | 'etf')[] = ['crypto', 'stock', 'etf'];
  
  // Get filter strategy based on trading style
  const filterStrategy = getFilterStrategy(style, assetPref);
  
  // Fetch curated market snapshot
  const marketAssets = await getMarketSnapshot({
    strategy: filterStrategy,
    assetTypes,
    limit: 25,
    tradingStyle: style
  });
  
  console.log(`[${style}] Fetched ${marketAssets.length} market assets for analysis`);
  
  // Format market snapshot for prompt
  const marketSnapshotText = formatMarketSnapshotForPrompt(marketAssets);
  
  // Get model for prompt optimization
  const requested = process.env.OPENAI_MODEL ?? "gpt-5-mini";
  const candidates = [requested, ...FALLBACK_MODELS.filter(m => m !== requested)];
  const model = candidates[0]; // Use first model in fallback chain
  
  const prompt = buildOraclePrompt(marketSnapshotText, style, assetPref, model);
  const { text: raw, modelUsed } = await callLLM(prompt, preferredModel);

  let market_phase: string | null = null;
  let ideasCount = 0;
  try {
    const parsed = JSON.parse(raw);
    market_phase = parsed.market_phase ?? null;
    ideasCount = Array.isArray(parsed.ideas) ? parsed.ideas.length : 0;
  } catch {
    market_phase = raw.split("\n")[0].slice(0, 200);
  }

  let translations = { ru: '', fr: '', es: '', zh: '' };
  
  if (!englishOnly) {
    console.log(`Translating ${style} result to RU, FR, ES, ZH...`);
    translations = await translateOracleToAllLanguages(raw);
    console.log(`Translation completed for ${style}`);
  } else {
    console.log(`Skipping translations for ${style} (English only mode)`);
  }

  await db.execute({
    sql: `
      INSERT INTO oracle_runs (run_date, market_phase, result, result_ru, result_fr, result_es, result_zh, trading_style, asset_preference, model_used)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [run_date, market_phase, raw, translations.ru, translations.fr, translations.es, translations.zh, style, assetPref, modelUsed],
  });

  console.log(`✅ Stored ${style} + ${assetPref} predictions (${ideasCount} ideas)`);
  
  return { style, ideasCount };
}

export async function POST(req: Request) {
  try {
    const startTime = Date.now();
    console.log("🚀 Starting all-styles oracle generation...");

    const body = await req.json().catch(() => ({}));
    const englishOnly = body.englishOnly ?? false;
    const preferredModel = body.model || undefined;

    const run_date = new Date().toISOString().slice(0, 10);

    // Generate for all three styles
    const styles: ('conservative' | 'balanced' | 'aggressive')[] = ['conservative', 'balanced', 'aggressive'];
    const results = [];
    
    for (const style of styles) {
      const result = await generateForStyle(style, run_date, englishOnly, preferredModel);
      results.push(result);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ All styles generated successfully in ${duration}s`);

    return NextResponse.json({ 
      ok: true, 
      message: "Generated predictions for all 3 trading styles",
      results,
      duration: `${duration}s`
    });
  } catch (err: any) {
    console.error("run-oracle-all-styles error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req as unknown as Request);
}
