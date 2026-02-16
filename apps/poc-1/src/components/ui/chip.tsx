"use client";

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function Chip({ label, selected = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${
        selected
          ? "bg-snow-primary text-white shadow-sm shadow-snow-primary/20"
          : "bg-snow-surface-raised text-snow-text-muted border border-snow-border hover:border-snow-primary/40"
      }`}
    >
      {label}
    </button>
  );
}
