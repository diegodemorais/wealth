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
    python scripts/test_dashboard.py --smart                  # only tests relevant to changed files

Output: console report + dashboard/tests/last_run.json

Cycle tracking:
    - CRITICAL fail on cycle 1 or 2 → report to dev
    - CRITICAL fail on cycle 3+ → ESCALATE_TO_DIEGO flag
"""

import subprocess
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

# ── Smart mode — file → domain/category mapping ───────────────────────────────

FILE_TO_DOMAINS = {
    'dashboard/template.html':           ['JS_REF', 'RENDER_REF', 'TAB_SWITCH'],
    'dashboard/index.html':              ['JS_REF', 'RENDER_REF', 'TAB_SWITCH'],
    'scripts/build_dashboard.py':        ['head', 'fire', 'factor', 'rf', 'risco', 'macro', 'fx', 'tax', 'bookkeeper'],
    'scripts/generate_data.py':          ['head', 'fire', 'factor', 'rf', 'risco', 'macro', 'fx', 'tax', 'bookkeeper'],
    'scripts/reconstruct_fire_data.py':  ['fire'],
    'scripts/config.py':                 ['factor', 'fire', 'rf'],
    'dados/':                            ['head', 'bookkeeper'],  # any file under dados/
}

# Categories always included in --smart mode
ALWAYS_RUN = ['JS_REF', 'RENDER_REF', 'TAB_SWITCH']

# ANSI colors
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def get_modified_files() -> list[str] | None:
    """
    Return list of modified file paths from git diff (uncommitted + staged).
    Returns None if git is unavailable or fails.
    """
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            capture_output=True,
            text=True,
            cwd=str(ROOT),
            timeout=10,
        )
        if result.returncode != 0:
            return None
        # Also include staged files not yet committed (git diff --cached)
        staged = subprocess.run(
            ["git", "diff", "--name-only", "--cached"],
            capture_output=True,
            text=True,
            cwd=str(ROOT),
            timeout=10,
        )
        files = set(result.stdout.splitlines())
        if staged.returncode == 0:
            files.update(staged.stdout.splitlines())
        return [f.strip() for f in files if f.strip()]
    except Exception:
        return None


def resolve_smart_targets(modified_files: list[str]) -> tuple[set[str], set[str]]:
    """
    Given a list of modified file paths, return (active_domains, active_categories).
    ALWAYS_RUN categories are always included.
    """
    active_domains: set[str] = set()
    active_categories: set[str] = set(ALWAYS_RUN)

    for changed_file in modified_files:
        for pattern, targets in FILE_TO_DOMAINS.items():
            matched = False
            if pattern.endswith('/'):
                # Directory prefix match
                matched = changed_file.startswith(pattern)
            else:
                matched = (changed_file == pattern or changed_file.endswith('/' + pattern))
            if matched:
                for t in targets:
                    if t.isupper():
                        active_categories.add(t)
                    else:
                        active_domains.add(t)

    return active_domains, active_categories


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

    # ── Smart mode: resolve targets before loading ────────────────────────────
    smart_active_domains: set[str] = set()
    smart_active_categories: set[str] = set()
    smart_modified_files: list[str] = []
    smart_fallback = False

    if args.smart:
        modified = get_modified_files()
        if modified is None:
            # Not a git repo or git failed — fall back to regression
            smart_fallback = True
            print(f"{YELLOW}WARNING: git diff failed — falling back to regression mode{RESET}")
        else:
            smart_modified_files = modified
            smart_active_domains, smart_active_categories = resolve_smart_targets(modified)

    # ── Load modules and tag tests with their domain ──────────────────────────
    loaded = []
    # Map test index range → domain label for each loaded module
    module_domain_ranges: list[tuple[int, int, str]] = []  # (start_idx, end_idx, domain)

    for mod_name in DOMAIN_MODULES:
        # Filter by --domain if specified
        if args.domain and args.domain not in mod_name:
            continue
        try:
            start_idx = len(registry.results)
            importlib.import_module(mod_name)
            end_idx = len(registry.results)
            # Extract domain from module name: dashboard.tests.fire_tests → fire
            domain_label = mod_name.split(".")[-1].replace("_tests", "")
            module_domain_ranges.append((start_idx, end_idx, domain_label))
            loaded.append(mod_name)
        except Exception as e:
            print(f"{RED}ERROR loading {mod_name}: {e}{RESET}")

    # Annotate each TestResult with its domain (stored in a parallel dict keyed by index)
    test_domains: dict[int, str] = {}
    for start_idx, end_idx, domain_label in module_domain_ranges:
        for i in range(start_idx, end_idx):
            test_domains[i] = domain_label

    results = registry.results

    # Determine effective mode
    mode = args.mode  # 'regression', 'full', or 'component'

    # --domain always runs all severities for that domain (full mode for domain)
    if args.domain:
        mode = "full"

    # ── Smart mode filtering ──────────────────────────────────────────────────
    if args.smart and not smart_fallback:
        total_before_smart = len(results)

        if not smart_active_domains and smart_active_categories == set(ALWAYS_RUN):
            # No relevant files changed — run only the 3 safety categories
            results = [
                r for i, r in enumerate(results)
                if r.category in ALWAYS_RUN
            ]
        else:
            # Filter: include if domain matches OR category matches
            results = [
                r for i, r in enumerate(results)
                if test_domains.get(i, "") in smart_active_domains
                or r.category in smart_active_categories
            ]

        # Smart mode always runs CRITICAL+HIGH only (regression subset)
        results = [r for r in results if r.severity in ("CRITICAL", "HIGH")]
        mode = "smart"

        # Print smart mode header
        changed_names = [Path(f).name for f in smart_modified_files] if smart_modified_files else []
        files_str = ", ".join(changed_names) if changed_names else "nenhum"
        domains_str = ", ".join(sorted(smart_active_domains)) if smart_active_domains else "nenhum"
        cats_str = "/".join(ALWAYS_RUN)
        print(f"\n{CYAN}{BOLD}Smart mode — arquivos modificados: {files_str}{RESET}")
        print(f"{CYAN}   Domínios ativados: {domains_str} + {cats_str}{RESET}")
        print(f"{CYAN}   Testes selecionados: {len(results)} / {total_before_smart}{RESET}")

    # Legacy --quick flag maps to regression mode
    elif args.quick:
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
        "smart": "SMART (relevant tests only, CRITICAL+HIGH)",
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
    parser.add_argument(
        "--smart", action="store_true",
        help=(
            "Run only tests relevant to files changed since last commit (git diff HEAD). "
            "Always includes JS_REF, RENDER_REF, TAB_SWITCH categories. "
            "Falls back to regression mode if git is unavailable."
        ),
    )
    args = parser.parse_args()
    run(args)


if __name__ == "__main__":
    main()
