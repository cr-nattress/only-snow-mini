# Epic 12: Map View

**Goal**: Add an interactive map view with resort pins colored by Go/Maybe/Skip verdict so users can visually explore resort conditions geographically.

**Priority**: P1 — First month post-launch
**Depends on**: Epic 8 (live data)
**Effort**: Medium

---

## Context

The UX assessment identifies no map view as a weakness. SkiDirectory.org already has an interactive map with pass-colored pins — this pattern can be adapted for OnlySnow with verdict-based coloring. Geographic context is especially valuable for the "Worth the Drive" use case.

## User Stories

### 12.1 — Map page with resort pins
**As a** user
**I want** to see all my resorts on a map
**So that** I can understand their geographic distribution and conditions at a glance

**Acceptance Criteria**:
- New tab in bottom navigation or accessible from resort list
- Map centered on user's location with appropriate zoom
- Pin for each resort from `useRankedResorts()`
- Pins colored by verdict: green (Go), amber (Maybe), gray (Skip)
- User's home location shown as distinct marker
- Drive radius circle overlay (optional)

### 12.2 — Map pin popups
**As a** user
**I want** to tap a resort pin and see a quick summary
**So that** I can decide whether to view the full detail

**Acceptance Criteria**:
- Popup/bottom sheet on pin tap showing: resort name, verdict badge, snowfall, drive time
- "View Details" link to resort detail page
- Pass badge on popup
- Dismiss by tapping elsewhere

### 12.3 — Map filtering
**As a** user
**I want** to filter map pins by verdict or pass
**So that** I can focus on relevant resorts

**Acceptance Criteria**:
- Filter chips: Go only, Maybe+, All
- Pass filter: My passes, All passes
- Period switcher matches resort list (Today/Weekend/5D/10D)
- Filtered pins animate in/out

### 12.4 — Map library integration
**As a** developer
**I want** a lightweight map library
**So that** the map loads fast on mobile

**Acceptance Criteria**:
- Evaluate: Mapbox GL JS, Leaflet, or react-map-gl
- Consider: free tier limits, bundle size, mobile performance
- Resort coordinates available from API (`resort.coordinates.lat/lng`)
- Cluster pins when zoomed out (many resorts in same area)
