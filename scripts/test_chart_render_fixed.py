#!/usr/bin/env python3
"""
Test chart rendering after update() fix
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
    print("🧪 TESTING CHART RENDERING WITH UPDATE() FIX")
    print("="*70)

    # Click tabs and check rendering
    tabs_to_test = ['backtest', 'perf', 'carteira', 'hoje']

    for tab in tabs_to_test:
        print(f"\n📊 Testing {tab} tab...")

        # Click tab
        page.evaluate(f"document.querySelector(\"button[data-tab='{tab}']\").click()")

        # Wait for RAF + setTimeout to execute
        time.sleep(0.5)

        # Check for rendered pixels in ANY canvas in this tab
        result = page.evaluate(f"""
            () => {{
                const tabCanvases = document.querySelectorAll('[data-in-tab="{tab}"] canvas');
                const results = [];

                for (let canvas of tabCanvases) {{
                    try {{
                        const ctx = canvas.getContext('2d');
                        const imageData = ctx.getImageData(0, 0, 50, 50);
                        const hasPixels = Array.from(imageData.data).some(v => v !== 0);
                        results.push({{
                            canvas_id: canvas.id,
                            width: canvas.width,
                            height: canvas.height,
                            has_pixels: hasPixels
                        }});
                    }} catch(e) {{
                        results.push({{
                            canvas_id: canvas.id,
                            error: e.message
                        }});
                    }}
                }}

                return {{
                    tab: "{tab}",
                    canvas_count: tabCanvases.length,
                    canvases: results
                }};
            }}
        """)

        print(json.dumps(result, indent=2))

    # Final full check
    print("\n" + "="*70)
    print("✅ FINAL CHECK: All canvases in window.charts")
    print("="*70)

    final = page.evaluate("""
        () => {
            const count = Object.keys(window.charts || {}).length;
            const pixels = Object.entries(window.charts || {}).map(([name, chart]) => {
                if (!chart || !chart.canvas) return { name, error: 'no canvas' };
                try {
                    const ctx = chart.canvas.getContext('2d');
                    const imageData = ctx.getImageData(0, 0, 50, 50);
                    const hasPixels = Array.from(imageData.data).some(v => v !== 0);
                    return { name, canvas_id: chart.canvas.id, has_pixels: hasPixels };
                } catch(e) {
                    return { name, error: e.message };
                }
            });

            return {
                total_charts: count,
                charts: pixels
            };
        }
    """)

    print(json.dumps(final, indent=2))

    time.sleep(1)
    browser.close()
