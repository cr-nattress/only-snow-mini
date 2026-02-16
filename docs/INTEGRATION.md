# OnlySnow Integration Guide

API reference and integration documentation for the OnlySnow ski conditions platform. This document covers every public endpoint, MCP tool, data model, and AI construct available for third-party integration.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Authentication](#authentication)
- [Consumer API](#consumer-api)
  - [Preferences](#preferences)
  - [Ranked Resorts](#ranked-resorts)
  - [Resort Detail](#resort-detail)
  - [Storm Tracker](#storm-tracker)
  - [Worth Knowing](#worth-knowing)
  - [Notifications](#notifications)
- [Public API](#public-api)
  - [Weather](#weather)
- [Billing API](#billing-api)
- [API Key Management](#api-key-management)
- [MCP Server](#mcp-server)
  - [Ski Conditions Tools](#ski-conditions-tools)
  - [Resort Search Tools](#resort-search-tools)
  - [Trip Planner Tools](#trip-planner-tools)
  - [Price Tracker Tools](#price-tracker-tools)
  - [Composite AI Tools](#composite-ai-tools)
- [Data Models](#data-models)
  - [Resort](#resort)
  - [WeatherSnapshot](#weathersnapshot)
  - [StormSystem](#stormsystem)
  - [GoNoGoAssessment](#gonogoassessment)
  - [UserPreferences](#userpreferences)
- [AI Constructs](#ai-constructs)
  - [Recommendation Engine](#recommendation-engine)
  - [Weekend Planner](#weekend-planner)
  - [Storm Detection](#storm-detection)
  - [Worth-Knowing Discovery](#worth-knowing-discovery)
  - [Go/No-Go Assessment](#gono-go-assessment)
  - [Estimation Models](#estimation-models)
  - [Enricher Pipeline](#enricher-pipeline)
- [Database Schema](#database-schema)
- [External Services](#external-services)
- [Resort Coverage](#resort-coverage)

---

## Architecture Overview

The platform consists of three deployable components:

| Component | Stack | URL | Purpose |
|-----------|-------|-----|---------|
| **Website** | Next.js 14 (App Router) | `localhost:3000` | Consumer app + marketing site |
| **MCP Server** | Next.js + mcp-handler | `https://ski-mcp.vercel.app/api/mcp` | 12 AI-callable tools via MCP protocol |
| **Enricher** | Python CLI | Local only | AI-powered resort data collection pipeline |

Data flows: Open-Meteo (weather) and NWS (alerts) feed both the website and MCP server. Supabase handles auth, user preferences, and persistent state. The enricher pipeline uses Claude to build rich resort profiles.

---

## Authentication

### Website API (Consumer Routes)

All `/api/` routes under the consumer app require Supabase Auth. The session is managed via HTTP-only cookies set by `@supabase/ssr`.

```
Cookie: sb-<project-ref>-auth-token=<jwt>
```

Unauthenticated requests receive `401 Unauthorized`. Users without completed onboarding (no preferences row) receive `404` from ranked/storm/worth-knowing endpoints.

### MCP Server

Optional Bearer token authentication:

```
Authorization: Bearer <token>
```

When `MCP_API_KEYS` env var is set (comma-separated tokens), all requests require a valid token. When unset, the server operates in open mode.

Rate limit: 60 requests/minute per IP or API key (sliding window).

### Stripe Webhooks

Signature verification via `stripe.webhooks.constructEvent()` using `STRIPE_WEBHOOK_SECRET`.

### Sanity Webhooks

Custom header: `x-sanity-webhook-secret: <secret>`.

---

## Consumer API

Base URL: `/api` (relative to website host)

All consumer endpoints require Supabase Auth.

### Preferences

#### `GET /api/preferences`

Returns the authenticated user's skiing preferences.

**Response** `200`:
```json
{
  "preferences": {
    "location_lat": 39.7392,
    "location_lng": -104.9903,
    "location_name": "Denver, CO",
    "pass_type": ["epic", "ikon"],
    "drive_radius_miles": 120,
    "favorite_resorts": ["vail", "copper-mountain"],
    "chase_enabled": false,
    "chase_max_budget": null,
    "chase_regions": [],
    "notification_powder": true,
    "notification_storm": true,
    "notification_weekend": true,
    "notification_chase": true,
    "notification_price": true,
    "notification_quiet_start": null,
    "notification_quiet_end": null
  }
}
```

Returns `{ "preferences": null }` if onboarding is incomplete.

#### `POST /api/preferences`

Create or update (upsert) the full preferences object.

**Request Body** (required fields marked with `*`):
```json
{
  "location_lat": 39.7392,       // * number
  "location_lng": -104.9903,     // * number
  "location_name": "Denver, CO",
  "pass_type": ["epic"],
  "drive_radius_miles": 120,
  "favorite_resorts": ["vail"],
  "chase_enabled": false,
  "chase_max_budget": 500,
  "chase_regions": ["utah-cottonwoods"],
  "notification_powder": true,
  "notification_storm": true,
  "notification_weekend": true,
  "notification_chase": true,
  "notification_price": true,
  "notification_quiet_start": "22:00",
  "notification_quiet_end": "07:00"
}
```

**Response** `200`: `{ "preferences": { ... } }`

#### `PATCH /api/preferences`

Incrementally add or remove a favorite resort without sending the entire preferences object.

**Request Body**:
```json
{ "addFavoriteResort": "jackson-hole" }
```
or:
```json
{ "removeFavoriteResort": "jackson-hole" }
```

**Response** `200`: `{ "preferences": { ... } }`

---

### Ranked Resorts

#### `GET /api/resorts/ranked?period=today|weekend|5d|10d`

Returns the user's resorts ranked by snowfall forecast for the selected period, filtered by their pass type and drive radius.

**Query Parameters**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `today` | `today`, `weekend`, `5d`, `10d` (10d returns 7-day data) |

**Response** `200`:
```json
{
  "resorts": [
    {
      "slug": "copper-mountain",
      "name": "Copper Mountain",
      "ticker": "COPR",
      "region": "colorado-i70",
      "state": "CO",
      "passes": ["ikon"],
      "elevation": { "base": 9712, "summit": 12313, "vertical": 2601 },
      "terrain": {
        "acres": 2490,
        "trails": 140,
        "lifts": 24,
        "breakdown": { "beginner": 21, "intermediate": 25, "advanced": 54 }
      },
      "avgSnowfall": 305,
      "snowfall_24h": 8.2,
      "forecast_total": 22.5,
      "base_depth": 58,
      "terrain_open_pct": 91,
      "drive_time_minutes": 112,
      "distance_miles": 75,
      "conditions": "Light snow"
    }
  ],
  "period": "today",
  "userLocation": {
    "lat": 39.7392,
    "lng": -104.9903,
    "name": "Denver, CO"
  }
}
```

**Units**: `snowfall_24h` and `forecast_total` are in centimeters. `base_depth` is in inches. `drive_time_minutes` is an estimate (see [Estimation Models](#estimation-models)).

**Sorting**: Primary by `forecast_total` descending, secondary by `snowfall_24h` descending.

**Filtering**: Resorts are filtered by user's `pass_type` (or all if none/empty) and `drive_radius_miles`.

---

### Resort Detail

#### `GET /api/resorts/[slug]`

Returns detailed info for a single resort including weather and go/no-go assessment.

**Response** `200`:
```json
{
  "resort": {
    "slug": "vail",
    "name": "Vail",
    "ticker": "VAIL",
    "state": "CO",
    "region": "colorado-i70",
    "elevation": { "base": 8120, "summit": 11570, "vertical": 3450 },
    "terrain": { "acres": 5317, "trails": 195, "lifts": 31, "breakdown": { ... } },
    "passes": ["epic"],
    "features": ["terrain-parks"],
    "avgSnowfall": 354,
    "walkUpPricing": { "adult": null, "dynamicPricing": true }
  },
  "weather": { ... },
  "goNoGo": {
    "overall": "go",
    "factors": [
      { "label": "Wind", "status": "go", "detail": "Light winds, 12 km/h" },
      { "label": "Visibility", "status": "go", "detail": "Clear, >10km" },
      { "label": "Temperature", "status": "go", "detail": "-5°C, feels -9°C" },
      { "label": "Alerts", "status": "go", "detail": "No active alerts" }
    ],
    "summary": "All conditions favorable"
  },
  "driveTimeMinutes": 112
}
```

---

### Storm Tracker

#### `GET /api/storms`

Detects active storm systems across all resort regions by aggregating 3-day snowfall forecasts.

**Response** `200`:
```json
{
  "storms": [
    {
      "id": "colorado-i-70",
      "name": "Major storm hitting Colorado I-70",
      "severity": "major",
      "region": "Colorado I-70",
      "affectedResorts": [
        {
          "slug": "loveland",
          "name": "Loveland",
          "ticker": "LOVE",
          "forecastCm": 52,
          "forecastInches": 20.5
        }
      ],
      "peakDay": "2026-02-15",
      "totalSnowfallCm": 52,
      "totalSnowfallInches": 20.5
    }
  ]
}
```

**Severity Thresholds**:

| Severity | Snowfall (3-day max) | Approximate Inches |
|----------|---------------------|--------------------|
| `major` | >= 45 cm | ~18"+ |
| `significant` | >= 25 cm | ~10"+ |
| `moderate` | >= 10 cm | ~4"+ |
| `quiet` | < 10 cm | Filtered out |

**Regions Tracked** (15):
Colorado I-70, Colorado South, Colorado North, Utah Wasatch, Utah Northern, Wyoming, Montana, Idaho, California Tahoe, California Sierra, Pacific Northwest, New England, New Mexico, British Columbia, Alberta

---

### Worth Knowing

#### `GET /api/worth-knowing`

Finds resorts outside the user's normal list that have significantly more snow than their best resort.

**Response** `200`:
```json
{
  "worthKnowing": [
    {
      "slug": "alta",
      "name": "Alta",
      "ticker": "ALTA",
      "forecastInches": 18.2,
      "userBestInches": 8.4,
      "differentialInches": 9.8,
      "isOnPass": false,
      "distanceMiles": 342,
      "passes": ["ikon"],
      "walkUpPricing": { "adult": 160, "dynamicPricing": false }
    }
  ]
}
```

**Algorithm**: Returns up to 2 resorts where 3-day forecast >= 1.5x the user's best resort, within 1.5x their normal drive radius. See [Worth-Knowing Discovery](#worth-knowing-discovery) for details.

---

### Notifications

#### `GET /api/notifications`

Returns notification history for the authenticated user.

**Response** `200`:
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "powder",
      "resort_slug": "vail",
      "title": "Powder Alert: Vail",
      "body": "12\" expected overnight at Vail",
      "sent_at": "2026-02-13T06:00:00Z",
      "opened_at": null,
      "acted_on": false
    }
  ]
}
```

**Notification Types**: `powder`, `storm`, `weekend`, `chase`, `price`, `worth_knowing`

---

## Public API

### Weather

#### `GET /api/weather?resort=<slug>`

Public endpoint (no auth required). Returns current conditions and 7-day forecast for any resort.

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `resort` | string | Yes | Resort slug (e.g., `vail`, `jackson-hole`) |

**Response** `200`:
```json
{
  "current": {
    "temperature": -5,
    "feelsLike": -12,
    "conditions": "Light snow",
    "humidity": 85,
    "wind": { "speed": 18, "gusts": 32, "direction": "NW" },
    "visibility": 8000,
    "freezingLevel": 2100
  },
  "forecast": [
    {
      "date": "2026-02-13",
      "conditions": "Snow",
      "high": -2,
      "low": -14,
      "snowfall": 12.5,
      "precipChance": 90,
      "wind": { "speed": 20, "gusts": 35 }
    }
  ],
  "alerts": [
    {
      "severity": "moderate",
      "title": "Winter Storm Watch",
      "description": "Heavy snow expected...",
      "expires": "2026-02-14T18:00:00Z"
    }
  ],
  "fetchedAt": "2026-02-13T12:00:00Z"
}
```

**Units**: Temperature in Celsius. Wind in km/h. Snowfall in cm. Visibility in meters. Freezing level in meters.

**Cache**: `Cache-Control: s-maxage=900, stale-while-revalidate=1800` (15-min fresh, 30-min stale).

---

## Billing API

#### `POST /api/stripe/checkout`

Creates a Stripe Checkout session for subscription purchase.

**Request Body**:
```json
{
  "priceId": "price_xxx",
  "planId": "developer"
}
```

**Response** `200`: `{ "sessionId": "cs_xxx", "url": "https://checkout.stripe.com/..." }`

#### `POST /api/stripe/portal`

Creates a Stripe Billing Portal session for subscription management.

**Response** `200`: `{ "url": "https://billing.stripe.com/..." }`

#### `POST /api/stripe/webhook`

Stripe webhook receiver. Handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.

---

## API Key Management

#### `GET /api/keys`

List active API keys (max 10 per user).

**Response** `200`:
```json
{
  "keys": [
    {
      "id": "uuid",
      "name": "Production",
      "key_prefix": "sk_live_a1b2",
      "last_used_at": "2026-02-13T10:00:00Z",
      "created_at": "2026-01-01T00:00:00Z",
      "revoked_at": null
    }
  ]
}
```

#### `POST /api/keys`

Generate a new API key. The full key is returned **only once**.

**Request Body**: `{ "name": "My Key" }`

**Response** `200`:
```json
{
  "key": {
    "id": "uuid",
    "name": "My Key",
    "key_prefix": "sk_live_a1b2",
    "fullKey": "sk_live_a1b2c3d4e5f6...",
    "created_at": "2026-02-13T00:00:00Z"
  }
}
```

**Key Format**: `sk_live_{48-char-hex}`. SHA-256 hash stored server-side.

#### `DELETE /api/keys/[id]`

Revoke an API key (soft delete).

**Response** `200`: `{ "success": true }`

---

## MCP Server

**Endpoint**: `https://ski-mcp.vercel.app/api/mcp`
**Protocol**: Model Context Protocol (MCP) via SSE and HTTP transports
**Library**: `mcp-handler` v1.0.7

The MCP server exposes 12 tools organized into 5 categories. All tools accept and return JSON. Weather data is live from Open-Meteo. Resort data covers 31 resorts (static).

### Ski Conditions Tools

#### `getConditions`

Get current conditions and resort metadata.

**Input**:
```json
{
  "resortSlug": "vail",
  "include": ["weather", "terrain", "lifts"]
}
```

**Output**: Resort metadata + current weather + terrain stats + lift counts.

#### `getWeather`

Get current weather and multi-day forecast.

**Input**:
```json
{
  "resortSlug": "vail",
  "days": 7
}
```
`days`: 1-14, default 7.

**Output**: Current conditions + daily forecast array with temps, snowfall, wind, precip chance.

#### `getSnowHistory`

Get historical snowfall averages.

**Input**: `{ "resortSlug": "vail" }`

**Output**: Average annual snowfall, elevation data. Note: static averages only (no daily historical data yet).

#### `getLiftStatus`

Get lift and terrain summary.

**Input**: `{ "resortSlug": "vail" }`

**Output**: Total lift count, terrain breakdown. Note: no per-lift open/closed status yet.

---

### Resort Search Tools

#### `searchResorts`

Search and filter the resort database.

**Input**:
```json
{
  "query": "tahoe",
  "state": "CA",
  "region": "california-tahoe",
  "minVertical": 2000,
  "minAcres": 1000,
  "pass": "epic",
  "features": ["terrain-parks"],
  "sortBy": "snowfall",
  "limit": 10
}
```
All fields optional. `sortBy`: `name` | `vertical` | `acres` | `snowfall`. `limit`: 1-50, default 20.

**Output**: `{ "results": [...], "total": 5 }`

#### `getResort`

Get full metadata for a single resort.

**Input**: `{ "resortSlug": "jackson-hole" }`

**Output**: Complete `Resort` object.

#### `compareResorts`

Side-by-side comparison of 2-4 resorts.

**Input**:
```json
{
  "resorts": ["vail", "PCMR", "jackson-hole"],
  "metrics": ["stats", "conditions", "pricing"]
}
```

**Output**: Array of resort objects with requested metric sections.

#### `resolveSlug`

Fuzzy-resolve a resort name, ticker, or slug to its canonical identifier.

**Input**: `{ "name": "Jackson Hole" }`

**Output**: `{ "slug": "jackson-hole", "ticker": "JHMR", "name": "Jackson Hole", "matched": true }`

---

### Trip Planner Tools

#### `createItinerary`

Generate a multi-day ski trip itinerary with weather forecasts and budget estimates.

**Input**:
```json
{
  "destination": "vail",
  "startDate": "2026-02-20",
  "endDate": "2026-02-22",
  "travelers": 2,
  "skillLevel": "intermediate",
  "budget": "moderate"
}
```
`skillLevel`: `beginner` | `intermediate` | `advanced` | `expert`. `budget`: `budget` | `moderate` | `luxury`.

**Output**:
```json
{
  "summary": "3-day trip to Vail for 2 intermediate skiers",
  "resort": { ... },
  "days": [
    {
      "date": "2026-02-20",
      "dayNumber": 1,
      "resort": { "slug": "vail", "name": "Vail" },
      "weather": { "high": -2, "low": -12, "snowfall": 5.2, ... },
      "recommendations": ["Start on Blue Sky Basin", "Warm up on groomers"]
    }
  ],
  "budget": {
    "tier": "moderate",
    "liftTickets": 756,
    "lodging": 500,
    "food": 225,
    "total": 1481,
    "perPerson": 740
  },
  "tips": ["Book lift tickets 7+ days ahead for 10% savings"]
}
```

**Budget Tiers**:

| Tier | Lift Tickets/Day | Lodging/Night | Food/Day |
|------|-----------------|---------------|----------|
| Budget | $139 | $150 | $50 |
| Moderate | $189 | $250 | $75 |
| Luxury | $239 | $450 | $120 |

#### `getLogistics`

Get day-of logistics: parking, crowds, tickets, weather.

**Input**: `{ "resortSlug": "vail", "date": "2026-02-15" }`

**Output**:
```json
{
  "resort": { "slug": "vail", "name": "Vail" },
  "date": "2026-02-15",
  "dayOfWeek": "Saturday",
  "weather": { ... },
  "parking": { "prediction": "Heavy — arrive early", "arriveBy": "7:30 AM" },
  "crowds": { "prediction": "High", "liftLines": "15-25 min", "bestTime": "First chair or after 1 PM" },
  "tickets": {
    "estimatedPrice": 263,
    "advancePrice": 206,
    "tip": "Buy 7+ days ahead to save ~$57",
    "passNote": "Included with Epic Pass"
  }
}
```

---

### Price Tracker Tools

#### `getPrices`

Get estimated ticket prices for the next 7 days.

**Input**:
```json
{
  "resortSlug": "vail",
  "ticketType": "adult"
}
```
`ticketType`: `adult` | `child` | `senior`. Default: `adult`.

**Output**: 7-day price forecast with day-of-week adjustments.

**Pricing Tiers** (by resort size):

| Tier | Acres | Base Price |
|------|-------|-----------|
| Premium | > 3000 | $229 |
| Mid | 1500-3000 | $179 |
| Value | < 1500 | $119 |

**Adjustments**: Weekend +15%, same-day +10%, 7-day advance -10%, child 60% of adult, senior 75%.

#### `findDeals`

Find the cheapest resorts matching criteria.

**Input**:
```json
{
  "maxPrice": 150,
  "state": "CO",
  "limit": 5
}
```

**Output**: Resorts sorted by estimated price ascending.

---

### Composite AI Tools

These tools chain multiple simpler tools together using recursive skill composition.

#### `recommendResort`

AI-powered resort recommendation using persona-weighted multi-factor scoring.

**Input**:
```json
{
  "persona": "powder",
  "region": "colorado-i70",
  "state": "CO",
  "maxResults": 3
}
```
`persona`: `powder` | `family` | `budget` | `beginner`. Default: `powder`.

**Output**:
```json
{
  "persona": "powder",
  "recommendations": [
    {
      "slug": "loveland",
      "name": "Loveland",
      "state": "CO",
      "score": 87,
      "factors": {
        "snow": { "score": 95, "detail": "18\" in 48hr, 400\" avg season" },
        "price": { "score": 82, "detail": "$119 estimated, value tier" },
        "terrain": { "score": 75, "detail": "1800 acres, 50% advanced" },
        "conditions": { "score": 90, "detail": "18°F, light snow, calm winds" }
      },
      "weather": { "temp": -8, "conditions": "Light snow", "snowfall48hr": 45.7 },
      "estimatedPrice": 119,
      "reasoning": "Best powder conditions with excellent value pricing"
    }
  ],
  "searchedResorts": 15,
  "updatedAt": "2026-02-13T12:00:00Z"
}
```

See [Recommendation Engine](#recommendation-engine) for scoring details.

#### `planWeekend`

Complete weekend trip plan combining resort recommendation, weather, logistics, and budgeting.

**Input**:
```json
{
  "persona": "family",
  "state": "CO",
  "travelers": 4,
  "budget": "moderate"
}
```

**Output**:
```json
{
  "persona": "family",
  "recommendation": { ... },
  "itinerary": [
    {
      "day": 1,
      "date": "2026-02-15",
      "dayOfWeek": "Saturday",
      "weather": { ... },
      "plan": [
        "8:00 AM — Arrive, park in Structure 1",
        "8:30 AM — Gear up, rent equipment",
        "9:00 AM — Start on green runs at base",
        "12:00 PM — Lunch at lodge"
      ],
      "meals": ["Breakfast at hotel", "Mountain lodge lunch", "Downtown dinner"]
    }
  ],
  "logistics": {
    "arriveBy": "7:30 AM",
    "parking": "Heavy — arrive early",
    "crowds": "High",
    "liftLines": "15-25 min"
  },
  "budget": {
    "liftTickets": 1512,
    "lodging": 500,
    "food": 300,
    "total": 2312,
    "perPerson": 578
  },
  "tips": ["Book lift tickets 7+ days ahead", "Start with green runs to warm up"],
  "updatedAt": "2026-02-13T12:00:00Z"
}
```

---

## Data Models

### Resort

```typescript
interface Resort {
  slug: string;              // URL-safe identifier: "vail", "jackson-hole"
  ticker: string;            // 4-letter SnowTick code: "VAIL", "JHMR"
  name: string;              // Display name
  state: string;             // 2-letter: "CO", "UT", "WY", "BC", "AB"
  country: string;           // "USA" or "CAN"
  region: string;            // Grouping key (see Region list below)
  coordinates: {
    lat: number;
    lon: number;
  };
  elevation: {
    base: number;            // feet
    summit: number;          // feet
    vertical: number;        // feet (summit - base)
  };
  terrain: {
    acres: number;
    trails: number;
    lifts: number;
    breakdown: {
      beginner: number;      // percentage (0-100)
      intermediate: number;
      advanced: number;
      expert?: number;       // some resorts split advanced/expert
    };
  };
  passes: string[];          // "epic", "ikon", "indy"
  features: string[];        // "night-skiing", "terrain-parks", "family-friendly"
  avgSnowfall: number;       // inches per season
  walkUpPricing?: {
    adult: number | null;    // weekend adult day rate in USD, null if not sold
    dynamicPricing: boolean; // true if prices vary by date
  };
}
```

**Regions**: `colorado-i70`, `colorado-aspen`, `colorado-south`, `colorado-north`, `utah-park-city`, `utah-cottonwoods`, `utah-northern`, `wyoming`, `montana`, `idaho`, `california-eastern-sierra`, `california-tahoe`, `pacific-northwest`, `new-england`, `new-mexico`, `british-columbia`, `alberta`

### WeatherSnapshot

```typescript
interface WeatherSnapshot {
  current: {
    temperature: number;     // Celsius
    feelsLike: number;       // Celsius
    conditions: string;      // "Clear", "Light snow", "Heavy snow", etc.
    humidity: number;        // 0-100
    wind: {
      speed: number;         // km/h
      gusts: number;         // km/h
      direction: string;     // "N", "NE", "NW", etc.
    };
    visibility: number;      // meters
    freezingLevel: number;   // meters
  };
  forecast: DailyForecast[]; // 7 days
  alerts: WeatherAlert[];
  fetchedAt: string;         // ISO 8601
}

interface DailyForecast {
  date: string;              // YYYY-MM-DD
  conditions: string;
  high: number;              // Celsius
  low: number;               // Celsius
  snowfall: number;          // centimeters
  precipChance: number;      // 0-100
  wind: {
    speed: number;           // km/h
    gusts: number;           // km/h
  };
}

interface WeatherAlert {
  severity: "moderate" | "severe" | "extreme";
  title: string;
  description: string;
  expires: string;           // ISO 8601
}
```

### StormSystem

```typescript
interface StormSystem {
  id: string;                // Region slug: "colorado-i-70"
  name: string;              // "Major storm hitting Colorado I-70"
  severity: "moderate" | "significant" | "major";
  region: string;            // Display name: "Colorado I-70"
  affectedResorts: {
    slug: string;
    name: string;
    ticker: string;
    forecastCm: number;      // 3-day total
  }[];
  peakDay: string;           // YYYY-MM-DD
  totalSnowfallCm: number;  // max across affected resorts
}
```

### GoNoGoAssessment

```typescript
interface GoNoGoAssessment {
  overall: "go" | "no-go" | "conditional";
  factors: {
    label: "Wind" | "Visibility" | "Temperature" | "Alerts";
    status: "go" | "no-go" | "conditional";
    detail: string;
  }[];
  summary: string;
}
```

**Thresholds**:

| Factor | No-Go | Conditional | Go |
|--------|-------|-------------|-----|
| Wind gusts | >= 80 km/h | >= 55 km/h | < 55 km/h |
| Visibility | < 200m | < 500m | >= 500m |
| Feels like | <= -30°C | <= -20°C | > -20°C |
| Alerts | Extreme/Severe | Moderate | None |

### UserPreferences

```typescript
interface UserPreferences {
  location_lat: number;
  location_lng: number;
  location_name?: string;
  pass_type?: string[];           // ["epic", "ikon"] or ["none"]
  drive_radius_miles?: number;    // default 120
  favorite_resorts?: string[];    // resort slugs
  chase_enabled?: boolean;
  chase_max_budget?: number;      // USD
  chase_regions?: string[];       // region slugs
  notification_powder?: boolean;
  notification_storm?: boolean;
  notification_weekend?: boolean;
  notification_chase?: boolean;
  notification_price?: boolean;
  notification_quiet_start?: string; // "HH:MM" (24hr)
  notification_quiet_end?: string;
}
```

---

## AI Constructs

### Recommendation Engine

**Tool**: `recommendResort` (MCP)

Scores resorts on 4 factors with persona-specific weights:

| Factor | Powder | Family | Budget | Beginner |
|--------|--------|--------|--------|----------|
| Snow | 45% | 15% | 20% | 10% |
| Conditions | 25% | 20% | 15% | 25% |
| Terrain | 20% | 35% | 15% | 40% |
| Price | 10% | 30% | 50% | 25% |

**Snow Score** (0-100): `min(100, (snowfall48hr / 12) * 60 + (avgSnowfall / 500) * 40)`

**Price Score** (0-100): `min(100, ((250 - basePrice) / 250) * 100)`

**Terrain Score**: Persona-dependent. Powder persona favors advanced %; family favors beginner+intermediate %; beginner favors beginner %.

**Conditions Score**: `tempScore * 0.6 + windScore * 0.4`
- Temperature: Best at/below 32°F, degrades above
- Wind: Best below 10 mph, poor above 20 mph

**Pipeline**: `searchResorts` (top 15 by snowfall) -> parallel `getWeather` -> score -> sort -> top N

### Weekend Planner

**Tool**: `planWeekend` (MCP)

Chains: `recommendResort` -> `getWeather` (detailed) -> `getLogistics` -> budget calculation

Generates persona-specific day plans with meal suggestions, arrival times, and tips. Calculates budget using tier-based pricing multiplied by traveler count.

### Storm Detection

**Algorithm**: `detectStorms()` in `website/lib/storms.ts`

1. Groups all resorts into 15 regional clusters
2. Fetches 3-day snowfall forecast for each resort
3. Finds regional maximum and classifies severity
4. Returns storms sorted by total snowfall descending

Only storms with severity > "quiet" (>= 10cm) are returned.

### Worth-Knowing Discovery

**Algorithm**: `evaluateWorthKnowing()` in `website/lib/worth-knowing.ts`

Identifies up to 2 "hidden gem" resorts that the user isn't tracking but should be aware of.

**Criteria**:
- Not in user's current resort list (pass-filtered)
- Within 1.5x the user's normal drive radius
- 3-day forecast >= 1.5x the user's best resort's forecast
- Sorted by differential (how much more snow than user's best)

### Go/No-Go Assessment

**Algorithm**: `assessGoNoGo()` in `website/lib/weather/go-no-go.ts`

Evaluates 4 safety factors from current weather data and returns a categorical assessment. Any single "no-go" factor makes the overall assessment "no-go". Any "conditional" factor without a "no-go" makes overall "conditional".

### Estimation Models

Three estimation algorithms used when live data isn't available:

**Base Depth** (`estimateBaseDepth`):
- Seasonal accumulation curve: `sin(progress * PI)` peaks late February
- Elevation factor: +20% for bases >= 10,000ft, +10% for >= 8,000ft
- Regional climate: +15% Utah (dry powder), -30% New England (freeze-thaw), -10% Pacific NW (wet snow)
- Recent forecast boost: 30% of 7-day forecast snowfall added

**Terrain Open %** (`estimateTerrainOpenPct`):
- Nov: 30-50%, Dec: 50-80%, Jan-Feb: 85-95%, Mar: 75-90%, Apr: 50-75%

**Drive Time** (`estimateDriveTime`):
- Speed: 35 mph (<50mi), 50 mph (50-150mi), 45 mph (>150mi)
- Elevation penalty: +15% for summits >= 9,000ft, +10% for >= 7,000ft

### Enricher Pipeline

**Location**: `enricher/` (Python)

AI-powered data collection using Claude (`claude-sonnet-4-20250514`) with two collection strategies:

**LLM Extract**: Feeds cleaned HTML + a Pydantic schema to Claude, returns structured JSON. Used for scraping resort websites that resist traditional parsing.

**LLM Knowledge**: Queries Claude's training data directly for resort facts (elevation, terrain breakdown, season dates). No web scraping needed.

**7 Enrichment Phases**:

| Phase | Name | Entities Collected |
|-------|------|--------------------|
| P1 | Discovery | Basic resort identification |
| P2 | Profile | Elevation, terrain, lifts, season dates |
| P3 | Operations | Snow conditions, lift/trail status, grooming |
| P4 | Destination | Village info, transportation, reviews |
| P5 | Media | Webcams, social media, links |
| P6 | Commercial | Pricing, passes, promotions, jobs |
| P7 | Synthesize | Unified Supabase payload |

**23 Pydantic data models** covering the full resort profile. Output stored as JSON in `enricher/output/resorts/<slug>/`.

---

## Database Schema

All tables in the `skidata` schema with Row Level Security enabled.

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User accounts, plan info, Stripe IDs | Owner read/write |
| `api_keys` | Hashed API keys with prefix | Owner CRUD |
| `usage_logs` | API call tracking per key | Owner read |
| `user_preferences` | Location, passes, favorites, notifications | Owner read/write |
| `push_tokens` | FCM/APNS tokens per device | Owner CRUD |
| `resort_snapshots` | Cached resort conditions | Public read, service write |
| `notification_log` | Sent notification history | Owner read |

**Triggers**:
- `on_auth_user_created` -> auto-creates `profiles` row
- `profiles_updated_at` -> auto-updates timestamp
- `user_preferences_updated_at` -> auto-updates timestamp

---

## External Services

| Service | Purpose | Auth | Rate/Cache |
|---------|---------|------|------------|
| **Open-Meteo** | Weather forecasts, current conditions | None (free) | 15-min in-memory cache |
| **NWS** | Winter weather alerts (US only) | User-Agent header | Best-effort, failures non-fatal |
| **Supabase** | Auth, Postgres, RLS | `SUPABASE_URL` + keys | N/A |
| **Stripe** | Subscription billing | `STRIPE_SECRET_KEY` | Webhook-driven |
| **Resend** | Transactional email | `RESEND_API_KEY` | On-demand |
| **Anthropic** | Enricher LLM extraction | `ANTHROPIC_API_KEY` | Enricher CLI only |

---

## Resort Coverage

**Website**: 50 resorts across 17 regions, 10 states/provinces, 2 countries.

**MCP Server**: 31 resorts (subset).

| Region | Count | Pass Mix |
|--------|-------|----------|
| Colorado I-70 | 9 | Epic, Ikon, Indy |
| Colorado Aspen | 3 | Ikon |
| Colorado South | 3 | Epic, Indy |
| Colorado North | 1 | Ikon |
| Utah Park City | 2 | Epic, Ikon |
| Utah Cottonwoods | 4 | Ikon |
| Utah Northern | 2 | Ikon, Indy |
| Wyoming | 2 | Ikon |
| Montana | 1 | Ikon |
| Idaho | 1 | Epic |
| California Eastern Sierra | 1 | Ikon |
| California Tahoe | 4 | Epic |
| Pacific Northwest | 3 | Epic, Ikon |
| British Columbia | 2 | Epic, Ikon |
| Alberta | 2 | Ikon |
| New Mexico | 1 | Ikon |
| New England | 9 | Epic, Ikon |
