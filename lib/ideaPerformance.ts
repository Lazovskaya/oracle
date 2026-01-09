/**
 * Idea Performance Tracking Types and Helper Functions
 */

export interface IdeaPerformance {
  id?: number;
  
  // References
  saved_idea_id?: number;
  saved_analysis_id?: number;
  
  // Idea details
  user_email: string;
  symbol: string;
  idea_type: 'daily_oracle' | 'symbol_analysis';
  
  // Entry information
  entry_price?: number;
  entry_date?: string;
  position_size?: number;
  position_value?: number;
  
  // Exit information
  exit_price?: number;
  exit_date?: string;
  exit_reason?: 'target_hit' | 'stop_loss' | 'manual_exit' | 'time_based';
  
  // Performance metrics
  status: 'active' | 'winner' | 'loser' | 'breakeven' | 'cancelled';
  profit_loss?: number;
  profit_loss_percentage?: number;
  risk_reward_ratio?: number;
  
  // Target/Stop tracking
  original_target?: number;
  original_stop_loss?: number;
  targets_hit?: string; // JSON array
  highest_price?: number;
  lowest_price?: number;
  
  // Time metrics
  duration_days?: number;
  expected_timeframe?: string;
  
  // User notes
  notes?: string;
  lessons_learned?: string;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  closed_at?: string;
}

/**
 * Calculate profit/loss metrics
 */
export function calculateProfitLoss(
  entryPrice: number,
  exitPrice: number,
  positionSize: number = 1
): {
  profitLoss: number;
  profitLossPercentage: number;
} {
  const profitLoss = (exitPrice - entryPrice) * positionSize;
  const profitLossPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;
  
  return {
    profitLoss: Math.round(profitLoss * 100) / 100,
    profitLossPercentage: Math.round(profitLossPercentage * 100) / 100,
  };
}

/**
 * Calculate risk-reward ratio achieved
 */
export function calculateRiskRewardRatio(
  entryPrice: number,
  exitPrice: number,
  stopLoss: number
): number {
  const reward = Math.abs(exitPrice - entryPrice);
  const risk = Math.abs(entryPrice - stopLoss);
  
  if (risk === 0) return 0;
  
  return Math.round((reward / risk) * 100) / 100;
}

/**
 * Calculate duration in days
 */
export function calculateDuration(entryDate: string, exitDate: string): number {
  const entry = new Date(entryDate);
  const exit = new Date(exitDate);
  const diffTime = Math.abs(exit.getTime() - entry.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Determine status based on profit/loss
 */
export function determineStatus(profitLossPercentage: number): 'winner' | 'loser' | 'breakeven' {
  if (profitLossPercentage > 0.5) return 'winner';
  if (profitLossPercentage < -0.5) return 'loser';
  return 'breakeven';
}

/**
 * Performance statistics for a collection of ideas
 */
export interface PerformanceStats {
  totalTrades: number;
  activeTrades: number;
  closedTrades: number;
  
  winners: number;
  losers: number;
  breakeven: number;
  
  winRate: number;
  avgWin: number;
  avgLoss: number;
  avgWinLoss: number;
  
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  
  bestTrade: {
    symbol: string;
    profit: number;
    percentage: number;
  } | null;
  
  worstTrade: {
    symbol: string;
    loss: number;
    percentage: number;
  } | null;
  
  avgDuration: number;
  avgRiskReward: number;
  
  profitFactor: number; // total wins / total losses
}

/**
 * Calculate performance statistics
 */
export function calculatePerformanceStats(trades: IdeaPerformance[]): PerformanceStats {
  const closedTrades = trades.filter(t => ['winner', 'loser', 'breakeven'].includes(t.status));
  const activeTrades = trades.filter(t => t.status === 'active');
  
  const winners = closedTrades.filter(t => t.status === 'winner');
  const losers = closedTrades.filter(t => t.status === 'loser');
  const breakeven = closedTrades.filter(t => t.status === 'breakeven');
  
  const totalWins = winners.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const totalLosses = Math.abs(losers.reduce((sum, t) => sum + (t.profit_loss || 0), 0));
  
  const avgWin = winners.length > 0 ? totalWins / winners.length : 0;
  const avgLoss = losers.length > 0 ? totalLosses / losers.length : 0;
  
  const totalProfitLoss = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const avgDuration = closedTrades.length > 0 
    ? closedTrades.reduce((sum, t) => sum + (t.duration_days || 0), 0) / closedTrades.length 
    : 0;
  
  const avgRiskReward = closedTrades.filter(t => t.risk_reward_ratio).length > 0
    ? closedTrades.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0) / 
      closedTrades.filter(t => t.risk_reward_ratio).length
    : 0;
  
  // Find best and worst trades
  let bestTrade = null;
  let worstTrade = null;
  
  if (closedTrades.length > 0) {
    const sortedByProfit = [...closedTrades].sort((a, b) => 
      (b.profit_loss || 0) - (a.profit_loss || 0)
    );
    
    if (sortedByProfit[0] && (sortedByProfit[0].profit_loss || 0) > 0) {
      bestTrade = {
        symbol: sortedByProfit[0].symbol,
        profit: sortedByProfit[0].profit_loss || 0,
        percentage: sortedByProfit[0].profit_loss_percentage || 0,
      };
    }
    
    if (sortedByProfit[sortedByProfit.length - 1] && 
        (sortedByProfit[sortedByProfit.length - 1].profit_loss || 0) < 0) {
      worstTrade = {
        symbol: sortedByProfit[sortedByProfit.length - 1].symbol,
        loss: sortedByProfit[sortedByProfit.length - 1].profit_loss || 0,
        percentage: sortedByProfit[sortedByProfit.length - 1].profit_loss_percentage || 0,
      };
    }
  }
  
  return {
    totalTrades: trades.length,
    activeTrades: activeTrades.length,
    closedTrades: closedTrades.length,
    
    winners: winners.length,
    losers: losers.length,
    breakeven: breakeven.length,
    
    winRate: closedTrades.length > 0 
      ? Math.round((winners.length / closedTrades.length) * 100 * 100) / 100 
      : 0,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    avgWinLoss: avgLoss > 0 ? Math.round((avgWin / avgLoss) * 100) / 100 : 0,
    
    totalProfitLoss: Math.round(totalProfitLoss * 100) / 100,
    totalProfitLossPercentage: closedTrades.length > 0
      ? Math.round(closedTrades.reduce((sum, t) => sum + (t.profit_loss_percentage || 0), 0) * 100) / 100
      : 0,
    
    bestTrade,
    worstTrade,
    
    avgDuration: Math.round(avgDuration * 10) / 10,
    avgRiskReward: Math.round(avgRiskReward * 100) / 100,
    
    profitFactor: totalLosses > 0 ? Math.round((totalWins / totalLosses) * 100) / 100 : 0,
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}$${amount.toFixed(2)}`;
}

/**
 * Format percentage
 */
export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
}
