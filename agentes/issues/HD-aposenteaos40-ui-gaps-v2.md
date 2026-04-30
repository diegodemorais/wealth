# HD-aposenteaos40-ui-gaps-v2: Análise do Dashboard aposenteaos40.org (screenshot 2026-04-30)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-aposenteaos40-ui-gaps-v2 |
| **Dono** | Head |
| **Status** | Concluído (Gaps 1+2) |
| **Prioridade** | 🟡 Média |
| **Criado em** | 2026-04-30 |
| **Origem** | Screenshot do dashboard aposenteaos40.org enviado por Diego |
| **Relacionado** | HD-benchmark-aposenteaos40 (benchmark anterior, 2026-04-30) |

---

## Contexto

Diego enviou screenshot do dashboard aposenteaos40.org para avaliar o que há de útil. Esta issue analisa o que aparece no screenshot (dashboard principal, aba `/`) e identifica gaps acionáveis para o dashboard da carteira de Diego.

O benchmark anterior (HD-benchmark-aposenteaos40) já mapeou as 7 ferramentas do site. Esta issue foca no **layout e features da tela principal** visíveis no screenshot.

---

## O que está no screenshot

### KPI Cards (grid superior)
| Card | Valor | Observação |
|------|-------|------------|
| Gasto médio mensal | R$20.000 | Diferente de Diego (R$20.833) |
| Renda média mensal | R$45.000 | Gap mensal = R$25k (aporte) |
| Saque possível hoje (TSR 4.00) | R$11.667 | = R$3.5M × 4% / 12 |
| Patrimônio líquido | R$3.500.000 | Similar a Diego (~R$3.47M) |
| Necessário para FIRE | R$6.000.000 | = 300x de R$20k/mês |
| Progresso meta FIRE | 58.3% | Meta 300x, 175x acumulado |
| Taxa média de poupança | 55.6% | Destaque em "ROTA FIRE" |
| Meta pessoal | R$1.000.000 | Número personalizado separado da meta FIRE |
| ETA para FIRE (TSR 4.00) | **±4,4 anos (-Oct/2030)** | **Data específica com mês e ano** |
| Coast FIRE aos 52 | R$2.893.875 | 13 anos em coast, retorno 5.77% |

### Seção de Gráficos
- Tabs: **Receita x Despesa | Patrimônio | Fluxo de Caixa | Marcos FIRE**
- Gráfico principal: linha temporal com renda vs gastos

### Termômetro FIRE (coluna central)
- Visualização vertical com bandas (Lean FIRE, meta pessoal, posição atual)
- Termômetro preenchido até posição atual (~50% visual)
- Muito compacto e intuitivo

### Alertas e Dicas (coluna direita)
- Comparação anônima com outros usuários ("10pp acima da média")
- Regra dos 72 calculada automaticamente ("patrimônio dobra em 7.2 anos a 5.77%")
- Referência ao livro "O Milionário mora ao lado"
- Comparação com benchmark por faixa etária/renda

### Seção inferior
- **"A Sua Vida"**: heatmap de expectativa de vida por décadas (grade de anos vividos e a viver)
- **Projeção de Patrimônio 30 anos**: fan chart com banda de confiança (4.27%–7.27% retorno real)

---

## Análise: O que é útil para Diego

### ✅ Gap 1 — ETA com data específica (mês/ano)

**O que eles fazem:** "±4,4 anos (-Oct/2030)" — exibe mês e ano projetados, não só "~4 anos".

**Status no dashboard de Diego:** Exibimos anos aproximados ("~14 anos para FIRE" ou similar). Não mostramos o mês projetado.

**Avaliação:** Alta utilidade. "-Out/2040" como output concreto é mais acionável e motivacional que um número abstrato. Permite rastrear mês a mês.

**Complexidade:** Baixa — dado já calculado no pipeline, basta formatar com mês.

---

### ✅ Gap 2 — Taxa de Poupança como KPI de destaque

**O que eles fazem:** Exibem "55.6%" com badge "ROTA FIRE" e barra de progresso para meta mínima de 30%.

**Status no dashboard de Diego:** Taxa de poupança pode estar calculada mas não aparece como KPI primário na aba /now ou /fire.

**Avaliação:** Média utilidade. Diego conhece seu aporte mensal, mas ter a taxa de poupança em percentual é útil para comparar ao longo do tempo e calibrar o modelo FIRE. É uma métrica de comportamento, não de resultado.

**Complexidade:** Baixa se já calculado no pipeline.

---

### ✅ Gap 3 — Fan Chart na Projeção de Patrimônio

**O que eles fazem:** Projeção de patrimônio 30 anos com banda visual de confiança (cone), não só linha central.

**Status no dashboard de Diego:** Na aba /fire temos o Monte Carlo full, mas a visualização de projeção com banda pode não estar disponível na aba /now como overview rápido.

**Avaliação:** Média utilidade. O MC de Diego já é sofisticado. O valor incremental é ter o cone visível no overview, não só nas abas detalhadas.

**Complexidade:** Média — requer dados de percentis P5/P95 do MC já existente.

---

### ⚠️ Gap 4 — "Marcos FIRE" Tab no gráfico temporal

**O que eles fazem:** Tab dedicada no gráfico com marcos de milestones (quando atinge Barista FIRE, Lean FIRE, FIRE, Fat FIRE).

**Status no dashboard de Diego:** Não identificado como feature separada.

**Avaliação:** Baixa-média utilidade. Diego já tem o FireSpectrumWidget com progresso por banda. Marcos temporais poderiam ser úteis na visualização da progressão histórica.

**Complexidade:** Média.

---

### ❌ Não relevante para Diego

| Feature | Por que não relevante |
|---------|----------------------|
| Comparação com outros usuários | Dashboard individual, não plataforma SaaS |
| "O Milionário mora ao lado" | Demasiado básico para o nível de Diego |
| Regra dos 72 | Conhecimento básico, não acionável |
| TSR 4% como padrão | Diego usa SWR 3% (correto para 37 anos) — usar 4% seria regressão |
| FIRE Number R$6M (300x) | Diego usa R$10M (480x) — metodologia diferente |
| Meta pessoal separada | Diego já tem FIRE Number R$10M como meta integrada |
| Coast FIRE "aos 52" | Já implementado como CoastFireCard |

---

## Gaps Prioritizados

| # | Feature | Prioridade | Complexidade | Ação |
|---|---------|------------|--------------|------|
| 1 | ETA com mês específico ("-Out/2040") | 🟡 Média | Baixa | Avaliar implementação — pipeline pode já ter a data |
| 2 | Taxa de poupança como KPI | 🟡 Média | Baixa | Verificar se calculada no pipeline |
| 3 | Fan chart na projeção overview | 🟢 Baixa | Média | Backlog — MC já cobre de forma mais completa |
| 4 | Marcos FIRE no gráfico temporal | 🟢 Baixa | Média | Backlog |

---

## Decisão Head

Esta issue é de **análise e triagem**. Os gaps identificados devem ser convertidos em issues separadas se e quando aprovados.

**Recomendação imediata:** Gap 1 (ETA com data específica) tem custo baixo e alto impacto motivacional — verificar se o pipeline já calcula o mês projetado de FIRE e, se sim, exibir na aba /fire como "{mês}/{ano}".

---

## Próximos Passos

- [x] Dev: ETA com mês/ano — `fireDateFormatted: "Abr/2040"` em dataWiring.ts + KpiHero subtitle
- [x] Dev: Taxa de poupança — `taxaPoupanca: 55.6%` em dataWiring.ts + MetricCard em /now
- [ ] Head: Gaps 3+4 (fan chart, Marcos FIRE) — revisar na próxima revisão mensal

