# Epic 11: Webcam Integration

**Goal**: Add resort webcam feeds or links to the resort detail page so users can visually verify conditions.

**Priority**: P1 — First month post-launch
**Depends on**: Epic 9 (resort detail pages)
**Effort**: Low

---

## Context

Webcams are the #1 feature gap identified in the competitive analysis. Every major competitor (OpenSnow, OnTheSnow, SnoCountry) has webcam integration. Skiers use webcams to verify snow reports — "trust but verify." Reddit threads repeatedly cite webcams as essential.

SkiDirectory.org already has resort social/website links that can be used to link to webcam pages. The Liftie API (https://liftie.info) provides webcam data for many resorts.

## User Stories

### 11.1 — Webcam links on resort detail
**As a** user
**I want** a link to the resort's webcam page
**So that** I can visually check conditions

**Acceptance Criteria**:
- "View Webcams" link on resort detail page
- Links to resort's official webcam page (sourced from resort website URLs)
- Opens in external browser/new tab
- Fallback: link to resort's main website if no webcam URL known

### 11.2 — Webcam embed (if available)
**As a** user
**I want** to see a webcam image directly in the app
**So that** I don't have to leave to check conditions

**Acceptance Criteria**:
- Embed webcam image/feed for resorts where available (Liftie API or direct embed URLs)
- Show most recent still frame with timestamp
- Tap to open full webcam view
- Graceful fallback to link-only if embed not available
- Lazy-load webcam images (not on initial page load)

### 11.3 — Webcam data source
**As a** developer
**I want** a mapping of resort slugs to webcam URLs
**So that** webcam links are accurate

**Acceptance Criteria**:
- Create webcam URL mapping for top 30 resorts (by usage)
- Consider Liftie API integration for automated webcam data
- Consider SkiDirectory.org resort links as data source
- Fallback strategy for resorts without known webcam URLs
