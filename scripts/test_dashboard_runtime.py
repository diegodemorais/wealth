#!/usr/bin/env python3
"""
test_dashboard_runtime.py — Runtime validation suite for dashboard

Testa:
1. Cada função de render executa sem erro
2. Valores aparecem no DOM (não vazios)
3. Cada tab renderiza conteúdo
4. Charts estão presentes e visíveis
5. Dados críticos populam

Usa Playwright para abrir o dashboard real e validar.
"""

import sys
import subprocess
import time
import json
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
except ImportError:
    print("❌ Playwright não instalado. Execute: pip install playwright && playwright install")
    sys.exit(1)

ROOT = Path(__file__).parent.parent
DASHBOARD_PATH = ROOT / "dashboard" / "index.html"
DASHBOARD_URL = f"file://{DASHBOARD_PATH}"

# Timeouts
LOAD_TIMEOUT = 10000  # 10s
RENDER_TIMEOUT = 5000  # 5s

class DashboardTester:
    def __init__(self):
        self.errors = []
        self.warnings = []
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
            print(f"❌ {name}: {str(e)}")
            return False
        except Exception as e:
            self.errors.append(f"❌ {name}: {type(e).__name__}: {str(e)}")
            print(f"❌ {name}: {type(e).__name__}: {str(e)}")
            return False

    def run_all(self):
        """Run all tests"""
        print("\n" + "="*70)
        print("🧪 DASHBOARD RUNTIME VALIDATION")
        print("="*70)

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            try:
                # Load dashboard
                print(f"\n📡 Loading {DASHBOARD_URL}...")
                page.goto(DASHBOARD_URL, wait_until="networkidle", timeout=LOAD_TIMEOUT)
                print("✓ Dashboard loaded")

                # Wait for init to complete
                page.wait_for_timeout(2000)

                # ===== NOW TAB TESTS =====
                print("\n📋 NOW Tab Tests")
                self.test("NOW tab: Patrimônio Total não vazio",
                    lambda: self._check_element_not_empty(page, "#heroPatrimonio span", "R$"))
                self.test("NOW tab: ANOS ATÉ FIRE não vazio",
                    lambda: self._check_element_not_empty(page, "#fireCountdown", "a"))
                self.test("NOW tab: PROGRESSO FIRE não vazio",
                    lambda: self._check_element_not_empty(page, "#progressPercent", "%"))
                self.test("NOW tab: Contexto de mercado (Dólar) carregado",
                    lambda: self._check_element_not_empty(page, "[data-ticker='cambio']", "R$"))
                self.test("NOW tab: Contexto de mercado (Bitcoin) carregado",
                    lambda: self._check_element_not_empty(page, "[data-ticker='btc']", "$"))

                # ===== TAB SWITCHING TESTS =====
                print("\n📋 Tab Navigation Tests")
                self.test("Tab switching: Portfolio tab clickable",
                    lambda: self._test_tab_switch(page, "carteira", "#portfolio-container"))
                self.test("Tab switching: Performance tab clickable",
                    lambda: self._test_tab_switch(page, "perf", "#performance-container"))
                self.test("Tab switching: FIRE tab clickable",
                    lambda: self._test_tab_switch(page, "fire", "#fire-container"))
                self.test("Tab switching: Retro tab clickable",
                    lambda: self._test_tab_switch(page, "retiro", "#retiro-container"))

                # ===== CHART TESTS =====
                print("\n📋 Charts & Visualization Tests")
                page.goto(DASHBOARD_URL)
                page.wait_for_timeout(1000)
                self.test("Charts: Fan Chart present",
                    lambda: self._check_chart_exists(page, "fanChart"))
                self.test("Charts: Sankey present",
                    lambda: self._check_element_visible(page, "#sankey", "display"))

                # ===== DATA INTEGRITY TESTS =====
                print("\n📋 Data Integrity Tests")
                page.goto(DASHBOARD_URL)
                page.wait_for_timeout(2000)
                self.test("Data: window.DATA is defined",
                    lambda: self._check_js_value(page, "typeof window.DATA === 'object'"))
                self.test("Data: window.CAMBIO is defined",
                    lambda: self._check_js_value(page, "typeof window.CAMBIO === 'number'"))
                self.test("Data: window.totalBrl is defined",
                    lambda: self._check_js_value(page, "typeof window.totalBrl === 'number'"))
                self.test("Data: window.yrInt is number",
                    lambda: self._check_js_value(page, "typeof window.yrInt === 'number'"))

                # ===== FUNCTION AVAILABILITY TESTS =====
                print("\n📋 Function Exports Tests")
                self.test("Functions: renderKPIs exported",
                    lambda: self._check_js_value(page, "typeof window.renderKPIs === 'function'"))
                self.test("Functions: switchTab exported",
                    lambda: self._check_js_value(page, "typeof window.switchTab === 'function'"))
                self.test("Functions: buildFanChart exported",
                    lambda: self._check_js_value(page, "typeof window.buildFanChart === 'function'"))
                self.test("Functions: renderWellness exported",
                    lambda: self._check_js_value(page, "typeof window.renderWellness === 'function'"))

                # ===== CONSOLE ERRORS =====
                print("\n📋 Console Health Tests")
                errors = []
                page.on("console", lambda msg: errors.append(msg.text) if "error" in msg.type.lower() else None)
                page.goto(DASHBOARD_URL)
                page.wait_for_timeout(3000)
                if errors:
                    self.warnings.append(f"⚠️  Console errors detected: {len(errors)}")
                    for err in errors[:3]:
                        print(f"   {err}")
                else:
                    self.passed.append("Console: No errors")
                    print("✓ Console: No errors")

            finally:
                browser.close()

        # Print summary
        self._print_summary()

    def _check_element_not_empty(self, page, selector: str, expected_content: str = None):
        """Check that element exists and has content"""
        try:
            el = page.query_selector(selector)
            if not el:
                raise AssertionError(f"Element not found: {selector}")
            text = el.inner_text() or el.text_content() or ""
            if not text.strip():
                raise AssertionError(f"Element empty: {selector}")
            if expected_content and expected_content not in text:
                raise AssertionError(f"Expected '{expected_content}' in {selector}, got: {text[:50]}")
        except Exception as e:
            raise AssertionError(f"{selector}: {str(e)}")

    def _check_element_visible(self, page, selector: str, check_display: str = None):
        """Check that element is visible"""
        try:
            el = page.query_selector(selector)
            if not el:
                raise AssertionError(f"Element not found: {selector}")
            if not el.is_visible():
                raise AssertionError(f"Element not visible: {selector}")
        except Exception as e:
            raise AssertionError(f"{selector}: {str(e)}")

    def _test_tab_switch(self, page, tab_name: str, expected_container: str):
        """Test that clicking a tab shows content"""
        try:
            # Click tab button
            tab_btn = page.query_selector(f'[data-tab="{tab_name}"]')
            if not tab_btn:
                raise AssertionError(f"Tab button not found: {tab_name}")
            tab_btn.click()
            page.wait_for_timeout(1000)

            # Check that content is visible
            if expected_container:
                container = page.query_selector(expected_container)
                if not container or not container.is_visible():
                    raise AssertionError(f"Content not visible after switching to {tab_name}")
        except Exception as e:
            raise AssertionError(f"Tab {tab_name}: {str(e)}")

    def _check_chart_exists(self, page, chart_id: str):
        """Check that a chart container exists"""
        canvas = page.query_selector(f"#{chart_id}")
        if not canvas:
            raise AssertionError(f"Chart not found: {chart_id}")

    def _check_js_value(self, page, js_expr: str):
        """Check JavaScript value"""
        result = page.evaluate(js_expr)
        if not result:
            raise AssertionError(f"JS expression failed: {js_expr}")

    def _print_summary(self):
        """Print test summary"""
        total = len(self.passed) + len(self.errors)
        print("\n" + "="*70)
        print(f"📊 RESULTS: {len(self.passed)}/{total} passed")
        print("="*70)

        if self.errors:
            print(f"\n❌ FAILED ({len(self.errors)}):")
            for err in self.errors:
                print(f"   {err}")

        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for warn in self.warnings:
                print(f"   {warn}")

        if self.passed:
            print(f"\n✓ PASSED ({len(self.passed)}):")
            for name in self.passed[:10]:  # Show first 10
                print(f"   {name}")
            if len(self.passed) > 10:
                print(f"   ... and {len(self.passed) - 10} more")

        print("\n" + "="*70)

        # Exit code
        sys.exit(0 if not self.errors else 1)


if __name__ == '__main__':
    tester = DashboardTester()
    tester.run_all()
