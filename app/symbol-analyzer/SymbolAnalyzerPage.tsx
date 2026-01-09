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
    <main className="min-h-screen px-6 py-12 bg-gray-50 dark:bg-[#0d1117]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/oracle" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 mb-4 text-sm">
            ← Back to Oracle
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Custom Symbol Analyzer
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
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
          <div className="mt-8 p-6 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 PRO Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
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
