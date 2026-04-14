#!/usr/bin/env python3
"""
Dashboard Complete Test Suite — Orquestrador Master
Executa todos os 5 níveis de validação antes de qualquer push

Uso:
    python3 scripts/run_all_dashboard_tests.py              # full suite
    python3 scripts/run_all_dashboard_tests.py --quick      # só CRITICAL fails
    python3 scripts/run_all_dashboard_tests.py --no-render  # skip Playwright (rápido)

Fluxo:
    1️⃣  Schema Validation (spec.json ↔ data.json)
    2️⃣  HTML Render Check (elementos populados)
    3️⃣  Component Render Status (spec mapping — 66 componentes)
    4️⃣  Dashboard Test Suite (559 testes, todas as categorias)
    5️⃣  Playwright Local Validation (bootstrap, tabs, CSS, KPIs, errors)

Resultado: DEPLOY APPROVED ou BLOQUEADO com detalhes do erro
"""

import subprocess
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.parent
TESTS_DIR = ROOT / "dashboard" / "tests"

# ANSI colors
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def run_command(cmd, name, optional=False):
    """Run command and return (success, output)"""
    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"  {name}")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}\n")

    try:
        result = subprocess.run(
            cmd,
            shell=isinstance(cmd, str),
            capture_output=True,
            text=True,
            timeout=120,
        )
        print(result.stdout)

        success = result.returncode == 0
        if not success and not optional:
            print(result.stderr)

        return success, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        print(f"{RED}❌ Timeout (>120s){RESET}")
        return False, "", "Timeout"
    except Exception as e:
        print(f"{RED}❌ Error: {e}{RESET}")
        return False, "", str(e)


def main():
    parser = argparse.ArgumentParser(description="Dashboard Complete Test Suite")
    parser.add_argument("--quick", action="store_true", help="Skip non-critical tests")
    parser.add_argument("--no-render", action="store_true", help="Skip Playwright (component render status)")
    parser.add_argument("--no-playwright", action="store_true", help="Skip final Playwright validation")

    args = parser.parse_args()

    results = {
        "timestamp": datetime.now().isoformat(),
        "tests": {},
        "summary": {}
    }

    # ─── 1️⃣  SCHEMA VALIDATION ───────────────────────────────────────────────
    success, stdout, stderr = run_command(
        f"python3 {ROOT}/scripts/validate_schema.py",
        "1️⃣  SCHEMA VALIDATION (spec.json ↔ data.json)"
    )
    results["tests"]["schema"] = {
        "success": success,
        "output": stdout,
    }

    if not success:
        print(f"{RED}❌ Schema validation FAILED{RESET}")
        results["summary"]["blocker"] = "schema_invalid"
        return results, False

    # ─── 2️⃣  HTML RENDER CHECK ───────────────────────────────────────────────
    success, stdout, stderr = run_command(
        f"python3 {ROOT}/scripts/test_rendered_html.py",
        "2️⃣  HTML RENDER CHECK (elementos populados)"
    )
    results["tests"]["html_render"] = {
        "success": success,
        "output": stdout,
    }

    # ─── 3️⃣  COMPONENT RENDER STATUS (optional se --no-render) ───────────────
    if not args.no_render:
        success, stdout, stderr = run_command(
            f"cd {ROOT} && node {ROOT}/dashboard/tests/debug_render_status.js",
            "3️⃣  COMPONENT RENDER STATUS (spec mapping)",
            optional=False
        )
        results["tests"]["render_status"] = {
            "success": success,
            "output": stdout,
        }

        # Parse render status from output
        if "RENDERED:" in stdout:
            parts = stdout.split("RENDERED:")[1].split("/")[0].strip().split()
            rendered = int(parts[0])
            # Check if we have the render_status.json
            render_status_file = TESTS_DIR / "render_status.json"
            if render_status_file.exists():
                try:
                    data = json.loads(render_status_file.read_text())
                    results["tests"]["render_status"]["rendered"] = data["summary"]["rendered"]
                    results["tests"]["render_status"]["total"] = data["summary"]["total"]
                except:
                    pass

    # ─── 4️⃣  DASHBOARD TEST SUITE (559 testes) ─────────────────────────────
    success, stdout, stderr = run_command(
        f"python3 {ROOT}/scripts/test_dashboard.py",
        "4️⃣  DASHBOARD TEST SUITE (559 testes)"
    )
    results["tests"]["dashboard"] = {
        "success": success,
        "output": stdout,
    }

    # Parse test results
    if "PASS:" in stdout:
        import re
        pass_match = re.search(r'PASS: (\d+)', stdout)
        fail_match = re.search(r'FAIL: (\d+)', stdout)
        if pass_match:
            results["tests"]["dashboard"]["passed"] = int(pass_match.group(1))
        if fail_match:
            results["tests"]["dashboard"]["failed"] = int(fail_match.group(1))

    if not success:
        # Check if deploy is still approved
        if "DEPLOY APPROVED" not in stdout:
            print(f"{RED}❌ Tests FAILED and deploy NOT approved{RESET}")
            results["summary"]["blocker"] = "critical_tests_failed"
            return results, False

    # ─── 5️⃣  PLAYWRIGHT LOCAL VALIDATION (optional se --no-playwright) ────────
    if not args.no_playwright:
        # Start server
        print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
        print(f"  5️⃣  PLAYWRIGHT LOCAL VALIDATION (bootstrap, tabs, CSS, KPIs, errors)")
        print(f"{CYAN}{BOLD}{'='*70}{RESET}\n")

        subprocess.Popen(
            f"python3 -m http.server 8765 -d {ROOT}/dashboard > /tmp/server.log 2>&1",
            shell=True
        )
        import time
        time.sleep(2)

        success, stdout, stderr = run_command(
            f"cd {ROOT} && node {ROOT}/dashboard/test_via_http.mjs",
            "",
            optional=False
        )
        results["tests"]["playwright"] = {
            "success": success,
            "output": stdout,
        }

        # Kill server
        subprocess.run("pkill -f 'python3 -m http.server 8765'", shell=True)

    # ─── SUMMARY ──────────────────────────────────────────────────────────────
    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"  📊 FINAL SUMMARY")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}\n")

    all_passed = all(r.get("success", False) for r in results["tests"].values())

    test_summary = []
    for test_name, test_result in results["tests"].items():
        status = "✅ PASS" if test_result.get("success") else "❌ FAIL"
        if "passed" in test_result:
            test_summary.append(f"  {status} — {test_name} ({test_result['passed']}/{test_result.get('passed', 0) + test_result.get('failed', 0)})")
        elif "rendered" in test_result:
            test_summary.append(f"  {status} — {test_name} ({test_result['rendered']}/{test_result['total']})")
        else:
            test_summary.append(f"  {status} — {test_name}")

    print("\n".join(test_summary))

    if all_passed:
        print(f"\n{GREEN}{BOLD}✅ ALL TESTS PASSED — DEPLOY APPROVED{RESET}")
        print(f"{GREEN}Safe to git push{RESET}\n")
        results["summary"]["status"] = "APPROVED"
        return results, True
    else:
        print(f"\n{RED}{BOLD}❌ SOME TESTS FAILED — DO NOT PUSH{RESET}")
        print(f"{RED}Fix issues and re-run this script{RESET}\n")
        results["summary"]["status"] = "BLOCKED"
        return results, False


if __name__ == "__main__":
    results, approved = main()

    # Save results
    output_file = Path("dashboard/tests/full_test_run.json")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(json.dumps(results, indent=2))

    print(f"Results saved to: {output_file}")
    sys.exit(0 if approved else 1)
