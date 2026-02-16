// Current conditions section for resort detail page.
// Inputs: weather data, go/no-go assessment, drive time, passes
// Outputs: verdict badge, go/no-go factors, weather grid, drive time, snow stats
// Side effects: none
// Error behavior: graceful fallback for missing optional fields

import { Check, X, AlertTriangle, Clock, Snowflake, Wind, Thermometer, Eye, Droplets } from "lucide-react";
import { Card } from "@/components/ui/card";
import { VerdictBadge } from "@/components/ui/verdict-badge";
import { PassBadge } from "@/components/ui/pass-badge";
import { goNoGoToVerdict } from "@/lib/api/transforms";
import type { ApiWeatherCurrent, ApiWeatherForecastDay, ApiGoNoGoAssessment, ApiGoNoGoFactor } from "@/types/api";

interface ConditionsSectionProps {
  weather: ApiWeatherCurrent & {
    forecast: ApiWeatherForecastDay[];
    alerts: unknown[];
  };
  goNoGo: ApiGoNoGoAssessment;
  driveTimeMinutes: number;
  passes: string[];
}

const FACTOR_ICONS: Record<ApiGoNoGoFactor["status"], { icon: typeof Check; color: string }> = {
  go: { icon: Check, color: "text-snow-go" },
  "no-go": { icon: X, color: "text-snow-skip" },
  conditional: { icon: AlertTriangle, color: "text-snow-maybe" },
};

export function ConditionsSection({ weather, goNoGo, driveTimeMinutes, passes }: ConditionsSectionProps) {
  const verdict = goNoGoToVerdict(goNoGo.overall);
  const todaySnow = weather.forecast[0]?.snowfall ?? 0;

  return (
    <div className="space-y-3">
      {/* Verdict + summary */}
      <Card variant="highlighted">
        <div className="flex items-center gap-3 mb-2">
          <VerdictBadge verdict={verdict} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-snow-text">{goNoGo.summary}</p>
          </div>
        </div>

        {/* Passes */}
        {passes.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {passes.map((p) => (
              <PassBadge key={p} pass={p} />
            ))}
          </div>
        )}

        {/* Go/No-Go factors */}
        <div className="space-y-1.5">
          {goNoGo.factors.map((factor) => {
            const { icon: Icon, color } = FACTOR_ICONS[factor.status];
            return (
              <div key={factor.label} className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
                <span className="text-xs text-snow-text-muted">
                  <span className="font-medium text-snow-text">{factor.label}:</span> {factor.detail}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Weather grid */}
      <Card>
        <h3 className="text-xs font-semibold text-snow-text-muted uppercase tracking-wider mb-3">Current Conditions</h3>
        <div className="grid grid-cols-2 gap-3">
          <WeatherStat
            icon={<Thermometer className="w-3.5 h-3.5 text-snow-primary" />}
            label="Temperature"
            value={`${Math.round(weather.temperature)}°F`}
            detail={`Feels like ${Math.round(weather.feelsLike)}°`}
          />
          <WeatherStat
            icon={<Wind className="w-3.5 h-3.5 text-snow-primary" />}
            label="Wind"
            value={`${Math.round(weather.wind.speed)} mph`}
            detail={`Gusts ${Math.round(weather.wind.gusts)} mph ${weather.wind.direction}`}
          />
          <WeatherStat
            icon={<Droplets className="w-3.5 h-3.5 text-snow-primary" />}
            label="Humidity"
            value={`${weather.humidity}%`}
            detail={weather.conditions}
          />
          <WeatherStat
            icon={<Eye className="w-3.5 h-3.5 text-snow-primary" />}
            label="Visibility"
            value={`${Math.round(weather.visibility)} mi`}
            detail={`Freezing at ${Math.round(weather.freezingLevel)}'`}
          />
          <WeatherStat
            icon={<Snowflake className="w-3.5 h-3.5 text-snow-primary" />}
            label="Today's Snow"
            value={`${Math.round(todaySnow)}"`}
          />
          <WeatherStat
            icon={<Clock className="w-3.5 h-3.5 text-snow-primary" />}
            label="Drive Time"
            value={driveTimeMinutes >= 60
              ? `${(driveTimeMinutes / 60).toFixed(1)}h`
              : `${driveTimeMinutes}m`}
          />
        </div>
      </Card>
    </div>
  );
}

function WeatherStat({ icon, label, value, detail }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] text-snow-text-muted uppercase tracking-wider">{label}</div>
        <div className="text-sm font-semibold text-snow-text">{value}</div>
        {detail && <div className="text-[11px] text-snow-text-muted truncate">{detail}</div>}
      </div>
    </div>
  );
}
