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
OUTPUT       = ROOT / "dashboard" / "index.html"
VERSION_FILE = ROOT / "dashboard" / "version.json"
PLACEHOLDER  = "__DATA_PLACEHOLDER__"


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
