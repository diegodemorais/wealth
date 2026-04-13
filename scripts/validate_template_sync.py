#!/usr/bin/env python3
"""
validate_template_sync.py — Valida que template está bem-formado e sincronizado

Objetivo: garantir que templates/ está bem montado (todos os partials presentes)
e que template contém o placeholder para data injection.

Uso:
    python3 scripts/validate_template_sync.py
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
PLACEHOLDER = "__DATA_PLACEHOLDER__"


def assemble_template(templates_dir: Path) -> str:
    """Monta template a partir de partials ou usa fallback template.html."""
    if templates_dir.exists():
        partials = sorted(templates_dir.glob("*.html"))
        if partials:
            return "".join(p.read_text(encoding="utf-8") for p in partials)

    # Fallback
    template_path = ROOT / "dashboard" / "template.html"
    return template_path.read_text(encoding="utf-8")


def validate_template_integrity() -> bool:
    """Valida integridade do template (presença de placeholder, básica bem-formação).

    Retorna True se válido, False caso contrário.
    """
    templates_dir = ROOT / "dashboard" / "templates"
    template_path = ROOT / "dashboard" / "template.html"

    # 1. Verificar que ou templates/ existe com 4+ partials, ou template.html existe
    if templates_dir.exists():
        partials = list(templates_dir.glob("*.html"))
        if not partials:
            print(f"❌ templates/ vazio — nenhum partial encontrado", file=sys.stderr)
            return False

        # Verificar que arquivo.html exis
        if len(partials) < 3:
            print(f"⚠️  templates/ tem apenas {len(partials)} partials (esperado 4+)", file=sys.stderr)

        # Montar e validar
        template_html = assemble_template(templates_dir)
        print(f"✅ Template montado de {len(partials)} partials ({len(template_html):,} chars)")
    else:
        if not template_path.exists():
            print(f"❌ Nem templates/ nem template.html encontrados", file=sys.stderr)
            return False

        template_html = template_path.read_text(encoding="utf-8")
        print(f"✅ Usando template.html ({len(template_html):,} chars)")

    # 2. Verificar placeholder
    if PLACEHOLDER not in template_html:
        print(f"❌ Placeholder '{PLACEHOLDER}' não encontrado no template", file=sys.stderr)
        return False

    print(f"✅ Placeholder '{PLACEHOLDER}' presente")

    # 3. Básicas verificações HTML
    errors = []
    if template_html.count("<head>") != 1:
        errors.append("<head> count != 1")
    if template_html.count("</head>") != 1:
        errors.append("</head> count != 1")
    if template_html.count("<body>") != 1:
        errors.append("<body> count != 1")
    if template_html.count("</body>") != 1:
        errors.append("</body> count != 1")
    if template_html.count("<script>") < 1:
        errors.append("<script> não encontrado")

    if errors:
        print(f"❌ Erros de estrutura HTML:")
        for err in errors:
            print(f"   - {err}", file=sys.stderr)
        return False

    print(f"✅ Estrutura HTML válida")
    return True


def main():
    print(f"Template Integrity Validation")
    print()

    success = validate_template_integrity()

    if success:
        print()
        print(f"✅ Template está pronto para build")
        return True
    else:
        print()
        print(f"❌ Validação falhou", file=sys.stderr)
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
