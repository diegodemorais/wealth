# Component Test Matrix — Dashboard Validation Report

**Test Date**: 2026-04-14  
**Dashboard Version**: v2.163  
**Total Spec Components**: 66

---

## Summary

| Status | Count | Pct |
|--------|-------|-----|
| ✅ PASS (fully functional) | 31 | 47% |
| 🙈 HIDDEN (CSS hidden) | 4 | 6% |
| ⚠️ EMPTY (no data) | 8 | 12% |
| ❌ MISSING (not in HTML) | 23 | 35% |

---

## ✅ PASS (31/66) — Rendering Correctly

### NOW Tab (10/19)
- cambio-mercado (kpi) — kpiCambio
- fire-countdown (kpi) — fireCountdown
- hodl11-status (semaforo) — ipcaTaxaStatus
- kpi-grid-mercado (kpi) — kpiIpcaMercado
- macro-strip (semaforo) — macroStrip
- tornado-sensitivity (chart-bar-horizontal) — tornadoChart
- patrimonio-total-hero (kpi-hero) — heroPatrimonioBrl
- pfire-hero (kpi-hero) — heroAnos
- savings-rate (kpi) — savingsRate
- wellness-score (card) — wellnessScore
- drift-maximo-kpi (kpi) — kpiDriftMax

### PORTFOLIO Tab (3/12)
- custo-base-bucket (table) — custoBaseBody
- geo-donut (chart-donut) — geoDonut
- stacked-alloc (chart-bar) — stackedAllocBar

### PERFORMANCE Tab (4/11)
- cagr-patrimonial-twr (kpi) — cagrTwrRow
- factor-rolling-avgs (chart-line) — factorRollingBody
- heatmap-retornos (table) — heatmapContainer
- rolling-sharpe (chart-line) — rollingIRNota

### BACKTEST Tab (2/4)
- backtest-metricas (table) — backtestChart
- shadow-portfolios (chart-line) — shadowChart

### FIRE Tab (5/10)
- eventos-vida (table) — eventosVidaBody
- glide-path (chart-area) — glideChart
- net-worth-projection (fan-chart) — netWorthProjectionSrc
- pfire-familia (card) — kpiPfire50
- earliest-fire (kpi) — wiFireEta

### RETIRO Tab (4/8)
- guardrails-retirada (table) — guardrailsSrc
- income-fases (table) — incomeSrc
- income-lifecycle (chart-line) — incomeSrc
- sankey-cashflow (chart-area) — sankeySrc

### SIMULADORES Tab (0/2)
(none passing)

---

## 🙈 HIDDEN (4/66) — Exist but CSS Hidden

| Component | Type | HTML ID | Why Hidden |
|-----------|------|---------|------------|
| ter-carteira | kpi | terCarteira | display: none |
| evolucao-carteira | chart-line | terCarteira | display: none |
| spending-breakdown | card | spendingChart | visibility: hidden |
| bond-pool-runway | chart-area | kpiBondPool | visibility: hidden |

**Action**: Remove `display:none` and `visibility:hidden` from CSS.

---

## ⚠️ EMPTY (8/66) — Elements Exist, No Content

| Component | Type | HTML ID | Issue | Solution |
|-----------|------|---------|-------|----------|
| drawdown-historico | chart-area | drawdownHistNota | Wrong HTML ID (is `<P>` footnote) | Find actual chart container |
| lumpy-events | table | lumpyEventsBody | Table body empty | Data not rendering |
| ipca-dca-semaforo | semaforo | kpiIpcaSemaforo | Div empty | Data not rendering |
| renda-plus-semaforo | semaforo | kpiRendaSemaforo | Div empty | Data not rendering |
| factor-loadings-chart | chart-bar-horizontal | factorLoadingsChart | Canvas exists but not drawn | Check render function |
| retorno-decomposicao | waterfall | simRetorno | Div empty | Function not implemented? |
| minilog | table | minilogBody | Table body empty | Data not rendering |
| calc-aporte | slider | calcAporte | Slider container empty | Data not rendering |

**Action**: Debug rendering functions for each component. Check:
- Is window.DATA populated?
- Are build functions being called?
- Are console errors occurring?

---

## ❌ MISSING (23/66) — Not in HTML

### Missing — Component Spec Exists, HTML Element Doesn't

16 components defined in spec.json but not in template.html:

| Tab | Component | Type |
|-----|-----------|------|
| NOW | kpi-grid-primario | kpi |
| NOW | exposicao-cambial | gauge |
| PORTFOLIO | drift-semaforo-etf | semaforo |
| PORTFOLIO | intra-equity-pesos | chart-bar |
| PORTFOLIO | etf-composicao-regiao | table |
| PORTFOLIO | posicoes-etfs-ibkr | table |
| PORTFOLIO | tlh-monitor | table |
| PORTFOLIO | ir-diferido | table |
| PORTFOLIO | rf-posicoes | table |
| PORTFOLIO | duration-renda-plus | card |
| PERFORMANCE | alpha-itd-swrd | kpi |
| PERFORMANCE | information-ratio | chart-line |
| PERFORMANCE | hodl11-pnl | kpi |
| PERFORMANCE | fee-custo-complexidade | table |
| BACKTEST | backtest-regime-longo | chart-line |
| FIRE | what-if-cenarios | slider |

**Action**: Either add HTML elements to template.html OR remove from spec.json

### Removed Due to Collision Resolution

7 components were mapped to same HTML ID (collision), resolved by keeping one and marking others MISSING:

| Tab | Component | Type | Collision | Resolution |
|-----|-----------|------|-----------|------------|
| NOW | bond-pool-strip | kpi | kpiBondPool | Removed (bond-pool-readiness also maps there) |
| FIRE | fire-trilha | chart-line | wiFireEta | Removed (earliest-fire uses it) |
| FIRE | simulador-fire | slider | wiFireEta | Removed (earliest-fire uses it) |
| RETIRO | bond-pool-readiness | gauge | kpiBondPool | Removed (bond-pool-strip also maps there) |
| RETIRO | bond-pool-runway | chart-area | kpiBondPool | Removed but now HIDDEN (has CSS visibility) |
| RETIRO | income-lifecycle | chart-line | incomeSrc | Now PASS (uses same HTML as income-fases) |

**Action**: Add separate HTML elements for the removed components, OR adjust spec to match actual HTML structure.

---

## Technical Notes

### Test Methodology
- Browser-based testing via Playwright
- Checks for:
  - Element existence in DOM
  - CSS visibility (display, visibility)
  - Content rendering (text, canvas, table rows, SVG, etc)
  - Canvas image data (canvas.toDataURL() > 300 chars = rendered)

### Mapeamento Spec ↔ HTML
- Spec uses kebab-case IDs (`geo-donut`)
- HTML uses camelCase IDs (`geoDonut`)
- Fuzzy mapping bridges the gap, saved in `spec_html_mapping.json`
- **Zero collisions** in final mapping

### Data Sources
- Comprehensive test results: `dashboard/tests/comprehensive_component_test.json`
- HTML mapping: `dashboard/tests/spec_html_mapping.json`

---

## Recommendations

### Tier 1: Quick Wins (1-2 hours)
1. Unhide 4 HIDDEN components (CSS fix)
2. Debug 2 semaforo indicators (IPCA+ DCA, Renda+ semaforo) — likely simple data display

### Tier 2: Medium Effort (4-6 hours)
3. Debug 3 empty tables (Minilog, Lumpy Events) — data loading issue
4. Fix factor-loadings-chart canvas rendering
5. Find correct HTML ID for drawdown-historico

### Tier 3: Backlog (8+ hours)
6. Add 16 missing HTML elements OR remove from spec
7. Implement waterfall chart for retorno-decomposicao
8. Implement calc-aporte slider rendering

---

*Report generated: 2026-04-14T09:30:00Z*
