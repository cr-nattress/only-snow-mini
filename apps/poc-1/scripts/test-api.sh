#!/usr/bin/env bash
# OnlySnow API Integration Test Script
# Tests all endpoints against the live SkiData API.
#
# Usage:
#   ./scripts/test-api.sh                    # Public endpoints only
#   API_KEY=sk_live_... ./scripts/test-api.sh  # All endpoints
#
# Exit codes: 0 = all passed, 1 = failures

set -euo pipefail

BASE_URL="${API_BASE_URL:-https://ski-ai-mu.vercel.app/api}"
API_KEY="${API_KEY:-}"
PASS=0
FAIL=0

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }
dim()   { printf "\033[90m%s\033[0m\n" "$1"; }

check() {
  local label="$1" url="$2" expected_status="${3:-200}" auth="${4:-false}"
  local headers=(-s -o /tmp/api-test-body -w "%{http_code}" -H "Content-Type: application/json")

  if [ "$auth" = "true" ] && [ -n "$API_KEY" ]; then
    headers+=(-H "Authorization: Bearer $API_KEY")
  fi

  local status
  status=$(curl "${headers[@]}" "$url")

  if [ "$status" = "$expected_status" ]; then
    green "  ✓ $label ($status)"
    PASS=$((PASS + 1))
  else
    red "  ✗ $label — expected $expected_status, got $status"
    dim "    $(cat /tmp/api-test-body | head -c 200)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "OnlySnow API Integration Tests"
echo "Base URL: $BASE_URL"
echo "API Key:  ${API_KEY:+set (${API_KEY:0:12}...)}${API_KEY:+}${API_KEY:-not set}"
echo ""

# ── Public endpoints ────────────────────────────────────────────
echo "Public Endpoints"
echo "────────────────"

check "Health check" \
  "$BASE_URL/health" 200

check "Weather (vail, imperial)" \
  "$BASE_URL/weather?resort=vail&units=imperial" 200

check "Weather (copper-mountain, metric)" \
  "$BASE_URL/weather?resort=copper-mountain" 200

check "Weather (park-city, imperial)" \
  "$BASE_URL/weather?resort=park-city&units=imperial" 200

check "Weather (stowe, imperial)" \
  "$BASE_URL/weather?resort=stowe&units=imperial" 200

check "Weather (invalid slug → 404)" \
  "$BASE_URL/weather?resort=fake-resort" 404

check "Weather (missing param → 400)" \
  "$BASE_URL/weather" 400

echo ""

# ── Authenticated endpoints ─────────────────────────────────────
if [ -z "$API_KEY" ]; then
  dim "Authenticated Endpoints"
  dim "────────────────────────"
  dim "  Skipped — no API_KEY set"
else
  echo "Authenticated Endpoints"
  echo "────────────────────────"

  check "Ranked resorts (today)" \
    "$BASE_URL/resorts/ranked?period=today" 200 true

  check "Ranked resorts (5d)" \
    "$BASE_URL/resorts/ranked?period=5d" 200 true

  check "Resort detail (vail, imperial)" \
    "$BASE_URL/resorts/vail?units=imperial" 200 true

  check "Storms" \
    "$BASE_URL/storms" 200 true

  check "Worth knowing" \
    "$BASE_URL/worth-knowing" 200 true

  check "Preferences (GET)" \
    "$BASE_URL/preferences" 200 true

  check "Notifications" \
    "$BASE_URL/notifications" 200 true

  check "No auth → 401" \
    "$BASE_URL/resorts/ranked" 401 false
fi

echo ""

# ── Summary ─────────────────────────────────────────────────────
echo "────────────────"
echo "Results: $(green "$PASS passed"), $([ $FAIL -gt 0 ] && red "$FAIL failed" || echo "0 failed")"
echo ""

[ "$FAIL" -eq 0 ] && exit 0 || exit 1
