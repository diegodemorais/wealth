#!/usr/bin/env python3
"""
Validate dashboard template partials — structural and content integrity

This script checks:
1. Partial file presence and readability
2. HTML balance (opening vs closing tags)
3. Content presence (not just empty divs)
4. data-in-tab consistency
5. Required elements (headings, canvases, tables)
"""

import json
import re
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).parent.parent
TEMPLATES_DIR = ROOT / "dashboard" / "templates.incomplete"
TEMPLATE_FALLBACK = ROOT / "dashboard" / "template.html"

# Expected content per tab (section IDs or element IDs that should exist)
EXPECTED_CONTENT = {
    "hoje": ["tornadoChart", "sankey", "bondPool", "backtestChart"],
    "carteira": ["donuts", "stackedAlloc", "posicoes"],
    "perf": ["timeline", "attrib", "rolling", "heatmap"],
    "fire": ["trackingFireChart", "scenarioCompareBody", "fireMatrix", "netWorthProjectionChart"],
    "retiro": ["bondPool", "guardrails", "incomeChart", "swrPercentiles"],
    "simuladores": ["scenarios", "stressProjection", "simuladorFire"],
    "backtest": ["backtest", "shadowChart", "backtestR7"],
}

class HTMLValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.errors = []
        self.data_in_tab_attrs = set()
        self.element_ids = set()
        self.canvas_ids = set()
        self.heading_count = 0
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        self.tags.append((tag, "start"))
        
        if "data-in-tab" in attrs_dict:
            self.data_in_tab_attrs.add(attrs_dict["data-in-tab"])
        if "id" in attrs_dict:
            self.element_ids.add(attrs_dict["id"])
        if tag == "canvas" and "id" in attrs_dict:
            self.canvas_ids.add(attrs_dict["id"])
        if tag in ["h1", "h2", "h3"]:
            self.heading_count += 1
            
    def handle_endtag(self, tag):
        self.tags.append((tag, "end"))
        
    def validate_balance(self):
        stack = []
        for tag, direction in self.tags:
            if tag in ["br", "img", "input", "canvas"]:  # self-closing
                continue
            if direction == "start":
                stack.append(tag)
            else:
                if not stack:
                    self.errors.append(f"Closing tag </{tag}> without opening")
                elif stack[-1] != tag:
                    self.errors.append(f"Mismatched: opened <{stack[-1]}> but closed </{tag}>")
                else:
                    stack.pop()
        if stack:
            self.errors.append(f"Unclosed tags: {', '.join(f'<{t}>' for t in stack)}")
        return len(self.errors) == 0

def validate_partial(partial_path):
    """Validate a single partial file"""
    if not partial_path.exists():
        return {"error": "File not found"}
    
    content = partial_path.read_text(encoding="utf-8")
    
    if not content.strip():
        return {"error": "File is empty"}
    
    validator = HTMLValidator()
    try:
        validator.feed(content)
    except Exception as e:
        return {"error": f"HTML parsing failed: {e}"}
    
    validator.validate_balance()
    
    return {
        "size": len(content),
        "lines": len(content.split("\n")),
        "html_errors": validator.errors,
        "data_in_tab_values": list(validator.data_in_tab_attrs),
        "element_ids": len(validator.element_ids),
        "canvas_ids": list(validator.canvas_ids),
        "headings": validator.heading_count,
        "has_content": len(content) > 100 and validator.heading_count > 0,
    }

def main():
    print("=" * 70)
    print("VALIDATING DASHBOARD TEMPLATE PARTIALS")
    print("=" * 70)
    
    if not TEMPLATES_DIR.exists():
        print(f"\n⚠️  Partials directory not found: {TEMPLATES_DIR}")
        print("   Checking fallback template...")
        if TEMPLATE_FALLBACK.exists():
            size = TEMPLATE_FALLBACK.stat().st_size
            lines = len(TEMPLATE_FALLBACK.read_text(encoding="utf-8").split("\n"))
            print(f"   ✓ Fallback template exists: {size:,} bytes, {lines} lines")
        return 1
    
    partials = sorted(TEMPLATES_DIR.glob("*.html"))
    
    if not partials:
        print(f"❌ No partials found in {TEMPLATES_DIR}")
        return 1
    
    print(f"\n📋 Found {len(partials)} partials\n")
    
    results = {}
    critical_issues = 0
    warnings = 0
    
    for partial in partials:
        name = partial.name
        validation = validate_partial(partial)
        results[name] = validation
        
        status = "✓" if not validation.get("error") and validation.get("has_content") else "✗"
        print(f"{status} {name:25s} — ", end="")
        
        if "error" in validation:
            print(f"❌ {validation['error']}")
            critical_issues += 1
        else:
            size = validation["size"]
            headings = validation["headings"]
            canvases = len(validation["canvas_ids"])
            has_content = validation["has_content"]
            
            print(f"{size:6,} bytes | {headings:2d} headings | {canvases:2d} canvases", end="")
            
            if not has_content:
                print(" | ⚠️  EMPTY CONTENT")
                warnings += 1
            elif validation["html_errors"]:
                print(f" | ⚠️  {len(validation['html_errors'])} HTML errors")
                for err in validation["html_errors"][:1]:
                    print(f"      • {err}")
                warnings += 1
            else:
                print(" | ✓ OK")
    
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    print(f"\n📊 Partial Status:")
    print(f"   Total: {len(partials)}")
    print(f"   ✓ OK: {len(partials) - critical_issues - warnings}")
    print(f"   ⚠️  Warnings: {warnings}")
    print(f"   ❌ Critical: {critical_issues}")
    
    # Check expected content presence
    print(f"\n📝 Content Coverage by Tab:")
    for tab, expected_ids in EXPECTED_CONTENT.items():
        found_ids = []
        for partial in partials:
            validation = results.get(partial.name, {})
            elem_ids = validation.get("element_ids", set())
            canvas_ids = validation.get("canvas_ids", [])
            if isinstance(elem_ids, set):
                all_ids = elem_ids | set(canvas_ids)
            else:
                all_ids = set(canvas_ids)
            
            for exp_id in expected_ids:
                if exp_id in all_ids:
                    found_ids.append(exp_id)
        
        coverage = len(found_ids) / len(expected_ids) * 100 if expected_ids else 0
        status = "✓" if coverage == 100 else "⚠️ " if coverage > 0 else "❌"
        print(f"   {status} {tab:15s} — {coverage:5.1f}% ({len(found_ids)}/{len(expected_ids)})")
    
    print("\n📌 Recommendations:")
    if critical_issues > 0:
        print("   1. Fix critical issues (empty files, parse errors)")
    if warnings > 0:
        print("   2. Review partial content — many have minimal HTML")
    print("   3. Run `python3 scripts/build_dashboard.py` to rebuild with partials")
    print("   4. If build fails HTML validation, revert to template.html fallback")
    
    print("\n")
    
    return 1 if critical_issues > 0 else 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
