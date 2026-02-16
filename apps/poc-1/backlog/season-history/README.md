# Epic 14: Season History & Historical Data

**Goal**: Add season-to-date snowfall totals and historical average comparisons to resort detail and resort list views.

**Priority**: P1 — First month post-launch
**Depends on**: Epic 8 (live data)
**Effort**: Low

---

## Context

The competitive analysis identifies historical data as a P2 gap ("no season totals, no vs average comparisons"). Context like "Vail has received 180" this season (85% of average)" helps users understand whether current conditions are typical or exceptional. The API already provides `avgSnowfall` on the resort profile — historical comparison is a natural extension.

## User Stories

### 14.1 — Season total on resort detail
**As a** user
**I want** to see how much snow a resort has received this season
**So that** I understand overall season quality

**Acceptance Criteria**:
- Display season-to-date snowfall on resort detail page
- Compare to historical average (`resort.avgSnowfall` from API): "180" this season (85% of avg)"
- Visual indicator: above/below/at average (color-coded)
- Data source: aggregate from API weather history or dedicated endpoint (may need API enhancement)

### 14.2 — Season context on resort rows
**As a** user
**I want** a quick season indicator on resort list rows
**So that** I can compare season performance across resorts

**Acceptance Criteria**:
- Small "season %" badge or indicator on resort rows
- Above average = positive indicator, below = warning
- Optional: base depth as supplementary season health metric

### 14.3 — Historical snowfall chart
**As a** user
**I want** to see a monthly snowfall breakdown for the season
**So that** I can understand the season's trajectory

**Acceptance Criteria**:
- Monthly bar chart on resort detail page (Oct-Apr)
- This year vs historical average overlay
- Cumulative snowfall line chart option
- Note: may require API enhancement to provide monthly aggregated data
