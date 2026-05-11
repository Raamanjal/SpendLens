
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
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg>
        </div>
        <h3 className="font-semibold text-slate-900">
          {headline}
        </h3>
      </div>

      <p className="text-sm text-slate-500 mb-6 max-w-xl">
        {isHighSavings
          ? 'Enter your email and our team will reach out to help you capture these savings.'
          : 'Enter your email to receive your full audit report and personalized recommendations.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">

        {/* Honeypot — invisible to users */}
        <input
          name="website"
          type="text"
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
          readOnly
        />

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Email — required */}
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="flex-1 bg-white border border-slate-200 rounded-xl
                       px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none
                       focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
          />

          {/* Company — optional */}
          <input
            type="text"
            placeholder="Company (optional)"
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="flex-1 sm:max-w-[200px] bg-white border border-slate-200 rounded-xl
                       px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none
                       focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
          />
        </div>

        {/*Error */}
{error && (
  <p role="alert" aria-live="polite" className="text-red-500 text-xs">
    {error}
  </p>
)}

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          {/* Submit — label changes based on savings level */}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                {isHighSavings ? 'Get Report & Book Call' : 'Get Full Report'}
                <svg className="w-4 h-4 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 font-medium">
            No spam. <br className="hidden sm:block" />Unsubscribe anytime.
          </p>
        </div>

      </form>
    </div>
  );
}