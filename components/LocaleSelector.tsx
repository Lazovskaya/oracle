'use client';
import { useState, useEffect } from 'react';

interface LocaleSelectorProps {
  initialLanguage?: string;
  initialCountry?: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'LT', name: 'Lithuania', currency: 'EUR', flag: '🇱🇹' },
  { code: 'RU', name: 'Russia', currency: 'RUB', flag: '🇷🇺' },
  { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
  { code: 'CN', name: 'China', currency: 'CNY', flag: '🇨🇳' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
];

export default function LocaleSelector({ initialLanguage = 'en', initialCountry = 'US' }: LocaleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState(initialLanguage);
  const [country, setCountry] = useState(initialCountry);

  useEffect(() => {
    // Load from localStorage on mount
    const savedLanguage = localStorage.getItem('user_language');
    const savedCountry = localStorage.getItem('user_country');
    
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedCountry) setCountry(savedCountry);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    localStorage.setItem('user_language', langCode);
    document.cookie = `user_language=${langCode}; path=/; max-age=31536000`; // 1 year
  };

  const handleCountryChange = (countryCode: string) => {
    setCountry(countryCode);
    localStorage.setItem('user_country', countryCode);
    document.cookie = `user_country=${countryCode}; path=/; max-age=31536000`; // 1 year
  };

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const currentCountry = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
      >
        <span>{currentLang.flag}</span>
        <span className="text-sm">{currentLang.code.toUpperCase()}</span>
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
