import { db } from "@/lib/db";
import { OracleRun } from "@/types/oracle";
import RunButton from "./RunButton";

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
  return rows.length > 0 ? (rows[0] as OracleRun) : null;
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
    <main className="max-w-4xl mx-auto px-6 py-12">
      <header className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">📡 Market Oracle</h1>
          <p className="text-sm text-gray-500 mt-1">High-quality swing trade ideas (2–6 weeks) — latest run</p>
        </div>
        <div className="flex items-center gap-3">
          <RunButton />
        </div>
      </header>

      {!last ? (
        <section className="rounded border p-6 bg-white text-gray-600">
          <p>No oracle runs yet. Trigger one via the button or wait for scheduled runs at 08:00 & 20:00 UTC.</p>
        </section>
      ) : (
        <article className="space-y-6">
          <section className="rounded border p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Market summary</h2>
                <p className="text-gray-700 mt-2">{parsed?.market_phase ?? last.market_phase ?? "—"}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Run date: <strong>{last.run_date}</strong> • Stored: {new Date(last.created_at!).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 text-xs bg-gray-100 rounded">{parsed ? "Parsed" : "Raw"}</span>
                <div className="mt-2 text-sm text-gray-500">Wave: {parsed?.wave_structure ?? "—"}</div>
              </div>
            </div>
          </section>

          <section className="grid gap-4">
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
                  <div key={idx} className="p-4 rounded-lg border bg-white shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-baseline gap-3">
                          <h3 className="text-lg font-semibold">{symbol}</h3>
                          <span className="text-sm text-gray-500">{idea.bias ?? ""}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{idea.wave_context ?? ""}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${
                            confidence === "high"
                              ? "bg-green-100 text-green-800"
                              : confidence === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {confidence}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-gray-700">{rationale}</p>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700">
                      <div>
                        <div className="text-xs text-gray-500">Entry</div>
                        <div className="font-medium">{entry}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Stop</div>
                        <div className="font-medium">{stop}</div>
                      </div>
                      <div className="col-span-2 mt-1">
                        <div className="text-xs text-gray-500">Targets</div>
                        <div className="font-medium">{targets.join(" • ")}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Timeframe</div>
                        <div className="font-medium">{timeframe}</div>
                      </div>
                      {idea.risk_note ? (
                        <div className="col-span-2 text-xs text-yellow-800 mt-2">Risk note: {idea.risk_note}</div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <pre className="rounded border p-4 bg-gray-50 text-sm text-gray-700">{last.result}</pre>
            )}
          </section>
        </article>
      )}
    </main>
  );
}
