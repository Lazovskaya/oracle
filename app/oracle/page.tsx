import { db } from "@/lib/db";
import { OracleRun } from "@/types/oracle";
import RunButton from "./RunButton";
import path from "path";

export const revalidate = 60;

async function fetchLastRun(): Promise<OracleRun | null> {
  const res = await db.execute({
    sql: `
      SELECT id, run_date, market_phase, result, created_at
      FROM oracle_runs
      ORDER BY created_at DESC
      LIMIT 1
    `,
  });
  const rows = res.rows ?? [];
  if (rows.length === 0) return null;

  // Normalize DB row -> OracleRun to satisfy TypeScript and handle different column shapes
  const r: any = rows[0];
  const mapped: OracleRun = {
    id: typeof r.id === "number" ? r.id : r.id ? Number(r.id) : undefined,
    run_date: String(r.run_date ?? r.runDate ?? r.date ?? ""),
    market_phase: r.market_phase ?? r.marketPhase ?? null,
    result: typeof r.result === "string" ? r.result : r.result ? JSON.stringify(r.result) : "",
    created_at: r.created_at ?? r.createdAt ?? undefined,
  };
  return mapped;
}

/**
 * Helpers to normalize LLM output shapes and format numbers/prices
 */
function isPriceLike(obj: any) {
  return obj && typeof obj === "object" && String(obj.type ?? "").toLowerCase() === "price";
}
function isPercentLike(obj: any) {
  return obj && typeof obj === "object" && String(obj.type ?? "").toLowerCase() === "percent";
}
function formatPriceVal(v: any) {
  if (v == null) return "—";
  if (typeof v === "number") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);
  }
  if (typeof v === "string") {
    // if already includes non-numeric (like "27000-27500" or "38-40%"), return as-is
    const n = Number(v.replace(/[, ]+/g, ""));
    if (!Number.isFinite(n)) return v;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
  }
  return String(v);
}
function formatPercentVal(v: any) {
  if (v == null) return "—";
  if (typeof v === "number") return `${v}%`;
  return String(v).replace(/^\s+|\s+$/g, "") + (String(v).endsWith("%") ? "" : "%");
}
function formatField(raw: any) {
  // raw can be number/string or { type, value }
  if (raw == null) return "—";
  if (isPriceLike(raw)) return formatPriceVal(raw.value);
  if (isPercentLike(raw)) return formatPercentVal(raw.value);
  if (typeof raw === "object" && ("value" in raw)) {
    // fallback: value with unknown type
    const val = raw.value;
    if (typeof val === "number") return formatPriceVal(val);
    return String(val);
  }
  // raw primitive
  if (typeof raw === "number") return formatPriceVal(raw);
  if (typeof raw === "string") {
    // if looks like a number range -> try to format each side as price
    if (/^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/.test(raw)) {
      return raw
        .split("-")
        .map((s) => formatPriceVal(s.trim()))
        .join(" — ");
    }
    return raw;
  }
  return String(raw);
}

export default async function OraclePage() {
  const last = await fetchLastRun();

  let parsed: {
    market_phase?: string;
    wave_structure?: string;
    ideas?: Array<any>;
  } | null = null;

  if (last?.result) {
    try {
      parsed = JSON.parse(last.result);
    } catch {
      parsed = null;
    }
  }

  const ideas = Array.isArray(parsed?.ideas) ? parsed!.ideas : [];

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📡 Market Oracle
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              High-quality swing trade ideas (2–6 weeks) — latest run
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RunButton />
          </div>
        </header>

        {!last ? (
          <section className="rounded-2xl border border-gray-200 dark:border-gray-700 p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🔮</div>
              <h2 className="text-2xl font-semibold mb-2">No Oracle Runs Yet</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Trigger your first run via the button above or wait for scheduled runs at 08:00 & 20:00 UTC.
              </p>
            </div>
          </section>
        ) : (
          <article className="space-y-8">
            <section className="rounded-2xl border border-gray-200 dark:border-gray-700 p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>📊</span> Market Summary
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                  {parsed?.market_phase ?? last.market_phase ?? "—"}
                </p>
                <div className="flex flex-wrap gap-4 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">📅</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      Run: <strong className="text-gray-900 dark:text-white">{last.run_date}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">🕐</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {new Date(last.created_at!).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="inline-block px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-900 dark:text-blue-100 rounded-lg">
                  {parsed ? "✓ Parsed" : "Raw Data"}
                </span>
                {parsed?.wave_structure && (
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wave Structure</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{parsed.wave_structure}</div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-6">
            {ideas.length > 0 ? (
              ideas.map((idea: any, idx: number) => {
                const symbol = idea.symbol ?? `idea-${idx + 1}`;
                const rationale = idea.rationale ?? "";
                const entry = formatField(idea.entry ?? idea.entry?.value ?? idea.entry);
                const stop = formatField(idea.stop ?? idea.stop?.value ?? idea.stop);
                const targets = Array.isArray(idea.targets)
                  ? idea.targets.map(formatField)
                  : [formatField(idea.targets)];
                const timeframe = idea.timeframe ?? "2–6 weeks";
                const confidence = (idea.confidence ?? "unknown").toString();

                return (
                  <div key={idx} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-baseline gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{symbol}</h3>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            idea.bias?.toLowerCase() === 'bullish' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : idea.bias?.toLowerCase() === 'bearish'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {idea.bias ?? "Neutral"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{idea.wave_context ?? ""}</p>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full shadow-sm ${
                            confidence === "high"
                              ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                              : confidence === "medium"
                              ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                              : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800"
                          }`}
                        >
                          {confidence.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-6">{rationale}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Entry</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{entry}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Stop</div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">{stop}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Targets</div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{targets.join(" • ")}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Timeframe</div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{timeframe}</div>
                      </div>
                      {idea.risk_note ? (
                        <div className="col-span-2 md:col-span-4 mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                            <div>
                              <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Risk Note</div>
                              <div className="text-sm text-yellow-700 dark:text-yellow-200">{idea.risk_note}</div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Raw Oracle Output</h3>
                <pre className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">{last.result}</pre>
              </div>
            )}
          </section>
          </article>
        )}
      </div>
    </main>
  );
}
