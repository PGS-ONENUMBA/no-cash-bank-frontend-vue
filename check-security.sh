#!/usr/bin/env bash
# Local HTTP Security Header Checker
# Usage:
#   ./check-security.sh https://www.paybychance.com
#   ./check-security.sh https://www.paybychance.com --full

TARGET="${1:-https://www.paybychance.com}"
MODE="${2:-normal}"

HEADERS=$(curl -s -D - "$TARGET" -o /dev/null)

# ANSI colors
GREEN="\033[1;32m"; YELLOW="\033[1;33m"; RED="\033[1;31m"; NC="\033[0m"

echo "🔍 Checking security headers for: $TARGET"
echo "------------------------------------------------------------"

# function to check header existence and optionally print value
function check_header() {
  local name="$1"
  local regex="$2"
  local pretty="$3"
  local found
  found=$(echo "$HEADERS" | grep -i "$regex")
  if [ -n "$found" ]; then
    printf "${GREEN}✔${NC} %-35s found\n" "$pretty"
    if [ "$MODE" = "--full" ]; then
      echo "$found" | sed 's/^/   → /'
      echo
    fi
    return 1
  else
    printf "${RED}✖${NC} %-35s missing\n" "$pretty"
    return 0
  fi
}

score=0; total=9

check_header "Content-Security-Policy"       "content-security-policy"       "Content-Security-Policy"       || score=$((score+1))
check_header "Strict-Transport-Security"     "strict-transport-security"     "Strict-Transport-Security"     || score=$((score+1))
check_header "X-Frame-Options"               "x-frame-options"               "X-Frame-Options"               || score=$((score+1))
check_header "X-Content-Type-Options"        "x-content-type-options"        "X-Content-Type-Options"        || score=$((score+1))
check_header "Referrer-Policy"               "referrer-policy"               "Referrer-Policy"               || score=$((score+1))
check_header "Permissions-Policy"            "permissions-policy"            "Permissions-Policy"            || score=$((score+1))
check_header "Cross-Origin-Opener-Policy"    "cross-origin-opener-policy"    "Cross-Origin-Opener-Policy"    || score=$((score+1))
check_header "Cross-Origin-Resource-Policy"  "cross-origin-resource-policy"  "Cross-Origin-Resource-Policy"  || score=$((score+1))
check_header "Origin-Agent-Cluster"          "origin-agent-cluster"          "Origin-Agent-Cluster"          || score=$((score+1))

echo "------------------------------------------------------------"
if [ "$score" -eq "$total" ]; then
  printf "${GREEN}✅  All %d critical headers present — A+ grade!${NC}\n" "$total"
else
  printf "${YELLOW}⚠️  %d/%d headers found. Review missing ones above.${NC}\n" "$score" "$total"
fi
echo
