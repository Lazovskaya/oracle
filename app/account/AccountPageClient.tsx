'use client';
import { useEffect, useState } from 'react';
import { User } from '@/lib/auth';
import Link from 'next/link';
import { TradeEntryModal, TradeExitModal, ConfirmModal, Toast } from '@/components/Modal';

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

interface TrackedTrade {
  id: number;
  saved_idea_id?: number;
  saved_analysis_id?: number;
  symbol: string;
  idea_type: string;
  entry_price?: number;
  entry_date?: string;
  position_size?: number;
  position_value?: number;
  exit_price?: number;
  exit_date?: string;
  exit_reason?: string;
  status: 'active' | 'winner' | 'loser' | 'breakeven' | 'cancelled';
  profit_loss?: number;
  profit_loss_percentage?: number;
  risk_reward_ratio?: number;
  original_target?: number;
  original_stop_loss?: number;
  duration_days?: number;
  expected_timeframe?: string;
  notes?: string;
  lessons_learned?: string;
  created_at?: string;
  closed_at?: string;
}

interface PerformanceStats {
  totalTrades: number;
  activeTrades: number;
  closedTrades: number;
  winners: number;
  losers: number;
  breakeven: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  bestTrade: { symbol: string; profit: number; percentage: number } | null;
  worstTrade: { symbol: string; loss: number; percentage: number } | null;
  avgDuration: number;
  avgRiskReward: number;
  profitFactor: number;
}

export default function AccountPageClient({ user }: { user: User }) {
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [trackedTrades, setTrackedTrades] = useState<TrackedTrade[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [tradingStyle, setTradingStyle] = useState(user.trading_style);
  const [updatingStyle, setUpdatingStyle] = useState(false);
  const [assetPreference, setAssetPreference] = useState(user.asset_preference);
  const [updatingAsset, setUpdatingAsset] = useState(false);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);

  // Modal states
  const [entryModal, setEntryModal] = useState<{ isOpen: boolean; savedIdeaId: number; idea: SavedIdea | null }>({
    isOpen: false,
    savedIdeaId: 0,
    idea: null
  });
  const [exitModal, setExitModal] = useState<{ isOpen: boolean; tradeId: number; trade: TrackedTrade | null }>({
    isOpen: false,
    tradeId: 0,
    trade: null
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ isVisible: false, message: '', type: 'info' });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ isVisible: true, message, type });
  };

  useEffect(() => {
    fetchSavedIdeas();
    if (user.subscription_tier === 'pro') {
      fetchSavedAnalyses();
    }
  }, []);

  useEffect(() => {
    if (showPerformance) {
      fetchPerformanceData();
    }
  }, [showPerformance]);

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

  const fetchPerformanceData = async () => {
    setLoadingPerformance(true);
    try {
      // Fetch tracked trades
      const tradesResponse = await fetch(`/api/idea-performance?user_email=${encodeURIComponent(user.email)}`);
      const tradesData = await tradesResponse.json();
      setTrackedTrades(tradesData.records || []);

      // Fetch statistics
      const statsResponse = await fetch(`/api/idea-performance/stats?user_email=${encodeURIComponent(user.email)}`);
      const statsData = await statsResponse.json();
      setPerformanceStats(statsData.stats || null);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoadingPerformance(false);
    }
  };

  const handleMarkAsEntered = async (savedIdeaId: number, idea: SavedIdea) => {
    setEntryModal({ isOpen: true, savedIdeaId, idea });
  };

  const handleMarkAnalysisAsEntered = async (savedAnalysisId: number, analysis: SavedAnalysis) => {
    setEntryModal({ 
      isOpen: true, 
      savedIdeaId: 0, 
      idea: {
        id: savedAnalysisId,
        oracle_run_id: 0,
        symbol: analysis.symbol,
        entry: analysis.entry || String(analysis.current_price),
        stop: analysis.stop_loss || '',
        targets: analysis.targets ? JSON.parse(analysis.targets).join(', ') : '',
        rationale: analysis.market_context,
        confidence: analysis.confidence,
        bias: '',
        timeframe: analysis.timeframe,
        wave_context: '',
        risk_note: '',
        saved_at: analysis.saved_at,
      }
    });
  };

  const handleEntrySubmit = async (data: { entryPrice: string; positionValue: string; notes: string }) => {
    const { savedIdeaId, idea } = entryModal;
    if (!idea) return;

    try {
      const response = await fetch('/api/idea-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saved_idea_id: savedIdeaId || undefined,
          saved_analysis_id: savedIdeaId === 0 ? idea.id : undefined,
          user_email: user.email,
          symbol: idea.symbol,
          idea_type: savedIdeaId === 0 ? 'symbol_analysis' : 'daily_oracle',
          entry_price: parseFloat(data.entryPrice),
          entry_date: new Date().toISOString(),
          position_value: data.positionValue ? parseFloat(data.positionValue) : undefined,
          original_target: idea.targets ? parseFloat(idea.targets.split(',')[0].trim().replace('$', '')) : undefined,
          original_stop_loss: idea.stop ? parseFloat(idea.stop.replace('$', '')) : undefined,
          expected_timeframe: idea.timeframe,
          status: 'active',
          notes: data.notes || undefined,
        }),
      });

      if (response.ok) {
        showToast(`Trade entered for ${idea.symbol}! Now tracking performance.`, 'success');
        fetchPerformanceData();
      } else {
        const error = await response.json();
        showToast(`Failed to mark as entered: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Error marking as entered:', error);
      showToast('Failed to mark trade as entered', 'error');
    }
  };

  const handleMarkAsExited = async (tradeId: number, trade: TrackedTrade) => {
    setExitModal({ isOpen: true, tradeId, trade });
  };

  const handleExitSubmit = async (data: { exitPrice: string; exitReason: string; lessonsLearned: string }) => {
    const { tradeId, trade } = exitModal;
    if (!trade) return;

    try {
      const response = await fetch('/api/idea-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tradeId,
          user_email: user.email,
          symbol: trade.symbol,
          idea_type: trade.idea_type,
          entry_price: trade.entry_price,
          entry_date: trade.entry_date,
          exit_price: parseFloat(data.exitPrice),
          exit_date: new Date().toISOString(),
          exit_reason: data.exitReason,
          position_size: trade.position_size,
          position_value: trade.position_value,
          original_target: trade.original_target,
          original_stop_loss: trade.original_stop_loss,
          expected_timeframe: trade.expected_timeframe,
          lessons_learned: data.lessonsLearned || undefined,
        }),
      });

      if (response.ok) {
        showToast(`Trade closed for ${trade.symbol}!`, 'success');
        fetchPerformanceData();
      } else {
        const error = await response.json();
        showToast(`Failed to close trade: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Error closing trade:', error);
      showToast('Failed to close trade', 'error');
    }
  };

  const handleDeleteTrade = async (tradeId: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Trade Record',
      message: 'Delete this trade record? This cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/idea-performance?id=${tradeId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            setTrackedTrades(trackedTrades.filter(t => t.id !== tradeId));
            fetchPerformanceData();
            showToast('Trade record deleted', 'success');
          } else {
            showToast('Failed to delete trade record', 'error');
          }
        } catch (error) {
          console.error('Error deleting trade:', error);
          showToast('Failed to delete trade', 'error');
        }
      }
    });
  };

  const handleDelete = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Saved Idea',
      message: 'Remove this idea from your saved list?',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await fetch(`/api/saved-ideas?id=${id}`, { method: 'DELETE' });
          setSavedIdeas(savedIdeas.filter(idea => idea.id !== id));
          showToast('Idea removed', 'success');
        } catch (error) {
          console.error('Error deleting idea:', error);
          showToast('Failed to remove idea', 'error');
        }
      }
    });
  };

  const handleDeleteAnalysis = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Saved Analysis',
      message: 'Remove this analysis from your saved list?',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await fetch(`/api/saved-symbol-analyses?id=${id}`, { method: 'DELETE' });
          setSavedAnalyses(savedAnalyses.filter(analysis => analysis.id !== id));
          showToast('Analysis removed', 'success');
        } catch (error) {
          console.error('Error deleting analysis:', error);
          showToast('Failed to remove analysis', 'error');
        }
      }
    });
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
          conservative: 'Trading style updated to Capital Protection. Your recommendations will prioritize capital preservation.',
          balanced: 'Trading style updated to Trend Following. You\'ll get standard risk/reward recommendations.',
          aggressive: 'Trading style updated to Momentum Hunt. Your recommendations will target higher returns with increased risk.',
        };
        showToast(messages[newStyle], 'success');
      } else {
        showToast('Failed to update trading style', 'error');
      }
    } catch (error) {
      console.error('Error updating trading style:', error);
      showToast('Failed to update trading style', 'error');
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
          crypto: 'Asset preference updated to Crypto. You\'ll see cryptocurrency trading ideas.',
          stocks: 'Asset preference updated to Stocks. You\'ll see stock market trading ideas.',
          both: 'Asset preference updated to Both. You\'ll see both crypto and stock ideas.',
        };
        showToast(messages[newPreference], 'success');
      } else {
        showToast('Failed to update asset preference', 'error');
      }
    } catch (error) {
      console.error('Error updating asset preference:', error);
      showToast('Failed to update asset preference', 'error');
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

  const handleCancelSubscription = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Subscription',
      message: '⚠️ Cancel your subscription?\n\nYour access will continue until the end of your current billing period.\n\nThis action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        setCancelingSubscription(true);
        try {
          const response = await fetch('/api/stripe/cancel-subscription', {
            method: 'POST',
          });

          const data = await response.json();

          if (response.ok) {
            showToast('Subscription canceled successfully! You\'ll keep access until the end of your billing period.', 'success');
            // Reload to update UI
            setTimeout(() => window.location.reload(), 2000);
          } else {
            showToast(`Failed to cancel subscription: ${data.error}`, 'error');
          }
        } catch (error) {
          console.error('Error canceling subscription:', error);
          showToast('Failed to cancel subscription. Please try again or contact support.', 'error');
        } finally {
          setCancelingSubscription(false);
        }
      }
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
    <main className="min-h-screen px-6 py-12 bg-slate-50 dark:bg-slate-950">
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
          <div className="flex items-center gap-3">
            {user.is_admin && (
              <Link
                href="/admin"
                className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                title="Admin Panel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            )}
            <a
              href="/api/auth/logout"
              className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5 sm:gap-2 text-gray-900 dark:text-gray-100 text-xs sm:text-sm"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </a>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="mb-6 p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Subscription Details</h2>
          
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
        <div className="mb-6 p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Trading Lens</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Choose your trading approach. This helps us tailor recommendations to your preferences.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleTradingStyleChange('conservative')}
              disabled={updatingStyle}
              className={`p-4 rounded-lg text-sm font-medium transition-all ${
                tradingStyle === 'conservative'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold">Capital Protection</span>
                <span className="text-xs opacity-80">Lower risk, steady gains</span>
              </div>
            </button>

            <button
              onClick={() => handleTradingStyleChange('balanced')}
              disabled={updatingStyle}
              className={`p-4 rounded-lg text-sm font-medium transition-all ${
                tradingStyle === 'balanced'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold">Trend Following</span>
                <span className="text-xs opacity-80">Balanced risk/reward</span>
              </div>
            </button>

            <button
              onClick={() => handleTradingStyleChange('aggressive')}
              disabled={updatingStyle}
              className={`p-4 rounded-lg text-sm font-medium transition-all ${
                tradingStyle === 'aggressive'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold">Momentum Hunt</span>
                <span className="text-xs opacity-80">High risk, high reward</span>
              </div>
            </button>
          </div>
        </div>

        {/* Asset Preference */}
        <div className="mb-6 p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Asset Type</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Choose which asset classes you want to see in trading recommendations.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleAssetPreferenceChange('crypto')}
              disabled={updatingAsset}
              className={`p-4 rounded-lg text-sm font-medium transition-all ${
                assetPreference === 'crypto'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold">Crypto</span>
                <span className="text-xs opacity-80">Digital currencies</span>
              </div>
            </button>

            <button
              onClick={() => handleAssetPreferenceChange('stocks')}
              disabled={updatingAsset}
              className={`p-4 rounded-lg text-sm font-medium transition-all ${
                assetPreference === 'stocks'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold">Stocks</span>
                <span className="text-xs opacity-80">Traditional equities</span>
              </div>
            </button>

            <button
              onClick={() => handleAssetPreferenceChange('both')}
              disabled={updatingAsset}
              className={`p-4 rounded-lg text-sm font-medium transition-all ${
                assetPreference === 'both'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold">Both</span>
                <span className="text-xs opacity-80">All opportunities</span>
              </div>
            </button>
          </div>
        </div>

        {/* Performance Tracking */}
        <div className="mb-8">
          <button
            onClick={() => setShowPerformance(!showPerformance)}
            className="w-full flex items-center justify-between p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Performance Tracking
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track your trades and measure your success
                </p>
              </div>
            </div>
            <svg
              className={`w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform ${showPerformance ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showPerformance && (
            <div className="space-y-6">
              {loadingPerformance ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading performance data...</p>
                </div>
              ) : (
                <>
                  {/* Statistics Overview */}
                  {performanceStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                        <div className="text-xs font-semibold text-blue-900 dark:text-blue-400 mb-1">Win Rate</div>
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {performanceStats.winRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          {performanceStats.winners}W / {performanceStats.losers}L
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg border ${
                        performanceStats.totalProfitLoss >= 0
                          ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800'
                          : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800'
                      }`}>
                        <div className={`text-xs font-semibold mb-1 ${
                          performanceStats.totalProfitLoss >= 0
                            ? 'text-emerald-900 dark:text-emerald-400'
                            : 'text-red-900 dark:text-red-400'
                        }`}>
                          Total P&L
                        </div>
                        <div className={`text-2xl font-bold ${
                          performanceStats.totalProfitLoss >= 0
                            ? 'text-emerald-900 dark:text-emerald-100'
                            : 'text-red-900 dark:text-red-100'
                        }`}>
                          {performanceStats.totalProfitLossPercentage >= 0 ? '+' : ''}
                          {performanceStats.totalProfitLossPercentage.toFixed(2)}%
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                        <div className="text-xs font-semibold text-purple-900 dark:text-purple-400 mb-1">Active Trades</div>
                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {performanceStats.activeTrades}
                        </div>
                        <div className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                          {performanceStats.totalTrades} total
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800">
                        <div className="text-xs font-semibold text-amber-900 dark:text-amber-400 mb-1">Profit Factor</div>
                        <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                          {performanceStats.profitFactor.toFixed(2)}
                        </div>
                        <div className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                          {performanceStats.profitFactor >= 2 ? 'Excellent' : performanceStats.profitFactor >= 1.5 ? 'Good' : 'Improving'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tracked Trades */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Tracked Trades
                      </h3>
                      <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-md text-sm font-medium border border-emerald-200 dark:border-emerald-800">
                        {trackedTrades.length} tracked
                      </span>
                    </div>

                    {trackedTrades.length === 0 ? (
                      <div className="p-12 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <svg className="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Tracked Trades Yet</p>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Mark your saved ideas as "Entered" to start tracking performance
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Active Trades */}
                        {trackedTrades.filter(t => t.status === 'active').length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Active Positions</h4>
                            {trackedTrades.filter(t => t.status === 'active').map((trade) => (
                              <div
                                key={trade.id}
                                className="p-5 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 mb-3"
                              >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{trade.symbol}</h3>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                                        ACTIVE
                                      </span>
                                      {trade.entry_date && (
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          Entered {formatDate(trade.entry_date)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleMarkAsExited(trade.id!, trade)}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-md transition-colors"
                                    >
                                      Close Trade
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTrade(trade.id!)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {trade.entry_price && (
                                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Entry</div>
                                      <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
                                        ${trade.entry_price.toFixed(trade.entry_price < 1 ? 4 : 2)}
                                      </div>
                                    </div>
                                  )}
                                  {trade.original_stop_loss && (
                                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Stop Loss</div>
                                      <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
                                        ${trade.original_stop_loss.toFixed(trade.original_stop_loss < 1 ? 4 : 2)}
                                      </div>
                                    </div>
                                  )}
                                  {trade.original_target && (
                                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Target</div>
                                      <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
                                        ${trade.original_target.toFixed(trade.original_target < 1 ? 4 : 2)}
                                      </div>
                                    </div>
                                  )}
                                  {trade.position_value && (
                                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Position</div>
                                      <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
                                        ${trade.position_value.toFixed(2)}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {trade.notes && (
                                  <div className="mt-3 p-2 bg-white dark:bg-slate-900 rounded text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-semibold">Note:</span> {trade.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Closed Trades */}
                        {trackedTrades.filter(t => ['winner', 'loser', 'breakeven'].includes(t.status)).length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Closed Positions</h4>
                            {trackedTrades.filter(t => ['winner', 'loser', 'breakeven'].includes(t.status)).map((trade) => (
                              <div
                                key={trade.id}
                                className={`p-5 rounded-lg border mb-3 ${
                                  trade.status === 'winner'
                                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                                    : trade.status === 'loser'
                                    ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                                    : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{trade.symbol}</h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                        trade.status === 'winner'
                                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                          : trade.status === 'loser'
                                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                      }`}>
                                        {trade.status.toUpperCase()}
                                      </span>
                                      {trade.profit_loss_percentage !== undefined && (
                                        <span className={`text-lg font-bold ${
                                          trade.profit_loss_percentage > 0
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-red-600 dark:text-red-400'
                                        }`}>
                                          {trade.profit_loss_percentage > 0 ? '+' : ''}
                                          {trade.profit_loss_percentage.toFixed(2)}%
                                        </span>
                                      )}
                                      {trade.duration_days && (
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          {trade.duration_days}d hold
                                        </span>
                                      )}
                                      {trade.exit_reason && (
                                        <span className="text-xs text-gray-500 dark:text-gray-500">
                                          ({trade.exit_reason.replace('_', ' ')})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteTrade(trade.id!)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {trade.entry_price && (
                                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Entry</div>
                                      <div className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                                        ${trade.entry_price.toFixed(trade.entry_price < 1 ? 4 : 2)}
                                      </div>
                                    </div>
                                  )}
                                  {trade.exit_price && (
                                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Exit</div>
                                      <div className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                                        ${trade.exit_price.toFixed(trade.exit_price < 1 ? 4 : 2)}
                                      </div>
                                    </div>
                                  )}
                                  {trade.profit_loss !== undefined && (
                                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                      <div className="text-xs text-gray-500 dark:text-gray-400">P&L</div>
                                      <div className={`text-sm font-mono font-semibold ${
                                        trade.profit_loss > 0
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : 'text-red-600 dark:text-red-400'
                                      }`}>
                                        ${Math.abs(trade.profit_loss).toFixed(2)}
                                      </div>
                                    </div>
                                  )}
                                  {trade.risk_reward_ratio && (
                                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                      <div className="text-xs text-gray-500 dark:text-gray-400">R:R</div>
                                      <div className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                                        1:{trade.risk_reward_ratio.toFixed(2)}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {trade.lessons_learned && (
                                  <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Lessons Learned:</div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300">{trade.lessons_learned}</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
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
            <div className="p-12 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMarkAsEntered(idea.id, idea)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-md transition-colors flex items-center gap-1.5"
                          title="Mark as entered to track performance"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Track Trade
                        </button>
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
                      <div className="mt-4 p-3 bg-pink-50/50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-pink-600 dark:text-pink-500">⚠️</span>
                          <div>
                            <div className="text-xs font-semibold text-pink-800 dark:text-pink-400 mb-1">Risk Note</div>
                            <div className="text-sm text-pink-700 dark:text-pink-300">{idea.risk_note}</div>
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
        {user.subscription_tier === 'pro' && (
          <div className="mb-6 p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Symbol Analyses</h2>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded">
                  PRO
                </span>
                <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium border border-blue-200 dark:border-blue-800">
                  {savedAnalyses.length} saved
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMarkAnalysisAsEntered(analysis.id, analysis)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-md transition-colors flex items-center gap-1.5"
                            title="Mark as entered to track performance"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Track Trade
                          </button>
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

        {/* Cancel Subscription */}
        {(user.subscription_tier === 'premium' || user.subscription_tier === 'pro') && user.subscription_status !== 'canceled' && (
          <div className="mb-8 p-6 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
            <h2 className="text-xl font-semibold mb-2 text-red-900 dark:text-red-400">Cancel Subscription</h2>
            <p className="text-sm text-red-700 dark:text-red-400 mb-4">
              Cancel your subscription anytime. Your access will continue until the end of your current billing period.
            </p>
            <button
              onClick={handleCancelSubscription}
              disabled={cancelingSubscription}
              className="w-full px-4 py-3 rounded-lg border-2 border-red-300 dark:border-red-800 bg-white dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {cancelingSubscription ? 'Canceling...' : 'Cancel Subscription'}
            </button>
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

      {/* Modals */}
      <TradeEntryModal
        isOpen={entryModal.isOpen}
        onClose={() => setEntryModal({ isOpen: false, savedIdeaId: 0, idea: null })}
        onSubmit={handleEntrySubmit}
        symbol={entryModal.idea?.symbol || ''}
        defaultEntry={entryModal.idea?.entry?.replace('$', '') || ''}
      />

      <TradeExitModal
        isOpen={exitModal.isOpen}
        onClose={() => setExitModal({ isOpen: false, tradeId: 0, trade: null })}
        onSubmit={handleExitSubmit}
        symbol={exitModal.trade?.symbol || ''}
        defaultExitPrice={exitModal.trade?.entry_price?.toString() || ''}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
      />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </main>
  );
}
