#!/usr/bin/env python3
"""
visual_audit.py — Auditoria visual do dashboard (DOM + CSS)

Compara estrutura HTML, classes CSS e dados entre versões.

Uso:
    python3 scripts/visual_audit.py [--compare <arquivo-anterior>]
"""

import json
import re
from pathlib import Path
from datetime import datetime
from html.parser import HTMLParser

ROOT = Path(__file__).parent.parent
DASHBOARD_HTML = ROOT / "index.html"
AUDIT_REPORT_DIR = ROOT / "dashboard" / "audit-reports"
AUDIT_REPORT_DIR.mkdir(parents=True, exist_ok=True)

class ComponentExtractor(HTMLParser):
    """Extrai componentes do HTML para análise."""

    def __init__(self):
        super().__init__()
        self.components = {}
        self.current_section = None
        self.in_script = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        # Identifique seções principais
        if tag in ['div', 'section'] and 'id' in attrs_dict:
            self.current_section = attrs_dict['id']

        # Extraia componentes com data-* attributes
        if tag in ['div', 'section', 'article'] and 'data-component' in attrs_dict:
            comp_name = attrs_dict['data-component']
            self.components[comp_name] = {
                'tag': tag,
                'classes': attrs_dict.get('class', '').split(),
                'attributes': attrs_dict,
                'section': self.current_section
            }

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.in_script = True
        super().handle_starttag(tag, attrs)

def extract_components(html_file):
    """Extrai componentes do arquivo HTML."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extraia seções principais (divs com IDs)
    sections = re.findall(r'<(div|section|article)\s+[^>]*id="([^"]+)"[^>]*>', content)

    # Extraia componentes com classes tailwind específicas
    components = re.findall(r'<(div|section)\s+[^>]*class="([^"]*(?:card|grid|chart|table)[^"]*)"[^>]*>', content)

    # Extraia tabs
    tabs = re.findall(r'data-tab="([^"]+)"', content)

    return {
        'sections': list(set(s[1] for s in sections)),
        'components': list(set(c[1] for c in components)),
        'tabs': list(set(tabs)),
        'total_divs': len(re.findall(r'<div\s', content)),
        'total_classes': len(re.findall(r'class="', content))
    }

def compare_audits(current, previous=None):
    """Compara auditoria atual com a anterior."""
    report = {
        'timestamp': datetime.now().isoformat(),
        'dashboard': current,
        'changes': {}
    }

    if previous:
        report['changes'] = {
            'new_sections': set(current['sections']) - set(previous['sections']),
            'removed_sections': set(previous['sections']) - set(current['sections']),
            'new_components': set(current['components']) - set(previous['components']),
            'removed_components': set(previous['components']) - set(current['components']),
            'new_tabs': set(current['tabs']) - set(previous['tabs']),
            'removed_tabs': set(previous['tabs']) - set(current['tabs']),
            'div_count_delta': current['total_divs'] - previous['total_divs'],
            'class_count_delta': current['total_classes'] - previous['total_classes']
        }

    return report

def print_report(report):
    """Imprime relatório formatado."""
    print("\n" + "="*60)
    print("📊 AUDITORIA VISUAL DO DASHBOARD")
    print("="*60)

    dashboard = report['dashboard']
    print(f"\n📍 Seções encontradas: {len(dashboard['sections'])}")
    for sec in sorted(dashboard['sections'])[:5]:
        print(f"   - {sec}")
    if len(dashboard['sections']) > 5:
        print(f"   ... e {len(dashboard['sections']) - 5} mais")

    print(f"\n🧩 Componentes encontrados: {len(dashboard['components'])}")
    for comp in sorted(dashboard['components'])[:5]:
        print(f"   - {comp}")
    if len(dashboard['components']) > 5:
        print(f"   ... e {len(dashboard['components']) - 5} mais")

    print(f"\n📑 Abas encontradas: {len(dashboard['tabs'])}")
    print(f"   {', '.join(sorted(dashboard['tabs']))}")

    print(f"\n📈 Estatísticas:")
    print(f"   - Total de divs: {dashboard['total_divs']}")
    print(f"   - Total de classes: {dashboard['total_classes']}")

    if report.get('changes'):
        changes = report['changes']
        print(f"\n🔄 Mudanças detectadas:")

        if changes.get('new_sections'):
            print(f"   ✨ Novas seções: {', '.join(changes['new_sections'])}")
        if changes.get('removed_sections'):
            print(f"   ❌ Seções removidas: {', '.join(changes['removed_sections'])}")
        if changes.get('div_count_delta') != 0:
            delta = changes['div_count_delta']
            symbol = "+" if delta > 0 else ""
            print(f"   📊 Divs: {symbol}{delta}")
        if changes.get('class_count_delta') != 0:
            delta = changes['class_count_delta']
            symbol = "+" if delta > 0 else ""
            print(f"   🎨 Classes CSS: {symbol}{delta}")

    print("\n" + "="*60)

if __name__ == "__main__":
    import sys

    print(f"🔍 Analisando: {DASHBOARD_HTML}")

    if not DASHBOARD_HTML.exists():
        print(f"❌ Arquivo não encontrado: {DASHBOARD_HTML}")
        sys.exit(1)

    # Extraia componentes atuais
    current = extract_components(DASHBOARD_HTML)

    # Tente carregar auditoria anterior
    previous_files = sorted(AUDIT_REPORT_DIR.glob("audit-*.json"))
    previous = None

    if previous_files and '--compare' in sys.argv:
        previous_file = previous_files[-1]
        with open(previous_file, 'r') as f:
            previous = json.load(f)['dashboard']
        print(f"📂 Comparando com: {previous_file.name}")

    # Gere relatório
    report = compare_audits(current, previous)

    # Salve relatório
    report_file = AUDIT_REPORT_DIR / f"audit-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2, default=str)

    # Imprima
    print_report(report)
    print(f"\n💾 Relatório salvo: {report_file}")
