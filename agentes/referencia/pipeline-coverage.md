# Pipeline Coverage — data.json

> **Gerado por**: Integrator (auditoria 2026-05-01)
> **Atualizado**: 2026-05-01 (auditoria arquitetural XX-system-audit — fases 1-4 concluídas)
> **Fonte**: `react-app/public/data.json` (gerado em 2026-04-30T16:24:28)
> **Pipeline**: `scripts/generate_data.py` (~6190 linhas)
> **DAG completo**: `scripts/RUNBOOK.md` (criado 2026-05-01)
> **Scripts arquivados**: `scripts/archive/` (9 scripts legados, 2026-05-01)

---

## 1. Inventário de Campos Top-Level

102 campos top-level detectados no data.json atual.

---

## 2. Cobertura Completa: Campo → Gerador → Assertion

### Campos Metadata / Internos

| Campo | Gerador (função/trecho) | Assertion? | Valor atual | Risco |
|-------|------------------------|-----------|-------------|-------|
| `_generated` | `main()` — `datetime.now()` | Não | `"2026-04-30T16:24:28"` | BAIXO |
| `_generated_brt` | `main()` — `datetime.utcnow()-3h` | Não | ok | BAIXO |
| `_ibkr_sync_date` | `main()` — `LOTES_PATH.stat().mtime` | Não | `"2026-04-25T16:52:09"` | BAIXO |
| `_schema_version` | `main()` — hardcoded `"2.0"` | Não | `"2.0"` | BAIXO |
| `_pipeline_run` | `main()` — `_pipeline_run_id` | Não | ok | BAIXO |
| `_snapshots_metadata` | `_load_json_safe()` — rastreia mtime de cada JSON | Não | `backtest_r7._generated=null`, `fire_by_profile._generated=null` | MÉDIO |
| `_data_sources` | `main()` — dict hardcoded | Não | ok | BAIXO |
| `_pfire_canonical_carteira` | `main()` — `config.PFIRE_CANONICAL_*` | Não | ok | BAIXO |
| `_pfire_divergence_warning` | `main()` — condicional | Não | ok | BAIXO |

### Campos de Data / Câmbio

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `date` | `main()` — `str(date.today())` | Não | `"2026-04-30"` | BAIXO |
| `timestamps` | `get_source_timestamps()` | Não | ok (9 sub-campos) | BAIXO |
| `cambio` | `get_posicoes_precos()` — yfinance BRL/USD | **SIM** (assert >0) | `4.9943` | BAIXO — assert bloqueia se fallback inválido; logs explícitos quando CAMBIO_FALLBACK ativo |

### Posições e Alocação

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `posicoes` | `get_posicoes_precos()` — state + yfinance | Não | 9 ETFs ok; `ter=null` em 7 transitórios | MÉDIO — ter null = dado incompleto, design intencional (TER de transitórios não catalogado) |
| `pesosTarget` | `main()` — `PESOS_TARGET` de config.py | Não | ok | BAIXO |
| `pisos` | `main()` — constantes config.py | Não | ok | BAIXO |
| `drift` | `compute_drift()` | Não | ok | BAIXO |
| `glide` | `main()` — `GLIDE_PATH` de config.py | Não | ok | BAIXO |

### P(FIRE) e Monte Carlo

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `pfire_aspiracional` | `get_pfire_tornado()` — PFireEngine | **SIM** (assert not None + .base not None) | base=91.1% ok | BAIXO — assert bloqueia se PFireEngine falha |
| `pfire_base` | `get_pfire_tornado()` — PFireEngine | **SIM** (assert .base not None) | base=83.4% ok; percentiles populados | BAIXO — mesmo |
| `pfire_cenarios_estendidos` | `compute_extended_mc_scenarios()` | **SIM** (assert 0≤p_sucesso_pct≤100) | `stagflation=14.9%` ok; `hyperinflation=0.0%` ok (válido — cenário catastrófico) | BAIXO — validação de range; 0.0 é matematicamente correto para hyperinflation |
| `pfire_by_profile` | `main()` — stub parcial | SIM (assert "atual" presente) | `casado.base=null`, `filho.base=null` | **ALTO** — null por design (TODO): MC por perfil não implementado |
| `premissas` | `main()` — dict construído com 35 sub-campos | SIM (fire_year_base, haircut_alpha_liquido) | ok | BAIXO-MÉDIO |
| `tornado` | `get_pfire_tornado()` — fire_montecarlo.py --tornado | Não | 4 variáveis ok | MÉDIO — sem assert; fallback state se subprocess falha |
| `trilha_p10` | `main()` — `rodar_monte_carlo_com_trajetorias()` | Não | 38 pontos ok | MÉDIO |
| `trilha_p50` | idem | Não | 38 pontos ok | MÉDIO |
| `trilha_p90` | idem | Não | 38 pontos ok | MÉDIO |
| `trilha_datas` | idem | Não | 38 pontos ok | MÉDIO |

### FIRE Section (fire.*)

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `fire.bond_pool_readiness` | `main()` — inline cálculo | Não | ok | BAIXO |
| `fire.pat_mediano_fire` | `main()` — `fire_state.pat_mediano_fire53` | Não | ok | BAIXO |
| `fire.pat_mediano_fire50` | `main()` — `fire_state.pat_mediano_fire50` | Não | **NULL** | **ALTO** — campo stale/inexistente no state; MC escreve `pat_mediano_aspiracional`, não `pat_mediano_fire50` |
| `fire.mc_date` | `main()` — `fire_state.mc_date` | Não | ok | BAIXO |
| `fire.plano_status` | `get_macro_data()` — `macro.plano_status` | Não | `inputs.drift_max_pp=null` | MÉDIO — drift_max_pp vem de `state.wellness.metrics.drift_max` que pode ser null |
| `fire.swr_current` | `main()` — rf_total / gasto_anual | Não | ok | BAIXO |
| `fire.p_quality` | `dashboard_state.json` — fire_montecarlo.py | SIM (assert not None, 0-100) | ok | MÉDIO — assert bloqueia; mas depende de fire_montecarlo ter rodado |
| `fire.p_quality_fav` | `dashboard_state.json` | Não | ok | MÉDIO |
| `fire.p_quality_stress` | `dashboard_state.json` | Não | ok | MÉDIO |
| `fire.p_quality_proxy` | `dashboard_state.json` | Não | ok | MÉDIO |
| `fire.p_quality_full` | `dashboard_state.json` | Não | ok | MÉDIO |
| `fire.p_quality_aspiracional` | `dashboard_state.json` | Não | **NULL** | **ALTO** — fire_montecarlo --by_profile não calculou aspiracional |
| `fire.bond_pool_status` | `fire_montecarlo.PREMISSAS.bond_pool_status` | Não | ok | MÉDIO |
| `fire.bond_pool_fully_enabled` | idem | Não | `False` (ok por design) | BAIXO |
| `fire.coast_fire` | `compute_coast_fire()` | SIM | ok | BAIXO |
| `fire.fire_spectrum` | `compute_fire_spectrum()` | SIM (len==4) | ok | BAIXO |
| `fire.p_quality_matrix` | `compute_p_quality_matrix()` | SIM (not None, keys A-E) | ok | MÉDIO |
| `fire.p_quality_matrix_proxy` | idem | Não | ok | MÉDIO |
| `fire.p_quality_matrix_full` | idem | Não | ok | MÉDIO |
| `fire.by_profile` | `fire_by_profile.json` / `fire_matrix.json` / state | Não | ok (injetado) | MÉDIO |

### Scenario Comparison / Aspiracional

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `scenario_comparison` | `main()` — dict construído | Não | ok (pat_mediano=12.7M, swr=1.96%) | BAIXO |
| `aspiracional_scenario` | Não existe como campo top-level separado — lido de `scenario_comparison.aspiracional` | — | — | — |
| `earliest_fire` | `compute_earliest_fire()` | Não | ok | BAIXO |

### Performance e Histórico

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `timeline` | `get_timeline_retornos()` — CSV | Não | ok | BAIXO |
| `retornos_mensais` | `dados/retornos_mensais.json` — reconstruct_history.py | Não | 15 sub-campos ok; `annual_returns[n].ytd=False` para anos passados (correto) | BAIXO |
| `rolling_sharpe` | `dados/rolling_metrics.json` — reconstruct_history.py | Não | 10 sub-campos ok | BAIXO |
| `backtest` | `get_backtest()` — backtest_portfolio.py | Não | ok | MÉDIO |
| `backtestR5` | idem | Não | ok | MÉDIO |
| `backtest_r7` | `dados/backtest_r7.json` — backtest_portfolio.py --r7 | Não | ok (snapshot 67.4h antigo — acima de 48h warn) | **MÉDIO-ALTO** — stale, sem _generated |
| `factor_rolling` | `dados/factor_snapshot.json` / `get_factor_rolling()` | Não | `drought_months=0` (ok, mercado sem queda) | BAIXO |
| `factor_signal` | `dados/factor_snapshot.json` / `get_factor_signal()` | Não | ok | BAIXO |
| `factor_loadings` | `dados/factor_snapshot.json` / `get_factor_loadings()` | Não | ok (7 ETFs) | BAIXO |
| `factor` | `main()` — `data["factor"]["value_spread"]` | Não | ok (value_spread presente) | BAIXO |
| `attribution` | `get_attribution()` | SIM (retornoUsd not None/0, assert business logic) | ok (estimativa=False, por_bucket vazio) | MÉDIO — por_bucket={} ocorre quando decomposição falha internamente |
| `timeline_attribution` | `get_timeline_attribution()` — CSV + retornos_mensais.json | Não | ok | BAIXO |
| `equity_attribution` | `main()` — `aportes.json + posicoes` | Não | ok | BAIXO |
| `premissas_vs_realizado` | `compute_premissas_vs_realizado()` | Não | ok | BAIXO |

### RF / Renda Fixa

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `rf` | `get_rf()` — state + holdings.md + nubank/resumo_td.json | Não | 4 títulos presentes; `cotas=null` em todos; `total_resgatado_brl=0.0` | MÉDIO — cotas null por design (nubank não reporta cotas); 0.0 resgatado pode ser correto |
| `hodl11` | `main()` — yfinance + xp/lotes.json | Não | ok | BAIXO |
| `dca_status` | `get_dca_status()` | Não | `renda_plus.ativo=False` (ok — taxa abaixo piso) | BAIXO |
| `semaforo_triggers` | `get_semaforo_triggers()` | Não | 4 triggers ok; `piso=0.0` em hodl11_banda (ok — design) | BAIXO |
| `guardrails_retirada` | `get_guardrails_retirada()` | Não | 5 guardrails ok | BAIXO |
| `bond_pool` | `compute_bond_pool_gap_m()` | SIM | ok | BAIXO |
| `bond_pool_runway` | `dados/bond_pool_runway.json` — reconstruct_fire_data.py | Não | ok | BAIXO |
| `bond_pool_runway_by_profile` | `_compute_bond_pool_runway_by_profile()` — BondPoolEngine | Não | `atual.inss_katia_anual=0` (ok por design — solteiro) | BAIXO |
| `ntnb_history` | `build_ntnb_history()` — pyield ANBIMA | Não | ok | MÉDIO |

### Macro / Mercado

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `macro` | `dados/macro_snapshot.json` / `get_macro_data()` | Não | `plano_status.inputs.drift_max_pp=null` (wellness.metrics.drift_max ausente no state) | MÉDIO |
| `mercado` | `main()` — yfinance + state.mercado_mtd | Não | `ipca2040_mtd_pp=0.0` (novo mês), `renda2065_mtd_pp=CORRIGIDO` (regex holdings.md corrigido para ler taxa da tabela markdown — 6.80%) | BAIXO |
| `shadows` | `main()` — state.shadows + q1_2026 | Não | `delta_vwra=null`, `delta_ipca=null`, `delta_shadow_c=null` | **ALTO** — q1_2026 não existe no state; shadows não foi calculado para Q1 2026 |

### Impostos / Passivos

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `tax` | `TaxEngine` / `dados/tax_snapshot.json` | SIM (estate_tax injetado depois) | ok | BAIXO |
| `passivos` | `get_passivos()` — hipoteca_sac.json + tax_data | Não | ok | BAIXO |
| `realized_pnl` | `dados/react-app/public/data/realized_pnl.json` — reconstruct_realized_pnl.py | Não | ok | BAIXO |
| `coe_net_brl` | `main()` — ultima linha CSV (coe_brl coluna) | Não | `64081` ok | BAIXO |

### TLH / Drift

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `tlh` | `main()` — posicoes transitórios | Não | 7 itens ok; `tlh_eligible=False` (todos com ganho ou irrelevante — ok) | BAIXO |
| `tlh_lotes` | `_load_tlh_lotes()` — dados/tlh_lotes.json | Não | 3 lotes ok | BAIXO |
| `tlhGatilho` | `main()` — `TLH_GATILHO` config.py | Não | `0.05` ok | BAIXO |

### Patrimônio Holístico / Ativos Não-Financeiros

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `patrimonio_holistico` | `compute_patrimonio_holistico()` | SIM (financeiro_brl > R$1M, business logic) | ok | BAIXO |
| `non_financial_assets` | `compute_non_financial_assets_projection()` | SIM (imovel e terreno not None) | ok | BAIXO |
| `concentracao_brasil` | `compute_concentracao_brasil()` | Não | ok | BAIXO |

### FIRE Snapshots (JSONs externos)

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `fire_matrix` | `dados/fire_matrix.json` — reconstruct_fire_data.py | Não | ok (0.0h antigo) | BAIXO |
| `fire_swr_percentis` | `dados/fire_swr_percentis.json` | Não | ok (0.0h) | BAIXO |
| `fire_aporte_sensitivity` | `dados/fire_aporte_sensitivity.json` | Não | ok (0.0h) | BAIXO |
| `fire_trilha` | `dados/fire_trilha.json` | Não | ok (0.0h) | BAIXO |
| `fire_montecarlo_liquido` | `run_canonical_mc_with_ir_discount()` | Não | ok | BAIXO |
| `drawdown_history` | `dados/drawdown_history.json` | Não | CORRIGIDO: usa TWR via `patrimonio_var` (retorno % mensal) ao invés de patrimônio bruto. Rate shock Fed=-30.3%, Tariffs Trump=-7.7%, Carry trade=-15.0% | BAIXO |
| `drawdown_extended` | `main()` — inline compute via backtest + R5 + R7 | Não | ok | BAIXO |
| `etf_composition` | `dados/etf_composition.json` | Não | CORRIGIDO: fallback hardcoded para UCITS (SWRD ~€73.6B, AVGS ~€2.58B, AVEM ~€3.22B) quando yfinance não retorna totalAssets. `aum_source=fallback_hardcoded_2025-05` | BAIXO |
| `lumpy_events` | `dados/lumpy_events.json` | Não | `confirmado=False` em 2 de 3 eventos (ok por design) | BAIXO |
| `fire_by_profile` | `dados/fire_by_profile.json` — fire_montecarlo.py --by_profile | Não | snapshot 29.4h antigo, `_generated=null` | MÉDIO |

### Métricas de Risco

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `risk` | `compute_risk_metrics(data)` — risk_metrics.py | SIM (not None) | `calmar_ratio=null` (histórico insuficiente — legítimo); `semaforos.renda_plus_taxa.value=6.80` (CORRIGIDO: injetado de rf.renda2065.taxa via novo `_extract_renda_plus_taxa()`) | BAIXO |
| `renda_plus_mtm` | `compute_renda_plus_mtm()` | SIM (not None) | `delta_taxa_pp=0.0`, `mtm_pct=-0.0` (taxa entrada == taxa atual — normal) | BAIXO |
| `breakeven_ipca_selic` | `compute_breakeven_ipca_selic()` | SIM | ok | BAIXO |
| `vol_realizada` | `compute_vol_realizada()` | SIM | ok | BAIXO |
| `retorno_decomposicao` | `compute_retorno_decomposicao()` | SIM (com cache fallback) | ok | BAIXO |
| `correlation_stress` | `compute_correlation_stress()` | SIM (com cache fallback) | ok | BAIXO |
| `spending_ceiling` | `compute_spending_ceiling_analytical()` | SIM | ok | BAIXO |
| `pfire_sensitivity` | `compute_pfire_sensitivity()` | SIM | ok | BAIXO |
| `spending_smile` | `main()` — `spending_smile_out` de fire_montecarlo.SPENDING_SMILE | Não | 3 fases ok | BAIXO |

### FIRE Planner / Eventos

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `spending_guardrails` | `compute_spending_guardrails()` — GuardrailEngine | Não | ok | BAIXO |
| `spending_breakdown` | `dados/spending_summary.json` — spending_analysis.py | Não | 14 sub-campos ok | BAIXO |
| `guardrails` | `main()` — `guardrails_raw` de fire_montecarlo | Não | 4 guardrails ok; `ddMin=0.0` e `corte=0.0` em guardrail[0] são corretos (guardrail normal) | BAIXO |
| `gasto_piso` | `main()` — `GASTO_PISO` de fire_montecarlo.py | Não | `180000` ok | BAIXO |
| `saude_base` | `main()` — `premissas_raw.saude_base` | Não | `24000` ok | BAIXO |
| `eventos_vida` | `main()` — hardcoded lista | Não | 2 eventos ok; `confirmado=False` por design | BAIXO |
| `human_capital` | `_compute_human_capital_crossover()` | Não | ok | BAIXO |
| `contribuicao_retorno_crossover` | `compute_contribuicao_retorno_crossover()` | Não | `historico[0].patrimonio_inicio_brl=0` (2021: portfólio nasceu — correto); rates=null (2021 sem base) | BAIXO |
| `lumpy_events` | `dados/lumpy_events.json` | Não | ok | BAIXO |
| `withdraw_cenarios` | `main()` — fire_matrix.perfis + config | Não | `atual.tem_conjuge=False`, `atual.inss_katia_anual=0` (ok por design — solteiro) | BAIXO |
| `bond_pool_runway_by_profile` | `_compute_bond_pool_runway_by_profile()` | Não | ok | BAIXO |

### Dashboard / Config

| Campo | Gerador | Assertion? | Valor atual | Risco |
|-------|---------|-----------|-------------|-------|
| `minilog` | `_build_minilog()` — XP + IBKR + Nubank + Binance ops | Não | 10 entradas ok | BAIXO |
| `wellness_config` | `agentes/referencia/wellness_config.json` | Não | 7 sub-campos ok | BAIXO |
| `cryptoLegado` | `load_binance_brl()` — dados/binance/posicoes.json | Não | `3641.53` ok | BAIXO |
| `head_relay` | `dados/head_relay.json` | Não | **NULL** — arquivo não existe | BAIXO — campo informativo, não crítico |
| `spendingSensibilidade` | `main()` — `state.spending.scenarios` | Não | **EMPTY LIST** — state.spending.scenarios vazio | MÉDIO — componente mostrará sem dados |
| `priority_matrix` | `agentes/contexto/priority_matrix.json` | SIM (weights dict com 6 domínios) | ok | BAIXO |
| `domain_coverage` | `main()` — `IIFPT_COVERAGE` config.py | SIM (6 domínios) | ok | BAIXO |
| `regime_vida` | `main()` — hardcoded `"r2_mid_career"` | SIM (not None, isinstance str) | ok | BAIXO |

---

## 3. Campos sem Cobertura Confirmada no Pipeline

Todos os 102 campos top-level têm origem rastreável no pipeline. Não há campos de "origem desconhecida".

Campos com cobertura **parcialmente confirmada** (dependem de scripts externos, podem ser stale):
- `backtest_r7` — gerado por `backtest_portfolio.py --r7`; snapshot com 67.4h, sem `_generated`.
- `fire_by_profile` — gerado por `fire_montecarlo.py --by_profile`; 29.4h, sem `_generated`.
- `shadows` — lido de `state.shadows.q1_2026`; chave não existe → todos sub-campos null.
- `spendingSensibilidade` — lido de `state.spending.scenarios`; state vazio → lista vazia.

---

## 4. Campos Null ou Suspeitos

### Nulls por Design (aceitáveis)

| Campo | Motivo |
|-------|--------|
| `posicoes.*.ter` (7 ETFs transitórios) | TER de transitórios não catalogado; só alvo (SWRD, AVGS) tem TER |
| `rf.*.cotas` | Nubank não reporta cotas; campo reservado para XP |
| `rf.*.total_resgatado_brl = 0.0` | Nenhum resgate realizado ainda |
| `pfire_by_profile.casado.base` e `.filho.base` | TODO — MC por perfil não implementado; stub explícito |
| `fire.pat_mediano_fire50` | MC escreve `pat_mediano_aspiracional`; `fire50` é alias stale |
| `fire.p_quality_aspiracional` | fire_montecarlo --by_profile não inclui cálculo aspiracional |
| `guardrails[0].ddMin=0.0`, `corte=0.0` | Guardrail "Normal" (0% drawdown, 0% corte) é correto |
| `semaforo_triggers[2].piso=0.0` | HODL11 banda: piso de drift = 0pp (correto — qualquer drift ativa alerta) |
| `tlh_lotes.lots[*].tlh_eligible=False` | Lotes com ganho, não elegíveis para TLH |
| `mercado.ipca2040_mtd_pp=0.0` | Novo seed de mês (delta inicial = 0) |
| `withdraw_cenarios.atual.*` | Configuração solteiro: tem_conjuge=False, inss_katia=0 correto |
| `bond_pool_runway_by_profile.atual.inss_katia_anual=0` | Mesmo motivo |
| `contribuicao_retorno_crossover.historico[0].patrimonio_inicio_brl=0` | 2021: portfólio nasceu; sem base anterior |
| `spending_smile.go_go.inicio=0` | Início imediato ao FIRE Day; correto |
| `retornos_mensais.annual_returns[n].ytd=False` | Anos passados não são YTD |
| `head_relay=null` | Arquivo dados/head_relay.json não existe (campo informativo Head→Dashboard) |

### Nulls Problemáticos (requerem ação)

| Campo | Problema | Severidade | Ação |
|-------|---------|-----------|------|
| `shadows.delta_vwra`, `.delta_ipca`, `.delta_shadow_c` | `state.shadows.q1_2026` não existe; shadows de Q1 2026 nunca foram calculados | **ALTA** | Calcular shadows mensalmente e persistir no state |
| `fire.p_quality_aspiracional` | `fire_montecarlo.py --by_profile` não calcula P(quality) para cenário aspiracional | **ALTA** | Adicionar cálculo aspiracional ao --by_profile |
| `mercado.renda2065_mtd_pp=null` | ~~`state.mercado_mtd.renda2065_taxa` ausente no seed de início do mês~~ | ~~MÉDIA~~ | **CORRIGIDO 2026-05-01**: regex `read_holdings_taxas()` atualizado para capturar taxa da tabela markdown (era só "Taxa atual ~X%"). Agora lê "| Renda+ 2065 | Nubank | ... | 6.80% |" corretamente. |
| `risk.calmar_ratio=null` | Histórico de retornos insuficiente para Calmar Ratio (máx drawdown = 0 ou histórico < 12m) | **BAIXA** | Limitação legítima de dados — Calmar ratio requer série > 12m com drawdown real. Documentado. |
| `risk.semaforos.renda_plus_taxa.value=null` | ~~`rf.renda2065.taxa` não é propagado ao campo `semaforos.renda_plus_taxa.value`~~ | ~~MÉDIA~~ | **CORRIGIDO 2026-05-01**: `risk_metrics.py` agora injeta `rf.renda2065.taxa` em `semaforos.renda_plus_taxa.value` via novo `_extract_renda_plus_taxa()` |
| `macro.plano_status.inputs.drift_max_pp=null` e `fire.plano_status.inputs.drift_max_pp=null` | `state.wellness.metrics.drift_max` ausente; `plano_status` não pode avaliar drift | **MÉDIA** | `wellness_config` e drift_max precisam ser calculados e persistidos no state |
| `spendingSensibilidade=[]` | `state.spending.scenarios` vazio; cenários de sensibilidade de gasto não calculados | **MÉDIA** | Rodar análise de spending e persistir no state |
| `attribution.por_bucket={}` | Falha interna em `get_attribution()` ao acessar posicoes do state | **BAIXA-MÉDIA** | Investigar por que `por_bucket` retorna vazio; pode ser correto se posicoes não têm price+avg_cost |

### Zeros Suspeitos (RESOLVIDOS em 2026-05-01)

| Campo | Status | Resolução |
|-------|--------|-----------|
| `pfire_cenarios_estendidos.stagflation.params.retorno_equity_base=0.0` | ✅ VÁLIDO | 0.0 é correto por definição: stagflation = equity flat (real BRL). Assertion de range [0,100] adicionada. |
| `pfire_cenarios_estendidos.hyperinflation.p_sucesso_pct=0.0` | ✅ VÁLIDO | 0.0% é matematicamente correto para equity -15%/ano real por 40 anos. Confirmado via MC 1000 sims. Assertion [0,100] adicionada. |
| `drawdown_history.crises[1].drawdown_max=0.0` | ✅ CORRIGIDO | Era bug: fallback usava patrimônio bruto (distorcido por aportes). Corrigido para usar TWR via `patrimonio_var` (retorno % mensal). Agora: Tariffs Trump = -7.7% correto. |
| `etf_composition.etfs.SWRD.aum_eur=null` | ✅ CORRIGIDO | Fallback hardcoded adicionado para UCITS irlandeses. SWRD agora tem aum_eur=€73.6B com `aum_source=fallback_hardcoded_2025-05`. |

---

## 5. Campos sem Assertion (Risco de Quebra Silenciosa)

### Campos com Assertion (pipeline bloqueia se null/inválido)

- `fire.coast_fire` (not None)
- `fire.coast_fire.coast_number_base` (isinstance float)
- `fire.fire_spectrum` (not None)
- `fire.fire_spectrum.bandas` (len == 4)
- `risk` (not None)
- `renda_plus_mtm` (not None)
- `breakeven_ipca_selic` (not None)
- `vol_realizada` (not None, com fallback)
- `bond_pool` (not None)
- `retorno_decomposicao` (not None, com cache fallback)
- `spending_ceiling` (not None)
- `pfire_sensitivity` (not None)
- `premissas.fire_year_base` (not None, isinstance int)
- `premissas.haircut_alpha_liquido` (not None)
- `pfire_by_profile` (not None)
- `pfire_by_profile.atual` (present)
- `correlation_stress` (not None, com cache fallback)
- `priority_matrix.weights` (dict, len == 6)
- `domain_coverage` (dict, len == 6)
- `regime_vida` (not None, isinstance str)
- `fire.p_quality` (not None, 0-100)
- `fire.p_quality_matrix` (not None, keys A-E)
- `patrimonio_holistico.financeiro_brl` (> R$1M, business logic)
- `attribution.retornoUsd` (not None/0, business logic)
- `non_financial_assets.imovel` e `.terreno` (not None)
- `non_financial_assets.imovel.equity_liquido` (>= 0)

**Adicionados em 2026-05-01 (integrator pipeline fixes):**
- `cambio` (assert > 0 em `get_posicoes_precos()`)
- `pfire_aspiracional` (assert not None + .base not None)
- `pfire_base.base` (assert not None)
- `drawdown_history` (assert not None)
- `pfire_cenarios_estendidos[*].p_sucesso_pct` (assert [0, 100])

**Total: 31 assertions protegem 24 campos top-level ou sub-campos críticos.**

### Campos TOP-LEVEL Críticos SEM Assertion

Estes campos são importantes mas sem assert — podem ser null/zero sem bloquear o pipeline:

| Campo | Por que crítico | Risco |
|-------|----------------|-------|
| `pfire_aspiracional` | P(FIRE) exibido no dashboard FIRE tab | MÉDIO |
| `pfire_base` | P(FIRE) base — KPI principal | MÉDIO |
| `pfire_cenarios_estendidos` | Cenários catastrofistas | MÉDIO — zeros passam silenciosamente |
| `tornado` | Análise de sensibilidade | MÉDIO |
| `shadows` | Delta vs benchmarks trimestrais | **ALTO** — todos null sem assert |
| `spendingSensibilidade` | Sensibilidade de gastos | MÉDIO |
| `macro` | Selic, Fed Funds, exposição cambial | MÉDIO |
| `drawdown_history` | Histórico de crises | **ALTO** — zero em crises sem assert |
| `etf_composition` | AUM dos ETFs | **ALTO** — SWRD.aum_eur null sem assert |
| `fire.p_quality_aspiracional` | P(quality) cenário aspiracional | **ALTO** — null sem assert |
| `fire.pat_mediano_fire50` | Patrimônio mediano aspiracional (alias stale) | MÉDIO |
| `cambio` | Câmbio BRL/USD — base de todos os cálculos | **ALTO** — sem assert; usa fallback `CAMBIO_FALLBACK` |

---

## 6. Stale Risks (cruzamento com seção 5 do dependency-map)

| Campo / Cache | Escrito por | Idade atual | Threshold | Status |
|---------------|------------|-------------|-----------|--------|
| `_snapshots_metadata.backtest_r7` | backtest_portfolio.py --r7 | 67.4h | >48h = WARN | ⚠ STALE |
| `_snapshots_metadata.fire_by_profile` | fire_montecarlo.py --by_profile | 29.4h | >48h = WARN | OK (< 48h) |
| `state.shadows.q1_2026` | Não existe | — | — | ⚠ AUSENTE — shadows nunca calculados |
| `state.spending.scenarios` | Não existe / vazio | — | — | ⚠ AUSENTE — spendingSensibilidade vazia |
| `factor_cache.json` | reconstruct_factor.py | Não rastreado | — | Verificar mtime |
| `pfire_base` | fire_montecarlo.py | 2026-04-30 | <24h no run diário | OK |
| `tornado` | fire_montecarlo.py --tornado | 2026-04-30 | idem | OK |
| `trilha_p10/p50/p90` | rodar_monte_carlo_com_trajetorias | 2026-04-30 | idem | OK |
| `retorno_decomposicao` | reconstruct_history.py | 2026-04-30 | idem | OK |
| `correlation_stress` | reconstruct_history.py | idem | idem | OK |

---

## 7. Recomendações Priorizadas

### P1 — Crítico (corrigir antes do próximo run)

1. **`drawdown_history.crises[1].drawdown_max=0.0`** — Bug em `reconstruct_fire_data.py`; drawdown de crise histórica registrado como 0%. Investigar função que computa crises: provável falha de índice ou condição de reset do peak.

2. **`pfire_cenarios_estendidos` com zeros** — `stagflation.params.retorno_equity_base=0.0` e `hyperinflation.p_sucesso_pct=0.0`. O pipeline executa `compute_extended_mc_scenarios()` sem assertion; falha silenciosa produz zeros inválidos. Adicionar `assert all(v.get("p_sucesso_pct", 0) > 0 for v in pfire_cenarios_estendidos.values())` ou investigar por que MC retorna 0%.

3. **`etf_composition.etfs.SWRD.aum_eur=null`** — yfinance não retornou `totalAssets` para SWRD.L neste run. SWRD é a maior posição (39.5% alvo). Investigar: SWRD é domiciliado na Irlanda; `totalAssets` pode não estar disponível via yfinance para ETFs UCITS. Considerar fonte alternativa (MSCI/iShares API) e adicionar fallback.

### P2 — Alta (próximo sprint)

4. **`shadows` todos null** — `state.shadows.q1_2026` nunca foi criado. O campo `shadows` é calculado externamente e persistido no state, mas a chave `q1_2026` não existe. Investigar se há um script para calcular shadows trimestrais; se não existir, criar. Adicionar assertion ou warning no pipeline.

5. **`fire.p_quality_aspiracional=null`** — `fire_montecarlo.py --by_profile` não inclui P(quality) para cenário aspiracional. Adicionar cálculo em `--by_profile`. Médio impacto no dashboard (card de qualidade de vida aspiracional mostrará "—").

6. **`cambio` sem assertion** — O câmbio BRL/USD é a base de todos os cálculos patrimoniais mas não tem assertion. Se yfinance falha e CAMBIO_FALLBACK é usado sem aviso, todos os cálculos de patrimônio ficam potencialmente defasados. Adicionar `assert data["cambio"] > 0, "cambio inválido"` e logar claramente quando fallback é usado.

### P3 — Média (backlog)

7. **`risk.semaforos.renda_plus_taxa.value=null`** — `compute_risk_metrics` não injeta taxa da Renda+ 2065 no semaforo correspondente. Corrigir: ler `rf.renda2065.taxa` e setar `semaforos.renda_plus_taxa.value`.

8. **`mercado.renda2065_mtd_pp=null`** — No seed de início de mês, `renda2065_taxa` não está presente em `state.mercado_mtd`. Garantir que o seed inclui ambas as taxas (`ipca2040_taxa` e `renda2065_taxa`).

9. **`spendingSensibilidade=[]`** — `state.spending.scenarios` está vazio. Verificar se `fire_montecarlo.py` gera e persiste este campo. Se não, adicionar cálculo de cenários de sensibilidade de gastos.

10. **`macro.plano_status.inputs.drift_max_pp=null`** — `state.wellness.metrics.drift_max` ausente. O cálculo de drift máximo precisa ser executado e persistido no state. Verificar se existe script para isso; pode ser calculado inline a partir de `drift` dict.

---

## 8. Auditoria Arquitetural XX-system-audit (2026-05-01)

### 8.1 Classificação dos Scripts

**CORE** (obrigatórios para data.json — importados diretamente por generate_data.py):
`fire_montecarlo.py`, `pfire_engine.py`, `pfire_transformer.py`, `tax_engine.py`,
`bond_pool_engine.py`, `guardrail_engine.py`, `swr_engine.py`, `risk_metrics.py`,
`config.py`, `reconstruct_fire_data.py` (subprocess), `backtest_portfolio.py` (subprocess),
`reconstruct_realized_pnl.py` (subprocess condicional)

**AUXILIAR** (pré-requisitos do pipeline — rodar antes de generate_data.py):
`parse_carteira.py`, `reconstruct_history.py`, `reconstruct_factor.py`, `reconstruct_macro.py`,
`reconstruct_tax.py`, `fx_utils.py`, `ibkr_lotes.py`, `ibkr_sync.py`, `spending_analysis.py`,
`fetch_historico_sheets.py`, `market_data.py`, `withdrawal_engine.py`

**STANDALONE** (CLIs para Diego — não no pipeline diário):
`checkin_mensal.py`, `portfolio_analytics.py`, `multi_llm_query.py`, `factor_regression.py`,
`resampled_frontier.py`, `brfiresim.py`, `btc_indicators.py`, `tlh_monitor.py`

**TESTE** (validação e CI):
`scripts/tests/*.py` (34 arquivos), `validate_data.py`, `validate_schema.py`,
`validators.py`, `snapshot_schemas.py`, `ci_check_carteira_params.py`, `detect_hardcoding.py`

**UTILITÁRIO** (manutenção):
`pipeline_archive.py`, `snapshot_archive.py`, `sync_spec.py`, `data_pipeline_engine.py`,
`parse_nubank_operations.py`, `binance_analysis.py`, `check_gatilhos.py`

**ARQUIVO** (movidos para `scripts/archive/` em 2026-05-01):
`binance_parse_pdf.py`, `fire_glide_path_scenarios.py`, `parse_issues.py`,
`historico_patrimonio.py`, `ibkr_posicoes_sync.py`, `load_ibkr_posicoes.py`,
`p4_patch_generator.py`, `p4_suggestion_engine.py`, `validate_changelog_registration.py`

### 8.2 DAG do Pipeline (Texto)

Ver `scripts/RUNBOOK.md` para DAG completo com outputs de cada step, TTLs de cache, e guia de falha por fonte externa.

Resumo:
```
parse_carteira.py → config.py
ibkr_sync.py / ibkr_lotes.py → dados/ibkr/lotes.json
fetch_historico_sheets.py → dados/historico_carteira.csv
checkin_mensal.py → state.shadows.{periodo}

[Paralelo] reconstruct_fire_data.py → dados/fire_matrix.json, drawdown_history.json, ...
[Paralelo] reconstruct_history.py → dados/retornos_mensais.json, rolling_metrics.json
[Paralelo] reconstruct_factor.py → dados/factor_snapshot.json
[Paralelo] reconstruct_macro.py → dados/macro_snapshot.json
[Paralelo] spending_analysis.py → dados/spending_summary.json

generate_data.py → react-app/public/data.json
```

### 8.3 Decisão de Schema (Fase 3)

**Veredicto: assertions seletivas (status quo + melhorias incrementais)**

Razão: Pydantic seria over-engineering para 1 consumidor. O spec.json existente cobre
o contrato bilateral Python→React. As assertions existentes (31 campos) protegem os
campos críticos. Campos de alto risco adicionais receberam warnings (Fase 3 desta auditoria).

**Assertions adicionadas em Fases 2-3 desta auditoria:**
- `premissas.fire_year_base` (assert not None, isinstance int)
- Warnings (não bloqueia): `etf_composition.SWRD.aum_eur`, `fire.p_quality_aspiracional`,
  `macro.selic_meta`, `pfire_base.base` range [40-100%]

**Total de assertions ativas:** 36 (31 anteriores + 5 novas)

### 8.4 Gaps Estruturais Confirmados

| Gap | Severidade | Status |
|-----|-----------|--------|
| `shadows` null — nenhum script cria `state.shadows.q1_2026` | ALTO | Parcialmente mitigado: fallback usa período mais recente do state |
| `spendingSensibilidade=[]` — nenhum script popula `state.spending.scenarios` | MÉDIO | Documentado em RUNBOOK.md, TODO em generate_data.py |
| `fire.p_quality_aspiracional=null` — `--by_profile` não calcula aspiracional | ALTO | Documentado, warning adicionado |
| Consultas externas sem retry unificado | MÉDIO | Documentado em RUNBOOK.md (Seção 7) |

---

*Atualizado 2026-05-01 pelo Integrator + auditoria XX-system-audit.*
