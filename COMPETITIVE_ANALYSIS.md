# OnlySnow Competitive Analysis

**Date:** February 15, 2026
**Author:** Product Analysis (Automated)
**App URL:** https://poc-1-xi.vercel.app
**Repo:** /Users/chrisnattress/git/only-snow-micro/

---

## a) Executive Summary

### What OnlySnow Is

OnlySnow is a mobile-first ski day decision engine that answers "Where should I ski today?" It replaces the manual workflow of checking multiple resort forecasts by ingesting weather data, user preferences (location, pass, drive radius), and resort conditions to produce **personalized Go/Maybe/Skip verdicts** with a proprietary powder score algorithm. Currently in POC stage with live API integration (Open-Meteo weather data via ski-ai-mu.vercel.app backend), supporting ~100+ US resorts.

### Competitive Position

OnlySnow occupies a **unique niche** between weather dashboards (OpenSnow) and static resort directories (OnTheSnow). No competitor currently delivers personalized, decision-layer recommendations that combine weather forecasts + pass filtering + drive time + crowd risk into a single verdict. This is genuinely differentiated.

### Top 5 Opportunities

1. **Decision fatigue gap** — No competitor answers "where should I ski?" They all answer "what's the weather?" OpenSnow's recent paywall backlash (451+ upvotes on r/skiing "Bye bye Open Snow") creates an opening for a free/freemium alternative with more intelligence.
2. **Pass-aware recommendations** — Epic/Ikon apps show their own resorts but don't cross-reference conditions. OnlySnow is pass-agnostic and can recommend across passes.
3. **"Worth the Drive" intelligence** — No competitor surfaces resorts outside your favorites that are having significantly better days. The OPENSNOW_VS_US.md analysis proves this is a real blind spot.
4. **Storm timeline visualization** — Showing *when* snow falls (not just totals) is a powerful differentiator that only meteorologist-grade tools provide.
5. **SkiDirectory.org synergy** — 455 resort listings with social/directory data can feed OnlySnow's resort database, giving instant comprehensive coverage.

### Top 5 Risks

1. **OpenSnow's incumbency** — $50-100/yr subscription, PEAKS proprietary model, embedded Daily Snow expert network, massive user base. Hard to out-forecast them.
2. **Data accuracy dependency** — Open-Meteo free tier may not match OpenSnow's PEAKS model accuracy. Skiers will abandon inaccurate forecasts immediately.
3. **No mobile app** — Competitors have native iOS/Android apps. A PWA/web app has inherent distribution disadvantages.
4. **No community/social features** — OnTheSnow, OpenSnow, and pass apps all have user reports, photos, and reviews. OnlySnow has zero UGC.
5. **Single-developer resource constraint** — Competing against VC-funded (OpenSnow/Outside Inc.) and corporate (Vail/Alterra) teams.

---

## b) OnlySnow POC Audit

### What Works

| Feature | Assessment |
|---------|------------|
| **Onboarding flow** | Excellent. 5-step (welcome → location → drive radius → pass → preferences) takes ~22 seconds. Clean, focused, no friction. Skip option available. |
| **Dark theme UI** | Polished, modern, ski-appropriate aesthetic. Custom `--color-snow-*` design tokens are well-implemented. |
| **Go/Maybe/Skip verdicts** | Core differentiator. Color-coded (green/amber/gray), immediately scannable. No competitor does this. |
| **Dashboard sections** | "Your Resorts" + "Worth the Drive" + "Getting Snow Elsewhere" is a brilliant 3-tier information architecture. |
| **Powder score algorithm** | `(totalSnowfall × 2) + (avgQuality × 1.5) - driveTimePenalty - crowdRisk`. Simple, transparent, tunable. ≥25=Go, ≥15=Maybe, <15=Skip. |
| **Live API integration** | Real weather data from Open-Meteo via backend. Ranked resorts endpoint with daily forecasts, go/no-go assessment, drive times. |
| **Pass filtering** | Epic, Ikon, Indy, Mountain Collective support. Pass badges on every resort row. |
| **Storm detail page** | Timeline visualization, resort comparison table, severity badges, road condition notes. |
| **Resort list** | Filterable by region, state, pass, proximity, snowfall threshold. Period switcher (Today/Weekend/5D/10D). Search. Browse by region with expandable sections. |
| **Sparkline forecasts** | 7-day mini charts on resort rows — great information density. |
| **Progressive profiling** | Deferred sections (Schedule, Travel tolerance, Crowd tolerance, Skill) surface post-onboarding to improve recommendations without front-loading complexity. |
| **Tech stack** | Next.js 16 + React 19 + Tailwind 4 — cutting edge. Fast builds, modern DX. |

### What's Missing

| Gap | Impact | Priority |
|-----|--------|----------|
| **No webcams** | High — skiers verify conditions visually. Every competitor has webcams. | P1 |
| **No user accounts/auth** | High — localStorage only. No cross-device sync, no cloud persistence. | P1 |
| **No push notifications** | High — powder alerts are mocked. Real-time alerting is table stakes. | P1 |
| **No resort detail pages** | Medium — tapping a resort doesn't open a detail view. Dead end. | P1 |
| **No historical data** | Medium — no season totals, no "vs average" comparisons. | P2 |
| **No road conditions** | Medium — placeholder text only. I-70/pass conditions are critical for CO skiers. | P2 |
| **No avalanche info** | Medium — backcountry skiers need this. CAIC/NWAC integration. | P2 |
| **No trip planning** | Medium — no multi-day planning, no lodging integration. | P3 |
| **No social/community** | Low-medium — no user reports, photos, or reviews. | P3 |
| **No lift ticket pricing** | Low — walk-up pricing exists in API types but not displayed. | P3 |
| **No crowd predictions** | Low — crowdRisk in algorithm is basic (acres < 1000). No real crowd data. | P3 |

### UX Assessment

**Score: 7.5/10**

Strengths: Clean, focused, fast. Information hierarchy is excellent (hero → your resorts → worth the drive → elsewhere). Mobile-first with safe area support. Loading skeletons. Error states with retry.

Weaknesses: No resort detail drill-down. Storm page hourly data is placeholder (bell curve generated from severity). No pull-to-refresh. Limited empty states. No map view. Search results are flat list with no grouping context.

### Scoring Algorithm Analysis

The powder score formula `(totalSnowfall × 2) + (avgQuality × 1.5) - driveTimePenalty - crowdRisk` is:

- **Good**: Simple, interpretable, tunable. Weights snowfall heavily (correct).
- **Missing**: No wind penalty, no temperature factor, no terrain-open percentage, no base depth consideration, no day-of-week crowd adjustment (weekend vs Tuesday).
- **API supplement**: The backend's `go_no_go` assessment adds Wind/Visibility/Temperature/Alerts factors that the client-side scoring doesn't incorporate.
- **Recommendation**: Merge client-side scoring with API go_no_go for a richer signal. Add weekend crowd multiplier.

---

## c) Competitor Matrix

| Name | Category | Pricing | Key Features | Data Sources | Mobile App | Community | UX (1-10) | Strengths | Weaknesses |
|------|----------|---------|-------------|-------------|-----------|-----------|-----------|-----------|------------|
| **OpenSnow** | Weather/Forecast | $50-100/yr (Base/Premium) | PEAKS model, 10-day forecasts, Daily Snow experts, 3D maps, webcams, powder alerts | Proprietary PEAKS, NOAA, ECMWF, resort-reported | iOS, Android | Daily Snow blogs, social sharing | 8 | Most accurate forecasts, expert analysis, trusted brand | Paywall backlash (2025), no decision engine, manual favorites, no pass-aware ranking |
| **OnTheSnow** | Resort Directory | Free (ad-supported) | Snow reports, webcams, user reviews, resort comparison, ski pass comparison | Resort-reported, user-submitted, weather APIs | iOS, Android | User reviews, firsthand reports, photo uploads | 5 | Comprehensive resort database, free, pass comparison content | Ad-heavy, outdated UX, inaccurate forecasts (per Reddit), owned by Outside Inc. |
| **ZRankings** | Resort Rankings | Free (ad-supported) | Resort rankings by snow quality, terrain, value. Powderfares (flight deals) | Proprietary algorithm, historical snowfall data | No | Minimal | 6 | Unique ranking methodology, trip planning angle, Powderfares tool | Static rankings (not real-time), limited to pre-trip planning, no conditions |
| **Epic Pass App** | Pass Ecosystem | Free (with Epic Pass) | Lift ticket, resort info, mountain status, friend tracking, EpicMix stats | Vail Resorts internal | iOS, Android | EpicMix social features | 6 | Integrated ticketing, vert tracking, friend location | Epic resorts only, poor forecasting, not a conditions tool |
| **Ikon Pass App** | Pass Ecosystem | Free (with Ikon Pass) | Resort access, trip planning, family tracking, Apple Watch | Alterra internal | iOS, Android | Limited | 6 | Travel planning integration, good resort info | Ikon resorts only, minimal weather data |
| **Powder Project** | Trail Maps | Free | Interactive 3D trail maps, user-generated trail data | OpenStreetMap, community-mapped | No (web) | Community trail mapping | 7 | Beautiful trail maps, open data ethos | No conditions/weather, narrow scope (maps only) |
| **Mountain-Forecast** | Weather | Free (ads) + premium | Detailed mountain weather forecasts, elevation-specific forecasts | GFS, ECMWF models | No (web) | None | 5 | Global coverage, elevation-specific data, free | Generic weather (not ski-specific), poor UX, ad-heavy |
| **SnoCountry** | Snow Reports | Free | Snow reports, conditions, webcams | Resort-reported | iOS (basic) | None | 3 | Basic report aggregation | Dated UX, limited features, declining relevance |
| **Skimap.org** | Trail Maps | Free | Largest collection of ski trail maps (scanned) | Community-contributed scans | No | Community uploads | 4 | Comprehensive historical trail map archive | Static images, no conditions, niche use case |
| **Liftopia/GetSkiTickets** | Ticketing | Free (marketplace) | Discount lift tickets, dynamic pricing | Resort partnerships | iOS, Android | Reviews | 5 | Ticket deals, price comparison | No conditions, no forecasts, transactional only |
| **SkiDirectory.org** | Directory (Ours) | Free | 455 resort listings, maps, pass filters, distance calculator, lost ski areas | Supabase DB, Wikipedia, Wikidata, Liftie | No | None | 6 | Comprehensive data model, multi-pass support, SEO-first | Static (no real-time conditions), no personalization, no weather |
| **Slopes App** | Tracking | Free + $30/yr | GPS ski tracking, speed, vert, route recording, social sharing | Device GPS | iOS, Android, Apple Watch | Social features, leaderboards | 8 | Best-in-class tracking, beautiful UX | On-mountain only (not planning), no conditions |
| **FATMAP/Strava** | Outdoor Maps | Free + subscription | 3D terrain maps, route planning, backcountry | Satellite, community | iOS, Android | Large community | 7 | Broad outdoor coverage, backcountry planning | Not ski-specific, acquired/sunset concerns |

---

## d) Feature Gap Analysis

### What Competitors Have That OnlySnow Doesn't

| Feature | Who Has It | User Value | Priority |
|---------|-----------|------------|----------|
| Webcams | OpenSnow, OnTheSnow, SnoCountry | **Critical** — visual verification of conditions | P1 |
| Push notifications (real) | OpenSnow, pass apps | **Critical** — timely powder alerts | P1 |
| Native mobile apps | OpenSnow, OnTheSnow, pass apps, Slopes | **High** — App Store distribution, offline | P2 |
| User accounts & cloud sync | All major competitors | **High** — cross-device, persistence | P1 |
| Resort detail pages | OnTheSnow, OpenSnow, ZRankings | **High** — deep resort info | P1 |
| Historical snowfall / season totals | OpenSnow, ZRankings | **Medium** — context for current conditions | P2 |
| User-submitted reports & photos | OnTheSnow, OpenSnow | **Medium** — crowdsourced ground truth | P3 |
| Avalanche danger ratings | Avalanche.org apps, OpenSnow | **Medium** — safety-critical for backcountry | P2 |
| Interactive trail maps | Powder Project, FATMAP | **Medium** — on-mountain navigation | P3 |
| Lift ticket deals/pricing | Liftopia, OnTheSnow | **Medium** — cost optimization | P3 |
| GPS ski tracking | Slopes, Epic/Ikon apps | **Low** — on-mountain, different use case | P4 |
| Expert-written forecasts | OpenSnow Daily Snow | **Low** — hard to replicate without staff | P4 |

### What OnlySnow Has That Competitors Don't

| Feature | Unique Value |
|---------|-------------|
| **Go/Maybe/Skip verdicts** | No competitor delivers actionable recommendations. All show data and leave interpretation to users. |
| **Powder score algorithm** | Quantified, transparent scoring that combines snowfall + quality + drive time + crowd risk. |
| **"Worth the Drive" section** | Proactively surfaces farther resorts when they have significantly more snow than local options. |
| **"Getting Snow Elsewhere"** | Shows non-followed resorts with better conditions, solving the blind spot problem. |
| **Pass-aware auto-population** | Automatically shows all resorts on your pass, ranked. OpenSnow requires manual favorites. |
| **Drive time as first-class citizen** | Drive time integrated into every ranking decision. OpenSnow doesn't show drive time at all. |
| **Progressive profiling** | Deferred personalization (schedule, travel tolerance, crowd sensitivity) improves recommendations over time without front-loading onboarding. |
| **Decision engine framing** | Product paradigm is decisions, not forecasts. Fundamentally different value proposition. |

---

## e) What OnlySnow Does Well

### Unique Advantages

1. **"Decisions, not forecasts"** — This is the correct product insight. As the OPENSNOW_VS_US.md analysis shows, OpenSnow requires 8 cognitive steps from data to decision. OnlySnow reduces this to 1 (look at the verdict).

2. **Auto-populated resort list from pass + location** — OpenSnow's manual favorites model means users miss resorts they don't follow. OnlySnow monitors ALL resorts on the user's pass and surfaces the best ones automatically.

3. **Three-tier dashboard architecture** — Hero (best resort) → Your Resorts (nearby ranked) → Worth the Drive (farther but significantly better) → Getting Snow Elsewhere (beyond your radius). This is a genuinely novel information hierarchy for ski conditions.

4. **Storm intelligence** — The storm detail page with timeline, resort comparison, and road conditions (even as placeholder) is a differentiated view that helps users plan around weather events, not just react to daily conditions.

5. **Modern tech stack** — Next.js 16 / React 19 / Tailwind 4 is genuinely cutting-edge. Most competitors run legacy codebases (OnTheSnow is particularly dated).

### Technical Moat

- **Powder score algorithm** is simple but extensible. Can incorporate more signals (wind, temp, terrain %, base depth) without architectural changes.
- **API architecture** supports ranked resorts by period (today/weekend/5d/10d), storms, notifications, worth-knowing — a rich backend surface area.
- **Pass-to-region mapping** with fallback handling means new API regions automatically get classified.

---

## f) What OnlySnow Should Add — Prioritized Roadmap

### P0 — Ship Before Public Launch

| Feature | Rationale | Effort |
|---------|-----------|--------|
| **User accounts (Supabase auth)** | Cross-device sync, cloud persistence, analytics | Medium |
| **Real push notifications** | Powder alerts are the #1 retention driver. Currently mocked. | Medium |
| **Resort detail pages** | Tapping a resort is a dead end. Need: weather, terrain, webcam embed, base depth, recent snowfall. | Medium |

### P1 — First Month Post-Launch

| Feature | Rationale | Effort |
|---------|-----------|--------|
| **Webcam integration** | Visual verification is critical. Embed resort webcam feeds or link to them. | Low |
| **Snow alerts (email + push)** | "8-12" tonight at Beaver Creek. Best skiing 8-11am tomorrow." | Medium |
| **Road conditions** | Integrate CDOT/UDOT APIs for I-70, canyon conditions. Critical for CO/UT users. | Medium |
| **Season totals / historical comparison** | "Vail has received 180" this season (85% of average)" adds context. | Low |
| **Map view** | Interactive map with resort pins colored by verdict. | Medium |

### P2 — Quarter 2

| Feature | Rationale | Effort |
|---------|-----------|--------|
| **Resort comparison** | Side-by-side comparison of 2-3 resorts (a la ZRankings) | Medium |
| **Avalanche info** | Link to CAIC/NWAC danger ratings per resort area | Low |
| **Weekend planner** | "This weekend: CB on Saturday (12"), Vail Sunday (6")" | Medium |
| **Crowd predictions** | Weekend vs midweek, holiday calendars, parking lot estimates | High |
| **Trip planning** | Multi-day ski trip planner with lodging links | High |

### P3 — Quarter 3+

| Feature | Rationale | Effort |
|---------|-----------|--------|
| **Social features** | User condition reports, photos, "I'm skiing here today" | High |
| **Lift ticket deals** | Aggregate pricing from Liftopia, resort sites | Medium |
| **Gear recommendations** | "Powder skis recommended" based on conditions | Low |
| **Native mobile app** | React Native or Capacitor wrapper for App Store distribution | High |
| **AI-powered recommendations** | Natural language: "Where should I ski this weekend if I want trees and powder?" | Medium |

---

## g) Market Positioning Strategy

### The Positioning

**OnlySnow is a ski decision engine. OpenSnow is a weather dashboard. OnTheSnow is a resort directory.**

Position as: **"The app that tells you where to ski"** — not "the app that shows you the weather."

### Niche to Own

**The "daily driver" for pass-holding day-trippers within driving distance of multiple resorts.**

This persona:
- Checks conditions every morning during ski season
- Holds Epic/Ikon/Indy pass
- Lives in CO Front Range, Wasatch, Tahoe, PNW, or Northeast corridor
- Has 3-10 resorts within driving distance
- Makes go/no-go decisions based on conditions
- Currently checks OpenSnow + resort website + Google Maps drive time manually

OnlySnow replaces that 3-app workflow with one screen.

### Positioning vs Competitors

| Competitor | Our Position |
|-----------|-------------|
| **OpenSnow** | "OpenSnow shows you the forecast. We tell you where to ski." Don't compete on forecast accuracy — compete on decision intelligence. |
| **OnTheSnow** | "OnTheSnow is a resort encyclopedia. We're your ski day copilot." Don't compete on content breadth — compete on personalization. |
| **Pass apps** | "Your pass app manages tickets. We find your best days." Complementary, not competitive. |
| **ZRankings** | "ZRankings helps plan ski trips. We help you decide today." Different time horizon. |

### Messaging Framework

- **Tagline**: "Know exactly where to ski — every day."
- **Value prop**: "Personalized Go/Maybe/Skip verdicts for every resort on your pass, every day."
- **Elevator pitch**: "OnlySnow is like having a powder-chasing friend who checks every resort's forecast, filters by your pass, calculates drive time, and texts you where to go."

---

## h) SkiDirectory.org Synergy

### Current SkiDirectory.org Assets

- **455 resort listings** across US and Canada
- **Multi-pass support**: Epic, Ikon, Indy, Mountain Collective, Powder Alliance, NY SKI3, RCR Rockies, L'EST GO
- **Resort detail data**: terrain stats, elevations, trail counts, acreage, coordinates
- **Interactive map** with color-coded pass pins
- **Distance calculator** from major cities
- **Lost ski areas** database
- **Supabase backend** with structured data model
- **SEO-optimized** with JSON-LD structured data

### How SkiDirectory Feeds OnlySnow

| SkiDirectory Asset | OnlySnow Use |
|-------------------|-------------|
| Resort coordinates (lat/lng) | Drive time calculation from user location |
| Pass affiliations | Pass-aware filtering and recommendations |
| Terrain stats (acres, trails, lifts, breakdown) | Crowd risk estimation, terrain matching to preferences |
| Elevation data (base, summit, vertical) | Snow quality prediction (higher = better powder preservation) |
| Lost ski areas | Historical context, "did you know?" engagement features |
| Resort social pages / links | Webcam and conditions page linking |
| City distance data | Pre-computed drive times for common origin cities |

### Integration Strategy

1. **Phase 1**: Import SkiDirectory's resort database as OnlySnow's master resort list. This immediately gives OnlySnow 455 resorts vs the current ~100.
2. **Phase 2**: Use SkiDirectory terrain/elevation data to improve the powder score algorithm (terrain-open %, vertical as snow quality proxy).
3. **Phase 3**: SkiDirectory becomes the SEO landing surface ("Vail Ski Resort" → SkiDirectory page → "Check today's conditions on OnlySnow" CTA).
4. **Phase 4**: Shared user accounts across both properties.

---

## i) Monetization Analysis

### How Competitors Monetize

| Competitor | Model | Revenue Drivers |
|-----------|-------|----------------|
| **OpenSnow** | Subscription ($50-100/yr) | PEAKS model access, 10-day forecasts, expert content |
| **OnTheSnow** | Advertising | Display ads, sponsored resort content (Outside Inc.) |
| **ZRankings** | Affiliate + Ads | Hotel/rental affiliate links, display ads, Powderfares |
| **Epic/Ikon Apps** | Pass sales | Apps drive pass purchases and resort visits |
| **Liftopia** | Transaction fee | Commission on discounted lift ticket sales |
| **Slopes** | Freemium ($30/yr) | Premium tracking features, detailed stats |

### Recommended Model for OnlySnow

**Freemium with premium alerts and planning tools.**

**Free tier:**
- Dashboard with Go/Maybe/Skip verdicts
- Resort list with basic filtering
- 3-day forecast window
- Single location

**Premium ($29-49/yr):**
- Real-time powder alerts (push + email)
- 10-day forecast window
- Storm tracking and timeline
- Multiple home locations
- "Worth the Drive" and "Getting Snow Elsewhere" sections
- Weekend planner
- Resort comparison tool
- Historical season data

**Why this works:**
- Lower price than OpenSnow ($50-100) creates a compelling alternative
- Free tier provides enough value for casual skiers to generate word-of-mouth
- Alert-driven premium is high-value (skiers will pay to not miss powder days)
- Pricing at $29-49 is "less than one lift ticket" — easy mental justification

**Future monetization:**
- Affiliate revenue from lodging/rental bookings
- Resort partnerships for featured placement (clearly labeled)
- Lift ticket marketplace commission
- B2B API access for resort marketing teams

---

## j) User Sentiment — What Skiers Actually Want

### From Reddit (High Signal)

**Pain points with existing tools:**

1. **OpenSnow paywall rage** (r/skiing, 451+ upvotes): "Even the current snow report (last 24hrs) is behind a pay firewall. You guys had a great thing, but…" — Users feel OpenSnow has moved too much behind the paywall. Significant opportunity for a free/freemium alternative.

2. **OnTheSnow inaccuracy** (r/icecoast, r/COsnow): "OnTheSnow is not good for forecasting or reports" and "the app On The Snow has been pretty unreliable this year." — OnTheSnow has lost trust on forecast accuracy.

3. **No decision layer anywhere** (r/snowboarding): When asked about favorite weather apps, users list 3-4 tools they cross-reference (OpenSnow + NOAA + resort site + Google Maps). Nobody has solved the "one app to rule them all" problem.

4. **Resort-reported numbers are untrustworthy**: Multiple threads about resorts inflating snowfall totals. Users want independent verification (webcams, SNOTEL data).

5. **Free alternatives desired**: Users frequently recommend NOAA point forecasts, Weather.gov, Carrot Weather as free alternatives to OpenSnow. Price sensitivity is real.

**What users want that doesn't exist:**

- "Just tell me which of my resorts is going to be best this weekend"
- Accurate forecasts without a $100/yr subscription
- Pass-filtered conditions in one view
- Drive time factored into recommendations
- Storm timing (when does it start/stop, not just totals)
- Weekend-specific forecasts (not just "next 5 days")

### Sentiment Summary

The market is primed for OnlySnow's value proposition. OpenSnow's aggressive paywall strategy in 2025 created measurable user frustration. OnTheSnow's accuracy issues eroded trust. The "decision engine" gap is clearly articulated by users even if they don't know to call it that.

---

## k) Tech Stack Comparison

| Aspect | OnlySnow | OpenSnow | OnTheSnow | Pass Apps |
|--------|---------|----------|-----------|-----------|
| **Framework** | Next.js 16 (App Router) | Unknown (likely native + web) | Legacy web + native | Native (Swift/Kotlin) |
| **Frontend** | React 19 | Native iOS/Android + Web | React (older) | Native |
| **Styling** | Tailwind CSS 4 | Custom | Mixed | Custom |
| **State** | React Context + localStorage | Cloud-synced accounts | Cloud-synced accounts | Cloud-synced accounts |
| **API** | REST (ski-ai-mu.vercel.app) | Proprietary internal | Multiple sources | Internal |
| **Weather Data** | Open-Meteo (free) | PEAKS proprietary model | Licensed feeds | Resort-reported |
| **Hosting** | Vercel | AWS/Custom | CDN + servers | Cloud (corporate) |
| **Auth** | None (localStorage) | Email/social login | Email/social login | Pass account SSO |
| **Offline** | None | Native caching | Basic | Full native |

**OnlySnow's tech advantages:**
- Next.js 16 / React 19 means latest React features (Server Components, Suspense) available when needed
- Tailwind 4 with design tokens enables rapid UI iteration
- Vercel deployment = zero-config CI/CD, edge functions, ISR
- TypeScript strict mode catches bugs early
- App Router file-based routing is developer-friendly

**OnlySnow's tech gaps:**
- No native app = no App Store presence, no offline, no push notifications
- localStorage-only state = no cross-device, fragile persistence
- No test framework installed = risky for regression
- Open-Meteo free tier may have accuracy/reliability limitations vs PEAKS

---

## l) Next Actions Checklist

### Immediate (This Week)

- [ ] **Add Supabase auth** — email + Google sign-in. Migrate localStorage user profile to cloud.
- [ ] **Build resort detail pages** — `/resorts/[slug]` with weather, terrain stats, forecast chart, conditions, webcam link.
- [ ] **Fix storm page placeholders** — hourly snowfall, drive times, and weather are all generated. Need real API data.

### Near-Term (Next 2 Weeks)

- [ ] **Implement real push notifications** — Supabase push or web push API. Powder alerts are the killer feature.
- [ ] **Add webcam links/embeds** — Even linking to resort webcam pages adds value.
- [ ] **Improve scoring algorithm** — Incorporate wind, temperature, terrain-open %, base depth from API.
- [ ] **Add map view** — Leaflet/Mapbox with resort pins colored by verdict.
- [ ] **Weekend planner** — "Best Saturday" and "Best Sunday" hero cards.

### Medium-Term (Next Month)

- [ ] **Import SkiDirectory.org data** — 455 resorts, pass affiliations, terrain stats.
- [ ] **Road conditions integration** — CDOT API for Colorado, UDOT for Utah.
- [ ] **Historical season data** — "X" this season vs Y" average.
- [ ] **Avalanche danger links** — CAIC/NWAC ratings per region.
- [ ] **Email alerts** — Weekly outlook + storm alerts.

### Longer-Term (Quarter)

- [ ] **Native mobile app** — Capacitor wrap or React Native rewrite for App Store distribution.
- [ ] **Resort comparison tool** — Side-by-side for 2-3 resorts.
- [ ] **Crowd prediction model** — Weekend/holiday calendar + parking data.
- [ ] **Premium subscription launch** — Paywall alerts, extended forecasts, multi-location.
- [ ] **Public launch & marketing** — Reddit posts, ski forum seeding, ProductHunt.

---

*This analysis is based on: full source code review of only-snow-micro repo, existing competitive research from only-snow/research/, SkiDirectory.org repo review, Brave web search results for ski app landscape and user sentiment, and Reddit thread analysis from r/skiing, r/COsnow, r/icecoast, r/snowboarding, r/UTsnow.*
