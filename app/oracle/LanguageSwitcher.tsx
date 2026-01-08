'use client';
import { useState } from 'react';
import { Language } from '@/lib/i18n';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'ru', name: 'Русский', flag: '\u{1F1F7}\u{1F1FA}' },
  { code: 'es', name: 'Español', flag: '\u{1F1EA}\u{1F1F8}' },
  { code: 'zh', name: '中文', flag: '\u{1F1E8}\u{1F1F3}' },
];

export default function LanguageSwitcher({ currentLang, onLanguageChange }: { 
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLanguage = languages.find(l => l.code === currentLang);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg hover:scale-105 transition-all duration-300 backdrop-blur-sm"
      >
        <span className="text-2xl transform group-hover:scale-110 transition-transform duration-300">{currentLanguage?.flag || '🇺🇸'}</span>
        <span className="text-sm font-semibold hidden sm:inline bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{currentLanguage?.name || 'English'}</span>
        <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white/95 dark:bg-gray-900/95 border border-blue-200/50 dark:border-blue-800/50 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300">
          {languages.map((lang, idx) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
              style={{ animationDelay: `${idx * 50}ms` }}
              className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950 dark:hover:to-purple-950 first:rounded-t-2xl last:rounded-b-2xl transition-all duration-300 group animate-in fade-in slide-in-from-top-1 ${
                currentLang === lang.code ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40' : ''
              }`}
            >
              <span className="text-2xl transform group-hover:scale-125 transition-transform duration-300">{lang.flag}</span>
              <span className="text-sm font-semibold flex-1 text-left">{lang.name}</span>
              {currentLang === lang.code && (
                <span className="ml-auto text-lg animate-in zoom-in duration-300">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
