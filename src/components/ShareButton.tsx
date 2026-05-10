
'use client';

import { useState } from 'react';

interface ShareButtonProps {
  auditId: string;
  saving:  number;
}

export default function ShareButton({ auditId, saving }: ShareButtonProps) {

  const [copied, setCopied] = useState(false);

  // ─── 1. Build the shareable URL ──────────────────────────
  // window.location.origin = "https://yourapp.vercel.app"
  // Full URL = "https://yourapp.vercel.app/audit/uuid-here"
  const shareUrl = `${window.location.origin}/audit/${auditId}`;

  // ─── 2. Copy handler ─────────────────────────────────────
  async function handleCopy() {
    try {
      // Modern API — works in all current browsers
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback for older browsers
      // Creates a temporary input, selects it, copies, then removes it
      const el    = document.createElement('input');
      el.value    = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }

    // Show "Copied!" for 2.5 seconds then reset
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="space-y-3 w-full">

      <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <svg className="w-4 h-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        Share your audit
        {saving > 0 && (
          <span className="text-slate-500 font-normal hidden sm:inline">
            — show others how much they could save
          </span>
        )}
      </p>

      {/* URL display + copy button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </div>
          <input
            readOnly
            value={shareUrl}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl
                       pl-10 pr-4 py-3 text-sm text-slate-600 truncate focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        <button
          onClick={handleCopy}
          className={`px-6 py-3 rounded-xl text-sm font-bold
                      transition-all shrink-0 flex items-center gap-2 ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              Copied!
            </>
          ) : (
            'Copy link'
          )}
        </button>
      </div>

      {/* Privacy note — important for trust */}
      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Sharing shows tools and savings only. Your email and company are hidden.
      </p>

    </div>
  );
}