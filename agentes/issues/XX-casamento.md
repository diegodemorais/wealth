# XX-casamento: Casamento iminente — recalibrar cenarios FIRE e planejamento patrimonial

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | XX-casamento |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Baixa |
| **Participantes** | 04 FIRE, 05 Tax, 01 CIO, 12 Behavioral |
| **Dependencias** | — |
| **Criado em** | 2026-03-24 |
| **Origem** | Re-analise estrategica full-path + gatilho em carteira.md |
| **Concluido em** | 2026-03-27 |

---

## Motivo / Gatilho

`carteira.md` ja registra: "Estado civil: Solteiro, sem filhos (marco 2026). **GATILHO**: casamento iminente — quando decidir, recalibrar: custo de vida, FIRE date, sucessao, estrutura empresarial, testamento."

A re-analise de 2026-03-24 identificou que este gatilho ainda nao foi endercado formalmente. Tax (planejamento sucessorio), FIRE (impacto P(FIRE): estimado queda de 91% para 70-75% se custo de vida aumentar + aportes reduzirem), Behavioral (presente bias explicando o delay).

---

## Descricao

Casamento muda materialmente os parametros do modelo FIRE:

1. **Custo de vida**: de R$250k para potencialmente R$280-320k (estilo de vida compartilhado nao e necessariamente mais barato)
2. **Aportes**: se parceira nao tem renda ou se Diego assume mais custos, aportes mensais de R$25k podem reduzir
3. **FIRE date**: pode mudar (parceira mais nova? filhos?)
4. **Sucessao**: planejamento de heranca e estrutura de bens — proteger ambos
5. **Estrutura empresarial**: 2 PJs — separacao de patrimonio e mais critica pos-casamento

---

## Escopo

**Urgente (fazer antes do casamento):**
- [ ] Planejamento sucessorio: testamento, regime de bens, protecao mutua. **Nota (2026-03-26):** patrimonio total R$8.813M (financeiro + empresa R$800k + imovel R$450k + terreno R$150k) — muito maior do que o visivel no portfolio financeiro
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

> Executada em 2026-03-27. Premissas de estimativa inicial — nao validadas. Revisitar quando planos mais maduros.

### Perfil Katia (inputs coletados 2026-03-27)

| Campo | Valor | Confianca |
|-------|-------|-----------|
| Regime | CLT | Alta |
| Salario bruto | R$18k/mes | Media |
| Salario liquido | ~R$13.5k/mes (INSS+IR) | Media |
| Beneficios (VA/VR/saude) | ~R$1.5-2k/mes | Media |
| Bonus anual | 1x salario (conservador) | Baixa |
| Reserva propria | ~R$0 | Media |
| Plano de saude | Excelente (empresa grande) | Alta |
| Diego como dependente | Custo adicional baixo ou zero | Media |
| Patrimonio no FIRE 55 | ~R$800k estimado | Baixa |
| Gastos mensais | ~R$13-15k/mes | Media |

### Modelo de Fases — Casal (FIRE 55)

**Acumulacao (16 anos):**

| Fase | Periodo | Aporte/mes | Base |
|------|---------|-----------|------|
| SP, ambos trabalhando | Meses 1-24 | R$15k | Estimativa |
| Licenca Katia + bebe | Meses 25-42 | R$9k | Estimativa |
| Indaiatuba, Katia voltou | Meses 43-192 | R$16k | Estimativa |
| One-time | Mes 30 | +R$190k | Venda apt Katia - entrada casa |

**Renda mensal conjunta (fase 1):**

| Item | Valor |
|------|-------|
| Diego liquido | ~R$25k/mes |
| Katia liquida + beneficios | ~R$15-16k/mes |
| Total bruto | ~R$40-41k/mes |
| Gastos casal (estimativa) | ~R$26-28k/mes |
| **Surplus para aportes** | **~R$13-15k/mes** |

**Moradia:**
- Fase 1 (SP): aluguel compartilhado ~2 anos
- Fase 2: casa propria em Indaiatuba, ~R$1M, financiamento ~R$600k SAC
- Apt Katia vendido: liquido ~R$590k. Entrada+reforma ~R$400k. Net one-time: +R$190k
- Apt Diego (Pinheiros): mantido para renda. Aluguel estimado R$66k/ano ja descontado do lifestyle

**Filho:** 1 filho previsto, nascimento ~2028. No FIRE 55: filho tem 14 anos.

### Resultados Monte Carlo — Progressao Completa

Script: `dados/monte_carlo_casal_katia.py` | 10k trajetorias, t-dist df=5, seeds 42/200

**Spending casal (FIRE 55, C5 — lifestyle R$250k):**

| Ano FIRE | Idade | Lifestyle | Saude 2p | Sobrecarga | Total |
|----------|-------|-----------|----------|------------|-------|
| 0 | 55 | R$250k | R$106k | R$100k | R$494k |
| 10 | 65 | R$198k | R$152k | R$0 | R$323k |
| 20 | 75 | R$172k | R$206k | R$0 | R$351k |
| 30 | 85 | R$172k | R$234k | R$0 | R$368k |

Sobrecarga: escola (R$30k) + mortgage SAC (~R$70k medio) nos primeiros anos pos-FIRE.
**Nota:** escola por 7 anos esta superestimada — filho termina escola ~4 anos pos-FIRE 55. Correto em revisao futura.

**P(sucesso) por cenario:**

| ID | FIRE | Casa | Lifestyle | P(base) | P(fav) | P(stress) | vs Solo |
|----|------|------|-----------|---------|--------|-----------|---------|
| Solo FIRE 50 (ref) | 50 | — | R$280k | 80.8% | 89.9% | 74.3% | ref |
| C1 | 53 | R$1M | R$290k | 47.5% | — | — | -33pp |
| C3 | 55 | R$1.5M | R$290k | 59.9% | — | — | -21pp |
| C4 | 55 | R$1M | R$290k | 61.7% | — | — | -19pp |
| C5 | 55 | R$1M | R$250k | 65.4% | 81.4% | 28.3% | -15pp |

**Marco C5:** favoravel (81.4%) supera solo pela primeira vez. Base (65.4%) ainda -15pp.

**Decomposicao do gap casal vs solo:**
- 80% do gap = spending maior (R$467k vs R$318k = +R$149k/ano)
- 20% do gap = aportes menores (R$15k vs R$25k/mes)
- Saude do segundo adulto e o driver silencioso — cresce indefinidamente

### Sensibilidade — VCMH (premissa mais incerta)

| VCMH | Saude 2p FIRE 55 | P(base) C5 | Delta |
|------|-----------------|-----------|-------|
| 7% (modelo atual, IESS agregado) | R$106k/ano | ~65% | ref |
| 5% (premissa alternativa) | R$79k/ano | ~68% | +3pp |

**VCMH e a variavel mais sensivel do modelo.** Problema: VCMH 7% e dado agregado do mercado (IESS), nao curva individual. Sem dado longitudinal brasileiro individual para validar. Intervalo real: 53-68% para C5 base.

Sensitividade: R$1k/ano de lifestyle cortado = ~0.09pp de P. Permanente. Saude e incompressivel e nao linear.

### Para chegar a P(base) = 80% — Casal

Nenhuma combinacao testada cruzou 80% de forma robusta:

| Cenario | P(base) | Requer |
|---------|---------|--------|
| VCMH 5% sozinho | 67% | So premissa mais otimista |
| VCMH 5% + FIRE 57 | 71% | 2 anos a mais + premissa otimista |
| VCMH 5% + FIRE 58 + R$230k + R$16k/mes | 77% | 3 anos a mais + lifestyle menor + aportes maiores |
| VCMH 5% + FIRE 58 + R$210k + R$16k/mes | 78% | Combinacao exigente |

**Conclusao:** 80% base para o casal e estruturalmente fora de alcance com premissas conservadoras. O target realista e 65-75%. Comparar P casal com P solo pode ser a pergunta errada — o solo gasta R$318k; o casal gasta R$440-494k. A pergunta certa e: qual custo de vida o casal quer, e qual FIRE age corresponde a P aceitavel para ambos?

### Premissas com Baixa Confianca (revisitar)

| Premissa | Valor atual | Por que incerta |
|----------|------------|-----------------|
| Saude base hoje (R$18k/pp) | Nunca validada | Diego gasta ~R$6-10k/ano total |
| VCMH 7% real | IESS agregado | Nao e curva individual |
| Aportes por fase | R$15k/9k/16k | Estimativa — nao testada na pratica |
| Lifestyle casal R$250-290k | Nunca vivido | Inclui R$60k viagens, nunca validado |
| Casa R$1M Indaiatuba | Estimativa | Mercado nao pesquisado |
| Patrimonio Katia no FIRE | R$800k | Depende de poupanca dela ate 2042 |
| Escola 7 anos | Superestimada | Filho termina escola em 4 anos pos-FIRE 55 |

---

## Conclusao

Issue encerrada em 2026-03-27 como primeira passagem com premissas de estimativa inicial.

**Achados principais:**
1. P(FIRE 55 casal) base = 65.4% com lifestyle R$250k — viavel mas nao robusto
2. Bear market nos primeiros anos pos-FIRE e o risco dominante do casal (sobrecarga escola+mortgage critica no SoRR window)
3. Saude e o driver incompressivel — cresce a 7% real e supera o lifestyle aos ~70 anos
4. 80% P(base) para o casal requer combinacao de VCMH 5% + FIRE 58+ + lifestyle abaixo de R$230k
5. Premissas de baixa confianca dominam o resultado — revisitar quando vida mais definida
6. Itens urgentes independentes de calculos: planejamento sucessorio + seguro de vida

**Quando reabrir:** quando casa escolhida, lifestyle real testado, Katia com renda estabilizada pos-bebe, e data de casamento definida.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **FIRE** | P(FIRE 55 casal) = 65.4% base / 81.4% favoravel / 28.3% stress. Meta 80% base estruturalmente difícil. |
| **Estrategia** | Premissas de baixa confianca. Revisitar pos-casamento com dados reais de lifestyle e saude. |
| **Conhecimento** | Saude 2 pessoas e driver dominante pos-FIRE 70+. Spending casal (R$467k) vs solo (R$318k) = gap estrutural de R$149k. |
| **Acao urgente** | Planejamento sucessorio + seguro de vida — independente de calculos. |

---

## Proximos Passos

- [ ] **Urgente (pre-casamento):** planejamento sucessorio (testamento, regime de bens) + seguro de vida
- [ ] **Reabrir issue quando:** casa escolhida + lifestyle real do casal testado (6-12 meses juntos) + data de casamento definida
- [ ] **Na reabertura:** revalidar premissas de saude com dado real (plano Katia como dependente, custo total), lifestyle real vivido, aportes reais
