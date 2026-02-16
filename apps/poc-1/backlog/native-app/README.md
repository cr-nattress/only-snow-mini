# Epic 21: Native Mobile App

**Goal**: Package OnlySnow as a native iOS/Android app for App Store distribution, offline support, and native push notifications.

**Priority**: P3 — Quarter 3+
**Depends on**: Epic 10 (push notifications), Epic 9 (resort detail pages)
**Effort**: High

---

## Context

Every major competitor has native apps. The competitive analysis identifies "no mobile app" as a top-5 risk. A PWA/web app has inherent distribution disadvantages (no App Store discovery, limited push on iOS pre-16.4, no offline). However, the web-first approach allows rapid iteration during the POC phase.

Two paths: Capacitor (wrap existing Next.js) or React Native (rewrite). Capacitor is lower effort but lower quality; React Native is higher effort but better UX.

## User Stories

### 21.1 — Evaluate native app approach
**As a** developer
**I want** to choose between Capacitor and React Native
**So that** we pick the right trade-off for our stage

**Acceptance Criteria**:
- Evaluate Capacitor: wrap existing Next.js app, add native plugins
- Evaluate React Native: rewrite with shared API layer
- Consider: bundle size, cold start time, offline support, push notification quality
- Decision documented with rationale

### 21.2 — iOS app build
**As a** user
**I want** to install OnlySnow from the App Store
**So that** I have a native app experience on my iPhone

**Acceptance Criteria**:
- App Store listing with screenshots and description
- Native push notifications (APNs integration)
- Offline mode: cached last-known conditions
- Native gestures (swipe back, pull to refresh)
- App icon and splash screen matching brand

### 21.3 — Android app build
**As a** user
**I want** to install OnlySnow from Google Play
**So that** I have a native app experience on my Android

**Acceptance Criteria**:
- Google Play listing
- Firebase Cloud Messaging for push
- Material Design adaptations where appropriate
- Offline mode matching iOS
