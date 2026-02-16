# Story 14.2 — Season context on resort rows

**Status**: Ready
**Epic**: Epic 14 — Season History
**Effort**: Low

## User Story

As a user, I want a quick season indicator on resort list rows so I can compare season performance across resorts.

## Acceptance Criteria

- [ ] Small inline badge appears on resort rows (above verdict)
- [ ] Badge shows only for seasons significantly above or below average
- [ ] "Good season" badge (green) for >= 90% of average
- [ ] "Low season" badge (amber) for < 60% of average
- [ ] No badge for middle-range seasons (60-89%) to reduce clutter
- [ ] Badge is compact and doesn't stretch row height
- [ ] Works consistently across dashboard and search results

## Implementation Notes

Add to `ResortRow` component. Calculate same percentage as story 14-1. Use conditional rendering to show badge only when needed. Reuse color scheme. Ensure responsive layout on narrow screens.
