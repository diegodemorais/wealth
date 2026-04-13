#!/usr/bin/env python3
"""
generate_issues_board.py — Gera board formatado de issues
Usa parse_issues.py para extrair metadados (suporta TABLE e YAML)
"""

from pathlib import Path
from datetime import datetime
import sys

# Import parser
sys.path.insert(0, str(Path(__file__).parent))
from parse_issues import get_all_issues, calculate_age_days


def map_dono_abrev(dono):
    """Abreviar nome do dono."""
    if not dono:
        return '—'

    mapa = {
        'Head': 'Head',
        'Dev': 'Dev',
        'FIRE': 'FIRE',
        'Factor': 'Factor',
        'RF': 'RF',
        'Tax': 'Tax',
        'Risco': 'Risco',
        'Advocate': 'Advocate',
        'Bookkeeper': 'Bk',
        'Patrimonial': 'Patr',
        'FX': 'FX',
        'Quant': 'Quant',
    }

    for key, val in mapa.items():
        if key.lower() in dono.lower():
            return val

    return dono[:10]  # fallback: primeiros 10 chars


def format_prioridade(pri):
    """Extrair emoji e label de prioridade."""
    if not pri:
        return '—'
    pri_lower = pri.lower()
    if 'alta' in pri_lower or 'crítica' in pri_lower:
        return '🔴 Alta'
    elif 'média' in pri_lower:
        return '🟡 Média'
    elif 'baixa' in pri_lower:
        return '🟢 Baixa'
    return pri


def gerar_board():
    """Gera board formatado."""
    issues = get_all_issues()
    today = datetime(2026, 4, 13)

    # Agrupar por estado
    by_estado = {}
    for issue_id, meta in issues.items():
        estado = meta.get('estado') or '—'
        if estado not in by_estado:
            by_estado[estado] = []
        by_estado[estado].append((issue_id, meta))

    # Ordenar issues dentro de cada estado
    for estado in by_estado:
        by_estado[estado].sort(key=lambda x: x[0])

    output = []
    output.append('# Board — Issues Carteira Diego\n')
    output.append(f'**Data**: {today.strftime("%Y-%m-%d")}\n')

    # ════════════════════════════════════════════════════════════════════
    # REFINAMENTO
    # ════════════════════════════════════════════════════════════════════
    if 'Refinamento' in by_estado:
        output.append('\n## 🔷 Em Refinamento\n')
        output.append('| ID | Título | Dono | Dias | Pendência |')
        output.append('|----|--------|------|------|-----------|')

        for issue_id, meta in by_estado['Refinamento']:
            titulo = meta.get('titulo', issue_id)[:50]
            dono = map_dono_abrev(meta.get('dono'))
            dias = calculate_age_days(meta.get('criado_em'), today)
            dias_str = str(dias) if dias is not None else '—'

            # Pendência simples
            if issue_id == 'DEV-now-dashboard-review':
                pendencia = 'Aprovação layout + 2 blocantes'
            else:
                pendencia = '—'

            output.append(f'| {issue_id} | {titulo} | {dono} | {dias_str} | {pendencia} |')

    # ════════════════════════════════════════════════════════════════════
    # BACKLOG
    # ════════════════════════════════════════════════════════════════════
    if 'Backlog' in by_estado:
        output.append('\n## 📋 Backlog\n')
        output.append('| ID | Título | Dono | Prioridade | Dias |')
        output.append('|----|--------|------|------------|------|')

        for issue_id, meta in by_estado['Backlog']:
            titulo = meta.get('titulo', issue_id)[:40]
            dono = map_dono_abrev(meta.get('dono'))
            prioridade = format_prioridade(meta.get('prioridade'))
            dias = calculate_age_days(meta.get('criado_em'), today)
            dias_str = str(dias) if dias is not None else '—'

            output.append(f'| {issue_id} | {titulo} | {dono} | {prioridade} | {dias_str} |')

    # ════════════════════════════════════════════════════════════════════
    # DOING
    # ════════════════════════════════════════════════════════════════════
    if 'Doing' in by_estado:
        output.append('\n## 🟠 Em Andamento\n')
        output.append('| ID | Título | Dono | Dias | Status |')
        output.append('|----|--------|------|------|--------|')

        for issue_id, meta in by_estado['Doing']:
            titulo = meta.get('titulo', issue_id)[:40]
            dono = map_dono_abrev(meta.get('dono'))
            dias = calculate_age_days(meta.get('criado_em'), today)
            dias_str = str(dias) if dias is not None else '—'

            output.append(f'| {issue_id} | {titulo} | {dono} | {dias_str} | Implementando |')

    # ════════════════════════════════════════════════════════════════════
    # DONE (últimas 5)
    # ════════════════════════════════════════════════════════════════════
    if 'Done' in by_estado:
        output.append('\n## ✅ Concluídas Recentes\n')
        output.append('| ID | Título | Data | Resultado |')
        output.append('|----|--------|------|-----------|')

        # Pegar últimas 5 concluídas (ordenadas por data)
        recent_done = list(by_estado['Done'])[-5:]

        for issue_id, meta in recent_done:
            titulo = meta.get('titulo', issue_id)[:40]
            concluido = meta.get('concluido_em', '—')

            output.append(f'| {issue_id} | {titulo} | {concluido} | ✓ |')

    # ════════════════════════════════════════════════════════════════════
    # DISCOVERY
    # ════════════════════════════════════════════════════════════════════
    if 'Discovery' in by_estado:
        output.append('\n## 🟢 Discovery\n')
        output.append('| ID | Título | Dono | Prioridade |')
        output.append('|----|--------|------|------------|')

        for issue_id, meta in by_estado['Discovery']:
            titulo = meta.get('titulo', issue_id)[:40]
            dono = map_dono_abrev(meta.get('dono'))
            prioridade = format_prioridade(meta.get('prioridade'))

            output.append(f'| {issue_id} | {titulo} | {dono} | {prioridade} |')

    return '\n'.join(output)


if __name__ == '__main__':
    print(gerar_board())
