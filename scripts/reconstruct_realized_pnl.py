#!/usr/bin/env python3
"""
reconstruct_realized_pnl.py — Gera realized_pnl.json a partir do extrato IBKR

Usa FIFO para capturar ganhos/perdas realizados de todas as vendas.
Output: react-app/public/data/realized_pnl.json

Uso:
    python3 scripts/reconstruct_realized_pnl.py          # CSV + Flex Query
    python3 scripts/reconstruct_realized_pnl.py --no-flex  # somente CSV

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from ibkr_lotes import (
    DEFAULT_CSV,
    parse_ibkr_csv,
    fetch_flex_trades,
    merge_trades,
    build_realized_pnl,
)

OUTPUT_PATH = Path(__file__).parent.parent / "react-app" / "public" / "data" / "realized_pnl.json"


def main() -> None:
    parser = argparse.ArgumentParser(description="Reconstrói realized_pnl.json via FIFO IBKR")
    parser.add_argument("--no-flex", action="store_true", help="Usar somente CSV, sem Flex Query")
    parser.add_argument("csv", nargs="?", default=str(DEFAULT_CSV), help="Caminho do CSV IBKR")
    args = parser.parse_args()

    csv_path = Path(args.csv)
    if not csv_path.exists():
        print(f"❌ CSV não encontrado: {csv_path}")
        sys.exit(1)

    print(f"📂 CSV: {csv_path.name}")
    csv_trades = parse_ibkr_csv(csv_path)
    print(f"   {len(csv_trades)} registros no CSV")

    if not args.no_flex:
        print("🔗 Buscando Flex Query...")
        flex_trades = fetch_flex_trades()
        trades = merge_trades(csv_trades, flex_trades) if flex_trades else csv_trades
    else:
        trades = csv_trades

    print("⚙️  Reconstruindo FIFO (ganhos realizados)...")
    realized = build_realized_pnl(trades)
    print(f"   {len(realized)} registros de vendas realizadas")

    # Sumarizar por símbolo
    por_simbolo: dict[str, float] = {}
    for rec in realized:
        sym = rec["symbol"]
        por_simbolo[sym] = round(por_simbolo.get(sym, 0.0) + rec["gain_usd"], 2)

    total_usd = round(sum(por_simbolo.values()), 2)

    output = {
        "total_usd": total_usd,
        "por_simbolo": dict(sorted(por_simbolo.items())),
        "detalhado": sorted(realized, key=lambda r: r["date"]),
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Escrito: {OUTPUT_PATH}")
    print(f"   Total ganho/perda realizado: USD {total_usd:,.2f}")
    print(f"   Símbolos com vendas: {', '.join(sorted(por_simbolo))}")


if __name__ == "__main__":
    main()
