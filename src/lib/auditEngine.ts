// src/lib/auditEngine.ts
// Pure functions only — no API calls, no side effects
// All prices read from pricingData.ts — no hardcoded numbers

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
// Read every price from pricingData — never hardcode
// ─────────────────────────────────────────────────────────

function getPrice(tool: string, plan: string): number {
  return TOOLS[tool]?.plans[plan]?.monthly ?? 0;
}

function getMinSeats(tool: string, plan: string): number {
  return TOOLS[tool]?.plans[plan]?.minSeats ?? 1;
}

function getAnnualPrice(tool: string, plan: string): number {
  return TOOLS[tool]?.plans[plan]?.annualMonthly ?? getPrice(tool, plan);
}

// ─────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────────────────────────

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, useCase } = input;

  const validTools = tools.filter(
    (t) => t.tool !== '' && t.plan !== ''
  );

  const perTool = validTools.map((entry) =>
    auditSingleTool(entry, teamSize, useCase)
  );

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
// ─────────────────────────────────────────────────────────

function auditSingleTool(
  entry:    ToolEntry,
  teamSize: number,
  useCase:  UseCase
): ToolAuditResult {
  switch (entry.tool) {
    case 'cursor':         return auditCursor(entry, teamSize, useCase);
    case 'github_copilot': return auditGithubCopilot(entry, teamSize, useCase);
    case 'claude':         return auditClaude(entry, useCase);
    case 'chatgpt':        return auditChatGPT(entry, useCase);
    case 'anthropic_api':  return auditAPISpend(entry, 'Anthropic API');
    case 'openai_api':     return auditAPISpend(entry, 'OpenAI API');
    case 'gemini':         return auditGemini(entry, useCase);
    case 'windsurf':       return auditWindsurf(entry);
    default:               return makeResult(
                             entry, 'keep', 0,
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

  const proPrice      = getPrice('cursor', 'pro');         // $20
  const businessPrice = getPrice('cursor', 'business');    // $40
  const proPlusPrice  = getPrice('cursor', 'pro_plus');    // $60

  // Business for 1–2 users → downgrade to Pro
  // Business adds SSO and admin controls — unnecessary under 3 users
  if (plan === 'business' && seats <= 2) {
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Cursor Business ($${businessPrice}/seat) adds SSO and admin controls — unnecessary for ${seats} user(s). Pro at $${proPrice}/seat covers identical AI features, saving $${saving}/mo.`
    );
  }

  // Business for small team (3–5) with no SSO need → downgrade to Pro
  if (plan === 'business' && seats >= 3 && seats <= 5 && teamSize <= 10) {
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Cursor Business ($${businessPrice}/seat) is designed for larger orgs needing SSO and centralised billing. A team of ${seats} on Pro saves $${saving}/mo with no functional difference for daily AI usage.`
    );
  }

  // Pro+ for non-coding workflows → downgrade to Pro
  // Pro+ is for engineers hitting Pro limits daily
  if (plan === 'pro_plus' && useCase !== 'coding') {
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Cursor Pro+ ($${proPlusPrice}/seat) is for engineers hitting Pro usage limits daily. For ${useCase} workflows, Pro at $${proPrice}/seat is sufficient, saving $${saving}/mo.`
    );
  }

  return makeResult(entry, 'keep', 0,
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

  const proPrice         = getPrice('github_copilot', 'pro');          // $10
  const proPlusPrice     = getPrice('github_copilot', 'pro_plus');     // $39
  const businessPrice    = getPrice('github_copilot', 'business');     // $19
  const enterprisePrice  = getPrice('github_copilot', 'enterprise');   // $39

  // Pro+ for non-coding use case → downgrade to Pro
  if (plan === 'pro_plus' && useCase !== 'coding') {
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `GitHub Copilot Pro+ ($${proPlusPrice}/seat) is optimised for heavy coding workflows. For ${useCase} use cases, Pro at $${proPrice}/seat provides the core features needed, saving $${saving}/mo.`
    );
  }

  // Enterprise for small team → downgrade to Business
  if (plan === 'enterprise' && seats < 10) {
    const businessTotal = businessPrice * seats;
    const saving        = monthlySpend - businessTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Copilot Enterprise ($${enterprisePrice}/seat) adds GitHub.com chat and org-wide knowledge bases — features rarely used by teams under 10. Business at $${businessPrice}/seat covers all IDE completions, saving $${saving}/mo.`
    );
  }

  // Business for solo user → downgrade to Pro
  if (plan === 'business' && seats === 1) {
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Copilot Business ($${businessPrice}/seat) is designed for teams needing admin controls. A solo developer on Pro saves $${saving}/mo with identical code completion.`
    );
  }

  // Non-coding team using Copilot → suggest switching
  if (useCase !== 'coding' && useCase !== 'mixed') {
    return makeResult(
      entry, 'switch', 0,
      `GitHub Copilot is purpose-built for code completion. For ${useCase} workflows, Claude or ChatGPT would deliver more value at a similar or lower price point.`
    );
  }

  return makeResult(entry, 'keep', 0,
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

  const proPrice             = getPrice('claude', 'pro');                          // $20
  const maxPrice             = getPrice('claude', 'max');                          // $100
  const teamStandardPrice    = getPrice('claude', 'team_standard');                // $25 monthly
  const teamStandardAnnual   = getAnnualPrice('claude', 'team_standard');          // $20 annual
  const teamPremiumPrice     = getPrice('claude', 'team_premium');                 // $125 monthly
  const teamStandardMinSeats = getMinSeats('claude', 'team_standard');             // 5
  const teamPremiumMinSeats  = getMinSeats('claude', 'team_premium');              // 5

  // Team Standard for fewer than min seats → downgrade to Pro
  // Small teams pay for unused seats due to the minimum
  if (plan === 'team_standard' && seats < teamStandardMinSeats) {
    const proTotal   = proPrice * seats;
    const floorCost  = proPrice * teamStandardMinSeats;
    const actualCost = Math.max(monthlySpend, floorCost);
    const saving     = actualCost - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Claude Team Standard has a ${teamStandardMinSeats}-seat minimum ($${floorCost}/mo floor). ${seats} users on Claude Pro costs $${proTotal}/mo — identical capability, no minimum commitment, saving $${saving}/mo.`
    );
  }

  // Team Premium for fewer than min seats → downgrade to Pro
  if (plan === 'team_premium' && seats < teamPremiumMinSeats) {
    const proTotal   = proPrice * seats;
    const floorCost  = teamPremiumPrice * teamPremiumMinSeats;
    const actualCost = Math.max(monthlySpend, floorCost);
    const saving     = actualCost - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Claude Team Premium has a ${teamPremiumMinSeats}-seat minimum ($${floorCost}/mo floor). For ${seats} users, individual Pro plans at $${proTotal}/mo deliver the same core capability, saving $${saving}/mo.`
    );
  }

  // Max plan for non-research / non-power users → downgrade to Pro
  if (plan === 'max' && useCase !== 'research' && seats <= 3) {
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Claude Max ($${maxPrice}/seat) is for very high-volume users who exhaust Pro limits daily. For ${useCase} workflows with ${seats} user(s), Pro at $${proPrice}/seat handles the vast majority of usage, saving $${saving}/mo.`
    );
  }

  // Team Standard on monthly billing → switch to annual
  // Monthly billing is $25/seat vs $20/seat annual
  if (plan === 'team_standard' && monthlySpend > teamStandardAnnual * seats) {
    const annualTotal = teamStandardAnnual * seats;
    const saving      = monthlySpend - annualTotal;
    return makeResult(
      entry, 'optimize', saving,
      `You appear to be on monthly billing ($${teamStandardPrice}/seat). Switching to annual billing reduces the rate to $${teamStandardAnnual}/seat, saving $${saving}/mo ($${saving * 12}/year) with no change in features.`
    );
  }

  return makeResult(entry, 'keep', 0,
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
  const businessPrice = getPrice('chatgpt', 'business');  // $21

  // Pro plan for non-research users → downgrade to Plus
  // ChatGPT Pro is for unlimited o1 access — overkill for most
  if (plan === 'pro' && useCase !== 'research') {
    const plusTotal = plusPrice * seats;
    const saving    = monthlySpend - plusTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `ChatGPT Pro ($${proPrice}/seat) is designed for researchers needing unlimited o1 access. For ${useCase} workflows, Plus at $${plusPrice}/seat covers GPT-4o and standard limits, saving $${saving}/mo.`
    );
  }

  // Multiple Plus users — flag if Team would cost more
  // Keep Plus if Team is more expensive per seat
  if (plan === 'plus' && seats >= 5) {
    const teamTotal = teamPrice * seats;
    const plusTotal = monthlySpend;
    if (teamTotal > plusTotal) {
      return makeResult(
        entry, 'keep', 0,
        `${seats} users on ChatGPT Plus ($${plusPrice}/seat) is more cost-effective than Team ($${teamPrice}/seat). Only upgrade to Team if you need shared workspaces or admin controls.`
      );
    }
  }

  // Single user on Business → downgrade to Plus
  if (plan === 'business' && seats === 1) {
    const plusTotal = plusPrice * seats;
    const saving    = monthlySpend - plusTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `ChatGPT Business ($${businessPrice}/seat) requires a minimum of 2 seats and is designed for teams. A solo user on Plus saves $${saving}/mo with equivalent AI access.`
    );
  }

  // Go plan for power users → suggest upgrading to Plus
  if (plan === 'go' && (useCase === 'coding' || useCase === 'research')) {
    return makeResult(
      entry, 'optimize', 0,
      `ChatGPT Go ($${goPrice}/seat) has strict usage limits that frequently block ${useCase} workflows. Plus at $${plusPrice}/seat removes these limits and includes GPT-4o — consider upgrading.`
    );
  }

  return makeResult(entry, 'keep', 0,
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
  const ultraPrice = getPrice('gemini', 'ultra');  // $300

  // Ultra for non-research teams → downgrade to Pro
  if (plan === 'ultra' && useCase !== 'research') {
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Google AI Ultra ($${ultraPrice}/seat) provides Gemini Ultra model access — primarily valuable for deep research. For ${useCase} workflows, AI Pro at $${proPrice}/seat delivers sufficient capability, saving $${saving}/mo.`
    );
  }

  // Multiple Pro seats for writing → suggest Claude Team
  if (plan === 'pro' && seats >= 5 && useCase === 'writing') {
    const claudeTeamPrice = getAnnualPrice('claude', 'team_standard'); // $20
    return makeResult(
      entry, 'switch', 0,
      `For writing workflows with ${seats} users, Claude Team Standard ($${claudeTeamPrice}/seat/mo annual) offers stronger long-form writing capability at the same price point as Gemini AI Pro.`
    );
  }

  return makeResult(entry, 'keep', 0,
    'Gemini plan looks right-sized for your team and usage.'
  );
}

// ─────────────────────────────────────────────────────────
// WINDSURF RULES
// ─────────────────────────────────────────────────────────

function auditWindsurf(entry: ToolEntry): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  const proPrice    = getPrice('windsurf', 'pro');    // $15
  const teamsPrice  = getPrice('windsurf', 'teams');  // $35

  // Teams for 1–2 users → downgrade to Pro
  if (plan === 'teams' && seats <= 2) {
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Windsurf Teams ($${teamsPrice}/seat) adds admin controls and centralised billing — unnecessary for ${seats} user(s). Pro at $${proPrice}/seat is functionally identical for daily AI coding, saving $${saving}/mo.`
    );
  }

  return makeResult(entry, 'keep', 0,
    'Windsurf plan looks right-sized for your team.'
  );
}

// ─────────────────────────────────────────────────────────
// API SPEND RULES
// Shared by Anthropic API and OpenAI API
// ─────────────────────────────────────────────────────────

function auditAPISpend(
  entry:     ToolEntry,
  toolLabel: string
): ToolAuditResult {
  const { monthlySpend, seats } = entry;

  const spendPerUser = monthlySpend / Math.max(seats, 1);

  // High spend per user → recommend model optimisation
  if (spendPerUser > 100) {
    return makeResult(
      entry, 'optimize', 0,
      `${toolLabel} spend is $${spendPerUser.toFixed(0)}/user/mo. Review model selection — switching high-volume calls from premium models to smaller models (e.g. Haiku, GPT-4o Mini) can cut API costs by 60–90% with minimal quality loss for most tasks.`
    );
  }

  // High total spend → recommend usage audit
  if (monthlySpend > 500) {
    return makeResult(
      entry, 'optimize', 0,
      `${toolLabel} spend of $${monthlySpend}/mo is significant. Consider prompt caching for repeated context, batching non-urgent requests, and auditing which endpoints drive the most token usage.`
    );
  }

  return makeResult(entry, 'keep', 0,
    `${toolLabel} spend looks proportionate to your team size. Continue monitoring monthly.`
  );
}

// ─────────────────────────────────────────────────────────
// HELPER — builds a consistent ToolAuditResult
// Ensures potentialSaving is never negative
// ─────────────────────────────────────────────────────────

function makeResult(
  entry:  ToolEntry,
  action: RecommendedAction,
  saving: number,
  reason: string
): ToolAuditResult {
  const toolDef = TOOLS[entry.tool];
  const planDef = toolDef?.plans[entry.plan];

  return {
    tool:              toolDef?.label ?? entry.tool,
    plan:              planDef?.label ?? entry.plan,
    seats:             entry.seats,
    currentSpend:      entry.monthlySpend,
    recommendedAction: action,
    potentialSaving:   Math.max(0, round(saving)),
    reason,
  };
}

// ─────────────────────────────────────────────────────────
// HELPER — rounds to 2 decimal places
// ─────────────────────────────────────────────────────────

function round(n: number): number {
  return Math.round(n * 100) / 100;
}