import { db } from "@/lib/db";
import RunButton from "./RunButton";
import { OracleRun } from "@/types/oracle";

export const revalidate = 60;

async function fetchLastRun(): Promise<OracleRun | null> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const url = new URL("/api/oracle/latest", base).toString();
    const res = await fetch(url, { cache: "no-store" });

    // If response not OK, capture text (may be HTML/error) and bail safely
    if (!res.ok) {
      const txt = await res.text();
      console.error("fetchLastRun: non-OK response", res.status, txt.slice(0, 300));
      return null;
    }

    // Only attempt JSON.parse if content-type is JSON; otherwise log and bail
    const ct = (res.headers.get("content-type") ?? "").toLowerCase();
    if (!ct.includes("application/json")) {
      const txt = await res.text();
      console.error("fetchLastRun: unexpected content-type", ct, txt.slice(0, 300));
      return null;
    }

    const json = await res.json();
    return json?.ok ? (json.row as OracleRun) : null;
  } catch (err) {
    console.error("fetchLastRun error:", String(err));
    return null;
  }
}

export default async function OraclePage() {
  const last = await fetchLastRun();
  let parsed: any = null;
  if (last?.result) {
    try { parsed = JSON.parse(last.result); } catch { parsed = null; }
  }

  const ideas = Array.isArray(parsed?.ideas) ? parsed!.ideas : [];

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📡 Market Oracle</h1>
        <RunButton />
      </header>

      {!last ? (
        <section>No oracle runs yet.</section>
      ) : (
        <article>
          <section>
            <h2>Market summary</h2>
            <p>{parsed?.market_phase ?? last.market_phase}</p>
            <p className="text-xs text-gray-400">Run date: {last.run_date}</p>
          </section>

          <section>
            <h3>Ideas</h3>
            {Array.isArray(parsed?.ideas) ? (
              parsed.ideas.map((idea: any, i: number) => (
                <div key={i} className="p-3 border rounded mb-3">
                  <div className="flex justify-between">
                    <strong>{idea.symbol}</strong>
                    <small>{idea.confidence}</small>
                  </div>
                  <div>{idea.rationale}</div>
                  <div>Entry: {JSON.stringify(idea.entry)}</div>
                </div>
              ))
            ) : (
              <pre>{last.result}</pre>
            )}
          </section>
        </article>
      )}
    </main>
  );
}
