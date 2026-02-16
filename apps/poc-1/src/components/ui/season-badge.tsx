// Season status badge for resort rows.
// Inputs: avgSnowfall (annual average inches), baseDepth (current base depth inches)
// Outputs: small inline badge showing season status, or null if neutral/no data
// Side effects: none
// Error behavior: returns null if avgSnowfall is 0 or missing

import { TrendingUp, TrendingDown } from "lucide-react";

interface SeasonBadgeProps {
  avgSnowfall: number;
  baseDepth: number;
}

function seasonCumulativeFraction(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const seasonStartYear = month >= 9 ? year : year - 1;
  const seasonStart = new Date(seasonStartYear, 9, 1);
  const seasonEnd = new Date(seasonStartYear + 1, 3, 30);
  const seasonDays = (seasonEnd.getTime() - seasonStart.getTime()) / 86400000;

  if (date < seasonStart) return 0;
  if (date > seasonEnd) return 1;

  const elapsed = (date.getTime() - seasonStart.getTime()) / 86400000;
  const t = elapsed / seasonDays;
  return (1 - Math.cos(Math.PI * t)) / 2;
}

export function SeasonBadge({ avgSnowfall, baseDepth }: SeasonBadgeProps) {
  if (!avgSnowfall || avgSnowfall <= 0 || baseDepth <= 0) return null;

  const fraction = seasonCumulativeFraction(new Date());
  const expectedToDate = avgSnowfall * fraction;
  if (expectedToDate <= 0) return null;

  const pct = (baseDepth / expectedToDate) * 100;

  // Only show badge for notable deviations — neutral (60-89%) shows nothing
  if (pct >= 90) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-snow-go">
        <TrendingUp className="w-2.5 h-2.5" />
        Good season
      </span>
    );
  }

  if (pct < 60) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-snow-maybe">
        <TrendingDown className="w-2.5 h-2.5" />
        Low season
      </span>
    );
  }

  return null;
}
