
import { runAudit } from '@/lib/auditEngine';
import type { AuditInput } from '@/types';

// ── Helper to build a minimal valid AuditInput ────────────
function makeInput(overrides: Partial<AuditInput> = {}): AuditInput {
  return {
    tools:    [],
    teamSize: 5,
    useCase:  'coding',
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────
// CORE ENGINE TESTS
// ─────────────────────────────────────────────────────────

describe('runAudit — core behaviour', () => {

  it('returns zero savings for empty tools array', () => {
    const result = runAudit(makeInput({ tools: [] }));
    expect(result.totalMonthlySaving).toBe(0);
    expect(result.totalAnnualSaving).toBe(0);
    expect(result.perTool).toHaveLength(0);
  });

  it('totalAnnualSaving equals totalMonthlySaving × 12', () => {
    const result = runAudit(makeInput({
      tools: [{
        tool: 'claude', plan: 'team_standard',
        monthlySpend: 150, seats: 3,
      }],
    }));
    expect(result.totalAnnualSaving).toBe(result.totalMonthlySaving * 12);
  });

  it('potentialSaving is never negative', () => {
    const result = runAudit(makeInput({
      tools: [
        { tool: 'cursor',         plan: 'pro',      monthlySpend: 20,  seats: 1 },
        { tool: 'github_copilot', plan: 'pro',      monthlySpend: 10,  seats: 1 },
        { tool: 'claude',         plan: 'pro',      monthlySpend: 20,  seats: 1 },
      ],
    }));
    result.perTool.forEach(t => {
      expect(t.potentialSaving).toBeGreaterThanOrEqual(0);
    });
  });

  it('isHighSavings is true when saving exceeds $500/mo', () => {
    const result = runAudit(makeInput({
      tools: [{
        tool: 'claude', plan: 'team_premium',
        monthlySpend: 500, seats: 1,
      }],
    }));
    expect(result.isHighSavings).toBe(true);
  });

  it('isAlreadyOptimal is true when saving is under $10/mo', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'cursor', plan: 'pro', monthlySpend: 20, seats: 1 }],
    }));
    expect(result.isAlreadyOptimal).toBe(true);
  });

  it('filters out incomplete tool entries', () => {
    const result = runAudit(makeInput({
      tools: [
        { tool: '',       plan: '',    monthlySpend: 0,  seats: 1 },
        { tool: 'cursor', plan: 'pro', monthlySpend: 20, seats: 1 },
      ],
    }));
    expect(result.perTool).toHaveLength(1);
  });

  it('handles multiple tools and sums savings correctly', () => {
    const result = runAudit(makeInput({
      tools: [
        { tool: 'cursor', plan: 'business', monthlySpend: 80,  seats: 2 },
        { tool: 'claude', plan: 'team_standard', monthlySpend: 150, seats: 3 },
      ],
    }));
    const expectedSaving = result.perTool.reduce(
      (sum, t) => sum + t.potentialSaving, 0
    );
    expect(result.totalMonthlySaving).toBe(
      Math.round(expectedSaving * 100) / 100
    );
  });

});

// ─────────────────────────────────────────────────────────
// CURSOR TESTS
// ─────────────────────────────────────────────────────────

describe('auditCursor', () => {

  it('flags Business plan for 1 user as downgrade', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'cursor', plan: 'business', monthlySpend: 40, seats: 1 }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('downgrade');
    expect(result.perTool[0].potentialSaving).toBe(20);
  });

  it('flags Business plan for 2 users as downgrade', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'cursor', plan: 'business', monthlySpend: 80, seats: 2 }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('downgrade');
    expect(result.perTool[0].potentialSaving).toBe(40);
  });

  it('marks Pro for solo dev as keep', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'cursor', plan: 'pro', monthlySpend: 20, seats: 1 }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('keep');
    expect(result.perTool[0].potentialSaving).toBe(0);
  });

});

// ─────────────────────────────────────────────────────────
// CLAUDE TESTS
// ─────────────────────────────────────────────────────────

describe('auditClaude', () => {

  it('flags Team Standard for 3 users as downgrade', () => {
    const result = runAudit(makeInput({
      tools: [{
        tool: 'claude', plan: 'team_standard',
        monthlySpend: 150, seats: 3,
      }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('downgrade');
    expect(result.perTool[0].potentialSaving).toBeGreaterThan(0);
  });

  it('flags Team Premium for 2 users as downgrade', () => {
    const result = runAudit(makeInput({
      tools: [{
        tool: 'claude', plan: 'team_premium',
        monthlySpend: 500, seats: 2,
      }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('downgrade');
  });

  it('flags Max plan for non-research solo user as downgrade', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'claude', plan: 'max', monthlySpend: 100, seats: 1 }],
      useCase: 'writing',
    }));
    expect(result.perTool[0].recommendedAction).toBe('downgrade');
    expect(result.perTool[0].potentialSaving).toBe(80);
  });

  it('keeps Max plan for research use case', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'claude', plan: 'max', monthlySpend: 100, seats: 1 }],
      useCase: 'research',
    }));
    expect(result.perTool[0].recommendedAction).toBe('keep');
  });

  it('keeps Pro plan as optimal', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('keep');
  });

});

// ─────────────────────────────────────────────────────────
// GITHUB COPILOT TESTS
// ─────────────────────────────────────────────────────────

describe('auditGithubCopilot', () => {

  it('flags Enterprise for small team as downgrade', () => {
    const result = runAudit(makeInput({
      tools: [{
        tool: 'github_copilot', plan: 'enterprise',
        monthlySpend: 195, seats: 5,
      }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('downgrade');
    expect(result.perTool[0].potentialSaving).toBe(100);
  });

  it('flags Pro+ for writing use case as downgrade', () => {
    const result = runAudit(makeInput({
      tools: [{
        tool: 'github_copilot', plan: 'pro_plus',
        monthlySpend: 39, seats: 1,
      }],
      useCase: 'writing',
    }));
    expect(result.perTool[0].recommendedAction).toBe('downgrade');
  });

  it('keeps Business plan for coding team of 3+', () => {
    const result = runAudit(makeInput({
      tools: [{
        tool: 'github_copilot', plan: 'business',
        monthlySpend: 57, seats: 3,
      }],
      useCase: 'coding',
    }));
    expect(result.perTool[0].recommendedAction).toBe('keep');
  });

});

// ─────────────────────────────────────────────────────────
// CHATGPT TESTS
// ─────────────────────────────────────────────────────────

describe('auditChatGPT', () => {

  it('flags Pro plan for non-research user as downgrade', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'chatgpt', plan: 'pro', monthlySpend: 120, seats: 1 }],
      useCase: 'writing',
    }));
    expect(result.perTool[0].recommendedAction).toBe('downgrade');
    expect(result.perTool[0].potentialSaving).toBe(100);
  });

  it('keeps Pro plan for research use case', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'chatgpt', plan: 'pro', monthlySpend: 120, seats: 1 }],
      useCase: 'research',
    }));
    expect(result.perTool[0].recommendedAction).toBe('keep');
  });

  it('flags single user on Business as downgrade', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'chatgpt', plan: 'business', monthlySpend: 21, seats: 1 }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('downgrade');
    expect(result.perTool[0].potentialSaving).toBe(1);
  });

});

// ─────────────────────────────────────────────────────────
// GEMINI TESTS
// ─────────────────────────────────────────────────────────

describe('auditGemini', () => {

  it('flags Ultra for non-research user as downgrade', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'gemini', plan: 'ultra', monthlySpend: 300, seats: 1 }],
      useCase: 'coding',
    }));
    expect(result.perTool[0].recommendedAction).toBe('downgrade');
    expect(result.perTool[0].potentialSaving).toBe(280);
  });

  it('keeps Ultra for research use case', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'gemini', plan: 'ultra', monthlySpend: 300, seats: 1 }],
      useCase: 'research',
    }));
    expect(result.perTool[0].recommendedAction).toBe('keep');
  });

});

// ─────────────────────────────────────────────────────────
// WINDSURF TESTS
// ─────────────────────────────────────────────────────────

describe('auditWindsurf', () => {

  it('flags Teams for 1 user as downgrade', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'windsurf', plan: 'teams', monthlySpend: 35, seats: 1 }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('downgrade');
    expect(result.perTool[0].potentialSaving).toBe(20);
  });

  it('flags Teams for 2 users as downgrade', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'windsurf', plan: 'teams', monthlySpend: 70, seats: 2 }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('downgrade');
    expect(result.perTool[0].potentialSaving).toBe(40);
  });

  it('keeps Pro plan as optimal', () => {
    const result = runAudit(makeInput({
      tools: [{ tool: 'windsurf', plan: 'pro', monthlySpend: 15, seats: 1 }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('keep');
  });

});

// ─────────────────────────────────────────────────────────
// API SPEND TESTS
// ─────────────────────────────────────────────────────────

describe('auditAPISpend', () => {

  it('flags high Anthropic API spend per user', () => {
    const result = runAudit(makeInput({
      tools: [{
        tool: 'anthropic_api', plan: 'payg',
        monthlySpend: 500, seats: 2,
      }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('optimize');
  });

  it('flags high OpenAI API total spend', () => {
    const result = runAudit(makeInput({
      tools: [{
        tool: 'openai_api', plan: 'payg',
        monthlySpend: 600, seats: 1,
      }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('optimize');
  });

  it('keeps low API spend as optimal', () => {
    const result = runAudit(makeInput({
      tools: [{
        tool: 'anthropic_api', plan: 'payg',
        monthlySpend: 50, seats: 3,
      }],
    }));
    expect(result.perTool[0].recommendedAction).toBe('keep');
  });

});