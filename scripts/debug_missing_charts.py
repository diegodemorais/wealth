#!/usr/bin/env python3
"""
Debug missing/non-rendering charts
"""

from playwright.sync_api import sync_playwright
import time
import json

URL = "http://127.0.0.1:8765/index.html"

# Map canvas ID to (tab, likely cause)
PROBLEM_CHARTS = {
    'geoDonut': ('carteira', 'render'),
    'attrChart': ('perf', 'render'),
    'deltaChart': ('perf', 'collapsed'),
    'rollingSharpChart': ('perf', 'collapsed'),
    'rollingIRChart': ('perf', 'collapsed'),
    'factorLoadingsChart': ('perf', 'collapsed'),
    'glideChart': ('fire', 'collapsed'),
    'incomeChart': ('retiro', 'collapsed'),
    'drawdownHistChart': ('backtest', 'collapsed'),
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    page.goto(URL, wait_until="load", timeout=15000)
    time.sleep(2)

    print("\n" + "="*80)
    print("🔍 DEBUGGING NON-RENDERING CHARTS")
    print("="*80)

    for canvas_id, (tab, likely_cause) in PROBLEM_CHARTS.items():
        print(f"\n📍 {canvas_id} (tab: {tab}, likely: {likely_cause})")
        print(f"   {'-'*60}")

        # Click tab
        page.evaluate(f"document.querySelector(\"button[data-tab='{tab}']\").click()")
        time.sleep(1)

        # Check canvas state
        state = page.evaluate(f"""
            () => {{
                const canvas = document.getElementById('{canvas_id}');
                if (!canvas) return {{ found: false }};

                const parent = canvas.parentElement;
                const collapsibleParent = canvas.closest('.collapsible');
                const isCollapsed = collapsibleParent?.classList.contains('open') === false;

                const style = window.getComputedStyle(canvas);
                const imageData = canvas.width > 0 && canvas.height > 0
                    ? (() => {{
                        try {{
                            const ctx = canvas.getContext('2d');
                            const data = ctx.getImageData(0, 0, Math.min(50, canvas.width), Math.min(50, canvas.height));
                            return Array.from(data.data).some(v => v !== 0);
                        }} catch(e) {{ return false; }}
                    }})()
                    : false;

                return {{
                    found: true,
                    width: canvas.width,
                    height: canvas.height,
                    style_width: style.width,
                    style_height: style.height,
                    display: style.display,
                    parent_class: parent?.className,
                    in_collapsible: !!collapsibleParent,
                    is_collapsed: isCollapsed,
                    has_pixels: imageData,
                    parent_hidden: parent?.classList.contains('tab-hidden'),
                    closest_section: canvas.closest('[class*="section"], [class*="Section"]')?.id || 'none'
                }};
            }}
        """)

        print(f"   Found: {state.get('found')}")
        if state.get('found'):
            print(f"   Dimensions: {state.get('width')}x{state.get('height')}")
            print(f"   CSS size: {state.get('style_width')} x {state.get('style_height')}")
            print(f"   Display: {state.get('display')}")
            print(f"   In collapsible: {state.get('in_collapsible')}")
            print(f"   Is collapsed: {state.get('is_collapsed')}")
            print(f"   Has pixels: {state.get('has_pixels')}")
            print(f"   Parent hidden (tab-hidden): {state.get('parent_hidden')}")
            print(f"   Closest section: {state.get('closest_section')}")

            # If collapsed, try opening
            if state.get('is_collapsed'):
                print(f"\n   🔓 Attempting to open collapsed section...")
                open_result = page.evaluate(f"""
                    () => {{
                        const canvas = document.getElementById('{canvas_id}');
                        const collapsible = canvas.closest('.collapsible');
                        if (collapsible && !collapsible.classList.contains('open')) {{
                            collapsible.classList.add('open');
                            console.log('[DEBUG] Opened collapsible');
                        }}
                        // Wait for RAF + update
                        return new Promise(resolve => {{
                            requestAnimationFrame(() => {{
                                setTimeout(() => {{
                                    const ctx = canvas.getContext('2d');
                                    const data = ctx.getImageData(0, 0, Math.min(50, canvas.width), Math.min(50, canvas.height));
                                    const hasPixels = Array.from(data.data).some(v => v !== 0);
                                    resolve({{ has_pixels: hasPixels }});
                                }}, 100);
                            }});
                        }});
                    }}
                """)
                print(f"   After opening: has_pixels = {open_result.get('has_pixels')}")

            # Check if builder function exists in window.charts
            chart_state = page.evaluate(f"""
                () => {{
                    const builtinCharts = Object.keys(window.charts || {{}});
                    const canvas = document.getElementById('{canvas_id}');
                    const chartObj = Object.values(window.charts || {{}}).find(c => c?.canvas === canvas);

                    return {{
                        builtin_charts: builtinCharts.slice(0, 5),
                        chart_found_by_canvas: !!chartObj,
                        chart_type: chartObj?.config?.type || 'none'
                    }};
                }}
            """)
            print(f"   Chart in window.charts: {chart_state.get('chart_found_by_canvas')}")
            print(f"   Chart type: {chart_state.get('chart_type')}")

    time.sleep(1)
    browser.close()
