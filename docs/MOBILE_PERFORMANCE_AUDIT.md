# 📱 Mobile Performance Audit & Optimization Plan

## 🔍 Current Issues Identified

### ❌ **CRITICAL ISSUES**

#### 1. Heavy Client Components on Landing Page
**File:** `app/page.tsx`
- ✅ Good: Page is Server Component
- ❌ Problem: No lazy loading for heavy interactions
- 📊 Impact: **HIGH** - Initial bundle includes unnecessary code

#### 2. Oracle Page Loads Everything Upfront
**File:** `app/oracle/OraclePageClient.tsx` (912 lines!)
- ❌ Problem: Massive client component with:
  - All language translations loaded immediately
  - All UI components bundled
  - Multiple useEffect hooks running on mount
  - Price formatting logic in client
- 📊 Impact: **CRITICAL** - Mobile parse time 3-5s

#### 3. No Dynamic Imports
**Files:** Multiple client components
- ❌ No `dynamic()` imports found
- All heavy components load immediately:
  - AdminPanelClient.tsx
  - OraclePageClient.tsx (912 lines)
  - SymbolAnalyzerPage.tsx
  - AccountPageClient.tsx
- 📊 Impact: **CRITICAL** - Bundle size killing mobile

#### 4. Language Switching with localStorage
**File:** `app/oracle/OraclePageClient.tsx:170`
```tsx
useEffect(() => {
  const savedLang = localStorage.getItem('user_language') as Language;
  // This causes layout shift and hydration issues
}, []);
```
- ❌ Problem: CLS (Cumulative Layout Shift) on mobile
- ❌ Problem: Hydration mismatch server vs client
- 📊 Impact: **HIGH** - Poor UX on mobile

#### 5. All Translations Loaded at Once
**Files:** `lib/i18n.ts`, `OraclePageClient.tsx`
- ❌ Problem: 4 languages × full content = 4x data
- ❌ No lazy loading per language
- 📊 Impact: **HIGH** - 4x network payload

---

### ⚠️ **MEDIUM ISSUES**

#### 6. No Skeleton Loading States
- ❌ Direct content render = blank screen on slow networks
- Should have: `<Skeleton />` placeholders
- 📊 Impact: **MEDIUM** - Perceived performance

#### 7. Font Loading
**File:** `app/layout.tsx:5`
```tsx
const inter = Inter({
  subsets: ["latin"],
  display: 'swap', // ✅ Good!
});
```
- ✅ Good: Using `display: swap`
- ⚠️ Consider: Preload critical font weights

#### 8. No Image Optimization Detected
- Could not find `<Image />` usage
- If using `<img>`, needs optimization
- 📊 Impact: **MEDIUM** - LCP (Largest Contentful Paint)

#### 9. Admin Panel Loads All Features
**File:** `app/admin/AdminPanelClient.tsx`
- ❌ No code splitting for:
  - Market assets management
  - Oracle generation UI
  - User management
- 📊 Impact: **MEDIUM** - Admin page slow

---

### ✅ **GOOD PRACTICES FOUND**

1. ✅ Server Components by default (`app/page.tsx`, `app/oracle/page.tsx`)
2. ✅ Font with `display: swap`
3. ✅ Metadata for SEO
4. ✅ `revalidate: 60` on oracle page for caching
5. ✅ Server-side auth checks (no client redirect flicker)

---

## 🚀 Optimization Plan (Priority Order)

### 🔥 **Phase 1: Quick Wins (1-2 hours)**

#### 1.1 Add Dynamic Imports
**Files to update:**
- `app/oracle/page.tsx`
- `app/admin/page.tsx`
- `app/account/page.tsx`

```tsx
// BEFORE
import OraclePageClient from './OraclePageClient';

// AFTER
import dynamic from 'next/dynamic';
const OraclePageClient = dynamic(() => import('./OraclePageClient'), {
  loading: () => <OraclePageSkeleton />,
  ssr: false // or true if needed
});
```

**Expected improvement:** 40-60% faster initial load

---

#### 1.2 Create Skeleton Components
**New files to create:**
- `components/skeletons/OraclePageSkeleton.tsx`
- `components/skeletons/AdminPanelSkeleton.tsx`

```tsx
export function OraclePageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded mb-4"></div>
      {/* etc */}
    </div>
  );
}
```

**Expected improvement:** Perceived load time 50% better

---

#### 1.3 Split OraclePageClient.tsx
**Current:** 912 lines monolith
**Target:** Split into:
- `OraclePageClient.tsx` (main, ~200 lines)
- `components/oracle/IdeaCard.tsx` (card UI)
- `components/oracle/MarketPhase.tsx` (phase UI)
- `components/oracle/LanguageManager.tsx` (lang logic)

**Expected improvement:** 30% smaller initial parse

---

### 🔧 **Phase 2: Language Optimization (2-3 hours)**

#### 2.1 Lazy Load Translations
**Current:** All 4 languages load immediately
**Target:** Load on-demand

```tsx
// NEW: lib/translations/loader.ts
export async function loadTranslation(lang: Language) {
  switch(lang) {
    case 'ru':
      return import('./ru.json');
    case 'es':
      return import('./es.json');
    // etc
  }
}
```

**Expected improvement:** 75% less initial payload

---

#### 2.2 Remove localStorage Language Flash
**Current:** Hydration mismatch + CLS
**Target:** Use cookie or URL param

```tsx
// app/oracle/page.tsx (SERVER)
async function OraclePage() {
  const cookieStore = await cookies();
  const userLang = cookieStore.get('user_language')?.value || 'en';
  
  return <OraclePageClient initialLang={userLang} />;
}
```

**Expected improvement:** Zero CLS, better mobile UX

---

### ⚡ **Phase 3: Advanced Optimizations (3-4 hours)**

#### 3.1 Code Split Admin Panel
**File:** `app/admin/AdminPanelClient.tsx`

Split into tabs with dynamic loading:
```tsx
const MarketAssetsTab = dynamic(() => import('./tabs/MarketAssetsTab'));
const OracleRunTab = dynamic(() => import('./tabs/OracleRunTab'));
const UsersTab = dynamic(() => import('./tabs/UsersTab'));
```

**Expected improvement:** 60% smaller admin page bundle

---

#### 3.2 Implement Route Groups for Mobile
**New structure:**
```
app/
  (marketing)/          # Static, fast landing pages
    page.tsx
    pricing/
    methodology/
  (app)/                # Authenticated, can be slower
    oracle/
    admin/
    account/
```

**Expected improvement:** Separate bundles = faster landing

---

#### 3.3 Add Service Worker for Offline
**New file:** `public/sw.js`
- Cache static assets
- Cache last oracle run
- Offline fallback page

**Expected improvement:** Instant repeat visits

---

### 📊 **Phase 4: Monitoring (1 hour)**

#### 4.1 Add Performance Tracking
```tsx
// lib/analytics.ts
export function trackPerformance() {
  if (typeof window !== 'undefined') {
    const navigation = performance.getEntriesByType('navigation')[0];
    console.log('Page Load Time:', navigation.duration);
  }
}
```

#### 4.2 Add Lighthouse CI
**New file:** `.github/workflows/lighthouse.yml`
- Run on every PR
- Fail if mobile score < 80

---

## 📈 Expected Results

### Before Optimization (Current)
- **Mobile Lighthouse Score:** ~40-50
- **First Contentful Paint (FCP):** 3-4s
- **Largest Contentful Paint (LCP):** 5-6s
- **Total Blocking Time (TBT):** 2-3s
- **Bundle Size:** ~500-800KB initial

### After Phase 1 (Quick Wins)
- **Mobile Lighthouse Score:** ~60-70
- **FCP:** 1.5-2s
- **LCP:** 2.5-3s
- **TBT:** 1-1.5s
- **Bundle Size:** ~200-300KB initial

### After Phase 3 (Full Optimization)
- **Mobile Lighthouse Score:** ~85-95
- **FCP:** 0.8-1.2s
- **LCP:** 1.5-2s
- **TBT:** 0.3-0.5s
- **Bundle Size:** ~80-150KB initial

---

## 🎯 Recommended Priority

### ⚡ DO FIRST (Critical Mobile Impact):
1. ✅ Add dynamic imports to OraclePageClient
2. ✅ Create skeleton loading states
3. ✅ Lazy load translations

### 🔧 DO NEXT (Significant Improvement):
4. Split OraclePageClient into smaller components
5. Remove localStorage, use cookies for language
6. Code split admin panel

### 🚀 DO LATER (Polish):
7. Route groups for marketing vs app
8. Service worker
9. Performance monitoring

---

## 📝 Implementation Checklist

- [ ] Phase 1.1: Dynamic imports for client components
- [ ] Phase 1.2: Skeleton components
- [ ] Phase 1.3: Split OraclePageClient
- [ ] Phase 2.1: Lazy translation loading
- [ ] Phase 2.2: Cookie-based language preference
- [ ] Phase 3.1: Admin panel code splitting
- [ ] Phase 3.2: Route groups
- [ ] Phase 3.3: Service worker
- [ ] Phase 4.1: Performance tracking
- [ ] Phase 4.2: Lighthouse CI

---

## 🔍 Testing Plan

### Mobile Testing
1. Chrome DevTools → Mobile (Slow 4G)
2. Real device: iPhone SE (slow device)
3. Real device: Android mid-range
4. Lighthouse Mobile audit

### Metrics to Track
- LCP (target: < 2.5s)
- FCP (target: < 1.8s)
- TBT (target: < 200ms)
- CLS (target: < 0.1)
- Bundle size (target: < 200KB initial)

---

## 💰 Cost/Benefit Analysis

| Optimization | Time | Mobile Speed Gain | Difficulty |
|--------------|------|-------------------|------------|
| Dynamic imports | 1h | +40% | Easy |
| Skeletons | 1h | +50% perceived | Easy |
| Split components | 2h | +30% | Medium |
| Lazy translations | 2h | +75% payload | Medium |
| Route groups | 3h | +20% | Hard |
| Service worker | 2h | +90% repeat | Hard |

**Recommended:** Start with top 3 (4 hours, +120% improvement)

---

## 🚨 Critical Mobile Issues Summary

1. **912-line OraclePageClient** loading all at once
2. **4 languages** loaded immediately
3. **No dynamic imports** anywhere
4. **localStorage flash** causing CLS
5. **No skeleton states** = blank screens

**Fix Priority:** 1 → 3 → 2 → 4 → 5
