// Types matching the SkiData API response shapes
// See docs/API_INTEGRATION_1.md for full reference

// ── Response metadata (all endpoints) ──────────────────────────

export interface ApiMeta {
  units: "metric" | "imperial";
  fetchedAt: string;
  weatherSource: "open-meteo";
  resortCount?: number;
}

// ── Errors ─────────────────────────────────────────────────────

export interface ApiError {
  error: {
    code: string;
    message: string;
    status: number;
    fields?: Record<string, string>; // VALIDATION_ERROR only
  };
}

// ── Health ─────────────────────────────────────────────────────

export interface ApiHealthResponse {
  status: "ok" | "degraded";
  version: string;
  resorts: number;
  valid_pass_types: string[];
  services: {
    weather: "operational" | "degraded";
    database: "operational" | "degraded";
  };
  timestamp: string;
}

// ── Weather ────────────────────────────────────────────────────

export interface ApiWeatherWind {
  speed: number;
  gusts: number;
  direction: string;
}

export interface ApiWeatherCurrent {
  temperature: number;
  feelsLike: number;
  conditions: string;
  humidity: number;
  wind: ApiWeatherWind;
  visibility: number;
  freezingLevel: number;
}

export interface ApiWeatherForecastDay {
  date: string; // YYYY-MM-DD
  conditions: string;
  high: number;
  low: number;
  snowfall: number;
  precipChance: number;
  wind: {
    speed: number;
    gusts: number;
  };
}

export interface ApiWeatherAlert {
  severity: "moderate" | "severe" | "extreme";
  title: string;
  description: string;
  expires: string; // ISO 8601
}

export interface ApiWeatherResponse {
  _meta: ApiMeta;
  current: ApiWeatherCurrent;
  forecast: ApiWeatherForecastDay[];
  alerts: ApiWeatherAlert[];
}

// ── Ranked Resorts ─────────────────────────────────────────────

export interface ApiDailyForecast {
  date: string;
  snowfall: number; // cm
  high: number;     // °C
  low: number;      // °C
}

export interface ApiRankedResort {
  slug: string;
  name: string;
  ticker: string;
  region: string;
  state: string;
  passes: string[];
  elevation: {
    base: number;
    summit: number;
    vertical: number;
  };
  terrain: {
    acres: number;
    trails: number;
    lifts: number;
    breakdown: {
      beginner: number;
      intermediate: number;
      advanced: number;
      expert?: number;
    };
  };
  avgSnowfall: number;
  snowfall_24h: number;
  snowfall_24h_inches: number;
  forecast_total: number;
  forecast_total_inches: number;
  base_depth: number;
  terrain_open_pct: number;
  drive_time_minutes: number;
  distance_miles: number;
  conditions: string;
  daily_forecast?: ApiDailyForecast[];
  weather?: {
    high: number;
    low: number;
    wind_speed: number;
    wind_gusts: number;
  };
  go_no_go?: {
    overall: "go" | "no-go" | "conditional";
    summary: string;
  };
}

export type ApiRankedPeriod = "today" | "weekend" | "5d" | "10d";

export interface ApiRankedResponse {
  _meta: ApiMeta;
  resorts: ApiRankedResort[];
}

// ── Resort Detail ──────────────────────────────────────────────

export interface ApiGoNoGoFactor {
  label: "Wind" | "Visibility" | "Temperature" | "Alerts";
  status: "go" | "no-go" | "conditional";
  detail: string;
}

export interface ApiGoNoGoAssessment {
  overall: "go" | "no-go" | "conditional";
  factors: ApiGoNoGoFactor[];
  summary: string;
}

export interface ApiResortDetail {
  slug: string;
  name: string;
  ticker: string;
  state: string;
  region: string;
  elevation: {
    base: number;
    summit: number;
    vertical: number;
  };
  terrain: {
    acres: number;
    trails: number;
    lifts: number;
    breakdown: {
      beginner: number;
      intermediate: number;
      advanced: number;
      expert?: number;
    };
  };
  passes: string[];
  features: string[];
  avgSnowfall: number;
  walkUpPricing: {
    adult: number | null;
    dynamicPricing: boolean;
  } | null;
}

export interface ApiResortDetailWeather {
  current: ApiWeatherCurrent;
  forecast: ApiWeatherForecastDay[];
  alerts: ApiWeatherAlert[];
}

export interface ApiResortDetailResponse {
  _meta: ApiMeta;
  resort: ApiResortDetail;
  weather: ApiResortDetailWeather;
  goNoGo: ApiGoNoGoAssessment;
  driveTimeMinutes: number;
}

// ── Storms ─────────────────────────────────────────────────────

export interface ApiStormResort {
  slug: string;
  name: string;
  ticker: string;
  forecastCm: number;
  forecastInches: number;
}

export interface ApiStorm {
  id: string;
  name: string;
  severity: "moderate" | "significant" | "major";
  region: string;
  affectedResorts: ApiStormResort[];
  peakDay: string; // YYYY-MM-DD
  totalSnowfallCm: number;
  totalSnowfallInches: number;
}

export interface ApiStormsResponse {
  _meta: ApiMeta;
  storms: ApiStorm[];
}

// ── Worth Knowing ──────────────────────────────────────────────

export interface ApiWorthKnowingResort {
  slug: string;
  name: string;
  ticker: string;
  forecastInches: number;
  userBestInches: number;
  differentialInches: number;
  isOnPass: boolean;
  distanceMiles: number;
  passes: string[];
  walkUpPricing: {
    adult: number | null;
    dynamicPricing: boolean;
  } | null;
}

export interface ApiWorthKnowingResponse {
  _meta: ApiMeta;
  resorts: ApiWorthKnowingResort[];
}

// ── Preferences ────────────────────────────────────────────────

export interface ApiPreferences {
  location_lat: number;
  location_lng: number;
  location_name?: string;
  pass_type: string[];
  drive_radius_miles: number;
  favorite_resorts: string[];
  notification_powder: boolean;
  notification_storm: boolean;
  notification_weekend: boolean;
  notification_chase?: boolean;
  notification_price?: boolean;
  notification_quiet_start?: string;
  notification_quiet_end?: string;
  chase_enabled?: boolean;
  chase_max_budget?: number;
  chase_regions?: string[];
}

export interface ApiPreferencesResponse {
  _meta: ApiMeta;
  preferences: ApiPreferences | null;
}

export interface ApiPreferencesPostBody {
  location_lat: number;
  location_lng: number;
  location_name?: string;
  pass_type?: string[];
  drive_radius_miles?: number;
  drive_minutes?: number; // alternative to drive_radius_miles
  favorite_resorts?: string[];
  notification_powder?: boolean;
  notification_storm?: boolean;
  notification_weekend?: boolean;
}

export interface ApiPreferencesPatchBody {
  addFavoriteResort?: string;
  removeFavoriteResort?: string;
}

// ── Notifications ──────────────────────────────────────────────

export interface ApiNotification {
  id: string;
  type: "powder" | "storm" | "weekend" | "chase" | "price" | "worth_knowing";
  resort_slug: string;
  title: string;
  body: string;
  sent_at: string;
  opened_at: string | null;
  acted_on: boolean;
}

export interface ApiNotificationsResponse {
  _meta: ApiMeta;
  notifications: ApiNotification[];
}
