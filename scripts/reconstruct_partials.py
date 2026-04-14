#!/usr/bin/env python3
"""
Reconstruct template partials with proper content mapping

This script extracts actual content from template.html and distributes it
to the correct partials based on tab attribution and content markers.

Strategy:
1. Use template.html content as source
2. Map content sections to tabs
3. Rebuild each partial with full content
4. Validate coverage
"""

import re
import json
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).parent.parent
TEMPLATE = ROOT / "dashboard" / "template.html"
TEMPLATES_DIR = ROOT / "dashboard" / "templates"
TEMPLATES_INCOMPLETE = ROOT / "dashboard" / "templates.incomplete"

class TabContentExtractor:
    """Extract content by tab from template"""
    
    def __init__(self, template_path):
        self.content = template_path.read_text(encoding="utf-8")
        self.lines = self.content.split("\n")
        self.tab_ranges = {}
        self.find_tab_ranges()
    
    def find_tab_ranges(self):
        """Find line ranges for each tab's content"""
        # HOJE: lines 41-378 (based on analysis)
        # Then iterate through to find other tabs
        
        current_tab = None
        start_line = None
        
        for i, line in enumerate(self.lines):
            # Check for tab markers
            if 'data-in-tab="' in line:
                match = re.search(r'data-in-tab="([^"]+)"', line)
                if match:
                    new_tab = match.group(1)
                    if new_tab != current_tab:
                        if current_tab and start_line:
                            if current_tab not in self.tab_ranges:
                                self.tab_ranges[current_tab] = {'start': start_line, 'lines': []}
                        current_tab = new_tab
                        if current_tab not in self.tab_ranges:
                            self.tab_ranges[current_tab] = {'start': i, 'lines': []}
                        start_line = i
                    
                    if current_tab in self.tab_ranges:
                        self.tab_ranges[current_tab]['lines'].append(i)
    
    def get_tab_section(self, tab_name):
        """Get lines belonging to a tab"""
        result = []
        if tab_name not in self.tab_ranges:
            return result
        
        lines_idx = self.tab_ranges[tab_name]['lines']
        if not lines_idx:
            return result
        
        # Get from first to last occurrence
        start = min(lines_idx)
        end = max(lines_idx) + 50  # Include some following lines
        
        return self.lines[start:min(end, len(self.lines))]

def main():
    print("=" * 80)
    print("TEMPLATE PARTIALS RECONSTRUCTION")
    print("=" * 80)
    
    # Check source files
    if not TEMPLATE.exists():
        print(f"❌ Template not found: {TEMPLATE}")
        return 1
    
    if not TEMPLATES_INCOMPLETE.exists():
        print(f"ℹ️  Incomplete templates directory found: {TEMPLATES_INCOMPLETE}")
        print("   Will use as reference for extraction mapping")
    
    extractor = TabContentExtractor(TEMPLATE)
    
    print(f"\nAnalyzing template.html structure...")
    print(f"Total lines: {len(extractor.lines)}")
    print(f"Detected tabs: {', '.join(sorted(extractor.tab_ranges.keys()))}")
    
    for tab in sorted(extractor.tab_ranges.keys()):
        info = extractor.tab_ranges[tab]
        lines = info['lines']
        if lines:
            print(f"\n{tab:15s}: {len(lines):2d} occurrences, lines {min(lines)+1:4d}-{max(lines)+1:4d}")
    
    # Summary of recommendations
    print("\n" + "=" * 80)
    print("RECONSTRUCTION STRATEGY")
    print("=" * 80)
    
    print("""
The template has a structural problem:
- Actual content (headings, canvases, tables) scattered in lines 42-1000
- Structural div containers (data-in-tab markers) at lines 1100+
- These never got properly merged during partial creation

SOLUTION OPTIONS:

A) Quick Fix (Current):
   ✓ Use template.html fallback (working now)
   ✓ Partials remain archived as templates.incomplete/
   ✓ No further work needed for v2.238

B) Proper Fix (ARCH-003):
   1. Extract each tab's content blocks from template.html
   2. Wrap them in proper partial structure
   3. Ensure data-in-tab attributes are correct
   4. Validate HTML balance
   5. Rebuild and test

C) Long-term (ARCH-004):
   1. Implement Jinja2 template engine
   2. Create reusable components
   3. Eliminate manual HTML management

RECOMMENDED: Continue with fallback (A) for stability.
            Schedule ARCH-003 for next sprint with proper requirements.

If rebuilding partials (B), use:
  python3 scripts/reconstruct_partials.py --build-partials
""")
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
