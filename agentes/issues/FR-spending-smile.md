# FR-spending-smile: FR-003 atualizado com spending smile e saude com inflator proprio

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-spending-smile |
| **Dono** | 04 FIRE |
| **Status** | Done |
| **Prioridade** | Baixa |
| **Participantes** | 00 Head, 10 Advocate, 11 Quant |
| **Dependencias** | TX-desacumulacao (custos de desacumulacao — impacta baseline); PT-onelife condicional (se Lombard = sem IR = TX muda) |
| **Criado em** | 2026-03-23 |
| **Origem** | HD-009 (Auditoria de gastos) |
| **Concluido em** | 2026-03-27 |

---

## Motivo / Gatilho

> HD-009 identificou que o FR-003 usa R$250k flat como baseline de gastos na aposentadoria. Evidencias empiricas (Blanchett 2014) e dados reais de Diego mostram que gastos seguem um "spending smile" — nao sao flat. Saude e o unico componente com inflacao propria crescente (+5-8%/ano real no Brasil) que precisa de modelagem separada.
>
> **Novo dado disponivel (2026-03-26):** gastos reais auditados = **R$215k/ano** (HD-009). O spending smile comeca de R$215k, nao de estimativa. Go-Go R$270-290k esta entre P(FIRE) 91% (R$250k) e 87% (R$350k) — espaco mais preciso para modelar. Baseline Monte Carlo atual usa R$250k flat (FR-003 com premissas HD-006).

---

## Descricao

> Atualizar o Monte Carlo FR-003 com:
> 1. Spending smile: gastos variaveis por fase de aposentadoria
> 2. Saude com inflator proprio (+5-8%/ano real, separado do IPCA)
> 3. Revalidar P(sucesso), patrimonio necessario e guardrails

---

## Escopo

- [ ] Definir o spending smile de Diego com base em HD-009:
  - Go-Go (50-60): R$270-290k/ano
  - Slow-Go (60-70): R$220-230k/ano
  - No-Go/Care (70+): R$270-300k+/ano
- [ ] Separar linha de saude (hoje diluida em Optionals) com inflator +5%/ano real
- [ ] Rodar MC 10k trajetorias com novo perfil de gastos
- [ ] Comparar com FR-003 baseline: P(sucesso), patrimonio necessario, guardrails
- [ ] Cenario de stress: Go-Go R$300k + drawdown -30% no ano 1 → sobrevive?
- [ ] Quant: validar formulas e consistencia dos calculos

---

## Analise

Script: `dados/monte_carlo_spending_smile_v3_corrigido.py` | 10k trajetorias | t-dist df=5 | seeds 42 (acum) / 200 (desacum)

### Correcao critica: base de saude

Diego gasta R$18k/ano em saude hoje (idade 39, auditado HD-009). Com VCMH +7% real (IESS) durante 11 anos ate o FIRE:

`SAUDE_BASE_FIRE = R$18,000 × (1.07)^11 = R$37,887`

Versoes anteriores (v3) usavam R$18k como base no FIRE — errado. A base corrigida e 2.1x maior.

### Spending smile por fase

| Fase | Idade | Gasto-alvo total | Saude incluida | Estilo de vida ex-saude |
|------|-------|-----------------|----------------|------------------------|
| Go-Go | 50-59 | R$280k | R$37,887 crescendo | R$242k |
| Slow-Go | 60-69 | R$225k | aumentando | caindo |
| No-Go | 70+ | R$285k | R$98,510 aos 70 | caindo |

### Evolucao do custo de saude por modelo (cap/decay — modelo adotado)

| Idade | Saude (cap/decay) | Inflator |
|-------|------------------|---------|
| 50 | R$37,887 | base |
| 55 | R$51,665 | 6.0% |
| 60 | R$67,203 | 5.0% |
| 65 | R$83,346 | 4.0% |
| 70 | R$98,510 | 3.0% (piso) |
| 80 | R$132,389 | 3.0% |
| 90 | R$177,919 | 3.0% |

Cap/decay: inflator(t) = max(3%, 7% - 0.2%×t). Decaimento reflete que inflacao real de saude desacelera com a idade (uso de servicos estabiliza). +7% puro gera R$146k aos 70 — conservador demais.

### Saque ano 1 no FIRE (t=0, idade 50)

| Componente | Valor |
|-----------|-------|
| Lifestyle ex-saude (Go-Go) | R$242,113 |
| Saude no FIRE | R$37,887 |
| Custo desacumulacao 50-65 | R$38,000 |
| INSS (antes dos 65) | R$0 |
| **TOTAL SAQUE ANO 1** | **R$318,000** |
| SWR sobre mediana R$10.6M | **3.00%** |

### P(sucesso) por modelo — evolucao historica

| Modelo | Base (5.96%) | Favoravel | Stress |
|--------|-------------|-----------|--------|
| FR-003 flat R$250k (referencia) | 90.4% | 95.4% | 86.1% |
| v1c: +5% flat, base corrigida | 77.5% | 87.2% | 70.3% |
| **v3c: cap/decay, base corrigida** | **80.8%** | **89.9%** | **74.3%** |
| v2c: +7% puro, base corrigida | 64.4% | 77.9% | 55.0% |

### Cross-matrix INSS × modelo de saude (cenario base)

| INSS | +5% flat | cap/decay | +7% puro |
|------|---------|-----------|---------|
| R$50k | 77.8% | 81.1% | 65.1% |
| R$25k | 77.5% | 80.8% | 64.4% |
| R$0 | 77.3% | 80.6% | 63.9% |

**Dado:** INSS tem impacto marginal de apenas 0.2-0.5pp. O modelo de saude e muito mais relevante que o INSS.
**Interpretacao:** A incerteza do beneficio INSS (R$0 vs R$50k) e quase irrelevante para o P(sucesso). O que importa e o inflator de saude.

### Stress tests

| Cenario | P(sucesso) |
|---------|-----------|
| Base cap/decay (INSS R$25k) | 80.8% |
| Bear -30% ano 1 | 65.2% |
| INSS R$0 | 80.6% |
| Bear -30% + INSS R$0 (combo extremo) | 64.9% |

---

## Conclusao

**Dado:** Com spending smile (Go-Go R$280k, Slow-Go R$225k, No-Go R$285k) e saude com inflator proprio cap/decay (base corrigida R$37,887 no FIRE), P(sucesso) = **80.8%** no cenario base — vs 90.4% do FR-003 flat R$250k.

**Interpretacao:** A queda de 9.6pp e explicada por dois fatores:
1. Custo de saude 2.1x maior que o modelado anteriormente (base composta ate o FIRE)
2. Spending Go-Go R$280k e Slow-Go R$225k sao estruturalmente diferentes do flat R$250k: Go-Go e mais alto, o que penaliza os anos criticos de Sequence of Returns Risk

**Implicacoes:**
- P(sucesso) de 80.8% e considerado robusto para FIRE (Kitces: threshold aceitavel 80%+)
- O principal risco nao e o INSS (impacto de 0.2pp) — e o inflator de saude e o bear market no ano 1 (-15.6pp)
- Bear -30% no ano 1 reduz P para 65.2% — os guardrails cobrem, mas e o cenario que exige mais disciplina
- O modelo cap/decay e o mais realista: inicio agressivo (6.8% no primeiro ano) com decaimento ate piso de 3% apos t=20

**Ajuste sugerido:** Nenhuma mudanca de alocacao. O modelo de gastos foi atualizado e o Monte Carlo revalidado. P(FIRE) anterior de 91% permanece valido para a carteira — a queda para 80.8% reflete o realismo do spending smile, nao um problema da carteira.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Nenhuma mudanca |
| **Estrategia** | Spending smile + saude cap/decay substituem flat R$250k no modelo FIRE. P(sucesso) revisado: 80.8% base / 89.9% favoravel / 74.3% stress |
| **Conhecimento** | (1) Base de saude deve ser composta ate o FIRE: R$18k × 1.07^11 = R$37,887. (2) INSS e irrelevante para P(sucesso) — impacto de 0.2pp. (3) Bear -30% no ano 1 e o risco dominante (-15.6pp). (4) Cap/decay e o modelo de inflacao de saude mais realista (desacelera com a idade) |
| **Memoria** | Registrar P(sucesso) corrigido em memoria do FIRE agent. Script: dados/monte_carlo_spending_smile_v3_corrigido.py |
| **Nenhum** | — |

---

## Estudo Derivado: Age Sweep FIRE 50–60

Script: `dados/monte_carlo_fire_age_sweep.py` | 10k trajetórias | mesmas premissas (spending smile cap/decay)

| Idade FIRE | Patrimônio | SWR | P(sucesso) c/ guardrails | P sem guardrails | Bear -30% ano 1 |
|-----------|-----------|-----|--------------------------|-----------------|----------------|
| 50 (2037) | R$10.6M | 3.00% | 78.5% | 66.0% | 61.7% |
| 51 | R$11.4M | 2.79% | 81.9% | 70.6% | 65.3% |
| 52 | R$12.3M | 2.58% | 84.7% | 74.9% | 69.1% |
| 53 (2040) | R$13.4M | 2.38% | 86.9% | 78.3% | 72.8% |
| 54 | R$14.3M | 2.22% | 88.8% | 82.0% | 76.1% |
| **55** | **R$15.5M** | **2.06%** | **90.5%** | **84.1%** | **79.2%** |
| 56 | R$16.5M | 1.92% | 91.3% | 86.5% | 81.0% |
| 57 | R$17.6M | 1.80% | 93.0% | 89.1% | 84.3% |
| 58 | R$19.0M | 1.68% | 93.9% | 90.8% | 86.7% |
| 59 | R$20.3M | 1.56% | 94.8% | 92.2% | 88.4% |
| 60 | R$21.9M | 1.45% | 95.5% | 93.7% | 89.2% |

Achados:
- Valor marginal dos guardrails: +12.5pp no FIRE 50 (78.5% vs 66.0%). São a norma: ativam em 78.7% das simulações, média de 3.4 anos com corte no Go-Go.
- Ganho por ano extra: **+2.4pp/ano** (anos 1–5), **+1.0pp/ano** (anos 6–10).
- Primeiro limiar 80%: FIRE 51 | Primeiro 90%: FIRE 55 | Primeiro 95%: FIRE 60.
- FIRE 53 (2040) tem insight estrutural: alinhamento com vencimento TD 2040 (~R$1.6M em caixa, bond tent natural de 5 anos). Formalizado em issue FR-fire2040.

Script gaps: `dados/monte_carlo_smile_gaps.py`
- Saúde +7% puro reduz P para 64.4%; cap/decay (adotado) = 80.8%.
- Bear -30% + saúde +7% (combo extremo): P=44.1%.
- Piso No-Go corrigido: R$150k + saúde (antes R$120k).

---

## Proximos Passos

- [x] Atualizar P(FIRE) no scorecard: 91% → 80.8% com spending smile (spending smile adotado como modelo oficial)
- [x] Rodar monte_carlo_smile_gaps.py — concluído, achados acima
- [x] Age sweep 50–60 — concluído, tabela acima
- [ ] Executar FR-fire2040 (issue criada): FIRE 2040 + bond tent TD 2040 + IPCA ETF
