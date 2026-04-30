# HD-visual-audit-playwright: Auditoria Visual Aba por Aba — Screenshots + Análise de Especialistas

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-visual-audit-playwright |
| **Dono** | Head |
| **Status** | Concluído |
| **Prioridade** | Alta |
| **Participantes** | Dev (Playwright), Factor, RF, FIRE, Risco, FX, Macro, Bookkeeper |
| **Criado em** | 2026-04-30 |
| **Origem** | Solicitação pós-auditoria de QA e Arquitetura |
| **Concluido em** | 2026-04-30 |

---

## Objetivo

Tirar screenshots de cada aba do dashboard com Playwright — expandindo todos os CollapsibleSections — e passar para os agentes especialistas analisarem o conteúdo buscando:
- Coisas que podem **melhorar** (clareza, completude, precisão)
- Coisas que **faltam** (dados relevantes não exibidos)
- Coisas que podem ser **alteradas** (layout, priorização, framing)

---

## Abas a auditar

| Aba | Rota | Agentes |
|-----|------|---------|
| NOW (Dashboard) | `/` | Head, Bookkeeper, Factor, FIRE |
| Portfolio | `/portfolio` | Factor, FX, Tax |
| Performance | `/performance` | Factor, Quant |
| FIRE | `/fire` | FIRE, RF, Risco |
| Withdraw | `/withdraw` | FIRE, RF |
| Simulators | `/simulators` | FIRE, Risco |
| Backtest | `/backtest` | Factor, Quant |

---

## Protocolo de Execução

### Fase 1 — Screenshots (Dev/Playwright) ✅
1. Navegar para cada aba
2. Clicar em todos os `<CollapsibleSection>` fechados para expandir
3. Aguardar render completo (sem privacyMode)
4. Full-page screenshot salvo em `/tmp/audit-screenshots/{aba}.png`

### Fase 2 — Análise (Especialistas em paralelo) ✅
Cada agente especialista recebe as screenshots relevantes e responde com findings estruturados:
- **Melhoria**: o que poderia ser aprimorado
- **Falta**: dado/métrica/visualização que deveria estar mas não está
- **Alteração**: algo presente que deveria ser diferente (layout, label, cálculo)

### Fase 3 — Síntese (Head) ✅
Consolidar todos os findings em relatório único com priorização.

---

## Findings — Fase 2 (Raw por agente)

### NOW tab — Factor (10 findings)
1. [FALTA] DecisaoDoMes: banner sem contexto fatorial (SWRD = market neutral)
2. [FALTA] Sem semáforo de factor drought no NOW
3. [ALTERAÇÃO] E[R] column mostra retornos em USD, não BRL
4. [ALTERAÇÃO] RebalancingStatus: equity targets usam pesos relativos como absolutos
5. [FALTA] Sem factor loadings consolidados do portfolio no NOW
6. [MELHORIA] IPS Summary: "Equity alvo" mostra 100% em vez de 79%
7. [FALTA] AVEM AUM alert ausente (atualmente ~€130M, abaixo do comfort threshold €300M)
8. [MELHORIA] ETFFactorComposition: colapsa RMW+CMA em "Quality" — perde granularidade
9. [ALTERAÇÃO] RebalancingStatus: gera ação "Vender" — viola regra no-sell da IPS
10. [FALTA] AVGS YTD excess return (+10.8pp) ausente do NOW

### NOW tab — FIRE (10 findings)
11. [ALTERAÇÃO] TimeToFireProgressBar: idade hardcoded como literal 39
12. [FALTA] KpiHero mostra apenas P(FIRE) base, sem 3 cenários
13. [FALTA] Cenário casal P(FIRE casal) ausente do NOW
14. [ALTERAÇÃO] Barras de progresso de patrimônio duplicadas
15. [FALTA] Guardrail bands não visíveis de forma proeminente no NOW
16. [MELHORIA] P(quality) sem interpretação de threshold (o que é "bom"?)
17. [FALTA] Capital humano Katia floor não visível no NOW
18. [MELHORIA] Sem projeção de FIRE date aspiracional por SWR
19. [ALTERAÇÃO] IPS Summary sem R$8.33M gatilho de patrimônio explícito
20. [MELHORIA] Ordem da seção de risk profile cria hierarquia confusa

### Portfolio tab — Factor (10 findings)
21. [FALTA] Factor Value Spread: falta percentil RMW
22. [FALTA] Factor Drought Counter não monitora AVEM
23. [ALTERAÇÃO] Drift labels não esclarecem escopo "intra-equity"
24. [MELHORIA] ETFRegionComposition default em SWRD, deveria ser AVGS (mais diferenciado)
25. [FALTA] TER por ETF ausente da HoldingsTable
26. [FALTA] Sem widgets de loading SMB/HML/RMW com thresholds
27. [ALTERAÇÃO] Risk Contribution: volatilidade 19% hardcoded para AVGS (não vem do dado)
28. [FALTA] Sem painel de dilution progress (transitório JPGL → target)
29. [MELHORIA] Factor drought counter usa aproximação imprecisa vs valor do pipeline
30. [FALTA] AUM do AVGS/AVEM invisível na aba Portfolio

### Performance tab — Factor/Quant (9 findings)
31. [FALTA] AlphaVsSWRDChart: fallback values hardcoded quando dado ausente
32. [ALTERAÇÃO] Annualização do alpha: fórmula incorreta (divisão simples, não geométrica)
33. [ALTERAÇÃO] "Premissas vs Realizado": período de benchmark curto demais para significância estatística
34. [MELHORIA] Alpha cards sem Tracking Error / Information Ratio
35. [FALTA] Rolling 12m chart sem linha de referência +5pp (target de alpha)
36. [MELHORIA] Tabela anual tem VWRA mas falta coluna SWRD
37. [ALTERAÇÃO] Fee Analysis: usa literal 0.0016 em vez de `haircut_alpha_liquido` dinâmico
38. [FALTA] ETFFactorComposition sem SWRD como referência baseline
39. [MELHORIA] Expected Return Waterfall collapsed por default — deveria estar aberto

### FIRE tab — FIRE (10 findings)
40. [ALTERAÇÃO] Hero banner "P(FIRE 2040)": label com ano hardcoded
41. [ALTERAÇÃO] CoastFireCard: aporte hardcoded R$300k/ano
42. [MELHORIA] SequenceOfReturnsRisk: guardrail values hardcoded em vez de vir do config
43. [FALTA] Spending smile ausente da aba FIRE
44. [FALTA] Distribuição subjetiva de FIRE date ausente
45. [MELHORIA] FireSpectrumWidget: diegoTarget hardcoded 10_000_000
46. [MELHORIA] Bond Pool Status: falta valor projetado em R$ no Dia FIRE
47. [FALTA] Sensitivity tornado não proeminente (enterrado ou ausente)
48. [ALTERAÇÃO] Renda Floor Katia: usa proxy errado (aspiracional em vez de casal by_profile)
49. [MELHORIA] Hero banner sem patrimônio atual para contexto

### Withdraw/Simulators/Backtest — RF/FIRE (15 findings)
50. [WITHDRAW][FALTA] Bond pool progress (atual vs meta) ausente
51. [WITHDRAW][FALTA] Bond pool: valor projetado em R$ no Dia FIRE ausente
52. [WITHDRAW][ALTERAÇÃO] Piso desatualizado: R$180k → deveria ser R$184k (pós-recalibração)
53. [WITHDRAW][MELHORIA] Cortes de guardrail sem especificar categoria de origem
54. [WITHDRAW][MELHORIA] Draw sequence (bond pool primeiro, depois equity) não visível
55. [SIMULATORS][FALTA] Sem slider de sensibilidade de taxa IPCA+
56. [SIMULATORS][ALTERAÇÃO] Renda+ 2065 DCA mostra PAUSADO quando taxa > 6.5% (deveria ser DCA Ativo)
57. [SIMULATORS][MELHORIA] FIRE simulator: RF return não ajustável pelo usuário
58. [SIMULATORS][FALTA] Sem What-If para realocação Renda+→IPCA+ de longo prazo
59. [SIMULATORS][MELHORIA] Cascata não mostra taxa atual vs piso por instrumento
60. [BACKTEST][FALTA] Sem backtest com bond tent portfolio blended
61. [BACKTEST][MELHORIA] Drawdown chart não destaca janelas SoRR-relevantes (primeiros 5 anos FIRE)
62. [BACKTEST][FALTA] Gráfico histórico de yield real IPCA+ ausente
63. [BACKTEST][ALTERAÇÃO] UCITS warning pode ser falso positivo para AVGS (estrutura diferente do SWRD)
64. [BACKTEST][MELHORIA] Shadow portfolio sem decomposição de atribuição RF

---

## Findings — Fase 3 (Síntese Head — Priorização)

**Total: 64 findings. Classificados em P0 (bugs/violações), P1 (info crítica faltando), P2 (melhorias).**

---

### P0 — Bugs / Violações de Regra / Dados Incorretos (11 itens)

> Requerem correção antes de qualquer novo desenvolvimento. Alguns são silenciosos — passam despercebidos no dia a dia.

| # | Aba | Finding | Impacto |
|---|-----|---------|---------|
| 1 | NOW | RebalancingStatus gera ação "Vender" — viola regra no-sell da IPS | Dashboard pode sugerir ação proibida pela estratégia |
| 2 | NOW | E[R] column em USD não BRL — compara laranjas com maçãs vs patrimônio em BRL | Decisão de alocação com moeda errada |
| 3 | NOW | RebalancingStatus: equity targets usam pesos relativos como absolutos | Gaps de rebalanceamento calculados errado |
| 4 | NOW | TimeToFireProgressBar: idade literal 39 hardcoded | Quebra no aniversário / ano que vem |
| 5 | FIRE | Hero "P(FIRE 2040)": ano hardcoded (deveria ser dinâmico) | Será 2041 em breve |
| 6 | FIRE | CoastFireCard: aporte R$300k/ano hardcoded | Não reflete realidade atual |
| 7 | FIRE | Renda Floor Katia: proxy aspiracional em vez de `by_profile casal` | Sub-estima piso de renda para cenário casal |
| 8 | WITHDRAW | Piso desatualizado: R$180k → R$184k | Meta de RF desatualizada visível na tela |
| 9 | SIMULATORS | Renda+ DCA: PAUSADO quando taxa > 6.5% (gatilho está ativo) | Contradiz a regra de DCA |
| 10 | PERF | Alpha annualização: divisão simples em vez de geométrica | Alpha reportado ligeiramente inflado para períodos > 1 ano |
| 11 | PERF | Fee Analysis: literal 0.0016 em vez de `haircut_alpha_liquido` dinâmico | Análise de custo desconectada do pipeline |

---

### P1 — Informação Crítica Faltando (13 itens)

> Dados que existem no pipeline mas não aparecem no dashboard — impactam decisões de alocação.

| # | Aba | Finding | Por que importa |
|---|-----|---------|----------------|
| 1 | NOW | AVEM AUM alert: €130M, abaixo de €300M comfort threshold | Risco de encerramento do ETF — critério de saída |
| 2 | NOW | AVGS YTD +10.8pp excess return ausente | Performance diferenciada — valida tese fatorial |
| 3 | NOW | P(FIRE) apenas base, sem 3 cenários (solteiro/casal/atual) | Esconde incerteza real do planejamento |
| 4 | FIRE | Spending smile ausente | Feature de lifecycle spending — relevante para projeção pós-50 |
| 5 | FIRE | Sensitivity tornado não proeminente | Principal ferramenta de stress — enterrada |
| 6 | FIRE | Bond Pool: valor projetado R$ no Dia FIRE ausente | Peça central da estratégia de desacumulação |
| 7 | WITHDRAW | Bond pool progress (atual vs meta) ausente | Progresso do colchão — monitoramento contínuo |
| 8 | PERF | AlphaVsSWRDChart: fallback hardcoded quando dado ausente | Pode mostrar número errado silenciosamente |
| 9 | BACKTEST | Gráfico histórico yield real IPCA+ ausente | Contexto de quando comprar vs esperar |
| 10 | PORTFOLIO | TER por ETF ausente da HoldingsTable | Custo por posição não visível |
| 11 | PORTFOLIO | AUM AVGS/AVEM invisível na aba Portfolio | Mesmo risco do item 1 — sem visibilidade aqui |
| 12 | SIMULATORS | Sem slider de sensibilidade de taxa IPCA+ | Cenário principal não simulável interativamente |
| 13 | NOW | Guardrail bands não visíveis no NOW | Faixas de segurança do withdrawal ausentes da tela principal |

---

### P2 — Melhorias de Clareza e Completude (40 itens)

> Nenhum quebra decisão, mas acumulados degradam a qualidade analítica do dashboard.

**Grupo A — Labels/Framing errado (mas não dado errado)**
- [NOW] IPS Summary: "Equity alvo" 100% em vez de 79% (intra-equity)
- [NOW] ETFFactorComposition: colapsa RMW+CMA em "Quality" — perde granularidade
- [PORTFOLIO] Drift labels sem clareza "intra-equity" vs "total portfolio"
- [BACKTEST] UCITS warning pode ser falso positivo para AVGS (diferente do SWRD)
- [FIRE] FireSpectrumWidget: diegoTarget 10M hardcoded
- [FIRE] SoRR guardrail values hardcoded em vez do config
- [FIRE] Barras de progresso de patrimônio duplicadas
- [FIRE] Hero banner sem patrimônio atual para contexto

**Grupo B — Faltando métricas analíticas**
- [PERF] Alpha cards sem Tracking Error / Information Ratio
- [PERF] Rolling 12m chart sem linha +5pp de referência
- [PERF] Tabela anual tem VWRA mas falta SWRD
- [PERF] "Premissas vs Realizado" benchmark period curto demais para significância
- [PORTFOLIO] Factor Value Spread: falta percentil RMW
- [PORTFOLIO] Sem widgets de loading SMB/HML/RMW com thresholds
- [PORTFOLIO] Factor drought counter usa aproximação vs valor do pipeline
- [PORTFOLIO] Factor drought counter não monitora AVEM
- [BACKTEST] Sem backtest com bond tent portfolio
- [BACKTEST] Drawdown chart não destaca janelas SoRR (primeiros 5 anos FIRE)
- [BACKTEST] Shadow portfolio sem decomposição RF attribution
- [SIMULATORS] FIRE simulator RF return não ajustável
- [SIMULATORS] Sem What-If Renda+→IPCA+ realocação
- [SIMULATORS] Cascata não mostra taxa atual vs piso

**Grupo C — UX / Ordem / Visibilidade**
- [PERF] Expected Return Waterfall collapsed por default
- [PORTFOLIO] ETFRegionComposition default em SWRD → deveria ser AVGS
- [PORTFOLIO] Sem painel de dilution progress (transitório)
- [NOW] Sem semáforo de factor drought no NOW
- [NOW] Sem factor loadings consolidados no NOW
- [NOW] DecisaoDoMes sem contexto fatorial
- [FIRE] P(quality) sem interpretação de threshold
- [FIRE] Capital humano Katia floor não visível no NOW
- [FIRE] Cenário casal P(FIRE casal) ausente do NOW
- [FIRE] Ordem da seção de risk profile cria hierarquia confusa
- [FIRE] IPS Summary sem R$8.33M gatilho de patrimônio explícito
- [FIRE] Sem projeção de FIRE date aspiracional por SWR
- [FIRE] Sem distribuição subjetiva de FIRE date
- [WITHDRAW] Cortes de guardrail sem especificar categoria de origem
- [WITHDRAW] Draw sequence (bond pool → equity) não visível

---

## Conclusão — Head

### Execução

As 3 fases da auditoria foram executadas em 2026-04-30:
- **Fase 1**: Playwright `visual-audit-full.spec.ts` — 7 screenshots com `expandAll` (todos os CollapsibleSections abertos)
- **Fase 2**: 6 agentes (Factor, FIRE, RF) analisaram NOW/Portfolio/Performance/FIRE/Withdraw/Simulators/Backtest em paralelo
- **Fase 3**: 64 findings sintetizados e priorizados em P0/P1/P2

### Próximos Passos Recomendados

1. **Abrir issues individuais para P0** — cada um é um bug com fix direto
2. **Abrir issues P1 de maior ROI** — AVEM AUM alert e Bond Pool projected value são os mais estratégicos
3. **P2** → backlog, atacar por grupo quando houver sprint focado em polish

### Issues a criar (P0 prioritário)

| ID Sugerido | Título |
|-------------|--------|
| FR-rebalancing-no-sell-fix | RebalancingStatus gera "Vender" em carteira sem sell rule |
| FR-er-column-brl | E[R] column: converter de USD para BRL |
| FR-equity-targets-fix | RebalancingStatus: equity targets relativos x absolutos |
| FR-age-hardcoded-fix | TimeToFireProgressBar + hero FIRE: remover literals de idade/ano |
| FR-coastfire-hardcoded | CoastFireCard: R$300k/ano hardcoded |
| FR-renda-floor-proxy | Renda Floor Katia: trocar proxy aspiracional por by_profile casal |
| FR-piso-180-184 | Piso RF desatualizado: R$180k → R$184k |
| FR-dca-renda-status | Renda+ DCA: PAUSADO quando deveria ser Ativo |
| FR-alpha-annualization | Alpha: fórmula de anualização geométrica |
| FR-fee-analysis-dynamic | Fee Analysis: substituir 0.0016 literal por haircut dinâmico |
