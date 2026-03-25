# FI-crowdedness: Crowdedness de Factor Strategies e Risco para AVGS/JPGL

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-crowdedness |
| **Dono** | 02 Factor |
| **Status** | Done |
| **Prioridade** | Media |
| **Participantes** | 02 Factor, 10 Advocate, 11 Quant, Fact-Checker |
| **Criado em** | 2026-03-20 |
| **Concluido em** | 2026-03-24 |

---

## Contexto

Quant crisis de 2007 e o framework de co-momentum (Lou & Polk 2022) mostram que factor strategies ficam crowded e sofrem drawdowns sincronizados. Com o crescimento massivo de smart beta ETFs ($1.7-2T AUM global), os fatores em que Diego investe (value, momentum, low-vol, quality via AVGS e JPGL) podem estar mais crowded. Se o factor premium esta sendo arbitrado, a expectativa de +0.5% a.a. sobre VWRA pode nao se materializar.

---

## Analise

### Factor: achados principais

- **Value spread**: 75-80th percentile globalmente (90th+ ex-US) → valor barato, crowding baixo em value/quality
- **Co-momentum**: LOW em value/quality. Crowding concentrado em mega-cap growth/AI, nao em factor strategies
- **Performance 2025**: AVEM +14.83% YTD, HML +9.40% — rebound em curso (dado descritivo, nao conclusivo)
- **JPGL vs IWMO**: momentum e mais eficiente dentro de multifator (menor turnover, menor market impact)

### Debate central: capacity constraints

O Factor argumentou originalmente que smart beta AUM total (~$1.7T) estava abaixo dos limites de capacidade de Frazzini et al. (2018). O Advocate identificou falacia de composicao:

**Comparacao correta (fator vs fator):**
- Momentum-focused AUM global (ETFs): ~$80-110B
- Capacity UMD ajustada para 2026 (rebalanceamento diario): ~$90-100B
- Capacity UMD para rebalanceamento trimestral/semestral: ~$320B+

**Veredicto revisado pelo Factor**: momentum-focused AUM ja esta NA ZONA DE ATENCAO para estrategias de rebalanceamento diario, mas confortavel para ETFs que rebalanceiam trimestralmente. Value (HML ~$214B capacity) e size (SMB ~$275B) tem ampla margem.

**Nota Fact-Checker**: Os numeros exatos $275B/$214B/$56B nao foram localizados nas fontes primarias de Frazzini et al. (2018). O paper reporta UMD break-even de ~$52B (nao $56B). Os outros valores nao foram verificados — tratar como estimativas de ordem de magnitude, nao numeros citaveis.

### Advocate: stress-test

**Claims rejeitados:**
1. Falacia de composicao no AUM — confirmada, Factor reconheceu
2. Value spread como sinal preditivo de timing — R² de 0.10-0.15; narrativa existiu 10 anos sem funcionar (2014-2020)
3. Co-momentum baixo NAO protege contra unwind sincronizado em crise — em ago/2007, o crowding so se revelou no unwind
4. Performance YTD como evidencia — noise de 3 meses, sem atribuicao beta vs alpha fatorial

**Riscos nao modelados:**
- **Quant Crisis 2.0**: AVGS (small value) foi epicentro em 2007. Drawdown estimado -25 a -35% em semanas. Bloco equity de Diego: -16 a -22.5% em cenario de quant unwind isolado
- **Post-publication decay**: McLean & Pontiff (2016) — 32% decay atribuivel a publicacao (58% total pos-publicacao). Haircut 30% SmB/HmL esta no limite do decay esperado, nao e conservador
- **Alpha real apos haircuts corretos**: se SmB/HmL recalibrado para 35-40%, alpha esperado sobre VWRA cai para ~0.15-0.25% antes de TER delta

### Quant: validacao numerica

- Falacia de composicao: CONFIRMADA
- ETFs momentum-focused (apenas pure ETFs): ~$20-35B; com mandatos institucionais (hedge funds): pode ultrapassar $56B
- Multifator consome capacidade cruzada: CORRETO — Frazzini nao modela isso; limites por fator sao upper bounds
- Capacidade cresceu ~1.5-2x desde 2018, mas AUM cresceu ~3-4x → folga diminuiu
- **Para Diego especificamente**: capacity constraints sao irrelevantes na EXECUCAO (JPGL €265M, AVGS ~$768M sao microscopicos). O risco e SISTEMICO — se premiums encolhem, encolhem para todos

---

## Conclusao

**Tese AVGS+JPGL > VWRA: sustentada, com margem fina.**

| Dimensao | Status |
|----------|--------|
| Crowding momentum | Zona de atencao sistemica. Mitigado: JPGL e multifator, nao momentum puro |
| Crowding value/size | Baixo. Capacity ampla |
| Haircut WmL 50% | Confirmado adequado |
| Haircut SmB/HmL 30% | Minimo razoavel. 35-40% mais defensivo (McLean & Pontiff: 32% decay medio) |
| Alpha real sobre VWRA | ~0.15-0.35%/ano apos haircuts e TER. Pequeno mas positivo |
| Decisao JPGL > IWMO | Reforçada: multifator mitiga crowding de momentum standalone |
| Tail risk quant unwind | Real — AVGS -25 a -35% em semanas e cenario plausivel |

**Condicoes sob as quais a tese FALHA:**
1. Factor premiums decaem >50% (HML ja ~0% nos EUA desde 1990 — risco real em ex-US/EM)
2. Quant crisis sincronizada em ETFs multifator (sem precedente nesta escala, mas mecanismo documentado)
3. Alpha real (0.15-0.25%) nao justifica complexidade e tail risk vs VWRA simples

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Sem mudanca. Tese sustentada |
| **Estrategia** | JPGL > IWMO reforçado. Multifator mitiga crowding |
| **Conhecimento** | Haircut SmB/HmL 30% -> recalibrar para 35-40% no HD-scorecard. Quant crisis 2.0 modelar no proximo stress test |
| **Memoria** | Falacia de composicao em AUM: comparar sempre fator vs fator, nao agregado vs limite individual |

---

## Referencias

- Lou & Polk (2022) — "Comomentum: Inferring Arbitrage Activity from Return Correlations", RFS 35(7)
- Frazzini, Israel & Moskowitz (2018) — "Trading Costs", JFE (UMD break-even ~$52B; outros numeros nao verificados)
- McLean & Pontiff (2016) — "Does Academic Research Destroy Stock Return Predictability?", JF 71(1) (32% decay por publicacao; 58% total)
- Khandani & Lo (2007/2011) — "What Happened to the Quants in August 2007?"
- Brunnermeier & Pedersen (2009) — "Market Liquidity and Funding Liquidity", RFS 22(6) (mecanismo teorico de liquidity spirals)
