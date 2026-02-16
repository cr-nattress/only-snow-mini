# Epic 17: Resort Comparison

**Goal**: Build a side-by-side comparison tool for 2-3 resorts, showing weather, terrain, snowfall, and verdicts in a unified view.

**Priority**: P2 — Quarter 2
**Depends on**: Epic 9 (resort detail pages)
**Effort**: Medium

---

## Context

ZRankings offers resort comparison as a key feature for trip planning. OnlySnow's "Worth the Drive" section implicitly compares resorts, but users sometimes want an explicit side-by-side view: "Should I go to Vail or Copper today?"

## User Stories

### 17.1 — Compare selection UI
**As a** user
**I want** to select 2-3 resorts to compare
**So that** I can evaluate them side by side

**Acceptance Criteria**:
- "Compare" button or action on resort rows
- Select up to 3 resorts for comparison
- Selection persists across navigation (session state)
- Floating "Compare (N)" action bar when resorts selected
- Clear all / remove individual selections

### 17.2 — Comparison view
**As a** user
**I want** to see resorts compared across key metrics
**So that** I can make an informed decision

**Acceptance Criteria**:
- Side-by-side layout (columns per resort)
- Comparison rows:
  - Verdict badge (Go/Maybe/Skip)
  - Powder score
  - Forecast snowfall (today, weekend, 5-day)
  - Current temperature, wind
  - Drive time from user location
  - Base depth, terrain open %
  - Pass affiliation
  - Vertical drop, total acres
- Highlight the "winner" in each row
- Overall recommendation at top: "We'd pick [Resort A]"

### 17.3 — Share comparison
**As a** user
**I want** to share a comparison with my ski group
**So that** we can decide together

**Acceptance Criteria**:
- Share button generates a shareable link or screenshot
- Comparison data encoded in URL params (no auth required to view)
- Social sharing (copy link, native share API)
