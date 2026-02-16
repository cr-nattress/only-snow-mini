# OnlySnow API Integration Setup

Quickstart guide for integrating the OnlySnow consumer app with the ski conditions API.

---

## 1. Base URL

```
Production:  https://onlysnow.vercel.app/api
Local dev:   http://localhost:3000/api
```

---

## 2. Authentication

The API supports two authentication methods. Use **API keys** for external app integration.

### API Key Authentication

Pass your key as a Bearer token:

```
Authorization: Bearer sk_live_a1b2c3d4e5f6...
```

Or as a header:

```
x-api-key: sk_live_a1b2c3d4e5f6...
```

### Getting an API Key

1. Sign in to the web app
2. Navigate to Settings > API Keys (or `POST /api/keys` with a session cookie)
3. Create a key with a descriptive name
4. **Copy the full key immediately** — it's only shown once

```bash
# Create a key (requires session cookie)
curl -X POST https://onlysnow.vercel.app/api/keys \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-xxx-auth-token=<jwt>" \
  -d '{"name": "OnlySnow Mobile App"}'

# Response — save the fullKey, it won't be shown again
{
  "key": {
    "id": "uuid",
    "name": "OnlySnow Mobile App",
    "key_prefix": "sk_live_a1b2",
    "fullKey": "sk_live_a1b2c3d4e5f6..."
  }
}
```

**Limits**: 10 active keys per user. Keys can be revoked via `DELETE /api/keys/[id]`.

### Cookie Authentication (Web Only)

For first-party web usage, the Supabase session cookie is used automatically. No extra setup needed if your app shares the same domain.

---

## 3. CORS Setup

If calling the API from a browser on a different origin, configure the allowed origins on the server:

```bash
# Server environment variable (comma-separated)
ALLOWED_ORIGINS=https://app.onlysnow.com,http://localhost:3001
```

The API handles CORS preflight (`OPTIONS`) requests automatically for all `/api/` routes.

**Allowed headers**: `Authorization`, `Content-Type`, `x-api-key`
**Allowed methods**: `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, `OPTIONS`
**Credentials**: Supported
**Preflight cache**: 1 hour (`Access-Control-Max-Age: 3600`)

---

## 4. Making Your First Request

### Health Check (No Auth Required)

Verify the API is reachable and services are healthy:

```bash
curl https://onlysnow.vercel.app/api/health
```

```json
{
  "status": "ok",
  "version": "1.0.0",
  "resorts": 50,
  "valid_pass_types": ["epic", "ikon", "indy", "mountain_collective", "none"],
  "services": {
    "weather": "operational",
    "database": "operational"
  },
  "timestamp": "2026-02-14T12:00:00Z"
}
```

Status `503` means a backing service is degraded — weather or database may be temporarily unavailable.

### Weather (No Auth Required)

```bash
curl "https://onlysnow.vercel.app/api/weather?resort=vail"
```

### Ranked Resorts (Auth Required)

```bash
curl "https://onlysnow.vercel.app/api/resorts/ranked?period=today" \
  -H "Authorization: Bearer sk_live_a1b2c3d4..."
```

---

## 5. Endpoints Reference

### Public Endpoints (No Auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Service health + resort count + valid pass types |
| `GET` | `/api/weather?resort=<slug>` | Current conditions + 7-day forecast |

### Authenticated Endpoints

All require `Authorization: Bearer <key>` or session cookie.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/resorts/ranked` | User's resorts ranked by snowfall |
| `GET` | `/api/resorts/[slug]` | Single resort detail + Go/No-Go |
| `GET` | `/api/preferences` | User preferences |
| `POST` | `/api/preferences` | Create/update preferences (full upsert) |
| `PATCH` | `/api/preferences` | Add/remove a favorite resort |
| `GET` | `/api/storms` | Active storm systems by region |
| `GET` | `/api/worth-knowing` | Resorts worth checking outside user's normal list |
| `GET` | `/api/notifications` | Notification history |

### Query Parameters

| Endpoint | Param | Values | Default |
|----------|-------|--------|---------|
| `/api/resorts/ranked` | `period` | `today`, `weekend`, `5d`, `10d` | `today` |
| `/api/resorts/[slug]` | `units` | `metric`, `imperial` | `metric` |
| `/api/weather` | `resort` | Any resort slug (required) | — |
| `/api/weather` | `units` | `metric`, `imperial` | `metric` |

---

## 6. Response Format

### _meta Block

All consumer responses include a `_meta` block:

```json
{
  "_meta": {
    "units": "metric",
    "fetchedAt": "2026-02-14T12:00:00.000Z",
    "weatherSource": "open-meteo"
  },
  ...
}
```

Use `_meta.fetchedAt` to show data freshness. Additional fields like `resortCount` appear on endpoints that aggregate data.

### Default Units (Metric)

| Measurement | Unit |
|-------------|------|
| Temperature | Celsius |
| Wind speed | km/h |
| Snowfall | cm |
| Visibility | meters |
| Freezing level | meters |
| Elevation | feet |
| Base depth | inches (estimated) |
| Distance | miles |

### Imperial Units

Add `?units=imperial` to `/api/weather` and `/api/resorts/[slug]`:

```bash
curl "https://onlysnow.vercel.app/api/weather?resort=vail&units=imperial"
```

Imperial converts: temperature to °F, wind to mph, snowfall to inches, visibility to miles, freezing level to feet.

### Convenience Fields (Always Present)

The ranked endpoint always includes both metric and imperial snowfall:

```json
{
  "snowfall_24h": 12.5,           // cm (metric)
  "snowfall_24h_inches": 4.9,     // inches (convenience)
  "forecast_total": 45.2,         // cm (metric)
  "forecast_total_inches": 17.8   // inches (convenience)
}
```

---

## 7. Setting Up User Preferences

Before the ranked/storms/worth-knowing endpoints work, the user needs preferences:

```bash
curl -X POST https://onlysnow.vercel.app/api/preferences \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "location_lat": 39.7392,
    "location_lng": -104.9903,
    "location_name": "Denver, CO",
    "pass_type": ["epic", "ikon"],
    "drive_radius_miles": 120,
    "favorite_resorts": ["vail", "copper-mountain"],
    "notification_powder": true,
    "notification_storm": true,
    "notification_weekend": true
  }'
```

### Input Normalization

The API normalizes input to help with common client-side issues:

**Drive time alternative**: Send `drive_minutes` instead of `drive_radius_miles`. The API converts it:

```json
{ "drive_minutes": 90 }
// Converts to drive_radius_miles: 80
```

**Pass type aliases**: `resort_specific` is normalized to `none`.

**Valid pass types**: `epic`, `ikon`, `indy`, `mountain_collective`, `none`
(Check `/api/health` for the current list.)

### Incremental Favorites Update

Add or remove a single resort without resending the full preferences:

```bash
# Add to favorites
curl -X PATCH https://onlysnow.vercel.app/api/preferences \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"addFavoriteResort": "jackson-hole"}'

# Remove from favorites
curl -X PATCH https://onlysnow.vercel.app/api/preferences \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"removeFavoriteResort": "jackson-hole"}'
```

---

## 8. Error Handling

All errors use a consistent format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Valid API key or session required",
    "status": 401
  }
}
```

### Error Codes

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | `BAD_REQUEST` | Missing/invalid parameters |
| 400 | `VALIDATION_ERROR` | Field-level validation failures (has `fields` object) |
| 401 | `UNAUTHORIZED` | Missing or invalid API key/session |
| 404 | `NOT_FOUND` | Resort slug unknown or preferences not set up |
| 429 | `RATE_LIMITED` | Too many requests (check `Retry-After` header) |
| 500 | `SERVER_ERROR` | Internal error (report if persistent) |
| 503 | `SERVICE_UNAVAILABLE` | Weather or database temporarily down |

### Validation Errors

`POST /api/preferences` returns field-level errors:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "status": 400,
    "fields": {
      "location_lat": "Must be between -90 and 90",
      "pass_type": "Unknown pass type(s): mega_pass. Valid types: epic, ikon, indy, mountain_collective, none"
    }
  }
}
```

### Recommended Error Handling

```typescript
async function apiCall(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    // Wait and retry after retryAfter seconds
  }

  if (!res.ok) {
    const { error } = await res.json();
    throw new ApiError(error.code, error.message, error.status);
  }

  return res.json();
}
```

---

## 9. Rate Limiting

Rate limits apply per API key (cookie auth is not rate limited).

| Plan | Requests/min | Monthly Limit |
|------|-------------|---------------|
| Free | 10 | 1,000 |
| Developer | 60 | 50,000 |
| Startup | 300 | 500,000 |
| Enterprise | 1,000 | Unlimited |

### Rate Limit Headers

Every authenticated response includes:

```
X-RateLimit-Limit: 60          # Max per minute
X-RateLimit-Remaining: 54      # Remaining in window
X-RateLimit-Reset: 1739523600  # Unix timestamp when window resets
```

When rate limited (429), the response also includes:

```
Retry-After: 45                # Seconds until you can retry
```

**Implementation detail**: Sliding 1-minute window. Denied requests (429s) don't count against your limit.

---

## 10. Typical Integration Flow

### Mobile App Startup

```
1. GET /api/health                    → Verify API is up
2. GET /api/preferences               → Check if onboarding complete
   ├─ preferences: null               → Show onboarding flow
   │   └─ POST /api/preferences       → Save user preferences
   └─ preferences: {...}              → Continue to main screen
3. GET /api/resorts/ranked?period=today → Load main resort table
4. GET /api/storms                    → Check for active storms
5. GET /api/worth-knowing             → Check for discovery resorts
```

### Resort Detail View

```
1. GET /api/resorts/[slug]?units=imperial  → Resort + weather + Go/No-Go
```

### Pull-to-Refresh

```
1. GET /api/resorts/ranked?period=<current> → Refresh resort table
```

### Background Notification Check

```
1. GET /api/notifications → Check for new alerts
```

---

## 11. Data Freshness

| Data | Source | Cache | Refresh Strategy |
|------|--------|-------|------------------|
| Weather | Open-Meteo | 15 min (CDN) | Automatic on next request |
| Resort metadata | Static | Permanent | Updated with deploys |
| Preferences | Supabase | None | Real-time |
| Storms | Computed from weather | None (per-request) | Computed fresh each call |
| Go/No-Go | Computed from weather | None | Computed fresh each call |
| Estimations | Algorithmic | None | Based on date + weather |

Use `_meta.fetchedAt` to show the user when data was last refreshed.

### What's Estimated vs Live

| Field | Source |
|-------|--------|
| Weather (temp, wind, snow forecast) | **Live** — Open-Meteo API |
| Snowfall amounts | **Live** — forecast from Open-Meteo |
| Base depth | **Estimated** — seasonal curve + elevation + climate |
| Terrain open % | **Estimated** — based on date in season |
| Drive time | **Estimated** — distance + speed + elevation penalty |
| Walk-up pricing | **Static** — updated manually per season |

---

## 12. Resort Slugs

50 resorts are available. Use `/api/health` to get the current count, or see the full list below.

### Colorado
`vail`, `beaver-creek`, `breckenridge`, `keystone`, `copper-mountain`, `winter-park`, `loveland`, `arapahoe-basin`, `eldora`, `aspen-snowmass`, `aspen-highlands`, `buttermilk`, `crested-butte`, `monarch`, `wolf-creek`, `steamboat`, `telluride`

### Utah
`park-city`, `deer-valley`, `alta`, `snowbird`, `brighton`, `solitude`, `snowbasin`, `powder-mountain`

### Wyoming & Montana
`jackson-hole`, `grand-targhee`, `big-sky`

### Idaho
`sun-valley`

### California
`mammoth-mountain`, `palisades-tahoe`, `northstar`, `kirkwood`, `heavenly`

### Pacific Northwest
`crystal-mountain`, `mt-bachelor`, `stevens-pass`

### New England
`stowe`, `killington`, `okemo`, `mount-snow`, `sugarbush`, `stratton`, `loon-mountain`, `sunday-river`, `sugarloaf`

### New Mexico
`taos-ski-valley`

### British Columbia & Alberta
`whistler-blackcomb`, `revelstoke`, `sunshine-village`, `lake-louise`

---

## 13. Environment Variables

Required on the API server (not in the client app):

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# CORS (add your app's origin)
ALLOWED_ORIGINS=https://app.onlysnow.com,http://localhost:3001

# Optional
SENTRY_DSN=https://xxx@sentry.io/xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxx
```

The client app only needs:
- The API base URL
- An API key (obtained through the key management flow)

---

## 14. TypeScript Types

Key types for client-side use:

```typescript
// API Error
interface ApiError {
  error: {
    code: string;
    message: string;
    status: number;
    fields?: Record<string, string>; // VALIDATION_ERROR only
  };
}

// Response metadata (all endpoints)
interface ResponseMeta {
  units: "metric" | "imperial";
  fetchedAt: string;
  weatherSource: "open-meteo";
  resortCount?: number;
}

// Ranked resort
interface RankedResort {
  slug: string;
  name: string;
  ticker: string;
  region: string;
  state: string;
  passes: string[];
  elevation: { base: number; summit: number; vertical: number };
  terrain: {
    acres: number;
    trails: number;
    lifts: number;
    breakdown: { beginner: number; intermediate: number; advanced: number; expert?: number };
  };
  avgSnowfall: number;
  snowfall_24h: number;
  snowfall_24h_inches: number;
  forecast_total: number;
  forecast_total_inches: number;
  base_depth: number;
  terrain_open_pct: number;
  drive_time_minutes: number;
  distance_miles: number;
  conditions: string;
}

// Go/No-Go
interface GoNoGoAssessment {
  overall: "go" | "no-go" | "conditional";
  factors: {
    label: "Wind" | "Visibility" | "Temperature" | "Alerts";
    status: "go" | "no-go" | "conditional";
    detail: string;
  }[];
  summary: string;
}

// Worth Knowing
interface WorthKnowingResort {
  slug: string;
  name: string;
  ticker: string;
  forecastInches: number;
  userBestInches: number;
  differentialInches: number;
  isOnPass: boolean;
  distanceMiles: number;
  passes: string[];
  walkUpPricing: { adult: number | null; dynamicPricing: boolean } | null;
}

// Storm
interface Storm {
  id: string;
  name: string;
  severity: "moderate" | "significant" | "major";
  region: string;
  affectedResorts: {
    slug: string;
    name: string;
    ticker: string;
    forecastCm: number;
    forecastInches: number;
  }[];
  peakDay: string;
  totalSnowfallCm: number;
  totalSnowfallInches: number;
}

// Valid pass types (check /api/health for current list)
type PassType = "epic" | "ikon" | "indy" | "mountain_collective" | "none";
```
