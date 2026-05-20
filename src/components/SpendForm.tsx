// src/components/SpendForm.tsx
// Main form — collects tool spend data and submits to /api/audit
'use client';

import { useState }        from 'react';
import { useFormPersist }  from '@/hooks/useFormPersist';
import { USE_CASES }       from '@/lib/pricingData';
import ToolRow             from './ToolRow';
import type {
  AuditInput,
  AuditResponse,
  ToolEntry,
  UseCase,
} from '@/types';

// ── Default empty state ───────────────────────────────────

const EMPTY_TOOL: ToolEntry = {
  tool:         '',
  plan:         '',
  monthlySpend: 0,
  seats:        '' as unknown as number, // Start empty for better UX
};

const INITIAL_FORM: AuditInput = {
  tools:    [{ ...EMPTY_TOOL }],
  teamSize: '' as unknown as number, // Start empty for better UX
  useCase:  'coding',
};

// ── Props ─────────────────────────────────────────────────

interface SpendFormProps {
  onResult: (data: AuditResponse) => void;
}

// ── Component ─────────────────────────────────────────────

export default function SpendForm({ onResult }: SpendFormProps) {
  const [formData, setFormData, hydrated] = useFormPersist<AuditInput>(
    'spendlens-form',
    INITIAL_FORM
  );
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // ── Tool row handlers ───────────────────────────────────

  function addTool() {
    setFormData(f => ({
      ...f,
      tools: [...f.tools, { ...EMPTY_TOOL }],
    }));
  }

  function removeTool(index: number) {
    setFormData(f => ({
      ...f,
      tools: f.tools.filter((_, i) => i !== index),
    }));
  }

  function updateTool(
    index: number,
    field: keyof ToolEntry,
    value: string | number
  ) {
    setFormData(f => {
      const tools = [...f.tools];
      tools[index] = { ...tools[index], [field]: value };
      return { ...f, tools };
    });
  }

  // ── Submit ──────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const validTools = formData.tools
      .filter(t => t.tool && t.plan)
      .map(t => ({ ...t, seats: t.seats || 1 }));
    if (!validTools.length) {
      setError('Please add at least one tool with a plan selected.');
      return;
    }

    if (!email) {
      setError('Please enter your email so pricing-change alerts can reach you.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/audit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          tools:    validTools,
          teamSize: formData.teamSize || 1, // Fallback to 1 if left empty
          useCase:  formData.useCase,
          email,
          website:  '',            // honeypot — always empty for real users
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Audit failed. Please try again.');
      onResult(data as AuditResponse);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Wait for localStorage hydration to avoid SSR flash
  if (!hydrated) return null;

  // ── Render ──────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Honeypot — hidden field bots fill, humans don't */}
      <input
        name="website"
        type="text"
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
        readOnly
      />

      {/* Team context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Team size
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 5"
            value={formData.teamSize || ''}
            onChange={e => setFormData(f => ({
              ...f,
              teamSize: e.target.value === '' ? ('' as unknown as number) : parseInt(e.target.value) || 1,
            }))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Primary use case
          </label>
          <div className="relative">
            <select
              value={formData.useCase}
              onChange={e => setFormData(f => ({
                ...f,
                useCase: e.target.value as UseCase,
              }))}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 appearance-none
                         focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm cursor-pointer"
            >
              {USE_CASES.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-slate-100 my-6"></div>

      {/* Tool rows */}
      <div className="space-y-4">
        {formData.tools.map((entry, idx) => (
          <ToolRow
            key={idx}
            entry={entry}
            index={idx}
            showLabels={idx === 0}
            onChange={(field, val) => updateTool(idx, field, val)}
            onRemove={() => removeTool(idx)}
            canRemove={formData.tools.length > 1}
          />
        ))}
      </div>

      {/* Add tool button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={addTool}
          className="group flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <svg className="w-4 h-4 transition-transform group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Add another tool
        </button>
      </div>

     {/* Replace the error div with this */}
{error && (
  <div
    role="alert"
    aria-live="polite"
    className="bg-red-50 border border-red-100 text-red-600
               text-sm rounded-lg px-4 py-3"
  >
    {error}
  </div>
)}
      {/* Submit */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold
                     py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2
                     disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analysing spend...
            </>
          ) : (
            <>
              Run Free Audit
              <svg className="w-5 h-5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </>
          )}
        </button>
      </div>

    </form>
  );
}
