// Server-only API route that builds a prompt, calls OpenAI, stores the run and returns a simple JSON summary.
// Runtime is node to allow the regular OpenAI SDK.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildOraclePrompt } from "@/lib/oraclePrompt";
import { fetchMultiplePrices } from "@/lib/priceService";
import { translateOracleToAllLanguages } from "@/lib/translateOracle";
import { cookies } from "next/headers";
import { getUserByEmail } from "@/lib/auth";
import OpenAI from "openai";

export const runtime = "nodejs";

const FALLBACK_MODELS = ["gpt-4.1-mini", "gpt-4o-mini", "gpt-4o"];

/**
 * Call OpenAI with basic retry + fallback on empty response.
 * Logs full completion for debugging (server logs only).
 */
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

      // Log entire completion for debugging (do not expose to clients)
      try {
        console.debug("OpenAI completion object:", JSON.stringify(completion, null, 2));
      } catch (_) {}

      const text = completion?.choices?.[0]?.message?.content ?? "";
      if (text && text.trim().length > 0) {
        return { text, modelUsed: model };
      }

      console.warn(`OpenAI: model=${model} returned empty content, trying next candidate.`);
    } catch (err: any) {
      // Log error and try next model (could be permission or model-not-found)
      console.error(`OpenAI call failed for model=${model}:`, String(err?.message ?? err));
    }
  }

  throw new Error("OpenAI returned no content from any candidate models");
}

export async function POST(req: Request) {
  try {
    // Get user preferences if logged in
    let tradingStyle: 'conservative' | 'balanced' | 'aggressive' | undefined;
    let assetPreference: 'crypto' | 'stocks' | 'both' | undefined;
    
    try {
      const cookieStore = await cookies();
      const userEmail = cookieStore.get('auth_token')?.value;
      
      if (userEmail) {
        const user = await getUserByEmail(userEmail);
        if (user) {
          tradingStyle = user.trading_style;
          assetPreference = user.asset_preference;
          console.info(`Running oracle with user preferences: style=${tradingStyle}, assets=${assetPreference}`);
        }
      }
    } catch (err) {
      // If we can't get user preferences, continue with defaults
      console.warn('Could not fetch user preferences:', err);
    }
    
    // Define popular symbols to fetch current prices for
    const popularSymbols = ['BTC', 'ETH', 'SOL', 'AAPL', 'MSFT', 'TSLA', 'NVDA', 'SPY', 'QQQ'];
    
    // Fetch current prices
    console.info('Fetching current market prices for popular symbols...');
    const priceData = await fetchMultiplePrices(popularSymbols);
    
    // Format prices for the prompt
    const currentPrices: Record<string, { price: number; change24h: number }> = {};
    for (const [symbol, data] of Object.entries(priceData)) {
      if (data?.currentPrice) {
        currentPrices[symbol] = {
          price: data.currentPrice,
          change24h: data.change24h || 0
        };
      }
    }
    
    console.info(`Fetched ${Object.keys(currentPrices).length} current prices`);
    
    // Build prompt with current prices and user preferences
    const prompt = buildOraclePrompt(currentPrices, tradingStyle, assetPreference);
    const { text: raw, modelUsed } = await callLLM(prompt);

    // try to parse market_phase
    let market_phase: string | null = null;
    try {
      const parsed = JSON.parse(raw);
      market_phase = parsed.market_phase ?? null;
    } catch {
      market_phase = raw.split("\n")[0].slice(0, 200);
    }

    const run_date = new Date().toISOString().slice(0, 10);

    // Translate to all enabled languages (RU, FR, ES, ZH)
    console.log("Translating oracle result to RU, FR, ES, ZH...");
    const translations = await translateOracleToAllLanguages(raw);
    console.log("Translations completed");

    const res = await db.execute({
      sql: `
        INSERT INTO oracle_runs (run_date, market_phase, result, result_ru, result_fr, result_es, result_zh, model_used, trading_style, asset_preference)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [run_date, market_phase, raw, translations.ru, translations.fr, translations.es, translations.zh, modelUsed, tradingStyle || 'balanced', assetPreference || 'both'],
    });

    return NextResponse.json({ ok: true, model: modelUsed, inserted: res.info ?? null });
  } catch (err: any) {
    console.error("run-oracle error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req as unknown as Request);
}
