#!/usr/bin/env python3
"""
Comprehensive render test — verify ALL charts, tables, cards across ALL tabs
"""

from playwright.sync_api import sync_playwright
import time
import json
from collections import defaultdict

URL = "http://127.0.0.1:8765/index.html"

TABS = ['hoje', 'carteira', 'perf', 'fire', 'retiro', 'simuladores', 'backtest']

def check_canvas_rendering(canvas, page):
    """Check if a canvas has pixel data"""
    try:
        has_pixels = page.evaluate("""
            el => {
                if (!el.width || !el.height) return false;
                const ctx = el.getContext('2d');
                const data = ctx.getImageData(0, 0, Math.min(50, el.width), Math.min(50, el.height));
                return Array.from(data.data).some(v => v !== 0);
            }
        """, canvas)
        return has_pixels
    except:
        return False

def check_table_has_data(table, page):
    """Check if a table has rows"""
    try:
        rows = page.evaluate("""
            el => {
                const tbody = el.querySelector('tbody');
                if (!tbody) return 0;
                return tbody.querySelectorAll('tr').length;
            }
        """, table)
        return rows > 0
    except:
        return False

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    page.goto(URL, wait_until="load", timeout=15000)
    time.sleep(2)

    print("\n" + "="*80)
    print("🧪 COMPREHENSIVE RENDER TEST — ALL TABS")
    print("="*80)

    results = {
        'canvases': defaultdict(list),
        'tables': defaultdict(list),
        'cards': defaultdict(list),
        'errors': []
    }

    for tab in TABS:
        print(f"\n{'='*80}")
        print(f"📊 TAB: {tab.upper()}")
        print(f"{'='*80}")

        # Click tab
        try:
            page.evaluate(f"document.querySelector(\"button[data-tab='{tab}']\").click()")
            time.sleep(1)  # Wait for lazy load + RAF + update()
        except Exception as e:
            results['errors'].append(f"Tab {tab}: click failed — {e}")
            continue

        # Check all canvases
        print(f"\n🎨 CANVASES ({tab}):")
        canvases = page.query_selector_all(f'[data-in-tab="{tab}"] canvas')

        if not canvases:
            print(f"  ℹ️  No canvases in this tab")
        else:
            for canvas in canvases:
                canvas_id = canvas.get_attribute('id')
                width = canvas.get_attribute('width')
                height = canvas.get_attribute('height')
                display = page.evaluate(f"el => window.getComputedStyle(el).display", canvas)
                hidden = page.evaluate(f"el => el.parentElement?.classList.contains('tab-hidden')", canvas)

                # Check for pixels (sample center area for doughnuts/large charts, top-left for smaller)
                has_pixels = False
                try:
                    imageData = page.evaluate(f"""
                        el => {{
                            if (!el.width || !el.height) return false;
                            const ctx = el.getContext('2d');
                            // For wide/tall charts, sample center to catch doughnut charts. Otherwise top-left.
                            const sampleSize = 100;
                            const isLarge = el.width > 200 && el.height > 100;
                            const x = isLarge ? Math.max(0, el.width/2 - sampleSize/2) : 0;
                            const y = isLarge ? Math.max(0, el.height/2 - sampleSize/2) : 0;
                            const data = ctx.getImageData(x, y, Math.min(sampleSize, el.width - x), Math.min(sampleSize, el.height - y));
                            return Array.from(data.data).some(v => v !== 0);
                        }}
                    """, canvas)
                    has_pixels = imageData
                except:
                    pass

                status = "✅" if has_pixels else "⚠️ "
                print(f"  {status} {canvas_id:25} ({width}x{height}) {'' if not hidden else '[HIDDEN] '} {'' if has_pixels else 'NO PIXELS'}")

                results['canvases'][tab].append({
                    'id': canvas_id,
                    'dimensions': f"{width}x{height}",
                    'has_pixels': has_pixels,
                    'hidden': hidden,
                    'display': display
                })

        # Check all tables
        print(f"\n📋 TABLES ({tab}):")
        tables = page.query_selector_all(f'[data-in-tab="{tab}"] table')

        if not tables:
            print(f"  ℹ️  No tables in this tab")
        else:
            for table in tables:
                table_id = table.get_attribute('id')

                # Count rows
                try:
                    row_count = page.evaluate(f"""
                        el => {{
                            const tbody = el.querySelector('tbody');
                            if (!tbody) return 0;
                            return tbody.querySelectorAll('tr').length;
                        }}
                    """, table)
                except:
                    row_count = 0

                status = "✅" if row_count > 0 else "⚠️ "
                print(f"  {status} {table_id or 'unnamed':30} ({row_count} rows)")

                results['tables'][tab].append({
                    'id': table_id or 'unnamed',
                    'rows': row_count,
                    'has_data': row_count > 0
                })

        # Check key data cards/sections
        print(f"\n💳 DATA CARDS/SECTIONS ({tab}):")

        # Get all text content from key data sections
        cards_data = page.evaluate(f"""
            () => {{
                const sections = document.querySelectorAll('[data-in-tab="{tab}"] [class*="card"], [data-in-tab="{tab}"] [class*="section"], [data-in-tab="{tab}"] .kpi-box');
                const results = [];
                sections.forEach(el => {{
                    const id = el.id || el.className.slice(0, 30);
                    const text = el.textContent?.slice(0, 50).trim() || '—';
                    const isEmpty = !el.textContent?.trim();
                    results.push({{ id, text, isEmpty }});
                }});
                return results;
            }}
        """)

        if not cards_data:
            print(f"  ℹ️  No data cards/sections found")
        else:
            for card in cards_data[:10]:  # Show first 10
                status = "✅" if not card['isEmpty'] else "⚠️ "
                card_id = card['id'][:40] if len(card['id']) > 40 else card['id']
                print(f"  {status} {card_id:40} {card['text']}")
                results['cards'][tab].append(card)

    # Summary
    print(f"\n{'='*80}")
    print("📊 SUMMARY")
    print(f"{'='*80}\n")

    canvas_summary = {}
    for tab, canvases in results['canvases'].items():
        rendered = sum(1 for c in canvases if c['has_pixels'])
        total = len(canvases)
        canvas_summary[tab] = f"{rendered}/{total}"
        status = "✅" if rendered == total else "⚠️ " if rendered > 0 else "❌"
        print(f"{status} {tab:15} canvases: {rendered:2}/{total:2} rendering")

    table_summary = {}
    for tab, tables in results['tables'].items():
        populated = sum(1 for t in tables if t['has_data'])
        total = len(tables)
        table_summary[tab] = f"{populated}/{total}"
        status = "✅" if populated == total else "⚠️ " if populated > 0 else "❌"
        print(f"{status} {tab:15} tables:   {populated:2}/{total:2} populated")

    if results['errors']:
        print(f"\n❌ ERRORS:")
        for err in results['errors']:
            print(f"  {err}")

    # Export detailed results
    with open('dashboard/tests/render_test.json', 'w') as f:
        json.dump({
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'canvas_summary': canvas_summary,
            'table_summary': table_summary,
            'canvases': dict(results['canvases']),
            'tables': dict(results['tables']),
            'errors': results['errors']
        }, f, indent=2)

    print(f"\n✓ Detailed results saved to dashboard/tests/render_test.json")

    time.sleep(1)
    browser.close()
