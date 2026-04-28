# Proxies Canônicos por ETF por Período

> Fonte única de verdade para proxies de dados históricos.
> Aprovado por Diego em 2026-03-31. Issue: HD-proxies-canonicos.
> **Todo agente e script que usar proxy deve consultar este arquivo. Não definir proxies ad-hoc.**
> Padrões de validação: ver `agentes/referencia/metodologia-analitica.md`.

---

## Período canônico alvo: 20 anos (2006 → 2026)

---

## SWRD.L — SPDR MSCI World UCITS ETF (inception: 28 Fev 2019)

Índice: MSCI World (DM only — sem EM)

| Período | Instrumento | Ticker | Tier | yfinance | Caveats |
|---------|------------|--------|------|---------|---------|
| Fev/2019 → agora | ETF real | SWRD.L | — | ✅ | — |
| Set/2009 → Fev/2019 | iShares Core MSCI World UCITS Acc | IWDA.L | **A** | ✅ (USD no LSE) | Mesmo índice MSCI World, mesma domiciliação Irlanda, accumulating. TER 0.20% vs SWRD 0.12% → drag ~8bp/ano |
| 2006 → Set/2009 | IVV 60% + EFA 40% | IVV + EFA | **B** | ✅ | Omite Canadá (~3%). Pesos calibrados pela composição MSCI World 2006. Alternativa: adicionar EWC ~3% para cobrir Canadá |

**Nota:** VT e ACWI incluem EM (~10%) — são proxies de VWRA, não de SWRD.

---

## AVGS.L — Avantis Global Small Cap Value UCITS (inception: 25 Set 2024)

Índice: Avantis proprietary (global SC value + profitability tilt)

| Período | Instrumento | Ticker | Tier | yfinance | Caveats |
|---------|------------|--------|------|---------|---------|
| Set/2024 → agora | ETF real | AVGS.L | — | ✅ | 6 meses de dado real (mar/2026) |
| Set/2019 → Set/2024 | AVUV 58% + AVDV 42% | AVUV + AVDV | **A** | ✅ | Mesma metodologia Avantis. Split 58/42 ≈ peso global AVGS (~55-60% US / 40-45% Intl). Omite EM SC value (~5-8% do AVGS). Pesos: usar factsheet AVGS, não otimização in-sample (N=56m, erro ±8-12pp) |
| 2006 → Set/2019 | DFSVX 58% + DISVX 42% | DFSVX + DISVX | **B** | ⚠️ NAV diário (fundos mútuos) | DFA mutual funds — mesma filosofia Fama-French. Fees historicamente maiores (~0.5% vs Avantis ~0.25%). Implementação difere (DFA patient trading vs Avantis daily optimization) |

**Descartados:** EFV (large/mid value EAFE — não SC), IWN (sem profitability tilt — captura "small junk").
**Graduação prevista:** Set/2027 (36 meses de dado real).

**Factor Loadings FF5 — proxy para AVGS.L:**
Sem histórico suficiente para regressão direta. Proxy = 58% AVUV + 42% AVDV (mesmos pesos canônicos acima).
Dashboard exibe coluna "AVGS*" itálica/dashed. Revisão quando AVGS atingir 5+ anos (~Set/2029).
Atenção: etf_composition.json mostra EUA≈15% para AVGS — esse número reflete exposição geográfica do portfólio atual,
NÃO deve ser usado como peso de proxy (o universo global SC tem ~55-60% US por capitalização).

---

## AVEM.L — Avantis Emerging Markets Equity UCITS (inception: 9 Dez 2024)

Índice: Avantis proprietary (EM com ~70% neutro / 30% value+small tilt)

| Período | Instrumento | Ticker | Tier | yfinance | Caveats |
|---------|------------|--------|------|---------|---------|
| Dez/2024 → agora | ETF real | AVEM.L | — | ✅ | 4 meses de dado real (mar/2026) |
| Set/2019 → Dez/2024 | Avantis EM Equity (US-listed) | AVEM | **A** | ✅ | Mesma estratégia e gestora, wrapper US-listed. Tier A: estratégia idêntica |
| 2006 → Set/2019 | DFA Emerging Markets Value | DFEVX | **B** | ⚠️ NAV diário (fundo mútuo) | Value tilt compatível com a estratégia AVEM. Fee historicamente maior. Dados desde ~1998 |

**Alternativa mais simples pré-2019:** EEM (MSCI EM cap-weight, sem tilt, desde Abr/2003) — usar apenas quando DFEVX não disponível, com flag explícita de subestimação do tilt.
**Descartados:** VWO (FTSE EM vs MSCI EM — diferença Korea do Sul), DFEMX (cap-weight, não value — ticker errado).
**Graduação prevista:** Dez/2027 (36 meses de dado real).

---

## JPGL.L — JPMorgan Global Equity Multi-Factor UCITS (inception: 9 Jul 2019)

Fatores: value + momentum + quality + low volatility + size (inverse-vol weighted)

| Período | Instrumento | Ticker | Tier | yfinance | Caveats |
|---------|------------|--------|------|---------|---------|
| Jul/2019 → agora | ETF real | JPGL.L | — | ✅ | ~7 anos de dado real |
| Set/2015 → Jul/2019 | JPUS 60% + JPIN 40% (US-listed) | JPUS + JPIN | **B** | ✅ | Mesma metodologia JPMorgan Diversified Factor. JPUS desde Set/2015, JPIN desde Nov/2014. Split 60/40 ≈ peso global. JPIN.L UCITS não existe — usar US-listed. Não inclui Japão/Pacífico na mesma proporção |
| Nov/2014 → Set/2015 | JPIN (US-listed) only | JPIN | **C — baixa fidelidade** | ✅ | Apenas componente international (DM ex-NA). Sem ~60% US. Usar com flag 🚫 |
| **2006 → Nov/2014** | **Proxy sintético FF5+MOM** | French Library | **Sintético** | ✅ via `pandas_datareader` | Regressão FF5+MOM no overlap JPGL (76 meses). Condição: R² ≥ 0.85 e t ≥ 2.0 por loading. Haircut -0.50%/ano sobre retorno teórico dos fatores (custos de implementação não capturados). **Fallback:** excluir JPGL do período pré-2014 (backtest 3-ETFs) se R² < 0.85 |

**Nota:** JPGL é o proxy mais fraco da carteira — único sem ETF investível para 2006-2014.
**JPGL já graduado** (>7 anos de dado real).

---

## VWRA.L — Vanguard FTSE All-World Acc USD (inception: 23 Jul 2019)

Índice: FTSE All-World (DM + EM, large+mid cap)

| Período | Instrumento | Ticker | Tier | yfinance | Caveats |
|---------|------------|--------|------|---------|---------|
| Jul/2019 → agora | ETF real | VWRA.L | — | ✅ | — |
| Jun/2008 → Jul/2019 | Vanguard Total World Stock ETF | VT | **A** | ✅ | FTSE All-World — mesmo índice. VT inclui small cap (~10%) que VWRA não inclui. Correlação esperada >0.99 |
| Mar/2008 → Jun/2008 | iShares MSCI ACWI | ACWI | **B** | ✅ | MSCI ACWI vs FTSE All-World — diferenças metodológicas menores. ~3 meses de gap |
| 2006 → Mar/2008 | IVV 55% + EFA 35% + EEM 10% | IVV+EFA+EEM | **B** | ✅ | Blend ad-hoc. Pesos calibrados pela composição FTSE All-World 2006. Tracking error moderado |

**VWRA.L já graduada** (>7 anos de dado real).

---

## Factor Data — Fontes Primárias

> Aprovado em 2026-04-28 (Gap U — HD-dashboard-gaps-tier3).

| Fator | Fonte | Motivo |
|-------|-------|--------|
| HML (value spread) | **AQR HML Devil Monthly** — `The-Devil-in-HMLs-Details-Factors-Monthly.xlsx` | B/M contemporâneo (timely) — supera HML Fama-French que usa B/M lagged |
| SMB (size spread) | **Ken French FF5** — `getfactormodels` (region=us/developed) | AQR Devil não provê SMB; KF é fonte canônica para size |
| Proxy AVGS | `HML_AVGS = 0.58 × HML_Devil_USA + 0.42 × HML_Devil_GlobalExUS` | Pesos = universo global SC (proxies-canonicos.md), NÃO etf_composition.json |
| | `SMB_AVGS = 0.58 × SMB_US_KF + 0.42 × SMB_DevExUS_KF` | |
| | `SV_proxy = HML_AVGS + SMB_AVGS` | Small-value proxy para AVGS |

Script: `scripts/market_data.py --value-spread`
Cache: `dados/factor_cache.json` → chave `factor_value_spread`
Export: `data.json` → `factor.value_spread`

---

## Critérios de validação de proxy

Validação obrigatória em USD, retornos mensais, no período de overlap entre proxy e ETF real.

| Tier | Tipo | ρ mínimo | TE anual máx | R² mínimo | Overlap mínimo |
|------|------|---------|-------------|-----------|---------------|
| **A** | Same-strategy (mesma gestora/índice) | ≥ 0.95 | ≤ 3% | ≥ 0.90 | 36 meses |
| **B** | Sintético / blend | ≥ 0.85 | ≤ 6% | ≥ 0.72 | 36 meses |
| **C** | Baixa fidelidade | < threshold | > limite | < limite | — |

**Blending:** usar pesos do factsheet do ETF real (proporção geográfica real), nunca otimização in-sample. Erro padrão dos pesos in-sample com N≈56m: ±8-12pp.

**Erro no CAGR:** `Y_95 = 1.96 × TE_anual / √T` (anos)

---

## Status de graduação

| ETF | Dado real desde | Graduado? | Proxy atual | Graduação prevista |
|-----|-----------------|-----------|-------------|-------------------|
| SWRD.L | Fev/2019 | ✅ (>7 anos) | — | — |
| JPGL.L | Jul/2019 | ✅ (>7 anos) | — | — |
| VWRA.L | Jul/2019 | ✅ (>7 anos) | — | — |
| AVGS.L | Set/2024 | ⏳ 6 meses | AVUV 58% + AVDV 42% | **Set/2027** |
| AVEM.L | Dez/2024 | ⏳ 4 meses | AVEM (US-listed) | **Dez/2027** |

Graduação = 36 meses de dado real + validação de correlação/TE no overlap.

---

## Flags padrão

| Nível | Símbolo | Quando usar |
|-------|---------|------------|
| Validado | ℹ️ proxy [ticker] validado — ρ=[X], TE=[Y]%, overlap=[N]m | Tier A ou B acima do threshold |
| Abaixo do threshold | ⚠️ proxy [ticker] — correlação [X] no overlap de [N] meses. Resultado sujeito a erro de [Y]pp no CAGR | Tier B abaixo do threshold |
| Sem overlap | 🚫 proxy [ticker] — sem overlap com ETF real. Resultado não validado | Tier C ou sintético sem sobreposição |

---

## Proxies descartados (com razão)

| Ticker | Descartado para | Razão |
|--------|----------------|-------|
| EFV | AVGS | Large/mid value EAFE — não captura size premium |
| IWN | AVGS (pré-2019) | Sem profitability tilt — captura "small junk" |
| VT / ACWI | SWRD | Incluem EM (~10%) — proxies de VWRA, não SWRD |
| DFEMX | AVEM | Cap-weight EM — não é value (ticker errado; value = DFEVX) |
| JPIN.L | JPGL | Não existe como UCITS ETF na LSE |
| EEM | AVEM (primário) | Cap-weight sem tilt — usar só como fallback se DFEVX indisponível |
