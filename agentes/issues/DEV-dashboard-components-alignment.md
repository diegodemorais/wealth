# DEV-dashboard-components-alignment: Alinhamento Visual e Informacional com DashHTML — Fase 0-4

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-dashboard-components-alignment |
| **Dono** | Dev |
| **Status** | Done |
| **Prioridade** | 🔴 Alta |
| **Participantes** | Dev, Head, Quant, Bookkeeper |
| **Co-sponsor** | Head |
| **Dependencias** | DEV-manifest (spec.json vinculante) |
| **Criado em** | 2026-04-15 |
| **Origem** | Diego — requisição direta de melhorias visuais e informacionais |
| **Concluido em** | 2026-04-15 |

---

## Motivo / Gatilho

O DashHTML (dashboard antigo em análise/raw/) era **visualmente mais rico, informacional e bem estruturado** do que a versão atual. Diego observou:

1. **Componentes mais detalhados** — cada bloco tinha dados contextualizados (subtítulos, anotações, tooltips)
2. **Formatação mais sofisticada** — cores, badges, barras empilhadas, progress bars com múltiplos estados
3. **Informação densa mas clara** — tabelas com mais colunas, grids bem organizados, hierarquia visual forte
4. **Design system coerente** — paleta de cores usada consistentemente, espacamento equilibrado, tipografia bem calibrada

**Objetivo desta issue:** trazer o dashboard atual para o nível de riqueza visual, informacional e usabilidade do DashHTML, garantindo que cada componente:
- Tenha os mesmos dados e contexto
- Use a mesma formatação e design patterns
- Seja funcionalmente idêntico ou melhorado

---

## Descricao

O DashHTML contém ~32 componentes principais estruturados em blocos temáticos:
- **Seção Hero & Status** (Time to FIRE, Progress, Wellness, DCA)
- **Seção Macro & Diversificação** (Sankey, geografias, exposição Brasil)
- **Seção Performance & Alocação** (Charts, tabelas, análise fatorial)
- **Seção FIRE Avançada** (FIRE Matrix, Guardrails, Scenarios)
- **Seção Portfólio & Execução** (Posições, custos, aporte, eventos)

Cada componente deve ser auditado em 3 dimensões:
1. **Dados**: campos necessários, cálculos, valores esperados (Quant + Bookkeeper)
2. **Design**: formatação, cores, tipografia, espaçamento, responsividade (Dev + Head)
3. **Completude**: alinhamento com DashHTML (funcional 100% vs 80% vs parcial)

---

## Escopo

### Seção 1: Hero Strip & Status (Blocos 1-8)

#### 1.1 Hero KPI — 4 cards principais
- [ ] **[Quant]** Validar campos: patrimônio total, tempo para FIRE, P(FIRE) base, SWR percentis
- [ ] **[Dev]** Design: hero card sizing (2rem font), border accent, padding, grid responsivo

#### 1.2 Time to FIRE Progress Bar
- [ ] **[Bookkeeper]** Validar cálculo: dias/meses/anos até FIRE date (50 anos = X dias)
- [ ] **[Dev]** Design: progress bar gradient (accent → purple), labels, percentual renderizado

#### 1.3 Semáforos de Gatilhos (Alertas)
- [ ] **[Quant]** Listar 4+ gatilhos críticos com status (verde/amarelo/vermelho)
- [ ] **[Dev]** Design: semáforo table com badges coloridas, collapsible trigger list

#### 1.4 FIRE Progress & Wellness Score
- [ ] **[Bookkeeper]** Validar cálculos: patrimônio acumulado %, wellness score (0-100)
- [ ] **[Dev]** Design: large value display (2.2rem), progress bars com cor dinâmica

#### 1.5 DCA Status Cards
- [ ] **[Bookkeeper]** Validar próxima prioridade DCA (IPCA+/Renda+/Equity), gap em pontos percentuais
- [ ] **[Dev]** Design: 3-4 cards em grid, border-left color por tipo, row flex layout

#### 1.6 Aporte do Mês
- [ ] **[Bookkeeper]** Validar último aporte, data, valores acumulados (mês/YTD)
- [ ] **[Dev]** Design: card com input calc form, botão submitir, resultado destacado

#### 1.7 P(FIRE) Monte Carlo + Tornado
- [ ] **[Quant]** Validar P(FIRE) base/favorável/stress, badges percentuais com cores
- [ ] **[Dev]** Design: 3 badges inline, progress bar P(FIRE) base, chart tornado interativo

#### 1.8 Financial Wellness & Top Ações
- [ ] **[Quant]** Validar wellness score formula, ranking de 5+ ações prioritárias
- [ ] **[Dev]** Design: big number (2.2rem), wellness fill bar, actions box com border-left accent

---

### Seção 2: Macro & Diversificação (Blocos 9-14)

#### 2.1 Brasil Concentration Card
- [ ] **[Bookkeeper]** Validar exposição Brasil: HODL11, RF, IPCA+ ladder, crypto, total BRL
- [ ] **[Dev]** Design: card em 2-3 colunas, hierarchical list com indent, nota de risco

#### 2.2 Sankey — Fluxo de Caixa Anual
- [ ] **[Bookkeeper]** Dados de entrada: aporte → destinos (IPCA+/Equity/Renda+)
- [ ] **[Dev]** Design: Sankey chart renderizado corretamente, cores por asset class, labels

#### 2.3 Exposição Geográfica — Pie/Donut Chart
- [ ] **[Quant]** Validar composição (USA, Europa, Japão, Out.DM, EM) de ETF holdings
- [ ] **[Dev]** Design: pie chart com legend, cores scheme coerente, tooltip hover

#### 2.4 Stacked Allocation Bar
- [ ] **[Bookkeeper]** Validar alócação total: Equity 79%, IPCA+ longo, IPCA+ curto, Renda+, Crypto
- [ ] **[Dev]** Design: horizontal stacked bar (32px height), cores asset class, legend abaixo

#### 2.5 ETF Region Composition Tables (SWRD, AVGS, AVEM)
- [ ] **[Quant]** Validar geografias por ETF: % USA, Europa, Japão, Out.DM, EM
- [ ] **[Dev]** Design: 3 tabelas (ou 1 com abas), color-coded por região, right-aligned %

#### 2.6 ETF Factor Loadings Table
- [ ] **[Quant]** Validar exposição fatorial: Market, Value, Size, Quality, Momentum por ETF
- [ ] **[Dev]** Design: factor-table style, color-coded cols, t-stats onde disponível

---

### Seção 3: Performance & Attribution (Blocos 15-20)

#### 3.1 Tracking FIRE — Realizado vs Projeção
- [ ] **[Bookkeeper]** Validar patrimônio atual vs MC P50 projetado, diff em %
- [ ] **[Dev]** Design: 2-col grid, chart line + data table lado a lado

#### 3.2 Cenário Compare — Base vs Aspiracional
- [ ] **[Quant]** Validar cenários: patrimônio 50a, P(FIRE), SWR, diferenças
- [ ] **[Dev]** Design: compare table com 2+ colunas, highlight diferenças

#### 3.3 Alpha vs SWRD — Performance Relativa
- [ ] **[Quant]** Validar alpha líquido (haircut 58%), períodos (1a, 3a, 5a, 10a)
- [ ] **[Dev]** Design: chart line overlay Target vs SWRD, tooltip valores, fonte legível

#### 3.4 IPCA+ Taxa & Progress
- [ ] **[Bookkeeper]** Validar taxa IPCA+ 2040 atual, piso 6%, progresso em %
- [ ] **[Dev]** Design: progress bar com alvo visual, nota de janela ativa/pausada

#### 3.5 Glide Path — Alocação por Idade
- [ ] **[Quant]** Validar curva equity: 79% hoje → X% aos 50 (ou manter flat)
- [ ] **[Dev]** Design: line chart idade vs alocação, preenchimento sob curva, gatilhos marcados

#### 3.6 Attribution — Retorno por Componente
- [ ] **[Quant]** Validar decomposição: % equity, % RF, % FX (câmbio), % TLH/tax benefits
- [ ] **[Dev]** Design: stacked bar chart, tooltip breakdown, período selecionável

---

### Seção 4: FIRE Avançada (Blocos 21-25)

#### 4.1 Bond Pool Readiness — Proteção SoRR
- [ ] **[Bookkeeper]** Validar acúmulo pool: IPCA+ longo/curto, Renda+ (contagem/exclusão)
- [ ] **[Dev]** Design: bond-pool-card com composição tabela, progress bar 0.8/7 anos, estratégias A/B

#### 4.2 Bond Pool Runway Chart
- [ ] **[Quant]** Validar desenho: consumo anual bond pool, suficiência durante SoRR (5a)
- [ ] **[Dev]** Design: stacked area chart, consumo vs replenishment, nota de suficiência

#### 4.3 Projeção Patrimônio — P10/P50/P90 (Chart)
- [ ] **[Quant]** Validar 3 traços: 10º, 50º, 90º percentil até FIRE date
- [ ] **[Dev]** Design: line chart múltiplas séries, fill between P10-P90, baseline atual

#### 4.4 SWR no FIRE Day — Percentis
- [ ] **[Quant]** Validar SWR esperado: P10 (conservador), P50 (base), P90 (otimista)
- [ ] **[Dev]** Design: 3 cards grandes, valores destacados, cores por tier (vermelho/amarelo/verde)

#### 4.5 FIRE Matrix — Tabela P(FIRE) × Patrimônio × Spending
- [ ] **[Quant]** Validar matriz: 6-8 linhas (patrimônio), 7 colunas (spending R$180k-R$350k)
- [ ] **[Dev]** Design: fire-matrix-table com bg-color por percentil, hover tooltip, celula highlight

---

### Seção 5: Guardrails & Withdrawal (Blocos 26-28)

#### 5.1 Guardrails de Retirada — FIRE Day
- [ ] **[Quant]** Validar guardrails: upper limit, nominal floor, inflation adjustment rules
- [ ] **[Dev]** Design: guardrail-table com 4-5 linhas, bg-color por zona (verde/amarelo/vermelho)

#### 5.2 Spending Guardrails — P(FIRE) × Custo de Vida
- [ ] **[Quant]** Validar 3 faixas: R$180k/R$250k/R$350k spending, P(FIRE) por faixa
- [ ] **[Dev]** Design: guardrail-bar com 3-color zones, markers spending atual + alvo, labels

#### 5.3 Renda na Aposentadoria — Fases Temporais
- [ ] **[Quant]** Validar 3 fases: equity drawdown (50-55), INSS entry (65), inflação fase 3
- [ ] **[Dev]** Design: income-phase cards com bg gradient, timeline visual, valores destacados

---

### Seção 6: Portfolio & Execution (Blocos 29-32)

#### 6.1 Posições — ETFs Internacionais (IBKR)
- [ ] **[Bookkeeper]** Validar: SWRD cotas, AVGS cotas, AVEM cotas, valores USD e BRL
- [ ] **[Dev]** Design: positions table (7+ cols: ticker, cotas, preço, valor, peso, LTG%)

#### 6.2 Base de Custo e Alocação — Equity por Bucket
- [ ] **[Bookkeeper]** Validar: cost basis por bucket (inicial, DCA 2022+, TLH), unrealized gains
- [ ] **[Dev]** Design: custoBaseTable com rows por período, cols custo/atual/ganho, % total

#### 6.3 Eventos de Vida — Impacto no Plano FIRE
- [ ] **[Quant]** Validar: eventos (casamento, filhos, etc) com P(FIRE) impact delta
- [ ] **[Dev]** Design: evento-row flex layout, badge number, descrição, impacto %, toggle

#### 6.4 P(FIRE) Cenários Família — Atual/Casado/+Filho
- [ ] **[Quant]** Validar: 3-4 cenários com spending diferente, P(FIRE) por cenário
- [ ] **[Dev]** Design: scenario-card grid, chosen state com border accent, % em grande font

#### 6.5 Premissas vs Realizado — 5 Anos (2021-2026)
- [ ] **[Quant]** Validar: TWR equity, aporte média, inflação realizada, retorno RF
- [ ] **[Dev]** Design: KPI cards em grid, delta com cor (verde/amarelo/vermelho), source data

#### 6.6 Backtest & Regime Analysis (Opcional)
- [ ] **[Quant]** Validar: Regime 7 (1989-2026) CAGR, drawdowns, recovery times
- [ ] **[Dev]** Design: backtestChart com period buttons, metrics inline, nota de regime

---

## Protocolo de Validação

Para cada componente, dev + owner devem:

1. **Abrir o DashHTML.html** em `/Users/diegodemorais/claude/code/wealth/analysis/raw/`
2. **Localizar o bloco correspondente** (grep por ID ou h2 title)
3. **Capturar formatação**:
   - CSS classes usadas (grid, card, bar, table, badge, etc)
   - Cores específicas (RGB ou CSS vars)
   - Tamanhos fonts, padding, gaps
   - Animações/transitions
4. **Aplicar ao novo dashboard**:
   - Usar o mesmo visual pattern em CSS
   - Renderizar com dados atualizados
   - Testar responsividade
5. **Screenshot comparativo** (antes/depois)

---

## Resultado Esperado

Ao final desta issue:
- ✅ Cada componente foi auditado em dados/design
- ✅ Código CSS alinhado com DashHTML patterns
- ✅ Formatação idêntica ou melhorada
- ✅ Dados completos e contextualizados
- ✅ Dashboard v0.1.44+ com 32+ componentes rich
- ✅ Test suite passando 100% (634+ testes)

---

## Próximas Etapas

Após aprovação de cada subtask:
- Quant/Bookkeeper submetem dados validados
- Dev implementa design+layout
- Head revisa qualidade e aprovação
- Componente merged em branch `feature/dashboard-components`

Merge final ao `main` após todas as 32 tarefas ✓.
