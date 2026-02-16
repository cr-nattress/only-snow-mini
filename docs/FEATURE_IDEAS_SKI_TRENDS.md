# OnlySnow Feature Ideas: Informed by 2025-26 Ski Industry Trends

**Created:** February 15, 2026
**Purpose:** Map emerging ski industry trends to actionable feature ideas for OnlySnow, prioritized by impact and feasibility given the current POC architecture.

---

## Executive Summary

The 2025-26 ski season is a stress-test for the industry: record-low western snowpack (59% of median in Colorado), a 20% visitor decline at Vail properties, pass prices climbing 6-7%, and an aging skier demographic. Meanwhile, AI-driven personalization, real-time condition data, backcountry growth, and climate adaptation are reshaping what skiers expect from their tools.

OnlySnow's core value proposition — a personalized powder score that tells you where to ski and when — is perfectly positioned at the intersection of these trends. The features below extend that core into areas where the industry is moving fastest.

---

## Trend 1: Climate-Aware Skiing

### The Trend
The 2025-26 season has made climate impact impossible to ignore. Colorado snowpack is at 59% of median. Ski seasons are projected to shrink 14-62 days by the 2050s. Resorts are investing in snowmaking, snow farming, and diversification, but skiers need better tools to navigate unpredictable conditions.

### Feature Ideas

#### 1.1 Snowpack Health Indicator
**What:** Display a statewide/regional snowpack percentage (vs. historical median) on the dashboard alongside resort-specific conditions. Pull from NOAA SNOTEL data.

**Why it matters:** The research shows skiers are already tracking this on Reddit (r/COsnow). Surfacing it in-app saves them the hunt and adds credibility to OnlySnow's recommendations.

**Integration point:** Dashboard hero section or a new "Season Health" card.

**Effort:** Medium — requires a new data source (NOAA SNOTEL API) but the display is straightforward.

#### 1.2 Snowmaking-Adjusted Conditions
**What:** Factor snowmaking capability into the powder score or display it as a badge. In low-snow years, resorts with strong snowmaking (Vail, Keystone, Copper) become disproportionately valuable.

**Why it matters:** The research shows skiers shift to groomer-dependent skiing in thin years. Current powder score doesn't account for snowmaking infrastructure.

**Integration point:** New field on Resort type, weight adjustment in `scoring.ts`.

**Effort:** Low-Medium — static data per resort, scoring formula adjustment.

#### 1.3 Historical Snow Comparison
**What:** Show "This season vs. average" as a percentage or graph per resort, similar to what OnTheSnow now offers. Helps users calibrate expectations.

**Why it matters:** The research shows multiple apps are adding this. It's becoming table stakes for condition reporting.

**Integration point:** Resort detail view or resort list card.

**Effort:** Medium — requires historical baseline data per resort.

#### 1.4 Season Trend Forecast
**What:** "March outlook" or "Rest of season" forecast card on the dashboard. When is the next big storm cycle expected? Is a late-season recovery likely?

**Why it matters:** Skiers in bad seasons are desperate for hope signals. The Colorado research shows people actively asking "should I cancel my trip or wait for March storms?"

**Integration point:** Dashboard secondary card or alerts feed.

**Effort:** High — requires seasonal-scale forecast data.

---

## Trend 2: Dynamic Pricing & Cost Optimization

### The Trend
Walk-up day tickets now exceed $300 at major resorts. Dynamic pricing has expanded from 5 to 15+ resorts in Europe and is standard at all Vail properties. The Indy Pass sold out entirely, signaling demand for affordable alternatives. Vail is extracting more revenue per visit while serving fewer visitors.

### Feature Ideas

#### 2.1 Cost-Per-Powder-Day Score
**What:** Combine the powder score with ticket cost data to show a "value" metric. Factor in pass coverage — if a resort is on your pass, effective ticket cost is $0.

**Why it matters:** Pass holders already get this implicitly (OnlySnow filters by pass). But for mixed-pass days or non-pass resorts, showing the cost angle adds significant decision value.

**Integration point:** New computed field alongside powder_score. Display as secondary badge or sort option on resort list.

**Effort:** Medium — requires ticket price data per resort (could start with static averages).

#### 2.2 "On Your Pass" Priority
**What:** More prominently surface pass-matched resorts. Add a "Best on your pass" section to the dashboard, separate from pure powder ranking.

**Why it matters:** With pass prices up 6-7%, users want to maximize pass value. The current pass filter exists in the resort list but isn't surfaced on the dashboard.

**Integration point:** Dashboard — new section between "Your Resorts" and "Worth the Drive."

**Effort:** Low — data already exists in user profile, just a presentation change.

#### 2.3 Indy Pass Integration
**What:** Add Indy Pass as a first-class pass type with its 270+ independent resort network. The current pass selection includes major passes but Indy Pass's sell-out signals growing relevance.

**Why it matters:** The Indy Pass sold out for 2025-26. Its users are a growing, engaged segment who specifically avoid overcrowded mega-resorts — a perfect fit for OnlySnow's recommendation engine.

**Integration point:** `PassType` in user types, resort metadata, pass filter.

**Effort:** Low — schema change + data entry for Indy Pass resort affiliations.

#### 2.4 Dynamic Pricing Alerts
**What:** When a resort drops its day-ticket price (weather-based pricing on bad days), notify users. "Breckenridge just dropped to $189 — and there's 4 inches expected tonight."

**Why it matters:** European resorts like Pizol and Belalp already offer worse-weather = cheaper-ticket pricing. As this expands to the U.S., it creates arbitrage opportunities for savvy skiers.

**Integration point:** Alerts system, would need pricing API or scraping.

**Effort:** High — dynamic pricing data is hard to source programmatically.

---

## Trend 3: Crowd Intelligence

### The Trend
Overcrowding is the #1 consumer complaint in the post-pass-consolidation era. Resorts are using AI for crowd management. Machine learning models trained on historical data are predicting crowd movements. Weekend road congestion (e.g., I-70 corridor) is a top frustration.

### Feature Ideas

#### 3.1 Crowd Prediction Score
**What:** Add a crowd estimate (low / moderate / high / extreme) per resort per day based on: day of week, holidays, recent snowfall (powder days draw crowds), pass type distribution, historical patterns.

**Why it matters:** The user's "Avoid crowds" preference already exists but isn't connected to real crowd data. The scoring algorithm has a crude `crowdRisk` based on resort acreage. This replaces that with an actual signal.

**Integration point:** Replace static `crowdRisk` in `scoring.ts` with dynamic crowd score. Display on resort cards.

**Effort:** Medium-High — requires crowd modeling or third-party data. Could start with heuristic (weekend + powder day + holiday = extreme).

#### 3.2 I-70 / Road Corridor Status
**What:** For Colorado-specific users, show real-time I-70 corridor conditions and estimated drive times vs. typical. Extend to other major ski corridors (Wasatch for Utah, I-90 for WA/Cascades).

**Why it matters:** The research highlights road congestion as a primary pain point alongside crowding. Drive time is already in the powder score but uses static estimates.

**Integration point:** Dashboard hero card or resort detail. Would enhance drive time accuracy.

**Effort:** Medium — CDOT and state DOT APIs exist for real-time traffic.

#### 3.3 "Beat the Crowd" Timing
**What:** Suggest optimal departure times to avoid traffic and arrive before lift lines build. "Leave by 5:30 AM to ski first chair at Vail with minimal I-70 traffic."

**Why it matters:** The "best window" concept already exists for storms. Extending it to crowd avoidance aligns with the app's core decision-support mission.

**Integration point:** Storm detail or daily resort recommendation.

**Effort:** Medium — combines traffic data with resort opening times.

#### 3.4 Quiet Resort Finder
**What:** Dedicated view or filter that surfaces less-known resorts with good conditions and low crowds. "Hidden gems" based on powder score minus crowd penalty.

**Why it matters:** The Indy Pass sell-out and backcountry growth both signal demand for uncrowded experiences. OnlySnow has the data to recommend lesser-known alternatives.

**Integration point:** Resort list filter mode or dashboard card.

**Effort:** Low — scoring adjustment + UI presentation of existing data.

---

## Trend 4: AI-Powered Personalization

### The Trend
Vail's EpicMix uses AI to analyze RFID data for personalized recommendations. Resorts deploy AI chatbots. Custom gear configurators match equipment to skier profiles. The competitive moat is shifting from data availability to data interpretation.

### Feature Ideas

#### 4.1 Learning Recommendation Engine
**What:** Track which resorts users actually visit (via check-in or GPS) and which recommendations they follow vs. ignore. Use this feedback loop to improve personal rankings over time.

**Why it matters:** The current powder score is the same formula for everyone (with preference weighting). Learning from behavior makes it personal. "You always pick Keystone over Breck when they're close — adjusting your rankings."

**Integration point:** New feedback data model, enhanced `scoring.ts` with per-user weights.

**Effort:** High — requires visit tracking and ML-style weighting.

#### 4.2 Deferred Profile → Smarter Scores
**What:** Connect the existing deferred profile fields (schedule, travel tolerance, crowd sensitivity, skill level) to the scoring algorithm. These fields are already collected in the profile page but don't influence recommendations.

**Why it matters:** The profile page already collects "usual ski days", "early wake-up willingness", "storm driving comfort", "lift line sensitivity", and "skill level" — none of which currently affect the powder score. This is low-hanging fruit.

**Integration point:** `scoring.ts` adjustments based on `deferred_profile` fields. E.g., high storm-driving comfort = lower drive penalty in storms.

**Effort:** Low-Medium — data already collected, needs scoring formula integration.

#### 4.3 Natural Language Trip Intent
**What:** "I have a free day Thursday and want to avoid crowds" → personalized recommendation. A conversational interface layered on top of the existing scoring engine.

**Why it matters:** AI chatbots are proliferating in the resort space. A lightweight version focused on ski day decisions would differentiate OnlySnow from condition-reporting apps.

**Integration point:** New screen or modal with LLM integration.

**Effort:** High — requires LLM integration, prompt engineering, and UI work.

#### 4.4 Ski Style Matching
**What:** Based on selected preferences (powder, trees, steeps, park, groomers), weight resort recommendations by terrain composition. A resort with 40% expert terrain ranks higher for "steeps" preference than one with 10%.

**Why it matters:** Preferences are collected but currently only used for coarse filtering. Terrain composition data per resort would make recommendations meaningfully different between a tree-skiing enthusiast and a groomer fan.

**Integration point:** Resort metadata expansion + preference-weighted scoring.

**Effort:** Medium — requires terrain breakdown data per resort.

---

## Trend 5: Backcountry & Safety

### The Trend
Backcountry skiing is growing at 7% annually (market ~$500M). Social media is luring inexperienced skiers out of bounds — rescue missions at Stowe have tripled in 5 years. Avalanche safety tech is advancing (onX tripled ATES coverage, improved transceivers, lighter airbags). The avalanche safety gear market is $1.48B and growing 5-7% annually.

### Feature Ideas

#### 5.1 Avalanche Danger Overlay
**What:** Display current avalanche danger ratings (from regional avalanche centers like CAIC) alongside resort conditions. Especially relevant for resorts near backcountry access points.

**Why it matters:** Backcountry-interested users (those who select "Storm skiing" or skill level "Backcountry") need this integrated into their decision flow, not in a separate app.

**Integration point:** Resort detail view, conditionally shown for backcountry-tagged users. Data from avalanche.org API.

**Effort:** Medium — avalanche center APIs exist but need integration.

#### 5.2 Sidecountry/Backcountry Condition Flags
**What:** For resorts with known sidecountry gates or backcountry access, show conditions specific to those zones: avy danger, recent wind loading, snowpack stability notes.

**Why it matters:** The fastest-growing segment of skiing intersects directly with safety. OnlySnow can be the bridge between resort recommendations and backcountry safety awareness.

**Integration point:** Resort detail expansion or new "Backcountry" tab.

**Effort:** High — specialized data sources, liability considerations.

#### 5.3 Safety Gear Checklist
**What:** Before heading to a resort with backcountry access, prompt the user with a safety checklist: beacon, probe, shovel, partner plan, avalanche forecast check.

**Why it matters:** Social media is driving unprepared skiers into avalanche terrain. A simple checklist integrated into the "heading out" flow could save lives and differentiates OnlySnow as a responsible app.

**Integration point:** Push notification or pre-trip screen, triggered by backcountry preference + storm conditions.

**Effort:** Low — static content triggered by user profile + conditions.

---

## Trend 6: Gear & Conditions Intelligence

### The Trend
Ski shops are seeing sales impacted by warm winters. Layering systems are the dominant gear conversation. Community members are recommending "sacrificial skis" for rocky thin-coverage days. Rental/sharing platforms like Pickle saw 635% growth.

### Feature Ideas

#### 6.1 Gear Recommendations by Conditions
**What:** Based on today's conditions at the recommended resort, suggest gear adjustments: "Hardpack expected at Breck — bring freshly tuned edges" or "Powder day at Steamboat — consider wider skis if you have them."

**Why it matters:** The Colorado research shows this is exactly what skiers discuss on Reddit and social media. Integrating it into the recommendation flow makes OnlySnow a complete ski-day decision tool, not just a destination picker.

**Integration point:** Dashboard hero card or resort detail — a small "Gear tip" section based on conditions.

**Effort:** Low — rule-based system mapping conditions (snow quality, temperature, wind) to gear tips.

#### 6.2 Layer Recommendation by Temperature
**What:** Show a layering suggestion based on forecasted temperature and wind chill at the resort. "Base + mid + shell. Expect -5F wind chill on exposed ridges. Bring hand warmers."

**Why it matters:** Multiple community sources in the research emphasize that layering is the #1 gear question. Temperature data is already in the forecast.

**Integration point:** Resort detail or daily recommendation card.

**Effort:** Low — temperature thresholds mapped to layering guidance. Static content, dynamic trigger.

#### 6.3 "Rock Board Day" Warning
**What:** When snowpack is thin and rock exposure is likely, flag it. "Thin coverage reported — consider sacrificial skis or stick to groomed runs."

**Why it matters:** Protecting good equipment is a real concern in low-snow seasons. The research shows dedicated skiers on r/COsnow actively discuss this.

**Integration point:** Resort condition card, triggered by low base depth or thin-coverage reports.

**Effort:** Low — threshold-based alert on base depth data.

---

## Trend 7: Social & Community Features

### The Trend
The median skier age has risen from 30 to 37. Gen Z participation is declining per visit. Social media drives both discovery and dangerous behavior. Resorts are leveraging influencer marketing and user-generated content. The apres-ski segment is growing at 11.3% CAGR.

### Feature Ideas

#### 7.1 Community Condition Reports
**What:** Allow users to submit quick condition reports after skiing: "Powder was tracked out by 10 AM" or "Groomers in great shape all day." Aggregate into a real-time conditions layer.

**Why it matters:** Reddit (r/COsnow) is currently the primary source for real-time skier-reported conditions. Building this into OnlySnow captures that value in a structured, searchable format.

**Integration point:** Post-ski prompt or resort detail page with recent reports.

**Effort:** High — requires user accounts (Supabase), moderation, UX for reporting.

#### 7.2 Ski Buddy Matching
**What:** Connect users heading to the same resort on the same day. "3 other OnlySnow users are heading to Keystone Thursday."

**Why it matters:** Skiing is social. Solo skiers or those new to an area would value finding partners, especially for backcountry where a partner is a safety requirement.

**Integration point:** Dashboard or resort detail.

**Effort:** High — requires user accounts, privacy controls, matching logic.

#### 7.3 Trip Sharing
**What:** Share your ski day plan ("Going to Telluride Saturday — 84% open, 6 inches expected") as a formatted card to iMessage, Instagram Stories, etc.

**Why it matters:** Organic sharing drives growth. A well-designed share card becomes free marketing while giving users social currency.

**Integration point:** Share button on dashboard hero or resort detail.

**Effort:** Low-Medium — share API integration + card template design.

#### 7.4 Apres-Ski Recommendations
**What:** Suggest food, drink, and activity options near recommended resorts. "Best apres at Vail: The George, 10th Mountain Whiskey Bar."

**Why it matters:** The apres-ski segment is growing at 11.3% CAGR. Ski days are becoming holistic experiences. This also opens monetization opportunities (local business partnerships).

**Integration point:** Resort detail expansion.

**Effort:** Medium — requires venue data sourcing. Could start with curated static content per resort.

---

## Trend 8: Real-Time Data Enhancement

### The Trend
Apps are becoming "intelligent companions" with AI-driven performance tracking, route planning, and weather warnings. NOAA integration is becoming standard. The competitive moat is shifting from data availability to data interpretation — exactly where OnlySnow's powder score sits.

### Feature Ideas

#### 8.1 Webcam Integration
**What:** Embed resort webcams in the resort detail view. Let users visually verify conditions before committing to a drive.

**Why it matters:** Webcams are the ultimate "trust but verify" tool. OnTheSnow and most resort sites offer them. Embedding them in OnlySnow keeps users in-app.

**Integration point:** Resort detail page.

**Effort:** Medium — webcam URL sourcing per resort, embed integration.

#### 8.2 Live Lift Status
**What:** Show which lifts are open/closed and any hold status. Especially valuable during storms when wind holds are common.

**Why it matters:** The research shows Slopes connects to resort databases for live lift status. This data directly affects the quality of a ski day, particularly in marginal conditions.

**Integration point:** Resort detail page.

**Effort:** High — requires resort-level data feeds (no universal API).

#### 8.3 Precipitation Radar Overlay
**What:** Show a radar/precipitation map centered on the user's region with mountain snowfall highlighting. OpenSnow's radar map is cited as a key feature.

**Why it matters:** Seeing where snow is falling right now is viscerally compelling and builds trust in forecasts.

**Integration point:** New "Radar" tab in bottom nav or dashboard map view.

**Effort:** Medium-High — requires weather radar API integration and map rendering.

#### 8.4 Multi-Day Trip Planner
**What:** For a 3-day ski weekend, recommend a different resort each day based on evolving storm timing. "Friday: Keystone (storm arriving PM). Saturday: Vail (peak accumulation). Sunday: Breck (clearing, bluebird)."

**Why it matters:** Multi-day optimization is where OnlySnow's powder score + storm tracking + drive time data creates unique value no other app offers.

**Integration point:** New "Plan a Trip" screen or dashboard mode toggle.

**Effort:** High — multi-day optimization algorithm, new UI flow.

---

## Priority Matrix

Sorted by impact/effort ratio, considering the current POC state:

### Quick Wins (Low Effort, High Impact)
| # | Feature | Trend | Effort |
|---|---------|-------|--------|
| 2.2 | "On Your Pass" dashboard section | Pricing | Low |
| 2.3 | Indy Pass integration | Pricing | Low |
| 4.2 | Deferred profile → scoring | Personalization | Low-Med |
| 6.1 | Gear tips by conditions | Gear | Low |
| 6.2 | Layer recommendation by temp | Gear | Low |
| 6.3 | "Rock board day" warning | Gear | Low |
| 5.3 | Safety gear checklist | Backcountry | Low |
| 3.4 | Quiet resort finder | Crowds | Low |

### High-Value Investments (Medium Effort, High Impact)
| # | Feature | Trend | Effort |
|---|---------|-------|--------|
| 1.1 | Snowpack health indicator | Climate | Medium |
| 1.2 | Snowmaking-adjusted scoring | Climate | Low-Med |
| 1.3 | Historical snow comparison | Climate | Medium |
| 2.1 | Cost-per-powder-day score | Pricing | Medium |
| 3.1 | Crowd prediction score | Crowds | Med-High |
| 3.2 | Road corridor status (I-70) | Crowds | Medium |
| 4.4 | Ski style terrain matching | Personalization | Medium |
| 5.1 | Avalanche danger overlay | Backcountry | Medium |
| 7.3 | Trip sharing cards | Social | Low-Med |
| 8.1 | Webcam integration | Real-time | Medium |

### Strategic Bets (High Effort, Potentially Transformative)
| # | Feature | Trend | Effort |
|---|---------|-------|--------|
| 3.3 | "Beat the crowd" timing | Crowds | Medium |
| 4.1 | Learning recommendation engine | Personalization | High |
| 4.3 | Natural language trip intent | Personalization | High |
| 7.1 | Community condition reports | Social | High |
| 8.3 | Precipitation radar overlay | Real-time | Med-High |
| 8.4 | Multi-day trip planner | Real-time | High |

---

## Recommended Phase 1 (Next Sprint)

Based on the current POC state and the 2025-26 season context, these features would deliver the most value with the least disruption:

1. **Deferred profile → scoring** (4.2) — Data is already collected. Wire it to the algorithm.
2. **"On Your Pass" dashboard section** (2.2) — Data exists. Pure presentation win.
3. **Gear tips by conditions** (6.1) — Low effort, high perceived value, unique differentiator.
4. **Layer recommendation by temp** (6.2) — Complements gear tips with actionable advice.
5. **Snowpack health indicator** (1.1) — Timely given the historic low season. Sets OnlySnow apart as climate-aware.

These five features combined require no new data sources (except SNOTEL for 1.1), no new authentication systems, and no architectural changes. They extend the existing recommendation engine into a more complete ski-day decision tool.

---

## Key Takeaway

The ski industry is fragmenting into two needs:

1. **Where should I ski?** (conditions, crowds, cost) — OnlySnow's current strength.
2. **How should I ski?** (gear, safety, timing, experience) — The expansion opportunity.

Every feature above extends OnlySnow from answering question #1 to also answering question #2. The apps that win in 2026 won't just report snow totals — they'll be the complete decision engine for your ski day, from "should I go?" to "what should I bring?" to "when should I leave?" That's the vision these features build toward.

---

*Sources: Industry data from NSAA, NPR/WBUR, Denver Post, Bloomberg, SnowBrains, Skift, NOAA, Protect Our Winters, Euronews, and community research from r/COsnow, r/skiing, and X/Twitter ski community. Full citations available in the research brief.*
