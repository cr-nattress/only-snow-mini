# Epic 7: Profile → Live Preferences

**Goal**: Sync the profile page with server-side preferences so edits persist across devices and sessions.

**Priority**: P3
**Depends on**: Epic 0 (Auth), Epic 1 (Onboarding — preferences must exist)

---

## Context

The profile page (`/profile`) shows:
- Home location, drive radius, pass type, ski preferences (from onboarding)
- Alert settings summary
- Deferred profile sections (schedule, travel tolerance, crowd tolerance, skill level)
- Sign out action

Currently all data is in localStorage via `UserContext`. The API has `GET /api/preferences` to read and `POST /api/preferences` to write the full preferences object, plus `PATCH /api/preferences` for favorite resort changes.

---

## User Stories

### 7.1 — Load profile from API
**As a** user
**I want** my profile loaded from the server
**So that** I see the same data on any device

**Acceptance Criteria**:
- On `/profile` mount, call `GET /api/preferences`
- Map API preferences → `UserProfile`:
  - `location_lat/lng/name` → `home_location: { lat, lng, display_name }`
  - `drive_radius_miles` → `max_drive_minutes` (reverse of Epic 1 conversion)
  - `pass_type[]` → `passes: PassType[]`
  - `notification_*` → `alert_settings`
  - `favorite_resorts[]` → display as a list
- Merge with localStorage data (server wins for fields that exist in both)
- Loading state while fetching
- Fall back to localStorage on error

### 7.2 — Edit home location
**As a** user
**I want** to change my home location from the profile page
**So that** resort distances are recalculated

**Acceptance Criteria**:
- Tap "Edit" on the location section opens an inline editor or modal
- Reuse the location search from onboarding (Story 1.3)
- On save: call `POST /api/preferences` with updated `location_lat/lng/name`
- Update localStorage simultaneously (dual-write)
- Show confirmation toast: "Location updated"
- Nearby resorts and drive times will refresh on next dashboard visit

### 7.3 — Edit drive radius
**As a** user
**I want** to change my drive radius from the profile
**So that** I see more or fewer resort options

**Acceptance Criteria**:
- Tap "Edit" on drive radius section shows the radius options (same as onboarding step)
- On selection change: call `POST /api/preferences` with updated `drive_radius_miles`
- Update localStorage
- Confirmation toast

### 7.4 — Edit pass type
**As a** user
**I want** to change my pass type from the profile
**So that** resort filtering matches my current pass

**Acceptance Criteria**:
- Tap "Edit" on pass section shows the pass selection (same as onboarding step)
- On change: call `POST /api/preferences` with updated `pass_type[]`
- Update localStorage
- Confirmation toast

### 7.5 — Favorite resorts management
**As a** user
**I want** to add or remove favorite resorts
**So that** I can track specific resorts I care about

**Acceptance Criteria**:
- Profile shows list of `favorite_resorts` (resort slugs resolved to names)
- "Add favorite" button → search/select from available resorts
- Remove favorite via swipe or X button
- Use `PATCH /api/preferences` with `addFavoriteResort` / `removeFavoriteResort` for individual changes
- Optimistic UI: update list immediately, revert on failure

### 7.6 — Deferred profile sections
**As a** user
**I want** to fill in optional profile sections over time
**So that** my recommendations improve as I provide more info

**Acceptance Criteria**:
- Deferred sections (schedule, travel tolerance, crowd tolerance, skill level) stay as local-only data initially
- The API's `UserPreferences` type doesn't include these fields — they're POC-specific
- Keep in localStorage via `UserContext`
- Add a note: "These preferences are stored locally and will be synced in a future update"
- Future: when API adds support, sync these too

### 7.7 — Sign out
**As a** user
**I want** to sign out of my account
**So that** I can switch accounts or protect my data on shared devices

**Acceptance Criteria**:
- "Sign Out" button calls `supabase.auth.signOut()`
- Clear localStorage user data
- Redirect to `/auth` (sign-in page)
- Confirmation prompt before signing out: "Sign out? Your preferences are saved to your account."

---

## Technical Notes

- `POST /api/preferences` is an upsert. It's safe to send the full preferences object on every edit. This is simpler than trying to PATCH individual fields (which the API doesn't support except for favorites).
- The API doesn't have fields for the "deferred profile" data (ski days, storm driving comfort, crowd sensitivity, skill level). These stay local until the API supports them.
- Consider debouncing edits — if user changes multiple fields rapidly, batch them into a single API call.
- The profile page could use `SWR` with `mutate` for optimistic updates.

## Open Questions

- [ ] Should editing preferences trigger a full preferences POST or should we implement field-level patching?
- [ ] Should sign-out also clear localStorage, or keep it as a cache for next sign-in?
- [ ] Are deferred profile fields worth syncing to a custom metadata field in the API?
