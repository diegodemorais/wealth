#!/usr/bin/env python3
"""brFIRESim — Historical Cycle Simulation adapted to Brazil (Bengen/cFIREsim methodology).

Simulates 20-year retirement windows starting each calendar year where complete
data is available. With ~23 years of Brazilian data (2003-2025), this yields
~4 complete cycles — a sanity check against Monte Carlo, not a rival estimator.

Diego's parameters: FIRE_NUMBER=R$10M, SWR=[3%, 4%, 6%, 8%], horizon=37 years.
Equity proxy: REGIME7_CONFIG["proxies"]["SWRD"][0] = ^990100-USD-STRD (MSCI World NR USD,
available from 1972) converted to BRL via BRL=X (yfinance). No synthetic backfill needed.
NOTE: Ibovespa (BVSP) is NOT used — Diego holds global equity only.

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

import requests

# Add scripts dir to sys.path so config is importable when run as a script
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import REGIME7_CONFIG

# ─── Config ──────────────────────────────────────────────────────────────────────
PATRIMONIO_INICIAL = 10_000_000   # R$10M — FIRE Number = starting capital at retirement
CUSTO_VIDA_ANUAL   = 250_000      # R$250k/ano — despesa anual de Diego
SWR_RATES          = [0.03, 0.04, 0.06, 0.08]  # bands: Fat FIRE → Barista FIRE
WINDOW_ANOS        = 20           # 20-year retirement window (Bengen methodology)
OUTPUT_PATH        = os.path.join(
    os.path.dirname(__file__), '..', 'react-app', 'public', 'brfiresim_results.json'
)

BCB_IPCA_SERIE = 433  # IPCA mensal (%)

# Proxy from config — MSCI World NR USD, available from 1972 (no synthetic needed)
_swrd_proxy_cfg  = REGIME7_CONFIG["proxies"]["SWRD"][0]
SWRD_PROXY_TICKER = _swrd_proxy_cfg["ticker"]   # ^990100-USD-STRD
SWRD_PROXY_LABEL  = _swrd_proxy_cfg["label"]    # MSCI World NR USD (yfinance)
FX_TICKER         = "BRL=X"                     # USD/BRL (BRL per 1 USD)

# Synthetic fallback parameters (only used if yfinance unavailable)
_SYNTH_MONTHLY_REAL = 0.06 / 12
_SYNTH_VOL_MONTHLY  = 0.155 / math.sqrt(12)


# ─── BCB REST helpers ─────────────────────────────────────────────────────────────

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
            parts = row['data'].split('/')  # DD/MM/YYYY
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
    return {k: v / 100 for k, v in data.items()}


def fetch_equity_brl_monthly(start_year: int = 2003, end_year: int = 2025) -> dict[str, float]:
    """Download MSCI World NR USD (^990100-USD-STRD) and convert to BRL via BRL=X.

    Proxy is defined in REGIME7_CONFIG and has data from 1972 — no synthetic
    backfill needed. Returns monthly returns as {YYYY-MM: decimal}.
    """
    try:
        import yfinance as yf
        import pandas as pd

        start = f"{start_year}-01-01"
        end   = f"{end_year + 1}-01-01"

        def _monthly_close(ticker: str) -> pd.Series:
            raw = yf.download(ticker, start=start, end=end, auto_adjust=True, progress=False)
            if raw.empty:
                raise ValueError(f"{ticker} returned empty data")
            close = raw["Close"].squeeze() if isinstance(raw.columns, pd.MultiIndex) else raw["Close"]
            return close.resample("ME").last()

        msci_usd = _monthly_close(SWRD_PROXY_TICKER)
        usdbrl   = _monthly_close(FX_TICKER)

        # price_brl[t] = price_usd[t] × usdbrl[t]
        common   = msci_usd.index.intersection(usdbrl.index)
        msci_brl = msci_usd.loc[common] * usdbrl.loc[common]
        ret      = msci_brl.pct_change().dropna()

        # Filter to requested window
        ret = ret[(ret.index >= pd.Timestamp(f"{start_year}-01-01")) &
                  (ret.index <= pd.Timestamp(f"{end_year}-12-31"))]

        if len(ret) < 12:
            raise ValueError(f"Only {len(ret)} months — need ≥12")

        out = {ts.strftime("%Y-%m"): float(v) for ts, v in ret.items()}
        print(f"  ✓ Equity proxy: {SWRD_PROXY_TICKER} ({SWRD_PROXY_LABEL}) — {len(out)} months BRL")
        return out

    except ImportError:
        print("  ⚠ yfinance not installed — using synthetic equity returns", file=sys.stderr)
    except Exception as e:
        print(f"  ⚠ {SWRD_PROXY_TICKER} fetch failed ({e}) — using synthetic", file=sys.stderr)

    # Synthetic fallback (yfinance unavailable or proxy fetch fails)
    import random
    rng = random.Random(42)
    print("  ⚠ Using synthetic equity returns (MSCI World-calibrated)")
    return {
        f"{yr}-{mo:02d}": rng.gauss(_SYNTH_MONTHLY_REAL, _SYNTH_VOL_MONTHLY)
        for yr in range(start_year, end_year + 1)
        for mo in range(1, 13)
    }


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
    retirada_inicial = patrimonio * swr / 12

    for yr in range(n_anos):
        ano = ano_inicio + yr
        for mes in range(1, 13):
            ym = f"{ano}-{mes:02d}"

            if mes == 1 and yr > 0:
                ipca_anterior = sum(
                    ipca_monthly.get(f"{ano-1}-{m:02d}", 0.004)
                    for m in range(1, 13)
                )
                retirada_inicial *= (1 + ipca_anterior)

            eq_ret   = equity_monthly.get(ym, _SYNTH_MONTHLY_REAL)
            fi_ret   = ipca_monthly.get(ym, 0.004) + 0.005  # IPCA + ~6% real
            ret_total = equity_alloc * eq_ret + (1 - equity_alloc) * fi_ret

            saldo = saldo * (1 + ret_total) - retirada_inicial
            min_saldo = min(min_saldo, saldo)

            if saldo <= 0:
                return {"sucesso": False, "saldo_final": 0, "min_saldo": max(0, min_saldo)}

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
    all_months = sorted(set(equity_monthly.keys()) | set(ipca_monthly.keys()))
    if not all_months:
        return [], "", ""

    first_year = int(all_months[0][:4])
    last_year  = int(all_months[-1][:4])
    max_start  = last_year - window_anos + 1

    cycles = []
    for ano_inicio in range(first_year, max_start + 1):
        resultados_swr: dict[str, dict] = {}
        for swr in SWR_RATES:
            key = f"{int(swr * 100)}pct"
            resultados_swr[key] = run_cycle(
                ano_inicio=ano_inicio,
                n_anos=window_anos,
                swr=swr,
                patrimonio=PATRIMONIO_INICIAL,
                equity_monthly=equity_monthly,
                ipca_monthly=ipca_monthly,
            )
        cycles.append({"ano_inicio": ano_inicio, "duracao_anos": window_anos, "resultados_swr": resultados_swr})

    return cycles, all_months[0], all_months[-1]


def build_resumo(cycles: list[dict]) -> dict:
    """Aggregate success rates — fractions (N_sucesso / N_total). UI shows 'X de N', not %."""
    n = len(cycles)
    if n == 0:
        return {}
    resumo: dict[str, object] = {"n_ciclos": n}
    for swr in SWR_RATES:
        key = f"{int(swr * 100)}pct"
        n_sucesso = sum(1 for c in cycles if c["resultados_swr"].get(key, {}).get("sucesso", False))
        resumo[f"n_sucesso_{key}"]  = n_sucesso
        resumo[f"taxa_sucesso_{key}"] = round(n_sucesso / n, 3) if n > 0 else None
    return resumo


# ─── Main ─────────────────────────────────────────────────────────────────────────

def main() -> None:
    print("brFIRESim — Historical Cycle Simulation")
    print(f"  Window: {WINDOW_ANOS} anos | SWR: {[f'{int(s*100)}%' for s in SWR_RATES]}")
    print(f"  Patrimônio inicial: R${PATRIMONIO_INICIAL:,.0f} | Custo anual: R${CUSTO_VIDA_ANUAL:,.0f}")
    print(f"  Equity proxy: {SWRD_PROXY_TICKER} ({SWRD_PROXY_LABEL})")

    end_yr = date.today().year - 1

    # Start from 1999: BRL was floated Jan/1999 (crawling-peg before that — BRL=X
    # pre-1999 would understate real FX volatility). Post-float data is behaviorally valid.
    start_yr = 1999

    print(f"\n1. Fetching IPCA (BCB SGS 433, from {start_yr})...")
    ipca = fetch_ipca_monthly(start_yr, end_yr)
    print(f"   → {len(ipca)} months")

    print(f"2. Fetching equity returns ({SWRD_PROXY_TICKER} → BRL via {FX_TICKER}, from {start_yr})...")
    equity = fetch_equity_brl_monthly(start_yr, end_yr)
    print(f"   → {len(equity)} months")

    print("3. Computing cycles...")
    cycles, data_inicio, data_fim = compute_cycles(equity, ipca)
    print(f"   → {len(cycles)} complete {WINDOW_ANOS}-year cycles")

    resumo = build_resumo(cycles)

    all_months = sorted(set(equity.keys()) | set(ipca.keys()))
    series = {
        "datas": all_months,
        "retornos_equity_brl_pct": [round(equity.get(m, 0) * 100, 3) for m in all_months],
        "ipca_mensal_pct": [round(ipca.get(m, 0) * 100, 3) for m in all_months],
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
        "_fontes": {
            "ipca": "BCB SGS 433",
            "equity_brl": f"{SWRD_PROXY_TICKER} ({SWRD_PROXY_LABEL}) × BRL=X (USD/BRL)",
            "proxy_fonte": "REGIME7_CONFIG (config.py) — alinhado com backtest_portfolio.py",
        },
        "_caveat": (
            f"~{data_fim[:4] if data_fim else '?'} anos de dados → {len(cycles)} janelas de {WINDOW_ANOS} anos. "
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
    for swr in SWR_RATES:
        key = f"{int(swr * 100)}pct"
        n_s = resumo.get(f"n_sucesso_{key}", 0)
        n   = resumo.get("n_ciclos", 0)
        print(f"   SWR {int(swr * 100)}%: {n_s}/{n} cycles succeeded")


if __name__ == "__main__":
    main()
