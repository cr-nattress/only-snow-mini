# Epic 23: Freemium & Monetization

**Goal**: Implement a freemium subscription model with a free tier for casual users and a premium tier ($29-49/yr) for power users, with real-time alerts and extended features behind the paywall.

**Priority**: P3 — Quarter 3+
**Depends on**: Epic 0 (user accounts), Epic 10 (push notifications)
**Effort**: High

---

## Context

The competitive analysis monetization section recommends freemium as the optimal model. OpenSnow charges $50-100/yr and faces paywall backlash. Positioning at $29-49 ("less than one lift ticket") creates a compelling alternative.

**Free tier** provides enough value for word-of-mouth:
- Dashboard with Go/Maybe/Skip verdicts
- Resort list with basic filtering
- 3-day forecast window
- Single location

**Premium tier** ($29-49/yr) adds high-value features:
- Real-time powder alerts (push + email)
- 10-day forecast window
- Storm tracking and timeline
- Multiple home locations
- "Worth the Drive" and "Getting Snow Elsewhere" sections
- Weekend planner
- Resort comparison tool
- Historical season data

## User Stories

### 23.1 — Subscription infrastructure
**As a** developer
**I want** payment processing and subscription management
**So that** users can subscribe to premium

**Acceptance Criteria**:
- Stripe integration for payment processing
- Subscription plans: Annual ($29 or $49), Monthly ($4.99 or $7.99)
- Free trial: 14 days of premium
- Subscription status stored in user profile
- Webhook handling for subscription lifecycle events

### 23.2 — Feature gating
**As a** developer
**I want** premium features gated behind subscription status
**So that** free and premium experiences are differentiated

**Acceptance Criteria**:
- Feature flag system based on subscription tier
- Free tier restrictions: 3-day forecast, single location, no alerts, no Worth the Drive
- Premium features unlocked on active subscription
- Graceful upgrade prompts on gated features (not hard blocks)
- "Upgrade to Premium" CTAs at natural discovery points

### 23.3 — Premium upgrade flow
**As a** user
**I want** a smooth upgrade experience
**So that** subscribing is frictionless

**Acceptance Criteria**:
- Premium feature showcase page explaining value
- Stripe Checkout integration for payment
- Immediate feature unlock on successful payment
- Subscription management in profile (cancel, change plan)
- Receipt emails via Stripe

### 23.4 — Email alerts (premium)
**As a** premium user
**I want** email alerts in addition to push notifications
**So that** I never miss a powder day even if push is disabled

**Acceptance Criteria**:
- Weekly outlook email (Sunday evening: week ahead forecast)
- Storm alert email (new storm detected)
- Powder alert email (threshold exceeded)
- Unsubscribe link in every email
- Email provider: Resend, SendGrid, or Supabase email
