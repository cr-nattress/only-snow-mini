"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { ScreenContainer } from "@/components/layout/screen-container";
import { ResortRow } from "@/components/resorts/resort-row";
import { RegionSelect } from "@/components/resorts/region-select";
import { StateSelect } from "@/components/resorts/state-select";
import { PassSelect } from "@/components/resorts/pass-select";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/user-context";
import { useRankedResorts, formatFetchedAt } from "@/hooks/use-api";
import { primaryPass, apiRegionToPocRegion, cmToInches } from "@/lib/api/transforms";
import { type Region, REGION_LABELS } from "@/types/resort";
import { PassType } from "@/types/user";
import type { ApiRankedPeriod, ApiRankedResort } from "@/types/api";

const noopSubscribe = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

const PERIODS: { value: ApiRankedPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "weekend", label: "Weekend" },
  { value: "5d", label: "5 Day" },
  { value: "10d", label: "10 Day" },
];

interface Filters {
  under1hr: boolean;
  sixPlusInches: boolean;
}

interface ResortWithData {
  slug: string;
  name: string;
  pass: string;
  region: Region;
  state: string;
  driveMinutes: number;
  snowfall: number;
  forecastData: number[];
  dayLabels: string[];
  powderScore: number;
  highTemp: number | null;
  conditions: string;
  terrainOpenPct: number;
  baseDepth: number;
}

function apiResortToRow(r: ApiRankedResort, index: number, total: number): ResortWithData {
  const region = apiRegionToPocRegion(r.region);
  const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
  const forecastData = r.daily_forecast
    ? r.daily_forecast.map((d) => cmToInches(d.snowfall))
    : [r.snowfall_24h_inches];
  const dayLabels = r.daily_forecast
    ? r.daily_forecast.map((d) => DAY_LETTERS[new Date(d.date + "T12:00:00").getDay()])
    : [];
  const powderScore = total <= 1 ? 30 : Math.round(35 - (index / (total - 1)) * 20);
  return {
    slug: r.slug,
    name: r.name,
    pass: primaryPass(r.passes),
    region,
    state: r.state,
    driveMinutes: r.drive_time_minutes,
    snowfall: r.daily_forecast
      ? Math.round(r.daily_forecast.reduce((sum, d) => sum + cmToInches(d.snowfall), 0) * 10) / 10
      : r.forecast_total_inches,
    forecastData,
    dayLabels,
    powderScore,
    highTemp: r.weather ? Math.round(r.weather.high) : null,
    conditions: r.conditions,
    terrainOpenPct: r.terrain_open_pct,
    baseDepth: r.base_depth,
  };
}

export default function ResortsPage() {
  const { user } = useUser();
  const [period, setPeriod] = useState<ApiRankedPeriod>("today");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    under1hr: false,
    sixPlusInches: false,
  });
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const isMounted = useSyncExternalStore(noopSubscribe, getTrue, getFalse);
  const userDefaultPass =
    isMounted && user.passes.length > 0 && user.passes[0] !== "none"
      ? user.passes[0]
      : null;
  const [passOverride, setPassOverride] = useState<PassType | null | undefined>(undefined);
  const selectedPass = passOverride !== undefined ? passOverride : userDefaultPass;
  const setSelectedPass = (pass: PassType | null) => setPassOverride(pass);
  const [expandedRegions, setExpandedRegions] = useState<Set<Region>>(new Set());

  const { data: rankedData, loading, error, refetch } = useRankedResorts(period);

  const toggleFilter = (key: keyof Filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRegionExpand = (region: Region) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  const allResortData = useMemo(() => {
    const resorts = rankedData?.resorts ?? [];
    return resorts.map((r, i) => apiResortToRow(r, i, resorts.length));
  }, [rankedData]);

  const availableStates = useMemo(() => {
    const states = new Set(allResortData.map((r) => r.state));
    return [...states].sort();
  }, [allResortData]);

  const searched = useMemo(() => {
    if (!query.trim()) return allResortData;
    const q = query.toLowerCase();
    return allResortData.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        REGION_LABELS[r.region].toLowerCase().includes(q),
    );
  }, [allResortData, query]);

  const filtered = useMemo(() => {
    return searched.filter((r) => {
      if (selectedPass && r.pass !== selectedPass) return false;
      if (filters.under1hr && r.driveMinutes > 60) return false;
      if (filters.sixPlusInches && r.snowfall < 6) return false;
      if (selectedRegion && r.region !== selectedRegion) return false;
      if (selectedState && r.state !== selectedState) return false;
      return true;
    });
  }, [searched, filters, selectedRegion, selectedState, selectedPass]);

  const isSearching = query.trim().length > 0;
  const hasActiveFilters =
    selectedPass !== null || filters.under1hr || filters.sixPlusInches || selectedRegion !== null || selectedState !== null;

  const nearbyResorts = useMemo(() => {
    return filtered
      .filter((r) => r.driveMinutes > 0)
      .sort((a, b) => a.driveMinutes - b.driveMinutes)
      .slice(0, 8);
  }, [filtered]);

  const topConditions = useMemo(() => {
    return [...filtered].sort((a, b) => b.powderScore - a.powderScore).slice(0, 10);
  }, [filtered]);

  const byRegion = useMemo(() => {
    const map = new Map<Region, ResortWithData[]>();
    for (const item of filtered) {
      if (!map.has(item.region)) map.set(item.region, []);
      map.get(item.region)!.push(item);
    }
    for (const [, resorts] of map) {
      resorts.sort((a, b) => b.powderScore - a.powderScore);
    }
    return map;
  }, [filtered]);

  const availableRegions: Region[] = [
    "pacific_northwest",
    "northeast",
    "northern_rockies",
    "southwest",
    "midwest",
    "southeast",
    "canada_west",
  ];

  const snowfallLabel = "7 day";

  const renderResortRow = (r: ResortWithData) => (
    <ResortRow
      key={r.slug}
      name={r.name}
      pass={r.pass}
      driveMinutes={r.driveMinutes}
      snowfall={r.snowfall}
      snowfallLabel={snowfallLabel}
      forecastData={r.forecastData}
      dayLabels={r.dayLabels}
      state={r.state}
    />
  );

  const fetchedAt = rankedData?._meta.fetchedAt;

  return (
    <ScreenContainer>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-snow-text">Resorts</h1>
          {fetchedAt && (
            <span className="text-[10px] text-snow-text-muted">
              {formatFetchedAt(fetchedAt)}
            </span>
          )}
        </div>

        {/* Period switcher */}
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                period === p.value
                  ? "bg-snow-primary text-white"
                  : "bg-snow-surface-raised text-snow-text-muted border border-snow-border hover:border-snow-primary/40"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder="Search resorts, states, regions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex items-center gap-2 flex-wrap">
          <RegionSelect
            regions={availableRegions}
            selected={selectedRegion}
            onSelect={setSelectedRegion}
          />
          <StateSelect
            states={availableStates}
            selected={selectedState}
            onSelect={setSelectedState}
          />
          <PassSelect
            selected={selectedPass}
            onSelect={setSelectedPass}
            defaultLabel={isMounted && user.passes.length > 0 ? "My Pass" : "Pass"}
          />
          <Chip label="Nearby" selected={filters.under1hr} onClick={() => toggleFilter("under1hr")} />
          <Chip label='6"+' selected={filters.sixPlusInches} onClick={() => toggleFilter("sixPlusInches")} />
          <span className="text-[11px] text-snow-text-muted ml-auto">{filtered.length} resorts</span>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-snow-surface-raised" />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !rankedData && (
          <div className="text-center py-8">
            <p className="text-sm text-snow-text-muted mb-2">Couldn&apos;t load resorts</p>
            <button onClick={refetch} className="text-xs text-snow-primary hover:underline">
              Tap to retry
            </button>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-snow-text-muted">
            No resorts match your filters.
          </div>
        )}

        {!loading && (isSearching || hasActiveFilters) && filtered.length > 0 && (
          <div className="space-y-1.5">
            {filtered
              .sort((a, b) => b.powderScore - a.powderScore)
              .map(renderResortRow)}
          </div>
        )}

        {!loading && !isSearching && !hasActiveFilters && filtered.length > 0 && (
          <div className="space-y-5">
            {nearbyResorts.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-2">Nearby</h2>
                <div className="space-y-1.5">{nearbyResorts.map(renderResortRow)}</div>
              </section>
            )}

            <section>
              <h2 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-2">Top Conditions</h2>
              <div className="space-y-1.5">{topConditions.map(renderResortRow)}</div>
            </section>

            <section>
              <h2 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-2">Browse by Region</h2>
              <div className="space-y-1.5">
                {Array.from(byRegion.entries()).map(([region, resorts]) => {
                  const isExpanded = expandedRegions.has(region);
                  const topResort = resorts[0];
                  const totalSnow = resorts.reduce((s, r) => s + r.snowfall, 0);
                  const avgSnow = Math.round(totalSnow / resorts.length);
                  return (
                    <div key={region} className="bg-snow-surface-raised rounded-xl border border-snow-border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleRegionExpand(region)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-snow-text">{REGION_LABELS[region]}</div>
                          <div className="text-[11px] text-snow-text-muted">
                            {resorts.length} resort{resorts.length !== 1 ? "s" : ""} · avg {avgSnow}&quot; · best: {topResort.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-bold text-snow-primary">{topResort.powderScore}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-snow-text-muted" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-snow-text-muted" />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-2 pb-2 space-y-1">
                          {resorts.map(renderResortRow)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
