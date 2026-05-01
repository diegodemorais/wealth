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
    BL_LAMBDA,
    BL_MKT_WEIGHTS,
    BL_TAU,
    EQUITY_BOUNDS,
    EQUITY_GROUP,
    RF_BOUNDS,
    RF_GROUP,
    RISK_FREE_REAL_BRL,
    TAX_RATES,
    TRANSACTION_SPREAD,
    _build_bl_views,
    _compute_rebalance_costs,
    _synthetic_rf_est,
    _synthetic_rf_tat,
    attach_sharpe_net,
    black_litterman_posterior,
    black_litterman_prior,
    compute_efficient_frontier,
    compute_sharpe_net,
    covariance_matrix,
    current_portfolio_weights,
    evaluate_current,
    expected_returns_bl,
    expected_returns_forward,
    expected_returns_historica,
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


# ──────────────────────────────────────────────────────────────────────────────
# DEV-efficient-frontier-v2 — Black-Litterman tests
# ──────────────────────────────────────────────────────────────────────────────


def test_bl_mkt_weights_sum_to_one():
    """w_mkt para reverse-optimization deve somar ~1 (será normalizado)."""
    s = sum(BL_MKT_WEIGHTS.values())
    assert 0.95 < s < 1.05, f"BL_MKT_WEIGHTS soma {s}, esperado ~1"


def test_bl_prior_shape(synthetic_panel):
    """Prior π = λ Σ w_mkt deve ter shape (n_assets,)."""
    cov = covariance_matrix(synthetic_panel)
    w_mkt = np.array([BL_MKT_WEIGHTS[a] for a in ASSETS])
    w_mkt = w_mkt / w_mkt.sum()
    prior = black_litterman_prior(cov, w_mkt, lam=BL_LAMBDA)
    assert prior.shape == (len(ASSETS),)
    # Prior deve ser finito e plausível (entre -2% e 30% real)
    for p in prior:
        assert -0.02 < p < 0.30, f"prior fora do range plausível: {p}"


def test_bl_views_construction():
    """P matriz e Q vetor para 4 views absolutas (SWRD/AVGS/AVEM/HODL11)."""
    mu_views = expected_returns_forward()
    P, Q = _build_bl_views(mu_views)
    assert P.shape == (4, len(ASSETS))
    assert Q.shape == (4,)
    # Cada linha de P tem exatamente 1 entrada = 1 (absolute view)
    for row in P:
        assert abs(row.sum() - 1.0) < 1e-9
        assert sum(1 for x in row if abs(x) > 1e-9) == 1


def test_bl_posterior_sanity_constraint(synthetic_panel):
    """Posterior μ_BL deve ficar entre prior e view (±tol) para cada ativo COM view.

    Sanity check fundamental do BL: posterior é combinação convexa
    (em média) entre prior e view.
    """
    cov = covariance_matrix(synthetic_panel)
    mu_bl, bl_meta = expected_returns_bl(cov)
    sanity = bl_meta["sanity_check"]
    assert sanity["passed"], f"BL sanity violado: {sanity['violations']}"


def test_bl_posterior_returns_in_plausible_range(synthetic_panel):
    """Posterior μ_BL deve ser finito e em range realista (BRL real)."""
    cov = covariance_matrix(synthetic_panel)
    mu_bl, _ = expected_returns_bl(cov)
    for v in mu_bl:
        assert np.isfinite(v)
        assert -0.05 < v < 0.20, f"BL posterior fora do range: {v}"


def test_bl_meta_contains_calibration(synthetic_panel):
    """bl_meta deve documentar λ, τ, Ω, view_assets, prior, posterior — auditabilidade."""
    cov = covariance_matrix(synthetic_panel)
    _, bl_meta = expected_returns_bl(cov)
    required_keys = ["lambda", "tau", "omega_diag", "view_assets",
                     "Q_views_brl_real", "prior_pi_brl_real",
                     "posterior_mu_brl_real", "w_mkt", "method",
                     "sanity_check"]
    for k in required_keys:
        assert k in bl_meta, f"bl_meta sem chave {k}"
    assert bl_meta["lambda"] == BL_LAMBDA
    assert bl_meta["tau"] == BL_TAU


def test_bl_frontier_differs_from_historica(synthetic_panel):
    """Fronteira BL deve diferir da histórica (μ diferentes)."""
    cov = covariance_matrix(synthetic_panel)
    mu_h = expected_returns_historica(synthetic_panel)
    mu_bl, _ = expected_returns_bl(cov)
    out_h = compute_efficient_frontier(mu_h, cov, RISK_FREE_REAL_BRL,
                                       n_portfolios=20, crypto_on=True)
    out_b = compute_efficient_frontier(mu_bl, cov, RISK_FREE_REAL_BRL,
                                       n_portfolios=20, crypto_on=True)
    diff_ret = abs(out_h["max_sharpe"]["ret"] - out_b["max_sharpe"]["ret"])
    assert diff_ret > 0.001, "BL e Histórica deveriam diferir em retorno"


def test_bl_posterior_more_stable_than_views_only(synthetic_panel):
    """Sanity Quant: posterior BL deve ter dispersão menor ou igual a views nuas.

    Heurística: max - min do posterior <= max - min das views (entre ativos COM
    view), porque o prior puxa para o equilíbrio (estabiliza extremos).
    """
    cov = covariance_matrix(synthetic_panel)
    mu_views = expected_returns_forward()
    _, bl_meta = expected_returns_bl(cov)
    posterior = np.array(bl_meta["posterior_mu_brl_real"])
    view_idx = [ASSETS.index(a) for a in bl_meta["view_assets"]]
    view_range = mu_views[view_idx].max() - mu_views[view_idx].min()
    post_range = posterior[view_idx].max() - posterior[view_idx].min()
    # Tolerância: posterior pode ser até 25% mais disperso que views por causa
    # de cross-asset Σ (off-diagonal); mas geralmente é mais estável.
    assert post_range <= view_range * 1.25, \
        f"Posterior {post_range:.4f} muito mais disperso que views {view_range:.4f}"


# ──────────────────────────────────────────────────────────────────────────────
# DEV-efficient-frontier-v2 — Sharpe líquido (custos + IR) tests
# ──────────────────────────────────────────────────────────────────────────────


def test_rebalance_costs_zero_when_target_equals_current():
    """Sem rebalance ⇒ spread=0 e IR=0."""
    w = current_portfolio_weights()
    pat = 3_685_261.0
    out = _compute_rebalance_costs(w, w, pat)
    assert abs(out["spread_total_brl"]) < 1e-6
    assert abs(out["ir_total_brl"]) < 1e-6


def test_rebalance_costs_ir_only_on_sales():
    """IR aplica apenas em Δ<0 (vendas), nunca em compras."""
    w_current = current_portfolio_weights()
    # Mover 10pp de SWRD (delta -10pp) para AVEM (+10pp)
    w_target = w_current.copy()
    w_target[ASSETS.index("SWRD")] -= 0.10
    w_target[ASSETS.index("AVEM")] += 0.10
    pat = 1_000_000.0
    out = _compute_rebalance_costs(w_target, w_current, pat)
    # IR deve vir 100% da venda de SWRD: 10% × 1M × 15% = R$15.000
    expected_ir = 0.10 * pat * TAX_RATES["SWRD"]
    assert abs(out["ir_total_brl"] - expected_ir) < 0.01


def test_rebalance_costs_isenta_tesouro():
    """Vender RF_EST não gera IR (Tesouro Direto PF isento)."""
    w_current = current_portfolio_weights()
    w_target = w_current.copy()
    w_target[ASSETS.index("RF_EST")] -= 0.05
    w_target[ASSETS.index("AVGS")] += 0.05
    pat = 1_000_000.0
    out = _compute_rebalance_costs(w_target, w_current, pat)
    # IR só deveria vir de vendas com tax_rate>0; RF_EST tem 0.
    # Na construção, Δ AVGS é positivo (compra, sem IR), Δ RF_EST é negativo
    # mas TAX_RATES["RF_EST"]=0 ⇒ sem IR.
    assert abs(out["ir_total_brl"]) < 1e-6, \
        f"IR deveria ser 0 vendendo RF_EST isento, foi {out['ir_total_brl']}"


def test_sharpe_net_lt_sharpe_gross_when_rebalance_required():
    """Se rebalance requer movimento, Sharpe líquido < bruto (haircut)."""
    w_current = current_portfolio_weights()
    pat = 3_685_261.0
    rf = RISK_FREE_REAL_BRL
    # Ponto target diferente do atual
    target_weights = {a: 0.0 for a in ASSETS}
    target_weights["SWRD"] = 0.50
    target_weights["AVGS"] = 0.30
    target_weights["AVEM"] = 0.10
    target_weights["RF_EST"] = 0.10
    out = compute_sharpe_net(target_weights, ret_gross=0.08, vol=0.15, rf=rf,
                             w_current=w_current, patrimonio_total=pat)
    sharpe_gross = (0.08 - rf) / 0.15
    assert out["sharpe_net"] < sharpe_gross, \
        f"sharpe_net {out['sharpe_net']} >= bruto {sharpe_gross} (deveria ter haircut)"
    assert out["haircut_anual"] > 0


def test_attach_sharpe_net_populates_all_points(synthetic_panel):
    """attach_sharpe_net adiciona sharpe_net em todos os pontos + max_sharpe + min_vol."""
    cov = covariance_matrix(synthetic_panel)
    mu = expected_returns_historica(synthetic_panel)
    front = compute_efficient_frontier(mu, cov, RISK_FREE_REAL_BRL,
                                       n_portfolios=10, crypto_on=True)
    front["current"] = evaluate_current(current_portfolio_weights(), mu, cov,
                                        RISK_FREE_REAL_BRL, True)
    w_current = current_portfolio_weights()
    attach_sharpe_net(front, w_current, RISK_FREE_REAL_BRL, 1_000_000.0)
    for p in front["points"]:
        assert "sharpe_net" in p
        assert "ret_net" in p
        assert "haircut_anual" in p
    for key in ("max_sharpe", "min_vol"):
        assert "sharpe_net" in front[key]
        assert "rebalance_delta" in front[key]
        rd = front[key]["rebalance_delta"]
        assert "delta_brl" in rd
        assert "spread_total_brl" in rd
        assert "ir_total_brl" in rd
        assert "ir_per_asset_brl" in rd


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
