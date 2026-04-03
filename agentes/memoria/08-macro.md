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

## Snapshot Abril/2026

> **Data do snapshot:** 2026-04-03
> **Auditoria desta sessao:** 2026-04-03 (APIs BCB serie 432, 13522, 1 + Investidor10 + FRED FEDFUNDS + FRED DFII10 + FRED DGS10 + FRED VIXCLS)
> **Resultado da auditoria:** todos os dados confirmados — nenhuma divergencia encontrada vs snapshot /macro-bcb do mesmo dia

### Delta vs Snapshot Marco/2026 (2026-03-20)

| Indicador | Marco/2026 | Abril/2026 | Variacao | Impacto |
|-----------|-----------|-----------|---------|---------|
| Selic Meta | 14,75% | **14,75%** | 0 bps | Sem mudanca (COPOM 19/mar cortou 0,25pp para 14,75%) |
| IPCA 12m | 3,81% (fev) | **3,81% (fev)** | — | Dado de marco/2026 pendente (divulgacao 10/abr/2026) |
| BRL/USD PTAX | ~5,20 | **5,1655** | -0,3% | BRL levemente mais forte |
| IPCA+ 2040 | ~7,20% | **7,23%** | +3 bps | Estavel — dentro do regime |
| IPCA+ 2050 | — | **7,00%** | — | Novo registro no snapshot |
| Renda+ 2065 | 6,87% (mar/18) | **6,98%** | +11 bps | Alta desde 18/mar. Ainda longe do gatilho 6,5% (venda) |
| Fed Funds | 4,33% (abr/25) | **3,64% (mar/26)** | -69 bps | Ciclo de cortes Fed em andamento |
| TIPS 10y real | 1,84% (abr/25) | **2,02%** | +18 bps | Real yield EUA subiu — spread BR/EUA comprimiu levemente |
| US 10y Treasury | 4,17% (abr/25) | **4,33%** | +16 bps | Treasuries longos mais altos a despeito do ciclo de corte |
| VIX | 21,77 (abr/25) | **24,54** | +2,77 | Elevado vs abr/25 — Liberation Day gerou volatilidade |

### Leituras de Gatilhos (2026-04-03)

| Gatilho | Condicao | Status Atual | Acao |
|---------|----------|-------------|------|
| DCA IPCA+ longo ativo | Taxa >= 6,0% | **7,23%** — VERDE (margem 123 bps) | DCA ativo em TD 2040 (80%) + TD 2050 (20%) |
| Pausar DCA IPCA+ | Taxa < 6,0% | Nao atingido | — |
| Renda+ 2065 compra DCA | Taxa >= 6,5% | **6,98%** — ACIMA de 6,5% — VERDE | DCA ativo ate 5% do portfolio |
| Renda+ 2065 venda total | Taxa <= 6,0% | Nao atingido (98 bps de distancia) | — |
| Panico Renda+ (segurar) | Taxa >= 9,0% | Nao atingido | — |

### Implicacoes para a Carteira (2026-04-03)

1. **IPCA+ longo**: taxa a 7,23% — 123 bps acima do piso operacional. DCA ativo. Spread BR/EUA (IPCA+ vs TIPS): 7,23% - 2,02% = **521 bps** — excepcional, reflete risk premium soberano elevado.

2. **Renda+ 2065**: a 6,98%, esta acima do gatilho de compra (6,5%). DCA ativo ate 5% do portfolio. Posicao atual ~3% — margem para aportes. Gatilho de venda (6,0%) a 98 bps de distancia — sem urgencia.

3. **Ciclo de cortes**: proxima reuniao Copom 28-29/abr/2026. Focus projeta Selic terminal 12,50% em 2026. Com IPCA 12m ainda a 3,81% e Focus IPCA 2026 em 4,31%, o BC tem espaco para cortes, mas desancoragem de expectativas e o risco central. Lag historico Selic -> compressao de taxas longas: 3-6 meses — IPCA+ pode comprimir nos proximos meses.

4. **BRL/USD**: 5,1655, apreciado vs abr/2025 (5,6874). Selic a 14,75% sustenta carry. Ciclo de cortes pressiona BRL progressivamente — monitorar. Premissa base 0,5% depreciacao real/ano permanece conservadora vs historico.

5. **VIX a 24,54**: acima da zona de conforto (<20). Liberation Day (tarifas EUA) gerou volatilidade. Impacto direto: spreads de credito ainda comportados (HY 3,16%), mas risco de segunda onda permanece.

6. **IPCA marco/2026**: divulgacao em 10/abr/2026. Focus projeta 4,31% para 2026. Se leitura de marco superar 4,5%, emitir alerta para agente RF e Risco (risco de desancoragem acima do teto da meta 4,5%).

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
- Carteira de Diego (AVGS, AVEM, JPGL com tilt value/SCV) bem posicionada

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
