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
| _(vazio)_ | | | |

### Blocked
> Issues aguardando dependências externas

(vazio)

### Backlog
> Issues prontas para execução, aguardando vez

| ID | Titulo | Dono | Prioridade | Dependências |
|----|--------|------|------------|--------------|
| HD-holding-e-seguro | Holding Familiar e Seguro de Vida — Avaliação Patrimonial | Head + Patrimonial | 🟡 Média | — |
| DEV-sector-exposure | Sector Exposure Bottom-Up — GICS por ETF | Dev | 🟢 Baixa | Mesma fonte que overlap |
| DEV-efficient-frontier | Fronteira Eficiente de Markowitz | Dev | 🟢 Baixa | scipy disponível |
| DEV-data-dedup | Deduplicação de Séries — drawdown_extended, .values legado, cache yfinance | Dev | 🟢 Baixa | — |

### Done
> Issues concluídas. Arquivos movidos para `archive/`.

| ID | Titulo | Data | Resumo |
|----|--------|------|--------|
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
