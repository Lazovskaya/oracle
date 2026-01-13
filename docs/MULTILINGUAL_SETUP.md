# Multilingual Support Implementation

## Overview
The oracle now supports 5 languages with automatic translation generation when predictions run.

## Enabled Languages
✅ **English (en)** - Original language  
✅ **Russian (ru)** - Русский  
✅ **French (fr)** - Français  
✅ **Spanish (es)** - Español  
✅ **Chinese (zh)** - 中文  

❌ **Lithuanian (lt)** - Removed from support

## How It Works

### 1. Translation Generation
When the oracle runs (via cron job or manual trigger), it:
1. Generates the English prediction using GPT-4
2. Automatically translates to all enabled languages in parallel
3. Stores all translations in the database

**Files involved:**
- `lib/translateOracle.ts` - Translation logic using OpenAI
- `app/api/run-oracle/route.ts` - Main oracle endpoint
- `app/api/run-oracle-all-styles/route.ts` - Multi-style oracle endpoint

### 2. Database Schema
The `oracle_runs` table stores translations in separate columns:
```sql
CREATE TABLE oracle_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_date TEXT NOT NULL,
  market_phase TEXT,
  result TEXT NOT NULL,           -- English (original)
  result_ru TEXT,                  -- Russian
  result_fr TEXT,                  -- French (NEW)
  result_es TEXT,                  -- Spanish
  result_zh TEXT,                  -- Chinese
  -- ... other fields
);
```

### 3. User Interface
**Language Selector** (`components/LocaleSelector.tsx`):
- Dropdown in header with flag icons
- Stores preference in localStorage
- Automatically displays oracle results in selected language
- Fallback to English if translation unavailable

**Mobile optimized:**
- Dropdown positioned left-aligned on mobile
- Right-aligned on desktop
- Max width to prevent overflow

## Migration Required

⚠️ **Before next oracle run, you must add the `result_fr` column to production database:**

```bash
node scripts/add-french-translation-column.js
```

This migration script:
- Adds `result_fr TEXT` column to `oracle_runs` table
- Safe to run multiple times (checks if column exists)
- Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables

## Cost Considerations

Each oracle run now generates **4 translations** (was 3):
- RU: ~200-500 tokens
- FR: ~200-500 tokens (NEW)
- ES: ~200-500 tokens
- ZH: ~200-500 tokens

**Total translation cost per run:** ~$0.002-0.005 with GPT-4o-mini

For 2 daily runs:
- Daily: ~$0.004-0.01
- Monthly: ~$0.12-0.30
- Yearly: ~$1.44-3.60

## Testing Checklist

Before deploying to production:

- [ ] Run migration script to add `result_fr` column
- [ ] Test oracle generation creates all 5 translations
- [ ] Verify language selector shows 5 languages (no Lithuanian)
- [ ] Test language switching works on oracle page
- [ ] Check mobile layout (language dropdown, results display)
- [ ] Verify fallback to English if translation missing
- [ ] Test cron job runs successfully with new translations

## Files Modified

### Translation Logic
- ✅ `lib/translateOracle.ts` - Added French translation prompts
- ✅ `app/api/run-oracle/route.ts` - Updated to generate FR translations
- ✅ `app/api/run-oracle-all-styles/route.ts` - Updated for multi-style runs

### Database
- ✅ `oracle-app/db/schema.sql` - Added `result_fr` column
- ✅ `scripts/add-french-translation-column.js` - Migration script (NEW)

### Frontend
- ✅ `components/LocaleSelector.tsx` - Removed LT, added ES
- ✅ `app/oracle/page.tsx` - Added FR to translations object
- ✅ `types/oracle.ts` - Added `result_fr` to OracleRun interface

## Future Considerations

To add more languages:
1. Add translation prompt to `TRANSLATION_PROMPTS` in `translateOracle.ts`
2. Add column to database schema (`result_XX TEXT`)
3. Update `translateOracleToAllLanguages()` function
4. Add language to `LocaleSelector.tsx` with flag
5. Update all SQL INSERT statements in API routes
6. Run migration to add column to production DB

To remove a language:
1. Remove from `LocaleSelector.tsx`
2. Stop generating translations (remove from `translateOracleToAllLanguages`)
3. Optionally drop column from database (not required, can leave for historical data)
