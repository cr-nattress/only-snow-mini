// Terrain and resort info section for resort detail page.
// Inputs: ApiResortDetail with terrain, elevation, features, pricing, passes
// Outputs: terrain breakdown bar, stats grid, features, pricing, passes
// Side effects: none
// Error behavior: gracefully handles null/missing optional fields

import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { PassBadge } from "@/components/ui/pass-badge";
import type { ApiResortDetail } from "@/types/api";

interface TerrainSectionProps {
  resort: ApiResortDetail;
}

const TERRAIN_COLORS = {
  beginner: "bg-emerald-500",
  intermediate: "bg-blue-500",
  advanced: "bg-gray-900",
  expert: "bg-orange-500",
};

const TERRAIN_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export function TerrainSection({ resort }: TerrainSectionProps) {
  const { terrain, elevation } = resort;
  const breakdown = terrain.breakdown;
  const segments = [
    { key: "beginner", pct: breakdown.beginner },
    { key: "intermediate", pct: breakdown.intermediate },
    { key: "advanced", pct: breakdown.advanced },
    ...(breakdown.expert ? [{ key: "expert", pct: breakdown.expert }] : []),
  ];

  return (
    <div className="space-y-3">
      {/* Terrain breakdown */}
      <Card>
        <h3 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-3">Terrain</h3>

        {/* Stacked bar */}
        <div className="flex h-3 rounded-full overflow-hidden mb-2">
          {segments.map((seg) => (
            <div
              key={seg.key}
              className={`${TERRAIN_COLORS[seg.key as keyof typeof TERRAIN_COLORS]} transition-all`}
              style={{ width: `${seg.pct}%` }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {segments.map((seg) => (
            <div key={seg.key} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${TERRAIN_COLORS[seg.key as keyof typeof TERRAIN_COLORS]}`} />
              <span className="text-[10px] text-snow-text-muted">
                {TERRAIN_LABELS[seg.key]} {seg.pct}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats grid */}
      <Card>
        <h3 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-3">Resort Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Skiable Acres" value={terrain.acres.toLocaleString()} />
          <Stat label="Trails" value={terrain.trails.toString()} />
          <Stat label="Lifts" value={terrain.lifts.toString()} />
          <Stat label="Vertical" value={`${elevation.vertical.toLocaleString()}'`} />
          <Stat label="Base" value={`${elevation.base.toLocaleString()}'`} />
          <Stat label="Summit" value={`${elevation.summit.toLocaleString()}'`} />
        </div>
      </Card>

      {/* Features */}
      {resort.features.length > 0 && (
        <Card>
          <h3 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-2">Features</h3>
          <div className="flex flex-wrap gap-1.5">
            {resort.features.map((f) => (
              <Chip key={f} label={f} />
            ))}
          </div>
        </Card>
      )}

      {/* Pricing + passes */}
      <Card>
        <h3 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-3">Pricing & Passes</h3>
        {resort.walkUpPricing?.adult != null && (
          <div className="mb-3">
            <span className="text-lg font-bold text-snow-text">${resort.walkUpPricing.adult}</span>
            <span className="text-xs text-snow-text-muted ml-1">adult walk-up</span>
            {resort.walkUpPricing.dynamicPricing && (
              <p className="text-[10px] text-snow-text-muted mt-0.5">Dynamic pricing — actual price may vary</p>
            )}
          </div>
        )}
        {resort.passes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resort.passes.map((p) => (
              <PassBadge key={p} pass={p} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-snow-text-muted uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold text-snow-text">{value}</div>
    </div>
  );
}
