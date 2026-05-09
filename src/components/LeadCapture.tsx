
'use client';

import { useState } from 'react';

interface LeadCaptureProps {
  auditId:       string;
  monthlySaving: number;
  isHighSavings: boolean;
  isOptimal:     boolean;
  onCapture:     () => void;  // called when email is successfully submitted
}

export default function LeadCapture({
  auditId,
  monthlySaving,
  isHighSavings,
  isOptimal,
  onCapture,
}: LeadCaptureProps) {

  const [email,   setEmail]   = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // ─── 1. Dynamic headline ─────────────────────────────────
  // Changes based on whether savings were found
  const headline = isOptimal
    ? 'Get notified when new optimisations apply to your stack'
    : `Get your full report${
        monthlySaving > 0
          ? ` — $${monthlySaving.toLocaleString()}/mo in savings identified`
          : ''
      }`;

  // ─── 2. Submit handler ───────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side validation before API call
    if (!email) {
      setError('Email is required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/lead', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          auditId,
          email,
          company:       company || undefined,
          monthlySaving,
          website:       '', // honeypot always empty
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.');

      // Tell parent to switch to share view
      onCapture();

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">

      <h3 className="font-semibold text-gray-900 mb-1">
        {headline}
      </h3>

      <p className="text-sm text-gray-500 mb-5">
        {isHighSavings
          ? 'Enter your email and our team will reach out to help you capture these savings.'
          : 'Enter your email to receive your full audit report.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Honeypot — invisible to users */}
        <input
          name="website"
          type="text"
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
          readOnly
        />

        {/* Email — required */}
        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg
                     px-4 py-2.5 text-sm focus:outline-none
                     focus:ring-2 focus:ring-green-500"
        />

        {/* Company — optional */}
        <input
          type="text"
          placeholder="Company name (optional)"
          value={company}
          onChange={e => setCompany(e.target.value)}
          className="w-full border border-gray-300 rounded-lg
                     px-4 py-2.5 text-sm focus:outline-none
                     focus:ring-2 focus:ring-green-500"
        />

        {/* Error message */}
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        {/* Submit — label changes based on savings level */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700
                     text-white font-semibold py-2.5 px-6
                     rounded-lg transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Sending...'
            : isHighSavings
            ? 'Get Report + Book Free Call →'
            : 'Get Full Report →'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          No spam. Unsubscribe anytime.
        </p>

      </form>
    </div>
  );
}