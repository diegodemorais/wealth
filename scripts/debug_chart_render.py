#!/usr/bin/env python3
"""
Debug chart rendering — verificar se Chart.js está renderizando
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

    print("\n" + "="*70)
    print("🔍 VERIFICANDO CHART.JS RENDERING")
    print("="*70)

    # Clicar no tab backtest
    print("\n🔄 Clicando tab backtest...")
    page.evaluate("document.querySelector(\"button[data-tab='backtest']\").click()")
    time.sleep(2)

    # Inspecionar estado de Chart.js
    chart_state = page.evaluate("""
        () => {
            const canvas = document.getElementById('backtestChart');
            if (!canvas) return { error: 'canvas not found' };

            const ctx = canvas.getContext('2d');
            const chartInstance = window.charts?.backtest;

            return {
                canvas_id: canvas.id,
                canvas_width: canvas.width,
                canvas_height: canvas.height,
                canvas_clientWidth: canvas.clientWidth,
                canvas_clientHeight: canvas.clientHeight,
                canvas_style_display: canvas.style.display,
                canvas_parent_hidden: canvas.parentElement?.classList.contains('tab-hidden'),
                chartInstance_exists: !!chartInstance,
                chartInstance_type: chartInstance?.constructor?.name || 'N/A',
                chartInstance_data_labels: chartInstance?.data?.labels?.length || 0,
                chartInstance_data_datasets: chartInstance?.data?.datasets?.length || 0,
                chartInstance_canvas_id: chartInstance?.canvas?.id || 'N/A',
                chartInstance_chart_instance: chartInstance?.chart?.id || 'N/A',
                ctx_canvas: ctx.canvas.id,
                // Tentar detectar se foi desenhado
                canvas_fillRect: (() => {
                    try {
                        const imageData = ctx.getImageData(0, 0, 10, 10);
                        const hasData = Array.from(imageData.data).some(v => v !== 0);
                        return hasData ? 'has pixel data' : 'no pixel data';
                    } catch(e) {
                        return 'error: ' + e.message;
                    }
                })()
            };
        }
    """)

    print("\n📊 CHART STATE:")
    print(json.dumps(chart_state, indent=2))

    # Tentar renderizar manualmente
    print("\n" + "="*70)
    print("🔧 TENTANDO RENDERIZAR MANUALMENTE")
    print("="*70)

    render_result = page.evaluate("""
        () => {
            try {
                const chartInstance = window.charts?.backtest;
                if (!chartInstance) return { error: 'chartInstance not found' };

                console.log('[MANUAL] Chart exists, calling render()...');
                if (typeof chartInstance.render === 'function') {
                    chartInstance.render();
                    return { success: true, rendered: 'render() called' };
                } else if (typeof chartInstance.draw === 'function') {
                    chartInstance.draw();
                    return { success: true, rendered: 'draw() called' };
                } else {
                    return { success: false, error: 'no render/draw method', methods: Object.keys(chartInstance) };
                }
            } catch(e) {
                return { success: false, error: e.message };
            }
        }
    """)

    print("\n📊 RENDER ATTEMPT:")
    print(json.dumps(render_result, indent=2))

    time.sleep(1)

    # Check canvas again after render attempt
    canvas_after = page.evaluate("""
        () => {
            const canvas = document.getElementById('backtestChart');
            const ctx = canvas.getContext('2d');
            try {
                const imageData = ctx.getImageData(0, 0, 20, 20);
                const hasData = Array.from(imageData.data).some(v => v !== 0);
                return { has_pixels: hasData };
            } catch(e) {
                return { error: e.message };
            }
        }
    """)

    print("\n📊 CANVAS AFTER RENDER ATTEMPT:")
    print(json.dumps(canvas_after, indent=2))

    time.sleep(2)
    browser.close()
