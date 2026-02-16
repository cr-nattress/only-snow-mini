"use client";

import Link from "next/link";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { PassBadge } from "@/components/ui/pass-badge";
import { Sparkline } from "@/components/resorts/sparkline";

interface HeroCardProps {
  resortName: string;
  pass: string;
  snowfall: string;
  highTemp: number;
  lowTemp: number;
  windMph: number;
  travel: string;
  verdict: "go" | "maybe" | "skip";
  slug: string;
  forecastData?: number[];
  dayLabels?: string[];
}

export function HeroCard({ resortName, pass, snowfall, highTemp, lowTemp, windMph, travel, verdict, slug, forecastData, dayLabels }: HeroCardProps) {
  return (
    <Link
      href={`/resorts/${slug}`}
      className="block rounded-2xl p-4 bg-snow-surface-raised border border-snow-primary/40 transition-all duration-150 active:scale-[0.99] hover:border-snow-primary/60"
    >
      <div className="text-[10px] text-snow-text-muted uppercase tracking-wider font-semibold mb-2">Top pick</div>
      <div className="flex items-center gap-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-snow-text truncate">{resortName}</span>
            <PassBadge pass={pass} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-snow-text-muted mt-0.5">
            <span>{highTemp}°/{lowTemp}°</span>
            <span>{windMph} mph</span>
            <span>{travel}</span>
          </div>
        </div>
        <span className="text-base font-bold text-snow-text tabular-nums flex-shrink-0">{snowfall}</span>
        {forecastData && forecastData.length > 0 && <Sparkline data={forecastData} dayLabels={dayLabels} />}
        <VerdictBadge verdict={verdict} size="lg" />
      </div>
    </Link>
  );
}
