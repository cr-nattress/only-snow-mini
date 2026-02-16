"use client";

interface AlertSettingRowProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
}

export function AlertSettingRow({ label, options, selected, onSelect }: AlertSettingRowProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-snow-text">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-[0.97] ${
              selected === opt.value
                ? "bg-snow-primary text-white"
                : "bg-snow-surface text-snow-text-muted border border-snow-border hover:border-snow-primary/40"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
