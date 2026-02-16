# Epic 10: Real Push Notifications

**Goal**: Replace mocked powder alerts with real push notifications so users get timely alerts about powder days, storms, and weekend conditions.

**Priority**: P0 — Ship before public launch
**Depends on**: Epic 0 (user accounts/auth)
**Effort**: Medium

---

## Context

Powder alerts are the #1 retention driver for ski apps. Currently, OnlySnow's alerts are fully mocked — the alerts page shows static data from `mock-alerts.ts`. OpenSnow charges $50-100/yr largely for its alert system. Reddit sentiment confirms skiers will pay to not miss powder days.

The API already provides `GET /api/notifications` for notification history. What's missing is the delivery mechanism (Web Push API or service worker integration) and the real-time trigger infrastructure.

## User Stories

### 10.1 — Web Push API registration
**As a** user
**I want** to opt into push notifications in my browser
**So that** I receive alerts even when the app isn't open

**Acceptance Criteria**:
- Service worker for push notification handling
- Push subscription registered with backend
- Permission prompt with clear value proposition ("Get alerted when powder days happen")
- Graceful handling of permission denied
- Works on Chrome, Safari (macOS/iOS 16.4+), Firefox

### 10.2 — Notification preferences UI
**As a** user
**I want** to control which alerts I receive
**So that** I only get notifications I care about

**Acceptance Criteria**:
- Toggle for powder alerts (>6" forecast)
- Toggle for storm warnings (approaching storm systems)
- Toggle for weekend outlook (Friday evening summary)
- Threshold setting: minimum snowfall to trigger alert (e.g., 4", 6", 8", 12")
- Preferences synced to API via `PATCH /api/preferences`
- Settings accessible from profile page

### 10.3 — Powder day alert
**As a** user
**I want** to be notified when a resort on my pass is getting significant snow
**So that** I can plan to ski tomorrow

**Acceptance Criteria**:
- Notification fires when forecast exceeds user's threshold for any tracked resort
- Notification includes: resort name, expected snowfall, best window, drive time
- Tapping notification opens resort detail page
- Notification appears in alerts history (`GET /api/notifications`)

### 10.4 — Storm approaching alert
**As a** user
**I want** to know when a storm system is approaching my region
**So that** I can plan around it

**Acceptance Criteria**:
- Notification fires when new storm detected in user's region
- Includes: storm name, severity, peak day, affected resorts
- Tapping notification opens storm detail page

### 10.5 — Weekend outlook summary
**As a** user
**I want** a Friday evening summary of weekend conditions
**So that** I can plan my weekend skiing

**Acceptance Criteria**:
- Notification sent Friday ~5pm local time
- Includes: best resort for Saturday, best for Sunday, expected snowfall
- Tapping notification opens dashboard
