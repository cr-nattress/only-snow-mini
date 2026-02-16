# Epic 3: Dashboard → Live Data

**Goal**: Replace mock storm/resort data on the dashboard with live API data from ranked resorts, storms, and worth-knowing endpoints.

**Priority**: P1
**Depends on**: Epic 0 (Auth), Epic 1 (Onboarding — user needs preferences saved to API)

---

## Context

The dashboard currently builds its view from mock data:
- **Hero card**: Best resort from mock storms (highest powder score)
- **Upcoming list**: All storm/resort combos, deduplicated by resort, sorted by powder score
- **"Getting snow elsewhere" teasers**: Top forecast resorts from other regions

The live API provides three endpoints that map to these sections:

| Dashboard Section | API Endpoint | What It Returns |
|-------------------|-------------|-----------------|
| Hero card + Upcoming | `GET /api/resorts/ranked?period=today` | Resorts ranked by snowfall, filtered by user's pass + drive radius |
| Storm context | `GET /api/storms` | Active storm systems with affected resorts and severity |
| Teasers | `GET /api/worth-knowing` | Resorts outside user's list with significantly more snow |

---

## User Stories

### 3.1 — Fetch ranked resorts for dashboard
**As a** user
**I want** to see my personalized resort rankings on the dashboard
**So that** I know which resorts are getting the most snow within my preferences

**Acceptance Criteria**:
- On `/dashboard` mount, call `GET /api/resorts/ranked?period=today`
- Transform API response to match the dashboard's existing data shape:
  - `forecast_total` (cm) → snowfall in inches
  - `snowfall_24h` (cm) → 24h snowfall in inches
  - `drive_time_minutes` → `drive_minutes`
  - `passes[]` → primary `pass` for badge display
  - `conditions` string → map to verdict (go/maybe/skip) based on simple heuristics or use goNoGo if available
- First resort becomes the hero card
- Remaining resorts populate the "Upcoming" list
- Loading skeleton while data loads
- Error state: show mock data as fallback with a "data unavailable" indicator

### 3.2 — Fetch active storms
**As a** user
**I want** to see active storm systems on my dashboard
**So that** I know about incoming weather events

**Acceptance Criteria**:
- Call `GET /api/storms` on dashboard mount
- Map storms to hero card context:
  - If a storm is affecting user's top-ranked resort, show storm name + severity on hero card
  - Storm `peakDay` → display as "Peak: Saturday" etc.
- If no active storms, hero card shows best general conditions instead
- Storm severity badge: major (red), significant (orange), moderate (blue)

### 3.3 — Fetch "worth knowing" teasers
**As a** user
**I want** to see resorts outside my usual range that are getting exceptional snow
**So that** I might discover a trip worth taking

**Acceptance Criteria**:
- Call `GET /api/worth-knowing` on dashboard mount
- Replace the mock "Getting snow elsewhere" section with API data
- Display: resort name, forecast inches, differential vs. user's best, pass info, distance
- If API returns empty (no standout resorts), hide the teaser section
- Fall back to mock teaser data on error

### 3.4 — Combine API data into dashboard view model
**As a** developer
**I want** a clean data transformation layer between API responses and dashboard components
**So that** component props stay stable even as the API evolves

**Acceptance Criteria**:
- Create `lib/api/dashboard.ts` with:
  - `fetchDashboardData(): Promise<DashboardViewModel>`
  - Fetches ranked resorts, storms, and worth-knowing in parallel
  - Merges storm data with ranked resorts (attach storm context to resort entries)
  - Returns a single `DashboardViewModel` type matching what the page component expects
- `DashboardViewModel` includes: `heroResort`, `upcomingResorts[]`, `activeStorms[]`, `teaserResorts[]`, `fetchedAt`

### 3.5 — Dashboard loading and error states
**As a** user
**I want** to see loading skeletons instead of a blank screen while data loads
**So that** the app feels responsive

**Acceptance Criteria**:
- Skeleton cards matching the shape of hero card, conditions rows, and teasers
- Show skeletons on initial load (no cached data)
- If cached data exists (from previous load), show stale data while refreshing
- Error banner at top: "Unable to load live data. Showing cached results." with retry button
- If both API and cache fail, fall back to mock data

### 3.6 — Pull-to-refresh on dashboard
**As a** user
**I want** to pull down to refresh the dashboard
**So that** I can see the latest conditions

**Acceptance Criteria**:
- Pull-to-refresh gesture on mobile refreshes all three API calls
- Show a brief loading indicator at the top
- Update displayed data when new data arrives
- Debounce: ignore rapid repeated pulls (min 5s between refreshes)

---

## Technical Notes

- **Three parallel API calls**: `resorts/ranked`, `storms`, and `worth-knowing` should fire simultaneously. Use `Promise.allSettled` so one failure doesn't block the others.
- The `resorts/ranked` response doesn't include a go/no-go verdict. To get verdicts, we'd need to call `GET /api/resorts/[slug]` per resort (which returns `goNoGo`). For MVP, derive a simple verdict from snowfall thresholds: >15cm = go, 5-15cm = maybe, <5cm = skip.
- **Caching strategy**: Consider `SWR` with `revalidateOnFocus: true` for the dashboard. This gives instant loads on tab-switch with background revalidation.
- The API returns data filtered by user preferences (pass type, drive radius), so the dashboard doesn't need to filter client-side.
- `worth-knowing` returns max 2 resorts. The current mock teasers show 3. Accept 2, or supplement with a resort from `ranked` that has different region.

## Open Questions

- [ ] Should we derive verdicts client-side from snowfall, or call `/api/resorts/[slug]` per resort to get goNoGo?
- [ ] The current dashboard "Upcoming" section groups by storm. The API `resorts/ranked` is a flat list. Should we maintain storm grouping or switch to a flat ranking?
