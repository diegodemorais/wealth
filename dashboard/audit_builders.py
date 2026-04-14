#!/usr/bin/env python3
"""Audit builder functions vs HTML element IDs to find mismatches."""

import re
import json
from pathlib import Path

# Map of builder functions to their target element IDs (from code analysis)
BUILDER_ELEMENT_MAP = {
    # perf tab
    'buildTimeline': 'timelineChart',
    'buildAttribution': 'attrChart',
    'buildDeltaBar': 'deltaChart',
    'renderIpcaProgress': 'ipcaProgressFill',  # multiple IDs but main canvas area
    'buildRetornoHeatmap': 'heatmapContainer',
    'buildRollingSharp': 'rollingSharpChart',
    'buildInformationRatio': 'rollingIRChart',
    'buildBacktest': 'backtestChart',
    'buildCagrVsTwr': 'cagrPatrimonial',
    'buildFactorRolling': 'factorRollingChart',
    'buildFactorLoadings': 'factorLoadingsChart',
    'buildShadowTable': 'shadowTableBody',
    'buildShadowChart': 'shadowChart',
    'buildFeeAnalysis': 'feeBody',
    'buildDrawdownHistory': 'drawdownHistChart',
    'buildBacktestR7': 'backtestR7Chart',
    'buildPremissasVsRealizado': 'premissasVsRealizadoChart',

    # carteira tab
    'buildDonuts': 'geoDonut',
    'buildStackedAlloc': 'stackedAllocBar',
    'buildPosicoes': 'posBody',
    'buildCustoBase': 'custoBaseBody',
    'buildIrDiferido': 'taxIrBody',
    'buildRfCards': 'rfCardsGrid',
    'renderHodl11': 'hodl11Val',
    'calcAporte': 'calcAporte',
    'buildEtfComposition': 'etfComposicaoRegiao',
    'buildMinilog': 'minilogBody',

    # fire tab
    'buildTrackingFire': 'trackingFireChart',
    'buildScenarioComparison': 'scenarioChart',
    'buildScenarios': 'fireScenarioGrid',
    'buildFireMatrix': 'fireMatrixTable',
    'buildLumpyEvents': 'lumpyEventsBody',
    'buildGlidePath': 'glideChart',
    'buildNetWorthProjection': 'fanChart',
    '_applyFireAxes': None,
    'buildEarliestFire': 'wiFireEta',
    'buildEventosVida': 'eventosVidaBody',
    'buildPfireFamilia': 'kpiPfire50',

    # retiro tab
    'buildGuardrails': 'guardrailsBody',
    'buildIncomeChart': 'incomeChart',
    'buildIncomeTable': 'incomeSrc',
    'buildSpendingGuardrails': 'spendingGuardrailsViz',
    'buildSwrPercentiles': 'wiSWRLabel',
    'buildSpendingBreakdown': 'spendingChart',
    'buildIncomeProjection': 'incomeProjectionChart',
    'buildBondPool': 'bondPoolBody',
    'buildBondPoolRunway': 'bondPoolRunwayChart',

    # simuladores tab
    'buildStressTest': 'stressChartShock',

    # hoje tab (homepage)
    'buildTimestamps': 'timestampsBar',
    'buildTornado': 'tornadoChart',
    'buildSankey': 'sankeySrc',

    # backtest tab
}

# Read spec_html_mapping.json to get all expected components
SPEC_PATH = Path('/Users/diegodemorais/claude/code/wealth/dashboard/tests/spec_html_mapping.json')
spec_data = json.loads(SPEC_PATH.read_text())

# Build reverse map: htmlId -> specId
spec_by_html_id = {item['htmlId']: item for item in spec_data['mapping']}

# Read 01-body.html to check which IDs actually exist
BODY_PATH = Path('/Users/diegodemorais/claude/code/wealth/dashboard/templates/01-body.html')
body_html = BODY_PATH.read_text()

# Extract all id= attributes from HTML
html_ids = set(re.findall(r'id=(["\'])([^"\']+)\1', body_html))
print(f"Total HTML IDs found in 01-body.html: {len(html_ids)}\n")

# Check each component in spec
print("═" * 100)
print("AUDIT: Spec Components vs HTML IDs vs Builder Functions")
print("═" * 100)
print()

missing_html = []
missing_builder = []
mismatched_builder = []

for item in spec_data['mapping']:
    spec_id = item['specId']
    html_id = item['htmlId']
    tab = item['tab']

    # Check if HTML ID exists
    html_exists = html_id in html_ids if html_id != '—' else False

    # Find corresponding builder function
    builder_for_this = None
    for builder_name, target_id in BUILDER_ELEMENT_MAP.items():
        if target_id == html_id:
            builder_for_this = builder_name
            break

    status = '✓' if (html_exists or html_id == '—') else '✗'

    if not html_exists and html_id != '—':
        missing_html.append((spec_id, html_id, tab))
        print(f"{status} MISSING HTML: {spec_id:30} | htmlId={html_id:20} | tab={tab:12} | builder={builder_for_this or '—'}")
    elif not builder_for_this and html_exists:
        missing_builder.append((spec_id, html_id, tab))
        print(f"⚠  NO BUILDER:  {spec_id:30} | htmlId={html_id:20} | tab={tab:12}")
    elif builder_for_this and html_exists:
        print(f"{status} OK          {spec_id:30} | htmlId={html_id:20} | builder={builder_for_this:25}")

print()
print("═" * 100)
print("SUMMARY")
print("═" * 100)
print(f"Missing HTML elements: {len(missing_html)}")
if missing_html:
    for spec_id, html_id, tab in missing_html:
        print(f"  - {spec_id} (htmlId={html_id})")

print(f"\nComponents with no builder function: {len(missing_builder)}")
if missing_builder:
    for spec_id, html_id, tab in missing_builder:
        print(f"  - {spec_id} (htmlId={html_id})")

# Check if tabFns calls match the spec
print("\n" + "═" * 100)
print("TAB FUNCTION MAPPING")
print("═" * 100)

INIT_TABS_PATH = Path('/Users/diegodemorais/claude/code/wealth/dashboard/js/07-init-tabs.mjs')
init_tabs_src = INIT_TABS_PATH.read_text()

# Extract tabFns object
match = re.search(r'const tabFns = \{([^}]+)\};', init_tabs_src, re.DOTALL)
if match:
    tabfns_content = match.group(1)
    # Parse each tab
    for tab_match in re.finditer(r'(\w+):\s*\[(.*?)\]', tabfns_content, re.DOTALL):
        tab_name = tab_match.group(1)
        functions_str = tab_match.group(2)
        # Extract function names
        funcs = re.findall(r'w\.(\w+)\(|function\(\)', functions_str)
        funcs = [f for f in funcs if f]  # remove empty
        print(f"\n{tab_name}:")
        for func in funcs:
            builder_map_entry = BUILDER_ELEMENT_MAP.get(func)
            spec_entry = next((s for s in spec_data['mapping'] if s['htmlId'] == builder_map_entry), None)
            if spec_entry:
                print(f"  ✓ {func:25} → {builder_map_entry:20} ({spec_entry['specId']})")
            elif builder_map_entry:
                print(f"  ⚠ {func:25} → {builder_map_entry:20} (NO SPEC)")
            else:
                print(f"  ✗ {func:25} → NO MAPPING DEFINED")
