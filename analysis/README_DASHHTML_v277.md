# DashHTML v2.77 - REFERÊNCIA ESTÁVEL COMPLETA

## 📋 VISÃO GERAL

Esta é a **análise completa e exaustiva** da versão estável v2.77 do DashHTML (Dashboard Wealth DM), o painel de monitoramento de patrimônio financeiro e planejamento FIRE.

**Objetivo**: Servir como baseline técnico para comparação com React v0.1.118 e guiar migração/replicação funcional.

---

## 📁 ARQUIVOS GERADOS

Todos os arquivos foram salvos em `/Users/diegodemorais/claude/code/wealth/analysis/`:

### 1. **DASHHTML_v277_COMPLETE_MAPPING.txt** (26 KB)
   - Mapeamento ultra-detalhado de todas as 7 abas
   - Para cada aba: listagem completa de seções, componentes, gráficos, tabelas
   - Estrutura HTML interna: classes, IDs, atributos
   - Responsividade: media queries, breakpoints, comportamento mobile
   - Features especiais: privacy mode, colapsáveis, timestamps
   - Sumário final com estatísticas

### 2. **DASHHTML_v277_VISUAL_SUMMARY.txt** (37 KB)
   - Representação visual ASCII de cada aba
   - Mockups de layout com componentes posicionados
   - Facilita compreensão visual rápida
   - Útil para apresentações e documentação

### 3. **DASHHTML_v277_COMPONENT_INDEX.md** (25 KB)
   - Índice estruturado Markdown de componentes por aba
   - Linhas de código referenciadas
   - Mapeamento direto para React (correspondências)
   - Tabela de prioridades para implementação
   - Lista de IDs dinâmicos (gerados via JS)

### 4. **README_DASHHTML_v277.md** (este arquivo)
   - Guia de uso
   - Resumo executivo
   - Links de referência

---

## 🎯 ESTRUTURA EM ALTO NÍVEL

### 7 ABAS PRINCIPAIS

```
📡 NOW (hoje)              - Visão geral instantânea + KPIs primários
🎯 PORTFOLIO (carteira)    - Alocação, composição, holdings
📈 PERFORMANCE (perf)      - Evolução histórica, atribuição, fatores
🔥 FIRE (fire)            - Projeções probabilísticas, cenários
🏖️ RETIRADA (retiro)      - Withdrawal planning, guardrails, SoRR
🧪 SIMULADORES (simuladores) - Ferramentas interativas (What-If, Calculadora)
📊 BACKTEST (backtest)     - Análise histórica 30+ anos, benchmarks
```

### COMPONENTES PRINCIPAIS POR ABA

| ABA | Hero/KPI | Charts | Tables | Interativo |
|-----|----------|--------|--------|-----------|
| NOW | 4x hero + 3x KPI grids | 5+ (Tornado, Sankey) | Semáforos | — |
| Portfolio | — | 2+ (Donut, Stacked) | 4+ (Holdings, Tax, RF) | — |
| Performance | — | 6+ (Delta, FF5, Factor Rolling) | 3+ (Premissas, Evol, Heatmap) | — |
| FIRE | — | 3+ (Tracking, Projection, FIRE Matrix) | 2+ (Cenários, DCA) | — |
| Retiro | — | 2+ (Bond Pool Runway, Guardrails) | 4+ (SWR, Guardrails, Spending, TLH) | — |
| Simuladores | — | — | — | 4 (Sliders, Presets, What-If) |
| Backtest | — | 4+ (Backtest, Shadows, R7) | 4+ (Metrics, Decades, FF5) | 7 period buttons, 6 shadow periods |

---

## 📊 ESTATÍSTICAS DO ARQUIVO

```
Arquivo:        DashHTML-estavel.html
Versão:         v2.77
Caminho:        /Users/diegodemorais/claude/code/wealth/analysis/raw/
Linhas:         14.862
Tamanho:        ~500 KB (minified)
Tipo:           HTML5 + CSS3 + Vanilla JS (Chart.js + plugins)

Estrutura:
├─ HTML: 11.000 linhas (body sections, grids, tables)
├─ CSS:  3.500 linhas (inline <style>, responsive design)
└─ JS:   500 linhas (tab switching, toggle logic)

Data Estruturação: Abril 2026
Status:         Produção estável
Responsável:    Diego de Moraes (DM)
```

---

## 🏗️ LAYOUT E DESIGN

### Layout Global
- **Tipo**: Full-width com navegação sticky top
- **Grids**: Flexíveis (auto-fit minmax) com fallbacks responsivos
- **Colapsáveis**: ~35 seções (críticas abertas, outras fechadas)
- **Responsividade**: Media queries para 4 breakpoints (1024px, 900px, 768px, 480px)

### Paleta de Cores
```
Primário:   #3b82f6 (blue accent, FIRE goals)
Sucesso:    #22c55e (green, on-track)
Caution:    #eab308 (yellow, warning)
Risco:      #ef4444 (red, alarm)
Fundo:      #0f172a (dark blue-black)
Card:       #1e293b (dark blue)
Texto:      #f1f5f9 (light blue-white)
Muted:      #94a3b8 (gray-blue)
```

### Tipografia
- Font family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Escalas: Headers .8rem (UPPERCASE), KPI values 1.5–3rem, Body .75–.78rem
- Monospace para valores numéricos: 'SF Mono', tabular-nums

---

## 🔧 TECNOLOGIAS UTILIZADAS

### Frontend
- **HTML5**: Semântica estruturada, data attributes, inline SVG
- **CSS3**: Variables (--bg, --accent), Grid, Flexbox, Media Queries, Animations
- **JavaScript**: Vanilla (não framework), event listeners, DOM manipulation

### Bibliotecas Externas
- **Chart.js v4.4.7**: Gráficos de linha, barras, área, donut
- **chartjs-chart-sankey v0.14.0**: Gráficos Sankey para fluxos
- **Eruda** (opcional): Debug console móvel

### Padrões de Dados
- **Dinâmicos**: IDs prefixados (#fireCountdown, #hodlTableBody, etc)
- **Privacidade**: Classes .pv com máscaras CSS (data-pv-mask)
- **Tabs**: Atributo data-in-tab para ocultação/visibilidade

---

## 📈 COMPONENTES REUTILIZÁVEIS

### Estrutura CSS
```css
.hero-strip      → 4-col grid responsivo (KPIs grandes)
.grid-2/3        → 2/3-col grid com fallbacks mobile
.section         → Container padrão com border + padding
.collapsible     → Section com toggle (h2 click)
.chart-box       → Container canvas responsivo
.kpi             → Card 140–170px minmax
.progress-bar    → Barra animada com marcadores
.badge           → Label/status pill
.table / .num    → Tabela com números alinhados à direita
```

### Componentes Específicos
```
Hero Strip:      Kpis primários em 4-col
Time to FIRE:    Big number + progress bar logarítmica
P(FIRE) Matrix:  Tabela 2D SWR × Patrimônio (color-coded)
Bond Pool:       Status cards + progress bar
FIRE Simulator:  Sliders + presets + big number output
Backtest:        Period buttons + chart + metrics table
```

---

## 🎨 PADRÕES DE DESIGN

### Visibilidade
- **Sticky Navigation**: z-index 100, background opaco, border-bottom
- **Colapsáveis**: Toggle via h2 cursor:pointer, ícone ▸/▾
- **Privacy Mode**: Mascara .pv com ::after "••••"
- **Responsividade**: Cascata de grids (4→3→2→1 col)

### Interatividade
- **Period Buttons**: `.period-btns` para seleção de timeframes
- **Presets**: Buttons com states (.active)
- **Sliders**: HTML input[type=range], dinâmicos
- **Color Coding**: Verde/Amarelo/Vermelho por status

### Performance
- `min-width: 0` em grids (previne overflow)
- `position: relative` em chart-box (controle overflow)
- Canvas com `min-width: 0` (crítco para responsividade)
- Transições suaves (0.15s–0.5s)

---

## 🔌 INTEGRAÇÃO COM DADOS

### Padrão de Preenchimento
1. **HTML estruturado**: elementos vazios com IDs únicos
2. **JavaScript**: document.getElementById('id').innerHTML = data
3. **Charts**: Chart.js instâncias com dados dinâmicos
4. **Tabelas**: Construção string HTML ou templates

### Exemplos de IDs Dinâmicos
```javascript
// Números
fireCountdown = "3.5 anos"
heroPatrimonioBrl = "R$ 8.35M"
swrFireDayVal = "2.4%"

// Tabelas
semaforoBody → tr × n (gatilhos)
hodlTableBody → tr × n (posições)
backtestMetricsBody → tr × 8 (métricas)

// Charts
backtestChart, deltaChart, trackingFireChart, etc
(Canvas ID → Chart.js instance)
```

---

## 📱 RESPONSIVIDADE DETALHADA

### Desktop (>1024px)
- hero-strip: 4 colunas
- grid-3: 3 colunas
- Tudo expandido

### Tablet (768–1024px)
- hero-strip: 3 colunas
- grid-3: 2 colunas
- Numbers: font-size reduzido 20%

### Mobile (480–768px)
- hero-strip: 2 colunas
- grid-2/3: 1 coluna
- Tabelas: overflow-x:auto
- Charts: altura 200px

### Mobile Pequeno (<480px)
- kpi-grid: 2 colunas
- Font-sizes reduzem 25%
- Padding/spacing comprimido

---

## 🎯 COMPARAÇÃO COM REACT v0.1.118

### Correspondências Estruturais
```
DashHTML HTML     → React JSX Component
.hero-strip       → <HeroStrip />
.grid-2/3         → <GridLayout cols={2|3} />
.section          → <Section />
.collapsible      → <CollapsibleSection />
.kpi              → <KPICard />
.chart-box canvas → <Chart type="line|bar|area" />
<table>           → <DataTable />
.progress-bar     → <ProgressBar />
```

### Migrando Para React
1. Extrair estrutura HTML → JSX
2. Substituir inline styles → CSS modules/styled-components
3. IDs únicos → state management (Redux/Zustand)
4. Chart.js → Recharts ou Chart.js wrapper
5. Colapsáveis → useState(collapsed)
6. Sliders → input onChange handlers
7. Tabelas → Array.map() + <tr>

---

## 📚 COMO USAR ESTES ARQUIVOS

### Para Desenvolvedores React
1. Leia **COMPONENT_INDEX.md** para mapear componentes
2. Referencie **COMPLETE_MAPPING.txt** para detalhes de cada aba
3. Use **VISUAL_SUMMARY.txt** para verificar layout esperado
4. Compare estrutura HTML com wireframes/mockups

### Para Designers
1. Estude **VISUAL_SUMMARY.txt** para layout e espacamento
2. Note as cores CSS (var(--accent), var(--green), etc)
3. Observe media queries para mobile responsive
4. Ref: Font sizes, padding, gap values em COMPLETE_MAPPING

### Para PMs/Stakeholders
1. Leia este README para overview
2. Use VISUAL_SUMMARY para apresentações
3. Referencie estatísticas do arquivo para escopo

---

## 🔍 BUSCAR INFORMAÇÕES ESPECÍFICAS

### Por Aba
- NOW: COMPLETE_MAPPING.txt linha ~50
- Portfolio: COMPLETE_MAPPING.txt linha ~350
- Performance: COMPLETE_MAPPING.txt linha ~650
- FIRE: COMPLETE_MAPPING.txt linha ~900
- Retiro: COMPLETE_MAPPING.txt linha ~1200
- Simuladores: COMPLETE_MAPPING.txt linha ~1500
- Backtest: COMPLETE_MAPPING.txt linha ~1800

### Por Componente
- Veja COMPONENT_INDEX.md (todos em uma tabela)
- Linha de código referenciada para cada componente

### Por Feature
- Colapsáveis: Procure "COLLAPSIBLE"
- Charts: Procure "canvas id="
- Tabelas: Procure "<table>" ou "#Table"
- Interatividade: Procure "Slider", "Button", "onclick"

---

## ⚠️ NOTAS IMPORTANTES

1. **Versão Estável**: v2.77 foi congelada para baseline. Não contém novos experimentos.

2. **Dinâmica via JS**: Muitos elementos estão vazios (divs) e preenchidos via JavaScript. A estrutura HTML é apenas o "esqueleto".

3. **Privacy Mode**: Todos os valores monetários têm classe `.pv` que permite mascaramento.

4. **Charts Customizáveis**: Chart.js permite muchas temas/cores via options.

5. **Responsividade Crítica**: `min-width: 0` em grids é essencial para funcionar em mobile.

6. **Performance**: Arquivo ~14k linhas é grande, considere code-splitting em React.

---

## 🔗 ARQUIVOS RELACIONADOS

- **HTML Original**: `/Users/diegodemorais/claude/code/wealth/analysis/raw/DashHTML-estavel.html`
- **React Versão**: `/Users/diegodemorais/claude/code/wealth/react-app/` (v0.1.118)
- **Análises**: `/Users/diegodemorais/claude/code/wealth/analysis/`

---

## 👤 AUTORIA & DATAS

- **Análise Preparada**: 15 de Abril, 2026
- **Analista**: Claude Code (Haiku 4.5)
- **Baseline**: DashHTML v2.77 (estável)
- **Propósito**: Referência técnica para React migration

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Mapping completo DashHTML v2.77
2. ⏳ Comparação detalhada com React v0.1.118
3. ⏳ Identificação de gaps / features faltantes
4. ⏳ Plano de migração/replicação

---

**Fim do README. Consulte os outros arquivos (.txt e .md) para detalhes completos.**

