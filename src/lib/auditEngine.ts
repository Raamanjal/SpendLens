
import { TOOLS } from '@/lib/pricingData';
import type {
  AuditInput,
  AuditResult,
  ToolEntry,
  ToolAuditResult,
  RecommendedAction,
} from '@/types';

// MAIN ENTRY POINT
// Called by the API route with the user's form data
// Returns the full audit result
// ─────────────────────────────────────────────────────────

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, useCase } = input;

  // Filter out any incomplete tool entries
  // (user may have added a row but not filled it in)
  const validTools = tools.filter(
    (t) => t.tool !== '' && t.plan !== ''
  );

  // Run every tool through the audit engine
  const perTool = validTools.map((entry) =>
    auditSingleTool(entry, teamSize, useCase)
  );

  // Sum up all savings
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


// SINGLE TOOL ROUTER
// Decides which rule set to apply based on the tool

function auditSingleTool(
  entry:    ToolEntry,
  teamSize: number,
  useCase:  string
): ToolAuditResult {
  switch (entry.tool) {
    case 'cursor':         return auditCursor(entry, teamSize);
    case 'github_copilot': return auditGithubCopilot(entry, teamSize, useCase);
    case 'claude':         return auditClaude(entry, teamSize, useCase);
    case 'chatgpt':        return auditChatGPT(entry, teamSize, useCase);
    case 'anthropic_api':  return auditAPISpend(entry, 'Anthropic API');
    case 'openai_api':     return auditAPISpend(entry, 'OpenAI API');
    case 'gemini':         return auditGemini(entry, teamSize, useCase);
    case 'windsurf':       return auditWindsurf(entry, teamSize);
    default:               return makeResult(entry, 'keep', 0,
                             'Tool not recognized — verify manually.');
  }
}

// CURSOR RULES

function auditCursor(entry: ToolEntry, teamSize: number): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  // Business for 1–2 users → downgrade to Pro
  // Business adds SSO and admin controls — useless under 3 users
  if (plan === 'business' && seats <= 2) {
    const proPrice = TOOLS.claude.plans.pro.monthly ?? 20;
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Cursor Business ($40/seat) adds SSO and admin controls — unnecessary for ${seats} user(s). Pro at $20/seat covers identical AI features, saving $${saving}/mo.`
    );
  }
    // Pro+ for non-power users → downgrade to Pro
  // Pro+ is for users hitting Pro limits daily
  if (plan === 'pro_plus' && useCase !== 'coding') {
    const proPrice = TOOLS.claude.plans.pro.monthly ?? 20;
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Cursor Pro+ ($60/seat) is for engineers hitting Pro usage limits daily. For non-coding workflows, Pro at $20/seat is sufficient.`
    );
  }

  // Business when team is small and no SSO needed
  if (plan === 'business' && seats >= 3 && seats <= 5 && teamSize <= 10) {
    const proPrice = TOOLS.claude.plans.pro.monthly ?? 20;
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Cursor Business is designed for larger orgs needing SSO and centralised billing. A team of ${seats} on Pro saves $${saving}/mo with no functional difference for daily AI usage.`
    );
  }

  return makeResult(entry, 'keep', 0,
    'Cursor plan looks right-sized for your team and usage.'
  );
}

// GITHUB COPILOT RULES

function auditGithubCopilot(
  entry:    ToolEntry,
  teamSize: number,
  useCase:  string
): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  // Pro+ for non-coding use case → downgrade to Pro
  if (plan === 'pro_plus' && useCase !== 'coding') {
    const proPrice = TOOLS.github_copilot.plans.pro.monthly ?? 10;
    const proTotal = proPrice * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `GitHub Copilot Pro+ ($39/seat) is optimised for heavy coding workflows. For ${useCase} use cases, Pro at $10/seat provides the core completion features needed.`
    );
  }

  // Enterprise for small team → downgrade to Business
  // Enterprise adds Copilot Chat on GitHub.com and custom org data
  if (plan === 'enterprise' && seats < 10) {
    const businessPrice = TOOLS.github_copilot.plans.business.monthly ?? 19;
    const businessTotal = businessPrice * seats;
    const saving        = monthlySpend - businessTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Copilot Enterprise ($39/seat) adds GitHub.com chat and org-wide knowledge bases — features rarely used by teams under 10. Business at $19/seat covers all IDE completions, saving $${saving}/mo.`
    );
  }

  // Business for 1 user → downgrade to Pro
  if (plan === 'business' && seats === 1) {
    const saving = monthlySpend - 10;
    return makeResult(
      entry, 'downgrade', saving,
      `Copilot Business ($19/seat) is designed for teams needing admin controls and policy management. A solo developer on Pro saves $${saving}/mo with identical code completion.`
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

// CLAUDE RULES

function auditClaude(
  entry:    ToolEntry,
  teamSize: number,
  useCase:  string
): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  // Team Standard for fewer than 5 users → downgrade to Pro
  // Team has a 5-seat minimum — small teams pay for unused seats
  if (plan === 'team_standard' && seats < 5) {
    const proPrice = TOOLS.claude.plans.pro.monthly ?? 20;
    const proTotal  = proPrice * seats;
    const floorCost = proPrice * 5;           // minimum 5 seats billed
    const saving    = floorCost - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Claude Team Standard has a 5-seat minimum ($100/mo floor). ${seats} users on Claude Pro costs $${proTotal}/mo — identical capability, no minimum commitment, saving $${saving}/mo.`
    );
  }

  // Team Premium for fewer than 5 users → downgrade
  if (plan === 'team_premium' && seats < 5) {
    const proTotal  = 20 * seats;
    const floorCost = 100 * 5;
    const saving    = floorCost - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Claude Team Premium has a 5-seat minimum ($500/mo floor). For ${seats} users, individual Pro plans at $${proTotal}/mo deliver the same core capability.`
    );
  }

  // Max plan for non-research / non-power users
  // Max is for users who consistently hit Pro limits
  if (plan === 'max' && useCase !== 'research' && seats <= 3) {
    const proTotal = 20 * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Claude Max ($100/seat) is for very high-volume users who exhaust Pro limits daily. For ${useCase} workflows with ${seats} user(s), Pro at $20/seat handles the vast majority of usage, saving $${saving}/mo.`
    );
  }

  // Team paying monthly billing instead of annual
  // Annual saves 20% on Team Standard
  if (plan === 'team_standard' && monthlySpend > 20 * seats) {
    const annualRate = 20 * seats;
    const saving     = monthlySpend - annualRate;
    return makeResult(
      entry, 'optimize', saving,
      `You appear to be on monthly billing ($25/seat). Switching to annual billing reduces the rate to $20/seat, saving $${saving}/mo ($${saving * 12}/year) with no change in features.`
    );
  }

  return makeResult(entry, 'keep', 0,
    'Claude plan looks right-sized for your team and usage.'
  );
}

// CHATGPT RULES

function auditChatGPT(
  entry:    ToolEntry,
  teamSize: number,
  useCase:  string
): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  // Pro plan for non-power users → downgrade to Plus
  // ChatGPT Pro ($120) is for users needing unlimited o1 access
  if (plan === 'pro' && useCase !== 'research') {
    const plusTotal = 20 * seats;
    const saving    = monthlySpend - plusTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `ChatGPT Pro ($120/seat) is designed for researchers needing unlimited o1 and o1 Pro access. For ${useCase} workflows, Plus at $20/seat covers GPT-4o and standard limits, saving $${saving}/mo.`
    );
  }

  // Multiple Plus users → check if Team is cheaper
  // Team ($30/seat) adds shared workspaces and admin controls
  // Only worth it if team collaboration is actually needed
  if (plan === 'plus' && seats >= 5) {
    const teamTotal = 30 * seats;
    const plusTotal = monthlySpend;
    if (teamTotal > plusTotal) {
      return makeResult(
        entry, 'keep', 0,
        `${seats} users on ChatGPT Plus ($20/seat) is more cost-effective than Team ($30/seat). Only upgrade to Team if you need shared workspaces or admin controls.`
      );
    }
  }

  // Single user on Business → downgrade to Plus
  if (plan === 'business' && seats === 1) {
    const saving = monthlySpend - 20;
    return makeResult(
      entry, 'downgrade', saving,
      `ChatGPT Business ($21/seat) requires a minimum of 2 seats and is designed for teams. A solo user on Plus saves $${saving}/mo with equivalent AI access.`
    );
  }

  // Go plan for power users → suggest upgrading to Plus
  // Go is limited — power users will hit limits quickly
  if (plan === 'go' && (useCase === 'coding' || useCase === 'research')) {
    return makeResult(
      entry, 'optimize', 0,
      `ChatGPT Go ($5/seat) has strict usage limits that frequently block ${useCase} workflows. Plus at $20/seat removes these limits and includes GPT-4o — consider upgrading.`
    );
  }

  return makeResult(entry, 'keep', 0,
    'ChatGPT plan looks right-sized for your team and usage.'
  );
}


// GEMINI RULES

function auditGemini(
  entry:    ToolEntry,
  teamSize: number,
  useCase:  string
): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  // Ultra for non-research teams → downgrade to Pro
  // Ultra adds Gemini 3.1 Ultra access — overkill for most workflows
  if (plan === 'ultra' && useCase !== 'research') {
    const proTotal = 20 * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Google AI Ultra ($300/seat) provides access to Gemini Ultra models — primarily valuable for deep research tasks. For ${useCase} workflows, AI Pro at $20/seat delivers Gemini Pro with sufficient capability, saving $${saving}/mo.`
    );
  }

  // Multiple Pro seats → check if Claude Team is more cost-effective
  if (plan === 'pro' && seats >= 5 && useCase === 'writing') {
    return makeResult(
      entry, 'switch', 0,
      `For writing workflows with ${seats} users, Claude Team Standard ($20/seat, 5-seat min) offers stronger long-form writing capability at the same price point as Gemini AI Pro.`
    );
  }

  return makeResult(entry, 'keep', 0,
    'Gemini plan looks right-sized for your team and usage.'
  );
}

// WINDSURF RULES

function auditWindsurf(
  entry:    ToolEntry,
  teamSize: number
): ToolAuditResult {
  const { plan, seats, monthlySpend } = entry;

  // Teams for 1–2 users → downgrade to Pro
  // Teams adds admin controls and team management — not needed under 3 users
  if (plan === 'teams' && seats <= 2) {
    const proTotal = 15 * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Windsurf Teams ($35/seat) adds admin controls and centralised billing — unnecessary for ${seats} user(s). Pro at $15/seat is functionally identical for daily AI coding, saving $${saving}/mo.`
    );
  }

  return makeResult(entry, 'keep', 0,
    'Windsurf plan looks right-sized for your team.'
  );
}


// API SPEND RULES
// Applies to both Anthropic API and OpenAI API direct
// Usage-based spend — flag if it's high relative to team size

function auditAPISpend(
  entry:     ToolEntry,
  toolLabel: string
): ToolAuditResult {
  const { monthlySpend, seats } = entry;

  // High API spend per user — suggest reviewing model usage
  const spendPerUser = monthlySpend / Math.max(seats, 1);

  if (spendPerUser > 100) {
    return makeResult(
      entry, 'optimize', 0,
      `${toolLabel} spend is $${spendPerUser.toFixed(0)}/user/mo. Review model selection — switching high-volume calls from premium models to smaller models (e.g. Haiku, GPT-4o Mini) can cut API costs by 60–90% with minimal quality loss for most tasks.`
    );
  }

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


// HELPER — builds a consistent ToolAuditResult object

function makeResult(
  entry:             ToolEntry,
  action:            RecommendedAction,
  saving:            number,
  reason:            string
): ToolAuditResult {
  const toolDef = TOOLS[entry.tool];
  const planDef = toolDef?.plans[entry.plan];

  return {
    tool:              toolDef?.label    ?? entry.tool,
    plan:              planDef?.label    ?? entry.plan,
    seats:             entry.seats,
    currentSpend:      entry.monthlySpend,
    recommendedAction: action,
    potentialSaving:   Math.max(0, round(saving)),
    reason,
  };
}

// HELPER — rounds to 2 decimal places

function round(n: number): number {
  return Math.round(n * 100) / 100;
}