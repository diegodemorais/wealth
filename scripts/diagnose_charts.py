#!/usr/bin/env python3
"""
diagnose_charts.py — Diagnóstico de renderização de charts

Valida:
1. Quais canvas IDs estão definidos no HTML
2. Quais funções de chart builder existem e são exportadas
3. Qual é o mismatch entre expectativa e realidade
"""

import re
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
HTML_PATH = ROOT / "dashboard" / "index.html"
BOOTSTRAP_PATH = ROOT / "dashboard" / "bootstrap.mjs"
CHART_BUILDERS_PATH = ROOT / "dashboard" / "js" / "04-charts-portfolio.mjs"
INIT_TABS_PATH = ROOT / "dashboard" / "js" / "07-init-tabs.mjs"

print("\n" + "="*70)
print("🔍 CHART RENDERING DIAGNOSIS")
print("="*70)

# 1. Extrair canvas IDs do HTML
print("\n📋 Canvas Elements in HTML")
html = HTML_PATH.read_text(encoding="utf-8")
canvas_ids = re.findall(r'<canvas[^>]*id=["\'](\w+)["\']', html)
print(f"   {len(canvas_ids)} canvas elements encontrados:")
for cid in sorted(set(canvas_ids)):
    print(f"   • {cid}")

# 2. Extrair builder functions do módulo de charts
print("\n📋 Chart Builder Functions (04-charts-portfolio.mjs)")
chart_builders_content = CHART_BUILDERS_PATH.read_text(encoding="utf-8")
builder_pattern = r'export function (build\w+)\s*\('
builder_funcs = re.findall(builder_pattern, chart_builders_content)
print(f"   {len(builder_funcs)} builder functions exportadas:")
for func in sorted(builder_funcs):
    print(f"   • {func}()")

# 3. Extrair chamadas de builder em init()
print("\n📋 Builder Calls in init()")
init_content = INIT_TABS_PATH.read_text(encoding="utf-8")
init_match = re.search(r'export function init\(\)\s*\{(.*?)\n  \}', init_content, re.DOTALL)
if init_match:
    init_body = init_match.group(1)
    # Remove comments e strings
    init_clean = re.sub(r'//.*?$', '', init_body, flags=re.MULTILINE)
    init_clean = re.sub(r'/\*.*?\*/', '', init_clean, flags=re.DOTALL)
    # Extract build calls
    build_calls = re.findall(r'(build\w+)\s*\(', init_clean)
    print(f"   {len(set(build_calls))} builder functions são chamadas:")
    for call in sorted(set(build_calls)):
        print(f"   • {call}()")

# 4. Validar Object.assign(window) em bootstrap.mjs
print("\n📋 Bootstrap Exports (Object.assign)")
bootstrap = BOOTSTRAP_PATH.read_text(encoding="utf-8")
assign_match = re.search(r'Object\.assign\(window,\s*\{(.*?)\n  \}\);', bootstrap, re.DOTALL)
if assign_match:
    assign_block = assign_match.group(1)
    exported_keys = re.findall(r'^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', assign_block, re.MULTILINE)
    builder_exports = [k for k in exported_keys if k.startswith('build') or k == 'renderKPIs']
    print(f"   {len(builder_exports)} builder functions são expostas a window:")
    for key in sorted(builder_exports):
        print(f"   • window.{key}")

# 5. Analisar problemas
print("\n" + "="*70)
print("🔍 ANALYSIS")
print("="*70)

# Problema: canvas não encontrados
print("\n1. Canvas Elements vs Init Calls")
called_builders = set(build_calls)
for builder in sorted(called_builders):
    # Inferir o canvas ID a partir do nome do builder
    # Ex: buildFanChart → fanChart
    inferred_id = builder[5].lower() + builder[6:]  # Remove 'build' prefix, lowercase first letter
    if inferred_id not in canvas_ids:
        print(f"   ⚠️  {builder}() → esperado canvas id='{inferred_id}' — NÃO ENCONTRADO")
    else:
        print(f"   ✓ {builder}() → canvas id='{inferred_id}' encontrado")

# Problema: builders não exportados
print("\n2. Exported vs Called")
builder_set = set([f[5:] for f in builder_funcs])  # Remove 'build' prefix
for builder in sorted(called_builders):
    builder_name = builder[5:]  # Remove 'build' prefix
    if builder not in [k for k in exported_keys if k.startswith('build')]:
        print(f"   ⚠️  {builder}() é CHAMADO mas não está em Object.assign")
    else:
        print(f"   ✓ {builder}() está em Object.assign")

print("\n" + "="*70)
