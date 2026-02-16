# Epic 13: Road Conditions Integration

**Goal**: Integrate real highway condition data (CDOT, UDOT, Caltrans) so storm detail and resort detail pages show actual road status instead of placeholder text.

**Priority**: P1 — First month post-launch
**Depends on**: Epic 8 (live data)
**Effort**: Medium

---

## Context

Road conditions are critical for Colorado (I-70 corridor), Utah (canyon roads), and California (I-80/US-50) skiers. The storm detail page currently shows placeholder road condition text. The POC audit flags this as a P2 gap, but the competitive analysis upgrades it to P1 given the core target persona (CO Front Range day-tripper).

## User Stories

### 13.1 — CDOT I-70 corridor conditions
**As a** Colorado skier
**I want** to see I-70 road conditions on storm and resort detail pages
**So that** I know if the drive is safe and how long it'll take

**Acceptance Criteria**:
- Integrate CDOT CoTrip API for I-70 conditions (Eisenhower Tunnel, Vail Pass, etc.)
- Show: road status (open/closed/chain law/traction law), travel time estimates
- Display on storm detail page when storm affects Colorado resorts
- Display on resort detail page for CO resorts
- Auto-refresh every 15 minutes

### 13.2 — Utah canyon conditions
**As a** Utah skier
**I want** to see canyon road conditions (Big/Little Cottonwood, Parleys)
**So that** I know about traction devices, closures, and ski bus requirements

**Acceptance Criteria**:
- Integrate UDOT API for canyon road status
- Show traction device requirements, road closures
- Note ski bus availability when roads are restricted

### 13.3 — Road conditions in scoring
**As a** user
**I want** road closures factored into my recommendations
**So that** I'm not recommended a resort I can't reach

**Acceptance Criteria**:
- When a key access road is closed, downgrade resort verdict
- Show road closure warning on affected resort rows in dashboard
- Add road status indicator to resort list rows

### 13.4 — Generic road conditions fallback
**As a** user in any region
**I want** basic road condition awareness
**So that** I'm warned about difficult driving conditions

**Acceptance Criteria**:
- For regions without dedicated DOT API: show weather-based road warnings
- Derive from storm severity + temperature (below freezing + active precip = "Expect difficult driving")
- Link to state DOT website for manual checking
