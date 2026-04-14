#!/usr/bin/env python3
"""
debug_charts_scope.py — Verificar se charts está disponível no escopo
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

    print("\n🔍 Verificando escopo de 'charts'...")

    # Verificar no console
    charts_exists = page.evaluate("typeof window.charts")
    print(f"✓ typeof window.charts: {charts_exists}")

    # Tentar referenciar charts diretamente
    try:
        result = page.evaluate("""
            () => {
                try {
                    // Isso vai falhar se charts não estiver no global scope
                    console.log('Tentando acessar charts sem qualificar...');
                    const test = charts;  // ReferenceError se não existir
                    return { success: true };
                } catch(e) {
                    console.log('ERRO:', e.message);
                    return { success: false, error: e.message };
                }
            }
        """)
        print(f"✓ Acessar charts sem prefix: {result}")
    except Exception as e:
        print(f"❌ Erro: {e}")

    # Chamar buildBacktest com try/catch detalhado
    print("\n🔧 Chamando buildBacktest com logging detalhado...")
    result2 = page.evaluate("""
        () => {
            try {
                console.log('1. typeof window.charts:', typeof window.charts);
                console.log('2. typeof charts:', typeof charts);
                console.log('3. window.charts === charts?:', window.charts === charts);
            } catch(e) {
                console.log('ERRO ao comparar charts:', e.message);
            }

            try {
                console.log('4. Chamando window.buildBacktest...');
                const prevCharts = window.charts.backtest;
                window.buildBacktest('since2009');
                console.log('5. Após buildBacktest, window.charts.backtest existe?', !!window.charts.backtest);
                return { backtestCreated: !!window.charts.backtest, wasPrevious: !!prevCharts };
            } catch(e) {
                console.error('ERRO em buildBacktest:', e.message, e.stack);
                return { error: e.message };
            }
        }
    """)
    print(f"✓ Result: {result2}")

    time.sleep(2)
    browser.close()
