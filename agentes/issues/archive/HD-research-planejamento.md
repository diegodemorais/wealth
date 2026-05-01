# HD-research-planejamento: Pesquisa de Referências em Financial Planning, Wealth e Portfolio Management

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-research-planejamento |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | 🔴 Crítica |
| **Participantes** | Dev, FIRE, Factor, CIO, Advocate, Bookkeeper |
| **Co-sponsor** | CIO |
| **Dependencias** | HD-dashboard-v2 (backlog) |
| **Criado em** | 2026-04-08 |
| **Origem** | Diego — investigar referências de mercado para elevar o dashboard |
| **Concluido em** | 2026-04-08 |

---

## Motivo / Gatilho

Diego quer entender o estado da arte em financial planning, wealth management e portfolio management software — com foco especial no **Boldin** (ex-NewRetirement), que é referência de eficiência para planejamento de aposentadoria. Objetivo: identificar features, visualizações e conceitos que o dashboard da carteira pode incorporar.

---

## Descrição

Pesquisa profunda de referências de mercado. Principal foco: Boldin (boldin.com) — investigar cada feature, gráfico e informação disponível. Secundário: outros tools relevantes (Empower/Personal Capital, Projection Lab, FI Calc, Monarch Money, etc.).

---

## Análise

### Agentes Consultados

- **FIRE** — avaliou o que Diego tem vs. o que as ferramentas oferecem em FIRE modeling
- **CIO** — avaliou posicionamento estratégico do dashboard vs. ferramentas de mercado
- **DEV** — avaliou viabilidade técnica de implementação (Chart.js)
- **Tax/Behavioral** — avaliou guardrails e spending psychology
- **Boldin Researcher** — deep-dive completo no Boldin + ProjectionLab + FI Calc + Empower + Monarch + Copilot
- **Tools Researcher** — análise de ProjectionLab, FI Calc, cFIREsim, Empower, Monarch, Portfolio Visualizer, Testfol.io, Simba's Spreadsheet

---

## PARTE I — BOLDIN (boldin.com, ex-NewRetirement)

### Contexto Geral

Renomeado de NewRetirement em setembro/2024. ~350.000 usuários, >US$300B em ativos. Posicionamento: "panoramic retirement planning". Serve investidores DIY com situações financeiras complexas.

**Pricing:**
- Free Basic: ~150 inputs, MC limitado
- PlannerPlus: US$144/ano — 250+ inputs, todos os explorers, 15+ charts, tax modeling completo
- Coaching: US$250/sessão

---

### 1. Planejamento de Aposentadoria

**Chance of Retirement Success (Overview)**
- Percentual proeminente na tela principal
- Baseado em Monte Carlo de 1.000 simulações
- Critério rigoroso: portfólio NUNCA negativo em nenhum ano (não apenas no final)
- Visual: card numérico + linha de tendência de net worth

**Financial Wellness Snapshot**
Scorecard com 12-20+ métricas com semáforo (verde/amarelo/vermelho):
- Earliest Possible Retirement Date (recalculado mensalmente)
- Average Retirement Withdrawal Rate
- Cash Flow Over Next 12 Months
- Current Savings Rate
- Housing Wealth at Retirement
- Surviving Spouse Income
- Total Debt Ratio
- Roth Conversion Opportunity
- Savings Rate

**Withdrawal Strategies — 4 abordagens:**
| Estratégia | Lógica |
|-----------|--------|
| Goal-Based (padrão) | Retira apenas o necessário para cobrir shortfall |
| Fixed Withdrawal Rate | % fixo ajustado pela inflação (4% Rule) |
| Guardrails (Guyton-Klinger) | Ajusta spending quando portfolio cruza thresholds |
| Maximum Spending | Depleta tudo até o legacy goal |

**Spending Guardrails Insight** (feature recente):
- **Safe Spending Target (80% success):** baseline sustentável
- **Upper Guardrail (95%):** sinal de underspending — pode gastar mais
- **Lower Guardrail (70%):** alerta precoce para cortar gastos
- Dinâmico: reavalia continuamente com base no saldo atual e horizonte restante

---

### 2. Projeções e Cenários

**Monte Carlo:**
- 1.000 simulações
- 3 conjuntos de premissas (optimistic/average/pessimistic) customizáveis
- Defaults históricos 1994-2024: inflação 2.54%, retorno 8.08%, apreciação imóvel 4.40%

**Scenario Manager:**
- Até 10 cenários simultâneos (PlannerPlus)
- Comparação side-by-side de até 3 cenários em 15+ métricas
- What-ifs suportados: trabalhar +1 ano, reduzir gastos, downsizing, bear market, herança, longevidade estendida, cônjuge pré-falecendo, Long-Term Care insurance

**Financial Journey Chart** (fev/2026):
- Marcos de vida e financeiros em linha do tempo
- Impacto de eventos no cash flow e plano de longo prazo

---

### 3. Renda na Aposentadoria

**Social Security Explorer** (EUA-específico):
- Otimizador de claiming strategies com comparação de monthly income + lifetime payout
- Casais: combinações de start dates, switching após morte do cônjuge

**Fontes de renda modeladas:**
- Work income com múltiplas fases (barista FIRE, renda parcial)
- Pensions: 3 tipos (monthly, lump sum, cash balance)
- Annuities: imediatas e deferred com COLA
- Passive income, windfalls, RMDs automáticos

---

### 4. Gestão de Ativos

**Account Types:** 15 tipos (401k, Roth 401k, IRA, Roth IRA, HSA, 529, brokerage)
**Asset Allocation:** 5 model portfolios com taxas de retorno customizáveis por conta e cenário
**Account Linking:** Plaid + MX + Finicity, atualização 2x/dia
**Limitação:** sem análise fatorial, sem comparação com benchmark específico, sem ETFs granulares

---

### 5. Saúde e Longevidade (EUA-específico)

**Medicare Estimator:**
- API com Medicare.gov (estado-específico)
- Inputs: tipo de cobertura, health status, condições médicas, nível de renda (IRMAA)
- Inflação médica configurável separada da inflação geral

**IRMAA Report:** projeta surcharges anuais, integrado com Roth Conversion Explorer
**Long-Term Care:** modela últimos 28 meses de vida (~US$118k em valores de hoje)

---

### 6. Impostos (PlannerPlus, foco EUA)

**Modela:** federal income tax, state income tax, capital gains, FICA, Social Security taxation, IRMAA
**Não modela:** NIIT, AMT, estate/gift taxes, early withdrawal penalties

**Roth Conversion Explorer (feature mais sofisticada):**
- 4 estratégias: Highest Estate Value, Lowest Lifetime Tax, Tax Bracket Limit, IRMAA Bracket Limit
- Output: conversões anuais recomendadas, saldos projetados, taxa efetiva lifetime
- Integrado com Scenario Manager

---

### 7. Estate Planning

- Legacy Goal: define meta de patrimônio a deixar
- Max Spend strategy: calculta "die with zero" respeitando legacy goal
- Charitable planning: DAF contributions, QCDs
- Estate Planning Checklist: documentos (testamento, POA, beneficiários)

---

### 8. Dashboard e UX

**Estrutura de navegação:**
1. Onboarding (30-45 min): 6 módulos de input
2. Overview: Chance of Success + key metrics + coach suggestions
3. Your Progress: componentes e milestones
4. Insights: todos os charts e relatórios
5. Explorers: Roth, Social Security, Spending Guardrails, Debt
6. Scenario Manager

**Insights Section — Charts disponíveis:**

*Projections:*
- **Lifetime Income Projection Chart** (principal): stacked bars de income sources + linha de despesas + savings drawdown + milestones interativos
- Projected Savings Balances
- Projected Net Worth
- Financial Journey Chart

*Cash Flow:*
- **Sankey Cashflow Chart** (fev/2026): flows proporcionais income → taxes → expenses → savings
- Income & Expenses
- Savings Drawdowns and Transfers

*Tax:*
- Estimated Taxes Chart (federal + state + FICA + capital gains por ano)
- Net Taxable Income by Federal Tax Bracket
- Gross Taxable Income by Source
- Projected Tax Liability
- IRMAA Report

**Digital Coach:** sistema proativo que gera hints, nudges e sugestões. Conectado ao AI Planner Assistant (linguagem natural).

---

### 9. Inputs do Usuário (250+ no PlannerPlus)

**6 módulos:** Accounts & Assets, Real Estate, Debts, Income, Expenses & Healthcare, Money Flows

**Must Spend vs. Like to Spend:** distinção entre gastos obrigatórios e discricionários (muito relevante para FIRE modeling de Diego)

---

### 10. Alertas Automáticos

- Underfunding alerts (expenses sem funding suficiente)
- Spending Guardrails (monitora range safe/upper/lower)
- Roth Conversion Opportunity detector
- Earliest Possible Retirement Date (recalcula mensalmente)
- Financial Wellness Snapshot (semáforo)
- AI Planner Assistant (linguagem natural)
- Coach Suggestions (priorizadas por impacto financeiro)

---

## PARTE II — PROJECTION LAB (projectionlab.com)

Criado especificamente para a comunidade FIRE. Interface mais sofisticada e "open-world". Preferido por perfis técnicos (Mad Fientist, Physician on FIRE).

**Pricing:** Free (sem salvar) / US$129/ano / US$1.199 lifetime

**Diferenciais vs. Boldin:**
- **Sankey Diagrams** (core feature): mais interativo e visual que o Boldin
- **Tax Analytics** (Premium): effective brackets chart por tipo de renda, drill-down por ano
- **Monte Carlo** customizável: trials ilimitados, distribuições customizáveis, sucesso redefinível
- **Historical backtest** (100+ anos) integrado com Monte Carlo
- **Flex Spending** (v4.4): spending que se ajusta com a performance do portfolio — guardrails nativos
- **Compare Mode** (v4.2): overlay de baseline sobre cenários alternativos
- **International Support** crescente (Canada, UK, Australia, Germany, Netherlands)
- **Auto re-run** quando variáveis mudam (v4.1)

**O que Boldin faz melhor:** Social Security Explorer, Medicare modeling, Long-Term Care, tax strategy out-of-the-box, mais guiado para quem não é técnico.

---

## PARTE III — FI CALC (ficalc.app)

Especializado em **safe withdrawal rate via backtesting histórico** (100+ anos). Foco único: "qual taxa de retirada é segura?".

**Pricing:** Gratuito

**13 estratégias de withdrawal:**
- Constant Dollar (4% Rule), Percent of Portfolio, 1/N
- VPW, Custom VPW, Dynamic SWR
- Endowment Strategy, Guyton-Klinger, 95% Rule
- CAPE-based: W = a + b*(1/CAPE) — usa Shiller CAPE como proxy de retornos esperados
- Sensible Withdrawals, Hebeler Autopilot II, Vanguard Dynamic Spending

**Diferencial:** nenhuma outra ferramenta gratuita tem tantas withdrawal strategies implementadas e comparáveis em condições históricas idênticas.

---

## PARTE IV — OUTRAS FERRAMENTAS

### cFIREsim (cfiresim.com)
- Dados históricos desde 1871 (Shiller)
- **Investigation Mode:** encontra max SWR dado um % de success rate alvo
- Guyton-Klinger configurável (guardrails customizáveis)
- Até 48 simulações abertas simultaneamente
- Limitação: UX datada, sem Monte Carlo, sem tax modeling

### Empower / Personal Capital (empower.com)
- **Gratuito**
- 5.000 simulações Monte Carlo (mais que o Boldin)
- Fee Analyzer: custo real de ER ao longo do tempo — muito valioso
- Investment Checkup: alocação atual vs. recomendada
- Limitação: vinculado ao ecossistema americano (Plaid), sem planejamento estratégico profundo

### Portfolio Visualizer (portfoliovisualizer.com)
- **Factor regression** melhor do mercado DIY: FF5+Mom, fontes AQR, Ken French, Alpha Architect
- O que `scripts/factor_regression.py` local replica
- Free tier: apenas últimos 10 anos (suficiente para factor regression pontual)
- Limitação: tickers UCITS não disponíveis (usar proxies americanos: AVDV, AVEM para AVGS, AVEM)

### Simba's Backtesting Spreadsheet (Bogleheads)
- Dados históricos mais longos por asset class em planilha gratuita
- US stocks desde ~1871, International desde ~1970
- Calibração de premissas de retorno histórico de equity DM ex-US e EM
- Confirma/contesta premissas do `fire_montecarlo.py` local

### FI Calc / Testfol.io / Monarch / Copilot
- Testfol.io: SPYSIM (S&P 500 desde 1886) — backtest histórico longo com proxies
- Monarch: budget tracking, sem FIRE modeling
- Copilot: iOS/Mac only, melhor UX de budget tracking, sem projeções

---

## PARTE V — AVALIAÇÃO DOS AGENTES INTERNOS

### FIRE Agent

**Conclusão:** O `fire_montecarlo.py` de Diego é tecnicamente superior ao Boldin em:
- Distribuição t-Student (fat tails) vs. normal do Boldin
- 10.000 trials vs. 1.000 do Boldin
- Dados UCITS brasileiros reais vs. proxies americanos
- Haircut correto de 58% para factor premiums (McLean & Pontiff)

**Gaps identificados:**
- Falta flag de P(success) como segundo sinal visual no dashboard (além do número)
- Sem stress-test ad-hoc (bear market de 30-40% no primeiro ano)
- Sem modelagem de discrete spending events (reforma, carro, viagem grande)
- Sem "Earliest Possible Retirement Date" dinâmico

### CIO

**Conclusão:** Boldin é cashflow simulator, não portfolio manager. Diego é superior em:
- Factor analysis e tilt fatorial (SWRD/AVGS/AVEM)
- Monte Carlo com distribuições realistas
- Modelagem de realidade brasileira (IPCA+, hipoteca SAC, IR local)

**Gaps identificados:**
- Falta projeção integrada de net worth (financeiro + capital humano + imóvel + INSS)
- Sem modelagem de dynamic life events (renda parcial pós-FIRE, segunda fase)
- Sem comparação side-by-side de cenários no dashboard

### DEV

**Conclusão:** feature mais importante para implementar = **Lifetime Income Projection Chart**

**Viabilidade técnica:**
- Chart.js suporta stacked bar com linha overlay — viável com dataset misto
- Milestone markers: viável com `chartjs-plugin-annotation`
- Sankey: requer biblioteca separada (Chart.js não suporta nativamente)
- Spending Guardrails: 3 linhas horizontais com zona de cor — muito viável em Chart.js

### Tax/Behavioral

**Conclusão:** features mais relevantes para context brasileiro:

**Spending Guardrails visual:**
- 3 zonas de probabilidade (>85% verde, 70-85% amarelo, <70% vermelho) vs. o número único atual
- Vincula P(FIRE) ao comportamento de gasto atual — feedback em loop

**Must Spend vs. Like to Spend:**
- Separar gastos obrigatórios de discricionários no modelo
- Em stress, cortar "Like to Spend" primeiro — mais realista que corte linear

---

## PARTE VI — GAPS CRÍTICOS DE TODAS AS FERRAMENTAS PARA O CONTEXTO BRASILEIRO

Nenhuma das ferramentas resolve adequadamente:
1. **IPCA+ como benchmark de renda fixa** — todas usam US Treasuries
2. **Risco cambial BRL/USD** — nenhuma modela portfólio em duas moedas
3. **ETFs UCITS** — Portfolio Visualizer e Testfol.io usam apenas tickers americanos
4. **IR brasileiro** — nenhuma conhece a tabela 15-22.5% com isenção de R$35k/mês
5. **INSS e Previdência Social brasileira** — sem analogia com Social Security
6. **Capital humano em BRL vs. patrimônio em USD** — só o `fire_montecarlo.py` local modela isso
7. **Hipoteca SAC** — nenhuma modela fluxo de amortização SAC

**Conclusão:** as ferramentas são excelentes para aprendizado conceitual e inspiração de UX. Para o planejamento FIRE real do Diego, os scripts locais continuam sendo a fonte primária de verdade.

---

## Conclusão

Pesquisa concluída. O estado da arte em financial planning software oferece inspirações concretas para o dashboard do Diego, especialmente:

1. **Boldin** e **ProjectionLab** como referências de UX e visualização de ciclo de vida financeiro
2. **FI Calc** como referência conceitual para withdrawal strategies na fase de drawdown
3. **Portfolio Visualizer** para validação externa de factor regression
4. **Simba's Spreadsheet** para calibração de premissas históricas

O dashboard de Diego tem superioridade técnica em modelagem quantitativa (MC, distribuições, factor analysis, realidade brasileira). As lacunas são em **visualização de ciclo de vida**, **spending guardrails dinâmicos**, e **life events discretos**.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Conhecimento** | Mapa completo de ferramentas de financial planning com avaliação de relevância por domínio |
| **Próxima issue** | Incorporar features selecionadas em HD-dashboard-v2 |

---

## Features Priorizadas para HD-dashboard-v2

### P0 — Alta relevância, viável em Chart.js

| # | Feature | Origem | Descrição |
|---|---------|--------|-----------|
| F1 | **Lifetime Income Projection Chart** | Boldin/ProjectionLab | Stacked bar: income sources por ano (renda, dividendos, RF, venda de ativos) + linha de despesas. Mostra quando começa o drawdown e quando cada fonte entra. |
| F2 | **Spending Guardrails visuais** | Boldin | 3 zonas no gauge de P(FIRE): verde (>85%), amarelo (70-85%), vermelho (<70%). Substitui número único por sinal de zona. |
| F3 | **Earliest Possible FIRE Date** | Boldin | "Com as premissas atuais, FIRE possível em: [mês/ano]". Recalculado automaticamente. |

### P1 — Alta relevância, implementação moderada

| # | Feature | Origem | Descrição |
|---|---------|--------|-----------|
| F4 | **Scenario Comparison** | Boldin/ProjectionLab | Side-by-side de 2-3 cenários (ex: FIRE-50 vs. FIRE-48 vs. FIRE-52) em métricas-chave. |
| F5 | **Must Spend vs. Like to Spend** | Boldin | Separar gastos obrigatórios de discricionários no modelo de despesas. Em stress, cortar discricionário primeiro. |
| F6 | **Discrete Life Events** | Boldin/ProjectionLab | Modelar eventos pontuais: reforma (R$X em 2027), carro (R$X em 2029), viagem grande (R$X em 2030). |
| F7 | **Net Worth Projection integrada** | Boldin | Projeção de patrimônio total (financeiro + imóvel + capital humano) até longevidade, não apenas portfólio financeiro. |

### P2 — Relevante, maior complexidade técnica

| # | Feature | Origem | Descrição |
|---|---------|--------|-----------|
| F8 | **Sankey Cash Flow** | Boldin/ProjectionLab | Diagrama de fluxo: renda → impostos → despesas → investimentos. Requer biblioteca separada (Chart.js não suporta). |
| F9 | **CAPE-based withdrawal** | FI Calc | Withdrawal rate dinâmica baseada no CAPE atual do portfólio. Relevante para fase de drawdown. |
| F10 | **Financial Wellness Scorecard** | Boldin | Dashboard de métricas com semáforo: withdrawal rate atual, savings rate, cash flow próximos 12 meses, etc. |

### P3 — Menor urgência ou baixa adaptabilidade para contexto BR

| # | Feature | Origem | Descrição |
|---|---------|--------|-----------|
| F11 | **Stress Test Integrado** | Boldin/Empower | "Bear market de -40% no primeiro ano" aplicado ao plano atual → novo P(FIRE). |
| F12 | **Withdrawal Order** | Boldin | Ordem de depleção de contas (IBKR vs. CDB vs. Tesouro) por tipo de imposto e liquidez. |
| F13 | **Recession Simulator** | Empower | Simula o impacto de 2008 ou 2020 no plano atual. |

---

## Próximos Passos

- [x] Pesquisa concluída — 6 agentes + 2 researchers
- [ ] **Validar lista de features com Diego** — qual P0/P1 priorizar em HD-dashboard-v2
- [ ] Priorizar para implementação em HD-dashboard-v2 (Backlog/Crítica)
