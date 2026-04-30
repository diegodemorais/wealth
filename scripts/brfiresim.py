#!/usr/bin/env python3
"""brFIRESim — Historical Cycle Simulation adapted to Brazil (Bengen/cFIREsim methodology).

Simulates 20-year retirement windows starting each calendar year where complete
data is available. With ~23 years of Brazilian data (2003-2025), this yields
~4 complete cycles — a sanity check against Monte Carlo, not a rival estimator.

Diego's parameters: FIRE_NUMBER=R$10M, SWR=[3%, 4%, 6%, 8%], horizon=37 years.
Equity proxy: SWRD.L (GBP) + PTAX (BCB SGS 1) → BRL. Fallback: synthetic MSCI World-like
returns if yfinance unavailable. NOTE: Ibovespa (BVSP) is NOT used — Diego holds
no Brazilian equity; global equity (SWRD/AVGS/AVEM) is the correct proxy.

Output: react-app/public/brfiresim_results.json

Usage:
    python3 scripts/brfiresim.py
"""

from __future__ import annotations

import json
import math
import os
import sys
from datetime import date, datetime
from typing import Optional

import requests

# ─── Config ─────────────────────────────────────────────────────────────────────
PATRIMONIO_INICIAL = 10_000_000  # R$10M — FIRE Number = starting capital at retirement
CUSTO_VIDA_ANUAL   = 250_000     # R$250k/ano — despesa anual de Diego
SWR_RATES          = [0.03, 0.04, 0.06, 0.08]  # bands: Fat FIRE → Barista FIRE
WINDOW_ANOS        = 20          # 20-year retirement window (Bengen methodology)
OUTPUT_PATH        = os.path.join(os.path.dirname(__file__), '..', 'react-app', 'public', 'brfiresim_results.json')

# BCB SGS series
BCB_IPCA_SERIE   = 433    # IPCA mensal (%)
BCB_PTAX_SERIE   = 1      # PTAX BRL/USD (nível, não variação) — série diária
BCB_SELIC_SERIE  = 4189   # Selic over acumulada mensal (%)

# Synthetic fallback — MSCI World historical parameters in BRL
# Calibrated from long-run data: ~10% nominal USD, PTAX +3%/y drift → ~13% nominal BRL, ~6% real
SYNTHETIC_EQUITY_REAL_MONTHLY = 0.06 / 12   # 6% real annual → monthly
SYNTHETIC_VOL_MONTHLY         = 0.155 / math.sqrt(12)  # 15.5% annual vol


# ─── BCB REST helpers ────────────────────────────────────────────────────────────

def _bcb_fetch(serie: int, start: str, end: str) -> list[dict]:
    """Fetch monthly time series from BCB SGS REST API. Returns [] on failure."""
    url = (
        f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{serie}/dados"
        f"?formato=json&dataInicial={start}&dataFinal={end}"
    )
    try:
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"  ⚠ BCB SGS {serie} fetch failed: {e}", file=sys.stderr)
        return []


def _parse_bcb_monthly(raw: list[dict]) -> dict[str, float]:
    """Parse BCB monthly series into {YYYY-MM: value}."""
    out: dict[str, float] = {}
    for row in raw:
        try:
            # BCB date format: DD/MM/YYYY
            parts = row['data'].split('/')
            key = f"{parts[2]}-{parts[1]}"
            out[key] = float(row['valor'].replace(',', '.'))
        except (KeyError, ValueError):
            pass
    return out


# ─── Data fetchers ────────────────────────────────────────────────────────────────

def fetch_ipca_monthly(start_year: int = 2003, end_year: int = 2025) -> dict[str, float]:
    """Returns monthly IPCA rate (decimal) keyed by YYYY-MM."""
    raw = _bcb_fetch(BCB_IPCA_SERIE, f"01/01/{start_year}", f"31/12/{end_year}")
    data = _parse_bcb_monthly(raw)
    if not data:
        print("  ⚠ IPCA fetch failed — using 0.4%/mês fallback", file=sys.stderr)
        return {}
    return {k: v / 100 for k, v in data.items()}  # percent → decimal


def fetch_equity_brl_monthly(start_year: int = 2003, end_year: int = 2025) -> dict[str, float]:
    """Try yfinance SWRD.L → convert to BRL via GBPUSD + USDBRL. Falls back to synthetic."""
    try:
        import yfinance as yf

        start, end = f"{start_year}-01-01", f"{end_year}-12-31"

        def _monthly_close(ticker: str) -> dict[str, float]:
            """Download monthly close prices as {YYYY-MM: float}."""
            t = yf.Ticker(ticker)
            hist = t.history(start=start, end=end, interval="1mo", auto_adjust=True)
            if hist.empty:
                raise ValueError(f"{ticker} returned empty data")
            out: dict[str, float] = {}
            for ts, row in hist.iterrows():
                ym = ts.strftime("%Y-%m")
                close = row["Close"]
                # Ticker.history() always returns a scalar per column — no MultiIndex
                out[ym] = float(close)
            return out

        swrd_prices  = _monthly_close("SWRD.L")   # GBP
        gbpusd_prices = _monthly_close("GBPUSD=X")  # USD per GBP
        usdbrl_prices = _monthly_close("BRL=X")    # BRL per USD (inverted: USD/BRL)

        # Convert SWRD from GBP to BRL: SWRD_BRL = SWRD_GBP × GBPUSD × USDBRL
        def _brl_price(ym: str) -> float | None:
            s = swrd_prices.get(ym)
            g = gbpusd_prices.get(ym)
            u = usdbrl_prices.get(ym)
            if s and g and u:
                return s * g * u
            return None

        all_months = sorted(set(swrd_prices) & set(gbpusd_prices) & set(usdbrl_prices))
        monthly: dict[str, float] = {}
        prev_brl: float | None = None

        for ym in all_months:
            brl = _brl_price(ym)
            if brl and prev_brl and prev_brl > 0:
                monthly[ym] = brl / prev_brl - 1
            prev_brl = brl or prev_brl

        if len(monthly) >= 12:  # at least 1 year of real data
            print(f"  ✓ Equity proxy: SWRD.L real data — {len(monthly)} months (GBPUSD + BRL=X)")
            return monthly  # caller will backfill pre-inception months with synthetic

        raise ValueError(f"Only {len(monthly)} months real data — need ≥12")

    except ImportError:
        print("  ⚠ yfinance not installed — using synthetic equity returns", file=sys.stderr)
    except Exception as e:
        print(f"  ⚠ yfinance SWRD.L failed ({e}) — using synthetic", file=sys.stderr)

    # Synthetic fallback for months without real SWRD.L data
    import random
    rng = random.Random(42)
    months: dict[str, float] = {}
    for year in range(start_year, end_year + 1):
        for month in range(1, 13):
            ym = f"{year}-{month:02d}"
            months[ym] = rng.gauss(SYNTHETIC_EQUITY_REAL_MONTHLY, SYNTHETIC_VOL_MONTHLY)
    return months


def _blend_equity(real: dict[str, float], synthetic: dict[str, float]) -> tuple[dict[str, float], int, int]:
    """Merge real SWRD.L data over synthetic baseline. Returns (merged, n_real, n_synthetic)."""
    merged = {**synthetic, **real}  # real overwrites synthetic where available
    n_real = sum(1 for k in merged if k in real)
    n_syn = sum(1 for k in merged if k not in real)
    return merged, n_real, n_syn


# ─── Simulation engine ────────────────────────────────────────────────────────────

def run_cycle(
    ano_inicio: int,
    n_anos: int,
    swr: float,
    patrimonio: float,
    equity_monthly: dict[str, float],
    ipca_monthly: dict[str, float],
    equity_alloc: float = 0.79,  # Diego's equity allocation at FIRE day
) -> dict:
    """Simulate a single retirement cycle. Returns success/failure and trajectory stats."""
    saldo = patrimonio
    min_saldo = patrimonio
    retirada_inicial = patrimonio * swr / 12  # monthly withdrawal at SWR

    for yr in range(n_anos):
        ano = ano_inicio + yr
        for mes in range(1, 13):
            ym = f"{ano}-{mes:02d}"

            # IPCA adjust withdrawal annually (beginning of each year)
            if mes == 1 and yr > 0:
                ipca_anterior = sum(
                    ipca_monthly.get(f"{ano-1}-{m:02d}", 0.004)
                    for m in range(1, 13)
                )
                retirada_inicial *= (1 + ipca_anterior)

            # Portfolio return this month: equity + fixed income blend
            eq_ret = equity_monthly.get(ym, SYNTHETIC_EQUITY_REAL_MONTHLY)
            # Fixed income approximation: IPCA + 6% real = IPCA + 0.5%/month real
            fi_ret = ipca_monthly.get(ym, 0.004) + 0.005
            ret_total = equity_alloc * eq_ret + (1 - equity_alloc) * fi_ret

            saldo = saldo * (1 + ret_total) - retirada_inicial
            if saldo < min_saldo:
                min_saldo = saldo

            if saldo <= 0:
                return {
                    "sucesso": False,
                    "saldo_final": 0,
                    "min_saldo": max(0, min_saldo),
                }

    return {
        "sucesso": True,
        "saldo_final": round(saldo, 0),
        "min_saldo": round(max(0, min_saldo), 0),
    }


def compute_cycles(
    equity_monthly: dict[str, float],
    ipca_monthly: dict[str, float],
    window_anos: int = WINDOW_ANOS,
) -> tuple[list[dict], str, str]:
    """Find all valid 20-year cycles from available data."""
    # Determine data range
    all_months = sorted(set(equity_monthly.keys()) | set(ipca_monthly.keys()))
    if not all_months:
        return [], "", ""

    first_month = all_months[0]  # e.g. "2003-01"
    last_month = all_months[-1]  # e.g. "2025-12"

    first_year = int(first_month[:4])
    last_year = int(last_month[:4])

    # A cycle starting in `ano_inicio` needs data through year (ano_inicio + window_anos - 1)
    max_start = last_year - window_anos + 1  # last year where we have full window data

    cycles = []
    for ano_inicio in range(first_year, max_start + 1):
        resultados_swr: dict[str, dict] = {}
        for swr in SWR_RATES:
            key = f"{int(swr*100)}pct"
            resultados_swr[key] = run_cycle(
                ano_inicio=ano_inicio,
                n_anos=window_anos,
                swr=swr,
                patrimonio=PATRIMONIO_INICIAL,
                equity_monthly=equity_monthly,
                ipca_monthly=ipca_monthly,
            )
        cycles.append({
            "ano_inicio": ano_inicio,
            "duracao_anos": window_anos,
            "resultados_swr": resultados_swr,
        })

    return cycles, first_month, last_month


def build_resumo(cycles: list[dict]) -> dict:
    """Aggregate success rates — presented as fractions (N_sucesso / N_total)."""
    n = len(cycles)
    if n == 0:
        return {}
    resumo: dict[str, object] = {"n_ciclos": n}
    for swr in SWR_RATES:
        key = f"{int(swr*100)}pct"
        n_sucesso = sum(1 for c in cycles if c["resultados_swr"].get(key, {}).get("sucesso", False))
        # Fracao como float (ex: 3/4 = 0.75) — UI deve exibir "3 de 4", nao "75%"
        resumo[f"n_sucesso_{key}"] = n_sucesso
        resumo[f"taxa_sucesso_{key}"] = round(n_sucesso / n, 3) if n > 0 else None
    return resumo


# ─── Main ────────────────────────────────────────────────────────────────────────

def main() -> None:
    print("brFIRESim — Historical Cycle Simulation")
    print(f"  Window: {WINDOW_ANOS} anos | SWR: {[f'{int(s*100)}%' for s in SWR_RATES]}")
    print(f"  Patrimônio inicial: R${PATRIMONIO_INICIAL:,.0f} | Custo anual: R${CUSTO_VIDA_ANUAL:,.0f}")

    print("\n1. Fetching IPCA (BCB SGS 433)...")
    ipca = fetch_ipca_monthly(2003, date.today().year - 1)
    print(f"   → {len(ipca)} months")

    print("2. Fetching equity returns (SWRD.L real + synthetic backfill for pre-inception)...")
    end_yr = date.today().year - 1
    real_equity   = fetch_equity_brl_monthly(2003, end_yr)
    synth_equity  = fetch_equity_brl_monthly.__wrapped__(2003, end_yr) if hasattr(fetch_equity_brl_monthly, '__wrapped__') else None
    # Build synthetic baseline then overlay real data
    import random as _rng_mod
    _rng = _rng_mod.Random(42)
    synthetic_all: dict[str, float] = {}
    for yr in range(2003, end_yr + 1):
        for mo in range(1, 13):
            ym = f"{yr}-{mo:02d}"
            synthetic_all[ym] = _rng.gauss(SYNTHETIC_EQUITY_REAL_MONTHLY, SYNTHETIC_VOL_MONTHLY)
    equity, n_real, n_syn = _blend_equity(real_equity, synthetic_all)
    print(f"   → {len(equity)} months total ({n_real} real SWRD.L, {n_syn} synthetic)")

    print("3. Computing cycles...")
    cycles, data_inicio, data_fim = compute_cycles(equity, ipca)
    print(f"   → {len(cycles)} complete {WINDOW_ANOS}-year cycles")

    resumo = build_resumo(cycles)

    # Raw monthly series for chart
    all_months = sorted(set(equity.keys()) | set(ipca.keys()))
    series = {
        "datas": all_months,
        "retornos_equity_brl_pct": [round(equity.get(m, 0) * 100, 3) for m in all_months],
        "ipca_mensal_pct": [round(ipca.get(m, 0) * 100, 3) for m in all_months],
    }

    fontes: dict[str, str] = {
        "ipca": "BCB SGS 433",
        "equity_brl": f"SWRD.L yfinance ({n_real} meses reais 2019+) + MSCI World synthetic ({n_syn} meses 2003-2018)",
        "_nota_proxy": "SWRD.L = carteira real de Diego (SWRD/AVGS/AVEM é 100% global equity). Meses pré-2019 usam retornos sintéticos calibrados por MSCI World histórico.",
        "_equity_real_months": str(n_real),
        "_equity_synth_months": str(n_syn),
    }

    result = {
        "_generated": datetime.utcnow().isoformat() + "Z",
        "data_range": {"inicio": data_inicio, "fim": data_fim},
        "config": {
            "patrimonio_inicial": PATRIMONIO_INICIAL,
            "custo_vida_anual": CUSTO_VIDA_ANUAL,
            "window_anos": WINDOW_ANOS,
            "swr_rates": SWR_RATES,
            "equity_alloc": 0.79,
        },
        "cycles": cycles,
        "resumo": resumo,
        "series": series,
        "_fontes": fontes,
        "_caveat": (
            f"~{data_fim[:4] if data_fim else '?'} anos de dados BR → {len(cycles)} janelas de {WINDOW_ANOS} anos. "
            "Interprete como sanity check do Monte Carlo, NÃO como estimativa probabilística rival. "
            "taxa_sucesso = fração de ciclos históricos (denominador pequeno). "
            "Não use linguagem de '% de chance de sucesso'."
        ),
    }

    out_path = os.path.abspath(OUTPUT_PATH)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Output: {out_path}")
    print(f"   Cycles: {len(cycles)}")
    if cycles:
        for swr in SWR_RATES:
            key = f"{int(swr*100)}pct"
            n_s = resumo.get(f"n_sucesso_{key}", 0)
            n = resumo.get("n_ciclos", 0)
            print(f"   SWR {int(swr*100)}%: {n_s}/{n} cycles succeeded")


if __name__ == "__main__":
    main()
