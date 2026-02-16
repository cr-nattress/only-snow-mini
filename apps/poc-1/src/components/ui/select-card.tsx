"use client";

import { Check } from "lucide-react";

interface SelectCardProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  description?: string;
}

export function SelectCard({ label, selected = false, onClick, icon, description }: SelectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-150 active:scale-[0.98] ${
        selected
          ? "bg-snow-primary/10 border border-snow-primary"
          : "bg-snow-surface-raised border border-snow-border hover:border-snow-primary/40"
      }`}
    >
      {icon && <span className="text-snow-text-muted flex-shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-snow-text">{label}</div>
        {description && (
          <div className="text-sm text-snow-text-muted mt-0.5">{description}</div>
        )}
      </div>
      {selected && (
        <Check className="w-5 h-5 text-snow-primary flex-shrink-0" />
      )}
    </button>
  );
}
