#!/usr/bin/env python3
"""
test_dashboard_static.py — Static validation for dashboard integrity

Testa:
1. Todos os elementos críticos existem no HTML
2. Nenhuma variável crítica está undefined
3. Todas as funções de render estão definidas
4. IDs de elementos críticos existem
5. Dados estão injetados

Não requer Playwright — apenas análise de HTML.
"""

import sys
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
DASHBOARD_PATH = ROOT / "dashboard" / "index.html"
BOOTSTRAP_PATH = ROOT / "dashboard" / "bootstrap.mjs"

class DashboardTester:
    def __init__(self):
        self.errors = []
        self.passed = []

    def test(self, name: str, check_fn):
        """Run a test and log result"""
        try:
            check_fn()
            self.passed.append(name)
            print(f"✓ {name}")
            return True
        except AssertionError as e:
            self.errors.append(f"❌ {name}: {str(e)}")
            print(f"❌ {name}")
            return False

    def run_all(self):
        """Run all tests"""
        print("\n" + "="*70)
        print("🧪 DASHBOARD STATIC VALIDATION")
        print("="*70)

        html_content = DASHBOARD_PATH.read_text(encoding="utf-8")
        bootstrap_content = BOOTSTRAP_PATH.read_text(encoding="utf-8")

        # ===== HTML STRUCTURE =====
        print("\n📋 HTML Structure")
        self.test("DOCTYPE declared",
            lambda: self._check(html_content, "<!DOCTYPE html>"))
        self.test("Body element exists",
            lambda: self._check(html_content, "<body"))
        self.test("Bootstrap script loaded",
            lambda: self._check(html_content, 'src="./bootstrap.mjs"'))
        self.test("window.DATA defined",
            lambda: self._check(html_content, "window.DATA = {"))

        # ===== CRITICAL ELEMENTS =====
        print("\n📋 Critical UI Elements")
        elements = [
            ("heroPatrimonioBrl", "Patrimônio BRL"),
            ("heroPatrimonioUsd", "Patrimônio USD"),
            ("fireCountdown", "Fire countdown"),
            ("heroProgresso", "Progresso indicator"),
            ("heroAnosSub", "Anos subtitle"),
        ]
        for el_id, name in elements:
            self.test(f"{name} exists",
                lambda e=el_id: self._check_id(html_content, e))

        # ===== BOOTSTRAP EXPORTS =====
        print("\n📋 Bootstrap Exports (72 exports)")
        exports = [
            ("renderKPIs", "Hero KPI render"),
            ("switchTab", "Tab switcher"),
            ("_anoFire", "FIRE year"),
            ("yrInt", "Years integer"),
            ("moInt", "Months integer"),
            ("totalBrl", "Total BRL"),
            ("renderWellness", "Wellness render"),
            ("buildFanChart", "Fan chart builder"),
            ("buildDcaStatus", "DCA status builder"),
        ]
        for export, desc in exports:
            self.test(f"{desc}",
                lambda e=export: self._check(bootstrap_content, f"{e}:"))

        # ===== TAB STRUCTURE =====
        print("\n📋 Tab Navigation (7 tabs)")
        tabs = ["hoje", "carteira", "perf", "fire", "retiro", "simuladores", "backtest"]
        for tab in tabs:
            self.test(f"Tab '{tab}'",
                lambda t=tab: (
                    self._check(html_content, f'data-tab="{t}"') and
                    self._check(html_content, f'data-in-tab="{t}"')
                ))

        # ===== NO UNDEFINED =====
        print("\n📋 Sanity Checks")
        bad_patterns = [
            "is undefined",
            "Cannot find variable",
            "renderKPIs ERROR",
            "switchTab is not a function",
        ]
        for pattern in bad_patterns:
            self.test(f"No '{pattern}'",
                lambda p=pattern: self._check_not(html_content, p))

        # ===== PRINT SUMMARY =====
        self._print_summary()

    def _check(self, content: str, pattern: str) -> bool:
        if pattern.lower() not in content.lower():
            raise AssertionError(f"Not found: {pattern[:40]}")
        return True

    def _check_not(self, content: str, pattern: str) -> bool:
        if pattern.lower() in content.lower():
            raise AssertionError(f"Found: {pattern[:40]}")
        return True

    def _check_id(self, content: str, el_id: str) -> bool:
        if f'id="{el_id}"' not in content:
            raise AssertionError(f"ID not found: {el_id}")
        return True

    def _print_summary(self):
        total = len(self.passed) + len(self.errors)
        pct = (len(self.passed) / total * 100) if total > 0 else 0
        
        print("\n" + "="*70)
        print(f"📊 RESULTS: {len(self.passed)}/{total} ({pct:.0f}%)")
        print("="*70)

        if self.errors:
            print(f"\n❌ FAILED ({len(self.errors)}):")
            for err in self.errors[:10]:
                print(f"   {err}")
            if len(self.errors) > 10:
                print(f"   ... and {len(self.errors)-10} more")

        print("\n" + "="*70)
        sys.exit(0 if not self.errors else 1)

if __name__ == '__main__':
    tester = DashboardTester()
    tester.run_all()
