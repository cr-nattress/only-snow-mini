import { ChevronRight } from "lucide-react";

interface ProfileSectionProps {
  title: string;
  value: string;
  onClick?: () => void;
}

export function ProfileSection({ title, value, onClick }: ProfileSectionProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl bg-snow-surface-raised border border-snow-border px-3 py-2.5 ${onClick ? "cursor-pointer hover:border-snow-primary/40 transition-colors" : ""}`}
      onClick={onClick}
    >
      <div className="min-w-0">
        <div className="text-[11px] text-snow-text-muted uppercase tracking-wider">{title}</div>
        <div className="text-sm font-medium text-snow-text">{value}</div>
      </div>
      {onClick && <ChevronRight className="w-4 h-4 text-snow-text-muted flex-shrink-0" />}
    </div>
  );
}
