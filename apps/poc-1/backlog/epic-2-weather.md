# Epic 2: Live Weather (Public API)

**Goal**: Replace mock forecast data with real weather from the public `GET /api/weather?resort=<slug>` endpoint. This endpoint requires no auth, making it the easiest live data to integrate.

**Priority**: P1 (can run in parallel with Epic 0/1)
**Depends on**: Nothing (public endpoint, no auth required)

---

## Context

The weather endpoint returns current conditions + 7-day forecast for any resort. It's the only public API endpoint (no auth).

**Endpoint**: `GET /api/weather?resort=<slug>`
**Cache**: 15-min fresh, 30-min stale (`s-maxage=900, stale-while-revalidate=1800`)
**Units**: Celsius, km/h, cm, meters

### Current Mock Data

POC uses `mock-forecasts.ts` with `ResortForecast[]`:
```
{ resort_id, date, snowfall_inches, snow_quality, wind_mph, high_temp_f, low_temp_f, visibility }
```

API returns `WeatherSnapshot`:
```
{ current: {...}, forecast: DailyForecast[], alerts: WeatherAlert[], fetchedAt }
```

---

## User Stories

### 2.1 — Weather API client function
**As a** developer
**I want** a typed function to fetch weather for a resort
**So that** any component can get live weather data

**Acceptance Criteria**:
- Create `lib/api/weather.ts` with `fetchWeather(slug: string): Promise<WeatherSnapshot>`
- Makes GET request to `${API_BASE}/api/weather?resort=${slug}`
- No auth required — plain fetch
- Returns typed response matching the `WeatherSnapshot` interface
- Handle errors: 400 (invalid slug), 500 (upstream failure), network errors
- Add `WeatherSnapshot`, `DailyForecast`, `WeatherAlert` types to `types/weather.ts`

### 2.2 — Transform API weather to POC format
**As a** developer
**I want** a transform function from API weather to POC `ResortForecast`
**So that** existing components work with live data without changes

**Acceptance Criteria**:
- In `lib/api/transforms.ts`, add `apiWeatherToForecasts(slug: string, data: WeatherSnapshot): ResortForecast[]`
- Map each `DailyForecast` entry:
  - `snowfall` (cm) → `snowfall_inches` (÷ 2.54)
  - `high` / `low` (°C) → `high_temp_f` / `low_temp_f` (×1.8+32)
  - `wind.speed` (km/h) → `wind_mph` (÷ 1.609)
  - `conditions` string → map to nearest `visibility` enum and `snow_quality` enum
- Round converted values to 1 decimal place

### 2.3 — Resort slug mapping
**As a** developer
**I want** a mapping between POC resort IDs and API resort slugs
**So that** I can look up the correct weather for each resort

**Acceptance Criteria**:
- Create `lib/api/resort-slugs.ts` with a mapping: `POC_ID_TO_SLUG: Record<string, string>`
- Map all 12 POC mock resorts to their API slug equivalents (e.g., `"vail"` → `"vail"`, `"copper"` → `"copper-mountain"`)
- Add reverse mapping `SLUG_TO_POC_ID`
- Document any POC resorts that don't exist in the API's 50-resort coverage

### 2.4 — Use live weather on resort list page
**As a** user
**I want** to see real weather data on the resort list
**So that** I can make decisions based on actual conditions

**Acceptance Criteria**:
- On `/resorts` page, fetch weather for visible resorts (batch, parallel)
- Replace mock forecast data with live API data
- Show loading skeleton while fetching
- Fall back to mock data if API call fails
- Respect the 15-min cache — use SWR or React Query for client-side caching
- Limit concurrent requests (max 4 in parallel to avoid rate limits)

### 2.5 — Current conditions display
**As a** user
**I want** to see current temperature and conditions for a resort
**So that** I know what it's like right now, not just the forecast

**Acceptance Criteria**:
- The weather API returns `current` with real-time data (temp, conditions, wind, humidity)
- Add a "Now" indicator on resort detail or resort list showing current temp + conditions
- Convert: `temperature` (°C) → °F, `wind.speed` (km/h) → mph

### 2.6 — Weather alerts display
**As a** user
**I want** to see active weather alerts for a resort
**So that** I'm aware of safety warnings before driving

**Acceptance Criteria**:
- Weather API returns `alerts[]` with severity, title, description, expires
- Display weather alerts on resort detail page or storm detail page
- Color-code by severity: moderate (yellow), severe (orange), extreme (red)
- Show expiry time in user-friendly format

---

## Technical Notes

- This epic has **zero auth dependency**. It can be built and tested independently.
- The weather endpoint has a 15-min cache, so rapid refreshes are fine — the CDN handles it.
- Rate limit is 60 req/min per IP. With 12 resorts fetched in parallel, that's well within limits.
- Consider using `SWR` or `React Query` for data fetching — they handle caching, revalidation, and loading states well. If adding a dependency feels heavy, a simple `useEffect` + `useState` with manual cache is fine for the POC.
- The API has 50 resorts. The POC mock data has 12. We only need slugs for the 12 POC resorts initially.

## Open Questions

- [ ] Do all 12 POC mock resorts have valid slugs in the API? Need to verify mapping.
- [ ] Should we install SWR or React Query, or keep it dependency-light with manual fetching?
