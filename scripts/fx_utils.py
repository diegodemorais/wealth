#!/usr/bin/env python3
"""
fx_utils.py — Multi-currency tracking BRL/USD via python-bcb

Uso:
    python3 scripts/fx_utils.py                     # câmbio atual + portfolio em BRL/USD
    python3 scripts/fx_utils.py --history 30        # PTAX histórico 30 dias
    python3 scripts/fx_utils.py --decompose         # decomposição de retorno local + cambial

Funções exportáveis para outros scripts:
    get_ptax(date=None)           → float (USD ask PTAX da data)
    get_ptax_series(start, end)   → pd.Series
    to_brl(usd_value, date=None)  → float
    decompose_return(r_usd, r_fx) → dict (local, cambial, total_brl)

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import sys
from datetime import date, timedelta
from pathlib import Path

# ── Imports ───────────────────────────────────────────────────────────────────

try:
    from bcb import currency, sgs
except ImportError:
    print("❌  python-bcb não instalado. Use: pip install python-bcb")
    sys.exit(1)

import pandas as pd

# fetch_with_retry — retry exponencial + cache (XX-system-audit Item 2)
try:
    sys.path.insert(0, str(Path(__file__).parent))
    from fetch_utils import fetch_with_retry as _fetch_with_retry
except ImportError:
    def _fetch_with_retry(fn, fallback=None, retries=3, cache_key=None, cache_ttl_h=4):
        try:
            return fn()
        except Exception:
            if fallback is not None:
                return fallback
            raise

SEP = "─" * 62


# ── Core functions ─────────────────────────────────────────────────────────────

def get_ptax_series(start: str, end: str | None = None) -> pd.Series:
    """Retorna série PTAX ask BRL/USD entre start e end."""
    if end is None:
        end = date.today().isoformat()
    df = currency.get(["USD"], start=start, end=end, side="ask")
    return df["USD"].rename("PTAX_ask")


def get_ptax(reference_date: date | None = None) -> float:
    """
    Retorna PTAX ask BRL/USD da data informada (ou mais recente disponível).
    Regra de uso:
      - IR/custo médio/declaração: usar PTAX da liquidação (D+2)
      - Valuation operacional (snapshot): usar comercial do dia (esta função)
    """
    if reference_date is None:
        reference_date = date.today()
    # Busca 5 dias antes para garantir que temos ao menos 1 dia útil
    start = (reference_date - timedelta(days=7)).isoformat()
    end = reference_date.isoformat()

    def _bcb_fetch() -> float:
        series = get_ptax_series(start, end)
        return float(series.iloc[-1])

    return _fetch_with_retry(
        fn=_bcb_fetch,
        fallback=5.20,
        retries=3,
        cache_key=f"ptax_{end}",
        cache_ttl_h=4,
    )


def to_brl(usd_value: float, reference_date: date | None = None) -> float:
    """Converte USD → BRL usando PTAX operacional."""
    return usd_value * get_ptax(reference_date)


def to_usd(brl_value: float, reference_date: date | None = None) -> float:
    """Converte BRL → USD usando PTAX operacional."""
    ptax = get_ptax(reference_date)
    return brl_value / ptax if ptax else 0.0


def decompose_return(r_usd: float, r_fx: float) -> dict:
    """
    Decompõe retorno total BRL em componente local (USD) + cambial.

    Fórmula: (1 + r_brl) = (1 + r_usd) × (1 + r_fx)
    onde r_fx = variação do câmbio no período (PTAX fim / PTAX início - 1)

    Parâmetros:
        r_usd: retorno em USD no período (ex: 0.039 = +3.9%)
        r_fx:  variação cambial (ex: 0.0615 = BRL +6.15% = USD ficou +6.15% mais caro)

    Retorno: dict com r_local, r_cambial, r_total_brl, r_interaction
    """
    r_total_brl = (1 + r_usd) * (1 + r_fx) - 1
    r_interaction = r_usd * r_fx  # componente cruzado (geralmente pequeno)
    return {
        "r_local":      r_usd,
        "r_cambial":    r_fx,
        "r_interaction": r_interaction,
        "r_total_brl":  r_total_brl,
    }


def get_selic_atual() -> float:
    """Retorna taxa Selic meta mais recente (% a.a.)."""
    try:
        df = sgs.get({"selic": 432}, start=(date.today() - timedelta(days=7)).isoformat())
        return float(df["selic"].iloc[-1])
    except Exception:
        return float("nan")


def get_ipca_12m() -> float:
    """Retorna IPCA acumulado 12 meses mais recente (%)."""
    try:
        df = sgs.get({"ipca_12m": 13522}, start=(date.today() - timedelta(days=60)).isoformat())
        return float(df["ipca_12m"].iloc[-1])
    except Exception:
        return float("nan")


# ── CLI ────────────────────────────────────────────────────────────────────────

def cmd_current():
    """Mostra câmbio atual + macro."""
    ptax = get_ptax()
    selic = get_selic_atual()
    ipca = get_ipca_12m()

    print(f"\n{SEP}")
    print(f"  CÂMBIO & MACRO — {date.today()}")
    print(SEP)
    print(f"  PTAX BRL/USD (ask):  R$ {ptax:.4f}")
    print(f"  Selic meta:           {selic:.2f}% a.a.")
    print(f"  IPCA 12m:             {ipca:.2f}%")
    print()


def cmd_history(days: int = 30):
    """Mostra histórico PTAX."""
    start = (date.today() - timedelta(days=days)).isoformat()
    series = get_ptax_series(start)

    print(f"\n{SEP}")
    print(f"  PTAX BRL/USD — últimos {days} dias")
    print(SEP)
    print(f"  {'Data':<12} {'PTAX ask':>10}  {'Δ dia':>8}")
    print("  " + "─" * 38)

    prev = None
    for dt, val in series.items():
        delta = ""
        if prev is not None:
            d = val - prev
            delta = f"{d:>+.4f}"
        print(f"  {str(dt.date()):<12} {val:>10.4f}  {delta:>8}")
        prev = val

    print(f"\n  Mín: {series.min():.4f} | Máx: {series.max():.4f} | Atual: {series.iloc[-1]:.4f}")
    print()


def cmd_decompose(r_usd_pct: float, start_date: str, end_date: str):
    """Decompõe retorno de período em USD + cambial → BRL."""
    # BCB API requires start < end — query a small window around each date
    from datetime import datetime, timedelta
    def _date_plus(d_str: str, days: int) -> str:
        return (datetime.fromisoformat(d_str) + timedelta(days=days)).date().isoformat()

    ptax_start = get_ptax_series(start_date, _date_plus(start_date, 5))
    ptax_end   = get_ptax_series(end_date, _date_plus(end_date, 5))

    if ptax_start.empty or ptax_end.empty:
        print("❌  Câmbio não disponível para as datas informadas.")
        return

    p0 = float(ptax_start.iloc[-1])
    p1 = float(ptax_end.iloc[-1])
    r_fx = p1 / p0 - 1

    r_usd = r_usd_pct / 100
    d = decompose_return(r_usd, r_fx)

    print(f"\n{SEP}")
    print(f"  DECOMPOSIÇÃO DE RETORNO  ({start_date} → {end_date})")
    print(SEP)
    print(f"  PTAX início: R$ {p0:.4f} | PTAX fim: R$ {p1:.4f}")
    print(f"  Variação cambial (Δ PTAX): {r_fx:>+.2%}")
    print()
    print(f"  Retorno em USD (local):    {d['r_local']:>+.2%}")
    print(f"  Retorno cambial:           {d['r_cambial']:>+.2%}")
    print(f"  Interação (cruzado):       {d['r_interaction']:>+.2%}")
    print(f"  ─────────────────────────────────────")
    print(f"  Retorno total em BRL:      {d['r_total_brl']:>+.2%}")
    print()


def main():
    import argparse
    parser = argparse.ArgumentParser(description="FX utils — Multi-currency tracking BRL/USD")
    parser.add_argument("--history",   type=int, default=0, metavar="DAYS",
                        help="Mostrar histórico PTAX (ex: --history 30)")
    parser.add_argument("--decompose", nargs=3, metavar=("R_USD_PCT", "START", "END"),
                        help="Decompor retorno: --decompose 3.9 2026-01-01 2026-03-31")
    args = parser.parse_args()

    if args.history:
        cmd_history(args.history)
    elif args.decompose:
        r_usd_pct, start, end = args.decompose
        cmd_decompose(float(r_usd_pct), start, end)
    else:
        cmd_current()


if __name__ == "__main__":
    main()
