# DEV-hero-kpi-review: Revisão completa KPIs hero strip + aba Now

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-hero-kpi-review |
| **Dono** | Dev + Head |
| **Status** | ✅ Done |
| **Concluído em** | 2026-04-12 |
| **Prioridade** | 🟡 Média |
| **Participantes** | Head, Dev, FIRE, Factor, RF, Risco, Macro, FX, Tax, Quant, Bookkeeper, Advocate |
| **Criado em** | 2026-04-12 |
| **Origem** | Diego — card do FIRE quebrado no layout + duplicações entre hero strip e aba Now |
| **Concluido em** | — |

---

## Motivo / Gatilho

1. Um card maior que os outros no hero strip está quebrando o layout (suspeita: card FIRE)
2. P(FIRE) aparece em 3 lugares simultâneos: hero strip, kpi-grid primários e pfireHeadline band — duplicação excessiva
3. Alguns KPIs não estão na forma visual mais adequada
4. A aba Now precisa responder "o que importa olhar AGORA?" — KPIs que não são actionable daily devem ser removidos, movidos ou deletados se duplicados

---

## Descricao

Revisão completa dos KPIs visíveis no Now com foco em:
- Eliminar duplicações entre hero strip, pfireHeadline band e kpi-grids
- Corrigir layout quebrado (card desproporcionalmente grande)
- Garantir que cada KPI na aba Now seja truly actionable daily
- Melhorar formas visuais onde aplicável (spark lines, gauges, mini-charts, semáforos)
- Consolidar ou mover KPIs que pertencem melhor a outras abas

---

## Elementos Atuais

### Hero strip (sempre visível — 5 cards)
| Card | Valor exibido |
|------|--------------|
| Patrimônio Total | R$ total |
| P(FIRE) Base @53 | % probabilidade |
| Anos até FIRE | número de anos |
| Progresso FIRE | % do patrimônio-alvo |
| Savings Rate | % mensal/anual |

### pfireHeadline band (sempre visível)
- P(FIRE@53) Base
- P(FIRE@50)

### KPI Primários — aba Now
- P(FIRE@50)
- Bond Pool Runway
- Drift Máximo
- Wellness Score
- Aporte/Lucro Equity

### KPI Contexto de Mercado — aba Now
- Dólar
- Bitcoin
- IPCA+ 2040
- Renda+ 2065
- Alpha ITD
- Factor Signal

### KPI FIRE — aba Now (grid-3)
- Progresso FIRE
- Savings Rate
- TER da Carteira

---

## Escopo

- [ ] Dev mapeia no template.html os cards do hero strip e identifica o card com tamanho quebrado (suspeita: texto longo ou conteúdo extra no card FIRE)
- [ ] Cada agente especialista opina sobre KPIs do seu domínio (ver seção Contribuições)
- [ ] Quant valida que KPIs mantidos têm data_fields corretos no data.json
- [ ] Dev propõe novo layout consolidado para aprovação de Diego
- [ ] Dev implementa após aprovação
- [ ] Quant confirma que nenhum dado foi perdido ou mal calculado
- [ ] Commit + push

---

## Contribuições esperadas por agente

Cada agente responde para os KPIs do seu domínio:

1. **Quais KPIs são truly actionable daily** (justificar por que Diego deve olhar todo dia)
2. **Quais podem ser removidos** — duplicados, low-signal, ou pertencem a outra aba
3. **Ordem de importância** dentro do seu domínio
4. **Formas visuais mais eficazes** — ex: spark line de 30 dias, gauge com zona verde/amarela/vermelha, semáforo, mini-chart, trend arrow

### Domínios por agente:

| Agente | KPIs para revisar |
|--------|------------------|
| **FIRE** | P(FIRE@50), P(FIRE@53), Anos até FIRE, Progresso FIRE, pfireHeadline band |
| **Factor** | Alpha ITD, Factor Signal, Drift Máximo, Aporte/Lucro Equity |
| **RF** | IPCA+ 2040, Renda+ 2065, Bond Pool Runway |
| **Risco** | Bitcoin, Wellness Score |
| **Macro** | Dólar, contexto macro geral |
| **Tax** | Savings Rate, TER da Carteira |
| **Bookkeeper** | Patrimônio Total |
| **Advocate** | Steelman: quais KPIs parecem úteis mas são vanity metrics? |
| **Quant** | Validar cálculos dos KPIs mantidos; identificar KPIs que exigem dado atualizado diário |

---

## Regras de Decisão

- KPI **fica no Now** se: Diego precisa olhar diariamente e pode tomar ação baseada nele
- KPI **move para outra aba** se: útil, mas semanal/mensal é suficiente
- KPI **deleta** se: duplicado em outro lugar sem adicionar informação
- **Nunca duplicar** o mesmo dado em mais de 1 lugar visível simultaneamente
- Visualização mínima: número + tendência (up/down arrow). Máxima: spark line ou gauge quando a série temporal é o ponto

---

## Analise

*(a preencher após debate dos agentes)*

---

## Conclusao

*(a preencher após aprovação de Diego)*

---

## Resultado

*(a preencher após implementação)*

---

## Proximos Passos

*(a preencher após conclusão)*
