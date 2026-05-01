# Issues — Carteira Diego

> **FONTE ÚNICA DE VERDADE.**
> Este arquivo é o board completo. Nenhuma issue existe fora dele.
> Arquivos `.md` aqui são specs de suporte — a issue vive no board, não no arquivo.
> Issues concluídas: `archive/`. Nada mais existe no root desta pasta.

---

## Protocolo

| Ação | Como |
|------|------|
| **Abrir issue** | 1) Criar `{ID}.md` em `agentes/issues/` · 2) Adicionar linha no board (Discovery ou Backlog) |
| **Mover status** | Editar APENAS este README — mover linha entre seções |
| **Concluir issue** | 1) Mover linha para Done neste README · 2) `mv {ID}.md archive/` |
| **Ler o board** | Ler APENAS este README — nunca escanear a pasta inteira |

**Agentes**: ao criar ou fechar issue, atualizar ESTE arquivo na mesma operação. Sem exceções.

---

## Board

### Discovery
> Temas no radar — monitoramento passivo ou aguardando evento externo

| ID | Titulo | Dono | Prioridade |
|----|--------|------|------------|
| PT-planejamento-patrimonial | Planejamento patrimonial pré-casamento | Patrimonial | 🟢 Espera evento (casamento) |
| HD-plataforma-wm | Explorar plataforma de wealth management como produto | Head | 🟢 Revisitar 2027 |
| HD-gatilho-soberano | Quantificar gatilho "risco soberano extremo" para IPCA+ | Head | 🟢 Monitoramento — escalar se IPCA+ >30% portfolio |
| TX-reforma-tributaria | Monitor reforma tributária (PL 2.337+) | Tax | 🟢 Scan trimestral |
| TX-lei14754-juridico | Monitor evolução jurídica Lei 14.754/2023 | Tax | 🟢 Scan trimestral |
| XX-benchmark-portfolio-visualizer | Investigação — Portfolio Visualizer (backtesting, factor analysis, Monte Carlo) | Head | 🟡 Aguardando decisão Head |
| XX-benchmark-morningstar | Investigação — Morningstar (X-Ray, overlap detection, factor profile) | Head | 🟡 Aguardando decisão Head |
| XX-benchmark-empower | Investigação — Personal Capital/Empower (net worth tracking, retirement planner) | Head | 🟡 Aguardando decisão Head |

### Doing
> Issues em andamento

| ID | Titulo | Dono | Prioridade |
|----|--------|------|------------|

(vazio)

### Blocked
> Issues aguardando dependências externas

(vazio)

### Backlog
> Issues prontas para execução, aguardando vez

| ID | Titulo | Dono | Prioridade | Dependências |
|----|--------|------|------------|--------------|
| HD-holding-e-seguro | Holding Familiar e Seguro de Vida — Avaliação Patrimonial | Head + Patrimonial | 🟡 Média | — |

### Done
> Issues concluídas. Arquivos movidos para `archive/`.

| ID | Titulo | Data | Resumo |
|----|--------|------|--------|
| DEV-data-dedup | Deduplicação de séries no pipeline e data.json | 2026-05-02 | 3 fases entregues. **Fase 1** (`.values` legado em `retornos_mensais`): removido do pipeline; `compute_rolling_sharpe` (linha 1303) lê `twr_pct` com fallback. data.json antes/depois: campo ausente — alias 100% removido. **Fase 2** (cache yfinance compartilhado): `_get_shared_price_series(tickers, start)` (linha 1401) cacheia in-memory por run; `get_factor_rolling()` popula com `start=2019-01-01`, `get_factor_signal()` reusa via slice (sem novo download), `compute_risk_return_by_bucket()` permanece com seu próprio cache 24h em `dados/fetch_cache.json` (período diferente: 2012+). Reduz 2 calls yfinance/run de SWRD.L+AVGS.L. **Fase 3** (drawdown_extended derivação no TS): `medium`/`long`/`academic` removidos do JSON; `DrawdownExtendedChart.tsx` deriva via `computeDrawdownFromPrices()` (running-max idêntico ao Python, diff max=0.0). Único período no JSON: `real` (não-derivável, vem do TWR histórico). Tamanho data.json: ~478 KB (após dedup). Validações: 744 vitest + 101 Playwright + 6 pipeline E2E verdes. Trabalho de implementação fora deste turno (commits efe49de3 + da10fa42); fechamento do board hoje. |
| DEV-spending-append-only | Spending summary append-only — fluxo mensal eficiente | 2026-05-02 | `spending_analysis.py` migrou para helpers `append_only.py` (`load_or_init` + `merge_append` + `write_with_meta`), `METODOLOGIA_VERSION_SPENDING="spending-actual-v1"`. Regra "mês fechado" custom: mês N só fecha a partir do dia 5 do mês N+1 (margem para fatura cair) — implementada via `_spending_effective_today` que desloca o `today` em -4 dias antes de chamar `is_period_closed`. Agregados (`must_spend_mensal`, `total_anual`, etc.) são derivados — sempre recomputados sobre o `monthly_breakdown` final. Flag `--rebuild` adicionada. **Backfill abril/2026**: 9 meses cobertos (2025-08 a 2026-04), abril com R$25.399 total / R$17.966 essenciais / R$7.234 opcionais / R$200 imprevistos — bate exato com relatório do bookkeeper. **Tempo medido**: append novo em ~70ms (alvo <30s, vs 7min do pipeline anterior — ganho 6000×). **Idempotency** + **equivalência rebuild↔append** validadas bit-for-bit. `spending_summary.json` adicionado ao `test_pipeline_idempotency.py` (artefato 7). `generate_data.py` agora delega via `find_latest_csv()` (passa a procurar em `analysis/raw/` também). Suite full: 744 vitest + 101 Playwright + 6 pipeline E2E verdes. |
| DEV-efficient-frontier-v2 | Efficient Frontier v2 — Black-Litterman + Sharpe líquido + regime + banner v1 | 2026-05-02 | **v2 estende v1**: (1) **Banner permanente** "diagnóstico, não meta" sempre visível (Michaud Resampled). (2) **Regime label** do value spread no canto: lê `factor.value_spread.percentile_hml` (já calculado no pipeline) — 🟢 amplo P≥70 / ⚪ neutro / 🔴 comprimido P<30. Atual P42 → **neutro**. (3) **Black-Litterman substitui Forward** (Idzorek 2005): prior π via reverse-optimization sobre w_mkt (MSCI ACWI 60/30/10 mapeado via alocação atual + RF/HODL11 atual), λ=2.5, τ=0.05, Ω diagonal `τ·diag(P·Σ·P')`, views Q=AQR/RA convertidos USD→BRL real. Posterior bayesiano valida: avg(posterior_views)∈[min(prior,view), max(prior,view)]±2pp; sem sign-flip em views >5pp; range -10%..30%. Bloco `bl_meta` documenta λ/τ/Ω/Q/π/posterior para auditoria. (4) **Sharpe líquido** em todos os pontos (`sharpe_net`): custo 0.05% spread sobre |Δ| + IR 15% sobre vendas (Lei 14.754 ETF exterior; isenta TD HTM PF; come-cotas Renda+; HODL11 15%). Premissa conservadora: 100% do valor vendido tratado como ganho. Custo one-off amortizado em 10y. Diferença Histórica MaxSharpe bruto 0.816 vs líquido 0.795 (gap 2pp); BL MaxSharpe bruto 0.038 vs líquido 0.001 (gap 4pp por causa do rebalance R$1.27M de SWRD ⇒ R$190k de IR). (5) **Tabela delta R$ + IR** para Max Sharpe e Min Vol — privacy mode preservado via `fmtPrivacy`. **Testes**: 29 Python (16 v1 + 8 BL + 5 Sharpe net), 8 Vitest novos, 1 Playwright semantic novo. Suite completa: 744 vitest, 101 Playwright, 6 pipeline E2E — todos verdes. **Quant** validou calibração (λ/τ/Ω corretos, sanity checks passam, posterior estabiliza vs views nuas); **Tax** validou tratamento IR (Lei 14.754 confirmada, TD HTM isento, come-cotas Renda+, HODL11 15%, IOF irrelevante em janela >30d). |
| DEV-top5-msci-benchmark | Top-5 Holdings — benchmark MSCI World | 2026-05-02 | Marcador amarelo MSCI World inline + Δ vs benchmark no tooltip do Top-5 concentrações em PORTFOLIO (mesmo padrão visual do `SectorExposureChart`). Backend: pipeline `_compute_overlap_detection()` em `generate_data.py` enriquece `top_concentrations[]` com `msci_world_pct` (snapshot factsheet abr/2026 — AAPL 5.30%, MSFT 4.20%, NVDA 5.10%, AMZN 2.40%) e `msci_world_note`; Samsung 005930 fica `null` com nota "fora do MSCI World (Coreia — apenas MSCI EM/ACWI)". Frontend: `OverlapChart` ganha prop `showMsciBenchmark` no `StackedEtfBars`, scatter amarelo (`symbol: rect`, `[3,18]`) com `null` para suprimir o marcador da Samsung; tooltip mostra peso carteira + linha MSCI World + Δ pp (verde >0, vermelho <0, muted < 0.5pp); fallback "n/a" + nota quando ação fora do MSCI. Privacy mode preservado. 7 testes Vitest novos + 736 vitest + 100 Playwright + 6 pipeline E2E verdes. |
| DEV-efficient-frontier | Fronteira Eficiente de Markowitz (Histórica + Forward) | 2026-05-02 | Quant validou metodologia; Head fixou universo (6 ativos: SWRD/AVGS/AVEM/RF_EST/RF_TAT/HODL11), caps anti-corner (50/35/25/30/10/5) e grupos Equity∈[50,90]% RF∈[5,30]%. `scripts/reconstruct_efficient_frontier.py` gera duas fronteiras: **Histórica** (μ=média 10y mensalizada, cov=Ledoit-Wolf shrinkage) e **Forward** (μ=AQR/Research Affiliates USD nominal − 2.5pp inflação USD ≈ BRL real, cov=histórica + disclaimer Black-Litterman v2). RF=5.34% real BRL como ancora-real (IPCA+ longo HTM, vol=0). Optimização SLSQP. Sanity checks bloqueantes: pesos somam 1, sem short, retorno monotônico, vol convexa, max_sharpe ∈ fronteira. **Insights — Histórica:** Max Sharpe (SWRD 43%, AVGS 14%, AVEM 8%, RF_EST 20%, RF_TAT 10%, HODL11 5%) gera Sharpe 0.816 vs carteira atual 0.730 — modelo recomenda menos AVGS/AVEM e adicionar RF_TAT 10% + HODL11 ao máximo. **Forward:** com US Large 3.1% (RA), modelo joga SWRD para o cap mínimo (10%, equity floor) e maximiza AVGS/AVEM — Max Sharpe 0.043 (positivo) vs carteira atual −0.042 (gap de 0.085 Sharpe). Componente `EfficientFrontierChart.tsx` (ECharts scatter+line) com toggle Histórica↔Forward + Crypto ON/OFF, tooltip com pesos ótimos, default colapsado em Portfolio. 16 testes Python pytest + 729 vitest + 100 Playwright verdes. |
| DEV-sector-exposure | Sector Exposure Bottom-Up — GICS por ETF | 2026-05-01 | `SectorExposureChart` (ECharts stacked horizontal bar, 11 setores GICS) wireado em Portfolio. Pipeline inline em `generate_data.py` com `_compute_sector_exposure()`: distribuições proxy SWRD/AVGS/AVEM (somam 100% intra-ETF) ponderadas por `EQUITY_WEIGHTS` (50/30/20) → exposição agregada % do equity. Benchmark MSCI World inline + Δ vs benchmark no tooltip. Insight chave: portfolio 50/30/20 (market-cap + value tilt) tem **Financials 20.9% > Tech 18.6%** (vs MSCI World Tech 24.5% > Fin 16.2%) — value tilt visível no perfil setorial. 7 testes Python + 10 testes Vitest + semantic Playwright verde. Mesma fonte proxy do `overlap_detection`; integração com CSVs SSGA/Avantis fica para issue futura. |
| DEV-pipeline-fail-fast | Pipeline fail-fast — eliminar fallbacks silenciosos | 2026-05-01 | `scripts/validate_env.py` invocado upfront em `generate_data.py`: pacotes core ausentes (yfinance/pyield/getfactormodels/bcb/fredapi) → RuntimeError em <1s com hint pro venv canônico. `get_factor_value_spread()` agora `assert_optional_pkg` + raise (era `return None` silencioso, causa do bug original 344/345). `btc_indicators.fetch_daily_prices_binance()` upgradou para `logger.warning` antes do return None (P3, fallback legítimo de correlação 90d). 9 testes novos cobrindo fail-fast paths e cache hit. Decisão: outras ocorrências de `except: return None` em generate_data.py são cascatas defensivas legítimas (FED snapshot, NTN-B per-day retry, taxa Renda+ cascade) — mantidas com fallbacks explícitos. Suite full verde (98 Playwright, 719 vitest, 6 pipeline E2E). |
| DEV-spec-contract-fix | Spec contract fix — factor.value_spread | 2026-05-01 | Spec contract estava 344/345 porque rodadas via `python3` (system) não tinham `getfactormodels`, e `get_factor_value_spread()` falhava silenciosamente exportando None. HODL11 (pnl_brl/pnl_pct) e fire_montecarlo_liquido — campos previstos no spec original — já estavam corretos; o único campo divergente era `factor.value_spread`. Regenerado via venv canônico (`~/claude/finance-tools/.venv/bin/python3`). 345/345 OK. Suite full verde. |
| DEV-pipeline-append-only | Pipeline append-only — séries históricas determinísticas | 2026-05-01 | 6 artefatos com `_meta.metodologia_version` + merge append-only (P1-P5). Lote A (retornos/historico/rolling) + Lote B (drawdown/fire_trilha) + Lote C (tlh_lotes com realizados append + open_lots snapshot, validado pela Tax) + R7 versionado. Teste E2E `test_pipeline_idempotency.py` — 6/6 PASS em 2× consecutivas. |
| DEV-pipeline-gaps-p2 | Pipeline Gaps P2 — spendingSensibilidade, p_quality_aspiracional, fetch_with_retry | 2026-05-01 | Gap 1: state.spending.scenarios populado via MC real (3 cenários R$250k/270k/300k). Gap 2: p_quality_aspiracional confirmado funcionando (55.0%). Gap 3: 11 NAKED_INTEGRATION → 0; fetch_with_retry uniforme em yfinance/BCB/FRED. |
| DEV-overlap-chart-v2 | Overlap Chart v2 — ticker + labels inline + top-5 concentração | 2026-05-01 | Grid 2 colunas (overlaps + top-5 totais), ticker no eixo Y, % inline com threshold 0.05%, privacy preservada. |
| DEV-overlap-detection | Overlap Detection ETFs — SWRD/AVGS/AVEM | 2026-05-01 | OverlapChart implementado. Dados proxy sintéticos. Pipeline inline em generate_data.py. |
| XX-system-audit | Auditoria Sistêmica Completa | 2026-05-01 | 12+ problemas estruturais corrigidos. Backlog documentado em DEV-pipeline-gaps-p2. |
| DEV-style-box | Style Box 3×3 via Factor Loadings | 2026-05-01 | StyleBoxChart implementado. |
| DEV-risk-return-scatter | Gráfico Retorno vs. Risco por Classe de Ativos | 2026-05-01 | RiskReturnScatter com marcos históricos. |
| FR-fan-chart-mc | Fan Chart P10/P50/P90 — Trajetórias MC | 2026-05-01 | PostFireFanChart implementado. |
| FR-bond-pool-tracker | Bond Pool Depletion Tracker | 2026-05-01 | BondPoolDepletionChart implementado. |
| FR-spending-timeline | Spending Timeline — Gastos anuais por componente | 2026-05-01 | SpendingTimelineChart implementado. |
| FR-withdrawal-rate-chart | Withdrawal Rate + INSS Floor | 2026-05-01 | WithdrawalRateChart implementado. |
| FR-networth-overlay | Historical Net Worth Overlay | 2026-05-01 | Fechado: já coberto por TrackingFireChart. |
| HD-projection-lab-audit | Auditoria Projection Lab vs Dashboard Diego | 2026-05-01 | 5 features priorizadas, todas implementadas. |
| DEV-arch-fixes | Implementar Backlog ARCH-audit (P1/P2/P3) | 2026-04-30 | ECharts typing, dead code, usePageData. |
| DEV-qa-improvements | Melhorias QA — Fases 1+2 | 2026-04-30 | Privacy regression, 40 test files. |
| DEV-privacy-audit-react | Auditoria Privacy Mode — Dashboard React | 2026-04-30 | useEChartsPrivacy() aplicado. |
| FR-audit-p2-improvements | P2 Melhorias — 40 itens | 2026-04-30 | Todos endereçados. |
| FR-audit-p1-missing | P1 Info Crítica — 12/13 gaps | 2026-04-30 | G1-G13 implementados. |
| DEV-iifpt-dashboard | Dashboard IIFPT | 2026-04-30 | IifptRadar, badge, nota KpiHero. |
| HD-iifpt-integration | Framework IIFPT à Carteira | 2026-04-30 | Λ calibrado, coupling reference. |
| QA-test-plan-audit | Auditoria e Melhoria dos Planos de Teste | 2026-04-30 | 3 gaps críticos + plano 3 fases. |
| ARCH-audit | Auditoria de Arquitetura do Dashboard React | 2026-04-30 | 6 categorias, backlog P1/P2/P3. |
| HD-gaps-aposenteaos40-spec | Coast FIRE + FIRE Spectrum + brFIRESim | 2026-04-30 | 3 features implementadas. |
| HD-benchmark-aposenteaos40 | Benchmark vs lab.aposenteaos40.org | 2026-04-30 | 7 ferramentas mapeadas. |
| FR-mc-bond-pool-partial-isolation | Bond Pool Partial Isolation no MC | 2026-04-29 | Isolation gradual. 18 testes. |
| FR-mc-bond-pool-isolation | Bond Pool Isolation Real no MC | 2026-04-29 | vol=0 nos primeiros 6 anos. |
| FR-pquality-recalibration | Recalibração P(quality) | 2026-04-29 | PQualityMatrix 5×3×3. |
| FR-regime-switching-model | Regime Switching no MC FIRE | 2026-04-29 | NÃO implementar — limitação documentada. |
| FR-pfire-model-robustness | Auditoria Robustez P(FIRE) | 2026-04-29 | RF bug 6.0%→5.34%. Intervalo 72-92%. |
| FR-saude-modelo-custo | Auditoria Custo de Saúde no MC | 2026-04-29 | VCMH 5%→3.5%, SAUDE_DECAY 50%→15%. |
| HD-pfire-consistencia-modelo | Consistência do Modelo P(FIRE) | 2026-04-29 | Aceitar 79.0%. by_profile re-rodado. |
| FR-guardrails-categoria-elasticidade | Saúde nos Guardrails MC | 2026-04-28 | Saúde inelástica separada. |
| HD-dashboard-gaps-tier2 | Dashboard Gaps Tier 2 | 2026-04-28 | 8/8 gaps implementados. |
| HD-dashboard-gaps-tier1 | Dashboard Gaps Tier 1 | 2026-04-28 | 10/11 gaps implementados. |
| HD-risco-portfolio | Mapeamento Completo de Risco | 2026-04-27 | Risk Score 7.7/10. 6 blocos R1-R6. |
| HD-pipeline-observabilidade | Observabilidade do Pipeline | 2026-04-27 | Staleness badge, IBKR sync, sync_spec.py. |
| DATA_PIPELINE_CENTRALIZATION | Data Snapshot Orchestration | 2026-04-27 | 7/7 invariants. PIPELINE_PHASES DAG. |
| IBKR-PHASE-3B | IBKR Data Integration | 2026-04-27 | FIFO+Flex 53 trades. DARF panel. |
| PFIRE_PHASE4_DATA_GEN | Full Data.json Generation | 2026-04-27 | generate_data.py completo. |
| HD-ARCHITECT-P4 | Auto-Fix Suggestion Engine | 2026-04-27 | SuggestionEngine + --fix CLI. |
| HD-ARCHITECT | Guardião de Arquitetura | 2026-04-27 | Zero hardcoding violations. |
| HD-ARCHITECT-P3 | 323 Violations Refactored | 2026-04-27 | Estate tax centralizado. |
| HD-ARCHITECT-P2 | AST + Grep Detection | 2026-04-27 | 323 violations detectadas. |
| HD-ARCHITECT-P0P1 | Automação + Validação | 2026-04-27 | P0 e P1 concluídos. |
| DEV-semantic-test-coverage | Semantic tests + data-testid | 2026-04-27 | 9 testids, semantic-smoke.spec.ts. |
| FI-jpgl-redundancia | JPGL 20% — manter, reduzir ou remover? | Factor | 2026-03-31 | MANTER 20%. 7-0. |
| HD-python-stack | Automação com Python stack | Head | 2026-03-30 | 3 scripts criados. Otimizador de aporte. |
| PT-onelife | Bond OneLife | Patrimonial | 2026-03-27 | 9-0 contra entrar. |
| XX-casamento | Casamento iminente — recalibrar FIRE | Head | 2026-04-02 | P(FIRE 55 casal)=77,1%. |
| FR-fire2040 | FIRE 2040: bond tent, guardrail | FIRE | 2026-03-27 | Bond tent = 5% do ganho. |
| FR-spending-smile | Spending smile + saúde | FIRE | 2026-03-27 | P(sucesso) 80.8% base. |
| HD-psicologia | Psicologia cognitiva | Head | 2026-03-26 | 7 implementações. |
| HD-behavioral | Behavioral checklist | Advocate | 2026-03-26 | 9 itens adicionados. |
| RF-renda-teto | Teto ótimo Renda+ 2065 | RF | 2026-03-26 | 5% confirmado. |
| MA-equity-br | Equity Brasil | Macro | 2026-03-26 | 0% equity BR. |
| TX-inss-beneficio | Estimativa INSS | Tax | 2026-03-26 | R$14-28k/ano real. |
| TX-desacumulacao | Custos tributários pós-FIRE | Tax | 2026-03-26 | Saving líquido ~R$12k/ano. |
| RK-managed-futures | Managed Futures | Risco | 2026-03-26 | Zero MF. |
| RK-gold-hedge | Ouro como hedge | Risco | 2026-03-26 | Zero ouro. |
| MA-bond-correlation | Correlação stock-bond | Macro | 2026-03-26 | IPCA+ HTM = carry, não hedge. |
| HD-brazil-concentration | Exposição real ao Brasil | FX | 2026-03-26 | Concentração 62.9% estrutural. |
| HD-scorecard | Scorecard + shadow portfolios | Advocate | 2026-03-26 | P(FIRE)=91% preenchido. |
| HD-equity-weight | 79% equity correto? | FIRE | 2026-03-25 | Confirmado. |
| FR-glide-path | Glide path pré-FIRE | FIRE | 2026-03-25 | Sem glide path formal. |
| TX-tlh-automation | Tax-loss harvesting | Tax | 2026-03-22 | Não aplicável. Framework registrado. |
| FR-bond-tent-pre-fire | Bond tent pré-FIRE v2 | FIRE | 2026-03-22 | 15% IPCA+ longo + 3% IPCA+ curto. |
| RK-stress-soberano | Stress test risco soberano Brasil | Risco | 2026-03-22 | Bloco ~21% aceito. |
| HD-premissas-audit | Audit premissas (retornos, breakeven, IR) | Head | 2026-03-22 | 9+4 erros corrigidos. |
| FR-monte-carlo | Monte Carlo 10k trajetórias | FIRE | 2026-03-22 | Pat mediano R$10.56M. SR R$250k: 91%. |
| HD-scorecard-metricas | Scorecard métricas do sistema | Advocate | 2026-03-20 | Baseline T0 preenchido. |
| RF-duration-renda2065 | Duration risk Renda+ 2065 | RF | 2026-03-20 | Target revertido para 5%. |

---

## Convenção de IDs

Formato: `{SIGLA}-{slug-descritivo}`

| Sigla | Domínio |
|-------|---------|
| HD | Head de Investimentos |
| FI | Factor Investing |
| RF | Fixed Income |
| FR | FIRE / Aposentadoria |
| TX | Tributação |
| RK | Risco / Tático |
| MA | Macro |
| PT | Patrimonial |
| DEV | Dashboard / Pipeline |
| XX | Cross-domain |

---

## Template

Ver `_TEMPLATE.md`. Criar arquivo SOMENTE quando registrar no board simultaneamente.
