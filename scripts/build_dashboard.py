#!/usr/bin/env python3
"""
build_dashboard.py — Injeta dashboard/data.json no template e gera dashboard/index.html

Uso:
    python3 scripts/build_dashboard.py
    python3 scripts/build_dashboard.py --data dashboard/data.json
    python3 scripts/build_dashboard.py --template dashboard/template.html
    python3 scripts/build_dashboard.py --out dashboard/index.html
    python3 scripts/build_dashboard.py --major "Descrição do milestone"
"""

import argparse
import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).parent.parent
TEMPLATE     = ROOT / "dashboard" / "template.html"
DATA_FILE    = ROOT / "dashboard" / "data.json"
SCHEMA_FILE  = ROOT / "dashboard" / "data.schema.json"
OUTPUT       = ROOT / "dashboard" / "index.html"
VERSION_FILE = ROOT / "dashboard" / "version.json"
PLACEHOLDER  = "__DATA_PLACEHOLDER__"


def _validate_data(data: dict) -> None:
    """Valida data.json contra data.schema.json.

    Usa jsonschema se disponível; caso contrário faz check manual dos campos
    obrigatórios de primeiro nível. Nunca bloqueia o build — apenas imprime
    warnings para não interromper o pipeline caso campos novos sejam adicionados
    antes do schema ser atualizado.
    """
    if not SCHEMA_FILE.exists():
        print(f"⚠️  Schema não encontrado em {SCHEMA_FILE} — validação ignorada")
        return

    schema = json.loads(SCHEMA_FILE.read_text(encoding="utf-8"))
    required_fields = schema.get("required", [])

    try:
        import jsonschema  # type: ignore
        errors = list(jsonschema.Draft7Validator(schema).iter_errors(data))
        if errors:
            print(f"⚠️  data.json tem {len(errors)} problema(s) de schema (build não bloqueado):")
            for err in errors[:10]:  # máx 10 erros para não poluir o log
                path = " → ".join(str(p) for p in err.absolute_path) or "(raiz)"
                print(f"   • [{path}] {err.message}")
            if len(errors) > 10:
                print(f"   … e mais {len(errors) - 10} erro(s) omitidos")
        else:
            print("✅ data.json validado contra data.schema.json — OK")
    except ImportError:
        # Fallback manual: verifica apenas campos obrigatórios de primeiro nível
        missing = [f for f in required_fields if f not in data]
        if missing:
            print(f"⚠️  data.json — campos obrigatórios ausentes: {missing}")
            print("   (instale jsonschema para validação completa: pip install jsonschema)")
        else:
            print(f"✅ data.json — {len(required_fields)} campos obrigatórios presentes "
                  f"(jsonschema não instalado — validação de tipos ignorada)")


def bump_version(major_label: str | None = None) -> dict:
    """Lê version.json, incrementa minor (ou major se --major), salva e retorna."""
    if VERSION_FILE.exists():
        v = json.loads(VERSION_FILE.read_text())
    else:
        v = {"major": 1, "minor": 0, "label": "", "date": "", "history": []}

    if major_label:
        # Major bump — requer confirmação prévia do Diego
        v["major"] += 1
        v["minor"] = 0
        v["label"] = major_label
    else:
        v["minor"] += 1

    from datetime import date
    v["date"] = str(date.today())

    version_str = f"{v['major']}.{v['minor']}"
    entry = {"version": version_str, "date": v["date"], "label": v.get("label", "")}
    v.setdefault("history", []).append(entry)

    VERSION_FILE.write_text(json.dumps(v, indent=2, ensure_ascii=False))
    return v


def build(data_path: Path, template_path: Path, out_path: Path,
          major_label: str | None = None) -> None:
    # 1. Ler dados
    if not data_path.exists():
        print(f"❌ Arquivo de dados não encontrado: {data_path}", file=sys.stderr)
        print("   Execute primeiro: python3 scripts/generate_data.py", file=sys.stderr)
        sys.exit(1)

    with open(data_path) as f:
        data = json.load(f)

    # 1b. Validar schema
    _validate_data(data)

    # 2. Ler template
    if not template_path.exists():
        print(f"❌ Template não encontrado: {template_path}", file=sys.stderr)
        sys.exit(1)

    template = template_path.read_text(encoding="utf-8")

    if PLACEHOLDER not in template:
        print(f"❌ Placeholder '{PLACEHOLDER}' não encontrado no template", file=sys.stderr)
        sys.exit(1)

    # 3. Versão (auto-incrementa minor)
    ver = bump_version(major_label)
    version_str = f"{ver['major']}.{ver['minor']}"

    # 4. Gerar timestamp BRT (UTC-3)
    brt = timezone(timedelta(hours=-3))
    now_brt = datetime.now(brt)
    generated_at = now_brt.strftime("%Y-%m-%dT%H:%M:%S-03:00")

    # 5. Montar bloco JavaScript DATA
    data["version"] = version_str
    data_js = _build_data_js(data, generated_at, version_str)

    # 6. Substituir placeholder
    html = template.replace(PLACEHOLDER, data_js, 1)

    # 7. Escrever output
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html, encoding="utf-8")
    print(f"✅ Dashboard gerado: {out_path}")
    print(f"   Versão: v{version_str} | Data/hora: {generated_at}")
    print(f"   Tamanho: {len(html):,} chars ({len(html.splitlines()):,} linhas)")


def _build_data_js(data: dict, generated_at: str, version: str) -> str:
    """Converte dashboard/data.json para o bloco JS const DATA = {...}"""
    data_json = json.dumps(data, ensure_ascii=False, indent=2)
    lines = [
        f"const GENERATED_AT = new Date('{generated_at}'); // BRT (UTC-3)",
        f"const VERSION = '{version}';",
        "",
        f"const DATA = {data_json};",
    ]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Build dashboard/index.html from template + data")
    parser.add_argument("--data",     type=Path, default=DATA_FILE)
    parser.add_argument("--template", type=Path, default=TEMPLATE)
    parser.add_argument("--out",      type=Path, default=OUTPUT)
    parser.add_argument("--major",    type=str,  default=None,
                        help="Bump major version com esta descrição de milestone")
    args = parser.parse_args()

    build(args.data, args.template, args.out, args.major)


if __name__ == "__main__":
    main()
