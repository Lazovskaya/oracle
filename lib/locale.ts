import { headers } from 'next/headers';

export interface LocaleInfo {
  language: string;
  country: string;
  currency: string;
}

const SUPPORTED_LANGUAGES = ['en', 'lt', 'ru', 'fr', 'zh'];
const DEFAULT_LANGUAGE = 'en';

const CURRENCY_MAP: Record<string, string> = {
  'US': 'USD',
  'LT': 'EUR',
  'RU': 'RUB',
  'FR': 'EUR',
  'CN': 'CNY',
  'GB': 'GBP',
  'DEFAULT': 'EUR',
};

/**
 * Detect user's preferred language from Accept-Language header
 */
export function detectLanguage(acceptLanguageHeader?: string): string {
  if (!acceptLanguageHeader) return DEFAULT_LANGUAGE;

  // Parse Accept-Language header: "en-US,en;q=0.9,fr;q=0.8"
  const languages = acceptLanguageHeader
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';');
      const q = qValue ? parseFloat(qValue.split('=')[1]) : 1.0;
      const langCode = code.split('-')[0].toLowerCase();
      return { code: langCode, q };
    })
    .sort((a, b) => b.q - a.q);

  // Find first supported language
  for (const lang of languages) {
    if (SUPPORTED_LANGUAGES.includes(lang.code)) {
      return lang.code;
    }
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Detect user's country from Accept-Language header or IP geolocation
 */
export function detectCountry(acceptLanguageHeader?: string): string {
  if (!acceptLanguageHeader) return 'US';

  // Try to extract country from Accept-Language: "en-US" -> "US"
  const firstLang = acceptLanguageHeader.split(',')[0].trim();
  const parts = firstLang.split('-');
  
  if (parts.length > 1) {
    return parts[1].toUpperCase();
  }

  return 'US';
}

/**
 * Get currency for a country
 */
export function getCurrency(country: string): string {
  return CURRENCY_MAP[country] || CURRENCY_MAP.DEFAULT;
}

/**
 * Server-side locale detection
 */
export async function detectLocale(): Promise<LocaleInfo> {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || undefined;
  
  const language = detectLanguage(acceptLanguage);
  const country = detectCountry(acceptLanguage);
  const currency = getCurrency(country);

  return { language, country, currency };
}

/**
 * Get locale from cookies or detect automatically
 */
export function getLocaleWithFallback(
  cookieLanguage?: string,
  cookieCountry?: string,
  acceptLanguage?: string
): LocaleInfo {
  const language = cookieLanguage || detectLanguage(acceptLanguage);
  const country = cookieCountry || detectCountry(acceptLanguage);
  const currency = getCurrency(country);

  return { language, country, currency };
}
