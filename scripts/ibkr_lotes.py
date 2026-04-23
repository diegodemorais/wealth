#!/usr/bin/env python3
"""
ibkr_lotes.py — Constrói lotes individuais FIFO a partir do extrato IBKR

Uso:
    python3 scripts/ibkr_lotes.py                           # CSV default
    python3 scripts/ibkr_lotes.py analysis/raw/extrato.csv  # CSV específico

Output:
    dados/tlh_lotes.json — lotes abertos com P&L individual em BRL

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import csv
import json
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

# ── Configuração ──────────────────────────────────────────────────────────────

DEFAULT_CSV = Path(__file__).parent.parent / "analysis" / "raw" / "U5947683.TRANSACTIONS.20210408.20260331.csv"
OUTPUT_DIR = Path(__file__).parent.parent / "dados"
OUTPUT_FILE = OUTPUT_DIR / "tlh_lotes.json"

sys.path.insert(0, str(Path(__file__).parent))
from config import BUCKET_MAP

# Classificação de ETFs
ALVO = {"SWRD", "AVGS", "AVEM"}
TRANSITORIO = {"EIMI", "AVES", "AVUV", "AVDV", "DGS", "USSC"}
LEGADO = {"IWVL", "JPGL"}
UCITS = {"SWRD", "AVGS", "AVEM", "EIMI", "AVDV", "IWVL"}
US_LISTED = {"AVUV", "AVES", "DGS", "USSC"}


def parse_ibkr_csv(csv_path: Path) -> list[dict]:
    """Parse IBKR transaction history CSV into trade records."""
    trades = []
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        header = None
        for row in reader:
            if len(row) < 3:
                continue
            if row[0] == "Transaction History" and row[1] == "Header":
                header = row[2:]
                continue
            if row[0] == "Transaction History" and row[1] == "Data" and header:
                rec = dict(zip(header, row[2:]))
                trades.append(rec)
    return trades


def build_lots_fifo(trades: list[dict]) -> list[dict]:
    """Build FIFO lots from trade records. Returns open lots."""
    # Filter to Buy/Sell only, with valid symbol and quantity
    equity_trades = []
    for t in trades:
        tx_type = t.get("Transaction Type", "").strip()
        if tx_type not in ("Buy", "Sell"):
            continue
        symbol = t.get("Symbol", "").strip()
        if not symbol or symbol == "-":
            continue
        try:
            qty = float(t.get("Quantity", "0"))
            price = float(t.get("Price", "0"))
        except (ValueError, TypeError):
            continue
        if qty == 0 or price == 0:
            continue

        date_str = t.get("Date", "").strip()
        try:
            commission = abs(float(t.get("Commission", "0") or "0"))
        except (ValueError, TypeError):
            commission = 0.0

        equity_trades.append({
            "date": date_str,
            "symbol": symbol,
            "type": tx_type,
            "qty": qty,  # positive for Buy, negative for Sell
            "price": price,
            "commission": commission,
        })

    # Sort by date ascending
    equity_trades.sort(key=lambda x: x["date"])

    # FIFO lot tracking per symbol
    lots_by_symbol: dict[str, list[dict]] = defaultdict(list)

    for trade in equity_trades:
        sym = trade["symbol"]
        qty = trade["qty"]
        price = trade["price"]
        date = trade["date"]
        commission = trade["commission"]

        if qty > 0:
            # Buy — add new lot
            lots_by_symbol[sym].append({
                "symbol": sym,
                "date": date,
                "qty": qty,
                "price_usd": price,
                "commission_usd": commission,
                "cost_usd": qty * price + commission,
            })
        else:
            # Sell — consume FIFO
            remaining = abs(qty)
            while remaining > 1e-6 and lots_by_symbol[sym]:
                lot = lots_by_symbol[sym][0]
                if lot["qty"] <= remaining:
                    remaining -= lot["qty"]
                    lots_by_symbol[sym].pop(0)
                else:
                    lot["qty"] -= remaining
                    lot["cost_usd"] = lot["qty"] * lot["price_usd"]
                    remaining = 0

    # Flatten to list
    open_lots = []
    for sym, lots in lots_by_symbol.items():
        for lot in lots:
            if lot["qty"] > 1e-6:
                open_lots.append(lot)

    return open_lots


def enrich_lots(lots: list[dict], ptax_cache: dict | None = None) -> list[dict]:
    """Enrich lots with classification, bucket, and current status."""
    for lot in lots:
        sym = lot["symbol"]
        lot["bucket"] = BUCKET_MAP.get(sym, "Outro")
        lot["status"] = (
            "alvo" if sym in ALVO else
            "transitorio" if sym in TRANSITORIO else
            "legado" if sym in LEGADO else
            "outro"
        )
        lot["domicilio"] = "UCITS" if sym in UCITS else "US-listed" if sym in US_LISTED else "outro"
    return lots


def summary(lots: list[dict]) -> dict:
    """Generate summary stats from lots."""
    by_symbol: dict[str, dict] = {}
    for lot in lots:
        sym = lot["symbol"]
        if sym not in by_symbol:
            by_symbol[sym] = {
                "symbol": sym,
                "n_lotes": 0,
                "qty_total": 0.0,
                "cost_usd_total": 0.0,
                "pm_usd": 0.0,
                "status": lot["status"],
                "domicilio": lot["domicilio"],
                "bucket": lot["bucket"],
                "oldest_lot": lot["date"],
                "newest_lot": lot["date"],
            }
        entry = by_symbol[sym]
        entry["n_lotes"] += 1
        entry["qty_total"] += lot["qty"]
        entry["cost_usd_total"] += lot["cost_usd"]
        if lot["date"] < entry["oldest_lot"]:
            entry["oldest_lot"] = lot["date"]
        if lot["date"] > entry["newest_lot"]:
            entry["newest_lot"] = lot["date"]

    for entry in by_symbol.values():
        entry["pm_usd"] = entry["cost_usd_total"] / entry["qty_total"] if entry["qty_total"] > 0 else 0
        entry["qty_total"] = round(entry["qty_total"], 4)
        entry["cost_usd_total"] = round(entry["cost_usd_total"], 2)
        entry["pm_usd"] = round(entry["pm_usd"], 4)

    return {
        "total_lotes": len(lots),
        "total_symbols": len(by_symbol),
        "by_symbol": dict(sorted(by_symbol.items())),
    }


def main():
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_CSV
    if not csv_path.exists():
        print(f"❌ CSV não encontrado: {csv_path}")
        sys.exit(1)

    print(f"📄 Parsing: {csv_path.name}")
    trades = parse_ibkr_csv(csv_path)
    print(f"   {len(trades)} linhas de transação")

    buy_sell = [t for t in trades if t.get("Transaction Type", "").strip() in ("Buy", "Sell")]
    print(f"   {len(buy_sell)} trades (Buy/Sell)")

    lots = build_lots_fifo(trades)
    lots = enrich_lots(lots)
    print(f"   {len(lots)} lotes abertos (FIFO)")

    summ = summary(lots)
    print(f"\n{'─'*60}")
    print(f"{'Símbolo':<8} {'Lotes':>5} {'Qty':>10} {'Custo USD':>12} {'PM USD':>10} {'Status':<12} {'Domicílio'}")
    print(f"{'─'*60}")
    for sym, s in summ["by_symbol"].items():
        print(f"{sym:<8} {s['n_lotes']:>5} {s['qty_total']:>10.2f} ${s['cost_usd_total']:>10,.0f} ${s['pm_usd']:>8.2f} {s['status']:<12} {s['domicilio']}")

    # Round lot quantities for output
    for lot in lots:
        lot["qty"] = round(lot["qty"], 4)
        lot["cost_usd"] = round(lot["cost_usd"], 2)
        lot["price_usd"] = round(lot["price_usd"], 4)
        lot["commission_usd"] = round(lot["commission_usd"], 4)

    output = {
        "_generated": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "_source": csv_path.name,
        "_period": f"{lots[0]['date']} → {lots[-1]['date']}" if lots else "",
        "summary": summ,
        "lots": lots,
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\n✅ {OUTPUT_FILE} ({len(lots)} lotes)")


if __name__ == "__main__":
    main()
