#!/usr/bin/env python3
import re
import json
from pathlib import Path

html = Path('dashboard/template.html').read_text()

# Find all elements with data-in-tab
pattern = r'data-in-tab="([^"]*)"[^>]*id="([^"]*)"'
matches = re.findall(pattern, html)

components_by_tab = {}
for tab, component_id in matches:
    if tab not in components_by_tab:
        components_by_tab[tab] = []
    components_by_tab[tab].append(component_id)

# Map tabs to match spec naming
tab_mapping = {
    'hoje': 'now',
    'carteira': 'portfolio',
    'perf': 'performance',
    'fire': 'fire',
    'retiro': 'retiro',
    'simuladores': 'simuladores',
    'backtest': 'backtest',
}

result = {}
for tab, ids in sorted(components_by_tab.items()):
    spec_tab = tab_mapping.get(tab, tab)
    print(f"\n{tab} ({spec_tab}): {len(ids)} componentes")
    for cid in sorted(ids):
        print(f"  - {cid}")
        result[cid] = {'tab': tab, 'spec_tab': spec_tab}

# Save mapping
Path('component_mapping.json').write_text(json.dumps(result, indent=2))
print(f"\n✅ Salvos em component_mapping.json\n")
