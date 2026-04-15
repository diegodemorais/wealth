# DashHTML v2.77 - ÍNDICE DE COMPONENTES POR ABA

## METADATA
- **Arquivo**: `/Users/diegodemorais/claude/code/wealth/analysis/raw/DashHTML-estavel.html`
- **Versão**: v2.77 (Estável de Referência)
- **Linhas**: 14.862
- **Data**: Abril 2026
- **Status**: Produção (baseline para React v0.1.118)

---

## ABA: 📡 NOW (hoje)

### Componentes Ordenados:

1. **HERO STRIP** (linha 337–353)
   - Grid: 4 colunas responsivo
   - KPIs: Patrimônio Total (PRIMARY), Anos FIRE, Progresso FIRE, [vazio]
   - Classes: `.hero-kpi`, `.hero-kpi.primary`
   - Layout: 4→3→2→1 col (desktop→tablet→mobile)

2. **KPI GRID: Indicadores Primários** (linha 359–378)
   - Grid: auto-fit minmax(140px)
   - Items: P(Aspiracional), Drift Máximo, Aporte Mês
   - Classes: `.kpi`, `.kpi-fire`
   - Hidden: kpiBondPool, kpiWellness

3. **KPI GRID: Contexto Mercado** (linha 381–415)
   - Grid: auto-fit minmax(140px)
   - Items: Dólar, Bitcoin, IPCA+ 2040, Renda+ 2065
   - Classes: `.kpi` (opacity .85)
   - Hidden: kpiDelta, kpiFactorSignal

4. **SEÇÃO: Time to FIRE** (linha 418–430)
   - Component: `.fire-big` (3rem)
   - Progress bar: Logarítmica (accent→purple)
   - Grid dinâmico: Cenários Base/Fav/Stress
   - Canvas: Oculto (spendingChart, scenarioChart)

5. **SEÇÃO: Semáforos de Gatilhos** [COLLAPSIBLE, CRITICAL] (linha 433–441)
   - Classes: `.section.section-critical.collapsible`
   - Tabela: `.semaforo-table` (dinamicamente preenchida)
   - Cols: Gatilho | Status (dot) | Valor | Alvo | Ação
   - Ícone toggle: h2 onclick="toggleSemaforoPanel()"

6. **GRID 2-COL: Progresso FIRE + Aporte** (linha 444–474)
   - Classes: `.grid-2`
   - LEFT: Progresso FIRE (%, progress bar, SWR info)
   - RIGHT: Aporte Mês (taxa green, progress bar)
   - Subseções: `.progress-bar`, `.progress-fill`

7. **SEÇÃO: P(FIRE) — Monte Carlo + Tornado** (linha 478–515)
   - Classes: `.section`, `.grid-2`
   - LEFT: 3 scenario cards (Base/Fav/Stress + chart)
   - RIGHT: 3 progress bars (IPCA+, Alpha, Taxa)
   - Gráfico: Canvas (tornado-like)

8. **SEÇÃO: Macro Context** [COLLAPSIBLE, OPEN] (linha 537–563)
   - Classes: `.section.collapsible.open`
   - Macro KPI Strip: grid auto-fit
   - Dinâmico: Taxas, câmbio, status econômico

9. **SEÇÃO: Sankey Chart** [COLLAPSIBLE, OPEN] (linha 564–570)
   - Classes: `.section.collapsible.open`
   - Canvas: id="sankeyChart"
   - Fluxos: Caixa/patrimônio

---

## ABA: 🎯 PORTFOLIO (carteira)

### Componentes Ordenados:

1. **SEÇÃO: Exposição Geográfica** (linha 576–580)
   - Chart: Donut (canvas id="geoDonut", height 180px)
   - Data: US %, DM ex-US %
   - Nota com fonte

2. **SEÇÃO: Alocação — Barras Empilhadas** (linha 583–594)
   - Classes: `.section`
   - Sub 1: Stacked bar horizontal (classe/ativo)
     - Container: id="stackedAllocBar" (flex, 32px)
     - Legend: id="stackedAllocLegend"
   - Sub 2: Intra-Equity pesos
     - Container: id="stackedEquityBar" (flex-col)

3. **SEÇÃO: Composição por Região** [COLLAPSIBLE] (linha 597–604)
   - Classes: `.section.collapsible`
   - Tables: #etfRegionTable, #etfVemTable
   - Dinâmicas (geradas por JS)

4. **SEÇÃO: Exposição Fatorial** [COLLAPSIBLE] (linha 607–613)
   - Classes: `.section.collapsible`
   - Table: #etfFactorTable
   - Cols: ETF | Value | Size | Prof | Inv
   - Dinâmica (JS)

5. **SEÇÃO: HODL Holdings** (linha 794–818)
   - Classes: `.section`
   - Table: #hodlTableBody (dinâmica)
   - Cols: Ativo | Qtd | Preço | Valor Total | % | P&L YTD

6. **SEÇÃO: Renda Fixa + Cripto** (linha 1105–1113)
   - Classes: `.section`
   - Tables: RF, Cripto
   - Dinâmicas

7. **SEÇÃO: Tax — IR Venda ETF** [COLLAPSIBLE] (linha 1096–1104)
   - Classes: `.section.collapsible`
   - Grid: auto-fit minmax(180px)
   - Cards: ETF compostos (nome, ganho, IR, status)

8. **SEÇÃO: Brasil Monitor** [COLLAPSIBLE] (linha 1339–1348)
   - Classes: `.section.collapsible`
   - Card: Brasil % destaque (yellow)
   - Breakdown: Posições Brasil

---

## ABA: 📈 PERFORMANCE (perf)

### Componentes Ordenados:

1. **SEÇÃO: Premissas vs Realizado** (linha 862–869)
   - Classes: `.section`
   - Table: #premissasVsRealizadoSection
   - Cols: Métrica | Premissa | Realizado | Delta | Status
   - Color-coded rows

2. **SEÇÃO: Patrimônio — Evolução** (linha 880–895)
   - Classes: `.section`
   - Table: Histórico anual
   - Cols: Ano | BRL | USD | Aporte | Retorno | CAGR YTD

3. **SEÇÃO: Performance Attribution** (linha 896–918)
   - Classes: `.section`
   - Chart: Sankey/Waterfall (canvas id="sankey")
   - Dinâmico

4. **SEÇÃO: Alpha vs SWRD** [COLLAPSIBLE, OPEN] (linha 635–670)
   - Classes: `.section.collapsible.open`
   - Grid 2-col:
     - LEFT: Bar chart (id="deltaChart", 180px)
     - RIGHT: 3 progress bars (IPCA+, Alpha, Taxa)

5. **SEÇÃO: Glide Path** [COLLAPSIBLE] (linha 673–679)
   - Classes: `.section.collapsible`
   - Chart: Area (canvas id="glideChart")
   - Data: Equity%, RF%, Crypto 3%

6. **SEÇÃO: Factor Rolling 12m** [COLLAPSIBLE, OPEN] (linha 1025–1032)
   - Classes: `.section.collapsible.open`
   - Chart: Line (canvas, dinâmico)
   - Threshold: −5pp (linha vermelha)

7. **SEÇÃO: Monthly Returns Heatmap** [COLLAPSIBLE] (linha 919–931)
   - Classes: `.section.collapsible`
   - Table: Heatmap 36 meses
   - Color-coded cells

8. **SEÇÃO: Factor Loadings FF5** [COLLAPSIBLE] (linha 1347–1364)
   - Classes: `.section.collapsible`
   - Table: Fátores Fama-French
   - Cols: Fator | Loading | t-stat | p-value | Signif

---

## ABA: 🔥 FIRE (fire)

### Componentes Ordenados:

1. **SEÇÃO: Tracking FIRE** (linha 616–620)
   - Classes: `.section`
   - Chart: Line (canvas id="trackingFireChart", 280px)
   - Lines: Realizado (azul) | Projeção (verde) | Meta (vermelho)

2. **SEÇÃO: Cenário Base vs Aspiracional** (linha 623–627)
   - Classes: `.section`
   - Table: Comparação lado-a-lado
   - Dinâmico (JS: buildScenarioComparison())

3. **SEÇÃO: Projeção Patrimônio P10/P50/P90** (linha 697–706)
   - Classes: `.section`
   - Chart: Fan chart/área (canvas)
   - Dinâmico

4. **SEÇÃO: FIRE Matrix** [COLLAPSIBLE] (linha 716–742)
   - Classes: `.section.collapsible`
   - Table: Matriz SWR vs Patrimônio
   - Cells: color-coded (verde/amarelo/vermelho)

5. **SEÇÃO: DCA / Investimento** [COLLAPSIBLE] (linha 841–851)
   - Classes: `.section.collapsible`
   - Grid: auto-fit minmax(260px)
   - Cards: `.dca-card` (investimentos programados)
   - Dinâmico

6. **SEÇÃO: Wellness Extra** [COLLAPSIBLE] (linha 853–860)
   - Classes: `.section.collapsible`
   - Grid: `.wellness-extra-row`
   - Rows: Item | Dot | Valor | Alvo | Progress
   - Dinâmico

7. **SEÇÃO: Income Phase / Eventos** [COLLAPSIBLE] (linha 1285–1290)
   - Classes: `.section.collapsible`
   - Timeline ou cards
   - Dinâmico

---

## ABA: 🏖️ RETIRADA (retiro)

### Componentes Ordenados:

1. **SEÇÃO: Bond Pool Readiness** (linha 683–692)
   - Classes: `.section`
   - Cards de status (dinâmico)
   - Visualização: Progress bar, composição
   - Gráfico opcional: Runway (canvas oculto por default)

2. **SEÇÃO: SWR no FIRE Day** (linha 708–715)
   - Classes: `.section`
   - Grid: 3 cards (P10/P50/P90)
   - Classes: `.swr-pct-card.p10|p50|p90`
   - Border-left color coded

3. **SEÇÃO: Guardrails** [COLLAPSIBLE] (linha 744–760)
   - Classes: `.section.collapsible`
   - Table: Spending levels
   - Visualização: `.guardrail-bar` (28px)
   - 3 zones: verde/amarelo/vermelho

4. **SEÇÃO: Projeção de Renda** (linha 1291–1300)
   - Classes: `.section`
   - Table: Phases (Acumulação → FIRE → Drawdown)
   - Chart: Waterfall/stacked bar

5. **SEÇÃO: Stress Test** [COLLAPSIBLE] (linha 761–768)
   - Classes: `.section.collapsible`
   - Cards: Cenários estressados
   - Dinâmico

6. **SEÇÃO: Tax-Loss Harvesting** [COLLAPSIBLE] (linha 770–792)
   - Classes: `.section.collapsible`
   - Table: Posições com loss carry-forward
   - Dinâmico

---

## ABA: 🧪 SIMULADORES (simuladores)

### Componentes Ordenados:

1. **SEÇÃO: Simulador FIRE** [CRITICAL, OPEN] (linha 1115–1190)
   - Classes: `.section.section-critical`
   - **Resultado Principal** (grid 2-col):
     - LEFT: Big number (ano, idade, P%), delta vs plano
     - RIGHT: 3 cards (Aspiracional, Base, Patrimônio)
     - Timeline bar (8px gradiente)
   - **Presets** (2 eixos):
     - Condição: [Solteiro] [Casamento] [Filho]
     - Mercado: [Stress] [Base] [Favorável] [Aspiracional]
   - **Sliders** (3):
     - Aporte Mensal (5k–100k)
     - Retorno Real (0–10%)
     - Custo /ano (150k–500k)

2. **SEÇÃO: What-If Scenarios** [COLLAPSIBLE, OPEN] (linha 1193–1232)
   - Classes: `.section.collapsible.open`
   - Presets: 3 buttons (Stress/Base/Fav)
   - Slider: Custo de vida
   - Output grid 2-col:
     - P(Sucesso 30y), Gasto sustentável, Patrimônio, Recomendação

3. **SEÇÃO: Timing Analysis** [COLLAPSIBLE] (linha 1234–1284)
   - Classes: `.section.collapsible`
   - Table: "Se aposentasse hoje?"
   - Rows: Cenários +0/+1/+2/+3 anos
   - Dinâmico

4. **SEÇÃO: Calculadora Aporte** (linha 1313–1340)
   - Classes: `.section`
   - Form: Patrimônio atual, Retorno, Aporte, Horizonte
   - Button: "Calcular"
   - Output: Patrimônio final, Total aportado, %

---

## ABA: 📊 BACKTEST (backtest)

### Componentes Ordenados:

1. **SEÇÃO: Backtest Histórico** [COLLAPSIBLE, OPEN] (linha 933–970)
   - Classes: `.section.collapsible.open`
   - Period buttons: 7 opções
   - Chart: Line (canvas id="backtestChart", 320px)
   - Table: Métricas (CAGR, Vol, Sharpe, MD, Sortino, Calmar, Retorno, TER)
   - Cards: CAGR Patrimonial vs TWR (2-col grid)

2. **SEÇÃO: Shadow Portfolios** [COLLAPSIBLE, OPEN] (linha 973–999)
   - Classes: `.section.collapsible.open`
   - Table: Benchmarks vs Target
   - Period buttons: 6 opções
   - Chart: Line (canvas id="shadowChart", 220px)
   - Métricas cards: grid auto-fit

3. **SEÇÃO: Backtest Longo (1995–2026)** [COLLAPSIBLE, OPEN] (linha 1002–1022)
   - Classes: `.section.collapsible.open`
   - Métricas globais: Grid auto-fit (CAGR, MD, Sharpe, Total Return)
   - Win Rate cards: 12m rolling, 5y rolling
   - Risk cards: 2-col grid (Factor Drought, Recovery Time)
   - Table: CAGR por Década
   - Chart: Cumulative (log scale, canvas id="backtestR7Chart", 280px)
   - Details (técnico): FF5 Regression table

---

## COMPONENTES GENÉRICOS (Reutilizados)

### Estrutura
- `.container`: max-width 1280px, padding 16px
- `.header`: Gradient bg, meta text
- `.section`: Border 1px, border-radius 10px, padding 16px
- `.collapsible`: h2 click-toggle, collapse-body display none/block

### Grids
- `.hero-strip`: grid-template-columns repeat(4, 1fr) → 3 → 2 → 1
- `.grid-2`: grid 1fr 1fr → 1fr (mobile)
- `.grid-3`: grid 1fr 1fr 1fr → 1fr 1fr → 1fr
- `.kpi-grid`: auto-fit minmax(170px, 1fr)
- `.macro-strip`: auto-fit minmax(130px, 1fr)

### Cards
- `.kpi`: width minmax(170px), border-radius 10px
- `.hero-kpi`: 2rem hval, muted hlbl/hsub
- `.kpi-fire`: border 2px accent, rgba(accent, 0.07)
- `.scenario-card`: 1.6rem valor, .6rem label
- `.dca-card`: border-left 3px accent
- `.swr-pct-card`: border-left 3px (red/yellow/green)

### Progress Bars
- `.progress-bar`: height 8px, .progress-fill % width (transition 0.3s)
- `.progress-target`: small marker (white stick)
- `.progress-row`: flex justify-between, label + bar

### Tabelas
- `table`: font-size .78rem, border-collapse collapse
- `th`: padding 6px 5px, border-bottom 2px
- `td`: padding 5px, border-bottom 1px
- `.num`: text-align right, font-variant-numeric tabular-nums
- `.pos`: color green
- `.neg`: color red

### Charts
- `.chart-box`: position relative, height 240px, overflow hidden
- `.chart-box-sm`: height 180px
- `.chart-box-lg`: height 320px
- Canvas: min-width 0 (critical para grid)

### Colores
- Var(--bg): #0f172a
- Var(--card): #1e293b
- Var(--card2): #334155
- Var(--text): #f1f5f9
- Var(--muted): #94a3b8
- Var(--border): #475569
- Var(--accent): #3b82f6 (blue)
- Var(--green): #22c55e
- Var(--red): #ef4444
- Var(--yellow): #eab308
- Var(--purple): #a855f7
- Var(--cyan): #06b6d4
- Var(--orange): #f97316

---

## DINÂMICA (JavaScript-Generated)

### Elementos com id (preenchidos via JS)

**NOW:**
- Hero: heroPatrimonioBrl, heroPatrimonioUsd, heroAnos, heroProgresso
- KPI: kpiPfire50, kpiDriftMax, kpiOrigemPat, kpiCambio, kpiBtcUsd, kpiIpcaTaxa, kpiRenda2065
- FIRE: fireCountdown, fireProgressBar, fireScenarioGrid, semaforoPanel, semaforoBody
- Macro: (dinâmico)

**PORTFOLIO:**
- stackedAllocBar, stackedAllocLegend, stackedEquityBar
- etfRegionTable, etfVemTable, etfFactorTable
- hodlTableBody
- (+ varios tax, RF, crypto ids)

**PERFORMANCE:**
- premissasVsRealizadoSection (table), patrimônioTable
- deltaChart (canvas), ipcaProgressFill, alphaLiquidoFill
- glideChart (canvas)
- factorRollingChart (canvas dinâmico)
- monthlyHeatmapTable
- factorLoadingsTable

**FIRE:**
- trackingFireChart (canvas)
- scenarioCompareBody (table)
- fireMatrixTable
- dcaCardGrid
- wellnessGrid
- incomePhaseCards

**RETIRO:**
- bondPoolBody (cards)
- bondPoolRunwayChart (canvas, conditional)
- swrPercentilesGrid
- guardrailTableBody
- guardrailBar (visualização)
- lifeProjectionTable
- stressTestCards
- taxLossTable

**SIMULADORES:**
- simFireAno, simFireIdade, simFirePfire, simFireDiff
- simPfire50, simPfire53, simPatFire
- simTimelineBar, simTimelinePin, simTimelineLabelFire
- Sliders: simAporte, simRetorno, simCusto
- wiCustoVal, wiPsucesso, wiGastoSust, wiPatMoneyF, wiRecommendation
- (What-If outputs)
- timingTable
- cascadeForm + cascadeOutput

**BACKTEST:**
- backtestChart (canvas)
- backtestMetricsTable
- cagrPatrimonial, twrPure
- cagrTwrRow (grid)
- backtestPeriodBtns
- shadowChart (canvas)
- shadowTableBody
- shadowMetrics
- backtestR7Chart (canvas)
- r7MetricsGrid, r7WinRateSection, r7RiskGrid
- r7DecadesTable, r7RegressionDetails

---

## VISIBILIDADE & RESPONSIVIDADE

### Breakpoints
- `@media(max-width:1024px)`: hero-strip 3→3 col, cagr-twr 1 col, r7Risk 1 col
- `@media(max-width:900px)`: Grid auto-fit minmax reduzido
- `@media(max-width:768px)`: grid-2/3 → 1 col, hero 2 col, tabelas overflow-x:auto
- `@media(max-width:480px)`: kpi-grid 2 col, font-sizes −20%, charts 200px

### Classes Especiais
- `.tab-hidden`: display none !important (ocultação de abas)
- `.collapsible`: h2 cursor pointer, collapse-body toggle
- `.section-critical`: border 2px accent, rgba(accent, 0.07), aberto por default
- `.private-mode`: Mascara .pv com ::after "••••"

---

## MAPPING PARA REACT v0.1.118

### Correspondências Estruturais

| DashHTML v2.77 | React v0.1.118 | Notas |
|---|---|---|
| `.hero-strip` | `<HeroStrip />` | 4 KPIs primários |
| `.kpi-grid` | `<KPIGrid />` | Auto-fit cards |
| `.section` | `<Section />` | Container genérico |
| `.collapsible` | `<CollapsibleSection />` | Toggle via state |
| `.grid-2 / .grid-3` | `<GridLayout cols={2\|3} />` | Responsivo |
| `<canvas>` (Chart.js) | `<ChartComponent />` | Wrapper Chart.js/Recharts |
| `<table>` | `<DataTable />` | Componente tabela |
| `.progress-bar` | `<ProgressBar />` | Componente reutilizável |
| `.modal / .popup` | Modal/Dialog (if needed) | Sem modals em v2.77 |
| Data-driven (JS) | React state + props | Converte hardcoded para dinâmico |

### Prioridade de Componentes React

**ALTA** (Essencial):
1. TabNavigation (7 abas)
2. HeroStrip (NOW)
3. Section/CollapsibleSection
4. KPIGrid + Card
5. DataTable
6. ChartWrapper (Chart.js integration)
7. ProgressBar

**MÉDIA** (Core):
8. GridLayout (2-col, 3-col, auto-fit)
9. Button (Presets, Periods, Toggle)
10. Slider (Simuladores)
11. Badge/Status indicators

**BAIXA** (Polish):
12. Privacy toggle
13. Custom hooks (useTab, useCollapsible, etc)
14. Error boundaries
15. Loading states

---

## ARQUIVO REFERÊNCIA
Localização: `/Users/diegodemorais/claude/code/wealth/analysis/raw/DashHTML-estavel.html`
MD5: (reference)
Versão: v2.77
Status: Estável em produção
Último update: Abril 2026

