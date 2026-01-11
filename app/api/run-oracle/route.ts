// Server-only API route that builds a prompt, calls OpenAI, stores the run and returns a simple JSON summary.
// Runtime is node to allow the regular OpenAI SDK.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildOraclePrompt } from "@/lib/oraclePrompt";
import { getMarketSnapshot, formatMarketSnapshotForPrompt, getFilterStrategy } from "@/lib/marketFilterService";
import { translateOracleToAllLanguages } from "@/lib/translateOracle";
import { cookies } from "next/headers";
import { getUserByEmail } from "@/lib/auth";
import OpenAI from "openai";

export const runtime = "nodejs";

const FALLBACK_MODELS = ["gpt-5-mini", "gpt-4o-mini", "gpt-4o", "gpt-4"];

/**
 * Call OpenAI with basic retry + fallback on empty response.
 * Logs full completion for debugging (server logs only).
 */
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
    // Parse request body
    const body = await req.json().catch(() => ({}));
    const englishOnly = body.englishOnly ?? false;
    const preferredModel = body.model || undefined;
    
    // Get user preferences if logged in
    let tradingStyle: 'conservative' | 'balanced' | 'aggressive' = body.tradingStyle || 'balanced';
    let assetPreference: 'crypto' | 'stocks' | 'both' = 'both';
    
    try {
      const cookieStore = await cookies();
      const userEmail = cookieStore.get('auth_token')?.value;
      
      if (userEmail) {
        const user = await getUserByEmail(userEmail);
        if (user) {
          tradingStyle = body.tradingStyle || user.trading_style || 'balanced';
          assetPreference = user.asset_preference || 'both';
          console.info(`Running oracle with user preferences: style=${tradingStyle}, assets=${assetPreference}`);
        }
      }
    } catch (err) {
      // If we can't get user preferences, continue with defaults
      console.warn('Could not fetch user preferences:', err);
    }
    
    // Determine asset types based on preference
    const assetTypes: ('crypto' | 'stock' | 'etf')[] = 
      assetPreference === 'crypto' ? ['crypto'] :
      assetPreference === 'stocks' ? ['stock', 'etf'] :
      ['crypto', 'stock', 'etf'];
    
    // Get filter strategy based on trading style
    const filterStrategy = getFilterStrategy(tradingStyle, assetPreference);
    
    // Fetch curated market snapshot from database (20-30 assets)
    console.info(`Fetching market snapshot with strategy: ${filterStrategy}, assets: ${assetTypes.join(', ')}`);
    const marketAssets = await getMarketSnapshot({
      strategy: filterStrategy,
      assetTypes,
      limit: 25,
      tradingStyle
    });
    
    console.info(`Fetched ${marketAssets.length} assets for analysis`);
    
    // Format market snapshot for prompt
    const marketSnapshotText = formatMarketSnapshotForPrompt(marketAssets);
    
    // Get model for prompt optimization (use first model from FALLBACK_MODELS)
    const model = process.env.OPENAI_MODEL ?? FALLBACK_MODELS[0];
    
    // Build prompt with market snapshot, user preferences, and model-specific optimization
    const prompt = buildOraclePrompt(marketSnapshotText, tradingStyle, assetPreference, model);
    const { text: raw, modelUsed } = await callLLM(prompt, preferredModel);

    // try to parse market_phase
    let market_phase: string | null = null;
    try {
      const parsed = JSON.parse(raw);
      market_phase = parsed.market_phase ?? null;
    } catch {
      market_phase = raw.split("\n")[0].slice(0, 200);
    }

    const run_date = new Date().toISOString().slice(0, 10);

    let translations = { ru: '', fr: '', es: '', zh: '' };
    
    if (!englishOnly) {
      console.log("Translating oracle result to RU, FR, ES, ZH...");
      translations = await translateOracleToAllLanguages(raw);
      console.log("Translations completed");
    } else {
      console.log("Skipping translations (English only mode)");
    }

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
