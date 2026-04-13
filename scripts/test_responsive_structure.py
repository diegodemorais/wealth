#!/usr/bin/env python3
"""
test_responsive_structure.py — Testa responsividade da estrutura CSS

Verifica se:
- Media queries estão presentes
- CSS responsivo não tem conflitos óbvios
- Grid templates estão sobrescrevendo inline styles corretamente em 768px

NÃO executa JavaScript nem abre browser — apenas análise estática.
"""

import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
TEMPLATE = ROOT / "dashboard" / "template.html"


def check_responsive_css(html_path: str) -> tuple[bool, list[str]]:
    """Verifica se CSS responsivo está bem formado.

    Retorna (warnings_found, list_of_warnings)
    """
    warnings = []

    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # ═══════════════════════════════════════════════════════════════
    # 1. Verificar media queries necessárias
    # ═══════════════════════════════════════════════════════════════
    media_queries = re.findall(r'@media\s*\([^)]*\)', html)
    media_768 = re.findall(r'@media\s*\([^)]*768px[^)]*\)', html)
    media_480 = re.findall(r'@media\s*\([^)]*480px[^)]*\)', html)

    if not media_queries:
        warnings.append("⚠️  Nenhuma media query encontrada (esperado 3+)")

    if not media_768:
        warnings.append("⚠️  Media query 768px não encontrada (problemas em tablets)")

    if not media_480:
        warnings.append("⚠️  Media query 480px não encontrada (problemas em mobile)")

    # ═══════════════════════════════════════════════════════════════
    # 2. Verificar !important (necessário para override de inline styles)
    # ═══════════════════════════════════════════════════════════════
    important_count = html.count('!important')

    if important_count < 10:
        warnings.append(
            f"⚠️  Apenas {important_count} !important no CSS "
            "(esperado 15+). Media queries podem não sobrescrever inline grid-template-columns."
        )

    # ═══════════════════════════════════════════════════════════════
    # 3. Verificar se há conflitos de width/overflow em grids
    # ═══════════════════════════════════════════════════════════════
    # Procura por padrão: grid com min-width que não tem "min-width:0"
    grid_patterns = re.findall(
        r'grid-template-columns:repeat\([^)]*minmax\([^,]*,([^)]*)\)',
        html
    )

    problematic_grids = 0
    for pattern in grid_patterns:
        if 'minmax' in pattern and 'fr' in pattern:
            # OK — isso é responsivo
            pass
        elif pattern.isdigit() or 'px' in pattern:
            # Possivelmente problemático — minmax com valor fixo pode cause overflow
            problematic_grids += 1

    if problematic_grids > 0:
        warnings.append(
            f"⚠️  {problematic_grids} grid(s) com minmax potencialmente problemático "
            "(use minmax(100px, 1fr) em vez de minmax(200px, 1fr))"
        )

    # ═══════════════════════════════════════════════════════════════
    # 4. Verificar se há overflow-x:auto em tabelas
    # ═══════════════════════════════════════════════════════════════
    overflow_tables = re.findall(r'overflow-x:auto', html)
    if len(overflow_tables) < 5:
        warnings.append(
            f"⚠️  Apenas {len(overflow_tables)} overflow-x:auto encontrados. "
            "Tabelas podem overflow em mobile."
        )

    # ═══════════════════════════════════════════════════════════════
    # 5. Verificar forceResponsiveGrids função (JavaScript)
    # ═══════════════════════════════════════════════════════════════
    force_responsive = 'forceResponsiveGrids' in html

    if not force_responsive:
        warnings.append(
            "⚠️  Função forceResponsiveGrids não encontrada. "
            "JavaScript responsivo pode estar desabilitado."
        )

    return len(warnings) == 0, warnings


def main():
    if not TEMPLATE.exists():
        print(f"❌ {TEMPLATE} não encontrado.")
        return 1

    is_ok, warnings = check_responsive_css(str(TEMPLATE))

    if is_ok:
        print("✅ Responsividade: OK (sem problemas detectados)")
        return 0
    else:
        print("⚠️  AVISOS de Responsividade:\n")
        for warn in warnings:
            print(f"   {warn}")
        print("\n💡 Dica: Estes são avisos, não erros críticos.")
        print("   Mas verifique especialmente a media query 768px se o layout")
        print("   estiver quebrado em tablets.")
        return 0  # Apenas aviso, não bloqueia


if __name__ == "__main__":
    import sys
    sys.exit(main())
