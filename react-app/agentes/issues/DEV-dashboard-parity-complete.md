# Issue: DEV-dashboard-parity-complete

**Título**: React Dashboard → DashHTML v2.77 Feature Parity (100% Coverage)

**Status**: 🔵 Refinement → Planning  
**Criado em**: 2026-04-15  
**Atribuído a**: Dev  
**Prioridade**: 🔴 CRÍTICA  
**Depende de**: —  
**Bloqueadores**: —

---

## Contexto

Dashboard React v0.1.118 foi auditado contra DashHTML v2.77 (versão estável, golden standard).

**Resultado**: 78% feature parity (75/95 componentes implementados)

**Gaps encontrados**:
- 2 componentes **CRÍTICOS** desabilitados (Simulators tab)
- 8 componentes **MÉDIOS** ausentes (Portfolio, Performance)
- 1 componente **BAIXO** ausente (Portfolio)

**Objetivo**: Alcançar **95%+ parity** antes de deprecar DashHTML v2.77.

---

## Análise Completa (Tab-by-Tab)

### NOW (HOJE) — 85% ✅ Nearly Complete

| Componente | Status | Gap |
|-----------|--------|-----|
| Hero Strip (4 KPIs) | ✅ | None |
| Primary KPI Grid | ✅ | None |
| Market Context KPIs | ✅ | None |
| Time to FIRE Progress | ✅ | None |
| Semáforos de Gatilhos | ✅ | None |
| Fire Progress + Aporte | ✅ | None |
| P(FIRE) Monte Carlo | ✅ | None |
| Macro Context Grid | ✅ | None |
| Sankey/Cash Flow | ✅ | None |
| Brasil Concentration | ✅ | None |
| Wellness Actions | ✅ | None |
| **ENHANCEMENT**: Life Events | ✨ | Added |
| **ENHANCEMENT**: FIRE Simulator | ✨ | Added |
| **ENHANCEMENT**: Factor Loadings | ✨ | Added |

**Conclusão**: NOW tab 100% feature parity + enhancements ✅

---

### PORTFOLIO (CARTEIRA) — 70% ⚠️ Mostly Complete

| Componente | Status | Gap | Prioridade |
|-----------|--------|-----|-----------|
| Allocation Donuts | ✅ | None | — |
| Stacked Allocation Bar | ✅ | None | — |
| Glide Path / Lifecycle | ✅ | None | — |
| Heat Map (Correlation) | ✅ | None | — |
| Bucket Allocation | ✅ | None | — |
| Concentration Analysis | ✅ | None | — |
| TER/Cost Analysis | ✅ | None | — |
| ETF Regional Breakdown | ✅ | None | — |
| **MISSING**: HODL Holdings Table | ❌ | High | T1 |
| **MISSING**: Fixed Income + Crypto | ❌ | Medium | T2 |
| **MISSING**: Tax/IR Analysis | ❌ | Medium | T2 |
| **MISSING**: Brasil Monitor Card | ❌ | Low | T3 |

**Conclusão**: Portfolio tab 70%, 4 gaps (1 crítico, 3 médios)

---

### PERFORMANCE (PERF) — 75% ⚠️ Substantially Complete

| Componente | Status | Gap | Prioridade |
|-----------|--------|-----|-----------|
| Timeline/Price Chart | ✅ | None | — |
| Attribution Analysis | ✅ | None | — |
| Rolling Sharpe Ratio | ✅ | None | — |
| Information Ratio | ✅ | None | — |
| Factor Loadings R² | ✅ | None | — |
| Backtest Comparison | ✅ | None | — |
| **MISSING**: Premises vs Actual | ❌ | High | T2 |
| **MISSING**: Annual Net Worth Evolution | ❌ | High | T2 |
| **PARTIAL**: Sankey/Waterfall Flows | ⚠️ | Medium | T2 |

**Conclusão**: Performance tab 75%, 3 gaps (2 high, 1 medium)

---

### FIRE — 80% ✅ Substantially Complete

| Componente | Status | Gap | Prioridade |
|-----------|--------|-----|-----------|
| Tracking Fire Chart | ✅ | None | — |
| Net Worth Projection | ✅ | None | — |
| Earliest FIRE Scenario Card | ✅ | None | — |
| Life Milestones/Events | ✅ | None | — |
| **MISSING**: Detailed FIRE scenarios table | ❌ | Medium | T2 |
| **ENHANCEMENT**: Family scenario cards | ✨ | Added | — |
| **ENHANCEMENT**: FIRE matrix table | ✨ | Added | — |

**Conclusão**: FIRE tab 80% + enhancements ✅

---

### WITHDRAW (RETIRO) — 85% ✅ Nearly Complete

| Componente | Status | Gap |
|-----------|--------|-----|
| Guardrails Table | ✅ | None |
| Safe Spending Chart | ✅ | None |
| Income Sources Chart | ✅ | None |
| Income Projection | ✅ | None |
| Bond Pool Readiness | ✅ | None |
| Bond Pool Runway | ✅ | None |
| Maturity Ladder | ✅ | None |
| Rebalancing Status | ✅ | None |
| DCA Status Grid | ✅ | None |

**Conclusão**: Withdraw tab 100% feature parity ✅

---

### SIMULATORS (SIMULADORES) — 50% ❌ **CRITICAL**

| Componente | Status | Gap | Prioridade |
|-----------|--------|-----|-----------|
| Simulator Parameters | ✅ | None | — |
| Success Rate Card | ✅ | None | — |
| **MISSING**: Simulation Trajectories | ❌ | **CRITICAL** | **T1** |
| **MISSING**: Drawdown Distribution | ❌ | **CRITICAL** | **T1** |
| Monte Carlo Results | ⚠️ | Partial | T1 |

**Conclusão**: Simulators tab 50%, **2 critical components disabled**

**Causa**: Chart.js canvas integration pending  
**Impacto**: Usuários não podem ver projeções estocásticas

---

### BACKTEST — 75% ⚠️ Mostly Complete

| Componente | Status | Gap | Prioridade |
|-----------|--------|-----|-----------|
| Portfolio vs R7 | ✅ | None | — |
| Drawdown Analysis | ✅ | None | — |
| **MISSING**: Historical Returns Table | ❌ | Medium | T2 |

**Conclusão**: Backtest tab 75%, 1 medium gap

---

## Quadro de Priorização

### T1 — CRITICAL (Esta semana)
Enable/fix 2 charts desabilitados no Simulators tab:

| Tarefa | Componente | Arquivo | Esforço | Critério |
|--------|-----------|---------|---------|----------|
| T1-01 | SimulationTrajectories | `/src/components/simulators/SimulationTrajectories.tsx` | Médio | Render line chart c/ MC percentiles |
| T1-02 | DrawdownDistribution | `/src/components/simulators/DrawdownDistribution.tsx` | Médio | Render histogram c/ drawdown data |
| T1-03 | HODL Holdings Table | `/src/components/portfolio/HoldingsTable.tsx` (NEW) | Alto | Table c/ P&L, YTD%, positions |

**Delivery**: Simulators + Portfolio tabs 90%+ parity

---

### T2 — HIGH (Próxima semana)
Implementar 5 tabelas/grids ausentes:

| Tarefa | Componente | Arquivo | Esforço | Critério |
|--------|-----------|---------|---------|----------|
| T2-01 | Premises vs Actual | `/src/components/performance/PremisesTable.tsx` (NEW) | Médio | Table forecast vs realizado |
| T2-02 | Annual Net Worth Evolution | `/src/components/performance/NetWorthTable.tsx` (NEW) | Médio | Histórico anual BRL/USD/Returns |
| T2-03 | Fixed Income + Crypto | `/src/components/portfolio/RFCryptoComposition.tsx` (NEW) | Médio | 2 tables RF + Cripto |
| T2-04 | Tax/IR Analysis | `/src/components/portfolio/TaxAnalysisGrid.tsx` (NEW) | Médio | Grid ETF sales tax planning |
| T2-05 | Detailed FIRE Scenarios | `/src/components/fire/FireScenariosTable.tsx` (NEW) | Médio | Expandir scenarios com detalhes |

**Delivery**: Portfolio + Performance + FIRE tabs 90%+ parity

---

### T3 — MEDIUM (Semana 3)
Polishing e tabelas complementares:

| Tarefa | Componente | Arquivo | Esforço | Critério |
|--------|-----------|---------|---------|----------|
| T3-01 | Historical Returns Table | `/src/components/backtest/HistoricalReturnsTable.tsx` (NEW) | Baixo | Table annual/quarterly returns |
| T3-02 | Brasil Monitor Card | `/src/components/portfolio/BrasilMonitorCard.tsx` (NEW) | Baixo | Card c/ concentration highlight |
| T3-03 | Responsive Refinement | `src/styles/dashboard.css` | Médio | Fine-tune breakpoints 768px, 480px |
| T3-04 | Performance Audit | `src/utils/performance.ts` (NEW) | Baixo | Monitoring data pipeline |

**Delivery**: Backtest tab 90%, Portfolio 95%, overall 92%+

---

### Final Stage — VALIDATION
Comparar React v0.1.118 (pós-implementação) ↔ DashHTML v2.77:

| Checklist | Status |
|-----------|--------|
| ✅ Tab-by-tab visual parity (90%+) | — |
| ✅ All 95 components mapped | — |
| ✅ Responsive breakpoints (4-tier) | — |
| ✅ Unit tests (183/183 passing) | — |
| ✅ Build clean (10/10 pages) | — |
| ✅ Type safety (0 errors) | — |
| ✅ Privacy mode (all components) | — |
| ✅ e2e tests (target 50%+) | — |
| ✅ Screenshot regression (zero diffs) | — |
| ✅ Performance (Lighthouse >90) | — |

---

## Dependências

- Nenhuma bloqueadora atualmente
- T1 e T2 podem rodar em paralelo após T1-01/02 completas

---

## Acceptance Criteria

- [ ] T1: Simulators tab fully functional (2/2 charts enabled)
- [ ] T1: Portfolio HODL Holdings table deployed
- [ ] T2: Performance 5 tables/grids implemented
- [ ] T3: Backtest + Portfolio low-priority items complete
- [ ] **FINAL VALIDATION**: Side-by-side comparison React vs DashHTML
  - 95%+ visual parity
  - All KPIs matching
  - Responsive behavior identical
  - No regressions on existing features

---

## Success Metrics

| Métrica | Target | Current | Final |
|---------|--------|---------|-------|
| **Feature Parity** | 95%+ | 78% | — |
| **Components Implemented** | 95/95 | 75/95 | — |
| **Unit Tests** | 183/183 | 183/183 | — |
| **e2e Tests** | 50%+ | 39% | — |
| **Build Quality** | 0 errors | 0 errors | — |
| **Visual Alignment** | 95%+ | 65% | — |

---

## Notas

- DashHTML v2.77 permanece operacional como referência durante implementação
- Após T3 completo, marcar para deprecação
- Manter análise comparativa no COMPARISON_BEFORE_AFTER.md
- Registrar aprendizados sobre componentização em LEARNINGS.md

---

## Roadmap — 8 Passos Recomendados

### Passo 1: ✅ Mapping Completo DashHTML v2.77
**Status**: CONCLUÍDO  
**Saída**: Arquivos análise em `/analysis/DASHHTML_v277_*`
- `DASHHTML_v277_COMPLETE_MAPPING.txt` (26 KB) — detalhes por aba
- `DASHHTML_v277_COMPONENT_INDEX.md` — índice estruturado
- `DASHHTML_v277_VISUAL_SUMMARY.txt` — mockups layout
- `README_DASHHTML_v277.md` — visão geral

---

### Passo 2: 📋 Comparação Detalhada React v0.1.118
**Status**: EM ANDAMENTO (esta issue)  
**O que fazer**:
1. Tab-by-tab audit (NOW, Portfolio, Performance, FIRE, Withdraw, Simulators, Backtest)
2. Contar componentes implementados vs ausentes
3. Criar matriz visual 95 componentes (✅ vs ❌)
4. Documentar em `COMPARISON_REACT_DASHHTML.md`

**Saída**: Quadro completo comparativo (status acima nesta issue)

---

### Passo 3: 📋 Identificação de Gaps/Features Faltantes
**Status**: CONCLUÍDO (mapeado acima)  
**Resultado**:
- **T1 (Critical)**: 3 componentes (Simulators x2, HODL Holdings)
- **T2 (High)**: 5 componentes (Premises, Net Worth, RF/Crypto, Tax/IR, FIRE Scenarios)
- **T3 (Medium)**: 2 componentes + polish (Historical Returns, Brasil Monitor)
- **Final Validation**: Side-by-side parity check

---

### Passo 4: 📋 Plano de Migração/Replicação (Priorizado)
**Status**: ESTE DOCUMENTO (você está aqui)  
**Estrutura**:
- Seção "Quadro de Priorização" (T1/T2/T3)
- Seção "Timeline" (4 semanas)
- Seção "Acceptance Criteria" (checklists)
- Seção "Validation Stage" (NOVA — comparação final)

---

### Passo 5: 📋 Componentes React Base
**Status**: TODO  
**O que fazer**:
- Review `/src/components/primitives/` (KpiCard, PrivacyMask, etc)
- Create base wrappers:
  - `<SectionCard>` — container com border + padding
  - `<ChartContainer>` — wrapper para ECharts + Chart.js
  - `<DataTable>` — table pattern para HoldingsTable, PremisesTable
  - `<GridLayout>` — responsive grid base
- Document props em `COMPONENT_PATTERNS.md`

**Saída**: 4 base components + pattern guide

---

### Passo 6: 📋 Integração Charts (Chart.js Wrapper)
**Status**: TODO  
**O que fazer**:
1. Fix desabilitados em Simulators:
   - `SimulationTrajectories.tsx` → enable canvas rendering
   - `DrawdownDistribution.tsx` → enable histogram
2. Create wrapper `/src/components/charts/ChartJsWrapper.tsx`
   - Suporte privacy mode (mascara valores)
   - Responsive auto-resize
   - Legend toggle
3. Migrate Chart.js charts → ECharts onde fizer sentido

**Saída**: Simulators tab 100% functional

---

### Passo 7: 📋 State Management (Redux/Zustand)
**Status**: PARCIAL (Zustand já existe)  
**O que fazer**:
1. Audit current `/src/store/dashboardStore.ts`
2. Add computed selectors:
   - `swr_current` — para SWR visualização
   - `by_profile` — para Family Scenarios
   - `historical_evolution` — para Net Worth table
3. Validate data flow: `/src/utils/dataWiring.ts`

**Saída**: Store schema validado + derived values documentados

---

### Passo 8: 📋 Testes (Unit, Integration, Visual)
**Status**: TODO  
**O que fazer**:
1. **Unit Tests**:
   - `npm run test` — manter 183/183 passing
   - Add 20+ testes para novos componentes (HoldingsTable, PremisesTable, etc)

2. **Integration Tests** (Cypress):
   - Test data flow: load `/data.json` → populate all tabs
   - Test responsiveness: 1024px → 480px
   - Test privacy mode: values masked across all tabs

3. **Visual Regression** (Playwright):
   - Screenshot all tabs antes (DashHTML baseline)
   - Screenshot all tabs depois (React versão)
   - Diff visual pixel-by-pixel

**Saída**: Test suite 100% coverage critical paths

---

## VALIDATION STAGE — Comparação Final com DashHTML v2.77

### Fase Final (Semana 4)

#### Checklist de Parity

```
TAB: NOW (HOJE)
├─ ✅ Hero Strip 4 KPIs layout
├─ ✅ Primary KPI Cards spacing
├─ ✅ Market Context grid colors
├─ ✅ Time to FIRE typography
├─ ✅ Semáforos styling
├─ ✅ Fire Progress bars
├─ ✅ P(FIRE) Monte Carlo chart
├─ ✅ Macro KPIs formatting
├─ ✅ Sankey layout + colors
├─ ✅ Brasil Concentration card
├─ ✅ Wellness Actions button
├─ RESULTADO: 11/11 ✅

TAB: PORTFOLIO
├─ ✅ Allocation donuts sizing
├─ ✅ Stacked bar responsive
├─ ✅ Glide path chart
├─ ✅ Heatmap colors
├─ ✅ Bucket allocation bars
├─ ✅ Concentration grid
├─ ✅ TER analysis layout
├─ ✅ ETF regional table
├─ ✅ HODL Holdings table (T1-03) ← NEW
├─ ✅ RF + Crypto breakdown (T2-03) ← NEW
├─ ✅ Tax/IR Analysis grid (T2-04) ← NEW
├─ ✅ Brasil Monitor card (T3-02) ← NEW
├─ RESULTADO: 12/12 ✅

TAB: PERFORMANCE
├─ ✅ Timeline chart styling
├─ ✅ Attribution bars colors
├─ ✅ Rolling Sharpe chart
├─ ✅ Information ratio layout
├─ ✅ Factor loadings table
├─ ✅ Backtest shadow comparison
├─ ✅ Premises vs Actual table (T2-01) ← NEW
├─ ✅ Annual Net Worth table (T2-02) ← NEW
├─ ✅ Sankey/Waterfall flows (T2-05)
├─ RESULTADO: 9/9 ✅

TAB: FIRE
├─ ✅ Tracking fire chart
├─ ✅ Net worth projection
├─ ✅ Earliest FIRE card
├─ ✅ Life milestones timeline
├─ ✅ Family scenario cards (enhancement)
├─ ✅ FIRE matrix table (enhancement)
├─ ✅ Detailed FIRE scenarios (T2-05) ← NEW
├─ RESULTADO: 7/7 ✅

TAB: WITHDRAW
├─ ✅ Guardrails table layout
├─ ✅ Safe spending chart
├─ ✅ Income sources chart
├─ ✅ Income projection
├─ ✅ Bond pool readiness
├─ ✅ Bond pool runway
├─ ✅ Maturity ladder
├─ ✅ Rebalancing status
├─ ✅ DCA status grid
├─ RESULTADO: 9/9 ✅

TAB: SIMULATORS
├─ ✅ Simulator parameters panel
├─ ✅ Success rate card
├─ ✅ Simulation trajectories (T1-01) ← ENABLED
├─ ✅ Drawdown distribution (T1-02) ← ENABLED
├─ ✅ Monte Carlo results
├─ RESULTADO: 5/5 ✅

TAB: BACKTEST
├─ ✅ Portfolio vs R7 chart
├─ ✅ Drawdown analysis
├─ ✅ Historical returns table (T3-01) ← NEW
├─ RESULTADO: 3/3 ✅

OVERALL: 56/56 COMPONENTS ✅ (95%+ parity)
```

#### Side-by-Side Visual Comparison

**Método**:
1. Abrir DashHTML v2.77 em aba lado-a-lado (1920×1080)
2. Abrir React v0.1.118 em aba lado-a-lado
3. Navegar tab-by-tab, verificar:
   - Layout (grid, spacing, alignment)
   - Typography (font-size, font-weight, line-height)
   - Colors (usando CSS vars)
   - Responsive (testar 768px, 480px)
   - Interactivity (toggles, hovers, collapses)

**Checklist Visual**:
```
Layout:
  ├─ Grid spacing (gaps, padding) ± 2px
  ├─ Card alignment (centered, justified)
  ├─ Header/footer positioning
  └─ Sidebar (if any) width match

Typography:
  ├─ Heading sizes (h1, h2, h3)
  ├─ Body text sizing
  ├─ Font weights (bold, semi-bold)
  └─ Line heights (readable)

Colors:
  ├─ Background consistency
  ├─ Text contrast (WCAG AA)
  ├─ Status indicators (green/red/yellow)
  └─ Hover states

Responsive:
  ├─ 1920px (desktop) — no changes
  ├─ 1024px (laptop) — columns adapt
  ├─ 768px (tablet) — 2-col max
  └─ 480px (mobile) — 1-col stack

Interactions:
  ├─ Collapsibles smooth (0.3s)
  ├─ Chart hovers fast (<100ms)
  ├─ Privacy mode mascara <100ms
  └─ No console errors/warnings
```

#### Performance Metrics

**Antes** (DashHTML v2.77):
- Load time: ~1.2s (single HTML file)
- Bundle size: ~2.4 MB (single file + inline data)
- Lighthouse: N/A (single page)

**Depois** (React v0.1.118):
- Load time: ~0.8s (optimized, with caching)
- Bundle size: ~500 KB (Next.js optimized)
- Lighthouse: Target 90+ (LCP, CLS, FID)

#### Checklist Final

```
✅ All 56 components visually aligned
✅ Responsive working 480px–1920px
✅ 183/183 unit tests passing
✅ 10/10 build pages clean
✅ 0 TypeScript errors
✅ Privacy mode 100% coverage
✅ e2e tests 50%+ (up from 39%)
✅ No console warnings (relevant)
✅ Lighthouse 90+ (Core Web Vitals)
✅ DashHTML v2.77 deprecation ready
```

---

## Timeline

| Fase | Semana | Tasks | Delivery |
|------|--------|-------|----------|
| **Planning** | Esta | ✅ Aprovação plano | — |
| **Passo 2-4** | S1 | Comparação + gaps + priorização | Issue completa |
| **Passo 5-6** | S2 | T1-01, T1-02, T1-03 | Simulators + HODL |
| **Passo 7** | S3 | T2-01 a T2-05 | Portfolio + Performance |
| **Passo 8 + Final** | S4 | T3 + Validation | DashHTML parity ✅ |
| **TOTAL** | **4 semanas** | 12 tasks + 8 steps | v0.2.0 release-ready |

---

## Referências

**Arquivos de Análise** (em `/analysis/DASHHTML_v277_*`):
- Mapeamento completo: `DASHHTML_v277_COMPLETE_MAPPING.txt` (26 KB)
- Índice de componentes: `DASHHTML_v277_COMPONENT_INDEX.md`
- Sumário visual: `DASHHTML_v277_VISUAL_SUMMARY.txt`
- README: `README_DASHHTML_v277.md`

**Comparativos** (em raiz do projeto):
- Antes/depois P0-T4: `COMPARISON_BEFORE_AFTER.md`
- Esta issue: `agentes/issues/DEV-dashboard-parity-complete.md`

**Documentação Interna**:
- Plano CSS anterior: `DEV-visual-alignment-dashhtml.md`
- Padrões de componentes: `COMPONENT_PATTERNS.md` (TODO)
- Testes: `scripts/DASHBOARD_TEST_PROTOCOL.md`
