export type OracleIdea = {
  symbol: string;
  rationale: string;
  entry: string | number;
  stop: string | number;
  targets: (string | number)[];
  timeframe: string; // "2-6 weeks"
  confidence: "low" | "medium" | "high" | string;
};

export type OracleRun = {
  id?: number;
  run_date: string; // ISO date
  market_phase: string | null;
  result: string; // raw LLM output (JSON string)
  created_at?: string;
};