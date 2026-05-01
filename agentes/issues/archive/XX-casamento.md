# XX-casamento: Casamento iminente — recalibrar cenarios FIRE e planejamento patrimonial

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | XX-casamento |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 04 FIRE, 05 Tax, 01 CIO, 12 Behavioral |
| **Dependencias** | — |
| **Criado em** | 2026-03-24 |
| **Origem** | Re-análise estratégica full-path + gatilho em carteira.md |
| **Concluido em** | 2026-04-02 (recalibrado — ambos aposentam juntos, 2p desde FIRE Day) |

---

## Motivo / Gatilho

`carteira.md` registra: casamento iminente ~2026-2027, filho previsto ~2028. Gatilho ativo desde 2026-03-24. Issue foi executada em 2026-03-27 com premissas de saúde **incorretas** (SAUDE_BASE R$37,9k + 7%/ano). Recalibrada em 2026-04-02 com:
- `SAUDE_BASE = R$16k/pp` (plano empresarial coletivo PJ — cotação real Bradesco SP, age 53)
- `SAUDE_INFLATOR = 2,7%/ano real` (VCMH IESS, 18 anos)
- **Ambos aposentam juntos** (53 anos): 2 planos desde o FIRE Day = R$32k/ano na largada
- FIRE base: 53 (2040), não 50

---

## Perfil do Casal

### Katia

| Campo | Valor | Confiança |
|-------|-------|-----------|
| Regime | CLT | Alta |
| Salário bruto | R$18k/mês | Média |
| Salário líquido | ~R$13,5k/mês | Média |
| Benefícios | ~R$1,5-2k/mês | Média |
| Bônus anual | 1× salário | Baixa |
| Plano de saúde | Excelente (empresa grande) | Alta |
| Diego como dependente | Custo adicional baixo ou zero | Média |
| Reserva própria | ~R$0 | Média |
| Patrimônio no FIRE 55 | ~R$800k estimado | Baixa — PGBL ~R$490k é componente principal (TX-pgbl-katia) |
| Gastos mensais | ~R$13-15k/mês | Média |

---

## Modelo de Fases — Acumulação (14 anos até FIRE 53)

| Fase | Período | Aporte/mês | Base |
|------|---------|------------|------|
| SP, ambos trabalhando | Meses 1-24 | R$15k | Estimativa |
| Licença Katia + bebê | Meses 25-42 | R$9k | Estimativa |
| Indaiatuba, Katia voltou | Meses 43-168 | R$16k | Estimativa |
| One-time | Mês ~30 | +R$190k | Venda apt Katia – entrada casa |

**Aporte médio ponderado:** R$15.107/mês (vs R$25k solo)

**Renda mensal conjunta (fase 1):**

| Item | Valor |
|------|-------|
| Diego líquido | ~R$25k/mês |
| Katia líquida + benefícios | ~R$15-16k/mês |
| Gastos casal (estimativa) | ~R$26-28k/mês |
| Surplus para aportes | ~R$13-15k/mês |

**Moradia:**
- Fase 1 (SP): aluguel compartilhado ~2 anos
- Fase 2: casa própria em Indaiatuba, ~R$1M, financiamento ~R$600k SAC
- Apt Katia vendido: líquido ~R$590k. Entrada+reforma ~R$400k. Net one-time: +R$190k
- Apt Diego (Pinheiros): mantido para renda. Aluguel estimado R$66k/ano descontado do lifestyle

---

## Modelo de Saúde — Comparativo (correção principal)

Ambos aposentam juntos (53 anos). 2 planos empresariais desde o FIRE Day.

| Idade | Saúde 2p Novo | Saúde 2p Antigo | Delta |
|-------|---------------|-----------------|-------|
| 53 (FIRE Day) | R$32.000 | R$75.800 | −R$43.800 |
| 54 | R$43.800 | R$86.800 | −R$43.000 |
| 59 | R$62.600 | R$113.800 | −R$51.200 |
| 64 | R$85.800 | R$159.500 | −R$73.700 |
| 70 | R$100.700 | R$239.400 | −R$138.700 |
| 83+ (no-go, decay) | ~R$71.200 | ~R$288.500 | −R$217.300 |

**Key insight:** O modelo antigo usava R$37,9k/pp (plano individual composto por 11 anos a 7%). Com plano empresarial real (cotação Bradesco) e VCMH correto (2,7%), o custo 2p na largada cai de R$75,8k para R$32k — e cresce muito mais devagar.

---

## Cenários Monte Carlo — FIRE Casal (recalibrado 2026-04-12)

Script: `scripts/fire_montecarlo.py` (SAUDE_BASE=R$32k 2p) | 10k trajetórias | t-dist df=5 | seed 42
Modelo: spending smile ex-saúde + IR 15% nominal + vol bond pool 13.3% + floors INSS/PGBL Katia

**Premissa-base recalibrada 2026-04-12:** ambos aposentam juntos em **2040 (53 anos)**. Katia não trabalha até 55. Floors de renda incluídos: INSS Katia (30a contrib) + PGBL Katia a partir do ano 9 (age 62, 2049); INSS Diego a partir do ano 12 (age 65, 2052).

**INSS Katia (30 anos de contribuição ao parar em 2040):**
- Alíquota: 60% + 2%×(30-15) = 90% do SB
- SB: 92.2% do teto → benefício: ~R$7.053/mês = **R$84.636/ano** (vs R$93.6k se trabalhasse até 62)
- Disponível aos 62 anos (2049 = ano 9 pós-FIRE)

**PGBL Katia:**
- Saldo FIRE Day 2040: R$492k → cresce 9 anos a 4.5%/ano = R$731k em 2049
- Floor income (4% SWR): **R$29.2k/ano** a partir de 2049 (ano 9)
- Floor total Katia (INSS + PGBL): **R$113.8k/ano** from ano 9

**P(FIRE) por cenário:**

| Cenário | Base | Favorável | Stress | Pat Mediana |
|---------|------|-----------|--------|-------------|
| Ref: Solo Diego FIRE 53 (R$25k/mês, R$250k) | 90.8% | 94.1% | 86.8% | R$11.5M |
| C1: FIRE 53, R$250k, **sem floors** | 75.6% | 85.4% | 70.0% | R$9.3M |
| C2: FIRE 53, R$270k, **sem floors** | 73.2% | 83.6% | 66.7% | R$9.3M |
| **C3: FIRE 53, R$250k + floors Katia** | **91.5%** | **95.0%** | **89.0%** | R$9.3M |
| **C4: FIRE 53, R$270k + floors Katia** | **89.4%** | **93.9%** | **86.4%** | R$9.3M |
| **C5: FIRE 53, R$270k + floors Katia+Diego** | **91.7%** | **95.1%** | **88.8%** | R$9.3M |
| **C6: FIRE 53, R$270k + Katia 35a voluntária** | **92.5%** | **95.9%** | **90.1%** | R$9.1M |

*C6: Katia contribui INSS voluntário 5 anos pós-FIRE (R$1.700/mês × 60 = R$102k) → alíquota 100% → R$95.2k/ano. Pat mediana cai R$0.2M pelo custo, mas P(FIRE) sobe 3.1pp e INSS extra = R$10.5k/ano a partir de 2049.*

**Comparativo histórico (C4 equivalente, R$270k, FIRE 53):**
- Original (2026-03-27, saúde 7%, individual, sem floors): **65.4%**
- Recalibrado (2026-04-02, VCMH 2,7%, empresarial): **77.1%**
- HD-mc-audit completo (2026-04-06): **79.8%** (FIRE 55 — não inclui floors Katia)
- **Modelo correto FIRE 53 com floors (2026-04-12): 89.4%** (+9.6pp vs modelo anterior FIRE 55)

**Achado principal:** FIRE 53 com floors Katia = **MELHOR** que FIRE 55 sem floors. Os floors de Katia (+R$113.8k/ano from 2049) compensam com folga os 2 anos de acumulação perdidos.

### Voluntário INSS Katia — análise de custo-benefício

| Opção | INSS | Custo total | Break-even | P(C4) |
|-------|------|------------|-----------|-------|
| Para em 2040 (30a) | R$84.6k/ano | R$0 | — | 89.4% |
| Contribui 5a voluntária (35a) | R$95.2k/ano | R$102k | ~10 anos após 2049 (≈ 71a) | 92.5% |

**Recomendação:** voluntário compensa se expectativa de vida > ~71 anos — muito provável. Custo de R$102k ao longo de 5 anos (R$1.700/mês) é baixo no contexto do portfólio de R$9.3M.

---

## Análise de Sensibilidade

### VCMH (premissa mais incerta)

| VCMH | Saúde 2p aos 70 | P(base) C4 | Delta |
|------|----------------|-----------|-------|
| 2,7% (VCMH IESS — adotado) | R$101k | 78,7% | ref |
| 5% | ~R$155k | ~74% | −4-5pp |
| 7% (modelo antigo) | ~R$239k | ~65% | −14pp |

### Premissas com baixa confiança (revisitar)

| Premissa | Valor atual | Por que incerta |
|----------|------------|-----------------|
| Aportes por fase | R$15k/9k/16k | Estimativa — não testada na prática |
| Lifestyle casal R$250-290k | Nunca vivido | Inclui viagens etc., nunca validado |
| Casa R$1M Indaiatuba | Estimativa | Mercado não pesquisado |
| Katia aposenta com Diego (2040, 53a) | **Adotado (2026-04-12)** | Para de trabalhar em 2040. INSS com 30 anos: ~R$7.053/mês (R$84.6k/ano) a partir de 2049. PGBL ~R$492k no FIRE Day. Ver TX-inss-katia / TX-pgbl-katia. |
| Patrimônio Katia no FIRE | R$800k | ~R$492k PGBL + R$300k poupança própria (baixa confiança) |
| CNPJ Diego ativo pós-FIRE | Assumido | Risco: plano vai para individual (+40%) |

---

## Conclusão

**Principal mudança vs 2026-04-06:** modelo recalibrado em 2026-04-12 com Katia aposentando junto em 2040 (53a) + floors INSS/PGBL incluídos.

**Achados principais (modelo completo 2026-04-12):**
1. P(FIRE 53, R$270k + floors Katia) = **89.4%** — **acima** do threshold de 80% mesmo com FIRE 2 anos antes
2. P(FIRE 53, R$250k + floors Katia) = **91.5%** — acima do threshold de 90%
3. FIRE 53 com floors > FIRE 55 sem floors (89.4% vs 79.8%) — floors de Katia valem mais que 2 anos de acumulação
4. INSS Katia 30a = R$84.6k/ano (não R$93.6k) — ela para em 2040 com 30a contrib vs 39a se trabalhasse até 62
5. Voluntário 5a: +R$10.5k/ano extra, custo R$102k, break-even ~71a — compensa se expectativa > 71a
6. Bear market nos primeiros anos (pre-2049) continua sendo o risco dominante — INSS/PGBL só entram no ano 9

**Itens urgentes (independentes de cálculos):**
- Planejamento sucessório: testamento, regime de bens (patrimônio total ~R$7,86M)
- Seguro de vida: cobrir estate tax US-listed (~US$60k) + proteger Katia

**Quando revisar:** após lifestyle real testado (6-12 meses juntos) + casa escolhida + data de casamento definida.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **FIRE** | P(FIRE 53 casal, R$270k + floors) = **89.4%** base / 91.5% (R$250k). Evolução: 65,4% → 77,1% → 79,8% → **89.4%**. Ambos aposentam 2040. |
| **Estratégia** | Sem mudança de alocação. Avaliar INSS voluntário Katia (5a, R$102k) — compensa se expectativa > 71a. |
| **Conhecimento** | Floors Katia: INSS R$84.6k/ano + PGBL R$29.2k/ano = R$113.8k/ano from 2049 (ano 9). INSS Katia 30a (não 39a — para em 2040). |
| **Ação urgente** | Planejamento sucessório + seguro de vida — independente de cálculos. |

---

## Próximos Passos

- [ ] **Urgente (pré-casamento):** planejamento sucessório (testamento, regime de bens) + seguro de vida
- [ ] **Reabrir quando:** casa escolhida + lifestyle real testado + data de casamento definida
- [x] **Validado (2026-04-12):** Katia aposenta aos **62 anos (2049)**, não 65 — INSS ~R$7.800/mês real 2026. Ver TX-inss-katia.
- [x] **Concluído (2026-04-12):** MC casal com floors Katia rodado — P(FIRE 53, R$270k) = 89.4%. INSS Katia 30a = R$84.6k/ano (para em 2040). PGBL = R$29.2k/ano from 2049.
- [ ] **Modelar risco CNPJ:** se Diego encerrar PJ pós-FIRE, saúde sobe ~40% → testar P(FIRE) com esse cenário
