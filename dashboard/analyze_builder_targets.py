#!/usr/bin/env python3
"""
Analyze what element IDs each builder function expects vs what's in the spec.
"""

import re
import json
from pathlib import Path

# Map of builder functions to the actual element IDs they target
# (extracted by reading the builder source code)
BUILDER_ACTUAL_TARGETS = {
    # From 04-charts-portfolio.mjs
    'buildFeeAnalysis': 'feeBody',  # line 763
    'buildIrDiferido': 'taxIrBody',  # line 1566
    'buildMinilog': 'minilogBody',  # line 1134
    'buildRetornoHeatmap': 'heatmapContainer',  # line 1268
    'buildTimeline': 'timelineChart',  # line 35
    'buildAttribution': 'attrChart',  # line 241
    'buildDeltaBar': 'deltaChart',  # line 436
    'buildGlidePath': 'glideChart',  # line 543
    'buildFanChart': 'fanChart',  # line 649
    'buildGuardrails': 'guardrailsBody',  # line 691
    'buildIncomeChart': 'incomeChart',  # line 726
    'buildRollingSharp': 'rollingSharpChart',  # line 1428
    'buildInformationRatio': 'rollingIRChart',  # line 1513 - creates chart on rollingIRChart, also populates irITDCards
    'buildBacktest': 'backtestChart',  # line 1694, 1753
    'buildBacktestR7': 'backtestR7Chart',  # line 1921
    'buildShadowChart': 'shadowChart',  # line 2009

    # From 06-dashboard-render.mjs
    'buildShadowTable': 'shadowTableBody',  # line 843
    'renderIpcaProgress': 'ipcaProgressFill',  # multiple ID targets

    # From 07-init-tabs.mjs
    'buildDrawdownHistory': 'drawdownHistChart',  # line 1064
    'buildLumpyEvents': 'lumpyEventsBody',  # line 1305
    'buildFactorRolling': 'factorRollingBody',  # line 1551 - targets container, creates canvas inside
    'buildFactorLoadings': 'factorLoadingsChart',  # line 1746
    'buildCagrVsTwr': 'cagrPatrimonial',  # line 1818

    # From other locations (need to find)
    'buildDonuts': 'geoDonut',
    'buildStackedAlloc': 'stackedAllocBar',
    'buildPosicoes': 'posBody',
    'buildCustoBase': 'custoBaseBody',
    'buildRfCards': 'rfCardsGrid',
    'renderHodl11': 'hodl11Val',
    'calcAporte': 'calcAporte',
    'buildEtfComposition': 'etfComposicaoRegiao',  # needs verification
    'buildTrackingFire': 'trackingFireChart',
    'buildScenarioComparison': 'scenarioChart',
    'buildScenarios': 'fireScenarioGrid',
    'buildFireMatrix': 'fireMatrixTable',
    'buildGlidePath': 'glideChart',
    'buildNetWorthProjection': 'fanChart',
    'buildEarliestFire': 'wiFireEta',
    'buildEventosVida': 'eventosVidaBody',
    'buildPfireFamilia': 'kpiPfire50',
    'buildIncomeTable': 'incomeSrc',
    'buildSpendingGuardrails': 'spendingGuardrailsViz',
    'buildSwrPercentiles': 'wiSWRLabel',
    'buildSpendingBreakdown': 'spendingChart',
    'buildIncomeProjection': 'incomeProjectionChart',
    'buildBondPool': 'bondPoolBody',
    'buildBondPoolRunway': 'bondPoolRunwayChart',
    'buildTimestamps': 'timestampsBar',
    'buildTornado': 'tornadoChart',
    'buildSankey': 'sankeySrc',
    'buildStressTest': 'stressChartShock',
}

# Read spec
spec_path = Path('/Users/diegodemorais/claude/code/wealth/dashboard/tests/spec_html_mapping.json')
spec = json.loads(spec_path.read_text())

# Read HTML
body_path = Path('/Users/diegodemorais/claude/code/wealth/dashboard/templates/01-body.html')
body_html = body_path.read_text()

# Extract all id= from HTML
html_ids = set(re.findall(r'id\s*=\s*["\']([^"\']+)["\']', body_html))

print("=" * 100)
print("BUILDER TARGET ANALYSIS")
print("=" * 100)

missing_in_html = []
mismatch = []
correct = []

for item in spec['mapping']:
    spec_id = item['specId']
    spec_html_id = item['htmlId']

    if spec_html_id == '—':
        continue

    # Check if HTML ID exists
    if spec_html_id not in html_ids:
        missing_in_html.append((spec_id, spec_html_id))
        continue

    # Check what builder should render to this component
    found_builder = None
    for builder, target_id in BUILDER_ACTUAL_TARGETS.items():
        if target_id == spec_html_id:
            found_builder = builder
            break

    if found_builder:
        correct.append((spec_id, spec_html_id, found_builder))
        print(f"✓ {spec_id:30} → {spec_html_id:20} (builder: {found_builder})")
    else:
        mismatch.append((spec_id, spec_html_id))
        print(f"⚠ {spec_id:30} → {spec_html_id:20} (NO BUILDER TARGETS THIS ID)")

print("\n" + "=" * 100)
print("PROBLEM SUMMARY")
print("=" * 100)
print(f"\nMissing in HTML ({len(missing_in_html)}):")
for spec_id, html_id in missing_in_html[:10]:
    print(f"  - {spec_id:30} (needs id={html_id})")

print(f"\nNo builder targets this ID ({len(mismatch)}):")
for spec_id, html_id in mismatch[:10]:
    print(f"  - {spec_id:30} (id={html_id})")

print(f"\nCorrect ({len(correct)}):")
for spec_id, html_id, builder in correct[:5]:
    print(f"  ✓ {spec_id:30} {builder}")
