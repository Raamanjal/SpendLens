import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReauditDiff from '@/components/ReauditDiff';
import { runAudit } from '@/lib/auditEngine';
import { buildReauditDiff } from '@/lib/pricingSnapshot';
import { getServiceClient } from '@/lib/supabase';
import type { AuditInput, AuditResult, PricingSnapshot } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface StoredAudit {
  id: string;
  input: AuditInput;
  result: AuditResult;
  pricing_snapshot: PricingSnapshot | null;
  created_at: string;
}

async function getAudit(id: string): Promise<StoredAudit | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('audits')
    .select('id, input, result, pricing_snapshot, created_at')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as StoredAudit;
}

export default async function ReauditPage({ params }: PageProps) {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) notFound();

  const newResult = runAudit(audit.input);
  const diff = buildReauditDiff(
    audit.id,
    audit.input,
    audit.result,
    newResult,
    audit.pricing_snapshot
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-lg text-green-600 tracking-tight">
            SpendLens
          </span>
          <Link
            href={`/audit/${id}`}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Original audit
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-100">
            Live re-audit
          </span>
        </div>

        <ReauditDiff diff={diff} />
      </main>
    </div>
  );
}
