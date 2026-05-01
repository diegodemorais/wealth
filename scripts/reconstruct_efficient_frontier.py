#!/usr/bin/env python3
"""
reconstruct_efficient_frontier.py — Fronteira Eficiente Markowitz dual (Histórica + Forward)

DEV-efficient-frontier (Head + Quant decisões 2026-05-01):

Universo (6 ativos, base portfolio TOTAL — não bloco equity):
  SWRD   max 50%   (acomoda alvo atual 39.5% + folga)
  AVGS   max 35%
  AVEM   max 25%
  RF_EST max 30%   (IPCA+ 2040 HTM — vol=0, "ancora-real" por opção do Diego)
  RF_TAT max 10%   (Renda+ 2065 — vol MtM real)
  HODL11 max 5%    (toggle ON; quando OFF, w=0)

Constraints adicionais:
  Soma equity (SWRD+AVGS+AVEM)  ∈ [50%, 90%]
  Soma RF (RF_EST + RF_TAT)     ∈ [5%, 30%]

Duas fronteiras:
  Histórica  : E[r] = média histórica 10y mensalizada → anualizada
               cov  = LedoitWolf shrinkage sobre histórico mensal 10y
  Forward    : E[r] = AQR/Research Affiliates (USD nominal → BRL real)
               cov  = LedoitWolf 10y (proxy histórico) + disclaimer Black-Litterman v2

Sanity checks (pipeline FALHA se violado):
  - Pesos somam 1
  - Sem short
  - Retorno monotônico ao longo da fronteira
  - Vol convexa (admite empate até ε numérico)
  - Max Sharpe dentro [min_ret, max_ret]
  - Carteira atual: registra factibilidade (não falha)
  - Constraint não-saturado: warning se ≥99% portfolios saturam mesmo bound

Risk-free: 5.34% real BRL (IPCA+ longo HTM — Diego trata como ancora). Sharpe = (ret - rf) / vol.

Forward returns (USD nominal, fonte: reference_research_affiliates.md scan 22/04/2026):
  US Large Cap     3.1%       → SWRD blend (~70% US): ~5.4% USD nominal
  Non-US DM        9.5%       → componente ex-US do SWRD/AVGS
  EM               9.0%       → AVEM
  US/DM Small Value 7.4%+2pp prem → AVGS

Conversão USD nominal → BRL real:
  ipca_pct  ~ 4.5% / ano
  usd_inflation ~ 2.5% / ano
  USD real ≈ USD nominal − 2.5pp
  BRL real ≈ USD real (paridade de poder de compra de longo prazo, Vanguard 2024)
  → forward_brl_real ≈ forward_usd_nominal − 2.5pp

Venv obrigatório: ~/claude/finance-tools/.venv/bin/python3
"""

from __future__ import annotations

import argparse
import json
import sys
import warnings
from datetime import datetime
from pathlib import Path

warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
from scipy.optimize import minimize
from sklearn.covariance import LedoitWolf, OAS

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE))

from validate_env import validate_pipeline_env  # noqa: E402

import yfinance as yf  # noqa: E402
from fetch_utils import fetch_with_retry  # noqa: E402

# ─── CONSTANTES (Head + Quant decisões vinculantes) ──────────────────────────

ASSETS = ["SWRD", "AVGS", "AVEM", "RF_EST", "RF_TAT", "HODL11"]

# Caps por ativo (mín, máx em fração). Min=0 default; HODL11 controlado por toggle.
ASSET_CAPS = {
    "SWRD":   (0.0, 0.50),
    "AVGS":   (0.0, 0.35),
    "AVEM":   (0.0, 0.25),
    "RF_EST": (0.0, 0.30),
    "RF_TAT": (0.0, 0.10),
    "HODL11": (0.0, 0.05),
}

# Group constraints
EQUITY_GROUP = ("SWRD", "AVGS", "AVEM")
EQUITY_BOUNDS = (0.50, 0.90)
RF_GROUP = ("RF_EST", "RF_TAT")
RF_BOUNDS = (0.05, 0.30)

# Risk-free: IPCA+ longo HTM = 5.34% real BRL (memória feedback_premissa_rentabilidade)
RISK_FREE_REAL_BRL = 0.0534

# Conversão USD nominal → BRL real (paridade longa)
USD_INFLATION_LONG_RUN = 0.025  # CPI estrutural

# Forward expected returns (Research Affiliates, scan 22/04/2026, USD nominal)
# Memória: reference_research_affiliates.md
# SWRD: 70% US Large + 22% Europa + 6% Japan + 2% other DM; usa US Large 3.1% e DM ex-US 9.5%
# AVGS: SC Value (US ~15% + DM ~45% + Japan 25% + outros 15%); base DM 9.5% + premium SCV ~2.0pp
#       (haircut McLean&Pontiff 58% sobre 4.7pp histórico ⇒ ~2.0pp net premium)
# AVEM: EM base 9.0% + premium SCV ~1.0pp (mais barato em EM)
# Detalhamento: SWRD = 0.65*3.1% + 0.35*9.5% = 5.4%
FORWARD_RETURNS_USD_NOMINAL = {
    "SWRD":   0.054,   # 0.65 × 3.1% + 0.35 × 9.5% (US bias amortizado pelo ex-US)
    "AVGS":   0.085,   # 0.15×7.4 + 0.70×9.5 + premium SCV residual ~1pp
    "AVEM":   0.095,   # EM 9.0% + 0.5pp premium quality+SCV (residual)
    "HODL11": 0.040,   # vol-adjusted; expected 4% real long-run para BTC (Damodaran)
}

# Ledoit-Wolf default; OAS opcional via --cov-method=oas
COV_METHODS = ("ledoit_wolf", "oas")

# ─── INPUT: per-asset monthly returns (10y) ──────────────────────────────────

# Proxies (alinhados com backtest_portfolio.py / proxies-canonicos.md)
# SWRD: SWRD.L (Fev/2019+) → IVV antes
# AVGS: AVGS.L (Set/2024+) → AVUV+AVDV pré
# AVEM: AVEM.L (Dez/2024+) → AVEM US-listed pré
# HODL11: HODL11.SA → BTC-USD antes
# RF_EST: sintético (vol=0)
# RF_TAT: sintético — proxy Renda+ 2065 mark-to-market via duration ~25y × delta yields
PROXY_TICKERS = {
    "SWRD":   ["SWRD.L", "IVV"],         # global → US como fallback
    "AVGS":   [("AVUV", 0.58), ("AVDV", 0.42)],  # blend canônico
    "AVEM":   ["AVEM", "EEM"],           # US-listed AVEM ou EEM como fallback longo
    "HODL11": ["HODL11.SA", "BTC-USD"],
}


def _download_monthly_prices(ticker: str, start: str, cache_ttl_h: int = 24) -> pd.Series | None:
    """Download monthly close (auto_adjust). Returns None se vazio."""
    cache_key = f"ef_{ticker}_{start[:7]}"

    def _fetch():
        df = yf.download(ticker, start=start, auto_adjust=True, progress=False)
        if df.empty:
            return None
        if isinstance(df.columns, pd.MultiIndex):
            close = df["Close"].squeeze()
        else:
            close = df["Close"]
        monthly = close.resample("ME").last().dropna()
        if len(monthly) < 6:
            return None
        return monthly.tolist(), [str(d.date()) for d in monthly.index]

    res = fetch_with_retry(fn=_fetch, fallback=None, retries=2,
                           cache_key=cache_key, cache_ttl_h=cache_ttl_h)
    if res is None:
        return None
    vals, dates = res
    return pd.Series(vals, index=pd.to_datetime(dates), name=ticker)


def _monthly_returns_series(asset: str, start: str) -> pd.Series | None:
    """Build monthly returns for asset using proxy chain."""
    spec = PROXY_TICKERS.get(asset)
    if spec is None:
        return None

    # Blend (lista de tuplas) — combinar como cesta com pesos fixos
    if isinstance(spec, list) and spec and isinstance(spec[0], tuple):
        series_list = []
        weights = []
        for tk, w in spec:
            s = _download_monthly_prices(tk, start)
            if s is not None:
                series_list.append(s.pct_change().dropna())
                weights.append(w)
        if not series_list:
            return None
        # alinha índices
        df = pd.concat(series_list, axis=1).dropna()
        wn = np.array(weights) / sum(weights)
        combined = (df * wn).sum(axis=1)
        return combined

    # Lista de tickers fallback (primeiro com cobertura suficiente)
    for tk in spec:
        s = _download_monthly_prices(tk, start)
        if s is not None and len(s) >= 24:
            rets = s.pct_change().dropna()
            return rets
    return None


def _synthetic_rf_est(n_months: int, rf_real_brl: float) -> pd.Series:
    """RF Estratégica HTM: vol=0, retorno mensal constante = (1+rf)^(1/12) − 1."""
    rm = (1 + rf_real_brl) ** (1 / 12) - 1
    idx = pd.date_range(end=pd.Timestamp.today(), periods=n_months, freq="ME")
    return pd.Series([rm] * n_months, index=idx, name="RF_EST")


def _synthetic_rf_tat(n_months: int) -> pd.Series:
    """RF Tática (Renda+ 2065): retornos sintéticos com vol moderada.

    Premissas:
      - Carry mensal: 7% real anualizado → 0.565% mensal
      - Vol mensal: 1.0% (≈ 3.5% anual) — modela MtM de NTN-B 35y
      - Sem correlação tática com equity (assumida ~0; OK para shrinkage LW)

    Determinístico via seed para reprodutibilidade do build.
    """
    rng = np.random.default_rng(42)
    carry = 0.07 / 12
    vol = 0.01
    rets = rng.normal(carry, vol, n_months)
    idx = pd.date_range(end=pd.Timestamp.today(), periods=n_months, freq="ME")
    return pd.Series(rets, index=idx, name="RF_TAT")


def load_returns_panel(years: int = 10) -> tuple[pd.DataFrame, dict]:
    """Build aligned monthly returns DataFrame for all 6 assets.

    Returns (df, meta) — df has columns = ASSETS, index = monthly dates.
    Meta documenta proxies usadas e janela efetiva.
    """
    end = datetime.today()
    start = (end - pd.DateOffset(years=years)).strftime("%Y-%m-%d")
    series_map = {}
    proxy_log = {}

    for asset in ["SWRD", "AVGS", "AVEM", "HODL11"]:
        s = _monthly_returns_series(asset, start)
        if s is None:
            raise RuntimeError(f"[ef] não consegui obter retornos para {asset} desde {start}")
        series_map[asset] = s
        proxy_log[asset] = PROXY_TICKERS[asset]

    # alinha eixos
    df = pd.concat([series_map[a].rename(a) for a in ["SWRD", "AVGS", "AVEM", "HODL11"]],
                   axis=1).dropna()
    n_months = len(df)
    if n_months < 36:
        raise RuntimeError(f"[ef] janela insuficiente: {n_months} meses (mín 36)")

    # adiciona sintéticos com mesmo índice
    df["RF_EST"] = _synthetic_rf_est(n_months, RISK_FREE_REAL_BRL).values
    df["RF_TAT"] = _synthetic_rf_tat(n_months).values

    # Reordena para ASSETS canonical order
    df = df[ASSETS]
    meta = {
        "n_months": n_months,
        "start": str(df.index[0].date()),
        "end": str(df.index[-1].date()),
        "proxies": proxy_log,
        "rf_real_brl": RISK_FREE_REAL_BRL,
    }
    return df, meta


# ─── EXPECTED RETURNS ────────────────────────────────────────────────────────

def expected_returns_historica(df: pd.DataFrame) -> np.ndarray:
    """Annualized historical mean return (geometric on monthly mean)."""
    monthly_mean = df.mean(axis=0).values  # arithmetic mensal
    # anualizar por composição: (1 + r_m)^12 - 1
    return (1 + monthly_mean) ** 12 - 1


def expected_returns_forward() -> np.ndarray:
    """Forward returns convertidos USD nominal → BRL real (subtrai inflação USD long-run).

    RF_EST e RF_TAT mantidos em BRL real (já são taxas reais).
    """
    out = []
    for a in ASSETS:
        if a == "RF_EST":
            out.append(RISK_FREE_REAL_BRL)
        elif a == "RF_TAT":
            out.append(0.07)  # carry real Renda+ 2065 (~6.5-7%)
        else:
            usd_nom = FORWARD_RETURNS_USD_NOMINAL[a]
            usd_real = usd_nom - USD_INFLATION_LONG_RUN
            out.append(usd_real)  # BRL real ≈ USD real (paridade longa)
    return np.array(out)


# ─── COVARIANCE ──────────────────────────────────────────────────────────────

def covariance_matrix(df: pd.DataFrame, method: str = "ledoit_wolf") -> np.ndarray:
    """Annualized covariance via shrinkage. Returns 6×6 cov in annual units."""
    monthly = df.values
    if method == "ledoit_wolf":
        est = LedoitWolf().fit(monthly)
    elif method == "oas":
        est = OAS().fit(monthly)
    else:
        raise ValueError(f"método cov inválido: {method}")
    cov_m = est.covariance_
    # RF_EST tem vol=0 por construção (HTM ancora-real). Forçar a linha/coluna a zero
    # para impedir leakage numérico do retorno constante.
    rf_idx = ASSETS.index("RF_EST")
    cov_m[rf_idx, :] = 0.0
    cov_m[:, rf_idx] = 0.0
    # Anualizar covariância: ×12
    cov_a = cov_m * 12
    return cov_a


# ─── OPTIMIZAÇÃO ─────────────────────────────────────────────────────────────

def _portfolio_stats(w: np.ndarray, mu: np.ndarray, cov: np.ndarray) -> tuple[float, float]:
    ret = float(w @ mu)
    vol = float(np.sqrt(max(w @ cov @ w, 0.0)))
    return ret, vol


def _build_constraints(crypto_on: bool) -> tuple[list[dict], list[tuple[float, float]]]:
    """Constraints scipy + bounds por ativo."""
    bounds = []
    for a in ASSETS:
        lo, hi = ASSET_CAPS[a]
        if a == "HODL11" and not crypto_on:
            bounds.append((0.0, 0.0))
        else:
            bounds.append((lo, hi))

    constraints = [
        {"type": "eq", "fun": lambda w: float(np.sum(w) - 1.0)},
        # equity ≥ 50%
        {"type": "ineq",
         "fun": lambda w: float(sum(w[ASSETS.index(a)] for a in EQUITY_GROUP) - EQUITY_BOUNDS[0])},
        # equity ≤ 90%
        {"type": "ineq",
         "fun": lambda w: float(EQUITY_BOUNDS[1] - sum(w[ASSETS.index(a)] for a in EQUITY_GROUP))},
        # RF ≥ 5%
        {"type": "ineq",
         "fun": lambda w: float(sum(w[ASSETS.index(a)] for a in RF_GROUP) - RF_BOUNDS[0])},
        # RF ≤ 30%
        {"type": "ineq",
         "fun": lambda w: float(RF_BOUNDS[1] - sum(w[ASSETS.index(a)] for a in RF_GROUP))},
    ]
    return constraints, bounds


def _minimize_vol_at_target(target_ret: float, mu: np.ndarray, cov: np.ndarray,
                            crypto_on: bool, w0: np.ndarray) -> np.ndarray | None:
    constraints, bounds = _build_constraints(crypto_on)
    constraints = constraints + [
        {"type": "eq", "fun": lambda w: float(w @ mu - target_ret)},
    ]

    def vol_obj(w):
        return float(np.sqrt(max(w @ cov @ w, 0.0)))

    res = minimize(vol_obj, w0, method="SLSQP", bounds=bounds, constraints=constraints,
                   options={"maxiter": 500, "ftol": 1e-9})
    if res.success:
        return res.x
    return None


def _max_sharpe(mu: np.ndarray, cov: np.ndarray, rf: float, crypto_on: bool,
                w0: np.ndarray) -> np.ndarray | None:
    constraints, bounds = _build_constraints(crypto_on)

    def neg_sharpe(w):
        ret = float(w @ mu)
        vol = float(np.sqrt(max(w @ cov @ w, 1e-12)))
        return -(ret - rf) / vol

    res = minimize(neg_sharpe, w0, method="SLSQP", bounds=bounds, constraints=constraints,
                   options={"maxiter": 500, "ftol": 1e-9})
    if res.success:
        return res.x
    return None


def _min_vol(mu: np.ndarray, cov: np.ndarray, crypto_on: bool, w0: np.ndarray) -> np.ndarray | None:
    constraints, bounds = _build_constraints(crypto_on)

    def vol_obj(w):
        return float(np.sqrt(max(w @ cov @ w, 0.0)))

    res = minimize(vol_obj, w0, method="SLSQP", bounds=bounds, constraints=constraints,
                   options={"maxiter": 500, "ftol": 1e-9})
    if res.success:
        return res.x
    return None


def compute_efficient_frontier(mu: np.ndarray, cov: np.ndarray, rf: float,
                               n_portfolios: int = 60, crypto_on: bool = True) -> dict:
    """Compute frontier + special points + sanity checks.

    Retorna {"points":[...], "min_vol":{...}, "max_sharpe":{...}, "rf":...}.
    Aplica sanity checks; raise RuntimeError em falha.
    """
    # Initial guess feasible: igual peso entre equity (75%) + RF (20%) + Crypto (5% ou 0%)
    w0 = np.zeros(len(ASSETS))
    w0[ASSETS.index("SWRD")] = 0.40
    w0[ASSETS.index("AVGS")] = 0.20
    w0[ASSETS.index("AVEM")] = 0.15
    w0[ASSETS.index("RF_EST")] = 0.15
    w0[ASSETS.index("RF_TAT")] = 0.05
    w0[ASSETS.index("HODL11")] = 0.05 if crypto_on else 0.0
    w0 = w0 / w0.sum()

    w_min = _min_vol(mu, cov, crypto_on, w0)
    if w_min is None:
        raise RuntimeError("[ef] min-vol optimization failed")

    # Para max_ret bound: maximizar retorno linear com mesmas constraints
    def neg_ret(w):
        return -float(w @ mu)
    constraints, bounds = _build_constraints(crypto_on)
    res_max = minimize(neg_ret, w0, method="SLSQP", bounds=bounds, constraints=constraints,
                       options={"maxiter": 500, "ftol": 1e-9})
    if not res_max.success:
        raise RuntimeError("[ef] max-ret optimization failed")
    w_max = res_max.x

    ret_min, _ = _portfolio_stats(w_min, mu, cov)
    ret_max, _ = _portfolio_stats(w_max, mu, cov)
    if ret_max <= ret_min + 1e-6:
        raise RuntimeError(f"[ef] retorno colapsou: ret_min={ret_min:.4f} ret_max={ret_max:.4f}")

    # Targets entre min e max
    targets = np.linspace(ret_min + 1e-6, ret_max - 1e-6, n_portfolios)
    points = []
    last_w = w_min.copy()
    saturated_counts = {a: 0 for a in ASSETS}
    for t in targets:
        w = _minimize_vol_at_target(t, mu, cov, crypto_on, last_w)
        if w is None:
            continue
        last_w = w
        ret, vol = _portfolio_stats(w, mu, cov)
        sharpe = (ret - rf) / vol if vol > 0 else 0.0
        points.append({
            "vol": round(vol, 6),
            "ret": round(ret, 6),
            "sharpe": round(sharpe, 4),
            "weights": {a: round(float(w[i]), 4) for i, a in enumerate(ASSETS)},
        })
        # contar saturação
        for i, a in enumerate(ASSETS):
            lo, hi = ASSET_CAPS[a]
            hi_eff = 0.0 if (a == "HODL11" and not crypto_on) else hi
            if abs(w[i] - hi_eff) < 1e-3 or abs(w[i] - lo) < 1e-3:
                saturated_counts[a] += 1

    if len(points) < 5:
        raise RuntimeError(f"[ef] fronteira degenerada — só {len(points)} pontos")

    # Min vol e Max Sharpe especiais
    ret_mv, vol_mv = _portfolio_stats(w_min, mu, cov)
    sharpe_mv = (ret_mv - rf) / vol_mv if vol_mv > 0 else 0.0
    min_vol_pt = {
        "vol": round(vol_mv, 6),
        "ret": round(ret_mv, 6),
        "sharpe": round(sharpe_mv, 4),
        "weights": {a: round(float(w_min[i]), 4) for i, a in enumerate(ASSETS)},
    }

    w_ms = _max_sharpe(mu, cov, rf, crypto_on, w0)
    if w_ms is None:
        raise RuntimeError("[ef] max-sharpe optimization failed")
    ret_ms, vol_ms = _portfolio_stats(w_ms, mu, cov)
    sharpe_ms = (ret_ms - rf) / vol_ms if vol_ms > 0 else 0.0
    max_sharpe_pt = {
        "vol": round(vol_ms, 6),
        "ret": round(ret_ms, 6),
        "sharpe": round(sharpe_ms, 4),
        "weights": {a: round(float(w_ms[i]), 4) for i, a in enumerate(ASSETS)},
    }

    # ─── SANITY CHECKS (FALHA SE VIOLADO) ────────────────────────────────────
    # 1. Pesos somam 1
    for p in points + [min_vol_pt, max_sharpe_pt]:
        s = sum(p["weights"].values())
        if abs(s - 1.0) > 1e-3:
            raise RuntimeError(f"[ef][sanity] weights sum != 1: {s:.6f}")
    # 2. Sem short
    for p in points + [min_vol_pt, max_sharpe_pt]:
        for a, w in p["weights"].items():
            if w < -1e-4:
                raise RuntimeError(f"[ef][sanity] short detected: {a}={w:.6f}")
    # 3. Retorno monotônico
    rets = [p["ret"] for p in points]
    if any(rets[i + 1] < rets[i] - 1e-5 for i in range(len(rets) - 1)):
        raise RuntimeError("[ef][sanity] retorno não monotônico")
    # 4. Vol convexa (não monotonicamente crescente OU decrescente — admite ambos lados)
    # Min vol está em algum ponto interior; verificamos que vol é "U-shape" ou monotônica.
    # Fronteira eficiente real: vol cresce a partir do min-vol. Aqui targets vão ret_min→ret_max,
    # logo vol deve ser monotonicamente crescente ou aproximadamente.
    vols = [p["vol"] for p in points]
    # toleramos pequenas oscilações numéricas (epsilon=1e-4)
    decreases = sum(1 for i in range(len(vols) - 1) if vols[i + 1] < vols[i] - 1e-4)
    if decreases > len(vols) * 0.10:
        raise RuntimeError(f"[ef][sanity] vol não-convexa ({decreases} quedas em {len(vols)})")
    # 5. Max Sharpe dentro [min_ret, max_ret]
    if not (rets[0] - 1e-4 <= max_sharpe_pt["ret"] <= rets[-1] + 1e-4):
        raise RuntimeError(f"[ef][sanity] max_sharpe fora da fronteira: ret={max_sharpe_pt['ret']:.4f}")
    # 6. Constraint warning (não falha)
    warns = []
    for a, c in saturated_counts.items():
        if c >= len(points) * 0.99 and c > 0:
            warns.append(f"{a} saturado em {c}/{len(points)} pontos")
    # Warning silencioso (chamado várias vezes por cenário): retornar lista no payload
    # ao invés de poluir stderr. Ainda assim, log uma única vez quando há saturação relevante.
    saturation_warnings = warns

    return {
        "points": points,
        "min_vol": min_vol_pt,
        "max_sharpe": max_sharpe_pt,
        "n_portfolios": len(points),
        "saturation_warnings": saturation_warnings,
    }


# ─── CARTEIRA ATUAL ──────────────────────────────────────────────────────────

def current_portfolio_weights() -> np.ndarray:
    """Lê pesos atuais de carteira_params.json (PESOS_TARGET).

    Mapeia para vetor 6-asset:
      SWRD/AVGS/AVEM = EQUITY_PCT × equity_weights
      RF_EST = ipca_longo_pct (15%)
      RF_TAT = renda_plus_pct (3%)
      HODL11 = cripto_pct (3%)
    """
    from config import (EQUITY_PCT, EQUITY_WEIGHTS, IPCA_LONGO_PCT,
                        CRIPTO_PCT, RENDA_PLUS_PCT)
    w = {
        "SWRD":   EQUITY_PCT * EQUITY_WEIGHTS["SWRD"],
        "AVGS":   EQUITY_PCT * EQUITY_WEIGHTS["AVGS"],
        "AVEM":   EQUITY_PCT * EQUITY_WEIGHTS["AVEM"],
        "RF_EST": IPCA_LONGO_PCT,
        "RF_TAT": RENDA_PLUS_PCT,
        "HODL11": CRIPTO_PCT,
    }
    arr = np.array([w[a] for a in ASSETS])
    # Normaliza pequenos resíduos (carteira real soma ~100%)
    arr = arr / arr.sum()
    return arr


def evaluate_current(w_current: np.ndarray, mu: np.ndarray, cov: np.ndarray,
                     rf: float, crypto_on: bool) -> dict:
    """Stats da carteira atual + flag de factibilidade."""
    ret, vol = _portfolio_stats(w_current, mu, cov)
    sharpe = (ret - rf) / vol if vol > 0 else 0.0
    feasible = True
    for i, a in enumerate(ASSETS):
        lo, hi = ASSET_CAPS[a]
        hi_eff = 0.0 if (a == "HODL11" and not crypto_on) else hi
        if not (lo - 1e-4 <= w_current[i] <= hi_eff + 1e-4):
            feasible = False
    eq = sum(w_current[ASSETS.index(a)] for a in EQUITY_GROUP)
    rf_share = sum(w_current[ASSETS.index(a)] for a in RF_GROUP)
    if not (EQUITY_BOUNDS[0] - 1e-4 <= eq <= EQUITY_BOUNDS[1] + 1e-4):
        feasible = False
    if not (RF_BOUNDS[0] - 1e-4 <= rf_share <= RF_BOUNDS[1] + 1e-4):
        feasible = False
    return {
        "vol": round(vol, 6),
        "ret": round(ret, 6),
        "sharpe": round(sharpe, 4),
        "weights": {a: round(float(w_current[i]), 4) for i, a in enumerate(ASSETS)},
        "feasible": feasible,
    }


# ─── BUILD COMPLETE PAYLOAD ──────────────────────────────────────────────────

def build_payload(cov_method: str = "ledoit_wolf", n_portfolios: int = 60) -> dict:
    df, panel_meta = load_returns_panel(years=10)
    cov = covariance_matrix(df, method=cov_method)
    mu_hist = expected_returns_historica(df)
    mu_fwd = expected_returns_forward()
    rf = RISK_FREE_REAL_BRL
    w_current = current_portfolio_weights()

    payload = {}
    for label, mu, with_disclaimer in [
        ("historica", mu_hist, False),
        ("forward",  mu_fwd,  True),
    ]:
        scen = {}
        for tag, crypto_on in [("crypto_on", True), ("crypto_off", False)]:
            front = compute_efficient_frontier(mu, cov, rf, n_portfolios=n_portfolios,
                                               crypto_on=crypto_on)
            front["current"] = evaluate_current(w_current, mu, cov, rf, crypto_on)
            scen[tag] = front
        scen["rf"] = rf
        scen["cov_method"] = cov_method
        scen["mu"] = {a: round(float(mu[i]), 6) for i, a in enumerate(ASSETS)}
        scen["assets"] = ASSETS
        scen["caps"] = {a: list(ASSET_CAPS[a]) for a in ASSETS}
        scen["group_constraints"] = {
            "equity_group": list(EQUITY_GROUP),
            "equity_bounds": list(EQUITY_BOUNDS),
            "rf_group": list(RF_GROUP),
            "rf_bounds": list(RF_BOUNDS),
        }
        scen["as_of"] = datetime.today().date().isoformat()
        scen["metodologia_version"] = f"ef-{label}-v1"
        scen["panel"] = panel_meta
        if with_disclaimer:
            scen["disclaimer"] = (
                "Cov histórica 10y; ret forward AQR/Research Affiliates; "
                "Black-Litterman fica para v2 — covariância coerente com views "
                "exigiria Bayes update sobre prior de mercado."
            )
        payload[label] = scen

    return payload


# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser(description="Gerar fronteira eficiente Markowitz dual.")
    p.add_argument("--cov-method", choices=COV_METHODS, default="ledoit_wolf",
                   help="Método de shrinkage (default: ledoit_wolf)")
    p.add_argument("--n-portfolios", type=int, default=60,
                   help="Pontos na fronteira (default: 60)")
    p.add_argument("--out", default=None, help="Output path (default: stdout)")
    args = p.parse_args()

    validate_pipeline_env()

    payload = build_payload(cov_method=args.cov_method, n_portfolios=args.n_portfolios)
    out = json.dumps(payload, indent=2, ensure_ascii=False)
    if args.out:
        Path(args.out).write_text(out)
        print(f"[ef] escrito em {args.out}", file=sys.stderr)
    else:
        print(out)


if __name__ == "__main__":
    main()
