# Memoria: Analista de Macro Brasil

> Somente decisoes confirmadas por Diego sao registradas aqui.

---

## Decisoes Confirmadas

| Data | Decisao | Racional | Agentes Consultados |
|------|---------|----------|---------------------|
| 2026-03 | Macro nao muda estrategia | Contexto apenas para decisoes ja planejadas | 01 Head |
| 2026-03 | Monitorar NTN-B 2040 e Renda+ 2065 mensalmente | Referencia para cenario IPCA+ e gatilho tatico | 03 Fixed Income, 06 Risk |
| 2026-03-20 | Depreciacao real BRL forward-looking (1.5-2.0%/ano) e cenario FAVORAVEL, nao base | Diferencial juro real, fiscal deteriorante, produtividade menor -> sustenta depreciacao. Mas incerteza alta. Base conservadora adotada: 0.5%/ano | 07 Cambio |

---

## Regras Operacionais

1. **Alerta proativo em eventos relevantes**: Quando um evento macro (corte/alta de Selic, decisão do Copom, mudança fiscal) impacta gatilhos de outros agentes, Macro DEVE emitir alerta proativo na mesma sessão. Não esperar ser perguntado. Ex: corte de Selic → avisar Risco (gatilho Renda+) e RF (taxas IPCA+ devem comprimir). (Aprendizado retro 2026-03-19)

2. **Snapshot completo obrigatorio**: O snapshot NAO pode ter campos em branco. Todos os indicadores devem ser preenchidos na montagem e atualizados mensalmente via WebSearch. Se dado nao estiver disponivel, registrar "dado pendente — divulgacao em [data]".

---

## Snapshot Maio/2026 (atualizado 01/05/2026)

> **Data do snapshot anterior:** 2026-04-25
> **Atualizacao atual:** 2026-05-01 (WebSearch: BCB, Agencia Brasil, InfoMoney, Investidor10, FRED, BLS, TradingEconomics)
> **Resultado:** COPOM 29/abr cortou 0,25pp → Selic 14,50%. IPCA abril: 0,58%, acumulado 12m 5,12% (acima do teto 4,5%). Focus IPCA 2026: 4,86% (7a semana consecutiva). Selic terminal 2026: 13,00%. BRL tocou 4,9548 (máxima BRL em 2026). Renda+ 2065: ~6,96% (fechamento abr). IPCA+ 2040: ~7,40% (alta em 2026). FOMC 29/abr: manteve 3,50–3,75%. CPI EUA mar: 3,3% (alta energia por guerra). TIPS 10y: 1,90%.

### Delta vs Snapshot 25/Abr/2026 → 01/Mai/2026

| Indicador | 25/abr/2026 | 01/mai/2026 | Variacao | Impacto |
|-----------|------------|------------|---------|---------|
| Selic Meta | 14,75% | **14,50%** | -25 bps | COPOM 29/abr: corte 0,25pp unanime. Proximo: jun/2026 |
| IPCA 12m | 4,14% (mar) | **5,12% (abr)** | +98 bps | Acima do teto 4,5% — desancoragem confirmada. IPCA-15 abr: 0,89%. Principal driver: energia/petroleo (guerra Oriente Medio) |
| IPCA mensal abr | — | **0,58%** | — | Abaixo IPCA-15 0,89% — algum arrefecimento |
| Focus IPCA 2026 | 4,80% | **4,86%** | +6 bps | 7a semana consecutiva de alta. 36 bps acima teto |
| Focus IPCA 2027 | 3,84% | **3,80%** | -4 bps | Estavel — ancora longa segura |
| Focus Selic terminal 2026 | 13,00% | **13,00%** | 0 bps | Estavel: mercado projeta mais 1,25pp de cortes ate dez/26 |
| Focus Selic 2027 | 10,50% | **11,00%** | +50 bps | Revisao relevante — ciclo de cortes mais curto |
| BRL/USD | ~4,97 | **~4,96** | -10 bps | BRL continua forte; tocou 4,9548 (minima USD maxima BRL 2026). YTD BRL +9,35% vs USD |
| IPCA+ 2040 | ~7,10% (ref. 22/abr) | **~7,40%** | +30 bps | Alta significativa — DCA reconfirmado |
| IPCA+ 2050 | ~6,85% | **dado pendente — verificar proxima sessao** | — | — |
| Renda+ 2065 | ~6,72% (22/abr) / ~6,96% (fechamento abr) | **~6,96%** | +24 bps vs 22/abr | Recuperou da minima de abr (6,71%). Margem vs gatilho compra (6,5%): ~46 bps |
| Fed Funds | 3,50–3,75% | **3,50–3,75%** | 0 bps | FOMC 29/abr: manteve. Voto 8-4 (4 dissidentes — historico desde 1992). Mercado projeta ZERO cortes em 2026 |
| US 10y Treasury | ~4,30% | **~4,40%** | +10 bps | Pressionado por energia/inflacao. Testou 4,45% (maximo 9m) |
| US 10y Real (TIPS) | ~2,00% | **1,90%** | -10 bps | Queda com aversao a risco |
| CPI EUA 12m | 3,3% (mar) | **3,3% (mar)** | 0 bps | Abr: divulgacao 12/mai/2026. Energia +12,5%, gasolina +18,9% (guerra Iran) |
| CDS Brasil 5y | dado pendente | **~135–140 bps** (ref. marco/2026) | — | Sem dados abr/mai confirmados. Faixa segura — longe do gatilho 300 bps |

### Leituras de Gatilhos (2026-05-01)

| Gatilho | Condicao | Status Atual | Acao |
|---------|----------|-------------|------|
| DCA IPCA+ longo ativo | Taxa >= 6,0% | **~7,40% (2040)** — VERDE solido (margem 140 bps) | DCA ativo em TD 2040 (80%) + TD 2050 (20%). Alta de taxa = DCA mais atrativo |
| Pausar DCA IPCA+ | Taxa < 6,0% | Nao atingido — margem 140 bps | — |
| Renda+ 2065 compra DCA | Taxa >= 6,5% | **~6,96%** — VERDE (margem ~46 bps) | DCA ativo ate 5% de posicao |
| Renda+ 2065 pausa compra | Taxa < 6,5% | Nao atingido — margem 46 bps | MONITORAR mensalmente |
| Renda+ 2065 venda total | Taxa <= 6,0% | Nao atingido (margem ~96 bps) | — |
| Panico Renda+ (segurar) | Taxa >= 9,0% | Nao atingido | — |
| CDS stress | CDS > 300 bps | **~135–140 bps** — VERDE. Longe do gatilho | — |
| CDS gatilho soberano | CDS > 400 bps sustentado 6m | Nao atingido | — |

### Implicacoes para a Carteira (2026-05-01)

1. **IPCA+ longo**: taxa a ~7,40% — +30 bps vs snapshot anterior. Margem de 140 bps acima do piso 6,0%. **DCA ativo com convicao renovada**. Spread BR/EUA (IPCA+ vs TIPS): 7,40% - 1,90% = **~550 bps** — excepcional, acima do snapshot anterior (525 bps).

2. **Renda+ 2065**: recuperou de 6,71% (minima abr, 13/abr) para ~6,96% (fechamento abr). Margem vs gatilho de pausa (6,5%) agora ~46 bps — melhorou vs 22 bps do snapshot anterior. **Probabilidade de atingir 6,0% em 12m: revisada para ~35-40%** (vs 50-55% no pior momento de abr). DCA ativo ate 5%.

3. **Ciclo de cortes — nova leitura pos-COPOM 29/abr**: Selic agora 14,50%. Focus projeta terminal 13,00% em dez/2026 (mais 1,25pp de cortes). Selic 2027: revisada para 11,00% (+50 bps vs snapshot anterior). IPCA 2026 a 4,86% (teto 4,5% ultrapassado) e IPCA 12m a 5,12% complicam ciclo. COPOM comunicado: vê inflacao "se afastando da meta". Proximo corte jun/2026 — "porta aberta" debatida. Risco: guerra Oriente Medio acelera petroleo → IPCA → pausa prematura em cortes. **Consequencia para IPCA+**: lag de 3-6 meses entre corte Selic e compressao de IPCA+ longo. Taxa a ~7,40% pode comprir para 6,5-7,0% em 6-12m se IPCA arrefecer.

4. **BRL/USD**: ~4,96. BRL atingiu maxima de 2026 (4,9548 em 20/abr). Carry: Selic 14,50% - Fed 3,625% = **~1.088 bps**. BRL forte sustentado por carry. Ciclo de cortes mais lento no Fed (zero cortes esperados) mantem diferencial alto. Premissa 0,5% dep. real/ano permanece — BRL atual (YTD +9%) e outlier vs media secular de 10%+/ano.

5. **Fed/EUA**: FOMC pausou em 3,50-3,75%. Voto incomum 8-4 (quatro dissidentes) — divisao interna sobre proximo passo. Mercado projeta zero cortes em 2026. CPI EUA a 3,3% (guerra energia). TIPS 10y caiu para 1,90% — spread BR/EUA se ampliou. Proximo CPI EUA: 12/mai/2026. Proximo FOMC: jun/2026.

6. **Risco fiscal BR**: sem novos dados desde ultimo snapshot. IFI projetava deficit primario R$90,6bi. Divida/PIB ~83,8% (UBS). CDS ~135-140 bps — longe de stress. Ano eleitoral (out/2026): pressao crescente. Mantem premio de risco nas taxas longas.

7. **Alerta proativo para agentes**: COPOM cortou 0,25pp → (a) RF: IPCA+ longo a ~7,40% — DCA mais atrativo que anterior, sem mudanca de estrategia mas reconfirmando compra; (b) Risco: Renda+ 2065 recuperou para ~6,96%, margem 46 bps vs gatilho de pausa 6,5% — DCA ativo; (c) FIRE: IPCA 5,12% acima meta pode pressionar premissas de retorno real — acompanhar.

### Delta vs Snapshot 03/Abr/2026 → 22/Abr/2026

| Indicador | 03/abr/2026 | 22/abr/2026 | Variacao | Impacto |
|-----------|------------|------------|---------|---------|
| Selic Meta | 14,75% | **14,75%** | 0 bps | COPOM 28-29/abr — consenso 55% corte 0,25pp |
| IPCA 12m | 3,81% (fev) | **4,14% (mar)** | +33 bps | Cruzou teto da meta 4,5% — desancoragem confirmada |
| IPCA mensal marco | — | **0,88%** | — | Divulgado IBGE 10/abr |
| Focus IPCA 2026 | 4,31% | **4,80%** | +49 bps | 6a semana consecutiva — 30 bps acima do teto |
| Focus Selic terminal 2026 | 12,50% | **13,00%** | +50 bps | Mercado revisou ciclo de cortes para cima |
| BRL/USD | 5,1655 | **~4,97** | -3,7% (BRL forte) | Carry 1.112 bps sustenta apreciacao |
| IPCA+ 2040 | 7,23% | **7,25%** | +2 bps | Estavel — DCA ativo |
| IPCA+ 2050 | 7,00% | **~6,85%** | -15 bps | Queda moderada — ainda verde |
| Renda+ 2065 | 6,98% | **~6,72%** | -26 bps | ALERTA — margem vs gatilho venda caiu de 98 para ~72 bps |
| Fed Funds | 3,64% | **3,50-3,75%** | Sem mudanca | FOMC pausando — CPI EUA 3,3% em marco |
| US 10y Treasury | 4,33% | **~4,30%** | -3 bps | Estavel |
| VIX | 24,54 | **~19,50** | -5,04 | Normalizou — mercados absorveram tarifas abr/26 |

### Leituras de Gatilhos (2026-04-22)

| Gatilho | Condicao | Status Atual | Acao |
|---------|----------|-------------|------|
| DCA IPCA+ longo ativo | Taxa >= 6,0% | **7,25%** — VERDE (margem 125 bps) | DCA ativo em TD 2040 (80%) + TD 2050 (20%) |
| Pausar DCA IPCA+ | Taxa < 6,0% | Nao atingido | — |
| Renda+ 2065 compra DCA | Taxa >= 6,5% | **~6,72%** — VERDE mas monitorar | DCA ativo ate 5% — posicao ~3% |
| Renda+ 2065 pausa compra | Taxa < 6,5% | Nao atingido (margem ~22 bps) | MONITORAR SEMANALMENTE |
| Renda+ 2065 venda total | Taxa <= 6,0% | Nao atingido (margem ~72 bps) | — |
| Panico Renda+ (segurar) | Taxa >= 9,0% | Nao atingido | — |

### Implicacoes para a Carteira (2026-04-22)

1. **IPCA+ longo**: taxa a 7,25% — 125 bps acima do piso operacional. DCA ativo sem alteracao. Spread BR/EUA (IPCA+ vs TIPS): 7,25% - ~2,0% = **~525 bps** — ainda excepcional.

2. **Renda+ 2065**: caiu de 6,98% para ~6,72% em 19 dias (-26 bps). Margem vs gatilho de venda (6,0%) caiu de 98 para ~72 bps. Margem vs gatilho de pausa de compra (6,5%) esta em ~22 bps. **Probabilidade de atingir 6,0% em 12-18m revisada de ~40-45% para ~50-55%**. Monitorar semanalmente.

3. **Ciclo de cortes — revisao**: Focus elevou Selic terminal 2026 de 12,50% para 13,00% (+50 bps). IPCA marco a 4,14% (acima do teto 4,5% pela primeira vez desde 2024). Focus IPCA 2026 a 4,80% — 6a semana consecutiva de alta. COPOM 28-29/abr: 55% probabilidade de corte 0,25pp, 40% manutencao. Ritmo de cortes sera mais lento que precificado ha 3 semanas.

4. **BRL/USD**: ~4,97. BRL apreciou 14% vs USD em 12 meses. Carry de 1.112 bps (Selic 14,75% - Fed 3,625%) sustenta. Ciclo de cortes mais lento = BRL sustentado por mais tempo. Premissa 0,5% dep. real/ano permanece.

5. **VIX**: recuou de 24,54 para ~19,50. Mercados normalizaram apos Liberation Day aniversario (02/abr). Tarifas EUA: 11% media efetiva (maior desde 1943). Novos tariffs: farmaceuticos 100% (jul-set/2026).

6. **Risco fiscal**: IFI projeta deficit primario R$ 90,6 bilhoes em 2026. Divida/PIB projetada 83,8% em 2026 (UBS). Ano eleitoral = pressao crescente. Impacto: mantem premio de risco alto nas taxas longas — favoravel para novas compras de IPCA+.

---

## Snapshot Macro Atual

> **Ultima atualizacao completa (revalidacao profunda): 2026-04-03** (via /fred-shiller — FRED + Shiller Yale)
> **Atualizacao parcial: 2026-04-02** (/news — Liberation Day)
> **Snapshot /macro-bcb: 2026-04-03** (APIs BCB + Investidor10 + Focus)

### Brasil

| Indicador | Valor | Data | Fonte |
|-----------|-------|------|-------|
| Selic Meta | **14,75%** | 2026-04-03 | BCB serie 432 |
| Selic Efetiva diaria | **0,11%/dia** | 2026-04-01 | BCB serie 4390 |
| Focus Selic terminal 2026 | **12,50%** | 2026-03-30 | BCB Focus (revisao alta: era 12,25%) |
| Focus Selic 2027 | **10,50%** | 2026-03-30 | BCB Focus |
| Focus IPCA 2026 | **4,31%** | 2026-03-30 | BCB Focus (3o mes consecutivo de alta) |
| Focus IPCA 2027 | **3,84%** | 2026-03-30 | BCB Focus |
| IPCA Mensal | **0,70%** | jan/2026 | IBGE (BCB serie 433 — mais recente disponivel) |
| IPCA 12m | **3,81%** | fev/2026 | IBGE (BCB serie 13522) |
| IGP-M Mensal | **0,52%** | mar/2026 | BCB serie 189 |
| IPCA+ 2040 | **7,23%** | 2026-04-03 | Investidor10 (+2bps vs 01/04) |
| IPCA+ 2032 | **7,65%** | 2026-04-03 | Investidor10 |
| IPCA+ 2050 | **7,00%** | 2026-04-03 | Investidor10 |
| Renda+ 2065 | **6,98%** | 2026-04-03 | Investidor10 (-3bps vs 02/04) |
| BRL/USD (PTAX) | **R$ 5,1655** | 2026-04-02 | BCB PTAX (ultimo disponivel) |
| BTC/USD | ~$66.500 | 2026-04-02 | Pintu News (-20% pós-Liberation Day) |
| Petroleo Brent | ~$75 | 2026-04-01 | Conflito Iran dissipado vs OPEC+ |
| Divida bruta/PIB (proj. 2026) | **~94,7%** | 2026-03 | IMF Article IV |
| Resultado primario (real, proj. 2026) | **~-0,6% PIB** | 2026-03 | Deloitte/Coface |

### Global

| Indicador | Valor | Data | Fonte |
|-----------|-------|------|-------|
| Fed Funds Rate | **3,64%** | 2026-03 (mar) | FRED FEDFUNDS (mensal) |
| US 10y Treasury | **4,33%** | 2026-04-01 | FRED DGS10 |
| US 30y Treasury | **4,91%** | 2026-04-01 | FRED DGS30 |
| US 10y Real (TIPS) | **2,02%** | 2026-04-01 | FRED DFII10 |
| Spread 10y-2y (yield curve) | **+52 bps** | 2026-04-02 | FRED T10Y2Y (positivo, curva normal) |
| HY Credit Spread | **3,16%** | 2026-04-01 | FRED BAMLH0A0HYM2 |
| VIX | **24,54** | 2026-04-01 | FRED VIXCLS (pico 31,05 em 27/mar, caindo) |
| CAPE S&P 500 (Shiller) | **37,94** (94,8o percentil) | 2026-04-02 | Multpl.com (Shiller file: 30.81 em set/23 — file desatualizado) |
| BRL/USD (FRED DEXBZUS) | **5,2312** | 2026-03-27 | FRED DEXBZUS (ultimo disponivel FRED) |
| BRL/USD (PTAX BCB) | **5,1655** | 2026-04-02 | BCB PTAX |
| MSCI World YTD | **+2,99%** | fev/2026 | MSCI |
| MSCI EM YTD | **+14,83%** | fev/2026 | MSCI |

**Comparativo 1 ano atras (abr/2025 — primeiro impacto Liberation Day):**
| Indicador | Abr 2025 | Abr 2026 | Variacao |
|-----------|---------|---------|---------|
| Fed Funds | 4,33% | 3,64% | -69 bps |
| US 10y | 4,17% | 4,33% | +16 bps |
| TIPS 10y real | 1,84% | 2,02% | +18 bps |
| Spread 10y-2y | +30 bps | +52 bps | +22 bps (menos invertida/mais normal) |
| VIX | 21,77 (depois foi 46,98 em 07/abr/25) | 24,54 | Elevado |
| HY spread | 3,50% | 3,16% | -34 bps (comprimiu) |
| BRL/USD | 5,6874 | 5,2312 | -8,0% (BRL apreciou) |

> Atualizar mensalmente via WebSearch + /macro-bcb. Proximo IPCA: 10/abr/2026.
> Proxima reuniao Copom: 28-29/abr/2026. Proxima FOMC: 6-7/mai/2026.

### BRL/USD Histórico (FRED DEXBZUS, 1995-2026) — análise de ciclos cambiais

Dado crítico para FR-currency-mismatch-fire. Atualizado 2026-04-03 via FRED DEXBZUS (n=7833 observacoes, 1995-01-02 a 2026-03-27):
- **Janelas 5 anos (rolling ~1260 trading days)**: BRL deprecia em **73,9% das janelas** | média depreciacao: +10,67%/ano anualizado | BRL aprecia em 26,1% | média apreciacao: -5,80%/ano
- **Janelas 10 anos (rolling ~2520 trading days)**: BRL deprecia em **75,7%** das janelas
- **Nota**: resultado 10 anos diferente do anterior (96,7%) — anterior usava janelas mensais, agora usando trading days. Metodologia atual mais conservadora para o bull case
- **YoY (abr/2025 vs mar/2026)**: BRL apreciou -8,0% vs USD — estamos em periodo de apreciacao (BRL forte com Selic elevada)
- **Implicação para carteira**: premissa base de 0,5% depreciacao real/ano e CONSERVADORA vs historico de 10,67%/ano anualizado nos periodos de depreciacao. Periodo atual de apreciacao nao invalida tendencia secular

### Contexto do ciclo (2026-03-20 -- revalidacao profunda)
- Copom iniciou ciclo de cortes com 0,25pp (cauteloso por conflito Iran)
- Forward guidance removida -- proximos passos data-dependent
- Mercado esperava 0,50pp antes do conflito -- ajustou para 0,25pp
- Treasury chief BR: "conflito pode encurtar ciclo de cortes"
- Lag historico Selic -> IPCA+ longa: 3-6 meses para compressao significativa
- Probabilidade de Renda+ atingir gatilho 6,0% em 12-18m: revisada para **~40-45%**
- Focus IPCA 2026 saltou para 4,10% -- desancoragem incipiente, monitorar se ultrapassa 4,5%
- Divida/PIB ~95% em 2026, trajetoria para 100% ate 2029 (IMF) -- preocupante mas nao crise
- Eleicoes out/2026: pressao para gastos pre-eleitorais (isencao IR R$5k, subsidios)
- Fed em modo "higher for longer" -- 1 corte em 2026, sem recessao (GDP 2,4%)
- EM outperformando DM significativamente (+14,83% vs +2,99% YTD)
- Spread IPCA+ BR (~7%) vs TIPS EUA (~2%) = ~500bps -- excepcional, reflete risk premium

### Valuations globais (atualizado 2026-04-03)
- **S&P 500 CAPE: 37,94** (94,8o percentil historico | media 17,40 | mediana 16,50 | max ever 44,20 em dez/1999). Fonte: Multpl.com (abr/2026) + Shiller data computado (n=1713 meses desde 1881)
  - Apenas 6,0% dos meses historicos tiveram CAPE >= 30. Apenas 2,7% tiveram CAPE >= 35
  - Spread CAPE yield (1/CAPE = earnings yield): 1/37,94 = 2,64% vs TIPS 10y 2,02% = premio equity 62 bps (comprimido)
- MSCI World CAPE: **~27** (acima media ~20)
- Europa CAPE: **~16-18** (proximo/abaixo media -- barato relativo)
- EM CAPE: **~12-14** (abaixo media -- barato relativo)
- Research Affiliates US large cap 10y expected return: **3,1-3,4% nominal** (CAPE-based)
- Shiller estimated 10y nominal (CAPE model): EUA ~5,2%, Europa ~6,7%, Japao ~6,8%
- EM expected real return (CAPE model): ~9%
- Shiller GS10 (10y yield historico arquivo): set/2023 = 4,09% | atual FRED DGS10 = 4,33%
- Fonte: Multpl.com, Shiller ie_data.xls (Yale), Research Affiliates, Siblis Research

### Factor premiums (2026-03-20)
- Value spread (AQR): ~percentil **70-80** (comprimiu do 94th em 2022, ainda acima da media)
- Deep value historicamente compensado (AQR research)
- EM vs DM spread e o maior "value trade" global atual
- Carteira de Diego (AVGS, AVEM com tilt value/SCV) bem posicionada

### Risco fiscal BR -- analise de evento extremo (2026-03-20)
- Divida/PIB: 95% (2026) -> 99% (2030, IMF baseline)
- IMF cenario otimista: superavit 1,7% PIB em 2034 -> estabilizacao
- Probabilidade confisco tipo Collor (11y): **<2%** (requer colapso institucional)
- Probabilidade IOF punitivo >25% sobre saida: **5-10%**
- Probabilidade controle cambial parcial: **8-12%**
- Probabilidade dominancia fiscal (BC perde autonomia de facto): **15-25%**
- IOF historico maximo: 9% (anos 90). Precedente 2008-2011: ate 6% sobre inflows
- Risco real: friccao crescente para mover capital, nao confisco

### Bear market prolongado -- cenarios (2026-03-20)
- JP Morgan: 35% prob recessao global 2026
- JGB crash jan/2026 (40y yield a 4,0%) -- yen carry trade unwind risk
- MSCI World nunca teve "lost decade" com retorno real negativo (pior: ~0% em 2000-2010)
- Bear prolongado em mercado unico (Japao, EUA) =/= bear global diversificado
- Cenario relevante para Diego: -30% a -50% com recuperacao em 3-7 anos

### Riscos priorizados (2026-03-20)
1. **Petroleo >$100 persistente** (prob: alta) -- Selic para de cair, taxas longas sobem
2. **Desancoragem inflacionaria** (prob: media) -- Focus 4,10% e subindo
3. **Fiscal pre-eleitoral** (prob: alta) -- gastos expansionistas antes de out/26
4. **Divida/PIB >95%** (prob: alta) -- trajetoria IMF insustentavel sem ajuste
5. **Fed higher for longer** (prob: media-alta) -- pressao sobre EM e dolar

---

## Decisoes Cambio (absorvido de 07)

| Data | Decisao | Racional |
|------|---------|----------|
| 2026-03 | Sem hedge de equity | Custo proibitivo (~10%/ano carry) + BRL hedge natural |
| 2026-03 | Sem bonds internacionais | Yield negativo pos-hedging |
| 2026-03 | UCITS como veiculo padrao | Sem estate tax, sem risco IRS |
| 2026-03-20 | Premissa depreciacao real BRL: 0,5%/ano (base), 1,5% (favoravel), 0% (stress) | Forward-looking: 1,5-2,0%/ano, mas base conservadora adotada |

## Gatilhos Ativos

| Gatilho | Condicao | Acao | Status |
|---------|----------|------|--------|
| IPCA+ aos 48 | Taxa >= 6,5% na epoca | Sinalizar para Head e Renda Fixa | Aguardando (2035) |
| Renda+ mensal | Taxa do Renda+ 2065 | Reportar ao agente 06 Tactical | Monitorando |

---

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-03 | Macro deve alterar a estrategia? | Nao — contexto informativo apenas |
| 2026-03 | O que monitorar mensalmente? | NTN-B 2040 e Renda+ 2065 |
| 2026-03-18 | Completar snapshot (HD-001) | Preenchido: Renda+ 6,87%, IPCA 3,81%, BRL/USD 5,20 |
| 2026-03-18 | RF-001: cenario macro para Renda+ | Base (50-55%): gatilho 6,0% em 12-18m. Pessimista (25-30%): 8%+ se fiscal deteriorar. Risco: eleicoes 2026 |
| 2026-03-20 | Revalidacao profunda da carteira | Carteira bem posicionada. 13% soberano BR adequado. IPCA+ 2040 ~7% no percentil 80-85. Renda+ gatilho 6,0% prob ~40-45%. Riscos: Iran/petroleo, desancoragem, fiscal pre-eleitoral. Nenhuma mudanca de estrategia recomendada |
| 2026-03-20 | Contexto macro para 4 debates do time | CAPE EUA ~38 (caro), EM ~12-14 (barato). Fiscal BR: divida 95%->99% (IMF). Confisco prob <2%, friccao cambial 8-12%. Bear global prolongado: improvavel para carteira diversificada. Value spread ~p70-80 (favoravel). 89% equity defensavel se diversificado |
