import { runAudit } from '@/lib/auditEngine';
import {
  buildPricingSnapshot,
  buildReauditDiff,
  findPricingChangesForInput,
} from '@/lib/pricingSnapshot';
import type { AuditInput, PricingSnapshot } from '@/types';

function makeInput(): AuditInput {
  return {
    tools: [
      { tool: 'cursor', plan: 'business', monthlySpend: 80, seats: 2 },
    ],
    teamSize: 2,
    useCase: 'coding',
  };
}

describe('pricing snapshot helpers', () => {
  it('creates a frozen pricing snapshot with current tools', () => {
    const snapshot = buildPricingSnapshot(new Date('2026-05-20T00:00:00.000Z'));

    expect(snapshot.version).toBe(1);
    expect(snapshot.capturedAt).toBe('2026-05-20T00:00:00.000Z');
    expect(snapshot.tools.cursor.plans.business.monthly).toBe(40);
  });

  it('detects a price change for a tool plan used by an audit', () => {
    const oldSnapshot = buildPricingSnapshot() as PricingSnapshot;
    oldSnapshot.tools.cursor.plans.business.monthly = 30;

    const changes = findPricingChangesForInput(makeInput(), oldSnapshot);

    expect(changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          toolKey: 'cursor',
          planKey: 'business',
          field: 'monthly',
          previous: 30,
          current: 40,
        }),
      ])
    );
  });

  it('ignores pricing changes for plans not used by the audit', () => {
    const oldSnapshot = buildPricingSnapshot() as PricingSnapshot;
    oldSnapshot.tools.claude.plans.max.monthly = 10;

    const changes = findPricingChangesForInput(makeInput(), oldSnapshot);

    expect(changes).toHaveLength(0);
  });

  it('builds a before and after diff from stored and current results', () => {
    const input = makeInput();
    const oldSnapshot = buildPricingSnapshot() as PricingSnapshot;
    oldSnapshot.tools.cursor.plans.business.monthly = 30;

    const oldResult = runAudit(input);
    const newResult = runAudit(input);
    const diff = buildReauditDiff('audit_123', input, oldResult, newResult, oldSnapshot);

    expect(diff.auditId).toBe('audit_123');
    expect(diff.hasChanged).toBe(true);
    expect(diff.changes[0].tool).toBe('Cursor');
    expect(diff.toolDiffs[0].tool).toBe('Cursor');
  });
});
