'use client';

import { useState } from 'react';
import ToolAuditCard from './ToolAuditCard';
import LeadCapture from './LeadCapture';
import ShareButton from './ShareButton';
import type { AuditResult } from '@/types';

interface AuditResultsProps {
  auditId: string;
  result: AuditResult;
  summary: string;
}

export default function AuditResults({
  auditId,
  result,
  summary,
}: AuditResultsProps) {
  const [leadCaptured, setLeadCaptured] = useState<boolean>(false);

  const heroColor =
    result.totalMonthlySaving > 100
      ? 'text-green-600'
      : result.totalMonthlySaving > 0
      ? 'text-yellow-600'
      : 'text-blue-600';

  return (
    <div className="space-y-8">

      <div className="text-center py-12 bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Potential Monthly Savings
        </p>
        <p className={`text-7xl font-bold tabular-nums ${heroColor}`}>
          {'$'}{result.totalMonthlySaving.toLocaleString()}
        </p>
        <p className="text-gray-400 text-base mt-2">
          {'$'}{result.totalAnnualSaving.toLocaleString()}{' per year'}
        </p>
        {result.isAlreadyOptimal && (
          <span className="inline-block mt-5 bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-full">
            You are already spending well.
          </span>
        )}
      </div>

      {summary && (
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-5">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">
            AI Analysis
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">
            {summary}
          </p>
        </div>
      )}

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

      {result.isHighSavings && (
        <div className="bg-gray-900 text-white rounded-2xl p-8">
          <p className="text-2xl font-bold mb-2 leading-tight">
            {'You are leaving $'}{result.totalAnnualSaving.toLocaleString()}{' per year on the table.'}
          </p>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Credex sources discounted AI credits from companies that over-forecast.
            Our team can help you capture even more savings beyond this audit.
          </p>
          
          {/* <div> */}
            <a
            href="https://credex.rocks/consult"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
            Book a Free Credex Consultation
          </a>
        </div>
      )}

      <div className="border-t border-gray-100 pt-6 space-y-4">
        {leadCaptured === false ? (
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
              Report sent to your email.
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