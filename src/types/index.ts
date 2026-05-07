export type ToolKey =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf';

export type PlanKey = string;

export type UseCase =
  | 'coding'
  | 'writing'
  | 'data'
  | 'research'
  | 'mixed';

export type RecommendedAction =
  | 'downgrade'
  | 'switch'
  | 'keep'
  | 'optimize';

// ── Form input ────────────────────────────────────────────
export interface ToolEntry {
  tool:         ToolKey | '';
  plan:         PlanKey;
  monthlySpend: number;
  seats:        number;
}

export interface AuditInput {
  tools:    ToolEntry[];
  teamSize: number;
  useCase:  UseCase;
}

// ── Pricing data shapes ───────────────────────────────────
export interface PlanDefinition {
  label:    string;
  monthly:  number | null;   // null = custom/contact sales
  perSeat:  boolean;
  minSeats?: number;
}

export interface ToolDefinition {
  label: string;
  plans: Record<string, PlanDefinition>;
}

// ── Audit engine output ───────────────────────────────────
export interface ToolAuditResult {
  tool:              string;         // human-readable label
  plan:              string;
  seats:             number;
  currentSpend:      number;
  recommendedAction: RecommendedAction;
  potentialSaving:   number;
  reason:            string;         // 1 sentence, finance-literate
}

export interface AuditResult {
  perTool:            ToolAuditResult[];
  totalMonthlySaving: number;
  totalAnnualSaving:  number;
  isHighSavings:      boolean;       // > $500/mo
  isAlreadyOptimal:   boolean;       // < $10/mo savings
  teamSize:           number;
  useCase:            UseCase;
}

// ── API request / response shapes ────────────────────────
export interface AuditRequestBody {
  tools:    ToolEntry[];
  teamSize: number;
  useCase:  UseCase;
  website:  string;           // honeypot — must be empty
}

export interface AuditResponse {
  auditId: string;
  result:  AuditResult;
  summary: string;
}

export interface LeadRequestBody {
  auditId:       string;
  email:         string;
  company?:      string;
  role?:         string;
  teamSize?:     number;
  monthlySaving: number;
  website:       string;      // honeypot
}

// ── Database row shapes ───────────────────────────────────
export interface AuditRow {
  id:         string;
  input:      AuditInput;
  result:     AuditResult;
  summary:    string;
  created_at: string;
}

export interface LeadRow {
  id:             string;
  audit_id:       string;
  email:          string;
  company:        string | null;
  role:           string | null;
  team_size:      number | null;
  monthly_saving: number | null;
  created_at:     string;
}