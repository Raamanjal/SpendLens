import { TOOLS } from '@/lib/pricingData';
import type {
  AuditInput,
  AuditResult,
  PricingChange,
  PricingSnapshot,
  ReauditDiff,
  ToolDiff,
  ToolEntry,
} from '@/types';

export function buildPricingSnapshot(date = new Date()): PricingSnapshot {
  return {
    version: 1,
    capturedAt: date.toISOString(),
    tools: JSON.parse(JSON.stringify(TOOLS)),
  };
}

export function findPricingChangesForInput(
  input: AuditInput,
  previousSnapshot: PricingSnapshot | null | undefined,
  currentSnapshot = buildPricingSnapshot()
): PricingChange[] {
  if (!previousSnapshot?.tools) return [];

  const uniqueToolPlans = new Map<string, ToolEntry>();
  input.tools
    .filter(entry => entry.tool && entry.plan)
    .forEach(entry => uniqueToolPlans.set(`${entry.tool}:${entry.plan}`, entry));

  const changes: PricingChange[] = [];

  uniqueToolPlans.forEach(entry => {
    const toolKey = entry.tool;
    const planKey = entry.plan;
    if (!toolKey || !planKey) return;

    const oldTool = previousSnapshot.tools[toolKey];
    const newTool = currentSnapshot.tools[toolKey];
    const oldPlan = oldTool?.plans[planKey];
    const newPlan = newTool?.plans[planKey];

    if (!oldPlan && newPlan) {
      changes.push({
        toolKey,
        tool: newTool.label,
        planKey,
        plan: newPlan.label,
        field: 'plan',
        previous: 'missing',
        current: 'available',
      });
      return;
    }

    if (oldPlan && !newPlan) {
      changes.push({
        toolKey,
        tool: oldTool.label,
        planKey,
        plan: oldPlan.label,
        field: 'plan',
        previous: 'available',
        current: 'removed',
      });
      return;
    }

    if (!oldPlan || !newPlan) return;

    const tool = newTool?.label ?? oldTool?.label ?? toolKey;
    const plan = newPlan.label ?? oldPlan.label ?? planKey;

    (['monthly', 'annualMonthly', 'minSeats'] as const).forEach(field => {
      const previous = oldPlan[field] ?? null;
      const current = newPlan[field] ?? null;
      if (previous !== current) {
        changes.push({
          toolKey,
          tool,
          planKey,
          plan,
          field,
          previous,
          current,
        });
      }
    });
  });

  return changes;
}

export function buildReauditDiff(
  auditId: string,
  input: AuditInput,
  oldResult: AuditResult,
  newResult: AuditResult,
  previousSnapshot?: PricingSnapshot | null
): ReauditDiff {
  const changes = findPricingChangesForInput(input, previousSnapshot);
  const toolDiffs = buildToolDiffs(oldResult, newResult);
  const monthlyDelta = round(newResult.totalMonthlySaving - oldResult.totalMonthlySaving);
  const annualDelta = round(newResult.totalAnnualSaving - oldResult.totalAnnualSaving);

  return {
    auditId,
    changes,
    toolDiffs,
    oldMonthlySaving: oldResult.totalMonthlySaving,
    newMonthlySaving: newResult.totalMonthlySaving,
    monthlyDelta,
    oldAnnualSaving: oldResult.totalAnnualSaving,
    newAnnualSaving: newResult.totalAnnualSaving,
    annualDelta,
    hasChanged: changes.length > 0 || toolDiffs.some(diff => diff.changed),
  };
}

function buildToolDiffs(
  oldResult: AuditResult,
  newResult: AuditResult
): ToolDiff[] {
  const maxLength = Math.max(oldResult.perTool.length, newResult.perTool.length);
  const diffs: ToolDiff[] = [];

  for (let i = 0; i < maxLength; i += 1) {
    const oldTool = oldResult.perTool[i];
    const newTool = newResult.perTool[i];
    if (!oldTool && !newTool) continue;

    const oldAction = oldTool?.recommendedAction ?? newTool!.recommendedAction;
    const newAction = newTool?.recommendedAction ?? oldTool!.recommendedAction;
    const oldRecommendation = oldTool?.recommendedPlan;
    const newRecommendation = newTool?.recommendedPlan;
    const oldSaving = oldTool?.potentialSaving ?? 0;
    const newSaving = newTool?.potentialSaving ?? 0;
    const oldReason = oldTool?.reason ?? '';
    const newReason = newTool?.reason ?? '';

    diffs.push({
      tool: newTool?.tool ?? oldTool!.tool,
      plan: newTool?.plan ?? oldTool!.plan,
      currentSpend: newTool?.currentSpend ?? oldTool!.currentSpend,
      oldAction,
      newAction,
      oldRecommendation,
      newRecommendation,
      oldSaving,
      newSaving,
      oldReason,
      newReason,
      changed:
        oldAction !== newAction ||
        oldRecommendation !== newRecommendation ||
        oldSaving !== newSaving ||
        oldReason !== newReason,
    });
  }

  return diffs;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
