'use client';
import { useState } from 'react';
import Link from 'next/link';

interface SymbolAnalysis {
  symbol: string;
  tradeable: boolean;
  market_context: string;
  scenarios?: {
    bull_case?: {
      condition: string;
      entry_zone: string;
      risk: string;
      targets: string[];
    };
    bear_case?: {
      condition: string;
      entry_zone: string;
      risk: string;
      targets: string[];
    };
  };
  do_not_trade_if?: string[];
  confidence: string;
  timeframe: string;
  rateLimit?: {
    used: number;
    limit: number;
    remaining: number;
  };
  disclaimer?: string;
}

export default function SymbolAnalyzer({ isPro }: { isPro: boolean }) {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SymbolAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!symbol.trim()) {
      setError('Please enter a symbol');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze-symbol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Analysis failed');
      }

      setAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence?.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!isPro) {
    return (
      <div className="p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          🔥 Custom Symbol Analysis
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Analyze any stock, ETF, or crypto symbol on-demand with personalized trading scenarios.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
          Available for PRO members only
        </p>
        <Link
          href="/pricing"
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
        >
          Upgrade to PRO
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Custom Symbol Analysis
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Enter any stock, ETF, or crypto symbol to get a personalized swing trading analysis
        </p>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="e.g., AAPL, BTC, TSLA"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !symbol.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>

        {analysis?.rateLimit && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {analysis.rateLimit.remaining} analyses remaining today ({analysis.rateLimit.used}/{analysis.rateLimit.limit} used)
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Analysis Result */}
      {analysis && (
        <div className="space-y-4">
          {/* Header */}
          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {analysis.symbol}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">{analysis.market_context}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(analysis.confidence)}`}>
                  {analysis.confidence?.toUpperCase()} confidence
                </span>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {analysis.timeframe}
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-2 ${analysis.tradeable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {analysis.tradeable ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Tradeable now</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Not tradeable now</span>
                </>
              )}
            </div>
          </div>

          {/* Scenarios */}
          {analysis.scenarios && analysis.tradeable && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bull Case */}
              {analysis.scenarios.bull_case && (
                <div className="p-6 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>📈</span>
                    Bull Case
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Condition:</div>
                      <div className="font-medium text-gray-900 dark:text-white">{analysis.scenarios.bull_case.condition}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Entry Zone:</div>
                      <div className="font-medium text-gray-900 dark:text-white">{analysis.scenarios.bull_case.entry_zone}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Risk:</div>
                      <div className={`font-semibold ${getRiskColor(analysis.scenarios.bull_case.risk)}`}>
                        {analysis.scenarios.bull_case.risk?.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Targets:</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {analysis.scenarios.bull_case.targets?.join(' • ')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bear Case */}
              {analysis.scenarios.bear_case && (
                <div className="p-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>📉</span>
                    Bear Case
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Condition:</div>
                      <div className="font-medium text-gray-900 dark:text-white">{analysis.scenarios.bear_case.condition}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Entry Zone:</div>
                      <div className="font-medium text-gray-900 dark:text-white">{analysis.scenarios.bear_case.entry_zone}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Risk:</div>
                      <div className={`font-semibold ${getRiskColor(analysis.scenarios.bear_case.risk)}`}>
                        {analysis.scenarios.bear_case.risk?.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Targets:</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {analysis.scenarios.bear_case.targets?.join(' • ')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Do Not Trade If */}
          {analysis.do_not_trade_if && analysis.do_not_trade_if.length > 0 && (
            <div className="p-6 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>⚠️</span>
                Avoid Trading If:
              </h5>
              <ul className="space-y-2">
                {analysis.do_not_trade_if.map((condition, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-yellow-600 dark:text-yellow-400">•</span>
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          {analysis.disclaimer && (
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Disclaimer:</strong> {analysis.disclaimer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
