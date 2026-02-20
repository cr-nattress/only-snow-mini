"use client";

// Interactive map displaying resort pins colored by verdict.
// Inputs: array of resort map items with coordinates, verdict, snowfall, etc.
// Outputs: Leaflet map with CircleMarkers, Popups, and user home marker
// Side effects: loads Leaflet CSS, renders dynamic map
// Error behavior: skips resorts without coordinates

import { useEffect, useState } from "react";
import Link from "next/link";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { PassBadge } from "@/components/ui/pass-badge";
import type { UserLocation } from "@/types/user";

export interface ResortMapItem {
  slug: string;
  name: string;
  pass: string;
  verdict: "go" | "maybe" | "skip";
  snowfall: number;
  driveMinutes: number;
  lat: number;
  lon: number;
}

interface ResortMapProps {
  resorts: ResortMapItem[];
  homeLocation: UserLocation | null;
}

const VERDICT_COLORS: Record<string, string> = {
  go: "#10B981",
  maybe: "#F59E0B",
  skip: "#64748B",
};

const US_CENTER = { lat: 39.8, lng: -98.5 };
const DEFAULT_ZOOM = 4;
const HOME_ZOOM = 7;

export function ResortMap({ resorts, homeLocation }: ResortMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [leafletModules, setLeafletModules] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    CircleMarker: typeof import("react-leaflet").CircleMarker;
    Popup: typeof import("react-leaflet").Popup;
    Marker: typeof import("react-leaflet").Marker;
  } | null>(null);

  // Dynamic import to avoid SSR issues with Leaflet
  useEffect(() => {
    // Inject Leaflet CSS via link tag
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("react-leaflet").then((rl) => {
      setLeafletModules({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        CircleMarker: rl.CircleMarker,
        Popup: rl.Popup,
        Marker: rl.Marker,
      });
      setMapReady(true);
    });
  }, []);

  if (!mapReady || !leafletModules) {
    return (
      <div className="h-[calc(100vh-12rem)] rounded-xl bg-snow-surface-raised animate-pulse flex items-center justify-center">
        <span className="text-sm text-snow-text-muted">Loading map...</span>
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = leafletModules;

  const center = US_CENTER;
  const zoom = DEFAULT_ZOOM;

  // Scale pin radius by snowfall (min 5, max 14)
  function pinRadius(snowfall: number): number {
    return Math.max(5, Math.min(14, 5 + snowfall * 0.5));
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className="h-[calc(100vh-12rem)] rounded-xl z-0"
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {resorts.map((resort) => (
        <CircleMarker
          key={resort.slug}
          center={[resort.lat, resort.lon]}
          radius={pinRadius(resort.snowfall)}
          pathOptions={{
            fillColor: VERDICT_COLORS[resort.verdict] ?? VERDICT_COLORS.skip,
            fillOpacity: 0.85,
            color: VERDICT_COLORS[resort.verdict] ?? VERDICT_COLORS.skip,
            weight: 1.5,
            opacity: 0.6,
          }}
        >
          <Popup className="resort-popup">
            <div className="space-y-1.5 min-w-[160px]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-snow-text">{resort.name}</span>
                <PassBadge pass={resort.pass} />
              </div>
              <div className="flex items-center gap-2">
                <VerdictBadge verdict={resort.verdict} size="sm" />
                <span className="text-xs text-snow-text-muted">{Math.round(resort.snowfall)}&quot;</span>
              </div>
              {resort.driveMinutes > 0 && (
                <p className="text-[11px] text-snow-text-muted">
                  {resort.driveMinutes < 60
                    ? `${resort.driveMinutes}m drive`
                    : `${Math.round(resort.driveMinutes / 60 * 10) / 10}h drive`}
                </p>
              )}
              <Link
                href={`/resorts/${resort.slug}`}
                className="block text-xs text-snow-primary hover:underline mt-1"
              >
                View Details →
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
