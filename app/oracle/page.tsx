import { db } from "@/lib/db";
import { OracleRun } from "@/types/oracle";
import { formatPrice, formatChange } from "@/lib/priceService";
import dynamic from 'next/dynamic';
import { OraclePageSkeleton } from "@/components/skeletons/LoadingSkeletons";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserByEmail, checkAndRevokeExpiredAccess } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { Metadata } from "next";

// Dynamic import for heavy client component (912 lines!)
// This reduces initial bundle size by ~300KB
const OraclePageClient = dynamic(() => import('./OraclePageClient'), {
  loading: () => <OraclePageSkeleton />,
});

export const metadata: Metadata = {
  title: "Latest Market Analysis & Trading Ideas | Market Oracle",
  description: "Daily AI-powered market analysis with swing trading ideas for stocks and cryptocurrencies. Elliott Wave structure, entry points, stop losses, and profit targets for 2-6 week trades.",
  keywords: "market analysis, trading ideas, swing trading, Elliott Wave, stock trading, crypto trading, technical analysis",
  openGraph: {
    title: "Market Oracle - Latest Trading Analysis",
    description: "Daily market insights and swing trading ideas using Elliott Wave analysis",
    url: "https://finforesee.com/oracle",
    siteName: "Market Oracle",
    type: "website",
  },
};

export const revalidate = 60;

async function fetchLastRun(tradingStyle: string = 'balanced'): Promise<OracleRun | null> {
  const res = await db.execute({
    sql: `
      SELECT id, run_date, market_phase, result, result_ru, result_fr, result_es, result_zh, trading_style, asset_preference, created_at
      FROM oracle_runs
      WHERE trading_style = ?
      ORDER BY created_at DESC
      LIMIT 1
    `,
    args: [tradingStyle],
  });
  const rows = res.rows ?? [];
  if (rows.length === 0) return null;

  // Normalize DB row -> OracleRun to satisfy TypeScript and handle different column shapes
  const r: any = rows[0];
  const mapped: OracleRun = {
    id: typeof r.id === "number" ? r.id : r.id ? Number(r.id) : undefined,
    run_date: String(r.run_date ?? r.runDate ?? r.date ?? ""),
    market_phase: r.market_phase ?? r.marketPhase ?? null,
    result: typeof r.result === "string" ? r.result : r.result ? JSON.stringify(r.result) : "",
    result_ru: typeof r.result_ru === "string" ? r.result_ru : null,
    result_fr: typeof r.result_fr === "string" ? r.result_fr : null,
    result_es: typeof r.result_es === "string" ? r.result_es : null,
    result_zh: typeof r.result_zh === "string" ? r.result_zh : null,
    created_at: r.created_at ?? r.createdAt ?? undefined,
  };
  return mapped;
}

/**
 * Helpers to normalize LLM output shapes and format numbers/prices
 * Handles both simple values and complex objects with type/value structure
 */
function extractValue(raw: any): any {
  // If it's an object with 'value' property, extract it
  if (raw && typeof raw === "object" && "value" in raw) {
    return raw.value;
  }
  return raw;
}

function isPriceLike(obj: any) {
  if (!obj || typeof obj !== "object") return false;
  return String(obj.type ?? "").toLowerCase() === "price";
}

function isPercentLike(obj: any) {
  if (!obj || typeof obj !== "object") return false;
  return String(obj.type ?? "").toLowerCase() === "percent";
}

function formatPriceVal(v: any) {
  const value = extractValue(v);
  if (value == null) return "—";
  
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: "USD", 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    }).format(value);
  }
  
  if (typeof value === "string") {
    // if already includes non-numeric (like "27000-27500" or "38-40%"), return as-is
    const n = Number(value.replace(/[, ]+/g, ""));
    if (!Number.isFinite(n)) return value;
    return new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: "USD", 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    }).format(n);
  }
  
  return String(value);
}

function formatPercentVal(v: any) {
  const value = extractValue(v);
  if (value == null) return "—";
  if (typeof value === "number") return `${value}%`;
  return String(value).replace(/^\s+|\s+$/g, "") + (String(value).endsWith("%") ? "" : "%");
}

function formatField(raw: any): string {
  // Handle null/undefined
  if (raw == null) return "—";
  
  // Handle objects with type/value structure
  if (typeof raw === "object" && "type" in raw && "value" in raw) {
    if (isPriceLike(raw)) return formatPriceVal(raw.value);
    if (isPercentLike(raw)) return formatPercentVal(raw.value);
    // Fallback for other types
    return formatPriceVal(raw.value);
  }
  
  // Handle arrays of objects (for targets)
  if (Array.isArray(raw)) {
    return raw.map(item => formatField(item)).join(" • ");
  }
  
  // Handle plain objects without explicit type
  if (typeof raw === "object" && "value" in raw) {
    const val = raw.value;
    if (typeof val === "number") return formatPriceVal(val);
    return String(val);
  }
  
  // Handle primitives
  if (typeof raw === "number") return formatPriceVal(raw);
  
  if (typeof raw === "string") {
    // if looks like a number range -> try to format each side as price
    if (/^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/.test(raw)) {
      return raw
        .split("-")
        .map((s) => formatPriceVal(s.trim()))
        .join(" — ");
    }
    return raw;
  }
  
  return String(raw);
}

export default async function OraclePage() {
  const cookieStore = await cookies();
  const cookieEmail = cookieStore.get('user_email')?.value;
  
  // Also check NextAuth session for Google login
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email;
  
  const userEmail = sessionEmail || cookieEmail;

  let user = userEmail ? await getUserByEmail(userEmail) : null;
  
  // Check if subscription has expired and revoke access if needed
  if (user) {
    user = await checkAndRevokeExpiredAccess(user);
  }

  // Fetch predictions for all three trading styles
  const conservativeRun = await fetchLastRun('conservative');
  const balancedRun = await fetchLastRun('balanced');
  const aggressiveRun = await fetchLastRun('aggressive');

  // Default to user's preferred style, or balanced
  const userStyle = user?.trading_style || 'balanced';
  const last = userStyle === 'conservative' ? conservativeRun 
             : userStyle === 'aggressive' ? aggressiveRun 
             : balancedRun;

  // Prepare style-specific predictions for client-side switching
  const stylePredictions: Record<string, { parsed: any; ideas: any[]; created_at?: string }> = {};
  
  // Fetch previous runs to merge ideas not repeated in current tickers
  const previousRuns: Record<string, OracleRun | null> = {};
  for (const style of ['conservative', 'balanced', 'aggressive']) {
    const prevResult = await db.execute({
      sql: `SELECT id, run_date, result, created_at FROM oracle_runs WHERE trading_style = ? ORDER BY created_at DESC LIMIT 1 OFFSET 1`,
      args: [style],
    });
    if (prevResult.rows.length > 0) {
      const r: any = prevResult.rows[0];
      previousRuns[style] = {
        id: typeof r.id === "number" ? r.id : Number(r.id),
        run_date: String(r.run_date ?? ""),
        market_phase: null,
        result: String(r.result ?? ""),
        result_ru: null,
        result_fr: null,
        result_es: null,
        result_zh: null,
        created_at: r.created_at ?? undefined,
      };
    }
  }
  
  for (const [style, run] of Object.entries({ conservative: conservativeRun, balanced: balancedRun, aggressive: aggressiveRun })) {
    if (run?.result) {
      try {
        let cleanResult = run.result.trim();
        
        // Remove markdown code blocks if present (handle with or without newlines)
        if (cleanResult.startsWith('```json')) {
          cleanResult = cleanResult.replace(/^```json\s*/, '').replace(/\s*```\s*$/, '');
        } else if (cleanResult.startsWith('```')) {
          cleanResult = cleanResult.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
        }
        
        // Trim again after removing code blocks
        cleanResult = cleanResult.trim();
        
        // Remove JavaScript-style comments that OpenAI sometimes adds
        cleanResult = cleanResult.replace(/\/\/[^\n]*/g, '');
        
        // Validate that cleanResult is not empty and looks like JSON
        if (!cleanResult || (!cleanResult.startsWith('{') && !cleanResult.startsWith('['))) {
          console.error(`Invalid JSON format for ${style}:`, cleanResult.substring(0, 100));
          stylePredictions[style] = { parsed: null, ideas: [], created_at: run?.created_at };
          continue;
        }
        
        const parsed = JSON.parse(cleanResult);
        let ideas = Array.isArray(parsed?.ideas) ? parsed.ideas : [];
        
        // Add created_at to current ideas
        ideas = ideas.map((idea: any) => ({ ...idea, created_at: run?.created_at }));
        
        // Merge ideas from previous run if symbols not in current
        const currentSymbols = new Set(ideas.map((i: any) => i.symbol));
        const prevRun = previousRuns[style];
        if (prevRun?.result) {
          try {
            let prevClean = prevRun.result.trim();
            if (prevClean.startsWith('```json')) {
              prevClean = prevClean.replace(/^```json\s*/, '').replace(/\s*```\s*$/, '');
            } else if (prevClean.startsWith('```')) {
              prevClean = prevClean.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
            }
            prevClean = prevClean.trim();
            prevClean = prevClean.replace(/\/\/[^\n]*/g, '');
            
            const prevParsed = JSON.parse(prevClean);
            const prevIdeas = Array.isArray(prevParsed?.ideas) ? prevParsed.ideas : [];
            
            // Add previous ideas that aren't in current run
            prevIdeas.forEach((prevIdea: any) => {
              if (prevIdea.symbol && !currentSymbols.has(prevIdea.symbol)) {
                ideas.push({ ...prevIdea, created_at: prevRun.created_at, isPrevious: true });
              }
            });
          } catch (e) {
            console.error(`Failed to parse previous ${style} run:`, e);
          }
        }
        
        stylePredictions[style] = {
          parsed,
          ideas,
          created_at: run?.created_at
        };
      } catch (e) {
        console.error(`Failed to parse ${style} result:`, e);
        console.error(`Raw result (first 200 chars):`, run.result?.substring(0, 200));
        // Set empty predictions on error to prevent page crash
        stylePredictions[style] = { parsed: null, ideas: [], created_at: run?.created_at };
      }
    } else {
      // No result available
      stylePredictions[style] = { parsed: null, ideas: [] };
    }
  }

  // Get user language preference from cookie (no localStorage flash)
  const userLang = cookieStore.get('user_language')?.value as 'en' | 'ru' | 'es' | 'zh' | 'fr' || 'en';

  // Prepare translations object
  const translations = {
    en: last?.result || '',
    ru: last?.result_ru || last?.result || '',
    fr: last?.result_fr || last?.result || '',
    es: last?.result_es || last?.result || '',
    zh: last?.result_zh || last?.result || '',
  };

  let parsed: {
    market_phase?: string;
    wave_structure?: string;
    ideas?: Array<any>;
  } | null = stylePredictions[userStyle]?.parsed || null;

  const ideas = Array.isArray(parsed?.ideas) ? parsed!.ideas : [];
  
  // Fetch prices from market_assets table instead of external API
  const symbols = ideas.map((idea: any) => idea.symbol).filter(Boolean);
  let prices: Record<string, any> = {};
  
  if (symbols.length > 0) {
    const placeholders = symbols.map(() => '?').join(',');
    const priceRes = await db.execute({
      sql: `SELECT symbol, price, change_24h FROM market_assets WHERE symbol IN (${placeholders})`,
      args: symbols,
    });
    
    prices = (priceRes.rows || []).reduce((acc: Record<string, any>, row: any) => {
      acc[row.symbol] = {
        symbol: row.symbol,
        currentPrice: row.price,
        change24h: row.change_24h,
        currency: 'USD',
        lastUpdated: new Date().toISOString(),
      };
      return acc;
    }, {});
  }

  return (
    <OraclePageClient
      last={last}
      parsed={parsed}
      ideas={ideas}
      prices={prices}
      translations={translations}
      initialLanguage={userLang}
      isLoggedIn={!!user}
      subscriptionTier={(user?.subscription_tier || 'free') as 'free' | 'premium' | 'pro'}
      oracleRunId={last?.id}
      stylePredictions={stylePredictions}
      userTradingStyle={userStyle}
      isAdmin={user?.is_admin || false}
      userEmail={user?.email}
    />
  );
}
