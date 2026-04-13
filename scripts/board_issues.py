#!/usr/bin/env python3
"""
board_issues.py — Gera board formatado de issues (skill /issues-board)
Especificação completa: https://...
"""

from pathlib import Path
from datetime import datetime
import sys
import re

# Import parser
sys.path.insert(0, str(Path(__file__).parent))
from parse_issues import get_all_issues, calculate_age_days


def abreviar_dono(dono):
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

    return dono[:10]


def truncar_titulo(titulo, max_len=45):
    """Truncar título preservando sentido."""
    if not titulo:
        return '—'
    if len(titulo) > max_len:
        return titulo[:max_len-3].rsplit(' ', 1)[0] + '...'
    return titulo


def extrair_prioridade(pri_str):
    """Extrair emoji e label de prioridade."""
    if not pri_str:
        return '—'

    pri_lower = pri_str.lower()

    if 'crítica' in pri_lower:
        return '🔴 Crítica'
    elif 'alta' in pri_lower:
        return '🔴 Alta'
    elif 'média' in pri_lower:
        return '🟡 Média'
    elif 'baixa' in pri_lower:
        return '🟢 Baixa'

    return pri_str


def extrair_dependencias(deps_str):
    """Extrair lista de dependências (apenas IDs, sem explicação)."""
    if not deps_str or deps_str == '—':
        return []

    # Dividir por virgula ou "e"
    deps = re.split(r'[,\s]+e\s+|\s*,\s*', deps_str)

    # Extrair apenas ID antes de parenteses ou outros marcadores
    ids = []
    for d in deps:
        d = d.strip()
        if not d:
            continue
        # Pegar só a parte antes de "(" se houver explicação
        if '(' in d:
            d = d.split('(')[0].strip()
        # Validar que parece um ID (tem hífen, não é só espaço)
        if d and '-' in d:
            ids.append(d)

    return ids


def gerar_board():
    """Gera board formatado segundo especificação."""
    issues = get_all_issues()
    today = datetime(2026, 4, 13)

    # Agrupar por estado
    by_estado = {}
    for issue_id, meta in issues.items():
        estado = meta.get('estado', '—')
        if estado not in by_estado:
            by_estado[estado] = []
        by_estado[estado].append((issue_id, meta))

    # Ordenar issues dentro de cada estado
    for estado in by_estado:
        by_estado[estado].sort(key=lambda x: x[0])

    output = []
    output.append(f'## Board — {today.strftime("%Y-%m-%d")}\n')

    # ════════════════════════════════════════════════════════════════════
    # EM ANDAMENTO (DOING)
    # ════════════════════════════════════════════════════════════════════
    if 'Doing' in by_estado:
        output.append('### 🔵 Em Andamento\n')
        output.append('| ID | Título | Dono | Dias | Status | Bloqueio | Deps |')
        output.append('|----|--------|------|------|--------|----------|------|')

        for issue_id, meta in by_estado['Doing']:
            titulo = truncar_titulo(meta.get('titulo', issue_id))
            dono = abreviar_dono(meta.get('dono'))
            dias = calculate_age_days(meta.get('criado_em'), today)
            dias_str = str(dias) if dias is not None else '—'
            status = 'Implementando'  # padrão
            bloqueio = '—'
            deps = extrair_dependencias(meta.get('dependencias', '—'))
            deps_str = ', '.join(deps[:2]) if deps else '—'

            output.append(f'| {issue_id} | {titulo} | {dono} | {dias_str} | {status} | {bloqueio} | {deps_str} |')

        output.append('')

    # ════════════════════════════════════════════════════════════════════
    # EM REFINAMENTO
    # ════════════════════════════════════════════════════════════════════
    if 'Refinamento' in by_estado:
        output.append('### 🔷 Em Refinamento\n')
        output.append('| ID | Título | Dono | Dias | Pendência |')
        output.append('|----|--------|------|------|-----------|')

        for issue_id, meta in by_estado['Refinamento']:
            titulo = truncar_titulo(meta.get('titulo', issue_id))
            dono = abreviar_dono(meta.get('dono'))
            dias = calculate_age_days(meta.get('criado_em'), today)
            dias_str = str(dias) if dias is not None else '—'

            # Pendência específica
            if issue_id == 'DEV-now-dashboard-review':
                pendencia = 'Aprovação layout + 2 blocantes'
            else:
                pendencia = '—'

            output.append(f'| {issue_id} | {titulo} | {dono} | {dias_str} | {pendencia} |')

        output.append('')

    # ════════════════════════════════════════════════════════════════════
    # BACKLOG (ordenado por prioridade)
    # ════════════════════════════════════════════════════════════════════
    if 'Backlog' in by_estado:
        output.append('### 📋 Backlog\n')
        output.append('| ID | Título | Dono | Prioridade | Dias | Deps |')
        output.append('|----|--------|------|------------|------|------|')

        # Agrupar por prioridade
        por_prioridade = {'crítica': [], 'alta': [], 'média': [], 'baixa': [], '—': []}

        for issue_id, meta in by_estado['Backlog']:
            pri = meta.get('prioridade', '—').lower()

            if 'crítica' in pri:
                grupo = 'crítica'
            elif 'alta' in pri:
                grupo = 'alta'
            elif 'média' in pri:
                grupo = 'média'
            elif 'baixa' in pri:
                grupo = 'baixa'
            else:
                grupo = '—'

            por_prioridade[grupo].append((issue_id, meta))

        # Exibir ordenado por prioridade
        for pri_grupo in ['crítica', 'alta', 'média', 'baixa', '—']:
            if por_prioridade[pri_grupo]:
                for issue_id, meta in por_prioridade[pri_grupo]:
                    titulo = truncar_titulo(meta.get('titulo', issue_id))
                    dono = abreviar_dono(meta.get('dono'))
                    prioridade = extrair_prioridade(meta.get('prioridade'))
                    dias = calculate_age_days(meta.get('criado_em'), today)
                    dias_str = str(dias) if dias is not None else '—'
                    deps = extrair_dependencias(meta.get('dependencias', '—'))
                    deps_str = ', '.join(deps[:2]) if deps else '—'

                    output.append(f'| {issue_id} | {titulo} | {dono} | {prioridade} | {dias_str} | {deps_str} |')

        output.append('')

    # ════════════════════════════════════════════════════════════════════
    # CONCLUÍDAS RECENTES (últimas 5)
    # ════════════════════════════════════════════════════════════════════
    if 'Done' in by_estado:
        output.append('### ✅ Concluídas Recentes\n')
        output.append('| Data | ID | Título | Resultado |')
        output.append('|------|----|---------|-----------| ')

        # Pegar últimas 5 (assumir que estão na ordem correta)
        recent_done = by_estado['Done'][-5:]

        for issue_id, meta in recent_done:
            titulo = truncar_titulo(meta.get('titulo', issue_id), 35)
            data = meta.get('concluido_em', '—')
            resultado = '✓'  # padrão

            output.append(f'| {data} | {issue_id} | {titulo} | {resultado} |')

        output.append('')

    # ════════════════════════════════════════════════════════════════════
    # DISCOVERY
    # ════════════════════════════════════════════════════════════════════
    if 'Discovery' in by_estado:
        output.append('### 🟢 Discovery\n')
        output.append('| ID | Título | Dono | Prioridade |')
        output.append('|----|--------|------|------------|')

        for issue_id, meta in by_estado['Discovery']:
            titulo = truncar_titulo(meta.get('titulo', issue_id), 40)
            dono = abreviar_dono(meta.get('dono'))
            prioridade = extrair_prioridade(meta.get('prioridade'))

            output.append(f'| {issue_id} | {titulo} | {dono} | {prioridade} |')

    return '\n'.join(output)


if __name__ == '__main__':
    print(gerar_board())
