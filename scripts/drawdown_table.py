#!/usr/bin/env python3
"""
drawdown_table.py — Top N drawdown events do portfólio real (2021+)
Fonte: dados/historico_carteira.csv (TWR mensal)

Uso:
    python3 scripts/drawdown_table.py            # tabela no terminal
    python3 scripts/drawdown_table.py --json     # salva dados/drawdown_events.json
    python3 scripts/drawdown_table.py --top 10   # top 10 eventos (default: 5)

Colunas:
    Rank | Início | Fundo | Recuperação | Profundidade | Duração | Recuperação
"""
import argparse
import json
from pathlib import Path
from datetime import datetime

import pandas as pd
import numpy as np

ROOT = Path(__file__).parent.parent
CSV_PATH  = ROOT / "dados" / "historico_carteira.csv"
JSON_PATH = ROOT / "dados" / "drawdown_events.json"

DD_THRESHOLD = -0.01   # evento começa abaixo de -1%
RECOVERED    =  0.005  # considerado recuperado acima de -0.5%


def load_returns() -> pd.Series:
    df = pd.read_csv(CSV_PATH)
    df["data"] = pd.to_datetime(df["data"])
    df = df.sort_values("data").reset_index(drop=True)
    rets = df["patrimonio_var"].fillna(0) / 100
    prices = (1 + rets).cumprod()
    prices.index = df["data"]
    return prices


def compute_events(prices: pd.Series, top_n: int) -> list[dict]:
    roll_max = prices.cummax()
    dd = (prices - roll_max) / roll_max

    events = []
    in_dd = False
    start = trough_date = None
    trough_val = 0.0

    for date, val in dd.items():
        if not in_dd and val < DD_THRESHOLD:
            in_dd = True
            start = date
            trough_val = val
            trough_date = date
        elif in_dd:
            if val < trough_val:
                trough_val = val
                trough_date = date
            if val >= -RECOVERED:
                in_dd = False
                events.append({
                    "start":     start.strftime("%Y-%m"),
                    "trough":    trough_date.strftime("%Y-%m"),
                    "end":       date.strftime("%Y-%m"),
                    "depth_pct": round(trough_val * 100, 2),
                    "duration_months":  round((trough_date - start).days / 30),
                    "recovery_months":  round((date - trough_date).days / 30),
                    "total_months":     round((date - start).days / 30),
                    "recovered":        True,
                })

    # Evento ainda em aberto
    if in_dd:
        events.append({
            "start":     start.strftime("%Y-%m"),
            "trough":    trough_date.strftime("%Y-%m"),
            "end":       None,
            "depth_pct": round(trough_val * 100, 2),
            "duration_months":  round((trough_date - start).days / 30),
            "recovery_months":  None,
            "total_months":     None,
            "recovered":        False,
        })

    events.sort(key=lambda x: x["depth_pct"])
    return events[:top_n]


def print_table(events: list[dict]) -> None:
    header = f"{'#':<4} {'Início':<9} {'Fundo':<9} {'Recuperação':<13} {'Profund.':<10} {'Dur.':<6} {'Recup.':<8} {'Total':<7}"
    print("\n" + "─" * len(header))
    print(header)
    print("─" * len(header))
    for i, e in enumerate(events, 1):
        end   = e["end"] or "em aberto"
        recup = f"{e['recovery_months']}m" if e["recovery_months"] is not None else "—"
        total = f"{e['total_months']}m"    if e["total_months"]    is not None else "—"
        dur   = f"{e['duration_months']}m" if e["duration_months"] else "<1m"
        print(
            f"{i:<4} {e['start']:<9} {e['trough']:<9} {end:<13} "
            f"{e['depth_pct']:>7.1f}%  {dur:<6} {recup:<8} {total:<7}"
        )
    print("─" * len(header))
    print(f"\nFonte: dados/historico_carteira.csv · {len(events)} maiores eventos · threshold -1%")
    print("Dur. = meses do início ao fundo. Recup. = meses do fundo à recuperação.\n")


def save_json(events: list[dict]) -> None:
    payload = {
        "_generated": datetime.now().isoformat(timespec="seconds"),
        "_source":    "scripts/drawdown_table.py → dados/historico_carteira.csv",
        "_note":      "Top N drawdown events. 61 meses de histórico real (2021-2026). Não usar para inferência estatística de longo prazo.",
        "events":     events,
    }
    JSON_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    print(f"✓ {JSON_PATH}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Drawdown table do portfólio real")
    parser.add_argument("--top",  type=int, default=5, help="Top N eventos (default: 5)")
    parser.add_argument("--json", action="store_true",  help="Salvar dados/drawdown_events.json")
    args = parser.parse_args()

    prices = load_returns()
    events = compute_events(prices, args.top)
    print_table(events)

    if args.json:
        save_json(events)


if __name__ == "__main__":
    main()
