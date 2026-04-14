#!/usr/bin/env python3
"""
debug_tab_click.py — Verificar o que acontece quando clica no tab
"""

from pathlib import Path
from playwright.sync_api import sync_playwright
import time

URL = "http://127.0.0.1:8765/index.html"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # Capturar console logs DURANTE click
    logs = []
    def on_console(msg):
        logs.append(msg.text)
        print(f"[{msg.type.upper()}] {msg.text}")

    page.on("console", on_console)

    page.goto(URL, wait_until="load", timeout=15000)
    time.sleep(2)

    print("\n" + "="*70)
    print("📌 CLICANDO TAB BACKTEST...")
    print("="*70)

    # Clicar e observar logs
    page.click("button[data-tab='backtest']")
    time.sleep(2)

    print("\n" + "="*70)
    print("🔍 APÓS TAB CLICK")
    print("="*70)

    # Verificar status
    status = page.evaluate("""
        () => ({
            charts_backtest_exists: !!window.charts.backtest,
            canvas_pixels: !!document.getElementById('backtestChart')?.getContext('2d').getImageData(0,0,1,1).data[3],
            switchTab_called: window._lastTabSwitched || 'unknown'
        })
    """)
    print(f"Status: {status}")

    # Filtrar logs para "backtest" e "buildBacktest"
    print("\n" + "="*70)
    print("📋 LOGS RELEVANTES")
    print("="*70)
    for log in logs:
        if any(x in log.lower() for x in ['backtest', 'initTab', 'buildbacktest', 'error', 'switch']):
            print(f"  • {log}")

    time.sleep(2)
    browser.close()
