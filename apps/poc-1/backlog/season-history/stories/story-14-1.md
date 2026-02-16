# Story 14.1 — Season total on resort detail

**Status**: Ready
**Epic**: Epic 14 — Season History
**Effort**: Medium

## User Story

As a user, I want to see how much snow a resort has received this season so I understand overall season quality.

## Acceptance Criteria

- [ ] Season snowfall section appears on resort detail page
- [ ] Shows total snowfall to date vs seasonal average
- [ ] Includes progress bar visually representing season progress
- [ ] Progress bar color coded: green (>=90% of average), amber (60-89%), red (<60%)
- [ ] Displays numeric values: "X inches of Y average"
- [ ] Uses `avgSnowfall` from API as the average benchmark
- [ ] Mobile-responsive design, fits naturally in page flow
- [ ] Graceful handling if season data unavailable

## Implementation Notes

Add a card/section below the forecast on resort detail. Pull `avgSnowfall` from resort data (from API). Calculate season total as sum of daily snowfall to date or use API field if available. Calculate percentage: `(total / average) * 100`. Use Tailwind for bar styling with conditional color classes.
