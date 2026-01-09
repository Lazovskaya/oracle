'use client';
import { useState, useEffect } from 'react';
import { OracleRun } from "@/types/oracle";
import RunButton from "./RunButton";
import LanguageSwitcher from "./LanguageSwitcher";
import { Language, getTranslation } from "@/lib/i18n";
import { formatPrice, formatChange } from "@/lib/priceService";
import OracleIcon from "@/components/OracleIcon";
import LocaleSelector from "@/components/LocaleSelector";
import Link from "next/link";

// Helper function to identify if a symbol is crypto or stock
function isCryptoSymbol(symbol: string): boolean {
  const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'DOT', 'DOGE', 'SHIB', 'AVAX', 'MATIC', 'LINK', 'UNI', 'ATOM', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'FIL', 'TRX', 'ETC', 'THETA', 'XMR', 'EOS', 'AAVE', 'MKR', 'SNX', 'COMP'];
  const upperSymbol = symbol.toUpperCase().replace(/USD[T]?$/, ''); // Remove USDT or USD suffix
  return cryptoSymbols.includes(upperSymbol) || symbol.includes('USDT') || symbol.includes('USD') && !symbol.match(/^[A-Z]{1,4}$/);
}

function extractValue(raw: any): any {
  if (raw && typeof raw === "object" && "value" in raw) {
    return raw.value;
  }
  return raw;
}

function formatPriceVal(v: any) {
  const value = extractValue(v);
  if (value == null) return "—";
  
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: "USD", 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(value);
  }
  
  if (typeof value === "string") {
    const n = Number(value.replace(/[, ]+/g, ""));
    if (!Number.isFinite(n)) return value;
    return new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: "USD", 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(n);
  }
  
  return String(value);
}

function formatField(raw: any): string {
  if (raw == null) return "—";
  
  if (typeof raw === "object" && "type" in raw && "value" in raw) {
    return formatPriceVal(raw.value);
  }
  
  if (Array.isArray(raw)) {
    return raw.map(item => formatField(item)).join(" • ");
  }
  
  if (typeof raw === "object" && "value" in raw) {
    const val = raw.value;
    if (typeof val === "number") return formatPriceVal(val);
    return String(val);
  }
  
  if (typeof raw === "number") return formatPriceVal(raw);
  
  if (typeof raw === "string") {
    if (/^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/.test(raw)) {
      return raw.split("-").map((s) => formatPriceVal(s.trim())).join(" — ");
    }
    return raw;
  }
  
  return String(raw);
}

export default function OraclePageClient({ 
  last, 
  parsed, 
  ideas, 
  prices,
  translations,
  isLoggedIn,
  subscriptionTier,
  oracleRunId,
  stylePredictions: initialStylePredictions = {},
  userTradingStyle = 'balanced',
  isAdmin = false,
  userEmail
}: { 
  last: OracleRun | null;
  parsed: any;
  ideas: any[];
  prices: any;
  translations: { en: string; ru: string; es: string; zh: string };
  isLoggedIn: boolean;
  subscriptionTier: 'free' | 'premium';
  oracleRunId?: number;
  stylePredictions?: Record<string, { parsed: any; ideas: any[] }>;
  userTradingStyle?: 'conservative' | 'balanced' | 'aggressive';
  isAdmin?: boolean;
  userEmail?: string;
}) {
  const [lang, setLang] = useState<Language>('en');
  const [showWaveDetails, setShowWaveDetails] = useState(false);
  const [currentParsed, setCurrentParsed] = useState(parsed);
  const [currentIdeas, setCurrentIdeas] = useState(ideas);
  const [mounted, setMounted] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<Set<string>>(new Set());
  const [savingIdea, setSavingIdea] = useState<string | null>(null);
  const [tradingStyle, setTradingStyle] = useState<'conservative' | 'balanced' | 'aggressive'>(userTradingStyle);
  const [assetPreference, setAssetPreference] = useState<'crypto' | 'stocks' | 'both'>('both');
  const [biasFilter, setBiasFilter] = useState<'all' | 'bullish' | 'bearish'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stylePredictions, setStylePredictions] = useState<Record<string, { parsed: any; ideas: any[] }>>(initialStylePredictions);
  const isPremium = subscriptionTier === 'premium';
  const isUSMarketOnly = process.env.NEXT_PUBLIC_US_MARKET_ONLY === 'true';
  const t = getTranslation(isUSMarketOnly ? 'en' : lang);

  const handleSaveIdea = async (idea: any, symbol: string) => {
    if (!isLoggedIn) {
      alert('Please log in to save ideas');
      return;
    }

    if (!oracleRunId) {
      alert('Unable to save idea - missing run ID');
      return;
    }

    const ideaKey = `${oracleRunId}-${symbol}`;
    setSavingIdea(ideaKey);

    try {
      await fetch('/api/saved-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oracle_run_id: oracleRunId,
          symbol,
          entry: formatField(idea.entry),
          stop: formatField(idea.stop),
          targets: Array.isArray(idea.targets) 
            ? idea.targets.map((t: any) => formatField(t)).join(', ')
            : formatField(idea.targets),
          rationale: idea.rationale || '',
          confidence: idea.confidence || '',
          bias: idea.bias || '',
          timeframe: idea.timeframe || '',
          wave_context: idea.wave_context || '',
          risk_note: idea.risk_note || '',
        }),
      });

      setSavedIdeas(prev => new Set(prev).add(ideaKey));
      alert('Idea saved! View it in your account page.');
    } catch (error) {
      console.error('Error saving idea:', error);
      alert('Failed to save idea. Please try again.');
    } finally {
      setSavingIdea(null);
    }
  };

  const handleRefreshWithPreferences = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      // Update user preferences first (if logged in)
      if (isLoggedIn) {
        await Promise.all([
          fetch('/api/user/trading-style', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tradingStyle }),
          }),
          fetch('/api/user/asset-preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetPreference }),
          }),
        ]);
      }
      
      // Trigger a new oracle run
      await fetch('/api/run-oracle', { method: 'POST' });
      
      // Reload the page to show new results
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing with preferences:', error);
      alert('Failed to refresh predictions. Please try again.');
      setIsRefreshing(false);
    }
  };

  const handleStyleSwitch = async (newStyle: 'conservative' | 'balanced' | 'aggressive') => {
    setTradingStyle(newStyle);
    
    // If we have cached predictions for this style, use them immediately
    if (stylePredictions[newStyle]) {
      setCurrentParsed(stylePredictions[newStyle].parsed);
      setCurrentIdeas(stylePredictions[newStyle].ideas);
      
      // Update user preference in background
      if (isLoggedIn) {
        fetch('/api/user/trading-style', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradingStyle: newStyle }),
        }).catch(console.error);
      }
      return;
    }
    
    // Otherwise, generate new predictions for this style
    setIsRefreshing(true);
    
    try {
      // Update user preference
      if (isLoggedIn) {
        await fetch('/api/user/trading-style', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradingStyle: newStyle }),
        });
      }
      
      // Trigger oracle run with this style
      await fetch('/api/run-oracle', { method: 'POST' });
      
      // Reload to get new predictions
      window.location.reload();
    } catch (error) {
      console.error('Error generating predictions for style:', error);
      alert(`Failed to generate ${newStyle} predictions. Please try again.`);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter ideas based on asset preference, bias, and confidence
  const filteredIdeas = currentIdeas.filter((idea: any) => {
    // Asset filter
    if (assetPreference !== 'both') {
      const symbol = idea.symbol || '';
      const isCrypto = isCryptoSymbol(symbol);
      
      if (assetPreference === 'crypto' && !isCrypto) return false;
      if (assetPreference === 'stocks' && isCrypto) return false;
    }
    
    // Bias filter
    if (biasFilter !== 'all') {
      const bias = (idea.bias || '').toLowerCase();
      if (biasFilter === 'bullish' && bias !== 'bullish') return false;
      if (biasFilter === 'bearish' && bias !== 'bearish') return false;
    }
    
    // Confidence filter
    if (confidenceFilter !== 'all') {
      const confidence = (idea.confidence || '').toLowerCase();
      if (confidenceFilter === 'low' && confidence !== 'low') return false;
      if (confidenceFilter === 'medium' && confidence !== 'medium') return false;
      if (confidenceFilter === 'high' && confidence !== 'high') return false;
    }
    
    return true;
  });

  // Re-parse when language changes
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    
    // Parse the translated result
    const translatedResult = translations[newLang];
    if (translatedResult) {
      try {
        let cleanResult = translatedResult.trim();
        if (cleanResult.startsWith('```json')) {
          cleanResult = cleanResult.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
        } else if (cleanResult.startsWith('```')) {
          cleanResult = cleanResult.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
        }
        
        const newParsed = JSON.parse(cleanResult);
        setCurrentParsed(newParsed);
        setCurrentIdeas(Array.isArray(newParsed?.ideas) ? newParsed.ideas : []);
      } catch (e) {
        console.error('Failed to parse translated result:', e);
        // Fallback to original
        setCurrentParsed(parsed);
        setCurrentIdeas(ideas);
      }
    }
  };

  return (
    <main className="min-h-screen px-6 py-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <a href="/" className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
              <OracleIcon className="w-7 h-7 text-white" />
            </a>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t.latestRun}
              </p>
              {isLoggedIn && userEmail && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{userEmail}</span>
                  {isAdmin && <span className="ml-1 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs font-semibold">ADMIN</span>}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <LocaleSelector />
            <a
              href="/promo"
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
              title="Performance Track Record"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Performance</span>
            </a>
            {!isUSMarketOnly && (
              <LanguageSwitcher currentLang={lang} onLanguageChange={handleLanguageChange} />
            )}
            {isAdmin && <RunButton />}
            {isLoggedIn && (
              <a
                href="/account"
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
                title="My Account"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Account</span>
              </a>
            )}
          </div>
        </header>

        {/* Prediction Preferences - Quick Switch */}
        <section className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Preferences</h3>
            {isAdmin && (
              <button
                onClick={handleRefreshWithPreferences}
                disabled={isRefreshing}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 justify-center"
              >
                {isRefreshing ? (
                  <>
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>New Predictions</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Trading Style */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Style</label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleStyleSwitch('conservative')}
                  disabled={isRefreshing}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    tradingStyle === 'conservative'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRefreshing && tradingStyle !== 'conservative' ? '🛡️ Conservative' : '🛡️ Conservative'}
                </button>

                <button
                  onClick={() => handleStyleSwitch('balanced')}
                  disabled={isRefreshing}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    tradingStyle === 'balanced'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRefreshing && tradingStyle !== 'balanced' ? '⚖️ Balanced' : '⚖️ Balanced'}
                </button>

                <button
                  onClick={() => handleStyleSwitch('aggressive')}
                  disabled={isRefreshing}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    tradingStyle === 'aggressive'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRefreshing && tradingStyle !== 'aggressive' ? '🚀 Aggressive' : '🚀 Aggressive'}
                </button>
              </div>
            </div>

            {/* Bias Filter */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Direction</label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setBiasFilter('all')}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    biasFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  🎯 All
                </button>

                <button
                  onClick={() => setBiasFilter('bullish')}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    biasFilter === 'bullish'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  📈 Bullish
                </button>

                <button
                  onClick={() => setBiasFilter('bearish')}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    biasFilter === 'bearish'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  📉 Bearish
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Asset Preference */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Assets</label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setAssetPreference('crypto')}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    assetPreference === 'crypto'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  ₿ Crypto
                </button>

                <button
                  onClick={() => setAssetPreference('stocks')}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    assetPreference === 'stocks'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  📈 Stocks
                </button>

                <button
                  onClick={() => setAssetPreference('both')}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    assetPreference === 'both'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  🔄 Both
                </button>
              </div>
            </div>

            {/* Confidence Filter */}
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Confidence</label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setConfidenceFilter('all')}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    confidenceFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  🎯 All
                </button>

                <button
                  onClick={() => setConfidenceFilter('low')}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    confidenceFilter === 'low'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  🔵 Low
                </button>

                <button
                  onClick={() => setConfidenceFilter('medium')}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    confidenceFilter === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  🟡 Medium
                </button>

                <button
                  onClick={() => setConfidenceFilter('high')}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    confidenceFilter === 'high'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  🟢 High
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Custom Symbol Analyzer Link - PRO Feature */}
        {isPremium && (
          <section className="mb-6">
            <Link href="/symbol-analyzer" className="block p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:shadow-lg transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Custom Symbol Analyzer
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Analyze any stock, ETF, or crypto with AI-powered insights
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                    PRO
                  </span>
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          </section>
        )}

        {!last ? (
          <section className="rounded-lg border border-gray-200 dark:border-gray-800 p-12 bg-white dark:bg-gray-900">
            <div className="text-center space-y-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t.noRuns}</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {t.noRunsDesc}
              </p>
            </div>
          </section>
        ) : (
          <article className="space-y-6">
            <section className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{t.marketSummary}</h2>
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {currentParsed?.market_phase ?? last.market_phase ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="inline-block px-4 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                      {currentParsed ? t.parsed : t.rawData}
                    </span>
                  </div>
                </div>
                
                {currentParsed?.wave_structure && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowWaveDetails(!showWaveDetails)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    >
                      <span>{t.waveStructure}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${showWaveDetails ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showWaveDetails && (
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {currentParsed.wave_structure}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 pt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">📅</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {t.runDate}: <strong className="text-gray-900 dark:text-white">{last.run_date}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">🕐</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {mounted ? new Date(last.created_at!).toLocaleString() : new Date(last.created_at!).toISOString().replace('T', ' ').slice(0, 19)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6">
              {filteredIdeas.length > 0 ? (
                filteredIdeas.map((idea: any, idx: number) => {
                  const symbol = idea.symbol ?? `idea-${idx + 1}`;
                  const priceData = prices[symbol];
                  const rationale = idea.rationale ?? "";
                  
                  const entry = formatField(idea.entry);
                  const stop = formatField(idea.stop);
                  
                  let targets: string[];
                  if (Array.isArray(idea.targets)) {
                    targets = idea.targets.map((t: any) => formatField(t));
                  } else {
                    targets = [formatField(idea.targets)];
                  }
                  
                  const timeframe = idea.timeframe ?? "2–6 weeks";
                  const confidence = (idea.confidence ?? "unknown").toString().toLowerCase();
                  const bias = (idea.bias ?? "neutral").toString().toLowerCase();
                  
                  // For logged-in users: always show full content (based on subscription)
                  // For non-logged-in users: show first idea, lock others
                  const showFullContent = isLoggedIn || idx === 0;

                  return (
                    <div key={idx} className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{symbol}</h3>
                            <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                              {t.bias[bias as keyof typeof t.bias] || idea.bias}
                            </span>
                          </div>
                          {priceData?.currentPrice && (
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {formatPrice(priceData.currentPrice, priceData.currency)}
                              </span>
                              {priceData.change24h !== null && (
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {formatChange(priceData.change24h)}
                                </span>
                              )}
                              <span className="text-xs text-gray-400">24h</span>
                            </div>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400">{idea.wave_context ?? ""}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md border ${
                              confidence === "high"
                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                                : confidence === "medium"
                                ? "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800"
                                : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                            }`}
                          >
                            {t.confidence[confidence as keyof typeof t.confidence] || confidence.toUpperCase()}
                          </span>
                          
                          {isLoggedIn && oracleRunId && (
                            <button
                              onClick={() => handleSaveIdea(idea, symbol)}
                              disabled={savingIdea === `${oracleRunId}-${symbol}` || savedIdeas.has(`${oracleRunId}-${symbol}`)}
                              className={`p-2 rounded-lg transition-all ${
                                savedIdeas.has(`${oracleRunId}-${symbol}`)
                                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                              } disabled:opacity-50`}
                              title={savedIdeas.has(`${oracleRunId}-${symbol}`) ? 'Saved' : 'Save to track'}
                            >
                              {savingIdea === `${oracleRunId}-${symbol}` ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill={savedIdeas.has(`${oracleRunId}-${symbol}`) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-6">{rationale}</p>
                      
                      {showFullContent ? (
                        <>
                          {isPremium || !isLoggedIn ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                              <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t.entry}</div>
                                <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">{entry}</div>
                              </div>
                              <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t.stop}</div>
                                <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">{stop}</div>
                              </div>
                              <div className="col-span-2 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t.targets}</div>
                                <div className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">{targets.join(" • ")}</div>
                              </div>
                              <div className="col-span-2 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/30">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t.timeframe}</div>
                                <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{timeframe}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-8 border-2 border-blue-200 dark:border-blue-800">
                              <div className="text-center space-y-4">
                                <div className="text-5xl">🔒</div>
                                <p className="font-bold text-xl text-gray-900 dark:text-white">
                                  Entry, Stop & Target Levels
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Upgrade to Premium to see precise risk management levels
                                </p>
                                <a
                                  href="/pricing"
                                  className="inline-block mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
                                >
                                  View Pricing →
                                </a>
                              </div>
                            </div>
                          )}

                          {(isPremium || !isLoggedIn) && idea.risk_note ? (
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                              <div className="flex items-start gap-2">
                                <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                                <div>
                                  <div className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-1">{t.riskNote}</div>
                                  <div className="text-sm text-yellow-700 dark:text-yellow-200">{idea.risk_note}</div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-8 border-2 border-blue-200 dark:border-blue-800">
                          <div className="text-center space-y-4">
                            <div className="text-5xl">🔐</div>
                            <p className="font-bold text-xl text-gray-900 dark:text-white">
                              Sign Up to View More Ideas
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Create a free account to access all trading ideas
                            </p>
                            <a
                              href="/login"
                              className="inline-block mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
                            >
                              Get Started →
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <p className="text-gray-600 dark:text-gray-400">
                    {biasFilter === 'bullish' && 'No bullish ideas available with current filters. Try "All" or adjust filters.'}
                    {biasFilter === 'bearish' && 'No bearish ideas available with current filters. Try "All" or adjust filters.'}
                    {assetPreference === 'crypto' && biasFilter === 'all' && 'No crypto ideas available. Try selecting "Both" or generate new predictions.'}
                    {assetPreference === 'stocks' && biasFilter === 'all' && 'No stock ideas available. Try selecting "Both" or generate new predictions.'}
                    {assetPreference === 'both' && biasFilter === 'all' && t.noIdeas}
                  </p>
                </div>
              )}
            </section>
          </article>
        )}
      </div>
    </main>
  );
}
