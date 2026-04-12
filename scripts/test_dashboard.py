#!/usr/bin/env python3
"""
Dashboard Test Runner — DEV-tester
Executes functional tests across all dashboard blocks.

Usage:
    python scripts/test_dashboard.py                          # TIA auto-routing (default)
    python scripts/test_dashboard.py --mode smoke             # ~113 tests: DOM_REF CRITICAL + SPEC + SMOKE
    python scripts/test_dashboard.py --mode smart             # ~235 tests: smoke + RENDER + TAB_SWITCH + DOM_REF HIGH + PRIVACY
    python scripts/test_dashboard.py --mode full              # all tests (~576)
    python scripts/test_dashboard.py --domain fire            # single domain, full mode
    python scripts/test_dashboard.py --mode component --component fire-trilha  # specific component

Mode definitions (by category):
    smoke  = {SMOKE, SPEC, DOM_REF} at CRITICAL+HIGH — "did I break the page structure?"
    smart  = {SMOKE, SPEC, DOM_REF, RENDER, TAB_SWITCH, PRIVACY} — "did I break any visible feature?"
    full   = all categories — "are all contracts still valid?" (DATA + VALUE added)

TIA auto-routing (default, no --mode flag):
    docs/agentes/ only  → smoke
    template.html       → smart
    *.py or dados/      → full
    unknown files       → smart (safe default)

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

# ── Mode category filters ─────────────────────────────────────────────────────
# smoke: fast sanity — did I break the page structure?
SMOKE_CATS = {"SMOKE", "SPEC", "DOM_REF"}
SMOKE_SEVERITIES = {"CRITICAL", "HIGH"}

# smart: feature safety — did I break any visible feature?
SMART_CATS = {"SMOKE", "SPEC", "DOM_REF", "RENDER", "TAB_SWITCH", "PRIVACY"}
# (all severities within those categories)

# full: contract validation — are all business contracts still valid?
# (all categories, all severities)

# ── TIA — file → mode routing ────────────────────────────────────────────────
# Patterns determine the MINIMUM mode for the changed file.
# The highest mode across all changed files wins.
#
# Mode levels: smoke=0, smart=1, full=2
# Docs → smoke; template/spec → smart; *.py/dados/ → full; unknown → smoke
#
# Matching order: exact > startswith (dict insertion order, first match wins).
# More specific patterns must come BEFORE broader prefix patterns.

FILE_TO_MODE = {
    # ── smoke: docs, test infra, generated artefacts ──────────────────────────
    'CLAUDE.md':                        'smoke',
    'README.md':                        'smoke',
    'agentes/':                         'smoke',
    'analysis/':                        'smoke',
    'protocolos/':                      'smoke',
    'dashboard/tests/':                 'smoke',
    'dashboard/version.json':           'smoke',
    'dashboard/last_run.json':          'smoke',
    'scripts/test_dashboard.py':        'smoke',  # must be before scripts/ catch-all

    # ── smart: template, spec, index ─────────────────────────────────────────
    'dashboard/template.html':          'smart',
    'dashboard/index.html':             'smart',
    'dashboard/spec.json':              'smart',

    # ── full: any script, source data, or pipeline output ────────────────────
    # data.json is the pipeline output — DATA/VALUE tests validate its contents
    'dashboard/data.json':              'full',
    # Named scripts (redundant with scripts/ catch-all, but explicit is clearer)
    'scripts/build_dashboard.py':       'full',
    'scripts/generate_data.py':         'full',
    'scripts/reconstruct_fire_data.py': 'full',
    'scripts/config.py':                'full',
    'scripts/fire_montecarlo.py':       'full',
    'scripts/portfolio_analytics.py':   'full',
    # Catch-all: any script not explicitly listed above
    'scripts/':                         'full',
    # All source data
    'dados/':                           'full',
}

MODE_LEVEL = {'smoke': 0, 'smart': 1, 'full': 2}
LEVEL_MODE = {0: 'smoke', 1: 'smart', 2: 'full'}

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
            capture_output=True, text=True, cwd=str(ROOT), timeout=10,
        )
        if result.returncode != 0:
            return None
        staged = subprocess.run(
            ["git", "diff", "--name-only", "--cached"],
            capture_output=True, text=True, cwd=str(ROOT), timeout=10,
        )
        files = set(result.stdout.splitlines())
        if staged.returncode == 0:
            files.update(staged.stdout.splitlines())
        return [f.strip() for f in files if f.strip()]
    except Exception:
        return None


def _file_to_mode(changed_file: str) -> str:
    """Map a single changed file to its required test mode level."""
    for pattern, mode in FILE_TO_MODE.items():
        if pattern.endswith('/'):
            if changed_file.startswith(pattern):
                return mode
        else:
            if changed_file == pattern or changed_file.startswith(pattern):
                return mode
    # Unknown file → smoke (likely a doc or untracked artefact — not a code change)
    return 'smoke'


def resolve_tia_mode(modified_files: list[str]) -> str:
    """
    Given a list of modified file paths, return the required test mode.
    The highest mode level across all files wins.
    """
    if not modified_files:
        return 'smoke'
    level = max(MODE_LEVEL[_file_to_mode(f)] for f in modified_files)
    return LEVEL_MODE[level]


def filter_by_mode(results, mode: str):
    """Filter test results to match the given mode's category/severity scope."""
    if mode == 'smoke':
        return [r for r in results if r.category in SMOKE_CATS and r.severity in SMOKE_SEVERITIES]
    elif mode == 'smart':
        return [r for r in results if r.category in SMART_CATS]
    else:  # full
        return list(results)


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

    # ── Load all modules ──────────────────────────────────────────────────────
    loaded = []
    for mod_name in DOMAIN_MODULES:
        if args.domain and args.domain not in mod_name:
            continue
        try:
            importlib.import_module(mod_name)
            loaded.append(mod_name)
        except Exception as e:
            print(f"{RED}ERROR loading {mod_name}: {e}{RESET}")

    all_results = registry.results

    # ── Determine effective mode ──────────────────────────────────────────────
    tia_header = ""

    if args.mode == "component":
        if not args.component:
            print(f"{RED}ERROR: --mode component requires --component <name>{RESET}")
            sys.exit(1)
        component = args.component.lower()
        results = [
            r for r in all_results
            if component in r.block_id.lower() or component in r.test_id.lower()
        ]
        if not results:
            print(f"{YELLOW}WARNING: no tests found for component '{args.component}'{RESET}")
        mode = "component"

    elif args.domain:
        results = list(all_results)
        mode = "full"

    elif args.mode in ("smoke", "smart", "full"):
        # Explicit mode — no TIA
        mode = args.mode
        results = filter_by_mode(all_results, mode)

    else:
        # Default: TIA auto-routing via git diff
        modified = get_modified_files()
        if modified is None:
            # git unavailable — safe default to smart
            mode = "smart"
            tia_header = f"{YELLOW}WARNING: git diff indisponível — usando modo smart{RESET}"
        else:
            mode = resolve_tia_mode(modified)
            changed_names = [Path(f).name for f in modified] if modified else []
            files_str = ", ".join(changed_names) if changed_names else "nenhum"
            tia_header = (
                f"{CYAN}{BOLD}TIA — arquivos modificados: {files_str}{RESET}\n"
                f"{CYAN}   Modo selecionado: {mode.upper()}{RESET}"
            )
        results = filter_by_mode(all_results, mode)

    # Legacy --quick flag
    if args.quick:
        results = [r for r in all_results if r.severity == "CRITICAL"]
        mode = "quick"

    if tia_header:
        print(f"\n{tia_header}")

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
        "smoke": f"SMOKE (~{len(results)} tests — DOM_REF CRITICAL + SPEC + SMOKE)",
        "smart": f"SMART (~{len(results)} tests — smoke + RENDER + TAB_SWITCH + DOM_REF HIGH + PRIVACY)",
        "full":  f"FULL ({len(results)} tests — all categories)",
        "component": f"COMPONENT: {args.component}" if args.component else "COMPONENT",
        "quick": "QUICK (CRITICAL only)",
    }
    mode_label = mode_labels.get(mode, mode.upper())
    if args.domain:
        mode_label = f"DOMAIN: {args.domain} (full)"

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
        help="[legacy] Run only CRITICAL tests",
    )
    parser.add_argument(
        "--domain", type=str,
        help="Run only a specific domain (e.g. fire, factor, rf) — full mode",
    )
    parser.add_argument(
        "--mode",
        choices=["smoke", "smart", "full", "component"],
        default=None,
        help=(
            "smoke: ~113 tests — DOM_REF CRITICAL + SPEC + SMOKE. "
            "smart: ~235 tests — smoke + RENDER + TAB_SWITCH + DOM_REF HIGH + PRIVACY. "
            "full: all tests (~576) — adds DATA + VALUE contracts. "
            "component: tests for a specific component (requires --component). "
            "Default: TIA auto-routing via git diff."
        ),
    )
    parser.add_argument(
        "--component", type=str,
        help="Component/block ID to test when using --mode component (e.g. fire-trilha)",
    )
    parser.add_argument(
        "--smart", action="store_true",
        help="[legacy] Alias for TIA auto-routing (now the default behavior)",
    )
    args = parser.parse_args()
    # --smart flag with no --mode → treat as TIA auto (default)
    if args.smart and args.mode is None:
        args.mode = None  # already the default
    run(args)


if __name__ == "__main__":
    main()
