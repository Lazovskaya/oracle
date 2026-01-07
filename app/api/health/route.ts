import { NextResponse } from "next/server";
import { db } from "@/lib/db.server";

export const runtime = "nodejs";

export async function GET() {
  const time = new Date().toISOString();
  const env = {
    DATABASE_URL_SET: Boolean(process.env.DATABASE_URL),
    OPENAI_API_KEY_SET: Boolean(process.env.OPENAI_API_KEY),
  };
  try {
    await db.execute({ sql: "SELECT 1" });
    let oracle_runs_count: number | null = null;
    try {
      const res = await db.execute({ sql: "SELECT COUNT(*) as cnt FROM oracle_runs" });
      oracle_runs_count = Number(res.rows?.[0]?.cnt ?? null);
    } catch {
      oracle_runs_count = null;
    }
    return NextResponse.json({ ok: true, time, env, oracle_runs_count });
  } catch (err: any) {
    return NextResponse.json({ ok: false, time, env, error: String(err?.message ?? err) }, { status: 500 });
  }
}