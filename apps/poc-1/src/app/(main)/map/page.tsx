"use client";

// Map page — interactive map view with resort pins colored by Go/Maybe/Skip verdict.
// Inputs: ranked resort data from API, user home location from context
// Outputs: map with filtered/colored pins, period switcher, verdict/pass filters
// Side effects: API fetch via useRankedResorts hook
// Error behavior: loading skeleton, error with retry, empty state when no resorts match

import { useState, useMemo, useSyncExternalStore } from "react";
import { ScreenContainer } from "@/components/layout/screen-container";
import { ResortMap, type ResortMapItem } from "@/components/map/resort-map";
import { PassSelect } from "@/components/resorts/pass-select";
import { Chip } from "@/components/ui/chip";
import { useUser } from "@/context/user-context";
import { useRankedResorts } from "@/hooks/use-api";
import { primaryPass, cmToInches, goNoGoToVerdict } from "@/lib/api/transforms";
import { getResortCoordinates } from "@/data/resort-coordinates";
import { PassType } from "@/types/user";
import type { ApiRankedResort } from "@/types/api";

const noopSubscribe = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

type VerdictFilter = "all" | "go" | "maybe_plus";

function apiResortToMapItem(r: ApiRankedResort): ResortMapItem | null {
  const coords = getResortCoordinates(r.slug);
  if (!coords) return null;

  const verdict = r.go_no_go
    ? goNoGoToVerdict(r.go_no_go.overall)
    : "skip";

  const snowfall = r.daily_forecast
    ? Math.round(r.daily_forecast.reduce((sum, d) => sum + cmToInches(d.snowfall), 0) * 10) / 10
    : r.forecast_total_inches;

  return {
    slug: r.slug,
    name: r.name,
    pass: primaryPass(r.passes),
    verdict,
    snowfall,
    driveMinutes: r.drive_time_minutes,
    lat: coords.lat,
    lon: coords.lon,
  };
}

export default function MapPage() {
  const { user } = useUser();
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>("all");
  const isMounted = useSyncExternalStore(noopSubscribe, getTrue, getFalse);
  const userDefaultPass =
    isMounted && user.passes.length > 0 && user.passes[0] !== "none"
      ? user.passes[0]
      : null;
  const [passOverride, setPassOverride] = useState<PassType | null | undefined>(undefined);
  const selectedPass = passOverride !== undefined ? passOverride : userDefaultPass;
  const setSelectedPass = (pass: PassType | null) => setPassOverride(pass);

  const { data: rankedData, loading, error, refetch } = useRankedResorts("today");

  const allMapItems = useMemo(() => {
    const resorts = rankedData?.resorts ?? [];
    return resorts.map(apiResortToMapItem).filter((r): r is ResortMapItem => r !== null);
  }, [rankedData]);

  const filtered = useMemo(() => {
    return allMapItems.filter((r) => {
      if (selectedPass && r.pass !== selectedPass) return false;
      if (verdictFilter === "go" && r.verdict !== "go") return false;
      if (verdictFilter === "maybe_plus" && r.verdict === "skip") return false;
      return true;
    });
  }, [allMapItems, selectedPass, verdictFilter]);

  return (
    <ScreenContainer>
      <div className="space-y-3">
        <h1 className="text-lg font-bold text-snow-text">Map</h1>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Chip
            label="All"
            selected={verdictFilter === "all"}
            onClick={() => setVerdictFilter("all")}
          />
          <Chip
            label="Go"
            selected={verdictFilter === "go"}
            onClick={() => setVerdictFilter("go")}
          />
          <Chip
            label="Maybe+"
            selected={verdictFilter === "maybe_plus"}
            onClick={() => setVerdictFilter("maybe_plus")}
          />
          <PassSelect
            selected={selectedPass}
            onSelect={setSelectedPass}
            defaultLabel={isMounted && user.passes.length > 0 ? "My Pass" : "Pass"}
          />
          <span className="text-[11px] text-snow-text-muted ml-auto">{filtered.length} resorts</span>
        </div>

        {/* Map or loading/error states */}
        {loading && (
          <div className="h-[calc(100vh-12rem)] rounded-xl bg-snow-surface-raised animate-pulse flex items-center justify-center">
            <span className="text-sm text-snow-text-muted">Loading resorts...</span>
          </div>
        )}

        {error && !rankedData && (
          <div className="text-center py-8">
            <p className="text-sm text-snow-text-muted mb-2">Couldn&apos;t load resorts</p>
            <button onClick={refetch} className="text-xs text-snow-primary hover:underline">
              Tap to retry
            </button>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="h-[calc(100vh-12rem)] rounded-xl bg-snow-surface-raised flex items-center justify-center">
            <span className="text-sm text-snow-text-muted">No resorts match your filters.</span>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <ResortMap
            resorts={filtered}
            homeLocation={user.home_location}
          />
        )}
      </div>
    </ScreenContainer>
  );
}
