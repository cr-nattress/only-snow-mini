import { Resort, ResortForecast, ResortConditions } from "@/types/resort";

export function calculatePowderScore(
  resort: Resort,
  forecasts: ResortForecast[]
): number {
  if (forecasts.length === 0) return 0;

  const totalSnowfall = forecasts.reduce((sum, f) => sum + f.snowfall_inches, 0);
  const avgQuality = forecasts.reduce((sum, f) => {
    const qualityMap = { powder: 10, packed: 5, wet: 3, ice: 1 };
    return sum + qualityMap[f.snow_quality];
  }, 0) / forecasts.length;

  const driveTimePenalty = Math.min(resort.drive_minutes / 30, 5);
  const crowdRisk = resort.acres < 1000 ? 2 : 0;

  return Math.round(
    totalSnowfall * 2 + avgQuality * 1.5 - driveTimePenalty - crowdRisk
  );
}

export function getVerdict(score: number): { verdict: "go" | "maybe" | "skip"; label: string } {
  if (score >= 25) return { verdict: "go", label: "Ski tomorrow morning" };
  if (score >= 15) return { verdict: "maybe", label: "Worth considering" };
  return { verdict: "skip", label: "Skip this one" };
}

export function buildResortConditions(
  resort: Resort,
  forecasts: ResortForecast[]
): ResortConditions {
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  const recent48h = forecasts.filter(
    (f) => new Date(f.date) >= twoDaysAgo
  );
  const recent5d = forecasts.filter(
    (f) => new Date(f.date) >= fiveDaysAgo
  );

  const snowfall_48h = recent48h.reduce((s, f) => s + f.snowfall_inches, 0);
  const snowfall_5day = recent5d.reduce((s, f) => s + f.snowfall_inches, 0);
  const score = calculatePowderScore(resort, forecasts);
  const { verdict, label } = getVerdict(score);

  return {
    resort_id: resort.id,
    snowfall_48h,
    snowfall_5day,
    powder_score: score,
    verdict,
    verdict_label: label,
    best_time: verdict === "go" ? "8–11am" : undefined,
    snow_ends: verdict === "go" ? "7:30am" : undefined,
  };
}
