# Carteira Diego Morais — Contexto Compartilhado

> Atualizado em: 2026-04-01
> Este arquivo e a fonte de verdade para todos os agentes.
> Cambio de referencia: R$ 5,16 (PTAX BCB 2026-04-01)

---

## Investidor

- **Nome**: Diego Morais
- **Idade**: 39 anos (nascimento 19/02/1987)
- **Localidade**: Sao Paulo, Pinheiros
- **Meta FIRE**: **2040 (53 anos) — base.** Patrimônio real ≥ R$13.4M (R$2026) e SWR ≤ 2.4% → P(FIRE 2040): **87,2% base / 92,3% favorável / 83,5% stress** (MC 10k, spending smile + guardrails + bond tent + IR 15% sobre nominal + spending smile corrigido ex-saúde, `fire_montecarlo.py` HD-mc-audit 2026-04-06). FIRE 50 (2037) = aspiracional — se patrimônio atingir R$13.4M antes. Revisão anual a partir de 2034 (48 anos). **Não trabalhar além de 2040 independente de P(FIRE).**
- **Patrimonio**: R$ 3.372.673 (excl. operacao estruturada COE/emprestimo)
- **Aporte mensal**: R$ 25k
- **Custo de vida**: R$ 250k/ano
- **Estado civil**: Solteiro, namorada (casamento iminente ~2026-2027). Filho previsto ~2028. **GATILHO**: ao casar/ter filho, recalibrar imediatamente: custo de vida (R$250k → R$270-300k+), FIRE date, sucessao, seguro de vida (gap critico), estrutura empresarial, testamento
- **Empresas**: 2 PJs no Simples Nacional (contabilidade: Contabilizei)
- **INSS (extrato 26/03/2026)**: NIT 119.60772.92-3. CI desde 08/2003. Teto desde 01/2017. Tempo total: ~22a6m. Benefício estimado (65 anos, parar no FIRE/50): ~R$46-55k/ano real 2026 — requer validação previdenciária.
- **Imóveis**: Apartamento Pinheiros: valor ~R$820k, hipoteca SAC R$453.417, termina 15/02/2051, equity ~R$367k. Terreno Nova Odessa: R$150k.

### Plataformas
- **ETFs internacionais (UCITS LSE)**: Interactive Brokers
- **Tesouro Direto + ETFs B3 (HODL11)**: Nubank e XP
- **Cambio**: Okegen (spread 0,25% ida e volta)

---

## Carteira FIRE Variavel (89,1% do patrimonio)

### Bloco Equity Fixo

| ETF | Alocacao Alvo | Atual | Composicao Real (USD) | Status |
|-----|--------------|-------|----------------------|--------|
| SWRD | **50%** | ~37,6% (~R$ 1.267k) | SWRD ~$241k | Underweight — **prioridade nos aportes equity** |
| AVGS (US + INT) | **30%** | ~28,5% (~R$ 961k) | AVUV + AVDV + USSC + AVGS ~$183k | Próximo do target. Aportar só em AVGS UCITS |
| AVEM | **20%** | ~24,4% (~R$ 824k) | EIMI + AVES + DGS ~$157k | Overweight via transitórios. Aportar só em AVEM UCITS quando subrepresentado |
| JPGL | **0%** | ~0,4% (~R$ 12k) | IWVL + JPGL ~$2.1k | **Não adicionar. Target eliminado (FI-jpgl-zerobased, 2026-04-01). IWVL = transitório legado — diluir via aportes.** |

**Nova alocação aprovada (FI-equity-redistribuicao, 2026-04-01): SWRD 50% / AVGS 30% / AVEM 20%. Unanimidade 7/7 agentes (13.5x ponderado). Via aportes — sem vendas.**
Design 50/50 neutro/fatorial preservado.

### Ativos Transitorios (nao comprar mais — diluir via aportes)
EIMI, AVES, AVUV, AVDV, DGS, USSC, IWVL

Todos com lucro. Nao vender para evitar imposto (15%). Diluir via aportes nos ETFs alvo. Vender na fase de usufruto.

---

## Outros Blocos

| Bloco | % Atual | Alvo | Valor | Instrumento | Regra |
|-------|---------|------|-------|-------------|-------|
| Reserva | 2,5% | — | R$ 87.862 | Tesouro IPCA+ 2029 | Emergencia. Migrar pra Selic no vencimento (2029) |
| IPCA+ existente | 0,4% | — | R$ 13.308 | Tesouro IPCA+ 2040 | Posicao legada. Sera incorporada ao bloco IPCA+ longo |
| IPCA+ longo | ~0,4% | **15%** | ~R$ 523k target | TD 2040 (80%) + TD 2050 (20%) | **Hold to maturity SEMPRE.** DCA ate 15% da carteira enquanto taxa >= 6,0%. Compra direta no Tesouro. Piso operacional: IPCA+ >= 6,0% (margem 50 bps sobre breakeven all-in ~5,5%). 5,0-6,0%: pausar DCA, aportes para JPGL. Gatilho de venda: NENHUM (exceto risco soberano extremo). Posicao estrutural — nao vender por MtM |
| IPCA+ curto | 0% | **3%** | — | TD curto ~2 anos | SoRR buffer. **Comprar perto dos 50**, nao agora. Substitui Selic no plano original (melhor protecao inflacionaria, MtM baixo com ~2 anos duration) |
| Renda+ 2065 | 3,0% | <=5% | ~R$ 99.673 | Renda+ 2065 | Duration 43,6. Taxa atual: 7,08% (2026-04-01). Compra: DCA ate 5% se taxa >= 6,5%. Venda: tudo se taxa <= 6,0% (aguardar 720 dias se holding < 2 anos). Panico (9%+): manter. Ver cenarios: agentes/contexto/renda-plus-2065-cenarios.md |
| Cripto | 3,1% | **3%** | ~R$ 103.400 | HODL11 + spot legado | BTC $67.822 (30/Mar). Alvo 3%, piso 1,5%, teto 5%. Spot = legado, nao mexer |

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
2. **Ativos transitorios**: nao comprar mais — aportar nos alvos UCITS (AVGS, AVEM, JPGL), vende-los na fase de usufruto
3. **IPCA+ longo ate 15%**: DCA em TD 2040 (80%) + TD 2050 (20%) enquanto taxa >= 6,0%. **DCA ATIVO** (taxa atual 7,21% IPCA+ 2040 > piso 6,0%). Se taxa cair para <6,0%: pausar DCA, aportes para JPGL. **Hold to maturity SEMPRE** — nao vender por MtM. Gatilho de venda: NENHUM (exceto risco soberano extremo). **Prioridade RF: IPCA+ antes do Renda+ (gap 14,2pp vs 1,8pp)**
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
| TER | 0.12-0.39% | Variavel por ETF |
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

---

## Regras Universais

- Rebalancear SEMPRE via aportes, nunca por venda de ativo com lucro. Por venda, apenas se nao tiver lucro ou se fugir da estrategia da carteira.
- ETFs exterior = 15% flat sobre qualquer ganho sem isencao (Lei 14.754/2023) - isso pode mudar, sempre verificar
- UCITS obrigatorio para novos aportes — evitar US-listed por estate tax
- Nao sugerir: FIIs, bonds internacionais, fundos ativos brasileiros
- **Piso operacional para RF longa: IPCA+ 6.0%.** Breakeven all-in ~5.5% (com WHT, IOF, FX spread, ganho fantasma cambial). Margem de 50 bps. Abaixo de 6.0%, pausar DCA de IPCA+ longo e redirecionar para equity (ver FI-equity-redistribuicao para destino dos aportes). **IPCA+ longo (TD 2040/2050) = hold to maturity SEMPRE** — nao vender por MtM (posicao estrutural, bond tent). Gatilho de venda MtM aplica-se APENAS ao Renda+ 2065 (tatico). (Corrigido HD-006 final: pisos anteriores de 6.4% e 7.81% estavam ambos errados — nao incluiam custos all-in de equity)
- **AVGS 30%: tail risk e tracking error regret aceitos explicitamente** (XX-lacunas-estrategicas 2026-04-01 + HD-multimodel-validation 2026-04-06). Em cenário 2008-style: AVGS cai ~-60% USD (~-42% BRL com FX). Portfolio total: -40 a -45% BRL. Custo marginal vs 100% SWRD: ~3-4pp de drawdown adicional. Atenuantes: câmbio, aportes R$25k/mês, horizonte 11 anos, guardrails. Factor premium +1.1%/ano compensa o risco. **Tracking error regret aceito**: AVGS pode underperformar SWRD por 8-10 anos sem disparo de guardrail — esse risco é aceito explicitamente. Revisão: se horizonte encurtar para <5 anos pré-FIRE, reduzir AVGS para 15-20% via aportes. **Gatilho de revisão SCV**: se AVGS underperformar SWRD por >5pp acumulado em 24 meses → reabrir debate sobre peso de SCV.
- **Sem alavancagem.** Carry trade / margin na IB descartado — risco incompativel com fase de acumulacao FIRE (decisao mar/2026, apos desmonte de R$533k em set/2025)
- **Todo veredicto numerico passa por Checklist Pre-Veredicto antes de ser apresentado.** Checklist completo em `agentes/perfis/00-head.md`. Causa raiz: 6+9 erros das sessoes 2026-03-20, todos por omissao de premissas ao calcular. Regras adicionais HD-006: (A) fonte obrigatoria para cada numero, (B) formula explicita antes do resultado, (C) reconciliacao trimestral entre documentos, (D) comparacao all-in obrigatoria (WHT, IOF, FX spread, ganho fantasma cambial), (E) reflexao registrada — 4 erros em sequencia corrigidos por Diego
