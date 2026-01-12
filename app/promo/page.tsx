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
    <main className="min-h-screen px-6 py-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/oracle" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Oracle
          </Link>
          <Link href="/account" className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>My Account</span>
          </Link>
        </div>

        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Historical Performance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Proven Track Record
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real trading ideas with verified outcomes. See how our Elliott Wave analysis performs in live markets.
          </p>
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 mb-4 border border-emerald-200 dark:border-emerald-800/30">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              {winners.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Winning Trades
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 mb-4 border border-blue-200 dark:border-blue-800/30">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {winRate}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Win Rate
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 mb-4 border border-purple-200 dark:border-purple-800/30">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {historicalIdeas.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Total Ideas Tracked
            </div>
          </div>
        </div>

        {/* Historical Ideas */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border border-blue-200 dark:border-blue-800/30">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Outcomes
            </h2>
          </div>

          {historicalIdeas.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Historical performance data will appear here as trades are tracked and resolved.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historicalIdeas.map((idea) => {
                const isWinner = idea.status === 'winner';
                
                // Use the already calculated profit_loss_percentage from database
                const returnPercent = idea.profit_loss_percentage 
                  ? idea.profit_loss_percentage.toFixed(1)
                  : '0.0';

                return (
                  <div
                    key={idea.id}
                    className={`p-5 rounded-xl border ${
                      isWinner 
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' 
                        : 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {idea.symbol}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            isWinner 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/30'
                          }`}>
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              {isWinner ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              )}
                            </svg>
                            {isWinner ? 'Winner' : 'Loser'}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            {idea.idea_type === 'daily_oracle' ? 'Daily Oracle' : 'Symbol Analysis'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-500">Entry:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ${idea.entry_price.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-500">Stop:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ${idea.stop_loss.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-500">Target:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ${idea.target_prices || '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-500">Closed:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {new Date(idea.closed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className={`text-3xl font-bold ${
                          isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {isWinner ? '+' : ''}{returnPercent}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 font-medium mt-1">
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
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 md:p-12 shadow-sm">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Start Trading with Confidence
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Get access to real-time Elliott Wave analysis and trading ideas with precise entry, stop, and target levels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/oracle"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                View Current Ideas
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                See Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-4">
            <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/methodology" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Methodology</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
