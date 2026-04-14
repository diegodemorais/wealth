#!/usr/bin/env python3
"""
validate_globals.py — Verifica se todas as variáveis globais usadas
pelos builders de charts estão sendo expostas no bootstrap.

Uso:
    python3 scripts/validate_globals.py
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

def _extract_globals_from_builders():
    """Lista de variáveis globais conhecidas usadas pelos builders.

    Essas devem estar disponíveis (via bootstrap ou injeção direta no HTML).
    Excluir: Chart (biblioteca externa), DATA (injetado inline), _toggleBlock e forceResponsiveGrids (definidos em 07-init-tabs.mjs).
    """
    # Globals que DEVEM estar acessíveis para os builders funcionarem
    required_globals = {
        'CAMBIO', 'totalEquityUsd', 'totalBrl', 'cryptoBrl',
        'bucketUsd', 'geoUS', 'geoDM', 'geoEM', 'cagr', 'charts',
        'checkMinPoints', 'filterByPeriod', 'fmtBrl', 'fmtBrl2', 'fmtUsd',
        'fmtPct', 'colorPct', 'calcWellness', 'wellnessActions',
        'renderKPIs', 'PAT_GATILHO', 'TWR_USD', 'TWR_BRL', 'progPct',
        '_ymToDecimal', 'today', 'yrInt', 'moInt',
        '_anoFireAlvoGlobal', '_anoFireAspir', '_anoFire',
    }
    return required_globals

def _extract_exposed_from_bootstrap():
    """Extrai lista de variáveis expostas no bootstrap.mjs"""
    bootstrap_file = ROOT / "dashboard/js/bootstrap.mjs"
    content = bootstrap_file.read_text(encoding="utf-8")

    # Padrão: `Object.assign(window, { key1: ..., key2: ..., ... })`
    # Extrai os keys
    pattern = r'(\w+):\s*'

    # Encontrar o bloco Object.assign(window, { ... })
    assign_match = re.search(r'Object\.assign\(window,\s*\{(.*?)\}\s*\);', content, re.DOTALL)
    if not assign_match:
        return set()

    block = assign_match.group(1)
    exposed = set(re.findall(r'(\w+):\s*', block))
    return exposed

def _check_chart_builders():
    """Verifica cada builder em 04-charts-portfolio.mjs"""
    charts_file = ROOT / "dashboard/js/04-charts-portfolio.mjs"
    content = charts_file.read_text(encoding="utf-8")

    # Extrai funções export
    builder_pattern = r'export function (\w+)\(\)'
    builders = re.findall(builder_pattern, content)

    return builders

if __name__ == '__main__':
    print("\n" + "="*80)
    print("🔍 VALIDADOR DE GLOBALS — Verificando exposição de variáveis globais")
    print("="*80 + "\n")

    used_globals = _extract_globals_from_builders()
    exposed_globals = _extract_exposed_from_bootstrap()
    builders = _check_chart_builders()

    print(f"📊 Charts encontrados: {len(builders)} builders")
    print(f"   Exemplos: {', '.join(builders[:5])}\n")

    print(f"🔗 Variáveis globais usadas: {len(used_globals)}")
    print(f"   {', '.join(sorted(used_globals)[:10])}\n")

    print(f"✅ Variáveis expostas no bootstrap: {len(exposed_globals)}")
    print(f"   {', '.join(sorted(list(exposed_globals)[:10]))}\n")

    missing = used_globals - exposed_globals
    if missing:
        print(f"❌ VARIÁVEIS NÃO EXPOSTAS: {len(missing)}")
        for var in sorted(missing):
            print(f"   ❌ {var}")
        print(f"\n⚠️  Adicione as variáveis acima ao Object.assign(window, {...}) em bootstrap.mjs")
        sys.exit(1)
    else:
        print(f"✅ TODAS as variáveis globais estão expostas no bootstrap")
        sys.exit(0)
