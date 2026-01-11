'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MarketAsset {
  symbol: string;
  name: string;
  asset_type: string;
  price: number;
  change_1h: number | null;
  change_24h: number | null;
  change_7d: number | null;
  volume_24h: number | null;
  market_cap: number | null;
  volatility_14d: number | null;
  is_trending: number;
  is_volatile: number;
  last_updated: string;
  data_source: string;
}

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
  const [englishOnly, setEnglishOnly] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-5-mini');
  
  // Market data refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<any>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Market assets state
  const [marketAssets, setMarketAssets] = useState<MarketAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'crypto' | 'stock' | 'etf'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add ticker state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTicker, setNewTicker] = useState({
    symbol: '',
    name: '',
    asset_type: 'stock',
    price: ''
  });
  const [addingTicker, setAddingTicker] = useState(false);

  // Load market assets on mount
  useEffect(() => {
    fetchMarketAssets();
  }, []);

  const handleRunOracle = async () => {
    setIsRunning(true);
    setError(null);
    setRunResult(null);

    try {
      const endpoint = runType === 'all-styles' 
        ? '/api/run-oracle-all-styles'
        : '/api/run-oracle';

      const body = runType === 'single' 
        ? JSON.stringify({ 
            tradingStyle: selectedStyle,
            englishOnly: !englishOnly,
            model: selectedModel
          })
        : JSON.stringify({ 
            englishOnly: !englishOnly,
            model: selectedModel
          });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const handleRefreshMarketData = async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    setRefreshResult(null);

    try {
      const response = await fetch('/api/update-market-data-bg', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success !== false) {
        setRefreshResult(data);
        // Reload market assets after refresh
        fetchMarketAssets();
      } else {
        setRefreshError(data.message || 'Market data refresh failed');
      }
    } catch (err: any) {
      setRefreshError(err.message || 'Network error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchMarketAssets = async () => {
    setLoadingAssets(true);
    setAssetsError(null);
    
    try {
      const response = await fetch('/api/market-assets');
      const data = await response.json();
      
      if (data.success) {
        setMarketAssets(data.assets || []);
      } else {
        setAssetsError(data.error || 'Failed to fetch market assets');
      }
    } catch (err: any) {
      setAssetsError(err.message || 'Network error');
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingTicker(true);
    
    try {
      const response = await fetch('/api/market-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicker)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowAddForm(false);
        setNewTicker({ symbol: '', name: '', asset_type: 'stock', price: '' });
        fetchMarketAssets();
      } else {
        alert(data.error || 'Failed to add ticker');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setAddingTicker(false);
    }
  };

  const handleDeleteAsset = async (symbol: string) => {
    if (!confirm(`Delete ${symbol} from market data?`)) return;
    
    try {
      const response = await fetch(`/api/market-assets?symbol=${symbol}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchMarketAssets();
      } else {
        alert(data.error || 'Failed to delete asset');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  const filteredAssets = marketAssets.filter(asset => {
    const matchesType = filterType === 'all' || asset.asset_type === filterType;
    const matchesSearch = !searchQuery || 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

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

        {/* Market Data Refresh Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Market Data
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Fetch latest prices from CoinGecko (crypto) and Finnhub (stocks). Updates ~470 assets including gold, silver, and commodities.
          </p>

          <button
            onClick={handleRefreshMarketData}
            disabled={isRefreshing}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRefreshing ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Fetching Market Data...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Market Data
              </>
            )}
          </button>

          {/* Refresh Result Display */}
          {refreshResult && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                ✅ Market Data Updated
              </h3>
              <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                {refreshResult.assetsUpdated && (
                  <div>Assets Updated: {refreshResult.assetsUpdated}</div>
                )}
                {refreshResult.cryptoCount && (
                  <div>Crypto: {refreshResult.cryptoCount}</div>
                )}
                {refreshResult.stockCount && (
                  <div>Stocks/ETFs: {refreshResult.stockCount}</div>
                )}
                {refreshResult.message && (
                  <div>{refreshResult.message}</div>
                )}
                {refreshResult.lastUpdate && (
                  <div className="text-xs mt-2">Last Update: {new Date(refreshResult.lastUpdate).toLocaleString()}</div>
                )}
              </div>
            </div>
          )}

          {/* Refresh Error Display */}
          {refreshError && (
            <div className="mt-6 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                ⚠️ Rate Limited or Error
              </h3>
              <div className="text-sm text-amber-800 dark:text-amber-200">
                {refreshError}
              </div>
            </div>
          )}
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

          {/* Model Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
            >
              <option value="gpt-5-mini">GPT-5 Mini (Default - $0.25/$2.00 per 1M, Tested ✓)</option>
              <option value="gpt-5.1">GPT-5.1 (Premium - $1.25/$10.00 per 1M, Fastest)</option>
              <option value="gpt-4o-mini">GPT-4o Mini ($0.15/$0.60 per 1M)</option>
              <option value="gpt-4o">GPT-4o ($2.50/$10.00 per 1M)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </select>
          </div>

          {/* Language Selection */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={englishOnly}
                  onChange={(e) => setEnglishOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-teal-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {englishOnly ? 'All Languages (EN, RU, FR, ES, ZH)' : 'English Only'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {englishOnly ? 'Generate predictions in all 5 languages' : 'Skip translations - faster generation'}
                </span>
              </div>
            </label>
          </div>

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
                {runResult.duration && (
                  <div>Duration: {runResult.duration}</div>
                )}
                {runResult.results && Array.isArray(runResult.results) && (
                  <div className="mt-2">
                    <div className="font-medium mb-1">Generated Ideas:</div>
                    <ul className="space-y-1 ml-4">
                      {runResult.results.map((result: any) => (
                        <li key={result.style}>
                          <span className="capitalize">{result.style}</span>: {result.ideasCount} {result.ideasCount === 1 ? 'idea' : 'ideas'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!runResult.results && runResult.model && (
                  <div>Model: {runResult.model}</div>
                )}
                {runResult.inserted && (
                  <div>Rows Affected: {runResult.inserted.rowsAffected || 0}</div>
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

        {/* Market Assets Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Market Data ({filteredAssets.length} assets)
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Ticker
            </button>
          </div>

          {/* Add Ticker Form */}
          {showAddForm && (
            <form onSubmit={handleAddTicker} className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-4">Add New Ticker</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symbol *</label>
                  <input
                    type="text"
                    value={newTicker.symbol}
                    onChange={(e) => setNewTicker({ ...newTicker, symbol: e.target.value.toUpperCase() })}
                    placeholder="BTC, AAPL, GLD"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={newTicker.name}
                    onChange={(e) => setNewTicker({ ...newTicker, name: e.target.value })}
                    placeholder="Bitcoin, Apple Inc."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                  <select
                    value={newTicker.asset_type}
                    onChange={(e) => setNewTicker({ ...newTicker, asset_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="crypto">Crypto</option>
                    <option value="stock">Stock</option>
                    <option value="etf">ETF</option>
                    <option value="commodity">Commodity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={newTicker.price}
                    onChange={(e) => setNewTicker({ ...newTicker, price: e.target.value })}
                    placeholder="42000.50"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  disabled={addingTicker}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50"
                >
                  {addingTicker ? 'Adding...' : 'Add Ticker'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by symbol or name..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'crypto', 'stock', 'etf'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterType === type
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loadingAssets ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Loading market data...
            </div>
          ) : assetsError ? (
            <div className="text-center py-8 text-red-600 dark:text-red-400">
              Error: {assetsError}
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No assets found. Click "Refresh Market Data" to fetch data.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Symbol</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Price</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">24h %</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">7d %</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Volume</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Source</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Updated</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAssets.map(asset => (
                    <tr key={asset.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-mono font-semibold text-gray-900 dark:text-gray-100">
                        {asset.symbol}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {asset.name || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          asset.asset_type === 'crypto' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          asset.asset_type === 'stock' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          asset.asset_type === 'etf' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {asset.asset_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-900 dark:text-gray-100">
                        ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold ${
                        asset.change_24h === null ? 'text-gray-500' :
                        asset.change_24h > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {asset.change_24h === null ? '-' : `${asset.change_24h > 0 ? '+' : ''}${asset.change_24h.toFixed(2)}%`}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold ${
                        asset.change_7d === null ? 'text-gray-500' :
                        asset.change_7d > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {asset.change_7d === null ? '-' : `${asset.change_7d > 0 ? '+' : ''}${asset.change_7d.toFixed(2)}%`}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-700 dark:text-gray-300">
                        {asset.volume_24h ? `$${(asset.volume_24h / 1e6).toFixed(1)}M` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">{asset.data_source}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-600 dark:text-gray-400">
                        {new Date(asset.last_updated).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteAsset(asset.symbol)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete asset"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
