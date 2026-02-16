# Story 9.6 — Resort Website Link + Data Population

**Status**: Ready
**Epic**: Epic 9 — Resort Detail Pages
**Effort**: Low-Medium
**Priority**: P1

## User Story

As a user, I want a link to the resort's official website on the resort detail page so that I can quickly access lift tickets, trail maps, lodging, and other info the app doesn't provide.

## Acceptance Criteria

### Frontend
- [ ] "Visit Website" link on resort detail page (in terrain/info section or as standalone)
- [ ] Opens in new tab / external browser (`target="_blank"`)
- [ ] Uses `ExternalLink` icon from lucide-react, consistent with webcam links
- [ ] Graceful fallback if no URL is stored (hide link, don't show broken state)
- [ ] Works for all resorts that have a `websiteUrl` field populated

### Backend / Data
- [ ] Add `website_url` column to the resorts table in Supabase (`text`, nullable)
- [ ] Populate `website_url` for all resorts in the database (batch update script or migration)
- [ ] Expose `websiteUrl` field on the `GET /api/resorts/[slug]` response (ApiResortDetail type)
- [ ] Confirm data is available in ranked endpoint too (for potential future use in resort rows)

## Implementation Notes

### Data Population
The SkiDirectory.org import already has resort website URLs in its dataset. Approach options:
1. **SQL migration** — Write a Supabase migration with UPDATE statements for each resort
2. **Seed script** — Node script that reads SkiDirectory data and batch-updates the column
3. **Manual entry** — For ~100 resorts, a CSV import or Supabase dashboard bulk edit

Recommended: SQL migration so it's repeatable and version-controlled.

### API Changes
- Add `websiteUrl` to the resort profile response in the SkiData API
- The `ApiResortDetail` type in `src/types/api.ts` needs a new optional field:
  ```typescript
  websiteUrl?: string;
  ```

### Frontend Changes
- Add a link in `TerrainSection` (alongside pricing/passes) or as a standalone card
- Reuse the same pattern as `WebcamSection` for external links
- No new component needed — a simple `<a>` tag with icon suffices

### Data Sources for Website URLs
- SkiDirectory.org resort profiles (already imported for other data)
- Resort association directories (NSAA member list)
- Manual verification for top 30 resorts to ensure accuracy

## Dependencies
- Requires access to Supabase database (SkiData backend)
- API deployment to expose new field
- Frontend can be built independently using optional chaining on the new field

## Out of Scope
- Deep linking to specific resort pages (lift tickets, trail map, etc.)
- Resort website scraping or embedding
- Multiple URLs per resort (social media, etc.)
