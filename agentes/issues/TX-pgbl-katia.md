# TX-pgbl-katia: PGBL Katia — projeção e otimização do plano com match 100% da empresa

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-pgbl-katia |
| **Dono** | 05 Wealth |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | 04 FIRE, 11 Quant |
| **Co-sponsor** | Head |
| **Dependencias** | TX-inss-katia |
| **Criado em** | 2026-04-12 |
| **Origem** | Screenshots PGBL Icatu (Novus do Brasil) — Diego confirmou match 100% empresa + reajuste com salário |
| **Concluido em** | 2026-04-12 |

---

## Dados do Plano (abril/2026)

| Campo | Valor |
|-------|-------|
| **Seguradora** | Icatu Seguros |
| **Tipo** | PGBL Progressivo |
| **Empresa** | Novus do Brasil |
| **Saldo total** | R$ 57.159 (R$30.987 + R$26.172) |
| **Contrib. participante/mês** | R$ 845,29 |
| **Contrib. empresa/mês** | R$ 850 (5% do salário base de R$17k) |
| **Total mensal** | R$ 1.695 |
| **Total anual** | R$ 20.340 |
| **Como % do salário bruto** | 5% empresa fixo (base R$17k) + 4,7% Katia (atual) |
| **Reajuste** | Acompanha aumentos salariais (mínimo dissídio ≈ INPC) |
| **Rentabilidade 12m** | +13,7% nominal (média dos dois fundos) |

### Fundos
| Fundo | Saldo | Rent. 12m |
|-------|-------|-----------|
| Icatu Seg FIC de FI Empresarial Renda Fixa | R$ 30.987 | +13,99% |
| ICATU SEG CLASSIC FIC RENDA FIXA | R$ 26.172 | +13,43% |

---

## Análise

### Retorno real implícito atual
- Nominal 12m: ~13,7%
- INPC ~4,8% → **Real ~8,5%** (muito acima do equilíbrio de longo prazo)
- Para projeção de longo prazo, usar **4,5% real/ano** (CDI real normalizado ~5%, net de taxa)

### Alavancagem do match
O match da empresa é fixo em **5% do salário base (R$17k = R$850/mês)** — independe de quanto Katia contribui. Katia não deveria reduzir sua contribuição abaixo de R$850/mês: qualquer redução é destruição direta de R$850/mês de benefício imediato. Por outro lado, aumentar a contribuição de Katia acima de R$850/mês **não traz match adicional** — só o benefício fiscal da dedução PGBL.

### Benefício fiscal (PGBL)
- Contribuição dedutível Katia: R$10.200/ano (12 × R$850)
- Match empresa R$10.200/ano: **NÃO é dedutível na declaração de Katia** (benefício da empresa, não dela)
- Limite 12% da renda bruta: 12% × R$216.000 = **R$25.920/ano**
- **Gap não utilizado: R$15.720/ano** — pode ampliar com aportes voluntários, sem match adicional
- Katia provavelmente na alíquota 27,5% → economia fiscal atual: ~R$2.805/ano
- Se maximizasse o limite com aportes próprios: **~R$7.128/ano de economia fiscal** (dedução total R$25.920 × 27,5%)

---

## Projeção — Valores Reais (R$ 2026)

**Premissas:**
- Saldo atual: R$57.159
- Contribuição anual real: R$20.287 (indexada ao salário → constante em termos reais)
- Retorno real: 4,5%/ano
- Tributo mínimo no resgate: ~15% (tabela progressiva em retirada mensal de renda moderada)

### Cenário A — Contribuições param no FIRE Day de Diego (~2040, 14 anos)

```
FV = 57.159 × (1,045)^14 + 20.287 × [(1,045)^14 − 1] / 0,045
   = 57.159 × 1,852 + 20.287 × 18,93
   = 105.858 + 384.030
   = R$ 489.888 ≈ R$ 490k real 2026
```

Cresce dos 53 aos 62 anos (9 anos, sem novas contribuições):
```
R$ 490k × (1,045)^9 = R$ 490k × 1,486 = R$ 728k real 2026
```

**Saldo na aposentadoria (2049): ~R$ 728k real 2026**

### Cenário B — Katia contribui até aposentadoria (2049, 23 anos)

```
FV = 57.159 × (1,045)^23 + 20.287 × [(1,045)^23 − 1] / 0,045
   = 57.159 × 2,752 + 20.287 × 38,94
   = 157.305 + 790.373
   = R$ 947.678 ≈ R$ 948k real 2026
```

**Saldo na aposentadoria (2049): ~R$ 948k real 2026**

### Renda anual de retirada (SWR 4%)

| Cenário | Saldo 2049 | Bruto/ano | Líquido/ano (~15% IR) |
|---------|------------|-----------|----------------------|
| A (para em 2040) | ~R$728k | ~R$29k | ~R$25k |
| B (trabalha até 2049) | ~R$948k | ~R$38k | ~R$32k |

### Impacto no patrimônio Katia no FIRE Day (2040)

Saldo PGBL em 2040 (Cenário A): **~R$490k** — componente relevante do R$800k estimado em XX-casamento.

---

## Flags e Otimizações

### 1. PGBL Progressivo vs Regressivo
- **Progressivo**: alíquota na retirada conforme tabela (pode ser 0-27,5%)
- **Regressivo**: 10% flat após 10 anos de acumulação
- Para novo dinheiro (de hoje em diante), se Katia pretende manter até 2049 (23 anos), **Regressivo** é potencialmente melhor — contribuições novas já chegam aos 10% com folga
- Contribuições antigas (R$57k já acumulados) ficam no regime atual
- **Ação sugerida:** avaliar abertura de portabilidade parcial para plano Regressivo para novas contribuições

### 2. Maximizar dedução PGBL
- Limite dedutível: R$25.920/ano (12% × R$216k renda bruta anual) vs contribuição atual de Katia R$10.200/ano (12 × R$850)
- Match empresa: R$10.200/ano **fixo** (5% × R$17k × 12) — NÃO aumenta com mais contribuição de Katia
- Gap total dedutível não usado: R$15.720/ano — Katia poderia aportar adicionalmente sem match
- Para o gap adicional: o único benefício é a dedução de 27,5% no IRPF → R$27k de dedução adicional = ~R$7.425 de IR economizado/ano
- **Ação sugerida:** avaliar aporte voluntário adicional de até R$1.310/mês (para completar o limite de 12%) — mas esse aporte extra **não tem match**, apenas benefício fiscal

### 3. Portabilidade / Troca de emprego
- Se Katia mudar de emprego, o saldo é portátil (segue ela, não a empresa)
- O match da empresa para quando ela sair
- **Flag:** no contexto do FIRE Day conjunto, o match para anos antes — não há custo em não maximizar o PGBL após o FIRE

---

## Conclusão

| Tipo | Detalhe |
|------|---------|
| **Conhecimento** | Saldo R$57k, contribuição R$1.691/mês (match 100%), indexado a INPC. Saldo na aposentadoria: R$728k (para em 2040) ou R$948k (trabalha até 62). Renda líquida adicional: R$25–32k/ano real 2026. |
| **Impacto FIRE** | PGBL é ~R$490k do R$800k estimado de patrimônio Katia no FIRE Day 2040. Premissa carteira.md atualizada. |
| **Otimização** | Dois vetores: (1) avaliar Regressivo para novos aportes; (2) maximizar até 12% da renda bruta para dedução IRPF |
| **Premissa** | Adicionado em `agentes/contexto/carteira.md` e `XX-casamento.md` |

---

## Próximos Passos

- [ ] **Avaliar Regressivo:** Katia abre portabilidade para plano Regressivo com novos aportes (antigas contribuições ficam no Progressivo existente)
- [ ] **Otimizar dedução:** avaliar aporte voluntário adicional de até R$1.310/mês (total Katia = R$2.160, completando 12% × R$18k) — R$15.720/ano a mais de dedução, sem match adicional, só benefício fiscal
- [ ] Ao modelar MC casal pós-casamento: incluir PGBL como ativo adicional de Katia (R$490k no FIRE Day, R$728k aos 62)
- [ ] Reavaliar premissa de aporte casal (R$15k/mês) — o PGBL Katia já representa R$1.691/mês de poupança "automática" não contabilizada nos aportes do modelo atual
