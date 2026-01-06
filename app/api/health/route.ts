import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Use the correct runtime variant for Node on Next.js
export const runtime = "nodejs";

/**
 * Simple health endpoint:
 * - verifies DB can run a trivial query
 * - returns presence flags for important env vars (without revealing values)
 */
export async function GET() {
  const time = new Date().toISOString();
  const env = {
    DATABASE_URL_SET: Boolean(process.env.DATABASE_URL),
    DATABASE_AUTH_TOKEN_SET: Boolean(process.env.DATABASE_AUTH_TOKEN),
    OPENAI_API_KEY_SET: Boolean(process.env.OPENAI_API_KEY),
    NEXT_PUBLIC_SITE_URL_SET: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  };

  try {
    // Basic DB connectivity check
    await db.execute({ sql: "SELECT 1" });

    // Try to get a count if table exists (non-fatal)
    let oracle_runs_count: number | null = null;
    try {
      const res = await db.execute({ sql: "SELECT COUNT(*) as cnt FROM oracle_runs" });
      const row = res.rows?.[0] as any;
      oracle_runs_count = typeof row?.cnt !== "undefined" ? Number(row.cnt) : null;
    } catch {
      oracle_runs_count = null;
    }

    return NextResponse.json({
      ok: true,
      time,
      env,
      oracle_runs_count,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        time,
        env,
        error: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}