"use client";

import { useState, useRef, useEffect } from "react";
import { Flag, ChevronDown, X } from "lucide-react";

// Full state/province name lookup for display in the dropdown
const STATE_NAMES: Record<string, string> = {
  AK: "Alaska",
  AZ: "Arizona",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  IA: "Iowa",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  MA: "Massachusetts",
  ME: "Maine",
  MI: "Michigan",
  MN: "Minnesota",
  MO: "Missouri",
  MT: "Montana",
  NC: "North Carolina",
  ND: "North Dakota",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NV: "Nevada",
  NY: "New York",
  OH: "Ohio",
  OR: "Oregon",
  PA: "Pennsylvania",
  SD: "South Dakota",
  TN: "Tennessee",
  UT: "Utah",
  VA: "Virginia",
  VT: "Vermont",
  WA: "Washington",
  WI: "Wisconsin",
  WV: "West Virginia",
  WY: "Wyoming",
  AB: "Alberta",
  BC: "British Columbia",
};

interface StateSelectProps {
  states: string[];
  selected: string | null;
  onSelect: (state: string | null) => void;
}

export function StateSelect({ states, selected, onSelect }: StateSelectProps) {
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
        <Flag className="w-3.5 h-3.5" />
        <span className="truncate max-w-[120px]">
          {selected ? (STATE_NAMES[selected] ?? selected) : "State"}
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
        <div className="absolute top-full left-0 mt-1 w-52 max-h-64 overflow-y-auto bg-snow-surface-raised border border-snow-border rounded-xl shadow-lg z-20">
          {states.map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => { onSelect(state); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                selected === state
                  ? "bg-snow-primary/15 text-snow-primary font-medium"
                  : "text-snow-text hover:bg-snow-surface-hover"
              }`}
            >
              {STATE_NAMES[state] ?? state}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
