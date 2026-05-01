# HD-boldin-benchmark: Benchmark Boldin — Análise Comparativa do Dashboard vs Melhor Software de Mercado

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-boldin-benchmark |
| **Dono** | Head |
| **Status** | Refinamento |
| **Prioridade** | Média |
| **Participantes** | Dev, FIRE, Quant |
| **Co-sponsor** | Dev |
| **Dependencias** | DEV-dashboard-components-alignment |
| **Criado em** | 2026-04-17 |
| **Origem** | Proativo — pesquisa externa solicitada por Diego |
| **Concluido em** | — |

---

## Motivo / Gatilho

Diego solicitou pesquisa exaustiva do Boldin (antes NewRetirement) como benchmark de referência para o dashboard de planejamento FIRE. O objetivo é identificar gaps, vantagens competitivas e oportunidades de melhoria no dashboard atual, com base no melhor software de planejamento de aposentadoria disponível no mercado.

---

## Descricao

Análise comparativa entre o dashboard atual (Diego/FIRE) e o Boldin, com identificação de:
- O que o nosso dashboard faz melhor
- Onde o Boldin é claramente superior
- O que falta no nosso dashboard
- O que temos mas implementado de forma inferior

O Boldin é a referência mais relevante pois é o único software FIRE/retirement que oferece profundidade quantitativa real, planning holístico e é amplamente adotado pela comunidade FIRE americana (Bogleheads, White Coat Investor, Rational Reminder).

---

## Escopo

- [x] Pesquisa exaustiva do Boldin (funcionalidades, fluxos, visualizações)
- [x] Leitura e mapeamento do dashboard atual (7 abas)
- [x] Análise comparativa 4 dimensões
- [ ] Time revisar os gaps identificados
- [ ] Priorização com Diego (quais gaps são prioritários para o caso de uso FIRE-50)
- [ ] Issues filhas para gaps de alta prioridade aprovados

---

## Raciocinio

**Argumento central:** O Boldin resolve o problema de planejamento de aposentadoria para o americano médio com conta 401k e Social Security. O nosso dashboard resolve o problema específico de Diego: FIRE-50 brasileiro, UCITS ETFs via IBKR, IPCA+, câmbio BRL/USD, factor investing. Esses contextos são fundamentalmente diferentes — mas o Boldin tem 10+ anos de refinamento de UX e metodologia que merecem ser aprendidos.

**Alternativas rejeitadas:** ProjectionLab (mais UX/lifestyle, menos quantitativo), FIRECalc/cFIREsim (apenas backtesting histórico, sem holística), Empower (tracking, não planning). Boldin é o benchmark certo porque combina planejamento holístico + Monte Carlo + tax optimization + withdrawals.

**Incerteza reconhecida:** Algumas funcionalidades do Boldin (Social Security, Roth conversion, RMDs, 401k) são estruturalmente inaplicáveis para o contexto brasileiro. Precisamos separar o que é gap real do que é diferença de contexto.

**Falsificação:** Se após implementar os gaps identificados a experiência de uso do Diego melhorar mensuravelmente (ex: menos tempo para responder "quando posso me aposentar?" ou "qual é meu plano de withdrawal?"), a decisão foi correta.

---

## Analise

### ETAPA 1 — O que é o Boldin

**Boldin** (antes NewRetirement) é o principal software de planejamento financeiro FIRE/retirement dos EUA. Lançado como NewRetirement, renomeado para Boldin em 2024. Tier gratuito (funcional) + PlannerPlus a $144/ano. Adotado amplamente por comunidades FIRE (Bogleheads, White Coat Investor).

#### Funcionalidades Mapeadas

**Planejamento Holístico (250+ inputs):**
- Accounts & Assets: contas de aposentadoria, banking, HSA, 529 (faculdade), crowdfunding, veículos, negócios, joias
- Home & Real Estate: valuation, hipoteca, refinanciamento, reverse mortgage, imóvel adicional, compra futura
- Debts: cartão, auto, student loan, médico — com Debt Explorer (paydown strategies)
- Income: emprego atual, futuro, Social Security (com otimizador de claiming age), pensão, anuidade, herança, windfall
- Expenses & Healthcare: despesas básicas, one-time, faculdade, long-term care, custo de saúde com inflator próprio
- Money Flows: transfers entre contas, estratégia de withdrawal, alocação de excess income, Roth conversions, RMDs automáticos

**Simulações e Exploradores:**
- Monte Carlo: 1.000 simulações (atualizado em jul/2025 para AAGR instead of CAGR), "Chance of Retirement Success"
- Social Security Explorer: otimização de claiming age, comparação current vs desired plan, maximum life benefit
- Roth Conversion Explorer: modelagem ano a ano, otimização por tax bracket, por estate value, por IRMAA avoidance; range de idade configurável (atualizado mar/2025)
- What-If Scenarios: multiple baseline scenarios, ajuste de retirement date, income, expenses, duração de trabalho
- Debt Explorer (novo 2025): debt paydown strategies — avalanche, snowball etc.

**Outputs e Visualizações:**
- Lifetime Income Projection Chart: barras empilhadas por fonte de renda (Social Security, work, pension, drawdowns), overlay de despesas, milestones (dots)
- Projected Savings Balances: valor de cada conta por ano, multi-decade
- Tax Analysis: federal + state projection, tax brackets por ano, capital gains, FICA
- Net Worth: snapshot atual + breakdown (pie chart ativos/passivos) + projeção multi-decade + drill-down por ano
- Surplus-Gap Chart: ano a ano, surplus = verde, gap = vermelho — visualização intuitiva de quando o dinheiro acaba
- Estimated Expenses: timeline com healthcare escalation, end-of-life, by category
- Plan Accuracy Metric (novo 2025): avalia quão bem-configurado está o plano

**Financial Wellness Dashboard:**
- Financial Wellness Score (15-25 métricas, exceedingly/progressing/vulnerable)
- Métricas individuais: withdrawal rate, cash flow 12m, cash flow next month, savings rate, housing expense ratio, housing wealth at retirement, retirement savings opportunity (% max contributions), Roth conversion opportunity, surviving spouse income, total debt ratio, earliest possible retirement date
- Coach Suggestions: alertas digitais personalizados com ações recomendadas

**Outros:**
- Optimistic/Average/Pessimistic toggle
- Today vs Future dollars toggle (inflation-adjusted)
- Custom withdrawal order: traditional ou customizado por conta (PlannerPlus)
- Longevity modeling (life expectancy ajustável)
- Plan to specified age
- Multiple scenario comparison side-by-side
- Account syncing via Plaid (read-only, one-way)
- AI-powered help chat (PlannerPlus)
- Boldin Classroom: 16+ classes educacionais, live Q&A
- CFP consultation ($2.800/ano separado)

**Diferencial vs concorrência:**
- Boldin é mais linear e guiado (vs ProjectionLab mais "freestyle")
- Único com Roth Conversion Explorer robusto
- Único que combina planejamento holístico + Monte Carlo + tax optimization
- Fraqueza documentada: sem backtesting histórico (cFIREsim/FIRECalc fazem isso melhor)
- ProjectionLab tem UX ligeiramente superior para cenários customizados
- Empower: melhor para asset tracking, fraco em planejamento

---

### ETAPA 2 — O que temos no Dashboard (7 abas)

**Aba NOW:**
- Hero Strip: patrimônio (BRL/USD), progresso FIRE %, anos para FIRE, P(FIRE), câmbio
- KPI Strip: P(FIRE|53), drift máximo, aporte meta, equity YTD USD, portfolio YTD BRL, passivos
- Semáforos de Gatilhos: DCA IPCA+, Renda+, alertas de ação
- Mercado & Macro: 8 chips (USD/BRL, BTC/USD, IPCA+2040, Renda+2065, Selic, Fed Funds, Spread, Exposição cambial)
- Aporte do Mês: próxima ação concreta, acumulado mês/ano
- Drift da Carteira: bars por ativo, atual vs alvo, gap em BRL
- Tornado de Sensibilidade: P(FIRE) × premissas (collapsible)
- TIME TO FIRE: tabs por perfil familiar (Atual/Casado/Filho), P(FIRE|53), stress/fav, pat mediano, sensibilidade ao aporte
- Financial Wellness Score: ~10 métricas com barras, top ações

**Aba PORTFOLIO:**
- Alocação por Classe de Ativo: barra empilhada (Equity/IPCA+/Renda+/Crypto)
- Drift Intra-Equity: SWRD/AVGS/AVEM com bar + target marker
- Exposição Geográfica: donut charts
- Composição por Região: ETF region breakdown
- Concentração Geográfica: ConcentrationChart
- Exposição Fatorial: ETF factor composition (Market/Value/Size/Quality)
- Holdings Table: IBKR positions
- Custo Base e Alocação: por bucket
- IR Diferido: análise tributária
- Renda Fixa + Cripto: composição
- Últimas Operações: mini-log

**Aba PERFORMANCE:**
- Patrimônio — Evolução Histórica: TimelineChart com período selector (6m/YTD/1y/3y/5y/all)
- Performance Attribution: decomposição aportes + retorno USD + câmbio + RF (barras + KPI cards)
- Alpha vs VWRA: DeltaBarChart por período, alpha ITD e anualizado, alpha líquido esperado
- Premissas vs Realizado: PremisesTable 5 anos
- Rolling 12m AVGS vs SWRD (collapsible)
- Information Ratio vs VWRA — desde início + rolling 36m (collapsible)
- Factor Loadings FF5+Mom — tabela por ETF (collapsible)
- Retornos Mensais — Heatmap (collapsible)
- Rolling Sharpe 12m BRL vs CDI + USD vs T-Bill (collapsible)
- Fee Analysis — custo de complexidade 14 anos (collapsible)

**Aba FIRE:**
- Tracking FIRE — Realizado vs Projeção: linha histórica + target
- FIRE Aspiracional — 4 cards (Solteiro/Casado/Filho/Aspiracional) com P(FIRE), FIRE year, P stress/fav, botão Simular
- Projeção de Patrimônio — P10/P50/P90 fan chart
- FIRE Matrix — P(sucesso) × patrimônio × gasto (collapsible)
- P(FIRE) Cenários de Família — barras horizontal por perfil
- Eventos de Vida (collapsible)
- Cenário Base vs Aspiracional — tabela (collapsible)
- Glide Path — gráfico alocação por idade (collapsible)

**Aba WITHDRAW:**
- SWR no FIRE Day — Percentis P10/P50/P90
- Guardrails de Retirada — tabela + upside rule
- Spending Guardrails — P(FIRE) × Custo de Vida (chart interativo)
- Bond Pool Readiness — proteção SoRR
- Bond Pool Runway Chart
- Sankey — Fluxo de Caixa Anual (collapsible)
- Renda na Aposentadoria — Fases Temporais: tabela Go-Go/Slow-Go/No-Go
- Spending Breakdown — Essenciais vs Discricionários (collapsible)

**Aba SIMULATORS:**
- Calculadora de Aporte — Cascade: 3 níveis (IPCA+/Renda+/Equity) com slider, DCA status, gap em BRL
- Simulador FIRE — sliders Aporte/Retorno/Custo, resultado com ano/idade/P%, SWR, mini-timeline
- What-If Scenarios — preset stress/base/fav + slider custo de vida (collapsible)
- Stress Test Monte Carlo — slider shock %, seletor de idade, chart MC 300 trajetórias até 100 anos (collapsible)

**Aba BACKTEST:**
- Backtest Histórico Target vs VWRA — período selector (37a/21a/17a/13a/6a/5y/3y), chart + tabela CAGR/Sharpe/Vol/MaxDD/Alpha
- Drawdown Histórico — série completa + tabela de crises
- Shadow Portfolios — Target vs VWRA por período
- Backtest Longo Regime 7 (1989–2026) — métricas globais, CAGR por década, Factor Drought, drawdown recovery, FF5 regression (collapsible)

---

### ETAPA 3 — Análise Crítica Comparativa

#### 3a. O que temos de BOM (vantagens sobre o Boldin)

1. **Profundidade quantitativa em backtest**: Boldin não tem backtesting histórico — nós temos 37 anos de backtest (Regime 7), por décadas, com proxies Ken French/MSCI, CAGR/Sharpe/MaxDD/Alpha, factor loadings FF5+Mom, drawdown por crise. Isso é diferencial absoluto — nenhum software de mercado oferece isso integrado.

2. **Factor investing nativo**: Boldin é agnóstico de estratégia (qualquer portfolio). Nós temos exposição fatorial por ETF (Market/Value/Size/Quality), rolling factor loadings, Information Ratio, alpha vs benchmark fatorial — específico para a tese SWRD/AVGS/AVEM.

3. **Contexto macroeconômico brasileiro integrado**: IPCA+, Renda+, Selic, Fed Funds, spread Selic-FF, BRL/USD — tudo ao vivo, tudo em uma tela. Boldin não tem nada disso.

4. **Drift da carteira em tempo real com custo de fechamento**: Boldin não tem drift tracker com "quanto em BRL para fechar o gap". Nós temos por ativo e por classe, com DCA ativo/pausado.

5. **Cascade de aportes**: A lógica de decisão IPCA+ → Renda+ → Equity com DCA ativo/pausado por gatilho de taxa é exclusiva do nosso contexto e não existe em nenhum software de mercado.

6. **Spending Smile e Fases de Aposentadoria**: Go-Go/Slow-Go/No-Go integrado ao MC — mais sofisticado que o Boldin, que usa healthcare escalation genérico.

7. **Bond Pool (SoRR protection)**: Boldin não tem conceito de bond pool explícito. Nós temos readiness, runway, e integração com o guardrail system.

8. **Privacy mode**: Boldin não tem modo privacidade. Nós transformamos valores em •••• mantendo a estrutura visual.

9. **Glide path explícito**: Nossa aba FIRE tem glide path por idade com regras formais. Boldin não tem.

10. **Exposição geográfica e cambial detalhada**: Donut charts por região ETF, concentração Brasil, exposição cambial — inexistente no Boldin.

#### 3b. O que temos de RUIM (inferioridade em relação ao Boldin)

1. **Sem visão holística do patrimônio (imóvel, capital humano, INSS)**: Boldin agrega TODO o patrimônio — imóvel (com hipoteca, refinanciamento, reverse mortgage), veículos, negócios, HSA, 529. Nós só temos carteira financeira. O balanço total de R$7.86M (financeiro + imóvel + cap.humano + INSS + terreno) é calculado nos scripts mas não é visível integrado no dashboard.

2. **Sem projeção ano a ano do patrimônio integrado**: Boldin mostra o valor de cada conta por ano, para múltiplas décadas, com drill-down. Nosso fan chart P10/P50/P90 é mais aggregado e menos interativo.

3. **Sem análise de surplus-gap ano a ano**: O Surplus-Gap Chart do Boldin é visualmente poderoso — verde quando o dinheiro sobra, vermelho quando falta. Nós não temos isso explícito por ano.

4. **Sem análise tributária projetada**: Boldin tem projeção de IR federal + estadual + capital gains + tax brackets por ano, ao longo de décadas. Nós temos o IR diferido snapshot, mas sem projeção temporal.

5. **UX de entrada de dados**: Boldin tem 250+ inputs com interface guiada (5 minutos para começar ou full detail). Nós não temos interface de input — os dados vêm de scripts Python. Para Diego isso é irrelevante, mas limita a experiência de demonstração a terceiros.

6. **Coach/alertas estruturados**: As Coach Suggestions do Boldin são ações priorizadas com impacto esperado. Nosso Financial Wellness Score tem "Top Ações" mas é menos proativo e menos contextualizado com o plano completo.

7. **Multiple scenarios side-by-side**: Boldin permite criar múltiplos cenários e compará-los lado a lado. Nós temos presets stress/base/fav nos simuladores, mas não persistência de cenários nomeados.

8. **Earliest possible retirement date (dinâmico)**: Boldin calcula automaticamente a menor idade possível de aposentadoria dada a configuração atual. Nós temos FIRE 53 base + aspiracional, mas sem scanning dinâmico.

9. **Surviving spouse income analysis**: Boldin modela explicitamente o impacto da morte de um cônjuge no plano de aposentadoria. Nós não temos isso — relevante dado o contexto de casamento iminente.

10. **Long-term care e healthcare escalation detalhada**: Boldin tem inputs específicos para LTC (ex: $1.966/mês por 12 meses, então $5.900/mês por 16 meses). Nosso spending smile é mais simplificado.

#### 3c. O que FALTA (funcionalidades do Boldin que não temos)

| # | Funcionalidade | Descrição | Impacto no caso Diego |
|---|---|---|---|
| F1 | **Balanço patrimonial holístico integrado** | Imóvel, terreno, INSS projetado, capital humano — tudo em um único painel | Alto — o patrimônio real é R$7.86M, não R$3.5M. FIRE number muda. |
| F2 | **Surplus-Gap Chart ano a ano** | Visualização ano a ano de quando o dinheiro sobra/falta durante a aposentadoria | Alto — responde intuitivamente "meu plano aguenta?" |
| F3 | **Projeção tributária multi-decade** | IR estimado por ano: alíquota efetiva, bracket, capital gains, IR diferido projetado | Médio — relevante para decisões de Roth-equivalente (PGBL/VGBL para Katia) |
| F4 | **Earliest Retirement Date Scanner** | Scan automático da idade mínima de aposentadoria dada a configuração atual | Médio — complementa o FIRE aspiracional |
| F5 | **Cenários nomeados persistentes** | Criar, salvar, comparar múltiplos cenários com nome (ex: "Com filho", "Burnout 2030") | Médio — hoje requer reabrir e ajustar presets |
| F6 | **Surviving spouse analysis** | Projeção do plano se Diego falecer em X — renda de Katia, INSS, PGBL | Médio — dado casamento iminente |
| F7 | **Long-term care modeling** | Custo de cuidados de longo prazo (enfermidade grave, asilos) com fases e inflator | Médio — horizonte até ~90 anos torna isso relevante |
| F8 | **Roth/PGBL conversion explorer** | Para Katia: otimizar contribuições PGBL vs Renda Fixa taxada vs PGBL pós-aposentadoria | Baixo/Médio — Katia tem PGBL ativo |
| F9 | **Debt Explorer** | Análise e estratégia de pagamento da hipoteca (SAC R$453k) — avalanche/snowball | Baixo — mas hipoteca aparece só como passivo, não como estratégia |
| F10 | **Housing / Real Estate income** | Projeção de renda de aluguel, venda do imóvel, reverse mortgage equivalente | Baixo — terreno Nova Odessa e eventual upgrade de imóvel |

#### 3d. O que temos mas PIOR que o Boldin

| # | O que temos | Como o Boldin faz melhor |
|---|---|---|
| D1 | **Financial Wellness Score** | Boldin tem 12–25 métricas com cores semáforo, customizável, integrado ao plano completo. Nosso score é 10 métricas fixas, desconectado do plano holístico. |
| D2 | **Projeção de patrimônio (fan chart)** | Boldin tem projeção por conta individual + agregado + drill-down por ano. Nosso fan chart é P10/P50/P90 sem breakdowns por conta. |
| D3 | **Renda na aposentadoria** | Boldin tem Lifetime Income Projection Chart com barras empilhadas por fonte (trabalho, Social Security, drawdowns, renda passiva), overlay de despesas, hover por ano. Nossa tabela Go-Go/Slow-Go/No-Go é correta mas visualmente mais árida. |
| D4 | **Cenários What-If** | Boldin tem múltiplos cenários nomeados, comparáveis, com impact summary. Nosso What-If usa presets stress/base/fav — não é comparável com cenários ad-hoc. |
| D5 | **Spending Breakdown** | Boldin categoriza despesas com timeline e escalonamento. Nosso breakdown é snapshot (Essenciais/Discricionários/Imprevistos) sem projeção temporal. |

---

## Analise do Time (2026-04-17)

Participantes: FIRE, Dev, Advocate

---

### FIRE — Posições por gap

**F1 — Dois blocos em abas existentes (não nova aba):**
- Bloco 1 na NOW: cards horizontais (5 pilares + total R$7.86M). Entra após o hero strip, colapsado por default.
- Bloco 2 na FIRE: "Contribuição para o FIRE Number" — separa o que financia saques do que é contexto.
- Capital humano NÃO entra como ativo de retirada. Mostrar como "barra que decresce até 2040" (crossover lifecycle com portfolio crescendo).
- INSS já está no MC — exibir explicitamente "já incorporado no modelo" para evitar dupla contagem cognitiva.

**F2 — WITHDRAW, como distribuição (não determinístico):**
Dados de cashflow por ano projetado já existem no Monte Carlo. Surplus-Gap como P10/P50/P90 por ano complementa (não substitui) o GuardrailsChart.

**F4 — Manter nos 4 cards. Não promover a hero.**
Range de datas (2033-2038) é mais honesto que data pontual. O que pode ir ao hero: "14 anos para o FIRE Base" como dado, não estimativa.

**F6 — CRÍTICO. Prioridade fora do dashboard.**
O cenário de risco real é Diego falecer pré-FIRE: portfolio ~R$4M sem aportes, custo Katia R$160k/ano, SWR = 4% → borderline. Com seguro de vida R$2-3M: SWR cai para 2.3-2.7% → robusto. Seguro de vida é D0. Dashboard pode esperar.

**F7 — Gap real, parcialmente coberto.**
SAUDE_DECAY = 0.50 é premissa frágil. LTC intensivo (R$72-216k/ano) pode exceder o No-Go do modelo. Sensitivity test na retro anual.

---

### Dev — Viabilidade técnica

**F1:** 4 campos faltando no data.json (capital_humano_vp, imovel_equity, terreno, inss_vp). ~1h pipeline + 2h React = 3h total.

**F2:** Pode usar cálculo frontend com dados existentes (SpendingSmile × SWR × patrimônio mediano × INSS por ano). ~3-5h. Sem bloqueante de pipeline.

**D3 Lifetime Income upgrade:** Glide path já existe. Stacked bar por fonte requer breakdown proporcional por bucket. ~4-5h.

**F5 Cenários persistentes:** localStorage + Zustand persist, sem backend. ~5-6h.

**D1 Wellness expandido:** Debt ratio imediato (passivos/patrimônio já no JSON). Housing ratio precisa de parcela SAC mensal (falta no JSON). ~2-3h total.

**Sequência técnica recomendada:** F1 (pipeline first) → D1 Wellness (baixo esforço) → F2 (frontend calc) → D3 Lifetime Income → F5

---

### Advocate — Stress-test das prioridades

**F1 — Aprovado com salvaguardas obrigatórias:**
Risco de âncora cognitiva: capital humano apresentado com mesmo peso visual que portfolio cria falsa segurança.
Salvaguardas: (a) capital humano marcado "decai a zero em 2040", (b) disclaimer de iliquidez, (c) hierarquia visual explícita entre "ativos que financiam FIRE" vs "contexto".
Problema adicional: correlação positiva no stress — colapso do capital humano (doença/demissão) ocorre no mesmo cenário de queda do portfolio (recessão).

**F2 — Aprovado somente se distribuído (P10/P50/P90):**
Surplus-Gap determinístico para carteira 79% equity é enganoso — pressupõe rendimento anual previsível. Implementar como distribuição anual de surplus: genuinamente novo e útil. Implementar como linha única: menos útil que guardrails existentes.

**Revisões de prioridade propostas pelo Advocate:**

| Item | Proposto | Advocate | Razão |
|---|---|---|---|
| F5 cenários persistentes | Backlog | → **Alta** | Inflação persistente 6-8% (risco BR) não modelado. Cenários de stress com IPCA alto são necessários. |
| D1 Wellness expandido | Média | → **Alta** | Decomposição de risco necessária para não reagir ao número errado quando P(FIRE) cair. |
| F6 surviving spouse | Média dashboard | Dashboard espera; **seguro de vida D0** | Urgência real está fora do dashboard. |
| F7 LTC | "Não aplicável" | → **Reabrir** | Não é "não aplicável" — é "não modelado". Custo R$50-80k/mês em 2056. |
| D3 Lifetime Income | Média | → **Baixa** | UX puro, não muda decisões. Dev tem alto esforço. |

**Cenário de destruição identificado pelo Advocate:**
Diego vê P(FIRE)=90% em 2034, antecipa FIRE para 2035. O dashboard não mostra: (a) capital humano já decaiu 60%, (b) surplus negativo em 6 dos primeiros 10 anos por IPCA real +2pp acima do modelo (F5 ausente), (c) LTC de Katia em 2055 não modelado. P(FIRE)=90% tecnicamente correto com premissas do modelo — e as premissas estão erradas.

---

## Conclusao

Status: aguarda veredicto de Diego.

### Prioridades revisadas pelo time

**ALTA — implementar:**
- **F1**: Dois blocos (NOW + FIRE) com salvaguardas visuais. ~3h. Pipeline +4 campos.
- **F2**: Surplus-Gap Chart em WITHDRAW como distribuição P10/P50/P90. ~3-5h.
- **D1**: Wellness Score expandido (debt ratio + savings rate + housing ratio). ~2-3h.
- **F5**: Cenários persistentes (inflação BR persistente — risco não modelado). ~5-6h.

**MÉDIA — backlog:**
- **F4**: Hero "14 anos para o FIRE Base" (já calculado, apenas expor). ~1h.
- **F6**: Surviving spouse no dashboard (pós-casamento). Seguro de vida é D0 independente.
- **F7**: LTC — sensitivity test na retro anual. Reabrir modelagem do SAUDE_DECAY.

**BAIXA / depriorizados:**
- **D3 Lifetime Income upgrade**: UX puro, não muda decisões. Dev alto esforço. Adiar.
- **F4 hero**: Manter nos 4 cards por ora.

**Não aplicável ao contexto:**
- Social Security Explorer, Roth Conversion, 401k/RMD, HSA, 529

### Issues filhas propostas (aguarda aprovação Diego)
1. `HD-balanco-holistico` — F1: blocos de patrimônio total em NOW + FIRE
2. `HD-surplus-gap` — F2: chart de surplus/deficit por ano em WITHDRAW
3. `HD-wellness-expandido` — D1: métricas adicionais no Wellness Score
4. `HD-cenarios-persistentes` — F5: localStorage de cenários nomeados comparáveis
5. `HD-surviving-spouse` — F6: modelagem pós-casamento (gatilho: data do casamento)
6. `HD-ltc-modelagem` — F7: sensitivity test LTC no spending smile

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Nenhuma mudança de alocação |
| **Estrategia** | A ser definido pelo time |
| **Conhecimento** | Benchmark Boldin mapeado. Gaps priorizados. 10 gaps identificados em 4 categorias. |
| **Memoria** | A registrar após aprovação |
| **Nenhum** | — |

---

## Proximos Passos

- [ ] Time responder as 8 perguntas listadas na Conclusão
- [ ] Diego validar prioridades propostas
- [ ] Abrir issue filha para F1 (aba Patrimônio Total) se aprovado
- [ ] Abrir issue filha para F2 (Surplus-Gap) se aprovado
- [ ] Abrir issue filha para D3 (Lifetime Income Chart upgrade) se aprovado
- [ ] Registrar decisões finais na memória do Head e do Dev

---

## Referências

- Boldin (boldin.com) — software pesquisado
- Fontes: White Coat Investor review, Retire Before Dad review, Financial Samurai review, Boldin Help Center
- Dashboard código: `react-app/src/app/` (7 páginas lidas)
- Patrimônio total: `project_patrimonio_total.md` (memória)
