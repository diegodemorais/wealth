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

### Retorno Esperado (longo prazo, real, pre-tax)
- Equity (VWRA): ~5.0% real (global equity premium historico, Dimson et al.)
- RF (IPCA+ 2040): 7.16% real (taxa de compra, hold to maturity)
- Blend 93/7: ~5.15% real
- Liquido de impostos (15%): ~4.38% real

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
| Imposto | 15% sobre rendimento (tabela regressiva, >720 dias) |
| Taxa liquida | ~6.09% real (7.16% - 0.20% custodia - ~15% IR sobre rendimento) |
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
| Taxa real liquida | ~6.09% a.a. |

### Projecao Deterministica (hold to maturity 2040)

Calculo: patrimonio + aportes, composto a 6.09% real liquido, ate 2040 (14 anos).

| Ano | Patrimonio Inicio | Aportes Ano | Rendimento Liq | Patrimonio Fim |
|-----|------------------|-------------|----------------|---------------|
| 2026 (9 meses) | R$ 3,479,239 | R$ 225,000 | R$ 169,244 | R$ 3,873,483 |
| 2027 | R$ 3,873,483 | R$ 300,000 | R$ 245,392 | R$ 4,418,875 |
| 2028 | R$ 4,418,875 | R$ 300,000 | R$ 278,618 | R$ 4,997,493 |
| 2029 | R$ 4,997,493 | R$ 300,000 | R$ 313,788 | R$ 5,611,281 |
| 2030 | R$ 5,611,281 | R$ 300,000 | R$ 351,064 | R$ 6,262,345 |
| 2031 | R$ 6,262,345 | R$ 300,000 | R$ 390,614 | R$ 6,952,959 |
| 2032 | R$ 6,952,959 | R$ 300,000 | R$ 432,614 | R$ 7,685,573 |
| 2033 | R$ 7,685,573 | R$ 300,000 | R$ 477,149 | R$ 8,462,722 |
| 2034 | R$ 8,462,722 | R$ 300,000 | R$ 524,412 | R$ 9,287,134 |
| 2035 | R$ 9,287,134 | R$ 300,000 | R$ 574,505 | R$ 10,161,639 |
| 2036 | R$ 10,161,639 | R$ 300,000 | R$ 627,539 | R$ 11,089,178 |
| **2037 (FIRE 50)** | **R$ 11,089,178** | **R$ 75,000** | **R$ 340,032** | **R$ 11,504,210** |

**Patrimonio projetado aos 50 (Shadow B)**: ~R$ 11.5M em termos reais.
**SWR 2.17%** (R$250k / R$11.5M) — extremamente seguro.

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
3. **Shadow B**: aplicar 6.09% real a.a. (pro-rata trimestral: ~1.49%) sobre patrimonio + aportes
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
