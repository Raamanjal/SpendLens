import { NextRequest, NextResponse } from 'next/server';
import { runAudit } from '@/lib/auditEngine';
import { buildReauditDiff } from '@/lib/pricingSnapshot';
import { sendPricingChangeEmail } from '@/lib/resend';
import { getServiceClient } from '@/lib/supabase';
import type {
  AuditInput,
  AuditResult,
  PricingSnapshot,
  ReauditDiff,
} from '@/types';

interface DetectChangesBody {
  dryRun?: boolean;
}

interface StoredAudit {
  id: string;
  input: AuditInput;
  result: AuditResult;
  user_email: string | null;
  pricing_snapshot: PricingSnapshot | null;
}

export async function POST(req: NextRequest) {
  const configuredSecret = process.env.DETECT_CHANGES_SECRET;
  if (configuredSecret) {
    const providedSecret = req.headers.get('x-detect-secret');
    if (providedSecret !== configuredSecret) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
  }

  let body: DetectChangesBody = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('audits')
    .select('id, input, result, user_email, pricing_snapshot')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('detect-changes audit fetch failed:', error.message);
    return NextResponse.json({ error: 'Could not load audits.' }, { status: 500 });
  }

  const affectedByEmail = new Map<string, ReauditDiff[]>();

  for (const audit of (data ?? []) as StoredAudit[]) {
    if (!audit.user_email || !audit.input || !audit.result) continue;

    const newResult = runAudit(audit.input);
    const diff = buildReauditDiff(
      audit.id,
      audit.input,
      audit.result,
      newResult,
      audit.pricing_snapshot
    );

    if (!diff.hasChanged) continue;

    const existing = affectedByEmail.get(audit.user_email) ?? [];
    existing.push(diff);
    affectedByEmail.set(audit.user_email, existing);
  }

  const affectedUsers = Array.from(affectedByEmail.entries());

  if (!body.dryRun) {
    await Promise.all(
      affectedUsers.map(([email, audits]) =>
        sendPricingChangeEmail({
          email,
          affectedAudits: audits.map(audit => ({
            auditId: audit.auditId,
            changes: audit.changes.map(formatPricingChange),
            oldMonthlySaving: audit.oldMonthlySaving,
            newMonthlySaving: audit.newMonthlySaving,
            monthlyDelta: audit.monthlyDelta,
          })),
        })
      )
    );
  }

  return NextResponse.json({
    ok: true,
    dryRun: !!body.dryRun,
    scannedAudits: data?.length ?? 0,
    affectedUsers: affectedUsers.length,
    affectedAudits: affectedUsers.reduce((sum, [, audits]) => sum + audits.length, 0),
  });
}

function formatPricingChange(change: ReauditDiff['changes'][number]): string {
  if (change.field === 'plan') {
    return `${change.tool} ${change.plan} was ${change.current}.`;
  }

  return `${change.tool} ${change.plan} ${change.field} changed from ${formatValue(change.previous)} to ${formatValue(change.current)}.`;
}

function formatValue(value: number | string | null): string {
  if (value === null) return 'not set';
  if (typeof value === 'number') return `$${value}`;
  return value;
}
