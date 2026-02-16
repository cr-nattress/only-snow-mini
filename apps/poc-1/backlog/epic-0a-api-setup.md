# Epic 0a: API Setup & Verification

**Goal**: Set up the API client infrastructure, obtain an API key, verify every SkiData endpoint works, and establish the patterns all later epics build on.

**Priority**: P0 (do this first — before any screen touches live data)
**Depends on**: Nothing
**Ref**: `docs/API_INTEGRATION_1.md`

---

## Context

Before wiring any screen to the API, we need to:
1. Confirm the API is reachable and healthy
2. Obtain and securely store an API key
3. Build a typed fetch client with error handling and rate-limit awareness
4. Verify every endpoint we plan to use actually returns the expected shape
5. Map the 12 POC mock resorts to valid API slugs
6. Confirm imperial unit support eliminates client-side conversions

The API supports two auth methods. **API key auth** (`Authorization: Bearer sk_live_...`) is simpler for the POC than Supabase cookie auth — no sign-up flow required to start testing.

**API Base URL**: `https://ski-ai-mu.vercel.app/api` (discovered — the documented `onlysnow.vercel.app` returns DEPLOYMENT_NOT_FOUND)

---

## User Stories

### 0a.1 — Health check: verify API is reachable
**As a** developer
**I want** to call the health endpoint and confirm the API is up
**So that** I know the API is reachable before building against it

**Acceptance Criteria**:
- `GET /api/health` returns `200` with:
  ```json
  {
    "status": "ok",
    "version": "...",
    "resorts": 50,
    "valid_pass_types": ["epic", "ikon", "indy", "mountain_collective", "none"],
    "services": { "weather": "operational", "database": "operational" }
  }
  ```
- Document the actual response in this file (update after testing)
- If `503`, note which service is degraded
- Test from both local dev and deployed POC origin (CORS)

**How to test**:
```bash
curl https://onlysnow.vercel.app/api/health
```

---

### 0a.2 — Obtain and store an API key
**As a** developer
**I want** an API key for the SkiData API
**So that** I can call authenticated endpoints

**Acceptance Criteria**:
- Obtain an API key through one of:
  - The web app UI (Settings > API Keys)
  - `POST /api/keys` with a Supabase session cookie
- Store the key in `.env.local` as `NEXT_PUBLIC_SKIDATA_API_KEY`
- Add `.env.local.example` with:
  ```
  NEXT_PUBLIC_SKIDATA_API_URL=https://onlysnow.vercel.app/api
  NEXT_PUBLIC_SKIDATA_API_KEY=sk_live_your_key_here
  ```
- Confirm `.env.local` is in `.gitignore`
- Verify the key works: `curl -H "Authorization: Bearer sk_live_..." https://onlysnow.vercel.app/api/preferences`

---

### 0a.3 — Build typed API client
**As a** developer
**I want** a reusable, typed fetch wrapper
**So that** every endpoint call has consistent auth, error handling, and types

**Acceptance Criteria**:
- Create `src/lib/api/client.ts`:
  ```typescript
  const API_BASE = process.env.NEXT_PUBLIC_SKIDATA_API_URL;
  const API_KEY = process.env.NEXT_PUBLIC_SKIDATA_API_KEY;

  interface ApiMeta {
    units: "metric" | "imperial";
    fetchedAt: string;
    weatherSource: string;
    resortCount?: number;
  }

  interface ApiErrorBody {
    error: {
      code: string;
      message: string;
      status: number;
      fields?: Record<string, string>;
    };
  }

  class ApiError extends Error {
    code: string;
    status: number;
    fields?: Record<string, string>;
    retryAfter?: number;
  }

  async function apiGet<T>(path: string): Promise<T>
  async function apiPost<T>(path: string, body: unknown): Promise<T>
  async function apiPatch<T>(path: string, body: unknown): Promise<T>
  ```
- Auth: attach `Authorization: Bearer ${API_KEY}` header on every request
- Error handling:
  - `401` → throw `ApiError` with code `UNAUTHORIZED`
  - `404` → throw `ApiError` with code `NOT_FOUND`
  - `429` → parse `Retry-After` header, attach to error as `retryAfter`
  - `400` → parse `fields` for validation errors
  - `503` → throw with code `SERVICE_UNAVAILABLE`
- Rate limit headers: parse `X-RateLimit-Remaining` from responses, log warnings when <10 remaining
- Public endpoint helper: `apiGetPublic<T>(path)` — no auth header (for `/api/weather`, `/api/health`)

---

### 0a.4 — Add API response types
**As a** developer
**I want** TypeScript types matching every API response
**So that** the client is fully typed end-to-end

**Acceptance Criteria**:
- Create `src/types/api.ts` with types from `docs/API_INTEGRATION_1.md` Section 14:
  - `ApiMeta`
  - `ApiError`
  - `RankedResort`
  - `GoNoGoAssessment`
  - `WorthKnowingResort`
  - `Storm`
  - `WeatherSnapshot` (current + forecast + alerts)
  - `DailyForecast`
  - `WeatherAlert`
  - `UserPreferences` (API shape)
  - `Notification`
  - `HealthResponse`
- Types should match actual API responses exactly — verify after testing each endpoint

---

### 0a.5 — Verify public weather endpoint
**As a** developer
**I want** to confirm `/api/weather` works with imperial units
**So that** I can use it without client-side conversion

**Acceptance Criteria**:
- Test: `GET /api/weather?resort=vail&units=imperial`
- Confirm response includes:
  - `current.temperature` in °F
  - `current.wind.speed` in mph
  - `forecast[].snowfall` in inches
  - `forecast[].high` / `forecast[].low` in °F
  - `_meta.units: "imperial"`
- Test with a known slug from each region the POC uses
- Test with an invalid slug → confirm `400` error response
- Document: are weather alerts included? What format?
- **No auth required** — this endpoint works without an API key

**Test commands**:
```bash
# Imperial units
curl "https://onlysnow.vercel.app/api/weather?resort=vail&units=imperial"

# Metric (default)
curl "https://onlysnow.vercel.app/api/weather?resort=vail"

# Invalid slug
curl "https://onlysnow.vercel.app/api/weather?resort=fake-resort"
```

---

### 0a.6 — Verify preferences endpoints
**As a** developer
**I want** to confirm preferences CRUD works
**So that** onboarding can save to the API

**Acceptance Criteria**:
- Test `GET /api/preferences` → should return current prefs or `null`
- Test `POST /api/preferences` with a full payload:
  ```json
  {
    "location_lat": 39.7392,
    "location_lng": -104.9903,
    "location_name": "Denver, CO",
    "pass_type": ["ikon"],
    "drive_minutes": 120,
    "favorite_resorts": ["copper-mountain"],
    "notification_powder": true,
    "notification_storm": true,
    "notification_weekend": true
  }
  ```
- Confirm: `drive_minutes` is accepted (API normalizes to `drive_radius_miles`)
- Confirm: `pass_type: ["resort_specific"]` normalizes to `["none"]`
- Test validation: send `location_lat: 999` → expect `VALIDATION_ERROR` with `fields.location_lat`
- Test `PATCH /api/preferences` with `addFavoriteResort` and `removeFavoriteResort`
- Confirm `GET /api/preferences` reflects changes after POST/PATCH

**Test commands**:
```bash
# Read
curl -H "Authorization: Bearer sk_live_..." \
  https://onlysnow.vercel.app/api/preferences

# Write (upsert)
curl -X POST -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  https://onlysnow.vercel.app/api/preferences \
  -d '{"location_lat":39.7392,"location_lng":-104.9903,"location_name":"Denver, CO","pass_type":["ikon"],"drive_minutes":120}'

# Add favorite
curl -X PATCH -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  https://onlysnow.vercel.app/api/preferences \
  -d '{"addFavoriteResort":"vail"}'
```

---

### 0a.7 — Verify ranked resorts endpoint
**As a** developer
**I want** to confirm `/api/resorts/ranked` returns expected data
**So that** the dashboard and resort list can use it

**Acceptance Criteria**:
- Test with each period: `today`, `weekend`, `5d`, `10d`
- Confirm response includes convenience fields: `snowfall_24h_inches`, `forecast_total_inches`
- Confirm resorts are filtered by the preferences set in 0a.6 (Ikon pass, 120-min drive)
- Confirm `drive_time_minutes` and `distance_miles` are present
- Confirm `conditions` string is present
- Note: `base_depth` and `terrain_open_pct` are estimates — document their ranges
- Count how many resorts are returned per period

**Test commands**:
```bash
curl -H "Authorization: Bearer sk_live_..." \
  "https://onlysnow.vercel.app/api/resorts/ranked?period=today"

curl -H "Authorization: Bearer sk_live_..." \
  "https://onlysnow.vercel.app/api/resorts/ranked?period=5d"
```

---

### 0a.8 — Verify storms endpoint
**As a** developer
**I want** to confirm `/api/storms` returns active storms
**So that** the dashboard and storm detail can use them

**Acceptance Criteria**:
- Test `GET /api/storms`
- Confirm response shape matches `Storm` type:
  - `id` (region slug), `name`, `severity`, `region`, `peakDay`
  - `affectedResorts[]` with `slug`, `name`, `ticker`, `forecastCm`, `forecastInches`
  - `totalSnowfallCm`, `totalSnowfallInches`
- Note: if no storms are active, response may be empty → test empty-state handling
- Confirm storms include `forecastInches` convenience field
- Document the storm IDs format (are they stable? based on region slug?)

**Test command**:
```bash
curl -H "Authorization: Bearer sk_live_..." \
  https://onlysnow.vercel.app/api/storms
```

---

### 0a.9 — Verify resort detail + go/no-go
**As a** developer
**I want** to confirm `/api/resorts/[slug]` returns weather and go/no-go
**So that** storm detail can show verdicts per resort

**Acceptance Criteria**:
- Test `GET /api/resorts/vail?units=imperial`
- Confirm response includes:
  - `resort` — full profile (slug, terrain, passes, features, avgSnowfall)
  - `weather` — same shape as `/api/weather` response
  - `goNoGo` — `overall`, `factors[]`, `summary`
  - `driveTimeMinutes`
- Map `goNoGo.overall`:
  - `"go"` → POC `"go"` verdict
  - `"conditional"` → POC `"maybe"` verdict
  - `"no-go"` → POC `"skip"` verdict
- Test with 2-3 slugs from different regions
- Test with invalid slug → confirm `404`

**Test commands**:
```bash
curl -H "Authorization: Bearer sk_live_..." \
  "https://onlysnow.vercel.app/api/resorts/vail?units=imperial"

curl -H "Authorization: Bearer sk_live_..." \
  "https://onlysnow.vercel.app/api/resorts/copper-mountain?units=imperial"

curl -H "Authorization: Bearer sk_live_..." \
  "https://onlysnow.vercel.app/api/resorts/fake-resort"
```

---

### 0a.10 — Verify worth-knowing endpoint
**As a** developer
**I want** to confirm `/api/worth-knowing` returns teaser resorts
**So that** the dashboard "Getting snow elsewhere" section works

**Acceptance Criteria**:
- Test `GET /api/worth-knowing`
- Confirm response shape: `worthKnowing[]` with `slug`, `name`, `forecastInches`, `userBestInches`, `differentialInches`, `isOnPass`, `distanceMiles`, `passes`
- Note: returns max 2 resorts (may be empty if no standout conditions)
- Document: does the response include `walkUpPricing`?

**Test command**:
```bash
curl -H "Authorization: Bearer sk_live_..." \
  https://onlysnow.vercel.app/api/worth-knowing
```

---

### 0a.11 — Verify notifications endpoint
**As a** developer
**I want** to confirm `/api/notifications` returns history
**So that** the alerts page can use it

**Acceptance Criteria**:
- Test `GET /api/notifications`
- Confirm response shape: `notifications[]` with `id`, `type`, `resort_slug`, `title`, `body`, `sent_at`, `opened_at`, `acted_on`
- Note: may be empty for a new user — document empty-state response
- Document: is there pagination? A limit param?

**Test command**:
```bash
curl -H "Authorization: Bearer sk_live_..." \
  https://onlysnow.vercel.app/api/notifications
```

---

### 0a.12 — Map POC resort IDs to API slugs
**As a** developer
**I want** a verified mapping of POC mock resort IDs to API slugs
**So that** every resort lookup hits a valid slug

**Acceptance Criteria**:
- Read `src/data/mock-resorts.ts` and list all POC resort IDs
- Cross-reference with the 50 slugs in `docs/API_INTEGRATION_1.md` Section 12
- Create `src/lib/api/resort-slugs.ts`:
  ```typescript
  export const POC_TO_SLUG: Record<string, string> = {
    "vail": "vail",
    "copper": "copper-mountain",
    // ... all 12
  };
  export const SLUG_TO_POC: Record<string, string> = { /* reverse */ };
  ```
- Test each mapped slug with `GET /api/weather?resort=<slug>` to confirm it's valid
- Document any POC resorts that don't exist in the API (need mock fallback)

---

### 0a.13 — Verify CORS from POC origin
**As a** developer
**I want** to confirm the API accepts requests from the POC's deployed origin
**So that** client-side fetch calls work in production

**Acceptance Criteria**:
- From the deployed POC (`poc-1-xi.vercel.app`), make a fetch call to `https://onlysnow.vercel.app/api/health`
- Confirm no CORS errors in browser console
- If CORS blocked: document the error and note that the API server needs `poc-1-xi.vercel.app` added to `ALLOWED_ORIGINS`
- Also test from `localhost:3001` (POC dev server, if on a different port)
- Document findings

---

### 0a.14 — Create API integration test script
**As a** developer
**I want** a script that tests all endpoints in sequence
**So that** I can verify the full integration in one command

**Acceptance Criteria**:
- Create `scripts/test-api.mjs` (Node.js script, no dependencies beyond fetch):
  ```
  1. GET /api/health              → assert status ok
  2. GET /api/weather?resort=vail&units=imperial → assert current.temperature exists
  3. POST /api/preferences        → assert preferences returned
  4. GET /api/preferences         → assert matches what was posted
  5. GET /api/resorts/ranked?period=today → assert resorts array
  6. GET /api/storms              → assert storms array (may be empty)
  7. GET /api/resorts/vail?units=imperial → assert goNoGo exists
  8. GET /api/worth-knowing       → assert worthKnowing array
  9. GET /api/notifications       → assert notifications array
  10. PATCH /api/preferences       → assert addFavoriteResort works
  ```
- Print pass/fail for each endpoint with response time
- Print rate limit remaining after each call
- Exit with non-zero code if any assertion fails
- Run via: `node scripts/test-api.mjs`
- Requires `SKIDATA_API_KEY` env var (reads from `.env.local` or env)

---

### 0a.15 — Document findings and update backlog
**As a** developer
**I want** a summary of what worked, what didn't, and any surprises
**So that** later epics can reference concrete API behavior

**Acceptance Criteria**:
- After testing all endpoints, update this epic with an "Findings" section at the bottom:
  - Actual response shapes vs. documented shapes (any mismatches?)
  - Imperial units: confirmed working on which endpoints?
  - Rate limiting: observed limits, header values
  - CORS: working from which origins?
  - Latency: typical response times per endpoint
  - Empty states: what do storms/notifications/worth-knowing return when empty?
  - Any endpoints that are broken or behave unexpectedly
- Update `SKIDATA_DEPENDENCIES.md` with any corrections
- Update later epics if response shapes differ from assumptions

---

## Technical Notes

- **API key vs. cookie auth**: The API supports both. API key auth (`Authorization: Bearer sk_live_...`) is simpler for testing and doesn't require a sign-up flow. Use API keys for this epic. Cookie auth can come later if we add Supabase user accounts (Epic 0).
- **Imperial units**: The API supports `?units=imperial` on `/api/weather` and `/api/resorts/[slug]`. The ranked endpoint always includes `_inches` convenience fields. This may eliminate the need for a `transforms.ts` conversion layer — verify during testing.
- **Rate limits**: API key on Free tier gets 10 req/min, Developer gets 60 req/min. The test script makes ~10 calls, so should be fine on any tier. Monitor `X-RateLimit-Remaining` headers.
- **Error format**: All errors use `{ error: { code, message, status, fields? } }`. Build the client to parse this consistently.
- **`_meta` block**: Every response includes `_meta.fetchedAt`. Use this for "last updated" display in the UI.

## Findings (2026-02-14)

### URL Discovery

The documented URL `onlysnow.vercel.app` returns `DEPLOYMENT_NOT_FOUND`. Through Vercel MCP tools, discovered:
- `ski-6913vrz13-chris-nattress-projects.vercel.app` — blocked by Vercel team SSO
- `api.onlysnow.app` — accessible but returns 404 on all API routes (no API deployed)
- **`ski-ai-mu.vercel.app`** — working. This is the correct base URL.

### Endpoint Results

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/health` | **PASS** | Returns `status: "ok"`, 50 resorts, services operational |
| `GET /api/weather` | **PASS** | Imperial units work. 7-day forecast, current conditions, alerts array. Invalid slug → 404. Missing param → 400. |
| `GET /api/resorts/[slug]` | **PASS** | Full resort profile + weather + goNoGo. Imperial units work. `driveTimeMinutes: null` (no prefs). |
| `GET /api/storms` | **PASS** | Returns active storms. Tested: 2 storms (California Tahoe significant, California Sierra moderate). |
| `GET /api/notifications` | **PASS** | Returns notification array (empty for this user). |
| `POST /api/preferences` | **PASS** | Upsert works. `drive_minutes: 120` auto-converts to `drive_radius_miles: 100`. Returns full prefs with id, user_id, timestamps. |
| `GET /api/preferences` | **PASS** | Returns `{ preferences: null }` before onboarding, full object after. |
| `GET /api/resorts/ranked` | **PASS** | 8 resorts returned for Denver/Ikon+Epic/120min. Includes convenience fields. Sorted by forecast. |
| `GET /api/worth-knowing` | **PASS** | Returns empty `worthKnowing[]` when no standout conditions (expected). |
| `PATCH /api/preferences` | **PASS** | `addFavoriteResort` / `removeFavoriteResort` both work. Returns updated prefs. |
| CORS | **Untested** | Need to test from deployed POC origin |
| Imperial units | **PASS** | Confirmed on weather + resort detail: temps in °F, wind in mph, snowfall in inches |
| Rate limits | **CONFIRMED** | Free tier: 10 req/min. Hit 429 during testing. `Retry-After` header present. |

### API Key — Resolved

API key `sk_live_63ffe5a8...` now works. Initial 401s were caused by the key being temporarily revoked/recreated (DELETE + POST observed in runtime logs at 08:53:56).

### Preferences Server Error — Resolved

Preferences initially returned 500 (Supabase DB issue). Fixed server-side in ski-ai repo. All preferences operations now work (GET, POST, PATCH).

### Weather Response Shape (Confirmed)

Tested across regions (Colorado: vail, copper-mountain; Utah: park-city; New England: stowe):
- `_meta.units` correctly reflects `"imperial"` or `"metric"`
- `_meta.fetchedAt` present with ISO timestamp
- `current`: temperature, feelsLike, conditions, humidity, wind (speed/gusts/direction), visibility, freezingLevel
- `forecast[]`: 7 days with date, conditions, high, low, snowfall, precipChance, wind (speed/gusts)
- `alerts[]`: present (empty array when no alerts active)

### Slug Mapping

Created `lib/api/resort-slugs.ts` mapping 48 POC resort IDs to 50 API slugs. Key differences:
- `copper` → `copper-mountain`
- `palisades` → `palisades-tahoe`
- `mammoth` → `mammoth-mountain`
- `loon` → `loon-mountain`
- `whistler` → `whistler-blackcomb`
- `taos` → `taos-ski-valley`

15 POC resorts have no API equivalent: aspen-mountain, purgatory, brian-head, sugar-bowl, big-bear, mt-baker, mt-hood-meadows, whitefish, schweitzer, bridger-bowl, jay-peak, whiteface, kicking-horse, ski-santa-fe, arizona-snowbowl. These will use mock data fallback.

### Files Created

| File | Purpose |
|------|---------|
| `src/types/api.ts` | TypeScript types for all API response shapes |
| `src/lib/api/client.ts` | Typed fetch client with error handling, auth headers |
| `src/lib/api/transforms.ts` | Unit conversions, pass/region/verdict mapping |
| `src/lib/api/resort-slugs.ts` | POC ID ↔ API slug mapping |
| `scripts/test-api.sh` | Bash test script for all endpoints |

### Resort Detail Response Shape (Confirmed)

Tested `GET /api/resorts/vail?units=imperial`:
- `resort`: slug, name, ticker, state, region (`"colorado-i70"`), coordinates, elevation, terrain, passes, features, avgSnowfall, walkUpPricing
- `weather.current`: temperature (°F), feelsLike, conditions, humidity, wind, visibility, freezingLevel
- `weather.forecast[]`: 7-day with imperial units
- `weather.alerts[]`: present (empty when no alerts)
- `goNoGo.overall`: `"go"` | `"conditional"` | `"no-go"` — with factors array (Wind, Visibility, Temperature) and summary
- `driveTimeMinutes`: `null` when no prefs set (expected)
- Note: weather detail is nested under `weather.current` / `weather.forecast`, not flat like `/api/weather`

### Storms Response Shape (Confirmed)

Tested `GET /api/storms`:
- `storms[]`: id (region slug e.g. `"california-tahoe"`), name, severity, region, peakDay, totalSnowfallCm/Inches
- `affectedResorts[]`: slug, name, ticker, forecastCm, forecastInches
- Convenience fields (forecastInches, totalSnowfallInches) confirmed present

### Next Steps

1. **Test CORS** from deployed POC origin
2. **Wire live endpoints** to POC screens — all endpoints verified and ready
