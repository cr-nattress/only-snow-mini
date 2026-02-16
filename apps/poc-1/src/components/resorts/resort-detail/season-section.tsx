// Season snowfall section for resort detail page.
// Inputs: avgSnowfall (annual average in inches), baseDepth (current base depth in inches)
// Outputs: progress bar showing estimated season-to-date vs average, color-coded indicator
// Side effects: none
// Error behavior: returns null if avgSnowfall is 0 or missing

import { Card } from "@/components/ui/card";

interface SeasonSectionProps {
  avgSnowfall: number;
  baseDepth: number;
}

/**
 * Estimate the cumulative fraction of season snowfall expected by a given date.
 * Season runs Oct 1 – Apr 30 (~212 days). Snowfall distribution follows a
 * sinusoidal curve peaking mid-January.
 */
function seasonCumulativeFraction(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed

  // Determine season start year (Oct-Dec = same year, Jan-Apr = previous year)
  const seasonStartYear = month >= 9 ? year : year - 1;
  const seasonStart = new Date(seasonStartYear, 9, 1); // Oct 1
  const seasonEnd = new Date(seasonStartYear + 1, 3, 30); // Apr 30
  const seasonDays = (seasonEnd.getTime() - seasonStart.getTime()) / 86400000;

  // Before season start or after season end
  if (date < seasonStart) return 0;
  if (date > seasonEnd) return 1;

  const elapsed = (date.getTime() - seasonStart.getTime()) / 86400000;
  const t = elapsed / seasonDays; // 0 to 1

  // Sinusoidal CDF: more snowfall mid-season than edges
  // Uses sin-based accumulation peaking around Jan
  return (1 - Math.cos(Math.PI * t)) / 2;
}

function getSeasonStatus(pct: number): { label: string; color: string; barColor: string } {
  if (pct >= 90) return { label: "Good season", color: "text-snow-go", barColor: "bg-snow-go" };
  if (pct >= 60) return { label: "Average season", color: "text-snow-maybe", barColor: "bg-snow-maybe" };
  return { label: "Below average", color: "text-snow-skip", barColor: "bg-snow-skip" };
}

export function SeasonSection({ avgSnowfall, baseDepth }: SeasonSectionProps) {
  if (!avgSnowfall || avgSnowfall <= 0) return null;

  const now = new Date();
  const fraction = seasonCumulativeFraction(now);
  const expectedToDate = Math.round(avgSnowfall * fraction);

  // Use base depth as rough proxy for season accumulation
  const estimatedSeasonTotal = baseDepth > 0 ? baseDepth : Math.round(expectedToDate * 0.7);
  const pctOfAvg = expectedToDate > 0 ? Math.round((estimatedSeasonTotal / expectedToDate) * 100) : 0;
  const barWidth = Math.min(pctOfAvg, 120); // cap visual at 120%
  const status = getSeasonStatus(pctOfAvg);

  return (
    <Card>
      <h3 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-3">
        Season Snowfall
      </h3>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between items-baseline mb-1">
          <span className={`text-sm font-bold ${status.color}`}>
            {estimatedSeasonTotal}&quot; {pctOfAvg > 0 && `(${pctOfAvg}% of avg)`}
          </span>
          <span className="text-[10px] text-snow-text-muted">{status.label}</span>
        </div>
        <div className="h-2 rounded-full bg-snow-surface overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${status.barColor}`}
            style={{ width: `${Math.min(barWidth, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-[11px] text-snow-text-muted">
        <span>Avg annual: {avgSnowfall}&quot;</span>
        <span>Expected to date: ~{expectedToDate}&quot;</span>
        {baseDepth > 0 && <span>Base: {baseDepth}&quot;</span>}
      </div>
    </Card>
  );
}
