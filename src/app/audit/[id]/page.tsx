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
    <main className="flex-grow flex flex-col relative w-full bg-slate-50 min-h-screen">

      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
              SpendLens
            </span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl w-full mx-auto px-6 py-20 md:py-32 flex-grow flex flex-col items-center justify-center text-center animate-fade-in-up">
        <div className="bg-white rounded-3xl p-1 shadow-xl border border-slate-200 relative w-full">
          <div className="relative bg-white rounded-[23px] p-8 md:p-16">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100 mx-auto mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Audit ID: {id}
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Shared Audit Report
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto">
              Full shareable results will be wired up on Day 5 when Supabase is connected.
            </p>
            <Link
              href="/"
              className="group relative inline-flex items-center justify-center bg-slate-900 text-white font-bold px-8 py-4 rounded-xl transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
              Run Your Own Free Audit
              <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </div>

    </main>
  );
}