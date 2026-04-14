#!/usr/bin/env python3
"""
Debug canvas element attributes — check if canvas.width/height are set properly
"""

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
    print("🔍 CANVAS ELEMENT ATTRIBUTES DEBUG")
    print("="*70)

    # Before clicking
    print("\n📊 BEFORE CLICKING BACKTEST TAB:")
    canvas_html_before = page.evaluate("""
        () => {
            const canvas = document.getElementById('backtestChart');
            if (!canvas) return { error: 'canvas not found' };
            return {
                tag: canvas.tagName,
                id: canvas.id,
                classes: canvas.className,
                width_attr: canvas.getAttribute('width'),
                height_attr: canvas.getAttribute('height'),
                width_prop: canvas.width,
                height_prop: canvas.height,
                style_width: canvas.style.width,
                style_height: canvas.style.height,
                display: window.getComputedStyle(canvas).display,
                visibility: window.getComputedStyle(canvas).visibility,
                offsetWidth: canvas.offsetWidth,
                offsetHeight: canvas.offsetHeight,
                parent_classList: Array.from(canvas.parentElement?.classList || [])
            };
        }
    """)
    print(json.dumps(canvas_html_before, indent=2))

    # Click tab
    print("\n🔄 Clicking backtest tab...")
    page.evaluate("document.querySelector(\"button[data-tab='backtest']\").click()")
    time.sleep(2)

    # After clicking, before trying to render
    print("\n📊 AFTER CLICKING (before manual render):")
    canvas_after_click = page.evaluate("""
        () => {
            const canvas = document.getElementById('backtestChart');
            const chart = window.charts?.backtest;
            return {
                canvas_width_attr: canvas.getAttribute('width'),
                canvas_height_attr: canvas.getAttribute('height'),
                canvas_width_prop: canvas.width,
                canvas_height_prop: canvas.height,
                chart_width: chart?.chartArea?.width,
                chart_height: chart?.chartArea?.height,
                chart_canvas: chart?.canvas?.width + 'x' + chart?.canvas?.height
            };
        }
    """)
    print(json.dumps(canvas_after_click, indent=2))

    # Try setting canvas width/height and re-rendering
    print("\n" + "="*70)
    print("🔧 TRYING TO FIX CANVAS BY SETTING WIDTH/HEIGHT ATTRIBUTES")
    print("="*70)

    fix_result = page.evaluate("""
        () => {
            const canvas = document.getElementById('backtestChart');
            const chart = window.charts?.backtest;

            const beforeFix = { has_pixels: false, width: canvas.width, height: canvas.height };

            try {
                // Check if canvas width/height are set
                if (!canvas.getAttribute('width') || !canvas.getAttribute('height')) {
                    console.log('[FIX] Canvas missing width/height attributes, setting from offsetWidth/offsetHeight');
                    const w = canvas.offsetWidth || 1214;
                    const h = canvas.offsetHeight || 320;
                    canvas.width = w;
                    canvas.height = h;
                    console.log('[FIX] Set canvas to ' + w + 'x' + h);
                }

                // Try explicit render
                if (chart && typeof chart.render === 'function') {
                    console.log('[FIX] Calling chart.render()');
                    chart.render();
                }

                // Try explicit update
                if (chart && typeof chart.update === 'function') {
                    console.log('[FIX] Calling chart.update()');
                    chart.update('none');
                }

                // Check pixels
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, 100, 100);
                const hasPixels = Array.from(imageData.data).some(v => v !== 0);

                return {
                    success: true,
                    canvas_width: canvas.width,
                    canvas_height: canvas.height,
                    has_pixels: hasPixels
                };
            } catch(e) {
                return { success: false, error: e.message };
            }
        }
    """)

    print("\n📊 FIX ATTEMPT RESULT:")
    print(json.dumps(fix_result, indent=2))

    time.sleep(2)
    browser.close()
