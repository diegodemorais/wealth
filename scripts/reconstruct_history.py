#!/usr/bin/env python3
"""
Reconstrói historico_carteira.csv com dados REAIS de patrimônio mensal.

Fontes:
- IBKR transações (CSV) → posições por mês-fim
- yfinance → preços de fechamento mensal por ETF
- BCB PTAX → câmbio BRL/USD mensal
- XP lotes (dados/xp/operacoes.json) → HODL11, B5P211
- Nubank (dados/nubank/operacoes_td.json) → Tesouro Direto

Output: dados/historico_carteira.csv (patrimônio BRL mensal real)
"""

import csv
import json
import sys
from collections import defaultdict
from datetime import datetime, date, timedelta
from pathlib import Path

ROOT = Path(__file__).parent.parent
IBKR_CSV = ROOT / "analysis" / "raw" / "U5947683.TRANSACTIONS.20210408.20260331.csv"
XP_OPS = ROOT / "dados" / "xp" / "operacoes.json"
NUBANK_OPS = ROOT / "dados" / "nubank" / "operacoes_td.json"
OUTPUT_CSV = ROOT / "dados" / "historico_carteira.csv"


# ═══════════════════════════════════════════════════════════════════════════════
# 1. IBKR: parse trades → running positions by month-end
# ═══════════════════════════════════════════════════════════════════════════════

def parse_ibkr_trades() -> list[dict]:
    """Parse IBKR CSV, return list of {date, symbol, qty} for Buy/Sell."""
    trades = []
    with open(IBKR_CSV, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or row[0] != "Transaction History" or row[1] != "Data":
                continue
            if len(row) < 13:
                continue
            _, _, date_str, account, desc, tx_type, symbol, qty, price, price_ccy, gross, comm, net = row[:13]
            tx = tx_type.strip()
            if tx not in ("Buy", "Sell"):
                continue
            try:
                dt = datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
                qty_f = float(qty.strip().replace(",", ""))
                sym = symbol.strip()
                if sym:
                    trades.append({"date": dt, "symbol": sym, "qty": qty_f})
            except (ValueError, IndexError):
                continue
    return sorted(trades, key=lambda x: x["date"])


def build_ibkr_positions_by_month(trades: list[dict]) -> dict[str, dict[str, float]]:
    """
    From trades, build running positions.
    Returns {month_str: {symbol: qty}} for each month-end.
    """
    if not trades:
        return {}

    # Running position
    position = defaultdict(float)
    # Group trades by date
    trades_by_date = defaultdict(list)
    for t in trades:
        trades_by_date[t["date"]].append(t)

    # Generate month-ends from first trade to today
    first_trade = trades[0]["date"]
    start_month = date(first_trade.year, first_trade.month, 1)
    today = date.today()

    positions_monthly = {}
    current = start_month

    while current <= today:
        # Find last day of this month
        if current.month == 12:
            next_month = date(current.year + 1, 1, 1)
        else:
            next_month = date(current.year, current.month + 1, 1)
        month_end = next_month - timedelta(days=1)

        # Apply all trades up to month_end
        for d in sorted(trades_by_date.keys()):
            if d <= month_end:
                for t in trades_by_date[d]:
                    position[t["symbol"]] += t["qty"]
                del trades_by_date[d]  # processed

        # Snapshot
        month_str = current.strftime("%Y-%m")
        positions_monthly[month_str] = {s: round(q, 6) for s, q in position.items() if abs(q) > 0.001}

        current = next_month

    return positions_monthly


# ═══════════════════════════════════════════════════════════════════════════════
# 2. XP: HODL11 + B5P211 positions by month
# ═══════════════════════════════════════════════════════════════════════════════

def build_xp_positions_by_month() -> dict[str, dict[str, float]]:
    """Build XP positions (HODL11, B5P211) by month from operacoes.json."""
    if not XP_OPS.exists():
        return {}
    ops = json.loads(XP_OPS.read_text())
    position = defaultdict(float)
    positions_monthly = {}

    # Group by month
    ops_by_month = defaultdict(list)
    for op in ops:
        month = op["data"][:7]
        ops_by_month[month].append(op)

    if not ops_by_month:
        return {}

    months_sorted = sorted(ops_by_month.keys())
    first_month = months_sorted[0]
    today_month = date.today().strftime("%Y-%m")

    current = datetime.strptime(first_month + "-01", "%Y-%m-%d").date()
    end = datetime.strptime(today_month + "-01", "%Y-%m-%d").date()

    while current <= end:
        month_str = current.strftime("%Y-%m")
        if month_str in ops_by_month:
            for op in ops_by_month[month_str]:
                ticker = op["ticker"]
                qty = op.get("qty") or 0
                if op["cv"] == "C":
                    position[ticker] += qty
                elif op["cv"] == "V":
                    position[ticker] -= qty

        positions_monthly[month_str] = {s: round(q, 4) for s, q in position.items() if abs(q) > 0.5}

        # Next month
        if current.month == 12:
            current = date(current.year + 1, 1, 1)
        else:
            current = date(current.year, current.month + 1, 1)

    return positions_monthly


# ═══════════════════════════════════════════════════════════════════════════════
# 3. Nubank: Tesouro Direto values by month (applied amount as proxy)
# ═══════════════════════════════════════════════════════════════════════════════

def build_nubank_rf_by_month() -> dict[str, float]:
    """
    Build Nubank RF total by month.
    Uses cumulative applied amount (not MtM) — this is the cost basis.
    For Tesouro Direto, the actual MtM value is not available via API.
    We use applied amount as the best available proxy.
    """
    if not NUBANK_OPS.exists():
        return {}
    data = json.loads(NUBANK_OPS.read_text())
    ops = data.get("operacoes", [])
    if not ops:
        return {}

    # Running total of applied amount
    running = 0.0
    rf_monthly = {}

    ops_by_month = defaultdict(list)
    for op in ops:
        month = op["data"][:7]
        ops_by_month[month].append(op)

    first_month = min(ops_by_month.keys())
    today_month = date.today().strftime("%Y-%m")

    current = datetime.strptime(first_month + "-01", "%Y-%m-%d").date()
    end = datetime.strptime(today_month + "-01", "%Y-%m-%d").date()

    while current <= end:
        month_str = current.strftime("%Y-%m")
        if month_str in ops_by_month:
            for op in ops_by_month[month_str]:
                if op["tipo"] == "aplicacao":
                    running += op["valor_brl"]
                elif op["tipo"] == "resgate":
                    running -= op["valor_brl"]
                    if running < 0:
                        running = 0

        rf_monthly[month_str] = round(running, 2)

        if current.month == 12:
            current = date(current.year + 1, 1, 1)
        else:
            current = date(current.year, current.month + 1, 1)

    return rf_monthly


# ═══════════════════════════════════════════════════════════════════════════════
# 4. Prices: yfinance monthly close
# ═══════════════════════════════════════════════════════════════════════════════

def fetch_monthly_prices(symbols: list[str], start: str, end: str) -> dict[str, dict[str, float]]:
    """
    Fetch monthly adjusted close prices from yfinance.
    Returns {symbol: {month_str: price}}.
    """
    try:
        import yfinance as yf
    except ImportError:
        print("ERROR: yfinance not installed")
        sys.exit(1)

    print(f"  Fetching prices for {len(symbols)} symbols from {start} to {end}...")

    # Map internal symbols to yfinance tickers
    YF_MAP = {
        "SWRD": "SWRD.L",
        "AVGS": "AVGS.L",
        "AVDV": "AVDV",           # US-listed (NYSE Arca)
        "AVUV": "AVUV",           # US-listed (NYSE Arca)
        "AVES": "AVES",           # US-listed (NYSE Arca)
        "EIMI": "EIMI.L",
        "DGS": "DGS",
        "USSC": "USSC.L",
        "JPGL": "JPGL.L",
        "IWVL": "IWVL.L",
        "IWMO": "IWMO.L",
        "F50A": "F50A.L",
        "COIN": "COIN",
        "ZPRX": "ZPRX.DE",       # German-listed
        "WRDUSWUSD": "SWRD.L",   # predecessor
        "HODL11": "HODL11.SA",
        "B5P211": "B5P211.SA",
        "BBDC4": "BBDC4.SA",
    }

    result = {}
    yf_tickers = []
    sym_to_yf = {}
    for s in symbols:
        yf_t = YF_MAP.get(s, s)
        yf_tickers.append(yf_t)
        sym_to_yf[s] = yf_t

    # Download all at once
    tickers_str = " ".join(set(yf_tickers))
    data = yf.download(tickers_str, start=start, end=end, interval="1mo",
                       auto_adjust=True, progress=False)

    if data.empty:
        print("  WARNING: yfinance returned empty data")
        return {}

    # Handle single vs multi ticker
    if len(set(yf_tickers)) == 1:
        # Single ticker: data.columns are just price columns
        yf_t = yf_tickers[0]
        for s, yt in sym_to_yf.items():
            if yt == yf_t:
                result[s] = {}
                for idx, row in data.iterrows():
                    month_str = idx.strftime("%Y-%m")
                    price = row.get("Close")
                    if price is not None and not (hasattr(price, '__iter__') and len(price) == 0):
                        try:
                            p = float(price)
                            if p > 0:
                                result[s][month_str] = round(p, 4)
                        except (TypeError, ValueError):
                            pass
    else:
        # Multi ticker: data.columns are MultiIndex (Price, Ticker)
        close = data.get("Close", data)
        for s, yf_t in sym_to_yf.items():
            result[s] = {}
            if yf_t in close.columns:
                series = close[yf_t].dropna()
                for idx, price in series.items():
                    month_str = idx.strftime("%Y-%m")
                    try:
                        p = float(price)
                        if p > 0:
                            result[s][month_str] = round(p, 4)
                    except (TypeError, ValueError):
                        pass

    for s in symbols:
        n = len(result.get(s, {}))
        if n > 0:
            print(f"    {s}: {n} months")
        else:
            print(f"    {s}: NO DATA")

    return result


# ═══════════════════════════════════════════════════════════════════════════════
# 5. FX: BRL/USD monthly (BCB PTAX)
# ═══════════════════════════════════════════════════════════════════════════════

def fetch_monthly_fx(start: str, end: str) -> dict[str, float]:
    """
    Fetch monthly BRL/USD from BCB.
    Returns {month_str: exchange_rate}.
    """
    try:
        from python_bcb import sgs
        print("  Fetching BRL/USD from BCB (PTAX venda, série 1)...")
        # Série 1 = USD (venda)
        df = sgs.get({"ptax": 1}, start=start, end=end)
        if df.empty:
            raise ValueError("BCB returned empty")
        monthly = {}
        for idx, row in df.iterrows():
            month_str = idx.strftime("%Y-%m")
            monthly[month_str] = round(float(row["ptax"]), 4)  # keeps last value of month
        print(f"    PTAX: {len(monthly)} months")
        return monthly
    except Exception as e:
        print(f"  WARNING: BCB fetch failed ({e}), trying yfinance fallback...")
        try:
            import yfinance as yf
            data = yf.download("USDBRL=X", start=start, end=end, interval="1mo",
                              auto_adjust=True, progress=False)
            monthly = {}
            close = data.get("Close", data)
            for idx, row in close.iterrows() if hasattr(close, 'iterrows') else []:
                month_str = idx.strftime("%Y-%m")
                try:
                    monthly[month_str] = round(float(row if not hasattr(row, '__iter__') else row.iloc[0]), 4)
                except:
                    pass
            if not monthly:
                # Try iterating directly
                for idx in close.index:
                    month_str = idx.strftime("%Y-%m")
                    val = close.loc[idx]
                    try:
                        monthly[month_str] = round(float(val.iloc[0] if hasattr(val, 'iloc') else val), 4)
                    except:
                        pass
            print(f"    USDBRL (yfinance): {len(monthly)} months")
            return monthly
        except Exception as e2:
            print(f"  ERROR: FX fetch failed: {e2}")
            return {}


# ═══════════════════════════════════════════════════════════════════════════════
# 6. MAIN: reconstruct monthly patrimonio
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    print("=" * 70)
    print("RECONSTRUÇÃO DO HISTÓRICO DE PATRIMÔNIO MENSAL")
    print("=" * 70)

    # ── Step 1: Build positions ────────────────────────────────────────────
    print("\n1. Parsing IBKR trades...")
    ibkr_trades = parse_ibkr_trades()
    ibkr_positions = build_ibkr_positions_by_month(ibkr_trades)
    print(f"   {len(ibkr_trades)} trades → {len(ibkr_positions)} months")

    print("\n2. Building XP positions...")
    xp_positions = build_xp_positions_by_month()
    print(f"   {len(xp_positions)} months")

    print("\n3. Building Nubank RF...")
    nubank_rf = build_nubank_rf_by_month()
    print(f"   {len(nubank_rf)} months")

    # ── Step 2: Determine all symbols needed ──────────────────────────────
    all_symbols = set()
    for month_pos in ibkr_positions.values():
        all_symbols.update(month_pos.keys())
    for month_pos in xp_positions.values():
        all_symbols.update(month_pos.keys())

    # Separate USD-denominated (IBKR) from BRL-denominated (XP/B3)
    BRL_TICKERS = {"HODL11", "B5P211"}
    usd_symbols = [s for s in all_symbols if s not in BRL_TICKERS]
    brl_symbols = [s for s in all_symbols if s in BRL_TICKERS]

    all_months = sorted(set(ibkr_positions.keys()) | set(xp_positions.keys()) | set(nubank_rf.keys()))
    if not all_months:
        print("ERROR: No months to process")
        return

    start_date = all_months[0] + "-01"
    end_date = date.today().strftime("%Y-%m-%d")

    # ── Step 3: Fetch prices ──────────────────────────────────────────────
    print(f"\n4. Fetching prices ({start_date} → {end_date})...")
    prices_usd = fetch_monthly_prices(usd_symbols, start_date, end_date) if usd_symbols else {}
    prices_brl = fetch_monthly_prices(brl_symbols, start_date, end_date) if brl_symbols else {}

    print(f"\n5. Fetching FX (BRL/USD)...")
    fx = fetch_monthly_fx(start_date, end_date)

    # ── Step 4: Compute monthly patrimonio ────────────────────────────────
    print(f"\n6. Computing monthly patrimônio...")
    rows = []
    prev_pat = None

    for month in all_months:
        cambio = fx.get(month)
        if not cambio:
            # Try nearest available
            for offset in range(1, 4):
                m = datetime.strptime(month + "-01", "%Y-%m-%d").date()
                for delta in [-offset, offset]:
                    candidate = (m.replace(day=1) + timedelta(days=32 * delta)).strftime("%Y-%m")
                    if candidate in fx:
                        cambio = fx[candidate]
                        break
                if cambio:
                    break
        if not cambio:
            cambio = 5.0  # absolute fallback, shouldn't happen

        # IBKR equity (USD → BRL)
        ibkr_pos = ibkr_positions.get(month, {})
        equity_usd = 0.0
        for sym, qty in ibkr_pos.items():
            if sym in BRL_TICKERS:
                continue
            price = prices_usd.get(sym, {}).get(month)
            if price:
                equity_usd += qty * price

        equity_brl = equity_usd * cambio

        # XP positions (BRL)
        xp_pos = xp_positions.get(month, {})
        xp_brl = 0.0
        for sym, qty in xp_pos.items():
            price = prices_brl.get(sym, {}).get(month)
            if price:
                xp_brl += qty * price

        # Nubank RF (BRL — applied amount proxy)
        rf_brl = nubank_rf.get(month, 0)

        # Total
        patrimonio_brl = equity_brl + xp_brl + rf_brl

        # Variation
        var_pct = ""
        if prev_pat and prev_pat > 0:
            var_pct = f"{(patrimonio_brl / prev_pat - 1) * 100:.2f}"
        prev_pat = patrimonio_brl

        rows.append({
            "data": month + "-28",  # approximate month-end
            "patrimonio_brl": round(patrimonio_brl, 2),
            "patrimonio_var": var_pct,
            "equity_usd": round(equity_usd, 2),
            "equity_brl": round(equity_brl, 2),
            "xp_brl": round(xp_brl, 2),
            "rf_brl": round(rf_brl, 2),
            "usdbrl": cambio,
        })

        print(f"  {month}: equity ${equity_usd:>12,.2f} × {cambio:.2f} = R${equity_brl:>14,.2f}"
              f"  |  XP R${xp_brl:>10,.2f}  |  RF R${rf_brl:>10,.2f}"
              f"  |  TOTAL R${patrimonio_brl:>14,.2f}"
              f"  {'(' + var_pct + '%)' if var_pct else ''}")

    # ── Step 5: Filter zero months and write CSV ────────────────────────
    rows = [r for r in rows if r["patrimonio_brl"] > 0]

    print(f"\n7. Writing {OUTPUT_CSV.relative_to(ROOT)}...")
    fieldnames = ["data", "patrimonio_brl", "patrimonio_var", "equity_usd", "equity_brl",
                  "xp_brl", "rf_brl", "usdbrl"]

    # Recalculate variations after filtering
    for i, row in enumerate(rows):
        if i == 0:
            row["patrimonio_var"] = ""
        else:
            prev = rows[i-1]["patrimonio_brl"]
            row["patrimonio_var"] = f"{(row['patrimonio_brl'] / prev - 1) * 100:.2f}" if prev > 0 else ""

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n{'=' * 70}")
    print(f"✅ {len(rows)} meses escritos em {OUTPUT_CSV.relative_to(ROOT)}")
    print(f"   Período: {rows[0]['data']} → {rows[-1]['data']}")
    print(f"   Patrimônio inicial: R${rows[0]['patrimonio_brl']:,.2f}")
    print(f"   Patrimônio final:   R${rows[-1]['patrimonio_brl']:,.2f}")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
