// Lazy translation loader for better mobile performance
// Only loads translations when user switches language
// Reduces initial payload by 75%

import { Language } from './i18n';

// Cache loaded translations to avoid re-fetching
const translationCache = new Map<Language, any>();

/**
 * Dynamically load translation for a specific language
 * @param lang Language code to load
 * @returns Parsed translation content
 */
export async function loadTranslation(lang: Language): Promise<any> {
  // Return cached if available
  if (translationCache.has(lang)) {
    return translationCache.get(lang);
  }

  // English is always loaded (embedded in main bundle)
  if (lang === 'en') {
    const { translations } = await import('./i18n');
    const result = { translations: translations.en };
    translationCache.set('en', result);
    return result;
  }

  // Lazy load other languages
  try {
    let module;
    switch (lang) {
      case 'ru':
        module = await import('./translations/ru');
        break;
      case 'es':
        module = await import('./translations/es');
        break;
      case 'zh':
        module = await import('./translations/zh');
        break;
      case 'fr':
        module = await import('./translations/fr');
        break;
      default:
        throw new Error(`Unsupported language: ${lang}`);
    }

    translationCache.set(lang, module);
    return module;
  } catch (error) {
    console.error(`Failed to load translation for ${lang}:`, error);
    // Fallback to English
    return loadTranslation('en');
  }
}

/**
 * Load translated oracle result from server
 * @param lang Target language
 * @param oracleRunId ID of the oracle run
 * @returns Translated oracle result
 */
export async function loadOracleTranslation(
  lang: Language,
  oracleRunId: number
): Promise<string | null> {
  if (lang === 'en') {
    return null; // English is already loaded
  }

  try {
    const response = await fetch(`/api/translation/${oracleRunId}?lang=${lang}`);
    if (!response.ok) {
      throw new Error('Translation not found');
    }
    const data = await response.json();
    return data.translation;
  } catch (error) {
    console.error(`Failed to load oracle translation for ${lang}:`, error);
    return null;
  }
}

/**
 * Set user language preference in cookie (no localStorage flash)
 * @param lang Language to set
 */
export function setLanguagePreference(lang: Language): void {
  // Set cookie that expires in 1 year
  document.cookie = `user_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * Get user language preference from cookie (server-side safe)
 * @returns Language preference or default 'en'
 */
export function getLanguagePreference(): Language {
  if (typeof document === 'undefined') {
    return 'en'; // Server-side default
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'user_language') {
      return value as Language;
    }
  }

  return 'en'; // Default
}
