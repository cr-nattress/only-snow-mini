# Epic 4: Storm Detail → Live Data

**Goal**: Replace mock storm detail data with live storm tracking and resort-specific go/no-go assessments.

**Priority**: P2
**Depends on**: Epic 0 (Auth), Epic 3 (Dashboard — storms list drives navigation to detail)

---

## Context

The storm detail page (`/storm/[stormId]`) currently shows:
- Storm header (name, dates, severity)
- Timeline bar (hourly snowfall visualization)
- Best window & road conditions cards
- Resort comparison table

The API provides:
- `GET /api/storms` → storm list with affected resorts and 3-day forecasts
- `GET /api/resorts/[slug]` → per-resort detail with weather and go/no-go assessment
- `GET /api/weather?resort=<slug>` → detailed 7-day forecast (public, no auth)

---

## User Stories

### 4.1 — Fetch storm detail from API
**As a** user
**I want** to see real storm data when I tap into a storm
**So that** I can plan around actual weather events

**Acceptance Criteria**:
- On `/storm/[stormId]` mount, find the matching storm from `GET /api/storms` response
- Map API storm data to the page:
  - `storm.name` → storm header
  - `storm.severity` → severity badge
  - `storm.peakDay` → peak day display
  - `storm.affectedResorts` → resort comparison table
  - `forecastCm` → convert to inches for display
- If storm not found in API (stale link), show error state with "Storm no longer active" message

### 4.2 — Resort go/no-go assessments
**As a** user
**I want** to see go/no-go verdicts for each resort in a storm
**So that** I know which resorts are safe and worth visiting

**Acceptance Criteria**:
- For each resort in the storm, call `GET /api/resorts/[slug]` to get `goNoGo` assessment
- Fetch in parallel (max 4 concurrent to respect rate limits)
- Map `goNoGo.overall`: `"go"` → green, `"conditional"` → yellow (maps to "maybe"), `"no-go"` → red (maps to "skip")
- Display `goNoGo.factors` (Wind, Visibility, Temperature, Alerts) on resort detail within the storm
- Show `goNoGo.summary` as a short description under the verdict badge

### 4.3 — Hourly forecast timeline
**As a** user
**I want** to see an hourly snowfall timeline for the storm
**So that** I can pick the best window to ski

**Acceptance Criteria**:
- The API's `DailyForecast` provides daily data, not hourly. Two options:
  - **Option A**: Interpolate hourly from daily (distribute snowfall across hours using a model — overnight bias)
  - **Option B**: Use the `GET /api/weather?resort=<slug>` endpoint which may have more granular data
- For MVP, use daily bars instead of hourly (simplify the timeline visualization)
- Show 3-day forecast bars for the storm duration
- Each bar: date label, snowfall amount (inches), conditions icon

### 4.4 — Best window recommendation
**As a** user
**I want** to see when the best skiing window is during this storm
**So that** I can plan my trip timing

**Acceptance Criteria**:
- Derive "best window" from the storm's peak day + weather conditions
- Logic: best day = day after heaviest snowfall (fresh powder) with go/conditional verdict
- Display as: "Best Window: Saturday AM" with conditions summary
- If all days are "no-go", show: "Consider waiting — conditions are challenging"

### 4.5 — Storm-to-resort navigation
**As a** user
**I want** to tap a resort in the storm comparison to see its full detail
**So that** I can dive deeper into a specific resort's conditions

**Acceptance Criteria**:
- Each resort row in the comparison table links to the full resort detail
- Determine the right link target:
  - If we have a resort detail page → link to `/resorts/[slug]` (future)
  - For now, link could deep-link to the resorts page with filter applied
- Pass storm context so the resort page knows user came from a storm view

---

## Technical Notes

- The API `GET /api/storms` returns a flat list of active storms. The `stormId` URL param needs to match `storm.id` (which is a region slug like `"colorado-i-70"`).
- The POC currently uses numeric storm IDs (`storm-1`, `storm-2`). These need to map to API region-based IDs.
- `GET /api/resorts/[slug]` returns full resort detail + weather + goNoGo. This is the richest per-resort endpoint.
- Rate limiting: If a storm affects 8 resorts, that's 8 parallel calls to `/api/resorts/[slug]`. Stay within 60 req/min.

## Open Questions

- [ ] Should the storm detail page URL use the API's region-based storm IDs or keep synthetic IDs?
- [ ] Is hourly forecast data available from any endpoint, or should we stick with daily resolution?
