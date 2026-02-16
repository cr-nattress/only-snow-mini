"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CloudSnow, AlertTriangle, Bell } from "lucide-react";
import { ScreenContainer } from "@/components/layout/screen-container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimelineBar } from "@/components/storm/timeline-bar";
import { ResortComparison } from "@/components/storm/resort-comparison";
import { useStorms } from "@/hooks/use-api";
import type { HourlySnowfall, StormResortData } from "@/types/storm";
import type { ApiStorm } from "@/types/api";

// API gap: storms endpoint doesn't include hourly_snowfall.
// Generate placeholder based on severity until API adds this field.
function generatePlaceholderHourly(severity: ApiStorm["severity"]): HourlySnowfall[] {
  const patterns: Record<string, { base: number; peak: number }> = {
    major: { base: 1.0, peak: 2.5 },
    significant: { base: 0.5, peak: 1.5 },
    moderate: { base: 0.3, peak: 1.0 },
  };
  const { base, peak } = patterns[severity] ?? patterns.moderate;
  const hours = ["6pm", "7pm", "8pm", "9pm", "10pm", "11pm", "12am", "1am", "2am", "3am", "4am", "5am"];
  return hours.map((hour, i) => {
    const progress = i / (hours.length - 1);
    const bellCurve = Math.exp(-Math.pow((progress - 0.4) * 3, 2));
    const inches = Math.round((base + (peak - base) * bellCurve) * 10) / 10;
    const intensity: HourlySnowfall["intensity"] =
      inches >= peak * 0.8 ? "heavy" : inches >= peak * 0.4 ? "moderate" : "light";
    return { hour, inches, intensity };
  });
}

// API gap: storms endpoint doesn't include best_window or road_conditions.
function deriveBestWindow(storm: ApiStorm): string {
  const peakFormatted = new Date(storm.peakDay + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const topResort = storm.affectedResorts[0];
  return `Peak conditions: ${peakFormatted} at ${topResort?.name ?? "area resorts"}`;
}

function deriveRoadConditions(severity: ApiStorm["severity"]): string {
  switch (severity) {
    case "major":
      return "Expect significant delays on mountain passes. Chains required.";
    case "significant":
      return "Snow-packed roads likely. Allow extra travel time.";
    case "moderate":
      return "Normal winter driving conditions expected.";
  }
}

export default function StormDetailPage({ params }: { params: Promise<{ stormId: string }> }) {
  const { stormId } = use(params);
  const router = useRouter();
  const { data: stormsData, loading } = useStorms();

  // Find storm from live API data
  const apiStorm = stormsData?.storms.find((s) => s.id === stormId);

  const stormView = useMemo(() => {
    if (apiStorm) {
      // Build from live API data + placeholders for gaps
      const hourlySnowfall = generatePlaceholderHourly(apiStorm.severity);
      const bestWindow = deriveBestWindow(apiStorm);
      const roadConditions = deriveRoadConditions(apiStorm.severity);

      // Map API affected resorts to StormResortData shape for ResortComparison
      const resortData: StormResortData[] = apiStorm.affectedResorts.map((r, i) => ({
        resort_id: r.slug,
        resort_name: r.name,
        expected_snowfall: r.forecastInches,
        drive_minutes: 30 + i * 15, // placeholder — API gap
        powder_score: Math.round(35 - i * 5), // placeholder derived from ranking
        verdict: r.forecastInches >= 8 ? "go" as const : r.forecastInches >= 5 ? "maybe" as const : "skip" as const,
        high_temp_f: 22, // placeholder — API gap
        low_temp_f: 5, // placeholder — API gap
        wind_mph: 15, // placeholder — API gap
      }));

      return {
        headline: `${apiStorm.name} — ${apiStorm.severity.charAt(0).toUpperCase() + apiStorm.severity.slice(1)}`,
        name: apiStorm.name,
        severity: apiStorm.severity,
        hourlySnowfall,
        bestWindow,
        roadConditions,
        resortData,
        totalSnowfall: apiStorm.totalSnowfallInches,
        isLive: true,
      };
    }

    return null;
  }, [apiStorm]);

  if (loading) {
    return (
      <ScreenContainer>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 rounded bg-snow-surface-raised" />
          <div className="h-32 rounded-xl bg-snow-surface-raised" />
          <div className="flex gap-3">
            <div className="flex-1 h-16 rounded-xl bg-snow-surface-raised" />
            <div className="flex-1 h-16 rounded-xl bg-snow-surface-raised" />
          </div>
          <div className="space-y-2">
            <div className="h-14 rounded-xl bg-snow-surface-raised" />
            <div className="h-14 rounded-xl bg-snow-surface-raised" />
            <div className="h-14 rounded-xl bg-snow-surface-raised" />
          </div>
        </div>
      </ScreenContainer>
    );
  }

  if (!stormView) {
    return (
      <ScreenContainer>
        <div className="text-center py-12 text-snow-text-muted">Storm not found.</div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-snow-text-muted hover:text-snow-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-snow-text truncate">{stormView.headline}</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-snow-text-muted">{stormView.name}</p>
              {stormView.isLive && (
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-snow-go/15 text-snow-go">
                  LIVE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Snowfall total badge */}
        <div className="flex items-center gap-2 text-xs text-snow-text-muted">
          <CloudSnow className="w-4 h-4 text-snow-primary" />
          <span>Expected: {Math.round(stormView.totalSnowfall)}&quot; total</span>
          <span className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
            stormView.severity === "major"
              ? "bg-snow-alert/15 text-snow-alert"
              : stormView.severity === "significant"
                ? "bg-snow-maybe/15 text-snow-maybe"
                : "bg-snow-primary/15 text-snow-primary"
          }`}>
            {stormView.severity.toUpperCase()}
          </span>
        </div>

        <Card>
          <h2 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-3">Snowfall Timeline</h2>
          <TimelineBar hourlyData={stormView.hourlySnowfall} />
        </Card>

        <div className="flex gap-3">
          <Card className="flex-1 flex items-start gap-2">
            <CloudSnow className="w-4 h-4 text-snow-primary flex-shrink-0 mt-0.5" />
            <span className="text-xs font-medium text-snow-text">{stormView.bestWindow}</span>
          </Card>
          <Card className="flex-1 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-snow-maybe flex-shrink-0 mt-0.5" />
            <span className="text-xs text-snow-text-muted">{stormView.roadConditions}</span>
          </Card>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-2">Resort Comparison</h2>
          <ResortComparison resorts={stormView.resortData} />
        </div>

        <Button fullWidth variant="secondary" size="sm">
          <span className="flex items-center gap-2 justify-center">
            <Bell className="w-3.5 h-3.5" />
            Set Alert for This Storm
          </span>
        </Button>
      </div>
    </ScreenContainer>
  );
}
