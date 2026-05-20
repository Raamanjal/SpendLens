import type { ReauditDiff as ReauditDiffData } from '@/types';

interface ReauditDiffProps {
  diff: ReauditDiffData;
}

export default function ReauditDiff({ diff }: ReauditDiffProps) {
  const deltaLabel = diff.monthlyDelta === 0
    ? 'No savings change'
    : `${diff.monthlyDelta > 0 ? '+' : ''}$${diff.monthlyDelta.toLocaleString()}/mo`;

  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Re-audit savings delta
        </p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              {deltaLabel}
            </h1>
            <p className="text-slate-500 mt-3">
              Old audit: ${diff.oldMonthlySaving.toLocaleString()}/mo · New audit: ${diff.newMonthlySaving.toLocaleString()}/mo
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Metric label="Old annual" value={`$${diff.oldAnnualSaving.toLocaleString()}`} />
            <Metric label="New annual" value={`$${diff.newAnnualSaving.toLocaleString()}`} />
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Pricing changes detected
        </h2>
        {diff.changes.length ? (
          <div className="space-y-3">
            {diff.changes.map((change, index) => (
              <div
                key={`${change.toolKey}-${change.planKey}-${change.field}-${index}`}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {change.tool} · {change.plan}
                  </p>
                  <p className="text-sm text-slate-600">
                    {change.field} changed from {formatValue(change.previous)} to {formatValue(change.current)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No direct pricing changes were found for the selected plans. The audit is still re-run against the current engine.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-px bg-slate-200 flex-grow"></div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            Old vs new recommendation
          </h2>
          <div className="h-px bg-slate-200 flex-grow"></div>
        </div>

        {diff.toolDiffs.map((tool, index) => (
          <article
            key={`${tool.tool}-${tool.plan}-${index}`}
            className={`rounded-2xl border p-5 shadow-sm ${
              tool.changed
                ? 'bg-white border-green-200'
                : 'bg-slate-50 border-slate-200 opacity-80'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900">{tool.tool}</h3>
                <p className="text-sm text-slate-500">{tool.plan} · ${tool.currentSpend.toLocaleString()}/mo spend</p>
              </div>
              <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${
                tool.changed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {tool.changed ? 'Changed' : 'Unchanged'}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <RecommendationBlock
                label="Original audit"
                action={tool.oldAction}
                recommendation={tool.oldRecommendation}
                saving={tool.oldSaving}
                reason={tool.oldReason}
              />
              <RecommendationBlock
                label="Current audit"
                action={tool.newAction}
                recommendation={tool.newRecommendation}
                saving={tool.newSaving}
                reason={tool.newReason}
              />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function RecommendationBlock({
  label,
  action,
  recommendation,
  saving,
  reason,
}: {
  label: string;
  action: string;
  recommendation?: string;
  saving: number;
  reason: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
        {label}
      </p>
      <p className="font-semibold text-slate-900 capitalize">
        {action}{recommendation ? ` to ${recommendation}` : ''}
      </p>
      <p className="text-sm font-semibold text-green-700 mt-1">
        ${saving.toLocaleString()}/mo potential saving
      </p>
      <p className="text-sm text-slate-600 mt-3 leading-relaxed">
        {reason}
      </p>
    </div>
  );
}

function formatValue(value: number | string | null): string {
  if (value === null) return 'not set';
  if (typeof value === 'number') return `$${value}`;
  return value;
}
