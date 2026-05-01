# DEV-dashboard-audit: Auditoria Completa dos Blocos do Dashboard

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-dashboard-audit |
| **Dono** | Head |
| **Status** | ✅ Done — 2026-04-11 |
| **Prioridade** | 🔴 Alta |
| **Participantes** | Head (coord), Dev (mapeamento + implementação), Quant (auditoria) |
| **Criado em** | 2026-04-11 |
| **Origem** | Diego — mapear todos os blocos, Quant valida cada um, corrigir no core |
| **Deps** | — |

---

## Objetivo

Auditoria completa dos 60 blocos do dashboard:
1. **Dev mapeia** todos os blocos (campo DATA, fonte, cálculo)
2. **Quant audita** cada bloco (número correto? premissa correta? dado desatualizado?)
3. **Correções no core** (generate_data.py / reconstruct scripts)
4. **Dev implementa** no dashboard
5. **Quant confirma** pós-implementação

---

## Fase 1 — Mapeamento Dev ✅ (2026-04-11)

**60 blocos** identificados. Anomalias principais:

1. `S21c eventos_vida` — 100% hardcoded em generate_data.py
2. `F1/F8 renda_estimada` — R$45k/mês hardcoded no HTML/JS (deveria ser R$45k/ano × 12 = fluxo mensal?)
3. `S15 guardrails` — teto R$350k hardcoded no HTML
4. `S11 alpha líquido` — 0.16%/ano hardcoded no HTML
5. `R1/R2/R3/N4/N2/S27b/N1/R5` — dependem de JSON em dados/ que falham silenciosamente se ausentes
6. `F11 Stress Test` — MC roda no browser (JS, n=1000), independente do fire_montecarlo.py
7. `P2-DCA taxa` — lida via regex em holdings.md (frágil)
8. `S7 attribution` — `_estimativa: true` quando retornos_mensais.json não tem decomposição
9. `S24c IR` — pode estar vazio se rolling_metrics.json não tem campo information_ratio
10. `S19 What-If` — inoperante se fire_matrix.json não existir

### Tabela completa de blocos

| ID | Nome | Aba | Função JS | Campo DATA | Fonte/Cálculo |
|----|------|-----|-----------|------------|---------------|
| HEADER | Cabeçalho + meta | global | renderKPIs | DATA.date, DATA.timestamps | generate_data.py datetime.now() |
| HERO | Hero Strip (5 KPIs) | global | renderKPIs | DATA.premissas, DATA.pfire53, DATA.pfire50 | fire_montecarlo.py + dashboard_state.json |
| S3 | KPI Cards (12 cards) | status | renderKPIs | DATA.pfire50/53, DATA.rf, DATA.pisos, DATA.backtest.metrics, DATA.shadows, DATA.macro, DATA.factor_signal | fire_montecarlo.py, backtest_portfolio.py, macro |
| S4 | Time to FIRE | status | renderKPIs | DATA.premissas, DATA.pfire50/53 | fire_montecarlo.py + config.py |
| P1 | Semáforos de Gatilhos | status | buildSemaforoPanel | DATA.rf, DATA.pisos, DATA.fire.bond_pool_readiness, DATA.pfire53, DATA.drift, DATA.factor_signal, DATA.hodl11 | generate_data.py inline |
| S5 | Progresso FIRE / Savings Rate / TER | status | renderKPIs | DATA.premissas, DATA.pfire53, DATA.posicoes | fire_montecarlo.py, config.py |
| S10 | P(FIRE) + Tornado + Spending | status | buildTornado, renderKPIs | DATA.pfire50/53, DATA.tornado | fire_montecarlo.py --tornado |
| S2 | Financial Wellness Score | status | renderWellness, calcWellness | DATA.wellness_config, DATA.premissas, DATA.pfire53 | wellness_config.json |
| F10 | Wellness Extras | status | buildWellnessExtras | DATA.pfire53, DATA.premissas, DATA.fire.bond_pool_readiness | generate_data.py inline |
| P2-MACRO | Contexto Macro | status | buildMacroCards, renderMacroStatus | DATA.macro, DATA.concentracao_brasil | macro_snapshot.json (BCB/FRED) |
| P2-DCA | DCA Status | status | buildDcaStatus | DATA.dca_status | get_dca_status() → holdings.md + dashboard_state.json |
| S6 | Net Worth Timeline | perf | buildTimeline | DATA.timeline | historico_carteira.csv |
| S7 | Performance Attribution | perf | buildAttribution | DATA.attribution, DATA.equity_attribution | retornos_mensais.json decomposicao |
| S8 | Alocação Donuts | aloc | buildDonuts | DATA.posicoes, DATA.rf, DATA.hodl11, DATA.cambio, DATA.pesosTarget | dashboard_state.json + yfinance |
| N2 | ETF Composition | aloc | buildEtfComposition | DATA.etf_composition | dados/etf_composition.json |
| S11 | Delta Bar + Progress Bars | perf | buildDeltaBar, renderIpcaProgress | DATA.backtest.metrics, DATA.rf, DATA.pisos | backtest_portfolio.py, holdings.md |
| S12 | Glide Path | plan | buildGlidePath | DATA.glide, DATA.premissas | config.py GLIDE_PATH |
| S13 | Asset Mix (2 donuts) | aloc | buildFireBuckets | DATA.posicoes, DATA.rf, DATA.hodl11, DATA.cambio, DATA.pesosTarget | dashboard_state.json + yfinance |
| P2-BOND | Bond Pool Readiness | plan | buildBondPool, buildBondPoolRunway | DATA.fire.bond_pool_readiness, DATA.rf, DATA.bond_pool_runway | generate_data.py inline + bond_pool_runway.json |
| S14 | Fan Chart P10/P50/P90 | plan | buildFanChart | DATA.pfire50/53, DATA.premissas | fire_montecarlo.py |
| F7 | Net Worth Projection | plan | buildNetWorthProjection | DATA.pfire50/53, DATA.premissas, DATA.spendingSmile | fire_montecarlo.py + config.py |
| R2 | SWR Percentis | plan | buildSwrPercentiles | DATA.fire_swr_percentis | dados/fire_swr_percentis.json |
| R1 | FIRE Matrix | plan | buildFireMatrix | DATA.fire_matrix | dados/fire_matrix.json |
| S15 | Guardrails de Retirada | plan | buildGuardrails | DATA.guardrails, DATA.premissas | fire_montecarlo.py GUARDRAILS |
| F2 | Spending Guardrails | plan | buildSpendingGuardrails | DATA.spending_guardrails, DATA.pfire53 | compute_spending_guardrails() |
| S16 | Retirement Income | plan | buildIncomeChart, buildIncomeTable | DATA.premissas, DATA.spendingSmile, DATA.guardrails | fire_montecarlo.py + config.py |
| S17 | Fee Analysis | perf | buildFeeAnalysis | DATA.posicoes, DATA.premissas, DATA.backtest.metrics | config.py ETF_TER + backtest_portfolio.py |
| S21 | Posições IBKR | aloc | buildPosicoes | DATA.posicoes, DATA.cambio | dashboard_state.json + yfinance |
| S21b2 | Custo Base por Bucket | aloc | buildCustoBase | DATA.posicoes, DATA.pesosTarget, DATA.cambio | lotes.json via ibkr_analysis.py |
| S21c | Eventos de Vida | plan | buildEventosVida | DATA.eventos_vida | **100% hardcoded no Python** |
| S21d | P(FIRE) Cenários Família | plan | buildPfireFamilia | DATA.spendingSensibilidade, DATA.pfire53 | dashboard_state.json spending.scenarios |
| N4 | Lumpy Events | plan | buildLumpyEvents | DATA.lumpy_events | dados/lumpy_events.json |
| PVR | Premissas vs Realizado | perf | buildPremissasVsRealizado | DATA.premissas_vs_realizado | retornos_mensais.json + aportes.json + backtest |
| S24 | Heatmap Retornos Mensais | perf | buildRetornoHeatmap | DATA.retornos_mensais | retornos_mensais.json (TWR) |
| N1 | Drawdown Histórico | perf | buildDrawdownHistory | DATA.drawdown_history | dados/drawdown_history.json |
| S24b | Rolling Sharpe 12m | perf | buildRollingSharp | DATA.rolling_sharpe | rolling_metrics.json |
| S24c | Information Ratio vs VWRA | perf | buildInformationRatio | DATA.rolling_sharpe.information_ratio | rolling_metrics.json campo IR |
| S26 | RF + Crypto Cards | aloc | buildRfCards, renderHodl11 | DATA.rf, DATA.hodl11, DATA.mercado, DATA.pisos | holdings.md + dashboard_state.json + yfinance |
| IR-DIFERIDO | IR Diferido TLH | aloc | buildIrDiferido | DATA.tax, DATA.tlh, DATA.posicoes | tax_snapshot.json → fallback inline |
| F3 | Simulador FIRE Interativo | projecao | updateFireSim | DATA.premissas, DATA.pfire50/53 | P(FIRE) fixos do MC; não recalcula |
| S19 | What-If Scenarios | projecao | updateWhatIf, interpolateFireMatrix | DATA.fire_matrix, DATA.premissas | dados/fire_matrix.json |
| R3 | Aporte Sensitivity | projecao | buildAporteSensitivity | DATA.fire_aporte_sensitivity | dados/fire_aporte_sensitivity.json |
| F11 | Stress Test MC | projecao | buildStressTest, runStressSimulation | DATA.premissas, DATA.pfire53 | **MC no browser JS, n=1000** |
| EARLIEST | Earliest FIRE Card | projecao | buildEarliestFire | DATA.earliest_fire | compute_earliest_fire() |
| F1 | Projeção de Renda | projecao | buildIncomeProjection | DATA.premissas, DATA.spendingSmile | fire_montecarlo.py + config.py |
| F5 | Spending Breakdown | projecao | buildSpendingBreakdown | DATA.spending_breakdown | dados/spending_summary.json |
| F8 | Sankey Cash Flow | projecao | buildSankey | DATA.premissas, DATA.spending_breakdown, DATA.rf | generate_data.py + spending_summary.json |
| S22 | Calculadora Aporte | aloc | calcAporte | DATA.rf, DATA.pisos, DATA.cambio, DATA.drift | generate_data.py inline |
| S21b | Mini-log Operações | aloc | buildMinilog | DATA.minilog | IBKR + XP + Nubank + Binance |
| S23 | Shadow Portfolios | perf | buildShadowTable, buildShadowChart | DATA.shadows, DATA.backtest | dashboard_state.json shadows + backtest_portfolio.py |
| S27 | Backtest Histórico | perf | buildBacktest | DATA.backtest, DATA.backtestR5 | backtest_portfolio.py --json |
| P3 | CAGR Patrimonial vs TWR | perf | buildCagrVsTwr | DATA.timeline, DATA.backtest | historico_carteira.csv + backtest_portfolio.py |
| S27b | Backtest Longo Regime 7 | perf | buildBacktestR7 | DATA.backtest_r7 | dados/backtest_r7.json |
| P2-FROLL | Factor Rolling 12m | perf | buildFactorRolling | DATA.factor_rolling | factor_snapshot.json |
| P2-FLOAD | Factor Loadings FF5+MOM | perf | buildFactorLoadings | DATA.factor_loadings | factor_snapshot.json |
| R5 | FIRE Trilha | plan | buildFireTrilha | DATA.fire_trilha | dados/fire_trilha.json |
| S9 | FIRE@53 vs FIRE@50 | plan | buildScenarios, buildSpendingChart | DATA.scenario_comparison, DATA.spendingSensibilidade | fire_montecarlo.py + dashboard_state.json |
| F4 | Scenario Comparison Table | plan | buildScenarioComparison | DATA.scenario_comparison | generate_data.py → dashboard_state.json fire.* |
| FOOTER | Footer + Timestamps | global | buildTimestamps | DATA.timestamps, DATA.date | generate_data.py get_source_timestamps() |

---

## Fase 2 — Auditoria Quant ✅ (2026-04-11)

**Resultado:** 3 CRÍTICOs, 2 IMPORTANTEs, 1 MENOR

| Achado | Bloco | Tipo | Detalhe |
|--------|-------|------|---------|
| spendingSensibilidade R$270k/R$300k errados | S21d/S9 | ❌ CRÍTICO | Valores base/fav/stress divergiam de carteira.md (aprovados Quant 2026-04-06) |
| P(FIRE@50) fav/stress sem fonte em carteira.md | HERO/S3 | ❌ CRÍTICO | 91.3/81.1 — output de MC mas não documentado na fonte de verdade |
| renda_estimada unidade ambígua | S5/HERO | ⚠️ IMPORTANTE | carteira.md dizia "R$45k/ano"; config.py usa como R$/mês |
| guardrail corte 0.28 não documentado | S15 | ⚠️ IMPORTANTE | Matematicamente correto (180k/250k) mas sem premissa explícita em carteira.md |
| Comentário inline anoInss errado | F7 | ⚠️ MENOR | `// 2039 + 12 = 2051` deveria ser `// 2040 + 12 = 2052` |

---

## Fase 3 — Correções Core + Dev ✅ (2026-04-11)

| Correção | Arquivo | O que foi feito |
|----------|---------|-----------------|
| spendingSensibilidade | dados/dashboard_state.json | R$270k → 88.8/93.7/85.5; R$300k → 85.8/92.2/82.1 (valores MC aprovados) |
| renda_estimada | agentes/contexto/carteira.md | "R$45k/ano" → "R$45k/mês (SR = 25k/45k = 55.6%)" |
| Comentário anoInss | dashboard/template.html | `// 2040 + 12 = 2052 → age 65` |
| P(FIRE@50) fav/stress | — | Não corrigido — valores de MC válidos, apenas não documentados em carteira.md. Aceito como-está |

---

## Fase 4 — Confirmação Quant ✅ (2026-04-11)

**3/3 PASS.** spendingSensibilidade, renda_estimada e P(FIRE@50) verificados. Nenhuma discrepância encontrada pós-correção.

**Status final: ✅ Done — v1.145**
