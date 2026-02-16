# Epic 18: Avalanche Info

**Goal**: Display avalanche danger ratings from CAIC, NWAC, and other avalanche centers on resort detail pages and storm detail views.

**Priority**: P2 — Quarter 2
**Depends on**: Epic 9 (resort detail pages)
**Effort**: Low

---

## Context

Backcountry skiing continues to grow in popularity, and avalanche danger is safety-critical information. OpenSnow integrates avalanche data; most other competitors don't. Linking to CAIC/NWAC danger ratings per resort area adds significant safety value with relatively low implementation effort.

## User Stories

### 18.1 — Avalanche danger rating on resort detail
**As a** user
**I want** to see the current avalanche danger level for the resort area
**So that** I'm aware of backcountry safety conditions

**Acceptance Criteria**:
- Show avalanche danger rating (Low/Moderate/Considerable/High/Extreme) with standard color scale
- Data sourced from avalanche.org API or CAIC/NWAC APIs
- Map resort locations to avalanche forecast zones
- Link to full avalanche forecast on the relevant center's website
- Display elevation-band breakdown if available (below/near/above treeline)
- Show "N/A" for resorts not covered by avalanche centers

### 18.2 — Avalanche warning in storm context
**As a** user
**I want** to see avalanche warnings alongside storm information
**So that** I understand the safety implications of heavy snowfall

**Acceptance Criteria**:
- When storm severity is "Major" or "Significant", show avalanche caution notice
- Display on storm detail page for affected resort areas
- Link to avalanche center special advisories when active
