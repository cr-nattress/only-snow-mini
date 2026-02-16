# Story 11.2 — Webcam embed (image/feed where available)

**Status**: Ready
**Epic**: Epic 11 — Webcam Integration
**Effort**: Medium

## User Story

As a user, I want to see a webcam image directly in the app so I don't have to leave.

## Acceptance Criteria

- [ ] Webcam image embeds on resort detail page for resorts with available imagery
- [ ] Shows the most recent still frame from the resort's webcam
- [ ] Tap/click on image opens full view in a modal or new tab
- [ ] Graceful fallback to link-only view if image unavailable
- [ ] Images are lazy-loaded to avoid blocking initial page load
- [ ] Handles failed image loads (404, timeout) without breaking the page
- [ ] Mobile-optimized: responsive, fits within screen safely

## Implementation Notes

Store optional `webcam_image_url` in the webcam mapping (story 11-3). Use `<Image>` from Next.js with `priority={false}` for lazy loading. Add error state handling and a fallback UI. Consider caching strategies for image freshness vs performance.
