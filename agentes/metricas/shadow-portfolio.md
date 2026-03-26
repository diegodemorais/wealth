# Shadow Portfolios — Contrafactuais

> Atualizado em: 2026-03-26 (HD-scorecard — adicionado Shadow C)
> Baseline (T0): 2026-03-20 | Tracking mensal iniciado: Abr/2026

---

## Objetivo

Quatro portfolios comparáveis respondem: "A complexidade da carteira de Diego gera valor?"

| Portfolio | Definição | Papel |
|-----------|-----------|-------|
| **Atual** | Carteira real de Diego (com transitorios, drift atual) | Resultado realizado |
| **Target** | Carteira no alvo: 79% equity (pesos alvo SWRD/AVGS/AVEM/JPGL) + 15% IPCA+ + 3% cripto + ≤5% Renda+ | O que deveríamos ter |
| **Shadow A** | 100% VWRA (Vanguard FTSE All-World UCITS, TER 0.22%) | Benchmark passivo puro — equity global sem tilts, sem RF |
| **Shadow B** | 100% IPCA+ 2040 (~7.16% real bruto, HTM) | Benchmark RF — retorno garantido sem risco de mercado |
| **Shadow C** | 79% VWRA + 15% IPCA+ 2040 + 3% HODL11 + 3% Renda+ | Benchmark justo — mesma estrutura de alocação, sem factor tilts |

Todos recebem os mesmos aportes de Diego, na mesma data e câmbio. Comparação forward-looking a partir de T0 = 2026-03-20.

**Shadow C responde especificamente**: o factor tilt (SWRD/AVGS/AVEM/JPGL vs puro VWRA) gera valor? Se Delta C > 0, o tilt paga mais que o custo de complexidade. Se Delta C < 0 por 3+ trimestres, questionar a tese fatorial.

---

## Definições

### Atual (Carteira Real de Diego)
- Fonte: planilha Google Sheets (aba Evolucao) + reconciliação mensal do Bookkeeper
- Inclui transitorios (EIMI, AVES, AVUV, AVDV, USSC, IWVL) e drift atual vs alvos
- Retorno calculado pelo método Dietz: (Pat_fim − Pat_ini − Aportes) / Pat_ini

### Target (Carteira no Alvo)
- 35% SWRD + 25% AVGS + 20% AVEM + 20% JPGL = 79% equity
- 15% IPCA+ 2040 (80% TD2040 + 20% TD2050)
- 3% HODL11 (cripto)
- ≤5% Renda+ 2065 (tático)
- **Nota**: requer retornos mensais por ETF. A calcular via preços Yahoo Finance/justETF.
- TER estimado: 0.228% a.a.

### Shadow A — 100% VWRA
- Instrumento: VWRA.L (LSE), TER 0.22%
- Câmbio: mesmo spread Okegen (0.25% ida+volta) + IOF 1.1% por remessa
- Retorno mensal: VWRA.L GBp return + variação câmbio BRL/GBP do mês
- Representa: "E se tivesse comprado só VWRA, sem factor tilts nem RF?"

### Shadow B — 100% IPCA+ 2040
- Instrumento: Tesouro IPCA+ 2040, taxa ~7.16% real bruto, custódia B3 0.20%
- Taxa real bruta: 7.16%/ano | Retorno mensal bruto: `(1 + IPCA_mensal) × (1 + 7.16%/12) - 1`
- Retorno mensal: IPCA do mês + parcela do real (~7.16%/12 mensal bruto)
- Sem custo de câmbio (denominado em BRL)
- Representa: "E se tivesse colocado tudo em IPCA+, sem equity?"

### Shadow C — 79% VWRA + 15% IPCA+ 2040 + 3% HODL11 + 3% Renda+
- Adicionado em: HD-scorecard (2026-03-26)
- Instrumento equity: VWRA.L (LSE), TER 0.22%, mesmos custos de câmbio que Shadow A
- Instrumento RF estrutural: Tesouro IPCA+ 2040 (~7.16% bruto, mesma metodologia Shadow B — HTM carry)
- Instrumento RF tático: Renda+ 2065 precificado a **MtM** (não HTM) — posição tática, não estrutural. Retorno mensal = variação do PU de mercado do Renda+ 2065. Fonte: Tesouro Direto preços diários.
- Pesos portfolio: 79% VWRA + 15% IPCA+ + 3% HODL11 + 3% Renda+ 2065
- Rebalanceamento: assumido anual, mesmo aporte mensal
- TER estimado: 0.207% a.a.
- Representa: "E se tivesse mesma alocação equity/RF/cripto, mas equity = 100% VWRA sem factor tilts?"
- **Pergunta central**: o factor tilt de SWRD/AVGS/AVEM/JPGL vs VWRA puro gera os 0.16%/ano esperados?
- **Nota Renda+ MtM**: em trimestres onde taxa Renda+ sobe, Shadow C sofre via MtM. Em trimestres onde taxa cai, Shadow C ganha. O Target real tem o mesmo efeito — comparação é justa.

---

## Tabela de Performance Mensal

> Retorno do período (não acumulado). Método Dietz para Atual e Shadow A.
> n/d = dado não disponível (sem snapshot de fim de mês anterior ao sistema)

| Período | Atual | Target* | Shadow A (VWRA) | Shadow B (IPCA+) | Shadow C (VWRA+IPCA+) | Delta A | Delta B | Delta C |
|---------|-------|---------|-----------------|-----------------|----------------------|---------|---------|---------|
| T0 (2026-03-20) | — | — | — | — | — | 0.00% | 0.00% | 0.00% |
| Q1 2026 (Jan–Mar, aprox.) | **+1.73%** | **≈ −1.11%*** | **−1.42%** | **+2.30%** | — | **+3.15pp** | **−0.57pp** | — |
| Abr/2026 | — | — | — | — | — | — | — | — |
| Mai/2026 | — | — | — | — | — | — | — | — |

> Q1 2026: Jan e Fev sem snapshot de fim de mês individual — dados agregados.
> Target Q1*: estimativa Bookkeeper (preços LSE stooq/busca). Principais drivers: HODL11 −25.5% BRL (−77 bps), câmbio BRL/GBP apreciou −5.4% (pesou equity).
> Shadow A Q1: VWRA.L +4.45% GBp mas −1.42% BRL (câmbio BRL apreciou 5.6% vs GBP).
> Shadow B Q1: IPCA 1.41% + real trimestral ~0.89% ≈ +2.30% total.
> Shadow C: tracking começa Abr/2026 (primeiro checkin completo com preços).
> *Estimativa — validar mensalmente com preços reais via checkin-automatico M1.

## Tabela de Patrimônio Acumulado (YTD desde T0)

| Período | Atual | Target* | Shadow A (VWRA) | Shadow B (IPCA+) | Shadow C | Delta A (R$) | Delta B (R$) | Delta C (R$) |
|---------|-------|---------|-----------------|-----------------|---------|-------------|-------------|-------------|
| T0 2026-03-20 | R$ 3.479.239 | R$ 3.479.239 | R$ 3.479.239 | R$ 3.479.239 | R$ 3.479.239 | R$ 0 | R$ 0 | R$ 0 |
| Q1 23/Mar | R$ 3.492.284 | R$ ~3.399.000* | R$ 3.387.800 | R$ 3.512.116 | — | **+R$ 104.484** | **−R$ 19.832** | — |

---

## Metodologia de Atualização Mensal

> Via `/checkin-automatico` — bloco mensal M1 (primeiro check-in do mês)

1. **Patrimônio real**: planilha Google Sheets (aba Evolucao), snapshot de fim de mês
2. **Shadow A**: patrimônio anterior × (1 + retorno_VWRA_BRL_mensal) + aportes do mês
   - Retorno VWRA BRL = retorno VWRA.L em GBp + variação câmbio BRL/GBP no mês
   - Fonte: Yahoo Finance `https://finance.yahoo.com/quote/VWRA.L/history/`
3. **Shadow B**: patrimônio anterior × (1 + IPCA_mensal + 7.16%/12) + aportes do mês
   - Fonte IPCA: IBGE / investidor10.com.br / BCB Focus
4. **Shadow C**: patrimônio anterior × (1 + retorno_ponderado_mensal) + aportes do mês
   - Retorno ponderado = 79% × retorno_VWRA_BRL + 15% × retorno_IPCA+_mensal + 3% × retorno_BTC_BRL + 3% × retorno_Renda+_MtM
   - BTC BRL = (BTC_USD_fim × USD_BRL_fim) / (BTC_USD_ini × USD_BRL_ini) - 1
5. **Target**: retorno ponderado dos 4 ETFs alvo em BRL + IPCA+ + HODL11
   - Pesos portfolio total: SWRD 27.65% + AVGS 19.75% + AVEM 15.8% + JPGL 15.8% + IPCA+ 15% + HODL11 3%
   - Retorno ETF BRL = retorno GBp × (GBP/BRL_fim / GBP/BRL_ini)
   - Fonte preços: stooq.com (SWRD.uk, AVGS.uk, AVEM.uk, JPGL.uk) ou Yahoo Finance
6. Adicionar linha na tabela acima e no scorecard.md

### Gatilho de alerta
- Delta A < 0 por 3 trimestres consecutivos (rolling 3 anos) → revisão de complexidade obrigatória
- Delta B < 0 por 3 trimestres consecutivos (rolling 3 anos) → questionar alocação equity vs IPCA+. **Excecao**: em regime inflacionario (Selic alta, IPCA acima da meta), Delta B negativo e esperado — nao alarmar nesse cenario
- **Delta C < 0 por 3 trimestres consecutivos (rolling 3 anos) → questionar o factor tilt especificamente**

---

## Nota All-In (HD-006, 2026-03-22)

Comparação justa requer mesmos custos em todos:
- **Atual / Target**: WHT 0.22%, IOF 1.1%+Okegen 0.25% por remessa, IR 15% sobre ganho nominal BRL
- **Shadow A / C (equity)**: mesmos custos de câmbio (IOF+Okegen) e IR que Diego
- **Shadow B / C (IPCA+)**: custódia B3 0.20%, IR 15% sobre ganho nominal — sem câmbio

Shadow B com 6.0% real líquido HTM é comparável all-in. Shadow A e C pré-tax incluem IR implícito — comparar com cuidado em horizontes curtos.

---

## Limitações

1. **Sem histórico retroativo**: T0 = 2026-03-20. Comparação é forward-looking
2. **Jan/Fev 2026 sem snapshot individual**: Q1 é agregado; dados mensais a partir de Abr
3. **Target estimado**: Q1 usa preços stooq (aproximação). A partir de Abr/2026, atualizar mensalmente via M1 do checkin-automatico
4. **Shadow C tracking**: começa Abr/2026. Q1 2026 não disponível (baseline = T0)
5. **Impostos simplificados**: 15% flat. Na desacumulação, timing real afeta o valor
6. **Shadow B HTM**: se Diego liquidar IPCA+ antes de 2040, MtM introduz volatilidade não capturada
