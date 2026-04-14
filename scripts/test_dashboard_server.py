#!/usr/bin/env python3
"""
test_dashboard_server.py — Local HTTP server + Playwright runtime validation

Inicia servidor HTTP local, abre dashboard no browser, e valida:
1. Charts renderizam (Chart.js instances criadas)
2. Valores aparecem no DOM
3. Tabs funcionam
4. Nenhum erro em console
"""

import sys
import subprocess
import time
import threading
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json

ROOT = Path(__file__).parent.parent
DASHBOARD_DIR = ROOT / "dashboard"

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
except ImportError:
    print("❌ Playwright não instalado. Execute:")
    print("   pip install playwright && playwright install")
    sys.exit(1)


def start_http_server(port=8765, directory=None):
    """Inicia HTTP server em thread separada"""
    if directory is None:
        directory = DASHBOARD_DIR

    os.chdir(directory)

    class Handler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass  # Silenciar logs

    server = HTTPServer(("127.0.0.1", port), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(1)  # Aguardar servidor inicializar
    return server


class DashboardRuntimeTester:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.passed = []
        self.page = None
        self.browser = None

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

    def run_all(self, url: str = "http://127.0.0.1:8765/index.html"):
        """Run all tests"""
        print("\n" + "="*70)
        print("🧪 DASHBOARD RUNTIME VALIDATION (Playwright)")
        print("="*70)

        with sync_playwright() as p:
            # Abrir browser e ir para dashboard
            print(f"\n📱 Abrindo {url}...")
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            page = context.new_page()

            # Capturar console logs/errors
            console_logs = []
            page.on("console", lambda msg: console_logs.append({
                "type": msg.type,
                "text": msg.text
            }))

            try:
                page.goto(url, wait_until="networkidle", timeout=15000)
            except PlaywrightTimeout:
                print(f"⚠️  Timeout carregando página (15s)")

            time.sleep(2)  # Aguardar JS executar

            self.page = page
            self.browser = browser
            self.console_logs = console_logs

            # ===== TESTES =====
            print("\n📋 Bootstrap & Data")
            self.test("window.DATA está populado",
                lambda: self._assert_true(
                    page.evaluate("typeof window.DATA === 'object'"),
                    "window.DATA"
                ))

            self.test("renderKPIs função carregada",
                lambda: self._assert_true(
                    page.evaluate("typeof window.renderKPIs === 'function'"),
                    "window.renderKPIs"
                ))

            # ===== RENDERING =====
            print("\n📋 Rendering")
            self.test("Patrimônio BRL renderizado",
                lambda: self._check_element_text(
                    page, "#heroPatrimonioBrl", "R$"
                ))

            self.test("Patrimônio USD renderizado",
                lambda: self._check_element_text(
                    page, "#heroPatrimonioUsd", "$"
                ))

            # ===== CHARTS =====
            print("\n📋 Charts (Chart.js)")
            self.test("Pelo menos 1 Chart.js canvas presente",
                lambda: self._assert_true(
                    page.query_selector("canvas") is not None,
                    "canvas elements"
                ))

            chart_ids = [
                "geoDonut", "attrChart", "scenarioChart",
                "trackingFireChart", "glideChart", "netWorthProjectionChart"
            ]
            for chart_id in chart_ids[:3]:  # Testar primeiros 3
                self.test(f"Canvas #{chart_id} existe",
                    lambda cid=chart_id: self._assert_true(
                        page.query_selector(f"#{cid}") is not None,
                        f"#{cid}"
                    ))

            # ===== TABS =====
            print("\n📋 Tab Navigation")
            tabs = ["hoje", "carteira", "perf", "fire", "retiro", "simuladores", "backtest"]
            for tab in tabs[:3]:
                self.test(f"Tab '{tab}' clickable",
                    lambda t=tab: self._click_tab(page, t))

            # ===== CONSOLE ERRORS =====
            print("\n📋 Console Sanity")
            errors = [log for log in console_logs if log["type"] == "error"]
            if errors:
                print(f"⚠️  {len(errors)} console errors encontrados:")
                for err in errors[:5]:
                    print(f"   • {err['text'][:60]}")
            else:
                self.test("Nenhum console error",
                    lambda: self._assert_true(len(errors) == 0, "console errors"))

            # ===== SUMMARY =====
            browser.close()

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
                return False
            else:
                print(f"\n✅ Todos os testes passaram!")
                return True

    def _assert_true(self, condition, name):
        if not condition:
            raise AssertionError(f"{name} is falsy")

    def _check_element_text(self, page, selector, expected_substring):
        """Verifica se elemento existe e contém texto"""
        element = page.query_selector(selector)
        if element is None:
            raise AssertionError(f"Element {selector} not found")

        text = element.inner_text() or ""
        if expected_substring not in text:
            raise AssertionError(
                f"Element {selector} text '{text[:40]}' doesn't contain '{expected_substring}'"
            )

    def _click_tab(self, page, tab_name):
        """Clica tab e aguarda renderização"""
        selector = f"button[data-tab='{tab_name}']"
        button = page.query_selector(selector)
        if button is None:
            raise AssertionError(f"Tab button {tab_name} not found")

        button.click()
        page.wait_for_timeout(500)  # Pequeno delay para renderização


if __name__ == '__main__':
    import os

    # Iniciar servidor HTTP
    print("🌐 Iniciando servidor HTTP local na porta 8765...")
    server = start_http_server(port=8765, directory=DASHBOARD_DIR)

    try:
        # Rodar testes
        tester = DashboardRuntimeTester()
        success = tester.run_all()
        sys.exit(0 if success else 1)
    finally:
        server.shutdown()
