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
    <div className="grid grid-cols-12 gap-3 items-end">

      {/* Tool selector — col 4 */}
      <div className="col-span-4">
        {showLabels && (
          <label className="block text-xs font-medium text-gray-500 mb-1">
            AI Tool
          </label>
        )}
        <select
          value={entry.tool}
          onChange={e => {
            onChange('tool', e.target.value);
            onChange('plan', ''); // reset plan on tool change
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="">Select tool</option>
          {Object.entries(TOOLS).map(([key, def]) => (
            <option key={key} value={key}>{def.label}</option>
          ))}
        </select>
      </div>

      {/* Plan selector — col 3 */}
      <div className="col-span-3">
        {showLabels && (
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Plan
          </label>
        )}
        <select
          value={entry.plan}
          onChange={e => onChange('plan', e.target.value)}
          disabled={!entry.tool}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-green-500 bg-white
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="">Select plan</option>
          {planList.map(([key, plan]) => (
            <option key={key} value={key}>{plan.label}</option>
          ))}
        </select>
      </div>

      {/* Monthly spend — col 3 */}
      <div className="col-span-3">
        {showLabels && (
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Monthly spend
          </label>
        )}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            $
          </span>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={entry.monthlySpend || ''}
            onChange={e => onChange('monthlySpend', parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Seats — col 1 */}
      <div className="col-span-1">
        {showLabels && (
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Seats
          </label>
        )}
        <input
          type="number"
          min="1"
          value={entry.seats}
          onChange={e => onChange('seats', parseInt(e.target.value) || 1)}
          className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
        />
      </div>

      {/* Remove button — col 1 */}
      <div className="col-span-1 flex justify-center pb-0.5">
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove tool row ${index + 1}`}
            className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        ) : (
          <div className="w-6" /> // spacer to keep grid aligned
        )}
      </div>

    </div>
  );
}