// src/components/ToolAuditCard.tsx
import type { ToolAuditResult } from '@/types';

// ── Config type defined inline ────────────────────────────
// Avoids the Record<RecommendedAction, ...> generic
// that Turbopack was misinterpreting as an expression
type ActionConfig = {
  label:       string;
  badgeClass:  string;
  borderClass: string;
};

// ── Action config map ─────────────────────────────────────
const ACTION_CONFIG: { [key: string]: ActionConfig } = {
  keep: {
    label:       'Optimal',
    badgeClass:  'bg-green-100 text-green-700',
    borderClass: 'border-gray-200',
  },
  downgrade: {
    label:       'Downgrade',
    badgeClass:  'bg-amber-100 text-amber-700',
    borderClass: 'border-amber-200',
  },
  switch: {
    label:       'Switch Tool',
    badgeClass:  'bg-blue-100 text-blue-700',
    borderClass: 'border-blue-200',
  },
  optimize: {
    label:       'Optimize',
    badgeClass:  'bg-purple-100 text-purple-700',
    borderClass: 'border-purple-200',
  },
};

// ── Fallback for unknown actions ──────────────────────────
const DEFAULT_CONFIG: ActionConfig = {
  label:       'Review',
  badgeClass:  'bg-gray-100 text-gray-700',
  borderClass: 'border-gray-200',
};

interface ToolAuditCardProps {
  tool: ToolAuditResult;
}

export default function ToolAuditCard({ tool }: ToolAuditCardProps) {

  // Safe lookup — falls back to DEFAULT_CONFIG if key missing
  const config = ACTION_CONFIG[tool.recommendedAction] ?? DEFAULT_CONFIG;

  return (
    <div className={`border ${config.borderClass} rounded-xl p-5 bg-white`}>

      {/* ── Header row ──────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-3">

        {/* Left: tool name, plan, seats, badge */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="font-semibold text-gray-900">
            {tool.tool}
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-500 text-sm">
            {tool.plan}
          </span>
          {tool.seats > 1 && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500 text-sm">
                {tool.seats} seats
              </span>
            </>
          )}
          <span className={`text-xs font-medium px-2 py-0.5
                            rounded-full ${config.badgeClass}`}>
            {config.label}
          </span>
        </div>

        {/* Right: spend + saving */}
        <div className="text-right shrink-0">
          <p className="text-gray-400 text-sm line-through">
            ${tool.currentSpend.toLocaleString()}/mo
          </p>
          {tool.potentialSaving > 0 && (
            <p className="text-green-600 font-semibold text-sm">
              Save ${tool.potentialSaving.toLocaleString()}/mo
            </p>
          )}
        </div>

      </div>

      {/* ── Reason ──────────────────────────────────── */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {tool.reason}
      </p>

    </div>
  );
}