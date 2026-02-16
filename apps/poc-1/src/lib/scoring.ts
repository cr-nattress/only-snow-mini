// Powder score calculation and verdict logic.
// V1: Uses mock data types (Resort, ResortForecast). Retained for backward compatibility.
// V2: Uses live API data fields directly for more accurate scoring with wind, temp, terrain,
//     crowd, and go/no-go integration.
// Inputs: resort/forecast data
// Outputs: numeric score + verdict ("go"/"maybe"/"skip")
// Side effects: none
// Error behavior: returns 0 score for empty data, handles missing optional fields

import { Resort, ResortForecast, ResortConditions } from "@/types/resort";

// ── V1 (mock data) ──────────────────────────────────────────────

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

// ── V2 (live API data) ──────────────────────────────────────────

export interface ScoringInputV2 {
  forecastTotalInches: number;
  conditions: string;
  driveMinutes: number;
  acres: number;
  windSpeed?: number;
  windGusts?: number;
  feelsLikeTemp?: number;
  terrainOpenPct?: number;
  isWeekend?: boolean;
  isHoliday?: boolean;
  goNoGoOverall?: "go" | "no-go" | "conditional";
}

// 2025-26 ski season holidays (US) for crowd multiplier
export const HOLIDAYS_2025_26 = [
  "2025-11-28", // Thanksgiving Friday
  "2025-11-29", // Thanksgiving Saturday
  "2025-12-24", // Christmas Eve
  "2025-12-25", // Christmas Day
  "2025-12-26", // Christmas break
  "2025-12-31", // New Year's Eve
  "2026-01-01", // New Year's Day
  "2026-01-19", // MLK Day
  "2026-02-16", // Presidents' Day
  "2026-03-16", // Spring break start (approximate)
  "2026-03-17",
  "2026-03-18",
  "2026-03-19",
  "2026-03-20",
];

// Wind penalty: 0 below 15mph, linear to -10 at 40mph, auto-Skip at 50mph gusts
function windPenalty(speed?: number, gusts?: number): { penalty: number; forceSkip: boolean } {
  if (gusts != null && gusts >= 50) return { penalty: 10, forceSkip: true };
  const effective = speed ?? 0;
  if (effective <= 15) return { penalty: 0, forceSkip: false };
  const penalty = Math.min(((effective - 15) / 25) * 10, 10);
  return { penalty, forceSkip: false };
}

// Temperature bonus/penalty: +2 for 20-28°F (ideal preservation), -2 per 5°F below 0°F
function tempAdjustment(feelsLike?: number): number {
  if (feelsLike == null) return 0;
  if (feelsLike >= 20 && feelsLike <= 28) return 2;
  if (feelsLike < 0) return Math.max(-2 * Math.ceil(Math.abs(feelsLike) / 5), -10);
  return 0;
}

// Terrain open penalty: -5 below 50%, -10 below 25%
function terrainPenalty(openPct?: number): number {
  if (openPct == null) return 0;
  if (openPct < 25) return 10;
  if (openPct < 50) return 5;
  return 0;
}

// Weekend/holiday crowd multiplier for crowd risk
function crowdMultiplier(isWeekend?: boolean, isHoliday?: boolean): number {
  if (isHoliday) return 2.0;
  if (isWeekend) return 1.4; // average of 1.5 Sat + 1.3 Sun
  return 1.0;
}

export function calculatePowderScoreV2(input: ScoringInputV2): {
  score: number;
  verdict: "go" | "maybe" | "skip";
  label: string;
} {
  const { forecastTotalInches, conditions, driveMinutes, acres } = input;

  // Base score: same formula as V1 but using API fields
  const conditionQuality = conditions.toLowerCase().includes("powder") ? 10
    : conditions.toLowerCase().includes("snow") ? 7
    : conditions.toLowerCase().includes("pack") ? 5
    : conditions.toLowerCase().includes("wet") ? 3
    : 4; // default moderate quality

  const baseScore = forecastTotalInches * 2 + conditionQuality * 1.5;

  // Drive time penalty
  const drivePenalty = Math.min(driveMinutes / 30, 5);

  // Crowd risk (small resort penalty * crowd multiplier)
  const baseCrowdRisk = acres < 1000 ? 2 : 0;
  const crowd = crowdMultiplier(input.isWeekend, input.isHoliday);

  // New V2 factors
  const wind = windPenalty(input.windSpeed, input.windGusts);
  const temp = tempAdjustment(input.feelsLikeTemp);
  const terrain = terrainPenalty(input.terrainOpenPct);

  // Go/No-Go override: "no-go" caps at 14, "go" adds +5
  const goNoGoBonus = input.goNoGoOverall === "go" ? 5
    : input.goNoGoOverall === "no-go" ? 0
    : 0;

  let score = Math.round(
    baseScore
    - drivePenalty
    - (baseCrowdRisk * crowd)
    - wind.penalty
    + temp
    - terrain
    + goNoGoBonus
  );

  // Force-skip overrides
  if (wind.forceSkip) score = Math.min(score, 5);
  if (input.goNoGoOverall === "no-go") score = Math.min(score, 14);

  // Clamp to reasonable range
  score = Math.max(score, 0);

  // Verdict thresholds (same as V1)
  if (score >= 25) return { score, verdict: "go", label: "Ski tomorrow morning" };
  if (score >= 15) return { score, verdict: "maybe", label: "Worth considering" };
  return { score, verdict: "skip", label: "Skip this one" };
}

// Helper to check if a date string is a holiday
export function isHoliday(dateStr: string): boolean {
  return HOLIDAYS_2025_26.includes(dateStr);
}

// Helper to check if a date string is a weekend
export function isWeekendDay(dateStr: string): boolean {
  const day = new Date(dateStr + "T12:00:00").getDay();
  return day === 0 || day === 6;
}
