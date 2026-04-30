# FR-audit-p1-missing: P1 Informação Crítica Faltando — Auditoria Visual Playwright 2026-04-30

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-audit-p1-missing |
| **Dono** | Dev + especialistas |
| **Status** | Fechada ✅ 2026-04-30 |
| **Prioridade** | 🟠 P1 — Informação Crítica Faltando |
| **Criado em** | 2026-04-30 |
| **Origem** | HD-visual-audit-playwright — Fase 3 (síntese) |
| **Screenshots** | `agentes/issues/screenshots/visual-audit-2026-04-30/` |

---

## Contexto

13 gaps de informação identificados na auditoria visual de 2026-04-30. Os dados em sua maioria **já existem no pipeline** mas não aparecem no dashboard — impactam decisões de alocação e monitoramento de risco.

Screenshots de referência:

![NOW tab](screenshots/visual-audit-2026-04-30/now.png)
![Portfolio tab](screenshots/visual-audit-2026-04-30/portfolio.png)
![FIRE tab](screenshots/visual-audit-2026-04-30/fire.png)
![Withdraw tab](screenshots/visual-audit-2026-04-30/withdraw.png)
![Simulators tab](screenshots/visual-audit-2026-04-30/simulators.png)
![Backtest tab](screenshots/visual-audit-2026-04-30/backtest.png)
![Performance tab](screenshots/visual-audit-2026-04-30/performance.png)

---

## Gaps

### G1 — AVEM AUM alert: €130M abaixo do comfort threshold €300M

**Aba:** NOW + Portfolio  
**Urgência:** Alta — critério de saída do ETF não monitorado visualmente  
**Dados disponíveis:** AUM do AVEM é rastreável via yfinance/pipeline

**Contexto:** AVEM (Avantis Emerging Markets) tem AUM atual de ~€130M. O comfort threshold da IPS é €300M para ETFs UCITS small-cap. Abaixo de €300M há risco real de encerramento do ETF ou spread widening significativo. Este é um critério de **gatilho de saída** que não aparece em nenhuma aba do dashboard.

**O que falta:**
- Badge/alert semafórico no NOW tab: `AVEM AUM: €130M ⚠️ (threshold: €300M)`
- Widget ou linha na aba Portfolio com AUM por ETF + threshold
- Cálculo automático: se AUM < €150M → vermelho (watchlist); €150M–€300M → amarelo; >€300M → verde

**Dados necessários no pipeline:** `market_data.py --etfs` deve já retornar AUM via yfinance. Verificar se está sendo salvo em `data.json`. Campo esperado: `etf_info.AVEM.aum_eur` (ou similar).

**Spec:** Dev deve alinhar com Factor antes de implementar threshold exato e critério de escalation.

---

### G2 — AVGS YTD excess return +10.8pp ausente do NOW

**Aba:** NOW  
**Urgência:** Média-Alta — validação da tese fatorial mais forte do portfolio  
**Dados disponíveis:** Retorno histórico AVGS vs SWRD calculado no pipeline

**Contexto:** AVGS tem outperformance YTD de +10.8pp vs SWRD em 2026. Isso valida a tese de factor tilt e é informação motivacional e analítica relevante. Não aparece em nenhum lugar do dashboard NOW — o usuário precisa ir em Performance para ver.

**O que falta:** Card ou linha em NOW com "AVGS vs SWRD YTD: +10.8pp" — contexto rápido para decisão de aporte.

**Dados necessários:** Retorno YTD por ETF já calculado no pipeline (ou calculável via preços históricos).

---

### G3 — P(FIRE) apenas cenário base — 3 cenários ausentes do NOW

**Aba:** NOW (KpiHero)  
**Urgência:** Média-Alta — esconde incerteza real do planejamento FIRE  
**Dados disponíveis:** `pfire_base.base`, `pfire_base.fav`, `pfire_base.stress` + `pfire_by_profile.casado` já em data.json

**Contexto:** O KpiHero mostra apenas o P(FIRE) base (ex: 83.7%). Os cenários favorável, stress e casal existem no pipeline mas não aparecem no NOW. A variação entre cenários (ex: base 83.7% / casal 68% / aspiracional 91.1%) é a informação mais importante para calibrar a confiança no plano.

**O que falta:**
- Linha de contexto abaixo do número principal: `fav: XX% · stress: YY%`
- Ou badge expandível com os 3 cenários
- P(FIRE casal) como dado especial (muda o número dramaticamente)

---

### G4 — Spending smile ausente da aba FIRE

**Aba:** FIRE  
**Urgência:** Média — relevante para projeção de gastos em desacumulação  
**Contexto:** O lifecycle spending (spending smile) modela que gastos diminuem durante a fase "go-go" (65-75), caem na fase "slow-go" (75-85) e podem subir na fase "no-go" por custos de saúde. É feature de planejamento de desacumulação — ausente do dashboard.

**O que falta:** Gráfico de gastos por fase (go-go/slow-go/no-go) com curva esperada de Diego. Pode ser simples (3 barras de fase com gasto médio) ou elaborado (curva suavizada por ano de aposentadoria).

**Dados necessários:** Modelo já existe no pipeline MC (saúde inelástica separada, spending_ceiling). Spec completo precisa do agente FIRE.

---

### G5 — Sensitivity tornado não proeminente na aba FIRE

**Aba:** FIRE  
**Urgência:** Média — principal ferramenta de stress do plano está enterrada  
**Dados disponíveis:** `pfire_sensitivity` em data.json (calculado no HD-dashboard-gaps-tier2)

**Contexto:** O tornado de sensibilidade mostra quais variáveis mais impactam o P(FIRE): retorno esperado, gasto, taxa de aporte, data de FIRE, etc. É a ferramenta mais importante para responder "o que mais preciso acertar para garantir o plano?" — mas está em CollapsibleSection fechada por default ou pouco visível.

**O que falta:** Colocar o tornado de sensibilidade `defaultOpen={true}` ou promovê-lo para posição mais alta na hierarquia da aba FIRE.

---

### G6 — Bond Pool Status: valor projetado em R$ no Dia FIRE ausente

**Aba:** FIRE + Withdraw  
**Urgência:** Alta — peça central da estratégia de desacumulação  
**Dados disponíveis:** `bond_pool` já em data.json (implementado em HD-dashboard-gaps-tier2)

**Contexto:** O Bond Pool (IPCA+2040 + 2050) deve atingir R$416k no Dia FIRE para cobrir 6 anos de gastos (bucket strategy). O status atual (R$Xk de R$416k) aparece, mas o valor **projetado** no Dia FIRE (com aportes DCA + juros) não está visível. É a resposta para "chego lá a tempo?"

**O que falta:** No Bond Pool Status widget: linha adicional "Projeção no FIRE Day: R$XXXk (XX% da meta)" — calculável com os aportes DCA planejados e taxa atual.

**Dados necessários:** Pipeline precisa calcular projeção do bond pool com aportes futuros. Spec para agente RF.

---

### G7 — Bond pool progress (atual vs meta) ausente da aba Withdraw

**Aba:** Withdraw  
**Urgência:** Alta — monitoramento contínuo do colchão de desacumulação  
**Dados disponíveis:** `bond_pool.total_brl` e `bond_pool.meta_brl` em data.json

**Contexto:** A aba Withdraw foca em guardrails e draw sequence mas não mostra o status atual do bond pool (quanto já foi acumulado vs meta R$416k). Isso é o KPI mais importante de monitoramento de RF.

**O que falta:** Card ou barra de progresso no topo da aba Withdraw: `Bond Pool: R$Xk / R$416k (XX%)`.

---

### G8 — AlphaVsSWRDChart: fallback values hardcoded

**Aba:** Performance  
**Arquivo:** `react-app/src/components/dashboard/AlphaVsSWRDChart.tsx`  
**Urgência:** Média — pode mostrar número errado silenciosamente

**Contexto:** O gráfico de Alpha vs SWRD tem fallback values hardcoded para quando o dado do pipeline está ausente. O problema é que fallbacks podem ser confundidos com dados reais — não há indicação visual de que o dado está faltando.

**O que falta:**
1. Identificar os fallback values no componente
2. Quando dado ausente: mostrar estado de "dado indisponível" em vez de fallback silencioso
3. Adicionar assertion no pipeline (`generate_data.py`) para bloquear se o campo for nulo

---

### G9 — Gráfico histórico de yield real IPCA+ ausente do Backtest

**Aba:** Backtest  
**Urgência:** Média — contexto para decidir quando comprar IPCA+ no DCA  
**Dados disponíveis:** Histórico de taxas IPCA+ disponível via ANBIMA/pyield

**Contexto:** O dashboard não mostra a série histórica de yields do IPCA+ (ex: IPCA+2040 de 2020 a 2026). Esse gráfico seria o contexto analítico para as decisões DCA: "a taxa atual de 6.2% é alta ou baixa historicamente?"

**O que falta:** Gráfico de linha com yield real IPCA+2040 (e opcionalmente 2050) de 2020 até hoje, com destaque para períodos de compra (quando ativo no DCA) e linha horizontal no piso de gatilho (6.0%).

**Dados necessários:** `market_data.py --tesouro` deve ter histórico. Verificar se pipeline já salva série histórica.

---

### G10 — TER (custo total) por ETF ausente da HoldingsTable

**Aba:** Portfolio  
**Urgência:** Média — custo de carregamento não visível por posição  
**Dados disponíveis:** TER conhecido: SWRD 0.12%, AVGS 0.25%, AVEM 0.25% (dados públicos dos ETFs)

**Contexto:** A HoldingsTable mostra posição, preço, valor — mas não o TER anual. Com posição de R$3.5M em equity, a diferença de TER (ex: SWRD 0.12% vs AVEM 0.25%) é material. É uma das métricas que o agente Factor monitora.

**O que falta:** Coluna "TER" na HoldingsTable com TER por ETF. Dado pode ser hardcoded no componente (TER é estático, mudanças são raras) ou vir de `data.json` como `etf_info.{ticker}.ter`.

---

### G11 — AUM do AVGS/AVEM invisível na aba Portfolio

**Aba:** Portfolio  
**Urgência:** Alta (mesma urgência que G1)  
**Ver G1 para contexto completo.**

**O que falta:** Coluna ou widget na aba Portfolio com AUM de AVGS e AVEM em EUR + semáforo vs threshold. Complementa o alert do NOW (G1) com contexto mais detalhado.

---

### G12 — Slider de sensibilidade de taxa IPCA+ ausente dos Simulators

**Aba:** Simulators  
**Urgência:** Média — cenário mais relevante não simulável interativamente  
**Contexto:** Os simulators permitem ajustar retorno de equity, gasto, data de FIRE — mas não a taxa do IPCA+ que compõe o RF floor. A taxa IPCA+ impacta: (a) valor de face dos títulos (MTM), (b) retorno real da RF no MC. É o parâmetro com mais variância atualmente.

**O que falta:** Slider "Taxa IPCA+ (%)" nos simulators com range 4.0%–8.0% e impacto em P(FIRE) + valor do bond pool.

---

### G13 — Guardrail bands não visíveis de forma proeminente no NOW

**Aba:** NOW  
**Urgência:** Média  
**Contexto:** As guardrail bands (verde/amarelo/vermelho de withdrawal rate) são visíveis na aba Withdraw, mas não no NOW. O usuário que olha o dashboard principal não sabe em que zona de segurança está.

**O que falta:** Mini-indicador no NOW mostrando zona atual (ex: "Zona Verde — SWR 2.1% (limite: 3.0%)") ou semáforo de withdrawal rate visível no KpiHero ou na seção de patrimônio.

---

## Checklist de Execução

- [x] G1+G11 — AUM alert AVEM/AVGS: pipeline (etf_composition.etfs.{ticker}.aum_eur/status) + NOW alert strip + Portfolio TER+AUM column ✅ 2026-04-30
- [x] G2 — AVGS YTD excess: factor_signal strip no NOW (+15.8% vs SWRD, excess +10.8pp) ✅ 2026-04-30
- [x] G3 — P(FIRE) 3 cenários: KpiHero 4º card com fav: 91.1% · stress: 78.7% abaixo do base ✅ 2026-04-30
- [~] G4 — Spending smile: SKIP — aguarda spec do agente FIRE
- [x] G5 — Sensitivity tornado defaultOpen=true na aba FIRE ✅ 2026-04-30
- [x] G6 — Bond pool FIRE Day projection: "Projeção 2040: R$898k / R$1.72M (52%)" na aba Withdraw ✅ 2026-04-30
- [x] G7 — Bond pool progress: card topo da aba Withdraw com barra de progresso (7.1%) ✅ 2026-04-30
- [x] G8 — AlphaVsSWRDChart: indicador de fallback quando dados históricos indisponíveis ✅ 2026-04-30
- [x] G9 — Histórico yield IPCA+2040: 76 pontos (Jan 2020 – Abr 2026) via pyield ANBIMA + ECharts no Backtest ✅ 2026-04-30
- [x] G10 — TER por ETF: pipeline + coluna TER na HoldingsTable (SWRD 0.12%, AVGS 0.39%, AVEM 0.35%) ✅ 2026-04-30
- [x] G11 — AUM Portfolio: coluna AUM na HoldingsTable (via mesmo pipeline de G1) ✅ 2026-04-30
- [x] G12 — Slider IPCA+ nos Simulators: slider 4.0–8.0% com impacto estimado em P(FIRE) ✅ 2026-04-30
- [x] G13 — Guardrail zone no NOW: strip "Zona Amarela · SWR P50 2.18%" visível no KpiHero ✅ 2026-04-30
