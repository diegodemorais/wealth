#!/usr/bin/env python3
"""
Validador de Bootstrap — Type-safety para ES6 module orchestration

Valida:
1. Todas as chaves em Object.assign(window, {...}) existem nos módulos fonte
2. init() tem acesso a todas as funções que chama
3. dataDerived retorna todas as chaves esperadas

Roda no build — falha bloqueia deploy.
"""

import re
import sys
from pathlib import Path


def extract_object_assign_keys(bootstrap_path: Path) -> set:
    """Extrai todas as chaves de Object.assign(window, {...})"""
    content = bootstrap_path.read_text(encoding="utf-8")
    
    # Match Object.assign(window, { ... })
    match = re.search(r'Object\.assign\(window,\s*\{(.*?)\n  \}\);', content, re.DOTALL)
    if not match:
        print("❌ Não encontrou Object.assign(window, {...})")
        return set()
    
    assign_block = match.group(1)
    # Extrai keys (antes do ':')
    keys = re.findall(r'^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', assign_block, re.MULTILINE)
    return set(keys)


def extract_module_exports(module_path: Path) -> dict:
    """Extrai todas as funções/valores exportados de um módulo"""
    content = module_path.read_text(encoding="utf-8")
    exports = {}
    
    # export function name()
    funcs = re.findall(r'export\s+function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(', content)
    exports['functions'] = set(funcs)
    
    # export const name =
    consts = re.findall(r'export\s+const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=', content)
    exports['consts'] = set(consts)
    
    return exports


def extract_datawiring_return(datawiring_path: Path) -> set:
    """Extrai todas as chaves retornadas por initDataWiring()"""
    content = datawiring_path.read_text(encoding="utf-8")
    
    # Match return { ... };
    match = re.search(r'return\s*\{(.*?)\n  \};', content, re.DOTALL)
    if not match:
        print("❌ Não encontrou return {...} em initDataWiring")
        return set()
    
    return_block = match.group(1)
    # Extrai keys (identificadores simples)
    keys = re.findall(r'^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*[,:]', return_block, re.MULTILINE)
    return set(keys)


def extract_init_calls(init_tabs_path: Path) -> set:
    """Extrai todas as funções que init() chama"""
    content = init_tabs_path.read_text(encoding="utf-8")
    
    # Match export function init() { ... }
    match = re.search(r'export\s+function\s+init\(\)\s*\{(.*?)\n\}\s*$', content, re.DOTALL | re.MULTILINE)
    if not match:
        print("❌ Não encontrou export function init()")
        return set()
    
    init_body = match.group(1)

    # Remove comments para evitar false positives
    init_body = re.sub(r'//.*?$', '', init_body, flags=re.MULTILINE)  # Remove // comments
    init_body = re.sub(r'/\*.*?\*/', '', init_body, flags=re.DOTALL)  # Remove /* */ comments

    # Remove template literals para evitar false positives em strings
    init_body = re.sub(r'`[^`]*`', '', init_body, flags=re.DOTALL)  # Remove backtick strings
    init_body = re.sub(r'"[^"]*"', '', init_body, flags=re.DOTALL)  # Remove double-quoted strings
    init_body = re.sub(r"'[^']*'", '', init_body, flags=re.DOTALL)  # Remove single-quoted strings

    # Extrai chamadas de função: word() — mas apenas as que NÃO são métodos (não tem ponto antes)
    calls = re.findall(r'(?<![.\w])([a-zA-Z_][a-zA-Z0-9_]*)\s*\(', init_body)

    # Filtra out: if, try, catch, forEach, etc (keywords e builtins)
    keywords = {
        'if', 'try', 'catch', 'throw', 'for', 'while', 'function', 'const', 'let', 'var', 'return', 'new', 'typeof', 'instanceof', 'delete',
        'Object', 'Array', 'Math', 'String', 'Number', 'Boolean', 'Date', 'JSON', 'console', 'document', 'window', 'localStorage',
        'requestAnimationFrame', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'parseInt', 'parseFloat',
        'isNaN', 'isFinite', 'Promise', 'async', 'await', 'yield', 'super',
        # single letter vars (loop counters)
        'e', 'el', 'p', 'c', '_', 'x', 'y', 'i', 'j', 'k', 'v', 't', 's', 'n', 'b', 'a', 'f', 'm', 'r', 'd', 'u', 'o',
    }
    return set(c for c in calls if c not in keywords and not c[0].isupper())  # Exclude builtins and CamelCase


def validate_bootstrap(js_dir: Path) -> bool:
    """Valida integridade do bootstrap"""
    
    print("\n" + "="*60)
    print("🔍 VALIDADOR DE BOOTSTRAP")
    print("="*60)
    
    bootstrap_path = js_dir.parent / "bootstrap.mjs"
    datawiring_path = js_dir / "02-data-wiring.mjs"
    init_tabs_path = js_dir / "07-init-tabs.mjs"
    
    errors = []
    
    # 1. Extrai Object.assign keys
    print("\n📋 Extraindo Object.assign(window, {...})...")
    assign_keys = extract_object_assign_keys(bootstrap_path)
    print(f"   {len(assign_keys)} chaves encontradas")
    
    # 2. Valida dataDerived keys
    print("\n📋 Validando initDataWiring return {...}...")
    datawiring_keys = extract_datawiring_return(datawiring_path)
    print(f"   {len(datawiring_keys)} chaves retornadas")
    
    # Chaves críticas que dataDerived DEVE retornar
    critical_datawiring = {'CAMBIO', 'PAT_GATILHO', 'totalEquityUsd', 'totalBrl', 'yrInt', 'moInt', 'today', 'progPct', '_anoFireAlvoGlobal', '_anoFireAspir', '_anoFire', '_ymToDecimal'}
    missing_datawiring = critical_datawiring - datawiring_keys
    if missing_datawiring:
        errors.append(f"❌ initDataWiring NÃO retorna: {', '.join(sorted(missing_datawiring))}")
    else:
        print(f"   ✓ Todas as {len(critical_datawiring)} chaves críticas presentes")
    
    # Valida que todas as chaves do Object.assign estão em dataDerived (exceto funções/utils)
    print("\n📋 Validando Object.assign keys contra dataDerived...")
    datawiring_ref_keys = {k for k in assign_keys if k in datawiring_keys}
    missing_in_datawiring = {k for k in assign_keys if k in datawiring_keys} - datawiring_keys
    
    # Chaves que NÃO precisam estar em dataDerived (são funções/utils)
    non_datawiring_keys = {
        # Utils (03-utils)
        'calcWellness', 'wellnessActions', 'fmtBrl', 'fmtBrl2', 'fmtUsd', 'fmtPct', 'colorPct',
        'filterByPeriod', 'checkMinPoints', 'setActivePeriodBtn', 'fmtMonthLabel', 'fmtMonthTick', 'charts',
        # Charts Portfolio (04-charts-portfolio)
        'buildTimeline', 'buildAttribution', 'buildDonuts', 'buildScenarios', 'buildTornado', 'buildDeltaBar',
        'buildStackedAlloc', 'buildFanChart', 'buildGuardrails', 'buildIncomeChart', 'buildFeeAnalysis',
        'buildPosicoes', 'buildCustoBase', 'buildEventosVida', 'buildPfireFamilia', 'buildMinilog',
        'buildRetornoHeatmap', 'buildRollingSharp', 'buildInformationRatio', 'buildIrDiferido', 'renderHodl11',
        'buildBacktest', 'buildBacktestR7', 'buildShadowChart', 'buildGlidePath', 'buildRollingStats',
        'buildHeatmap', 'buildScatterPlot', 'buildPerformanceTable', 'buildWealthChart', 'buildRollingCorrelation',
        # Fire Projections (05-fire-projections)
        'buildEarliestFire', 'buildNetWorthProjection', 'buildStressTest', 'buildStressFanChart',
        'buildSpendingGuardrails', 'buildScenarioComparison', 'buildSpendingBreakdown', 'buildIncomeProjection',
        'runMC', 'runMCTrajectories',
        # Dashboard Render (06-dashboard-render)
        'renderKPIs', 'renderWellness', 'renderProximasAcoes', 'renderIpcaProgress', 'buildSankey',
        'buildWellnessExtras', 'buildRfCards', 'buildShadowTable', 'buildIncomeTable',
        # Init Tabs (07-init-tabs)
        'renderMacroStatus', 'buildBrasilConcentracao', 'buildMacroCards', 'buildDcaStatus', 'buildSemaforoPanel',
        'buildBondPool', 'buildFireMatrix', 'buildSwrPercentiles', 'buildTrackingFire', 'buildDrawdownHistory',
        'buildEtfComposition', 'buildBondPoolRunway', 'buildLumpyEvents', 'buildTimestamps',
        'buildPremissasVsRealizado', 'buildFactorRolling', 'buildFactorLoadings', 'buildCagrVsTwr', 'calcAporte',
        '_initTabCharts', 'switchTab', '_applyPrivacyCharts', 'init', 'GENERATED_AT', 'VERSION'
    }
    
    datawiring_required = assign_keys - non_datawiring_keys
    missing_in_datawiring = datawiring_required - datawiring_keys
    
    if missing_in_datawiring:
        errors.append(f"❌ Object.assign requer keys NÃO retornadas por initDataWiring: {', '.join(sorted(missing_in_datawiring))}")
    else:
        print(f"   ✓ Todas as chaves de dados estão em initDataWiring")
    
    # 3. Valida init() calls
    print("\n📋 Validando funções que init() chama...")
    init_calls = extract_init_calls(init_tabs_path)
    print(f"   {len(init_calls)} chamadas de função encontradas")
    
    # Chaves críticas que init() chama e devem estar em Object.assign
    critical_init_calls = init_calls & assign_keys  # Intersection — funções que init chama
    missing_in_assign = init_calls - assign_keys
    
    if missing_in_assign:
        errors.append(f"❌ init() chama funções NÃO expostas em window: {', '.join(sorted(missing_in_assign))}")
    else:
        print(f"   ✓ Todas as funções que init() chama estão expostas")
    
    # 4. Valida que switchTab é export (não window.switchTab)
    print("\n📋 Validando que switchTab é função export...")
    init_tabs_content = init_tabs_path.read_text(encoding="utf-8")
    if re.search(r'export\s+function\s+switchTab\s*\(', init_tabs_content):
        print(f"   ✓ switchTab é export function")
    elif re.search(r'window\.switchTab\s*=\s*function', init_tabs_content):
        errors.append(f"❌ switchTab ainda é window.switchTab (não é export)")
    
    # Summary
    print("\n" + "="*60)
    if errors:
        print("❌ VALIDAÇÃO FALHOU\n")
        for err in errors:
            print(err)
        print("\n" + "="*60)
        return False
    else:
        print("✅ BOOTSTRAP VALIDADO COM SUCESSO")
        print(f"   • {len(assign_keys)} chaves em Object.assign")
        print(f"   • {len(datawiring_keys)} chaves retornadas por initDataWiring")
        print(f"   • {len(init_calls)} chamadas de função em init()")
        print("="*60)
        return True


if __name__ == '__main__':
    js_dir = Path(__file__).parent.parent / "dashboard" / "js"
    success = validate_bootstrap(js_dir)
    sys.exit(0 if success else 1)
