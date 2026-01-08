export interface OracleRun {
  id?: number;
  run_date: string;
  market_phase: string | null;
  result: string;
  result_ru?: string | null;
  result_es?: string | null;
  result_zh?: string | null;
  created_at?: string;
}

export type OracleIdea = {
  symbol: string;
  rationale: string;
  entry: string | number | { type?: string; value?: any };
  stop: string | number | { type?: string; value?: any };
  targets: (string | number | { type?: string; value?: any })[];
  timeframe: string; // "2-6 weeks"
  confidence: "low" | "medium" | "high" | string;
  bias?: string;
  wave_context?: string;
  risk_note?: string;
};