// Maps POC resort IDs to SkiData API slugs.
// Most IDs match the API slug exactly. This file handles the exceptions
// and provides lookup helpers.

// POC ID → API slug (only entries that differ)
const POC_TO_API_OVERRIDES: Record<string, string> = {
  copper: "copper-mountain",
  palisades: "palisades-tahoe",
  mammoth: "mammoth-mountain",
  loon: "loon-mountain",
  whistler: "whistler-blackcomb",
  taos: "taos-ski-valley",
};

// Reverse: API slug → POC ID (only entries that differ)
const API_TO_POC_OVERRIDES: Record<string, string> = {};
for (const [pocId, apiSlug] of Object.entries(POC_TO_API_OVERRIDES)) {
  API_TO_POC_OVERRIDES[apiSlug] = pocId;
}

// POC resorts that don't exist in the API (82 resorts in API as of Feb 2026)
// These will fall back to mock data when queried.
const NOT_IN_API = new Set([
  "sugar-bowl",
  "big-bear",
  "mt-baker",
  "mt-hood-meadows",
  "schweitzer",
  "jay-peak",
  "whiteface",
  "kicking-horse",
]);

export function pocIdToApiSlug(pocId: string): string | null {
  if (NOT_IN_API.has(pocId)) return null;
  return POC_TO_API_OVERRIDES[pocId] ?? pocId;
}

export function apiSlugToPocId(apiSlug: string): string {
  return API_TO_POC_OVERRIDES[apiSlug] ?? apiSlug;
}

export function isInApi(pocId: string): boolean {
  return !NOT_IN_API.has(pocId);
}

// Full list of valid API slugs (from /api/health: 82 resorts)
export const API_SLUGS = [
  // Colorado I-70
  "vail", "beaver-creek", "breckenridge", "keystone", "copper-mountain",
  "winter-park", "loveland", "arapahoe-basin", "eldora", "ski-cooper",
  // Colorado Aspen
  "aspen-snowmass", "aspen-highlands", "buttermilk", "aspen-mountain",
  // Colorado South
  "crested-butte", "monarch-mountain", "wolf-creek-ski-area", "telluride",
  "purgatory-resort", "silverton-mountain",
  // Colorado North
  "steamboat", "granby-ranch", "howelsen-hill",
  // Colorado West
  "powderhorn-mountain-resort", "sunlight-mountain-resort",
  // Colorado Front Range
  "echo-mountain",
  // Utah Cottonwoods
  "alta", "snowbird", "brighton", "solitude",
  // Utah Park City
  "park-city", "deer-valley", "sundance-mountain-resort",
  // Utah Northern
  "snowbasin", "powder-mountain", "beaver-mountain", "cherry-peak-resort",
  "nordic-valley",
  // Utah Southern
  "brian-head-resort", "eagle-point-resort",
  // Wyoming
  "jackson-hole", "grand-targhee", "snow-king-mountain-resort",
  "hogadon-basin-ski-area", "meadowlark-ski-lodge", "sleeping-giant-ski-area",
  "snowy-range-ski-area", "white-pine-ski-resort",
  // Montana
  "big-sky",
  // Idaho
  "sun-valley",
  // California Tahoe
  "palisades-tahoe", "northstar", "kirkwood", "heavenly",
  // California Eastern Sierra
  "mammoth-mountain",
  // Pacific Northwest
  "crystal-mountain", "mt-bachelor", "stevens-pass",
  // New England
  "stowe", "killington", "okemo", "mount-snow", "sugarbush", "stratton",
  "loon-mountain", "sunday-river", "sugarloaf",
  // New Mexico
  "taos-ski-valley", "angel-fire-resort", "ski-santa-fe", "ski-apache",
  "red-river-ski-area", "sandia-peak-ski-area", "sipapu-ski-resort",
  "pajarito-mountain-ski-area",
  // Arizona
  "arizona-snowbowl", "sunrise-park-resort", "mt-lemmon-ski-valley",
  // BC & Alberta
  "whistler-blackcomb", "revelstoke", "sunshine-village", "lake-louise",
] as const;

export type ApiSlug = (typeof API_SLUGS)[number];
