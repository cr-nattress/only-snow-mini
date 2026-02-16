# Epic 22: AI-Powered Recommendations

**Goal**: Add natural language query support so users can ask questions like "Where should I ski this weekend if I want trees and powder?" and get intelligent, personalized recommendations.

**Priority**: P3 — Quarter 3+
**Depends on**: Epic 15 (scoring v2), Epic 9 (resort detail pages)
**Effort**: Medium

---

## Context

The competitive analysis identifies AI-powered recommendations as a P3 differentiator. OnlySnow already has a "decision engine" positioning — adding natural language makes the decision layer conversational. No competitor offers this. The Vercel AI SDK and Claude API provide the infrastructure.

## User Stories

### 22.1 — Natural language query input
**As a** user
**I want** to ask questions about where to ski in natural language
**So that** I can express preferences beyond the fixed filters

**Acceptance Criteria**:
- Search bar or chat input on dashboard/resort list
- Example queries: "Best powder this weekend under 2 hours", "Where has the least wind today?", "Tree skiing with fresh snow"
- Query interpreted against current resort conditions and user preferences
- Response: ranked list of resorts matching the query with explanations

### 22.2 — AI recommendation engine
**As a** developer
**I want** an LLM-powered recommendation layer
**So that** complex queries produce intelligent results

**Acceptance Criteria**:
- Integrate Vercel AI SDK with Claude API
- System prompt includes: user's location, passes, drive radius, current conditions for all tracked resorts
- Structured output: resort recommendations with reasoning
- Streaming response for fast perceived latency
- Fallback to standard ranked results if AI unavailable

### 22.3 — Contextual suggestions
**As a** user
**I want** proactive AI suggestions based on current conditions
**So that** I discover opportunities I wouldn't have searched for

**Acceptance Criteria**:
- "Did you know?" suggestions on dashboard: "Steamboat is having its best day in 3 weeks"
- Suggestions based on unusual conditions (much better than average, rare low crowds, etc.)
- Maximum 1-2 suggestions per session to avoid noise
