"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ScreenContainer } from "@/components/layout/screen-container";
import { HeroCard } from "@/components/dashboard/hero-card";
import { ConditionsRow } from "@/components/dashboard/conditions-row";
import {
  useRankedResorts,
  useWorthKnowing,
  formatFetchedAt,
} from "@/hooks/use-api";
import { primaryPass, goNoGoToVerdict, cmToInches } from "@/lib/api/transforms";
import { PassBadge } from "@/components/ui/pass-badge";
import type { ApiRankedResort } from "@/types/api";
import { useUser } from "@/context/user-context";
import type { DriveRadius } from "@/types/user";

// ── Helpers ────────────────────────────────────────────────────

// Derive a fallback verdict when go_no_go is missing from the API response
function deriveVerdict(
  conditions: string,
  forecastInches: number,
): { verdict: "go" | "maybe" | "skip"; label: string } {
  if (forecastInches >= 8)
    return { verdict: "go", label: "Great conditions" };
  if (forecastInches >= 4 || conditions.toLowerCase().includes("snow"))
    return { verdict: "maybe", label: "Worth considering" };
  return { verdict: "skip", label: "Limited snow" };
}

// Convert DriveRadius to a numeric minute threshold for comparison
function driveRadiusToMinutes(dr: DriveRadius): number {
  if (dr === "fly") return Infinity;
  return dr;
}

// Verdict sort priority: go first, then maybe, then skip
const VERDICT_PRIORITY: Record<string, number> = { go: 0, maybe: 1, skip: 2 };

function resortVerdictPriority(r: ApiRankedResort): number {
  const v = resortVerdict(r).verdict;
  return VERDICT_PRIORITY[v] ?? 2;
}

// ── Dashboard ranking ──────────────────────────────────────────
// Re-ranks the flat API array (sorted by snowfall desc) into proximity-aware sections.
//
// Inputs: flat resort array from ranked endpoint, user's max drive minutes
// Outputs: topPick, yourResorts (nearby), worthTheDrive (farther with good snow)
// Side effects: none — pure function

interface DashboardSections {
  topPick: ApiRankedResort | null;
  yourResorts: ApiRankedResort[];
  worthTheDrive: ApiRankedResort[];
}

function rankForDashboard(
  resorts: ApiRankedResort[],
  maxDriveMinutes: DriveRadius,
): DashboardSections {
  const threshold = driveRadiusToMinutes(maxDriveMinutes);

  // Split into nearby (within drive limit) and farther
  const nearby: ApiRankedResort[] = [];
  const farther: ApiRankedResort[] = [];

  for (const r of resorts) {
    if (r.drive_time_minutes <= threshold) {
      nearby.push(r);
    } else {
      farther.push(r);
    }
  }

  // Fallback: if no resorts are within the drive radius (e.g. location not synced yet,
  // or API returned stale drive times), treat all resorts as nearby so the dashboard
  // isn't empty.
  const effective = nearby.length > 0 ? nearby : resorts;

  // Top pick = best snowfall among nearby; rest sorted by verdict then snowfall
  const topPick = effective[0] ?? null;
  const yourResorts = effective.slice(1).sort((a, b) => {
    const vDiff = resortVerdictPriority(a) - resortVerdictPriority(b);
    if (vDiff !== 0) return vDiff;
    return b.forecast_total_inches - a.forecast_total_inches;
  });

  // "Worth the Drive": only shown when we have real nearby data (not fallback)
  const bestNearbyInches = topPick?.forecast_total_inches ?? 0;
  const worthTheDrive = nearby.length > 0
    ? farther
        .filter((r) => r.forecast_total_inches >= 4 && r.forecast_total_inches > bestNearbyInches * 0.5)
        .sort((a, b) => {
          const vDiff = resortVerdictPriority(a) - resortVerdictPriority(b);
          if (vDiff !== 0) return vDiff;
          return b.forecast_total_inches - a.forecast_total_inches;
        })
        .slice(0, 5)
    : [];

  return { topPick, yourResorts, worthTheDrive };
}

// ── Resort data mapping ────────────────────────────────────────
// Extract verdict and weather from inline API fields, falling back to derived values

function resortVerdict(r: ApiRankedResort): { verdict: "go" | "maybe" | "skip"; label: string } {
  if (r.go_no_go) {
    return {
      verdict: goNoGoToVerdict(r.go_no_go.overall),
      label: r.go_no_go.summary,
    };
  }
  return deriveVerdict(r.conditions, r.forecast_total_inches);
}

function resortForecastData(r: ApiRankedResort): number[] {
  if (r.daily_forecast && r.daily_forecast.length > 0) {
    return r.daily_forecast.map((d) => cmToInches(d.snowfall));
  }
  return [r.snowfall_24h_inches];
}

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function resortDayLabels(r: ApiRankedResort): string[] | undefined {
  if (!r.daily_forecast || r.daily_forecast.length === 0) return undefined;
  return r.daily_forecast.map((d) => {
    const day = new Date(d.date + "T12:00:00").getDay();
    return DAY_LETTERS[day];
  });
}

// 7-day snowfall total from daily_forecast, falling back to forecast_total_inches
function resort7DayTotal(r: ApiRankedResort): number {
  if (r.daily_forecast && r.daily_forecast.length > 0) {
    return Math.round(r.daily_forecast.reduce((sum, d) => sum + cmToInches(d.snowfall), 0) * 10) / 10;
  }
  return r.forecast_total_inches;
}

function resortWeather(r: ApiRankedResort): { highTemp: number; lowTemp: number; windMph: number } {
  if (r.weather) {
    return {
      highTemp: Math.round(r.weather.high),
      lowTemp: Math.round(r.weather.low),
      windMph: Math.round(r.weather.wind_speed),
    };
  }
  // Fallback placeholders when weather is missing
  return { highTemp: 25, lowTemp: 10, windMph: 15 };
}

// ── Page component ────────────────────────────────────────────

export default function DashboardPage() {
  const ranked = useRankedResorts("today");
  const worthKnowing = useWorthKnowing();
  const { user } = useUser();

  // Re-rank resorts by proximity + snowfall
  const sections = useMemo(() => {
    if (!ranked.data) return null;
    return rankForDashboard(ranked.data.resorts, user.max_drive_minutes);
  }, [ranked.data, user.max_drive_minutes]);

  // Build hero data from top pick
  const hero = useMemo(() => {
    const r = sections?.topPick;
    if (!r) return null;

    const pass = primaryPass(r.passes);
    const weather = resortWeather(r);

    return {
      resortName: r.name,
      slug: r.slug,
      pass,
      snowfall: `${Math.round(resort7DayTotal(r))}"`,
      highTemp: weather.highTemp,
      lowTemp: weather.lowTemp,
      windMph: weather.windMph,
      travel: `${r.drive_time_minutes} min`,
      verdict: "go" as const,
      forecastData: resortForecastData(r),
      dayLabels: resortDayLabels(r),
    };
  }, [sections?.topPick]);

  // Build "Your Resorts" rows (nearby resorts below the hero)
  const yourResorts = useMemo(() => {
    if (!sections) return [];
    return sections.yourResorts.map((r: ApiRankedResort) => {
      const pass = primaryPass(r.passes);
      const v = resortVerdict(r);
      const w = resortWeather(r);
      return {
        resortName: r.name,
        slug: r.slug,
        pass,
        snowfall: `${Math.round(resort7DayTotal(r))}"`,
        highTemp: w.highTemp,
        lowTemp: w.lowTemp,
        windMph: w.windMph,
        date: r.conditions,
        verdict: v.verdict,
        driveMinutes: r.drive_time_minutes,
        forecastData: resortForecastData(r),
        dayLabels: resortDayLabels(r),
      };
    });
  }, [sections]);

  // Build "Worth the Drive" rows (farther resorts with good snow)
  const worthTheDrive = useMemo(() => {
    if (!sections) return [];
    return sections.worthTheDrive.map((r: ApiRankedResort) => {
      const pass = primaryPass(r.passes);
      const v = resortVerdict(r);
      const w = resortWeather(r);
      return {
        resortName: r.name,
        slug: r.slug,
        pass,
        snowfall: `${Math.round(resort7DayTotal(r))}"`,
        highTemp: w.highTemp,
        lowTemp: w.lowTemp,
        windMph: w.windMph,
        date: r.conditions,
        verdict: v.verdict,
        driveMinutes: r.drive_time_minutes,
        forecastData: resortForecastData(r),
        dayLabels: resortDayLabels(r),
      };
    });
  }, [sections]);

  // Worth-knowing teasers
  const teasers = worthKnowing.data?.resorts ?? [];

  const isLoading = ranked.loading;
  const fetchedAt = ranked.data?._meta.fetchedAt;

  return (
    <ScreenContainer>
      <div className="space-y-5">
        {/* Updated time */}
        {fetchedAt && (
          <div className="text-[10px] text-snow-text-muted text-right">
            Updated {formatFetchedAt(fetchedAt)}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-36 rounded-2xl bg-snow-surface-raised" />
            <div className="h-14 rounded-xl bg-snow-surface-raised" />
            <div className="h-14 rounded-xl bg-snow-surface-raised" />
            <div className="h-14 rounded-xl bg-snow-surface-raised" />
          </div>
        )}

        {/* Error state */}
        {ranked.error && !ranked.data && (
          <div className="text-center py-8">
            <p className="text-sm text-snow-text-muted mb-2">
              Couldn&apos;t load conditions
            </p>
            <button
              onClick={ranked.refetch}
              className="text-xs text-snow-primary hover:underline"
            >
              Tap to retry
            </button>
          </div>
        )}

        {/* Hero card — best resort within user's drive radius */}
        {!isLoading && hero && (
          <HeroCard
            resortName={hero.resortName}
            pass={hero.pass}
            snowfall={hero.snowfall}
            highTemp={hero.highTemp}
            lowTemp={hero.lowTemp}
            windMph={hero.windMph}
            travel={hero.travel}
            verdict={hero.verdict}
            slug={hero.slug}
            forecastData={hero.forecastData}
            dayLabels={hero.dayLabels}
          />
        )}

        {/* Your Resorts — nearby resorts sorted by snowfall */}
        {!isLoading && yourResorts.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-2">
              Your Resorts
            </h2>
            <div className="space-y-0.5">
              {yourResorts.map((c) => (
                <ConditionsRow
                  key={c.slug}
                  date={c.date}
                  resortName={c.resortName}
                  pass={c.pass}
                  snowfall={c.snowfall}
                  highTemp={c.highTemp}
                  lowTemp={c.lowTemp}
                  windMph={c.windMph}
                  verdict={c.verdict}
                  slug={c.slug}
                  forecastData={c.forecastData}
                  dayLabels={c.dayLabels}
                />
              ))}
            </div>
          </div>
        )}

        {/* Worth the Drive — farther resorts with significantly more snow */}
        {!isLoading && worthTheDrive.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-2">
              Worth the Drive
            </h2>
            <div className="space-y-0.5">
              {worthTheDrive.map((c) => (
                <ConditionsRow
                  key={c.slug}
                  date={c.date}
                  resortName={c.resortName}
                  pass={c.pass}
                  snowfall={c.snowfall}
                  highTemp={c.highTemp}
                  lowTemp={c.lowTemp}
                  windMph={c.windMph}
                  verdict={c.verdict}
                  slug={c.slug}
                  driveMinutes={c.driveMinutes}
                  forecastData={c.forecastData}
                  dayLabels={c.dayLabels}
                />
              ))}
            </div>
          </div>
        )}

        {/* Getting snow elsewhere (worth-knowing) */}
        {!isLoading && teasers.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-2">
              Getting snow elsewhere
            </h2>
            <div className="space-y-0.5">
              {teasers.map((t) => {
                const pass = primaryPass(t.passes);
                return (
                  <Link
                    key={t.slug}
                    href={`/resorts/${t.slug}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-snow-surface-hover active:bg-snow-surface-hover transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-snow-text truncate">
                          {t.name}
                        </span>
                        <PassBadge pass={pass} />
                        {t.isOnPass && (
                          <span className="text-[10px] text-snow-go">
                            On pass
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-snow-text-muted mt-0.5">
                        <span>{Math.round(t.distanceMiles)} mi away</span>
                        <span>
                          +{Math.round(t.differentialInches)}&quot; vs your best
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-snow-text tabular-nums flex-shrink-0">
                      {Math.round(t.forecastInches)}&quot;
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
