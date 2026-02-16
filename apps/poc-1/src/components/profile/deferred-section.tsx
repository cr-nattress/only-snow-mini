"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

interface DeferredSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  completed?: boolean;
}

export function DeferredSection({ title, description, children, completed = false }: DeferredSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl bg-snow-surface-raised border border-snow-border overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left px-3 py-2.5"
      >
        <div className="flex items-center gap-2 min-w-0">
          {completed ? (
            <Check className="w-4 h-4 text-snow-go flex-shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-snow-border flex-shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium text-snow-text">{title}</div>
            <div className="text-[11px] text-snow-text-muted">{description}</div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-snow-text-muted flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-snow-text-muted flex-shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-snow-border">
          {children}
        </div>
      )}
    </div>
  );
}
