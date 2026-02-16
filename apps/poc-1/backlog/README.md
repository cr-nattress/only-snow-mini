# OnlySnow POC-1 — Backlog

Product backlog for OnlySnow, organized by priority tier.

**API Base URL**: `https://ski-ai-mu.vercel.app/api`
**Integration Guides**: `docs/API_INTEGRATION_1.md` (quickstart), `docs/INTEGRATION.md` (full reference)
**Competitive Analysis**: `COMPETITIVE_ANALYSIS.md` (source for Epics 9-23)

---

## Legacy Epics — API Integration (flat files)

| # | Epic | Status | Depends On | Key Endpoints |
|---|------|--------|------------|---------------|
| 0a | [API Setup & Verification](./epic-0a-api-setup.md) | **Done** | — | `GET /api/health`, `GET /api/weather`, all endpoints |
| 8 | [Replace Mock Data with Live API](./epic-8-live-data.md) | **Next** | 0a | All endpoints (uses API key auth, no Supabase needed) |
| 0 | [API Client & Auth](./epic-0-auth.md) | Backlog | 0a | Supabase Auth |
| 1 | [Onboarding → Live Preferences](./epic-1-onboarding.md) | Backlog | 0 | `POST /api/preferences` |
| 2 | [Live Weather (Public)](./epic-2-weather.md) | Backlog | 0a | `GET /api/weather?resort=<slug>` |
| 3 | [Dashboard → Live Data](./epic-3-dashboard.md) | Backlog | 0, 1 | `GET /api/resorts/ranked`, `GET /api/storms`, `GET /api/worth-knowing` |
| 4 | [Storm Detail → Live Data](./epic-4-storms.md) | Backlog | 0, 3 | `GET /api/storms`, `GET /api/resorts/[slug]` |
| 5 | [Resort List → Live Data](./epic-5-resorts.md) | Backlog | 0, 2 | `GET /api/resorts/ranked?period=5d` |
| 6 | [Alerts → Live Notifications](./epic-6-alerts.md) | Backlog | 0 | `GET /api/notifications` |
| 7 | [Profile → Live Preferences](./epic-7-profile.md) | Backlog | 0, 1 | `GET/PATCH /api/preferences` |

**Note**: Epic 8 bypasses Epics 0-7 by using API key auth instead of Supabase. This gets live data on screen immediately without building auth flows. Epics 0-7 remain relevant for adding per-user auth, onboarding sync, and profile management later.

---

## P0 — Ship Before Public Launch

| # | Epic | Status | Depends On | Effort |
|---|------|--------|------------|--------|
| 9 | [Resort Detail Pages](./resort-detail-pages/) | Backlog | Epic 8 | Medium |
| 10 | [Real Push Notifications](./push-notifications/) | Backlog | Epic 0 | Medium |

## P1 — First Month Post-Launch

| # | Epic | Status | Depends On | Effort |
|---|------|--------|------------|--------|
| 11 | [Webcam Integration](./webcam-integration/) | Backlog | Epic 9 | Low |
| 12 | [Map View](./map-view/) | Backlog | Epic 8 | Medium |
| 13 | [Road Conditions](./road-conditions/) | Backlog | Epic 8 | Medium |
| 14 | [Season History & Historical Data](./season-history/) | Backlog | Epic 8 | Low |
| 15 | [Scoring Algorithm v2](./scoring-v2/) | Backlog | Epic 8 | Low |

## P2 — Quarter 2

| # | Epic | Status | Depends On | Effort |
|---|------|--------|------------|--------|
| 16 | [Weekend Planner](./weekend-planner/) | Backlog | Epic 8, 15 | Medium |
| 17 | [Resort Comparison](./resort-comparison/) | Backlog | Epic 9 | Medium |
| 18 | [Avalanche Info](./avalanche-info/) | Backlog | Epic 9 | Low |
| 19 | [Crowd Predictions](./crowd-predictions/) | Backlog | Epic 15 | High |
| 20 | [SkiDirectory Data Import](./skidirectory-import/) | Backlog | Epic 8 | Medium |

## P3 — Quarter 3+

| # | Epic | Status | Depends On | Effort |
|---|------|--------|------------|--------|
| 21 | [Native Mobile App](./native-app/) | Backlog | Epic 9, 10 | High |
| 22 | [AI-Powered Recommendations](./ai-recommendations/) | Backlog | Epic 9, 15 | Medium |
| 23 | [Freemium & Monetization](./freemium-monetization/) | Backlog | Epic 0, 10 | High |

---

## Dependency Graph

```
Epic 0a (Done) ──┬── Epic 8 (Next) ──┬── Epic 9 (Resort Detail) ──┬── Epic 11 (Webcams)
                 │                   │                             ├── Epic 17 (Comparison)
                 │                   │                             ├── Epic 18 (Avalanche)
                 │                   │                             ├── Epic 21 (Native App)
                 │                   │                             └── Epic 22 (AI Recs)
                 │                   ├── Epic 12 (Map View)
                 │                   ├── Epic 13 (Road Conditions)
                 │                   ├── Epic 14 (Season History)
                 │                   ├── Epic 15 (Scoring v2) ──┬── Epic 16 (Weekend Planner)
                 │                   │                          ├── Epic 19 (Crowd Predictions)
                 │                   │                          └── Epic 22 (AI Recs)
                 │                   └── Epic 20 (SkiDirectory Import)
                 │
                 └── Epic 0 (Auth) ──┬── Epic 10 (Push Notifications) ──┬── Epic 21 (Native App)
                                     │                                  └── Epic 23 (Monetization)
                                     └── Epic 23 (Monetization)
```

## Rollout Strategy

- **Phase 1** (Epics 0a, 8): API integration with live data — **in progress**
- **Phase 2** (Epics 0, 9, 10): Auth + resort detail + notifications — **pre-launch**
- **Phase 3** (Epics 11-15): Post-launch feature expansion — **month 1**
- **Phase 4** (Epics 16-20): Deeper intelligence and data — **quarter 2**
- **Phase 5** (Epics 21-23): Platform expansion and monetization — **quarter 3+**

## Key Mapping: POC Types → API Types

| POC Field | API Field | Conversion |
|-----------|-----------|------------|
| `snowfall_inches` | `forecast_total_inches` (ranked) or `snowfall` with `?units=imperial` | **None** — use convenience field or imperial param |
| `high_temp_f` / `low_temp_f` | `high` / `low` with `?units=imperial` | **None** — API converts |
| `wind_mph` | `wind.speed` with `?units=imperial` | **None** — API converts |
| `drive_minutes` | `drive_time_minutes` | Same unit |
| `max_drive_minutes` | `drive_minutes` (POST prefs) | **None** — API accepts `drive_minutes` directly |
| `resort.id` (POC internal) | `resort.slug` (API) | Remap IDs to slugs (see `lib/api/resort-slugs.ts`) |
| `resort.pass` (single) | `resort.passes` (array) | Map to first/primary |
| `resort.region` (broad) | `resort.region` (granular) | Map granular → broad |

## Notes

- API supports `?units=imperial` on `/api/weather` and `/api/resorts/[slug]` — eliminates most client-side conversions.
- Ranked endpoint includes convenience fields (`snowfall_24h_inches`, `forecast_total_inches`) — always present.
- API supports **API key auth** (`Authorization: Bearer sk_live_...`) in addition to Supabase cookies. API keys are simpler for the POC.
- API accepts `drive_minutes` as an alternative to `drive_radius_miles` in `POST /api/preferences` — matches POC's existing unit.
- All responses include `_meta.fetchedAt` for data freshness display.
- `GET /api/health` provides service status, resort count, and valid pass types — use for startup checks.
- Unauthenticated requests return `401`. Users without preferences get `404` from ranked/storm/worth-knowing endpoints.
- Weather endpoint (`/api/weather`) is public, no auth. 15-min cache. Great starting point for testing.
- Mock data stays as fallback for offline/error states.
