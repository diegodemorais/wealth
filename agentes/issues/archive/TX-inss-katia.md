# TX-inss-katia: Benefício INSS de Katia — cálculo baseado no extrato real

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-inss-katia |
| **Dono** | 05 Wealth |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | 04 FIRE, 11 Quant |
| **Co-sponsor** | Head |
| **Dependencias** | TX-inss-beneficio (Diego — metodologia) |
| **Criado em** | 2026-04-12 |
| **Origem** | Extrato INSS de Katia Rabay adicionado ao projeto (analysis/raw/Extrato INSS.pdf) |
| **Concluido em** | 2026-04-12 |

---

## Motivo / Gatilho

Extrato INSS de Katia Rabay (NIT 129.35576.25-1, emitido 22/01/2025) incorporado ao projeto. Diego confirmou que Katia continuou contribuindo no teto após a data do extrato. Com casamento iminente (2026-2027) e filho previsto (~2028), o INSS de Katia passa a ser parte do planejamento patrimonial conjunto — é um income floor familiar pós-2049 relevante.

---

## Dados de Entrada

### Extrato INSS (22/01/2025)
- **NIT**: 129.35576.25-1 | **CPF**: 369.484.498-83
- **Nascimento**: 27/11/1987 (38 anos em 04/2026)
- **Vínculos**:

| Seq | Empresa | Período | Meses |
|-----|---------|---------|-------|
| 1 | PMS Informática | 08/2006–10/2007 | 15 |
| 2+3 | E.J. + URBINA (contínuo) | 02/2009–11/2013 | 58 |
| 4+5 | BAHIA + NOVUS (contínuo) | 06/2016–12/2024 | 103 |
| — | Continuação no teto (confirmado) | 01/2025–04/2026 | 16 |

- **Total acumulado (04/2026)**: **192 meses = 16 anos**
- **Lacunas**: 11/2007–01/2009 (~14 meses) + 12/2013–05/2016 (~30 meses)

### Valores Consolidados (teto — confirmados no extrato)
| Ano | Mensal |
|-----|--------|
| 2020 | R$ 6.101,06 |
| 2021 | R$ 6.433,57 |
| 2022 | R$ 7.087,22 |
| 2023 | R$ 7.507,49 |
| 2024 | R$ 7.786,02 |

Katia está no teto do INSS desde pelo menos 2020 (provavelmente desde 2016-2017, quando salários no extrato já superavam o teto).

---

## Analise

### Regra aplicável — EC 103/2019

Katia contribuiu antes de 13/11/2019 → elegível para regras de transição + regra definitiva.

**Regra de Transição — Pontos (Art. 18):**
- Mulher: mínimo 30 anos de contribuição + (idade + anos contribuição) ≥ 100 pontos
- Pontos atuais (04/2026): 38 + 16 = 54
- Ganho: 2 pontos/ano (1 de idade + 1 de contribuição)
- Para atingir 100 pontos: (100 − 54) / 2 = **23 anos → abril/2049 (61 anos e 4 meses)**
- 30 anos de contribuição: atingido em ~2040 (53 anos) ✓

**Regra Definitiva (Art. 19):**
- Mulher: 62 anos + 15 anos de contribuição
- Katia completa 62 anos: **27/11/2049**
- Carência de 15 anos: **já atingida** ✓

**Melhor opção: Regra de Pontos → aposentadoria ~04/2049 (≈61 anos)**
Diferença vs Regra Definitiva: ~7 meses. Para planejamento: **usar 62 anos / 2049.**

---

### Cálculo do benefício

**Tempo de contribuição na aposentadoria (04/2049):**
- Acumulado hoje: 192 meses
- Projeção 04/2026 → 04/2049: 276 meses (23 anos no teto)
- **Total: 468 meses ≈ 39 anos**

**Alíquota:**
```
60% + 2% × (39 − 15) = 60% + 48% = 108% → capped em 100% do SB
```
Katia atinge 35 anos de contribuição por volta de 2045 (57 anos) — a partir daí o benefício = 100% do SB independentemente.

**Salário de Benefício (SB) — real R$2026:**

A EC 103/2019 usa a média de *todas* as competências corrigidas por INPC. Em termos reais (relativos ao teto de cada época), as contribuições de Katia se dividem em:

| Bloco | Meses | Ratio ao teto (época) | Teto-meses |
|-------|-------|-----------------------|------------|
| 2006–2007 (início carreira) | 15 | ~25% | 3,8 |
| 2009 (E.J., baixo) | 3 | ~20% | 0,6 |
| 2009–2011 (URBINA crescendo) | 29 | ~45% | 13,1 |
| 2012–2013 (URBINA, próx./teto) | 26 | ~90% | 23,4 |
| 2016–2017 (BAHIA, teto) | 15 | ~100% | 15,0 |
| 2017–2049 (NOVUS + cont., teto) | 380 | 100% | 380,0 |
| **Total** | **468** | — | **435,9** |

```
SB = 435,9 / 468 = 93,1% × teto
```

**Teto do INSS 2026 (estimado):** ~R$8.500/mês (R$7.786 em 2024 × INPC ~4,7% × 2 anos)

```
Benefício = min(100% × SB, teto) = 93% × R$8.500 ≈ R$7.900/mês real 2026
Anual: ~R$94.800/ano real 2026
```

**Intervalo de confiança:** R$7.500–8.000/mês (R$90–96k/ano real 2026)

**Ponto central:** **~R$7.800/mês = R$93.600/ano real 2026**

---

### IR sobre o benefício

Isenção para maiores de 65 anos (2026): R$1.904/mês.
- Excesso tributável: R$7.800 − R$1.904 = R$5.896 → IR ~R$820/mês
- **Líquido: ~R$6.980/mês (R$83.760/ano) real 2026**

Nota: regra de isenção pode mudar até 2049 — usar bruto (R$7.800/mês) como premissa conservadora.

---

### PV em termos reais 2026

```
Taxa real de desconto: 5% a.a.
Anuidade: 30 anos de benefício (62–92 anos)
Fator anuidade 30a: [1−(1,05)^-30] / 0,05 = 15,37
Início em 23 anos (2049): fator diferimento = (1,05)^-23 = 0,307

PV = R$93.600 × 15,37 × 0,307 = ~R$441.000
```

**PV do INSS de Katia hoje: ~R$440k (intervalo R$400–480k).**

---

### Comparação com INSS de Diego

| | Diego | Katia |
|---|---|---|
| Carência mínima (quando) | Atingida | Atingida |
| Aposentadoria (ano) | 65 anos / ~2052 | 62 anos / **2049** |
| Tempo contribuição | ~33 anos (para no FIRE/50) | ~39 anos (trabalha até 62) |
| SB / teto | ~76% (SM diluindo 2003-2016) | **~93%** (teto desde 2013-2016) |
| Benefício anual real 2026 | R$18–20k/ano | **R$90–96k/ano** |
| PV hoje | ~R$80k | **~R$440k** |

**Katia tem benefício ~5× maior que Diego** porque: (1) atingiu o teto mais cedo (carreira mais rápida), (2) trabalha até 62 (vs FIRE aos 50), (3) menos anos de SM na base de cálculo.

---

### Impacto no planejamento conjunto

- **Pós-2049:** renda de ~R$7.800/mês = R$93,6k/ano de floor income familiar — transforma o worst-case do plano conjunto
- **Gap 2040–2049:** INSS de Katia não disponível durante o early FIRE de Diego (9 anos)
- **Não altera alocação de Diego agora** — o plano FIRE/50 funciona independentemente
- **Implicação pós-casamento:** ao modelar o plano conjunto pós-2027, INSS de Katia entra como income floor a partir de 2049 (~R$7,8k/mês real), reduzindo SWR requerido na fase final

---

## Conclusao

### Veredicto Ponderado

| Agente | Peso | Posição |
|--------|------|---------|
| Head | 1x | R$7.800/mês real, 62 anos |
| Wealth (TX) | 3x | SB = 93% teto, ponto central R$7.800 |
| FIRE | 2x | Floor income relevante pós-2049, não muda plano FIRE/50 |
| Quant | 2x | Metodologia EC 103/2019 consistente com TX-inss-beneficio |

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | Nenhuma |
| **Estratégia** | INSS de Katia tratado como income floor familiar pós-2049 (não como pilar do FIRE/50 de Diego) |
| **Conhecimento** | Benefício: ~R$7.800/mês bruto (R$6.980 líquido) real 2026. Aposentadoria ~2049 (62 anos). SB = 93% teto. PV hoje ~R$440k. Benefício ~5× maior que Diego por carreira mais rápida + trabalha até 62. |
| **Premissa** | Adicionado `INSS Katia` em `agentes/contexto/carteira.md` |

---

## Proximos Passos

- [ ] **Especialista previdenciário** (recomendado): validar com CNIS completo via Meu INSS + tabela INPC oficial — estimativa atual tem margem ±10%
- [ ] Ao casar: integrar INSS de Katia no modelo MC conjunto (floor income +R$93k/ano a partir de 2049)
- [ ] Verificar se Art. 15 (fator previdenciário) pode ser mais vantajoso para Katia (como identificado para Diego em TX-inss-beneficio)
- [ ] Atualizar extrato no Meu INSS após 12 meses para refletir contribuições 2025-2026
