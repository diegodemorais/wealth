# TX-dirpf-2026 — DIRPF 2026: Informe de Rendimentos e Declaração (ano-base 2025)

| Campo | Valor |
|-------|-------|
| **Status** | Doing |
| **Dono** | Tax |
| **Prioridade** | 🔴 Alta — prazo RFB mai/2026 |
| **Aberta** | 2026-05-05 |

---

## Objetivo

Montar o informe de rendimentos consolidado de Diego para a DIRPF 2026 (ano-base 2025) e preparar a declaração completa.

## Perímetro — O que está IN e OUT

**IN (controlamos aqui):**
- Investimentos PF: ETFs IBKR (SWRD, AVGS, AVEM), Renda+ 2065, HODL11, Tesouro Direto, XP
- Contas PF: corretoras, bancos pessoais
- Imóvel Pinheiros (sem aluguel em 2025 — confirmado por Diego)
- Apenas 2 PJs: **Diego de Morais Tecnologia** (CNPJ 28.952.960/0001-70) e **Diego de Morais Consultoria em Tecnologia** (CNPJ 36.691.080/0001-16)

**OUT (não tocar):**
- Imóveis e empresas em nome de Diego que são empréstimos ao tio → contador do tio é responsável
- Qualquer ativo, empresa ou obrigação fiscal de terceiros, mesmo que formalmente em nome de Diego

---

## Mapa Apurado — DIRPF 2026 (ano-base 2025)

> Apuração realizada em 2026-05-05 a partir de todos os informes de rendimentos disponíveis.

### Ficha 1 — Rendimentos Tributáveis (tabela progressiva)

| Fonte | CNPJ | Valor |
|-------|------|-------|
| Pró-labore PJ2 (Consultoria) | 36.691.080/0001-16 | R$1.518,00 |
| ~~Aluguel Pinheiros~~ | — | R$0 (sem aluguel em 2025) |
| **Total** | | **R$1.518,00** |

Deduções: INSS retido PJ2 R$166,98. IR na fonte: R$0,00.

### Ficha 2 — Rendimentos Isentos e Não Tributáveis

| Fonte | Tipo | Valor |
|-------|------|-------|
| PJ1 — Diego de Morais Tecnologia | Dividendos (cód. 09) | R$261.437,94 |
| PJ2 — Diego de Morais Consultoria | Dividendos (cód. 09) | R$282.366,16 |
| **Total** | | **R$543.804,10** |

### Ficha 3 — Tributação Exclusiva/Definitiva na Fonte

| Ativo / Instituição | Rendimento 2025 |
|---------------------|----------------|
| TD IPCA+ 2029 — Nubank | R$104,70 |
| RDB NuConta (ag.0001 ct.7268399-5) | R$1.382,38 |
| Fundo Trend INB FIC FIRF (XP, resgatado) | R$339,31 |
| Fundo Trend DI Simples FIRF RL (XP, resgatado) | R$3.012,99 |
| Fundo Trend DI FIC RF Simples RL (XP, resgatado) | R$699,65 |
| IT NOW IMA-B5 P2 F11 (ETF RF, XP) | R$5.194,41 |
| Nexoos (P2P) | R$90,25 |
| **Total** | **R$10.823,69** |

### Ficha 4 — Rendimentos no Exterior — Lei 14.754/2023

**Ganho de capital IBKR (vendas 2025-09-22/23, PTAX canônica BCB):**

| Símbolo | Custo BRL | Venda BRL | Ganho BRL |
|---------|-----------|-----------|-----------|
| JPGL | R$288.537 | R$327.830 | R$39.292 |
| USSC | R$38.879 | R$54.472 | R$15.592 |
| EIMI | R$61.114 | R$69.791 | R$8.677 |
| AVDV | R$27.330 | R$35.715 | R$8.385 |
| ZPRX | R$21.223 | R$28.541 | R$7.318 |
| **Total IBKR** | R$437.083 | R$516.348 | **R$79.265** |

**Nomad (BOXX/SGOV/TFLO):** resultado R$753,36

**Dividendos IBKR (Forms 1042-S):**
- Gross US$5.776 / Withheld US$1.732 (30% US)
- Crédito US compensa integralmente o IR BR (15%) sobre dividendos → IR adicional R$0
- ⚠️ Datas exatas de pagamento pendentes para conversão PTAX (não altera DARF, só preenchimento ficha)

**DARF 0291:** ~R$12.003 — **vence 31/05/2026** (issue TX-darf-hash11-2025)

### Ficha 5 — Renda Variável (B3)

| Ativo | Data venda | Ganho | IRRF | IR 15% | Status |
|-------|-----------|-------|------|--------|--------|
| HASH11 (103 cotas) | 07/08/2025 | R$4.956,36 | R$0,45 | R$743,45 | DARF 6015 não pago (issue TX-darf-hash11-2025) |
| HODL11 | — | Nenhuma venda em 2025 | — | — | Apenas Bens e Direitos |

### Ficha 6 — Bens e Direitos (custo histórico 31/12/2025)

**ETFs IBKR — total R$2.133.227 (lotes FIFO lotes.json, PTAX compra por lote via BCB — corrigido 2026-05-05):**

| ETF | Cotas | Custo BRL | Domicílio |
|-----|-------|-----------|-----------|
| SWRD | 4.930,55 | R$833.646 | UCITS (IE) |
| EIMI | 2.020,29 | R$341.011 | UCITS (IE) |
| AVDV | 947,60 | R$302.836 | US-listed |
| AVUV | 548,88 | R$237.373 | US-listed |
| AVES | 926,55 | R$232.019 | US-listed |
| USSC | 373,25 | R$129.465 | UCITS (IE) |
| DGS | 188,21 | R$50.214 | US-listed |
| IWVL | 34,00 | R$6.663 | UCITS (IE) |
| AVGS | 0 | R$0 | *(adquirido em 2026)* |

> **Correção SWRD (2026-05-05):** issue original tinha 4.725,68 cotas / R$803.278. Confrontado com lotes.json: posição correta em 31/12/2025 = 4.930,55 cotas (+204,87). Custo recalculado com PTAX BCB por lote = R$833.646 (+R$30.368).

**B3 / Brasil:**
| Ativo | Saldo 31/12/2024 | Saldo 31/12/2025 |
|-------|-----------------|-----------------|
| HODL11 (987 cotas @ PM R$85,08 — custo histórico) — XP | R$0 | R$83.975 |
| ↳ *Correção 2026-05-05: issue original usava 1.605 cotas @ MtM R$84,57 = R$135.732 (errado). 1.605 inclui compras de jan/fev 2026. Posição correta 31/12/2025 = 987 cotas. Valor = custo histórico, não MtM.* | | |
| HASH11 (103 cotas @ R$40,35) — XP | R$4.156 | R$0 (vendido ago/2025) |
| IT NOW B5P2 F11 (ETF RF) — XP | R$51.758 | R$27.554 |

**Renda Fixa:**
| Ativo | Saldo 31/12/2025 |
|-------|-----------------|
| TD IPCA+ 2029 — Nubank | R$76.868 |
| COE XP0121A3C3W — Banco XP | R$90.000 |
| NTNB 15/08/2040 — XP | R$12.976 |
| RDB NuConta — Nubank | R$11.131 |
| Nexoos (P2P) | R$32 |
| BOXX — Nomad/Apex (4,91 cotas) | R$3.026 |

**Outros:**
| Ativo | Valor |
|-------|-------|
| USDC — Nubank (17,20 USDC) | R$101 |
| Capital social PJ1 (Tecnologia) | R$95.000 |
| Capital social PJ2 (Consultoria) | R$1.000 |
| Imóvel Pinheiros (custo aquisição) | R$702.922 |

### Ficha 7 — Dívidas e Ônus Reais

| Credor | Contrato | Saldo 31/12/2025 | Pago em 2025 |
|--------|----------|-----------------|--------------|
| Bradesco — Financiamento imobiliário | 0001030320 | R$457.002 | R$49.576 |
| Banco XP — Operação de crédito | 800033276 | R$109.450 | R$0 |

---

## Pendências Remanescentes

| Item | Impacto | Ação |
|------|---------|------|
| DARF 6015 (HASH11) não pago | Malha fina se declarar sem pagar | Pagar via Sicalc — issue TX-darf-hash11-2025 |
| DARF 0291 (Lei 14.754) não pago | Vence 31/05/2026 | Pagar via Sicalc — issue TX-darf-hash11-2025 |
| IBKR dividendos — datas exatas de pgto | Só preenchimento ficha (IR já zerado pelo crédito US) | Account statement IBKR |
| Saldo conta corrente Bradesco | Bens e Direitos (se relevante) | Informe CC Bradesco |
| Despesas dedutíveis (saúde etc.) | Reduz IR na tabela progressiva | Diego verificar se tem |

---

## Critério de Done

- [x] Todos os informes de rendimentos 2025 lidos e consolidados
- [x] Mapa completo de fichas com valores apurados
- [x] IBKR ganho de capital calculado via `ibkr_lotes.py --flex` com PTAX canônica
- [ ] DARFs pagos (6015 + 0291) — issue TX-darf-hash11-2025
- [ ] Preenchimento no programa IRPF 2026 (RFB)
- [ ] Diego valida e aprova antes de transmitir à RFB
