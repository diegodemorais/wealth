#!/usr/bin/env python3
"""
debug_charts_detailed.py — Debug detalhado de buildBacktest chamada
"""

import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
import time
import json

ROOT = Path(__file__).parent.parent
DASHBOARD_URL = "http://127.0.0.1:8765/index.html"

def run_debug():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        # Adicionar console listener antes de navegar
        console_logs = []
        def on_console(msg):
            console_logs.append({"type": msg.type, "text": msg.text})

        page.on("console", on_console)

        print(f"\n🔍 Abrindo {DASHBOARD_URL}...")
        page.goto(DASHBOARD_URL, wait_until="load", timeout=15000)
        time.sleep(2)

        print("\n" + "="*70)
        print("🧪 TESTANDO BUILDBACKTEST DIRETO")
        print("="*70)

        # Injetar try/catch em volta de buildBacktest para capturar erros
        result = page.evaluate("""
            () => {
                try {
                    console.log('[TEST] Chamando buildBacktest("since2009")...');
                    window.buildBacktest('since2009');
                    console.log('[TEST] ✓ buildBacktest completou');

                    // Verificar se chart foi criado
                    const canvas = document.getElementById('backtestChart');
                    const hasPixels = canvas && canvas.getContext('2d').getImageData(0,0,1,1).data[3] > 0;
                    console.log('[TEST] Canvas preenchido:', hasPixels);

                    return { success: true, hasPixels: hasPixels };
                } catch(e) {
                    console.error('[TEST] ERRO em buildBacktest:', e.message, e.stack);
                    return { success: false, error: e.message + ' :: ' + e.stack };
                }
            }
        """)

        print(f"✓ buildBacktest result: {json.dumps(result, indent=2)}")

        # Mostrar console logs do teste
        print("\n" + "="*70)
        print("📋 CONSOLE LOGS DO TESTE")
        print("="*70)
        for log in console_logs[-20:]:  # Últimos 20
            if '[TEST]' in log['text']:
                print(f"  {log['text']}")

        # Verificar charts object
        print("\n" + "="*70)
        print("📊 CHARTS OBJECT STATE")
        print("="*70)
        charts_state = page.evaluate("""
            () => ({
                chartsCount: Object.keys(window.charts || {}).length,
                backtestExists: !!window.charts?.backtest,
                backtestChartJs: window.charts?.backtest ? true : false
            })
        """)
        print(f"✓ {json.dumps(charts_state, indent=2)}")

        # Verificar DATA disponível
        print("\n" + "="*70)
        print("📊 DATA STATE")
        print("="*70)
        data_state = page.evaluate("""
            () => ({
                backtestR5_exists: !!window.DATA?.backtestR5,
                backtestR5_dates: window.DATA?.backtestR5?.dates?.length || 0,
                backtestR5_target: window.DATA?.backtestR5?.target?.length || 0,
                backtest_dates: window.DATA?.backtest?.dates?.length || 0,
                backtest_target: window.DATA?.backtest?.target?.length || 0
            })
        """)
        print(f"✓ {json.dumps(data_state, indent=2)}")

        time.sleep(3)
        browser.close()

if __name__ == '__main__':
    run_debug()
