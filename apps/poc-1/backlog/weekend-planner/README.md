# Epic 16: Weekend Planner

**Goal**: Add weekend-specific planning features: "Best Saturday" and "Best Sunday" hero cards, and a Friday evening outlook that recommends the optimal weekend skiing plan.

**Priority**: P2 — Quarter 2
**Depends on**: Epic 8 (live data), Epic 15 (scoring v2 for weekend crowd multiplier)
**Effort**: Medium

---

## Context

Reddit sentiment repeatedly surfaces the need: "Just tell me which of my resorts is going to be best this weekend." The current dashboard shows today's best resort but doesn't differentiate Saturday vs Sunday. Weekend planning is a distinct use case — users check Friday evening to decide Saturday and Sunday plans.

The API's `?period=weekend` on the ranked endpoint provides the data foundation. This epic adds UI specifically optimized for the weekend decision.

## User Stories

### 16.1 — Weekend hero cards
**As a** user
**I want** to see the best resort for Saturday and the best for Sunday separately
**So that** I can plan each weekend day optimally

**Acceptance Criteria**:
- Two hero cards on dashboard when viewing weekend period: "Best Saturday" and "Best Sunday"
- Each card shows: resort name, expected snowfall, verdict, drive time
- Cards visible Friday through Sunday
- Falls back to single "Best Weekend" if same resort tops both days

### 16.2 — Weekend outlook summary
**As a** user
**I want** a concise weekend plan recommendation
**So that** I can quickly decide my weekend

**Acceptance Criteria**:
- Summary card: "This weekend: [Resort A] Saturday (8"), [Resort B] Sunday (4")"
- Show when conditions differ meaningfully between Saturday and Sunday
- Factor in crowd predictions (Saturday typically busier)
- Link to resort details for each recommended resort

### 16.3 — Weekend comparison view
**As a** user
**I want** to compare all my resorts' Saturday vs Sunday forecasts
**So that** I can pick the best day for each resort

**Acceptance Criteria**:
- Table/list view: Resort | Saturday forecast | Sunday forecast
- Highlight the better day for each resort
- Sort by: best Saturday, best Sunday, or overall weekend
- Period switcher: "This Weekend" / "Next Weekend"
