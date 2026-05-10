// src/components/ToolAuditCard.tsx
import type { ToolAuditResult } from '@/types';

type ActionConfig = {
  label:       string;
  badgeClass:  string;
  borderClass: string;
};

const ACTION_CONFIG: { [key: string]: ActionConfig } = {
  keep: {
    label:       'Optimal',
    badgeClass:  'bg-green-100 text-green-700',
    borderClass: 'border-slate-200',
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
    badgeClass:  'bg-brand-100 text-brand-700',
    borderClass: 'border-brand-200',
  },
};

const DEFAULT_CONFIG: ActionConfig = {
  label:       'Review',
  badgeClass:  'bg-slate-100 text-slate-700',
  borderClass: 'border-slate-200',
};

interface ToolAuditCardProps {
  tool: ToolAuditResult;
}

export default function ToolAuditCard({ tool }: ToolAuditCardProps) {
  const config = ACTION_CONFIG[tool.recommendedAction] ?? DEFAULT_CONFIG;

  return (
    <div className={`border ${config.borderClass} bg-white rounded-xl p-5 md:p-6 shadow-sm`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              {tool.tool}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${config.badgeClass}`}>
              {config.label}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              {tool.plan}
            </span>
            {tool.seats > 1 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  {tool.seats}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm line-through decoration-slate-300">
              ${tool.currentSpend.toLocaleString()}/mo
            </span>
            <span className="text-slate-900 font-bold">
              ${(tool.currentSpend - tool.potentialSaving).toLocaleString()}/mo
            </span>
          </div>
          
          {tool.potentialSaving > 0 && (
            <p className="text-brand-600 font-semibold text-sm mt-0.5 flex items-center gap-1 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              Save ${tool.potentialSaving.toLocaleString()}/mo
            </p>
          )}
        </div>

      </div>

      <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 mt-2">
        {tool.reason}
      </p>

    </div>
  );
}