# Mapa de Dependências — Propagação de Mudanças

> **Maintainer**: Integrator  
> **Atualizar em**: todo bug de propagação descoberto, toda premissa nova, todo componente novo.

---

## Legenda

```
[fonte] → [intermediário] → [output] → [consumidor] → [testid]
⚠ = quebra silenciosa (sem erro visível)
🔴 = bloqueia pipeline (AssertionError)
📌 = ponto de cache (stale risk)
```

---

## 1. Premissas (carteira.md)

### `aporte_mensal` (ex: R$25.000)
```
carteira.md → parse_carteira.py → carteira_params.json → config.py
    → generate_data.py → premissas.aporte_mensal
        → fire_trilha (anos de acumulação)                    ⚠ 📌
        → P(FIRE) base via PFireEngine                         📌
        → coast_fire_number                                    
        → contribuicao_retorno_crossover
        → ReverseFire simulator (APORTE_PRESET.solteiro)      ⚠
        → TrackingFireChart (projeção)
```

### `aporte_cenario_aspiracional` (ex: R$30.000)
```
carteira.md → carteira_params.json → premissas.aporte_mensal_aspiracional
    → build_pfire_request("aspiracional") → PFireEngine
        → P(FIRE) aspiracional
        → pat_mediano_aspiracional → dashboard_state.json["fire"]
            → aspiracional_scenario.pat_mediano → FireScenariosTable
            → aspiracional_scenario.swr         → FireScenariosTable    ⚠
    → ReverseFire.setAspiracional() → aporte state                      ⚠
```

### `idade_cenario_aspiracional` (ex: 49)
```
carteira.md → carteira_params.json → premissas.idade_cenario_aspiracional
    → build_pfire_request("aspiracional") → idadeFire
    → aspiracional_scenario.idade → FireScenariosTable
    → StressTestSection STRESS_AGES label                                ⚠ hardcoded
    → ReverseFire.setAspiracional() → idadeFire state                   ⚠
    → earliest_fire.idade
```

### `custo_vida_base` (ex: R$250.000/ano)
```
carteira.md → premissas.custo_vida_base
    → meta_fire = custo / swr_gatilho
    → bond_pool.cobertura_anos = bond_pool_valor / custo
    → spending_smile (todas as fases: go_go, slow_go, no_go)
    → WithdrawalRateChart: spending (numerador do SWR)
    → SpendingTimelineChart: baseline de cada ano
    → BondPoolDepletionChart: saque anual base
    → ReverseFire: custoMensal = custo/12 (solteiro)
    → fire_montecarlo: escala_custo_vida
```

### `swr_gatilho` (ex: 0.03 = 3%)
```
carteira.md → premissas.swr_gatilho
    → meta_fire = custo / swr_gatilho
    → WithdrawalRateChart: markLine gatilho
    → spending_guardrails: zona de risco
    → ReverseFire: metaFire = custo / swr
    → FireScenariosTable: SWR exibido
```

### `patrimonio_atual`
```
IBKR → ibkr_lotes.py → posicoes
    → generate_data.py: soma de posicoes + RF
        → premissas.patrimonio_atual
            → PFireEngine (todas as simulações)
            → coast_fire_number.gap
            → fire_spectrum (qual banda)
            → ReverseFire: patrimonioAtual
            → StressTest: patrimônio base
```

---

## 2. Eventos de Vida

### INSS Katia (data e valor)
```
carteira.md → premissas.inss_katia_anual, premissas.inss_katia_ano_inicio
    → fire_montecarlo.py: inss_anual, inss_inicio_ano (pós-FIRE)
        → trilha_p10/p50/p90 (reduz saque líquido a partir de 2049)
        → P(quality): healthcare spending pós-INSS
    → WithdrawalRateChart: inssKatiaLine (null antes de 2049, %/pat depois)   ⚠
    → WithdrawalRateChart: swrLiquida (deduz inssKatia após 2049)
    → BondPoolDepletionChart: saqueAnual reduz após 2049                        ⚠
    → WithdrawalRateChart markPoints: INSS K pin em 2049
    → premissas.inss_katia_anual → NowPage card capital humano Katia
```

### INSS Diego (data e valor)
```
carteira.md → premissas.inss_anual, premissas.inss_inicio_ano (≈2052)
    → (mesma cadeia que INSS Katia, com ano 2052)
    → WithdrawalRateChart: inssDiegoLine
    → spending_guardrails: renda_inss total
```

### Mudança de FIRE age base (`idade_cenario_base`)
```
carteira.md → premissas.idade_cenario_base
    → fire_trilha: n_anos_acumulacao = idadeFire - idadeAtual
    → P(FIRE) base: meses de acumulação
    → fire_year_base = ano_atual + (idadeFire - idadeAtual)
    → scenario_comparison.base.idade
    → NetWorthProjectionChart: transição pré/pós-FIRE
    → StressTest "X anos (FIRE base)" label                                    ⚠ hardcoded
```

---

## 3. Novos Ativos / Classes

### Novo ETF adicionado
```
IBKR posições → ibkr_lotes.py → posicoes[ticker]
    → generate_data.py: patrimônio total recalculado
    → pct_equity += peso_novo_etf
    → retorno_equity_base: blended (se diferente dos existentes)
    → etf_composition: nova entrada
    → IR diferido: novo lote FIFO calculado
    → estate tax: se US-situs, adicionar ao us_situs_total_usd
    → PortfolioPage: nova linha na tabela
    → factor_loadings: precisa de série de preços (reconstruct_history.py)    ⚠ 📌
```

### Ativo removido / zerado
```
ibkr_lotes.py: lote zerado (todos os units = 0)
    → posicoes[ticker] presente mas vazio
    → IR: verificar lucro/prejuízo realizado
    → etf_composition: entry deve desaparecer OU mostrar 0%
    → PortfolioPage: não mostrar linha zerada                                   ⚠
```

---

## 4. Mudanças de Estratégia

### Mudança de withdrawal strategy (guardrails → outro)
```
fire_montecarlo.py: strategy="guardrails" (hardcoded em PFireEngine)
    → P(FIRE), P(quality), trilha_p10/p50/p90
    → spending_guardrails
    → BondPoolDepletionChart (lógica de saque)
    → Mudar strategy exige: re-run fire_montecarlo + generate_data completo
```

### Mudança de bond pool (anos ou composição)
```
carteira.md → premissas.anos_bond_pool, bond_pool_status
    → fire_montecarlo.py: bond_pool_isolation, bond_pool_completion_fraction
    → BondPoolDepletionChart: saldo e esgotamento
    → bond_pool.cobertura_anos
    → spending_guardrails: bond_pool_coverage_years
    → P(quality): muda com isolation ativo vs inativo
```

### Mudança de pct_equity
```
carteira.md → premissas.pct_equity
    → fire_montecarlo: vol_efetivo (mix equity + bond_pool)
    → projetar_acumulacao: retorno_carteira
    → todos os outputs MC (trilha, P(FIRE), P(quality))                        📌
```

---

## 5. Pipeline — Pontos de Cache e Risco de Stale

| Campo | Escrito por | Lido por | Stale quando |
|-------|-------------|----------|--------------|
| `pat_mediano_aspiracional` | PFireEngine via generate_data.py | aspiracional_scenario | generate_data não rodou desde mudança de idadeFire ou aporte aspiracional |
| `p_quality_aspiracional` | fire_montecarlo.py (--by_profile) | data["fire"] | fire_montecarlo não rodou para aspiracional |
| `trilha_p10/p50/p90` | rodar_monte_carlo_com_trajetorias | NetWorthProjectionChart | fire_montecarlo stale (cache de 9.6h) |
| `fire_matrix.by_profile` | fire_montecarlo.py --by_profile | ReverseFire, SimulatorPage | flag --by_profile não foi rodada |
| `factor_loadings` | reconstruct_history.py | PerformancePage R² badges | reconstruct_history não rodou (requer série histórica) |
| `timeline_attribution` | reconstruct_history.py | BacktestPage | idem |
| `retorno_decomposicao` | compute_retorno_decomposicao | GapR | retornos_mensais sem decomposicao (reconstruct_history stale) |
| `correlation_stress` | compute_correlation_stress | GapP | idem |
| `pfire_base` | fire_montecarlo.py | P(FIRE) base | fire_montecarlo stale |
| `tornado` | fire_montecarlo.py --tornado | TornadoChart | fire_montecarlo --tornado não rodou |

---

## 6. Contratos React → data.json

| Componente | Campo consumido | Testid | Quebra silenciosa se |
|------------|----------------|--------|---------------------|
| `FireScenariosTable` | `aspiracional_scenario.pat_mediano` | `fire-scenario-aspiracional-pat` | campo null → mostra R$0 |
| `FireScenariosTable` | `aspiracional_scenario.swr` | `fire-scenario-aspiracional-swr` | pat null → SWR = 0% |
| `WithdrawalRateChart` | `premissas.inss_katia_anual` | — | sem testid → falha silenciosa |
| `BondPoolDepletionChart` | `premissas.retorno_rf_real_bond_pool` | `bond-pool-esgotamento` | fallback 5.34% se null |
| `NetWorthProjectionChart` | `trilha_p10/p50/p90` | — | mostra gráfico vazio sem erro |
| `ReverseFire` | `premissas.aporte_mensal_aspiracional` | — | usa aporte base se null |
| `SpendingTimelineChart` | `spending_smile.go_go/slow_go/no_go` | `spending-gogo-total` | sem dados → gráfico vazio |

---

## 7. Bugs de Propagação Registrados (histórico)

| Data | Bug | Root cause | Fix | Teste adicionado? |
|------|-----|-----------|-----|-------------------|
| 2026-05-01 | `aspiracional_scenario.pat_mediano = R$0` | generate_data lia `pat_mediano_fire50` mas MC escrevia `pat_mediano_aspiracional` | Corrigido em generate_data.py; rodar_monte_carlo_com_trajetorias retorna pat_mediana_fire | ⚠ Não |
| 2026-05-01 | `retorno_decomposicao` bloqueia pipeline | Sem cache fallback; reconstruct_history não rodou | Cache fallback adicionado | ⚠ Não |
| 2026-05-01 | ReverseFire aspiracional usava aporte R$25k e idadeFire=53 | build_pfire_request não usava aporte_cenario_aspiracional; setAspiracional não setava idadeFire | Corrigido em generate_data.py e ReverseFire.tsx | ⚠ Não |
| 2026-05-01 | StressTest label "50 anos (FIRE aspiracional)" | Hardcoded; idade mudou de 50 para 49 | Hardcoded corrigido para 49 | ⚠ Não |

---

## 8. Cobertura Pipeline → data.json

> **Auditoria**: 2026-05-01 | **Campos top-level**: 102 | **Cobertura confirmada**: 102/102 | **Detalhes**: `agentes/referencia/pipeline-coverage.md`

Legenda: ✅ = assertion presente e bloqueia | ⚠ = sem assertion (falha silenciosa) | 🔴 = null/zero problemático detectado | 📌 = stale risk

### Metadata / Internos

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `_generated` | `main()` datetime.now() | ⚠ | ok | BAIXO |
| `_generated_brt` | `main()` utcnow()-3h | ⚠ | ok | BAIXO |
| `_ibkr_sync_date` | `main()` LOTES_PATH.stat().mtime | ⚠ | ok | BAIXO |
| `_schema_version` | `main()` hardcoded `"2.0"` | ⚠ | ok | BAIXO |
| `_pipeline_run` | `main()` _pipeline_run_id | ⚠ | ok | BAIXO |
| `_snapshots_metadata` | `_load_json_safe()` mtime tracker | ⚠ | `backtest_r7._generated=null`, `fire_by_profile._generated=null` | MÉDIO 📌 |
| `_data_sources` | `main()` dict hardcoded | ⚠ | ok | BAIXO |
| `_pfire_canonical_carteira` | `main()` config.PFIRE_CANONICAL_* | ⚠ | ok | BAIXO |
| `_pfire_divergence_warning` | `main()` condicional | ⚠ | ok | BAIXO |

### Data / Câmbio

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `date` | `main()` date.today() | ⚠ | ok | BAIXO |
| `timestamps` | `get_source_timestamps()` | ⚠ | ok | BAIXO |
| `cambio` | `get_posicoes_precos()` yfinance BRL/USD | ⚠ | ok (usa CAMBIO_FALLBACK se yfinance falha — sem aviso explícito) | **MÉDIO** — base de todos os cálculos sem assert |

### Posições e Alocação

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `posicoes` | `get_posicoes_precos()` state + yfinance | ⚠ | ok (ter=null em 7 transitórios — design) | BAIXO |
| `pesosTarget` | `main()` PESOS_TARGET config.py | ⚠ | ok | BAIXO |
| `pisos` | `main()` config.py | ⚠ | ok | BAIXO |
| `drift` | `compute_drift()` | ⚠ | ok | BAIXO |
| `glide` | `main()` GLIDE_PATH config.py | ⚠ | ok | BAIXO |

### P(FIRE) e Monte Carlo

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `pfire_aspiracional` | `get_pfire_tornado()` PFireEngine | ⚠ | ok (91.1%) | MÉDIO |
| `pfire_base` | `get_pfire_tornado()` PFireEngine | ⚠ | ok (83.4%) | MÉDIO 📌 |
| `pfire_cenarios_estendidos` | `compute_extended_mc_scenarios()` | ⚠ | 🔴 `stagflation.params.retorno_equity_base=0.0`; `hyperinflation.p_sucesso_pct=0.0` | **ALTO** — zeros suspeitos passam silenciosamente |
| `pfire_by_profile` | `main()` stub | ✅ assert "atual" presente | `casado.base=null`, `filho.base=null` — design (TODO) | MÉDIO |
| `premissas` | `main()` dict (35 sub-campos) | ✅ fire_year_base, haircut_alpha_liquido | ok | BAIXO |
| `tornado` | `get_pfire_tornado()` --tornado subprocess | ⚠ | ok (4 variáveis) | MÉDIO 📌 |
| `trilha_p10` | `rodar_monte_carlo_com_trajetorias()` | ⚠ | ok (38 pontos) | MÉDIO 📌 |
| `trilha_p50` | idem | ⚠ | ok | MÉDIO 📌 |
| `trilha_p90` | idem | ⚠ | ok | MÉDIO 📌 |
| `trilha_datas` | idem | ⚠ | ok | BAIXO |

### FIRE Section (fire.*)

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `fire.coast_fire` | `compute_coast_fire()` | ✅ not None + coast_number_base isinstance float | ok | BAIXO |
| `fire.fire_spectrum` | `compute_fire_spectrum()` | ✅ not None + len==4 | ok | BAIXO |
| `fire.p_quality` | fire_montecarlo via dashboard_state.json | ✅ not None, 0-100 | ok | MÉDIO 📌 |
| `fire.p_quality_matrix` | `compute_p_quality_matrix()` | ✅ not None, keys A-E | ok | MÉDIO |
| `fire.p_quality_aspiracional` | dashboard_state.json --by_profile | ⚠ | 🔴 **NULL** — --by_profile não calcula aspiracional | **ALTO** |
| `fire.pat_mediano_fire` | fire_state.pat_mediano_fire53 | ⚠ | ok | BAIXO |
| `fire.pat_mediano_fire50` | fire_state.pat_mediano_fire50 | ⚠ | 🔴 **NULL** — chave stale; MC escreve `pat_mediano_aspiracional` | ALTO |
| `fire.plano_status` | `get_macro_data()` macro.plano_status | ⚠ | `inputs.drift_max_pp=null` (state.wellness.metrics.drift_max ausente) | MÉDIO |
| `fire.swr_current` | `main()` rf_total / gasto_anual | ⚠ | ok | BAIXO |
| `fire.p_quality_fav/stress/proxy/full` | dashboard_state.json | ⚠ | ok | MÉDIO 📌 |
| `fire.bond_pool_readiness` | `main()` inline | ⚠ | ok | BAIXO |
| `fire.bond_pool_status` | fire_montecarlo.PREMISSAS | ⚠ | ok | MÉDIO |
| `fire.by_profile` | fire_by_profile.json + fire_matrix.json | ⚠ | ok | MÉDIO 📌 |

### Cenários e Comparações

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `scenario_comparison` | `main()` dict | ⚠ | ok (pat_mediano=12.7M, swr=1.96%) | BAIXO |
| `earliest_fire` | `compute_earliest_fire()` | ⚠ | ok | BAIXO |

### Performance e Histórico

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `timeline` | `get_timeline_retornos()` CSV | ⚠ | ok | BAIXO |
| `retornos_mensais` | dados/retornos_mensais.json (reconstruct_history.py) | ⚠ | ok | BAIXO 📌 |
| `rolling_sharpe` | dados/rolling_metrics.json (reconstruct_history.py) | ⚠ | ok | BAIXO 📌 |
| `backtest` | `get_backtest()` backtest_portfolio.py | ⚠ | ok | MÉDIO |
| `backtestR5` | idem | ⚠ | ok | MÉDIO |
| `backtest_r7` | dados/backtest_r7.json (backtest_portfolio.py --r7) | ⚠ | ok (67.4h — stale) | **MÉDIO-ALTO** 📌 |
| `factor_rolling` | dados/factor_snapshot.json | ⚠ | ok | BAIXO 📌 |
| `factor_signal` | dados/factor_snapshot.json | ⚠ | ok | BAIXO 📌 |
| `factor_loadings` | dados/factor_snapshot.json | ⚠ | ok | BAIXO 📌 |
| `factor` | `main()` factor.value_spread | ⚠ | ok | BAIXO |
| `attribution` | `get_attribution()` | ✅ retornoUsd not None/0 | ok (por_bucket={} — possível limitação de dados) | MÉDIO |
| `timeline_attribution` | `get_timeline_attribution()` CSV | ⚠ | ok | BAIXO 📌 |
| `equity_attribution` | `main()` aportes.json + posicoes | ⚠ | ok | BAIXO |
| `premissas_vs_realizado` | `compute_premissas_vs_realizado()` | ⚠ | ok | BAIXO |

### RF / Renda Fixa

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `rf` | `get_rf()` state + holdings.md + nubank/resumo_td.json | ⚠ | cotas=null (design); total_resgatado_brl=0.0 (correto) | BAIXO |
| `hodl11` | `main()` yfinance + xp/lotes.json | ⚠ | ok | BAIXO |
| `dca_status` | `get_dca_status()` | ⚠ | ok | BAIXO |
| `semaforo_triggers` | `get_semaforo_triggers()` | ⚠ | ok | BAIXO |
| `guardrails_retirada` | `get_guardrails_retirada()` | ⚠ | ok | BAIXO |
| `bond_pool` | `compute_bond_pool_gap_m()` | ✅ not None | ok | BAIXO |
| `bond_pool_runway` | dados/bond_pool_runway.json | ⚠ | ok | BAIXO 📌 |
| `bond_pool_runway_by_profile` | `_compute_bond_pool_runway_by_profile()` BondPoolEngine | ⚠ | ok | BAIXO |
| `ntnb_history` | `build_ntnb_history()` pyield ANBIMA | ⚠ | ok | MÉDIO |

### Macro / Mercado

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `macro` | dados/macro_snapshot.json / `get_macro_data()` | ⚠ | `plano_status.inputs.drift_max_pp=null` | MÉDIO |
| `mercado` | `main()` yfinance + state.mercado_mtd | ⚠ | `renda2065_mtd_pp=null` (seed início de mês) | MÉDIO |
| `shadows` | `main()` state.shadows.q1_2026 | ⚠ | 🔴 `delta_vwra/delta_ipca/delta_shadow_c=null` — chave q1_2026 nunca criada | **ALTO** |

### Impostos / Passivos

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `tax` | TaxEngine + dados/tax_snapshot.json | ✅ estate_tax injetado depois | ok | BAIXO |
| `passivos` | `get_passivos()` hipoteca_sac.json + tax_data | ⚠ | ok | BAIXO |
| `realized_pnl` | reconstruct_realized_pnl.py | ⚠ | ok | BAIXO |
| `coe_net_brl` | `main()` ultima linha CSV | ⚠ | ok (64081) | BAIXO |

### TLH / Drift

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `tlh` | `main()` posicoes transitórios | ⚠ | ok | BAIXO |
| `tlh_lotes` | `_load_tlh_lotes()` dados/tlh_lotes.json | ⚠ | ok | BAIXO |
| `tlhGatilho` | `main()` TLH_GATILHO config.py | ⚠ | ok | BAIXO |

### Patrimônio Holístico

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `patrimonio_holistico` | `compute_patrimonio_holistico()` | ✅ financeiro_brl > R$1M | ok | BAIXO |
| `non_financial_assets` | `compute_non_financial_assets_projection()` | ✅ imovel e terreno not None, equity_liquido >= 0 | ok | BAIXO |
| `concentracao_brasil` | `compute_concentracao_brasil()` | ⚠ | ok | BAIXO |

### FIRE Snapshots (JSONs externos)

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `fire_matrix` | dados/fire_matrix.json (reconstruct_fire_data.py) | ⚠ | ok | BAIXO 📌 |
| `fire_swr_percentis` | dados/fire_swr_percentis.json | ⚠ | ok | BAIXO 📌 |
| `fire_aporte_sensitivity` | dados/fire_aporte_sensitivity.json | ⚠ | ok | BAIXO 📌 |
| `fire_trilha` | dados/fire_trilha.json | ⚠ | ok | BAIXO 📌 |
| `fire_montecarlo_liquido` | `run_canonical_mc_with_ir_discount()` | ⚠ | ok | BAIXO |
| `drawdown_history` | dados/drawdown_history.json (reconstruct_fire_data.py) | ⚠ | 🔴 `crises[1].drawdown_max=0.0` — COVID drawdown registrado como 0% | **ALTO** |
| `drawdown_extended` | `main()` inline backtest + R5 + R7 | ⚠ | ok | BAIXO |
| `etf_composition` | dados/etf_composition.json | ⚠ | 🔴 `SWRD.aum_eur=null` (yfinance não retorna totalAssets para UCITS) | **ALTO** |
| `lumpy_events` | dados/lumpy_events.json | ⚠ | ok (confirmado=False — design) | BAIXO |
| `fire_by_profile` | dados/fire_by_profile.json (fire_montecarlo --by_profile) | ⚠ | ok (29.4h) | MÉDIO 📌 |

### Métricas de Risco

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `risk` | `compute_risk_metrics(data)` risk_metrics.py | ✅ not None | `calmar_ratio=null` (histórico insuficiente), `semaforos.renda_plus_taxa.value=null` | MÉDIO |
| `renda_plus_mtm` | `compute_renda_plus_mtm()` | ✅ not None | ok | BAIXO |
| `breakeven_ipca_selic` | `compute_breakeven_ipca_selic()` | ✅ not None | ok | BAIXO |
| `vol_realizada` | `compute_vol_realizada()` | ✅ not None (com fallback) | ok | BAIXO |
| `retorno_decomposicao` | `compute_retorno_decomposicao()` | ✅ not None (com cache fallback) | ok | BAIXO 📌 |
| `correlation_stress` | `compute_correlation_stress()` | ✅ not None (com cache fallback) | ok | BAIXO 📌 |
| `spending_ceiling` | `compute_spending_ceiling_analytical()` | ✅ not None | ok | BAIXO |
| `pfire_sensitivity` | `compute_pfire_sensitivity()` | ✅ not None | ok | BAIXO 📌 |
| `spending_smile` | `main()` spending_smile_out de fire_montecarlo | ⚠ | ok | BAIXO |

### FIRE Planner / Eventos

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `spending_guardrails` | `compute_spending_guardrails()` GuardrailEngine | ⚠ | ok | BAIXO |
| `spending_breakdown` | dados/spending_summary.json | ⚠ | ok | BAIXO |
| `guardrails` | `main()` guardrails_raw de fire_montecarlo | ⚠ | ok | BAIXO |
| `gasto_piso` | `main()` GASTO_PISO de fire_montecarlo.py | ⚠ | ok | BAIXO |
| `saude_base` | `main()` premissas_raw.saude_base | ⚠ | ok | BAIXO |
| `eventos_vida` | `main()` hardcoded lista | ⚠ | ok | BAIXO |
| `human_capital` | `_compute_human_capital_crossover()` | ⚠ | ok | BAIXO |
| `contribuicao_retorno_crossover` | `compute_contribuicao_retorno_crossover()` | ⚠ | ok | BAIXO |
| `withdraw_cenarios` | `main()` fire_matrix.perfis + config | ⚠ | ok | BAIXO |

### Dashboard / Config

| Campo | Gerado por | Assertion? | Status | Risco |
|-------|-----------|-----------|--------|-------|
| `minilog` | `_build_minilog()` XP + IBKR + Nubank + Binance | ⚠ | ok | BAIXO |
| `wellness_config` | agentes/referencia/wellness_config.json | ⚠ | ok | BAIXO |
| `cryptoLegado` | `load_binance_brl()` dados/binance/posicoes.json | ⚠ | ok | BAIXO |
| `head_relay` | dados/head_relay.json | ⚠ | NULL — arquivo não existe (informativo, não crítico) | BAIXO |
| `spendingSensibilidade` | `main()` state.spending.scenarios | ⚠ | 🔴 EMPTY LIST — state.spending.scenarios vazio | MÉDIO |
| `priority_matrix` | agentes/contexto/priority_matrix.json | ✅ weights dict len==6 | ok | BAIXO |
| `domain_coverage` | `main()` IIFPT_COVERAGE config.py | ✅ len==6 | ok | BAIXO |
| `regime_vida` | `main()` hardcoded "r2_mid_career" | ✅ not None, isinstance str | ok | BAIXO |
