# XX-casamento: Casamento iminente — recalibrar cenarios FIRE e planejamento patrimonial

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | XX-casamento |
| **Dono** | 00 Head |
| **Status** | Backlog |
| **Prioridade** | Baixa |
| **Participantes** | 04 FIRE, 05 Tax, 01 CIO, 12 Behavioral |
| **Dependencias** | — |
| **Criado em** | 2026-03-24 |
| **Origem** | Re-analise estrategica full-path + gatilho em carteira.md |
| **Concluido em** | — |

---

## Motivo / Gatilho

`carteira.md` ja registra: "Estado civil: Solteiro, sem filhos (marco 2026). **GATILHO**: casamento iminente — quando decidir, recalibrar: custo de vida, FIRE date, sucessao, estrutura empresarial, testamento."

A re-analise de 2026-03-24 identificou que este gatilho ainda nao foi endercado formalmente. Tax (urgente: testamento + pacto antenupcial), FIRE (impacto P(FIRE): estimado queda de 91% para 70-75% se custo de vida aumentar + aportes reduzirem), Behavioral (presente bias explicando o delay).

---

## Descricao

Casamento muda materialmente os parametros do modelo FIRE:

1. **Custo de vida**: de R$250k para potencialmente R$280-320k (estilo de vida compartilhado nao e necessariamente mais barato)
2. **Aportes**: se parceira nao tem renda ou se Diego assume mais custos, aportes mensais de R$25k podem reduzir
3. **FIRE date**: pode mudar (parceira mais nova? filhos?)
4. **Sucessao**: sem testamento, parceira nao tem protecao. Sem pacto antenupcial, regime de bens impacta o patrimonio
5. **Estrutura empresarial**: 2 PJs — separacao de patrimonio e mais critica pos-casamento

---

## Escopo

**Urgente (fazer antes do casamento):**
- [ ] Testamento: contratar advogado de familia. Quem herda o que?
- [ ] Pacto antenupcial: qual regime de bens? Separacao total protege patrimonio pre-casamento. **Nota (2026-03-26):** escopo agora inclui participacao empresarial R$800k (confirmado) + imóvel equity R$450k + terreno R$150k — patrimonio total R$8.813M, muito maior do que o visivel no portfolio financeiro
- [ ] Seguro de vida: cobrir estate tax US-listed (~US$60k risco herdeiros) + proteger parceira se Diego falecer

**Modelo FIRE:**
- [ ] Coletar inputs do Diego: custo de vida esperado pos-casamento, renda da parceira, planos de filhos
- [ ] Recalcular P(FIRE) com cenario casamento: R$280k/ano + R$20k aportes vs R$250k + R$25k. **Baseline: 91% @ R$250k (FR-003 com premissas HD-006)**
- [ ] Recalcular P(FIRE) com cenario filhos: custo R$350k+, aporte zero por 2-3 anos
- [ ] Definir FIRE date condicional: "se parceira trabalha -> 50; se nao trabalha -> 52; se filhos -> revisao"
- [ ] Avaliar se patrimonio e suficiente: **portfolio financeiro R$3.479M + empresa R$800k = R$4.279M** (excluindo imóvel/terreno/capital humano)

**Patrimonial:**
- [ ] Avaliar regime de bens otimo (separacao total vs comunhao parcial)
- [ ] Estrutura empresarial: 2 PJs continuam adequadas?
- [ ] Holdings: quando o patrimonio justificar holding familiar? (meta: >=R$5M)

**Behavioral:**
- [ ] Nomear o padrao: presente bias explica o delay em enderecar isso formalmente
- [ ] Definir deadline: "pacto + testamento contratados ate [data]" — implementation intention

---

## Analise

> A preencher durante a issue.

### Estimativa rapida do impacto (aguardando inputs de Diego)

Cenario A — Parceira trabalha, custo vida +10%:
- Custo: R$275k/ano
- Aportes: R$23k/mes
- P(FIRE) estimado: ~88% (pequena queda)

Cenario B — Parceira nao trabalha, custo vida +20%:
- Custo: R$300k/ano
- Aportes: R$18k/mes
- P(FIRE) estimado: ~75-80% (queda material)

Cenario C — Filhos, custo vida +40%, aporte zero por 3 anos:
- Custo: R$350k/ano
- Aportes: R$0 por 3 anos, depois R$15k/mes
- P(FIRE) estimado: ~60-70% — FIRE date precisaria ser revisado

(Calculos precisam ser validados pelo Quant com premissas HD-006)

---

## Conclusao

> A preencher ao finalizar.

---

## Resultado

> A preencher ao finalizar.

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | — |
| **Estrategia** | — |
| **Conhecimento** | — |
| **Memoria** | — |

---

## Proximos Passos

> A definir durante a issue.
- [ ] Diego confirmar inputs: custo de vida esperado, renda da parceira, planos de filhos, data aproximada
- [ ] Contratar advogado de familia (testamento + pacto antenupcial) — urgente, independente de outros calculos
