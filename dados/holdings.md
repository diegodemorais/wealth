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

| Ativo | Corretora | Cotas | Custo base | Valor MtM | Taxa | Notas |
|-------|-----------|------:|----------:|---------:|-----:|-------|
| Tesouro IPCA+ 2029 | Nubank | 23.34 | R$ 76,860 | R$ 86,555 | 7.58% | Reserva emergencia |
| Tesouro IPCA+ 2040 | Nubank | 11.58 + ? | R$ 20,035 + 46.498,08 | Pendente | 7.07% / 7.10% | Bloco IPCA+ longo. DCA ativo. **OPERAÇÃO 2026-04-10 PENDENTE** (liquidação 13/04). Compra: R$ 46.498,08 @ taxa 7,10%. Cotas = R$ 46.498,08 / PU(13/04) — aguardar confirmação no extrato Nubank |
| Tesouro IPCA+ 2050 | Nubank/XP | ? | R$ 11.660,71 | Pendente | 6.85% | **NOVO: Operação 2026-04-10 PENDENTE** (liquidação 13/04). Bloco IPCA+ longo, split 20%. Compra: R$ 11.660,71 @ taxa 6,85%. Cotas = R$ 11.660,71 / PU(13/04) — primeira operação neste título, PU inicial não disponível, confirmar em 13/04 |
| Renda+ 2065 | Nubank | 158.93 | R$ 108,554 | R$ 117,833 | 6.80% | Tatico. Gatilho venda: taxa <= 6.0% |
| Tesouro IPCA+ 2045 | Nubank | — | — | ZERADO | — | Resgate total jan/2025. P&L: -R$ 10,620 |

> **Operações 2026-04-10 PENDENTES DE LIQUIDAÇÃO (13/04/2026):**
> - **TD IPCA+ 2040**: Compra enfileirada R$ 46.498,08 @ taxa 7,10%. PU ref 08/04 = R$ 1.757,66 @ 7,07%. Cotas estimadas: ~26.44 (usando PU ref). **CONFIRMAR PU real com extrato Nubank 13/04 e atualizar.**
> - **TD IPCA+ 2050**: Compra enfileirada R$ 11.660,71 @ taxa 6,85%. **Primeira operação neste título.** PU inicial desconhecido. **CONFIRMAR PU real com extrato Nubank 13/04 e calcular cotas.**
>
> **Ação do Diego**: Verificar extrato Nubank/XP em 13/04 (segunda-feira) para obter PU de execução real. Comunicar ao Bookkeeper para atualizar cotas neste arquivo.
>
> Referência: MtM anterior = cotas × PU venda 08/04/2026 (fonte: `dados/td_precos.json`)
> Taxas: Tesouro Transparente 08/04/2026 (referência) + 2026-04-10 (operações novas) — será confirmado com execução

---

## Cripto

| Ativo | Qtde | Tipo | Custo medio | Custo total | Valor estimado | Ref |
|-------|------|------|-------------|-------------|---------------|-----|
| HODL11 | 1,676 | ETF B3 (XP) | R$ 79.03 | R$ 132,453 | R$ 100,208 | yfinance 09/04/2026 |
| Bitcoin spot | 0.00435900 | Binance Earn | — | — | $382 (R$ 1,937) | Binance statement 23/03/2026 |
| Ethereum | 0.06761700 | Binance Earn | — | — | $201 (R$ 1,019) | Binance statement 23/03/2026 |
| BNB | 0.20519500 | Binance Spot | — | — | $177 (R$ 897) | Binance statement 23/03/2026 |
| Cardano | 48.39219300 | Binance Spot | — | — | $16 (R$ 81) | Binance statement 23/03/2026 |
| Outros (ENA, PENGU, etc) | — | Binance Spot | — | — | $1 (R$ 5) | Dust |

> Fonte: `analysis/raw/binance_saldo.pdf` (Account Statement 23/03/2026, total $778 USD)
> `dados/binance/saldo.json` gerado por `broker_analysis.py --broker binance`
> `dashboard_state.json crypto_legado_brl` atualizado automaticamente: R$4,012

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

| Bloco | Alvo | Atual (pré-04-10) | Novo (pós-04-10) | Gap reduzido | Acao |
|-------|------|-------------------|------------------|--------------|------|
| SWRD | 39.5% | ~36.1% | ~36.1% | -3.4% under | Aportar SWRD |
| AVGS | 23.7% | ~28.6% | ~28.6% | +4.9% over | Overweight via transitorios. Aportar so AVGS UCITS |
| AVEM | 15.8% | ~23.6% | ~23.6% | +7.8% over | Overweight via transitorios |
| IPCA+ longo | 15.0% | ~0.9% | ~2.6% | **-12.4% under** (era -14.1%) | **DCA ATIVO** (taxa 7,10% e 6,85% > piso 6.0%). Aporte 2026-04-10: R$ 58.158,79 |
| Cripto | 3.0% | ~2.9% | ~2.9% | ~0% | On target |
| Renda+ 2065 | <=3% | ~3.2% | ~3.2% | ~0% | Proximo do target. DCA parado |
| Reserva | transitorio | ~2.5% | ~2.5% | n/a | Migrar para Selic em 2029 |

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
