# Dashboard Components Audit — Old vs React (Complete Report)

**Data:** 2026-04-14  
**Total Components Found:** 49 (old HTML) vs 61 (React spec.json)  
**Status:** Old dashboard was richer — multiple features missing or degraded in React version

---

## Executive Summary

The old monolithic HTML dashboard had **49 distinct components** providing granular financial visibility. The current React implementation targets **61 components** but many are incomplete, missing data fields, or lack the interactive depth of the original.

### Key Findings:
- ✅ **Charts mostly ported** (17/20 charts exist)
- ⚠️ **Tables degraded** (7/10 missing detail columns or pivots)
- ❌ **Interactive simulators incomplete** (3/3 present but lack sensitivity depth)
- ❌ **No DCA card grid** (macro context empty)
- ❌ **No Sankey** (cash flow visualization missing)
- ❌ **No guardrails logic table** (decision rules scattered across text)

---

## Component-by-Component Audit

### **ABA: "HOJE" (NOW) — 8 components**

| # | Component | Old Implementation | React Status | Missing/Changed |
|---|-----------|-------------------|--------------|-----------------|
| 1 | **Time to FIRE** | Hero card with countdown date, days remaining, progress % | `fire-countdown` kpi-hero | ✅ Present but lacks "days remaining" countdown visual |
| 2 | **Semáforos de Gatilhos** | Collapsible table: 4 triggers (Renda+, SWRD, HODL11, Drift) with status, taxa_atual, piso, gap, ação | **MISSING** | ❌ No unified trigger dashboard — scattered across KPIs |
| 3 | **Progresso FIRE** | % bar: patrimonio_atual / patrimonio_gatilho | `kpi-grid-primario` kpi (subset) | ⚠️ Exists as fire-percentage but no visual bar |
| 4 | **Aporte do Mês** | Card: expected vs YTD vs realized | **MISSING** | ❌ No monthly aporte status display |
| 5 | **P(FIRE) — Monte Carlo + Tornado** | Dual display: (a) P(FIRE) % Base/Asp, (b) Tornado bars for sensitivity (rate, expense, tenure) | `stress-cenarios` chart-bar-horizontal | ⚠️ Tornado present but P(FIRE) moved to `pfire-hero` (split across 2 blocks) |
| 6 | **Financial Wellness Score** | Collapsible: score 0-100, segmentation by theme, "opportunities to improve" | `wellness-score` card | ⚠️ Score shown but no "oportunidades de melhora" list |
| 7 | **Contexto Macro & DCA Status** | (a) Macro strip (Selic, Fed Funds), (b) DCA cards grid (IPCA 2040, IPCA 2050, Renda+ 2065 each with regime status) | `ipca-dca-semaforo`, `renda-plus-semaforo`, `macro-strip` | ⚠️ Split into 3 semaforos but NO card grid showing all DCA regimes in one view |
| 8 | **Sankey — Fluxo de Caixa Anual** | Sankey diagram: renda → custo → aporte → destino (IPCA/Renda+/Equity) | **MISSING** | ❌ No cash flow Sankey diagram |

**"HOJE" Summary:** 4/8 components present (50%), 2/4 missing have critical decision-making value (Semáforos, Aporte do Mês, Sankey, DCA card grid)

---

### **ABA: CARTEIRA (PORTFOLIO) — 10 components**

| # | Component | Old Implementation | React Status | Missing/Changed |
|---|-----------|-------------------|--------------|-----------------|
| 9 | **Exposição Geográfica — Equities** | Donut chart: US, Desenvolvidos ex-US, Emergentes, Brasil, categorizados | `geo-donut` chart-donut | ✅ Present |
| 10 | **Alocação — Barras Empilhadas** | Stacked bar: 4 periods (inicial, 2021, 2025, atual) showing RF/SWRD/AVGS/AVEM/HODL11 evolution | `stacked-alloc` chart-bar | ✅ Present (but showing only current, not historical evolution) |
| 11 | **Composição por Região — ETFs** | Table: (região) × (SWRD, AVGS, AVEM, JPGL) = % exposição each | `etf-composicao-regiao` table | ✅ Present |
| 12 | **Exposição Fatorial — ETFs** | Table: (ETF) × (MKT-RF, SMB, HML, RMW, CMA, Mom) = beta coef, significância highlighted | `etf-composicao-regiao` table | ⚠️ Lumped with region table; factor exposures buried |
| 24 | **Posições — ETFs Internacionais (IBKR)** | Table: ticker, qty, price_unit, bucket, valor_total, %carteira, taxa_anual | `posicoes-etfs-ibkr` table | ✅ Present |
| 25 | **Base de Custo e Alocação — Equity** | Table: bucket, base_custo_total, custo_medio_unit, qty, unrealized_pnl, % | `custo-base-bucket` table | ✅ Present |
| 39 | **IR Diferido — Alvo & Transitório** | Collapsible table: (ETF) × (base cost) × (current price) × (unrealized gain) × (IR if sold now) × (deferred) | `ir-diferido` table | ✅ Present |
| 40 | **Renda Fixa + Cripto** | Cards section: IPCA 2029, IPCA 2040, IPCA 2050, Renda+ 2065 (each: qty, current_price, valor, taxa), HODL11 (qty, price, valor, %alvo) | `rf-posicoes` + `hodl11-status` tables/cards | ⚠️ Split into 2 blocks; no unified "renda fixa + cripto" view |
| 41 | **HODL11 Band Visualization** | Gradient band 1.5% → 3% → 5% with position marker, target, banda bounds | `hodl11-status` semaforo | ✅ Present |
| 48 | **Últimas Operações** | Table: date, ticker, qty, price, type (buy/sell), spread | `minilog` table | ✅ Present |

**PORTFOLIO Summary:** 8/10 present (80%), but 2 merged/split awkwardly (#12 fatorial buried, #40 split), losing cohesion of "complete position view"

---

### **ABA: FIRE — 8 components**

| # | Component | Old Implementation | React Status | Missing/Changed |
|---|-----------|-------------------|--------------|-----------------|
| 13 | **Tracking FIRE — Realizado vs Projeção** | Line chart: actual patrimonio (2021-2026) vs MC median (50º percentil) | `fire-trilha` chart-line | ✅ Present |
| 14 | **Cenário Base vs Cenário Aspiracional** | Side-by-side comparison table: date_fire, patrimonio_fire, swr_p50, P(FIRE) base/asp | **MISSING** | ❌ No comparative view of scenarios — only separate P(FIRE) displays |
| 16 | **Glide Path — Alocação por Idade** | Area chart stacked: % equity (green), RF (blue), Cash (gray) vs years to FIRE | `glide-path` chart-area | ✅ Present |
| 18 | **Projeção de Patrimônio P10/P50/P90** | Fan chart: P10, P50 (line), P90 bands from MC | `net-worth-projection` fan-chart | ✅ Present |
| 20 | **FIRE Matrix — P(Sucesso 30 anos)** | Pivot table: (gastos) rows × (alocação) cols = P(FIRE) % cells color-coded | `fire-matrix` table | ✅ Present |
| 26 | **Eventos de Vida — Impacto no Plano** | Collapsible table: evento (casamento, filhos, mudança), description, delta patrimonio, delta FIRE date | **MISSING** | ❌ No life events impact tracker |
| 27 | **P(FIRE) — Cenários de Família** | Table: profile (solteiro, casado, casado+filho), current_cost, new_cost, new_P(FIRE), months_away | **MISSING** | ❌ Family scenario modeling missing |
| 42 | **Simulador FIRE — Aposentadoria Antecipada** | Slider: set age → recalc P(FIRE), patrimonio needed, new date | `simulador-fire` slider | ⚠️ Present but may lack real-time MC recalc feedback |

**FIRE Summary:** 4/8 full (50%), 2/8 missing have behavioral/planning value (Eventos, Family scenarios), 1 merged differently (scenarios), 1 may lack interactivity depth

---

### **ABA: PERFORMANCE (PERF) — 9 components**

| # | Component | Old Implementation | React Status | Missing/Changed |
|---|-----------|-------------------|--------------|-----------------|
| 15 | **Alpha ITD vs SWRD (USD)** | Line chart: cumulative excess return REAL vs SWRD since inception | `alpha-itd-swrd` kpi | ⚠️ Present as KPI but losing chart time-series view |
| 28 | **Premissas vs Realizado — 5 Anos** | Table: aporte_premissa, aporte_realizado, rentabilidade_premissa, rentabilidade_realizada, patrimonio_proj vs real | **MISSING** | ❌ No assumptions validation table |
| 29 | **Retornos Mensais — Heatmap** | Heatmap: rows = years, cols = months, cells = monthly return %, color-coded red/green | `heatmap-retornos` table | ✅ Present |
| 30 | **Patrimônio — Evolução Histórica** | Line chart: patrimonio_liquido timeline 2021-2026 with total + breakdown (equity/rf/crypto) | `evolucao-carteira` chart-line | ✅ Present |
| 31 | **Performance Attribution — Decomposição** | Waterfall chart: inicio + aportes + retorno_rf + retorno_equity + retorno_crypto + FX = fim | `retorno-decomposicao` waterfall | ✅ Present |
| 32 | **Rolling Sharpe — 12m** | Dual line: Sharpe(BRL vs CDI) and Sharpe(USD vs T-Bill) rolling 12m | `rolling-sharpe` chart-line | ✅ Present |
| 36 | **Rolling 12m — AVGS vs SWRD** | Line chart: rolling 12m excess return AVGS vs SWRD | `factor-rolling-avgs` chart-line | ✅ Present |
| 38 | **Information Ratio vs VWRA** | Line chart: IR rolling 36m + ITD | `information-ratio` chart-line | ✅ Present |
| 49 | **Factor Loadings — Regressão FF5+Momentum** | Horizontal bar chart: (ETF) rows × (factor loadings) bars, significance highlighted, R² badge | `factor-loadings-chart` chart-bar-horizontal | ✅ Present (but missing R² quality badge) |

**PERFORMANCE Summary:** 7/9 present (78%), 1 missing (premissas), 1 downgraded from chart to KPI (alpha-itd), 1 missing factor quality badge

---

### **ABA: BACKTEST — 4 components**

| # | Component | Old Implementation | React Status | Missing/Changed |
|---|-----------|-------------------|--------------|-----------------|
| 33 | **Backtest Histórico — Target vs VWRA** | Line chart: regime 5-7 portfolio vs VWRA since 2010/2015 | `backtest-regime-longo` chart-line + `shadow-portfolios` chart-line | ✅ Present (split into 2) |
| 34 | **Shadow Portfolios — Tracking** | Linea: target vs shadow ports (60/40, 80/20, etc.) overlay | `shadow-portfolios` chart-line | ✅ Present |
| 35 | **Backtest Longo — Regime 5-7 (1995-2026)** | Line chart with metrics: CAGR, max drawdown, Sharpe labeled on chart | `backtest-metricas` table | ⚠️ Present as table, losing visual time-series view of backtest |
| 37 | **Drawdown Histórico — Série Completa** | Bar chart: drawdown magnitude by date, sorted descending | `drawdown-historico` chart-area | ✅ Present |

**BACKTEST Summary:** 4/4 present (100%), but 1 split oddly (backtest metricas lost time-series chart representation)

---

### **ABA: RETIRO (WITHDRAWAL) — 7 components**

| # | Component | Old Implementation | React Status | Missing/Changed |
|---|-----------|-------------------|--------------|-----------------|
| 17 | **Bond Pool Readiness — SoRR** | (a) Progress bar 0.8/7 anos, (b) Composition table (IPCA 2029, 2040, 2050 / Renda+ 2065), (c) Strategy cards, (d) Runway chart | `bond-pool-readiness` gauge + `bond-pool-runway` chart-area | ⚠️ Present but Composition table + strategy cards lost |
| 19 | **SWR no FIRE Day — Percentis** | Cards: P10, P50, P90 of SWR as separate metrics | `swr-percentis` kpi | ✅ Present |
| 21 | **Guardrails de Retirada — FIRE Day** | Collapsible table: (high guardrail) action, (normal) action, (low guardrail) action with if/then logic | **MISSING** | ❌ Guardrails logic table missing — decision rules scattered |
| 22 | **Spending Guardrails — P(FIRE) × Custo** | Table: if P(FIRE) drops below X% OR expense rises above Y, then (reduce aporte | pause | adjust retirada) | **MISSING** | ❌ Spending guardrails missing |
| 23 | **Renda na Aposentadoria — Fases Temporais** | Timeline: INSS aos 65, Renda+ aos 60, Taxa esperada, montante mês | **MISSING** | ❌ No retirement income phases timeline |
| 45 | **Projeção de Renda — Ciclo de Vida** | Timeline 2026-2077: INSS + Renda+ + equity retirada stacked by source | `income-fases` table | ⚠️ Present but not timeline-visual |
| 46 | **Spending — Essenciais vs Discricionários** | Pie/bar: essenciais (base costs), necessários (margin 10%), discricionários (volatility) | `spending-breakdown` card | ✅ Present |

**RETIRO Summary:** 2/7 full (29%), 2/7 missing (guardrails, which are CRITICAL for retirada mechanics), 2/7 downgraded (bond pool loses composition detail, income phases not timeline-visual), 1 split awkwardly

---

### **ABA: SIMULADORES (SIMULATORS) — 3 components**

| # | Component | Old Implementation | React Status | Missing/Changed |
|---|-----------|-------------------|--------------|-----------------|
| 43 | **What-If Scenarios — Cenário/Gasto** | Sliders: vary retirement_age, annual_expense → output FIRE date, patrimonio_needed, P(FIRE) | `what-if-cenarios` slider | ⚠️ Present but may lack cross-sensitivity (how does age affect expense assumption?) |
| 44 | **Stress Test MC — Bear Market Interativo** | Slider: market_decline % (0-50%) → run MC with correlated drop → P(FIRE) result | `stress-test-mc` slider | ⚠️ Present but output clarity may be lacking |
| 47 | **Calculadora de Aporte — Cascade** | Slider: available_renda → auto-split IPCA%/Renda+%/Equity% → recommended buys by priority | `calc-aporte` slider | ⚠️ Present but logic may differ (spec says "cascade" split logic) |

**SIMULADORES Summary:** 3/3 present (100%), but all 3 may lack depth in sensitivity/cascade logic vs old implementation

---

## Summary Table: Component Coverage

| Tab | Old | React | Complete | Partial | Missing | Coverage |
|-----|-----|-------|----------|---------|---------|----------|
| Hoje | 8 | 10 | 4 | 2 | 2 | 50% |
| Carteira | 10 | 10 | 8 | 2 | 0 | 80% |
| Fire | 8 | 8 | 4 | 2 | 2 | 50% |
| Perf | 9 | 9 | 7 | 1 | 1 | 78% |
| Backtest | 4 | 5 | 3 | 1 | 0 | 100% |
| Retiro | 7 | 7 | 2 | 3 | 2 | 29% |
| Simuladores | 3 | 3 | 0 | 3 | 0 | 0% |
| **TOTAL** | **49** | **61** | **28** | **14** | **7** | **57%** |

---

## Critical Missing Components (Decision-Making Impact)

### 🔴 **Tier 1: Stop-the-line missing** (block deployment)

1. **Semáforos de Gatilhos** (Hoje) — 4 unified status triggers
   - **Why critical:** Diego checks this first thing every day; currently scattered across multiple KPIs
   - **Data needed:** Array of {trigger_id, status, valor, piso, gap, ação}
   - **Estimated effort:** 2–3h

2. **Guardrails de Retirada + Spending Guardrails** (Retiro) — Decision rules engine
   - **Why critical:** Defines what Diego does when P(FIRE) or expense moves; not present anywhere
   - **Data needed:** guardrails[] with {trigger, condition, action, priority}
   - **Estimated effort:** 4–5h

3. **DCA Status Card Grid** (Hoje) — Active regime visibility
   - **Why critical:** Diego needs to see which instruments are "on" (ATIVO/PAUSADO) at a glance
   - **Data needed:** dca_status[] with composition showing all 3-4 regimes
   - **Estimated effort:** 2–3h

### 🟠 **Tier 2: High-value missing** (planning/analysis)

4. **Sankey — Fluxo de Caixa** (Hoje) — Cash flow direction
   - Why: Shows where renda goes; critical for understanding savings rate
   - Estimated effort: 3–4h

5. **Bond Pool Readiness — Composition + Strategy** (Retiro) — SoRR defense detail
   - Why: Current shows progress bar but loses composition and strategy context
   - Estimated effort: 2–3h

6. **Premissas vs Realizado** (Perf) — Assumption validation
   - Why: Validates whether model assumptions hold; critical feedback loop
   - Estimated effort: 2–3h

---

## Downgraded Components (Lose Visual Representation)

| Component | Old Format | React Format | Loss |
|-----------|-----------|--------------|------|
| Alpha ITD | Line chart time-series | KPI number | Loses temporal view of alpha creation |
| Backtest Long | Line chart + metrics | Table metrics | Loses regime visualization |
| Renda na Aposentadoria | Timeline visual | Table | Loses phase sequencing visual |
| Composição Fatores | Separated table | Merged with region table | Loses factor-specific focus |
| Bond Pool | Multi-card flow | Gauge + runway only | Loses composition detail + strategy cards |

---

## Data Schema Additions Required

To implement all 49 components identically to old dashboard:

```python
# Tier 1 (CRITICAL)
semaforo_triggers = [
  {id, label, category, status, valor, piso, gap_pp, acao, detalhe}
]
guardrails_retirada = [
  {id, guardrail_level, condition, acao, prioridade}
]
guardrails_spending = [
  {id, metric, threshold_low, threshold_high, acao}
]
dca_status = [
  {id, instrumento, regime, taxa_atual, piso_compra, alvo_pct, atual_pct, detalhe}
]

# Tier 2 (HIGH VALUE)
sankey_fluxo = {
  renda, custo, aporte, destino_ipca, destino_renda, destino_equity
}
bond_pool_composicao = [
  {produto, qty, current_price, valor, % da meta}
]
bond_pool_strategy = {
  janela_ativa, pre_fire_tactical, docs_com_recomendacoes
}

# Tier 3 (NICE TO HAVE)
premissas_vs_realizado = [
  {premissa, ano_valor_esperado, valor_realizado, % diferenca}
]
eventos_vida = [
  {evento, descricao, delta_patrimonio, delta_fire_date}
]
cenarios_familia = [
  {perfil, custo_atual, custo_novo, p_fire_novo, meses_adicional}
]
```

---

## Recommendations

### **Sprint 1 Priority (5 days):**
1. **Semáforos de Gatilhos** — Hero dashboard
2. **DCA Status Card Grid** — Regime visibility
3. **Guardrails Decision Table** — Retirada mechanics

### **Sprint 2 Priority (5 days):**
4. **Sankey Fluxo de Caixa** — Cash flow transparency
5. **Bond Pool Composition + Strategy** — SoRR defense detail
6. **Premissas vs Realizado** — Assumption validation

### **Sprint 3 Priority (3 days):**
7. **Eventos de Vida** — Planning scenarios
8. **Cenários de Família** — Family impact modeling
9. **Renda Phases Timeline** — Retirement phase visibility

### **Quick Wins (2 days):**
- Restore Alpha ITD as line chart (not KPI)
- Restore Factor Loadings R² badge
- Fix Composição Fatorial table focus
- Timeline visualization for Renda phases

---

## Validation Checklist

Before any component goes live, ensure:

- [ ] Data fields defined in spec.json exist in data.json generated by generate_data.py
- [ ] No hardcoded values; all from data source
- [ ] Privacy mode tested (.pv class masking)
- [ ] Responsive at 320px, 768px, 1024px, 1440px
- [ ] Dark theme CSS variables consistent with existing palette
- [ ] Collapsible sections default-closed for below-fold components
- [ ] Test coverage in tests/display-validation.test.ts + tests/data-validation.test.ts

