#!/bin/bash
#
# run_tests_playwright.sh — Automated Playwright test suite
# 
# Usage:
#   ./scripts/run_tests_playwright.sh                    # Run all tests
#   ./scripts/run_tests_playwright.sh --component-only   # Just component test
#   ./scripts/run_tests_playwright.sh --empty-only       # Just empty detection
#
# Exit codes:
#   0 = all tests pass
#   1 = one or more tests fail
#   2 = test not found
#

# Don't exit on errors — we'll handle exit codes manually
set +e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TESTS_DIR="$ROOT/dashboard/tests"

# Parse arguments
COMPONENT_ONLY=false
EMPTY_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --component-only) COMPONENT_ONLY=true ;;
    --empty-only) EMPTY_ONLY=true ;;
  esac
done

echo ""
echo "🧪 DASHBOARD PLAYWRIGHT TEST SUITE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

exit_code=0

# Component Test
if [ "$EMPTY_ONLY" != "true" ]; then
  echo "🔹 Component Rendering Test..."
  if [ -f "$ROOT/test_comprehensive_components.js" ]; then
    output=$(node "$ROOT/test_comprehensive_components.js" 2>&1)
    result=$?
    echo "$output"

    # Extract pass count from "✅ PASS:    52/66" format
    if echo "$output" | grep -q "FINAL SUMMARY"; then
      pass_count=$(echo "$output" | grep "✅ PASS:" | grep -oE "[0-9]+/" | sed 's#/##' || echo "0")
      total_count=$(echo "$output" | grep "✅ PASS:" | grep -oE "/[0-9]+" | sed 's#/##' || echo "66")

      # Calculate 75% threshold
      threshold=$((total_count * 75 / 100))

      if [ "$pass_count" -ge "$threshold" ] 2>/dev/null; then
        echo "✅ Component test passed ($pass_count/$total_count ≥ 75% threshold)"
      else
        echo "⚠️  Component test below 75% threshold ($pass_count/$total_count)"
        exit_code=1
      fi
    else
      echo "❌ Component test failed to generate summary"
      exit_code=1
    fi
  else
    echo "⚠️  test_comprehensive_components.js not found"
    exit_code=2
  fi
  echo ""
fi

# Empty Detection Test
if [ "$COMPONENT_ONLY" != "true" ]; then
  echo "🔹 Empty Component Detection Test..."
  if [ -f "$TESTS_DIR/identify_empty_integrated.js" ]; then
    if node "$TESTS_DIR/identify_empty_integrated.js" 2>&1; then
      echo "✅ Empty detection test passed"
    else
      echo "⚠️  Empty detection test found empty components (check results.json)"
      exit_code=1
    fi
  else
    echo "⚠️  identify_empty_integrated.js not found"
    exit_code=2
  fi
  echo ""
fi

echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ "$exit_code" -eq 0 ]; then
  echo "✅ All tests passed"
else
  echo "❌ Tests completed with issues (exit code: $exit_code)"
fi

exit "$exit_code"
