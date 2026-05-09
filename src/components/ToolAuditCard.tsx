// src/components/ToolAuditCard.tsx
import type { ToolAuditResult, RecommendedAction } from '@/types';

// ─── 1. Action config map ────────────────────────────────
// Maps each action type to its visual style
// Defined outside component so it's not recreated on every render
const ACTION_CONFIG: Record
  RecommendedAction,
  { label: string; badgeClass: string; borderClass: string }
> = {
  keep: {
    label:       '✓ Optimal',
    badgeClass:  'bg-green-100 text-green-700',
    borderClass: 'border-gray-200',
  },
  downgrade: {
    label:       '↓ Downgrade',
    badgeClass:  'bg-amber-100 text-amber-700',
    borderClass: 'border-amber-200',
  },
  switch: {
    label:       '⇄ Switch Tool',
    badgeClass:  'bg-blue-100 text-blue-700',
    borderClass: 'border-blue-200',
  },
  optimize: {
    label:       '⚙ Optimize',
    badgeClass:  'bg-purple-100 text-purple-700',
    borderClass: 'border-purple-200',
  },
};

interface ToolAuditCardProps {
  tool: ToolAuditResult;
}

export default function ToolAuditCard({ tool }: ToolAuditCardProps) {

  // ─── 2. Pick config for this action ─────────────────────
  const config = ACTION_CONFIG[tool.recommendedAction];

  return (
    <div className={`border ${config.borderClass} rounded-xl p-5 bg-white`}>

      {/* ── Top row: name, plan, seats, badge, spend ──── */}
      <div className="flex items-start justify-between gap-4 mb-3">

        {/* Left side: tool details + badge */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">

          {/* Tool name */}
          <span className="font-semibold text-gray-900">
            {tool.tool}
          </span>

          <span className="text-gray-300">·</span>

          {/* Plan name from pricingData label */}
          <span className="text-gray-500 text-sm">
            {tool.plan}
          </span>

          {/* Seats — only shown if more than 1 */}
          {tool.seats > 1 && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500 text-sm">
                {tool.seats} seats
              </span>
            </>
          )}

          {/* Action badge */}
          <span className={`text-xs font-medium px-2 py-0.5
                            rounded-full ${config.badgeClass}`}>
            {config.label}
          </span>

        </div>

        {/* Right side: current spend + saving */}
        <div className="text-right shrink-0">
          {/* Strike through current spend */}
          <p className="text-gray-400 text-sm line-through">
            ${tool.currentSpend.toLocaleString()}/mo
          </p>
          {/* Only show saving amount if > 0 */}
          {tool.potentialSaving > 0 && (
            <p className="text-green-600 font-semibold text-sm">
              Save ${tool.potentialSaving.toLocaleString()}/mo
            </p>
          )}
        </div>

      </div>

      {/* ── Reason ────────────────────────────────────── */}
      {/* Finance-literate one sentence from audit engine */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {tool.reason}
      </p>

    </div>
  );
}