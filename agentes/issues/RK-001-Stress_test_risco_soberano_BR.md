# RK-001: Stress Test Risco Soberano Brasil

## Metadados
| Campo | Valor |
|-------|-------|
| **Dono** | 06 Risco (lead), 10 Advocate, 04 FIRE |
| **Status** | Concluida |
| **Prioridade** | Alta |
| **Data** | 2026-03-20 |
| **Conclusao** | 2026-03-20 |

## Contexto

Bloco Brasil na carteira representa ~13.1% (Renda+ 2065 3.2% + Reserva IPCA+ 2029 2.5% + IPCA+ 2040 existente 0.4% + IPCA+ 2040 estrutural futuro 7%).

IMPORTANTE: HODL11 NAO e risco Brasil. E Bitcoin (ativo global) em wrapper B3. Risco operacional apenas.

Com IPCA+ estrutural, exposicao soberana BR mais que dobrou. Nenhum stress test havia sido feito.

---

## Posicoes Base (marco 2026)

| Instrumento | Valor (R$) | % Patrimonio | Taxa Atual | Duration Aprox | Perfil |
|-------------|-----------|-------------|------------|---------------|--------|
| Renda+ 2065 | 112.000 | 3,2% | IPCA+6,87% | ~43,6 | Tatico (mark-to-market) |
| IPCA+ 2040 (existente) | 13.000 | 0,4% | IPCA+7,13% | ~12,5 | Aguardando 2y IR |
| IPCA+ 2040 (estrutural futuro) | 244.000 | 7,0% | ~IPCA+7,2% | ~12,5 | Hold to maturity |
| Reserva IPCA+ 2029 | 88.000 | 2,5% | curta | ~2,8 | Emergencia |
| **Total bloco soberano BR** | **457.000** | **~13,1%** | — | — | — |

Patrimonio total: R$3.483.000
Equity global (ETFs): ~89,1% = R$3.101.000
HODL11 (Bitcoin): 3,0% = R$108.000

---

## 1. Cenario 1 — Crise Fiscal BR (2015-2016 Style)

### O que aconteceu em 2015-2016

- **Selic**: subiu ate 14,25% (set/2015), mantida ate out/2016
- **IPCA**: atingiu 10,67% em 2015 (acumulado 12m)
- **NTN-B longas**: taxas reais chegaram a ~7,5% nos vencimentos mais longos (pico em set/2015). Em titulos ultra-longos (40+ anos), taxas reais provavelmente tocaram 7,5-8,0%
- **Contexto**: impeachment, rebaixamento de credito (S&P tirou investment grade em set/2015), recessao de -3,5% do PIB
- **Drawdown em PU**: NTN-B longas (2045/2050) tiveram drawdown de -30% a -45% em marcacao a mercado entre pico (2012-2013, quando taxas estavam em ~4,5%) e fundo (set/2015)

### Modelagem: Taxa sobe para cenario 2015-2016

**Premissas do cenario:**
- Renda+ 2065: taxa vai de 6,87% para 9,5% (+263bps)
- IPCA+ 2040: taxa vai de 7,2% para 8,5% (+130bps) — curva mais curta abre menos
- Reserva IPCA+ 2029: taxa sobe marginalmente (+50bps) — duration curta protege
- Selic a 14-15%, IPCA a 8-10%

**Calculo de impacto mark-to-market:**

> **ERRATA (HD-006)**: Calculo original usava formula simplificada (Delta PU ~ -Duration x Delta_taxa / (1+y)), que subestima perdas para movimentos grandes. Corrigido com formula exata de repricing: PU_novo/PU_atual = ((1+y_atual)/(1+y_novo))^Duration_Macaulay. Conforme RF-003.

| Instrumento | Duration | Taxa Atual | Taxa Cenario | Perda MtM Exata (%) | Perda MtM (R$) |
|-------------|----------|-----------|-------------|---------------------|----------------|
| Renda+ 2065 | 43,6 | 6,87% | 9,50% | **-65,3%** | -73.100 |
| IPCA+ 2040 (existente) | 12,5 | 7,20% | 8,50% | **-14,0%** | -1.820 |
| IPCA+ 2040 (estrutural) | 12,5 | 7,20% | 8,50% | **-14,0%** | -34.200 |
| Reserva IPCA+ 2029 | 2,8 | ~7,0% | ~7,50% | **-1,4%** | -1.230 |
| **Total bloco** | — | — | — | — | **-110.350** |

**Perda total do bloco soberano: -R$110.350 (-24,1% do bloco, -3,2% do patrimonio)**

Nota critica: o Renda+ com duration 43,6 sofre catastroficamente. Sozinho responde por 66% da perda do bloco apesar de ser 24% do valor. A formula simplificada subestimava a perda do Renda+ em -38,5% quando o valor correto e -65,3%.

**Equity global neste cenario**: Crise domestica BR tem impacto limitado em ETFs UCITS globais. Drawdown equity estimado: -5% a -10% (contagio limitado). Impacto equity: -R$155k a -R$310k.

**Perda total da carteira no cenario 1: -R$265k a -R$420k (-7,6% a -12,1%)**

---

## 2. Cenario 2 — Risk-Off Global (2022 Style)

### O que aconteceu em 2022

- **Fed**: subiu de 0,25% para 4,50% em 2022 (mais rapido ciclo em 40 anos)
- **MSCI World**: drawdown de ~-18% a -20% (pico a fundo intra-ano)
- **BRL**: depreciou ~5-10% contra USD
- **NTN-B longas**: taxas reais subiram ~100-150bps (abertura da curva longa por risk-off global + fiscal domestico)
- **Emerging Markets**: drawdown de -20% a -25%

### Modelagem: Risk-off global

**Premissas do cenario:**
- Renda+ 2065: taxa vai de 6,87% para 8,0% (+113bps) — risk-off global abre curva BR
- IPCA+ 2040: taxa vai de 7,2% para 8,0% (+80bps)
- Reserva IPCA+ 2029: impacto minimo (+30bps)
- Equity global (SWRD, AVGS, AVEM, JPGL): drawdown -25% (ponderado; EM cai mais)
- HODL11: drawdown -50% (Bitcoin drawdown tipico em risk-off; ver 2022: -65%)

| Instrumento | Valor Base (R$) | Drawdown (%) | Perda (R$) | Nota |
|-------------|----------------|-------------|-----------|------|
| Equity global | 3.101.000 | -25,0% | -775.300 | |
| HODL11 | 108.000 | -50,0% | -54.000 | |
| Renda+ 2065 | 112.000 | **-36,9%** | **-41.300** | Formula exata: (1.0687/1.080)^43.6 |
| IPCA+ 2040 (exist+estrut) | 257.000 | **-8,9%** | **-22.900** | Formula exata: (1.072/1.080)^12.5 |
| Reserva IPCA+ 2029 | 88.000 | -0,8% | -700 | |
| **Total** | **3.666.000** | — | **-894.200** |

**Perda total da carteira no cenario 2: -R$894k (-25,7% do patrimonio)**
**Patrimonio residual: ~R$2.590k**

Nota: 86,5% da perda vem de equity. O bloco soberano BR e marginal neste cenario. O risco dominante e equity concentration (89,1% da carteira). (ERRATA HD-006: Renda+ recalculado com formula exata -- perda sobe de -26,1% para -36,9%.)

---

## 3. Cenario 3 — Worst Case (Crise Fiscal + Risk-Off Global Simultaneos)

### Premissas combinadas

Isso e o equivalente a 2015 + 2022 juntos. Historicamente raro mas nao impossivel — uma crise fiscal BR durante tightening global (ex: se fiscal desancorar em um ambiente de juros globais altos).

- Renda+ 2065: taxa vai para **10,0%** (+313bps) — stress maximo
- IPCA+ 2040: taxa vai para **9,0%** (+180bps)
- Reserva IPCA+ 2029: +80bps
- Equity global: -35% (global crash + contagio EM + BRL -20%)
- HODL11: -60% (correlacao sobe em stress)
- BRL deprecia 20-25%: ajuda equity em BRL (parcialmente offseta drawdown em USD)

**Ajuste BRL**: Equity e cotado em USD via UCITS. BRL -20% significa que drawdown de -35% em USD se torna ~-22% em BRL. Uso -22% para equity.

| Instrumento | Valor Base (R$) | Drawdown (%) | Perda (R$) | Nota |
|-------------|----------------|-------------|-----------|------|
| Equity global | 3.101.000 | -22,0%* | -682.200 | |
| HODL11 | 108.000 | -60,0% | -64.800 | |
| Renda+ 2065 | 112.000 | **-71,7%** | **-80.300** | Formula exata: (1.0687/1.100)^43.6 |
| IPCA+ 2040 (exist+estrut) | 257.000 | **-18,8%** | **-48.300** | Formula exata: (1.072/1.090)^12.5 |
| Reserva IPCA+ 2029 | 88.000 | -2,2% | -1.900 | |
| **Total** | **3.666.000** | — | **-877.500** |

*Equity drawdown em BRL atenuado pela depreciacao cambial.

**Perda total da carteira no cenario 3: -R$877k (-23,9% do patrimonio)**
**Patrimonio residual: ~R$2.606k**

Nota contra-intuitiva: o cenario 3 tem perda TOTAL similar ao cenario 2 em BRL porque a depreciacao cambial protege o bloco equity (89% da carteira). O bloco soberano sofre MUITO mais (~R$131k vs ~R$65k), mas pesa pouco no total.

(ERRATA HD-006: Renda+ recalculado com formula exata -- perda sobe de -45,7% para -71,7%. IPCA+ de -21,0% para -18,8%. Total ajustado.)

Se medirmos em USD (sem protecao cambial), cenario 3 e pior:
- Patrimonio em USD cai de ~$665k para ~$400k (-40%)

### Tempo estimado de recuperacao

| Cenario | Drawdown | Recuperacao Estimada |
|---------|---------|---------------------|
| 1 (Fiscal BR) | -6,8% a -11,3% | 6-18 meses (equity recupera rapido; soberano recupera com ciclo de corte) |
| 2 (Risk-off global) | -25,4% | 2-3 anos (baseado em historico MSCI World: recuperacao media de bear market = 2,5 anos) |
| 3 (Worst case) | -24,5% (BRL) / -40% (USD) | 2-4 anos (mais lento porque envolve normalizacao fiscal + ciclo global) |

### Validacao FIRE

- Diego tem 39 anos, meta FIRE aos 50 (11 anos)
- Patrimonio pos-cenario 3: ~R$2.629k
- Com aportes de R$25k/mes (R$300k/ano) + recuperacao de mercado:
  - Estimativa conservadora: patrimonio volta a R$3,5M em ~2,5-3 anos
  - FIRE meta de ~R$6-7M aos 50 continua viavel mesmo pos-worst case
- **FIRE sobrevive ao cenario 3** com folga, dado horizonte de 11 anos

---

## 4. Analise de Concentracao

### 13% em um unico emissor: aceitavel?

**Rating soberano Brasil (marco 2026):**
- Moody's: Ba1 (stable outlook) — 1 notch abaixo de investment grade
- S&P: BB (stable) — 2 notches abaixo
- Fitch: BB+ — 1 notch abaixo

Brasil e speculative grade. Nao e AAA. Concentrar 13% em um emissor BB/Ba1 merece atencao, mas contexto importa:

**Fatores atenuantes:**
1. E divida soberana em moeda LOCAL (BRL). Brasil nunca deu default em divida domestica. Default soberano BR historico foi em divida externa (1987, 2002 parcial)
2. Tesouro Direto tem garantia do Tesouro Nacional — e o ativo de menor risco de credito no pais
3. Para um investidor domiciliado no Brasil, alguma exposicao soberana local e inevitavel e ate desejavel (hedge natural contra custo de vida local)
4. 13% e concentracao moderada — nao extrema. Comparar com investidores tipicos BR que tem 40-60% em RF soberana

**Fatores de risco:**
1. Rating especulativo significa que premios de risco podem abrir significativamente em crise
2. Risco de repressao financeira: governo pode mudar regras (IR, IOF, limites de resgate)
3. Historico de instabilidade institucional (impeachments, mudancas de regras tributarias)
4. Concentracao em duration longa amplifica mark-to-market mesmo sem default

**Conclusao**: 13% e aceitavel para investidor domiciliado no Brasil, especialmente com a estrutura de durations diversificada (curta + media + longa). O risco nao e default — e mark-to-market e repressao financeira.

### IPCA+ 2040 (hold to maturity) vs Renda+ 2065 (tatico): risco diferente?

**Sim, fundamentalmente diferente:**

| Aspecto | IPCA+ 2040 (Estrutural) | Renda+ 2065 (Tatico) |
|---------|------------------------|---------------------|
| Horizonte | Hold to maturity (2040) | Mark-to-market trade |
| Risco relevante | Credito soberano (default) | Mark-to-market + credito |
| Duration efetiva | 12,5 (mas irrelevante se hold) | 43,6 (totalmente relevante) |
| Vencimento vs FIRE | Vence 2040, 3 anos pos-FIRE | Vencimento em 2084 (!), venda tatica |
| Drawdown MtM importa? | NAO (se mantiver ate 2040) | SIM (e o risco primario) |
| Pior cenario real | Brasil da default em divida local (probabilidade muito baixa) | Taxa vai a 10%+ e Diego vende em panico com -45% |

**Insight critico**: o IPCA+ 2040 estrutural tem risco de CREDITO (baixo), enquanto o Renda+ 2065 tem risco de MERCADO (alto). Sao riscos de natureza completamente diferente. Somar os dois como "13% em risco soberano" obscurece essa distincao.

---

## 5. Recomendacao

### Sizing do IPCA+ estrutural 7%: adequado?

**Sim, 7% esta adequado.** Razoes:

1. **Duration curta para hold-to-maturity**: com 14 anos ate vencimento e intencao de manter, o risco real e credito soberano (muito baixo para divida local). Duration e mark-to-market sao irrelevantes se o titulo e mantido
2. **Vence 3 anos pos-FIRE (2040)**: timing perfeito como buffer de transicao
3. **Taxa real de 7,2%**: historicamente elevada. Academicamente, taxas reais acima de 6% em NTN-B aconteceram apenas em 2015-2016, 2023 e 2024-2026. E oportunidade rara (ver estudo InfoMoney/ANBIMA: NTN-B acima de 7% e rara na historia)
4. **Concentracao de 13% total**: aceitavel dado que ~7% (IPCA+ 2040) e hold-to-maturity com risco distinto do Renda+ tatico

**Nao recomendo reduzir**. O sizing de 7% foi revisado de 10% (decisao de 2026-03-19) e ja incorpora disciplina de concentracao.

### Renda+ 2065 merece ajuste?

O Renda+ e 3,2% da carteira com gatilho de compra ativo (DCA ate 5% se taxa >= 6,5%). Isso pode levar o bloco de risco a ate 8% (Renda+ 5% + HODL11 3%). Dentro do teto de 10%.

**Atencao**: se Renda+ for a 5% E IPCA+ estrutural for executado a 7%, o bloco soberano total sobe para ~14,5%. Ainda aceitavel, mas na fronteira do conforto. Recomendo monitorar.

### Regras para Liquidacao em Emergencia (aprovado por Diego em 2026-03-20)

**Ordem simplificada de liquidacao:**

1. **Reserva IPCA+ 2029** (duration curta, menor impacto MtM)
2. **Equity global** (ETFs UCITS -- liquidez diaria, spread baixo)
3. **Renda+ 2065 / IPCA+ 2040** (por ultimo)

**Regras especificas:**
- **IPCA+ 2040**: hold-to-maturity. NAO vende antes do vencimento (2040)
- **Renda+ 2065**: so vende no gatilho (taxa <= 6.0%) ou mantem em panico (taxa 9%+). Nunca vende forcado em crise
- **Trigger de review**: se bloco soberano total > 15% do patrimonio, revisao obrigatoria de sizing

> Regra anterior "nunca vender os dois no mesmo trimestre" foi REMOVIDA -- na pratica, IPCA+ nao e vendido (hold-to-maturity) e Renda+ tem gatilhos proprios. A regra era redundante.

### Playbook para Diego no Drawdown

```
SE taxa Renda+ >= 9% (panico):
  -> NAO VENDER. Manter pelo carrego IPCA+6,87%
  -> NAO comprar mais (ja no gatilho de panico, nao de compra)
  -> Revisar em 6 meses

SE taxa Renda+ entre 6,5% e 9%:
  -> DCA parado (target 3% ja atingido). Nao comprar mais
  -> Se target mudar no futuro: nunca mais de 1% do patrimonio por tranche

SE taxa Renda+ <= 6,0%:
  -> Vender posicao inteira (gatilho de venda)

SE precisar de liquidez durante crise:
  -> 1. Reserva IPCA+ 2029
  -> 2. Equity global (ETFs UCITS)
  -> 3. Renda+ 2065 / IPCA+ 2040 (por ultimo -- Renda+ so no gatilho, IPCA+ nao vende)

SE bloco soberano > 15% do patrimonio:
  -> Review obrigatorio de sizing
  -> Considerar nao executar proxima tranche de IPCA+ 2040
```

---

## Mapa de Drawdown Consolidado

| Cenario | Bloco Soberano (R$) | Bloco Soberano (%) | Carteira Total (R$) | Carteira Total (%) |
|---------|--------------------|--------------------|--------------------|--------------------|
| 1 — Fiscal BR | -110.350 | -24,1% do bloco | -265k a -420k | -7,6% a -12,1% |
| 2 — Risk-off Global | -64.900 | -14,2% do bloco | -894.200 | -25,7% |
| 3 — Worst Case | -130.500 | -28,6% do bloco | -877.500 | -23,9% (BRL) |

> ERRATA HD-006: Todos os drawdowns de Renda+ 2065 recalculados com formula exata de repricing (RF-003). Perdas do Renda+ significativamente maiores que estimativa original. Formula simplificada subestimava perdas em 40-60% para movimentos de taxa > 2pp.

**Risco dominante da carteira NAO e o bloco soberano. E equity concentration a 89%.**

O bloco soberano a 13% e um risco secundario. Mesmo no worst case, o bloco soberano contribui ~R$107k de perda contra ~R$747k de equity+crypto. Diego deve ter clareza que o stress test do bloco soberano revela um risco gerenciavel, enquanto o risco de equity e ~7x maior em magnitude absoluta.

---

## Decisao Final (aprovada por Diego em 2026-03-20)

- **IPCA+ estrutural 7%**: adequado. Risco real da carteira e equity 89%, nao soberano 13%
- **IPCA+ 2040**: hold-to-maturity. NAO vende antes do vencimento
- **Renda+ 2065**: so vende no gatilho (<=6.0%) ou mantem em panico (9%+)
- **Ordem de liquidacao em emergencia**: Reserva 2029 primeiro -> equity global -> Renda+/IPCA+ por ultimo
- **Regra "nunca vender os dois no mesmo trimestre"**: REMOVIDA (redundante -- IPCA+ nao e vendido e Renda+ tem gatilhos proprios)

---

## Fontes e Premissas

### Dados Historicos
- Selic 2015: 14,25% (BCB). IPCA 2015: 10,67% (IBGE)
- NTN-B longas 2015: taxas reais ~7,5% nos vencimentos longos
- MSCI World 2022: drawdown ~-18% a -20% (MSCI)
- Bitcoin 2022: drawdown ~-65% (CoinGecko)

### Rating Soberano (marco 2026)
- Moody's: Ba1 stable
- S&P: BB stable
- Fitch: BB+

### Premissas de Calculo
- Modified duration Renda+ 2065: 43,6 (fonte: carteira.md, RF-001)
- Modified duration IPCA+ 2040: ~12,5 (estimativa para NTN-B Principal 14 anos)
- Modified duration IPCA+ 2029: ~2,8 (3 anos para vencimento)
- Formula MtM: exata para zero-coupon: PU_novo/PU_atual = ((1+y_atual)/(1+y_novo))^Duration_Macaulay. (ERRATA HD-006: formula simplificada anterior subestimava perdas do Renda+ em 40-60% para movimentos grandes)
- Convexidade capturada implicitamente pela formula exata
- BRL depreciation no cenario 3 parcialmente offseta equity drawdown em BRL

### Referencias Academicas
- **DeBondt & Thaler (1985)**: Mean reversion em ativos em distress — relevante para tempo de recuperacao
- **Ilmanen (2011), "Expected Returns"**: Framework de premios de risco por duration — taxas reais acima de 6% historicamente associadas a retornos superiores em horizonte de 5+ anos
- **ANBIMA/InfoMoney**: NTN-B acima de 7% e evento raro na historia brasileira (ocorreu apenas em 2015-2016 e 2024-2026)

---

## Origem
Retro 2026-03-19, aprendizado #5 (revisado em debate 2026-03-20)
