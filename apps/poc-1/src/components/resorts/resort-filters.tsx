"use client";

import { Chip } from "@/components/ui/chip";

interface ResortFiltersProps {
  filters: {
    myPassOnly: boolean;
    under1hr: boolean;
    sixPlusInches: boolean;
  };
  onToggle: (key: "myPassOnly" | "under1hr" | "sixPlusInches") => void;
}

export function ResortFilters({ filters, onToggle }: ResortFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Chip
        label="My pass only"
        selected={filters.myPassOnly}
        onClick={() => onToggle("myPassOnly")}
      />
      <Chip
        label="Nearby (under 1hr)"
        selected={filters.under1hr}
        onClick={() => onToggle("under1hr")}
      />
      <Chip
        label='6"+ expected'
        selected={filters.sixPlusInches}
        onClick={() => onToggle("sixPlusInches")}
      />
    </div>
  );
}
