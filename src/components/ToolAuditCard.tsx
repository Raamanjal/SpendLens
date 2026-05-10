// src/components/ToolAuditCard.tsx
import type { ToolAuditResult } from '@/types';

type ActionConfig = {
  label:       string;
  badgeClass:  string;
  borderClass: string;
  bgClass:     string;
};

const ACTION_CONFIG: { [key: string]: ActionConfig } = {
  keep: {
    label:       'Optimal',
    badgeClass:  'bg-green-100 text-green-700',
    borderClass: 'border-gray-200',
    bgClass:     'bg-white',
  },
  downgrade: {
    label:       'Downgrade',
    badgeClass:  'bg-amber-100 text-amber-700',
    borderClass: 'border-amber-100',
    bgClass:     'bg-amber-50',
  },
  switch: {
    label:       'Switch Tool',
    badgeClass:  'bg-blue-100 text-blue-700',
    borderClass: 'border-blue-100',
    bgClass:     'bg-blue-50',
  },
  optimize: {
    label:       'Optimize',
    badgeClass:  'bg-purple-100 text-purple-700',
    borderClass: 'border-purple-100',
    bgClass:     'bg-purple-50',
  },
};

const DEFAULT_CONFIG: ActionConfig = {
  label:       'Review',
  badgeClass:  'bg-gray-100 text-gray-600',
  borderClass: 'border-gray-200',
  bgClass:     'bg-white',
};

interface ToolAuditCardProps {
  tool: ToolAuditResult;
}

export default function ToolAuditCard({ tool }: ToolAuditCardProps) {
  const config = ACTION_CONFIG[tool.recommendedAction] ?? DEFAULT_CONFIG;

  return (
    <div className={`border ${config.borderClass} ${config.bgClass}
                     rounded-xl p-5`}>

      {/* ── Header row ──────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">

        {/* Left: name, plan, seats, badge */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="font-semibold text-gray-900 text-sm">
            {tool.tool}
          </span>
          <span className="text-gray-300 text-xs">|</span>
          <span className="text-gray-500 text-xs">
            {tool.plan}
          </span>
          {tool.seats > 1 && (
            <span className="text-gray-400 text-xs">
              {tool.seats}{' seats'}
            </span>
          )}
          <span className={`text-xs font-medium px-2 py-0.5
                            rounded-full ${config.badgeClass}`}>
            {config.label}
          </span>
        </div>

        {/* Right: spend + saving */}
        <div className="text-right shrink-0">
          <p className="text-gray-400 text-xs line-through">
            {'$'}{tool.currentSpend.toLocaleString()}{'/mo'}
          </p>
          {tool.potentialSaving > 0 && (
            <p className="text-green-600 font-bold text-sm">
              {'-$'}{tool.potentialSaving.toLocaleString()}{'/mo'}
            </p>
          )}
        </div>

      </div>

      {/* ── Recommended plan pill ────────────────────── */}
      {/* Only shown for downgrade and optimize actions */}
      {tool.recommendedPlan && (
        tool.recommendedAction === 'downgrade' ||
        tool.recommendedAction === 'optimize'
      ) && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400">
            Switch to:
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white
                           border border-green-200 text-green-700
                           text-xs font-semibold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            {tool.recommendedPlan}
            {tool.recommendedPrice != null && (
              <span className="text-green-500 font-normal">
                {' — $'}{tool.recommendedPrice}{'/seat'}
              </span>
            )}
          </span>
        </div>
      )}

      {/* ── Reason ──────────────────────────────────── */}
      <p className="text-xs text-gray-500 leading-relaxed">
        {tool.reason}
      </p>

    </div>
  );
}