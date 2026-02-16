"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, X } from "lucide-react";
import { Region, REGION_LABELS } from "@/types/resort";

interface RegionSelectProps {
  regions: Region[];
  selected: Region | null;
  onSelect: (region: Region | null) => void;
}

export function RegionSelect({ regions, selected, onSelect }: RegionSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${
          selected
            ? "bg-snow-primary text-white shadow-sm shadow-snow-primary/20"
            : "bg-snow-surface-raised text-snow-text-muted border border-snow-border hover:border-snow-primary/40"
        }`}
      >
        <MapPin className="w-3.5 h-3.5" />
        <span className="truncate max-w-[120px]">
          {selected ? REGION_LABELS[selected] : "Region"}
        </span>
        {selected ? (
          <X
            className="w-3.5 h-3.5 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); onSelect(null); }}
          />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-snow-surface-raised border border-snow-border rounded-xl shadow-lg overflow-hidden z-20">
          {regions.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => { onSelect(region); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                selected === region
                  ? "bg-snow-primary/15 text-snow-primary font-medium"
                  : "text-snow-text hover:bg-snow-surface-hover"
              }`}
            >
              {REGION_LABELS[region]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
