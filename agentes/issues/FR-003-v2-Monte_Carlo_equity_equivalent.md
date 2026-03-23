# FR-003-v2-Monte_Carlo_equity_equivalent: Monte Carlo revisado — equity equivalent do tilt fatorial

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-003-v2-Monte_Carlo_equity_equivalent |
| **Dono** | 04 FIRE |
| **Status** | Backlog |
| **Prioridade** | Media |
| **Participantes** | 02 Factor, 10 Advocate, 11 Quant |
| **Dependencias** | FR-003 (concluído) |
| **Criado em** | 2026-03-23 |
| **Origem** | Análise UCITS factor ETFs.xlsx — gap identificado no FR-003 |
| **Concluido em** | — |

---

## Motivo / Gatilho

FR-003 (Monte Carlo 10k trajetórias) modelou o portfólio de Diego como **79% equity genérico**. O Monte Carlo não diferencia entre equity MCW e equity factor-tilted — trata os dois com o mesmo retorno esperado de base.

A análise do UCITS factor ETFs.xlsx (planilha quantitativa da comunidade RR) identificou um gap: portfólios factor-tilted têm retorno esperado maior por unidade de equity, o que impacta diretamente o design do bond tent e do glidepath.

---

## Descrição

### O gap no FR-003

O FR-003 usou premissas de retorno de equity baseadas em histórico/RA sem diferenciar que o portfólio de Diego tem **tilt fatorial significativo** (AVGS, AVEM, JPGL). Isso subestima o retorno esperado do portfólio e, consequentemente, pode estar superdimensionando a alocação mínima de equity necessária para atingir FIRE.

### O conceito de "equity equivalent"

A planilha calcula quantos % de equity um portfólio factor-tilted precisa para ter o **mesmo prêmio esperado que 100% MCW** (ex: IWDA puro):

| Portfolio | Equity equivalente |
|-----------|-------------------|
| JPGL + DFA GTV (85% DM / 15% EM) | 68.4% |
| Avantis estimado (AVGS+AVEM) + JPGL | **58.3%** |

**Interpretação**: Com AVGS + AVEM + JPGL, você precisaria de apenas ~58% equity para ter o mesmo prêmio esperado que 100% MCW. Os outros ~42% poderiam estar em RF sem sacrificar retorno esperado.

### Implicação para Diego

Diego está em ~79% equity com tilt fatorial. FR-003 trata isso como "79% equity MCW" para fins de projeção. Se o tilt fatorial entrega mais retorno por unidade de equity, então:

1. A probabilidade de sucesso (SR) do FR-003 pode estar **conservadoramente subestimada**
2. O bond tent pós-FIRE pode ser **mais generoso** do que o modelo atual presume (potencialmente até ~35-40% RF) sem degradar P(FIRE)
3. O glidepath de acumulação pode ser diferente se retorno esperado é maior

---

## Escopo

- [ ] Recalcular premissa de retorno esperado do portfólio de Diego usando factor loadings ao vivo (JPGL FF6) e estimativas para AVGS/AVEM
- [ ] Comparar: retorno esperado FR-003 (base) vs retorno com fator premium completo vs com 30% haircut
- [ ] Rerodar Monte Carlo com premissas ajustadas (ou ajustar inputs do FR-003)
- [ ] Usar **Sortino ratio como métrica primária** (não Sharpe) — Diego só se importa com downside risk. Ref: Chicago Booth Work Session (Sortino-optimal mais robusto que Sharpe-optimal em todos os cenários testados)
- [ ] Calcular impacto na SR para R$250k, R$300k, R$350k/ano
- [ ] Calcular impacto no bond tent: qual % máximo de RF mantém SR >= 90%?
- [ ] Advocate stress-test: e se os factor premiums não se realizarem? (cenário "only ERP")
- [ ] Quant validar metodologia e cálculos

---

## Análise

### Dados da planilha UCITS factor ETFs.xlsx

**Factor premia usados (anualizados, histórico completo):**
| Fator | Premium histórico | Com 30% haircut | Só ERP |
|-------|------------------|-----------------|--------|
| RmRf | 5.13% | 5.13% | 5.13% |
| SmB | 1.78% | 1.25% | 0% |
| HmL | 3.67% | 2.57% | 0% |
| RmW | 3.67% | 2.57% | 0% |
| CmA | 3.67% | 2.57% | 0% |
| WmL | 8.64% | 4.32% | 0% |

**JPGL factor loadings ao vivo (FF6):**
- RmRf: 1.042, SmB: 0.355, HmL: 0.226, RmW: 0.227, CmA: 0.167, UmD: -0.025

**Retorno esperado do portfólio modelo (85% DM / 15% EM, JPGL + GTV):**
- Prêmio aritmético (histórico completo): 7.36%
- Prêmio com 30% haircut: 6.66%
- Apenas ERP (sem fatores): 4.84%
- Sharpe estimado: 0.44

**Âncora ERP: Dimson-Marsh-Staunton 2021**
- Real ERP global (geométrico): 5.3%/ano
- ERP sobre bonds: 3.1%/ano

---

## Conclusão

> Preencher ao executar.

---

## Resultado

> Preencher ao executar.

---

## Próximos Passos

- [ ] Agendar para revisão mensal ou issue standalone se P(FIRE) mudar >2pp
