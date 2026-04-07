#!/usr/bin/env python3
"""
IBKR Transaction Analysis — U5947683
Período: 2021-04-08 a 2026-03-31
Extrai: lotes TLH, dividendos, aportes, histórico de posições, P&L realizado
"""

import csv
import json
from datetime import datetime, date
from collections import defaultdict
from pathlib import Path

# ── Configurações ─────────────────────────────────────────────────────────────
CSV_PATH = Path(__file__).parent / "U5947683.TRANSACTIONS.20210408.20260331.csv"
OUTPUT_DIR = Path(__file__).parent / "backtest_output"
OUTPUT_DIR.mkdir(exist_ok=True)

CAMBIO_REF = 5.25  # referência carteira.md

# Mapeamento símbolo → ETF canônico
SYMBOL_MAP = {
    "SWRD": "SWRD",
    "WRDUSWUSD": "SWRD",       # UBS MSCI World (vendido, predecessor)
    "SPDR": "SWRD",
    "AVGS": "AVGS",
    "AVDV": "AVDV",
    "AVUV": "AVUV",
    "AVES": "AVES",
    "EIMI": "EIMI",
    "DGS": "DGS",
    "USSC": "USSC",
    "JPGL": "JPGL",
    "IWVL": "IWVL",
    "F50A": "F50A",             # AM Prime Global (vendido)
    "COIN": "COIN",             # Coinbase (vendido)
}

# ETFs transitórios (não comprar mais)
TRANSITORIOS = {"AVDV", "AVUV", "AVES", "EIMI", "DGS", "USSC", "IWVL", "WRDUSWUSD", "F50A"}
# ETFs alvo ativos
ALVOS = {"SWRD", "AVGS", "AVEM"}

# ── Parser ────────────────────────────────────────────────────────────────────
def parse_csv(path):
    trades, dividends, deposits, others = [], [], [], []

    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row or row[0] != "Transaction History" or row[1] != "Data":
                continue
            # Colunas: Date, Account, Description, Transaction Type, Symbol,
            #          Quantity, Price, Price Currency, Gross Amount, Commission, Net Amount
            if len(row) < 12:
                continue
            _, _, date_str, account, desc, tx_type, symbol, qty, price, price_ccy, gross, comm, net = row[:13]

            try:
                dt = datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
            except ValueError:
                continue

            def to_float(s):
                s = s.strip().replace(",", "")
                return float(s) if s and s not in ("-", "") else 0.0

            qty_f   = to_float(qty)
            price_f = to_float(price)
            gross_f = to_float(gross)
            comm_f  = to_float(comm)
            net_f   = to_float(net)
            sym     = symbol.strip()
            tx      = tx_type.strip()

            record = dict(date=dt, desc=desc.strip(), tx_type=tx, symbol=sym,
                          qty=qty_f, price=price_f, price_ccy=price_ccy.strip(),
                          gross=gross_f, comm=comm_f, net=net_f)

            if tx in ("Buy", "Sell"):
                trades.append(record)
            elif "Dividend" in tx or "Payment in Lieu" in tx or "Foreign Tax Withholding" in tx:
                dividends.append(record)
            elif tx == "Deposit" or "Electronic Fund Transfer" in desc:
                deposits.append(record)
            else:
                others.append(record)

    return trades, dividends, deposits, others


# ── Análise de Lotes (TLH) ────────────────────────────────────────────────────
def build_lots(trades):
    """
    FIFO por símbolo. Retorna lotes abertos e ganhos realizados.
    """
    open_lots = defaultdict(list)   # sym → [(date, qty, cost_per_share)]
    realized  = []

    for t in sorted(trades, key=lambda x: x["date"]):
        sym = t["symbol"]
        if t["qty"] > 0:  # Buy
            cost = t["price"]  # preço por share (sem comissão — gross/qty = price)
            open_lots[sym].append({"date": t["date"], "qty": t["qty"],
                                   "cost_per_share": cost, "currency": t["price_ccy"]})
        elif t["qty"] < 0:  # Sell
            sell_qty = abs(t["qty"])
            sell_price = abs(t["net"]) / sell_qty if sell_qty else 0
            remaining = sell_qty
            while remaining > 0 and open_lots[sym]:
                lot = open_lots[sym][0]
                if lot["qty"] <= remaining:
                    # Fechar lote inteiro
                    gain = (sell_price - lot["cost_per_share"]) * lot["qty"]
                    realized.append({"date": t["date"], "symbol": sym,
                                     "qty_sold": lot["qty"],
                                     "cost_per_share": round(lot["cost_per_share"], 4),
                                     "sell_price": round(sell_price, 4),
                                     "gain_usd": round(gain, 2),
                                     "lot_date": lot["date"],
                                     "currency": lot["currency"]})
                    remaining -= lot["qty"]
                    open_lots[sym].pop(0)
                else:
                    # Fechar parcialmente
                    gain = (sell_price - lot["cost_per_share"]) * remaining
                    realized.append({"date": t["date"], "symbol": sym,
                                     "qty_sold": remaining,
                                     "cost_per_share": round(lot["cost_per_share"], 4),
                                     "sell_price": round(sell_price, 4),
                                     "gain_usd": round(gain, 2),
                                     "lot_date": lot["date"],
                                     "currency": lot["currency"]})
                    lot["qty"] -= remaining
                    remaining = 0

    return open_lots, realized


# ── Análise de Dividendos ─────────────────────────────────────────────────────
def analyze_dividends(dividends):
    by_symbol = defaultdict(lambda: {"gross": 0.0, "tax": 0.0, "net": 0.0, "events": 0})
    by_year   = defaultdict(lambda: {"gross": 0.0, "tax": 0.0, "net": 0.0})

    for d in dividends:
        sym  = d["symbol"] or "?"
        year = d["date"].year
        amt  = d["net"]

        if amt > 0:
            by_symbol[sym]["gross"] += amt
            by_symbol[sym]["net"]   += amt
            by_symbol[sym]["events"] += 1
            by_year[year]["gross"]  += amt
            by_year[year]["net"]    += amt
        else:
            by_symbol[sym]["tax"]   += amt
            by_symbol[sym]["net"]   += amt
            by_year[year]["tax"]    += amt
            by_year[year]["net"]    += amt

    return by_symbol, by_year


# ── Análise de Aportes ────────────────────────────────────────────────────────
def analyze_deposits(deposits):
    by_year = defaultdict(float)
    total   = 0.0
    items   = []
    for d in deposits:
        if d["net"] > 0:
            by_year[d["date"].year] += d["net"]
            total += d["net"]
            items.append({"date": d["date"], "amount_usd": round(d["net"], 2)})
    return items, by_year, total


# ── Gerar tlh_lotes.json ──────────────────────────────────────────────────────
def generate_tlh_lotes(open_lots):
    """Formato compatível com o script TLH existente."""
    lotes = {}
    for sym, lots in open_lots.items():
        if not lots:
            continue
        lotes[sym] = []
        for lot in lots:
            lotes[sym].append({
                "data_compra": lot["date"].isoformat(),
                "quantidade": round(lot["qty"], 4),
                "preco_medio_usd": round(lot["cost_per_share"], 4),
                "moeda": lot.get("currency", "USD")
            })
    return lotes


# ── Print helpers ─────────────────────────────────────────────────────────────
def fmt(v, decimals=2): return f"{v:,.{decimals}f}"


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("=" * 70)
    print("IBKR TRANSACTION ANALYSIS — U5947683")
    print("Período: 2021-04-08 → 2026-03-31")
    print("=" * 70)

    trades, dividends, deposits, others = parse_csv(CSV_PATH)
    print(f"\nTotal de linhas processadas: {len(trades)+len(dividends)+len(deposits)+len(others)}")
    print(f"  Trades (buy/sell): {len(trades)}")
    print(f"  Dividendos/PIL:    {len(dividends)}")
    print(f"  Depósitos:         {len(deposits)}")
    print(f"  Outros:            {len(others)}")

    # ── 1. LOTES ABERTOS ─────────────────────────────────────────────────────
    open_lots, realized = build_lots(trades)

    print("\n" + "─" * 70)
    print("1. LOTES ABERTOS (posições atuais por símbolo)")
    print("─" * 70)

    total_custo_usd = 0.0
    lotes_summary = []
    for sym in sorted(open_lots.keys()):
        lots = open_lots[sym]
        if not lots:
            continue
        total_qty  = sum(l["qty"] for l in lots)
        total_cost = sum(l["qty"] * l["cost_per_share"] for l in lots)
        avg_cost   = total_cost / total_qty if total_qty else 0
        oldest     = min(l["date"] for l in lots)
        newest     = max(l["date"] for l in lots)
        n_lots     = len(lots)
        status     = "TRANSITÓRIO" if sym in TRANSITORIOS else ("ALVO" if sym in ALVOS else "")
        total_custo_usd += total_cost
        lotes_summary.append((sym, total_qty, avg_cost, total_cost, oldest, newest, n_lots, status))
        print(f"  {sym:<12} {total_qty:>10.2f} shares  |  "
              f"custo médio ${avg_cost:>8.4f}  |  "
              f"custo total ${total_cost:>9.2f}  |  "
              f"{n_lots} lote(s) [{oldest} → {newest}]  {status}")

    print(f"\n  Custo total portfólio IBKR: ${fmt(total_custo_usd)} USD "
          f"(≈ R$ {fmt(total_custo_usd * CAMBIO_REF)})")

    # ── 2. P&L REALIZADO ──────────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("2. P&L REALIZADO (vendas — ganhos e perdas por símbolo)")
    print("─" * 70)

    realized_by_sym = defaultdict(float)
    for r in realized:
        realized_by_sym[r["symbol"]] += r["gain_usd"]
    total_realized = sum(realized_by_sym.values())

    for sym, gain in sorted(realized_by_sym.items(), key=lambda x: -abs(x[1])):
        flag = "✓ LUCRO" if gain > 0 else "✗ PERDA"
        print(f"  {sym:<12}  {flag}  ${fmt(gain)}")
    print(f"\n  Total P&L realizado: ${fmt(total_realized)} USD")
    if total_realized > 0:
        ir_estimado = total_realized * 0.15
        print(f"  IR estimado (15% flat): ${fmt(ir_estimado)} USD ≈ R$ {fmt(ir_estimado * CAMBIO_REF)}")

    # ── 3. DIVIDENDOS ─────────────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("3. DIVIDENDOS & JUROS (por símbolo, acumulado 5 anos)")
    print("─" * 70)

    by_sym, by_year = analyze_dividends(dividends)
    total_div_gross = sum(v["gross"] for v in by_sym.values())
    total_div_tax   = sum(v["tax"] for v in by_sym.values())
    total_div_net   = sum(v["net"] for v in by_sym.values())

    for sym, data in sorted(by_sym.items(), key=lambda x: -x[1]["gross"]):
        wht_pct = abs(data["tax"]) / data["gross"] * 100 if data["gross"] else 0
        print(f"  {sym:<8} gross ${fmt(data['gross']):>8}  |  "
              f"WHT ${fmt(abs(data['tax'])):>7} ({wht_pct:.0f}%)  |  "
              f"net ${fmt(data['net']):>8}  |  {data['events']} eventos")

    print(f"\n  TOTAL  gross ${fmt(total_div_gross)}  |  WHT ${fmt(abs(total_div_tax))} "
          f"({abs(total_div_tax)/total_div_gross*100:.0f}%)  |  net ${fmt(total_div_net)}")
    print(f"  WHT pago ≈ R$ {fmt(abs(total_div_tax)*CAMBIO_REF)} — recuperável via GCAP/DARF anual")

    print("\n  Por ano:")
    for yr in sorted(by_year.keys()):
        d = by_year[yr]
        print(f"    {yr}: gross ${fmt(d['gross']):>7}  |  net ${fmt(d['net']):>7}")

    # ── 4. APORTES (DEPÓSITOS) ────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("4. APORTES — DEPÓSITOS (USD recebidos na IBKR)")
    print("─" * 70)

    dep_items, dep_by_year, dep_total = analyze_deposits(deposits)
    for yr in sorted(dep_by_year.keys()):
        print(f"  {yr}: ${fmt(dep_by_year[yr]):>10} USD ≈ R$ {fmt(dep_by_year[yr]*CAMBIO_REF):>12}")
    print(f"\n  Total 2021-2026: ${fmt(dep_total)} USD ≈ R$ {fmt(dep_total*CAMBIO_REF)}")
    print(f"  Média mensal:    ${fmt(dep_total/60):>8} USD ≈ R$ {fmt(dep_total/60*CAMBIO_REF)}")

    # ── 5. TLH — LOTES COM MAIOR POTENCIAL ───────────────────────────────────
    print("\n" + "─" * 70)
    print("5. TLH — LOTES TRANSITÓRIOS (análise de custo vs valor atual estimado)")
    print("─" * 70)
    print("  Atenção: todos os transitórios estão com LUCRO (política: não vender).")
    print("  Lotes abaixo ordenados por custo total (maior exposição primeiro):\n")

    transitorio_lots = [(sym, lots) for sym, lots in open_lots.items()
                        if sym in TRANSITORIOS and lots]
    transitorio_lots.sort(key=lambda x: -sum(l["qty"]*l["cost_per_share"] for l in x[1]))

    for sym, lots in transitorio_lots:
        total_qty  = sum(l["qty"] for l in lots)
        total_cost = sum(l["qty"] * l["cost_per_share"] for l in lots)
        print(f"  {sym}: {total_qty:.2f} shares, custo ${fmt(total_cost)}, {len(lots)} lote(s)")
        for lot in sorted(lots, key=lambda x: x["date"]):
            print(f"    → {lot['date']}  {lot['qty']:.4f} sh @ ${lot['cost_per_share']:.4f}")

    # ── 6. HISTÓRICO DE TRADES POR ETF ───────────────────────────────────────
    print("\n" + "─" * 70)
    print("6. HISTÓRICO DE COMPRAS POR ETF ALVO")
    print("─" * 70)

    for sym in ["SWRD", "AVGS", "AVEM", "JPGL"]:
        sym_trades = [t for t in trades if t["symbol"] == sym]
        buys  = [t for t in sym_trades if t["qty"] > 0]
        sells = [t for t in sym_trades if t["qty"] < 0]
        if buys or sells:
            total_buy_val  = sum(abs(t["net"]) for t in buys)
            total_sell_val = sum(abs(t["net"]) for t in sells)
            print(f"  {sym}: {len(buys)} compras (${fmt(total_buy_val)}) | "
                  f"{len(sells)} vendas (${fmt(total_sell_val)})")

    # ── 7. ESTATE TAX — EXPOSIÇÃO US-LISTED ──────────────────────────────────
    print("\n" + "─" * 70)
    print("7. ESTATE TAX — EXPOSIÇÃO US-LISTED (ETFs americanos ainda em carteira)")
    print("─" * 70)

    us_listed = {"AVUV", "AVDV", "AVES", "DGS", "COIN", "USSC"}
    us_exposure = 0.0
    for sym in us_listed:
        if sym in open_lots and open_lots[sym]:
            lots = open_lots[sym]
            total_qty  = sum(l["qty"] for l in lots)
            total_cost = sum(l["qty"] * l["cost_per_share"] for l in lots)
            us_exposure += total_cost
            print(f"  {sym}: {total_qty:.2f} shares, custo ${fmt(total_cost)}")

    print(f"\n  Exposição US-listed total: ${fmt(us_exposure)} USD")
    if us_exposure > 60000:
        estate_tax = (us_exposure - 60000) * 0.40
        print(f"  ⚠ ACIMA do threshold $60k → estate tax estimado: ${fmt(estate_tax)}")
    else:
        print(f"  ✓ Abaixo do threshold $60k — sem estate tax")

    # ── 8. SALVAR OUTPUTS ─────────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("8. SALVANDO OUTPUTS")
    print("─" * 70)

    # tlh_lotes.json
    tlh_path = Path(__file__).parent.parent / "data" / "tlh_lotes.json"
    tlh_path.parent.mkdir(exist_ok=True)
    tlh_data = generate_tlh_lotes(open_lots)
    with open(tlh_path, "w", encoding="utf-8") as f:
        json.dump(tlh_data, f, indent=2, default=str)
    print(f"  ✓ tlh_lotes.json → {tlh_path}")

    # ibkr_lotes.json (completo, com status)
    lotes_full = {}
    for sym, lots in open_lots.items():
        if lots:
            status = "transitório" if sym in TRANSITORIOS else ("alvo" if sym in ALVOS else "outro")
            lotes_full[sym] = {
                "status": status,
                "lotes": [{"data": l["date"].isoformat(), "qty": round(l["qty"], 4),
                            "custo_por_share": round(l["cost_per_share"], 4)} for l in lots],
                "total_qty": round(sum(l["qty"] for l in lots), 4),
                "custo_total_usd": round(sum(l["qty"]*l["cost_per_share"] for l in lots), 2)
            }
    lotes_path = OUTPUT_DIR / "ibkr_lotes.json"
    with open(lotes_path, "w", encoding="utf-8") as f:
        json.dump(lotes_full, f, indent=2, default=str)
    print(f"  ✓ ibkr_lotes.json → {lotes_path}")

    # ibkr_dividendos.json
    div_out = {
        "total_gross_usd": round(total_div_gross, 2),
        "total_wht_usd": round(abs(total_div_tax), 2),
        "total_net_usd": round(total_div_net, 2),
        "por_simbolo": {k: {"gross": round(v["gross"],2), "wht": round(abs(v["tax"]),2),
                            "net": round(v["net"],2), "eventos": v["events"]}
                        for k, v in by_sym.items()},
        "por_ano": {str(yr): {"gross": round(d["gross"],2), "net": round(d["net"],2)}
                    for yr, d in by_year.items()}
    }
    div_path = OUTPUT_DIR / "ibkr_dividendos.json"
    with open(div_path, "w", encoding="utf-8") as f:
        json.dump(div_out, f, indent=2)
    print(f"  ✓ ibkr_dividendos.json → {div_path}")

    # ibkr_aportes.json
    dep_out = {
        "total_usd": round(dep_total, 2),
        "por_ano": {str(yr): round(v, 2) for yr, v in dep_by_year.items()},
        "depositos": [{"data": d["date"].isoformat(), "usd": d["amount_usd"]} for d in dep_items]
    }
    dep_path = OUTPUT_DIR / "ibkr_aportes.json"
    with open(dep_path, "w", encoding="utf-8") as f:
        json.dump(dep_out, f, indent=2)
    print(f"  ✓ ibkr_aportes.json → {dep_path}")

    # ibkr_realized_pnl.json
    real_path = OUTPUT_DIR / "ibkr_realized_pnl.json"
    with open(real_path, "w", encoding="utf-8") as f:
        json.dump({"total_usd": round(total_realized, 2),
                   "por_simbolo": {k: round(v, 2) for k, v in realized_by_sym.items()},
                   "detalhado": [{**r, "date": r["date"].isoformat(),
                                  "lot_date": r["lot_date"].isoformat()} for r in realized]},
                  f, indent=2)
    print(f"  ✓ ibkr_realized_pnl.json → {real_path}")

    print("\n" + "=" * 70)
    print("ANÁLISE CONCLUÍDA")
    print("=" * 70)


if __name__ == "__main__":
    main()
