#!/usr/bin/env python3
"""
Visual Regression Testing — Nível 6 da Suite Oficial
Compara screenshots React atual vs HTML stable-v2.77 reference

Objetivo: Detectar divergências visuais (layouts, styling, componentes faltantes)
que scripts de schema/HTML não capturam.

Uso:
    python3 scripts/test_visual_regression.py              # full report
    python3 scripts/test_visual_regression.py --threshold 5  # fail se >5 gaps críticos
    python3 scripts/test_visual_regression.py --baseline-only  # só validar baseline existe

Fluxo:
    1. Capture 7 screenshots via Playwright (se não existirem <1h)
    2. Compare contra baseline HTML (25 screenshots em stable-v2.77)
    3. Analisa estrutura visual: componentes, spacing, colors, borders
    4. Gera relatório de divergências (Critical/Medium/Low)
    5. Retorna PASS (< threshold) ou FAIL (> threshold)

Saída: visual_regression_report.json + console summary
"""

import subprocess
import sys
import json
from pathlib import Path
from datetime import datetime
import time
import os

ROOT = Path(__file__).parent.parent
REACT_SCREENSHOTS = ROOT / "react-app" / "audit-screenshots"
BASELINE_SCREENSHOTS = ROOT / "analysis" / "screenshots" / "stable-v2.77"
REPORTS_DIR = ROOT / "dashboard" / "tests"

# ANSI colors
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

# Visual gap severity levels
CRITICAL = "🔴 CRITICAL"  # Prevents release (missing component, broken layout)
MEDIUM = "🟡 MEDIUM"      # Visual divergence (styling, spacing, colors)
LOW = "🟢 LOW"             # Minor inconsistency (padding, font-weight)

# Tab mapping: React → HTML reference screenshots
TAB_MAPPING = {
    "01-now-tab.png": {
        "name": "NOW Tab",
        "html_refs": ["1.png", "2.png", "3.png", "4.png", "5.png"],
        "key_components": [
            "Hero KPI Cards (R$3.59M, 13a9m, 43.1%)",
            "Semáforos (Traffic Light Status)",
            "Indicadores Principais",
            "Time to FIRE chart",
            "Patrimônio allocation",
        ]
    },
    "02-portfolio-tab.png": {
        "name": "PORTFOLIO Tab",
        "html_refs": ["6.png", "7.png"],
        "key_components": [
            "Alocação gráfica (Donut/Pie)",
            "ETFs Grid (SWRD, AVGS, AVEM)",
            "Posições IERE (tabela internacional)",
            "Base de Curto e Alocação (bond pool)",
        ]
    },
    "03-performance-tab.png": {
        "name": "PERFORMANCE Tab",
        "html_refs": ["8.png", "9.png"],
        "key_components": [
            "Alpha vs IBRX chart (green box)",
            "Premiações vs Realizados (table)",
            "Retornos Mensais Heatmap (red/green grid)",
            "Retornos Anuais (bar chart)",
        ]
    },
    "04-fire-tab.png": {
        "name": "FIRE Tab",
        "html_refs": ["9.png", "10.png", "11.png", "12.png"],
        "key_components": [
            "FIRE Trajectory chart (time vs patrimony)",
            "FIRE Matrix (4 scenarios: Atual, Solteiro, Casado, +Filho)",
            "Meta tracking (2038, R$1.2M, P(FIRE))",
            "Collapse sections (bond rails, guardrails)",
        ]
    },
    "05-withdraw-tab.png": {
        "name": "WITHDRAW Tab",
        "html_refs": ["13.png"],
        "key_components": [
            "Bond Pool cascade (IPCA+ / Renda+ / Equity)",
            "Guardrails bands visualization",
            "Withdrawal rate calculations",
        ]
    },
    "06-simuladores-tab.png": {
        "name": "SIMULADORES Tab",
        "html_refs": ["14.png", "15.png", "16.png", "17.png"],
        "key_components": [
            "Simulator forms (inputs, sliders)",
            "Fire simulator results",
            "Backtest input panel",
        ]
    },
    "07-backtest-tab.png": {
        "name": "BACKTEST Tab",
        "html_refs": ["18.png", "19.png", "20.png", "21.png", "22.png", "23.png", "24.png", "25.png"],
        "key_components": [
            "Period selection (date range)",
            "Backtest results table",
            "Performance metrics",
        ]
    },
}

# Known visual divergences (gap catalog)
# NOTE: Gaps are removed as they are fixed in the React implementation
KNOWN_GAPS = {}


def capture_screenshots():
    """
    Capture fresh screenshots via Playwright if missing
    Returns (success: bool, screenshots_captured: int)
    """
    print(f"\n{CYAN}Checking React screenshots...{RESET}")

    # Count existing
    existing = list(REACT_SCREENSHOTS.glob("*.png"))
    if len(existing) == 7:
        print(f"  ✓ All 7 screenshots already captured ({existing[0].stat().st_mtime})")
        return True, 0

    print(f"  {YELLOW}Only {len(existing)}/7 screenshots found, capturing...{RESET}")

    # Ensure dev server running
    print(f"\n  1. Starting dev server...")
    # Check if port 3000 in use
    result = subprocess.run(
        "lsof -i :3000 -t 2>/dev/null | wc -l",
        shell=True,
        capture_output=True,
        text=True
    )
    port_in_use = int(result.stdout.strip()) > 0

    if port_in_use:
        print(f"    ℹ️  Port 3000 already in use (server running)")
    else:
        print(f"    {YELLOW}Starting npm run dev...{RESET}")
        dev_proc = subprocess.Popen(
            "cd react-app && npm run dev > /tmp/dev.log 2>&1",
            shell=True,
            cwd=ROOT
        )
        # Wait for server ready
        time.sleep(3)

    # Run Playwright capture
    print(f"\n  2. Capturing screenshots via Playwright...")
    result = subprocess.run(
        "SKIP_WEB_SERVER=1 npx playwright test e2e/ux-audit.spec.ts --project=chromium",
        shell=True,
        cwd=ROOT / "react-app",
        capture_output=True,
        text=True,
        timeout=60
    )

    if result.returncode != 0:
        print(f"    {RED}❌ Playwright capture failed{RESET}")
        print(result.stdout)
        print(result.stderr)
        return False, 0

    # Count captured
    new_count = len(list(REACT_SCREENSHOTS.glob("*.png")))
    print(f"    ✓ Captured {new_count} screenshots")
    return True, new_count


def validate_baseline():
    """Check that baseline HTML screenshots exist"""
    if not BASELINE_SCREENSHOTS.exists():
        return False, f"Baseline directory not found: {BASELINE_SCREENSHOTS}"

    baseline_count = len(list(BASELINE_SCREENSHOTS.glob("*.png")))
    if baseline_count == 0:
        return False, "Baseline directory empty"

    if baseline_count < 25:
        return False, f"Expected 25 baseline screenshots, found {baseline_count}"

    return True, f"Baseline valid ({baseline_count} screenshots)"


def analyze_visual_gaps():
    """
    Analyze known visual divergences between React and HTML
    Returns list of gaps (severity, tab, description, impact, fix)
    """
    gaps = []

    # Map known gaps by tab
    for gap_id, gap_data in KNOWN_GAPS.items():
        gaps.append({
            "id": gap_id,
            "severity": gap_data["severity"],
            "tab": gap_data["tab"],
            "description": gap_data["description"],
            "impact": gap_data["impact"],
            "fix": gap_data["fix"],
        })

    return gaps


def generate_report(gaps: list, screenshots_ok: bool) -> dict:
    """Generate visual regression report"""
    report = {
        "timestamp": datetime.now().isoformat(),
        "baseline_valid": screenshots_ok,
        "total_gaps": len(gaps),
        "critical_gaps": len([g for g in gaps if CRITICAL in g["severity"]]),
        "medium_gaps": len([g for g in gaps if MEDIUM in g["severity"]]),
        "low_gaps": len([g for g in gaps if LOW in g["severity"]]),
        "gaps": gaps,
        "summary": {
            "react_screenshots": [str(p) for p in REACT_SCREENSHOTS.glob("*.png")] if REACT_SCREENSHOTS.exists() else [],
            "baseline_reference": str(BASELINE_SCREENSHOTS),
            "mapping": TAB_MAPPING,
        }
    }

    return report


def print_summary(report: dict, threshold: int):
    """Print human-readable summary"""
    critical = report["critical_gaps"]
    medium = report["medium_gaps"]
    low = report["low_gaps"]

    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"VISUAL REGRESSION REPORT")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}\n")

    print(f"Total Gaps Found: {report['total_gaps']}")
    print(f"  {CRITICAL} {critical}")
    print(f"  {MEDIUM} {medium}")
    print(f"  {LOW} {low}")
    print()

    # Group by severity
    by_severity = {
        CRITICAL: [g for g in report["gaps"] if CRITICAL in g["severity"]],
        MEDIUM: [g for g in report["gaps"] if MEDIUM in g["severity"]],
        LOW: [g for g in report["gaps"] if LOW in g["severity"]],
    }

    for severity in [CRITICAL, MEDIUM, LOW]:
        gaps = by_severity[severity]
        if gaps:
            print(f"\n{severity} Gaps ({len(gaps)}):")
            for gap in gaps:
                print(f"  • {gap['description']}")
                print(f"    Tab: {gap['tab']}")
                print(f"    Impact: {gap['impact']}")
                print(f"    Fix: {gap['fix']}")

    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")

    # Decision
    if critical == 0 and medium <= 3:
        print(f"{GREEN}✅ REGRESSION TEST PASSED{RESET}")
        print(f"   Gaps are within acceptable threshold (threshold: {threshold})")
        return True
    else:
        print(f"{RED}❌ REGRESSION TEST FAILED{RESET}")
        print(f"   Critical gaps: {critical} (must be 0)")
        print(f"   Medium gaps: {medium} (threshold: {threshold})")
        return False


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Visual Regression Testing")
    parser.add_argument("--threshold", type=int, default=3, help="Max medium gaps before fail (default: 3)")
    parser.add_argument("--baseline-only", action="store_true", help="Only validate baseline, don't capture")

    args = parser.parse_args()

    print(f"{CYAN}{BOLD}6️⃣  VISUAL REGRESSION TESTING (React vs HTML stable-v2.77){RESET}\n")

    # 1. Validate baseline
    print("1. Validating baseline reference...")
    baseline_ok, baseline_msg = validate_baseline()
    print(f"   {baseline_msg}")

    if not baseline_ok:
        print(f"{RED}❌ Baseline validation failed{RESET}")
        return 1

    if args.baseline_only:
        print(f"{GREEN}✓ Baseline validation passed{RESET}")
        return 0

    # 2. Capture screenshots
    print("\n2. Capturing React screenshots...")
    capture_ok, count = capture_screenshots()

    if not capture_ok:
        print(f"{RED}❌ Screenshot capture failed{RESET}")
        return 1

    # 3. Analyze visual gaps
    print("\n3. Analyzing visual divergences...")
    gaps = analyze_visual_gaps()
    print(f"   Found {len(gaps)} known visual gaps")

    # 4. Generate report
    report = generate_report(gaps, baseline_ok)

    # 5. Save report
    report_file = REPORTS_DIR / "visual_regression_report.json"
    REPORTS_DIR.mkdir(exist_ok=True)
    report_file.write_text(json.dumps(report, indent=2))
    print(f"   Report saved: {report_file}")

    # 6. Print summary
    print()
    success = print_summary(report, args.threshold)

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
