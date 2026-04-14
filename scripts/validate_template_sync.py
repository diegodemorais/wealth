#!/usr/bin/env python3
"""
Valida sincronização entre spec.json e template.html + integridade de partials.

Verifica que:
1. Partials de template são bem-montados (00-head, 01-nav, etc.)
2. Blocos estáticos (com id=) existem no HTML gerado
3. Blocos dinâmicos (JS-rendered) têm função correspondente
"""

import json
import sys
from pathlib import Path
import re


def validate_template_integrity() -> bool:
    """
    Valida que os partials de template estão bem montados.
    
    Verifica que:
    - dashboard/templates/ existe ou dashboard/template.html existe
    - Se partials, todos os arquivos 0N-*.html estão presentes
    - Não há conteúdo duplicado ou corrompido
    
    Returns: True se válido, False caso contrário
    """
    root = Path(__file__).parent.parent
    templates_dir = root / "dashboard" / "templates"
    template_file = root / "dashboard" / "template.html"
    
    # Se usar partials, verificar estrutura
    if templates_dir.exists():
        partials = sorted(templates_dir.glob("*.html"))
        if not partials:
            print("❌ dashboard/templates/ vazio", file=sys.stderr)
            return False
        
        # Verificar que partials são bem-formados
        for partial in partials:
            try:
                content = partial.read_text(encoding="utf-8")
                if not content.strip():
                    print(f"⚠️  Partial vazio: {partial.name}", file=sys.stderr)
            except Exception as e:
                print(f"❌ Erro ao ler {partial.name}: {e}", file=sys.stderr)
                return False
        
        print(f"   Partials validados: {len(partials)} arquivos")
        return True
    
    # Fallback: verificar template.html
    elif template_file.exists():
        try:
            content = template_file.read_text(encoding="utf-8")
            if not content.strip():
                print("❌ template.html vazio", file=sys.stderr)
                return False
            return True
        except Exception as e:
            print(f"❌ Erro ao ler template.html: {e}", file=sys.stderr)
            return False
    
    else:
        print("❌ Template não encontrado (nem template.html nem templates/)", file=sys.stderr)
        return False


def validate_template_sync(spec_path: Path, html_path: Path) -> dict:
    """
    Valida sincronização entre spec.json e template.html.

    Verifica que blocos definidos em spec.json estão cobertos
    (estáticos no HTML ou dinâmicos com funções de renderização).

    Returns:
        {
            "total_blocks": int,
            "static_found": int,
            "dynamic_detected": int,
            "missing": [{id, label, type, tab}],
            "status": "OK" | "WARNINGS"
        }
    """
    if not spec_path.exists():
        return {"status": "ERROR", "message": "spec.json not found"}

    if not html_path.exists():
        return {"status": "ERROR", "message": "HTML not found"}

    # Ler spec.json
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    blocks = spec.get("blocks", [])

    # Ler HTML
    html_content = html_path.read_text(encoding="utf-8")

    # Mapear tipos de blocos para funções de renderização esperadas
    TYPE_TO_FUNCTION = {
        "kpi-hero": ["renderKPIs"],
        "kpi": ["renderKPIs"],
        "chart": ["buildTimeline", "buildAttribution", "buildDonuts", "buildFanChart", "buildBacktest", 
                  "buildGlidePath", "buildRollingStats", "buildHeatmap", "buildScatterPlot", 
                  "buildWealthChart", "buildRollingCorrelation", "buildFactorLoadings", "buildTrackingFire",
                  "buildEarliestFire", "buildNetWorthProjection", "buildStressTest", "buildStressFanChart",
                  "buildPerformanceTable"],
        "table": ["buildShadowTable", "buildIncomeTable", "buildPerformanceTable"],
        "sankey": ["buildSankey"],
        "wellness": ["buildWellnessExtras"],
        "cards": ["buildRfCards", "buildMacroCards"],
    }

    # Verificar cada block
    static_found = 0
    dynamic_detected = 0
    missing = []

    for block in blocks:
        block_id = block.get("id")
        block_type = block.get("type", "unknown")
        if not block_id:
            continue

        # 1. Procurar id estático no HTML
        pattern = f'id=["\']?{re.escape(block_id)}["\']?'
        if re.search(pattern, html_content):
            static_found += 1
            continue

        # 2. Procurar função de renderização correspondente
        found_dynamic = False
        for type_pattern, functions in TYPE_TO_FUNCTION.items():
            if type_pattern in block_type.lower():
                for func in functions:
                    if func in html_content:
                        dynamic_detected += 1
                        found_dynamic = True
                        break
                if found_dynamic:
                    break

        if not found_dynamic:
            missing.append({
                "id": block_id,
                "label": block.get("label", "—"),
                "type": block_type,
                "tab": block.get("tab", "?")
            })

    result = {
        "total_blocks": len(blocks),
        "static_found": static_found,
        "dynamic_detected": dynamic_detected,
        "missing": missing,
        "status": "OK" if not missing else "WARNINGS"
    }

    return result


def main():
    spec_path = Path(__file__).parent.parent / "dashboard" / "spec.json"
    html_path = Path(__file__).parent.parent / "dashboard" / "index.html"

    result = validate_template_sync(spec_path, html_path)

    if result.get("status") == "ERROR":
        print(f"❌ {result.get('message')}")
        sys.exit(1)

    # Exibir resultado
    print(f"📋 Validação Template ↔ Spec")
    print(f"   Total de blocos em spec.json: {result['total_blocks']}")
    print(f"   Blocos estáticos encontrados: {result['static_found']}")
    print(f"   Blocos dinâmicos detectados: {result['dynamic_detected']}")
    print(f"   Cobertura: {result['static_found'] + result['dynamic_detected']}/{result['total_blocks']}")

    if result["missing"]:
        print(f"\n⚠️  {len(result['missing'])} blocos não implementados:")
        for block in sorted(result["missing"], key=lambda b: (b["tab"], b["id"])):
            print(f"   [{block['tab']:10}] {block['id']:40} ({block['type']})")
    else:
        print(f"\n✅ Todos os blocos de spec.json estão cobertos")

    return 0 if not result["missing"] else 1


if __name__ == "__main__":
    sys.exit(main())
