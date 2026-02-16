# Story 14.3 — Historical snowfall chart (BLOCKED)

**Status**: Blocked
**Epic**: Epic 14 — Season History
**Effort**: Medium

## User Story

As a user, I want to see a monthly snowfall breakdown for the season so I can understand the season's trajectory.

## Acceptance Criteria

- [ ] Monthly bar chart displays October through April
- [ ] Current year snowfall overlaid with historical average
- [ ] Chart is responsive and readable on mobile
- [ ] Tooltips show exact values on tap/hover
- [ ] Chart updates when resort changes on detail page

## Blocking Issue

This story is **BLOCKED** and descoped from the current implementation cycle. The backend API does not yet provide a monthly-breakdown endpoint with historical averages. Once the API is enhanced to return monthly data, this story can be unblocked and implemented.

## Implementation Notes (Future)

Will require API enhancement to `/api/resorts/:slug/monthly-forecast` or similar. Once available, use a charting library (e.g., Recharts) to render bars and overlay data. Store as seasonal data in types and retrieve from API response.
