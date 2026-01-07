// Server-only API route that builds a prompt, calls OpenAI, stores the run and returns a simple JSON summary.
// Runtime is node to allow the regular OpenAI SDK.
import { NextResponse } from "next/server";
import { db } from "@/lib/db.server";
import { buildOraclePrompt } from "@/lib/oraclePrompt";
import OpenAI from "openai";

export const runtime = "nodejs";

async function callLLM(prompt: string) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 1200,
  });
  return { text: completion?.choices?.[0]?.message?.content ?? "", raw: completion };
}

export async function POST(req: Request) {
  try {
    const prompt = buildOraclePrompt();
    const { text: rawTextIn, raw: rawCompletion } = await callLLM(prompt);

    // Ensure we have a string to work with
    const rawText = rawTextIn == null ? "" : String(rawTextIn).trim();

    // Debug: log truncated completion + raw text (server logs only)
    try {
      console.debug("LLM completion (truncated):", JSON.stringify(rawCompletion).slice(0, 2000));
    } catch (_) {}
    console.debug("LLM raw text (truncated):", rawText.slice(0, 500));

    const run_date = new Date().toISOString().slice(0, 10);

    // Robust JSON parsing: only attempt parse when rawText *looks* JSON,
    // otherwise try substring extraction; always catch errors.
    let parsed: any = null;
    try {
      const t = rawText.trim();
      if (t.startsWith("{") || t.startsWith("[")) {
        parsed = JSON.parse(t);
      } else {
        // try to find an embedded JSON object
        const first = t.indexOf("{");
        const last = t.lastIndexOf("}");
        if (first !== -1 && last !== -1 && last > first) {
          const candidate = t.slice(first, last + 1);
          try {
            parsed = JSON.parse(candidate);
          } catch {
            parsed = null;
          }
        } else {
          parsed = null;
        }
      }
    } catch (err) {
      console.warn("Parsing LLM output failed:", String(err?.message ?? err));
      parsed = null;
    }

    // Derive market_phase safely
    let market_phase: string | null = null;
    if (parsed && typeof parsed === "object") {
      market_phase = parsed.market_phase ?? null;
    } else {
      market_phase = (rawText.split("\n")[0] ?? "").slice(0, 200) || null;
    }

    // Always store the raw LLM text (string) for debugging + future parsing
    const res = await db.execute({
      sql: `INSERT INTO oracle_runs (run_date, market_phase, result) VALUES (?, ?, ?)`,
      args: [run_date, market_phase, rawText],
    });

    return NextResponse.json({ ok: true, parsed: !!parsed, inserted: res.info ?? null });
  } catch (err: any) {
    console.error("run-oracle error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req as unknown as Request);
}
