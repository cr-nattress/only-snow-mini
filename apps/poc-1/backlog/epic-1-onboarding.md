# Epic 1: Onboarding → Live Preferences

**Goal**: When a user completes onboarding, save their preferences to the SkiData API via `POST /api/preferences` instead of only localStorage.

**Priority**: P0 (first live data connection)
**Depends on**: Epic 0 (Auth)

---

## Context

The onboarding flow currently collects 5 pieces of data and stores them in `UserContext` → localStorage:

| Onboarding Step | POC Field | API Field |
|-----------------|-----------|-----------|
| Location | `home_location: { lat, lng, display_name }` | `location_lat`, `location_lng`, `location_name` |
| Drive Radius | `max_drive_minutes: 45\|60\|120\|180\|"fly"` | `drive_radius_miles` (miles, not minutes) |
| Pass Selection | `passes: PassType[]` | `pass_type: string[]` |
| Preferences | `preferences: SkiPreference[]` | Not directly in API — maps to `favorite_resorts` + notification settings |
| Completion | `onboarding_complete: true` | Preferences row exists = onboarded |

### Conversion: Drive Minutes → Drive Miles

The POC uses drive minutes; the API uses drive radius in miles. Approximate mapping:
- 45 min → 40 miles
- 60 min → 55 miles
- 120 min → 100 miles
- 180 min → 150 miles
- "fly" → 500 miles (or omit — API default is 120)

---

## User Stories

### 1.1 — Create unit conversion utilities
**As a** developer
**I want** shared conversion functions between POC units and API units
**So that** data transforms are consistent and testable

**Acceptance Criteria**:
- Create `lib/api/transforms.ts`
- Functions: `cmToInches(cm)`, `inchesToCm(in)`, `celsiusToFahrenheit(c)`, `fahrenheitToCelsius(f)`, `kphToMph(kph)`, `mphToKph(mph)`, `driveMinutesToMiles(minutes)`, `milesToDriveMinutes(miles)`
- Each function handles `null`/`undefined` gracefully (returns `null`)
- Unit tests for each function

### 1.2 — Map POC location to API format
**As a** developer
**I want** a function that transforms onboarding location data to the API preferences format
**So that** the location step saves correctly

**Acceptance Criteria**:
- Create `lib/api/mappers.ts` with `mapOnboardingToPreferences(user: UserProfile): ApiPreferencesPayload`
- Maps `home_location.lat` → `location_lat`, `.lng` → `location_lng`, `.display_name` → `location_name`
- Maps `max_drive_minutes` → `drive_radius_miles` using the conversion table
- Maps `passes` → `pass_type` (same values: "epic", "ikon", "indy"; "none" → empty array)
- Maps notification-related preferences to `notification_*` fields (default all to true initially)

### 1.3 — Location autocomplete from real geocoding
**As a** user
**I want** to search for my real city in the location step
**So that** my home location is accurate for drive time calculations

**Acceptance Criteria**:
- Replace `mock-locations.ts` with a real geocoding call (options: Nominatim/OpenStreetMap free API, or a simple hardcoded list of ~50 ski-region cities with real lat/lng)
- Location search returns `{ lat, lng, display_name }` for each result
- Debounce search input (300ms)
- Keep mock data as fallback if geocoding fails

### 1.4 — Save preferences on onboarding completion
**As a** user
**I want** my preferences saved to the server when I finish onboarding
**So that** the dashboard can show personalized resort rankings

**Acceptance Criteria**:
- On the final onboarding step ("preferences"), after user taps "Get My Recommendations":
  1. Map `UserProfile` → API preferences payload
  2. Call `POST /api/preferences` via the API client
  3. On success: set `onboarding_complete: true` in localStorage, navigate to `/dashboard`
  4. On failure: show inline error, keep button enabled for retry
- Loading state on the CTA button during API call
- Continue saving to localStorage as a parallel write (dual-write strategy for offline support)

### 1.5 — Handle existing preferences on sign-in
**As a** returning user
**I want** my preferences loaded from the server
**So that** I don't have to redo onboarding

**Acceptance Criteria**:
- After auth sign-in, call `GET /api/preferences`
- If preferences exist (`preferences !== null`):
  - Map API preferences → `UserProfile` format
  - Store in `UserContext` + localStorage
  - Redirect to `/dashboard` (skip onboarding)
- If preferences are null (new user, no onboarding):
  - Redirect to `/onboarding/welcome`
- Error handling: network failure → fall back to localStorage state

### 1.6 — Validate location step with real coordinates
**As a** user
**I want** the location step to show my selected city on a mini-map or confirmation
**So that** I know my home location is correct

**Acceptance Criteria**:
- After selecting a location, show the city name and state prominently
- Optional: show a static map image (Google Static Maps or similar) — nice to have, not blocking
- "Change" link to re-enter location
- Store lat/lng with enough precision (6 decimal places)

---

## Technical Notes

- **Dual-write strategy**: Save to both localStorage and API. This means the app works offline with localStorage data, but syncs to the server when connected. On conflict, server wins.
- The API's `pass_type` accepts the same values as the POC (`"epic"`, `"ikon"`, `"indy"`). The POC also has `"mountain_collective"`, `"resort_specific"`, `"none"` — these need mapping decisions.
- The API doesn't have a direct equivalent for `SkiPreference` (powder, groomers, trees, etc.). These stay local for now and could influence the recommendation engine later.
- `POST /api/preferences` is an upsert — calling it multiple times is safe.

## Out of Scope

- Editing preferences after onboarding (that's Epic 7 — Profile)
- Chase mode fields (`chase_enabled`, `chase_max_budget`, `chase_regions`)
- Push notification token registration
