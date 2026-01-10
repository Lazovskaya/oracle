'use client';
import { useState } from 'react';
import Link from 'next/link';

interface AdminPanelClientProps {
  user: {
    email: string;
    subscription_tier: string;
    is_admin: boolean;
  };
}

export default function AdminPanelClient({ user }: AdminPanelClientProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [runType, setRunType] = useState<'single' | 'all-styles'>('single');
  const [selectedStyle, setSelectedStyle] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');

  const handleRunOracle = async () => {
    setIsRunning(true);
    setError(null);
    setRunResult(null);

    try {
      const endpoint = runType === 'all-styles' 
        ? '/api/run-oracle-all-styles'
        : '/api/run-oracle';

      const body = runType === 'single' 
        ? JSON.stringify({ tradingStyle: selectedStyle })
        : undefined;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body,
      });

      const data = await response.json();

      if (data.ok) {
        setRunResult(data);
      } else {
        setError(data.error || 'Oracle run failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsRunning(false);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'premium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'free':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'Pro';
      case 'premium':
        return 'Premium';
      case 'free':
        return 'Free';
      default:
        return tier.charAt(0).toUpperCase() + tier.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/oracle" 
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Oracle
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                🛠️ Admin Panel
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Administrative controls and system management
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Logged in as
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {user.email}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  Admin
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierBadgeColor(user.subscription_tier)}`}>
                  {getTierLabel(user.subscription_tier)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Oracle Runner Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Run Oracle Prediction
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Generate new oracle predictions with AI analysis of current market conditions.
          </p>

          {/* Run Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Run Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="single"
                  checked={runType === 'single'}
                  onChange={(e) => setRunType(e.target.value as 'single' | 'all-styles')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Single Style</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="all-styles"
                  checked={runType === 'all-styles'}
                  onChange={(e) => setRunType(e.target.value as 'single' | 'all-styles')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">All Styles (Conservative, Balanced, Aggressive)</span>
              </label>
            </div>
          </div>

          {/* Style Selection (only for single) */}
          {runType === 'single' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trading Style
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as 'conservative' | 'balanced' | 'aggressive')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
              >
                <option value="conservative">Conservative</option>
                <option value="balanced">Balanced</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
          )}

          <button
            onClick={handleRunOracle}
            disabled={isRunning}
            className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRunning ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running Oracle...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Run Oracle Now
              </>
            )}
          </button>

          {/* Result Display */}
          {runResult && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                ✅ Oracle Run Successful
              </h3>
              <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <div>Model: {runResult.model || 'N/A'}</div>
                {runResult.inserted && (
                  <div>Rows Affected: {runResult.inserted.rowsAffected || 0}</div>
                )}
                {runResult.styles && (
                  <div>Generated: {runResult.styles.join(', ')}</div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                ❌ Error
              </h3>
              <div className="text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Admin Information
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>• Run button removed from main oracle page for all users including Pro</p>
            <p>• Only administrators (admin@go.go) can access this panel</p>
            <p>• Oracle runs generate predictions for all enabled languages: EN, RU, FR, ES, ZH</p>
            <p>• Single run generates one prediction, All Styles generates three (conservative, balanced, aggressive)</p>
            <p><strong>Subscription Tiers:</strong></p>
            <p className="ml-4">• Free: Basic access to oracle predictions</p>
            <p className="ml-4">• Premium: Can see prices, targets, stops, and detailed explanations</p>
            <p className="ml-4">• Pro: Premium features + Custom symbol analysis tool</p>
          </div>
        </div>
      </div>
    </div>
  );
}
