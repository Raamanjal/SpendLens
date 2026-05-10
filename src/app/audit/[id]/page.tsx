// src/app/audit/[id]/page.tsx
// Public shareable URL for each audit
// Day 5: fetch real data from Supabase and render full AuditResults

import type { Metadata } from 'next';
import Link              from 'next/link';

// Next.js 15: params is a Promise — must be awaited
interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── 1. Dynamic OG metadata ──────────────────────────────
// Runs on the server before the page renders
// Day 5: fetch real saving amount from Supabase to put in title
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { id } = await params;

  return {
    title:       'AI Spend Audit — SpendLens',
    description: 'See where your team is overspending on AI tools.',
    openGraph: {
      title:       'AI Spend Audit — SpendLens',
      description: 'Free AI spend audit. Find out how much you could save.',
      url:         `${process.env.NEXT_PUBLIC_BASE_URL}/audit/${id}`,
      images:      [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

// ─── 2. Page component ───────────────────────────────────
export default async function AuditPage({ params }: PageProps) {
  const { id } = await params;

  // Day 5 TODO: fetch audit by id from Supabase
  // const audit = await getAuditById(id);
  // if (!audit) notFound();
  // Then render: <AuditResults result={audit.result} ... />

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <span className="font-bold text-xl text-green-600">
            SpendLens
          </span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-xs font-semibold text-gray-400
                      uppercase tracking-widest mb-4">
          Audit ID: {id}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Shared Audit Report
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Full shareable results will be wired up on Day 5
          when Supabase is connected.
        </p>
        <Link
          href="/"
          className="inline-block bg-green-600 hover:bg-green-700
                     text-white font-semibold px-6 py-3 rounded-lg
                     transition-colors"
        >
          Run Your Own Audit →
        </Link>
      </div>

    </main>
  );
}