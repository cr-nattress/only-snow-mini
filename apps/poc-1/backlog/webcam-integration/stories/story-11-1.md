# Story 11.1 — Webcam links on resort detail

**Status**: Ready
**Epic**: Epic 11 — Webcam Integration
**Effort**: Low

## User Story

As a user, I want a link to the resort's webcam page so I can visually check conditions.

## Acceptance Criteria

- [ ] "View Webcams" link appears on resort detail page
- [ ] Link opens the resort's official webcam page in a new tab
- [ ] Falls back gracefully to resort website if no webcam URL is known
- [ ] Link is visually prominent but not intrusive (e.g., secondary button or info section)
- [ ] Works on mobile and desktop

## Implementation Notes

Add a new section or card on the resort detail page that displays the webcam link. Use the webcam URL mapping from story 11-3. Style with Tailwind, use lucide-react icon (e.g., camera icon). Handle missing URLs by showing the resort website link as fallback.
