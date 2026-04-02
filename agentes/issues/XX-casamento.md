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
| **Concluido em** | 2026-04-02 (recalibrado com modelo de saúde correto) |

---

## Motivo / Gatilho

`carteira.md` registra: casamento iminente ~2026-2027, filho previsto ~2028. Gatilho ativo desde 2026-03-24. Issue foi executada em 2026-03-27 com premissas de saúde **incorretas** (SAUDE_BASE R$37,9k + 7%/ano). Recalibrada em 2026-04-02 com:
- `SAUDE_BASE = R$16k` (plano empresarial coletivo PJ — cotação real Bradesco SP, age 53)
- `SAUDE_INFLATOR = 2,7%/ano real` (VCMH IESS, 18 anos)
- Katia: CLT com plano empresarial — **custo zero para o casal** enquanto ela trabalha (~12 anos pós-FIRE Diego)
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

| Idade | Saúde Novo (1p→2p) | Saúde Antigo (2p desde FIRE) | Delta |
|-------|---------------------|------------------------------|-------|
| 53 (FIRE Day) | R$16.000 (Diego; Katia = CLT) | R$75.800 | −R$59.800 |
| 55 | R$22.500 | R$86.800 | −R$64.300 |
| 59 | R$31.300 | R$113.800 | −R$82.500 |
| 64 | R$42.900 | R$159.500 | −R$116.600 |
| **65 (Katia retira)** | **R$88.100** | **R$170.700** | −R$82.600 |
| 70 | R$100.700 | R$239.400 | −R$138.700 |
| 83+ (no-go) | ~R$71.000 | ~R$288.500 | −R$217.500 |

**Key insight:** Modelo antigo assumia 2 planos individuais desde o FIRE Day. Novo modelo reconhece que Katia tem plano CLT por ~12 anos → custo zero para o casal até Diego ter 65 anos. A partir daí, os dois precisam de cobertura própria — mas com VCMH 2,7% (não 7%), o crescimento é muito mais lento.

---

## Cenários Monte Carlo — FIRE Casal (recalibrado 2026-04-02)

Script: `scripts/fire_montecarlo.py` adaptado + saúde casal inline | 10k trajetórias | t-dist df=5 | seed 42

**P(FIRE) por cenário:**

| Cenário | Aporte | FIRE | Pat Mediana | P(base) | vs Antigo |
|---------|--------|------|------------|---------|-----------|
| Solo FIRE 53 (referência) | R$25k | 53 | R$11,53M | 87,2% | ref |
| C1: FIRE 53, R$250k lifestyle | R$15k | 53 | R$9,30M | 75,1% | — |
| C2: FIRE 53, R$270k lifestyle | R$15k | 53 | R$9,30M | 73,0% | — |
| **C3: FIRE 55, R$250k lifestyle** | R$15k | 55 | R$10,34M | **80,7%** | +15,3pp |
| **C4: FIRE 55, R$270k lifestyle** | R$15k | 55 | R$10,34M | **78,7%** | +13,3pp |
| C5: FIRE 55, R$290k lifestyle | R$15k | 55 | R$10,34M | 76,4% | — |

**Comparativo com análise anterior (2026-03-27):**
- C5 antigo (FIRE 55, R$250k, saúde 7%, 2p desde o início): P(base) = **65,4%**
- C4 novo (FIRE 55, R$270k, VCMH 2,7%, Katia CLT 12 anos): P(base) = **78,7%**
- Ganho do modelo corrigido: **+13pp**

### Decomposição do ganho

| Fator | Impacto estimado |
|-------|----------------|
| Saúde Diego: R$37,9k → R$16k | +5-6pp |
| Katia CLT (zero custo anos 0-11) | +5-6pp |
| VCMH 7% → 2,7% (crescimento lento) | +2-3pp |
| **Total** | **~+13pp** |

### Spending casal (C4 — FIRE 55, R$270k lifestyle)

| Ano FIRE | Idade | Lifestyle | Saúde 1p→2p | Total |
|----------|-------|-----------|-------------|-------|
| 0 | 55 | R$291k | R$24k (Diego) | R$315k |
| 12 | 67 | R$231k | R$109k (2p) | R$340k |
| 17 | 72 | R$231k | R$122k (2p) | R$353k |
| 30 | 85 | R$291k | R$71k (decay) | R$362k |

*Lifestyle escalado por 270/250 vs spending_smile base*

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
| Katia aposenta aos 65 | Estimativa | Pode ser antes (FIRE junto?) |
| Patrimônio Katia no FIRE | R$800k | Depende de poupança dela até 2042 |
| CNPJ Diego ativo pós-FIRE | Assumido | Risco: plano vai para individual (+40%) |

---

## Conclusão

**Principal mudança vs 2026-03-27:** P(FIRE 55 casal) sobe de **65,4% → 78,7%** com modelo de saúde corrigido. A premissa de 2 planos individuais desde o FIRE Day estava errada — Katia tem plano CLT por ~12 anos.

**Achados principais:**
1. P(FIRE 55, R$270k lifestyle) = **78,7%** — próximo do threshold 80%
2. P(FIRE 55, R$250k lifestyle) = **80,7%** — atinge o threshold
3. VCMH 2,7% (correto) vs 7% (antigo) = ganho de ~3pp estrutural
4. Katia CLT = cobertura gratuita por 12 anos = maior ganho individual (~5-6pp)
5. Bear market nos primeiros anos continua sendo o risco dominante
6. 80% base para o casal **é alcançável** — ao contrário da conclusão anterior ("estruturalmente fora de alcance")

**Itens urgentes (independentes de cálculos):**
- Planejamento sucessório: testamento, regime de bens (patrimônio total ~R$7,86M)
- Seguro de vida: cobrir estate tax US-listed (~US$60k) + proteger Katia

**Quando revisar:** após lifestyle real testado (6-12 meses juntos) + casa escolhida + data de casamento definida.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **FIRE** | P(FIRE 55 casal) = 78,7% (R$270k) / 80,7% (R$250k) base. Modelo anterior (65,4%) estava errado — saúde 2p corrigida. |
| **Estratégia** | Sem mudança de alocação. Revisitar quando vida real do casal testada. |
| **Conhecimento** | Katia CLT = cobertura gratuita ~12 anos = maior fator do gap. VCMH 2,7% (não 7%) = crescimento lento. |
| **Ação urgente** | Planejamento sucessório + seguro de vida — independente de cálculos. |

---

## Próximos Passos

- [ ] **Urgente (pré-casamento):** planejamento sucessório (testamento, regime de bens) + seguro de vida
- [ ] **Reabrir quando:** casa escolhida + lifestyle real testado + data de casamento definida
- [ ] **Na reabertura:** validar premissa "Katia aposenta aos 65" — se ela aposentar mais cedo, saúde 2p começa antes; rodar sensibilidade
- [ ] **Modelar risco CNPJ:** se Diego encerrar PJ pós-FIRE, saúde sobe ~40% → testar P(FIRE) com esse cenário
