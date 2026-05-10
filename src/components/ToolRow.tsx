// A single row in the spend form — one tool entry
// Tool selector, plan selector, monthly spend, seats
'use client';

import { TOOLS } from '@/lib/pricingData';
import type { ToolEntry } from '@/types';

interface ToolRowProps {
  entry:      ToolEntry;
  index:      number;
  showLabels: boolean;
  onChange:   (field: keyof ToolEntry, value: string | number) => void;
  onRemove:   () => void;
  canRemove:  boolean;
}

export default function ToolRow({
  entry,
  index,
  showLabels,
  onChange,
  onRemove,
  canRemove,
}: ToolRowProps) {
  const toolDef  = entry.tool ? TOOLS[entry.tool] : null;
  const planList = toolDef ? Object.entries(toolDef.plans) : [];

  return (
    <div className="grid grid-cols-12 gap-3 items-end group relative transition-all duration-300">

      {/* Tool selector — col 4 */}
      <div className="col-span-12 sm:col-span-4">
        {showLabels && (
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            AI Tool
          </label>
        )}
        <div className="relative">
          <select
            value={entry.tool}
            onChange={e => {
              onChange('tool', e.target.value);
              onChange('plan', ''); // reset plan on tool change
            }}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 appearance-none
                       focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm cursor-pointer"
          >
            <option value="" className="text-slate-500">Select tool...</option>
            {Object.entries(TOOLS).map(([key, def]) => (
              <option key={key} value={key}>{def.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      {/* Plan selector — col 3 */}
      <div className="col-span-12 sm:col-span-3">
        {showLabels && (
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            Plan
          </label>
        )}
        <div className="relative">
          <select
            value={entry.plan}
            onChange={e => onChange('plan', e.target.value)}
            disabled={!entry.tool}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 appearance-none
                       focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm cursor-pointer
                       disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
          >
            <option value="" className="text-slate-500">Select plan...</option>
            {planList.map(([key, plan]) => (
              <option key={key} value={key}>{plan.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      {/* Monthly spend — col 3 */}
      <div className="col-span-6 sm:col-span-3">
        {showLabels && (
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            Monthly spend
          </label>
        )}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
            $
          </span>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={entry.monthlySpend || ''}
            onChange={e => onChange('monthlySpend', parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Seats — col 1 */}
      <div className="col-span-4 sm:col-span-1">
        {showLabels && (
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider text-center">
            Seats
          </label>
        )}
        <input
          type="number"
          min="1"
          placeholder="1"
          value={entry.seats || ''}
          onChange={e => onChange('seats', e.target.value === '' ? ('' as unknown as number) : parseInt(e.target.value) || 1)}
          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2.5 text-sm text-slate-900 text-center placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
        />
      </div>

      {/* Remove button — col 1 */}
      <div className="col-span-2 sm:col-span-1 flex justify-center items-center pb-1.5 sm:pb-2.5">
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove tool row ${index + 1}`}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        ) : (
          <div className="w-8 h-8" /> // spacer to keep grid aligned
        )}
      </div>

    </div>
  );
}