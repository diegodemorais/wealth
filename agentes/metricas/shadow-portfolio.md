# Shadow Portfolios — Contrafactuais

> Atualizado em: 2026-03-23
> Baseline (T0): 2026-03-20 | Tracking mensal iniciado: Abr/2026

---

## Objetivo

Quatro portfolios comparáveis respondem: "A complexidade da carteira de Diego gera valor?"

| Portfolio | Definição | Papel |
|-----------|-----------|-------|
| **Atual** | Carteira real de Diego (com transitorios, drift atual) | Resultado realizado |
| **Target** | Carteira no alvo: 79% equity (pesos alvo SWRD/AVGS/AVEM/JPGL) + 15% IPCA+ + 3% cripto + ≤5% Renda+ | O que deveríamos ter |
| **Shadow A** | 100% VWRA (Vanguard FTSE All-World UCITS, TER 0.22%) | Benchmark passivo puro — equity global sem tilts |
| **Shadow B** | 100% IPCA+ 2040 (~7.16% real bruto, HTM) | Benchmark RF — retorno garantido sem risco de mercado |

Todos recebem os mesmos aportes de Diego, na mesma data e câmbio. Comparação forward-looking a partir de T0 = 2026-03-20.

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
- TER estimado: 0.227% a.a.

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

---

## Tabela de Performance Mensal

> Retorno do período (não acumulado). Método Dietz para Atual e Shadow A.
> n/d = dado não disponível (sem snapshot de fim de mês anterior ao sistema)

| Período | Atual | Target* | Shadow A (VWRA) | Shadow B (IPCA+) | Delta Target | Delta A | Delta B |
|---------|-------|---------|-----------------|-----------------|-------------|---------|---------|
| T0 (2026-03-20) | — | — | — | — | 0.00% | 0.00% | 0.00% |
| Q1 2026 (Jan–Mar, aprox.) | **+1.73%** | **≈ −1.11%*** | **−1.42%** | **+2.30%** | **+2.84pp*** | **+3.15pp** | **−0.57pp** |
| Abr/2026 | — | — | — | — | — | — | — |
| Mai/2026 | — | — | — | — | — | — | — |

> Q1 2026: Jan e Fev sem snapshot de fim de mês individual — dados agregados.
> Target Q1*: estimativa Bookkeeper (preços LSE stooq/busca). Principais drivers: HODL11 −25.5% BRL (−77 bps), câmbio BRL/GBP apreciou −5.4% (pesou equity).
> Shadow A Q1: VWRA.L +4.45% GBp mas −1.42% BRL (câmbio BRL apreciou 5.6% vs GBP).
> Shadow B Q1: IPCA 1.41% + real trimestral ~0.89% ≈ +2.30% total.
> *Estimativa — validar mensalmente com preços reais via checkin-automatico M1.

## Tabela de Patrimônio Acumulado (YTD desde T0)

| Período | Atual | Target* | Shadow A (VWRA) | Shadow B (IPCA+) | Delta Target (R$) | Delta A (R$) | Delta B (R$) |
|---------|-------|---------|-----------------|-----------------|-----------------|-------------|-------------|
| T0 2026-03-20 | R$ 3.479.239 | R$ 3.479.239 | R$ 3.479.239 | R$ 3.479.239 | R$ 0 | R$ 0 | R$ 0 |
| Q1 23/Mar | R$ 3.492.284 | R$ ~3.399.000* | R$ 3.387.800 | R$ 3.512.116 | **+R$ ~93k*** | **+R$ 104.484** | **−R$ 19.832** |

---

## Metodologia de Atualização Mensal

> Via `/checkin-automatico` — bloco mensal M1 (primeiro check-in do mês)

1. **Patrimônio real**: planilha Google Sheets (aba Evolucao), snapshot de fim de mês
2. **Shadow A**: patrimônio anterior × (1 + retorno_VWRA_BRL_mensal) + aportes do mês
   - Retorno VWRA BRL = retorno VWRA.L em GBp + variação câmbio BRL/GBP no mês
   - Fonte: Yahoo Finance `https://finance.yahoo.com/quote/VWRA.L/history/`
3. **Shadow B**: patrimônio anterior × (1 + IPCA_mensal + 7.16%/12) + aportes do mês
   - Fonte IPCA: IBGE / investidor10.com.br / BCB Focus
4. **Target**: retorno ponderado dos 4 ETFs alvo em BRL + IPCA+ + HODL11
   - Pesos portfolio total: SWRD 27.65% + AVGS 19.75% + AVEM 15.8% + JPGL 15.8% + IPCA+ 15% + HODL11 3%
   - Retorno ETF BRL = retorno GBp × (GBP/BRL_fim / GBP/BRL_ini)
   - Fonte preços: stooq.com (SWRD.uk, AVGS.uk, AVEM.uk, JPGL.uk) ou Yahoo Finance
   - BTC retorno BRL = (BTC_USD_fim × USD_BRL_fim) / (BTC_USD_ini × USD_BRL_ini) - 1
5. Adicionar linha na tabela acima e no scorecard.md

### Gatilho de alerta
- Delta A < 0 por 3 meses consecutivos → revisão de complexidade obrigatória
- Delta B < 0 por 3 meses consecutivos → questionar alocação equity vs IPCA+

---

## Nota All-In (HD-006, 2026-03-22)

Comparação justa requer mesmos custos em todos:
- **Atual / Target**: WHT 0.22%, IOF 1.1%+Okegen 0.25% por remessa, IR 15% sobre ganho nominal BRL
- **Shadow A**: mesmos custos de câmbio (IOF+Okegen) e IR que Diego
- **Shadow B**: custódia B3 0.20%, IR 15% sobre ganho nominal — sem câmbio

Shadow B com 5.34% real líquido é comparável all-in. Shadow A pré-tax ~5.4% BRL não inclui IR (comparar com cuidado em horizontes curtos).

---

## Limitações

1. **Sem histórico retroativo**: T0 = 2026-03-20. Comparação é forward-looking
2. **Jan/Fev 2026 sem snapshot individual**: Q1 é agregado; dados mensais a partir de Abr
3. **Target estimado**: Q1 usa preços stooq (aproximação). A partir de Abr/2026, atualizar mensalmente via M1 do checkin-automatico
4. **Impostos simplificados**: 15% flat. Na desacumulação, timing real afeta o valor
5. **Shadow B HTM**: se Diego liquidar IPCA+ antes de 2040, MtM introduz volatilidade não capturada
