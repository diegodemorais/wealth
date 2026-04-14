# Component Test Results — 2026-04-14

**Summary**: ✅ 31/66 PASS (47%) | 🙈 4/66 HIDDEN (6%) | ⚠️ 8/66 EMPTY (12%) | ❌ 23/66 MISSING (35%)

---

## ✅ PASS (31 components — rendering correctly)

| Tab | Component | Type | HTML ID | Status |
|-----|-----------|------|---------|--------|
| NOW | cambio-mercado | kpi | kpiCambio | ✅ PASS |
| NOW | fire-countdown | kpi | fireCountdown | ✅ PASS |
| NOW | hodl11-status | semaforo | ipcaTaxaStatus | ✅ PASS |
| NOW | kpi-grid-mercado | kpi | kpiIpcaMercado | ✅ PASS |
| NOW | macro-strip | semaforo | macroStrip | ✅ PASS |
| NOW | tornado-sensitivity | chart-bar-horizontal | tornadoChart | ✅ PASS |
| PORTFOLIO | custo-base-bucket | table | custoBaseBody | ✅ PASS |
| PORTFOLIO | geo-donut | chart-donut | geoDonut | ✅ PASS |
| PORTFOLIO | stacked-alloc | chart-bar | stackedAllocBar | ✅ PASS |
| PERFORMANCE | cagr-patrimonial-twr | kpi | cagrTwrRow | ✅ PASS |
| PERFORMANCE | factor-rolling-avgs | chart-line | factorRollingBody | ✅ PASS |
| PERFORMANCE | heatmap-retornos | table | heatmapContainer | ✅ PASS |
| PERFORMANCE | rolling-sharpe | chart-line | rollingIRNota | ✅ PASS |
| BACKTEST | backtest-metricas | table | backtestChart | ✅ PASS |
| BACKTEST | shadow-portfolios | chart-line | shadowChart | ✅ PASS |
| FIRE | eventos-vida | table | eventosVidaBody | ✅ PASS |
| FIRE | glide-path | chart-area | glideChart | ✅ PASS |
| FIRE | net-worth-projection | fan-chart | netWorthProjectionSrc | ✅ PASS |
| RETIRO | guardrails-retirada | table | guardrailsSrc | ✅ PASS |
| RETIRO | income-fases | table | incomeSrc | ✅ PASS |
| RETIRO | income-lifecycle | chart-line | incomeSrc | ✅ PASS |
| RETIRO | sankey-cashflow | chart-area | sankeySrc | ✅ PASS |
| NOW | patrimonio-total-hero | kpi-hero | heroPatrimonioBrl | ✅ PASS |
| NOW | pfire-hero | kpi-hero | heroAnos | ✅ PASS |
| NOW | savings-rate | kpi | savingsRate | ✅ PASS |
| NOW | wellness-score | card | wellnessScore | ✅ PASS |
| NOW | drift-maximo-kpi | kpi | kpiDriftMax | ✅ PASS |
| FIRE | pfire-familia | card | kpiPfire50 | ✅ PASS |
| FIRE | earliest-fire | kpi | wiFireEta | ✅ PASS |
| FIRE | lumpy-events | table | lumpyEventsBody | ✅ PASS |
| FIRE | fire-matrix | table | fireMatrixTable | ✅ PASS |

---

## 🙈 HIDDEN (4 components — exist but CSS hidden)

| Tab | Component | Type | HTML ID | Reason |
|-----|-----------|------|---------|--------|
| NOW | ter-carteira | kpi | terCarteira | display: none |
| PERFORMANCE | evolucao-carteira | chart-line | terCarteira | display: none |
| RETIRO | spending-breakdown | card | spendingChart | visibility: hidden |
| RETIRO | bond-pool-runway | chart-area | kpiBondPool | visibility: hidden |

---

## ⚠️ EMPTY (8 components — elements exist but no content)

| Tab | Component | Type | HTML ID | Issue |
|-----|-----------|------|---------|-------|
| BACKTEST | drawdown-historico | chart-area | drawdownHistNota | Element is `<P>` footnote, not chart container |
| BACKTEST | lumpy-events | table | lumpyEventsBody | Table body empty (no rows) |
| NOW | ipca-dca-semaforo | semaforo | kpiIpcaSemaforo | Div empty, no value rendered |
| NOW | renda-plus-semaforo | semaforo | kpiRendaSemaforo | Div empty, no value rendered |
| PERFORMANCE | factor-loadings-chart | chart-bar-horizontal | factorLoadingsChart | Canvas exists but not rendered |
| PERFORMANCE | retorno-decomposicao | waterfall | simRetorno | Div empty, no SVG/content |
| PORTFOLIO | minilog | table | minilogBody | Table body empty (no rows) |
| SIMULADORES | calc-aporte | slider | calcAporte | Slider container empty |

---

## ❌ MISSING (23 components — no HTML element defined)

| Tab | Component | Type | Reason |
|-----|-----------|------|--------|
| NOW | kpi-grid-primario | kpi | Not in HTML |
| NOW | exposicao-cambial | gauge | Not in HTML |
| NOW | bond-pool-strip | kpi | Mapped but removed (collision) |
| PORTFOLIO | drift-semaforo-etf | semaforo | Not in HTML |
| PORTFOLIO | intra-equity-pesos | chart-bar | Not in HTML |
| PORTFOLIO | etf-composicao-regiao | table | Not in HTML |
| PORTFOLIO | posicoes-etfs-ibkr | table | Not in HTML |
| PORTFOLIO | tlh-monitor | table | Not in HTML |
| PORTFOLIO | ir-diferido | table | Not in HTML |
| PORTFOLIO | rf-posicoes | table | Not in HTML |
| PORTFOLIO | duration-renda-plus | card | Not in HTML |
| PERFORMANCE | alpha-itd-swrd | kpi | Not in HTML |
| PERFORMANCE | information-ratio | chart-line | Not in HTML |
| PERFORMANCE | hodl11-pnl | kpi | Not in HTML |
| PERFORMANCE | fee-custo-complexidade | table | Not in HTML |
| BACKTEST | backtest-regime-longo | chart-line | Not in HTML |
| FIRE | what-if-cenarios | slider | Not in HTML |
| FIRE | fire-trilha | chart-line | Mapped but removed (collision) |
| FIRE | simulador-fire | slider | Mapped but removed (collision) |
| RETIRO | bond-pool-readiness | gauge | Mapped but removed (collision) |
| RETIRO | bond-pool-runway | chart-area | Mapped but removed (collision) — now has CSS hidden |
| RETIRO | income-lifecycle | chart-line | Mapped but removed (collision) — now PASS |

---

## Key Findings

### What's Working (31/66 = 47%)
- Core KPI components ✅
- Main charts (Portfolio, Performance, FIRE) ✅
- Table-based components (Backtest, Income) ✅
- Retirement planning (Sankey, Guardrails) ✅

### What's Broken (8/66 = 12%)
- Semaphore indicators (IPCA+ DCA, Renda+ thresholds) — **missing data rendering**
- Waterfall charts (Retorno) — **not implemented**
- Some tables (Minilog, Lumpy Events) — **empty/no data**
- Factor loadings chart — **canvas not drawn**

### What's Missing (23/66 = 35%)
- 16 components truly not in HTML (need implementation)
- 7 components wrongly hidden with CSS (need to unhide)

---

## Next Steps

1. **Unhide 4 hidden components** (remove CSS display:none/visibility:hidden)
2. **Debug 8 EMPTY components**:
   - Check if data is being loaded
   - Verify JS rendering functions are called
   - Check for console errors
3. **Add 16 MISSING components** to spec.json or add HTML elements
4. **Re-run test** to verify improvements

---

*Generated 2026-04-14 via test_comprehensive_components.js*
