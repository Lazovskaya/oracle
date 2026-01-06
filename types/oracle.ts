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

export type OracleRun = {
  id?: number;
  run_date: string; // ISO date
  market_phase: string | null;
  result: string; // raw LLM output (JSON string)
  created_at?: string;
};