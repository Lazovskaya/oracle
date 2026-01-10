// Generate predictions for all three trading styles
// This endpoint should be called 2x per day via cron job or manual trigger
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildOraclePrompt } from "@/lib/oraclePrompt";
import { fetchMultiplePrices } from "@/lib/priceService";
import { translateOracleToAllLanguages } from "@/lib/translateOracle";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max for generating all styles

const FALLBACK_MODELS = ["gpt-4.1-mini", "gpt-4o-mini", "gpt-4o"];

async function callLLM(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const client = new OpenAI({ apiKey });

  const requested = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
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

async function generateForStyle(
  style: 'conservative' | 'balanced' | 'aggressive',
  currentPrices: Record<string, { price: number; change24h: number }>,
  run_date: string
) {
  console.log(`\n=== Generating ${style.toUpperCase()} predictions ===`);
  
  // Generate for both asset preferences
  const assetPreferences: ('crypto' | 'stocks' | 'both')[] = ['both'];
  
  for (const assetPref of assetPreferences) {
    console.log(`Style: ${style}, Assets: ${assetPref}`);
    
    const prompt = buildOraclePrompt(currentPrices, style, assetPref);
    const { text: raw, modelUsed } = await callLLM(prompt);

    let market_phase: string | null = null;
    try {
      const parsed = JSON.parse(raw);
      market_phase = parsed.market_phase ?? null;
    } catch {
      market_phase = raw.split("\n")[0].slice(0, 200);
    }

    console.log(`Translating ${style} result to RU, FR, ES, ZH...`);
    const translations = await translateOracleToAllLanguages(raw);
    console.log(`Translation completed for ${style}`);

    await db.execute({
      sql: `
        INSERT INTO oracle_runs (run_date, market_phase, result, result_ru, result_fr, result_es, result_zh, trading_style, asset_preference, model_used)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [run_date, market_phase, raw, translations.ru, translations.fr, translations.es, translations.zh, style, assetPref, modelUsed],
    });

    console.log(`✅ Stored ${style} + ${assetPref} predictions`);
  }
}

export async function POST(req: Request) {
  try {
    const startTime = Date.now();
    console.log("🚀 Starting all-styles oracle generation...");

    // Fetch current prices once
    const popularSymbols = ['BTC', 'ETH', 'SOL', 'AAPL', 'MSFT', 'TSLA', 'NVDA', 'SPY', 'QQQ'];
    console.info('Fetching current market prices...');
    const priceData = await fetchMultiplePrices(popularSymbols);
    
    const currentPrices: Record<string, { price: number; change24h: number }> = {};
    for (const [symbol, data] of Object.entries(priceData)) {
      if (data?.currentPrice) {
        currentPrices[symbol] = {
          price: data.currentPrice,
          change24h: data.change24h || 0
        };
      }
    }
    
    console.info(`✅ Fetched ${Object.keys(currentPrices).length} current prices`);

    const run_date = new Date().toISOString().slice(0, 10);

    // Generate for all three styles
    const styles: ('conservative' | 'balanced' | 'aggressive')[] = ['conservative', 'balanced', 'aggressive'];
    
    for (const style of styles) {
      await generateForStyle(style, currentPrices, run_date);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ All styles generated successfully in ${duration}s`);

    return NextResponse.json({ 
      ok: true, 
      message: "Generated predictions for all 3 trading styles",
      styles: ['conservative', 'balanced', 'aggressive'],
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
