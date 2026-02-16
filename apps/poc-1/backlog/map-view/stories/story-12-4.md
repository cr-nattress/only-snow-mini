# Story 12.4 — Map library integration (Leaflet)

**Status**: Ready
**Epic**: Epic 12 — Map View
**Effort**: Low

## User Story

As a developer, I want a lightweight map library so the map loads fast on mobile.

## Acceptance Criteria

- [ ] Leaflet and react-leaflet installed and configured
- [ ] OpenStreetMap tiles rendering correctly
- [ ] Resort coordinates available in static data file or API response
- [ ] Map works reliably on mobile browsers (iOS Safari, Chrome Mobile)
- [ ] No bundle size bloat (Leaflet ~45KB gzipped)
- [ ] Responsive layout with safe area inset support

## Implementation Notes

Install `leaflet` and `react-leaflet`. Configure OpenStreetMap as tile provider. Create resort coordinates data file in `src/data/` if not available from API. Test on real mobile devices. Consider lazy-loading Leaflet component.
