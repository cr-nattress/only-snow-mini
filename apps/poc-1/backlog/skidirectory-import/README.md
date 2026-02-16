# Epic 20: SkiDirectory Data Import

**Goal**: Import SkiDirectory.org's 455-resort database into OnlySnow's backend, expanding coverage from ~82 resorts to 455 and enriching resort profiles with terrain, elevation, and pass affiliation data.

**Priority**: P2 — Quarter 2
**Depends on**: Epic 8 (live data)
**Effort**: Medium

---

## Context

SkiDirectory.org (a sibling project) has a comprehensive Supabase database with 455 US/Canadian resort listings including:
- Coordinates (lat/lng) for drive time calculation
- Pass affiliations (Epic, Ikon, Indy, Mountain Collective, Powder Alliance, etc.)
- Terrain stats (acres, trails, lifts, beginner/intermediate/advanced/expert breakdown)
- Elevation data (base, summit, vertical drop)
- Social/website links (useful for webcam linking)
- City distance data (pre-computed from major cities)

This data can immediately expand OnlySnow's coverage and improve scoring accuracy (terrain-open %, vertical as snow quality proxy).

## User Stories

### 20.1 — Resort database import
**As a** developer
**I want** to import SkiDirectory resort data into the OnlySnow backend
**So that** OnlySnow covers 455 resorts instead of 82

**Acceptance Criteria**:
- Import script that reads SkiDirectory Supabase data
- Map SkiDirectory schema to OnlySnow resort schema
- Handle duplicates (82 existing resorts matched by name/coordinates)
- Enrich existing resorts with SkiDirectory terrain/elevation data
- New resorts added with all available metadata
- Pass affiliations mapped to OnlySnow pass types

### 20.2 — Terrain data enrichment
**As a** developer
**I want** SkiDirectory terrain stats to improve the scoring algorithm
**So that** recommendations factor in terrain variety and resort size

**Acceptance Criteria**:
- Terrain breakdown (beginner/intermediate/advanced/expert %) available for scoring
- Total acreage for crowd density estimation
- Vertical drop as snow quality proxy (higher vertical = better powder preservation)
- Trail count and lift count for resort capacity estimation

### 20.3 — Expanded pass coverage
**As a** user
**I want** all pass affiliations from SkiDirectory reflected in my filtering
**So that** Powder Alliance, NY SKI3, and other passes work correctly

**Acceptance Criteria**:
- Support additional pass types: Powder Alliance, NY SKI3, RCR Rockies, L'EST GO
- Pass filter in resort list includes new pass types
- Onboarding pass selection expanded if new passes are significant

### 20.4 — SEO cross-linking (future)
**As a** product owner
**I want** SkiDirectory pages to link to OnlySnow conditions
**So that** SkiDirectory drives traffic to OnlySnow

**Acceptance Criteria**:
- "Check today's conditions on OnlySnow" CTA on SkiDirectory resort pages
- Deep link to OnlySnow resort detail page
- Note: requires coordination with SkiDirectory repo
