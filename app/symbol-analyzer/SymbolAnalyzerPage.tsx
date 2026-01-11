'use client';
import Link from 'next/link';
import SymbolAnalyzer from '../oracle/SymbolAnalyzer';

export default function SymbolAnalyzerPage({ 
  isPro, 
  userEmail 
}: { 
  isPro: boolean; 
  userEmail: string;
}) {
  return (
    <main className="min-h-screen px-6 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/oracle" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 text-sm">
              ← Back to Oracle
            </Link>
            <Link href="/account" className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Account</span>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Custom Symbol Analyzer
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Analyze any stock, ETF, or crypto symbol with AI-powered trading insights
              </p>
            </div>
            {isPro && (
              <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full">
                PRO FEATURE
              </span>
            )}
          </div>
        </div>

        <SymbolAnalyzer isPro={isPro} />

        {isPro && (
          <div className="mt-8 p-6 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              PRO Tips
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>You can analyze up to 30 symbols per day</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Enter symbols in the format: AAPL (stocks), BTC (crypto), or SPY (ETFs)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Analysis includes entry prices, stop loss levels, and target prices</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>All recommendations are for educational purposes - not financial advice</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
