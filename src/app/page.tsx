// src/app/page.tsx
'use client';

import { useState }        from 'react';
import SpendForm           from '@/components/SpendForm';
import AuditResults        from '@/components/AuditResults';
import type { AuditResponse } from '@/types';

export default function HomePage() {
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);

  // ── Results view ─────────────────────────────────────
  if (auditData) {
    return (
      <main className="flex-grow flex flex-col relative w-full pb-16 bg-slate-50">
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                SpendLens
              </span>
            </div>
            <button
              onClick={() => setAuditData(null)}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full border border-slate-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              New Audit
            </button>
          </div>
        </nav>

        <div className="max-w-4xl w-full mx-auto px-6 py-12 animate-fade-in-up">
          <AuditResults
            auditId={auditData.auditId}
            result={auditData.result}
            summary={auditData.summary}
          />
        </div>
      </main>
    );
  }

  // ── Form view ─────────────────────────────────────────
  return (
    <main className="flex-grow flex flex-col relative w-full bg-slate-50">
      <nav className="px-6 py-8 w-full z-10 flex justify-center">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-3xl md:text-4xl tracking-tight text-slate-900 drop-shadow-sm">
            SpendLens
          </span>
        </div>
      </nav>

      <div className="flex-grow flex flex-col items-center justify-start px-6 pt-12 pb-16">
        <div className="max-w-3xl w-full mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-brand-50 px-4 py-1.5 rounded-full mb-8 border border-brand-200">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            <span className="text-sm font-medium text-brand-700">Free AI Spend Audit</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
            Stop burning cash on <br className="hidden md:block" />
            <span className="text-brand-600">
              redundant AI tools
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
            Enter your team's AI subscriptions and get an instant, personalized audit showing exactly where you're overspending and how to consolidate.
          </p>
        </div>

        <div className="max-w-2xl w-full mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-10">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  Your Stack
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Add every tool. The more complete, the better the audit.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg> No login</span>
                <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg> Instant</span>
              </div>
            </div>
            
            <SpendForm onResult={setAuditData} />
          </div>
        </div>
      </div>
    </main>
  );
}