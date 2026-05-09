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
  seats:        1,
};

const INITIAL_FORM: AuditInput = {
  tools:    [{ ...EMPTY_TOOL }],
  teamSize: 1,
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

    const validTools = formData.tools.filter(t => t.tool && t.plan);
    if (!validTools.length) {
      setError('Please add at least one tool with a plan selected.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/audit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          tools:    validTools,
          teamSize: formData.teamSize,
          useCase:  formData.useCase,
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team size
          </label>
          <input
            type="number"
            min="1"
            value={formData.teamSize}
            onChange={e => setFormData(f => ({
              ...f,
              teamSize: parseInt(e.target.value) || 1,
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary use case
          </label>
          <select
            value={formData.useCase}
            onChange={e => setFormData(f => ({
              ...f,
              useCase: e.target.value as UseCase,
            }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            {USE_CASES.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>

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
      <button
        type="button"
        onClick={addTool}
        className="text-sm text-green-600 hover:text-green-700 font-medium
                   flex items-center gap-1 transition-colors"
      >
        + Add another tool
      </button>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                        rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold
                   py-3 px-6 rounded-lg transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analysing your spend...' : 'Run Free Audit →'}
      </button>

      <p className="text-xs text-center text-gray-400">
        Free forever · No login required · Results in seconds
      </p>

    </form>
  );
}