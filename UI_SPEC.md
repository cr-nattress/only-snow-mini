# OnlySnow — UI Specification for Mock POC Generation

## Product Summary

OnlySnow answers one question: **"Where and when should I ski next?"**

It replaces the manual workflow of checking multiple resort forecasts, comparing snowfall, and mentally weighing travel tradeoffs. The app ingests weather data, user preferences, and location to produce personalized ski-day recommendations.

**Core value proposition:** Decisions, not forecasts.

---

## Target User Profile

- Lives within driving distance of multiple ski resorts
- Checks snow conditions regularly (daily during season)
- Willing to adjust plans based on conditions
- Holds a season pass (Epic, Ikon, Indy, etc.)
- Primarily mobile user

---

## Decision Engine (Drives All UI)

Every screen reflects the underlying scoring model:

```
Powder Score = snowfall_amount + snow_quality + timing - travel_time - crowd_risk
```

**Inputs:**
| Input | Source |
|---|---|
| User location | Onboarding / GPS |
| Pass access | Onboarding |
| Drive radius | Onboarding |
| Favorite resorts | Onboarding + usage |
| Weather forecasts | API (external) |
| Resort crowd data | API (external) |
| Ski style preferences | Onboarding |

**Outputs:**
| Output | Where Shown |
|---|---|
| Best resort today | Dashboard |
| Best resort tomorrow | Dashboard |
| Best powder window (time) | Dashboard / Alert |
| Travel recommendation | Dashboard / Alert |
| Storm timeline | Storm Detail Screen |

---

## Screen Specifications

### Screen 1: Welcome

**Purpose:** Set expectations and start onboarding fast.

| Element | Detail |
|---|---|
| Headline | "Know exactly where to ski — every day." |
| Subtext | "Tell us a few things and we'll find your best ski days." |
| Primary CTA | "Continue" button (full width) |
| Secondary actions | "Sign in" link, "Skip personalization" link |
| Progress indicator | Step 1 of 5 (dot row: filled/empty) |
| Background | Mountain/snow imagery, subtle, not distracting |

**Layout:** Centered content, vertically stacked. Logo at top. CTAs pinned to bottom safe area.

**Design notes:**
- No form fields on this screen
- Should load instantly with no spinner
- "Skip personalization" uses sensible defaults (nearest resorts, no pass filter, 1hr radius)

---

### Screen 2: Location Input

**Purpose:** Determine user's home base to calculate resort distances.

| Element | Detail |
|---|---|
| Headline | "Where do you usually start your ski trips?" |
| Input field | Text input with autocomplete (city name or ZIP code) |
| Quick action | "Use current location" button with GPS icon |
| Helper text | "Used to find resorts within driving distance." |
| Primary CTA | "Continue" button |
| Progress indicator | Step 2 of 5 |

**Layout:** Headline top, input centered, GPS button below input, CTA pinned bottom.

**Behavior:**
- Autocomplete dropdown appears after 2 characters typed
- GPS button triggers location permission prompt
- On selection, briefly show resolved city name with checkmark
- Input validates against known US/Canada ski regions

**Data captured:** `{ home_location: { lat, lng, display_name } }`

---

### Screen 3: Drive Radius

**Purpose:** Set the travel threshold that governs which resorts appear.

| Element | Detail |
|---|---|
| Headline | "How far will you drive for skiing?" |
| Selection | 5 tappable cards, single-select, vertically stacked |
| Card 1 | "30–45 min" — icon: short road |
| Card 2 | "1 hour" — icon: medium road |
| Card 3 | "2 hours" — icon: longer road |
| Card 4 | "3+ hours" — icon: highway |
| Card 5 | "I'll fly for powder" — icon: airplane |
| Helper text | "You can change this anytime." |
| Primary CTA | "Continue" button |
| Progress indicator | Step 3 of 5 |

**Layout:** Headline top, cards stacked vertically with equal spacing, CTA pinned bottom.

**Behavior:**
- Only one card selectable at a time
- Selected card shows highlight border + checkmark
- Pre-select "1 hour" as default if user taps Continue without selecting

**Data captured:** `{ max_drive_minutes: 45 | 60 | 120 | 180 | "fly" }`

---

### Screen 4: Pass Selection

**Purpose:** Filter resorts to only those accessible with the user's pass.

| Element | Detail |
|---|---|
| Headline | "Which pass are you skiing this season?" |
| Selection | Multi-select list with pass logos |
| Option 1 | Epic Pass (logo) |
| Option 2 | Ikon Pass (logo) |
| Option 3 | Indy Pass (logo) |
| Option 4 | Mountain Collective (logo) |
| Option 5 | Resort-specific season pass (text input to specify) |
| Option 6 | No pass / buy day tickets |
| Helper text | "Select all that apply." |
| Primary CTA | "Continue" button |
| Progress indicator | Step 4 of 5 |

**Layout:** Headline top, options as tappable rows with logos left-aligned and checkboxes right-aligned, CTA pinned bottom.

**Behavior:**
- Multi-select allowed (user may hold Epic + Indy)
- "Resort-specific" expands a text input for resort name
- "No pass" deselects all others when tapped
- Pass logos sourced as static assets

**Data captured:** `{ passes: ["epic", "ikon", ...], specific_resort_pass: "Eldora" | null }`

---

### Screen 5: Ski Preferences

**Purpose:** Understand what conditions excite the user to weight the recommendation algorithm.

| Element | Detail |
|---|---|
| Headline | "What conditions get you excited?" |
| Selection | Multi-select chip/tag grid |
| Chip options | Powder days, Groomers, Trees, Steeps, Park, Avoid crowds, Close & easy, Storm skiing, Bluebird days |
| Helper text | "Pick as many as you want." |
| Primary CTA | "Show My Resorts" (distinct from previous "Continue" — signals transition to value) |
| Progress indicator | Step 5 of 5 |

**Layout:** Headline top, chips in a wrapping grid (2-3 per row depending on width), CTA pinned bottom.

**Behavior:**
- Chips toggle on/off independently
- Selected chips filled with accent color, unselected outlined
- At least 1 chip recommended but not required
- If no chips selected, default to "Powder days" + "Close & easy"

**Data captured:** `{ preferences: ["powder", "trees", "avoid_crowds", ...] }`

---

### Screen 6: Dashboard (Post-Onboarding — Primary Screen)

**Purpose:** Deliver the core value — tell the user where and when to ski.

This is the screen users see every time they open the app. It must answer the question immediately.

#### Section A: Hero Recommendation Card

| Element | Detail |
|---|---|
| Card headline | Resort name (e.g., "Beaver Creek") |
| Snowfall badge | "9\" arriving tonight" |
| Timing line | "Snow ends 7:30am — best skiing 8–11am" |
| Travel line | "20 min from you" |
| Verdict badge | "Ski tomorrow morning" (green highlight) |
| Action button | "View Details" |

**Design notes:**
- This card is the single most important UI element in the app
- Large type for resort name and verdict
- Snowfall number should be visually dominant
- Green/blue/yellow color coding for verdict confidence (go / maybe / skip)

#### Section B: Upcoming Conditions List

Scrollable list below hero card showing the next 3–5 days:

| Per row | Detail |
|---|---|
| Date | "Wed Feb 18" |
| Best resort | Resort name |
| Snowfall summary | "4–6\" overnight" |
| Verdict chip | "Good" / "Great" / "Skip" |

**Behavior:**
- Tapping a row opens the Storm Detail screen for that date
- Rows sorted by powder score descending
- "Skip" days shown dimmed but not hidden

#### Section C: Quick Access Bar (Bottom)

| Tab | Icon | Destination |
|---|---|---|
| Home | House | Dashboard (current) |
| Resorts | Mountain | Resort List Screen |
| Alerts | Bell | Alert Settings Screen |
| Profile | Person | Profile / Settings Screen |

---

### Screen 7: Storm Detail

**Purpose:** Deep dive into a specific storm/day for users who want more data.

| Element | Detail |
|---|---|
| Storm headline | "Winter Storm — Feb 18–19" |
| Timeline visualization | Horizontal bar showing snowfall by hour (when it starts, peaks, ends) |
| Resort comparison table | Rows: resort name, expected snowfall, drive time, powder score |
| Best window callout | "Peak conditions: Wed 8am–12pm at Beaver Creek" |
| Road conditions note | "I-70 chains likely after 9pm Tue" |
| Action | "Set Alert for This Storm" button |

**Design notes:**
- Timeline is the key differentiator — shows *when* snow falls, not just totals
- Resort comparison sorted by powder score
- Color-code snowfall intensity on timeline (light/moderate/heavy)

---

### Screen 8: Resort List

**Purpose:** Browse all accessible resorts ranked by current conditions.

| Per resort row | Detail |
|---|---|
| Resort name | "Beaver Creek" |
| Pass badge | "Epic" (if covered by user's pass) |
| Drive time | "20 min" |
| 48hr snowfall | "9\"" |
| 5-day forecast mini | Tiny bar chart or sparkline |
| Powder score | Numerical or color indicator |

**Behavior:**
- Sorted by powder score by default
- Filter toggles: "My pass only", "Under 1hr", "6\"+ expected"
- Tapping a resort opens a resort detail view
- Pull-to-refresh updates forecasts

---

### Screen 9: Powder Alert

**Purpose:** Push notification and in-app alert when conditions match user preferences.

#### Push Notification Format
```
OnlySnow: 8–12" tonight at Beaver Creek
Snow ends 7:30am. Best skiing tomorrow 8–11am.
```

#### In-App Alert Card
| Element | Detail |
|---|---|
| Alert type badge | "Powder Alert" (red/orange) |
| Resort name | "Beaver Creek" |
| Snowfall | "8–12\" expected tonight" |
| Timing | "Snow ends 7:30am" |
| Best window | "8–11am tomorrow" |
| Travel | "20 min drive" |
| Actions | "View Storm" / "Dismiss" |

---

### Screen 10: Alert Settings

**Purpose:** Control when and how notifications fire.

| Setting | Options |
|---|---|
| Alert frequency | Big storms only / Any snow / Weekly outlook / Off |
| Alert timing | Night before / Early morning (5am) / Both |
| Minimum snowfall trigger | Any / 3"+ / 6"+ / 12"+ |
| Alert resorts | All in radius / Favorites only / Pass resorts only |

---

### Screen 11: Profile & Settings

**Purpose:** Edit onboarding data and app preferences.

| Section | Editable fields |
|---|---|
| Location | Home location, drive radius |
| Passes | Pass selection |
| Preferences | Ski style chips |
| Schedule (deferred) | Weekday/weekend, flexibility, remote worker toggle |
| Travel tolerance (deferred) | Early morning willingness, night driving, storm driving comfort |
| Crowd tolerance (deferred) | Drive farther to avoid crowds, lift line sensitivity, small resort preference |
| Skill level (deferred) | Beginner / Intermediate / Advanced / Expert / Backcountry |
| Account | Email, notifications, data export, delete account |

**Design notes:**
- Sections marked "deferred" are collected post-onboarding through progressive profiling
- Each deferred section shows as a collapsed card with "Improve your recommendations" prompt
- Completing deferred sections visibly improves recommendation quality

---

## Deferred Personalization Questions (Post-Onboarding)

These questions are NOT asked during onboarding. They surface contextually after the user has received value.

### Scheduling
- Which days do you usually ski? (Weekends / Weekdays / Flexible)
- Can you ski mid-week powder days?
- Do you work remotely and ski mornings?

### Travel Tolerance
- Will you wake up early to catch a storm?
- Will you drive late at night for powder?
- Do you avoid mountain passes in storms?
- Do you prefer safe/easy drives or best snow?

### Crowd Tolerance
- Would you drive farther to avoid crowds?
- Do lift lines ruin a powder day?
- Do you prefer smaller resorts?

### Trip Planning (Future Feature)
- Do you take destination ski trips?
- How many ski trips per season?
- Typical trip length?
- Preferred regions?

---

## Design System Guidelines

### Typography
- Headlines: Bold, large (24–32pt mobile)
- Body: Regular, readable (16pt mobile)
- Data values (snowfall, temps): Semi-bold, slightly larger than body

### Color Palette
| Usage | Color intent |
|---|---|
| Primary action | Blue (trust, sky association) |
| Powder alert / urgency | Orange-red |
| "Go ski" verdict | Green |
| "Maybe" verdict | Yellow/amber |
| "Skip" verdict | Gray |
| Snowfall amounts | White on dark or blue accent |
| Background | Dark (night/storm feel) or clean white |

### Iconography
- Snowflake for snowfall
- Clock for timing
- Car for travel
- Mountain for resorts
- Bell for alerts

### Interaction Patterns
- Cards are the primary content container
- Tappable cards expand or navigate (no ambiguity)
- Pull-to-refresh on data screens
- Bottom tab navigation (4 tabs max)
- No hamburger menus

---

## Onboarding Performance Targets

| Step | Target time |
|---|---|
| Welcome → Continue | 2 sec |
| Location input | 5 sec |
| Drive radius | 3 sec |
| Pass selection | 5 sec |
| Preferences | 7 sec |
| **Total onboarding** | **~22 sec** |

---

## Data Model Summary

```json
{
  "user": {
    "home_location": { "lat": 39.64, "lng": -106.37, "display_name": "Vail, CO" },
    "max_drive_minutes": 120,
    "passes": ["epic"],
    "specific_resort_pass": null,
    "preferences": ["powder", "trees", "avoid_crowds"],
    "alert_settings": {
      "frequency": "big_storms",
      "timing": "night_before",
      "min_snowfall_inches": 6,
      "resort_filter": "pass_only"
    },
    "deferred_profile": {
      "ski_days": "flexible",
      "midweek_available": true,
      "early_morning_willing": true,
      "storm_driving_comfort": "moderate",
      "crowd_sensitivity": "high",
      "skill_level": "advanced"
    }
  }
}
```

---

## Screens Summary (Quick Reference)

| # | Screen | Type | Priority |
|---|---|---|---|
| 1 | Welcome | Onboarding | P0 |
| 2 | Location Input | Onboarding | P0 |
| 3 | Drive Radius | Onboarding | P0 |
| 4 | Pass Selection | Onboarding | P0 |
| 5 | Ski Preferences | Onboarding | P0 |
| 6 | Dashboard | Core | P0 |
| 7 | Storm Detail | Core | P0 |
| 8 | Resort List | Core | P1 |
| 9 | Powder Alert | Core | P0 |
| 10 | Alert Settings | Settings | P1 |
| 11 | Profile & Settings | Settings | P2 |
