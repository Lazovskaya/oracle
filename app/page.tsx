import OracleIcon from "@/components/OracleIcon";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl">
              <OracleIcon className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Market Oracle
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            AI-powered swing trading insights for stocks & crypto. Get high-quality market analysis and trade recommendations powered by advanced language models.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Market Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Real-time market phase detection and wave structure analysis for informed trading decisions.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Trade Ideas</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Swing trading setups (2-6 weeks) with entry points, stop losses, and profit targets.
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/oracle"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            View Latest Oracle Run →
          </a>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Automated runs at 08:00 & 20:00 UTC daily
          </p>
        </div>

        <footer className="mt-16 text-center text-xs text-gray-400 dark:text-gray-500">
          <p>Built with Next.js • OpenAI • Turso Database</p>
          <p className="mt-1">Deployed on Vercel</p>
        </footer>
      </div>
    </main>
  );
}
