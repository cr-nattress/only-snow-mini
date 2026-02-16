import type { DriveRadius, PassType } from "@/types/user";
import type { Region } from "@/types/resort";

// ── Unit conversions ───────────────────────────────────────────
// NOTE: Most conversions are unnecessary when using ?units=imperial.
// These are provided for cases where metric data is returned.

export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 1.8 + 32) * 10) / 10;
}

export function cmToInches(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10;
}

export function kphToMph(kph: number): number {
  return Math.round((kph / 1.609) * 10) / 10;
}

export function metersToMiles(m: number): number {
  return Math.round((m / 1609) * 10) / 10;
}

export function metersToFeet(m: number): number {
  return Math.round(m * 3.281);
}

// ── Drive radius ↔ drive minutes mapping ───────────────────────
// POC uses drive minutes, API accepts both drive_radius_miles and drive_minutes.
// When sending to API, prefer drive_minutes directly.
// When reading from API, convert drive_radius_miles back to POC's DriveRadius.

const DRIVE_MINUTES_TO_MILES: Record<number, number> = {
  45: 40,
  60: 55,
  120: 100,
  180: 150,
};

const DRIVE_MILES_TO_MINUTES: [number, DriveRadius][] = [
  [40, 45],
  [55, 60],
  [100, 120],
  [150, 180],
];

export function driveMinutesToMiles(minutes: DriveRadius): number | undefined {
  if (minutes === "fly") return undefined;
  return DRIVE_MINUTES_TO_MILES[minutes] ?? Math.round(minutes * 0.9);
}

export function driveMilesToMinutes(miles: number): DriveRadius {
  for (const [threshold, minutes] of DRIVE_MILES_TO_MINUTES) {
    if (miles <= threshold + 10) return minutes;
  }
  return 180;
}

// ── Pass type mapping ──────────────────────────────────────────
// POC has "resort_specific" which maps to "none" in the API.
// API has the same pass types otherwise.

export function pocPassToApiPass(pass: PassType): string {
  if (pass === "resort_specific") return "none";
  return pass;
}

export function apiPassToPocPass(pass: string): PassType {
  const valid: PassType[] = [
    "epic",
    "ikon",
    "indy",
    "mountain_collective",
    "none",
  ];
  if (valid.includes(pass as PassType)) return pass as PassType;
  return "none";
}

export function apiPassesToPocPasses(passes: string[]): PassType[] {
  return passes.map(apiPassToPocPass);
}

// Map a resort's passes array to a single primary PassType (for POC display)
export function primaryPass(passes: string[]): PassType {
  if (passes.length === 0) return "none";
  return apiPassToPocPass(passes[0]);
}

// ── Region mapping ─────────────────────────────────────────────
// API returns granular regions like "colorado-i70", "utah-cottonwoods".
// POC uses broad regions like "colorado", "utah".

const API_REGION_TO_POC: Record<string, Region> = {
  // Colorado sub-regions
  "colorado-i70": "colorado",
  "colorado-aspen": "colorado",
  "colorado-south": "colorado",
  "colorado-north": "colorado",
  "colorado-west": "colorado",
  "colorado-front-range": "colorado",
  // Utah sub-regions
  "utah-cottonwoods": "utah",
  "utah-wasatch": "utah",
  "utah-park-city": "utah",
  "utah-northern": "utah",
  "utah-southern": "utah",
  // Northern Rockies
  wyoming: "northern_rockies",
  montana: "northern_rockies",
  idaho: "northern_rockies",
  // California
  "california-tahoe": "california",
  "california-eastern-sierra": "california",
  "california-sierra": "california",
  "california-central": "california",
  "california-southern": "california",
  "california-northern": "california",
  // Pacific Northwest
  "pacific-northwest": "pacific_northwest",
  alaska: "pacific_northwest",
  // Northeast
  "new-england": "northeast",
  "new-york": "northeast",
  "mid-atlantic": "northeast",
  // Southwest
  "new-mexico": "southwest",
  arizona: "southwest",
  nevada: "southwest",
  // Western Canada
  "british-columbia": "canada_west",
  alberta: "canada_west",
  // Midwest
  michigan: "midwest",
  minnesota: "midwest",
  wisconsin: "midwest",
  midwest: "midwest",
  "great-plains": "midwest",
  // Southeast
  southeast: "southeast",
};

export function apiRegionToPocRegion(apiRegion: string): Region {
  const lower = apiRegion.toLowerCase().replace(/\s+/g, "-");

  // Try exact match
  if (API_REGION_TO_POC[lower]) return API_REGION_TO_POC[lower];

  // Try prefix match (e.g. "utah-something-new" → utah → northern_rockies? No, utah → utah)
  for (const [key, region] of Object.entries(API_REGION_TO_POC)) {
    if (lower.startsWith(key.split("-")[0])) return region;
  }

  console.warn(`[transforms] Unmapped API region: "${apiRegion}", falling back to "southwest"`);
  return "southwest";
}

// ── Verdict mapping ────────────────────────────────────────────
// API go/no-go → POC verdict

export function goNoGoToVerdict(
  overall: "go" | "no-go" | "conditional",
): "go" | "maybe" | "skip" {
  switch (overall) {
    case "go":
      return "go";
    case "conditional":
      return "maybe";
    case "no-go":
      return "skip";
  }
}
