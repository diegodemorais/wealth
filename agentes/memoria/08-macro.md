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

## Snapshot Macro Atual

> **Ultima atualizacao completa (revalidacao profunda): 2026-04-01** (via /macro-bcb + /fred-shiller)
> **Atualizacao parcial: 2026-04-02** (/news — Liberation Day)

### Brasil

| Indicador | Valor | Data | Fonte |
|-----------|-------|------|-------|
| Selic | **14,75%** | 2026-03-18 | COPOM (corte de 0,25pp, unanime) |
| Focus Selic terminal 2026 | **12,25%** | 2026-03-16 | BCB Focus |
| Focus Selic 2027 | **10,50%** | 2026-03-16 | BCB Focus |
| Focus IPCA 2026 | **4,31%** | 2026-04-02 | BCB Focus (3º mês consecutivo de alta) |
| IPCA+ 2040 | **7,21%** | 2026-04-01 | Investidor10 / Tesouro Direto |
| Renda+ 2065 | **7,01%** | 2026-04-02 | Status Invest / Mais Retorno |
| IPCA 12m | **3,81%** | fev/2026 | IBGE (BCB série 433) |
| BRL/USD (PTAX) | **R$ 5,18** | 2026-04-02 | BCB PTAX |
| BTC/USD | ~$66.500 | 2026-04-02 | Pintu News (-20% pós-Liberation Day) |
| Petroleo Brent | ~$75 | 2026-04-01 | Conflito Iran dissipado vs OPEC+ |
| Divida bruta/PIB (proj. 2026) | **~94,7%** | 2026-03 | IMF Article IV |
| Resultado primario (real, proj. 2026) | **~-0,6% PIB** | 2026-03 | Deloitte/Coface |

### Global

| Indicador | Valor | Data | Fonte |
|-----------|-------|------|-------|
| Fed Funds Rate | **3,64%** | 2026-04-01 | FRED FEDFUNDS |
| US 10y Treasury | ~**4,2%** | 2026-04-01 | FRED DGS10 |
| US 10y Real (TIPS) | **2,00%** | 2026-04-01 | FRED DFII10 |
| Spread IPCA+ BR vs TIPS EUA | **~520 bps** | 2026-04-01 | Calculado: 7.21% - 2.00% |
| CAPE S&P 500 (Shiller) | **37,91** (98º percentil) | 2026-04-01 | Shiller/Multpl |
| VIX | **25,25 → ⚠️ pós-Liberation Day pendente** | 2026-04-02 | FRED VIXCLS — confirmar fechamento hoje |
| MSCI World YTD | **+2,99%** | fev/2026 | MSCI |
| MSCI EM YTD | **+14,83%** | fev/2026 | MSCI |

> Atualizar mensalmente via WebSearch + /macro-bcb. Proximo IPCA: 10/abr/2026.
> Proxima reuniao Copom: 28-29/abr/2026. Proxima FOMC: 6-7/mai/2026.

### BRL/USD Histórico (FRED DEXBZUS, 1994-2026) — análise de ciclos cambiais

Dado crítico para FR-currency-mismatch-fire:
- **Janelas 5 anos**: BRL deprecia em **74,1% das janelas** (média +7,93%/ano). Aprecia em 25,9% (média -3,12%/ano)
- **Janelas 10 anos**: BRL deprecia em **96,7%** das janelas
- **Períodos de apreciação**: 2003-2011 (Lula boom), breve 2016-2018 pós-impeachment
- **Implicação para carteira**: premissa base de 0,5% depreciação real/ano é CONSERVADORA vs histórico. Favorável valida BRL como hedge natural do equity USD

### Evento crítico (2026-04-02): Liberation Day
- Trump anunciou tarifas universais: 10% flat sobre todas as importações americanas
- Tarifas reciprocais: China +34%, EU +20%, Japão +24%
- Vigência: 10% em 05/abr, reciprocais em 09/abr
- BTC -20% em 24h. VIX pré-abertura ~25 — pós-anúncio: pendente confirmação
- Impacto carteira Diego: limitado (horizonte 14 anos, diversificação ex-US). Sem gatilho acionado.
- Implicação para RF BR: ciclo COPOM mais cauteloso → taxas longas elevadas por mais tempo. **Favorável para DCA IPCA+**

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

### Valuations globais (2026-04-01)
- S&P 500 CAPE: **37,91** (98º percentil histórico, 2x media ~17). Só esteve aqui em 1929 e 2000
- MSCI World CAPE: **27,7** (acima media ~20)
- MSCI World P/E forward: **24,3**
- Europa CAPE: **~16-18** (proximo/abaixo media)
- EM CAPE: **~12-14** (abaixo media -- barato)
- Research Affiliates US large cap 10y expected return: **3,1% nominal**
- Shiller estimated 10y nominal: EUA ~5,2%, Europa ~6,7%, Japao ~6,8%
- EM expected real return (CAPE model): ~9%
- Fonte: Siblis Research, Research Affiliates, Multpl.com

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
