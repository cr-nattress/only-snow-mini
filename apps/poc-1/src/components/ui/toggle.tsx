"use client";

interface ToggleProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
  label?: string;
}

export function Toggle({ enabled, onToggle, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onToggle(!enabled)}
      className="flex items-center gap-3 active:scale-[0.97] transition-transform duration-150"
    >
      {label && <span className="text-snow-text text-sm">{label}</span>}
      <div
        className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${
          enabled ? "bg-snow-primary" : "bg-snow-border"
        }`}
      >
        <div
          className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? "translate-x-[22px]" : "translate-x-[3px]"
          }`}
        />
      </div>
    </button>
  );
}
