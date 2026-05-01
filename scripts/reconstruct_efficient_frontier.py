#!/usr/bin/env python3
"""
reconstruct_efficient_frontier.py — Fronteira Eficiente Markowitz dual (Histórica + Black-Litterman)

DEV-efficient-frontier-v2 (Head + Quant + Tax 2026-05-02):
- v2 substitui "Forward" por Black-Litterman (Idzorek 2005): prior π via
  reverse-optimization a partir de pesos MSCI ACWI, views Q via AQR/Research
  Affiliates, posterior μ_BL combinado bayesianamente.
- Adiciona `sharpe_net`: Sharpe líquido (custos 0.05% spread + IR 15%).
- Adiciona `rebalance_delta`: tabela R$ + IR para Max Sharpe e Min Vol.

DEV-efficient-frontier v1 (Head + Quant decisões 2026-05-01):

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

# ─── BLACK-LITTERMAN (Idzorek 2005) ──────────────────────────────────────────
# DEV-efficient-frontier-v2 — Quant validou calibração 2026-05-02.
#
# Prior π via reverse-optimization: π = λ · Σ · w_mkt
#   λ (risk aversion): calibrado p/ premium ~5% real BRL ⇒ λ ≈ 2.5-3.0 (Idzorek default)
#   Σ: covariância histórica 10y (Ledoit-Wolf shrinkage)
#   w_mkt: pesos de equilíbrio (MSCI ACWI para equity + atual Diego para RF/HODL11)
#
# τ (uncertainty no prior): 0.05 (Idzorek 2005 §3 — "small number")
# Ω (uncertainty nas views): diagonal `τ · diag(P · Σ · P')` (Idzorek 2005 §4.1)
# Posterior: μ_BL = [(τΣ)^-1 + P'Ω^-1 P]^-1 [(τΣ)^-1 π + P'Ω^-1 Q]
#
# Pesos de equilíbrio MSCI ACWI bloco equity (snapshot abr/2026):
#   USA 60% / DM ex-US 30% / EM 10%
#   → SWRD aproxima USA+DM ex-US, AVGS small-cap value DM, AVEM EM
#   Mapeamento: equity bloco ponderado pela alocação atual do Diego
#               (50% SWRD + 30% AVGS + 20% AVEM dentro do equity).
BL_LAMBDA = 2.5            # risk aversion (Idzorek default 2.5-3.0)
BL_TAU = 0.05              # prior uncertainty (Idzorek 2005)

# Pesos de equilíbrio do mercado (w_mkt) por ativo — base da reverse-optimization.
# Equity: USA 60% / DM ex-US 30% / EM 10% mapeado p/ SWRD/AVGS/AVEM via composição
# do FI-equity-redistribuicao (50/30/20). RF e HODL11 = pesos atuais.
# Total deve somar 1.0 — normalizado.
BL_MKT_WEIGHTS = {
    "SWRD":   0.395,   # USA 60% + parte DM ex-US (broad market) — alvo atual Diego
    "AVGS":   0.237,   # DM small-cap value — alvo atual Diego
    "AVEM":   0.158,   # EM — alvo atual Diego
    "RF_EST": 0.150,   # IPCA+ longo HTM — atual Diego (não há benchmark global)
    "RF_TAT": 0.030,   # Renda+ 2065 — atual Diego
    "HODL11": 0.030,   # Cripto — atual Diego
}

# ─── CUSTOS DE TRANSAÇÃO + IR (Tax validou 2026-05-02) ───────────────────────
# Lei 14.754/2023 + carteira Diego:
#   ETF exterior IBKR (SWRD/AVGS/AVEM): 15% sobre ganho de capital (Lei 14.754)
#   Tesouro IPCA+ 2040 PF HTM (RF_EST): isento no resgate (Tesouro Direto PF)
#   Renda+ 2065 (RF_TAT): come-cotas semestral 15% (regime de fundo, não TD direto)
#   HODL11 (ETF cripto B3): 15% sobre ganho de capital
# IOF: irrelevante em janela > 30 dias. Spread bid-ask 0.05% padrão para ETFs líquidos.
# IR aplicado APENAS sobre delta de venda (Δ negativo). Premissa conservadora:
# 100% do valor vendido é ganho (worst case, sem cost basis por ativo no JSON).
TRANSACTION_SPREAD = 0.0005  # 0.05% por R$ negociado (compra ou venda)
TAX_RATES = {
    "SWRD":   0.15,   # ETF exterior — Lei 14.754
    "AVGS":   0.15,   # ETF exterior — Lei 14.754
    "AVEM":   0.15,   # ETF exterior — Lei 14.754
    "RF_EST": 0.00,   # Tesouro IPCA+ HTM PF — isento no resgate
    "RF_TAT": 0.15,   # Renda+ 2065 — come-cotas semestral
    "HODL11": 0.15,   # ETF cripto BR — Lei 14.754 (mesma regra)
}

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


# ─── BLACK-LITTERMAN (Idzorek 2005) ──────────────────────────────────────────


def black_litterman_prior(cov: np.ndarray, w_mkt: np.ndarray,
                          lam: float = BL_LAMBDA) -> np.ndarray:
    """Reverse-optimization: π = λ · Σ · w_mkt.

    Retorna prior μ implícito no equilíbrio (vetor 6).
    """
    return lam * (cov @ w_mkt)


def _build_bl_views(mu_views_brl_real: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Constrói matriz P (views) e vetor Q (retornos das views).

    Diego usa **absolute views** (uma view por ativo de equity + cripto, RF deixa
    o prior falar). Isso simplifica a calibração e mantém auditabilidade.

    P: identidade nas linhas dos ativos com view (SWRD/AVGS/AVEM/HODL11).
       RF_EST e RF_TAT recebem o prior puro (sem view explícita).
    Q: vetor de retornos esperados nesses ativos (já em BRL real).
    """
    view_assets = ["SWRD", "AVGS", "AVEM", "HODL11"]
    n_assets = len(ASSETS)
    P = np.zeros((len(view_assets), n_assets))
    Q = np.zeros(len(view_assets))
    for i, a in enumerate(view_assets):
        P[i, ASSETS.index(a)] = 1.0
        Q[i] = mu_views_brl_real[ASSETS.index(a)]
    return P, Q


def black_litterman_posterior(prior_pi: np.ndarray, cov: np.ndarray,
                              P: np.ndarray, Q: np.ndarray,
                              tau: float = BL_TAU) -> tuple[np.ndarray, dict]:
    """Posterior Black-Litterman: μ_BL = [(τΣ)^-1 + P'Ω^-1P]^-1 [(τΣ)^-1 π + P'Ω^-1 Q].

    Ω diagonal proporcional à incerteza das views (Idzorek 2005 §4.1):
       Ω = τ · diag(P · Σ · P')

    Retorna (μ_BL, meta dict com Ω, λ, τ).
    """
    n = len(prior_pi)
    # Ω = τ · diag(P · Σ · P')  (Idzorek default — confiança média nas views)
    PSP = P @ cov @ P.T  # k×k
    omega = np.diag(np.diag(PSP)) * tau  # diagonal proporcional

    # Para evitar singularidade quando RF_EST tem cov=0 (linha/coluna zerada),
    # adicionamos pequeno regularizador na diagonal de τΣ.
    tau_sigma = tau * cov
    eps = 1e-8
    tau_sigma_reg = tau_sigma + np.eye(n) * eps

    inv_tau_sigma = np.linalg.inv(tau_sigma_reg)
    inv_omega = np.linalg.inv(omega + np.eye(omega.shape[0]) * eps)

    A = inv_tau_sigma + P.T @ inv_omega @ P
    b = inv_tau_sigma @ prior_pi + P.T @ inv_omega @ Q
    mu_bl = np.linalg.solve(A, b)

    meta = {
        "lambda": BL_LAMBDA,
        "tau": tau,
        "omega_diag": [round(float(x), 8) for x in np.diag(omega)],
        "view_assets": ["SWRD", "AVGS", "AVEM", "HODL11"],
        "Q_views_brl_real": [round(float(q), 6) for q in Q],
        "prior_pi_brl_real": [round(float(p), 6) for p in prior_pi],
        "posterior_mu_brl_real": [round(float(m), 6) for m in mu_bl],
        "w_mkt": dict(BL_MKT_WEIGHTS),
        "method": "Idzorek 2005 — diagonal Ω = τ · diag(P·Σ·P')",
    }
    return mu_bl, meta


def expected_returns_bl(cov: np.ndarray) -> tuple[np.ndarray, dict]:
    """Compõe prior π (reverse-optimization) + views Q (AQR/RA) → posterior μ_BL.

    Views = mesmos retornos do `expected_returns_forward()` (BRL real),
    aplicados como views absolutas em SWRD/AVGS/AVEM/HODL11. RF_* deixa o prior.
    """
    w_mkt = np.array([BL_MKT_WEIGHTS[a] for a in ASSETS])
    w_mkt = w_mkt / w_mkt.sum()  # normalização defensiva

    # Prior: π = λ · Σ · w_mkt (mas com cov RF_EST=0, prior_pi[RF_EST]=0)
    # Substituímos no prior os retornos das classes "ancora real" pelo target real.
    prior_pi = black_litterman_prior(cov, w_mkt, lam=BL_LAMBDA)
    # Ancorar RF_EST e RF_TAT no retorno real respectivo (prior π=0 para RF_EST
    # porque cov é zero; manualmente fixamos para o IPCA+ longo HTM real).
    prior_pi[ASSETS.index("RF_EST")] = RISK_FREE_REAL_BRL
    prior_pi[ASSETS.index("RF_TAT")] = 0.07  # carry real Renda+ 2065

    mu_views = expected_returns_forward()  # já em BRL real
    P, Q = _build_bl_views(mu_views)
    mu_bl, bl_meta = black_litterman_posterior(prior_pi, cov, P, Q, tau=BL_TAU)
    bl_meta["sanity_check"] = _bl_sanity_check(bl_meta, mu_bl)
    return mu_bl, bl_meta


# ─── SHARPE LÍQUIDO (custos + IR) ────────────────────────────────────────────


def _compute_rebalance_costs(w_target: np.ndarray, w_current: np.ndarray,
                             patrimonio_total: float) -> dict:
    """Custo de rebalance: spread em todo |Δ| + IR 15% sobre vendas (Δ<0).

    Premissa conservadora: 100% do valor vendido é ganho realizado (sem cost
    basis por ativo no JSON — Diego prefere worst-case, Tax-validado).
    """
    delta_pp = w_target - w_current
    delta_brl = delta_pp * patrimonio_total
    # Spread sobre |Δ| (compra OU venda paga)
    spread_total = float(np.sum(np.abs(delta_brl)) * TRANSACTION_SPREAD)
    # IR 15% sobre vendas (Δ<0). Premissa: 100% ganho.
    tax_rates = np.array([TAX_RATES[a] for a in ASSETS])
    ir_per_asset = np.where(delta_brl < 0, -delta_brl * tax_rates, 0.0)
    ir_total = float(ir_per_asset.sum())
    return {
        "delta_brl": [round(float(x), 2) for x in delta_brl],
        "delta_pp":  [round(float(x), 6) for x in delta_pp],
        "spread_total_brl": round(spread_total, 2),
        "ir_total_brl": round(ir_total, 2),
        "ir_per_asset_brl": [round(float(x), 2) for x in ir_per_asset],
        "total_cost_brl": round(spread_total + ir_total, 2),
    }


def _annualize_one_off_cost(cost_brl: float, patrimonio_total: float,
                            horizon_years: float = 10.0) -> float:
    """Converte custo one-off em haircut anual sobre o retorno (amortizado).

    Premissa: rebalance é evento único; custo dilui ao longo de `horizon_years`.
    Diego planeja FIRE em ~10 anos → horizonte default 10y.
    """
    if patrimonio_total <= 0:
        return 0.0
    return (cost_brl / patrimonio_total) / horizon_years


def compute_sharpe_net(point_weights: dict, ret_gross: float, vol: float, rf: float,
                       w_current: np.ndarray, patrimonio_total: float,
                       horizon_years: float = 10.0) -> dict:
    """Sharpe líquido = (ret_gross − annualized_cost − rf) / vol.

    annualized_cost: (spread + IR) / patrimônio_total / horizon_years.
    Retorna dict com sharpe_net, ret_net, costs.
    """
    w_target = np.array([point_weights[a] for a in ASSETS])
    costs = _compute_rebalance_costs(w_target, w_current, patrimonio_total)
    haircut = _annualize_one_off_cost(costs["total_cost_brl"], patrimonio_total,
                                      horizon_years)
    ret_net = ret_gross - haircut
    sharpe_net = (ret_net - rf) / vol if vol > 0 else 0.0
    return {
        "ret_net": round(float(ret_net), 6),
        "sharpe_net": round(float(sharpe_net), 4),
        "haircut_anual": round(float(haircut), 6),
        "costs": costs,
        "horizon_years": horizon_years,
    }


def attach_sharpe_net(front: dict, w_current: np.ndarray, rf: float,
                      patrimonio_total: float) -> None:
    """Attach `sharpe_net` + `costs` em cada ponto da fronteira (mutates in place)."""
    for p in front["points"]:
        net = compute_sharpe_net(p["weights"], p["ret"], p["vol"], rf,
                                 w_current, patrimonio_total)
        p["sharpe_net"] = net["sharpe_net"]
        p["ret_net"] = net["ret_net"]
        p["haircut_anual"] = net["haircut_anual"]
    for key in ("max_sharpe", "min_vol"):
        pt = front[key]
        net = compute_sharpe_net(pt["weights"], pt["ret"], pt["vol"], rf,
                                 w_current, patrimonio_total)
        pt["sharpe_net"] = net["sharpe_net"]
        pt["ret_net"] = net["ret_net"]
        pt["haircut_anual"] = net["haircut_anual"]
        pt["rebalance_delta"] = net["costs"]
    # Carteira atual: rebalance = 0 ⇒ sharpe_net == sharpe_gross
    cur = front.get("current")
    if cur is not None:
        net = compute_sharpe_net(cur["weights"], cur["ret"], cur["vol"], rf,
                                 w_current, patrimonio_total)
        cur["sharpe_net"] = net["sharpe_net"]
        cur["ret_net"] = net["ret_net"]
        cur["haircut_anual"] = net["haircut_anual"]


# ─── BUILD COMPLETE PAYLOAD ──────────────────────────────────────────────────

def _load_patrimonio_total() -> float:
    """Lê patrimônio total real para cálculo de Sharpe líquido.

    Fonte: dados/data.json `premissas.patrimonio_atual` (gerado pelo pipeline
    a partir da carteira). Em modo standalone (build_payload chamado fora do
    pipeline), usa fallback de carteira_params.json. Documenta origem para
    auditoria.
    """
    candidates = [
        Path(_HERE).parent / "react-app" / "public" / "data.json",
        Path(_HERE).parent / "dashboard" / "data.json",
        Path(_HERE).parent / "dash" / "data.json",
    ]
    for p in candidates:
        if p.exists():
            try:
                d = json.loads(p.read_text())
                pat = d.get("premissas", {}).get("patrimonio_atual")
                if isinstance(pat, (int, float)) and pat > 0:
                    return float(pat)
            except Exception:
                continue
    # Fallback: carteira_params.json
    cp = Path(_HERE).parent / "dados" / "carteira_params.json"
    if cp.exists():
        try:
            d = json.loads(cp.read_text())
            pat = d.get("patrimonio_atual") or d.get("PATRIMONIO_ATUAL")
            if isinstance(pat, (int, float)) and pat > 0:
                return float(pat)
        except Exception:
            pass
    # Último fallback (memória 2026-04: R$3.685M)
    return 3_685_261.0


def build_payload(cov_method: str = "ledoit_wolf", n_portfolios: int = 60) -> dict:
    df, panel_meta = load_returns_panel(years=10)
    cov = covariance_matrix(df, method=cov_method)
    mu_hist = expected_returns_historica(df)
    mu_bl, bl_meta = expected_returns_bl(cov)
    rf = RISK_FREE_REAL_BRL
    w_current = current_portfolio_weights()
    patrimonio_total = _load_patrimonio_total()

    payload = {}
    scenarios = [
        ("historica", mu_hist, None),
        ("bl",        mu_bl,   bl_meta),
    ]
    for label, mu, scen_meta in scenarios:
        scen = {}
        for tag, crypto_on in [("crypto_on", True), ("crypto_off", False)]:
            front = compute_efficient_frontier(mu, cov, rf, n_portfolios=n_portfolios,
                                               crypto_on=crypto_on)
            front["current"] = evaluate_current(w_current, mu, cov, rf, crypto_on)
            attach_sharpe_net(front, w_current, rf, patrimonio_total)
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
        scen["metodologia_version"] = f"ef-{label}-v2" if label == "bl" else f"ef-{label}-v1"
        scen["panel"] = panel_meta
        scen["patrimonio_total_brl"] = patrimonio_total
        scen["transaction_spread"] = TRANSACTION_SPREAD
        scen["tax_rates"] = dict(TAX_RATES)
        if label == "bl":
            scen["disclaimer"] = (
                "Black-Litterman incorpora views (AQR/RA) sobre equilibrium "
                "implícito (MSCI ACWI weights). Sensível a calibração de τ/Ω. "
                "Idzorek 2005."
            )
            scen["bl_meta"] = scen_meta
        payload[label] = scen

    return payload


def _bl_sanity_check(bl_meta: dict, mu_bl: np.ndarray) -> dict:
    """Sanity Black-Litterman:
    1. Posterior finito e plausível (entre -10% e 30% real BRL).
    2. Posterior médio do bloco com views ∈ [min, max] das views (±2pp).
       Versão portfolio-weighted (não per-asset) — Idzorek com Σ off-diagonal
       permite posterior individual sair do range, mas o agregado não deve.
    3. Posterior não pode flippar sinal de view forte (>5%).
    """
    view_assets = bl_meta["view_assets"]
    prior = bl_meta["prior_pi_brl_real"]
    Q = bl_meta["Q_views_brl_real"]
    violations = []

    # 1. Plausibilidade per-asset
    for a in ASSETS:
        idx = ASSETS.index(a)
        post = float(mu_bl[idx])
        if not (-0.10 <= post <= 0.30):
            violations.append({
                "rule": "plausible_range", "asset": a, "posterior": post,
            })

    # 2. Posterior médio dos ativos com view dentro do range das views (±2pp)
    view_idx = [ASSETS.index(a) for a in view_assets]
    post_avg = float(np.mean([mu_bl[i] for i in view_idx]))
    view_avg = float(np.mean(Q))
    prior_avg = float(np.mean([prior[i] for i in view_idx]))
    bound_lo = min(prior_avg, view_avg) - 0.02
    bound_hi = max(prior_avg, view_avg) + 0.02
    if not (bound_lo <= post_avg <= bound_hi):
        violations.append({
            "rule": "weighted_avg_in_range",
            "post_avg": post_avg, "prior_avg": prior_avg, "view_avg": view_avg,
        })

    # 3. Sign-flip check: views fortes (>5pp) devem manter sinal no posterior
    for i, a in enumerate(view_assets):
        idx = ASSETS.index(a)
        if abs(Q[i]) > 0.05 and np.sign(mu_bl[idx]) != np.sign(Q[i]):
            violations.append({
                "rule": "sign_flip", "asset": a, "view": Q[i],
                "posterior": float(mu_bl[idx]),
            })

    return {
        "passed": len(violations) == 0,
        "violations": violations,
        "rules": [
            "plausible_range: -10% ≤ posterior ≤ 30%",
            "weighted_avg_in_range: avg(posterior_views) ∈ [min(prior,view), max(prior,view)] ± 2pp",
            "sign_flip: views >5pp não invertem sinal no posterior",
        ],
    }


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
