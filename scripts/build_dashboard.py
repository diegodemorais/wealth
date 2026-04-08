#!/usr/bin/env python3
"""
build_dashboard.py — Injeta dashboard_data.json no template HTML e gera dashboard.html

Uso:
    python3 scripts/build_dashboard.py
    python3 scripts/build_dashboard.py --data analysis/dashboard_data.json
    python3 scripts/build_dashboard.py --template analysis/dashboard_template.html
    python3 scripts/build_dashboard.py --out analysis/dashboard.html
"""

import argparse
import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).parent.parent
TEMPLATE = ROOT / "analysis" / "dashboard_template.html"
DATA_FILE = ROOT / "analysis" / "dashboard_data.json"
OUTPUT = ROOT / "analysis" / "dashboard.html"
PLACEHOLDER = "__DATA_PLACEHOLDER__"


def build(data_path: Path, template_path: Path, out_path: Path) -> None:
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

    # 3. Gerar timestamp BRT (UTC-3)
    brt = timezone(timedelta(hours=-3))
    now_brt = datetime.now(brt)
    generated_at = now_brt.strftime("%Y-%m-%dT%H:%M:%S-03:00")

    # 4. Montar bloco JavaScript DATA
    data_js = _build_data_js(data, generated_at)

    # 5. Substituir placeholder
    html = template.replace(PLACEHOLDER, data_js, 1)

    # 6. Escrever output
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html, encoding="utf-8")
    print(f"✅ Dashboard gerado: {out_path}")
    print(f"   Data/hora: {generated_at}")
    print(f"   Tamanho: {len(html):,} chars ({len(html.splitlines()):,} linhas)")


def _build_data_js(data: dict, generated_at: str) -> str:
    """Converte dashboard_data.json para o bloco JS const DATA = {...}"""

    # Serializa JSON com indentação para manter legibilidade no HTML
    data_json = json.dumps(data, ensure_ascii=False, indent=2)

    lines = [
        f"const GENERATED_AT = new Date('{generated_at}'); // BRT (UTC-3)",
        "",
        f"const DATA = {data_json};",
    ]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Build dashboard.html from template + data")
    parser.add_argument("--data", type=Path, default=DATA_FILE)
    parser.add_argument("--template", type=Path, default=TEMPLATE)
    parser.add_argument("--out", type=Path, default=OUTPUT)
    args = parser.parse_args()

    build(args.data, args.template, args.out)


if __name__ == "__main__":
    main()
