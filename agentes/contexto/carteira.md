# Carteira Diego Morais — Contexto Compartilhado

> Atualizado em: 2026-04-22
> Este arquivo e a fonte de verdade para todos os agentes.
> Cambio de referencia: R$ 5,156 (PTAX BCB 2026-04-22, dashboard_state.json)

---

## Investidor

- **Nome**: Diego Morais
- **Idade**: 39 anos (nascimento 19/02/1987)
- **Localidade**: Sao Paulo, Pinheiros
- **Meta FIRE**: **Cenário Base — 2040 (53 anos).** SWR ≤ 3.0%, aporte R$25k/mês → P(FIRE Base): **86,4% base / 92,0% favorável / 82,5% stress** (MC 10k, spending smile ex-saúde + guardrails + bond tent + IR 15% nominal + INSS R$18k/ano@65 + vol bond pool 13.3% + SAUDE_BASE R$24k + VCMH 5.0%). **Cenário Aspiracional — 2035 (49 anos).** SWR ≤ 3.0%, aporte R$30k/mês → P(FIRE Aspiracional): **85% base** (MC validado, retornos + aportes elevados). Revisão anual a partir de 2034 (48 anos). **Não trabalhar além de 2040 independente de P(FIRE).** Gatilho adicional: **patrimônio ≥ R$10M → avaliar cenário aspiracional como viável** (materializa ~2036–2038).
- **Distribuição subjetiva FIRE date** (elicitação estruturada FR-fire-date-elicitation, 2026-04-11): P(<47)=10% risco saúde/invalidez involuntário — não planejável, SWR ~3.5-4.5%; P(47–50)=30% viável com guardrails se patrimônio ≥ R$9M; P(50–53)=30% alinhado com modelo base; P(53–57)=10% atraso por casamento/filho; P(>57)=20% "não quis parar" ou vida mudou muito. **Gatilhos de vida**: casar → atrasa; filho → atrasa; negócio bom → acelera; burnout → FIRE involuntário (monitorar SWR anualmente a partir de 2030); patrimônio R$10M → debate antecipação; sócio/projeto → atrasa. **Flag Behavioral**: gap 9/10 profissional vs 7/10 pessoal já presente em 2026 — não se resolve automaticamente no FIRE. Intervenção recomendada: mover 7→8 pessoal nos próximos 12 meses independente do target financeiro.
- **Patrimonio**: R$ 3.472.335 (excl. operacao estruturada COE/emprestimo)
- **Aporte mensal**: R$ 25k
- **Renda estimada**: R$ 45k/mês (para cálculo savings rate no dashboard — SR = aporte R$25k / renda R$45k = 55.6%)
- **Custo de vida**: R$ 250k/ano
- **Estado civil**: Solteiro, namorada (casamento iminente ~2026-2027). Filho previsto ~2028. **GATILHO**: ao casar/ter filho, recalibrar imediatamente: custo de vida (R$250k → R$270-300k+), FIRE date, sucessao, seguro de vida (gap critico), estrutura empresarial, testamento. **FIRE casal (XX-casamento 2026-04-12):** ambos aposentam em 2040 (53a). P(FIRE 53, R$270k + floors Katia) = **89.4%** base. Floors Katia: INSS 30a R$84.6k/ano + PGBL R$29.2k/ano = R$113.8k/ano from 2049 (ano 9 pós-FIRE). INSS Diego R$18k/ano from 2052. Aportes casal: R$15k/mês (fase 1). Saúde 2p: R$32k/ano.
- **Empresas**: 2 PJs no Simples Nacional (contabilidade: Contabilizei)
- **INSS Diego (extrato 26/03/2026)**: NIT 119.60772.92-3. CI desde 08/2003. Teto desde 01/2017. Tempo total: ~22a6m. Benefício estimado (65 anos, parar no FIRE/50): ~R$46-55k/ano real 2026 — requer validação previdenciária.
- **INSS Katia (extrato 22/01/2025 + contribuição contínua no teto confirmada)**: NIT 129.35576.25-1. CI desde 08/2006. Teto desde ~2016-2017. Tempo acumulado (04/2026): ~16 anos. Aposentadoria: **62 anos / novembro 2049** (Regra Definitiva EC 103/2019) ou ~61 anos pela Regra de Pontos. Benefício: **~R$7.800/mês bruto (R$93.600/ano) real R$2026** — SB = 93% do teto, 39 anos de contribuição → 100% do SB. PV hoje: ~R$440k. Floor income familiar a partir de 2049. Ver TX-inss-katia.
- **PGBL Katia (Icatu Seguros — Novus do Brasil, 04/2026)**: Saldo R$57.159 (dois fundos Renda Fixa). Contribuição mensal: R$850 Katia + R$850 empresa (match 100% até 5% do salário base R$17k) = R$1.700/mês total, R$20.400/ano. Indexado ao salário (mínimo INPC via dissídio). Projeção real 4,5%/ano: **~R$490k no FIRE Day 2040** (para de contribuir); **~R$728k em 2049** (após acúmulo sem aportes dos 53 aos 62). Se Katia contribuir até 2049: ~R$948k. Renda SWR 4%: R$25–32k/ano líquido. PGBL = componente principal do patrimônio estimado R$800k de Katia no FIRE Day. Dedução fiscal: limite 12% renda bruta = R$25.920/ano; gap R$15.720 não usado (aportes voluntários acima do match). Ver TX-pgbl-katia.
- **Imóveis**: Apartamento Pinheiros: valor ~R$820k, hipoteca SAC R$453.417, termina 15/02/2051, equity ~R$367k. Terreno Nova Odessa: R$150k.

### Plataformas
- **ETFs internacionais (UCITS LSE)**: Interactive Brokers
- **Tesouro Direto + ETFs B3 (HODL11)**: Nubank e XP
- **Cambio**: Okegen (spread 0,25% ida e volta)
- **Dashboard**: https://diegodemorais.github.io/wealth-dash/ (SHA-256 auth) — deploy automático via GitHub Actions ao push para main

---

## Carteira FIRE Variavel (90,4% do patrimonio)

### Bloco Equity Fixo

| ETF | Alocacao Alvo | Atual | Composicao Real (USD) | Status |
|-----|--------------|-------|----------------------|--------|
| SWRD | **50%** | 41,2% (R$ 1.293k) | SWRD ~$251k | Underweight — **prioridade nos aportes equity** |
| AVGS (US + INT) | **30%** | 32,6% (R$ 1.061k) | AVUV + AVDV + USSC + AVGS ~$199k | Próximo do target. Aportar só em AVGS UCITS |
| AVEM | **20%** | 26,4% (R$ 859k) | EIMI + AVES + DGS ~$160k | Overweight via transitórios. Aportar só em AVEM UCITS quando subrepresentado |
| JPGL | **0%** | 0,3% (R$ 11k) | IWVL ~$2.1k | **Não adicionar. Target eliminado (FI-jpgl-zerobased, 2026-04-01). IWVL = transitório legado — diluir via aportes.** |

**Nova alocação aprovada (FI-equity-redistribuicao, 2026-04-01): SWRD 50% / AVGS 30% / AVEM 20%. Unanimidade 7/7 agentes (13.5x ponderado). Via aportes — sem vendas.**
Design 50/50 neutro/fatorial preservado.

### Ativos Transitorios (nao comprar mais — diluir via aportes)
EIMI, AVES, AVUV, AVDV, DGS, USSC, IWVL

Todos com lucro. Nao vender para evitar imposto (15%). Diluir via aportes nos ETFs alvo. Vender na fase de usufruto.

---

## Outros Blocos

| Bloco | % Atual | Alvo | Valor | Instrumento | Regra |
|-------|---------|------|-------|-------------|-------|
| Reserva | 2,5% | — | R$ 86.554,71 | Tesouro IPCA+ 2029 | Emergencia. Migrar pra Selic no vencimento (2029) |
| IPCA+ existente | — | — | — | — | Incorporado ao bloco IPCA+ longo (posicao 2040) |
| IPCA+ longo | **6,1%** | **15%** | R$ 124.675,79 (2040: R$113.015 + 2050: R$11.660 após liq. 13/04) | TD 2040 (80%) + TD 2050 (20%) | **Hold to maturity SEMPRE.** DCA ate 15% da carteira enquanto taxa >= 6,0%. Compra direta no Tesouro. Piso operacional: IPCA+ >= 6,0% (margem 50 bps sobre breakeven all-in ~5,5%). 5,0-6,0%: pausar DCA, aportes para equity. Gatilho de venda: NENHUM (exceto risco soberano extremo). Posicao estrutural — nao vender por MtM |
| IPCA+ curto | 0% | **3%** | — | TD curto ~2 anos | SoRR buffer. **Comprar perto dos 50**, nao agora. Substitui Selic no plano original (melhor protecao inflacionaria, MtM baixo com ~2 anos duration) |
| Renda+ 2065 | 3,4% | <=5% | R$ 117.832,62 | Renda+ 2065 | Duration 43,6. Taxa atual: 6,93% (2026-04-22). Compra: DCA ate 5% se taxa >= 6,5%. Venda: tudo se taxa <= 6,0% (aguardar 720 dias se holding < 2 anos). Panico (9%+): manter. **Gatilho soberano: CDS 5Y Brasil > 400bps sustentado por 6 meses → avaliar venda IPCA+/Renda+ (pré-crise 2015 = ~350bps).** Ver cenarios: agentes/contexto/renda-plus-2065-cenarios.md |
| Cripto | 2,9% | **3%** | R$ 100.208 | HODL11 + spot legado | BTC $71.877 (22/Apr). Alvo 3%, piso 1,5%, teto 5%. Spot = legado, nao mexer. **Classificação: Global/Cripto — NÃO Brasil.** BTC precificado em USD; wrapper B3 tem risco operacional XP/B3, mas sem risco soberano BR. Exposto à variação BTC/USD, não ao real. |
| COE + Empréstimo XP | ~1,7% | — | ~R$ 64k net | COE XP0121A3C3W (ativo ~R$172k) + Empréstimo XP (passivo ~-R$108k) | Produto estruturado BRL na XP. **Fonte de verdade**: aba Histórico da Carteira Viva (Google Sheets) — pipeline lê via gviz API automaticamente. Atualizar no Sheets; rodar `reconstruct_history.py` + `generate_data.py` para refletir no dash. Classificação: Brasil (risco operacional XP, BRL soberano). |

---

## Tabela de Alocacao por Idade

| Bloco / ETF | 39 (atual) | 40 | 50 | 60 | 70 |
|-------------|-----|-----|-----|-----|-----|
| IPCA+ longo | 15% | 15% | 15% | 0% | 0% |
| IPCA+ curto | 0% | 0% | 3% | 3% | 3% |
| Equity total | 79% | 79% | 79% | 94% | 94% |
| — SWRD | **39,5%** | **39,5%** | **39,5%** | **47,0%** | **47,0%** |
| — AVGS | **23,7%** | **23,7%** | **23,7%** | **28,2%** | **28,2%** |
| — AVEM | **15,8%** | **15,8%** | **15,8%** | **18,8%** | **18,8%** |
| — JPGL | 0% | 0% | 0% | 0% | 0% |
| HODL11 (cripto) | 3% | 3% | 3% | 3% | 3% |
| Renda+ 2065 tatico | <=5% | <=5% | <=5% | 0% | 0% |

*Equity pesos absolutos = % dentro do equity block × % equity total do portfólio (79%). Equity block: SWRD 50% / AVGS 30% / AVEM 20% (aprovado FI-equity-redistribuicao, 2026-04-01).*

IPCA+ longo: TD 2040 (80%) + TD 2050 (20%). TD 2040 vence em 2040 (Diego tera 53). Pos-vencimento, capital realocado para equity. IPCA+ curto (~2 anos duration) comprado perto dos 50 como SoRR buffer — substitui Selic do plano original. Decisao HD-006 (final 2026-03-22): alvo 15% com breakeven all-in ~5.5% e piso operacional 6.0%. A 7.21% (2026-04-01), IPCA+ vence equity em todos os cenarios de factor premium.

---

## Decisoes Pendentes

1. ~~**AVEM -> JPGL parcial**~~ — JPGL eliminado (FI-jpgl-zerobased, 2026-04-01). Não há migração futura para JPGL.
2. **Ativos transitorios**: nao comprar mais — aportar nos alvos UCITS (SWRD, AVGS, AVEM), vende-los na fase de usufruto
3. **IPCA+ longo ate 15%**: DCA em TD 2040 (80%) + TD 2050 (20%) enquanto taxa >= 6,0%. **DCA ATIVO** (taxa atual 7,21% IPCA+ 2040 > piso 6,0%). Se taxa cair para <6,0%: pausar DCA, aportes para equity (SWRD/AVGS/AVEM). **Hold to maturity SEMPRE** — nao vender por MtM. Gatilho de venda: NENHUM (exceto risco soberano extremo). **Prioridade RF: IPCA+ antes do Renda+ (gap 14,2pp vs 1,8pp)**
4. **Reserva**: migrar de IPCA+ 2029 para Selic no vencimento (2029)
5. **Renda+ 2065**: compra DCA ate 5% se taxa >= 6,5%. Venda tudo se taxa <= 6,0% — mas aguardar 720 dias se holding < 2 anos (carry domina reducao de IR). Se taxa 9%+: manter pelo carrego. Ver cenarios validados: agentes/contexto/renda-plus-2065-cenarios.md
6. **IPCA+ curto 3%**: comprar perto dos 50 (SoRR buffer, ~2 anos duration). Substitui Selic no plano original
7. **RF pos-2040 (Decisão 7 reformulada 2026-04-02)**: IPCA+ 2045 só existe com juros semestrais no TD (reinvestimento + IR antecipado não compensam). Decisão simplificada: verificar se TD 2050 já existente (20% do bloco IPCA+ longo) >= 3% do portfolio em 2040. Se sim, nenhuma ação adicional. Gap anos 8-10 (Diego 60-63) = equity puro, 3 anos, aceitável com horizonte 25+ anos. Se TD 2050 < 3%: aumentar DCA de TD 2050 (sem juros, disponível)

---

## Guardrails de Retirada (aprovados 2026-03-20, fonte atualizado 2026-03-27)

| Drawdown | Acao | Retirada |
|----------|------|----------|
| 0-15% | Nada | R$250k |
| 15-25% | Corte 10% | R$225k |
| 25-35% | Corte 20% | R$200k |
| >35% | Piso | R$180k |
| 3+ anos abaixo de -25% | Piso + avaliar renda part-time | R$180k |

- **Upside**: se portfolio sobe 25%+ acima do pico real, aumentar retirada em 10% (permanente). Teto R$350k.
- **Piso essencial**: R$180k (moradia + saude + alimentacao).
- **Revisao anual em janeiro.**

### Guardrail de Fonte (FR-fire2040, 2026-03-27)

**Anos 1–7 do FIRE (53–60, base FIRE 2040):** saques vêm do bond pool (TD 2040 vence em 2040 = **FIRE Day** → R$~1.9M BRL imediato; IPCA+ curto 3% comprado aos 50-51 → matura em 52-53 = também disponível na largada) **antes** do equity. Equity só tocado quando pool esgotado. Regra mecânica — sem ela, o bond tent não tem efeito comportamental. **Vantagem FIRE 2040**: TD 2040 vence exatamente no FIRE Day → pool BRL ~R$2.3M imediato, sem gap de liquidez dos primeiros anos.

### Rebalanceamento Pós-FIRE: Opção D (FR-rebalance-desacumulacao, 2026-04-07)

**Mecânica:** trimestral (R$62.5k/quarter) — sacar do bloco mais overweight vs target da fase.

| Fase | Equity | IPCA+ longo | IPCA+ curto | Cripto |
|------|--------|-------------|-------------|--------|
| Anos 1–7 (53–60) | 79% | 15% (consumindo) | 3% (consumindo) | 3% |
| Anos 7+ (60–90) | 94% | 0% (venceu/consumido) | 0% | 3%* |

*Cripto: manter via drift natural. Não rebalancear ativamente para cripto.

**Target intra-equity (fixo):** SWRD 50% / AVGS 30% / AVEM 20%

**Safety valve drift >10pp individual:**
1. Spending forçado desse ativo nos próximos 2–4 quarters
2. Se não corrige → TLH (lotes com prejuízo)
3. Se sem prejuízo → aceitar drift temporário (IR 15% > benefício)

**Regras absolutas:**
- **Nunca vender ETF com lucro para rebalancear** — IR 15% sobre ganho nominal BRL supera qualquer benefício
- Transição bond pool no FIRE Day: TD 2040 vence → caixa/Selic → gastar nos anos 1–7. NÃO reinvestir em equity de uma vez

---

## Premissas de Projecao (aprovadas 2026-03-22, HD-006 final)

### Retornos por ETF (fontes academicas)

Retorno real esperado em USD: mediana multi-fonte (AQR, Vanguard VCMM, JPMorgan LTCMA, Research Affiliates, Schwab). Factor premiums pos-haircut 58% McLean & Pontiff (2016). Aprovado 2026-04-01.

| ETF | Retorno Real USD | Dep. BRL Base (0.5%) | Dep. BRL Favoravel (1.5%) | Dep. BRL Stress (0%) | Fonte |
|-----|-----------------|---------------------|--------------------------|---------------------|-------|
| SWRD (mercado neutro) | 3.7% | **4.2%** | **5.2%** | **3.7%** | Mediana 5 fontes: AQR Global Dev 4.2%, Vanguard 3.6%, JPM 4.4%, RA 2.5%, Schwab 3.7% |
| AVGS (small value) | 5.0% | **5.5%** | **6.5%** | **5.0%** | Mediana multi-fonte: AQR 4.7-5.2%, Vanguard 5.6%, JPM 5.0%, GMO 3.5%, RA 5.5%, FF93+haircut 5.8%. **Nota (FI-avgs-premium-reconciliacao 2026-04-06):** mediana 5.0% é mais conservadora que FF93+haircut 5.8% — haircut orgânico via projeções de mercado. Alpha líquido do tilt fatorial: ~0.16%/ano (scorecard). O spread de 130bps AVGS-SWRD inclui beta, universe mix e factor premium — não é só factor alpha. |
| AVEM (EM + value tilt) | 5.0% | **5.5%** | **6.5%** | **5.0%** | Media 4 fontes: AQR 5.1%, JPM 5.3%, GMO 3.8%, RA 6.5% = 5.18%; arredondado conservadoramente |

### Custos All-In (comparacao justa equity vs RF)

#### Equity (novos aportes)
| Custo | Valor | Nota |
|-------|-------|------|
| TER | 0.12-0.35% | Variavel por ETF (AVEM cortou 0.39%→0.35% abr/2026) |
| Tracking diff | ~0.10% | |
| WHT dividendos | ~0.22% | 15% sobre ~1.5% yield (peso US) |
| FX saida (envio BRL p/ comprar ETF) | 1.35% | IOF 1.1% + Okegen 0.25% |
| FX retorno (repatriar USD na desacumul.) | 1.35% | IOF 1.1% + Okegen 0.25% |
| IR | 15% sobre ganho nominal BRL | Inclui "ganho fantasma" cambial |

#### IPCA+ (hold to maturity)
| Parametro | Valor |
|-----------|-------|
| Taxa bruta | 7.21% (2026-04-01) |
| Custodia B3 | -0.20% |
| Taxa pos-custodia | 7.01% |
| Nominal bruto | (1.0701)(1.04)-1 = 11.29% |
| Nominal liquido (IR 15%) | 11.29% × 0.85 = 9.60% |
| **Real liquido HTM 14 anos** | **(1.0960/1.04)-1 = ~6.0%** |

Nota: IPCA+ liquido ~6.0% considera hold to maturity 14 anos. O calculo anterior de 5.34% usava IR 15% incidindo sobre TODO o nominal. O valor real liquido depende do holding period e do IPCA efetivo.

### Comparacao All-In: R$100 por 14 anos
| Instrumento | Resultado Real Liquido | Retorno Anualizado |
|-------------|----------------------|-------------------|
| IPCA+ 2040 | R$225.8 | 6.0%/ano |
| Equity bloco (cenario base) | R$193.0 | 4.85%/ano |
| **Delta** | **IPCA+ vence por R$32.8 e 115 bps** | |

### Breakeven All-In
| Parametro | Valor |
|-----------|-------|
| Breakeven all-in (com WHT, IOF 1.1%, FX spread, IR sobre ganho cambial) | IPCA+ ~5.5% bruto |
| Piso operacional | **6.0%** (margem 50 bps sobre breakeven) |

**ERRATA HD-006**: O breakeven anterior (6.4%) e o subsequente (7.81%) estavam ambos errados. Causa raiz: (1) IR calculado sobre retorno real em vez de nominal, (2) custos de equity (WHT, IOF, ganho fantasma cambial) nao considerados. Com calculo all-in correto, breakeven real eh ~5.5%.

### Retorno Ponderado do Portfolio (equity block, 3 cenarios)

Pesos do bloco equity: **SWRD 50% / AVGS 30% / AVEM 20%** (aprovado FI-equity-redistribuicao, 2026-04-01, unanimidade 7/7).

| Cenario | Calculo | Retorno Ponderado Equity BRL |
|---------|---------|------------------------------|
| Base (dep. 0.5%) | 50%×4.2% + 30%×5.5% + 20%×5.5% | **4.85%** |
| Favoravel (dep. 1.5%) | 50%×5.2% + 30%×6.5% + 20%×6.5% | **5.85%** |
| Stress (dep. 0%) | 50%×3.7% + 30%×5.0% + 20%×5.0% | **4.35%** |

### Premissas Gerais

| Premissa | Base | Favoravel | Stress |
|----------|------|-----------|--------|
| Depreciacao real BRL | 0.5%/ano | 1.5%/ano | 0%/ano |
| Equity real ponderado em BRL (pre-tax) | **4.85%** | **5.85%** | **4.35%** |
| IPCA+ 2040 liquido HTM 14 anos (7.21% bruto) | **~6.0%/ano** | — | — |
| IPCA medio estimado | 4%/ano | — | — |
| Breakeven IPCA+ bruto all-in vs equity | **~5.5%** | — | — |
| Piso operacional IPCA+ | **6.0%** | — | — |

- **Toda projecao futura (FIRE, patrimonio, withdrawal rate) roda os 3 cenarios.**
- Equity BRL real = equity real USD + depreciacao real BRL do cenario.
- **Comparacao all-in obrigatoria**: SEMPRE incluir WHT, IOF, FX spread, ganho fantasma cambial ao comparar equity vs RF. Nunca comparar equity pre-tax vs RF post-tax.

### Sensibilidade Spending × P(FIRE 2040) — FR-spending-modelo-familia 2026-04-06

| Cenário Spending | Custo/ano | P(FIRE) Base | P(FIRE) Favorável | P(FIRE) Stress |
|-----------------|-----------|-------------|------------------|----------------|
| Solteiro/FIRE Day | R$250k | **90.4%** | 94.1% | 86.8% |
| Pós-casamento | R$270k | 88.8% | 93.7% | 85.5% |
| Casamento + filho + escola | R$300k | 85.8% | 92.2% | **82.1%** |

Notas: MC 10k simulações, seed=42. Pat mediana no FIRE Day: R$11.53M (base) / R$11.05M (stress) — idêntica nos 3 cenários de spending (acumulação não depende do custo de vida). P10 final é condicional (sobreviventes only); no pior caso (R$300k/stress), 17.9% de trajetórias falham. Quant validado 2026-04-06. **Critério de falsificação atingido: P(stress) mínimo 82.1% > 75%** — margem de segurança robusta em todos os cenários. Nenhuma mudança de alocação necessária.

---

## Regras Universais

- Rebalancear SEMPRE via aportes, nunca por venda de ativo com lucro. Por venda, apenas se nao tiver lucro ou se fugir da estrategia da carteira.
- **Regra de prioridade de aportes (2026-04-21):** aporte em UMA classe por vez — não splittar. Prioridade: maior gap primeiro. Exceção: janela de oportunidade clara (ex: IPCA+ com taxa atrativa) pode sobrepor o maior gap. Decisao de Diego.
- ETFs exterior = 15% flat sobre qualquer ganho sem isencao (Lei 14.754/2023) - isso pode mudar, sempre verificar
- UCITS obrigatorio para novos aportes — evitar US-listed por estate tax
- Nao sugerir: FIIs, bonds internacionais, fundos ativos brasileiros
- **Piso operacional para RF longa: IPCA+ 6.0%.** Breakeven all-in ~5.5% (com WHT, IOF, FX spread, ganho fantasma cambial). Margem de 50 bps. Abaixo de 6.0%, pausar DCA de IPCA+ longo e redirecionar para equity (ver FI-equity-redistribuicao para destino dos aportes). **IPCA+ longo (TD 2040/2050) = hold to maturity SEMPRE** — nao vender por MtM (posicao estrutural, bond tent). Gatilho de venda MtM aplica-se APENAS ao Renda+ 2065 (tatico). (Corrigido HD-006 final: pisos anteriores de 6.4% e 7.81% estavam ambos errados — nao incluiam custos all-in de equity)
- **AVGS 30%: tail risk e tracking error regret aceitos explicitamente** (XX-lacunas-estrategicas 2026-04-01 + HD-multimodel-validation 2026-04-06). Em cenário 2008-style: AVGS cai ~-60% USD (~-42% BRL com FX). Portfolio total: -40 a -45% BRL. Custo marginal vs 100% SWRD: ~3-4pp de drawdown adicional. Atenuantes: câmbio, aportes R$25k/mês, horizonte 11 anos, guardrails. Factor premium +1.1%/ano compensa o risco. **Tracking error regret aceito**: AVGS pode underperformar SWRD por 8-10 anos sem disparo de guardrail — esse risco é aceito explicitamente. Revisão: se horizonte encurtar para <5 anos pré-FIRE, reduzir AVGS para 15-20% via aportes. **Gatilho de revisão SCV**: se AVGS underperformar SWRD por >5pp acumulado em 24 meses → reabrir debate sobre peso de SCV.
- **Sem alavancagem.** Carry trade / margin na IB descartado — risco incompativel com fase de acumulacao FIRE (decisao mar/2026, apos desmonte de R$533k em set/2025)
- **Todo veredicto numerico passa por Checklist Pre-Veredicto antes de ser apresentado.** Checklist completo em `agentes/perfis/00-head.md`. Causa raiz: 6+9 erros das sessoes 2026-03-20, todos por omissao de premissas ao calcular. Regras adicionais HD-006: (A) fonte obrigatoria para cada numero, (B) formula explicita antes do resultado, (C) reconciliacao trimestral entre documentos, (D) comparacao all-in obrigatoria (WHT, IOF, FX spread, ganho fantasma cambial), (E) reflexao registrada — 4 erros em sequencia corrigidos por Diego

---

## Parâmetros para Scripts

Tabela machine-readable extraída por `scripts/parse_carteira.py` → gera `dados/carteira_params.json`. **Nunca editar o JSON diretamente.** Ao mudar qualquer valor aqui, rodar `python scripts/parse_carteira.py`.

| Chave | Valor | Fonte / Decisão |
|-------|-------|-----------------|
| equity_pct | 0.79 | FI-equity-redistribuicao 2026-04-01 |
| ipca_longo_pct | 0.15 | carteira.md §Alocação |
| ipca_curto_pct | 0.03 | carteira.md §Alocação |
| cripto_pct | 0.03 | carteira.md §Alocação |
| renda_plus_pct | 0.03 | carteira.md §Alocação tático |
| equity_weight_swrd | 0.50 | FI-equity-redistribuicao 2026-04-01 |
| equity_weight_avgs | 0.30 | FI-equity-redistribuicao 2026-04-01 |
| equity_weight_avem | 0.20 | FI-equity-redistribuicao 2026-04-01 |
| horizonte_vida | 90 | premissa universal FIRE |
| swr_gatilho | 0.030 | FR-swr-revisao 2026-04-13 |
| patrimonio_gatilho | 8333333 | 250k/3.0% (FR-swr-revisao 2026-04-13) |
| idade_cenario_base | 53 | carteira.md §FIRE cenário base |
| idade_cenario_aspiracional | 49 | carteira.md §FIRE cenário aspiracional |
| aporte_cenario_base | 25000 | carteira.md §FIRE |
| aporte_cenario_aspiracional | 30000 | carteira.md §FIRE aspiracional |
| custo_vida_base | 250000 | FR-spending-modelo-familia 2026-04-06 |
| custo_vida_casado | 270000 | FR-spending-modelo-familia 2026-04-06 |
| custo_vida_filho | 300000 | FR-spending-modelo-familia 2026-04-06 |
| bond_tent_anos | 7 | carteira.md §Bond Pool |
| p_threshold | 85.0 | carteira.md §FIRE guardrails |
| hodl11_piso_pct | 1.5 | carteira.md §Crypto — banda piso |
| hodl11_alvo_pct | 3.0 | carteira.md §Crypto — banda alvo |
| hodl11_teto_pct | 5.0 | carteira.md §Crypto — banda teto |
| factor_underperf_threshold_pp | -5 | carteira.md §Gatilhos — revisão AVGS 24m |
| tlh_gatilho | 0.05 | carteira.md §Gatilhos TLH |
| piso_taxa_ipca_longo | 6.0 | HD-006 final — breakeven all-in |
| piso_taxa_renda_plus | 6.5 | carteira.md §Renda+ tático |
| piso_venda_renda_plus | 6.0 | carteira.md §Renda+ gatilho saída |
| renda_plus_ano_venc | 2065 | Tesouro Renda+ 2065 |
| renda_plus_taxa_default | 6.93 | snapshot carteira.md 2026-04-22 |
| idade_atual | 39 | Diego (nasc. 1987) |
| ano_nascimento | 1987 | Diego |
| renda_estimada | 45000 | estimativa mensal (×12 = R$540k/ano) |
| inss_anual | 18000 | HD-mc-audit 2026-04-06 — R$18k/ano real conservador |
| inss_inicio_ano_pos_fire | 12 | ano 12 pós-FIRE = age 65 |
| terreno_brl | 150000 | avaliação terreno (ativo ilíquido) |
| tem_conjuge | false | Diego solteiro por ora |
| nome_conjuge | Katia | parceira — usar em surviving spouse |
| inss_katia_anual | 93600 | R$7.800/mês × 12 |
| inss_katia_inicio_ano | 2049 | Katia ~age 60, INSS antecipado |
| pgbl_katia_saldo_fire | 490000 | estimativa PGBL Katia no FIRE Day |
| gasto_katia_solo | 160000 | R$/ano se Diego falecer |
| retorno_rf_real_bond_pool | 0.06 | 6.0% real líquido HTM (alinhado PREMISSAS MC) |
| retorno_equity_base | 0.0485 | 4.85% real BRL — FI-premissas-retorno 2026-04-01 |
| retorno_ipca_plus | 0.0600 | 6.0% real líquido HTM 14 anos — HD-006 |
| retorno_swrd_usd_real | 0.037 | 3.7% USD real — mediana 5 fontes (AQR/Vanguard/JPM/RA/Schwab) |
| retorno_avgs_usd_real | 0.050 | 5.0% USD real — mediana multi-fonte + haircut 58% (FI-premissas-retorno) |
| retorno_avem_usd_real | 0.050 | 5.0% USD real — média 4 fontes (AQR/JPM/GMO/RA) arredondado conserv. |
| volatilidade_equity | 0.168 | 16.8% — FR-equity-equivalent |
| dep_brl_base | 0.005 | 0.5%/ano — premissa plano FIRE |
| dep_brl_favoravel | 0.015 | 1.5%/ano — cenário favorável |
| dep_brl_stress | 0.000 | 0.0%/ano — cenário stress |
| adj_favoravel | 0.010 | +1.0pp ajuste retorno equity cenário favorável |
| adj_stress | -0.005 | -0.5pp ajuste retorno equity cenário stress |
| ipca_anual | 0.04 | 4%/ano estimado |
| cambio_fallback | 5.156 | PTAX BCB 22/04/2026 — fallback offline |
| ipca_cagr_fallback | 6.14 | IPCA CAGR Abr/2021–Mar/2026 (BCB série 433) |
| selic_meta_snapshot | 14.75 | Selic meta Abr/2026 |
| fed_funds_snapshot | 3.64 | Fed Funds Mar/2026 |
| depreciacao_brl_base | 0.5 | % a.a. premissa plano FIRE |
| pfire_permanece_min | 0.85 | P(FIRE) > 85% → PLANO_PERMANECE |
| pfire_monitorar_min | 0.80 | P(FIRE) 80–85% → MONITORAR |
| drift_permanece_max | 5.0 | drift < 5pp → PERMANECE |
| drift_monitorar_max | 10.0 | drift 5–10pp → MONITORAR |
| ipca_taxa_monitorar_min | 5.5 | taxa IPCA+ 5.5–6.0% → MONITORAR |
| ipca_taxa_revisar_max | 5.5 | taxa IPCA+ < 5.5% → REVISAR |
| spending_smile_go_go | 242000 | FR-spending-smile 2026-03-27 (lifestyle ex-saúde, anos 0–14 pós-FIRE) |
| spending_smile_slow_go | 200000 | FR-spending-smile 2026-03-27 (lifestyle ex-saúde, anos 15–29 pós-FIRE) |
| taxa_desconto_capital_humano | 0.06 | 6.0% real a.a. (IPCA+, não equity premium) — metodologia Bodie/Merton |
| crescimento_renda_capital_humano | 0.02 | 2.0% real a.a. inflação esperada |
| metodo_capital_humano | boldin-mês-mês | VP de aportes mensais (renda - custo_vida), descapitalizados a 6% real, até FIRE Day |
| spending_smile_no_go | 187000 | FR-spending-smile 2026-03-27 (lifestyle ex-saúde, anos 30+ pós-FIRE) |
| guardrails_banda1_min | 0.15 | §Guardrails aprovados 2026-03-20 — limiar banda 1 |
| guardrails_banda2_min | 0.25 | §Guardrails aprovados 2026-03-20 — limiar banda 2 |
| guardrails_banda3_min | 0.35 | §Guardrails aprovados 2026-03-20 — limiar piso |
| guardrails_corte1_pct | 0.10 | §Guardrails aprovados 2026-03-20 — corte 10% (banda 15–25%) |
| guardrails_corte2_pct | 0.20 | §Guardrails aprovados 2026-03-20 — corte 20% (banda 25–35%) |
| guardrails_piso_pct | 0.28 | §Guardrails aprovados 2026-03-20 — corte 28% (dd > 35%) |
| gasto_piso | 180000 | §Guardrails aprovados 2026-03-20 — piso absoluto R$/ano |
| saude_base | 24000 | FR-healthcare-recalibracao 2026-04-23 — coletivo por adesão intermediário SP R$2k/mês (pesquisa: Bradesco/SulAmérica apto R$1.3-1.7k, buffer incluído) |
| ipca_plus_taxa_anual | 0.0716 | snapshot taxa bruta Tesouro IPCA+ (atualizar quando taxa mudar) |
| ipca_plus_custodia | 0.0020 | custódia B3 0.20%/ano sobre Tesouro Direto |
