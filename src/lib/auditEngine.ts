// src/lib/auditEngine.ts
// Pure functions only — no API calls, no side effects
// All prices read from pricingData.ts — no hardcoded numbers
// Input: AuditInput → Output: AuditResult

import { TOOLS } from '@/lib/pricingData';
import type {
  AuditInput,
  AuditResult,
  ToolEntry,
  ToolAuditResult,
  RecommendedAction,
  UseCase,
} from '@/types';

// ─────────────────────────────────────────────────────────
// PRICE HELPERS
// All prices come from pricingData — never hardcoded here
// ─────────────────────────────────────────────────────────

// Gets monthly price for a given tool + plan
function getPrice(tool: string, plan: string): number {
  return TOOLS[tool]?.plans[plan]?.monthly ?? 0;
}

// Gets minimum seat requirement for a plan
function getMinSeats(tool: string, plan: string): number {
  return TOOLS[tool]?.plans[plan]?.minSeats ?? 1;
}

// Gets annual billing rate (cheaper than monthly for some plans)
function getAnnualPrice(tool: string, plan: string): number {
  return TOOLS[tool]?.plans[plan]?.annualMonthly ?? getPrice(tool, plan);
}

// ─────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// Called by /api/audit with the user's form data
// Returns the full AuditResult
// ─────────────────────────────────────────────────────────

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, useCase } = input;

  // Filter out rows where tool or plan was not selected
  const validTools = tools.filter(
    (t) => t.tool !== '' && t.plan !== ''
  );

  // Run each tool through its rule set
  const perTool = validTools.map((entry) =>
    auditSingleTool(entry, teamSize, useCase)
  );

  // Sum all savings across tools
  const totalMonthlySaving = perTool.reduce(
    (sum, t) => sum + t.potentialSaving,
    0
  );

  return {
    perTool,
    totalMonthlySaving: round(totalMonthlySaving),
    totalAnnualSaving:  round(totalMonthlySaving * 12),
    isHighSavings:      totalMonthlySaving > 500,
    isAlreadyOptimal:   totalMonthlySaving < 10,
    teamSize,
    useCase,
  };
}

// ─────────────────────────────────────────────────────────
// SINGLE TOOL ROUTER
// Routes each tool to its dedicated rule function
// ─────────────────────────────────────────────────────────

function auditSingleTool(
  entry:    ToolEntry,
  teamSize: number,
  useCase:  UseCase
): ToolAuditResult {
  switch (entry.tool) {
    case 'cursor':
      return auditCursor(entry, teamSize, useCase);
    case 'github_copilot':
      return auditGithubCopilot(entry, teamSize, useCase);
    case 'claude':
      return auditClaude(entry, useCase);
    case 'chatgpt':
      return auditChatGPT(entry, useCase);
    case 'anthropic_api':
      return auditAPISpend(entry, 'Anthropic API');
    case 'openai_api':
      return auditAPISpend(entry, 'OpenAI API');
    case 'gemini':
      return auditGemini(entry, useCase);
    case 'windsurf':
      return auditWindsurf(entry);
    default:
      return makeResult(
        entry, 'keep', 0, undefined,
        'Tool not recognized — verify manually.'
      );
  }
}

// ─────────────────────────────────────────────────────────
// CURSOR RULES
// ─────────────────────────────────────────────────────────

function auditCursor(
  entry:    ToolEntry,
  teamSize: number,
  useCase:  UseCase
): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  const proPrice      = getPrice('cursor', 'pro');       // $20
  const businessPrice = getPrice('cursor', 'business');  // $40
  const proPlusPrice  = getPrice('cursor', 'pro_plus');  // $60

  // Rule 1: Business for 1–2 users
  // Business adds SSO + admin controls — useless under 3 users
  if (plan === 'business' && seats <= 2) {
    const saving = monthlySpend - proPrice * seats;
    return makeResult(
      entry, 'downgrade', saving, 'cursor:pro',
      `Cursor Business ($${businessPrice}/seat) adds SSO and admin controls — unnecessary for ${seats} user(s). Pro at $${proPrice}/seat covers identical AI features, saving $${saving}/mo.`
    );
  }

  // Rule 2: Business for small team (3–5) with no SSO need
  if (plan === 'business' && seats >= 3 && seats <= 5 && teamSize <= 10) {
    const saving = monthlySpend - proPrice * seats;
    return makeResult(
      entry, 'downgrade', saving, 'cursor:pro',
      `Cursor Business ($${businessPrice}/seat) is designed for larger orgs needing SSO and centralised billing. A team of ${seats} on Pro saves $${saving}/mo with no functional difference.`
    );
  }

  // Rule 3: Pro+ for non-coding workflows
  // Pro+ is for engineers consistently hitting Pro usage limits
  if (plan === 'pro_plus' && useCase !== 'coding') {
    const saving = monthlySpend - proPrice * seats;
    return makeResult(
      entry, 'downgrade', saving, 'cursor:pro',
      `Cursor Pro+ ($${proPlusPrice}/seat) is for engineers hitting Pro usage limits daily. For ${useCase} workflows, Pro at $${proPrice}/seat is sufficient, saving $${saving}/mo.`
    );
  }

  return makeResult(
    entry, 'keep', 0, undefined,
    'Cursor plan looks right-sized for your team and usage.'
  );
}

// ─────────────────────────────────────────────────────────
// GITHUB COPILOT RULES
// ─────────────────────────────────────────────────────────

function auditGithubCopilot(
  entry:    ToolEntry,
  teamSize: number,
  useCase:  UseCase
): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  const proPrice        = getPrice('github_copilot', 'pro');        // $10
  const proPlusPrice    = getPrice('github_copilot', 'pro_plus');    // $39
  const businessPrice   = getPrice('github_copilot', 'business');   // $19
  const enterprisePrice = getPrice('github_copilot', 'enterprise'); // $39

  // Rule 1: Pro+ for non-coding use case
  if (plan === 'pro_plus' && useCase !== 'coding') {
    const saving = monthlySpend - proPrice * seats;
    return makeResult(
      entry, 'downgrade', saving, 'github_copilot:pro',
      `Copilot Pro+ ($${proPlusPrice}/seat) is optimised for heavy coding workflows. For ${useCase}, Pro at $${proPrice}/seat provides the core features needed, saving $${saving}/mo.`
    );
  }

  // Rule 2: Enterprise for small team (< 10 seats)
  // Enterprise adds GitHub.com chat and org-wide knowledge bases
  // — rarely justified under 10 users
  if (plan === 'enterprise' && seats < 10) {
    const saving = monthlySpend - businessPrice * seats;
    return makeResult(
      entry, 'downgrade', saving, 'github_copilot:business',
      `Copilot Enterprise ($${enterprisePrice}/seat) adds GitHub.com chat and org knowledge bases — features rarely used under 10 seats. Business at $${businessPrice}/seat covers all IDE completions, saving $${saving}/mo.`
    );
  }

  // Rule 3: Business for a solo user
  if (plan === 'business' && seats === 1) {
    const saving = monthlySpend - proPrice;
    return makeResult(
      entry, 'downgrade', saving, 'github_copilot:pro',
      `Copilot Business ($${businessPrice}/seat) is designed for teams needing admin controls. A solo developer on Pro saves $${saving}/mo with identical code completion.`
    );
  }

  // Rule 4: Non-coding team using Copilot
  if (useCase !== 'coding' && useCase !== 'mixed') {
    return makeResult(
      entry, 'switch', 0, undefined,
      `GitHub Copilot is purpose-built for code completion. For ${useCase} workflows, Claude or ChatGPT would deliver more value at a similar or lower price point.`
    );
  }

  return makeResult(
    entry, 'keep', 0, undefined,
    'GitHub Copilot plan looks right-sized for your team.'
  );
}

// ─────────────────────────────────────────────────────────
// CLAUDE RULES
// ─────────────────────────────────────────────────────────

function auditClaude(
  entry:   ToolEntry,
  useCase: UseCase
): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  const proPrice             = getPrice('claude', 'pro');             // $20
  const maxPrice             = getPrice('claude', 'max');             // $100
  const teamStandardPrice    = getPrice('claude', 'team_standard');   // $25 monthly
  const teamStandardAnnual   = getAnnualPrice('claude', 'team_standard'); // $20 annual
  const teamPremiumPrice     = getPrice('claude', 'team_premium');    // $125 monthly
  const teamStandardMinSeats = getMinSeats('claude', 'team_standard');// 5
  const teamPremiumMinSeats  = getMinSeats('claude', 'team_premium'); // 5

  // Rule 1: Team Standard for fewer than minimum seats
  // Small teams pay for unused seats due to the 5-seat floor
  if (plan === 'team_standard' && seats < teamStandardMinSeats) {
    const proTotal   = proPrice * seats;
    const floorCost  = proPrice * teamStandardMinSeats;
    const actualCost = Math.max(monthlySpend, floorCost);
    const saving     = actualCost - proTotal;
    return makeResult(
      entry, 'downgrade', saving, 'claude:pro',
      `Claude Team Standard has a ${teamStandardMinSeats}-seat minimum ($${floorCost}/mo floor). ${seats} users on Pro costs $${proTotal}/mo — identical capability, no minimum commitment, saving $${saving}/mo.`
    );
  }

  // Rule 2: Team Premium for fewer than minimum seats
  if (plan === 'team_premium' && seats < teamPremiumMinSeats) {
    const proTotal   = proPrice * seats;
    const floorCost  = teamPremiumPrice * teamPremiumMinSeats;
    const actualCost = Math.max(monthlySpend, floorCost);
    const saving     = actualCost - proTotal;
    return makeResult(
      entry, 'downgrade', saving, 'claude:pro',
      `Claude Team Premium has a ${teamPremiumMinSeats}-seat minimum ($${floorCost}/mo floor). ${seats} users on Pro costs $${proTotal}/mo — saving $${saving}/mo.`
    );
  }

  // Rule 3: Max plan for non-research / small team
  // Max is only justified for users who exhaust Pro limits daily
  if (plan === 'max' && useCase !== 'research' && seats <= 3) {
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving, 'claude:pro',
      `Claude Max ($${maxPrice}/seat) is for very high-volume users who exhaust Pro limits daily. For ${useCase} workflows with ${seats} user(s), Pro at $${proPrice}/seat handles the vast majority of usage, saving $${saving}/mo.`
    );
  }

  // Rule 4: Team Standard on monthly billing instead of annual
  // Monthly billing is $25/seat vs $20/seat on annual — 25% premium
  if (
    plan === 'team_standard' &&
    monthlySpend > teamStandardAnnual * seats
  ) {
    const annualTotal = teamStandardAnnual * seats;
    const saving      = monthlySpend - annualTotal;
    return makeResult(
      entry, 'optimize', saving, 'claude:team_standard',
      `You appear to be on monthly billing ($${teamStandardPrice}/seat). Switching to annual billing reduces the rate to $${teamStandardAnnual}/seat, saving $${saving}/mo ($${saving * 12}/year) with no change in features.`
    );
  }

  return makeResult(
    entry, 'keep', 0, undefined,
    'Claude plan looks right-sized for your team and usage.'
  );
}

// ─────────────────────────────────────────────────────────
// CHATGPT RULES
// ─────────────────────────────────────────────────────────

function auditChatGPT(
  entry:   ToolEntry,
  useCase: UseCase
): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  const goPrice       = getPrice('chatgpt', 'go');        // $5
  const plusPrice     = getPrice('chatgpt', 'plus');      // $20
  const proPrice      = getPrice('chatgpt', 'pro');       // $120
  const teamPrice     = getPrice('chatgpt', 'team');      // $30
  const businessPrice = getPrice('chatgpt', 'business'); // $21

  // Rule 1: Pro plan for non-research users
  // ChatGPT Pro is specifically for unlimited o1 + o1 Pro access
  if (plan === 'pro' && useCase !== 'research') {
    const saving = monthlySpend - plusPrice * seats;
    return makeResult(
      entry, 'downgrade', saving, 'chatgpt:plus',
      `ChatGPT Pro ($${proPrice}/seat) is designed for researchers needing unlimited o1 access. For ${useCase} workflows, Plus at $${plusPrice}/seat covers GPT-4o and standard limits, saving $${saving}/mo.`
    );
  }

  // Rule 2: Multiple Plus users — flag if Team would cost more
  // Keep Plus if it is already cheaper than Team per seat
  if (plan === 'plus' && seats >= 5) {
    const teamTotal = teamPrice * seats;
    const plusTotal = monthlySpend;
    if (teamTotal > plusTotal) {
      return makeResult(
        entry, 'keep', 0, undefined,
        `${seats} users on ChatGPT Plus ($${plusPrice}/seat) is more cost-effective than Team ($${teamPrice}/seat). Only upgrade to Team if you need shared workspaces or admin controls.`
      );
    }
  }

  // Rule 3: Single user on Business plan
  // Business has a 2-seat minimum — solo users are overpaying
  if (plan === 'business' && seats === 1) {
    const saving = monthlySpend - plusPrice;
    return makeResult(
      entry, 'downgrade', saving, 'chatgpt:plus',
      `ChatGPT Business ($${businessPrice}/seat) requires a minimum of 2 seats and is designed for teams. A solo user on Plus saves $${saving}/mo with equivalent AI access.`
    );
  }

  // Rule 4: Go plan for power users
  // Go has strict limits that block intensive workflows
  if (plan === 'go' && (useCase === 'coding' || useCase === 'research')) {
    return makeResult(
      entry, 'optimize', 0, 'chatgpt:plus',
      `ChatGPT Go ($${goPrice}/seat) has strict usage limits that frequently block ${useCase} workflows. Plus at $${plusPrice}/seat removes these limits and includes GPT-4o access.`
    );
  }

  return makeResult(
    entry, 'keep', 0, undefined,
    'ChatGPT plan looks right-sized for your team and usage.'
  );
}

// ─────────────────────────────────────────────────────────
// GEMINI RULES
// ─────────────────────────────────────────────────────────

function auditGemini(
  entry:   ToolEntry,
  useCase: UseCase
): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  const proPrice   = getPrice('gemini', 'pro');    // $20
  const ultraPrice = getPrice('gemini', 'ultra'); // $300

  // Rule 1: Ultra for non-research teams
  // Ultra provides Gemini Ultra model access — primarily for deep research
  if (plan === 'ultra' && useCase !== 'research') {
    const saving = monthlySpend - proPrice * seats;
    return makeResult(
      entry, 'downgrade', saving, 'gemini:pro',
      `Google AI Ultra ($${ultraPrice}/seat) provides Gemini Ultra model access — primarily valuable for deep research. For ${useCase} workflows, AI Pro at $${proPrice}/seat delivers sufficient capability, saving $${saving}/mo.`
    );
  }

  // Rule 2: Multiple Pro seats for writing use case
  // Claude Team Standard is stronger for long-form writing
  if (plan === 'pro' && seats >= 5 && useCase === 'writing') {
    const claudeTeamPrice = getAnnualPrice('claude', 'team_standard');
    return makeResult(
      entry, 'switch', 0, undefined,
      `For writing workflows with ${seats} users, Claude Team Standard ($${claudeTeamPrice}/seat/mo annual) offers stronger long-form writing capability at the same price point as Gemini AI Pro.`
    );
  }

  return makeResult(
    entry, 'keep', 0, undefined,
    'Gemini plan looks right-sized for your team and usage.'
  );
}

// ─────────────────────────────────────────────────────────
// WINDSURF RULES
// ─────────────────────────────────────────────────────────

function auditWindsurf(entry: ToolEntry): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  const proPrice   = getPrice('windsurf', 'pro');   // $15
  const teamsPrice = getPrice('windsurf', 'teams'); // $35

  // Rule 1: Teams for 1–2 users
  // Teams adds admin controls and centralised billing — not needed under 3
  if (plan === 'teams' && seats <= 2) {
    const saving = monthlySpend - proPrice * seats;
    return makeResult(
      entry, 'downgrade', saving, 'windsurf:pro',
      `Windsurf Teams ($${teamsPrice}/seat) adds admin controls and centralised billing — unnecessary for ${seats} user(s). Pro at $${proPrice}/seat is functionally identical for daily AI coding, saving $${saving}/mo.`
    );
  }

  return makeResult(
    entry, 'keep', 0, undefined,
    'Windsurf plan looks right-sized for your team.'
  );
}

// ─────────────────────────────────────────────────────────
// API SPEND RULES
// Shared by Anthropic API and OpenAI API
// Usage-based — flag if spend is high relative to team size
// ─────────────────────────────────────────────────────────

function auditAPISpend(
  entry:     ToolEntry,
  toolLabel: string
): ToolAuditResult {
  const { monthlySpend, seats } = entry;

  // Spend per user — high per-user spend suggests model selection issue
  const spendPerUser = monthlySpend / Math.max(seats, 1);

  // Rule 1: High per-user spend → likely using expensive models for all tasks
  if (spendPerUser > 100) {
    return makeResult(
      entry, 'optimize', 0, undefined,
      `${toolLabel} spend is $${spendPerUser.toFixed(0)}/user/mo. Review model selection — switching high-volume calls from premium models to smaller models (e.g. Haiku, GPT-4o Mini) can cut API costs 60–90% with minimal quality loss for most tasks.`
    );
  }

  // Rule 2: High total spend → prompt and batching optimisation opportunity
  if (monthlySpend > 500) {
    return makeResult(
      entry, 'optimize', 0, undefined,
      `${toolLabel} spend of $${monthlySpend}/mo is significant. Consider prompt caching for repeated context, batching non-urgent requests, and auditing which endpoints drive the most token usage.`
    );
  }

  return makeResult(
    entry, 'keep', 0, undefined,
    `${toolLabel} spend looks proportionate to your team size. Continue monitoring monthly.`
  );
}

// ─────────────────────────────────────────────────────────
// HELPER — makeResult
// Builds a consistent ToolAuditResult object
// recommendedPlanKey format: "toolKey:planKey"
// e.g. "cursor:pro", "claude:team_standard", "chatgpt:plus"
// ─────────────────────────────────────────────────────────

function makeResult(
  entry:              ToolEntry,
  action:             RecommendedAction,
  saving:             number,
  recommendedPlanKey: string | undefined,
  reason:             string
): ToolAuditResult {
  const toolDef = TOOLS[entry.tool];
  const planDef = toolDef?.plans[entry.plan];

  // Resolve recommended plan label + price from pricingData
  let recommendedPlan:  string | undefined;
  let recommendedPrice: number | null | undefined;

  if (recommendedPlanKey) {
    const [recToolKey, recPlanKey] = recommendedPlanKey.split(':');
    const recPlanDef = TOOLS[recToolKey]?.plans[recPlanKey];
    recommendedPlan  = recPlanDef?.label   ?? undefined;
    recommendedPrice = recPlanDef?.monthly ?? undefined;
  }

  return {
    tool:              toolDef?.label ?? entry.tool,
    plan:              planDef?.label ?? entry.plan,
    seats:             entry.seats,
    currentSpend:      entry.monthlySpend,
    recommendedAction: action,
    recommendedPlan,
    recommendedPrice,
    potentialSaving:   Math.max(0, round(saving)),
    reason,
  };
}

// ─────────────────────────────────────────────────────────
// HELPER — round
// Rounds to 2 decimal places — prevents floating point noise
// ─────────────────────────────────────────────────────────

function round(n: number): number {
  return Math.round(n * 100) / 100;
}