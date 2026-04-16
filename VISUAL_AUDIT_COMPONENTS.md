# Visual Audit: Componentes a Atualizar (v0.1.170 → stable-v2.77)

## 🔴 CRÍTICO: Diferenças Estruturais Identificadas

### Versão Atual (0.1.170 - User Screenshot)
- Layout: Card-based com dados em cards individuais
- Labels: Português embutido nos cards (ex: "PATRIMÔNIO TOTAL", "ANOS ATÉ FIRE")
- Tipografia: Maiúscula para labels, números em destaque
- Espaçamento: Cards grandes com muito padding
- Cores: Tema escuro com bordas brancas nos cards

### Versão Reference (stable-v2.77)
- Layout: Dashboard tradicional com seções (tabs + blocos)
- Labels: Em inglês para tabs (Now, Portfolio, Performance, FIRE, etc)
- Tipografia: Hierarquia clara com seções
- Espaçamento: Mais compacto, menos padding
- Cores: Tema escuro com variáveis CSS (--accent, --card, --text)

---

## 📋 COMPONENTES POR TAB

### TAB: "NOW" (Atual)
**Versão atual mostra:**
- Patrimônio Total (R$3.59M / $632k)
- Anos até FIRE
- Progresso FIRE (43.1%)
- P(Cenário Aspiracional) vs base
- Drift Máximo
- Aporte do Mês
- Indicadores de Mercado

**Versão Reference mostra:**
- Hero KPI "Patrimônio Consolidado" (R$3.59M BRL)
- KPI Grid com: Cenário Aspiracional, Bond Pool, Drift Máximo, Wellness Score
- Market Context: Dólar, Bitcoin, IPCA+, Renda+
- Time to FIRE: 13a9m • 2040 (43%)
- FIRE Scenarios: Solteiro/Casado/C+Filho (com P%)
- Semáforos de Gatilhos (açõesprioritárias)
- Progresso FIRE + Aporte do Mês
- Wellness Score (72/100)
- Top 3 ações para subir score

---

### TAB: "PORTFOLIO"
**Versão atual:** (não mostrado no screenshot, precisa verificar)

**Versão Reference mostra:**
- Exposição Geográfica (Pie chart: US/EX-US/Local)
- Alocação Barras Empilhadas (com legendas de percentuais)
- Composição por Estratégia (tabela)
- Composição Fatorial (tabela por eixo)
- Posições (UCITS) - tabela detalhada com valores em USD
- Base de Custo e Alocação (Equity by Bucket)

---

### TAB: "PERFORMANCE"
**Versão Reference mostra:**
- Alpha desde Índice vs Isenção (gráfico)
- Regressão vs Realizado (5 anos, 2025-2030)
- Retornos Mensais (heatmap por ano/mês)
- Summary stats (CAGR, Sharpe, Sortino, MDD)

---

### TAB: "FIRE"
**Versão Reference mostra:**
- Renda FIXA + CRYPTO (tabela com posições)
- DCA Status (IPCA 2040, Renda+ 2040/2065)
- Últimas Operações (tabela com data, ativo, operação)

---

### TAB: "SIMULADORES" / "BACKTEST"
**Versão Reference mostra:**
- Widgets de controle (sliders, inputs)
- Resultado em card destacado (big number)
- Scenario cards (chosen vs non-chosen state)

---

## 🎨 DIFERENÇAS VISUAIS

| Aspecto | v0.1.170 (Atual) | stable-v2.77 (Reference) |
|---------|------------------|--------------------------|
| **Card Style** | Bordas brancas sólidas, grandes padding | Bordas RGB/HSL com transparency, padding compacto |
| **Typography** | Uppercase labels, "PATRIMÔNIO TOTAL" | Mixed case, "Patrimônio Consolidado" |
| **Layout** | Vertical stack cards | CSS Grid 2-3 colunas onde apropriado |
| **Color Accent** | Amarelo em destaque | Múltiplos (yellow, green, red) por contexto |
| **Spacing** | Muito espaçamento entre cards | Espaçamento mínimo, hierarquia visual clara |
| **Data Density** | Baixa (1-2 métricas por card) | Média-Alta (seções com múltiplas tabelas) |
| **Icons/Emojis** | Emojis nos tabs (🪙, 📊, 🔥) | Nenhum emoji, icons via CSS |

---

## 🔧 PRIORIDADE DE MUDANÇAS

### 1️⃣ ALTA (Quebra layout inteiro)
- [ ] Redesenhar tab layout (remove emojis, alinha com reference)
- [ ] Converter card system para grid-based layout
- [ ] Atualizar header "Dashboard Wealth DM" vs "Wealth 0.1.170"
- [ ] Mudar estrutura de dados nas labels

### 2️⃣ MÉDIA (Componentes principais)
- [ ] KPI Hero styling (Patrimônio)
- [ ] KPI Grid primário (Cenários + Bond + Drift)
- [ ] Market Context cards
- [ ] FIRE scenarios indicators
- [ ] Wellness Score card

### 3️⃣ BAIXA (Refinamentos)
- [ ] Spacing/padding ajustes
- [ ] Typography hierarchy
- [ ] Color variable updates
- [ ] Heatmap/chart styling

---

## 📊 COMPONENTES QUE DESAPARECEM
- Card "Patrimônio Total" (substitui por Hero KPI com layout diferente)
- Card "Anos até FIRE" (muda para "Time to FIRE" section)
- Emojis nos tabs

## 📊 COMPONENTES QUE APARECEM (NOVOS)
- Wellness Score (grande número 72/100)
- Top 3 ações detalhadas
- Bond Pool readiness
- DCA Status cards
- Last transactions table
