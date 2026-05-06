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

**Dividendos IBKR (Forms 1042-S + Activity Statement confirmado 2026-05-05):**
- Gross US$5.773 / Withheld US$1.732 (30% US) — conferido extrato IBKR 2025
- Crédito US compensa integralmente o IR BR (15%) sobre dividendos → IR adicional R$0

Datas e valores de pagamento (Activity Statement IBKR):

| Data pagto | ETFs | Gross USD | WHT USD |
|-----------|------|-----------|---------|
| 2025-03-27/28 | AVUV, DGS | 177,58 | 53,28 |
| 2025-06-26/27 | AVDV, AVES, AVUV, DGS | 2.506,26 | 751,88 |
| 2025-09-25/29 | AVUV, DGS | 400,47 | 120,14 |
| 2025-12-18/30 | AVDV, AVES, AVUV, DGS | 2.688,84 | 806,66 |
| **Total** | | **5.773,15** | **1.731,96** |

→ Para preenchimento: buscar PTAX BCB (bcb.gov.br/conversao) de cada data para converter USD→BRL.
→ WHT 30% (US) > IR 15% (BR) em todos os grupos → IR adicional = R$0.

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
| HODL11 (987 cotas @ R$85,08/cota — custo histórico) — XP · **Grupo 07, Cód. 06** · CNPJ fundo: 36.256.476/0001-37 | R$0 | R$83.975 |
| ↳ *Correção 2026-05-05: issue original usava 1.605 cotas @ MtM R$84,57 = R$135.732 (errado). 1.605 inclui compras de jan/fev 2026. Posição correta 31/12/2025 = 987 cotas. Valor = custo histórico, não MtM.* | | |
| ↳ *Grupo/Código confirmado 2026-05-05: Grupo 07, Código 06 — FIP, FIDC e ETF – Entidades de Investimento (Lei 14.754/2023). Fonte: B3/Bora Investir + Perguntão IRPF 2026.* | | |
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
| Ativo | 31/12/2024 | 31/12/2025 |
|-------|------------|------------|
| USDC — Nubank (17,20 USDC) | — | R$101 |
| Capital social PJ1 — 28.952.960/0001-70 (Tecnologia) | R$95.000 | R$95.000 |
| Capital social PJ2 — 36.691.080/0001-16 (Consultoria) | R$1.000 | R$1.000 |
| Imóvel Pinheiros (custo aquisição) | R$702.922 | R$702.922 |

> Saldos 31/12/2024 das PJs confirmados 2026-05-05: capital social nominal (Simples Nacional usa custo de aquisição = capital integralizado, sem reavaliação). PJ1: R$95.000 / PJ2: R$1.000 — iguais em ambas as datas.

### Ficha 7 — Dívidas e Ônus Reais

| Credor | Contrato | Saldo 31/12/2025 | Pago em 2025 |
|--------|----------|-----------------|--------------|
| Bradesco — Financiamento imobiliário | 0001030320 | R$457.002 | R$49.576 |
| Banco XP — Operação de crédito | 800033276 | R$109.450 | R$0 |

---

## Guia de Preenchimento — IRPF 2026

> Campo a campo para uso no Programa IRPF 2026 (RFB). Todos os valores apurados nesta issue.
> PTAX BCB: bcb.gov.br/conversao → "Cotações e Boletins" → PTAX venda da data.

---

### FICHA: Rendimentos Tributáveis Recebidos de PJ pelo Titular

Clique "Novo":

| Campo | Valor |
|-------|-------|
| CNPJ da Fonte Pagadora | 36.691.080/0001-16 |
| Nome da Fonte Pagadora | Diego de Morais Consultoria em Tecnologia da Informação Ltda |
| Rendimento Bruto | 1.518,00 |
| Contribuição Previdenciária Oficial (INSS) | 166,98 |
| Imposto Retido na Fonte | 0,00 |

> PJ1 (28.952.960/0001-70) não pagou pró-labore em 2025 — não lançar.

---

### FICHA: Rendimentos Isentos e Não Tributáveis

Linha **09 — Lucros e dividendos recebidos** → "Novo" para cada PJ:

**Entrada 1 — PJ1:**

| Campo | Valor |
|-------|-------|
| CNPJ | 28.952.960/0001-70 |
| Nome | Diego de Morais Tecnologia de Sistemas Ltda |
| Valor | 261.437,94 |

**Entrada 2 — PJ2:**

| Campo | Valor |
|-------|-------|
| CNPJ | 36.691.080/0001-16 |
| Nome | Diego de Morais Consultoria em Tecnologia da Informação Ltda |
| Valor | 282.366,16 |

---

### FICHA: Rendimentos Sujeitos à Tributação Exclusiva/Definitiva

Linha **06 — Rendimentos de aplicações financeiras** → "Novo" para cada item:

| Item | Rendimento 2025 | Fonte (buscar CNPJ no informe) |
|------|----------------|-------------------------------|
| TD IPCA+ 2029 — Nubank | R$104,70 | Nu Financeira S.A. |
| RDB NuConta (ag.0001 ct.7268399-5) | R$1.382,38 | Nu Financeira S.A. |
| Fundo Trend INB FIC FIRF (XP, resgatado) | R$339,31 | XP Investimentos |
| Fundo Trend DI Simples FIRF RL (XP) | R$3.012,99 | XP Investimentos |
| Fundo Trend DI FIC RF Simples RL (XP) | R$699,65 | XP Investimentos |
| IT NOW IMA-B5 P2 F11 (ETF RF, XP) | R$5.194,41 | XP Investimentos |
| Nexoos (P2P) | R$90,25 | Nexoos |

---

### FICHA: Rendimentos de Aplicações Financeiras no Exterior (Lei 14.754/2023)

> Esta ficha cobre ganho de capital IBKR (alienações set/2025) + dividendos IBKR + resultado Nomad.

#### Ganho de Capital — Alienações IBKR (set/2025)

Lançar por símbolo (ou agrupar se o programa permitir):

| Símbolo | Custo BRL | Venda BRL | Ganho BRL |
|---------|-----------|-----------|-----------|
| JPGL | 288.537 | 327.830 | 39.292 |
| USSC | 38.879 | 54.472 | 15.592 |
| EIMI | 61.114 | 69.791 | 8.677 |
| AVDV | 27.330 | 35.715 | 8.385 |
| ZPRX | 21.223 | 28.541 | 7.318 |
| **Total** | **437.083** | **516.348** | **79.265** |

PTAX canônica BCB nas datas de venda (2025-09-22/23) já aplicada via `ibkr_lotes.py --flex`.

**Nomad (BOXX/SGOV/TFLO):** resultado R$753,36 — lançar separado no campo Nomad/Apex.

**IR devido (15% sobre ganho total):** 15% × (R$79.265 + R$753) ≈ R$12.003 → **DARF 0291 pago separadamente.**

#### Dividendos IBKR — 4 grupos de pagamento

Para cada grupo, lançar no programa com: data, gross USD, PTAX, gross BRL, WHT USD, crédito WHT:

| Data | ETFs | Gross USD | WHT USD | PTAX BCB venda | Gross BRL* | IR BR 15%* | Crédito WHT* | IR adicional |
|------|------|-----------|---------|---------------|-----------|-----------|-------------|-------------|
| 2025-03-27 | AVUV, DGS | 177,58 | 53,28 | bcb.gov.br | × PTAX | × 15% | WHT × PTAX | R$0 |
| 2025-06-26 | AVDV, AVES, AVUV, DGS | 2.506,26 | 751,88 | bcb.gov.br | × PTAX | × 15% | WHT × PTAX | R$0 |
| 2025-09-25 | AVUV, DGS | 400,47 | 120,14 | bcb.gov.br | × PTAX | × 15% | WHT × PTAX | R$0 |
| 2025-12-18 | AVDV, AVES, AVUV, DGS | 2.688,84 | 806,66 | bcb.gov.br | × PTAX | × 15% | WHT × PTAX | R$0 |

*WHT (~30% US) > IR BR (15%) em todos os grupos → crédito integral → IR adicional = R$0 em todos.

> Usar data representativa do grupo (primeiro dia de pgto). Programa IRPF 2026 permite lançar por evento.

---

### FICHA: Renda Variável — Operações Comuns em Bolsa

> HASH11: 103 cotas vendidas em 07/08/2025.

| Campo | Valor |
|-------|-------|
| Mercado — mês | Agosto/2025 |
| Valor total das alienações | R$4.156 + ganho (buscar nota de corretagem XP) |
| Ganho apurado no mês | R$4.956,36 |
| IR retido na fonte (IRRF) | R$0,45 |
| IR a pagar (15% − IRRF) | R$743,45 − R$0,45 = R$743,00 |
| DARF 6015 | ⚠️ **NÃO PAGO** — regularizar antes de transmitir |

> DARF 6015 em aberto ~9 meses. Selic acumulada aumenta o valor. Pagar via Sicalc (issue TX-darf-hash11-2025).

---

### FICHA: Bens e Direitos

#### Grupo 01 — Imóveis · Código 11 — Apartamento/casa

| Campo | 31/12/2024 | 31/12/2025 |
|-------|------------|------------|
| CNPJ do adquirente | — | — |
| Discriminação | Apartamento, Pinheiros — SP, financiado Bradesco contrato 0001030320 | = |
| Situação | R$702.922 | R$702.922 |

> Custo de aquisição = compra + impostos + reforma. Não atualizar pelo mercado.

#### Grupo 03 — Participações · Código 01 — Quotas/Ações de sociedade

**Entrada 1 — PJ1:**

| Campo | 31/12/2024 | 31/12/2025 |
|-------|------------|------------|
| CNPJ | 28.952.960/0001-70 | = |
| Nome | Diego de Morais Tecnologia de Sistemas Ltda | = |
| Situação | R$95.000 | R$95.000 |

**Entrada 2 — PJ2:**

| Campo | 31/12/2024 | 31/12/2025 |
|-------|------------|------------|
| CNPJ | 36.691.080/0001-16 | = |
| Nome | Diego de Morais Consultoria em Tecnologia da Informação Ltda | = |
| Situação | R$1.000 | R$1.000 |

#### Grupo 04 — Aplicações · Código 02 — Títulos públicos e privados

| Item | 31/12/2024 | 31/12/2025 |
|------|------------|------------|
| TD IPCA+ 2029 — Nubank | buscar declaração anterior | R$76.868 |
| COE XP0121A3C3W — Banco XP | buscar declaração anterior | R$90.000 |
| NTNB 15/08/2040 — XP | buscar declaração anterior | R$12.976 |
| RDB NuConta — Nubank | buscar declaração anterior | R$11.131 |
| Nexoos (P2P) | buscar declaração anterior | R$32 |
| BOXX — Nomad/Apex (4,91 cotas) | buscar declaração anterior | R$3.026 |

#### Grupo 07 — Fundos · Código 06 — FIP, FIDC e ETF – Entidades de Investimento (Lei 14.754/2023)

**HODL11 (Bitcoin ETF — B3):**

| Campo | 31/12/2024 | 31/12/2025 |
|-------|------------|------------|
| CNPJ do fundo | 36.256.476/0001-37 | = |
| Nome do fundo | Investo HODL ETF | = |
| Discriminação | 987 cotas @ R$85,08/cota — custo histórico — XP | |
| Situação | R$0 | R$83.975 |

**HASH11 (vendido em 2025):**

| Campo | 31/12/2024 | 31/12/2025 |
|-------|------------|------------|
| CNPJ do fundo | buscar informe XP | = |
| Nome do fundo | Hashdex Nasdaq Crypto Index Brasil ETF | = |
| Discriminação | 103 cotas @ R$40,35/cota (custo histórico) — XP — vendido 07/08/2025 | |
| Situação | R$4.156 | R$0 |

**IT NOW IMA-B5 P2 F11 (ETF RF — B3):**

| Campo | 31/12/2024 | 31/12/2025 |
|-------|------------|------------|
| CNPJ do fundo | buscar informe XP | = |
| Situação | R$51.758 | R$27.554 |

#### Grupo 07 — Fundos · Código 99 — Outros (ETFs IBKR — Lei 14.754/2023)

Uma entrada por ETF. Discriminação: quantidade de cotas, custodiante IBKR, domicílio do fundo.

| ETF | Cotas 31/12/2025 | Custo BRL 31/12/2025 | Domicílio | Custo BRL 31/12/2024 |
|-----|-----------------|---------------------|-----------|---------------------|
| SWRD | 4.930,55 | R$833.646 | UCITS — Irlanda | buscar IRPF 2025 |
| EIMI | 2.020,29 | R$341.011 | UCITS — Irlanda | buscar IRPF 2025 |
| AVDV | 947,60 | R$302.836 | US-listed | buscar IRPF 2025 |
| AVUV | 548,88 | R$237.373 | US-listed | buscar IRPF 2025 |
| AVES | 926,55 | R$232.019 | US-listed | buscar IRPF 2025 |
| USSC | 373,25 | R$129.465 | UCITS — Irlanda | buscar IRPF 2025 |
| DGS | 188,21 | R$50.214 | US-listed | buscar IRPF 2025 |
| IWVL | 34,00 | R$6.663 | UCITS — Irlanda | buscar IRPF 2025 |

> Saldos 31/12/2024: buscar na declaração IRPF 2025 entregue à RFB (seção Bens e Direitos do ano anterior).

#### Grupo 08 — Criptoativos · Código 02 — Outras criptomoedas

| Item | 31/12/2024 | 31/12/2025 |
|------|------------|------------|
| USDC (17,20 unidades) — Nubank | buscar declaração anterior | R$101 |

---

### FICHA: Dívidas e Ônus Reais

| Código | Credor | Contrato | 31/12/2024 | 31/12/2025 | Pago em 2025 |
|--------|--------|----------|------------|------------|-------------|
| 11 — Imóvel | Bradesco | 0001030320 | buscar extrato dez/2024 | R$457.002 | R$49.576 |
| 16 — Outras | Banco XP | 800033276 | buscar extrato dez/2024 | R$109.450 | R$0 |

---

### FICHA: Pagamentos Efetuados

| Código | Beneficiário | Valor |
|--------|-------------|-------|
| 36 — Previdência social | INSS (PJ2) | R$166,98 |
| 21/26 — Saúde | Diego verificar plano + consultas 2025 | — |

---

### Checklist Final Antes de Transmitir

- [ ] **DARF 6015 pago** — HASH11, R$743,45 + Selic (~9 meses). Pagar via Sicalc antes de transmitir.
- [ ] **DARF 0291 pago** — Lei 14.754, R$12.003, vence 31/05/2026. Pagar antes de transmitir.
- [ ] Dividendos IBKR: 4 grupos declarados com PTAX BCB por data (datas: 27/03, 26/06, 25/09, 18/12)
- [ ] Bens e Direitos: saldos 31/12/2024 ETFs IBKR preenchidos (buscar declaração IRPF 2025)
- [ ] Bens e Direitos: saldos 31/12/2024 RF (Nubank/XP) e dívidas (Bradesco/BancoXP) preenchidos
- [ ] Despesas de saúde/médicas 2025 levantadas e lançadas (se houver)
- [ ] Diego valida e transmite à RFB

---

## Pendências Remanescentes

| Item | Impacto | Ação |
|------|---------|------|
| DARF 6015 (HASH11) não pago | Malha fina se declarar sem pagar | Pagar via Sicalc — issue TX-darf-hash11-2025 |
| DARF 0291 (Lei 14.754) não pago | Vence 31/05/2026 | Pagar via Sicalc — issue TX-darf-hash11-2025 |
| Saldos 31/12/2024 ETFs IBKR em Bens e Direitos | Campos obrigatórios no programa IRPF | Buscar na declaração IRPF 2025 anterior |
| Saldos 31/12/2024 RF (Nubank/XP) + Dívidas (Bradesco/BancoXP) | Campos obrigatórios | Informes 2024 ou extrato dez/2024 |
| PTAX BCB por data de pgto dividendos | Preenchimento ficha dividendos (4 datas) | bcb.gov.br/conversao — datas: 27/03, 26/06, 25/09, 18/12 |
| Saldo CC Bradesco 31/12/2025 | Bens e Direitos (se relevante) | Informe CC Bradesco |
| Despesas dedutíveis (saúde etc.) | Reduz IR na tabela progressiva | Diego verificar se tem |

---

## Critério de Done

- [x] Todos os informes de rendimentos 2025 lidos e consolidados
- [x] Mapa completo de fichas com valores apurados
- [x] IBKR ganho de capital calculado via `ibkr_lotes.py --flex` com PTAX canônica
- [x] HODL11 Grupo/Código confirmado: Grupo 07, Cód. 06 (CNPJ fundo: 36.256.476/0001-37)
- [x] PJ saldos 31/12/2024 confirmados: PJ1 R$95.000 / PJ2 R$1.000 (capital social nominal)
- [x] Dividendos IBKR: datas e valores confirmados via Activity Statement (4 grupos: mar/jun/set/dez)
- [x] Guia de preenchimento campo a campo elaborado (seção Guia acima)
- [ ] DARFs pagos (6015 + 0291) — issue TX-darf-hash11-2025
- [ ] Preenchimento no programa IRPF 2026 (RFB)
- [ ] Diego valida e aprova antes de transmitir à RFB
