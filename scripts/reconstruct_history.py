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
IBKR_APORTES = ROOT / "dados" / "ibkr" / "aportes.json"
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
# HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _last_known_fx(fx: dict, month: str) -> float:
    """Retorna último câmbio conhecido anterior ao mês dado. Nunca retorna hardcoded."""
    sorted_months = sorted(fx.keys())
    last = None
    for m in sorted_months:
        if m <= month:
            last = fx[m]
    if last:
        return last
    # Se nenhum anterior, pegar o primeiro disponível
    if sorted_months:
        return fx[sorted_months[0]]
    raise ValueError(f"Nenhum dado de câmbio disponível para fallback (mês={month})")


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

    # ── Step 4: Build monthly cash flows (aportes) ─────────────────────
    print(f"\n6. Building monthly cash flows (aportes)...")
    aportes_by_month = defaultdict(float)  # month → total BRL inflow

    # IBKR deposits (USD → BRL usando câmbio do mês)
    if IBKR_APORTES.exists():
        ibkr_ap = json.loads(IBKR_APORTES.read_text())
        for dep in ibkr_ap.get("depositos", []):
            month = dep["data"][:7]
            usd = dep.get("usd", dep.get("amount_usd", 0))
            cambio_mes = fx.get(month) or _last_known_fx(fx, month)
            aportes_by_month[month] += usd * cambio_mes

    # XP purchases (BRL) — compras são aportes
    if XP_OPS.exists():
        xp_ops = json.loads(XP_OPS.read_text())
        for op in xp_ops:
            if op["cv"] == "C" and op.get("valor"):
                month = op["data"][:7]
                aportes_by_month[month] += op["valor"]
            elif op["cv"] == "V" and op.get("valor"):
                month = op["data"][:7]
                aportes_by_month[month] -= op["valor"]  # resgate = outflow

    # Nubank TD (BRL)
    if NUBANK_OPS.exists():
        nb_data = json.loads(NUBANK_OPS.read_text())
        for op in nb_data.get("operacoes", []):
            month = op["data"][:7]
            if op["tipo"] == "aplicacao":
                aportes_by_month[month] += op["valor_brl"]
            elif op["tipo"] == "resgate":
                aportes_by_month[month] -= op["valor_brl"]

    # IBKR aportes em USD por mês (para TWR do equity block em USD)
    ibkr_aportes_usd_by_month = defaultdict(float)
    if IBKR_APORTES.exists():
        ibkr_ap = json.loads(IBKR_APORTES.read_text())
        for dep in ibkr_ap.get("depositos", []):
            month = dep["data"][:7]
            usd = dep.get("usd", dep.get("amount_usd", 0))
            ibkr_aportes_usd_by_month[month] += usd

    total_aportes = sum(v for v in aportes_by_month.values())
    print(f"   Total aportes líquidos BRL: R${total_aportes:,.2f}")
    print(f"   Total aportes IBKR USD: ${sum(ibkr_aportes_usd_by_month.values()):,.2f}")

    # ── Step 5: Compute monthly patrimonio + TWR ─────────────────────
    print(f"\n7. Computing monthly patrimônio + TWR...")
    rows = []
    prev_pat = None
    prev_equity_usd = None

    for month in all_months:
        cambio = fx.get(month)
        if not cambio:
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
            cambio = _last_known_fx(fx, month)

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

        # TWR BRL: retorno = (patrimônio_fim - aporte_mês) / patrimônio_início - 1
        aporte_mes_brl = aportes_by_month.get(month, 0)
        twr_pct = ""
        if prev_pat and prev_pat > 0:
            retorno = (patrimonio_brl - aporte_mes_brl) / prev_pat - 1
            twr_pct = f"{retorno * 100:.2f}"
        prev_pat = patrimonio_brl

        # TWR USD (equity block only): descontar aportes IBKR em USD
        aporte_mes_usd = ibkr_aportes_usd_by_month.get(month, 0)
        twr_usd_pct = ""
        if prev_equity_usd and prev_equity_usd > 0:
            ret_usd = (equity_usd - aporte_mes_usd) / prev_equity_usd - 1
            twr_usd_pct = f"{ret_usd * 100:.2f}"
        prev_equity_usd = equity_usd

        rows.append({
            "data": month + "-28",
            "patrimonio_brl": round(patrimonio_brl, 2),
            "patrimonio_var": twr_pct,
            "aporte_brl": round(aporte_mes_brl, 2),
            "equity_usd": round(equity_usd, 2),
            "equity_var_usd": twr_usd_pct,
            "aporte_usd": round(aporte_mes_usd, 2),
            "equity_brl": round(equity_brl, 2),
            "xp_brl": round(xp_brl, 2),
            "rf_brl": round(rf_brl, 2),
            "usdbrl": cambio,
        })

        aporte_str = f" aporte R${aporte_mes_brl:>10,.2f}" if aporte_mes_brl else ""
        print(f"  {month}: R${patrimonio_brl:>14,.2f}  TWR_BRL={twr_pct:>7s}%  TWR_USD={twr_usd_pct:>7s}%{aporte_str}")

    # ── Step 5: Filter zero months and write CSV ────────────────────────
    rows = [r for r in rows if r["patrimonio_brl"] > 0]

    print(f"\n8. Writing {OUTPUT_CSV.relative_to(ROOT)}...")
    fieldnames = ["data", "patrimonio_brl", "patrimonio_var", "aporte_brl",
                  "equity_usd", "equity_var_usd", "aporte_usd",
                  "equity_brl", "xp_brl", "rf_brl", "usdbrl"]

    # Recalculate TWR after filtering zeros
    for i, row in enumerate(rows):
        if i == 0:
            row["patrimonio_var"] = ""
            row["equity_var_usd"] = ""
        else:
            prev_brl = rows[i-1]["patrimonio_brl"]
            aporte_brl = row.get("aporte_brl", 0)
            if prev_brl > 0:
                row["patrimonio_var"] = f"{((row['patrimonio_brl'] - aporte_brl) / prev_brl - 1) * 100:.2f}"
            else:
                row["patrimonio_var"] = ""

            prev_usd = rows[i-1]["equity_usd"]
            aporte_usd = row.get("aporte_usd", 0)
            if prev_usd > 0:
                row["equity_var_usd"] = f"{((row['equity_usd'] - aporte_usd) / prev_usd - 1) * 100:.2f}"
            else:
                row["equity_var_usd"] = ""

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # ═══════════════════════════════════════════════════════════════════
    # 9. Generate core JSON structures
    # ═══════════════════════════════════════════════════════════════════
    print(f"\n9. Generating core JSON structures...")
    _generate_core_jsons(rows)

    print(f"\n{'=' * 70}")
    print(f"✅ {len(rows)} meses escritos em {OUTPUT_CSV.relative_to(ROOT)}")
    print(f"   Período: {rows[0]['data']} → {rows[-1]['data']}")
    print(f"   Patrimônio inicial: R${rows[0]['patrimonio_brl']:,.2f}")
    print(f"   Patrimônio final:   R${rows[-1]['patrimonio_brl']:,.2f}")
    print(f"{'=' * 70}")


# ═══════════════════════════════════════════════════════════════════════════════
# CORE JSON GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

def _compute_information_ratio(dates: list[str], twr_usd_pct: list) -> dict | None:
    """
    Calcula Information Ratio do portfolio equity block vs VWRA.L.

    Base: USD — twr_usd_pct (equity block retornos mensais simples em %).
    Benchmark: VWRA.L via yfinance, auto_adjust=True, retornos mensais simples
               (pct_change no último dia útil de cada mês).
    Active return: portfolio_usd_t - benchmark_usd_t (ambos em % simples mensal).
    IR = mean(AR) / std(AR, ddof=1) * sqrt(12)
    Rolling 36m: janela deslizante, resulta em N-35 pontos.
    Fallback: se yfinance falhar, retorna None (campo omitido).

    Spec aprovado Factor + Quant 2026-04-10.
    """
    import math as _math
    import warnings

    # ── 1. Filtrar apenas meses com twr_usd_pct não-None ──
    valid_pairs = [
        (d, r) for d, r in zip(dates, twr_usd_pct) if r is not None
    ]
    if len(valid_pairs) < 12:
        print("  ⚠ IR: menos de 12 meses USD válidos — omitindo")
        return None

    valid_dates = [p[0] for p in valid_pairs]   # lista de "YYYY-MM"
    port_rets   = [p[1] for p in valid_pairs]   # retornos mensais em %

    # ── 2. Baixar VWRA.L via yfinance ──
    try:
        import yfinance as yf
    except ImportError:
        print("  ⚠ IR: yfinance não instalado — omitindo")
        return None

    # Período: do primeiro mês até o último (+ margem para capturar o mês inteiro)
    from datetime import datetime as _dt, timedelta as _td
    d_start = _dt.strptime(valid_dates[0] + "-01", "%Y-%m-%d")
    d_end   = _dt.strptime(valid_dates[-1] + "-01", "%Y-%m-%d")
    # Avançar d_end para o primeiro dia do mês seguinte (para garantir que o mês fechado entre)
    if d_end.month == 12:
        d_end_fetch = _dt(d_end.year + 1, 1, 1)
    else:
        d_end_fetch = _dt(d_end.year, d_end.month + 1, 1)
    # Buffer de 5 dias antes do início para capturar o preço de abertura do período
    d_start_fetch = d_start - _td(days=5)

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            ticker = yf.Ticker("VWRA.L")
            hist = ticker.history(
                start=d_start_fetch.strftime("%Y-%m-%d"),
                end=d_end_fetch.strftime("%Y-%m-%d"),
                interval="1d",
                auto_adjust=True,
            )
        if hist is None or hist.empty:
            print("  ⚠ IR: VWRA.L retornou dados vazios — omitindo")
            return None
    except Exception as _e:
        print(f"  ⚠ IR: yfinance VWRA.L falhou ({_e}) — omitindo")
        return None

    # ── 3. Calcular retornos mensais do benchmark (pct_change no último dia útil) ──
    # Resample para o último dia útil de cada mês, depois pct_change
    try:
        import pandas as _pd
        # Garantir índice tz-naive para uniformidade
        if hist.index.tz is not None:
            hist.index = hist.index.tz_localize(None)
        close = hist["Close"].resample("ME").last()   # último dia útil do mês
        bm_rets_raw = close.pct_change() * 100        # retorno simples em %
        # Construir dict YYYY-MM → retorno mensal benchmark
        bm_dict: dict[str, float] = {}
        for ts, val in bm_rets_raw.items():
            if _pd.isna(val):
                continue
            ym = ts.strftime("%Y-%m")
            bm_dict[ym] = round(float(val), 6)
    except Exception as _e:
        print(f"  ⚠ IR: erro ao calcular retornos VWRA.L ({_e}) — omitindo")
        return None

    # ── 4. Alinhar às datas do portfolio ──
    aligned_port: list[float] = []
    aligned_bm:   list[float] = []
    aligned_dates: list[str]  = []

    for d, p in zip(valid_dates, port_rets):
        if d in bm_dict:
            aligned_dates.append(d)
            aligned_port.append(p)
            aligned_bm.append(bm_dict[d])

    n = len(aligned_dates)
    if n < 12:
        print(f"  ⚠ IR: apenas {n} meses alinhados com VWRA.L — omitindo")
        return None

    # ── 5. Active returns ──
    ar = [p - b for p, b in zip(aligned_port, aligned_bm)]

    # ── 6. IR ITD ──
    def _ir(ar_window: list[float]) -> tuple[float, float, float]:
        """Retorna (IR anualizado, TE anualizado %, AR anual %)."""
        n_w = len(ar_window)
        mean_ar = sum(ar_window) / n_w
        # std ddof=1
        var = sum((v - mean_ar) ** 2 for v in ar_window) / (n_w - 1)
        std = _math.sqrt(var)
        ir_val = mean_ar / std * _math.sqrt(12) if std > 0 else 0.0
        te_ann = std * _math.sqrt(12)             # tracking error anualizado em %
        ar_ann = mean_ar * 12                     # active return anual em %
        return round(ir_val, 4), round(te_ann, 4), round(ar_ann, 4)

    ir_itd, te_itd, ar_itd = _ir(ar)

    # ── 7. Rolling 36m ──
    ROLL_WIN = 36
    roll_ir_dates: list[str]  = []
    roll_ir_vals:  list[float] = []

    if n >= ROLL_WIN:
        for i in range(ROLL_WIN - 1, n):
            window_ar = ar[i - ROLL_WIN + 1: i + 1]
            ir_val_r, _, _ = _ir(window_ar)
            roll_ir_dates.append(aligned_dates[i])
            roll_ir_vals.append(ir_val_r)

    # ── 8. Montar bloco de saída ──
    result = {
        "benchmark": "VWRA.L",
        "base": "USD",
        "itd": {
            "ir": ir_itd,
            "tracking_error_pct": te_itd,
            "active_return_anual_pct": ar_itd,
            "n_meses": n,
        },
        "rolling_36m": {
            "dates": roll_ir_dates,
            "values": roll_ir_vals,
            "nota": f"N={len(roll_ir_dates)} pontos — baixa robustez estatística",
        },
    }
    return result


def _generate_core_jsons(rows: list[dict]):
    """
    Gera os JSONs core da camada de dados do portfolio.
    Fonte de verdade para todos os consumidores (dashboard, checkin, FIRE MC, retros).
    """
    import math
    import json as _json
    import urllib.request as _url_req
    from datetime import datetime, timedelta

    now_iso = datetime.now().isoformat(timespec="seconds")

    # ── 1. retornos_mensais.json ─────────────────────────────────────
    dates = []
    twr_pct = []           # Portfolio total em BRL
    twr_usd_pct = []       # Equity block em USD
    acumulado = []
    acumulado_usd = []
    # Decomposição por componente
    comp_equity_usd = []   # Contribuição do retorno equity em USD
    comp_fx = []           # Contribuição do câmbio
    comp_other = []        # Contribuição RF + XP (residual)
    cum = 1.0
    cum_usd = 1.0

    for i, row in enumerate(rows):
        var_str = row.get("patrimonio_var", "")
        var_usd_str = row.get("equity_var_usd", "")
        if i == 0 or not var_str:
            continue
        ret = float(var_str) / 100
        cum *= (1 + ret)
        dates.append(row["data"][:7])
        twr_pct.append(round(ret * 100, 4))
        acumulado.append(round((cum - 1) * 100, 2))

        if var_usd_str:
            ret_usd = float(var_usd_str) / 100
            cum_usd *= (1 + ret_usd)
            twr_usd_pct.append(round(ret_usd * 100, 4))
            acumulado_usd.append(round((cum_usd - 1) * 100, 2))
        else:
            twr_usd_pct.append(None)
            acumulado_usd.append(None)

        # ── Decomposição de retorno ──
        # ret_total_brl = w_equity × (ret_equity_usd + ret_fx + ret_equity_usd × ret_fx) + w_other × ret_other
        # Simplificado: contribuições aditivas em % do patrimônio
        prev = rows[i - 1]
        pat_prev = prev["patrimonio_brl"]
        if pat_prev > 0:
            # Equity contribution: (equity_brl_now - equity_brl_prev - aporte_ibkr_brl) / pat_prev
            eq_brl_prev = prev.get("equity_brl", 0)
            eq_brl_now = row.get("equity_brl", 0)
            aporte_brl = row.get("aporte_brl", 0)
            # Aporte equity (IBKR) in BRL = aporte_usd × cambio
            aporte_eq_brl = row.get("aporte_usd", 0) * row.get("usdbrl", 5.0)
            eq_contrib = (eq_brl_now - eq_brl_prev - aporte_eq_brl) / pat_prev * 100

            # Decompor equity BRL em: equity USD component + FX component
            # equity_brl = equity_usd × cambio
            # Δ(equity_brl) = Δ(equity_usd) × cambio_prev + equity_usd_prev × Δ(cambio) + cross
            eq_usd_prev = prev.get("equity_usd", 0)
            eq_usd_now = row.get("equity_usd", 0)
            cambio_prev = prev.get("usdbrl", 5.0)
            cambio_now = row.get("usdbrl", 5.0)
            aporte_usd = row.get("aporte_usd", 0)

            delta_eq_usd = eq_usd_now - eq_usd_prev - aporte_usd  # market-only change in USD
            delta_cambio = cambio_now - cambio_prev

            # Equity USD contribution (market return in USD × previous FX)
            eq_usd_contrib = delta_eq_usd * cambio_prev / pat_prev * 100 if pat_prev > 0 else 0
            # FX contribution (previous USD position × change in FX)
            fx_contrib = eq_usd_prev * delta_cambio / pat_prev * 100 if pat_prev > 0 else 0
            # Other (RF + XP non-IBKR) = total - equity contribution
            other_contrib = ret * 100 - eq_contrib

            comp_equity_usd.append(round(eq_usd_contrib, 2))
            comp_fx.append(round(fx_contrib, 2))
            comp_other.append(round(other_contrib, 2))
        else:
            comp_equity_usd.append(0)
            comp_fx.append(0)
            comp_other.append(0)

    # ── Deflação IPCA → twr_real_brl_pct, ipca_cagr_periodo_pct ────────
    # Calcula CAGR nominal BRL do período completo e deflaciona pelo IPCA BCB série 433.
    # Fallback: IPCA_CAGR_FALLBACK de config.py.
    twr_nominal_brl_cagr = None
    twr_real_brl_pct = None
    ipca_cagr_periodo_pct = None
    periodo_anos = None

    n_meses = len(twr_pct)
    if n_meses >= 6:
        acum_brl = 1.0
        for r in twr_pct:
            acum_brl *= (1 + r / 100)
        periodo_anos = round(n_meses / 12, 2)
        twr_nominal_brl_cagr = round((acum_brl ** (12 / n_meses) - 1) * 100, 2)

        # Buscar IPCA BCB série 433
        _ipca_cagr = None
        if dates:
            try:
                _d0 = datetime.strptime(dates[0] + "-01", "%Y-%m-%d")
                _d1 = datetime.strptime(dates[-1] + "-01", "%Y-%m-%d")
                _d1_last = (_d1.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
                _dt_ini = _d0.strftime("%d/%m/%Y")
                _dt_fim = _d1_last.strftime("%d/%m/%Y")
                _bcb_url = (
                    f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados"
                    f"?formato=json&dataInicial={_dt_ini}&dataFinal={_dt_fim}"
                )
                with _url_req.urlopen(_bcb_url, timeout=10) as _resp:
                    _ipca_raw = _json.loads(_resp.read().decode())
                _acum_ipca = 1.0
                _n_ipca = 0
                for _row in _ipca_raw:
                    try:
                        _acum_ipca *= (1 + float(_row["valor"]) / 100)
                        _n_ipca += 1
                    except (KeyError, ValueError):
                        pass
                if _n_ipca >= 6:
                    _ipca_cagr = round((_acum_ipca ** (12 / _n_ipca) - 1) * 100, 2)
                    print(f"  -> IPCA BCB: {_n_ipca} meses, CAGR={_ipca_cagr:.2f}% (API)")
                else:
                    raise ValueError(f"Apenas {_n_ipca} meses IPCA na API — usando fallback")
            except Exception as _e:
                print(f"  ⚠️ IPCA BCB falhou ({_e}), usando fallback")

        if _ipca_cagr is None:
            sys.path.insert(0, str(ROOT / "scripts"))
            try:
                from config import IPCA_CAGR_FALLBACK as _IPCA_FB
            except ImportError:
                _IPCA_FB = 6.14
            _ipca_cagr = _IPCA_FB
            print(f"  ⚠️ IPCA usando fallback={_ipca_cagr}%")

        ipca_cagr_periodo_pct = _ipca_cagr
        # Fórmula: twr_real = (1 + nominal/100) / (1 + ipca/100) - 1
        twr_real_brl_pct = round(
            ((1 + twr_nominal_brl_cagr / 100) / (1 + ipca_cagr_periodo_pct / 100) - 1) * 100, 2
        )
        print(f"  -> TWR nominal BRL CAGR: {twr_nominal_brl_cagr:.2f}% | IPCA CAGR: {ipca_cagr_periodo_pct:.2f}% | TWR real BRL: {twr_real_brl_pct:.2f}%")

    retornos = {
        "_generated": now_iso,
        "_source": "reconstruct_history.py → TWR (Modified Dietz simplificado)",
        "dates": dates,
        "twr_pct": twr_pct,
        "twr_usd_pct": twr_usd_pct,
        "acumulado_pct": acumulado,
        "acumulado_usd_pct": acumulado_usd,
        "decomposicao": {
            "equity_usd": comp_equity_usd,
            "fx": comp_fx,
            "rf_xp": comp_other,
        },
        "twr_real_brl_pct":      twr_real_brl_pct,
        "ipca_cagr_periodo_pct": ipca_cagr_periodo_pct,
        "periodo_anos":          periodo_anos,
    }

    retornos_path = ROOT / "dados" / "retornos_mensais.json"
    retornos_path.write_text(json.dumps(retornos, indent=2, ensure_ascii=False))
    print(f"  ✓ {retornos_path.relative_to(ROOT)} ({len(dates)} meses, BRL + USD)")

    # ── 2. rolling_metrics.json ──────────────────────────────────────
    WINDOW = 12
    # Selic meta atual — prioridade: dashboard_state.json > config.py SELIC_META_SNAPSHOT
    sys.path.insert(0, str(ROOT / "scripts"))
    try:
        from config import SELIC_META_SNAPSHOT as _SELIC_SNAPSHOT
    except ImportError:
        _SELIC_SNAPSHOT = 14.75  # last-resort se config.py não encontrado
    selic = _SELIC_SNAPSHOT
    state_path = ROOT / "dados" / "dashboard_state.json"
    if state_path.exists():
        try:
            state = json.loads(state_path.read_text())
            selic = state.get("macro", {}).get("selic_meta") or selic
        except Exception:
            pass

    # rf_mensal_brl_atual: taxa corrente (usada como fallback mês a mês)
    rf_mensal_brl_atual = ((1 + selic / 100) ** (1/12) - 1) * 100

    # ── Série CDI histórica: BCB série 4391 (CDI over acumulado mensal, % ao mês) ──
    # Formato resposta: [{data: "DD/MM/YYYY", valor: "X.XXXX"}, ...]
    # rf_cdi_series: {YYYY-MM: float} — taxa mensal em % ao mês
    rf_cdi_series: dict[str, float] = {}
    if dates:
        try:
            import urllib.request as _url_req2
            import json as _json2
            _d0_cdi = datetime.strptime(dates[0] + "-01", "%Y-%m-%d")
            _d1_cdi = datetime.strptime(dates[-1] + "-01", "%Y-%m-%d")
            _d1_cdi_last = (_d1_cdi.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            _dt_ini_cdi = _d0_cdi.strftime("%d/%m/%Y")
            _dt_fim_cdi = _d1_cdi_last.strftime("%d/%m/%Y")
            _bcb_cdi_url = (
                f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados"
                f"?formato=json&dataInicial={_dt_ini_cdi}&dataFinal={_dt_fim_cdi}"
            )
            with _url_req2.urlopen(_bcb_cdi_url, timeout=15) as _resp_cdi:
                _cdi_raw = _json2.loads(_resp_cdi.read().decode())
            for _row_cdi in _cdi_raw:
                try:
                    _dt_cdi = datetime.strptime(_row_cdi["data"].strip(), "%d/%m/%Y")
                    _ym_cdi = _dt_cdi.strftime("%Y-%m")
                    rf_cdi_series[_ym_cdi] = float(_row_cdi["valor"])
                except (KeyError, ValueError):
                    pass
            print(f"  -> CDI BCB série 4391: {len(rf_cdi_series)} meses carregados ({_dt_ini_cdi} → {_dt_fim_cdi})")
        except Exception as _e_cdi:
            print(f"  ⚠ CDI BCB série 4391 falhou ({_e_cdi}). Fallback: Selic meta constante {selic}%")

    # Para cada mês YYYY-MM, retorna a taxa CDI mensal (% ao mês).
    # Se o mês não constar na série (API falhou ou fora do range), usa rf_mensal_brl_atual.
    def _rf_mes(ym: str) -> float:
        return rf_cdi_series.get(ym, rf_mensal_brl_atual)

    # rf_mensal_brl mantido como alias do fallback (usado em Sortino e Sortino USD abaixo)
    rf_mensal_brl = rf_mensal_brl_atual

    # US T-Bill 3m ≈ Fed Funds — fonte: dashboard_state.json (atualizado via /macro-bcb)
    TBILL_ANUAL = None
    if state_path.exists():
        try:
            state = json.loads(state_path.read_text())
            TBILL_ANUAL = state.get("macro", {}).get("fed_funds")
        except Exception:
            pass
    if TBILL_ANUAL is None:
        from scripts.config import FED_FUNDS_SNAPSHOT
        TBILL_ANUAL = FED_FUNDS_SNAPSHOT
        print(f"  ⚠ T-Bill usando snapshot config.py: {TBILL_ANUAL}% (rode /macro-bcb para atualizar)")
    rf_mensal_usd = ((1 + TBILL_ANUAL / 100) ** (1/12) - 1) * 100

    roll_dates = []
    roll_sharpe_brl = []    # Sharpe BRL vs CDI
    roll_sharpe_usd = []    # Sharpe USD equity vs T-Bill
    roll_sortino = []
    roll_vol = []
    roll_maxdd = []

    for i in range(WINDOW - 1, len(twr_pct)):
        # ── Sharpe BRL (portfolio total vs CDI histórico mês a mês) ──
        # Para cada mês j da janela [i-WINDOW+1 .. i], usa CDI real do mês dates[j].
        # Fórmula: excess_j = twr_pct[j] - rf_cdi_series.get(dates[j], rf_mensal_brl_atual)
        win = twr_pct[i - WINDOW + 1: i + 1]
        win_dates = dates[i - WINDOW + 1: i + 1]
        excess = [v - _rf_mes(ym) for v, ym in zip(win, win_dates)]
        mean_ex = sum(excess) / WINDOW
        var_pop = sum((v - mean_ex) ** 2 for v in excess) / WINDOW
        std_pop = math.sqrt(var_pop)
        sharpe_brl = round(mean_ex / std_pop * math.sqrt(12), 3) if std_pop > 0 else 0

        # ── Sharpe USD (equity block vs T-Bill) ──
        win_usd = twr_usd_pct[i - WINDOW + 1: i + 1]
        win_usd_clean = [v for v in win_usd if v is not None]
        if len(win_usd_clean) >= WINDOW:
            excess_usd = [v - rf_mensal_usd for v in win_usd_clean]
            mean_ex_usd = sum(excess_usd) / len(win_usd_clean)
            var_usd = sum((v - mean_ex_usd) ** 2 for v in excess_usd) / len(win_usd_clean)
            std_usd = math.sqrt(var_usd)
            sharpe_usd = round(mean_ex_usd / std_usd * math.sqrt(12), 3) if std_usd > 0 else 0
        else:
            sharpe_usd = None

        # Sortino (BRL, downside deviation only)
        downside = [v for v in excess if v < 0]
        dd_sq = sum(v ** 2 for v in downside) / WINDOW
        dd_std = math.sqrt(dd_sq)
        sortino = round(mean_ex / dd_std * math.sqrt(12), 3) if dd_std > 0 else 0

        # Volatilidade anualizada (BRL, retornos totais)
        mean_ret = sum(win) / WINDOW
        var_ret = sum((v - mean_ret) ** 2 for v in win) / WINDOW
        vol = round(math.sqrt(var_ret) * math.sqrt(12), 3)

        # Max drawdown trailing (dentro da janela)
        cum_win = [1.0]
        for r in win:
            cum_win.append(cum_win[-1] * (1 + r / 100))
        peak = cum_win[0]
        max_dd = 0
        for c in cum_win[1:]:
            if c > peak:
                peak = c
            dd = (c - peak) / peak
            if dd < max_dd:
                max_dd = dd

        roll_dates.append(dates[i])
        roll_sharpe_brl.append(sharpe_brl)
        roll_sharpe_usd.append(sharpe_usd)
        roll_sortino.append(sortino)
        roll_vol.append(vol)
        roll_maxdd.append(round(max_dd * 100, 2))

    rolling = {
        "_generated": now_iso,
        "_source": "reconstruct_history.py",
        "window": WINDOW,
        # rf_brl_atual: taxa corrente (Selic meta do momento) — ainda útil como referência puntual
        "rf_brl_atual": {"taxa_anual": selic, "nome": "Selic meta (CDI) — taxa atual"},
        # rf_brl legado mantido por compatibilidade com dashboard (mesmo conteúdo que rf_brl_atual)
        "rf_brl": {"taxa_anual": selic, "nome": "Selic meta (CDI)"},
        # rf_brl_series: série histórica BCB 4391 usada no cálculo do Sharpe rolling.
        # {YYYY-MM: valor_pct_ao_mes}. Vazio se API falhou (Sharpe usou fallback constante).
        "rf_brl_series": rf_cdi_series,
        "rf_usd": {"taxa_anual": TBILL_ANUAL, "nome": "US T-Bill 3m (≈ Fed Funds)"},
        "dates": roll_dates,
        "sharpe_brl": roll_sharpe_brl,
        "sharpe_usd": roll_sharpe_usd,
        "sortino": roll_sortino,
        "volatilidade": roll_vol,
        "max_dd": roll_maxdd,
    }

    # ── Information Ratio vs VWRA.L ─────────────────────────────────
    ir_block = _compute_information_ratio(dates, twr_usd_pct)
    if ir_block is not None:
        rolling["information_ratio"] = ir_block
        itd = ir_block.get("itd", {})
        print(
            f"  ✓ IR vs VWRA.L: ITD IR={itd.get('ir'):.4f} | "
            f"TE={itd.get('tracking_error_pct'):.2f}% | "
            f"AR anual={itd.get('active_return_anual_pct'):.2f}% | "
            f"N={itd.get('n_meses')} meses"
        )
    else:
        print("  ⚠ Information Ratio omitido (yfinance falhou ou dados insuficientes)")

    rolling_path = ROOT / "dados" / "rolling_metrics.json"
    rolling_path.write_text(json.dumps(rolling, indent=2, ensure_ascii=False))
    print(f"  ✓ {rolling_path.relative_to(ROOT)} ({len(roll_dates)} pontos, dual Sharpe BRL+USD)")

    # ── 3. portfolio_summary.json ────────────────────────────────────
    first = rows[0]
    last = rows[-1]
    pat_inicio = first["patrimonio_brl"]
    pat_fim = last["patrimonio_brl"]

    # CAGR via TWR acumulado (não via patrimônio bruto, que inclui aportes)
    twr_total = cum - 1  # retorno acumulado TWR
    d0 = datetime.strptime(first["data"][:10], "%Y-%m-%d")
    d1 = datetime.strptime(last["data"][:10], "%Y-%m-%d")
    anos = (d1 - d0).days / 365.25
    cagr_twr = ((1 + twr_total) ** (1 / anos) - 1) * 100 if anos > 0 else 0

    # Max drawdown histórico
    cum_series = [1.0]
    dd_series = []
    for r in twr_pct:
        cum_series.append(cum_series[-1] * (1 + r / 100))
    peak = cum_series[0]
    max_dd_val = 0
    max_dd_date = dates[0] if dates else ""
    for j, c in enumerate(cum_series[1:]):
        if c > peak:
            peak = c
        dd = (c - peak) / peak
        dd_series.append(dd)
        if dd < max_dd_val:
            max_dd_val = dd
            max_dd_date = dates[j] if j < len(dates) else ""

    # Melhor/pior mês
    best_idx = twr_pct.index(max(twr_pct))
    worst_idx = twr_pct.index(min(twr_pct))
    pos_months = sum(1 for r in twr_pct if r > 0)
    neg_months = sum(1 for r in twr_pct if r <= 0)

    # Total aportado
    total_aportes = sum(r.get("aporte_brl", 0) for r in rows)

    summary = {
        "_generated": now_iso,
        "_source": "reconstruct_history.py",
        "periodo": {
            "inicio": first["data"][:10],
            "fim": last["data"][:10],
            "meses": len(twr_pct),
            "anos": round(anos, 2),
        },
        "patrimonio": {
            "inicio_brl": pat_inicio,
            "fim_brl": pat_fim,
            "total_aportes_brl": round(total_aportes, 2),
            "ganho_mercado_brl": round(pat_fim - pat_inicio - total_aportes, 2),
        },
        "retorno_twr": {
            "acumulado_pct": round(twr_total * 100, 2),
            "cagr_pct": round(cagr_twr, 2),
            "media_mensal_pct": round(sum(twr_pct) / len(twr_pct), 2) if twr_pct else 0,
        },
        "risco": {
            "max_drawdown_pct": round(max_dd_val * 100, 2),
            "max_drawdown_date": max_dd_date,
            "volatilidade_anual_pct": round(math.sqrt(sum((r - sum(twr_pct)/len(twr_pct))**2 for r in twr_pct) / len(twr_pct)) * math.sqrt(12), 2) if twr_pct else 0,
        },
        "distribuicao": {
            "melhor_mes": {"date": dates[best_idx], "twr_pct": twr_pct[best_idx]},
            "pior_mes": {"date": dates[worst_idx], "twr_pct": twr_pct[worst_idx]},
            "meses_positivos": pos_months,
            "meses_negativos": neg_months,
            "hit_rate_pct": round(pos_months / len(twr_pct) * 100, 1) if twr_pct else 0,
        },
    }

    summary_path = ROOT / "dados" / "portfolio_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False))
    print(f"  ✓ {summary_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
