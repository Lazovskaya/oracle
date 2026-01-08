import { db } from "@/lib/db";
import { OracleRun } from "@/types/oracle";
import RunButton from "./RunButton";
import { fetchMultiplePrices, formatPrice, formatChange } from "@/lib/priceService";
import OraclePageClient from "./OraclePageClient";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserByEmail, checkAndRevokeExpiredAccess } from '@/lib/auth';

export const revalidate = 60;

async function fetchLastRun(tradingStyle: string = 'balanced'): Promise<OracleRun | null> {
  const res = await db.execute({
    sql: `
      SELECT id, run_date, market_phase, result, result_ru, result_es, result_zh, trading_style, asset_preference, created_at
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
  const userEmail = cookieStore.get('user_email')?.value;

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
  const stylePredictions: Record<string, { parsed: any; ideas: any[] }> = {};
  
  for (const [style, run] of Object.entries({ conservative: conservativeRun, balanced: balancedRun, aggressive: aggressiveRun })) {
    if (run?.result) {
      try {
        let cleanResult = run.result.trim();
        if (cleanResult.startsWith('```json')) {
          cleanResult = cleanResult.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
        } else if (cleanResult.startsWith('```')) {
          cleanResult = cleanResult.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
        }
        
        const parsed = JSON.parse(cleanResult);
        stylePredictions[style] = {
          parsed,
          ideas: Array.isArray(parsed?.ideas) ? parsed.ideas : []
        };
      } catch (e) {
        console.error(`Failed to parse ${style} result:`, e);
      }
    }
  }

  // Prepare translations object
  const translations = {
    en: last?.result || '',
    ru: last?.result_ru || last?.result || '',
    es: last?.result_es || last?.result || '',
    zh: last?.result_zh || last?.result || '',
  };

  let parsed: {
    market_phase?: string;
    wave_structure?: string;
    ideas?: Array<any>;
  } | null = stylePredictions[userStyle]?.parsed || null;

  const ideas = Array.isArray(parsed?.ideas) ? parsed!.ideas : [];
  
  const symbols = ideas.map((idea: any) => idea.symbol).filter(Boolean);
  const prices = symbols.length > 0 ? await fetchMultiplePrices(symbols) : {};

  return (
    <OraclePageClient
      last={last}
      parsed={parsed}
      ideas={ideas}
      prices={prices}
      translations={translations}
      isLoggedIn={!!user}
      subscriptionTier={(user?.subscription_tier || 'free') as 'free' | 'premium'}
      oracleRunId={last?.id}
      stylePredictions={stylePredictions}
      userTradingStyle={userStyle}
      isAdmin={user?.is_admin || false}
    />
  );
}
