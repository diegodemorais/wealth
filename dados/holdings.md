# Holdings — Quantidades e Valores por Ativo

> Atualizado em: 2026-04-09
> Fonte: Carteira Viva + ibkr_analysis.py + broker_analysis.py (XP notas + Nubank screenshots)
> Cambio de referencia: R$ 5,07
> Atualizar sempre que houver compra/venda

---

## ETFs Internacionais (Interactive Brokers)

**Total ETFs internacionais: $603,411.91 (R$ 3,107,571)**

### Bloco SWRD (alvo 50% do equity)
| Ativo | Qtde | Valor USD | % Portfolio Inter | Lucro | Status |
|-------|------|-----------|-------------------|-------|--------|
| SWRD | 5,291.64 | $245,797 | 40.7% | +41.22% | Underweight. Aportar aqui |

### Bloco AVGS (alvo 30% do equity)
| Ativo | Qtde | Valor USD | % Portfolio Inter | Lucro | Status |
|-------|------|-----------|-------------------|-------|--------|
| AVGS | 233.43 | $6,067 | 1.0% | +4.24% | Alvo UCITS. Aportar aqui |
| AVUV | 548.88 | $61,705 | 10.2% | +37.82% | Transitorio |
| AVDV | 947.60 | $96,219 | 15.9% | +75.03% | Transitorio |
| USSC | 373.25 | $30,778 | 5.1% | +67.72% | Transitorio |
| **Subtotal** | | **$194,769** | **32.3%** | | Overweight via transitorios |

### Bloco AVEM (alvo 20% do equity)
| Ativo | Qtde | Valor USD | % Portfolio Inter | Lucro | Status |
|-------|------|-----------|-------------------|-------|--------|
| EIMI | 2,020.29 | $93,499 | 15.5% | +50.51% | Transitorio |
| AVES | 926.55 | $55,218 | 9.2% | +31.08% | Transitorio |
| DGS | 188.21 | $11,999 | 2.0% | +27.23% | Transitorio |
| **Subtotal** | | **$160,716** | **26.6%** | | Overweight via transitorios |

### Bloco JPGL (alvo 0% — nao comprar mais, FI-jpgl-zerobased 2026-04-01)
| Ativo | Qtde | Valor USD | % Portfolio Inter | Lucro | Status |
|-------|------|-----------|-------------------|-------|--------|
| IWVL | 34.00 | $2,130 | 0.4% | +65.01% | Transitorio. Diluir via aportes |
| **Subtotal** | | **$2,130** | **0.4%** | | Diluicao natural |

---

## Renda Fixa (Tesouro Direto)

| Ativo | Corretora | Custo base (aplicado) | Valor estimado | Notas |
|-------|-----------|----------------------|---------------|-------|
| Tesouro IPCA+ 2029 | Nubank | R$ 76,860 (5 aplic, 1 resgate parcial) | ~R$ 89,095 | Reserva emergencia |
| Tesouro IPCA+ 2040 | Nubank | R$ 20,035 (1 aplic, abr/2026) | ~R$ 33,285 | Bloco IPCA+ longo. DCA ativo (taxa ~7.20%) |
| Renda+ 2065 | Nubank | R$ 108,554 (4 aplic, set-dez/2025) | ~R$ 112,466 | Tatico. Gatilho venda: taxa <= 6.0%. Taxa atual ~6.93% |
| Tesouro IPCA+ 2045 | Nubank | — | ZERADO | Resgate total jan/2025. P&L: -R$ 10,620 |

> Fonte custo base: `dados/nubank/resumo_td.json` (screenshots app Nubank, 09/04/2026)
> `generate_data.py` le automaticamente de `dados/nubank/resumo_td.json`

---

## Cripto

| Ativo | Qtde | Tipo | Custo medio | Custo total | Valor estimado |
|-------|------|------|-------------|-------------|---------------|
| HODL11 | 1,676 | ETF B3 (XP) | R$ 79.03 | R$ 132,453 | ~R$ 100,208 |
| Bitcoin spot | 0.00434697 | Legado | ~R$ 2,000 |
| Ethereum | 0.06606465 | Legado | ~R$ 700 |
| BNB | 0.20507877 | Legado | ~R$ 350 |
| Cardano | 47.96176001 | Legado | ~R$ 88 |

---

## Alocacao Alvo (FI-equity-redistribuicao 2026-04-01)

| Bloco | Alvo % | Notas |
|-------|--------|-------|
| Equity total | **79%** | SWRD 50%, AVGS 30%, AVEM 20% (dentro do equity). JPGL = 0% (FI-jpgl-zerobased) |
| IPCA+ longo | **15%** | TD 2040 (80%) + TD 2050 (20%). Hold to maturity SEMPRE |
| IPCA+ curto | **3%** | Comprar perto dos 50 (SoRR buffer). Nao agora |
| Cripto | **3%** | HODL11 + spot legado |
| Renda+ 2065 | **<=3%** | Tatico. DCA parado (3.2% ja proximo do target) |
| Reserva | transitorio | IPCA+ 2029, migrar para Selic no vencimento |

---

## Carteira Viva — Targets por Bucket (da planilha)

A planilha mostra targets de:
- IPCA+ longo: **15%** (R$ 464,482.61 target)
- Equity: **85%** (inclui cripto e Renda+?)

**DIVERGENCIA IDENTIFICADA**: A planilha usa 85% equity / 15% IPCA+ longo, mas os alvos aprovados em HD-006 sao:
- 79% equity / 15% IPCA+ longo / 3% cripto / 3% IPCA+ curto (aos 50)
- Renda+ 2065 <=3% (tatico, dentro dos 79%? ou separado?)

A planilha precisa ser atualizada com os sub-blocos corretos. Ver secao "Gaps" abaixo.

---

## Report Bookkeeper: Gaps Atual vs Alvo

**Patrimonio total estimado**: ~R$ 3,511,554 (Carteira Viva ref 2026-04-07)
**Patrimonio ETFs internacionais**: $603,412 x R$ 5.15 = R$ 3,107,571

### Gap por Bucket (% do patrimonio total)

| Bloco | Alvo | Atual | Gap | Acao |
|-------|------|-------|-----|------|
| SWRD | 39.5% | ~36.1% | -3.4% under | Aportar SWRD |
| AVGS | 23.7% | ~28.6% | +4.9% over | Overweight via transitorios. Aportar so AVGS UCITS |
| AVEM | 15.8% | ~23.6% | +7.8% over | Overweight via transitorios |
| IPCA+ longo | 15.0% | ~0.9% | **-14.1% under** | **DCA ATIVO** (taxa ~7.20% > piso 6.0%) |
| Cripto | 3.0% | ~2.9% | ~0% | On target |
| Renda+ 2065 | <=3% | ~3.2% | ~0% | Proximo do target. DCA parado |
| Reserva | transitorio | ~2.5% | n/a | Migrar para Selic em 2029 |

### Prioridade de Aportes (por gap)

1. **SWRD** — underweight -3.4%. Aportes equity aqui ate fechar gap
2. **IPCA+ longo** — gap de -14.1%. DCA ativo em TD 2040 (80%) + TD 2050 (20%)
3. Tudo mais esta on target ou overweight

### Execucoes Pendentes

| Decisao | Aprovada em | Status | Notas |
|---------|-------------|--------|-------|
| IPCA+ longo DCA ate 15% | 2026-03-22 | **Em andamento** | DCA ATIVO. Taxa ~7.20% > piso 6.0% |
| Aportes equity -> SWRD/AVGS | 2026-04-01 | **Em andamento** | Nova estrategia 50/30/20 sem JPGL |

### Alertas

1. **Planilha Carteira Viva pesos defasados**: aba Evolucao cenario B usa 43/26/17 (SWRD/AVGS/AVEM). Correto: 50/30/20. Diego precisa atualizar
2. **JPGL = 0%**: nao aportar mais. Posicao existente (IWVL R$11k) dilui naturalmente
