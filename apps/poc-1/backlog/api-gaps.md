# API Gaps — Fields Needed to Remove Mock Data Dependencies

These fields are currently shown in the UI but not provided by the SkiData API.
Mock/placeholder data fills these gaps. When the API adds these fields, the
corresponding mock data can be removed.

## Ranked Endpoint (`GET /api/resorts/ranked`)

| Missing Field | Used By | Placeholder Strategy |
|---|---|---|
| `high` / `low` temperature per resort | Dashboard rows, Resorts page | Hero: fetched via `GET /api/weather`. Others: static placeholder (25°/10°) |
| `wind.speed` per resort | Dashboard rows | Hero: fetched via `GET /api/weather`. Others: static placeholder (15 mph) |
| `goNoGo.overall` verdict per resort | Dashboard rows | Hero: fetched via `GET /api/resorts/[slug]`. Others: derived from conditions + snowfall |
| `daily_forecast[]` breakdown | Resorts page sparklines | Derived from `forecast_total_inches` with simple ratios |

## Storms Endpoint (`GET /api/storms`)

| Missing Field | Used By | Placeholder Strategy |
|---|---|---|
| `hourly_snowfall[]` | Storm detail TimelineBar | Generated from severity (bell curve pattern) |
| `best_window` | Storm detail best-window card | Derived from `peakDay` + top resort name |
| `road_conditions` | Storm detail road-conditions card | Generic text based on severity level |
| Per-resort `drive_minutes` | Storm detail ResortComparison | Static increments (30 + i*15) |
| Per-resort `high_temp_f` / `low_temp_f` | Storm detail ResortComparison | Static placeholder (22°/5°) |
| Per-resort `wind_mph` | Storm detail ResortComparison | Static placeholder (15 mph) |
| Per-resort `verdict` (goNoGo) | Storm detail ResortComparison | Derived from forecastInches threshold |
| Per-resort `powder_score` | Storm detail ResortComparison | Derived from ranking position |

## Notifications Endpoint (`GET /api/notifications`)

| Missing Field | Used By | Placeholder Strategy |
|---|---|---|
| `storm_id` link | Alert card "View Storm" button | Hardcoded "storm-1" |
| `snowfall` summary | Alert card snowfall display | Uses `body` field from notification |
| `timing` / `best_window` / `travel` | Alert card detail row | Empty strings (fields not shown) |

## No API Equivalent

| Feature | Current Source | Notes |
|---|---|---|
| Location autocomplete (geocoding) | `mock-locations.ts` | API has no geocoding endpoint. Integrate Google Places or Mapbox later. |
| Powder score algorithm | `lib/scoring.ts` | API doesn't compute a score. Derived from rank position in sorted results. |
