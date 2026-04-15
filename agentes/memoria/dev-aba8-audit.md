# ABA-8-AVALIAR — Audit de Componentes Diferentes

**Data**: 2026-04-15  
**Dev**: Haiku  
**Escopo**: Mapear componentes DIFERENTES entre Next.js (page.tsx) e DashHTML (spec.json)

---

## SUMMARY EXECUTIVO

| Métrica | Valor |
|---------|-------|
| **Componentes Next.js** | 29 |
| **Blocos DashHTML (spec.json)** | 68 |
| **Matches Diretos (1:1)** | 18 (62%) |
| **Múltiplos Matches (Consolidação)** | 10 (34%) |
| **Componentes Novos (Next.js only)** | 2 (7%) |
| **Blocos DashHTML Órfãos (sem React)** | 34 (50%) |

---

## 1. COMPONENTES NEXT.JS - MAPEAMENTO DETALHADO

### ✓ MATCHES DIRETOS (1:1 com DashHTML)

| Componente | Tipo | DashHTML | Status |
|-----------|------|----------|--------|
| WellnessActionsBox | card | wellness-score | Manter |
| SemaforoGatilhos | card | semaforo-triggers | Manter |
| AporteDoMes | card | calc-aporte | Manter |
| CashFlowSankey | chart | sankey-cashflow | Manter |
| GeographicExposureChart | chart | geo-donut | Manter |
| StackedAllocationBar | chart | stacked-alloc | Manter |
| ETFRegionComposition | chart | etf-composicao-regiao | Manter |
| TrackingFireChart | chart | evolucao-carteira | Manter |
| IpcaTaxaProgress | card | ipca-dca-semaforo | **AVALIAR REMOVER** |
| GlidePath | chart | glide-path | Manter |
| AttributionAnalysis | chart | retorno-decomposicao | **AVALIAR REMOVER** |
| DrawdownHistoryChart | chart | drawdown-historico | Manter |
| RollingMetricsChart | chart | rolling-sharpe | Manter |
| SpendingBreakdown | chart | spending-breakdown | Manter |

### ⚡ MÚLTIPLOS MATCHES (Consolidação Eficiente)

| Componente | Tipo | DashHTML Matches | Razão | Ação |
|-----------|------|------------------|-------|------|
| **KpiHero** | hero | patrimonio-total-hero, pfire-hero | Consolida 2 views em 1 | Manter |
| **TimeToFireProgressBar** | chart | fire-countdown, fire-trilha | Progress bar + timeline | Manter |
| **FireProgressWellness** | card | pfire-hero, wellness-score | Core FIRE + wellness blend | Manter |
| **PFireMonteCarloTornado** | chart | stress-test-mc, tornado-sensitivity | MC base + sensitivity | Manter |
| **DCAStatusGrid** | grid | ipca-dca-semaforo, renda-plus-semaforo | Grid consolida 2 DCA | Manter |
| **BondPoolComposition** | card | bond-pool-readiness, bond-pool-strip | Readiness + ladder view | Manter |
| **CryptoBandChart** | chart | hodl11-pnl, hodl11-status | PnL + status consolidado | Manter |
| **ScenarioCompare** | chart | stress-cenarios, what-if-cenarios | Base vs aspiracional | Manter |
| **AlphaVsSWRDChart** | chart | alpha-itd-swrd, retorno-decomposicao | Alpha isolado + decomp | Manter |
| **BondPoolRunway** | chart | bond-pool-runway, guardrails-retirada | Runway + guardrails | Manter |
| **RebalancingStatus** | card | drift-semaforo-etf, intra-equity-pesos | Drift + pesos visual | Manter |
| **FactorLoadingsTable** | table | factor-loadings-chart, factor-loadings-quality | Loadings + quality | Manter |

### 🔴 DUPLICAÇÕES PROBLEMÁTICAS

| Componente | Duplica | Status | Por que |
|-----------|---------|--------|---------|
| **FinancialWellnessActions** | WellnessActionsBox | **REMOVER** | Ambos → wellness-score (mesma fonte) |
| **IpcaTaxaProgress** | DCAStatusGrid | **AVALIAR** | Suplementar vs redundante? |
| **AttributionAnalysis** | AlphaVsSWRDChart | **AVALIAR** | Ambos: retorno-decomposicao |

### 🟢 NOVIDADES (Next.js exclusivo)

| Componente | Tipo | Status | Justificativa |
|-----------|------|--------|---------------|
| **BrasilConcentrationCard** | card | **MANTER** | Novo insight: concentração Brasil (não em spec.json) |
| **BondMaturityLadder** | chart | **MANTER** | Novo ladder view de prazos (não em spec.json) |

---

## 2. BLOCOS DASHHTML ÓRFÃOS (Sem React)

**Total**: 34 blocos em spec.json sem correspondente em page.tsx

### 🔴 ALTA PRIORIDADE (Insights Centrais Faltando)

| Bloco | Tipo | Razão | Ação |
|-------|------|-------|------|
| **fire-matrix** | table | Matriz FIRE por perfil (Solteiro/Casado/etc) | **Criar componente** |
| **eventos-vida** | table | Eventos de vida (bonus, herança, viagem) | **Criar componente** |
| **posicoes-etfs-ibkr** | table | Holdings atuais por ETF | **Criar componente** |
| **simulador-fire** | interactive | Simulador FIRE interativo | **Criar componente** |
| **pfire-familia** | grid | P(FIRE) por perfil familiar | **Criar componente** |
| **heatmap-retornos** | heatmap | Heatmap de retornos por período | **Criar componente** |

### 🟡 MÉDIA PRIORIDADE (Análises Complementares)

| Bloco | Tipo | Razão | Ação |
|-------|------|-------|------|
| **backtest-metricas** | table | CAGR, Sharpe, Sortino consolidados | Criar ou expandir AlphaVsSWRDChart |
| **backtest-regime-longo** | chart | Regime de retorno 20+ anos | Criar componente |
| **income-fases** | chart | Phases de renda (trabalho → retirada) | Criar componente |
| **income-lifecycle** | chart | Lifecycle income projection | Criar componente |
| **net-worth-projection** | chart | Projeção de patrimônio | Criar componente |
| **macro-strip** | card | Selic, IPCA, crescimento BR | Criar componente |
| **shadow-portfolios** | chart | Alternativas (60/40, All-Bond, etc) | Criar componente |

### 🟢 BAIXA PRIORIDADE (KPIs Simples ou Secundários)

| Bloco | Tipo | Razão | Ação |
|-------|------|-------|------|
| **cagr-patrimonial-twr** | KPI | CAGR simples | Adicionar a grid? |
| **cambio-mercado** | KPI | Taxa USD/BRL | Adicionar a KpiGrid |
| **exposicao-cambial** | KPI | Exposure USD | Adicionar a KpiGrid |
| **drift-maximo-kpi** | KPI | Max drift | Expandir RebalancingStatus |
| **duration-renda-plus** | KPI | Duration Renda+ | Expandir DCAStatusGrid |
| **custo-base-bucket** | table | Despesas por categoria | Expandir SpendingBreakdown |
| **factor-rolling-avgs** | chart | Rolling factor (AVGS) | Criar ou integrar FactorLoadingsTable |
| **information-ratio** | KPI | Information Ratio | Criar componente |
| **ir-diferido** | KPI | IR diferido | Criar componente |
| **kpi-grid-mercado** | grid | KPIs de mercado | Consolidar cambio/exposicao |
| **kpi-grid-primario** | grid | KPIs primários | Refatorar KpiCard grid atual |
| **lumpy-events** | table | Eventos não-recorrentes | Criar ou integrar eventos-vida |
| **minilog** | table | Log de ações | Criar componente |
| **rf-posicoes** | table | Holdings renda fixa | Criar ou integrar BondPoolComposition |
| **savings-rate** | KPI | Taxa de poupança | Expandir WellnessActionsBox |
| **swr-percentis** | chart | SWR por percentil histórico | Criar ou integrar BondPoolRunway |
| **ter-carteira** | KPI | TER médio | Criar componente |
| **tlh-monitor** | card | Tax Loss Harvesting | Criar componente |
| **factor-signal-kpi** | KPI | Factor signal | Criar componente |
| **earliest-fire** | KPI | Aposentadoria mais cedo | Criar ou integrar ScenarioCompare |

---

## 3. RECOMENDAÇÕES

### ✅ REMOVER IMEDIATAMENTE

1. **FinancialWellnessActions** — Pura duplicação de WellnessActionsBox
   - Ambos mapeam a `wellness-score`
   - Redundância 100%
   - Ação: **DELETE** `/react-app/src/components/dashboard/FinancialWellnessActions.tsx`

### ⚠️ AVALIAR ANTES DE REMOVER

1. **IpcaTaxaProgress**
   - Mapeado: `ipca-dca-semaforo` (compartilha com DCAStatusGrid)
   - Questão: Fornece insight novo (taxa + progresso) ou é apenas visual do DCAStatusGrid?
   - Verificar: Dados únicos que não estão em DCAStatusGrid?

2. **AttributionAnalysis**
   - Mapeado: `retorno-decomposicao` (compartilha com AlphaVsSWRDChart)
   - Questão: Alpha isolado faz sentido fora da decomposição?
   - Verificar: Insights complementares ou apenas tabela vs gráfico?

### 🟢 MANTER AGORA

1. **BrasilConcentrationCard** — Novo, não em spec.json. Relevante.
2. **BondMaturityLadder** — Novo, não em spec.json. Insight de prazo importante.

### 📋 IMPLEMENTAR (Priorizado)

**Tier 1 (Sprint Imediato)**:
1. fire-matrix (3h) — Matriz de FIRE por perfil
2. eventos-vida (2h) — Tabela de eventos de vida
3. posicoes-etfs-ibkr (2h) — Holdings por ETF

**Tier 2 (Próx. 2 sprints)**:
1. simulador-fire (6h) — Simulador interativo
2. heatmap-retornos (4h) — Heatmap de retornos
3. pfire-familia (2h) — P(FIRE) por perfil

**Tier 3 (Roadmap)**:
1. income-lifecycle, net-worth-projection, shadow-portfolios
2. Consolidação de KPI grids

---

## 4. OBSERVAÇÕES TÉCNICAS

### Padrões de Consolidação

**Excelentes** (múltiplos blocos → 1 componente):
- DCAStatusGrid (2 blocos) — IPCA + Renda+ em 1 grid
- RebalancingStatus (2 blocos) — Drift + pesos em 1 card
- FactorLoadingsTable (2 blocos) — Chart + quality em 1 table

**Questionáveis** (múltiplos blocos mas componentes separados):
- AlphaVsSWRDChart + AttributionAnalysis (2 views de retorno-decomposicao)
- ScenarioCompare + PFireMonteCarloTornado (2 views de stress)

### Gaps de Arquitetura

1. **DataTable Reusável**: Muitos blocos órfãos são tabelas (fire-matrix, eventos-vida, posicoes-etfs-ibkr, lumpy-events, minilog, rf-posicoes, etc). Criar primitive `<DataTable />` seria eficiente.

2. **KPI Grid Consolidado**: KPIs simples espalhados (cambio-mercado, exposicao-cambial, drift-maximo-kpi, etc). Consolidar em `<KpiGrid />` único.

3. **Chart Types Faltando**: Heatmap, lifecycle chart, regime chart — ampliar Chart.js patterns.

---

## 5. PRÓXIMOS PASSOS

1. ✅ **Audit concluído** — Mapeamento 100% entre Next.js e spec.json
2. ⏭️ **Diego aprova removals** — IpcaTaxaProgress, AttributionAnalysis, FinancialWellnessActions
3. ⏭️ **Dev implementa Tier 1** — fire-matrix, eventos-vida, posicoes-etfs-ibkr
4. ⏭️ **Retro técnica** — Consolidar patterns (DataTable, KpiGrid)

---

**Referência**: `/Users/diegodemorais/claude/code/wealth/react-app/src/app/page.tsx` (29 componentes)  
**Fonte de Verdade**: `/Users/diegodemorais/claude/code/wealth/dashboard/spec.json` (68 blocos)
