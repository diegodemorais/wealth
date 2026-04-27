#!/usr/bin/env python3
"""
ibkr_lotes.py — Constrói lotes individuais FIFO a partir do extrato IBKR

Uso:
    python3 scripts/ibkr_lotes.py                           # CSV only
    python3 scripts/ibkr_lotes.py --flex                    # CSV + Flex Query API (merge)
    python3 scripts/ibkr_lotes.py analysis/raw/extrato.csv  # CSV específico

Output:
    dados/tlh_lotes.json — lotes abertos com P&L individual em BRL

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import argparse
import csv
import json
import os
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from datetime import datetime
from pathlib import Path

# ── Configuração ──────────────────────────────────────────────────────────────

DEFAULT_CSV = Path(__file__).parent.parent / "analysis" / "raw" / "U5947683.TRANSACTIONS.20210408.20260331.csv"
OUTPUT_DIR = Path(__file__).parent.parent / "dados"
OUTPUT_FILE = OUTPUT_DIR / "tlh_lotes.json"

sys.path.insert(0, str(Path(__file__).parent))
from config import BUCKET_MAP, IR_ALIQUOTA

# Classificação de ETFs
ALVO = {"SWRD", "AVGS", "AVEM"}
TRANSITORIO = {"EIMI", "AVES", "AVUV", "AVDV", "DGS", "USSC"}
LEGADO = {"IWVL", "JPGL"}
UCITS = {"SWRD", "AVGS", "AVEM", "EIMI", "AVDV", "IWVL"}
US_LISTED = {"AVUV", "AVES", "DGS", "USSC"}


SYMBOL_MAP = {
    "WRDUSWUSD": "SWRD",  # IBKR sometimes uses alternate ticker
}


def fetch_flex_trades() -> list[dict]:
    """Fetch trades from IBKR Flex Query API. Returns trade records in same format as CSV parser."""
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / ".env")

    token = os.getenv("IBKR_TOKEN")
    query_id = os.getenv("IBKR_QUERY_POSITIONS")
    if not token or not query_id:
        print("  ⚠️  IBKR_TOKEN ou IBKR_QUERY_POSITIONS não configurado — skip Flex Query")
        return []

    try:
        from ibflex import client
        print("  Conectando ao IBKR Flex Web Service...")
        client.REQUEST_URL = "https://ndcdyn.interactivebrokers.com/Universal/servlet/FlexStatementService.SendRequest"
        client.STMT_URL = "https://ndcdyn.interactivebrokers.com/Universal/servlet/FlexStatementService.GetStatement"
        raw = client.download(token=token, query_id=query_id)
    except Exception as e:
        print(f"  ⚠️  Flex Query falhou: {e}")
        return []

    root = ET.fromstring(raw)
    trades = []
    for t in root.iter("Trade"):
        if t.get("levelOfDetail") != "EXECUTION":
            continue
        sym = t.get("symbol", "")
        sym = SYMBOL_MAP.get(sym, sym)
        buy_sell = t.get("buySell", "")
        qty_raw = float(t.get("quantity", "0") or "0")
        # Flex uses positive for buy, negative for sell — normalize to match CSV convention
        qty = qty_raw if buy_sell == "BUY" else -abs(qty_raw)
        date_raw = t.get("tradeDate", "")
        # Convert YYYYMMDD → YYYY-MM-DD
        date_str = f"{date_raw[:4]}-{date_raw[4:6]}-{date_raw[6:8]}" if len(date_raw) == 8 else date_raw

        trades.append({
            "Date": date_str,
            "Symbol": sym,
            "Transaction Type": "Buy" if buy_sell == "BUY" else "Sell",
            "Quantity": str(qty),
            "Price": t.get("tradePrice", "0"),
            "Commission": t.get("ibCommission", "0"),
            "_source": "flex",
        })

    period = ""
    for stmt in root.iter("FlexStatement"):
        period = f'{stmt.get("fromDate", "")} → {stmt.get("toDate", "")}'

    print(f"  Flex Query: {len(trades)} trades ({period})")
    return trades


def merge_trades(csv_trades: list[dict], flex_trades: list[dict]) -> list[dict]:
    """Merge CSV + Flex trades, deduplicating by (date, symbol, qty, price)."""
    # Build fingerprints from CSV trades
    csv_keys = set()
    for t in csv_trades:
        tx_type = t.get("Transaction Type", "").strip()
        if tx_type not in ("Buy", "Sell"):
            continue
        sym = t.get("Symbol", "").strip()
        date = t.get("Date", "").strip()
        try:
            qty = round(float(t.get("Quantity", "0")), 4)
            price = round(float(t.get("Price", "0")), 2)
        except (ValueError, TypeError):
            continue
        csv_keys.add((date, sym, qty, price))

    # Add only Flex trades not in CSV
    new_count = 0
    for t in flex_trades:
        sym = t.get("Symbol", "").strip()
        date = t.get("Date", "").strip()
        try:
            qty = round(float(t.get("Quantity", "0")), 4)
            price = round(float(t.get("Price", "0")), 2)
        except (ValueError, TypeError):
            continue
        key = (date, sym, qty, price)
        if key not in csv_keys:
            csv_trades.append(t)
            csv_keys.add(key)
            new_count += 1

    if new_count > 0:
        print(f"  Merge: {new_count} trades novos da Flex Query")
    else:
        print(f"  Merge: nenhum trade novo (CSV já completo)")

    return csv_trades


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


def enrich_ir_brl(lots: list[dict], current_prices: dict[str, float] | None = None,
                   ptax_atual: float | None = None) -> list[dict]:
    """Enrich lots with PTAX on purchase date, BRL cost, BRL value, P&L BRL, IR estimate.

    Fetches PTAX for all unique purchase dates via BCB API (batched).
    current_prices: {symbol: price_usd} — if None, fetches from ibkr_sync or yfinance.
    """
    from fx_utils import get_ptax_series, get_ptax

    # Current PTAX
    if ptax_atual is None:
        ptax_atual = get_ptax()
    print(f"  PTAX atual: R$ {ptax_atual:.4f}")

    # Current prices from Flex Query if not provided
    if current_prices is None:
        current_prices = {}
        try:
            from ibkr_sync import fetch_raw, extract_positions
            from dotenv import load_dotenv
            load_dotenv(Path(__file__).parent.parent / ".env")
            token = os.getenv("IBKR_TOKEN")
            qid = os.getenv("IBKR_QUERY_POSITIONS")
            if token and qid:
                raw = fetch_raw(token, qid)
                for p in extract_positions(raw):
                    current_prices[p["symbol"]] = p["price_usd"]
                print(f"  Preços atuais via Flex Query: {len(current_prices)} ETFs")
        except Exception as e:
            print(f"  ⚠️  Flex Query para preços falhou: {e}")

    # Collect unique purchase dates
    unique_dates = sorted(set(l["date"] for l in lots if l.get("date")))
    print(f"  Buscando PTAX para {len(unique_dates)} datas únicas no BCB...")

    # Fetch PTAX series covering all dates (min date - 7 days to max date)
    if unique_dates:
        from datetime import datetime as dt, timedelta
        min_date = (dt.strptime(unique_dates[0], "%Y-%m-%d") - timedelta(days=7)).strftime(DATE_FORMAT_YMD)
        max_date = unique_dates[-1]
        try:
            ptax_series = get_ptax_series(min_date, max_date)
            # Build lookup: for each date, find closest PTAX <= that date
            ptax_lookup: dict[str, float] = {}
            for d in unique_dates:
                target = dt.strptime(d, "%Y-%m-%d").date()
                # Filter series up to target date
                valid = ptax_series[ptax_series.index.date <= target]
                if not valid.empty:
                    ptax_lookup[d] = float(valid.iloc[-1])
                else:
                    ptax_lookup[d] = ptax_atual  # fallback
            print(f"  PTAX obtida para {len(ptax_lookup)} datas (range: R${min(ptax_lookup.values()):.2f}–R${max(ptax_lookup.values()):.2f})")
        except Exception as e:
            print(f"  ⚠️  BCB API falhou: {e} — usando PTAX atual como fallback")
            ptax_lookup = {d: ptax_atual for d in unique_dates}
    else:
        ptax_lookup = {}

    # Enrich each lot
    aliquota_ir = IR_ALIQUOTA
    for lot in lots:
        sym = lot["symbol"]
        ptax_compra = ptax_lookup.get(lot["date"], ptax_atual)
        price_atual = current_prices.get(sym, 0)

        lot["ptax_compra"] = round(ptax_compra, 4)
        lot["ptax_atual"] = round(ptax_atual, 4)
        lot["price_atual_usd"] = round(price_atual, 4)

        # Cost in BRL = qty × price_compra × PTAX_compra + commission × PTAX_compra
        lot["cost_brl"] = round(lot["qty"] * lot["price_usd"] * ptax_compra + lot["commission_usd"] * ptax_compra, 2)
        # Current value in BRL = qty × price_atual × PTAX_atual
        lot["value_brl"] = round(lot["qty"] * price_atual * ptax_atual, 2)
        # P&L nominal BRL
        lot["pnl_brl"] = round(lot["value_brl"] - lot["cost_brl"], 2)
        # IR estimate (15% on positive nominal BRL gain only)
        lot["ir_brl"] = round(max(0, lot["pnl_brl"]) * aliquota_ir, 2)
        # TLH eligible
        lot["tlh_eligible"] = lot["pnl_brl"] < 0
        lot["tlh_benefit_brl"] = round(abs(lot["pnl_brl"]) * aliquota_ir, 2) if lot["tlh_eligible"] else 0

    return lots


def summary(lots: list[dict]) -> dict:
    """Generate summary stats from lots."""
    by_symbol: dict[str, dict] = {}
    has_brl = any("cost_brl" in l for l in lots)

    for lot in lots:
        sym = lot["symbol"]
        if sym not in by_symbol:
            by_symbol[sym] = {
                "symbol": sym,
                "n_lotes": 0,
                "qty_total": 0.0,
                "cost_usd_total": 0.0,
                "cost_brl_total": 0.0,
                "value_brl_total": 0.0,
                "pnl_brl_total": 0.0,
                "ir_brl_total": 0.0,
                "tlh_count": 0,
                "tlh_benefit_brl": 0.0,
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
        if has_brl:
            entry["cost_brl_total"] += lot.get("cost_brl", 0)
            entry["value_brl_total"] += lot.get("value_brl", 0)
            entry["pnl_brl_total"] += lot.get("pnl_brl", 0)
            entry["ir_brl_total"] += lot.get("ir_brl", 0)
            if lot.get("tlh_eligible"):
                entry["tlh_count"] += 1
                entry["tlh_benefit_brl"] += lot.get("tlh_benefit_brl", 0)
        if lot["date"] < entry["oldest_lot"]:
            entry["oldest_lot"] = lot["date"]
        if lot["date"] > entry["newest_lot"]:
            entry["newest_lot"] = lot["date"]

    for entry in by_symbol.values():
        entry["pm_usd"] = entry["cost_usd_total"] / entry["qty_total"] if entry["qty_total"] > 0 else 0
        entry["qty_total"] = round(entry["qty_total"], 4)
        entry["cost_usd_total"] = round(entry["cost_usd_total"], 2)
        entry["pm_usd"] = round(entry["pm_usd"], 4)
        entry["cost_brl_total"] = round(entry["cost_brl_total"], 2)
        entry["value_brl_total"] = round(entry["value_brl_total"], 2)
        entry["pnl_brl_total"] = round(entry["pnl_brl_total"], 2)
        entry["ir_brl_total"] = round(entry["ir_brl_total"], 2)
        entry["tlh_benefit_brl"] = round(entry["tlh_benefit_brl"], 2)

    totals = {
        "total_lotes": len(lots),
        "total_symbols": len(by_symbol),
        "ir_brl_total": round(sum(e["ir_brl_total"] for e in by_symbol.values()), 2),
        "tlh_count": sum(e["tlh_count"] for e in by_symbol.values()),
        "tlh_benefit_brl": round(sum(e["tlh_benefit_brl"] for e in by_symbol.values()), 2),
        "by_symbol": dict(sorted(by_symbol.items())),
    }
    return totals


def main():
    parser = argparse.ArgumentParser(description="IBKR Lot Builder (FIFO)")
    parser.add_argument("csv", nargs="?", default=str(DEFAULT_CSV), help="CSV path")
    parser.add_argument("--flex", action="store_true", help="Complement CSV with Flex Query API trades")
    args = parser.parse_args()

    csv_path = Path(args.csv)
    if not csv_path.exists():
        print(f"❌ CSV não encontrado: {csv_path}")
        sys.exit(1)

    print(f"📄 Parsing: {csv_path.name}")
    trades = parse_ibkr_csv(csv_path)
    print(f"   {len(trades)} linhas de transação")

    # Merge com Flex Query se --flex
    if args.flex:
        flex_trades = fetch_flex_trades()
        if flex_trades:
            trades = merge_trades(trades, flex_trades)

    buy_sell = [t for t in trades if t.get("Transaction Type", "").strip() in ("Buy", "Sell")]
    print(f"   {len(buy_sell)} trades (Buy/Sell)")

    lots = build_lots_fifo(trades)
    lots = enrich_lots(lots)
    print(f"   {len(lots)} lotes abertos (FIFO)")

    # Enrich with PTAX + IR BRL
    print(f"\n📊 Calculando IR por lote (PTAX BCB + preços atuais)...")
    lots = enrich_ir_brl(lots)

    summ = summary(lots)
    has_brl = any("cost_brl" in l for l in lots)

    print(f"\n{'─'*80}")
    if has_brl:
        print(f"{'Símbolo':<8} {'Lotes':>5} {'Custo BRL':>12} {'Valor BRL':>12} {'P&L BRL':>12} {'IR 15%':>10} {'TLH':>5}")
        print(f"{'─'*80}")
        for sym, s in summ["by_symbol"].items():
            pnl_color = ""
            print(f"{sym:<8} {s['n_lotes']:>5} R${s['cost_brl_total']:>9,.0f} R${s['value_brl_total']:>9,.0f} R${s['pnl_brl_total']:>9,.0f} R${s['ir_brl_total']:>7,.0f} {s['tlh_count'] or '—':>5}")
        print(f"{'─'*80}")
        print(f"{'TOTAL':<8} {summ['total_lotes']:>5} {'':>12} {'':>12} {'':>12} R${summ['ir_brl_total']:>7,.0f} {summ['tlh_count'] or '—':>5}")
        if summ["tlh_count"] > 0:
            print(f"\n  TLH: {summ['tlh_count']} lotes elegíveis, benefício fiscal R${summ['tlh_benefit_brl']:,.0f}")
    else:
        print(f"{'Símbolo':<8} {'Lotes':>5} {'Qty':>10} {'Custo USD':>12} {'PM USD':>10} {'Status':<12}")
        print(f"{'─'*80}")
        for sym, s in summ["by_symbol"].items():
            print(f"{sym:<8} {s['n_lotes']:>5} {s['qty_total']:>10.2f} ${s['cost_usd_total']:>10,.0f} ${s['pm_usd']:>8.2f} {s['status']:<12}")

    # Round for output
    for lot in lots:
        lot["qty"] = round(lot["qty"], 4)
        lot["cost_usd"] = round(lot["cost_usd"], 2)
        lot["price_usd"] = round(lot["price_usd"], 4)
        lot["commission_usd"] = round(lot["commission_usd"], 4)

    output = {
        "_generated": datetime.now(datetime.now().astimezone().tzinfo).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "_source": csv_path.name + (" + Flex Query" if args.flex else ""),
        "_period": f"{lots[0]['date']} → {lots[-1]['date']}" if lots else "",
        "_ptax_atual": lots[0].get("ptax_atual") if lots else None,
        "summary": summ,
        "lots": lots,
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\n✅ {OUTPUT_FILE} ({len(lots)} lotes, IR total R${summ['ir_brl_total']:,.0f})")


if __name__ == "__main__":
    main()
