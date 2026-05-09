// src/app/page.tsx
// Landing page — shows SpendForm, switches to AuditResults after submission
'use client';

import { useState }     from 'react';
import SpendForm        from '@/components/SpendForm';
import AuditResults     from '@/components/AuditResults';
import type { AuditResponse } from '@/types';

export default function HomePage() {
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);

  // ── Results view ────────────────────────────────────────
  if (auditData) {
    return (
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="font-bold text-xl text-green-600">SpendLens</span>
            <button
              onClick={() => setAuditData(null)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Run new audit
            </button>
          </div>
        </nav>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <AuditResults
            auditId={auditData.auditId}
            result={auditData.result}
            summary={auditData.summary}
          />
        </div>
      </main>
    );
  }

  // ── Form view ───────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <span className="font-bold text-xl text-green-600">SpendLens</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-white border-b border-gray-200 px-6 py-14">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-green-50 text-green-700 text-xs
                           font-semibold px-3 py-1 rounded-full mb-4 uppercase
                           tracking-wide">
            Free AI Spend Audit
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Are you overpaying<br />for AI tools?
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Enter your AI subscriptions and get an instant audit showing
            exactly where you&apos;re overspending and how much you could save.
          </p>
          <div className="flex items-center justify-center gap-8 mt-8
                          text-sm text-gray-400">
            <span>✓ Free forever</span>
            <span>✓ No login required</span>
            <span>✓ Results in seconds</span>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-200
                        shadow-sm p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            What AI tools does your team pay for?
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Add every tool your team uses. The more complete, the better the audit.
          </p>
          <SpendForm onResult={setAuditData} />
        </div>
      </div>

    </main>
  );
}