# DEV-dashboard-redesign-echarts: Alinhamento Visual com DashHTML + Migração ECharts

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-dashboard-redesign-echarts |
| **Dono** | Dev |
| **Status** | Pending |
| **Prioridade** | 🔴 Alta |
| **Participantes** | Dev, Head, Quant, Bookkeeper |
| **Co-sponsor** | Head |
| **Bloqueador** | Nenhum |
| **Bloqueado por** | — |
| **Criado em** | 2026-04-15 |
| **Versão Target** | v0.2.0 (ECharts + Design Redesign) |

---

## Motivação / Gatilho

O DashHTML (`/analysis/raw/DashHTML.html`) é **mais rico, maduro e visualmente sofisticado** que a versão Next.js atual. Diferenças críticas:

1. **Design System Coerente**: paleta de cores, spacing, tipografia, componentes reutilizáveis bem definidos
2. **Densidade Informacional**: cada componente é contextualizado com subtítulos, badges, anotações, tooltips
3. **Visualizações Ativas**: Chart.js com múltiplas configurações; Sankey dinâmico; progresso bars com estados
4. **Responsividade Completa**: grid breakpoints precisos (480px, 768px, 900px, 1024px)
5. **Interatividade**: tabs funcionais, collapsibles, período buttons, sliders, forms calculados

**Objetivo desta issue**: trazer o dashboard atual (Next.js) para o nível de maturidade e riqueza visual do DashHTML, com:
- Mesma hierarquia visual e padrões de componentes
- Migração de Chart.js → ECharts (sem Chart.js)
- Dados contextualizados (mesmos campos, cálculos)
- Design idêntico ou melhorado
- Remover componentes DIFERENTES (duros, sem paralelo no DashHTML)

**Por que ECharts?** Melhor integração React, sintaxe declarativa, suporte nativo a temas, renderização SVG otimizada.

---

## Descricao

DashHTML tem **7 abas** com estrutura clara:

1. **HOJE** (hoje) — Hero, KPIs, Semáforos, DCA Status, Aporte
2. **CARTEIRA** (carteira) — Posições ETFs, Cost Basis, Brasileira Concentration, Sankey
3. **PERF** (perf) — Tracking FIRE, Cenários, Alpha, Glide Path, Attribution
4. **FIRE** (fire) — Bond Pool, Projeção Patrimônio, SWR Percentis, FIRE Matrix, Guardrails
5. **RETIRO** (retiro) — Renda na Aposentadoria, Income Phases, Spending Guardrails
6. **SIMULADORES** (simuladores) — FIRE Simulator, What-if, P(FIRE) Scenarios
7. **BACKTEST** (backtest) — Regime 7, Drawdowns, Recovery, Fee Impact

**Cada aba deve ser auditada em 3 dimensões:**
- **Design** (layout, cores, tipografia, spacing, responsividade)
- **Funcionalidade** (interatividade, estado, eventos, navegação)
- **Dados** (campos, cálculos, completude vs DashHTML)

---

## Escopo: Abas (7 tarefas)

### ABA 1: HOJE (Hero + Status)

#### Design Audit
- [ ] **[Dev]** Validar hero strip (4 KPI cards: patrimônio, FIRE%, SWR, P(FIRE))
- [ ] **[Dev]** Auditar Time to FIRE progress bar (gradient, labels, % renderizado)
- [ ] **[Dev]** Auditar Semáforos table (badges, triggers, cores)
- [ ] **[Dev]** Auditar FIRE Progress card (grandes números 2.2rem, wellness bar)
- [ ] **[Dev]** Auditar DCA Status cards (3 cards: próx prioridade, gap %, active/paused state)
- [ ] **[Dev]** Auditar Aporte do Mês (form input, cálculo, resultado destacado)
- [ ] **[Dev]** Auditar P(FIRE) display (3 badges, tornado chart, cores por tier)
- [ ] **[Dev]** Auditar Wellness Actions (big number, wellness fill, action border-left)

#### Funcionalidade
- [ ] **[Bookkeeper]** Validar DCA next priority (IPCA+/Renda+/Equity) lógica
- [ ] **[Bookkeeper]** Validar gap em pp (diferença vs alvo)
- [ ] **[Quant]** Validar P(FIRE) base/favorável/stress badging
- [ ] **[Dev]** Implementar form calc (aporte input → resultado real-time)

#### Dados
- [ ] **[Bookkeeper]** Validar campos: patrimônio atual, tempo FIRE (dias/meses/anos), P(FIRE), SWR 
- [ ] **[Bookkeeper]** Validar cálculos: wellness score (0-100), driftMaxPp, DCA cascade status

#### Resultado
- [ ] Design 100% visual match com DashHTML
- [ ] Todos charts com ECharts (zero Chart.js)
- [ ] Form aporte funcional

---

### ABA 2: CARTEIRA (Posições + Concentração)

#### Design Audit
- [ ] **[Dev]** Validar Posições table (7+ colunas: ticker, cotas, preço, valor, peso, LTG%)
- [ ] **[Dev]** Auditar Brasil Concentration card (HODL11, RF, IPCA+, total BRL, nota risco)
- [ ] **[Dev]** Auditar Sankey fluxo anual (cores por asset class, labels, layout)
- [ ] **[Dev]** Auditar Exposição Geográfica chart (pie/donut, legend, tooltips)
- [ ] **[Dev]** Auditar Stacked Allocation bar (horizontal 32px, cores asset class, legend)
- [ ] **[Dev]** Auditar ETF Region Composition tables (color-coded por região, right-aligned %)
- [ ] **[Dev]** Auditar Factor Loadings table (color-coded cols, t-stats onde disponível)
- [ ] **[Dev]** Auditar Cost Basis table (rows por período, cols custo/atual/ganho)

#### Funcionalidade
- [ ] **[Dev]** Posições table responsivo (overflow-x em mobile, zebra striping)
- [ ] **[Dev]** Sankey interativo (hover tooltips, cores dinâmicas)
- [ ] **[Dev]** Pie chart interativo com legend (zoom on legend item)

#### Dados
- [ ] **[Bookkeeper]** Validar posições: SWRD/AVGS/AVEM cotas, preços USD, valores BRL, pesos
- [ ] **[Bookkeeper]** Validar cost basis: custo per share, custo total acumulado, unrealized gains
- [ ] **[Quant]** Validar geografias (USA, Europa, Japão, Out.DM, EM) % por ETF
- [ ] **[Quant]** Validar loadings: Market, Value, Size, Quality, Momentum por ETF

#### Resultado
- [ ] Posições atualizadas com dados IBKR reais
- [ ] Sankey ECharts (zero Chart.js)
- [ ] Tabelas com densidade de DashHTML

---

### ABA 3: PERF (Performance & Attribution)

#### Design Audit
- [ ] **[Dev]** Validar Tracking FIRE chart (2-col: chart line + tabela lado a lado)
- [ ] **[Dev]** Auditar Cenário Compare table (2+ cols, highlight diferenças)
- [ ] **[Dev]** Auditar Alpha vs SWRD chart (line overlay, tooltip valores, fonte legível)
- [ ] **[Dev]** Auditar IPCA+ Taxa Progress (progress bar com alvo visual, nota de status)
- [ ] **[Dev]** Auditar Glide Path chart (linha idade vs alocação, fill sob curva, gatilhos)
- [ ] **[Dev]** Auditar Attribution Breakdown (stacked bar chart, tooltip, período selector)
- [ ] **[Dev]** Auditar Monthly Returns card (período buttons: 1m, 3m, YTD, 1a, 3a, 5a, all)

#### Funcionalidade
- [ ] **[Dev]** Período buttons funcionais (Tracking, Attribution, Returns)
- [ ] **[Dev]** Charts ECharts com hover tooltips detalhados
- [ ] **[Dev]** Responsividade: charts 2-col → 1-col em tablet

#### Dados
- [ ] **[Quant]** Validar cálculo alpha: haircut 58%, períodos (1a, 3a, 5a, 10a)
- [ ] **[Bookkeeper]** Validar patrimônio atual vs MC P50 (diff %)
- [ ] **[Quant]** Validar glide path: curva equity 79% → X% aos 50
- [ ] **[Quant]** Validar attribution decomposição: % equity, % RF, % FX, % TLH

#### Resultado
- [ ] Charts ECharts (zero Chart.js)
- [ ] Período selector funcional em 3+ componentes
- [ ] Densidade de tabelas ≥ DashHTML

---

### ABA 4: FIRE (Bond Pool + Projeção)

#### Design Audit
- [ ] **[Dev]** Validar Bond Pool card (composição tabela, progress bar 0.8/7 anos)
- [ ] **[Dev]** Validar Bond Maturity Ladder (6 buckets: 0-1y, 1-2y, 2-3y, 3-5y, 5-10y, 10+y)
- [ ] **[Dev]** Auditar Patrimônio P10/P50/P90 chart (3 traços, fill between, baseline)
- [ ] **[Dev]** Auditar SWR Percentis (3 cards grandes: P10, P50, P90, cores por tier)
- [ ] **[Dev]** Auditar FIRE Matrix table (6-8 linhas patrimônio, 7 colunas spending, bg-color)
- [ ] **[Dev]** Auditar Guardrails table (4-5 linhas, cores por zona: verde/amarelo/vermelho)
- [ ] **[Dev]** Auditar Drawdown History chart (line drawdown %, max/atual/recovery status)
- [ ] **[Dev]** Auditar Rolling Metrics chart (Sharpe/Sortino/Volatilidade toggle, dual-line support)

#### Funcionalidade
- [ ] **[Dev]** Bond pool progress bar estático ou dinâmico (config)?
- [ ] **[Dev]** FIRE Matrix: hover tooltip com detalhes, celula highlight
- [ ] **[Dev]** Drawdown/Rolling charts: period range selector (60-120 data points)

#### Dados
- [ ] **[Bookkeeper]** Validar bond pool: acúmulo IPCA+ longo/curto, Renda+ (inclusão/exclusão)
- [ ] **[Quant]** Validar P10/P50/P90 até FIRE date (Monte Carlo)
- [ ] **[Quant]** Validar matriz: patrimônio linhas vs spending colunas, P(FIRE) células
- [ ] **[Quant]** Validar guardrails: upper limit, nominal floor, inflação rules

#### Resultado
- [ ] Bond pool card + Ladder componentes integrados
- [ ] Patrimônio/SWR/FIRE Matrix com ECharts
- [ ] Guardrails table com color zones
- [ ] Drawdown/Rolling charts com período selector

---

### ABA 5: RETIRO (Income Phases + Guardrails)

#### Design Audit
- [ ] **[Dev]** Validar Renda na Aposentadoria phases (3 cards gradient bg: eq drawdown, INSS entry, inflação)
- [ ] **[Dev]** Auditar Income Phase cards (timeline visual, valores destacados)
- [ ] **[Dev]** Auditar Spending Guardrails bar (3-color zones, markers, labels)
- [ ] **[Dev]** Auditar Spending Breakdown cards (essencial, conforto, buffer % + valores)
- [ ] **[Dev]** Auditar Rebalancing Status card (status badge, drift bars, rebalance urgency)

#### Funcionalidade
- [ ] **[Dev]** Spending guardrails bar: dinâmico vs estático?
- [ ] **[Dev]** Spending breakdown expandable (detalhes table mensais/anuais)
- [ ] **[Dev]** Rebalancing drift bars: center-aligned com tolerance zone

#### Dados
- [ ] **[Quant]** Validar 3 fases: timing (50-55, 65), renda por fase
- [ ] **[Bookkeeper]** Validar spending: must-have, like-to-have, imprevistos (baseline + range)
- [ ] **[Bookkeeper]** Validar drift: current vs target para 5 ativos (SWRD, AVGS, AVEM, IPCA+, HODL11)

#### Resultado
- [ ] Income phases com design semelhante ao DashHTML
- [ ] Guardrails bar ECharts ou CSS nativo
- [ ] Spending/Rebalancing componentes ricos (inline tables, bars, badges)

---

### ABA 6: SIMULADORES (What-if + Scenarios)

#### Design Audit
- [ ] **[Dev]** Validar FIRE Simulator sliders (patrimônio, spending, return, inflation, anos)
- [ ] **[Dev]** Auditar What-if Result card (P(FIRE) resultado grande font 2rem, compare base)
- [ ] **[Dev]** Auditar P(FIRE) Scenarios grid (3-4 cards: Atual/Solteiro/Casado/+Filho)
- [ ] **[Dev]** Auditar Scenario card chosen state (border accent, % em grande font)
- [ ] **[Dev]** Auditar Preset buttons (Pessimista, Base, Otimista, disabled state)

#### Funcionalidade
- [ ] **[Dev]** Sliders responsivos e fluídos (real-time calc)
- [ ] **[Dev]** Preset buttons: on click → ajusta todos sliders
- [ ] **[Dev]** Scenario cards: click → carrega spending, calcula P(FIRE)
- [ ] **[Dev]** Result display: P(FIRE) vs base, delta % destacado

#### Dados
- [ ] **[Quant]** Validar slider ranges: patrimônio (min/max), spending, return, inflation
- [ ] **[Quant]** Validar cenários: 3-4 spending profiles com P(FIRE) base
- [ ] **[Quant]** Validar presets: pessimista (MC P10), base (P50), otimista (P90)

#### Resultado
- [ ] Sliders + calculator funcional e fluído
- [ ] Scenario cards com visual match ao DashHTML
- [ ] Result update real-time

---

### ABA 7: BACKTEST (Regime 7 + Historical Analysis)

#### Design Audit
- [ ] **[Dev]** Validar Regime 7 Metrics cards (CAGR, Sharpe, Max DD, Recovery Time)
- [ ] **[Dev]** Auditar Drawdown Crises table (data, profundidade, duração recovery, impact)
- [ ] **[Dev]** Auditar Backtest Chart (price evolution, drawdown zones highlighted, legend)
- [ ] **[Dev]** Auditar Decade Breakdown table (1980s, 1990s, 2000s, 2010s, 2020s — CAGR, Sharpe, DD)
- [ ] **[Dev]** Auditar Fee Impact analysis (fee vs sem fee, delta BRL acumulado)
- [ ] **[Dev]** Auditar Period buttons (All, 1a, 3a, 5a, 10a, 20a) selector

#### Funcionalidade
- [ ] **[Dev]** Period buttons funcionais: rerender chart + tabelas com subset
- [ ] **[Dev]** Backtest chart ECharts (zoom interativo, legend toggle)
- [ ] **[Dev]** Tables zebra striped, responsive overflow

#### Dados
- [ ] **[Quant]** Validar Regime 7 (1989-2026) CAGR, Sharpe, max drawdown, recovery times
- [ ] **[Quant]** Validar drawdown crises: lista 5+ maiores, profundidade %, duração
- [ ] **[Quant]** Validar década breakdown: agregações CAGR por 10 anos
- [ ] **[Bookkeeper]** Validar fee impact: acúmulo com/sem fee, diferença líquida

#### Resultado
- [ ] Backtest chart ECharts com período selector
- [ ] Crises table com destaque para piores drawdowns
- [ ] Decades aggregation clara e densamente informada
- [ ] Fee impact visual comparativo

---

## Protocolo de Validação Geral

Para cada aba:

1. **Abrir DashHTML** em `/analysis/raw/DashHTML.html` (Firefox ou Chrome)
2. **Navegar para aba correspondente** (botões tabs no topo)
3. **Capturar visual (screenshot)**: layout, cores, tipografia, espacamento
4. **Listar componentes visíveis**: cards, tabelas, charts, forms, badges
5. **Mapear dados**: quais campos, cálculos, ranges
6. **Comparar com implementação Next.js atual**:
   - Layout: match visual ✓ / diferente ✗ / melhor ✓ / requer ajuste ?
   - Cores: usar CSS vars do DashHTML (`--accent`, `--green`, etc)
   - Tipografia: font-size, weight, line-height (copiar do DashHTML CSS)
   - Espacamento: padding, margin, gaps (grid spacing 10-14px, gaps 8-14px)
   - Responsividade: testar breakpoints (480px, 768px, 900px, 1024px)
7. **Implementar alinhamento**:
   - Use ECharts para charts (abandon Chart.js)
   - Replique CSS patterns (badges, cards, bars, tables)
   - Mantenha dados contextualizados (subtítulos, tooltips, anotações)
8. **QA**: verificar que componentes diferentes foram **removidos** (não devem aparecer no novo dashboard)

---

## Critério de Aceitação

- ✅ Todas 7 abas visuais com match ≥95% ao DashHTML
- ✅ Zero imports de Chart.js; 100% ECharts para gráficos
- ✅ Responsive design: testado em 480px, 768px, 900px, 1024px, 1280px
- ✅ Componentes diferentes (sem paralelo DashHTML) **removidos**
- ✅ Dados contextualizados: subtítulos, badges, tooltips, anotações
- ✅ Test suite passando (57X testes, alvo ≥95%)
- ✅ Build válido: `npm run build` sem erros
- ✅ Dashboard v0.2.0 com versão bump

---

## Próximas Etapas (Sequência)

1. **Dev estuda DashHTML** (1h) — screenshots, lista componentes por aba, mapa CSS
2. **Quant audita dados** (2h) — valida fields, ranges, fórmulas vs DashHTML
3. **Bookkeeper audita cálculos** (1.5h) — verificação acurácia contra dados.json
4. **Dev implementa design** (16h) — 2.2h por aba em média
5. **Dev migra charts Chart.js → ECharts** (4h) — 4 charts × 1h cada
6. **QA + validação visual** (2h) — compara antes/depois, screenshots
7. **Merge + push + v0.2.0** (30min)

**Duração estimada**: 27h de work (4-5 dias de concentração)

---

## Referências

- **DashHTML**: `/analysis/raw/DashHTML.html`
- **CSS vars DashHTML**: linhas 9-10 (`:root { --bg, --card, --text, --muted, --border, --accent, --green, --red, --yellow, --purple, --cyan, --orange }`)
- **Chart.js patterns**: linhas 33-60 (`.chart-box`, `.chart-box-sm`, `.chart-box-lg`, style height: 240-320px)
- **Responsive**: `@media` (max-width: 480px, 768px, 900px, 1024px) — linhas 93-138
- **Dashboard atual**: `/react-app/src/app/page.tsx`
- **ECharts docs**: https://echarts.apache.org/en/option.html

---

## Notas Internas

- **Diego preferência**: Design MUITO similar ao DashHTML, mas Next.js. Não inovar em visual; madurez > novidade.
- **Remover**: componentes visualmente diferentos ou sem paralelo. Manter: tudo que está no DashHTML.
- **ECharts**: preferência por SVG (renderização limpa), themes (reutilizar paleta), responsive (layout dinâmico).
- **Privacy mode**: manter suporte (`.private-mode .pv` CSS transform).
