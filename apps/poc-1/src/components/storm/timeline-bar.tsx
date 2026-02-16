import { HourlySnowfall } from "@/types/storm";

interface TimelineBarProps {
  hourlyData: HourlySnowfall[];
}

export function TimelineBar({ hourlyData }: TimelineBarProps) {
  const maxInches = Math.max(...hourlyData.map((h) => h.inches), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-24">
        {hourlyData.map((hour, i) => {
          const heightPct = (hour.inches / maxInches) * 100;
          const colors = {
            light: "bg-snow-primary/40",
            moderate: "bg-snow-primary/70",
            heavy: "bg-snow-primary",
          };
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end h-20">
                <div
                  className={`w-full rounded-t ${colors[hour.intensity]} transition-all`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1">
        {hourlyData.map((hour, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[10px] text-snow-text-muted">{hour.hour}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-snow-text-muted mt-2">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-snow-primary/40" /> Light</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-snow-primary/70" /> Moderate</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-snow-primary" /> Heavy</div>
      </div>
    </div>
  );
}
