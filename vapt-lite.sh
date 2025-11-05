#!/usr/bin/env bash
# Minimal Web VAPT-lite (headers, CSP, cookies, redirects, CORS, assets)
# Usage:
#   ./vapt-lite.sh https://www.paybychance.com \
#     --assets "/vendor/squad.min.js,/favicon.ico" \
#     --out report.md \
#     --full
#
# Notes:
# - Only uses curl/awk/grep/sed. jq is optional.
# - Focuses on HTTP-layer checks (no TLS cipher audit or port scan).
# - Designed for CD pipelines or quick manual assessments.

set -euo pipefail

TARGET="${1:-}"
shift || true

ASSETS=""
OUTFILE=""
FULL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --assets) ASSETS="$2"; shift 2;;
    --out)    OUTFILE="$2"; shift 2;;
    --full)   FULL=1; shift;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 https://example.com [--assets \"/a.js,/b.css\"] [--out report.md] [--full]"
  exit 1
fi

# Colors
GREEN="\033[1;32m"; YELLOW="\033[1;33m"; RED="\033[1;31m"; BLUE="\033[1;34m"; NC="\033[0m"

NOW_UTC="$(date -u +'%Y-%m-%d %H:%M:%S UTC')"
HOST="$(echo "$TARGET" | sed -E 's#https?://([^/]+).*#\1#')"

function header() { echo -e "${BLUE}$*${NC}"; }
function ok()     { echo -e "${GREEN}✔${NC} $*"; }
function warn()   { echo -e "${YELLOW}⚠${NC} $*"; }
function bad()    { echo -e "${RED}✖${NC} $*"; }

RECS=()    # recommendations array
SCORED=0   # headers score

function add_rec() { RECS+=("$*"); }

# ------------------------------------------------------------------------------
# Fetch headers for a URL
# ------------------------------------------------------------------------------
function fetch_headers() {
  local url="$1"
  curl -s -D - "$url" -o /dev/null
}

# Dump + grep helper
function get_hdr() {
  # print exact header lines (case-insensitive)
  echo "$1" | grep -i "^$2:"
}

function get_hdr_value() {
  # Return header value (the part after ":")
  get_hdr "$1" "$2" | sed -E "s/^$2:[[:space:]]*//I"
}

# ------------------------------------------------------------------------------
# Score presence of header (increments global SCORED)
# ------------------------------------------------------------------------------
function score_header_presence() {
  local name="$1"; local hdrs="$2"
  if echo "$hdrs" | grep -iq "^$name:"; then
    SCORED=$((SCORED+1))
    ok "$name present"
    [[ $FULL -eq 1 ]] && echo "   → $(get_hdr "$hdrs" "$name")"
    return 0
  else
    bad "$name missing"
    add_rec "$name missing — add it (align with Mozilla/OWASP guidance)."
    return 1
  fi
}

# ------------------------------------------------------------------------------
# Redirect checks (HTTP → HTTPS, apex → www if applicable)
# ------------------------------------------------------------------------------
function check_redirects() {
  header "Redirect checks"
  local http_url="http://${HOST}"
  local out
  out="$(curl -s -I "$http_url")" || true
  if echo "$out" | grep -qE '^HTTP.* 30[18]'; then
    ok "HTTP → HTTPS uses 30x"
    if echo "$out" | grep -qi '^location: https://'; then
      ok "Location is HTTPS"
    else
      bad "Location is not HTTPS"
      add_rec "Ensure HTTP → HTTPS redirect points to https://"
    fi
  else
    warn "No 301/308 from http:// (might be blocked at edge or already HTTPS-only)"
    add_rec "Use 308/301 for HTTP → HTTPS at the edge (safer and faster)."
  fi
  echo
}

# ------------------------------------------------------------------------------
# Main document headers
# ------------------------------------------------------------------------------
MAIN_HEADERS="$(fetch_headers "$TARGET")"

# Mozilla top headers we track
CRIT_HEADERS=( \
  "Content-Security-Policy" \
  "Strict-Transport-Security" \
  "X-Frame-Options" \
  "X-Content-Type-Options" \
  "Referrer-Policy" \
  "Permissions-Policy" \
  "Cross-Origin-Opener-Policy" \
  "Cross-Origin-Resource-Policy" \
  "Origin-Agent-Cluster" \
)

header "Security header presence"
SCORED=0
for h in "${CRIT_HEADERS[@]}"; do
  score_header_presence "$h" "$MAIN_HEADERS" >/dev/null || true
done
echo

# ------------------------------------------------------------------------------
# Deep value checks
# ------------------------------------------------------------------------------
header "Deep value checks"

# HSTS
HSTS_VAL="$(get_hdr_value "$MAIN_HEADERS" "Strict-Transport-Security")"
if [[ -n "$HSTS_VAL" ]]; then
  # max-age check
  MAXAGE="$(echo "$HSTS_VAL" | sed -nE 's/.*max-age=([0-9]+).*/\1/p')"
  if [[ -n "$MAXAGE" && "$MAXAGE" -ge 31536000 ]]; then
    ok "HSTS max-age >= 1 year (${MAXAGE}s)"
  else
    warn "HSTS max-age < 1 year (${MAXAGE:-unset})"
    add_rec "Raise HSTS max-age to >= 31536000 and includeSubDomains; preload."
  fi
  [[ "$HSTS_VAL" =~ includeSubDomains ]] || { warn "HSTS missing includeSubDomains"; add_rec "Add includeSubDomains to HSTS."; }
  [[ "$HSTS_VAL" =~ preload ]] || { warn "HSTS missing preload"; add_rec "Add preload (and submit to hstspreload.org)."; }
else
  bad "HSTS missing"
fi

# X-Content-Type-Options
XCTO_VAL="$(get_hdr_value "$MAIN_HEADERS" "X-Content-Type-Options")"
[[ "${XCTO_VAL,,}" == "nosniff" ]] || { warn "X-Content-Type-Options not 'nosniff'"; add_rec "Set X-Content-Type-Options: nosniff."; }

# X-Frame-Options
XFO_VAL="$(get_hdr_value "$MAIN_HEADERS" "X-Frame-Options")"
if [[ -n "$XFO_VAL" ]]; then
  if [[ "${XFO_VAL^^}" =~ ^(DENY|SAMEORIGIN)$ ]]; then
    ok "X-Frame-Options (${XFO_VAL})"
  else
    warn "X-Frame-Options unusual value: $XFO_VAL"
    add_rec "Use SAMEORIGIN or DENY for X-Frame-Options."
  fi
fi

# Referrer-Policy
REFP_VAL="$(get_hdr_value "$MAIN_HEADERS" "Referrer-Policy")"
if [[ -n "$REFP_VAL" ]]; then
  case "$REFP_VAL" in
    strict-origin-when-cross-origin|no-referrer|no-referrer-when-downgrade|same-origin|strict-origin|origin-when-cross-origin|origin)
      ok "Referrer-Policy ($REFP_VAL)"
      ;;
    *)
      warn "Referrer-Policy uncommon: $REFP_VAL"
      add_rec "Prefer strict-origin-when-cross-origin (good balance of privacy & analytics)."
      ;;
  esac
fi

# Permissions-Policy quick sanity
PERM_VAL="$(get_hdr_value "$MAIN_HEADERS" "Permissions-Policy")"
if [[ -n "$PERM_VAL" ]]; then
  echo "$PERM_VAL" | grep -q "payment" || warn "Permissions-Policy: consider restricting payment=() if you don't use Payment Request API"
fi

# COOP/CORP
COOP_VAL="$(get_hdr_value "$MAIN_HEADERS" "Cross-Origin-Opener-Policy")"
[[ "${COOP_VAL,,}" == "same-origin" ]] || { warn "COOP not same-origin"; add_rec "Set Cross-Origin-Opener-Policy: same-origin for Spectre hardening."; }

CORP_VAL="$(get_hdr_value "$MAIN_HEADERS" "Cross-Origin-Resource-Policy")"
[[ "${CORP_VAL,,}" =~ ^same-(origin|site)$ ]] || { warn "CORP should be same-site or same-origin"; add_rec "Set Cross-Origin-Resource-Policy: same-site (or same-origin)."; }

# CSP analysis
CSP_VAL="$(get_hdr_value "$MAIN_HEADERS" "Content-Security-Policy")"
if [[ -n "$CSP_VAL" ]]; then
  ok "CSP present"
  [[ $FULL -eq 1 ]] && echo "   → $CSP_VAL"
  # Checks
  echo "$CSP_VAL" | grep -q "script-src" || { warn "CSP: missing script-src (falls back to default-src)"; add_rec "Define script-src explicitly with only required origins."; }
  echo "$CSP_VAL" | grep -q "object-src 'none'" || { warn "CSP: object-src 'none' recommended"; add_rec "Include object-src 'none'."; }
  echo "$CSP_VAL" | grep -q "frame-ancestors" || { warn "CSP: missing frame-ancestors"; add_rec "Add frame-ancestors 'self' to prevent clickjacking."; }
  # flag unsafe-inline (scripts/styles)
  echo "$CSP_VAL" | grep -q "script-src-attr 'none'" || { warn "CSP: consider script-src-attr 'none'"; add_rec "Harden inline event handlers with script-src-attr 'none'."; }
  echo "$CSP_VAL" | grep -q "style-src-attr 'unsafe-inline'" && warn "CSP: style-src-attr allows inline styles (ok if intentional)"
  # HTTPS only sources?
  if echo "$CSP_VAL" | grep -qE "http://"; then
    bad "CSP permits http:// sources"
    add_rec "Remove any http:// sources from CSP; enforce https:// only."
  fi
else
  bad "CSP missing"
  add_rec "Add a strict Content-Security-Policy."
fi
echo

# ------------------------------------------------------------------------------
# Cookie flags (Secure/HttpOnly/SameSite)
# ------------------------------------------------------------------------------
header "Cookie flag checks (Set-Cookie)"
COOKIE_LINES="$(echo "$MAIN_HEADERS" | grep -i '^Set-Cookie:' || true)"
if [[ -z "$COOKIE_LINES" ]]; then
  warn "No Set-Cookie headers on main document (may be fine)"
else
  while read -r line; do
    val="$(echo "$line" | sed -E 's/^Set-Cookie:[[:space:]]*//I')"
    name="$(echo "$val" | cut -d= -f1)"
    missing=()
    echo "$val" | grep -qi 'Secure'   || missing+=("Secure")
    echo "$val" | grep -qi 'HttpOnly' || missing+=("HttpOnly")
    echo "$val" | grep -qi 'SameSite='|| missing+=("SameSite")
    if [[ ${#missing[@]} -eq 0 ]]; then
      ok "Cookie ${name} has Secure/HttpOnly/SameSite"
    else
      warn "Cookie ${name} missing: ${missing[*]}"
      add_rec "Ensure cookie ${name} sets Secure; HttpOnly; SameSite=None (if cross-site) or Lax/Strict (if same-site)."
    fi
  done <<< "$COOKIE_LINES"
fi
echo

# ------------------------------------------------------------------------------
# CORS preflight (OPTIONS) for a common API path (best-effort)
# ------------------------------------------------------------------------------
header "CORS preflight (OPTIONS) check"
API_CANDIDATES=( "/wp-json/" "/api/" "/v1/" )
CORS_OK=0
for path in "${API_CANDIDATES[@]}"; do
  url="${TARGET%/}${path}"
  out="$(curl -s -X OPTIONS -D - "$url" -o /dev/null || true)"
  if echo "$out" | grep -qi '^Access-Control-Allow-Origin:'; then
    ok "Preflight responded with CORS headers at $path"
    [[ $FULL -eq 1 ]] && echo "$out" | grep -i '^Access-Control-Allow-' | sed 's/^/   → /'
    CORS_OK=1
    break
  fi
done
[[ $CORS_OK -eq 0 ]] && warn "No CORS headers detected on common API paths (may be intentionally disabled)."
echo

# ------------------------------------------------------------------------------
# Asset checks (cache & MIME)
# ------------------------------------------------------------------------------
header "Asset cache/MIME checks"
IFS=',' read -r -a ASSET_LIST <<< "$ASSETS"
if [[ -n "$ASSETS" ]]; then
  for p in "${ASSET_LIST[@]}"; do
    p="$(echo "$p" | xargs)"
    [[ -z "$p" ]] && continue
    url="${TARGET%/}${p}"
    ah="$(curl -s -I "$url" || true)"
    echo "• $p"
    ctype="$(get_hdr_value "$ah" "Content-Type")"
    cc="$(get_hdr_value "$ah" "Cache-Control")"
    etag="$(get_hdr_value "$ah" "ETag")"
    lm="$(get_hdr_value "$ah" "Last-Modified")"

    if [[ -n "$ctype" ]]; then
      ok "Content-Type: $ctype"
    else
      warn "Missing Content-Type"
      add_rec "Set Content-Type correctly for ${p}."
    fi

    if [[ -n "$cc" ]]; then
      echo "   Cache-Control: $cc"
      # check long-term immutability for versioned assets
      if echo "$p" | grep -qE '\.([a-f0-9]{8,})\.'; then
        echo "$cc" | grep -qi 'immutable' || { warn "Versioned asset without immutable"; add_rec "Add immutable to Cache-Control for ${p}."; }
        MAX="$(echo "$cc" | sed -nE 's/.*max-age=([0-9]+).*/\1/p')"
        if [[ -n "$MAX" && "$MAX" -lt 2592000 ]]; then
          warn "max-age too low for versioned asset (${MAX}s)"
          add_rec "Raise max-age >= 31536000 for versioned asset ${p}."
        fi
      else
        # non-versioned: warn on overly long cache
        MAX="$(echo "$cc" | sed -nE 's/.*max-age=([0-9]+).*/\1/p')"
        if [[ -n "$MAX" && "$MAX" -gt 86400 ]]; then
          warn "Non-versioned asset cached very long (max-age=${MAX}s)"
          add_rec "Use file hashing/versioning before long-lived cache on ${p}."
        fi
      fi
    else
      warn "Missing Cache-Control"
      add_rec "Set sane Cache-Control for ${p} (immutable+1y if versioned)."
    fi

    [[ -n "$etag" ]] && echo "   ETag: $etag"
    [[ -n "$lm"   ]] && echo "   Last-Modified: $lm"
    echo
  done
else
  warn "No assets provided. Run with: --assets \"/vendor/squad.min.js,/app.js\""
fi

# ------------------------------------------------------------------------------
# Summary + Markdown report
# ------------------------------------------------------------------------------
header "Summary"
TOTAL=${#CRIT_HEADERS[@]}
echo "Headers present: ${SCORED}/${TOTAL}"
if [[ ${#RECS[@]} -eq 0 ]]; then
  ok "No recommendations — A+ posture for checked items."
else
  warn "Recommendations (${#RECS[@]}):"
  for r in "${RECS[@]}"; do
    echo "  - $r"
  done
fi
echo

if [[ -n "$OUTFILE" ]]; then
  {
    echo "# Web VAPT-lite Report"
    echo "- **Target:** $TARGET"
    echo "- **When:** $NOW_UTC"
    echo
    echo "## Header Presence (${SCORED}/${TOTAL})"
    for h in "${CRIT_HEADERS[@]}"; do
      if echo "$MAIN_HEADERS" | grep -iq "^$h:"; then
        echo "- ✅ $h: \`$(get_hdr_value "$MAIN_HEADERS" "$h")\`"
      else
        echo "- ❌ $h: missing"
      fi
    done
    echo
    echo "## Deep Checks"
    echo "- **HSTS:** \`${HSTS_VAL:-missing}\`"
    echo "- **X-Frame-Options:** \`${XFO_VAL:-missing}\`"
    echo "- **X-Content-Type-Options:** \`${XCTO_VAL:-missing}\`"
    echo "- **Referrer-Policy:** \`${REFP_VAL:-missing}\`"
    echo "- **COOP:** \`${COOP_VAL:-missing}\`"
    echo "- **CORP:** \`${CORP_VAL:-missing}\`"
    echo "- **CSP:** \`${CSP_VAL:-missing}\`"
    echo
    echo "## CORS Preflight"
    if [[ $CORS_OK -eq 1 ]]; then
      echo "- ✅ CORS headers detected on common API path"
    else
      echo "- ℹ️ No CORS headers found on /wp-json,/api,/v1 (may be intentional)"
    fi
    echo
    echo "## Asset Review"
    if [[ -n "$ASSETS" ]]; then
      for p in "${ASSET_LIST[@]}"; do
        p="$(echo "$p" | xargs)"; [[ -z "$p" ]] && continue
        url="${TARGET%/}${p}"
        ah="$(curl -s -I "$url" || true)"
        echo "### \`$p\`"
        echo "- Content-Type: \`$(get_hdr_value "$ah" "Content-Type" | tr -d '\r')\`"
        echo "- Cache-Control: \`$(get_hdr_value "$ah" "Cache-Control" | tr -d '\r')\`"
        echo "- ETag: \`$(get_hdr_value "$ah" "ETag" | tr -d '\r')\`"
        echo "- Last-Modified: \`$(get_hdr_value "$ah" "Last-Modified" | tr -d '\r')\`"
        echo
      done
    else
      echo "- (No assets provided)"
    fi
    echo
    echo "## Recommendations"
    if [[ ${#RECS[@]} -eq 0 ]]; then
      echo "- ✅ None. Looks excellent."
    else
      for r in "${RECS[@]}"; do
        echo "- $r"
      done
    fi
    echo
    echo "> Generated by vapt-lite.sh on $NOW_UTC"
  } > "$OUTFILE"
  echo -e "${GREEN}Report written to:${NC} $OUTFILE"
fi
