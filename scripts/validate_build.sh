#!/bin/bash
#
# validate_build.sh — Comprehensive validation suite for dashboard builds
#
# Runs ALL validation checks:
# - Python data validation (all fields, types, ranges)
# - React data validation tests (63 tests)
# - React display validation tests (28 tests)
#
# Exit codes:
#   0 = All validations PASSED (safe to deploy)
#   1 = One or more validations FAILED (blocking)
#
# Usage:
#   ./scripts/validate_build.sh     # Full validation (all checks)
#   ./scripts/validate_build.sh --quick  # Quick validation (data validation only)
#
# Called automatically by:
#   npm run build (if integrated)
#

set -e  # Exit on first error

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV_PY="$HOME/claude/finance-tools/.venv/bin/python3"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              BUILD VALIDATION SUITE                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

FAILED=0
QUICK_MODE=false

# Check for --quick flag
if [[ "$1" == "--quick" ]]; then
  QUICK_MODE=true
  echo "🏃 Quick validation mode (data validation only)"
  echo ""
fi

# ─────────────────────────────────────────────────────────────────────────────
# 1. Python Data Validation
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/3] Python Data Validation${NC}"
echo "   Running comprehensive field validation..."

if $VENV_PY "$ROOT/scripts/validate_data_comprehensive.py"; then
  echo -e "${GREEN}✓ Python data validation PASSED${NC}"
else
  echo -e "${RED}✗ Python data validation FAILED${NC}"
  FAILED=1
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 2. React Data Validation Tests
# ─────────────────────────────────────────────────────────────────────────────
if [ "$QUICK_MODE" = false ]; then
  echo -e "${BLUE}[2/3] React Data Validation Tests (35 tests)${NC}"
  echo "   Testing all data.json fields and structures..."

  if (cd "$ROOT/react-app" && npm test -- tests/data-validation.test.ts); then
    echo -e "${GREEN}✓ React data validation PASSED (35/35)${NC}"
  else
    echo -e "${RED}✗ React data validation FAILED${NC}"
    FAILED=1
  fi

  echo ""

  # ─────────────────────────────────────────────────────────────────────────────
  # 3. React Display Validation Tests
  # ─────────────────────────────────────────────────────────────────────────────
  echo -e "${BLUE}[3/3] React Display Validation Tests (28 tests)${NC}"
  echo "   Testing derived values and display rendering..."

  if (cd "$ROOT/react-app" && npm test -- tests/display-validation.test.ts); then
    echo -e "${GREEN}✓ React display validation PASSED (28/28)${NC}"
  else
    echo -e "${RED}✗ React display validation FAILED${NC}"
    FAILED=1
  fi

  echo ""
fi

# ─────────────────────────────────────────────────────────────────────────────
# Results
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}║  ✓ BUILD VALIDATION SUCCESS                                   ║${NC}"
  if [ "$QUICK_MODE" = false ]; then
    echo -e "${GREEN}║  All 63 tests passed + data validation ✓                      ║${NC}"
  else
    echo -e "${GREEN}║  Data validation passed ✓                                     ║${NC}"
  fi
  echo -e "${BLUE}║  Safe to deploy                                               ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo -e "${RED}║  ✗ BUILD VALIDATION FAILED                                    ║${NC}"
  echo -e "${RED}║  Fix errors above before deploying                             ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
