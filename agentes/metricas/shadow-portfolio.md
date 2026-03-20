# Shadow Portfolios — Contrafactuais

> Atualizado em: 2026-03-20
> Baseline (T0): 2026-03-20

---

## Objetivo

Dois portfolios contrafactuais que respondem a pergunta: "A complexidade da carteira de Diego gera valor?"

Se a carteira real nao bater ambos os shadows ao longo do tempo, a complexidade (factor tilts, multiplos ETFs, gatilhos, cripto) esta destruindo valor em vez de criar.

---

## Shadow A: VWRA + IPCA+ 7%

### Premissa
Cada aporte que Diego faz, dividido **93% VWRA** (Vanguard FTSE All-World UCITS, TER 0.22%) + **7% IPCA+ 2040** (taxa de compra ~7.16% real), na mesma data e cambio.

### Racional
Representa a alternativa "simples e passiva" — exposicao global diversificada sem factor tilts, sem cripto, sem gestao tatica, com um minimo de RF estrutural.

### Parametros

| Parametro | Valor |
|-----------|-------|
| Equity | 93% VWRA (TER 0.22%) |
| RF | 7% IPCA+ 2040 (custodia B3 0.20%, taxa ~7.16% real bruto) |
| Rebalance | Anual, via aportes |
| Cambio | Mesmo que Diego usa (Okegen, spread 0.25%) |
| Impostos | Mesma regra: 15% flat sobre ganhos de equity, 15% regressivo RF |
| TER total | 0.219% |

### Baseline (T0 = 2026-03-20)

| Metrica | Valor |
|---------|-------|
| Patrimonio inicial | R$ 3,479,239 |
| Alocacao | 93% equity (R$ 3,235,692) + 7% RF (R$ 243,547) |
| Aporte mensal | R$ 25,000 (R$ 23,250 VWRA + R$ 1,750 IPCA+) |
| VWRA 1Y return (USD, mar 2025-mar 2026) | ~24.6% |
| VWRA TER | 0.22% |

### Retorno Esperado (longo prazo, real em BRL, pre-tax)

Premissa de depreciacao real BRL aprovada 2026-03-20: 0.5%/ano (base), 1.5% (favoravel), 0% (stress).

| Cenario | Equity USD real | Dep. real BRL | Equity BRL real | Blend 93/7 BRL real | Nota |
|---------|----------------|---------------|-----------------|---------------------|------|
| Base | ~4.9% | +0.5% | ~5.4% | ~5.40% | VWRA ~= mercado neutro (DMS 2024) |
| Favoravel | ~4.9% | +1.5% | ~6.4% | ~6.33% | |
| Stress | ~4.9% | 0% | ~4.9% | ~4.93% | |

- RF (IPCA+ 2040): 7.16% real bruto, ~5.34% real liquido (IR 15% sobre nominal, IPCA 4.0%, custodia 0.20%). Invariante ao cambio — denominado em BRL
- Nota: Shadow A usa retornos pre-tax na acumulacao (tax drag = 0%, mesma premissa da carteira real). Na desacumulacao, aplicar IR 15% sobre ganho nominal
- VWRA retorno USD ~4.9% alinhado com DMS 2024 (equity premium global ~5% nominal - inflacao). Factor premium = 0 por definicao (e o benchmark passivo)

### Tracking

| Data | Patrimonio Shadow A | Retorno Periodo | Patrimonio Real | Delta |
|------|--------------------|-----------------|-----------------| ------|
| 2026-03-20 (T0) | R$ 3,479,239 | — | R$ 3,479,239 | 0.00% |

---

## Shadow B: 100% IPCA+ 2040

### Premissa
Tudo em **IPCA+ 2040** a ~7.16% real bruto. Zero equity, zero cripto, zero complexidade.

### Racional
O "piso de oportunidade". Se a carteira toda de Diego — com factor tilts, cripto, 11 instrumentos, 8 gatilhos — nao bate renda fixa pura, entao a complexidade esta destruindo valor. Este e o benchmark mais exigente: retorno real garantido pelo governo (risco soberano).

### Parametros

| Parametro | Valor |
|-----------|-------|
| Instrumento | 100% Tesouro IPCA+ 2040 |
| Taxa de compra | 7.16% real bruto (media historica recente) |
| Custodia | B3, 0.20% a.a. |
| Imposto | 15% sobre ganho **nominal** (tabela regressiva, >720 dias) |
| IPCA estimado | 4.0% a.a. (premissa Focus) |
| Taxa liquida | ~5.34% real (calculo abaixo) |
| Rebalance | Nenhum |
| Gestao | Zero |
| TER efetivo | 0.20% (custodia B3) |

### Baseline (T0 = 2026-03-20)

| Metrica | Valor |
|---------|-------|
| Patrimonio inicial | R$ 3,479,239 |
| Alocacao | 100% IPCA+ 2040 |
| Aporte mensal | R$ 25,000 |
| Taxa real bruta | 7.16% a.a. |
| Taxa real liquida | ~5.34% a.a. (calculo correto abaixo) |

### Calculo da Taxa Real Liquida

IR incide sobre ganho **nominal**, nao real. Premissa IPCA: 4.0%.

1. Taxa real liq custodia: 7.16% - 0.20% = **6.96%**
2. Retorno nominal bruto: (1.0696)(1.04) - 1 = **11.24%**
3. Retorno nominal liquido (IR 15%): 11.24% x 0.85 = **9.55%**
4. Retorno real liquido: (1.0955) / (1.04) - 1 = **5.34%**

Nota: o calculo anterior (7.16% x 0.85 = 6.09%) aplicava IR sobre o retorno real, superestimando a taxa liquida em ~75 bps.

### Projecao Deterministica (hold to maturity 2040)

Calculo: patrimonio + aportes mensais, compostos a 5.34% real liquido a.a.

| Ano | Patrimonio Inicio | Aportes Ano | Rendimento Liq | Patrimonio Fim |
|-----|------------------|-------------|----------------|---------------|
| 2026 (9 meses) | R$ 3,479,239 | R$ 225,000 | R$ 142,359 | R$ 3,846,598 |
| 2027 | R$ 3,846,598 | R$ 300,000 | R$ 212,645 | R$ 4,359,243 |
| 2028 | R$ 4,359,243 | R$ 300,000 | R$ 240,016 | R$ 4,899,259 |
| 2029 | R$ 4,899,259 | R$ 300,000 | R$ 268,847 | R$ 5,468,106 |
| 2030 | R$ 5,468,106 | R$ 300,000 | R$ 299,219 | R$ 6,067,325 |
| 2031 | R$ 6,067,325 | R$ 300,000 | R$ 331,211 | R$ 6,698,537 |
| 2032 | R$ 6,698,537 | R$ 300,000 | R$ 364,912 | R$ 7,363,449 |
| 2033 | R$ 7,363,449 | R$ 300,000 | R$ 400,412 | R$ 8,063,861 |
| 2034 | R$ 8,063,861 | R$ 300,000 | R$ 437,808 | R$ 8,801,669 |
| 2035 | R$ 8,801,669 | R$ 300,000 | R$ 477,200 | R$ 9,578,870 |
| 2036 | R$ 9,578,870 | R$ 300,000 | R$ 518,696 | R$ 10,397,565 |
| **2037 (FIRE 50)** | **R$ 10,397,565** | **R$ 75,000** | **R$ 136,415** | **R$ 10,608,980** |

**Patrimonio projetado aos 50 (Shadow B)**: ~R$ 10.6M em termos reais.
**SWR 2.36%** (R$250k / R$10.6M) — extremamente seguro.

Nota: Este e o cenario sem risco de mercado (risco soberano apenas). Qualquer carteira com equity precisa justificar a volatilidade adicional oferecendo retorno superior no longo prazo.

### Tracking

| Data | Patrimonio Shadow B | Retorno Periodo | Patrimonio Real | Delta |
|------|--------------------|-----------------|-----------------| ------|
| 2026-03-20 (T0) | R$ 3,479,239 | — | R$ 3,479,239 | 0.00% |

---

## Metodologia de Atualizacao

### Trimestral
1. Registrar patrimonio real de Diego na data
2. **Shadow A**: aplicar retorno do VWRA (em BRL) no periodo sobre a parcela equity, + rendimento IPCA+ sobre a parcela RF, + aportes do periodo
3. **Shadow B**: aplicar 5.34% real a.a. (pro-rata trimestral: ~1.31%) sobre patrimonio + aportes
4. Calcular delta (Real - Shadow) / Shadow
5. Se delta negativo por 3 trimestres consecutivos em qualquer shadow, acionar revisao de complexidade

### Fonte de dados
- Patrimonio real: `dados/historico_carteira.csv`
- VWRA: Yahoo Finance (VWRA.L) ou justETF
- IPCA+ taxa: Tesouro Direto
- Cambio: `dados/historico_carteira.csv` (coluna usdbrl)

---

## Limitacoes

1. **Sem dados historicos retroativos**: Nao reconstruimos o shadow desde o inicio dos aportes de Diego. T0 e o baseline — comparacao forward-looking apenas
2. **Cambio**: Shadow A usa o mesmo cambio de Diego, mas VWRA seria comprado em momentos diferentes (DCA mensal vs aportes irregulares de Diego)
3. **Impostos**: Simplificado como 15% flat. Na pratica, timing de realizacao afeta o valor real
4. **Shadow B assume hold to maturity**: Se Diego precisasse liquidar IPCA+ antes de 2040, MtM introduziria volatilidade
