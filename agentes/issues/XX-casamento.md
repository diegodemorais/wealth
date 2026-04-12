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
| Patrimônio no FIRE 55 | ~R$800k estimado | Baixa |
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

## Cenários Monte Carlo — FIRE Casal (recalibrado 2026-04-06)

Script: `scripts/fire_montecarlo.py` com SAUDE_BASE=R$32k (2p) | 10k trajetórias | t-dist df=5 | seed 42
Modelo HD-mc-audit: spending smile ex-saúde + IR 15% nominal + INSS R$18k@65 (Diego) + vol bond pool 13.3%
**INSS Katia não incluído no MC atual:** ~R$93,6k/ano real 2026 a partir de 2049 (62 anos). Como o MC roda até 95 anos do Diego (2082) e o FIRE é 2040-2042, o INSS de Katia entra apenas na fase pós-2049 — reduz SWR requerido no tail. Incluir na próxima recalibração do MC casal.

**P(FIRE) por cenário:**

| Cenário | Aporte | FIRE | Pat Mediana | P(base) | vs 2026-04-02 | vs Original |
|---------|--------|------|------------|---------|---------------|-------------|
| Solo FIRE 53 (ref, SAUDE_BASE R$16k) | R$25k | 53 | R$11,53M | **90,8%** | +3,6pp | ref |
| C1: FIRE 53, R$250k lifestyle | R$15k | 53 | R$9,30M | 78,2% | +4,2pp | — |
| C2: FIRE 53, R$270k lifestyle | R$15k | 53 | R$9,30M | 75,6% | +3,9pp | — |
| **C3: FIRE 55, R$250k lifestyle** | R$15k | 55 | R$10,34M | **82,2%** | +2,1pp | +16,8pp |
| **C4: FIRE 55, R$270k lifestyle** | R$15k | 55 | R$10,34M | **79,8%** | +2,7pp | +14,4pp |
| C5: FIRE 55, R$290k lifestyle | R$15k | 55 | R$10,34M | 77,8% | +2,4pp | — |

**Comparativo histórico:**
- Original (2026-03-27, saúde 7%, 2p individual): C4 = **65,4%**
- Recalibrado (2026-04-02, VCMH 2,7%, 2p empresarial): C4 = **77,1%**
- Modelo completo (2026-04-06, HD-mc-audit): C4 = **79,8%**
- Ganho acumulado modelo correto: **+14,4pp**

### Decomposição do ganho

| Fator | Impacto estimado |
|-------|----------------|
| Saúde base: R$37,9k/pp → R$16k/pp (empresarial) | +7-8pp |
| VCMH 7% → 2,7% (crescimento muito mais lento) | +4-5pp |
| **Total** | **~+12pp** |

### Spending casal (C4 — FIRE 55, R$270k lifestyle)

| Ano FIRE | Idade | Lifestyle | Saúde 2p | Total |
|----------|-------|-----------|----------|-------|
| 0 | 55 | R$291k | R$48k | R$339k |
| 6 | 61 | R$291k | R$66k | R$357k |
| 11 | 66 | R$291k | R$86k | R$377k |
| 17 | 72 | R$231k | R$101k | R$332k |
| 30 | 85 | R$291k | R$71k (decay) | R$362k |

*Lifestyle escalado por 270/250 vs spending_smile base. Saúde 2p: VCMH 2,7%/ano + ANS faixas etárias discretas.*

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
| Katia aposenta aos 62 (2049) | **Validado** (TX-inss-katia, 2026-04-12) | Regra Definitiva EC 103/2019: 62 anos + 15 anos. INSS: ~R$7.800/mês real 2026 (R$93,6k/ano). Ver TX-inss-katia. |
| Patrimônio Katia no FIRE | R$800k | Depende de poupança dela até 2042 |
| CNPJ Diego ativo pós-FIRE | Assumido | Risco: plano vai para individual (+40%) |

---

## Conclusão

**Principal mudança vs 2026-03-27:** P(FIRE 55 casal) sobe de **65,4% → 79,8%** com modelo de saúde corrigido + HD-mc-audit.

**Achados principais (modelo completo 2026-04-06):**
1. P(FIRE 55, R$250k lifestyle) = **82,2%** — acima do threshold de 80%
2. P(FIRE 55, R$270k lifestyle) = **79,8%** — marginalmente abaixo do threshold
3. Saúde 2p na largada: R$32k (empresarial) vs R$75,8k (individual antigo) — −58%
4. VCMH 2,7%/ano real (correto) vs 7% (antigo) = crescimento muito mais lento
5. 80% base para o casal **é alcançável** com lifestyle R$250k — conclusão anterior ("estruturalmente fora de alcance") está REVOGADA
6. Bear market nos primeiros anos continua sendo o risco dominante

**Itens urgentes (independentes de cálculos):**
- Planejamento sucessório: testamento, regime de bens (patrimônio total ~R$7,86M)
- Seguro de vida: cobrir estate tax US-listed (~US$60k) + proteger Katia

**Quando revisar:** após lifestyle real testado (6-12 meses juntos) + casa escolhida + data de casamento definida.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **FIRE** | P(FIRE 55 casal) = 79,8% (R$270k) / 82,2% (R$250k) base — modelo HD-mc-audit completo. Evolução: 65,4% → 77,1% → 79,8%. |
| **Estratégia** | Sem mudança de alocação. Revisitar quando vida real do casal testada. |
| **Conhecimento** | Plano empresarial real (R$16k/pp, Bradesco SP) + VCMH 2,7% = base correta. Individual superestima em 2,4×. Ambos aposentam juntos = 2p desde FIRE Day. |
| **Ação urgente** | Planejamento sucessório + seguro de vida — independente de cálculos. |

---

## Próximos Passos

- [ ] **Urgente (pré-casamento):** planejamento sucessório (testamento, regime de bens) + seguro de vida
- [ ] **Reabrir quando:** casa escolhida + lifestyle real testado + data de casamento definida
- [x] **Validado (2026-04-12):** Katia aposenta aos **62 anos (2049)**, não 65 — INSS ~R$7.800/mês real 2026. Ver TX-inss-katia.
- [ ] **Na reabertura:** incluir INSS Katia (~R$93,6k/ano a partir de 2049) no MC casal — reduz SWR requerido no tail; rodar sensibilidade P(FIRE) com floor income conjunto
- [ ] **Modelar risco CNPJ:** se Diego encerrar PJ pós-FIRE, saúde sobe ~40% → testar P(FIRE) com esse cenário
