
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
    const proTotal = 20 * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Cursor Business ($40/seat) adds SSO and admin controls — unnecessary for ${seats} user(s). Pro at $20/seat covers identical AI features, saving $${saving}/mo.`
    );
  }
    // Pro+ for non-power users → downgrade to Pro
  // Pro+ is for users hitting Pro limits daily
  if (plan === 'pro_plus' && useCase !== 'coding') {
    const proTotal = 20 * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `Cursor Pro+ ($60/seat) is for engineers hitting Pro usage limits daily. For non-coding workflows, Pro at $20/seat is sufficient.`
    );
  }

  // Business when team is small and no SSO needed
  if (plan === 'business' && seats >= 3 && seats <= 5 && teamSize <= 10) {
    const proTotal = 20 * seats;
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
    const proTotal = 10 * seats;
    const saving   = monthlySpend - proTotal;
    return makeResult(
      entry, 'downgrade', saving,
      `GitHub Copilot Pro+ ($39/seat) is optimised for heavy coding workflows. For ${useCase} use cases, Pro at $10/seat provides the core completion features needed.`
    );
  }

  // Enterprise for small team → downgrade to Business
  // Enterprise adds Copilot Chat on GitHub.com and custom org data
  if (plan === 'enterprise' && seats < 10) {
    const businessTotal = 19 * seats;
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

