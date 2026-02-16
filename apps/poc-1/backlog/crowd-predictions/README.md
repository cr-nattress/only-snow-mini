# Epic 19: Crowd Predictions

**Goal**: Build a crowd prediction model that estimates resort crowding based on day-of-week, holidays, weather conditions, and historical patterns. Replace the basic acreage-only crowd risk in the scoring algorithm.

**Priority**: P2 — Quarter 2
**Depends on**: Epic 15 (scoring v2)
**Effort**: High

---

## Context

The current crowdRisk factor in the powder score is basic: `acres < 1000 = crowded`. Real crowd prediction needs to factor in day-of-week, holidays, powder day hype (the "Instagram effect" — a big storm brings everyone out), resort size, and pass type (Ikon resorts have day limits, affecting crowd distribution).

## User Stories

### 19.1 — Day-of-week crowd model
**As a** user
**I want** crowd predictions that reflect weekday vs weekend patterns
**So that** Tuesday recommendations aren't penalized like Saturdays

**Acceptance Criteria**:
- Crowd multipliers by day: Mon-Fri baseline, Saturday 1.5x, Sunday 1.3x
- Holiday calendar with 2.0x multiplier: MLK, Presidents Day, Christmas-NY, spring break
- Crowd score displayed as: "Low", "Moderate", "High", "Very High"
- Visible on resort rows and resort detail

### 19.2 — Powder day crowd surge
**As a** user
**I want** big powder days to factor in the crowd influx
**So that** I know a 12" day will draw bigger crowds than a 3" day

**Acceptance Criteria**:
- Snowfall above regional threshold triggers crowd surge prediction
- Regional thresholds: CO 6"+, UT 8"+, CA 10"+, NE 4"+
- Crowd surge indicator on affected resort rows
- Factor into powder score: partially offset the snowfall bonus

### 19.3 — Crowd indicator on resort rows
**As a** user
**I want** to see expected crowd level on every resort row
**So that** crowd data is always visible alongside conditions

**Acceptance Criteria**:
- Crowd indicator icon/badge on resort rows (person icon with Low/Med/High)
- Color-coded: green (Low), yellow (Moderate), orange (High), red (Very High)
- Tooltip/tap for crowd prediction reasoning
