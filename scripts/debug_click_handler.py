#!/usr/bin/env python3
"""
debug_click_handler.py — Verificar se onclick handler funciona
"""

from pathlib import Path
from playwright.sync_api import sync_playwright
import time

URL = "http://127.0.0.1:8765/index.html"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    page.goto(URL, wait_until="load", timeout=15000)
    time.sleep(2)

    print("\n" + "="*70)
    print("🔍 VERIFICANDO SWITCHTA B")
    print("="*70)

    # Verificar se switchTab existe
    st_exists = page.evaluate("typeof window.switchTab")
    print(f"✓ typeof window.switchTab: {st_exists}")

    # Verificar estado ANTES
    print("\n📊 ANTES DO CLICK:")
    state_before = page.evaluate("""
        () => ({
            backtest_initialized: window._tabInitialized?.backtest ?? false,
            charts_count: Object.keys(window.charts || {}).length,
            canvas_hidden: document.getElementById('backtestChart')?.parentElement?.classList.contains('tab-hidden')
        })
    """)
    import json
    print(json.dumps(state_before, indent=2))

    # Clicar no botão
    print("\n🔄 CLICANDO BOTÃO...")
    btn = page.query_selector("button[data-tab='backtest']")
    if btn:
        print("✓ Botão encontrado")
        # Tentar chamar onclick diretamente
        page.evaluate("document.querySelector(\"button[data-tab='backtest']\").click()")
        time.sleep(1)
    else:
        print("❌ Botão não encontrado")

    # Verificar estado DEPOIS
    print("\n📊 DEPOIS DO CLICK:")
    state_after = page.evaluate("""
        () => ({
            backtest_initialized: window._tabInitialized?.backtest ?? false,
            charts_count: Object.keys(window.charts || {}).length,
            charts_backtest: !!window.charts?.backtest,
            canvas_hidden: document.getElementById('backtestChart')?.parentElement?.classList.contains('tab-hidden'),
            canvas_offsetWidth: document.getElementById('backtestChart')?.offsetWidth || 0
        })
    """)
    print(json.dumps(state_after, indent=2))

    # Forçar _initTabCharts manualmente
    print("\n" + "="*70)
    print("🔧 FORÇANDO _INITTABCHARTS MANUALMENTE...")
    print("="*70)
    result = page.evaluate("""
        () => {
            try {
                console.log('[MANUAL] Chamando _initTabCharts("backtest")...');
                window._initTabCharts('backtest');
                console.log('[MANUAL] ✓ Completou');
                return { success: true, charts_backtest: !!window.charts.backtest };
            } catch(e) {
                console.error('[MANUAL] ERRO:', e.message);
                return { success: false, error: e.message };
            }
        }
    """)
    print(json.dumps(result, indent=2))

    # Verificar estado DEPOIS de forcçar
    print("\n📊 APÓS FORÇAR _INITTABCHARTS:")
    state_final = page.evaluate("""
        () => ({
            charts_backtest: !!window.charts?.backtest,
            canvas_pixels: !!document.getElementById('backtestChart')?.getContext('2d').getImageData(0,0,1,1).data[3]
        })
    """)
    print(json.dumps(state_final, indent=2))

    time.sleep(2)
    browser.close()
