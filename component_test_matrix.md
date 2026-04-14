# Component Test Matrix — All 66 Spec Components

**Summary:** ✅ 17/66 PASS (26%) | 🙈 7/66 HIDDEN (11%) | ⚠️ 26/66 EMPTY (39%) | ❌ 16/66 MISSING (24%)

---

## NOW Tab (19 components)

| Component ID | Label | Type | HTML ID | Render Test | Browser Test | Status |
|---|---|---|---|---|---|---|
| patrimonio-total-hero | Patrimônio Total | kpi-hero | heroPatrimonioBrl | ⚠️ | ⚠️ | EMPTY |
| pfire-hero | P(FIRE) — Cenários | kpi-hero | heroAnos | ⚠️ | ⚠️ | EMPTY |
| kpi-grid-primario | KPIs Primários — S1 | kpi | — | ❌ | ❌ | MISSING |
| kpi-grid-mercado | KPIs de Mercado — S2 | kpi | kpiIpcaMercado | ✅ | ✅ | PASS |
| fire-countdown | Time to FIRE — Countdown | kpi | fireCountdown | ✅ | ✅ | PASS |
| wellness-score | Financial Wellness Score | card | wellnessScore | ⚠️ | ⚠️ | EMPTY |
| savings-rate | Savings Rate | kpi | savingsRate | ⚠️ | ⚠️ | EMPTY |
| ter-carteira | TER da Carteira | kpi | terCarteira | ⚠️ | 🙈 | HIDDEN |
| factor-signal-kpi | Factor Signal — AVGS vs SWRD | kpi | kpiFactorSignal | ⚠️ | 🙈 | HIDDEN |
| drift-maximo-kpi | Drift Máximo vs Alvo | kpi | kpiDriftMax | ⚠️ | ⚠️ | EMPTY |
| ipca-dca-semaforo | IPCA+ 2040 & 2050 — DCA Status | semaforo | kpiIpcaSemaforo | ⚠️ | ⚠️ | EMPTY |
| renda-plus-semaforo | Renda+ 2065 — Distância do Gatilho | semaforo | kpiRendaSemaforo | ⚠️ | ⚠️ | EMPTY |
| bond-pool-strip | Bond Pool — Cobertura | kpi | kpiBondPool | ⚠️ | 🙈 | HIDDEN |
| hodl11-status | HODL11 — Status e Banda | semaforo | ipcaTaxaStatus | ✅ | ✅ | PASS |
| macro-strip | Macro — Selic / Fed Funds / Spread | semaforo | macroStrip | ✅ | ✅ | PASS |
| exposicao-cambial | Exposição Cambial BRL/USD | gauge | — | ❌ | ❌ | MISSING |
| stress-cenarios | Stress Test — Tornado | chart-bar-horizontal | pmkt-stress | ⚠️ | ⚠️ | EMPTY |
| cambio-mercado | Câmbio BRL/USD | kpi | kpiCambio | ✅ | ✅ | PASS |
| tornado-sensitivity | Tornado — Sensibilidade por Variável | chart-bar-horizontal | tornadoChart | ⚠️ | ⚠️ | EMPTY |

---

## PORTFOLIO Tab (12 components)

| Component ID | Label | Type | HTML ID | Render Test | Browser Test | Status |
|---|---|---|---|---|---|---|
| drift-semaforo-etf | Drift por ETF | semaforo | — | ❌ | ❌ | MISSING |
| intra-equity-pesos | Intra-Equity — Pesos vs Alvo | chart-bar | — | ❌ | ❌ | MISSING |
| geo-donut | Exposição Geográfica (Donut) | chart-donut | geoDonut | ⚠️ | ⚠️ | EMPTY |
| stacked-alloc | Alocação — Barras Empilhadas | chart-bar | stackedAllocBar | ✅ | ✅ | PASS |
| etf-composicao-regiao | Composição por Região e Fator | table | — | ❌ | ❌ | MISSING |
| posicoes-etfs-ibkr | Posições — ETFs Internacionais | table | — | ❌ | ❌ | MISSING |
| custo-base-bucket | Base de Custo — por Bucket | table | custoBaseBody | ✅ | ✅ | PASS |
| minilog | Últimas Operações | table | minilogBody | ⚠️ | ⚠️ | EMPTY |
| tlh-monitor | TLH Monitor — Lotes e P&L | table | — | ❌ | ❌ | MISSING |
| ir-diferido | IR Diferido por ETF | table | — | ❌ | ❌ | MISSING |
| rf-posicoes | Renda Fixa — Posições | table | — | ❌ | ❌ | MISSING |
| duration-renda-plus | Duration — Renda+ 2065 | card | — | ❌ | ❌ | MISSING |

---

## PERFORMANCE Tab (11 components)

| Component ID | Label | Type | HTML ID | Render Test | Browser Test | Status |
|---|---|---|---|---|---|---|
| evolucao-carteira | Evolução Patrimonial | chart-line | terCarteira | ⚠️ | 🙈 | HIDDEN |
| alpha-itd-swrd | Alpha ITD vs SWRD | kpi | — | ❌ | ❌ | MISSING |
| cagr-patrimonial-twr | CAGR Patrimonial vs TWR | kpi | cagrTwrRow | ✅ | ✅ | PASS |
| factor-loadings-chart | Factor Loadings — FF5 + Momentum | chart-bar-horizontal | factorLoadingsChart | ⚠️ | ⚠️ | EMPTY |
| factor-rolling-avgs | Rolling 12m — AVGS vs SWRD | chart-line | factorRollingBody | ✅ | ✅ | PASS |
| retorno-decomposicao | Decomposição de Retorno | waterfall | simRetorno | ⚠️ | ⚠️ | EMPTY |
| heatmap-retornos | Heatmap — Retornos Mensais | table | heatmapContainer | ✅ | ✅ | PASS |
| rolling-sharpe | Rolling Sharpe 12m | chart-line | rollingIRNota | ✅ | ✅ | PASS |
| information-ratio | Information Ratio vs VWRA | chart-line | — | ❌ | ❌ | MISSING |
| hodl11-pnl | HODL11 — P&L e Custo Médio | kpi | — | ❌ | ❌ | MISSING |
| fee-custo-complexidade | Fee Analysis — Custo vs Alpha | table | — | ❌ | ❌ | MISSING |

---

## BACKTEST Tab (4 components)

| Component ID | Label | Type | HTML ID | Render Test | Browser Test | Status |
|---|---|---|---|---|---|---|
| backtest-metricas | Backtest Histórico — Métricas | table | backtestChart | ⚠️ | ⚠️ | EMPTY |
| shadow-portfolios | Shadow Portfolios — Retorno Acumulado | chart-line | shadowChart | ⚠️ | ⚠️ | EMPTY |
| backtest-regime-longo | Backtest Longo — Regime 5-7 | chart-line | — | ❌ | ❌ | MISSING |
| drawdown-historico | Drawdown Histórico | chart-area | drawdownHistNota | ⚠️ | ⚠️ | EMPTY |

---

## FIRE Tab (10 components)

| Component ID | Label | Type | HTML ID | Render Test | Browser Test | Status |
|---|---|---|---|---|---|---|
| fire-trilha | Trilha FIRE — Realizado vs Projetado | chart-line | wiFireEta | ⚠️ | ⚠️ | EMPTY |
| net-worth-projection | Projeção Patrimônio P10/P50/P90 | fan-chart | netWorthProjectionSrc | ✅ | ✅ | PASS |
| fire-matrix | FIRE Matrix — P(Sucesso) × Gasto | table | wiFireEta | ⚠️ | ⚠️ | EMPTY |
| glide-path | Glide Path — Alocação por Idade | chart-area | glideChart | ⚠️ | ⚠️ | EMPTY |
| simulador-fire | Simulador FIRE — Interativo | slider | wiFireEta | ⚠️ | ⚠️ | EMPTY |
| what-if-cenarios | What-If Scenarios — Gasto vs P(FIRE) | slider | — | ❌ | ❌ | MISSING |
| earliest-fire | Earliest FIRE Date | kpi | wiFireEta | ⚠️ | ⚠️ | EMPTY |
| eventos-vida | Eventos de Vida — Impacto no Plano | table | eventosVidaBody | ✅ | ✅ | PASS |
| lumpy-events | Lumpy Events — Gastos Grandes | table | lumpyEventsBody | ⚠️ | ⚠️ | EMPTY |
| pfire-familia | P(FIRE) — Cenários de Família | card | kpiPfire50 | ⚠️ | ⚠️ | EMPTY |

---

## RETIRO Tab (8 components)

| Component ID | Label | Type | HTML ID | Render Test | Browser Test | Status |
|---|---|---|---|---|---|---|
| guardrails-retirada | Guardrails de Retirada | table | guardrailsSrc | ✅ | ✅ | PASS |
| swr-percentis | SWR no FIRE Day — Percentis | kpi | wiSWRLabel | ⚠️ | ⚠️ | EMPTY |
| spending-breakdown | Spending — Essenciais vs Discricionários | card | spendingChart | ⚠️ | 🙈 | HIDDEN |
| income-fases | Renda na Aposentadoria — Fases | table | incomeSrc | ✅ | ✅ | PASS |
| bond-pool-readiness | Bond Pool — Readiness Detail | gauge | kpiBondPool | ⚠️ | 🙈 | HIDDEN |
| bond-pool-runway | Bond Pool — Projeção até FIRE Day | chart-area | kpiBondPool | ⚠️ | 🙈 | HIDDEN |
| income-lifecycle | Projeção de Renda — Ciclo de Vida | chart-line | incomeSrc | ✅ | ✅ | PASS |
| sankey-cashflow | Sankey — Fluxo de Caixa Anual | chart-area | sankeySrc | ✅ | ✅ | PASS |

---

## SIMULADORES Tab (2 components)

| Component ID | Label | Type | HTML ID | Render Test | Browser Test | Status |
|---|---|---|---|---|---|---|
| calc-aporte | Calculadora de Aporte | slider | calcAporte | ⚠️ | ⚠️ | EMPTY |
| stress-test-mc | Stress Test MC — Bear Market | slider | pmkt-stress | ⚠️ | ⚠️ | EMPTY |

---

## Status Legend

- **✅ PASS** — Element found, visible, and fully rendered
- **🙈 HIDDEN** — Element exists but hidden (CSS display:none or visibility:hidden)
- **⚠️ EMPTY** — Element exists and visible but no content detected (empty/placeholder)
- **❌ MISSING** — No mapping to HTML element ID or element not in DOM

---

## Key Findings

### Critical Issues (MISSING)

16 components have no mapped HTML ID:
- `kpi-grid-primario` (NOW)
- `exposicao-cambial` (NOW)
- `drift-semaforo-etf` (PORTFOLIO)
- `intra-equity-pesos` (PORTFOLIO)
- `etf-composicao-regiao` (PORTFOLIO)
- `posicoes-etfs-ibkr` (PORTFOLIO)
- `tlh-monitor` (PORTFOLIO)
- `ir-diferido` (PORTFOLIO)
- `rf-posicoes` (PORTFOLIO)
- `duration-renda-plus` (PORTFOLIO)
- `alpha-itd-swrd` (PERFORMANCE)
- `information-ratio` (PERFORMANCE)
- `hodl11-pnl` (PERFORMANCE)
- `fee-custo-complexidade` (PERFORMANCE)
- `backtest-regime-longo` (BACKTEST)
- `what-if-cenarios` (FIRE)

### Hidden Components (7)

Components that exist but are not visible:
- `ter-carteira` (NOW)
- `factor-signal-kpi` (NOW)
- `bond-pool-strip` (NOW)
- `evolucao-carteira` (PERFORMANCE)
- `spending-breakdown` (RETIRO)
- `bond-pool-readiness` (RETIRO)
- `bond-pool-runway` (RETIRO)

### Empty/Non-Rendering Components (26)

Elements that exist but show no content (need debugging):
- Most chart components (backtest-metricas, shadow-portfolios, etc.)
- Several KPI components (patrimonio-total-hero, pfire-hero, etc.)
- Table components (minilog, lumpy-events, fire-matrix)
- Interactive components (calc-aporte, stress-test-mc)

---

## Next Steps

1. **For MISSING components**: Either add HTML elements to dashboard or update spec.json to match actual HTML
2. **For HIDDEN components**: Investigate CSS or tab initialization logic that's hiding these elements
3. **For EMPTY components**: Debug rendering logic in JS modules (04-charts-portfolio.mjs, 05-fire-projections.mjs, etc.)
