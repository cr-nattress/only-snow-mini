# Story 11.3 — Webcam data source (static mapping for top resorts)

**Status**: Ready
**Epic**: Epic 11 — Webcam Integration
**Effort**: Low

## User Story

As a developer, I want a mapping of resort slugs to webcam URLs so webcam links are accurate.

## Acceptance Criteria

- [ ] Webcam URL mapping created for at least top 30 resorts
- [ ] Mapping includes both webcam page URL and optional embed image URL (where available)
- [ ] Data stored in a static JSON or TypeScript file in `src/data/`
- [ ] Includes fallback strategy for unmapped resorts (use resort website URL)
- [ ] Easy to extend with new resorts
- [ ] TypeScript type definition for the mapping structure

## Implementation Notes

Create a file like `src/data/webcam-urls.ts` with structure:
```typescript
{
  "mammoth-mountain": {
    webcam_page_url: "https://...",
    webcam_image_url: "https://..." // optional
  }
}
```
Use resort slug as key for easy lookup. Document how to add new resorts.
