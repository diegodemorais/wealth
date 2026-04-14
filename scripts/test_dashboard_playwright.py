#!/usr/bin/env python3
"""
test_dashboard_playwright.py — Run Playwright component tests from Python

Integrates with build_dashboard.py to optionally run browser-based tests
before deploying. Exit code 0 = pass (threshold met), 1 = fail (below threshold).

Usage:
    python3 scripts/test_dashboard_playwright.py
    python3 scripts/test_dashboard_playwright.py --component-only
    python3 scripts/test_dashboard_playwright.py --threshold 80
"""

import subprocess
import json
import sys
from pathlib import Path
import argparse

ROOT = Path(__file__).parent.parent
TESTS_DIR = ROOT / "dashboard" / "tests"
TEST_RESULTS_FILE = TESTS_DIR / "comprehensive_component_test.json"


def run_playwright_tests(component_only=False, threshold=75):
    """Run Playwright tests via shell script.

    Args:
        component_only: Run only component test (skip empty detection)
        threshold: Pass threshold as percentage (default 75%)

    Returns:
        (passed, total, pass_rate) or None on error
    """
    # Build shell command
    cmd = ["./scripts/run_tests_playwright.sh"]
    if component_only:
        cmd.append("--component-only")

    # Run shell script
    try:
        result = subprocess.run(cmd, cwd=str(ROOT), capture_output=True, text=True, timeout=300)
        stdout = result.stdout + result.stderr

        # Parse results from JSON file if it exists
        if TEST_RESULTS_FILE.exists():
            try:
                with open(TEST_RESULTS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    summary = data.get("summary", {})
                    passed = summary.get("pass", 0)
                    total = summary.get("total", 66)
                    pass_rate = (passed / total * 100) if total > 0 else 0
                    return passed, total, pass_rate, stdout
            except json.JSONDecodeError:
                pass

        return None, None, None, stdout
    except subprocess.TimeoutExpired:
        return None, None, None, "Test timeout (>300s)"
    except Exception as e:
        return None, None, None, str(e)


def main():
    parser = argparse.ArgumentParser(description="Run Playwright component tests")
    parser.add_argument("--component-only", action="store_true", help="Run only component test")
    parser.add_argument("--threshold", type=int, default=75, help="Pass threshold (%%, default 75)")
    parser.add_argument("--quiet", action="store_true", help="Suppress output")
    args = parser.parse_args()

    passed, total, rate, output = run_playwright_tests(
        component_only=args.component_only,
        threshold=args.threshold
    )

    if not args.quiet:
        print(output)

    if passed is None:
        print(f"❌ Test execution failed")
        return 1

    # Check threshold
    if rate >= args.threshold:
        print(f"\n✅ Tests passed: {passed}/{total} ({rate:.1f}% ≥ {args.threshold}% threshold)")
        return 0
    else:
        print(f"\n❌ Tests failed: {passed}/{total} ({rate:.1f}% < {args.threshold}% threshold)")
        return 1


if __name__ == "__main__":
    sys.exit(main())
