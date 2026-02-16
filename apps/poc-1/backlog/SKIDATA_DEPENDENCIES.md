# SkiData API Dependencies — Priority Order

Everything the POC needs from the SkiData platform to go fully live, ordered by implementation priority.

**API Base**: `https://ski-6913vrz13-chris-nattress-projects.vercel.app`

---

## Priority 0 — Prerequisite

### Supabase Auth
| Detail | Value |
|--------|-------|
| **Type** | Authentication |
| **Auth method** | HTTP-only cookie: `sb-<project-ref>-auth-token=<jwt>` |
| **Managed by** | `@supabase/ssr` + `@supabase/supabase-js` |
| **POC needs** | Supabase project URL, anon key |
| **Blocks** | Every consumer endpoint below (except Weather) |

All consumer API routes return `401 Unauthorized` without a valid Supabase session cookie. Users without a preferences row get `404` from ranked/storm/worth-knowing endpoints.

---

## Priority 1 — Onboarding & Core Data

### `POST /api/preferences`
| Detail | Value |
|--------|-------|
| **Type** | Consumer API |
| **Auth** | Supabase cookie (required) |
| **POC screens** | Onboarding completion, Profile edits |
| **Purpose** | Save user preferences (location, pass, drive radius, notifications) |
| **Method** | Upsert — creates or fully replaces preferences |

**Request body** (required fields marked `*`):
```
location_lat*    number       39.7392
location_lng*    number       -104.9903
location_name    string       "Denver, CO"
pass_type        string[]     ["epic", "ikon"]
drive_radius_miles  number    120
favorite_resorts string[]     ["vail", "copper-mountain"]
notification_powder  boolean  true
notification_storm   boolean  true
notification_weekend boolean  true
notification_chase   boolean  true
notification_price   boolean  true
notification_quiet_start string  "22:00"
notification_quiet_end   string  "07:00"
chase_enabled    boolean      false
chase_max_budget number       500
chase_regions    string[]     ["utah-cottonwoods"]
```

**Unit conversions needed**:
- POC `max_drive_minutes` (45/60/120/180) → API `drive_radius_miles` (40/55/100/150)
- POC `passes: PassType[]` → API `pass_type: string[]` (same values minus "mountain_collective", "resort_specific", "none")

---

### `GET /api/preferences`
| Detail | Value |
|--------|-------|
| **Type** | Consumer API |
| **Auth** | Supabase cookie (required) |
| **POC screens** | App load (returning user check), Profile page |
| **Purpose** | Read saved preferences to hydrate user context |

Returns `{ "preferences": null }` if onboarding is incomplete → redirect to onboarding.
Returns `{ "preferences": { ... } }` if complete → redirect to dashboard.

---

### `GET /api/weather?resort=<slug>`
| Detail | Value |
|--------|-------|
| **Type** | **Public API — no auth required** |
| **Auth** | None |
| **Cache** | `s-maxage=900, stale-while-revalidate=1800` (15-min fresh) |
| **POC screens** | Resort list, Resort detail, Storm detail (supplemental) |
| **Purpose** | Current conditions + 7-day forecast for any resort |

**Response shape**:
```
current.temperature     °C        → convert to °F
current.feelsLike       °C        → convert to °F
current.conditions      string    "Light snow", "Clear", etc.
current.wind.speed      km/h      → convert to mph
current.wind.gusts      km/h      → convert to mph
current.wind.direction  string    "NW", "N", etc.
current.humidity        0-100
current.visibility      meters
current.freezingLevel   meters

forecast[].date         YYYY-MM-DD
forecast[].high         °C        → convert to °F
forecast[].low          °C        → convert to °F
forecast[].snowfall     cm        → convert to inches (÷ 2.54)
forecast[].precipChance 0-100
forecast[].wind.speed   km/h      → convert to mph
forecast[].conditions   string

alerts[].severity       "moderate" | "severe" | "extreme"
alerts[].title          string
alerts[].description    string
alerts[].expires        ISO 8601
```

This is the **only endpoint that works without auth**. Best starting point for testing live data.

---

## Priority 2 — Dashboard

### `GET /api/resorts/ranked?period=today|weekend|5d|10d`
| Detail | Value |
|--------|-------|
| **Type** | Consumer API |
| **Auth** | Supabase cookie (required) |
| **POC screens** | Dashboard (hero + upcoming list), Resort list |
| **Purpose** | User's resorts ranked by snowfall, filtered by pass + drive radius |

**Response per resort**:
```
slug               string       "copper-mountain"
name               string       "Copper Mountain"
ticker             string       "COPR"
region             string       "colorado-i70"     → map to POC broad region
state              string       "CO"
passes             string[]     ["ikon"]           → map to single PassType
elevation.base     feet         as-is
elevation.summit   feet         as-is
terrain.acres      number       as-is
snowfall_24h       cm           → convert to inches
forecast_total     cm           → convert to inches
base_depth         inches       as-is
terrain_open_pct   0-100        as-is
drive_time_minutes number       → maps to drive_minutes
distance_miles     number
conditions         string       "Light snow"
```

**Sorting**: Primary by `forecast_total` desc, secondary by `snowfall_24h` desc.
**Filtering**: Server-side by user's `pass_type` and `drive_radius_miles`.

---

### `GET /api/storms`
| Detail | Value |
|--------|-------|
| **Type** | Consumer API |
| **Auth** | Supabase cookie (required) |
| **POC screens** | Dashboard (storm context on hero card), Storm detail page |
| **Purpose** | Active storm systems across all regions |

**Response per storm**:
```
id                 string       "colorado-i-70" (region slug)
name               string       "Major storm hitting Colorado I-70"
severity           string       "moderate" | "significant" | "major"
region             string       "Colorado I-70"
peakDay            YYYY-MM-DD
totalSnowfallCm    cm           → convert to inches
totalSnowfallInches number      already in inches (convenience field)

affectedResorts[].slug          string
affectedResorts[].name          string
affectedResorts[].ticker        string
affectedResorts[].forecastCm    cm → convert to inches
affectedResorts[].forecastInches number (convenience)
```

**Severity thresholds**: major ≥45cm (~18"), significant ≥25cm (~10"), moderate ≥10cm (~4"), quiet <10cm (filtered out).

**Regions tracked** (15): Colorado I-70, Colorado South, Colorado North, Utah Wasatch, Utah Northern, Wyoming, Montana, Idaho, California Tahoe, California Sierra, Pacific Northwest, New England, New Mexico, British Columbia, Alberta.

---

### `GET /api/worth-knowing`
| Detail | Value |
|--------|-------|
| **Type** | Consumer API |
| **Auth** | Supabase cookie (required) |
| **POC screens** | Dashboard ("Getting snow elsewhere" teasers) |
| **Purpose** | Resorts outside user's normal list with significantly more snow |

**Response** (max 2 resorts):
```
slug                string
name                string
ticker              string
forecastInches      number       already in inches
userBestInches      number       user's best resort for comparison
differentialInches  number       how much more snow
isOnPass            boolean
distanceMiles       number
passes              string[]
walkUpPricing.adult number|null  USD
```

**Algorithm**: Returns resorts where 3-day forecast ≥1.5x user's best, within 1.5x drive radius.

---

## Priority 3 — Resort & Storm Detail

### `GET /api/resorts/[slug]`
| Detail | Value |
|--------|-------|
| **Type** | Consumer API |
| **Auth** | Supabase cookie (required) |
| **POC screens** | Storm detail (per-resort go/no-go), future resort detail page |
| **Purpose** | Full resort profile + current weather + go/no-go assessment |

**Response shape**:
```
resort.slug, .name, .ticker, .state, .region
resort.elevation.base/summit/vertical    feet
resort.terrain.acres/trails/lifts
resort.terrain.breakdown.beginner/intermediate/advanced  %
resort.passes                            string[]
resort.features                          string[]
resort.avgSnowfall                       inches/season
resort.walkUpPricing.adult               USD | null
resort.walkUpPricing.dynamicPricing      boolean

weather                                  WeatherSnapshot (same as /api/weather)

goNoGo.overall                           "go" | "no-go" | "conditional"
goNoGo.factors[].label                   "Wind" | "Visibility" | "Temperature" | "Alerts"
goNoGo.factors[].status                  "go" | "no-go" | "conditional"
goNoGo.factors[].detail                  string  "Light winds, 12 km/h"
goNoGo.summary                           string  "All conditions favorable"

driveTimeMinutes                         number
```

This is the **richest per-resort endpoint** — it bundles resort profile, weather, and go/no-go in one call.

---

### `PATCH /api/preferences`
| Detail | Value |
|--------|-------|
| **Type** | Consumer API |
| **Auth** | Supabase cookie (required) |
| **POC screens** | Profile (favorite resorts) |
| **Purpose** | Add/remove a single favorite resort without rewriting all preferences |

**Request body** (one of):
```json
{ "addFavoriteResort": "jackson-hole" }
{ "removeFavoriteResort": "jackson-hole" }
```

---

## Priority 4 — Alerts & Notifications

### `GET /api/notifications`
| Detail | Value |
|--------|-------|
| **Type** | Consumer API |
| **Auth** | Supabase cookie (required) |
| **POC screens** | Alerts page |
| **Purpose** | User's notification history |

**Response per notification**:
```
id           uuid
type         "powder" | "storm" | "weekend" | "chase" | "price" | "worth_knowing"
resort_slug  string
title        string       "Powder Alert: Vail"
body         string       "12\" expected overnight at Vail"
sent_at      ISO 8601
opened_at    ISO 8601 | null
acted_on     boolean
```

---

## AI Constructs (Server-Side — No Direct POC Calls)

These run server-side within the SkiData platform. The POC consumes their output through the endpoints above, but understanding them helps interpret the data.

### Go/No-Go Assessment
| Detail | Value |
|--------|-------|
| **Used by** | `GET /api/resorts/[slug]` → `goNoGo` field |
| **Algorithm** | `assessGoNoGo()` in `website/lib/weather/go-no-go.ts` |
| **Priority** | P2 — consumed via resort detail endpoint |

Evaluates 4 factors from current weather:

| Factor | No-Go | Conditional | Go |
|--------|-------|-------------|-----|
| Wind gusts | ≥80 km/h | ≥55 km/h | <55 km/h |
| Visibility | <200m | <500m | ≥500m |
| Feels like | ≤-30°C | ≤-20°C | >-20°C |
| Alerts | Extreme/Severe | Moderate | None |

Any single no-go → overall no-go. Any conditional without no-go → overall conditional.

---

### Storm Detection
| Detail | Value |
|--------|-------|
| **Used by** | `GET /api/storms` |
| **Algorithm** | `detectStorms()` in `website/lib/storms.ts` |
| **Priority** | P2 — consumed via storms endpoint |

Groups resorts into 15 regional clusters, fetches 3-day snowfall, classifies severity by max snowfall. Only storms ≥10cm returned.

---

### Worth-Knowing Discovery
| Detail | Value |
|--------|-------|
| **Used by** | `GET /api/worth-knowing` |
| **Algorithm** | `evaluateWorthKnowing()` in `website/lib/worth-knowing.ts` |
| **Priority** | P2 — consumed via worth-knowing endpoint |

Finds up to 2 resorts outside user's list where 3-day forecast ≥1.5x user's best, within 1.5x drive radius.

---

### Recommendation Engine
| Detail | Value |
|--------|-------|
| **Used by** | MCP `recommendResort` tool |
| **Priority** | P4 — not needed for POC v1, future enhancement |

Persona-weighted scoring (powder/family/budget/beginner) across 4 factors:

| Factor | Powder | Family | Budget | Beginner |
|--------|--------|--------|--------|----------|
| Snow | 45% | 15% | 20% | 10% |
| Conditions | 25% | 20% | 15% | 25% |
| Terrain | 20% | 35% | 15% | 40% |
| Price | 10% | 30% | 50% | 25% |

---

### Drive Time Estimation
| Detail | Value |
|--------|-------|
| **Used by** | `GET /api/resorts/ranked` → `drive_time_minutes`, `GET /api/resorts/[slug]` → `driveTimeMinutes` |
| **Priority** | P2 — consumed via ranked/detail endpoints |

Speed model: 35 mph (<50mi), 50 mph (50-150mi), 45 mph (>150mi). Elevation penalty: +15% for summits ≥9000ft, +10% for ≥7000ft.

---

### Base Depth Estimation
| Detail | Value |
|--------|-------|
| **Used by** | `GET /api/resorts/ranked` → `base_depth` |
| **Priority** | P2 — consumed via ranked endpoint |

Seasonal curve (`sin(progress * PI)`), elevation factor, regional climate adjustments. Recent forecast boost.

---

## Not Needed for POC v1

These SkiData capabilities exist but aren't required for the current POC scope:

| Capability | Type | Why Not Needed |
|-----------|------|----------------|
| MCP Server (12 tools) | MCP | For AI agent integration, not consumer app |
| `POST /api/stripe/checkout` | Billing | No payments in POC |
| `POST /api/stripe/portal` | Billing | No payments in POC |
| `GET/POST /api/keys` | API Keys | No API key management in POC |
| `recommendResort` | MCP Tool | POC uses ranked resorts endpoint instead |
| `planWeekend` | MCP Tool | Trip planning not in POC scope |
| `createItinerary` | MCP Tool | Trip planning not in POC scope |
| `getLogistics` | MCP Tool | Day-of logistics not in POC scope |
| `getPrices` / `findDeals` | MCP Tools | Price tracking not in POC scope |
| Enricher Pipeline | Python CLI | Data collection, not consumer-facing |

---

## Unit Conversion Reference

Every conversion the POC needs when consuming SkiData responses:

| From (API) | To (POC) | Formula |
|-----------|----------|---------|
| °C | °F | `(c × 1.8) + 32` |
| cm | inches | `cm ÷ 2.54` |
| km/h | mph | `kph ÷ 1.609` |
| meters (visibility) | miles | `m ÷ 1609` |
| meters (freezing level) | feet | `m × 3.281` |
| miles (drive radius) | minutes | 40→45, 55→60, 100→120, 150→180 |

All conversions should live in `lib/api/transforms.ts`.
