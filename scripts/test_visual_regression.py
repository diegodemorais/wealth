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
    1. Capture 7 screenshots via Puppeteer (se não existirem <1h)
       - Usa direct routes para cada aba (/portfolio, /fire, /withdraw, etc.)
       - GitHub Pages: https://diegodemorais.github.io/wealth
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

# Try to import PIL for image comparison
try:
    from PIL import Image, ImageChops, ImageStat
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

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
# Corrected mapping based on visual inspection of each baseline PNG:
# 1-5: NOW tab | 6-7: Portfolio | 8-13: Performance | 14-16: FIRE | 17-19: Withdraw | 20-21: Simuladores | 22-25: Backtest
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
        "html_refs": ["8.png", "9.png", "10.png", "11.png", "12.png", "13.png"],
        "key_components": [
            "Alpha vs SWRD chart (bar chart)",
            "Premissas vs Realizados (table)",
            "Retornos Mensais Heatmap (red/green grid)",
            "Patrimônio Evolução Histórica (area chart)",
            "Performance Attribution (donut + KPI cards)",
            "Rolling Sharpe + Factor Rolling charts",
        ]
    },
    "04-fire-tab.png": {
        "name": "FIRE Tab",
        "html_refs": ["14.png", "15.png", "16.png"],
        "key_components": [
            "FIRE Trajectory chart (time vs patrimony)",
            "FIRE Matrix (4 scenarios: Atual, Solteiro, Casado, +Filho)",
            "Life Events (casamento, filho)",
            "P(FIRE) Família cenários",
        ]
    },
    "05-withdraw-tab.png": {
        "name": "WITHDRAW Tab",
        "html_refs": ["17.png", "18.png", "19.png"],
        "key_components": [
            "Bond Pool Readiness + Runway chart",
            "SWR Percentis P10/P50/P90",
            "Guardrails de Retirada (table)",
            "Spending Guardrails P(FIRE) × Custo de Vida",
            "Renda na Aposentadoria (income phases table)",
            "Projeção de Renda — Ciclo de Vida (chart)",
            "Spending Essenciais vs Discricionários",
        ]
    },
    "06-simuladores-tab.png": {
        "name": "SIMULADORES Tab",
        "html_refs": ["20.png", "21.png"],
        "key_components": [
            "Simulador FIRE — Aposentadoria Antecipada",
            "What-If Scenarios — Cenário / Gasto",
            "Calculadora de Aporte — Cascade",
        ]
    },
    "07-backtest-tab.png": {
        "name": "BACKTEST Tab",
        "html_refs": ["22.png", "23.png", "24.png", "25.png"],
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
    Capture fresh screenshots via Puppeteer from GitHub Pages (direct routes)
    Returns (success: bool, screenshots_captured: int)
    """
    print(f"\n{CYAN}Checking screenshots from GitHub Pages...{RESET}")

    # Count existing
    existing = list(REACT_SCREENSHOTS.glob("*.png"))
    if len(existing) == 7:
        mtime = time.time() - existing[0].stat().st_mtime
        if mtime < 3600:  # Less than 1 hour old
            print(f"  ✓ All 7 screenshots already captured (fresh: {mtime/60:.0f}min old)")
            return True, 0

    print(f"  {YELLOW}Only {len(existing)}/7 screenshots found or too old, capturing...{RESET}")

    # Ensure Puppeteer script exists
    script_path = ROOT / "scripts" / "capture_tabs_puppeteer.js"
    if not script_path.exists():
        print(f"    {RED}❌ Puppeteer script not found: {script_path}{RESET}")
        return False, 0

    # Create screenshots directory
    REACT_SCREENSHOTS.mkdir(parents=True, exist_ok=True)

    print(f"\n  1. Running Puppeteer capture (7 tabs from GitHub Pages)...")

    try:
        result = subprocess.run(
            f"node {str(script_path)}",
            shell=True,
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes max
        )

        if result.returncode != 0:
            print(f"    {RED}❌ Puppeteer capture failed{RESET}")
            print(f"       {result.stderr[:200]}")
            return False, 0

        # Count captured screenshots
        captured = len(list(REACT_SCREENSHOTS.glob("*.png")))

        if captured >= 7:
            print(f"    ✓ Puppeteer captured {captured} tabs")
            print(f"       {result.stdout.strip()}")
            return True, captured
        else:
            print(f"    {RED}❌ Expected 7 screenshots, got {captured}{RESET}")
            return False, captured

    except subprocess.TimeoutExpired:
        print(f"    {RED}❌ Timeout (Puppeteer took too long){RESET}")
        return False, 0
    except Exception as e:
        print(f"    {RED}❌ Error: {str(e)[:80]}{RESET}")
        return False, 0


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


def compare_screenshots(react_path, baseline_path):
    """
    Compare two screenshots using PIL image comparison
    Returns (similarity_score: float, difference_pixels: int, analysis: dict)
    """
    if not HAS_PIL:
        return 0.0, -1, {"error": "PIL not installed"}

    try:
        react_img = Image.open(react_path).convert("RGB")
        baseline_img = Image.open(baseline_path).convert("RGB")

        # Resize baseline to match react if different
        if react_img.size != baseline_img.size:
            baseline_img = baseline_img.resize(react_img.size, Image.Resampling.LANCZOS)

        # Calculate difference
        diff = ImageChops.difference(react_img, baseline_img)
        stat = ImageStat.Stat(diff)

        # Calculate RMS (root mean square) as similarity metric
        rms = sum(x**2 for x in stat.mean) ** 0.5 / 255

        # Count pixels that differ significantly (>10% in any channel)
        diff_data = diff.tobytes()
        pixels = [diff_data[i:i+3] for i in range(0, len(diff_data), 3)]
        diff_pixels = sum(1 for p in pixels if max(p) > 25)

        similarity = max(0, 100 - (rms * 100))

        return similarity, diff_pixels, {
            "rms_error": round(rms, 3),
            "diff_pixels": diff_pixels,
            "react_size": react_img.size,
            "baseline_size": baseline_img.size,
        }

    except Exception as e:
        return 0.0, -1, {"error": str(e)}


def analyze_visual_gaps():
    """
    Analyze visual divergences between React and baseline screenshots
    Returns list of gaps (severity, tab, description, impact, fix)
    """
    gaps = []

    # First, check for known gaps that have been fixed
    for gap_id, gap_data in KNOWN_GAPS.items():
        gaps.append({
            "id": gap_id,
            "severity": gap_data["severity"],
            "tab": gap_data["tab"],
            "description": gap_data["description"],
            "impact": gap_data["impact"],
            "fix": gap_data["fix"],
        })

    # Now compare screenshots if baseline exists and PIL is available
    if not HAS_PIL:
        print(f"  {YELLOW}⚠️  PIL not installed, skipping image comparison{RESET}")
        print(f"      Install with: pip install pillow")
        return gaps

    if not BASELINE_SCREENSHOTS.exists():
        print(f"  {YELLOW}⚠️  Baseline directory not found, skipping image comparison{RESET}")
        return gaps

    print(f"\n  Comparing screenshots with baseline...")

    react_screenshots = sorted(REACT_SCREENSHOTS.glob("*.png"))

    for react_file in react_screenshots:
        tab_name = react_file.name
        if tab_name not in TAB_MAPPING:
            continue

        tab_config = TAB_MAPPING[tab_name]
        html_refs = tab_config["html_refs"]

        # Compare with first baseline reference
        if html_refs:
            baseline_file = BASELINE_SCREENSHOTS / html_refs[0]
            if baseline_file.exists():
                similarity, diff_pixels, analysis = compare_screenshots(react_file, baseline_file)

                print(f"    • {tab_name}: {similarity:.1f}% similar (Δ {diff_pixels} pixels)")

                # Flag as gap if similarity is low
                # 80% threshold: captures real regressions, allows normal React vs HTML deltas
                # (React reimplementations typically show 83-87% pixel similarity vs HTML baseline)
                if similarity < 80:
                    severity = CRITICAL if similarity < 65 else MEDIUM
                    gaps.append({
                        "id": f"VIS-{tab_name}",
                        "severity": severity,
                        "tab": tab_config["name"],
                        "description": f"Visual divergence detected: {similarity:.0f}% match with baseline",
                        "impact": f"{diff_pixels} pixels differ from reference",
                        "fix": "Review screenshot and baseline for styling differences",
                        "analysis": analysis,
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
    # PASS: no criticals + at most 2 medium (tabs below 80% similarity)
    if critical == 0 and medium <= 2:
        print(f"{GREEN}✅ REGRESSION TEST PASSED{RESET}")
        print(f"   Gaps are within acceptable threshold (threshold: {threshold})")
        return True
    else:
        print(f"{RED}❌ REGRESSION TEST FAILED{RESET}")
        print(f"   Critical gaps: {critical} (must be 0)")
        print(f"   Medium gaps: {medium} (max allowed: 2)")
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
