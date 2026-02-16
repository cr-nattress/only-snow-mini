# Epic 6: Alerts → Live Notifications

**Goal**: Replace mock alert data with real notification history from `GET /api/notifications`.

**Priority**: P3
**Depends on**: Epic 0 (Auth)

---

## Context

The alerts page (`/alerts`) shows powder alerts and the settings page (`/alerts/settings`) configures alert preferences. Currently both use mock data.

The API provides:
- `GET /api/notifications` → notification history (powder, storm, weekend, chase, price, worth_knowing)
- `POST /api/preferences` → includes notification settings (`notification_powder`, `notification_storm`, etc.)
- `PATCH /api/preferences` → update individual preferences

---

## User Stories

### 6.1 — Fetch notification history
**As a** user
**I want** to see my real notification history
**So that** I can review past alerts and act on them

**Acceptance Criteria**:
- On `/alerts` mount, call `GET /api/notifications`
- Transform API notifications to match `Alert` type:
  - `type` ("powder", "storm", etc.) → map to alert icon and color
  - `title` → alert title
  - `body` → alert description
  - `sent_at` → relative time display ("2h ago", "Yesterday")
  - `resort_slug` → link to resort detail or storm
  - `opened_at` → read/unread indicator
- Sort by `sent_at` descending (most recent first)
- Loading skeleton while fetching
- Empty state: "No alerts yet. We'll notify you when conditions are great."
- Fall back to mock alerts on error

### 6.2 — Alert type badges and icons
**As a** user
**I want** to visually distinguish between different alert types
**So that** I can quickly scan for powder alerts vs. other notifications

**Acceptance Criteria**:
- Map notification types to visual treatment:
  - `powder` → snowflake icon, blue badge
  - `storm` → cloud-snow icon, orange badge
  - `weekend` → calendar icon, green badge
  - `chase` → compass icon, purple badge
  - `price` → tag icon, yellow badge
  - `worth_knowing` → sparkles icon, teal badge
- Unread alerts (no `opened_at`) get a dot indicator

### 6.3 — Mark alerts as read
**As a** user
**I want** alerts to be marked as read when I view them
**So that** I know which ones I've already seen

**Acceptance Criteria**:
- When an alert card is tapped/viewed, update its `opened_at` timestamp
- Note: Check if the API supports marking notifications as read (may need a PATCH endpoint)
- If no API support: track read state in localStorage as a set of notification IDs
- Unread count shown on the Alerts tab icon (badge number)

### 6.4 — Alert settings sync
**As a** user
**I want** my alert settings to sync with the server
**So that** my notification preferences persist across devices

**Acceptance Criteria**:
- On `/alerts/settings` mount, load current settings from `GET /api/preferences`
- Map API notification fields to settings UI:
  - `notification_powder` → Powder alerts toggle
  - `notification_storm` → Storm alerts toggle
  - `notification_weekend` → Weekend planner toggle
  - `notification_chase` → Chase mode toggle
  - `notification_price` → Price alerts toggle
  - `notification_quiet_start/end` → Quiet hours setting
- On toggle change, call `POST /api/preferences` with updated notification fields
- Optimistic update: toggle immediately in UI, revert on API failure
- Show toast on save failure

### 6.5 — Snowfall threshold setting
**As a** user
**I want** to set a minimum snowfall threshold for powder alerts
**So that** I only get notified for significant storms

**Acceptance Criteria**:
- The POC has `min_snowfall_inches` in `AlertSettings`
- Check if the API preferences have an equivalent field (may not — it has boolean toggles per type)
- If not in API: keep as local-only setting, apply as a client-side filter on notifications
- If in API: sync via preferences endpoint

---

## Technical Notes

- The notification history endpoint may return a large list. Consider pagination or limiting to last 30 days.
- Notification types in the API ("chase", "price", "worth_knowing") don't all have POC equivalents. Show them with generic styling or add new card variants.
- Alert settings are part of the preferences object. Changing a toggle means patching the full preferences — use `POST /api/preferences` which is an upsert.
- The API has `notification_chase` and `notification_price` which the POC settings page doesn't currently show. Consider adding them or ignoring.

## Open Questions

- [ ] Does the API support marking notifications as read/opened?
- [ ] Is there a notification count or unread count endpoint?
- [ ] Should we add chase and price alert toggles to the settings page?
