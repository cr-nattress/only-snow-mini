# Epic 0: API Client & Auth

**Goal**: Set up Supabase auth so the app can make authenticated API calls. This is the prerequisite for all consumer API endpoints.

**Priority**: P0 (blocking)
**Depends on**: Nothing

---

## Context

The SkiData API uses Supabase Auth with HTTP-only cookies (`sb-<project-ref>-auth-token=<jwt>`). All `/api/*` consumer endpoints require this cookie. The POC currently uses localStorage for all state with no auth.

We need:
1. A Supabase client configured for the SkiData project
2. A sign-up / sign-in flow (can be minimal — email magic link or email+password)
3. An API client wrapper that passes auth cookies automatically
4. A way to gate authenticated screens behind auth state

---

## User Stories

### 0.1 — Configure Supabase client
**As a** developer
**I want** a configured Supabase client pointing at the SkiData project
**So that** I can make authenticated API calls

**Acceptance Criteria**:
- Install `@supabase/ssr` and `@supabase/supabase-js`
- Create `lib/supabase/client.ts` (browser client) and `lib/supabase/server.ts` (server client)
- Supabase URL and anon key stored in env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Add `.env.local.example` with required vars documented

### 0.2 — Auth sign-up / sign-in page
**As a** user
**I want** to create an account or sign in
**So that** my preferences are saved to the server

**Acceptance Criteria**:
- Create `/auth` page with email + password sign-up/sign-in (toggle between modes)
- Supabase `signUp` and `signInWithPassword` calls
- On success, redirect to `/onboarding/welcome` (new user) or `/dashboard` (existing user with preferences)
- Error states: invalid email, wrong password, already exists
- Minimal styling matching existing dark theme

### 0.3 — Auth state in React context
**As a** developer
**I want** auth state available throughout the app
**So that** components can check if the user is authenticated

**Acceptance Criteria**:
- Create `context/auth-context.tsx` with `AuthProvider`
- Expose: `session`, `user`, `isAuthenticated`, `isLoading`, `signOut`
- Listen to `onAuthStateChange` for session updates
- Wrap app in `AuthProvider` in root layout

### 0.4 — API client with auth
**As a** developer
**I want** a typed API client that automatically sends auth cookies
**So that** I don't manually handle auth on every fetch

**Acceptance Criteria**:
- Create `lib/api/client.ts` with methods: `apiGet<T>(path)`, `apiPost<T>(path, body)`, `apiPatch<T>(path, body)`
- Uses the SkiData base URL from env var (`NEXT_PUBLIC_SKIDATA_API_URL`)
- Includes credentials in fetch calls (`credentials: 'include'` or cookie forwarding)
- Returns typed responses with error handling
- Throws typed errors for 401 (redirect to auth), 404 (no preferences), other

### 0.5 — Auth guard for main app routes
**As a** user
**I want** to be redirected to sign-in if I'm not authenticated
**So that** I don't see broken screens

**Acceptance Criteria**:
- Update root `page.tsx` redirect logic: check Supabase session first, then localStorage fallback
- Main app layout (`(main)/layout.tsx`) checks auth state, redirects to `/auth` if no session
- Onboarding layout allows auth'd users who haven't completed onboarding
- Keep localStorage fallback for offline/demo mode

---

## Technical Notes

- The SkiData API is on a different domain than the POC app. Cookie-based auth requires the POC to proxy API calls through its own Next.js API routes (same-origin), or use Supabase client-side auth tokens directly.
- **Recommended approach**: Use Supabase JS client for auth (manages cookies), then make API calls to the SkiData API using the Supabase JWT as a Bearer token or via server-side API routes that forward the session cookie.
- Alternative: Proxy pattern — create `/api/proxy/[...path]` route that forwards requests to the SkiData API with the auth cookie attached.

## Open Questions

- [ ] What are the Supabase project credentials (URL, anon key) for the SkiData project?
- [ ] Is the POC app on the same Supabase project as the SkiData API, or separate?
- [ ] Should we support anonymous/demo mode (mock data) alongside authenticated mode?
