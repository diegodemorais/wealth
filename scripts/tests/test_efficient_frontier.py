#!/usr/bin/env python3
"""
Test suite for reconstruct_efficient_frontier.py.

Validates:
- Sanity checks: pesos somam 1, sem short, dentro dos caps
- Carteira atual fica dentro da região factível (com crypto_on)
- Max Sharpe e Min Vol estão na fronteira
- Histórica e Forward produzem fronteiras diferentes
- Erro fail-fast em cov não-PSD ou retornos inválidos
"""

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

# Adiciona scripts/ ao path para import
_SCRIPTS = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_SCRIPTS))

from reconstruct_efficient_frontier import (  # noqa: E402
    ASSETS,
    ASSET_CAPS,
    EQUITY_BOUNDS,
    EQUITY_GROUP,
    RF_BOUNDS,
    RF_GROUP,
    RISK_FREE_REAL_BRL,
    compute_efficient_frontier,
    covariance_matrix,
    current_portfolio_weights,
    evaluate_current,
    expected_returns_forward,
    expected_returns_historica,
    _synthetic_rf_est,
    _synthetic_rf_tat,
)


# ──────────────────────────────────────────────────────────────────────────────
# Fixtures: build deterministic returns panel sem hit em yfinance
# ──────────────────────────────────────────────────────────────────────────────


@pytest.fixture
def synthetic_panel():
    """120 meses de retornos sintéticos para 6 ativos (vol/ret realistas)."""
    rng = np.random.default_rng(42)
    n = 120
    dates = pd.date_range(end="2026-04-30", periods=n, freq="ME")
    # vol mensal e ret mensal por ativo (próximos da realidade)
    spec = {
        "SWRD":   {"r": 0.010, "v": 0.040},   # 12%/ano, 14%/ano vol
        "AVGS":   {"r": 0.012, "v": 0.055},   # 15%/ano, 19%/ano vol
        "AVEM":   {"r": 0.009, "v": 0.060},   # 11%/ano, 21%/ano vol
        "HODL11": {"r": 0.030, "v": 0.180},   # 36%/ano, 62%/ano vol (BTC-like)
    }
    cols = {}
    for a, p in spec.items():
        cols[a] = rng.normal(p["r"], p["v"], n)
    df = pd.DataFrame(cols, index=dates)
    df["RF_EST"] = _synthetic_rf_est(n, RISK_FREE_REAL_BRL).values
    df["RF_TAT"] = _synthetic_rf_tat(n).values
    df = df[ASSETS]
    return df


# ──────────────────────────────────────────────────────────────────────────────
# Tests
# ──────────────────────────────────────────────────────────────────────────────


def test_synthetic_rf_est_zero_variance():
    """RF Estratégica deve ter vol = 0 (HTM ancora-real)."""
    s = _synthetic_rf_est(120, 0.0534)
    assert s.std() == 0.0
    # Composição mensal coerente
    monthly_geom = (1 + s).prod() ** (12 / 120) - 1
    assert abs(monthly_geom - 0.0534) < 1e-4


def test_covariance_rf_est_zero_row_col(synthetic_panel):
    """A linha/coluna de RF_EST na covariância deve ser zero."""
    cov = covariance_matrix(synthetic_panel, method="ledoit_wolf")
    rf_idx = ASSETS.index("RF_EST")
    assert np.allclose(cov[rf_idx, :], 0.0)
    assert np.allclose(cov[:, rf_idx], 0.0)


def test_covariance_psd(synthetic_panel):
    """Covariância shrinkage deve ser positiva semi-definida."""
    cov = covariance_matrix(synthetic_panel)
    # eigenvalores ≥ 0 (com tolerância numérica)
    eigs = np.linalg.eigvalsh(cov)
    assert all(e >= -1e-8 for e in eigs)


def test_expected_returns_historica_shape(synthetic_panel):
    mu = expected_returns_historica(synthetic_panel)
    assert mu.shape == (len(ASSETS),)
    # RF_EST deve ser ≈ RISK_FREE_REAL_BRL
    rf_idx = ASSETS.index("RF_EST")
    assert abs(mu[rf_idx] - RISK_FREE_REAL_BRL) < 1e-3


def test_expected_returns_forward_in_range():
    mu = expected_returns_forward()
    assert mu.shape == (len(ASSETS),)
    # Todos finitos e dentro de [-0.05, 0.20] (ranges sensatos para BRL real)
    for v in mu:
        assert -0.05 < v < 0.20


def test_frontier_weights_sum_to_one(synthetic_panel):
    cov = covariance_matrix(synthetic_panel)
    mu = expected_returns_historica(synthetic_panel)
    out = compute_efficient_frontier(mu, cov, RISK_FREE_REAL_BRL,
                                     n_portfolios=30, crypto_on=True)
    for p in out["points"]:
        s = sum(p["weights"].values())
        assert abs(s - 1.0) < 1e-3


def test_frontier_no_short(synthetic_panel):
    cov = covariance_matrix(synthetic_panel)
    mu = expected_returns_historica(synthetic_panel)
    out = compute_efficient_frontier(mu, cov, RISK_FREE_REAL_BRL,
                                     n_portfolios=30, crypto_on=True)
    for p in out["points"]:
        for a, w in p["weights"].items():
            assert w >= -1e-4, f"short detectado: {a}={w}"


def test_frontier_caps_respected(synthetic_panel):
    cov = covariance_matrix(synthetic_panel)
    mu = expected_returns_historica(synthetic_panel)
    out = compute_efficient_frontier(mu, cov, RISK_FREE_REAL_BRL,
                                     n_portfolios=30, crypto_on=True)
    for p in out["points"]:
        for a, w in p["weights"].items():
            lo, hi = ASSET_CAPS[a]
            assert lo - 1e-3 <= w <= hi + 1e-3, f"{a} fora do cap: {w}"
        # Group constraints
        eq = sum(p["weights"][a] for a in EQUITY_GROUP)
        rf = sum(p["weights"][a] for a in RF_GROUP)
        assert EQUITY_BOUNDS[0] - 1e-3 <= eq <= EQUITY_BOUNDS[1] + 1e-3
        assert RF_BOUNDS[0] - 1e-3 <= rf <= RF_BOUNDS[1] + 1e-3


def test_frontier_returns_monotonic(synthetic_panel):
    cov = covariance_matrix(synthetic_panel)
    mu = expected_returns_historica(synthetic_panel)
    out = compute_efficient_frontier(mu, cov, RISK_FREE_REAL_BRL,
                                     n_portfolios=30, crypto_on=True)
    rets = [p["ret"] for p in out["points"]]
    for i in range(len(rets) - 1):
        assert rets[i + 1] >= rets[i] - 1e-4


def test_max_sharpe_inside_frontier(synthetic_panel):
    cov = covariance_matrix(synthetic_panel)
    mu = expected_returns_historica(synthetic_panel)
    out = compute_efficient_frontier(mu, cov, RISK_FREE_REAL_BRL,
                                     n_portfolios=30, crypto_on=True)
    rets = [p["ret"] for p in out["points"]]
    ms_ret = out["max_sharpe"]["ret"]
    assert min(rets) - 1e-3 <= ms_ret <= max(rets) + 1e-3


def test_min_vol_has_lowest_vol(synthetic_panel):
    cov = covariance_matrix(synthetic_panel)
    mu = expected_returns_historica(synthetic_panel)
    out = compute_efficient_frontier(mu, cov, RISK_FREE_REAL_BRL,
                                     n_portfolios=30, crypto_on=True)
    vols = [p["vol"] for p in out["points"]]
    mv_vol = out["min_vol"]["vol"]
    # Tolerância: optimizer pode achar marginalmente diferente entre min-vol target e min-vol direto
    assert mv_vol <= min(vols) + 0.005


def test_historica_vs_forward_different(synthetic_panel):
    """Histórica e Forward usam μ diferentes — fronteiras devem diferir."""
    cov = covariance_matrix(synthetic_panel)
    mu_h = expected_returns_historica(synthetic_panel)
    mu_f = expected_returns_forward()
    out_h = compute_efficient_frontier(mu_h, cov, RISK_FREE_REAL_BRL, n_portfolios=20, crypto_on=True)
    out_f = compute_efficient_frontier(mu_f, cov, RISK_FREE_REAL_BRL, n_portfolios=20, crypto_on=True)
    # max_sharpe pesos diferentes (ou ret diferente em ≥ 1pp)
    diff_ret = abs(out_h["max_sharpe"]["ret"] - out_f["max_sharpe"]["ret"])
    assert diff_ret > 0.005


def test_current_portfolio_feasible_default(synthetic_panel):
    """Carteira atual (39.5/23.7/15.8/15/3/3) deve ser feasible no espaço crypto_on."""
    cov = covariance_matrix(synthetic_panel)
    mu = expected_returns_historica(synthetic_panel)
    w_cur = current_portfolio_weights()
    cur = evaluate_current(w_cur, mu, cov, RISK_FREE_REAL_BRL, crypto_on=True)
    assert cur["feasible"] is True


def test_current_portfolio_infeasible_crypto_off(synthetic_panel):
    """Com crypto_off (HODL11=0 cap), carteira atual com 3% HODL11 vira infeasible."""
    cov = covariance_matrix(synthetic_panel)
    mu = expected_returns_historica(synthetic_panel)
    w_cur = current_portfolio_weights()
    cur = evaluate_current(w_cur, mu, cov, RISK_FREE_REAL_BRL, crypto_on=False)
    assert cur["feasible"] is False


def test_crypto_off_has_zero_hodl11(synthetic_panel):
    """Com crypto_off, todos os pontos da fronteira devem ter HODL11 = 0."""
    cov = covariance_matrix(synthetic_panel)
    mu = expected_returns_historica(synthetic_panel)
    out = compute_efficient_frontier(mu, cov, RISK_FREE_REAL_BRL,
                                     n_portfolios=20, crypto_on=False)
    for p in out["points"]:
        assert abs(p["weights"]["HODL11"]) < 1e-4


def test_invalid_returns_raise():
    """Cov com NaN deve falhar."""
    bad_df = pd.DataFrame(np.full((10, len(ASSETS)), np.nan), columns=ASSETS)
    with pytest.raises(Exception):
        covariance_matrix(bad_df)


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
