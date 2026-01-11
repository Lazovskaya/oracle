# Trading Card Design System

## Overview
This document defines the standardized design system used across all trading cards in the Oracle application. These patterns ensure visual consistency across Oracle predictions, Symbol Analyzer, and Account pages.

## Color Palette

### Backgrounds
- **Page Background**: `bg-slate-50 dark:bg-slate-950`
- **Card Background**: `bg-white dark:bg-slate-900`
- **Nested Background**: `bg-gray-50` (for price level grids)

### Borders
- **Default**: `border-slate-200 dark:border-slate-800`
- **Hover**: `hover:border-slate-300 dark:hover:border-slate-700`
- **Colored Borders** (for special cases):
  - Bull/Success: `border-emerald-200 dark:border-emerald-800`
  - Bear/Danger: `border-red-200 dark:border-red-800`
  - Warning: `border-yellow-200 dark:border-yellow-800`

### Text Colors
- **Primary Text**: `text-slate-900 dark:text-slate-100`
- **Secondary Text**: `text-slate-600 dark:text-slate-400`
- **Tertiary/Labels**: `text-slate-500 dark:text-slate-400`

### Number Colors (Trading Levels)
- **Entry**: `text-gray-900`
- **Stop Loss**: `text-gray-700`
- **Target**: `text-gray-800`
- **Current Price**: `text-gray-900`

## Typography

### Font Families
```css
--font-mono: ui-monospace, "SF Mono", "Cascadia Code", "Roboto Mono", Menlo, Monaco, "Courier New", monospace;
```

### Number Formatting
All numerical values (prices, percentages) should use:
- `font-mono` - Monospace font family
- `font-bold` - Bold weight
- `tabular-nums` - Consistent digit width
- `tracking-tight` - Reduced letter spacing

Example: `text-lg font-mono font-bold tabular-nums tracking-tight`

### Text Sizes
- **Page Title**: `text-4xl font-bold`
- **Section Title**: `text-2xl font-bold`
- **Card Title**: `text-xl font-semibold`
- **Subsection**: `text-lg font-semibold`
- **Price Numbers**: `text-lg`
- **Labels**: `text-xs font-medium uppercase tracking-wide`
- **Body Text**: `text-sm` or `text-base`

## Components

### PriceLevel Component
Located in: `components/TradingCard.tsx`

Usage:
```tsx
<PriceLevel 
  label="Entry" 
  value="$2,650.00"
  type="entry" // 'entry' | 'stop' | 'target' | 'current' | 'timeframe'
/>
```

Properties:
- White background with gray border
- Uppercase label in gray-500
- Monospace bold numbers

### PriceLevelGrid Component
Container for grouping price levels:
```tsx
<PriceLevelGrid columns={4}>
  <PriceLevel ... />
  <PriceLevel ... />
</PriceLevelGrid>
```

Features:
- Responsive grid (2 cols mobile, configurable on desktop)
- Gray-50 background
- Consistent gap spacing

### CardContainer Component
Standard container for all cards:
```tsx
<CardContainer>
  {/* Your content */}
</CardContainer>
```

Features:
- White background with slate borders
- Rounded corners
- Subtle shadow
- Hover state

### CardHeader Component
Header for symbol analysis cards:
```tsx
<CardHeader 
  symbol="AAPL"
  badge={{
    label: "HIGH",
    type: "high" // 'bullish' | 'bearish' | 'neutral' | 'high' | 'medium' | 'low'
  }}
>
  <p>Additional content</p>
</CardHeader>
```

## Layout Patterns

### Page Structure
```tsx
<main className="min-h-screen px-6 py-12 bg-slate-50 dark:bg-slate-950">
  <div className="max-w-6xl mx-auto">
    {/* Content */}
  </div>
</main>
```

### Card Structure
```tsx
<div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
    Title
  </h3>
  {/* Content */}
</div>
```

### Section Dividers
```tsx
<div className="pt-6 border-t border-slate-200 dark:border-slate-800">
  {/* Section content */}
</div>
```

## Special Cases

### Scenario Cards (Bull/Bear)
Use white background with colored borders:
- **Bull Case**: `border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900`
- **Bear Case**: `border-red-200 dark:border-red-800 bg-white dark:bg-slate-900`

### Warning/Alert Cards
- Border: `border-yellow-200 dark:border-yellow-800`
- Background: `bg-white dark:bg-slate-900`
- Text: Standard slate colors

### Disclaimer/Info Boxes
```tsx
<div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
  <p className="text-xs text-slate-600 dark:text-slate-400">
    {/* Content */}
  </p>
</div>
```

## Icon Usage

### No Emoji Icons
- **DO NOT** use emoji icons (🎯, 📊, 💡, etc.)
- Keep design clean and professional
- Use text labels or Lucide icons when needed

### Lucide Icons
When icons are needed, use Lucide React:
- `ArrowUpRight` - Bullish/Up movement
- `ArrowDownRight` - Bearish/Down movement
- `TrendingUp` - Positive trends
- `AlertTriangle` - Warnings

## Spacing

### Padding
- **Large Cards**: `p-6`
- **Small Cards/Price Boxes**: `p-3`
- **Info Boxes**: `p-4`

### Gaps
- **Card Grids**: `gap-4`
- **Price Level Grids**: `gap-3`
- **Vertical Spacing**: `space-y-4` or `space-y-6`

### Margins
- **Bottom Margins**: `mb-2`, `mb-3`, `mb-4` (depending on hierarchy)
- **Section Spacing**: `mt-6`

## Border Radius
- **Default**: `rounded-lg` (0.5rem)
- **Pills/Badges**: `rounded-full`
- **Buttons**: `rounded-lg`

## States

### Disabled
```tsx
disabled:opacity-50 disabled:cursor-not-allowed
```

### Hover
```tsx
hover:bg-slate-100 dark:hover:bg-slate-800
hover:border-slate-300 dark:hover:border-slate-700
```

### Focus
```tsx
focus:ring-2 focus:ring-blue-500 focus:border-transparent
```

## Implementation Checklist

When creating new trading cards:
- [ ] Use slate-50/950 page background
- [ ] Use white/slate-900 card background
- [ ] Use slate borders (200/800)
- [ ] Apply monospace fonts to all numbers
- [ ] Use tabular-nums and tracking-tight for numbers
- [ ] Remove all emoji icons
- [ ] Use consistent padding (p-6 for cards, p-3 for price boxes)
- [ ] Import shared components from TradingCard.tsx
- [ ] Apply proper text color hierarchy (slate-900/600/500)
- [ ] Test in both light and dark modes

## Migration Notes

Files updated to match this system:
- ✅ `app/oracle/OraclePageClient.tsx` - Trading Lens predictions
- ✅ `app/account/AccountPageClient.tsx` - Account page
- ✅ `app/oracle/SymbolAnalyzer.tsx` - Symbol analyzer results
- ✅ `app/symbol-analyzer/SymbolAnalyzerPage.tsx` - Symbol analyzer page
- ✅ `components/TradingCard.tsx` - Shared components (NEW)

All color changes from gray to slate for consistency.
