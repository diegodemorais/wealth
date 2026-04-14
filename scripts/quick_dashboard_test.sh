#!/bin/bash
# Complete Dashboard Test Suite — Antes de qualquer git push
# Usage:
#   ./scripts/quick_dashboard_test.sh              # suite completa
#   ./scripts/quick_dashboard_test.sh --quick      # só testes críticos
#   ./scripts/quick_dashboard_test.sh --no-render  # sem Playwright (mais rápido)

set -e

echo "🧪 DASHBOARD COMPLETE TEST SUITE"
echo "=================================="
echo ""

# 1. Rebuild
echo "1️⃣  Rebuilding dashboard..."
python3 scripts/build_dashboard.py > /tmp/build.log 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  cat /tmp/build.log
  exit 1
fi
echo "✅ Build OK"
echo ""

# 2. Run master test suite
echo "2️⃣  Running complete test suite (5 níveis)..."
python3 scripts/run_all_dashboard_tests.py "$@"
TESTS_RESULT=$?

echo ""
if [ $TESTS_RESULT -eq 0 ]; then
  echo "================================================"
  echo "✅ ALL TESTS PASSED — Safe to push"
  echo "================================================"
  echo ""
  echo "Next: git add -A && git commit -m '...' && git push"
  exit 0
else
  echo "================================================"
  echo "❌ TESTS FAILED — DO NOT PUSH"
  echo "================================================"
  echo ""
  echo "See output above for details"
  echo "Results: dashboard/tests/full_test_run.json"
  exit 1
fi
