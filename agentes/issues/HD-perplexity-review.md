# HD-perplexity-review — Avaliação externa Perplexity Comet do dashboard

**Dono:** Head (triagem) → Dev + CIO + FIRE (execução)
**Prioridade:** 🟡 Média
**Origem:** Review externo Perplexity Comet, 2026-04-09

---

## Contexto

Perplexity Comet avaliou o dashboard como "muito acima da média" em planejamento. Abaixo os findings categorizados em: já temos, refinamento, e features novas.

---

## Já temos (validação externa)

- ✅ Visão executiva 1 tela (patrimônio, % FIRE, anos, savings rate, P(FIRE), macro)
- ✅ Cenários vida (solteiro/casado/filho) → P(FIRE)
- ✅ MC 10k + SWR ≤ 2.4%
- ✅ Gatilhos RF visuais (IPCA+ DCA ativo/pausado, Renda+ bandas)
- ✅ Macro contextual (não genérico)
- ✅ TER ponderado + alpha necessário
- ✅ Timeline escala log
- ✅ Financial Wellness Score

## Refinamentos sugeridos (já temos parcial)

| # | Sugestão | Status atual | Ação |
|---|----------|-------------|------|
| R1 | FIRE Number como range, não número fixo (ver detalhamento abaixo) | Simulador resolve "quando chego?" mas não "qual range de patrimônio preciso?" | Nova aba/visual: dado gasto + tolerância risco → range de patrimônio-alvo |
| R2 | Cone de incerteza visual (P10/P50/P90) | Fan chart existe mas sem P10/P90 de SWR na data FIRE | Adicionar P10/P50/P90 de patrimônio E SWR no fan chart |
| R3 | What-if aporte ↔ P(FIRE) | Tornado tem sensibilidade | Mini-simulador inline: "+R$5k/mês → +X pp P(FIRE)" |
| R4 | Macro → ação recomendada | Gatilhos RF fazem isso parcial | Micro-box "cenário atual → plano permanece / ajustar" |
| R5 | Feedback loop on-track/ahead/behind | Temos delta patrimônio vs plano | Semáforo: patrimônio vs trilha + aporte vs meta + risco vs faixa |

## Features novas (não temos)

| # | Sugestão | Valor | Complexidade |
|---|----------|-------|-------------|
| N1 | Drawdown histórico + cenários de crise (2008, COVID) em R$ | Alto — risco é o maior blind spot | Média — backtest já tem MaxDD, falta traduzir em R$ e cenários nomeados |
| N2 | Alocação por região + por fator (resumo estilo IC) | Alto — falta visão geográfica clara | Baixa — dados existem em factor_loadings |
| N3 | Runway detalhado (caixa + RF curta, timeline construção) | Médio — bond pool runway existe mas simplificado | Baixa |
| N4 | Lumpy events (imóvel, mudança país, sabático) com impacto P(FIRE) | Alto — life_events.json já existe parcial | Média — precisa MC condicional |
| N5 | IPS embutido (mini Investment Policy Statement) | Médio — carteira.md tem tudo, mas não está no dashboard | Baixa — renderizar carteira.md resumido |

---

## Detalhamento R1 — FIRE Number como range

O simulador FIRE já resolve muito bem:
- "Quando chego?" (variando aporte/retorno/gasto → ano FIRE)
- "O que acontece se...?" (sensibilidade via barras)
- FIRE@50 vs FIRE@53 com P(FIRE) base/fav/stress e P10/P50/P90

O que **ainda não temos** é a pergunta inversa: **"dado meu gasto e tolerância de risco, qual é o intervalo razoável de FIRE number?"**

Hoje o gatilho é fixo (R$13.4M) derivado de gasto R$250k + SWR 2.4%. Mas:
- Para SWR 2.0–3.0%, o patrimônio necessário varia de R$8.3M a R$12.5M
- Cada ponto de SWR tem uma probabilidade de sucesso diferente

**Feature proposta:** Visual dedicado (tabela ou heatmap) que mostre:
- Eixo X: SWR (2.0%, 2.2%, 2.4%, 2.6%, 2.8%, 3.0%)
- Eixo Y: Gasto anual (R$220k, R$250k, R$270k, R$300k)
- Célula: Patrimônio necessário + P(sucesso 30 anos)

Isso transforma o FIRE number de um ponto fixo em uma **superfície de decisão**.

Dados: MC já roda com diferentes spending. Pipeline gera a matriz. Dev renderiza.

---

## Priorização sugerida (Head)

**Sprint 1 (alto valor, baixa complexidade):**
- N2 — mapa região + fator
- N3 — runway detalhado
- N5 — IPS embutido
- R5 — semáforo on-track

**Sprint 2 (alto valor, média complexidade):**
- N1 — drawdown + cenários crise
- R1 — gatilho FIRE como distribuição
- R2 — cone P10/P50/P90

**Backlog:**
- R3 — what-if aporte (depende de MC client-side ou API)
- R4 — micro-box macro → ação
- N4 — lumpy events (depende de MC condicional)

---

## Regras
- CIO define o que mostrar. Dev define como. FIRE valida lógica MC.
- Nada hardcoded. Dados novos vão em data.json via pipeline.
- Cada item vira sub-issue própria quando entrar em Doing.
