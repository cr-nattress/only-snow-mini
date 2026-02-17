"use client";

// Resort detail page — shows current conditions, forecast, and terrain info for a single resort.
// Inputs: slug from URL params
// Outputs: full resort detail view with conditions, forecast chart, and terrain sections
// Side effects: API fetch via useResortDetail hook
// Error behavior: loading skeleton, error with retry button, 404 if resort not found

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { ScreenContainer } from "@/components/layout/screen-container";
import { ConditionsSection } from "@/components/resorts/resort-detail/conditions-section";
import { ForecastChart } from "@/components/resorts/resort-detail/forecast-chart";
import { SeasonSection } from "@/components/resorts/resort-detail/season-section";
import { WebcamSection } from "@/components/resorts/resort-detail/webcam-section";
import { TerrainSection } from "@/components/resorts/resort-detail/terrain-section";
import { useResortDetail } from "@/hooks/use-api";

export default function ResortDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data, loading, error, refetch } = useResortDetail(slug, "imperial");

  if (loading) {
    return (
      <ScreenContainer>
        <div className="space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-snow-surface-raised" />
            <div className="h-6 w-48 rounded bg-snow-surface-raised" />
          </div>
          <div className="h-24 rounded-2xl bg-snow-surface-raised" />
          <div className="h-16 rounded-2xl bg-snow-surface-raised" />
          <div className="h-48 rounded-2xl bg-snow-surface-raised" />
          <div className="h-32 rounded-2xl bg-snow-surface-raised" />
        </div>
      </ScreenContainer>
    );
  }

  if (error || !data) {
    return (
      <ScreenContainer>
        <div className="space-y-4">
          <button onClick={() => router.back()} className="text-snow-text-muted hover:text-snow-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center py-12">
            <p className="text-sm text-snow-text-muted mb-3">
              {error ? "Couldn\u2019t load resort details" : "Resort not found"}
            </p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-1.5 text-xs text-snow-primary hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tap to retry
            </button>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  const { resort, weather, goNoGo, driveTimeMinutes } = data;

  return (
    <ScreenContainer>
      <div className="space-y-4">
        {/* Header with back button */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-snow-text-muted hover:text-snow-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-snow-text truncate">{resort.name}</h1>
            <p className="text-xs text-snow-text-muted">{resort.region} · {resort.state}</p>
          </div>
        </div>

        <ConditionsSection
          weather={weather}
          goNoGo={goNoGo}
          driveTimeMinutes={driveTimeMinutes}
          passes={resort.passes}
        />

        <ForecastChart forecast={weather.forecast} />

        <WebcamSection slug={slug} />

        <SeasonSection avgSnowfall={resort.avgSnowfall} baseDepth={0} />

        <TerrainSection resort={resort} slug={slug} websiteUrl={resort.websiteUrl} />
      </div>
    </ScreenContainer>
  );
}
