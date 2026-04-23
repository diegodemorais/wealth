#!/usr/bin/env python3
"""
tlh_monitor.py — Tax-Loss Harvesting Monitor

Detecta oportunidades de TLH na carteira de Diego Morais.
Lê lotes de data/tlh_lotes.json, busca preços atuais e identifica
lotes com perda ≥ threshold, calculando economia fiscal potencial.

Uso:
    python3 scripts/tlh_monitor.py                    # scan com threshold padrão (-5%)
    python3 scripts/tlh_monitor.py --threshold -0.10  # só lotes com ≥10% de perda
    python3 scripts/tlh_monitor.py --all              # mostrar todos os lotes (ganho e perda)
    python3 scripts/tlh_monitor.py --etf AVUV         # focar em ETF específico

Regras TLH (Lei 14.754/2023 — Brasil):
    - Sem wash sale rule: pode recomprar imediatamente após vender
    - Alíquota: 15% flat sobre ganho de capital em ETFs no exterior
    - Prejuízo realizado compensa ganhos futuros (sem prazo de vencimento)
    - Duplo benefício em transitórios US-listed: TLH + migração UCITS (↓ estate tax risk)

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import argparse
import json
import sys
from datetime import datetime, date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from config import IR_ALIQUOTA

# ── Paths ──────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).parent.parent
LOTES_FILE = ROOT / "data" / "tlh_lotes.json"

# ── Config ─────────────────────────────────────────────────────────────────────

# Mapa ETF → ticker yfinance
TICKER_MAP = {
    "SWRD":      "SWRD.L",
    "EIMI":      "EIMI.L",
    "AVGS":      "AVGS.L",
    "AVEM":      "AVEM.L",
    "IWVL":      "IWVL.L",
    "USSC":      "USSC.L",
    "AVUV":      "AVUV",
    "AVDV":      "AVDV",
    "AVES":      "AVES",
    "DGS":       "DGS",
    "JPGL":      "JPGL.L",
}

# ETFs que ainda compramos (target) — TLH aqui = recomprar imediatamente
TARGET_ETFS = {"SWRD", "AVGS", "AVEM"}

# ETFs transitórios — TLH aqui = duplo benefício (perda fiscal + migração UCITS)
TRANSITORIOS = {"EIMI", "USSC", "IWVL", "AVDV", "AVUV", "DGS", "AVES", "JPGL"}

# Substituto UCITS para cada transitório (para recompra pós-TLH)
SUBSTITUTO_UCITS = {
    "EIMI":  "AVEM.L",
    "AVES":  "AVEM.L",
    "DGS":   "AVEM.L",
    "AVUV":  "AVGS.L",
    "AVDV":  "AVGS.L",
    "USSC":  "AVGS.L",
    "IWVL":  "SWRD.L",
    "JPGL":  "AVGS.L",
}

# Alíquota IR sobre ganho de capital (Lei 14.754/2023) — fonte: config.py
ALIQUOTA_IR = IR_ALIQUOTA

# Threshold de perda mínima para alertar (% negativo)
DEFAULT_THRESHOLD = -0.05  # -5%

# Economia fiscal mínima para considerar material (R$)
THRESHOLD_MATERIAL_BRL = 5_000.0


# ── PTAX (delegado a fx_utils) ────────────────────────────────────────────────

from fx_utils import get_ptax


# ── Preços ─────────────────────────────────────────────────────────────────────

def get_prices(etfs: list[str]) -> dict[str, float]:
    """Busca preços atuais via yfinance. Retorna {etf: preco_usd}."""
    try:
        import yfinance as yf
    except ImportError:
        print("❌ yfinance não instalado no venv.", file=sys.stderr)
        sys.exit(1)

    prices = {}
    tickers_needed = {etf: TICKER_MAP.get(etf) for etf in etfs if TICKER_MAP.get(etf)}

    for etf, ticker in tickers_needed.items():
        try:
            info = yf.Ticker(ticker).fast_info
            price = info.last_price
            if price and price > 0:
                prices[etf] = float(price)
        except Exception as e:
            print(f"⚠️  Preço não disponível para {etf} ({ticker}): {e}", file=sys.stderr)

    return prices


# ── Análise de lotes ───────────────────────────────────────────────────────────

def analisar_lotes(lotes_data: dict, prices: dict, ptax: float,
                   threshold: float, mostrar_todos: bool,
                   filtro_etf: str | None) -> dict:
    """
    Analisa todos os lotes e retorna estrutura com oportunidades TLH.
    """
    resultado = {
        "data": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "ptax": ptax,
        "threshold_pct": threshold,
        "oportunidades": [],      # lotes com perda ≥ threshold
        "todos_lotes": [],        # todos os lotes (se --all)
        "resumo_por_etf": {},
        "economia_total_usd": 0.0,
        "economia_total_brl": 0.0,
        "material": False,
    }

    for etf, lotes in lotes_data.items():
        if filtro_etf and etf.upper() != filtro_etf.upper():
            continue
        if etf not in prices:
            continue

        preco_atual = prices[etf]
        eh_transitorio = etf in TRANSITORIOS
        substituto = SUBSTITUTO_UCITS.get(etf, TICKER_MAP.get(etf, "—"))

        resumo_etf = {
            "etf": etf,
            "preco_atual_usd": preco_atual,
            "tipo": "transitório" if eh_transitorio else "target",
            "substituto_ucits": substituto,
            "lotes_com_perda": 0,
            "perda_total_usd": 0.0,
            "economia_ir_usd": 0.0,
            "economia_ir_brl": 0.0,
        }

        for lote in lotes:
            qtd = lote.get("quantidade", 0)
            pm_usd = lote.get("preco_medio_usd", 0)
            data_compra = lote.get("data_compra", "—")

            if qtd <= 0 or pm_usd <= 0:
                continue

            ganho_pct = (preco_atual - pm_usd) / pm_usd
            ganho_usd = (preco_atual - pm_usd) * qtd
            valor_usd = preco_atual * qtd

            info_lote = {
                "etf": etf,
                "data_compra": data_compra,
                "quantidade": qtd,
                "preco_compra_usd": pm_usd,
                "preco_atual_usd": preco_atual,
                "ganho_pct": ganho_pct,
                "ganho_usd": ganho_usd,
                "valor_atual_usd": valor_usd,
                "eh_transitorio": eh_transitorio,
                "substituto_ucits": substituto,
                "economia_ir_usd": abs(ganho_usd) * ALIQUOTA_IR if ganho_usd < 0 else 0,
                "economia_ir_brl": abs(ganho_usd) * ALIQUOTA_IR * ptax if ganho_usd < 0 else 0,
            }

            if mostrar_todos:
                resultado["todos_lotes"].append(info_lote)

            if ganho_pct <= threshold:
                resultado["oportunidades"].append(info_lote)
                resumo_etf["lotes_com_perda"] += 1
                resumo_etf["perda_total_usd"] += ganho_usd
                resumo_etf["economia_ir_usd"] += info_lote["economia_ir_usd"]
                resumo_etf["economia_ir_brl"] += info_lote["economia_ir_brl"]
                resultado["economia_total_usd"] += info_lote["economia_ir_usd"]
                resultado["economia_total_brl"] += info_lote["economia_ir_brl"]

        if resumo_etf["lotes_com_perda"] > 0:
            resultado["resumo_por_etf"][etf] = resumo_etf

    resultado["material"] = resultado["economia_total_brl"] >= THRESHOLD_MATERIAL_BRL
    resultado["oportunidades"].sort(key=lambda x: x["ganho_pct"])

    return resultado


# ── Output ─────────────────────────────────────────────────────────────────────

def print_relatorio(r: dict, mostrar_todos: bool) -> None:
    ptax = r["ptax"]
    threshold_pct = r["threshold_pct"] * 100

    print(f"\n{'='*65}")
    print(f"  TLH Monitor — {r['data']}  |  PTAX: R$ {ptax:.4f}")
    print(f"  Threshold: {threshold_pct:+.0f}%  |  Material: ≥ R$ {THRESHOLD_MATERIAL_BRL:,.0f}")
    print(f"{'='*65}\n")

    # ── Status geral ──
    eco_brl = r["economia_total_brl"]
    eco_usd = r["economia_total_usd"]
    n_oport = len(r["oportunidades"])

    if n_oport == 0:
        print("✅  Nenhuma oportunidade TLH acima do threshold — todos os lotes com ganho.\n")
    else:
        status = "🔴 MATERIAL" if r["material"] else "🟡 Abaixo do mínimo material"
        print(f"{'─'*65}")
        print(f"  STATUS: {status}")
        print(f"  Lotes com perda: {n_oport}")
        print(f"  Economia IR potencial: US$ {eco_usd:,.0f}  |  R$ {eco_brl:,.0f}")
        print(f"{'─'*65}\n")

        # ── Resumo por ETF ──
        print("  Por ETF:\n")
        print(f"  {'ETF':<8} {'Tipo':<12} {'Lotes':<6} {'Perda USD':>12} {'Econ. IR BRL':>14} {'Substituto UCITS'}")
        print(f"  {'─'*8} {'─'*12} {'─'*6} {'─'*12} {'─'*14} {'─'*16}")
        for etf, s in sorted(r["resumo_por_etf"].items(), key=lambda x: x[1]["perda_total_usd"]):
            print(f"  {etf:<8} {s['tipo']:<12} {s['lotes_com_perda']:<6} "
                  f"US$ {s['perda_total_usd']:>8,.0f}  R$ {s['economia_ir_brl']:>10,.0f}  {s['substituto_ucits']}")

        # ── Lotes individuais ──
        print(f"\n  Lotes com perda (ordenados por maior perda):\n")
        print(f"  {'ETF':<6} {'Compra':<12} {'Qtd':>7} {'PM USD':>8} {'Atual':>8} {'Var%':>7} {'Perda USD':>10} {'Econ. IR BRL':>13}")
        print(f"  {'─'*6} {'─'*12} {'─'*7} {'─'*8} {'─'*8} {'─'*7} {'─'*10} {'─'*13}")
        for l in r["oportunidades"]:
            print(f"  {l['etf']:<6} {l['data_compra']:<12} {l['quantidade']:>7.1f} "
                  f"{l['preco_compra_usd']:>8.2f} {l['preco_atual_usd']:>8.2f} "
                  f"{l['ganho_pct']:>+7.1%} {l['ganho_usd']:>10,.0f} "
                  f"R$ {l['economia_ir_brl']:>9,.0f}")

        # ── Instruções TLH ──
        print(f"\n{'─'*65}")
        print("  Como executar (sem wash sale rule no Brasil):")
        print("  1. Vender o lote no IBKR → realizar a perda fiscal")
        print("  2. Recomprar imediatamente via ETF equivalente (ver 'Substituto UCITS')")
        print("  3. Para transitórios: duplo benefício — perda fiscal + migração UCITS")
        print("  4. Registrar a perda para compensar ganhos futuros no DARF (código 6015)")
        print(f"{'─'*65}")

    # ── Todos os lotes (--all) ──
    if mostrar_todos and r["todos_lotes"]:
        print(f"\n  {'─'*65}")
        print(f"  TODOS OS LOTES:\n")
        print(f"  {'ETF':<6} {'Compra':<12} {'Qtd':>7} {'PM USD':>8} {'Atual':>8} {'Var%':>7} {'P&L USD':>10}")
        print(f"  {'─'*6} {'─'*12} {'─'*7} {'─'*8} {'─'*8} {'─'*7} {'─'*10}")
        for l in sorted(r["todos_lotes"], key=lambda x: (x["etf"], x["data_compra"])):
            flag = " 🔴" if l["ganho_pct"] <= r["threshold_pct"] else ""
            print(f"  {l['etf']:<6} {l['data_compra']:<12} {l['quantidade']:>7.1f} "
                  f"{l['preco_compra_usd']:>8.2f} {l['preco_atual_usd']:>8.2f} "
                  f"{l['ganho_pct']:>+7.1%} {l['ganho_usd']:>10,.0f}{flag}")

    print()


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="TLH Monitor — detecta oportunidades de tax-loss harvesting"
    )
    parser.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD,
                        help=f"Perda mínima para alertar (default: {DEFAULT_THRESHOLD*100:.0f}%%)")
    parser.add_argument("--all", action="store_true",
                        help="Mostrar todos os lotes (ganho e perda)")
    parser.add_argument("--etf", type=str, default=None,
                        help="Filtrar por ETF específico (ex: AVUV)")
    parser.add_argument("--json", action="store_true",
                        help="Output em JSON")
    args = parser.parse_args()

    # Carregar lotes
    if not LOTES_FILE.exists():
        print(f"❌ Arquivo não encontrado: {LOTES_FILE}", file=sys.stderr)
        sys.exit(1)

    with open(LOTES_FILE) as f:
        lotes_data = json.load(f)

    # ETFs com lotes válidos
    etfs_ativos = [
        etf for etf, lotes in lotes_data.items()
        if any(l.get("quantidade", 0) > 0 for l in lotes)
    ]

    if args.etf:
        etfs_ativos = [e for e in etfs_ativos if e.upper() == args.etf.upper()]
        if not etfs_ativos:
            print(f"❌ ETF '{args.etf}' não encontrado ou sem lotes.", file=sys.stderr)
            sys.exit(1)

    # Buscar PTAX e preços
    print("Buscando PTAX e preços...", file=sys.stderr)
    ptax = get_ptax()
    prices = get_prices(etfs_ativos)

    if not prices:
        print("❌ Nenhum preço obtido.", file=sys.stderr)
        sys.exit(1)

    # Analisar
    resultado = analisar_lotes(
        lotes_data=lotes_data,
        prices=prices,
        ptax=ptax,
        threshold=args.threshold,
        mostrar_todos=args.all,
        filtro_etf=args.etf,
    )

    if args.json:
        print(json.dumps(resultado, indent=2, default=str))
    else:
        print_relatorio(resultado, mostrar_todos=args.all)

    # Exit code: 0 = nenhuma oportunidade material, 1 = há oportunidade material
    sys.exit(0 if not resultado["material"] else 1)


if __name__ == "__main__":
    main()
