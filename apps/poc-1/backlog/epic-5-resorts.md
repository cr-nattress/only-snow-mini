# Epic 5: Resort List → Live Data

**Goal**: Replace mock resort list and forecast data with live ranked resorts and real weather data.

**Priority**: P2
**Depends on**: Epic 0 (Auth), Epic 2 (Weather — for supplemental weather data)

---

## Context

The resorts page (`/resorts`) shows a filterable list of ski resorts with:
- Region filter chips
- Pass type filter
- Forecast sparkline (5-day snowfall)
- Current conditions (48h snowfall, powder score, verdict)

The API provides `GET /api/resorts/ranked?period=5d` which returns resorts ranked by snowfall, already filtered by the user's preferences.

---

## User Stories

### 5.1 — Fetch ranked resorts for list
**As a** user
**I want** to see a personalized resort list ranked by conditions
**So that** I can compare my options at a glance

**Acceptance Criteria**:
- On `/resorts` mount, call `GET /api/resorts/ranked?period=5d`
- Transform API response to match `Resort` + `ResortConditions` types:
  - `slug` → `id`, `name`, `ticker`, `state`, `region` (map API region → POC region)
  - `passes[]` → `pass` (primary pass)
  - `forecast_total` (cm) → snowfall inches
  - `snowfall_24h` (cm) → 24h snowfall inches
  - `drive_time_minutes` → `drive_minutes`
  - `base_depth` (inches, as-is), `terrain_open_pct` (as-is)
- Loading skeleton while fetching
- Fall back to mock resorts on error

### 5.2 — Client-side resort filtering
**As a** user
**I want** to filter resorts by region and pass type
**So that** I can narrow down my options

**Acceptance Criteria**:
- Region filter: API resorts use granular regions (`colorado-i70`, `colorado-south`, etc.). Map to POC broad regions for filter chips.
- Pass filter: API `passes[]` is an array. Filter by "has this pass" rather than exact match.
- The API already filters by user preferences (pass + drive radius). Client-side filters are additional narrowing.
- Keep current filter UX (chips for region, dropdown for pass)
- "All" option shows the full API response

### 5.3 — Live weather for resort rows
**As a** user
**I want** to see current conditions for each resort in the list
**So that** I know what's happening right now

**Acceptance Criteria**:
- For each visible resort, fetch `GET /api/weather?resort=<slug>` (public, no auth)
- Show current temp (°F) and conditions text on each resort row
- Fetch lazily — only when resort becomes visible (or batch first 10)
- Cache aggressively (15-min TTL matching server cache)
- Don't block the list render — show resort info immediately, weather loads in

### 5.4 — Snowfall sparkline from forecast
**As a** user
**I want** to see a 5-day snowfall trend for each resort
**So that** I can spot which days have the most snow

**Acceptance Criteria**:
- Use `forecast[]` from the weather API to build sparkline data
- 7 days of forecast data available; show 5 days to match existing sparkline component
- Convert `snowfall` (cm) → inches for each day
- Sparkline visual stays the same (tiny SVG bar chart)

### 5.5 — Period switcher
**As a** user
**I want** to toggle between "Today", "Weekend", and "5-Day" views
**So that** I can plan for different timeframes

**Acceptance Criteria**:
- Add period toggle chips: Today | Weekend | 5-Day
- Each selection re-fetches `GET /api/resorts/ranked?period=<today|weekend|5d>`
- Loading indicator during re-fetch (don't clear existing data — overlay spinner)
- Cache each period's results separately
- Default to "5-Day" (matches current behavior)

---

## Technical Notes

- `GET /api/resorts/ranked` requires auth and completed onboarding (preferences must exist). If user has no preferences, the endpoint returns `404`.
- The API returns resorts already filtered by the user's pass type and drive radius. This means the "Pass" filter on the client might show fewer options than the mock data did.
- The API's `region` values are more granular than the POC's. Region mapping:

| API Region | POC Region |
|-----------|------------|
| `colorado-i70`, `colorado-aspen`, `colorado-south`, `colorado-north` | `colorado` |
| `utah-park-city`, `utah-cottonwoods`, `utah-northern` | `utah` |
| `california-tahoe`, `california-eastern-sierra` | `california` |
| `pacific-northwest` | `pacific_northwest` |
| `new-england` | `northeast` |
| `wyoming`, `montana`, `idaho` | `northern_rockies` |
| `british-columbia`, `alberta` | `canada_west` |
| `new-mexico` | `southwest` |

- Weather calls are public (no auth). Can be done even before auth is set up.
- Consider a `useResorts` hook that encapsulates the fetch + transform + cache logic.

## Open Questions

- [ ] Should the resort list show all 50 API resorts or just the user's preference-filtered set?
- [ ] The API doesn't return `powder_score` or `verdict`. Derive client-side or call `/api/resorts/[slug]` for goNoGo?
