#!/usr/bin/env python3
"""
parse_issues.py — Parser robusto para metadados de issues
Suporta: TABLE (Markdown padrão) e YAML frontmatter (legacy)
"""

from pathlib import Path
import re
from datetime import datetime

def parse_issue_file(file_path):
    """Extrai metadados de um arquivo de issue independente do formato."""

    content = file_path.read_text(encoding='utf-8')
    meta = {
        'id': None,
        'titulo': None,
        'dono': None,
        'estado': None,
        'prioridade': None,
        'criado_em': None,
        'dependencias': None,
        'co_sponsor': None,
    }

    # Detectar formato: YAML (starts with ---) or TABLE
    if content.startswith('---'):
        # YAML Frontmatter
        meta = _parse_yaml_frontmatter(content)
    else:
        # TABLE Markdown (padrão)
        meta = _parse_table_metadata(content)

    # Fallback: extrair ID do nome do arquivo se não encontrar
    if not meta.get('id'):
        meta['id'] = file_path.stem

    # Extrair título da primeira linha
    if not meta.get('titulo'):
        first_line = content.split('\n')[0]
        # Remove prefixo "# ID: " ou "# ID — "
        meta['titulo'] = re.sub(r'^#+\s*[A-Z]+-[\w-]+[\s:—–-]*', '', first_line).strip()

    return meta


def _parse_yaml_frontmatter(content):
    """Parse YAML frontmatter (legacy format)."""
    meta = {}

    # Extrair bloco YAML
    match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return meta

    yaml_block = match.group(1)

    # Parse simples (sem YAML parser, apenas regex)
    for line in yaml_block.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip().lower()
            value = value.strip().strip('"\'')

            # Map keys
            if key == 'code':
                meta['id'] = value
            elif key in ['titulo', 'title']:
                meta['titulo'] = value
            elif key == 'dono':
                meta['dono'] = value
            elif key == 'estado':
                meta['estado'] = value
            elif key == 'criado_em':
                meta['criado_em'] = value
            elif key == 'prioridade':
                meta['prioridade'] = value

    return meta


def _parse_table_metadata(content):
    """Parse TABLE Markdown metadata (padrão)."""
    meta = {}

    # Procura pela tabela de metadados delimitada por "## Metadados" e a próxima seção
    metadados_section = ''
    in_metadados = False

    for line in content.split('\n'):
        if '## Metadados' in line:
            in_metadados = True
            continue
        if in_metadados and line.startswith('##'):
            break
        if in_metadados:
            metadados_section += line + '\n'

    if not metadados_section:
        return meta

    # Parser de tabela simples
    for line in metadados_section.split('\n'):
        if not line.startswith('|') or 'Campo' in line or '---' in line:
            continue

        parts = [p.strip() for p in line.split('|')]
        if len(parts) >= 3:
            campo_raw = parts[1]
            valor = parts[2]

            if not campo_raw or not valor:
                continue

            # Limpar campo (remove **bold**)
            campo = campo_raw.lower().replace('**', '').strip()

            # Map campos conhecidos
            if campo == 'id':
                meta['id'] = valor
            elif 'titulo' in campo or 'title' in campo:
                meta['titulo'] = valor
            elif 'dono' in campo:
                meta['dono'] = valor
            elif 'status' in campo or 'estado' in campo:
                meta['estado'] = valor
            elif 'prioridade' in campo:
                meta['prioridade'] = valor
            elif 'criado' in campo:
                meta['criado_em'] = valor
            elif 'dependencia' in campo:
                meta['dependencias'] = valor
            elif 'co' in campo and 'sponsor' in campo:
                meta['co_sponsor'] = valor

    return meta


def calculate_age_days(criado_em_str, today=None):
    """Calcula idade em dias."""
    if not criado_em_str or criado_em_str == '—':
        return None

    if today is None:
        today = datetime(2026, 4, 13)  # Data fixa do projeto

    try:
        criado = datetime.strptime(criado_em_str, '%Y-%m-%d')
        return (today - criado).days
    except:
        return None


def get_all_issues():
    """Carrega todos os issues do diretório agentes/issues/."""
    issues_dir = Path(__file__).parent.parent / 'agentes' / 'issues'

    issues = {}

    for issue_file in sorted(issues_dir.glob('*.md')):
        if issue_file.name in ['README.md', '_TEMPLATE.md']:
            continue

        try:
            meta = parse_issue_file(issue_file)
            if meta['id']:
                issues[meta['id']] = meta
        except Exception as e:
            print(f"Warning: falha ao parsear {issue_file.name}: {e}")

    return issues


if __name__ == '__main__':
    issues = get_all_issues()

    print(f"Total de issues encontradas: {len(issues)}\n")

    # Agrupar por estado
    by_estado = {}
    for issue_id, meta in issues.items():
        estado = meta.get('estado') or '—'
        if estado not in by_estado:
            by_estado[estado] = []
        by_estado[estado].append((issue_id, meta))

    # Exibir por estado
    for estado in ['Refinamento', 'Backlog', 'Doing', 'Done', 'Discovery']:
        if estado in by_estado:
            print(f"\n### {estado.upper()}")
            for issue_id, meta in by_estado[estado]:
                dias = calculate_age_days(meta.get('criado_em'))
                dias_str = str(dias) if dias is not None else '—'
                prioridade = meta.get('prioridade', '—')[:10]  # Shorten emoji
                print(f"  {issue_id:30} | {meta.get('dono', '—'):20} | {prioridade:8} | {dias_str:3}d")
