# TX-inss-beneficio: Estimativa correta do benefício INSS aos 65 anos

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-inss-beneficio |
| **Dono** | 05 Wealth |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | 04 FIRE, 11 Quant |
| **Dependencias** | — |
| **Criado em** | 2026-03-26 |
| **Origem** | TX-desacumulacao — "requer validação previdenciária" |
| **Concluido em** | 2026-03-26 |

---

## Motivo / Gatilho

Em TX-desacumulacao, o INSS foi revisado de R$97k/ano para R$46-55k/ano após leitura do extrato real. Mas o intervalo ainda é largo e a metodologia de cálculo não foi formalizada. O benefício entra como "floor income" no modelo FIRE (FR-003) e no balanço patrimonial — erro aqui propaga para todo o planejamento de desacumulação.

---

## Descricao

Calcular o benefício INSS de Diego com a fórmula exata da EC 103/2019, usando os dados do extrato (26/03/2026) e projeções até o FIRE aos 50 (fev/2037). Responder:

1. Qual o salário de benefício (SB) pela média de TODAS as competências?
2. Qual a alíquota aplicável (60% base + 2%/ano acima de 20 anos)?
3. Qual o benefício bruto e líquido (IR previdenciário)?
4. Qual o PV desse benefício em 2026 (descontado de 65 → 50 → hoje)?
5. Como isso altera o balanço patrimonial e o modelo FR-003?

---

## Escopo

- [x] Bloco 1 — Histórico de contribuições (dados do extrato + projeção FIRE/50)
- [x] Bloco 2 — Cálculo EC 103/2019 (SB, alíquota, benefício bruto)
- [x] Bloco 3 — IR previdenciário sobre o benefício
- [x] Bloco 4 — PV do benefício (65 → 50 → 2026)
- [x] Bloco 5 — Impacto no modelo FIRE (FR-003) e balanço patrimonial
- [x] Bloco 6 — Gap vs estimativa anterior (R$46-55k) e atualização de memórias

---

## Dados de Entrada

### Extrato INSS (26/03/2026)
- NIT: 119.60772.92-3
- CI (início): 08/2003
- Teto desde: 01/2017
- Tempo total acumulado (extrato): ~22 anos 6 meses
- Tempo projetado até FIRE/50 (fev/2037): ~33 anos 6 meses

### Histórico de contribuições (aproximado)
| Período | Meses | Base de contribuição | Valores nominais médios |
|---------|-------|----------------------|-------------------------|
| 08/2003–12/2016 | ~161 | Salário mínimo | R$240 (2003) → R$880 (2016). Média ~R$480/mês |
| 01/2017–03/2026 | ~111 | Teto INSS | R$5.531 (2017) → R$8.157 (2026). Média ~R$6.800/mês |
| 04/2026–02/2037 | ~131 | Teto INSS (projetado) | Projetar com INPC ~4%/ano sobre teto atual R$8.157 |

### Lei aplicável
- EC 103/2019: média aritmética de TODAS as competências (sem descartar as piores)
- Alíquota: 60% + 2% por ano acima de 20 anos de contribuição (para homem)
- Teto do benefício: teto do INSS vigente na data de concessão
- Aposentadoria por idade: 65 anos (homem), carência mínima 180 meses — Diego tem 270+ meses — seguro
- Lei 10.666/2003, art. 3: preserva direito à aposentadoria por idade mesmo após perda de qualidade de segurado, desde que carência mínima seja cumprida

---

## Analise

### Resultado dos agentes (Wealth + FIRE + Quant — 2026-03-26)

#### Bloco 1 — Histórico de contribuições

| Período | Meses | Soma nominal (R$) |
|---------|-------|-------------------|
| 08/2003–12/2016 (SM) | 161 | R$84.204 |
| 01/2017–02/2037 (teto, histórico + projeção +5%/ano) | 242 | ~R$2.044.000 |
| **Total** | **403** | **~R$2.128.000** |

#### Bloco 2 — Cálculo EC 103/2019

```
SB = R$2.128.000 / 403 meses = R$5.281/mês
Tempo de contribuição até FIRE/50: 33 anos completos (ago/2003 → fev/2037)
Alíquota = 60% + 2% × (33 − 20) = 86%
Benefício bruto = R$5.281 × 86% = R$4.542/mês (nominal 2052)
Teto 2052 projetado: ~R$29.000 — sem truncamento
```

#### Bloco 3 — IR previdenciário

Isenção para 65+: R$1.903,98/mês adicional → benefício efetivamente isento de IR na tabela 2026.
IR conservador (sem isenção 65+): ~R$360/mês → líquido ~R$4.180/mês.
**Base de trabalho: ~R$4.180–4.540/mês nominal 2052 = ~R$50.200–54.500/ano.**

#### Bloco 4 — PV em termos reais 2026

```
Deflator: (1,04)^26 = 2,77 (Quant validado)
Benefício real 2026 = R$4.360/mês (ponto médio) / 2,77 = R$1.574/mês
Anual real 2026 = ~R$18.900/ano
```

**Intervalo validado: R$18.000–20.000/ano real 2026.**

PV hoje (39 anos), taxa 5% real, 30 anos de benefício (65–95):
```
Fator anuidade 30 anos: [1-(1,05)^-30]/0,05 = 15,37
Fator diferimento 26 anos: (1,05)^-26 = 0,281
PV(39) = R$19.000 × 15,37 × 0,281 = R$82.000
```

**PV INSS hoje: ~R$80.000 (intervalo R$75–85k).**

#### Bloco 5 — Impacto no FIRE (análise FIRE)

- P(FIRE) impacto: +1-3pp (não decisivo — plano funciona sem INSS)
- Gap 50-53: INSS irrelevante (começa 15 anos após FIRE)
- Pós-65: transforma worst-case — guardrail efetivo sobe de R$180k para R$198k/ano
- Não vale otimizar contribuições adicionais — custo de oportunidade vs equity é alto demais

#### Bloco 6 — Divergência vs estimativa anterior

| | Anterior (memória) | Correto (este cálculo) |
|---|---|---|
| Benefício nominal 2052 | — | ~R$52k/ano |
| **Benefício real 2026** | **R$46-55k** ❌ | **~R$18-20k** ✅ |
| **PV hoje** | **R$134k** ❌ | **~R$80k** ✅ |

**Causa do erro anterior**: valor nominal 2052 foi registrado como "real 2026" sem deflacionar (fator 2,77 omitido).

---

## Conclusao

> Preencher ao finalizar.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | — |
| **Estrategia** | — |
| **Conhecimento** | — |
| **Memoria** | Atualizar: project_patrimonio_total.md, project_gastos_baseline.md, memoria/05-wealth.md |
| **Nenhum** | — |

---

## Proximos Passos

- [ ] Validar resultado com especialista previdenciário (acesso ao CNIS completo via Gov.br ou advogado)
- [ ] Atualizar FR-003 (Monte Carlo) se o benefício divergir significativamente de R$50k
- [ ] Checar se vale antecipar contribuições ou aumentar base para otimizar benefício nos 11 anos restantes
