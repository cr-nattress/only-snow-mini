import Link from "next/link";
import { StormResortData } from "@/types/storm";
import { VerdictBadge } from "@/components/ui/verdict-badge";

interface ResortComparisonProps {
  resorts: StormResortData[];
}

export function ResortComparison({ resorts }: ResortComparisonProps) {
  const sorted = [...resorts].sort((a, b) => b.powder_score - a.powder_score);

  return (
    <div className="space-y-1.5">
      {sorted.map((resort) => (
        <Link
          key={resort.resort_id}
          href={`/resorts/${resort.resort_id}`}
          className="flex items-center gap-3 bg-snow-surface-raised rounded-xl px-3 py-2.5 transition-colors hover:bg-snow-surface-hover active:bg-snow-surface-hover"
        >
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-sm font-medium text-snow-text truncate">{resort.resort_name}</span>
            <VerdictBadge verdict={resort.verdict} size="sm" />
          </div>
          <span className="text-sm font-semibold text-snow-text tabular-nums">{Math.round(resort.expected_snowfall)}&quot;</span>
          <span className="text-xs text-snow-text-muted tabular-nums w-10 text-right">{resort.drive_minutes}m</span>
          <span className="text-sm font-bold text-snow-primary tabular-nums w-7 text-right">{resort.powder_score}</span>
        </Link>
      ))}
    </div>
  );
}
