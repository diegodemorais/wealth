# Scripts Python — Referência

Venv: `~/claude/finance-tools/.venv/bin/python3` (todos os scripts usam este venv)

| Script | Propósito | Uso típico |
|--------|-----------|------------|
| `scripts/checkin_mensal.py` | Shadow A/B/C/Target, preços, scorecard | `python3 scripts/checkin_mensal.py` |
| `scripts/portfolio_analytics.py` | Fronteira eficiente, stress test CDaR, otimizador aporte | `python3 scripts/portfolio_analytics.py --aporte 25000` |
| `scripts/fire_montecarlo.py` | Monte Carlo P(FIRE), 10k trajetórias, bond tent, guardrails | `python3 scripts/fire_montecarlo.py --tornado` — flags: `--strategy`, `--compare-strategies`, `--retorno-equity` |
| `scripts/fire_glide_path_scenarios.py` | Compara 3 cenários de equity allocation pré-FIRE | `python3 scripts/fire_glide_path_scenarios.py` |
| `scripts/backtest_portfolio.py` | Backtest histórico do tilt fatorial UCITS | `python3 scripts/backtest_portfolio.py` |
| `scripts/factor_regression.py` | Regressão Fama-French 5-factor + momentum por ETF | `python3 scripts/factor_regression.py` |
| `scripts/spending_analysis.py` | Analisa CSV de gastos (All-Accounts export) | `python3 scripts/spending_analysis.py [csv]` |
| `analysis/ibkr_analysis.py` | Processa extrato IBKR, gera 5 JSONs (lotes, dividendos, etc) | `python3 analysis/ibkr_analysis.py` |
| `scripts/ibkr_sync.py` | Sync posições IBKR via Flex Query — drift, trades, snapshot | `python3 scripts/ibkr_sync.py --cambio 5.15` |
| `scripts/fx_utils.py` | PTAX/macro BCB, decomposição retorno BRL/USD | `python3 scripts/fx_utils.py` |
| `scripts/resampled_frontier.py` | Michaud Resampled Frontier — IC 90% dos pesos ótimos vs Target 50/30/20 | `python3 scripts/resampled_frontier.py` |
