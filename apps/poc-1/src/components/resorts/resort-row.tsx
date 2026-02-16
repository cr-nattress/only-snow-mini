import Link from "next/link";
import { Sparkline } from "./sparkline";
import { PassBadge } from "@/components/ui/pass-badge";

interface ResortRowProps {
  slug: string;
  name: string;
  pass: string;
  driveMinutes: number;
  snowfall: number;
  snowfallLabel?: string;
  forecastData: number[];
  dayLabels?: string[];
  state?: string;
}

export function ResortRow({ slug, name, pass, driveMinutes, snowfall, snowfallLabel = "total", forecastData, dayLabels, state }: ResortRowProps) {
  const driveLabel = driveMinutes === -1 ? (state ?? "—") : `${driveMinutes}m`;

  return (
    <Link href={`/resorts/${slug}`} className="flex items-center gap-2.5 bg-snow-surface-raised rounded-xl px-3 py-2.5 transition-colors hover:bg-snow-surface-hover active:bg-snow-surface-hover">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-snow-text truncate">{name}</span>
          <PassBadge pass={pass} />
        </div>
        <div className="text-[11px] text-snow-text-muted">{driveLabel}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-semibold text-snow-text tabular-nums">{Math.round(snowfall)}&quot;</div>
        <div className="text-[10px] text-snow-text-muted">{snowfallLabel}</div>
      </div>
      <Sparkline data={forecastData} dayLabels={dayLabels} />
    </Link>
  );
}
