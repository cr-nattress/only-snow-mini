# Epic 9: Resort Detail Pages

**Goal**: Build a full resort detail view at `/resorts/[slug]` so tapping a resort anywhere in the app opens a rich detail page with weather, terrain stats, forecast chart, conditions, and webcam links.

**Priority**: P0 — Ship before public launch
**Depends on**: Epic 8 (live data)
**Effort**: Medium

---

## Context

Tapping a resort in the dashboard or resort list is currently a dead end. Every competitor (OpenSnow, OnTheSnow, pass apps) provides resort detail pages. This is the #1 missing UI feature in the POC audit (scored as P1 gap, upgraded to P0 because it's a core navigation dead-end).

The API already provides `GET /api/resorts/[slug]?units=imperial` with full resort profile, weather, and go/no-go assessment. The data is ready — the UI needs to be built.

## User Stories

### 9.1 — Resort detail route and layout
**As a** user
**I want** to tap a resort name anywhere in the app and see its detail page
**So that** I can get full information about a specific resort

**Acceptance Criteria**:
- Create `/resorts/[slug]/page.tsx` route
- Back navigation to previous screen
- Loading skeleton while data fetches
- Error state with retry if API fails (fall back to mock data)
- Resort name and pass badge in header

### 9.2 — Current conditions section
**As a** user
**I want** to see current weather and conditions at a glance
**So that** I know what it's like at the resort right now

**Acceptance Criteria**:
- Go/Maybe/Skip verdict badge (from `goNoGo.overall`)
- Go/no-go factors list with pass/fail indicators
- Current temperature, feels-like, wind speed/gusts, humidity
- Conditions string (e.g., "Light Snow", "Partly Cloudy")
- 24hr snowfall, base depth, terrain open %
- Drive time from user's location

### 9.3 — Forecast chart
**As a** user
**I want** to see a multi-day snowfall forecast
**So that** I can plan when to visit

**Acceptance Criteria**:
- 7-day forecast from `weather.forecast[]`
- Daily bars showing snowfall amounts
- High/low temperature per day
- Wind speed per day
- Precip chance per day
- Visual highlight on best day(s) for skiing

### 9.4 — Terrain and resort info
**As a** user
**I want** to see terrain stats and resort details
**So that** I know what the mountain offers

**Acceptance Criteria**:
- Terrain breakdown: beginner/intermediate/advanced/expert %
- Total acres, trail count, lift count
- Vertical drop, base/summit elevation
- Pass affiliations
- Key features (night skiing, terrain parks, etc.)
- Walk-up pricing (if available from API)

### 9.5 — Link resort rows to detail pages
**As a** user
**I want** to navigate from dashboard and resort list to detail pages
**So that** every resort mention in the app is tappable

**Acceptance Criteria**:
- Dashboard hero card links to resort detail
- Dashboard resort rows link to resort detail
- Resort list rows link to resort detail
- Storm detail resort rows link to resort detail
- "Worth the Drive" entries link to resort detail
