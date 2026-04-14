#!/usr/bin/env python3
"""
debug_canvas_dims.py — Verificar dimensões e estado do canvas
"""

from pathlib import Path
from playwright.sync_api import sync_playwright
import time
import json

URL = "http://127.0.0.1:8765/index.html"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    page.goto(URL, wait_until="load", timeout=15000)
    time.sleep(2)

    print("\n🔍 Canvas State ANTES de tab click:")
    state_before = page.evaluate("""
        () => ({
            canvasInDOM: !!document.getElementById('backtestChart'),
            width: document.getElementById('backtestChart')?.width || 0,
            height: document.getElementById('backtestChart')?.height || 0,
            offsetWidth: document.getElementById('backtestChart')?.offsetWidth || 0,
            offsetHeight: document.getElementById('backtestChart')?.offsetHeight || 0,
            visibilidade: window.getComputedStyle(document.getElementById('backtestChart')).display,
            parentVisible: !!document.getElementById('backtestChart')?.parentElement?.offsetParent
        })
    """)
    print(json.dumps(state_before, indent=2))

    # Clicar tab
    print("\n🔄 Clicando tab...")
    page.click("button[data-tab='backtest']")
    time.sleep(1)

    print("\n🔍 Canvas State DEPOIS de tab click:")
    state_after = page.evaluate("""
        () => ({
            width: document.getElementById('backtestChart')?.width || 0,
            height: document.getElementById('backtestChart')?.height || 0,
            offsetWidth: document.getElementById('backtestChart')?.offsetWidth || 0,
            offsetHeight: document.getElementById('backtestChart')?.offsetHeight || 0,
            visibilidade: window.getComputedStyle(document.getElementById('backtestChart')).display,
            parentVisible: !!document.getElementById('backtestChart')?.parentElement?.offsetParent,
            chartInstance: !!window.charts.backtest,
            chartData_points: window.charts.backtest?.data?.datasets?.[0]?.data?.length || 0
        })
    """)
    print(json.dumps(state_after, indent=2))

    # Forçar layout flush
    print("\n🔧 Forçando layout flush...")
    page.evaluate("""
        () => {
            const c = document.getElementById('backtestChart');
            console.log('[LAYOUT] ANTES:', c.offsetWidth, c.offsetHeight);
            // Force reflow
            void c.offsetHeight;
            console.log('[LAYOUT] DEPOIS:', c.offsetWidth, c.offsetHeight);
            // Trigger chart resize
            if (window.charts.backtest) {
                window.charts.backtest.resize();
                console.log('[CHART] Resize triggered');
            }
        }
    """)

    time.sleep(1)

    print("\n🔍 Canvas State APÓS resize:")
    state_final = page.evaluate("""
        () => ({
            width: document.getElementById('backtestChart')?.width || 0,
            height: document.getElementById('backtestChart')?.height || 0,
            offsetWidth: document.getElementById('backtestChart')?.offsetWidth || 0,
            offsetHeight: document.getElementById('backtestChart')?.offsetHeight || 0,
            hasImageData: !!document.getElementById('backtestChart')?.getContext('2d').getImageData(0,0,1,1)
        })
    """)
    print(json.dumps(state_final, indent=2))

    time.sleep(3)
    browser.close()
