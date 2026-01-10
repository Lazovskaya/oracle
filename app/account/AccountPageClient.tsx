'use client';
import { useEffect, useState } from 'react';
import { User } from '@/lib/auth';
import Link from 'next/link';

interface SavedIdea {
  id: number;
  oracle_run_id: number;
  symbol: string;
  entry: string;
  stop: string;
  targets: string;
  rationale: string;
  confidence: string;
  bias: string;
  timeframe: string;
  wave_context: string;
  risk_note: string;
  saved_at: string;
}

interface SavedAnalysis {
  id: number;
  symbol: string;
  current_price: number;
  entry: string;
  stop_loss: string;
  targets: string;
  market_context: string;
  confidence: string;
  timeframe: string;
  full_analysis: string;
  saved_at: string;
}

export default function AccountPageClient({ user }: { user: User }) {
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradingStyle, setTradingStyle] = useState(user.trading_style);
  const [updatingStyle, setUpdatingStyle] = useState(false);
  const [assetPreference, setAssetPreference] = useState(user.asset_preference);
  const [updatingAsset, setUpdatingAsset] = useState(false);

  useEffect(() => {
    fetchSavedIdeas();
    if (user.subscription_tier === 'premium') {
      fetchSavedAnalyses();
    }
  }, []);

  const fetchSavedAnalyses = async () => {
    try {
      const response = await fetch('/api/saved-symbol-analyses');
      const data = await response.json();
      setSavedAnalyses(data.analyses || []);
    } catch (error) {
      console.error('Error fetching saved analyses:', error);
    }
  };

  const fetchSavedIdeas = async () => {
    try {
      const response = await fetch('/api/saved-ideas');
      const data = await response.json();
      setSavedIdeas(data.ideas || []);
    } catch (error) {
      console.error('Error fetching saved ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this idea from your saved list?')) return;

    try {
      await fetch(`/api/saved-ideas?id=${id}`, { method: 'DELETE' });
      setSavedIdeas(savedIdeas.filter(idea => idea.id !== id));
    } catch (error) {
      console.error('Error deleting idea:', error);
      alert('Failed to remove idea');
    }
  };

  const handleDeleteAnalysis = async (id: number) => {
    if (!confirm('Remove this analysis from your saved list?')) return;

    try {
      await fetch(`/api/saved-symbol-analyses?id=${id}`, { method: 'DELETE' });
      setSavedAnalyses(savedAnalyses.filter(analysis => analysis.id !== id));
    } catch (error) {
      console.error('Error deleting analysis:', error);
      alert('Failed to remove analysis');
    }
  };

  const handleTradingStyleChange = async (newStyle: 'conservative' | 'balanced' | 'aggressive') => {
    setUpdatingStyle(true);
    try {
      const response = await fetch('/api/user/trading-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradingStyle: newStyle }),
      });

      if (response.ok) {
        setTradingStyle(newStyle);
        
        // Show success message
        const messages = {
          conservative: '🛡️ Trading style updated to Conservative. Your recommendations will prioritize capital preservation.',
          balanced: '⚖️ Trading style updated to Balanced. You\'ll get standard risk/reward recommendations.',
          aggressive: '🚀 Trading style updated to Aggressive. Your recommendations will target higher returns with increased risk.',
        };
        alert(messages[newStyle]);
      } else {
        alert('Failed to update trading style');
      }
    } catch (error) {
      console.error('Error updating trading style:', error);
      alert('Failed to update trading style');
    } finally {
      setUpdatingStyle(false);
    }
  };

  const handleAssetPreferenceChange = async (newPreference: 'crypto' | 'stocks' | 'both') => {
    setUpdatingAsset(true);
    try {
      const response = await fetch('/api/user/asset-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetPreference: newPreference }),
      });

      if (response.ok) {
        setAssetPreference(newPreference);
        
        const messages = {
          crypto: '₿ Asset preference updated to Crypto. You\'ll see cryptocurrency trading ideas.',
          stocks: '📈 Asset preference updated to Stocks. You\'ll see stock market trading ideas.',
          both: '🔄 Asset preference updated to Both. You\'ll see both crypto and stock ideas.',
        };
        alert(messages[newPreference]);
      } else {
        alert('Failed to update asset preference');
      }
    } catch (error) {
      console.error('Error updating asset preference:', error);
      alert('Failed to update asset preference');
    } finally {
      setUpdatingAsset(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSubscriptionBadge = () => {
    const tier = user.subscription_tier.toUpperCase();
    const colors = {
      FREE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      PREMIUM: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
      BASIC: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
      PRO: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
    };
    return colors[tier as keyof typeof colors] || colors.FREE;
  };

  const getStatusBadge = () => {
    if (!user.subscription_status) return null;
    
    const status = user.subscription_status.toUpperCase();
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      CANCELED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

  return (
    <main className="min-h-screen px-6 py-12 bg-gray-50 dark:bg-[#0d1117]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/oracle" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 mb-4 text-sm">
              ← Back to Oracle
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              My Account
            </h1>
          </div>
          <a
            href="/api/auth/logout"
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-900 dark:text-gray-100"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </a>
        </div>

        {/* Subscription Info */}
        <div className="mb-6 p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Subscription Details</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{user.email}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-gray-600 dark:text-gray-400">Plan:</span>
              <span className={`px-4 py-2 text-sm font-bold rounded-full ${getSubscriptionBadge()}`}>
                {user.subscription_tier.toUpperCase()}
              </span>
              {getStatusBadge()}
            </div>

            {user.subscription_end_date && (
              <div className="flex items-center gap-3">
                <span className="text-gray-600 dark:text-gray-400">Access Until:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(user.subscription_end_date)}
                </span>
              </div>
            )}

            {user.subscription_tier === 'free' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Upgrade to access full trading levels and tracking features
                </p>
                <Link
                  href="/pricing"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
                >
                  View Plans
                </Link>
              </div>
            )}

            {(user.subscription_tier === 'premium' || user.subscription_tier === 'pro') && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <Link
                  href="/oracle"
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">Oracle Predictions</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">View latest AI-powered trading ideas</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

                {user.subscription_tier === 'pro' && (
                  <Link
                    href="/symbol-analyzer"
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">Custom Symbol Analyzer</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Analyze any symbol with AI insights</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Trading Style Preference */}
        <div className="mb-6 p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Trading Style</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose your risk tolerance level. This helps us tailor recommendations to your preferences.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleTradingStyleChange('conservative')}
              disabled={updatingStyle}
              className={`p-4 rounded-lg border-2 transition-all ${
                tradingStyle === 'conservative'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-2xl mb-2">🛡️</div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">Conservative</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Lower risk, smaller position sizes, tight stops
              </div>
            </button>

            <button
              onClick={() => handleTradingStyleChange('balanced')}
              disabled={updatingStyle}
              className={`p-4 rounded-lg border-2 transition-all ${
                tradingStyle === 'balanced'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-2xl mb-2">⚖️</div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">Balanced</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Moderate risk, standard position sizing
              </div>
            </button>

            <button
              onClick={() => handleTradingStyleChange('aggressive')}
              disabled={updatingStyle}
              className={`p-4 rounded-lg border-2 transition-all ${
                tradingStyle === 'aggressive'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">Aggressive</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Higher risk, larger positions, wider stops
              </div>
            </button>
          </div>
        </div>

        {/* Asset Preference */}
        <div className="mb-6 p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Asset Preference</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose which asset classes you want to see in trading recommendations.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleAssetPreferenceChange('crypto')}
              disabled={updatingAsset}
              className={`p-4 rounded-lg border-2 transition-all ${
                assetPreference === 'crypto'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-2xl mb-2">₿</div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">Crypto Only</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Bitcoin, Ethereum, and other cryptocurrencies
              </div>
            </button>

            <button
              onClick={() => handleAssetPreferenceChange('stocks')}
              disabled={updatingAsset}
              className={`p-4 rounded-lg border-2 transition-all ${
                assetPreference === 'stocks'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">Stocks Only</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Traditional equities and stock markets
              </div>
            </button>

            <button
              onClick={() => handleAssetPreferenceChange('both')}
              disabled={updatingAsset}
              className={`p-4 rounded-lg border-2 transition-all ${
                assetPreference === 'both'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">Both</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Show all available trading opportunities
              </div>
            </button>
          </div>
        </div>

        {/* Saved Ideas */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Saved Trading Ideas
            </h2>
            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium border border-blue-200 dark:border-blue-800">
              {savedIdeas.length} saved
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your saved ideas...</p>
            </div>
          ) : savedIdeas.length === 0 ? (
            <div className="p-12 text-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Saved Ideas Yet</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start tracking trade ideas by clicking the bookmark icon on any idea
              </p>
              <Link
                href="/oracle"
                className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                View Trading Ideas
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedIdeas.map((idea) => {
                const targets = idea.targets ? idea.targets.split(',').map(t => t.trim()) : [];
                
                return (
                  <div
                    key={idea.id}
                    className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{idea.symbol}</h3>
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${
                            idea.bias === 'bullish' 
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                              : idea.bias === 'bearish'
                              ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                              : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                          }`}>
                            {idea.bias?.toUpperCase()}
                          </span>
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${
                            idea.confidence === 'high'
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                              : idea.confidence === 'medium'
                              ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                              : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                          }`}>
                            {idea.confidence?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Saved {formatDate(idea.saved_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(idea.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove from saved"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4">{idea.rationale}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Entry</div>
                        <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">{idea.entry || '—'}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Stop</div>
                        <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">{idea.stop || '—'}</div>
                      </div>
                      <div className="col-span-2 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Targets</div>
                        <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
                          {targets.length > 0 ? targets.join(' • ') : '—'}
                        </div>
                      </div>
                      {idea.timeframe && (
                        <div className="col-span-2 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/30">
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Timeframe</div>
                          <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">{idea.timeframe}</div>
                        </div>
                      )}
                    </div>

                    {idea.risk_note && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                          <div>
                            <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Risk Note</div>
                            <div className="text-sm text-yellow-700 dark:text-yellow-200">{idea.risk_note}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Saved Symbol Analyses (PRO) */}
        {user.subscription_tier === 'premium' && (
          <div className="mb-6 p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Symbol Analyses</h2>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded">
                  PRO
                </span>
              </div>
              <Link
                href="/symbol-analyzer"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <span>Analyze New Symbol</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {savedAnalyses.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No saved analyses yet. Analyze a symbol to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedAnalyses.map((analysis) => {
                  const targets = analysis.targets ? JSON.parse(analysis.targets) : [];
                  const fullAnalysis = analysis.full_analysis ? JSON.parse(analysis.full_analysis) : null;
                  
                  // For symbol analyzer results, entry/stop are in the scenarios, not as simple fields
                  // So we don't show them in the basic price grid since they vary by scenario
                  const hasBasicEntry = analysis.entry && analysis.entry !== '' && !isNaN(Number(analysis.entry));
                  const hasBasicStop = analysis.stop_loss && analysis.stop_loss !== '' && !isNaN(Number(analysis.stop_loss));
                  
                  // Helper function to format price strings - adds $ and formats decimals properly
                  const formatPriceString = (priceStr: string): string => {
                    if (!priceStr) return priceStr;
                    
                    // Handle ranges like "0.60-0.62"
                    if (priceStr.includes('-')) {
                      const parts = priceStr.split('-').map(p => p.trim());
                      return parts.map(p => {
                        const num = parseFloat(p);
                        return isNaN(num) ? p : `$${num.toFixed(2)}`;
                      }).join('-');
                    }
                    
                    // Handle single values
                    const num = parseFloat(priceStr);
                    if (isNaN(num)) return priceStr;
                    return `$${num.toFixed(2)}`;
                  };
                  
                  return (
                    <div
                      key={analysis.id}
                      className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-6"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{analysis.symbol}</h3>
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${
                              analysis.confidence === 'high'
                                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                                : analysis.confidence === 'medium'
                                ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                                : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                            }`}>
                              {analysis.confidence?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Saved {formatDate(analysis.saved_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAnalysis(analysis.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove from saved"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4">{analysis.market_context}</p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        {analysis.current_price && (
                          <div className="p-3 rounded-lg bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/30">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Current</div>
                            <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">${Number(analysis.current_price).toFixed(2)}</div>
                          </div>
                        )}
                        {hasBasicEntry && (
                          <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Entry</div>
                            <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">${Number(analysis.entry).toFixed(2)}</div>
                          </div>
                        )}
                        {hasBasicStop && (
                          <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Stop Loss</div>
                            <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">${Number(analysis.stop_loss).toFixed(2)}</div>
                          </div>
                        )}
                        <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Targets</div>
                          <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
                            {targets.length > 0 ? targets.map((t: string) => `$${Number(t).toFixed(2)}`).join(' • ') : '—'}
                          </div>
                        </div>
                        {analysis.timeframe && (
                          <div className="p-3 rounded-lg bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/30">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase">Timeframe</div>
                            <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">{analysis.timeframe}</div>
                          </div>
                        )}
                      </div>

                      {/* Bull and Bear Scenarios */}
                      {fullAnalysis?.scenarios && (
                        <div className="space-y-4 mt-6">
                          {/* Bull Case */}
                          {fullAnalysis.scenarios.bull_case && (
                            <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                              <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <span>📈</span>
                                Bull Case Scenario
                              </h5>
                              
                              <div className="space-y-3">
                                <div>
                                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Condition:</div>
                                  <div className="text-sm text-gray-900 dark:text-white">{fullAnalysis.scenarios.bull_case.condition}</div>
                                </div>

                                <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <div className="p-2 rounded bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Entry Zone</div>
                                      <div className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">{formatPriceString(fullAnalysis.scenarios.bull_case.entry_zone)}</div>
                                    </div>
                                    <div className="p-2 rounded bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Risk</div>
                                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fullAnalysis.scenarios.bull_case.risk?.toUpperCase()}</div>
                                    </div>
                                    <div className="p-2 rounded bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Targets</div>
                                      <div className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                                        {fullAnalysis.scenarios.bull_case.targets?.map((t: string) => formatPriceString(t)).join(' • ')}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Bear Case */}
                          {fullAnalysis.scenarios.bear_case && (
                            <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                              <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <span>📉</span>
                                Bear Case Scenario
                              </h5>
                              
                              <div className="space-y-3">
                                <div>
                                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Condition:</div>
                                  <div className="text-sm text-gray-900 dark:text-white">{fullAnalysis.scenarios.bear_case.condition}</div>
                                </div>

                                <div className="pt-3 border-t border-red-200 dark:border-red-800">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <div className="p-2 rounded bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Entry Zone</div>
                                      <div className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">{formatPriceString(fullAnalysis.scenarios.bear_case.entry_zone)}</div>
                                    </div>
                                    <div className="p-2 rounded bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Risk</div>
                                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fullAnalysis.scenarios.bear_case.risk?.toUpperCase()}</div>
                                    </div>
                                    <div className="p-2 rounded bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Targets</div>
                                      <div className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                                        {fullAnalysis.scenarios.bear_case.targets?.map((t: string) => formatPriceString(t)).join(' • ')}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <a href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <a href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="mailto:trade.crypto.oracle@proton.me" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
