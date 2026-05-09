
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
    <div className="space-y-2">

      <p className="text-sm font-medium text-gray-700">
        Share your audit
        {saving > 0 && (
          <span className="text-gray-400 font-normal ml-1">
            — show others how much they could save
          </span>
        )}
      </p>

      {/* URL display + copy button */}
      <div className="flex gap-2">
        <input
          readOnly
          value={shareUrl}
          className="flex-1 border border-gray-200 rounded-lg
                     px-3 py-2 text-sm text-gray-500
                     bg-gray-50 truncate"
        />
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-lg text-sm font-medium
                      transition-all shrink-0 ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-900 text-white hover:bg-gray-700'
          }`}
        >
          {copied ? '✓ Copied!' : 'Copy link'}
        </button>
      </div>

      {/* Privacy note — important for trust */}
      <p className="text-xs text-gray-400">
        Sharing shows tools and savings only.
        Your email and company name are never included.
      </p>

    </div>
  );
}