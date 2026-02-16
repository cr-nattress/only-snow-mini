// Renders a bar chart of daily snowfall values with day-of-week labels.
// Input: data (snowfall per day), optional dayLabels (single-letter day names)
// Output: bar chart with value labels above and day letters below

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

interface SparklineProps {
  data: number[];
  dayLabels?: string[];
}

export function Sparkline({ data, dayLabels }: SparklineProps) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-14 w-36">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
          <span className="text-[8px] leading-none text-snow-text-muted tabular-nums mb-0.5">
            {val >= 1 ? Math.round(val) : val > 0 ? "<1" : ""}
          </span>
          <div
            className="w-full bg-snow-primary/60 rounded-t min-h-[2px]"
            style={{ height: `${Math.max((val / max) * 100, 4)}%` }}
          />
          {dayLabels && dayLabels[i] && (
            <span className="text-[7px] leading-none text-snow-text-muted mt-0.5">
              {dayLabels[i]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// Helper to extract day-of-week letters from date strings (YYYY-MM-DD)
export function datesToDayLabels(dates: string[]): string[] {
  return dates.map((d) => {
    const day = new Date(d + "T12:00:00").getDay();
    return DAY_LETTERS[day];
  });
}
