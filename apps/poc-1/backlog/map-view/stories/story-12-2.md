# Story 12.2 — Map pin popups

**Status**: Ready
**Epic**: Epic 12 — Map View
**Effort**: Medium

## User Story

As a user, I want to tap a resort pin and see a quick summary so I can decide whether to view full detail.

## Acceptance Criteria

- [ ] Tapping a pin opens a popup with resort information
- [ ] Popup displays: resort name, verdict badge, pass badge, snowfall, drive time
- [ ] "View Details" link in popup navigates to resort detail page
- [ ] Popup dismisses by tapping elsewhere on the map
- [ ] Popup is touch-friendly and readable on mobile
- [ ] Popup shows correct data from current forecast period

## Implementation Notes

Use Leaflet's built-in popup feature or a custom overlay component. Populate popup with data from API/context. Make text sizes mobile-appropriate (minimum 14px). Include close button on popup for accessibility.
