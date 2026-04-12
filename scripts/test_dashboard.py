#!/usr/bin/env python3
"""
Dashboard Test Runner — DEV-tester
Executes functional tests across all 64 dashboard blocks.

Usage:
    python scripts/test_dashboard.py                          # regression mode (CRITICAL+HIGH only)
    python scripts/test_dashboard.py --mode full              # all severities (425 tests)
    python scripts/test_dashboard.py --mode regression        # CRITICAL+HIGH only (default)
    python scripts/test_dashboard.py --domain fire            # single domain, all severities
    python scripts/test_dashboard.py --mode component --component fire-trilha  # specific component

Output: console report + dashboard/tests/last_run.json

Cycle tracking:
    - CRITICAL fail on cycle 1 or 2 → report to dev
    - CRITICAL fail on cycle 3+ → ESCALATE_TO_DIEGO flag
"""

import sys
import json
import importlib
import argparse
from datetime import datetime
from pathlib import Path

# Allow imports from project root
ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

LAST_RUN_PATH = ROOT / "dashboard" / "tests" / "last_run.json"
TESTS_DIR = ROOT / "dashboard" / "tests"

DOMAIN_MODULES = [
    "dashboard.tests.dev_tests",
    "dashboard.tests.head_tests",
    "dashboard.tests.fire_tests",
    "dashboard.tests.factor_tests",
    "dashboard.tests.rf_tests",
    "dashboard.tests.risco_tests",
    "dashboard.tests.macro_tests",
    "dashboard.tests.fx_tests",
    "dashboard.tests.tax_tests",
    "dashboard.tests.bookkeeper_tests",
]

SEVERITY_ORDER = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2}

# ANSI colors
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def load_failure_history() -> dict:
    """Load consecutive failure counts per block from last run."""
    if not LAST_RUN_PATH.exists():
        return {}
    try:
        with open(LAST_RUN_PATH) as f:
            data = json.load(f)
        return data.get("failure_cycles", {})
    except Exception:
        return {}


def save_last_run(results, failure_cycles: dict, escalations: list, mode: str):
    """Persist results to last_run.json."""
    output = {
        "timestamp": datetime.now().isoformat(),
        "mode": mode,
        "total": len(results),
        "passed": sum(1 for r in results if r.passed),
        "failed": sum(1 for r in results if not r.passed),
        "failure_cycles": failure_cycles,
        "escalations": escalations,
        "results": [
            {
                "test_id": r.test_id,
                "block_id": r.block_id,
                "category": r.category,
                "severity": r.severity,
                "passed": r.passed,
                "message": r.message,
            }
            for r in results
        ],
    }
    LAST_RUN_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(LAST_RUN_PATH, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)


def run(args):
    # Import all test modules — they self-register via decorators
    from dashboard.tests.base import registry

    loaded = []
    for mod_name in DOMAIN_MODULES:
        # Filter by --domain if specified
        if args.domain and args.domain not in mod_name:
            continue
        try:
            importlib.import_module(mod_name)
            loaded.append(mod_name)
        except Exception as e:
            print(f"{RED}ERROR loading {mod_name}: {e}{RESET}")

    results = registry.results

    # Determine effective mode
    mode = args.mode  # 'regression', 'full', or 'component'

    # --domain always runs all severities for that domain (full mode for domain)
    if args.domain:
        mode = "full"

    # Legacy --quick flag maps to regression mode
    if args.quick:
        results = [r for r in results if r.severity == "CRITICAL"]
        mode = "quick"
    elif mode == "regression":
        # Regression: CRITICAL + HIGH only
        results = [r for r in results if r.severity in ("CRITICAL", "HIGH")]
    elif mode == "component":
        # Component mode: filter by component name
        if not args.component:
            print(f"{RED}ERROR: --mode component requires --component <name>{RESET}")
            sys.exit(1)
        component = args.component.lower()
        results = [
            r for r in results
            if component in r.block_id.lower()
            or component in r.test_id.lower()
        ]
        if not results:
            print(f"{YELLOW}WARNING: no tests found for component '{args.component}'{RESET}")
    # mode == 'full': keep all results (no filter)

    # Sort: CRITICAL first, then HIGH, then MEDIUM; failures before passes within each
    results.sort(key=lambda r: (SEVERITY_ORDER.get(r.severity, 9), r.passed))

    # Load previous failure history
    failure_history = load_failure_history()
    failure_cycles = {}
    escalations = []

    # Update failure cycles
    for r in results:
        if not r.passed and r.severity == "CRITICAL":
            prev = failure_history.get(r.block_id, 0)
            failure_cycles[r.block_id] = prev + 1
        elif r.passed and r.block_id in failure_history:
            failure_cycles[r.block_id] = 0  # reset on pass

    # Identify escalations (3+ consecutive CRITICAL failures)
    for block_id, cycles in failure_cycles.items():
        if cycles >= 3:
            escalations.append({"block_id": block_id, "cycles": cycles})

    # ── Print report ─────────────────────────────────────────────────────────
    total = len(results)
    passed = sum(1 for r in results if r.passed)
    failed = total - passed
    critical_fails = sum(1 for r in results if not r.passed and r.severity == "CRITICAL")
    high_fails = sum(1 for r in results if not r.passed and r.severity == "HIGH")

    # Mode label for display
    mode_labels = {
        "regression": "REGRESSION (CRITICAL+HIGH)",
        "full": "FULL (all severities)",
        "component": f"COMPONENT: {args.component}" if args.component else "COMPONENT",
        "quick": "QUICK (CRITICAL only)",
    }
    mode_label = mode_labels.get(mode, mode.upper())
    if args.domain:
        mode_label = f"DOMAIN: {args.domain} (all severities)"

    print(f"\n{BOLD}{'═'*70}{RESET}")
    print(f"{BOLD}  Dashboard Test Suite — {datetime.now().strftime('%Y-%m-%d %H:%M')}{RESET}")
    print(f"{BOLD}  Mode: {mode_label}{RESET}")
    print(f"{BOLD}{'═'*70}{RESET}")
    print(f"  Modules loaded: {len(loaded)} | Tests: {total} | {GREEN}PASS: {passed}{RESET} | {RED}FAIL: {failed}{RESET}")
    print(f"  Critical fails: {RED}{critical_fails}{RESET} | High fails: {YELLOW}{high_fails}{RESET}")

    if failed > 0:
        print(f"\n{BOLD}{'─'*70}{RESET}")
        print(f"{BOLD}  FAILURES{RESET}")
        print(f"{BOLD}{'─'*70}{RESET}")
        for r in results:
            if r.passed:
                continue
            color = RED if r.severity == "CRITICAL" else (YELLOW if r.severity == "HIGH" else CYAN)
            cycles = failure_cycles.get(r.block_id, 1)
            cycle_tag = f" [cycle {cycles}]" if cycles >= 2 else ""
            print(f"  {color}[{r.severity}]{RESET} {r.block_id} :: {r.category} :: {r.description}")
            if r.message:
                print(f"           → {r.message}{cycle_tag}")

    if escalations:
        print(f"\n{BOLD}{RED}{'═'*70}{RESET}")
        print(f"{BOLD}{RED}  ⚠  ESCALATE_TO_DIEGO — blocks failing 3+ consecutive cycles{RESET}")
        print(f"{BOLD}{RED}{'═'*70}{RESET}")
        for esc in escalations:
            print(f"  {RED}BLOCK: {esc['block_id']} — {esc['cycles']} cycles{RESET}")
        print(f"{BOLD}{RED}  → Do NOT proceed with new implementation. Await Diego's decision.{RESET}")
        print(f"{BOLD}{RED}{'═'*70}{RESET}\n")

    # Verdict
    print(f"\n{BOLD}{'─'*70}{RESET}")
    if critical_fails == 0 and high_fails == 0:
        print(f"  {GREEN}{BOLD}✓ DEPLOY APPROVED — all CRITICAL and HIGH tests passing{RESET}")
    elif critical_fails > 0:
        print(f"  {RED}{BOLD}✗ BUILD BROKEN — {critical_fails} CRITICAL failure(s). Return to dev.{RESET}")
    else:
        print(f"  {YELLOW}{BOLD}⚠ HIGH warnings ({high_fails}) — review before deploy{RESET}")
    print(f"{BOLD}{'─'*70}{RESET}\n")

    save_last_run(results, failure_cycles, escalations, mode)
    print(f"  Results saved to: {LAST_RUN_PATH.relative_to(ROOT)}\n")

    # Exit code: 0 = pass, 1 = critical/high fail, 2 = escalation
    if escalations:
        sys.exit(2)
    elif critical_fails > 0 or high_fails > 0:
        sys.exit(1)
    else:
        sys.exit(0)


def main():
    parser = argparse.ArgumentParser(description="Dashboard test runner")
    parser.add_argument(
        "--quick", action="store_true",
        help="[legacy] Run only CRITICAL tests (use --mode regression instead)",
    )
    parser.add_argument(
        "--domain", type=str,
        help="Run only a specific domain (e.g. fire, factor, rf) — all severities",
    )
    parser.add_argument(
        "--mode",
        choices=["regression", "full", "component"],
        default="regression",
        help=(
            "regression (default): CRITICAL+HIGH only — fast guardrails for prod. "
            "full: all severities including MEDIUM. "
            "component: run tests for a specific component (requires --component)."
        ),
    )
    parser.add_argument(
        "--component", type=str,
        help="Component/block ID to test when using --mode component (e.g. fire-trilha)",
    )
    args = parser.parse_args()
    run(args)


if __name__ == "__main__":
    main()
