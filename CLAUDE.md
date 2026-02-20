# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OnlySnow is a mobile-first ski day recommendation app. It ranks resorts by a powder score algorithm and gives Go/Maybe/Skip verdicts based on weather, drive time, and user preferences. The app is in POC stage with live API integration.

## Repository Structure

This is **not** a monorepo with workspaces. The only app lives at `apps/poc-1/`. All commands should be run from that directory.

```
apps/poc-1/       # Next.js 16 app (the entire product)
docs/             # API reference docs (INTEGRATION.md, API_INTEGRATION_1.md)
UI_SPEC.md        # Comprehensive UI specification (source of truth for design)
```

## Commands

All commands run from `apps/poc-1/`:

```bash
npm run dev       # Dev server on localhost:3000
npm run build     # Production build
npm run lint      # ESLint (flat config, ESLint 9)
```

There are no test commands configured. No test framework is installed.

## Tech Stack

- **Next.js 16.1** with App Router (file-based routing)
- **React 19** — all functional components with hooks
- **TypeScript 5** — strict mode, path alias `@/*` → `./src/*`
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **lucide-react** for icons
- **Leaflet + react-leaflet** for interactive map view
- **No state library** — React Context only (`UserContext`, `AppContext`)
- **No test framework** — none installed

## Architecture

### Routing & Layouts

Two route groups under `src/app/`:
- `onboarding/` — 5-step flow (welcome → location → drive-radius → pass-selection → preferences)
- `(main)/` — protected routes with `AppHeader` + `BottomTabBar` shell (dashboard, resorts, alerts, profile, storm/[stormId], map)

Root `page.tsx` is a route guard: redirects to `/dashboard` if onboarded, `/onboarding/welcome` if not.

### API Proxy Layer

All API calls go through a server-side proxy to avoid CORS:

1. **Route Handler** (`src/app/backend/[...path]/route.ts`) — catch-all proxy at `/backend/*` that forwards requests to the external API. Supports GET, POST, PATCH, PUT, DELETE. Forwards auth and content-type headers.
2. **Client** (`src/lib/api/client.ts`) — `apiFetch<T>()` uses relative `/backend` base URL. Bearer token auth via `NEXT_PUBLIC_ONLYSNOW_API_KEY`. Structured error handling with `OnlySnowApiError`.
3. **Hooks** (`src/hooks/use-api.ts`) — `useApi()` (auto-fetch) and `useLazyApi()` (conditional fetch) wrapping the client with loading/error/data states. Endpoint-specific wrappers: `useRankedResorts()`, `useStorms()`, `useWorthKnowing()`, `useWeather()`, `useResortDetail()`, `useNotifications()`.
4. **Transforms** (`src/lib/api/transforms.ts`) — unit conversions (cm→in, C→F, kph→mph), pass/region mapping between API and POC types, verdict mapping (`goNoGoToVerdict()`).

The external API lives at `NEXT_PUBLIC_ONLYSNOW_API_URL` (defaults to `https://ski-ai-mu.vercel.app/api`). See `.env.local.example` for env template.

### State Management

- `UserContext` (`src/context/user-context.tsx`) — user profile + onboarding state, persisted to localStorage `"onlysnow_user"`. Syncs preferences to API once per session via sessionStorage flag.
- `AppContext` (`src/context/app-context.tsx`) — dismissed alerts, persisted to localStorage `"onlysnow_app"`
- Access via `useUser()` and `useApp()` hooks

### Scoring Algorithm (`src/lib/scoring.ts`)

**V1** (legacy, for mock data): `powder_score = (snowfall × 2) + (avgQuality × 1.5) - driveTimePenalty - crowdRisk`

**V2** (live API data): Adds wind penalty (auto-skip at 50mph gusts), temperature adjustment (+2 for ideal 20-28°F), terrain penalty (below 50% open), crowd multiplier (2x holiday, 1.4x weekend), and go/no-go API override. Hardcoded 2025-26 holiday dates.

Verdicts: ≥25 → "Go", ≥15 → "Maybe", <15 → "Skip"

### Component Organization

- `src/components/ui/` — base primitives (button, card, input, toggle, chip, select-card, verdict-badge, season-badge)
- `src/components/layout/` — app shell (header, bottom tabs, screen container)
- `src/components/dashboard/`, `alerts/`, `resorts/`, `storm/`, `profile/`, `map/` — screen-specific components
- `src/components/resorts/resort-detail/` — modular detail sections (conditions, forecast-chart, terrain, season, webcam)
- Interactive components use `"use client"` directive

### Static Data (`src/data/`)

Lookup tables with helper functions, used as fallbacks or supplements to API data:
- `resort-coordinates.ts` — lat/lon for map pins (`getResortCoordinates()`)
- `webcam-data.ts` — webcam page URLs and embed configs (`getWebcamInfo()`)
- `resort-websites.ts` — official resort website URLs (`getResortWebsiteUrl()`)
- Mock resorts, forecasts, storms, alerts, locations — legacy fallbacks being replaced by live API

### Design System

Dark theme with custom CSS variables defined in `src/app/globals.css`:
- Colors prefixed `--color-snow-*` (e.g., `snow-primary`, `snow-go`, `snow-maybe`, `snow-skip`, `snow-surface`)
- Use as Tailwind classes: `bg-snow-surface`, `text-snow-primary`, etc.
- Inter font via `next/font`
- Mobile-first with safe area inset support

## Key Types

Defined in `src/types/`:
- `user.ts` — `UserProfile`, `PassType`, `SkiPreference`, `DriveRadius`, `AlertSettings`
- `resort.ts` — `Resort`, `ResortForecast`, `ResortConditions`, `Region`
- `api.ts` — all API response/request types with `ApiMeta` metadata, error shapes, ranked/detail/storm/preferences/notifications contracts
- `storm.ts`, `alert.ts` — storm timeline and alert types

## Deployment

- Hosted on **Vercel** with GitHub git integration
- **Root Directory** must be set to `apps/poc-1` in Vercel project settings
- Pushes to `main` trigger production deployments
- Environment variables (`NEXT_PUBLIC_ONLYSNOW_API_URL`, `NEXT_PUBLIC_ONLYSNOW_API_KEY`) must be set in Vercel project settings

## Environment Setup

Copy `.env.local.example` to `.env.local` and fill in the API key. The app works without it using mock data fallbacks.

---

## Workflow & Task Governance

### Backlog-Driven Development

All work must originate from `apps/poc-1/backlog/`. New epics use the nested structure:

```
backlog/<epic-name>/
  README.md
  epic.yaml
  stories/
    story-1.md
    story-2.md
```

Rules:
- No implementation without a backlog story
- Each story must include acceptance criteria
- All progress must map to an epic
- Legacy flat-file epics (epic-0 through epic-8) remain as-is

### Branching

Each epic operates on its own branch: `epic/<epic-name>`
- Branch from main
- No shared branches between epics
- No direct commits to main
- Merge only after verification and review

### Execution Flow

1. Select epic from backlog
2. Create epic branch
3. Break epic into stories
4. Implement stories incrementally
5. Verify correctness
6. Review and merge
7. Update backlog status

### Plan Mode

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan
- Write detailed specs up front to reduce ambiguity
- Ensure plan maps to backlog stories

### Subagent Strategy

- Use subagents to keep main context clean
- Offload research and analysis
- Use parallel subagents for complex tasks
- One focused task per subagent
- Subagents should operate on individual backlog stories when possible

### Verification Before Done

Never mark work complete without proof:
- Diff behavior vs main branch
- Run `npm run build` and `npm run lint`
- Check for regressions
- Confirm acceptance criteria from the story
- Ask: "Would a staff engineer approve this?"

### Task Tracking

- Plan in `tasks/todo.md`
- Capture mistakes and prevention rules in `tasks/lessons.md`
- Review lessons at session start

### Self-Improvement

After corrections:
- Update `tasks/lessons.md` with the mistake pattern
- Write prevention rules
- Review lessons at the start of each session

### Code Comment Standards

Every new module must describe:
- Purpose
- Inputs/outputs
- Side effects
- Error behavior
