# Story 12.1 — Map page with resort pins

**Status**: Ready
**Epic**: Epic 12 — Map View
**Effort**: Medium

## User Story

As a user, I want to see all my resorts on a map so I can understand geographic distribution and conditions at a glance.

## Acceptance Criteria

- [ ] New "Map" tab added to bottom navigation (5th tab after Profile)
- [ ] Map page loads and centers on user's current location
- [ ] Pin for each resort displayed on map
- [ ] Pin color reflects verdict: green (Go), amber (Maybe), gray (Skip)
- [ ] Pin size proportional to snowfall (larger snowfall = larger pin)
- [ ] Map is responsive and works on mobile and desktop
- [ ] No performance degradation with 20+ resorts
- [ ] Loads within 2 seconds on 4G

## Implementation Notes

Use Leaflet + react-leaflet (story 12-4). Fetch user location via geolocation API. Render pins for each resort from the API response or context. Store verdict-to-color mapping (use existing design tokens). Consider clustering for high-density areas.
