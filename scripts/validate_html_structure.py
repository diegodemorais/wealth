#!/usr/bin/env python3
"""
validate_html_structure.py — Validador de estrutura HTML do dashboard

Roda após build_dashboard.py e bloqueia se houver problemas estruturais:
- Divs desbalanceados
- Container abre mas não fecha corretamente
- Divs fecham antes do container

IMPORTANTE: Roda automaticamente via build_dashboard.py —não precisa chamar manualmente.
Mas você pode rodar isolado: python3 scripts/validate_html_structure.py
"""

import sys
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
INDEX_HTML = ROOT / "dashboard" / "index.html"


def validate_html_structure(html_path: str) -> tuple[bool, list[str]]:
    """Valida estrutura HTML do dashboard.

    Retorna (is_valid, list_of_errors)
    """
    errors = []

    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    lines = html.split('\n')

    # ═══════════════════════════════════════════════════════════════
    # 1. Verificar balanceamento de divs globalmente
    # ═══════════════════════════════════════════════════════════════
    total_opens = html.count('<div')
    total_closes = html.count('</div>')

    if total_opens != total_closes:
        errors.append(
            f"❌ Divs desbalanceados globalmente: {total_opens} opens vs {total_closes} closes "
            f"(diferença: {total_opens - total_closes})"
        )

    # ═══════════════════════════════════════════════════════════════
    # 2. Verificar container aberta e fechada corretamente
    # ═══════════════════════════════════════════════════════════════
    container_open_count = html.count('<div class="container">')
    container_close_count = html.count('</div><!-- /container -->')

    if container_open_count != 1:
        errors.append(f"❌ Container abre {container_open_count}x (esperado 1x)")

    if container_close_count != 1:
        errors.append(f"❌ Container fecha {container_close_count}x (esperado 1x)")

    # ═══════════════════════════════════════════════════════════════
    # 3. Verificar se divs fecham antes do container fechar
    # ═══════════════════════════════════════════════════════════════
    balance = 0
    container_line = None
    problem_line = None

    for i, line in enumerate(lines):
        opens = line.count('<div')
        closes = line.count('</div>')
        prev_balance = balance
        balance += opens - closes

        # Marca quando container abre
        if '<div class="container">' in line:
            container_line = i + 1

        # Se balance fica negativo ANTES do container fechar, é problema
        if balance < 0 and '</div><!-- /container -->' not in line:
            if problem_line is None:
                problem_line = i + 1

    if problem_line is not None and container_line is not None:
        errors.append(
            f"❌ Balance fica negativo em linha {problem_line} "
            f"(container abre em linha {container_line}, "
            f"fecha corretamente em 1366). "
            f"Há divs fechando antes do container fechar!"
        )

    # ═══════════════════════════════════════════════════════════════
    # 4. Verificar que container fecha com balance = 0 exatamente
    # ═══════════════════════════════════════════════════════════════
    balance = 0
    container_close_line = None

    for i, line in enumerate(lines):
        opens = line.count('<div')
        closes = line.count('</div>')
        balance += opens - closes

        if '</div><!-- /container -->' in line:
            container_close_line = i + 1
            break

    if container_close_line and balance != 0:
        errors.append(
            f"❌ Container fecha em linha {container_close_line} "
            f"com balance={balance} (esperado 0). "
            f"Há divs abertos que não fecham dentro do container!"
        )

    return len(errors) == 0, errors


def main():
    if not INDEX_HTML.exists():
        print(f"❌ {INDEX_HTML} não encontrado. Rode build_dashboard.py primeiro.")
        sys.exit(1)

    is_valid, errors = validate_html_structure(str(INDEX_HTML))

    if is_valid:
        print("✅ Estrutura HTML validada com sucesso")
        print(f"   • Divs balanceados")
        print(f"   • Container abre e fecha 1x cada")
        print(f"   • Nenhum div fecha antes do container")
        return 0
    else:
        print("❌ VALIDAÇÃO FALHOU — Problemas estruturais encontrados:\n")
        for err in errors:
            print(f"   {err}")
        print("\n💡 Dica: Procure por divs que fecham fora de seus containers.")
        print("   Elementos devem estar DENTRO do '.container', não depois dele.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
