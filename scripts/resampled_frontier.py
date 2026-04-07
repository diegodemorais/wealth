#!/usr/bin/env python3
"""
resampled_frontier.py — Michaud Resampled Efficient Frontier (1998)
Implementa o método de Michaud para reduzir estimation error na otimização.

Metodologia:
1. Bootstrap 1.000 amostras dos retornos históricos (yfinance, 5 anos)
2. Para cada amostra, calcula Max Sharpe portfolio
3. Resultado = média ponderada dos 1.000 portfólios ótimos (Resampled Frontier)
4. Compara com Target 50/30/20 e Max Sharpe simples

Uso:
    python3 scripts/resampled_frontier.py

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import numpy as np
import warnings
warnings.filterwarnings("ignore")

try:
    import yfinance as yf
    import pandas as pd
    from scipy.optimize import minimize
except ImportError as e:
    print(f"Erro de importação: {e}")
    print("Instale: pip install yfinance scipy pandas")
    raise

# ─── CONFIGURAÇÃO ──────────────────────────────────────────────────────────────

# Proxies para ETFs UCITS (yfinance)
TICKERS = {
    "SWRD": "IDEV",           # iShares MSCI EAFE ETF como proxy SWRD
    "AVGS": None,             # Sintético: 0.58×AVUV + 0.42×AVDV
    "AVEM": "AVEM",           # Avantis EM Equity (US-listed)
}
TICKER_AVUV = "AVUV"
TICKER_AVDV = "AVDV"

PERIODO = "5y"
N_BOOTSTRAP = 1000
SEED = 42

# Premissas forward-looking aprovadas (carteira.md + FI-premissas-retorno)
EXPECTED_RETURNS_FWD = {
    "SWRD": 0.037,   # 3.7% real USD
    "AVGS": 0.050,   # 5.0% real USD
    "AVEM": 0.050,   # 5.0% real USD
}

TARGET = {"SWRD": 0.50, "AVGS": 0.30, "AVEM": 0.20}

# ─── FUNÇÕES ───────────────────────────────────────────────────────────────────

def baixar_precos():
    """Baixa preços históricos e constrói série de retornos diários."""
    print("  Baixando dados yfinance...")
    raw = yf.download(
        [TICKER_AVUV, TICKER_AVDV, "IDEV", "AVEM"],
        period=PERIODO, auto_adjust=True, progress=False
    )["Close"].dropna()

    # AVGS sintético: 58% AVUV + 42% AVDV
    avgs_price = 0.58 * raw[TICKER_AVUV] + 0.42 * raw[TICKER_AVDV]

    returns = pd.DataFrame({
        "SWRD": raw["IDEV"].pct_change(),
        "AVGS": avgs_price.pct_change(),
        "AVEM": raw["AVEM"].pct_change(),
    }).dropna()

    print(f"  Período: {returns.index[0].date()} → {returns.index[-1].date()} ({len(returns)} pregões)")
    return returns


def max_sharpe_weights(mu_arr, cov_arr, assets):
    """Calcula Max Sharpe portfolio via scipy. Retorna dict de pesos."""
    n = len(assets)
    # Minimize negative Sharpe ratio
    def neg_sharpe(w):
        ret = float(w @ mu_arr)
        vol = float(np.sqrt(w @ cov_arr @ w))
        return -ret / vol if vol > 1e-10 else 0.0

    constraints = [{"type": "eq", "fun": lambda w: np.sum(w) - 1}]
    bounds = [(0.0, 1.0)] * n
    w0 = np.ones(n) / n

    try:
        result = minimize(neg_sharpe, w0, method="SLSQP",
                          bounds=bounds, constraints=constraints,
                          options={"ftol": 1e-9, "maxiter": 1000})
        w = result.x
        w = np.maximum(w, 0)
        w /= w.sum()
        return {a: float(w[i]) for i, a in enumerate(assets)}
    except Exception:
        return {a: 1.0 / n for a in assets}


def portfolio_metrics(weights_dict, mu_arr, cov_arr, assets):
    """Calcula retorno esperado, vol e Sharpe de um portfólio."""
    w = np.array([weights_dict[a] for a in assets])
    ret = float(w @ mu_arr)
    vol = float(np.sqrt(w @ cov_arr @ w))
    sharpe = ret / vol if vol > 0 else 0.0
    return ret, vol, sharpe


def resampled_frontier(returns_df, n_bootstrap=N_BOOTSTRAP, seed=SEED):
    """
    Michaud Resampled Frontier:
    1. Bootstrap n_bootstrap amostras dos retornos diários
    2. Para cada amostra: Max Sharpe com retornos históricos da amostra
    3. Resultado: média ponderada dos pesos ótimos
    """
    rng = np.random.default_rng(seed)
    assets = list(returns_df.columns)
    n_obs = len(returns_df)

    all_weights = {a: [] for a in assets}

    print(f"  Rodando {n_bootstrap} bootstrap resamples...")
    ret_arr = returns_df.values  # shape (n_obs, n_assets)

    for i in range(n_bootstrap):
        if (i + 1) % 200 == 0:
            print(f"    {i+1}/{n_bootstrap}...")

        # Resample com reposição
        idx = rng.integers(0, n_obs, size=n_obs)
        sample = ret_arr[idx]

        mu_s = np.mean(sample, axis=0) * 252
        cov_s = np.cov(sample.T) * 252
        # Regularize: add small diagonal for numerical stability
        cov_s += np.eye(len(assets)) * 1e-8

        w = max_sharpe_weights(mu_s, cov_s, assets)
        for a in assets:
            all_weights[a].append(w[a])

    # Resampled weights = média dos bootstrap
    resampled_w = {a: float(np.mean(all_weights[a])) for a in assets}
    # Normalizar para soma = 1
    total = sum(resampled_w.values())
    resampled_w = {a: v / total for a, v in resampled_w.items()}

    # IC 90% por ativo
    ci_90 = {a: (
        float(np.percentile(all_weights[a], 5)),
        float(np.percentile(all_weights[a], 95))
    ) for a in assets}

    return resampled_w, ci_90, {a: np.array(all_weights[a]) for a in assets}


def main():
    print("\n" + "═"*65)
    print("  MICHAUD RESAMPLED EFFICIENT FRONTIER — FI-portfolio-optimization")
    print("  Comparação: Resampled vs Max Sharpe simples vs Target 50/30/20")
    print("═"*65 + "\n")

    # 1. Baixar dados
    returns_df = baixar_precos()
    assets = list(returns_df.columns)

    # 2. Estatísticas históricas (full sample) — numpy puro
    ret_arr = returns_df.values
    mu_hist_arr = np.mean(ret_arr, axis=0) * 252
    cov_hist_arr = np.cov(ret_arr.T) * 252
    cov_hist_arr += np.eye(len(assets)) * 1e-8  # regularize

    # Estatísticas individuais
    print("\n  Retornos históricos (5 anos, proxies):")
    for i, a in enumerate(assets):
        vol_a = float(np.sqrt(cov_hist_arr[i, i]))
        print(f"    {a}: ret={mu_hist_arr[i]:.2%}  vol={vol_a:.2%}")

    print("\n  Correlações:")
    corr = returns_df.corr()
    for i, a in enumerate(assets):
        for b in assets[i+1:]:
            print(f"    {a}–{b}: {corr.loc[a,b]:.3f}")

    # 3. Max Sharpe simples (full sample histórico)
    w_max_sharpe = max_sharpe_weights(mu_hist_arr, cov_hist_arr, assets)
    ret_ms, vol_ms, sharpe_ms = portfolio_metrics(w_max_sharpe, mu_hist_arr, cov_hist_arr, assets)

    # 4. Resampled Frontier
    resampled_w, ci_90, all_w_arrays = resampled_frontier(returns_df)
    ret_rs, vol_rs, sharpe_rs = portfolio_metrics(resampled_w, mu_hist_arr, cov_hist_arr, assets)

    # 5. Target 50/30/20
    ret_tgt, vol_tgt, sharpe_tgt = portfolio_metrics(TARGET, mu_hist_arr, cov_hist_arr, assets)

    # 6. Forward-looking metrics
    mu_fwd_arr = np.array([EXPECTED_RETURNS_FWD[a] for a in assets])
    ret_ms_fwd, vol_ms_fwd, sharpe_ms_fwd = portfolio_metrics(w_max_sharpe, mu_fwd_arr, cov_hist_arr, assets)
    ret_rs_fwd, vol_rs_fwd, sharpe_rs_fwd = portfolio_metrics(resampled_w, mu_fwd_arr, cov_hist_arr, assets)
    ret_tgt_fwd, vol_tgt_fwd, sharpe_tgt_fwd = portfolio_metrics(TARGET, mu_fwd_arr, cov_hist_arr, assets)

    # ─── OUTPUT ───────────────────────────────────────────────────────────────

    print("\n\n  ── PESOS ÓTIMOS ──────────────────────────────────────────────")
    print(f"  {'Método':<22} {'SWRD':>8} {'AVGS':>8} {'AVEM':>8}")
    print("  " + "-"*50)
    for label, w in [("Max Sharpe (hist)", w_max_sharpe), ("Resampled (Michaud)", resampled_w), ("Target 50/30/20", TARGET)]:
        print(f"  {label:<22} {w['SWRD']:>7.1%}  {w['AVGS']:>7.1%}  {w['AVEM']:>7.1%}")

    print("\n  ── IC 90% (bootstrap) dos pesos Resampled ────────────────────")
    for a in assets:
        lo, hi = ci_90[a]
        in_target = "✓" if lo <= TARGET[a] <= hi else "✗"
        print(f"    {a}: [{lo:.1%} – {hi:.1%}]  Target {TARGET[a]:.0%}: {in_target}")

    print("\n  ── MÉTRICAS (histórico 5 anos) ───────────────────────────────")
    print(f"  {'Método':<22} {'E[r]':>8} {'Vol':>8} {'Sharpe':>8}")
    print("  " + "-"*50)
    for label, (ret, vol, sharpe) in [
        ("Max Sharpe (hist)", (ret_ms, vol_ms, sharpe_ms)),
        ("Resampled (Michaud)", (ret_rs, vol_rs, sharpe_rs)),
        ("Target 50/30/20", (ret_tgt, vol_tgt, sharpe_tgt)),
    ]:
        print(f"  {label:<22} {ret:>7.2%}  {vol:>7.2%}  {sharpe:>7.3f}")

    print("\n  ── MÉTRICAS FORWARD-LOOKING (premissas 3.7%/5.0%/5.0%) ──────")
    print(f"  {'Método':<22} {'E[r]':>8} {'Vol':>8} {'Sharpe':>8}")
    print("  " + "-"*50)
    for label, (ret, vol, sharpe) in [
        ("Max Sharpe (hist)", (ret_ms_fwd, vol_ms_fwd, sharpe_ms_fwd)),
        ("Resampled (Michaud)", (ret_rs_fwd, vol_rs_fwd, sharpe_rs_fwd)),
        ("Target 50/30/20", (ret_tgt_fwd, vol_tgt_fwd, sharpe_tgt_fwd)),
    ]:
        print(f"  {label:<22} {ret:>7.2%}  {vol:>7.2%}  {sharpe:>7.3f}")

    print("\n  ── % VEZES QUE TARGET FICOU DENTRO DO IC 90% ─────────────────")
    for a in assets:
        inside = np.mean((all_w_arrays[a] >= TARGET[a] - 0.05) & (all_w_arrays[a] <= TARGET[a] + 0.05))
        print(f"    {a} (Target {TARGET[a]:.0%} ±5pp): {inside:.1%} das amostras")

    print("\n  ── CONCLUSÃO ──────────────────────────────────────────────────")
    # Verifica se Target está no IC 90% de cada ativo
    all_inside = all(ci_90[a][0] <= TARGET[a] <= ci_90[a][1] for a in assets)
    print(f"  Target 50/30/20 dentro do IC 90% do Resampled: {'SIM' if all_inside else 'NÃO (parcialmente)'}")
    swrd_inside = ci_90["SWRD"][0] <= TARGET["SWRD"] <= ci_90["SWRD"][1]
    avgs_inside = ci_90["AVGS"][0] <= TARGET["AVGS"] <= ci_90["AVGS"][1]
    avem_inside = ci_90["AVEM"][0] <= TARGET["AVEM"] <= ci_90["AVEM"][1]
    n_inside = sum([swrd_inside, avgs_inside, avem_inside])
    print(f"  Ativos dentro do IC: {n_inside}/3 (SWRD: {'✓' if swrd_inside else '✗'}, AVGS: {'✓' if avgs_inside else '✗'}, AVEM: {'✓' if avem_inside else '✗'})")
    print(f"  Diferença Resampled vs Target (Sharpe hist): {sharpe_rs - sharpe_tgt:+.3f}")
    print(f"  Diferença Resampled vs Target (Sharpe fwd): {sharpe_rs_fwd - sharpe_tgt_fwd:+.3f}")
    print()


if __name__ == "__main__":
    main()
