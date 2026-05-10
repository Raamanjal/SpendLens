// Displays the full results of the audit
// Contains: high-level summary, AI analysis block, and tool-by-tool cards
'use client';

import { useState }      from 'react';
import type { AuditResult } from '@/types';
import ToolAuditCard     from './ToolAuditCard';
import LeadCapture       from './LeadCapture';
import ShareButton       from './ShareButton';

interface AuditResultsProps {
  auditId: string;
  result:  AuditResult;
  summary: string;
}

export default function AuditResults({
  auditId,
  result,
  summary,
}: AuditResultsProps) {
  
  const [captured, setCaptured] = useState(false);

  const hasSavings  = result.totalMonthlySaving > 0;
  const highSavings = result.totalMonthlySaving > 100;
  const isOptimal   = !hasSavings;

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* ── 1. Hero Savings Dashboard ──────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center p-10 relative">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
          Potential Monthly Savings
        </h2>
        
        {hasSavings ? (
          <div className="mb-2">
            <span className="text-6xl md:text-8xl font-extrabold text-slate-900 tracking-tighter">
              ${result.totalMonthlySaving.toLocaleString()}
            </span>
          </div>
        ) : (
          <div className="mb-2">
            <span className="text-5xl md:text-6xl font-extrabold text-brand-600 tracking-tighter">
              Optimal Setup
            </span>
          </div>
        )}

        {hasSavings && (
          <div className="inline-block bg-green-50 text-green-700 font-semibold px-4 py-1.5 rounded-full border border-green-200 text-sm mt-4">
            ${(result.totalMonthlySaving * 12).toLocaleString()} per year
          </div>
        )}
      </div>

      {/* ── 2. AI Analysis Summary ─────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative overflow-hidden">
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-wider uppercase mb-2">
              AI Analysis
            </h3>
            <p className="text-slate-700 leading-relaxed text-sm md:text-base">
              {summary}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Per-Tool Breakdown ──────────────────────────── */}
      <div className="relative">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-200 flex-grow"></div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            Per-Tool Breakdown
          </h3>
          <div className="h-px bg-slate-200 flex-grow"></div>
        </div>

        <div className="space-y-4 relative z-10">
          {result.perTool.map((tool, idx) => (
            <ToolAuditCard key={idx} tool={tool} />
          ))}
        </div>
      </div>

      {/* ── 4. Lead Capture / Upsell / Share ───────────────── */}
      <div className="mt-12">
        {!captured ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <LeadCapture
              auditId={auditId}
              monthlySaving={result.totalMonthlySaving}
              isHighSavings={highSavings}
              isOptimal={isOptimal}
              onCapture={() => setCaptured(true)}
            />
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 text-center shadow-sm animate-fade-in-up">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Report Sent!
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Check your inbox for the full breakdown. In the meantime, share this audit with your team.
            </p>
            
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-4 text-left shadow-sm">
              <ShareButton auditId={auditId} saving={result.totalMonthlySaving} />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}