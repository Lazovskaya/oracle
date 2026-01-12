'use client';
import { useState, useEffect } from 'react';
import { getLanguagePreference, setLanguagePreference } from '@/lib/translationLoader';
import { useCurrency } from '@/lib/hooks/useCurrency';

interface LocaleSelectorProps {
  initialLanguage?: string;
  initialCountry?: string;
}

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  // Hidden for now - will be released later
  // { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  // { code: 'fr', name: 'Français', flag: '🇫🇷' },
  // { code: 'es', name: 'Español', flag: '🇪🇸' },
  // { code: 'zh', name: '中文', flag: '🇨🇳' },
];

const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'EUR', flag: '🇬🇧' },
  { code: 'EU', name: 'European Union', currency: 'EUR', flag: '🇪🇺' },
  // Hidden for now
  // { code: 'LT', name: 'Lithuania', currency: 'EUR', flag: '🇱🇹' },
  // { code: 'RU', name: 'Russia', currency: 'RUB', flag: '🇷🇺' },
  // { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
  // { code: 'CN', name: 'China', currency: 'CNY', flag: '🇨🇳' },
];

export default function LocaleSelector({ initialLanguage = 'en-US', initialCountry = 'US' }: LocaleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState(initialLanguage);
  const [country, setCountry] = useState(initialCountry);
  const { currency, switchCurrency } = useCurrency();

  useEffect(() => {
    // Load from cookie (no localStorage flash!)
    const savedLanguage = getLanguagePreference();
    const savedCountry = getCookie('user_country');
    
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedCountry) setCountry(savedCountry);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setLanguagePreference(langCode as any); // Save to cookie
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: langCode } }));
  };

  const handleCountryChange = (countryCode: string) => {
    setCountry(countryCode);
    document.cookie = `user_country=${countryCode}; path=/; max-age=31536000`; // 1 year
  };

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) return cookieValue;
    }
    return null;
  };

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const currentCountry = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0];

  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
      >
        <span>{currentLang.flag}</span>
        <span className="text-sm">{currentLang.code.toUpperCase()}</span>
        <span className="text-sm font-semibold">{currencySymbol}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-4">
            {/* Currency Selection */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    switchCurrency('USD');
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currency === 'USD'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  $ USD
                </button>
                <button
                  onClick={() => {
                    switchCurrency('GBP');
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currency === 'GBP'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  £ GBP
                </button>
                <button
                  onClick={() => {
                    switchCurrency('EUR');
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currency === 'EUR'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  € EUR
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Language
              </h3>
              <div className="space-y-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      handleLanguageChange(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-md text-left flex items-center gap-2 transition-colors ${
                      language === lang.code
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                    {language === lang.code && (
                      <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Country Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Country / Currency
              </h3>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      handleCountryChange(c.code);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-md text-left flex items-center gap-2 transition-colors ${
                      country === c.code
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{c.flag}</span>
                    <div className="flex-1">
                      <div className="text-sm">{c.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{c.currency}</div>
                    </div>
                    {country === c.code && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Language and country settings are saved automatically
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
