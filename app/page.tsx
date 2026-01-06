import Image from "next/image";

export default function HomePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">Market Oracle</h1>
      <p className="text-gray-600 mb-6">
        Minimal production-ready MVP that generates swing trading ideas (2–6 weeks) for stocks & crypto using an LLM.
      </p>

      <div className="space-y-4">
        <a
          href="/oracle"
          className="inline-block bg-black text-white px-4 py-2 rounded"
        >
          View latest oracle run
        </a>

        <p className="text-sm text-gray-500">
          To trigger a new run (server-only), POST to <code>/api/run-oracle</code>. In dev you can use the button on /oracle.
        </p>
      </div>

      <footer className="mt-12 text-xs text-gray-400">
        Built for fast deploy to Vercel • Server-only OpenAI calls • SQLite-compatible (Turso/libSQL recommended)
      </footer>
    </main>
  );
}
