// src/components/ToolRow.tsx
'use client';

import { TOOLS }       from '@/lib/pricingData';
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
  entry, index, showLabels, onChange, onRemove, canRemove,
}: ToolRowProps) {
  const toolDef  = entry.tool ? TOOLS[entry.tool] : null;
  const planList = toolDef ? Object.entries(toolDef.plans) : [];

  const selectClass = `w-full border border-gray-200 rounded-lg px-3 py-2
                       text-sm bg-white focus:outline-none focus:ring-2
                       focus:ring-green-500 focus:border-transparent`;

  const inputClass = `w-full border border-gray-200 rounded-lg px-3 py-2
                      text-sm focus:outline-none focus:ring-2
                      focus:ring-green-500 focus:border-transparent`;

  const rowNum = index + 1;

  return (
    <div
      className="grid grid-cols-12 gap-2 items-end"
      role="group"
      aria-label={`Tool ${rowNum}`}
    >

      {/* Tool selector */}
      <div className="col-span-4">
        {showLabels && (
          <label
            htmlFor={`tool-${index}`}
            className="block text-xs font-medium text-gray-500 mb-1.5"
          >
            Tool
          </label>
        )}
        <select
          id={`tool-${index}`}
          value={entry.tool}
          aria-label={`Select AI tool for row ${rowNum}`}
          onChange={e => {
            onChange('tool', e.target.value);
            onChange('plan', '');
          }}
          className={selectClass}
        >
          <option value="">Select tool</option>
          {Object.entries(TOOLS).map(([k, d]) => (
            <option key={k} value={k}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Plan selector */}
      <div className="col-span-3">
        {showLabels && (
          <label
            htmlFor={`plan-${index}`}
            className="block text-xs font-medium text-gray-500 mb-1.5"
          >
            Plan
          </label>
        )}
        <select
          id={`plan-${index}`}
          value={entry.plan}
          aria-label={`Select plan for row ${rowNum}`}
          onChange={e => onChange('plan', e.target.value)}
          disabled={!entry.tool}
          className={`${selectClass} disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <option value="">Plan</option>
          {planList.map(([k, p]) => (
            <option key={k} value={k}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Monthly spend */}
      <div className="col-span-3">
        {showLabels && (
          <label
            htmlFor={`spend-${index}`}
            className="block text-xs font-medium text-gray-500 mb-1.5"
          >
            Monthly spend
          </label>
        )}
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2
                       text-gray-400 text-sm pointer-events-none"
            aria-hidden="true"
          >
            $
          </span>
          <input
            id={`spend-${index}`}
            type="number"
            min="0"
            placeholder="0"
            aria-label={`Monthly spend for row ${rowNum} in USD`}
            value={entry.monthlySpend || ''}
            onChange={e => onChange('monthlySpend', parseFloat(e.target.value) || 0)}
            className={`${inputClass} pl-7`}
          />
        </div>
      </div>

      {/* Seats */}
      <div className="col-span-1">
        {showLabels && (
          <label
            htmlFor={`seats-${index}`}
            className="block text-xs font-medium text-gray-500 mb-1.5"
          >
            Seats
          </label>
        )}
        <input
          id={`seats-${index}`}
          type="number"
          min="1"
          aria-label={`Number of seats for row ${rowNum}`}
          value={entry.seats}
          onChange={e => onChange('seats', parseInt(e.target.value) || 1)}
          className={`${inputClass} text-center px-1`}
        />
      </div>

      {/* Remove button */}
      <div className="col-span-1 flex justify-center pb-0.5">
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove tool row ${rowNum}`}
            className="text-gray-300 hover:text-red-400 transition-colors
                       text-base leading-none w-full flex justify-center"
          >
            x
          </button>
        ) : (
          <div className="w-6" aria-hidden="true" />
        )}
      </div>

    </div>
  );
}