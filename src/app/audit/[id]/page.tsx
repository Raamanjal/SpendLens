// src/app/audit/[id]/page.tsx
// Now fetches real audit data from Supabase
// Strips PII — only shows tools and savings publicly

import type { Metadata }   from 'next';
import { notFound }        from 'next/navigation';
import { getServiceClient} from '@/lib/supabase';
import AuditResults        from '@/components/AuditResults';
import Link                from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

// ── Fetch audit from Supabase ─────────────────────────────
async function getAudit(id: string) {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('audits')
    // Select result and summary only — input has teamSize/useCase
    // but never exposes email or company (those are in leads table)
    .select('id, result, summary, created_at')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

// ── Dynamic OG metadata ───────────────────────────────────
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { id }  = await params;
  const audit   = await getAudit(id);

  if (!audit) {
    return { title: 'Audit not found — SpendLens' };
  }

  const saving = audit.result?.totalMonthlySaving ?? 0;
  const annual = audit.result?.totalAnnualSaving  ?? 0;

  return {
    title:       `AI Spend Audit — Save $${saving.toLocaleString()}/mo`,
    description: `This audit found $${saving.toLocaleString()}/mo ($${annual.toLocaleString()}/year) in potential AI tool savings.`,
    openGraph: {
      title:       `I found $${saving.toLocaleString()}/mo in AI overspend`,
      description: `Annual savings potential: $${annual.toLocaleString()}. Run your free audit.`,
      url:         `${process.env.NEXT_PUBLIC_BASE_URL}/audit/${id}`,
      images:      [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       `I found $${saving.toLocaleString()}/mo in AI overspend`,
      description: 'Free AI spend audit — run yours in 2 minutes.',
    },
  };
}

// ── Page component ────────────────────────────────────────
export default async function AuditPage({ params }: PageProps) {
  const { id } = await params;
  const audit  = await getAudit(id);

  // 404 if audit not found
  if (!audit) notFound();

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center
                        justify-between">
          <span className="font-bold text-lg text-green-600 tracking-tight">
            SpendLens
          </span>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600
                       transition-colors"
          >
            Run your own audit
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">

        {/* Shared badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 bg-gray-100
                           text-gray-500 text-xs font-medium px-3 py-1.5
                           rounded-full">
            Shared audit
          </span>
        </div>

        {/* Full results — same component as the main page */}
        <AuditResults
          auditId={audit.id}
          result={audit.result}
          summary={audit.summary ?? ''}
        />

      </main>

    </div>
  );
}