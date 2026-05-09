// src/components/AuditResults.tsx
'use client';

import { useState }     from 'react';
import ToolAuditCard    from './ToolAuditCard';
import LeadCapture      from './LeadCapture';
import ShareButton      from './ShareButton';
import type { AuditResult } from '@/types';

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

  // ─── 1. Track whether email has been captured ────────────
  // Once captured → hide the lead form, show share button
  const [leadCaptured, setLeadCaptured] = useState(false);

  // ─── 2. Pick hero number colour ─────────────────────────
  // Green = significant saving, Yellow = some saving, Blue = optimal
  const heroColor =
    result.totalMonthlySaving > 100 ? 'text-green-600'  :
    result.totalMonthlySaving > 0   ? 'text-yellow-600' :
                                      'text-blue-600';

  return (
    <div className="space-y-8">

      {/* ── Section 1: Hero savings number ────────────── */}
      {/* This is what gets screenshotted and shared */}
      <div className="text-center py-12 bg-gradient-to-br
                      from-green-50 to-emerald-50 rounded-2xl
                      border border-green-100">

        <p className="text-xs font-semibold text-gray-400
                      uppercase tracking-widest mb-3">
          Potential Monthly Savings
        </p>

        {/* Big number — the main headline of the page */}
        <p className={`text-7xl font-bold ${heroColor} tabular-nums`}>
          ${result.totalMonthlySaving.toLocaleString()}
        </p>

        {/* Annual equivalent below */}
        <p className="text-gray-400 text-base mt-2">
          ${result.totalAnnualSaving.toLocaleString()} per year
        </p>

        {/* Shown only when savings are below $10 */}
        {result.isAlreadyOptimal && (
          <span className="inline-block mt-5 bg-green-100
                           text-green-800 text-sm font-medium
                           px-4 py-2 rounded-full">
            ✓ You&apos;re already spending well.
          </span>
        )}

      </div>

      {/* ── Section 2: AI summary paragraph ──────────── */}
      {/* Only rendered if summary string is not empty */}
      {summary && (
        <div className="bg-blue-50 border-l-4 border-blue-400
                        rounded-r-xl p-5">
          <p className="text-xs font-semibold text-blue-500
                        uppercase tracking-wide mb-2">
            AI Analysis
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* ── Section 3: Per-tool breakdown ────────────── */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Per-Tool Breakdown
        </h2>
        <div className="space-y-3">
          {result.perTool.map((tool, i) => (
            <ToolAuditCard key={i} tool={tool} />
          ))}
        </div>
      </div>

      {/* ── Section 4: Credex CTA ─────────────────────── */}
      {/* Only shown when total saving > $500/mo */}
      {result.isHighSavings && (
        <div className="bg-gray-900 text-white rounded-2xl p-8">
          <p className="text-2xl font-bold mb-2 leading-tight">
            You&apos;re leaving $
            {result.totalAnnualSaving.toLocaleString()}
            /year on the table.
          </p>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Credex sources discounted AI credits — Cursor, Claude,
            ChatGPT Enterprise — from companies that over-forecast.
            Our team can help you capture even more savings beyond
            this audit.
          </p>
          
            href="https://credex.rocks/consult"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 hover:bg-green-400
                       text-white font-semibold px-6 py-3 rounded-lg
                       transition-colors"
          >
            Book a Free Credex Consultation →
          </a>
        </div>
      )}

      {/* ── Section 5: Lead capture → Share ──────────── */}
      {/* Before email: show LeadCapture form */}
      {/* After email: show success + ShareButton */}
      <div className="border-t border-gray-100 pt-6 space-y-4">
        {!leadCaptured ? (
          <LeadCapture
            auditId={auditId}
            monthlySaving={result.totalMonthlySaving}
            isHighSavings={result.isHighSavings}
            isOptimal={result.isAlreadyOptimal}
            onCapture={() => setLeadCaptured(true)}
          />
        ) : (
          <div className="space-y-4">
            <p className="text-green-600 text-sm font-medium">
              ✓ Report sent to your email.
            </p>
            <ShareButton
              auditId={auditId}
              saving={result.totalMonthlySaving}
            />
          </div>
        )}
      </div>

    </div>
  );
}