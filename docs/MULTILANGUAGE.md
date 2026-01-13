# Multilanguage Translation Feature

## Overview
Oracle now supports **4 languages** with automatic translation of trading decisions:
- 🇺🇸 **English** (default)
- 🇷🇺 **Russian** (Русский)
- 🇪🇸 **Spanish** (Español)
- 🇨🇳 **Chinese** (中文)

## How It Works

### 1. Translation on Oracle Run
When you click "Run Oracle Now", the system:
1. Fetches current market prices
2. Sends prompt to GPT to generate trading recommendations (in English)
3. **Automatically translates** the entire result to RU, ES, and ZH
4. Stores all 4 versions in the database

### 2. Language Selection
- Click the **flag dropdown** in the top-right corner
- Select your preferred language
- The entire oracle analysis (market phase, wave structure, trade ideas, rationale) switches instantly
- Price data remains in USD (universal)

### 3. Database Structure
```sql
CREATE TABLE oracle_runs (
  id INTEGER PRIMARY KEY,
  run_date TEXT NOT NULL,
  market_phase TEXT,
  result TEXT NOT NULL,        -- English (original)
  result_ru TEXT,              -- Russian translation
  result_es TEXT,              -- Spanish translation
  result_zh TEXT,              -- Chinese translation
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Translation Quality
- Uses **OpenAI GPT-4o-mini** for translations
- Preserves all:
  - Stock/crypto symbols (BTC, AAPL, etc.)
  - Numerical values (prices, percentages)
  - JSON structure
  - Technical terms
- Only translates:
  - Market analysis descriptions
  - Trade rationales
  - Risk notes
  - Bias labels (Bullish → Рост, Alcista, 看涨)

## Files Changed

### New Files
- `lib/i18n.ts` - Translation strings for UI elements
- `lib/translateOracle.ts` - Oracle result translation service
- `app/oracle/LanguageSwitcher.tsx` - Language dropdown component
- `app/oracle/OraclePageClient.tsx` - Client component with language state
- `scripts/add-translation-columns.js` - Database migration script

### Modified Files
- `app/oracle/page.tsx` - Server component that fetches translations
- `app/api/run-oracle/route.ts` - Generates and stores translations
- `types/oracle.ts` - Added translation fields
- `oracle-app/db/schema.sql` - Updated schema with translation columns

## Usage Examples

### UI Translations
```typescript
// English
t.runOracle = '🔮 Run Oracle Now'
t.marketSummary = 'Market Summary'

// Russian
t.runOracle = '🔮 Запустить Оракул'
t.marketSummary = 'Обзор Рынка'

// Spanish
t.runOracle = '🔮 Ejecutar Oráculo'
t.marketSummary = 'Resumen del Mercado'

// Chinese
t.runOracle = '🔮 运行预言'
t.marketSummary = '市场概况'
```

### Oracle Decision Translation
Original (English):
```json
{
  "market_phase": "Late-stage bull market with increasing volatility",
  "ideas": [{
    "symbol": "BTC",
    "rationale": "Bitcoin showing strong momentum above $43K resistance",
    "bias": "Bullish"
  }]
}
```

Russian translation:
```json
{
  "market_phase": "Поздняя стадия бычьего рынка с растущей волатильностью",
  "ideas": [{
    "symbol": "BTC",
    "rationale": "Bitcoin демонстрирует сильный импульс выше сопротивления $43K",
    "bias": "Рост"
  }]
}
```

## Migration

If you have an existing database, run:
```bash
node scripts/add-translation-columns.js
```

This adds `result_ru`, `result_es`, `result_zh` columns to your `oracle_runs` table.

## Cost Implications

Each oracle run now makes:
- **1 GPT call** for English analysis (~$0.0007)
- **3 GPT calls** for translations (~$0.0015 total)
- **Total per run: ~$0.0022** (less than 1/4 cent)

Running 2x daily = **$0.13/month** for fully multilingual trading oracle.

## Features

✅ Real-time language switching (no page reload)
✅ Preserves technical accuracy across languages
✅ 100% consistent data (prices, symbols, numbers)
✅ Translations stored in DB (instant switching)
✅ Automatic translation on every oracle run
✅ Fallback to English if translation missing
✅ US flag for English (🇺🇸 instead of 🇬🇧)

## Testing

1. **Run oracle**: Click "🔮 Run Oracle Now"
2. **Wait ~15 seconds**: Generates English + 3 translations
3. **Switch language**: Use flag dropdown
4. **Verify translation**: Check market summary and trade rationales are translated
5. **Verify preservation**: Prices, symbols, numbers stay unchanged

## Technical Details

### Translation Process
```typescript
// lib/translateOracle.ts
export async function translateOracleResult(
  englishResult: string,
  targetLang: 'ru' | 'es' | 'zh'
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Financial translator...' },
      { role: 'user', content: prompt + englishResult }
    ],
    temperature: 0.3, // Low temperature for consistent translation
    max_tokens: 3000
  });
  
  return cleanMarkdown(response.content);
}
```

### Client-Side Language Switching
```typescript
// app/oracle/OraclePageClient.tsx
const handleLanguageChange = (newLang: Language) => {
  setLang(newLang);
  const translatedResult = translations[newLang]; // From DB
  const newParsed = JSON.parse(translatedResult);
  setCurrentParsed(newParsed); // Updates UI instantly
};
```

## Future Enhancements

Possible improvements:
- Add more languages (French, German, Japanese, etc.)
- Translation caching/optimization
- User language preference persistence (localStorage)
- Automatic language detection based on browser locale
- Translation quality feedback system
