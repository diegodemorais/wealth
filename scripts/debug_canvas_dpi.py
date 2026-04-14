#!/usr/bin/env python3
"""
Debug canvas DPI and rendering — Chart.js rendering issues
"""

from playwright.sync_api import sync_playwright
import time
import json

URL = "http://127.0.0.1:8765/index.html"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # Capture console messages
    console_logs = []
    page.on("console", lambda msg: console_logs.append({"type": msg.type, "text": msg.text}))

    page.goto(URL, wait_until="load", timeout=15000)
    time.sleep(2)

    print("\n" + "="*70)
    print("🔍 CANVAS DPI & RENDERING DEBUG")
    print("="*70)

    # Click backtest tab
    page.evaluate("document.querySelector(\"button[data-tab='backtest']\").click()")
    time.sleep(3)

    # Get detailed canvas info
    canvas_info = page.evaluate("""
        () => {
            const canvas = document.getElementById('backtestChart');
            const ctx = canvas.getContext('2d');
            const chart = window.charts?.backtest;

            // Check DPI scaling
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            // Try to draw something simple to test context
            const testCtx = document.createElement('canvas').getContext('2d');
            testCtx.fillStyle = '#FF0000';
            testCtx.fillRect(0, 0, 10, 10);
            const testImageData = testCtx.getImageData(0, 0, 10, 10);
            const testHasData = Array.from(testImageData.data).some(v => v > 0);

            return {
                devicePixelRatio: dpr,
                canvas_width: canvas.width,
                canvas_height: canvas.height,
                canvas_element_dpr_adjusted_width: canvas.width / dpr,
                canvas_element_dpr_adjusted_height: canvas.height / dpr,
                boundingRect: { width: rect.width, height: rect.height },
                ctx_type: ctx.constructor.name,
                ctx_canvas_width: ctx.canvas.width,
                ctx_canvas_height: ctx.canvas.height,
                chart_exists: !!chart,
                chart_options_responsive: chart?.options?.responsive,
                chart_options_maintainAspectRatio: chart?.options?.maintainAspectRatio,
                chart_resize_called: chart?.resize ? 'yes' : 'no',
                test_ctx_draws: testHasData,
                // Try drawing on main canvas
                test_main_canvas: (() => {
                    try {
                        ctx.fillStyle = '#0000FF';
                        ctx.fillRect(50, 50, 100, 100);
                        const imgData = ctx.getImageData(50, 50, 10, 10);
                        return Array.from(imgData.data).some(v => v > 0) ? 'drawn OK' : 'draw failed';
                    } catch(e) {
                        return 'error: ' + e.message;
                    }
                })()
            };
        }
    """)

    print("\n📊 CANVAS DPI & CONTEXT INFO:")
    print(json.dumps(canvas_info, indent=2))

    # Check console logs
    print("\n📋 CONSOLE LOGS (últimas 20):")
    for msg in console_logs[-20:]:
        print(f"  [{msg['type'].upper()}] {msg['text'][:100]}")

    # Now check if chart actually has rendering logic
    chart_debug = page.evaluate("""
        () => {
            const chart = window.charts?.backtest;
            if (!chart) return { error: 'no chart' };

            return {
                chart_draw_fn_exists: typeof chart.draw === 'function',
                chart_render_fn_exists: typeof chart.render === 'function',
                chart_update_fn_exists: typeof chart.update === 'function',
                chart_config: {
                    type: chart.config?.type,
                    plugins: Object.keys(chart.config?.plugins || {})
                },
                // Try update instead of render
                tried_update: (() => {
                    try {
                        if (typeof chart.update === 'function') {
                            chart.update('none');
                            return 'update("none") called';
                        }
                        return 'no update method';
                    } catch(e) {
                        return 'error: ' + e.message;
                    }
                })()
            };
        }
    """)

    print("\n📊 CHART METHODS & CONFIG:")
    print(json.dumps(chart_debug, indent=2))

    # Final canvas check
    final_check = page.evaluate("""
        () => {
            const canvas = document.getElementById('backtestChart');
            const ctx = canvas.getContext('2d');
            try {
                const imgData = ctx.getImageData(0, 0, 100, 100);
                const nonZero = Array.from(imgData.data).filter(v => v !== 0).length;
                return { pixel_count: nonZero, has_data: nonZero > 0 };
            } catch(e) {
                return { error: e.message };
            }
        }
    """)

    print("\n📊 FINAL CANVAS PIXEL CHECK:")
    print(json.dumps(final_check, indent=2))

    time.sleep(2)
    browser.close()
