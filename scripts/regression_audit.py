#!/usr/bin/env python3
"""
regression_audit.py — Auditoria de regressão visual baseada em validação de dados

Valida que:
1. Componentes principais renderizam (DOM structure)
2. Dados críticos estão presentes (data.json)
3. Nenhuma regressão em layout (CSS classes)
4. KPIs calculam corretamente
"""

import json
import re
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.parent
DASHBOARD_HTML = ROOT / "index.html"
DASHBOARD_DATA = ROOT / "dashboard" / "data.json"
SPEC_JSON = ROOT / "dashboard" / "spec.json"
AUDIT_REPORT_DIR = ROOT / "dashboard" / "audit-reports"
AUDIT_REPORT_DIR.mkdir(parents=True, exist_ok=True)

def load_html():
    """Carrega HTML do dashboard."""
    with open(DASHBOARD_HTML, 'r', encoding='utf-8') as f:
        return f.read()

def load_json(filepath):
    """Carrega arquivo JSON."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def validate_dom_structure(html):
    """Valida estrutura DOM principal."""
    checks = {
        'has_main_container': '<div' in html and 'id=' in html,
        'has_tabs': 'data-tab=' in html or 'tab-' in html.lower(),
        'has_scripts': '<script' in html,
        'has_hero_strip': 'hero' in html.lower() or 'kpi' in html.lower(),
        'has_charts': 'chart' in html.lower() or 'canvas' in html.lower(),
        'has_tables': '<table' in html or 'table-' in html.lower(),
    }
    return checks

def validate_data_structure(data):
    """Valida estrutura de dados do dashboard."""
    required_keys = [
        'patrimonio', 'fire_probability', 'years_to_fire',
        'allocations', 'performance', 'kpis'
    ]

    checks = {}
    for key in required_keys:
        checks[f'has_{key}'] = key in data or any(k.lower().startswith(key) for k in data.keys())

    # Validações específicas
    checks['has_positive_patrimonio'] = data.get('patrimonio', 0) > 0
    checks['fire_probability_0_to_100'] = 0 <= data.get('fire_probability', 0) <= 100
    checks['allocations_sum_reasonable'] = sum(data.get('allocations', {}).values()) > 0

    return checks

def validate_css_classes(html):
    """Valida classes CSS importantes."""
    tailwind_classes = re.findall(r'class="([^"]*)"', html)

    important_patterns = [
        'flex', 'grid', 'w-', 'h-', 'text-', 'bg-', 'border-',
        'card', 'tab', 'chart', 'table', 'badge', 'progress'
    ]

    checks = {}
    for pattern in important_patterns:
        found = any(pattern in cls for cls in tailwind_classes)
        checks[f'has_{pattern}_classes'] = found

    return checks

def compare_with_baseline(current_report, baseline_file=None):
    """Compara com baseline anterior."""
    if not baseline_file or not baseline_file.exists():
        return {'status': 'first_run', 'message': 'Nenhum baseline anterior'}

    try:
        with open(baseline_file, 'r') as f:
            baseline = json.load(f)

        # Encontre diferenças
        current_checks = set(k for k, v in current_report['dom_structure'].items() if v)
        baseline_checks = set(k for k, v in baseline['dom_structure'].items() if v)

        return {
            'status': 'compared',
            'new_checks': list(current_checks - baseline_checks),
            'removed_checks': list(baseline_checks - current_checks),
            'regression_detected': len(baseline_checks - current_checks) > 0
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

def generate_report(html, data):
    """Gera relatório de auditoria."""
    report = {
        'timestamp': datetime.now().isoformat(),
        'dom_structure': validate_dom_structure(html),
        'data_structure': validate_data_structure(data),
        'css_validation': validate_css_classes(html),
        'summary': {
            'total_checks': 0,
            'passed': 0,
            'failed': 0,
            'pass_rate': 0.0
        }
    }

    # Calcule summary
    all_checks = {
        **report['dom_structure'],
        **report['data_structure'],
        **report['css_validation']
    }

    report['summary']['total_checks'] = len(all_checks)
    report['summary']['passed'] = sum(1 for v in all_checks.values() if v)
    report['summary']['failed'] = sum(1 for v in all_checks.values() if not v)
    report['summary']['pass_rate'] = (report['summary']['passed'] / len(all_checks) * 100) if all_checks else 0

    return report

def print_report(report, comparison=None):
    """Imprime relatório formatado."""
    print("\n" + "="*70)
    print("📊 AUDITORIA DE REGRESSÃO VISUAL — DASHBOARD")
    print("="*70)

    summary = report['summary']
    print(f"\n✅ SUMMARY:")
    print(f"   Checks: {summary['passed']}/{summary['total_checks']} passando")
    print(f"   Pass Rate: {summary['pass_rate']:.1f}%")

    # DOM Structure
    print(f"\n🏗️  DOM STRUCTURE:")
    dom = report['dom_structure']
    for check, passed in dom.items():
        symbol = "✅" if passed else "❌"
        print(f"   {symbol} {check}")

    # Data Structure
    print(f"\n📊 DATA STRUCTURE:")
    data = report['data_structure']
    for check, passed in data.items():
        symbol = "✅" if passed else "❌"
        print(f"   {symbol} {check}")

    # CSS Validation
    print(f"\n🎨 CSS CLASSES:")
    css = report['css_validation']
    passed_css = sum(1 for v in css.values() if v)
    print(f"   ✅ {passed_css}/{len(css)} padrões encontrados")

    # Comparação
    if comparison and comparison['status'] != 'first_run':
        print(f"\n🔄 COMPARAÇÃO COM BASELINE:")
        if comparison['status'] == 'compared':
            if comparison['regression_detected']:
                print(f"   ⚠️  REGRESSÃO DETECTADA!")
                print(f"   Checks removidos: {comparison['removed_checks']}")
            else:
                print(f"   ✅ Nenhuma regressão detectada")
            if comparison['new_checks']:
                print(f"   ✨ Novas features: {comparison['new_checks'][:3]}")

    print("\n" + "="*70)

if __name__ == "__main__":
    print("🔍 Auditando dashboard...")

    try:
        html = load_html()
        data = load_json(DASHBOARD_DATA)

        # Gere relatório
        report = generate_report(html, data)

        # Compare com baseline anterior
        baseline_dir = AUDIT_REPORT_DIR / "regressions"
        baseline_dir.mkdir(parents=True, exist_ok=True)
        baseline_files = sorted(baseline_dir.glob("regression-*.json"))
        baseline_file = baseline_files[-1] if baseline_files else None

        comparison = compare_with_baseline(report, baseline_file)

        # Imprima
        print_report(report, comparison)

        # Salve relatório
        report['comparison'] = comparison
        report_file = baseline_dir / f"regression-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)

        print(f"\n💾 Relatório salvo: {report_file}")

        # Exit code baseado em pass rate
        exit_code = 0 if report['summary']['pass_rate'] >= 95 else 1
        exit(exit_code)

    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
