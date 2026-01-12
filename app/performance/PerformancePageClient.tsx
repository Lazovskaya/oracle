'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TradeEntryModal, TradeExitModal, ConfirmModal, Toast } from '@/components/Modal';

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

export default function PerformancePageClient({ userEmail }: { userEmail: string }) {
  const [trackedTrades, setTrackedTrades] = useState<TrackedTrade[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'winners' | 'losers'>('all');

  // Modal states
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
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const [performanceRes, statsRes] = await Promise.all([
        fetch(`/api/idea-performance?user_email=${encodeURIComponent(userEmail)}`),
        fetch(`/api/idea-performance/stats?user_email=${encodeURIComponent(userEmail)}`)
      ]);

      if (performanceRes.ok) {
        const performanceData = await performanceRes.json();
        setTrackedTrades(performanceData.records || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setPerformanceStats(statsData.stats || null);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      showToast('Failed to load performance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsExited = (tradeId: number, trade: TrackedTrade) => {
    setExitModal({ isOpen: true, tradeId, trade });
  };

  const handleExitSubmit = async (data: { exitPrice: string; exitReason: string; lessonsLearned: string }) => {
    try {
      const response = await fetch('/api/idea-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'exit',
          tradeId: exitModal.tradeId,
          exit_price: parseFloat(data.exitPrice),
          exit_reason: data.exitReason,
          lessons_learned: data.lessonsLearned,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        showToast('Trade closed successfully', 'success');
        setExitModal({ isOpen: false, tradeId: 0, trade: null });
        fetchPerformanceData();
      } else {
        showToast(responseData.error || 'Failed to close trade', 'error');
      }
    } catch (error) {
      console.error('Error closing trade:', error);
      showToast('Failed to close trade', 'error');
    }
  };

  const handleDeleteTrade = (tradeId: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Trade',
      message: 'Are you sure you want to delete this tracked trade? This action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/idea-performance?id=${tradeId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            showToast('Trade deleted successfully', 'success');
            fetchPerformanceData();
          } else {
            showToast('Failed to delete trade', 'error');
          }
        } catch (error) {
          console.error('Error deleting trade:', error);
          showToast('Failed to delete trade', 'error');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredTrades = trackedTrades.filter(trade => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return trade.status === 'active';
    if (activeTab === 'winners') return trade.status === 'winner';
    if (activeTab === 'losers') return trade.status === 'loser';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/oracle"
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Performance
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track your trades and analyze your results
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading performance data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Overview */}
            {performanceStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-2">Win Rate</div>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {performanceStats.winRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                    {performanceStats.winners}W / {performanceStats.losers}L / {performanceStats.breakeven}BE
                  </div>
                </div>

                <div className={`p-6 rounded-xl border ${
                  performanceStats.totalProfitLoss >= 0
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className={`text-sm font-semibold mb-2 ${
                    performanceStats.totalProfitLoss >= 0
                      ? 'text-emerald-900 dark:text-emerald-400'
                      : 'text-red-900 dark:text-red-400'
                  }`}>
                    Total P&L
                  </div>
                  <div className={`text-3xl font-bold ${
                    performanceStats.totalProfitLoss >= 0
                      ? 'text-emerald-900 dark:text-emerald-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {performanceStats.totalProfitLossPercentage >= 0 ? '+' : ''}
                    {performanceStats.totalProfitLossPercentage.toFixed(2)}%
                  </div>
                  <div className={`text-sm mt-2 ${
                    performanceStats.totalProfitLoss >= 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}>
                    ${Math.abs(performanceStats.totalProfitLoss).toFixed(2)}
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                  <div className="text-sm font-semibold text-purple-900 dark:text-purple-400 mb-2">Active Trades</div>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {performanceStats.activeTrades}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-400 mt-2">
                    {performanceStats.totalTrades} total
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800">
                  <div className="text-sm font-semibold text-amber-900 dark:text-amber-400 mb-2">Profit Factor</div>
                  <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                    {performanceStats.profitFactor.toFixed(2)}
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-400 mt-2">
                    {performanceStats.profitFactor >= 2 ? 'Excellent' : performanceStats.profitFactor >= 1.5 ? 'Good' : 'Improving'}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 mb-6 p-4">
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  All Trades ({trackedTrades.length})
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Active ({trackedTrades.filter(t => t.status === 'active').length})
                </button>
                <button
                  onClick={() => setActiveTab('winners')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'winners'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Winners ({trackedTrades.filter(t => t.status === 'winner').length})
                </button>
                <button
                  onClick={() => setActiveTab('losers')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'losers'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Losers ({trackedTrades.filter(t => t.status === 'loser').length})
                </button>
              </div>
            </div>

            {/* Trades List */}
            {filteredTrades.length === 0 ? (
              <div className="p-12 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Trades Found</p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {activeTab === 'all' 
                    ? 'Start tracking your trades by marking saved ideas as "Entered"'
                    : `No ${activeTab === 'active' ? 'active' : activeTab} trades yet`}
                </p>
                <Link
                  href="/account"
                  className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                >
                  View Saved Ideas
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className={`p-4 rounded-lg border ${
                      trade.status === 'active'
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
                        : trade.status === 'winner'
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                        : trade.status === 'loser'
                        ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{trade.symbol}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            trade.status === 'active'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : trade.status === 'winner'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : trade.status === 'loser'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                          }`}>
                            {trade.status.toUpperCase()}
                          </span>
                          {trade.profit_loss_percentage !== undefined && trade.status !== 'active' && (
                            <span className={`text-base font-bold ${
                              trade.profit_loss_percentage > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {trade.profit_loss_percentage > 0 ? '+' : ''}
                              {trade.profit_loss_percentage.toFixed(2)}%
                            </span>
                          )}
                          {trade.duration_days && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {trade.duration_days}d
                            </span>
                          )}
                          {trade.entry_date && (
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {formatDate(trade.entry_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {trade.status === 'active' && (
                          <button
                            onClick={() => handleMarkAsExited(trade.id!, trade)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors"
                          >
                            Close
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTrade(trade.id!)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-2">
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
                      {trade.original_stop_loss && (
                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Stop</div>
                          <div className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                            ${trade.original_stop_loss.toFixed(trade.original_stop_loss < 1 ? 4 : 2)}
                          </div>
                        </div>
                      )}
                      {trade.original_target && (
                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Target</div>
                          <div className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                            ${trade.original_target.toFixed(trade.original_target < 1 ? 4 : 2)}
                          </div>
                        </div>
                      )}
                      {trade.position_value && (
                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Position</div>
                          <div className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                            ${trade.position_value.toFixed(2)}
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
                            {trade.profit_loss > 0 ? '+' : ''}${Math.abs(trade.profit_loss).toFixed(2)}
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
                      {trade.exit_reason && (
                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Exit</div>
                          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {trade.exit_reason.replace(/_/g, ' ')}
                          </div>
                        </div>
                      )}
                    </div>

                    {trade.notes && (
                      <div className="mb-2 p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Notes:</div>
                        <div className="text-xs text-gray-700 dark:text-gray-300">{trade.notes}</div>
                      </div>
                    )}

                    {trade.lessons_learned && (
                      <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Lessons:</div>
                        <div className="text-xs text-gray-700 dark:text-gray-300">{trade.lessons_learned}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <TradeExitModal
        isOpen={exitModal.isOpen}
        onClose={() => setExitModal({ isOpen: false, tradeId: 0, trade: null })}
        onSubmit={handleExitSubmit}
        symbol={exitModal.trade?.symbol || ''}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
