"use client";

import { useState, useRef, useEffect } from "react";
import { Ticket, ChevronDown, X } from "lucide-react";
import { PassType } from "@/types/user";
import { PASS_OPTIONS } from "@/lib/constants";

const PASS_SHORT_LABELS: Record<string, string> = {
  epic: "Epic",
  ikon: "Ikon",
  indy: "Indy",
  mountain_collective: "Mtn Collective",
  resort_specific: "Resort Pass",
  none: "No Pass",
};

interface PassSelectProps {
  selected: PassType | null;
  onSelect: (pass: PassType | null) => void;
  defaultLabel?: string;
}

export function PassSelect({ selected, onSelect, defaultLabel = "Pass" }: PassSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const label = selected ? (PASS_SHORT_LABELS[selected] ?? selected) : defaultLabel;

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
        <Ticket className="w-3.5 h-3.5" />
        <span className="truncate max-w-[100px]">{label}</span>
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
        <div className="absolute top-full left-0 mt-1 w-48 bg-snow-surface-raised border border-snow-border rounded-xl shadow-lg overflow-hidden z-20">
          {PASS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onSelect(opt.value as PassType); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                selected === opt.value
                  ? "bg-snow-primary/15 text-snow-primary font-medium"
                  : "text-snow-text hover:bg-snow-surface-hover"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
