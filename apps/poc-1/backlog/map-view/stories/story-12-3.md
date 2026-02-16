# Story 12.3 — Map filtering

**Status**: Ready
**Epic**: Epic 12 — Map View
**Effort**: Medium

## User Story

As a user, I want to filter map pins by verdict or pass so I can focus on relevant resorts.

## Acceptance Criteria

- [ ] Verdict filter chips above map: "Go", "Maybe+", "All"
- [ ] Pass filter dropdown (All, Epic, Ikon, Season)
- [ ] Period switcher (Today, Weekend, 5D, 10D)
- [ ] Resort count indicator shows filtered count
- [ ] Filters persist in AppContext (state survives navigation)
- [ ] Map pins update in real-time when filter changes
- [ ] Keyboard/screen-reader accessible

## Implementation Notes

Add filter controls above the map as a sticky bar. Use existing `VerdictBadge` and chip components. Pipe filters through AppContext and memoize pin rendering to avoid unnecessary re-renders. Ensure performance with large datasets.
