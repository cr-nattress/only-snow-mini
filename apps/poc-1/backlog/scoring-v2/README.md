# Epic 15: Scoring Algorithm v2

**Goal**: Enhance the powder score algorithm to incorporate wind, temperature, terrain-open percentage, base depth, and day-of-week crowd adjustment. Merge client-side scoring with the API's go/no-go assessment for richer signal.

**Priority**: P1 — First month post-launch
**Depends on**: Epic 8 (live data provides the additional signals)
**Effort**: Low

---

## Context

The competitive analysis scoring audit identifies the current formula as "Good: Simple, interpretable, tunable" but missing key factors:
- No wind penalty
- No temperature factor
- No terrain-open percentage
- No base depth consideration
- No day-of-week crowd adjustment (weekend vs Tuesday)

The API's `goNoGo` assessment adds Wind/Visibility/Temperature/Alerts factors that the client-side scoring doesn't incorporate. Merging these creates a more accurate recommendation.

**Current formula**: `powder_score = (totalSnowfall × 2) + (avgQuality × 1.5) - driveTimePenalty - crowdRisk`

## User Stories

### 15.1 — Add wind penalty
**As a** user
**I want** windy days penalized in the score
**So that** I'm not recommended a resort with 50mph gusts

**Acceptance Criteria**:
- Wind speed from `weather.current.wind.speed` or `goNoGo.factors[Wind]`
- Penalty curve: 0 for <15mph, linear increase to -10 for 40mph+
- Gusts above 50mph trigger automatic "Skip" override
- Update `scoring.ts` with windPenalty factor

### 15.2 — Add temperature factor
**As a** user
**I want** extreme cold factored into recommendations
**So that** I know when conditions are dangerously cold

**Acceptance Criteria**:
- Temperature from `weather.current.temperature` (imperial)
- Penalty for feels-like below 0°F: -2 per 5°F below zero
- Bonus for ideal powder preservation temps (20-28°F): +2
- Extreme cold warning (<-10°F feels-like) in verdict display

### 15.3 — Add terrain-open percentage
**As a** user
**I want** the score to reflect how much terrain is actually open
**So that** early/late season conditions are properly weighted

**Acceptance Criteria**:
- `terrain_open_pct` from API ranked endpoint
- Below 50% open: penalty (-5)
- Below 25% open: larger penalty (-10)
- Display terrain open % on resort rows

### 15.4 — Add weekend crowd multiplier
**As a** user
**I want** weekend crowding reflected in my scores
**So that** Saturday recommendations properly account for crowds

**Acceptance Criteria**:
- Detect if the forecast period includes Saturday/Sunday
- Apply crowd multiplier: Saturday 1.5x, Sunday 1.3x, holiday 2.0x
- Holiday calendar: MLK, Presidents Day, Christmas-NY, spring break weeks
- Show crowd risk indicator on resort rows

### 15.5 — Merge with API go/no-go
**As a** developer
**I want** the client-side powder score to incorporate the API's go/no-go assessment
**So that** we get the best of both scoring systems

**Acceptance Criteria**:
- When API `goNoGo` is available for a resort, factor it into the score
- `goNoGo.overall = "no-go"` caps powder score at 14 (forces Skip)
- `goNoGo.overall = "go"` adds +5 bonus
- Individual factors (Wind fail, Visibility fail) apply specific penalties
- Graceful fallback to client-only scoring when goNoGo unavailable
