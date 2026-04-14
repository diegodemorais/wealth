#!/usr/bin/env python3
"""
Test a single tab staying active to verify charts render and stay rendered
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
    print("🧪 TESTING BACKTEST TAB CHARTS (STAYING ON TAB)")
    print("="*70)

    # Click backtest tab
    print("\n🔄 Clicking backtest tab...")
    page.evaluate("document.querySelector(\"button[data-tab='backtest']\").click()")

    # Wait for rendering
    time.sleep(0.5)

    # Check immediately
    print("\n📊 CHECK 1 (immediately after click):")
    result1 = page.evaluate("""
        () => {
            const canvases = ['backtestChart', 'shadowChart', 'backtestR7Chart', 'drawdownHistChart'];
            return canvases.map(id => {
                const canvas = document.getElementById(id);
                if (!canvas) return { id, error: 'not found' };
                try {
                    const ctx = canvas.getContext('2d');
                    const imageData = ctx.getImageData(0, 0, 50, 50);
                    const hasPixels = Array.from(imageData.data).some(v => v !== 0);
                    return { id, width: canvas.width, height: canvas.height, has_pixels: hasPixels };
                } catch(e) {
                    return { id, error: e.message };
                }
            });
        }
    """)
    print(json.dumps(result1, indent=2))

    # Wait a bit more
    time.sleep(1)

    # Check again
    print("\n📊 CHECK 2 (1 second later):")
    result2 = page.evaluate("""
        () => {
            const canvases = ['backtestChart', 'shadowChart', 'backtestR7Chart', 'drawdownHistChart'];
            return canvases.map(id => {
                const canvas = document.getElementById(id);
                if (!canvas) return { id, error: 'not found' };
                try {
                    const ctx = canvas.getContext('2d');
                    const imageData = ctx.getImageData(0, 0, 50, 50);
                    const hasPixels = Array.from(imageData.data).some(v => v !== 0);
                    return { id, width: canvas.width, height: canvas.height, has_pixels: hasPixels };
                } catch(e) {
                    return { id, error: e.message };
                }
            });
        }
    """)
    print(json.dumps(result2, indent=2))

    # Check window.charts directly
    print("\n📊 CHECK 3 (window.charts objects):")
    result3 = page.evaluate("""
        () => {
            return {
                backtest_exists: !!window.charts?.backtest,
                backtest_has_update: typeof window.charts?.backtest?.update === 'function',
                shadow_exists: !!window.charts?.shadow,
                backtestR7_exists: !!window.charts?.backtestR7,
                drawdownHist_exists: !!window.charts?.drawdownHist
            };
        }
    """)
    print(json.dumps(result3, indent=2))

    time.sleep(1)
    browser.close()
