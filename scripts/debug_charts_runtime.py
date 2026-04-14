#!/usr/bin/env python3
"""
debug_charts_runtime.py — Runtime debugging de chart rendering

Abre o dashboard em navegador real (Playwright), captura:
1. Todos console logs/errors
2. window.DATA status
3. window.buildBacktest exists?
4. Clica tab → verifica se canvas renderizou
"""

import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).parent.parent
DASHBOARD_URL = "http://127.0.0.1:8765/index.html"

def run_debug():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        # Capturar todos os logs
        logs = []
        def on_console(msg):
            logs.append({
                "type": msg.type,
                "text": msg.text,
                "location": msg.location
            })
            print(f"[{msg.type.upper()}] {msg.text}")

        page.on("console", on_console)

        # Navegar
        print(f"\n🔍 Abrindo {DASHBOARD_URL}...")
        try:
            page.goto(DASHBOARD_URL, wait_until="load", timeout=15000)
        except Exception as e:
            print(f"❌ Erro ao carregar página: {e}")
            browser.close()
            return

        import time
        time.sleep(2)

        # Check DATA
        print("\n" + "="*70)
        print("📊 WINDOW STATE")
        print("="*70)
        try:
            data_type = page.evaluate("typeof window.DATA")
            data_keys = page.evaluate("window.DATA ? Object.keys(window.DATA).length : 0")
            print(f"✓ window.DATA type: {data_type}")
            print(f"✓ window.DATA keys: {data_keys}")
        except Exception as e:
            print(f"❌ Erro checando DATA: {e}")

        # Check buildBacktest
        try:
            bb_type = page.evaluate("typeof window.buildBacktest")
            print(f"✓ window.buildBacktest: {bb_type}")
        except Exception as e:
            print(f"❌ Erro checando buildBacktest: {e}")

        # Check if charts object exists
        try:
            charts_type = page.evaluate("typeof window.charts")
            print(f"✓ window.charts: {charts_type}")
        except Exception as e:
            print(f"❌ Erro checando charts: {e}")

        # Check backtestR5
        try:
            br5_exists = page.evaluate("window.DATA?.backtestR5 ? 'exists' : 'missing'")
            print(f"✓ DATA.backtestR5: {br5_exists}")
        except Exception as e:
            print(f"❌ Erro checando backtestR5: {e}")

        # Clicar na aba Backtest
        print("\n" + "="*70)
        print("🔄 CLICANDO BACKTEST TAB")
        print("="*70)
        try:
            btn = page.query_selector("button[data-tab='backtest']")
            if btn:
                print("✓ Botão encontrado")
                btn.click()
                time.sleep(1)  # Aguardar renderização
                print("✓ Tab clicado")
            else:
                print("❌ Botão backtest não encontrado")
        except Exception as e:
            print(f"❌ Erro clicando botão: {e}")

        # Check canvas
        print("\n" + "="*70)
        print("🎨 CANVAS STATE")
        print("="*70)
        try:
            canvas_exists = page.query_selector("#backtestChart")
            if canvas_exists:
                print("✓ Canvas #backtestChart existe")
                # Verificar se Chart.js o preencheu
                has_chart = page.evaluate("""
                    () => {
                        const canvas = document.getElementById('backtestChart');
                        if (!canvas) return false;
                        const ctx = canvas.getContext('2d');
                        // Se Chart.js renderizou, haverá dados no canvas
                        const imageData = ctx.getImageData(0, 0, 1, 1);
                        return imageData.data[3] > 0; // Check alpha channel
                    }
                """)
                if has_chart:
                    print("✓ Canvas foi renderizado (pixels presentes)")
                else:
                    print("❌ Canvas vazio (sem pixels)")
            else:
                print("❌ Canvas #backtestChart não encontrado")
        except Exception as e:
            print(f"❌ Erro checando canvas: {e}")

        # List all console errors
        print("\n" + "="*70)
        print("📋 CONSOLE LOGS")
        print("="*70)
        errors = [l for l in logs if l["type"] == "error"]
        if errors:
            print(f"❌ {len(errors)} console errors encontrados:")
            for err in errors:
                print(f"   • {err['text'][:100]}")
        else:
            print("✓ Nenhum console error")

        warnings = [l for l in logs if l["type"] == "warning"]
        if warnings:
            print(f"⚠️  {len(warnings)} console warnings:")
            for w in warnings:
                print(f"   • {w['text'][:100]}")

        # Manter browser aberto por 5s para inspeção
        print("\n💡 Browser aberto para inspeção... (fechando em 5s)")
        time.sleep(5)
        browser.close()

if __name__ == '__main__':
    run_debug()
