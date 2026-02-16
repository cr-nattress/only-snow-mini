"use client";

import Link from "next/link";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { PassBadge } from "@/components/ui/pass-badge";
import { Sparkline } from "@/components/resorts/sparkline";

interface ConditionsRowProps {
  date: string;
  resortName: string;
  pass: string;
  snowfall: string;
  highTemp: number;
  lowTemp: number;
  windMph: number;
  verdict: "go" | "maybe" | "skip";
  stormId: string;
  driveMinutes?: number;
  forecastData?: number[];
  dayLabels?: string[];
}

export function ConditionsRow({ date, resortName, pass, snowfall, highTemp, lowTemp, windMph, verdict, stormId, driveMinutes, forecastData, dayLabels }: ConditionsRowProps) {
  return (
    <Link
      href={`/storm/${stormId}`}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors hover:bg-snow-surface-hover active:bg-snow-surface-hover ${
        verdict === "skip" ? "opacity-40" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-snow-text truncate">{resortName}</span>
          <PassBadge pass={pass} />
        </div>
        <div className="flex items-center gap-2 text-[11px] text-snow-text-muted mt-0.5">
          <span>{date}</span>
          <span>{highTemp}°/{lowTemp}°</span>
          <span>{windMph} mph</span>
          {driveMinutes != null && (
            <span>{driveMinutes >= 60 ? `${(driveMinutes / 60).toFixed(1)}h` : `${driveMinutes}m`} drive</span>
          )}
        </div>
      </div>
      <span className="text-sm font-bold text-snow-text tabular-nums flex-shrink-0">{snowfall}</span>
      {forecastData && forecastData.length > 0 && <Sparkline data={forecastData} dayLabels={dayLabels} />}
      <VerdictBadge verdict={verdict} size="sm" />
    </Link>
  );
}
