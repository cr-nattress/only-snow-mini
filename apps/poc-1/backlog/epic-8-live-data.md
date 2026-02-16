# Epic 8: Replace Mock Data with Live API Data

**Goal**: Incrementally replace all mock data sources with live calls to the SkiData API. Where the API doesn't yet provide a field, keep the existing UI and use mock/placeholder data — those gaps become API enhancement requests for a future epic.

**Priority**: P1
**Depends on**: Epic 0a (API Setup — complete), working API key
**API Base**: `https://ski-ai-mu.vercel.app/api`
**API Key**: stored in `.env.local` as `NEXT_PUBLIC_ONLYSNOW_API_KEY`

---

## Context

The POC currently uses 5 mock data files to power all screens:

| Mock File | Used By | API Replacement |
|-----------|---------|-----------------|
| `mock-resorts.ts` | Dashboard, Resorts page, Forecasts | `GET /api/resorts/ranked` |
| `mock-forecasts.ts` | Dashboard, Resorts page | `GET /api/weather`, `GET /api/resorts/ranked` (convenience fields) |
| `mock-storms.ts` | Dashboard, Storm detail | `GET /api/storms` |
| `mock-alerts.ts` | Alerts page | `GET /api/notifications` |
| `mock-locations.ts` | Onboarding location | Keep as-is (geocoding not in API) |

The API client (`lib/api/client.ts`), types (`types/api.ts`), transforms (`lib/api/transforms.ts`), and slug mapping (`lib/api/resort-slugs.ts`) are already built and verified.

### Strategy

- **Replace one screen at a time**, starting with the simplest (least data transformation needed)
- **Each story is independently shippable** — the app works whether that screen uses live or mock data
- **Keep all existing UI elements** — if the API doesn't provide a field, use mock/placeholder data and track it as an API gap
- **Mock data stays as fallback** — if the API call fails, fall back to mock data with a subtle "offline" indicator
- **Use `?units=imperial`** on weather and resort detail to avoid client-side unit conversion
- **Use convenience fields** (`snowfall_24h_inches`, `forecast_total_inches`) from ranked endpoint — they're always present

### Build Order

The order is chosen to minimize risk and maximize visible progress:

1. **Dashboard** — highest-impact screen, uses ranked + storms + worth-knowing
2. **Storm detail** — uses storms endpoint (already fetched for dashboard)
3. **Resorts page** — uses ranked endpoint (already fetched for dashboard)
4. **Alerts page** — uses notifications endpoint
5. **Onboarding location** — keep mock (API has no geocoding)

---

## API Gaps

Fields the UI currently shows but the API doesn't yet provide. These stay as mock/placeholder data and should be added to the API in a future epic.

| UI Field | Screen | Current Source | API Status | Placeholder Strategy |
|----------|--------|---------------|------------|---------------------|
| `highTemp` / `lowTemp` | Dashboard rows | `storm.resort_data[].high_temp_f/low_temp_f` | Not in ranked endpoint | Fetch via `GET /api/weather?resort=<slug>&units=imperial` per resort (or add to ranked endpoint) |
| `windMph` | Dashboard rows | `storm.resort_data[].wind_mph` | Not in ranked endpoint | Same as temp — fetch per-resort weather or add to API |
| `verdict` / `verdictLabel` | Dashboard rows | `storm.resort_data[].verdict` | Not in ranked endpoint (goNoGo is on resort detail only) | Fetch via `GET /api/resorts/[slug]` per resort (or add to ranked endpoint) |
| `powderScore` | Dashboard, Resorts | `scoring.ts` calculation | Not in API | Derive from `forecast_total_inches` rank position (API pre-sorts). Keep scoring.ts as supplementary. |
| Hourly snowfall timeline | Storm detail | `storm.hourly_snowfall[]` | Not in storms endpoint | Keep mock hourly data. Add `hourly_snowfall[]` to storms API. |
| `best_window` | Storm detail | `storm.best_window` | Not in storms endpoint | Keep mock data. Add to storms API. |
| `road_conditions` | Storm detail | `storm.road_conditions` | Not in storms endpoint | Keep mock data. Add to storms API. |
| Per-resort `drive_minutes` | Storm detail comparison | `storm.resort_data[].drive_minutes` | Not in storms endpoint (is on ranked) | Cross-reference with ranked data if available, else keep mock. Add to storms API. |
| Per-resort `verdict` | Storm detail comparison | `storm.resort_data[].verdict` | Not in storms endpoint | Fetch `GET /api/resorts/[slug]` per resort for goNoGo. Add to storms API. |
| Per-resort temp/wind | Storm detail comparison | `storm.resort_data[].high_temp_f` etc. | Not in storms endpoint | Fetch per-resort weather. Add to storms API. |
| 5-day sparkline | Resorts page | `getForecastsForResort()` → daily snowfall array | Not in ranked endpoint | Fetch `GET /api/weather?resort=<slug>` per resort for `forecast[].snowfall`. Add daily breakdown to ranked API. |

**Future API enhancement epic**: Add these fields to the ranked and storms endpoints so the POC can drop all remaining mock data dependencies.

---

## User Stories

### 8.1 — Create data-fetching hooks with SWR pattern
**As a** developer
**I want** reusable hooks for each API endpoint
**So that** screens can swap from mock to live data with a single import change

**Acceptance Criteria**:
- Create `src/hooks/use-api.ts` with hooks using React `useState` + `useEffect` (no external deps):
  ```typescript
  function useRankedResorts(period: ApiRankedPeriod)
    → { data: ApiRankedResponse | null, error: Error | null, loading: boolean }

  function useStorms()
    → { data: ApiStormsResponse | null, error: Error | null, loading: boolean }

  function useWorthKnowing()
    → { data: ApiWorthKnowingResponse | null, error: Error | null, loading: boolean }

  function useWeather(slug: string, units?: "metric" | "imperial")
    → { data: ApiWeatherResponse | null, error: Error | null, loading: boolean }

  function useResortDetail(slug: string, units?: "metric" | "imperial")
    → { data: ApiResortDetailResponse | null, error: Error | null, loading: boolean }

  function useNotifications()
    → { data: ApiNotificationsResponse | null, error: Error | null, loading: boolean }
  ```
- Each hook calls the corresponding function from `lib/api/client.ts`
- Loading state while fetching
- Error state captures `OnlySnowApiError` details (code, message)
- Add a `_meta.fetchedAt` display helper: `formatFetchedAt(iso: string) → "2 min ago"` etc.

---

### 8.2 — Dashboard: replace with ranked resorts + storms
**As a** user
**I want** the dashboard to show real resort conditions
**So that** I see actual snowfall and verdicts, not static data

**Current data flow** (mock):
- `mockStorms` → flatten storm.resort_data → build ResortCondition[] → sort by powder score → hero + remaining
- `mockResorts` + `getForecastsForResort()` → teaser resorts from other regions

**New data flow** (live + supplementary):
- `useRankedResorts("today")` → hero card (top resort) + upcoming list
- `useStorms()` → storm context on hero card, link to storm detail
- `useWorthKnowing()` → "Getting snow elsewhere" teasers (replaces manual teaser logic)
- `useWeather(slug)` for hero resort → temp, wind, conditions for hero card
- Per-resort goNoGo: fetch `useResortDetail(slug)` for hero resort → verdict badge

**Acceptance Criteria**:
- Hero card shows the #1 ranked resort:
  - `name`, `ticker`, `passes[0]` → pass badge (from ranked)
  - `forecast_total_inches` → snowfall display (from ranked)
  - `conditions` → weather label (from ranked)
  - `drive_time_minutes` → travel time (from ranked)
  - `highTemp` / `lowTemp` → from `useWeather(heroSlug)` (live). **API gap**: not in ranked endpoint.
  - `windMph` → from `useWeather(heroSlug)` (live). **API gap**: not in ranked endpoint.
  - Verdict badge → from `useResortDetail(heroSlug)` goNoGo (live). **API gap**: not in ranked endpoint.
  - Link to storm detail if a storm affects this resort's region
- Upcoming list shows remaining ranked resorts:
  - Resort name, pass badge, snowfall (`forecast_total_inches`), conditions, `drive_time_minutes`
  - `highTemp` / `lowTemp` / `windMph` / `verdict`: use mock placeholder for non-hero resorts (fetching weather per resort would hit rate limits). **API gap**: add these to ranked endpoint.
- "Getting snow elsewhere" section uses `worthKnowing` response directly:
  - `name`, `forecastInches`, `differentialInches`, `isOnPass`, `passes`, `distanceMiles`
  - Replace manual teaser computation entirely
- If `useStorms()` returns storms, show storm badge on hero card with link to `/storm/[stormId]`
- Show `_meta.fetchedAt` as "Updated X min ago" at top of dashboard
- Loading skeleton while data fetches
- On API error: fall back to mock data, show subtle "Using cached data" indicator

**Mapping: API → current component props**:
| Current prop | Source (live) | Fallback |
|---|---|---|
| `resortName` | `rankedResort.name` | — |
| `pass` | `rankedResort.passes[0]` (use `primaryPass()`) | — |
| `snowfall` | `rankedResort.forecast_total_inches + "\""` | — |
| `highTemp` / `lowTemp` | Hero: `useWeather()`. Others: mock placeholder | **API gap** → add to ranked |
| `windMph` | Hero: `useWeather()`. Others: mock placeholder | **API gap** → add to ranked |
| `verdict` / `verdictLabel` | Hero: `useResortDetail()` goNoGo. Others: mock placeholder | **API gap** → add to ranked |
| `stormId` | Match storm region to resort region from `useStorms()` | — |
| `powderScore` | Rank position (API pre-sorts by forecast_total) | Keep `scoring.ts` as supplementary |
| `driveMinutes` | `rankedResort.drive_time_minutes` | — |

---

### 8.3 — Storm detail: replace with live storms + resort detail
**As a** user
**I want** storm detail to show real storm data
**So that** I see which resorts are actually getting snow

**Current data flow** (mock):
- `getStormById(stormId)` → storm with `hourly_snowfall[]`, `resort_data[]`, `best_window`, `road_conditions`

**New data flow** (live + supplementary):
- `useStorms()` → find storm by id → `storm.affectedResorts[]`, `storm.severity`, `storm.peakDay`
- `useResortDetail(slug)` per affected resort → goNoGo verdict, weather details
- Mock/placeholder for: hourly timeline, best window, road conditions

**Acceptance Criteria**:
- Storm header shows `storm.name`, `storm.severity`, `storm.region` (live)
- Storm metadata: `peakDay`, `totalSnowfallInches`, severity badge (live)
- **Hourly timeline**: Keep the TimelineBar component. **API gap**: storms endpoint doesn't include `hourly_snowfall[]`. Use mock hourly data keyed by storm severity as placeholder:
  - Major storms: heavy snowfall pattern
  - Significant: moderate pattern
  - Moderate: light pattern
  - Track as API enhancement: add `hourly_snowfall[]` to storms endpoint
- **Best window**: Keep the card. **API gap**: not in storms endpoint. Derive from `peakDay`: "Best skiing: [peakDay formatted]". Track as API enhancement.
- **Road conditions**: Keep the card. **API gap**: not in storms endpoint. Use generic text based on severity ("Expect delays on mountain passes" for major, "Normal conditions expected" for moderate). Track as API enhancement.
- Affected resorts list shows (live):
  - `name`, `ticker`, `forecastInches`, pass badge (from `mock-resorts.ts` lookup or resort detail)
  - Sorted by forecastInches descending
- Resort comparison table — per resort:
  - `forecastInches` (live from storms endpoint)
  - `verdict` → from `useResortDetail(slug)` goNoGo if fetched, else mock placeholder. **API gap**: add to storms endpoint.
  - `highTemp` / `lowTemp` / `windMph` → from `useResortDetail(slug)` weather if fetched, else mock placeholder. **API gap**: add to storms endpoint.
  - `drive_minutes` → cross-reference with ranked data if cached, else mock. **API gap**: add to storms endpoint.
  - `powder_score` → derive from forecastInches rank. **API gap**: add to storms endpoint.
- On error: fall back to mock storm data
- Note: fetching resort detail per affected resort (2-4 resorts typically) costs 2-4 API calls. Acceptable within rate limits for a single storm detail view.

---

### 8.4 — Resorts page: replace with ranked resorts + weather
**As a** user
**I want** the resort list to show real snowfall and conditions
**So that** I can compare resorts using live data

**Current data flow** (mock):
- `mockResorts` → enrich with `getForecastsForResort()` → snowfall48h, forecastData[], powderScore
- Filter by region, pass, drive time, snowfall threshold
- Display in three views: nearby, top conditions, by region

**New data flow** (live + supplementary):
- `useRankedResorts(period)` → already filtered by user's pass + drive radius, sorted by forecast
- Mock fallback for sparkline data until API provides daily breakdown

**Acceptance Criteria**:
- Resort list uses `rankedResorts` from API
- Each resort row shows:
  - `name`, `passes[0]` as pass badge, `drive_time_minutes` (live)
  - `forecast_total_inches` as primary snowfall number (live)
  - `snowfall_24h_inches` as secondary "24hr" number (live)
  - `conditions` string (live)
  - `terrain_open_pct`, `base_depth` as supplementary info (live)
- Period switcher at top: today | weekend | 5d | 10d (maps to `?period=` param)
- Search still works (client-side filter on resort `name`, `state`, `region`)
- Pass filter: API already filters by user's passes, but allow toggling "All passes" vs "My passes"
- Region filter: client-side filter on `region` field (map via `apiRegionToPocRegion()`)
- "Nearby" section: sort by `drive_time_minutes`
- "Top conditions" section: already sorted by API (forecast_total desc)
- "By region" section: group by `apiRegionToPocRegion(resort.region)`
- **Sparkline**: Keep the sparkline component. **API gap**: ranked endpoint doesn't include daily forecast breakdown. Options for sourcing data:
  - Fetch `GET /api/weather?resort=<slug>` per visible resort → `forecast[].snowfall` for 7-day sparkline (expensive but accurate)
  - Use mock sparkline data as placeholder for non-visible resorts, fetch weather on expand/scroll
  - **Recommended**: Fetch weather for top 5 visible resorts only (lazy load). Use flat line for the rest. Track as API enhancement: add `daily_forecast[]` to ranked endpoint.
- `powderScore`: Keep displaying. Derive from `forecast_total_inches` rank position. Optionally keep `scoring.ts` for supplementary scoring that factors in conditions string.
- Loading skeleton while fetching
- On error: fall back to mock resort data

---

### 8.5 — Alerts page: replace with live notifications
**As a** user
**I want** to see real notification history
**So that** I know about actual powder alerts and storm warnings

**Current data flow** (mock):
- `mockAlerts` → filter by dismissed state → render AlertCard components

**New data flow** (live):
- `useNotifications()` → `notifications[]` with `type`, `title`, `body`, `sent_at`, `opened_at`

**Acceptance Criteria**:
- Alerts list uses `notifications` from API
- Each alert shows:
  - `title` as headline
  - `body` as description
  - `type` as badge (powder, storm, weekend, etc.)
  - `sent_at` formatted as relative time ("2 hours ago")
  - `opened_at` to distinguish read/unread
- Dismissed state: use `opened_at !== null` as "read" indicator (replaces localStorage dismiss tracking)
- Empty state: "No alerts yet" when notifications array is empty
- On error: fall back to mock alerts
- Update `AlertCard` component to accept API notification shape (or create adapter)

---

### 8.6 — Loading and error states
**As a** user
**I want** smooth loading states and graceful error handling
**So that** the app feels responsive even on slow connections

**Acceptance Criteria**:
- Each live-data screen shows a skeleton/shimmer while loading:
  - Dashboard: hero card skeleton + 3 row skeletons
  - Resorts: 5 row skeletons
  - Storm detail: header skeleton + resort list skeleton
  - Alerts: 3 card skeletons
- On API error (any status):
  - Fall back to mock data
  - Show subtle banner: "Showing cached data — tap to retry"
  - Log error to console with endpoint and error code
- On rate limit (429):
  - Show "Too many requests — refreshing in X seconds"
  - Auto-retry after `Retry-After` seconds
- Show `_meta.fetchedAt` as relative time on each screen ("Updated 5 min ago")

---

### 8.7 — Clean up mock data usage
**As a** developer
**I want** to minimize mock data to only what's needed for fallback and API gaps
**So that** the live/mock boundary is clear

**Acceptance Criteria**:
- After stories 8.2–8.5 are complete and verified:
  - Keep `mock-resorts.ts` — needed for fallback, slug-to-name resolution, and pass lookup for storm resorts
  - Keep `mock-locations.ts` — no API replacement for geocoding
  - Keep `mock-forecasts.ts` — needed for sparkline placeholder data until API provides daily breakdown
  - Keep `mock-storms.ts` — needed for hourly timeline, best window, road conditions placeholders until API provides them
  - Keep `mock-alerts.ts` — needed for fallback when notifications API is empty/errored
  - Keep `scoring.ts` — supplementary powder score derivation
- Add clear comments at top of each mock file indicating which fields are API gap placeholders:
  ```typescript
  // API GAP: storms endpoint doesn't include hourly_snowfall, best_window, road_conditions
  // These mock values are used as placeholders. Remove when API adds these fields.
  ```
- Document all API gaps in a new file: `backlog/api-gaps.md`
- App builds cleanly with `npm run build`
- All screens work with live data + mock supplements
- Full fallback to mock data still works when API is unavailable

---

### 8.8 — Handle expanded resort catalog (82 resorts, new regions)
**As a** user
**I want** new regions and resorts to display correctly
**So that** Arizona, expanded New Mexico/Wyoming, and new Colorado sub-regions appear in the right place

**Context**: API expanded from 50 → 82 resorts. New API regions: `colorado-west`, `colorado-front-range`, `colorado-north`, `new-mexico`, `arizona`. Some resorts have empty passes `[]`, terrain breakdown zeros, or missing `walkUpPricing`.

**Acceptance Criteria**:
- `apiRegionToPocRegion()` in `transforms.ts` maps all new API regions correctly:
  - `colorado-aspen`, `colorado-west`, `colorado-front-range`, `colorado-north` → `"colorado"`
  - `utah-park-city`, `utah-southern` → `"utah"`
  - `california-eastern-sierra` → `"california"`
  - `arizona` → `"southwest"`
  - `new-mexico` → `"southwest"` (already mapped)
- No resort silently falls back to the default region due to unmapped API values (fallback logs a warning)
- `NOT_IN_API` set in `resort-slugs.ts` updated (removed resorts now in API)
- `API_SLUGS` list updated to reflect full 82-resort catalog
- Empty `passes[]` renders correctly (already handled by `primaryPass()` → `"none"`)
- Terrain breakdown all-zeros is treated as "data unavailable" — not rendered as empty/zero display
- `walkUpPricing` null-checked before rendering (already typed as nullable)
- `npm run build` passes
- `npm run lint` passes

---

## Technical Notes

- **Rate limiting**: Free tier is 10 req/min. The dashboard uses 3 calls (ranked + storms + worth-knowing) + 1-2 for hero resort weather/detail = 4-5 per dashboard load. Storm detail adds 2-4 calls for per-resort detail. Resorts page adds 1 call (ranked) + optional per-resort weather. Total budget is tight — cache aggressively and avoid redundant fetches on tab switches.
- **No auth flow needed**: API key auth bypasses the need for Supabase user accounts. The key is baked into env vars. This means all POC users share one API identity (same preferences, same ranked results). This is fine for the POC.
- **Preferences are already saved**: During Epic 0a testing, we POST'd preferences for Denver/Ikon+Epic/120min. The ranked endpoint will return results based on these prefs.
- **The `mock-locations.ts` stays**: The API has no geocoding or location search endpoint. The onboarding location autocomplete will continue using the mock cities list. A future epic could integrate a geocoding API (Google Places, Mapbox, etc.).
- **Component prop changes**: Some components (HeroCard, ConditionsRow, ResortRow, AlertCard, ResortComparison) will need prop changes to accept API response shapes. Create adapter functions in the hooks rather than rewriting components.
- **Hybrid data model**: Each screen will merge live API data with mock supplements. Create a clear pattern for this — e.g., adapter functions that take API data and fill in mock values for missing fields. This keeps components unchanged while data sources evolve.

## Dependencies on API Response Shapes

| Screen Field | Ranked | Storms | Worth-Knowing | Weather | Resort Detail | Mock Fallback |
|---|---|---|---|---|---|---|
| Resort name/ticker | `name`, `ticker` | `affectedResorts[].name` | `name` | — | `resort.name` | `mock-resorts` |
| Pass badge | `passes[]` | — | `passes[]` | — | `resort.passes[]` | `mock-resorts` |
| Snowfall | `forecast_total_inches` | `forecastInches` | `forecastInches` | `forecast[].snowfall` | — | `mock-forecasts` |
| Conditions string | `conditions` | — | — | `current.conditions` | `weather.current.conditions` | — |
| Drive time | `drive_time_minutes` | **gap** | `distanceMiles` | — | `driveTimeMinutes` | `mock-resorts` |
| Temperature | **gap** | **gap** | — | `current.temperature` | `weather.current.temperature` | `mock-forecasts` |
| Wind | **gap** | **gap** | — | `current.wind.speed` | `weather.current.wind.speed` | `mock-forecasts` |
| GoNoGo verdict | **gap** | **gap** | — | — | `goNoGo.overall` | `mock-storms` |
| Powder score | **gap** (use rank) | **gap** | — | — | — | `scoring.ts` |
| Storm severity | — | `severity` | — | — | — | `mock-storms` |
| Hourly timeline | — | **gap** | — | — | — | `mock-storms` |
| Best window | — | **gap** | — | — | — | `mock-storms` |
| Road conditions | — | **gap** | — | — | — | `mock-storms` |
| Daily sparkline | **gap** | — | — | `forecast[].snowfall` | — | `mock-forecasts` |
