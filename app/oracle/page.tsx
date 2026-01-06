import { db } from "@/lib/db";

export const revalidate = 300; // обновление каждые 5 минут

type OracleRun = {
  id: number;
  date: string;
  result: string;
  created_at: string;
};

export default async function OraclePage() {
  const res = await db.execute({
    sql: `
      SELECT id, date, result, created_at
      FROM oracle_runs
      ORDER BY created_at DESC
      LIMIT 10
    `
  });

  const runs = res.rows as OracleRun[];

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">
        📡 Market Oracle
      </h1>

      <p className="text-gray-500 mb-8">
        Лучшие торговые идеи (20%), обновляется 2 раза в день
      </p>

      {runs.map(run => (
        <article
          key={run.id}
          className="mb-10 p-6 rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <header className="mb-4">
            <h2 className="text-xl font-semibold">
              📅 {run.date}
            </h2>
            <p className="text-sm text-gray-400">
              Обновлено: {new Date(run.created_at).toLocaleString()}
            </p>
          </header>

          <pre className="whitespace-pre-wrap text-sm leading-relaxed">
            {run.result}
          </pre>
        </article>
      ))}
    </main>
  );
}
