import { PassType } from "./user";

export type Region =
  | "colorado"
  | "utah"
  | "california"
  | "pacific_northwest"
  | "northeast"
  | "northern_rockies"
  | "canada_west"
  | "southwest"
  | "midwest"
  | "southeast";

export const REGION_LABELS: Record<Region, string> = {
  colorado: "Colorado",
  utah: "Utah",
  california: "California",
  pacific_northwest: "Pacific Northwest",
  northeast: "Northeast",
  northern_rockies: "Northern Rockies",
  canada_west: "Western Canada",
  southwest: "Southwest",
  midwest: "Midwest",
  southeast: "Southeast",
};

export interface Resort {
  id: string;
  name: string;
  pass: PassType;
  region: Region;
  state: string; // 2-letter code or province
  lat: number;
  lng: number;
  drive_minutes: number; // computed from user location, -1 = unknown
  base_elevation: number;
  summit_elevation: number;
  trails: number;
  acres: number;
}

export interface ResortForecast {
  resort_id: string;
  date: string; // ISO date
  snowfall_inches: number;
  snow_quality: "powder" | "packed" | "wet" | "ice";
  wind_mph: number;
  high_temp_f: number;
  low_temp_f: number;
  visibility: "clear" | "partly_cloudy" | "overcast" | "snowing";
}

export interface ResortConditions {
  resort_id: string;
  snowfall_48h: number;
  snowfall_5day: number;
  powder_score: number;
  verdict: "go" | "maybe" | "skip";
  verdict_label: string;
  best_time?: string;
  snow_ends?: string;
}
