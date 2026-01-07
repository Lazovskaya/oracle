import { NextResponse } from "next/server";
import { db } from "@/lib/db.server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const res = await db.execute({
      sql: `
        SELECT id, run_date, market_phase, result, created_at
        FROM oracle_runs
        ORDER BY created_at DESC
        LIMIT 1
      `,
    });
    const row = res.rows?.[0] ?? null;
    return NextResponse.json({ ok: true, row });
  } catch (err: any) {
    // Debug: full error for local diagnosis
    console.error("API /api/oracle/latest error:", {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
      raw: err,
    });

    // Return diagnostic JSON (safe for local debugging; remove before production)
    const body = {
      ok: false,
      error: String(err?.message ?? err),
      name: err?.name,
      // include a short snippet of the stack if present
      stackSnippet: typeof err?.stack === "string" ? err.stack.split("\n").slice(0, 6) : undefined,
    };

    return NextResponse.json(body, { status: 500 });
  }
}