import { db } from "@/lib/db";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Performance Track Record - Market Oracle Trading Results",
  description: "Verified historical performance of Market Oracle swing trading ideas. See real outcomes, win rates, and risk-reward ratios for stock and crypto trade setups using Elliott Wave analysis.",
  keywords: "trading performance, track record, verified results, trading history, Elliott Wave results",
};

export const revalidate = 3600; // Revalidate every hour

interface HistoricalIdea {
  id: number;
  symbol: string;
  entry_price: number;
  stop_loss: number;
  target_prices: string;
  idea_type: string;
  status: string;
  closed_at: string;
  profit_loss_percentage?: number;
}

async function fetchHistoricalIdeas(): Promise<HistoricalIdea[]> {
  const res = await db.execute({
    sql: `
      SELECT id, symbol, entry_price, original_stop_loss, original_target, 
             idea_type, status, closed_at, profit_loss_percentage
      FROM idea_performance
      WHERE status IN ('winner', 'loser')
      ORDER BY closed_at DESC
      LIMIT 20
    `,
  });

  return (res.rows ?? []).map((r: any) => ({
    id: Number(r.id),
    symbol: String(r.symbol),
    entry_price: Number(r.entry_price),
    stop_loss: Number(r.original_stop_loss),
    target_prices: String(r.original_target || ''),
    idea_type: String(r.idea_type || 'daily_oracle'),
    status: String(r.status),
    closed_at: String(r.closed_at || ''),
    profit_loss_percentage: r.profit_loss_percentage ? Number(r.profit_loss_percentage) : undefined,
  }));
}

export default async function PromoPage() {
  const historicalIdeas = await fetchHistoricalIdeas();
  
  // Calculate statistics
  const winners = historicalIdeas.filter(idea => idea.status === 'winner');
  const losers = historicalIdeas.filter(idea => idea.status === 'loser');
  const winRate = historicalIdeas.length > 0 
    ? ((winners.length / historicalIdeas.length) * 100).toFixed(1) 
    : '0.0';

  return (
    <main className="min-h-screen px-6 py-12 bg-gray-50 dark:bg-[#0d1117]">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/oracle" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 text-sm">
            ← Back to Oracle
          </Link>
          <a href="/account" className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>My Account</span>
          </a>
        </div>

        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            📊 Historical Performance
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Proven Track Record
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real trading ideas with verified outcomes. See how our Elliott Wave analysis performs in live markets.
          </p>
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mb-1 sm:mb-2">
              {winners.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Winning Trades
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">
              {winRate}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Win Rate
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1 sm:mb-2">
              {historicalIdeas.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Total Ideas Tracked
            </div>
          </div>
        </div>

        {/* Historical Ideas */}
        <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Outcomes
          </h2>

          {historicalIdeas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Historical performance data will appear here as trades are tracked and resolved.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historicalIdeas.map((idea) => {
                const isWinner = idea.status === 'winner';
                
                // Use the already calculated profit_loss_percentage from database
                const returnPercent = idea.profit_loss_percentage 
                  ? idea.profit_loss_percentage.toFixed(1)
                  : '0.0';

                return (
                  <div
                    key={idea.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      isWinner 
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-500' 
                        : 'bg-red-50 dark:bg-red-900/10 border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {idea.symbol}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isWinner 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>
                            {isWinner ? '✅ Winner' : '❌ Loser'}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {idea.idea_type === 'daily_oracle' ? 'Daily Oracle' : 'Symbol Analysis'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Entry:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              ${idea.entry_price.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Stop:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              ${idea.stop_loss.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Target:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              ${idea.target_prices || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Date:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              {new Date(idea.closed_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className={`text-2xl sm:text-3xl font-bold ${
                          isWinner ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {isWinner ? '+' : ''}{returnPercent}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Return
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Trading with Confidence
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get access to real-time Elliott Wave analysis and trading ideas with precise entry, stop, and target levels.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/oracle"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:scale-105 transition-transform shadow-lg"
            >
              View Current Ideas
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-blue-600 transition-colors"
            >
              See Pricing
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
