// 7-day snowfall forecast bar chart for resort detail page.
// Inputs: forecast[] array of ApiWeatherForecastDay
// Outputs: horizontal bar chart with snowfall, temps, wind, precip per day
// Side effects: none
// Error behavior: returns null if forecast is empty

import { Card } from "@/components/ui/card";
import type { ApiWeatherForecastDay } from "@/types/api";

interface ForecastChartProps {
  forecast: ApiWeatherForecastDay[];
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ForecastChart({ forecast }: ForecastChartProps) {
  if (forecast.length === 0) return null;

  const maxSnow = Math.max(...forecast.map((d) => d.snowfall), 1);
  const bestDaySnow = Math.max(...forecast.map((d) => d.snowfall));

  return (
    <Card>
      <h3 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-3">7-Day Forecast</h3>
      <div className="flex gap-1">
        {forecast.map((day) => {
          const dayName = DAY_NAMES[new Date(day.date + "T12:00:00").getDay()];
          const barHeight = Math.max((day.snowfall / maxSnow) * 80, 4);
          const isBestDay = day.snowfall > 0 && day.snowfall === bestDaySnow;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              {/* Snowfall label */}
              <span className={`text-[10px] font-semibold tabular-nums ${
                day.snowfall > 0 ? "text-snow-text" : "text-snow-text-muted"
              }`}>
                {day.snowfall > 0 ? `${Math.round(day.snowfall)}"` : "—"}
              </span>

              {/* Bar */}
              <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
                <div
                  className={`w-full max-w-[28px] rounded-t-sm transition-all ${
                    isBestDay ? "bg-snow-go" : day.snowfall > 0 ? "bg-snow-primary" : "bg-snow-surface-raised"
                  }`}
                  style={{ height: barHeight }}
                />
              </div>

              {/* Day label */}
              <span className={`text-[10px] font-medium ${
                isBestDay ? "text-snow-go" : "text-snow-text-muted"
              }`}>
                {dayName}
              </span>

              {/* Temp */}
              <span className="text-[9px] text-snow-text-muted tabular-nums">
                {Math.round(day.high)}°/{Math.round(day.low)}°
              </span>

              {/* Wind */}
              <span className="text-[9px] text-snow-text-muted tabular-nums">
                {Math.round(day.wind.speed)}mph
              </span>

              {/* Precip chance */}
              <span className="text-[9px] text-snow-text-muted tabular-nums">
                {day.precipChance}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
