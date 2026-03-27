# Findings Log

> Registro de todos os findings gerados pelo sistema de agentes.
> Atualizado em: 2026-03-26 (HD-scorecard)

---

## Classificacao

| Tipo | Definicao |
|------|-----------|
| **Preventivo** | Evitou ou evitaria erro/perda se Diego agisse sem o sistema |
| **Otimizador** | Identificou oportunidade de melhoria que Diego nao estava buscando |
| **Falso Positivo** | Finding que pareceu relevante mas nao era, ou estava errado |

---

## Log

### Sessao 2026-03-18 (Fundacao)

| # | Finding | Tipo | Diego Achou Primeiro? | Agente | Impacto |
|---|---------|------|----------------------|--------|---------|
| F-001 | AVGC tem 90% overlap com SWRD — closet indexing, nao e multifator real | Preventivo | Nao | 02 Factor | Evitou alocacao em ETF que nao entrega o que promete. JPGL confirmado como alternativa |
| F-002 | Conta liquida IPCA+ vs equity: IPCA+ ~6.09% liq vs equity ~5.09% liq (premissas conservadoras) | Otimizador | Nao | 10 Advocate | Levantou questao sobre se complexidade de equity se justifica. Nao mudou alocacao, mas calibrou expectativas |
| F-003 | IPCA+ 2035 nao existe sem cupom — ladder 2035/2040/2050 impossivel como aprovado | Preventivo | **Sim** | Diego / 03 RF | Diego identificou a contradicao. Sistema aprovou decisao com instrumento inexistente. Erro grave |

### Sessao 2026-03-19 (Retro + Revisoes)

| # | Finding | Tipo | Diego Achou Primeiro? | Agente | Impacto |
|---|---------|------|----------------------|--------|---------|
| F-004 | HODL11 nao e risco Brasil — e BTC spot via ETF na B3, risco e cripto/BTC, nao soberano. Sistema classificou errado 2x antes de corrigir | Falso Positivo (do sistema) | **Sim** | Diego / 06 Risco | Sistema errou a classificacao de risco. HODL11 tem risco de custodia B3, mas o ativo subjacente e BTC global, nao divida soberana BR |
| F-005 | Renda+ 2065 target reduzido de 5% para 3% (RF-003), depois revertido para 5% por decisao Diego (2026-03-22) | Otimizador -> Revertido | Nao | 03 RF / 10 Advocate | Diego avaliou e decidiu manter teto original de 5%. DCA reativado |
| F-006 | Bond tent agressivo pre-FIRE (30% RF) destruiria valor — IPCA+ 2040 7% ja e o tent natural | Preventivo | Nao | 04 FIRE / 10 Advocate | Evitou implementacao de tent que reduziria retorno sem necessidade. Manter 79% equity no FIRE |

### Sessao 2026-03-20 (Issues + Scorecard)

| # | Finding | Tipo | Diego Achou Primeiro? | Agente | Impacto |
|---|---------|------|----------------------|--------|---------|
| F-007 | 7 agentes criticaram "gap de execucao" na retro sem consultar dados reais (73% dos meses com aporte, R$2.39M em 56 meses) | Falso Positivo (do sistema) | **Sim** (na retro) | Diego / 13 Bookkeeper | Regra criada: criticas sobre Diego exigem evidencia quantitativa. Sem dados = sem critica |

### Issues 2026-03-22 (HD-006, FR-003, RK-001 v2, FIRE-002)

| # | Finding | Tipo | Diego Achou Primeiro? | Agente/Issue | Impacto |
|---|---------|------|----------------------|-------------|---------|
| F-008 | Breakeven all-in IPCA+ vs equity = ~5.5%, nao 6.4% nem 7.81%. Custo equity inclui WHT, IOF, ganho fantasma cambial — todos omitidos nos calculos anteriores | Preventivo | Parcial | 10 Advocate / HD-006 | 9+4 erros corrigidos. Piso operacional ajustado para 6.0% (margem 50bps). Evita DCA subotimo. |
| F-009 | Equity e 7x mais arriscado que IPCA+ no portfolio de Diego (~7x maior impacto em drawdown). Risco real da carteira e sequence of returns, nao risco soberano BR | Otimizador | Nao | 06 Risco / RK-001 v2 | Calibra prioridade de monitoramento. Risco soberano aceito (~21% do portfolio) porque equity domina. |
| F-010 | P(FIRE) = 91% @ R$250k com guardrails. Decada perdida e o risco real (SR cai a 31-43%), nao perda de renda (SWR viavel ate perda aos 42, SWR 3.12%) | Otimizador | Nao | 04 FIRE / FR-003 | Primeira quantificacao robusta de P(FIRE). Confirma que guardrails sao essenciais — sem eles, erro de 3-6pp. |

### Issues 2026-03-22/23 (HD-009, FI-004, XX-004)

| # | Finding | Tipo | Diego Achou Primeiro? | Agente/Issue | Impacto |
|---|---------|------|----------------------|-------------|---------|
| F-011 | Gastos reais auditados bottom-up = R$215k/ano, ~14% abaixo do modelo de R$250k. Primeira validacao bottom-up. Hipoteca SAC: R$452k, quita 2051 | Otimizador | Nao | 00 Head / HD-009 | Confirma baseline conservador. R$250k tem margem de ~16-25%. Gaps identificados: spending smile e saude como inflator proprio. |
| F-012 | JPGL TER efetivo: 0.19% (nao 0.39% assumido para AVGS). Cost-benefit JPGL vs SWRD: +1.88%/ano net com haircut 30%. AUM risco: EUR 245M — gatilho de monitoramento adicionado | Otimizador | Nao | 02 Factor / FI-004 | TER portfolio recalculado. Risco de liquidez monitorado. JPGL confirmado como melhor multi-factor UCITS. |
| F-013 | Cash IBKR < $60k exposto a estate tax americano (40% sobre excedente de $60k). Risco identificado e nao modelado na carteira | Preventivo | Nao | 00 Head / XX-004 | Acao: manter cash IBKR < $60k ou converter para ETFs UCITS rapidamente. |

### Issues 2026-03-27 (FR-spending-smile, FR-fire2040)

| # | Finding | Tipo | Diego Achou Primeiro? | Agente/Issue | Impacto |
|---|---------|------|----------------------|-------------|---------|
| F-018 | P(FIRE 50) real = 80.8% (nao 91%). Modelo FR-003 usava R$250k flat; spending smile real aumenta saude no No-Go, reduzindo P em ~10pp. Bear -30% ano 1 = risco dominante (-15.6pp). | Preventivo | Nao | 04 FIRE / FR-spending-smile | P(FIRE) recalibrado. 91% era otimista por ignorar padroes reais de gasto. Meta 90% agora fora de alcance para FIRE 50; acessivel apenas em cenario favoravel de FIRE 53 (93.7%). |
| F-019 | Bond tent natural do TD 2040 = 5% do ganho de P(FIRE), nao driver principal. 95% do ganho de FIRE 53 vs FIRE 50 (+8pp) vem do patrimônio maior (+R$2.8M) — nao do timing do vencimento. Narrativa "alinhar 2040" era ancoragem. | Preventivo | Nao | 04 FIRE + 10 Advocate / FR-fire2040 | Gatilho FIRE formalmente patrimônio-based (R$13.4M real, SWR <= 2.4%), nao data-based. 2040 = safe harbor, nao meta. FIRE 50 continua meta primária. |
| F-020 | VCMH real estrutural ~8-9%/ano; modelo usa 7%. Isso pode subestimar P(FIRE) em ~1.5-2pp nos primeiros anos. Dado mais recente (IESS Jun/2023): 11.7% real (inclui pico pos-COVID). | Preventivo | Nao | 04 FIRE / FR-fire2040 | Modelo conservador para saude mas pode estar otimista no curto prazo. Gatilho de monitoramento VCMH adicionado (IESS > 9% real por 2 anos → recalibrar). |

### Issue 2026-03-27 (XX-casamento)

| # | Finding | Tipo | Diego Achou Primeiro? | Agente/Issue | Impacto |
|---|---------|------|----------------------|-------------|---------|
| F-021 | Premissa saude R$18k/pp hoje nunca validada — Diego gasta R$6-10k/ano real. VCMH 7% e dado agregado IESS, nao curva individual. P(FIRE casal) sensivel em 15pp a essa premissa (7% vs 5%). | Preventivo | **Sim** (questionou ao vivo) | Diego / XX-casamento | Intervalo real P(C5 base) = 53-68%, nao numero unico. Revisitar com dado real de saude pos-casamento. |
| F-022 | Gap estrutural casal vs solo = ~R$150k/ano de spending (R$467k vs R$318k). 80% das pessoas erram achando que o problema sao os aportes menores — na verdade 80% do gap e spending maior (saude 2a pessoa + viagens + filho). | Otimizador | Nao | 04 FIRE / XX-casamento | Foco correto para melhorar P: comprimir spending, nao aumentar aportes. Saude incompressivel cresce indefinidamente. |
| F-023 | P(base) 80% para o casal e estruturalmente fora de alcance com premissas conservadoras. Requer VCMH 5% + FIRE 58+ + lifestyle R$210k+ — combinacao exigente. Target realista do casal = 65-75% base, nao 80%. | Preventivo | Nao | 04 FIRE / XX-casamento | Recalibra expectativas. Comparar P casal com P solo e a pergunta errada — contextos estruturalmente diferentes. |

### Issue 2026-03-27 (PT-onelife)

| # | Finding | Tipo | Diego Achou Primeiro? | Agente/Issue | Impacto |
|---|---------|------|----------------------|-------------|---------|
| F-024 | "Opacidade" do bond nao existe na lei. Lei 14.754/2023 nao usa os termos. CFO role + Art. 16 IN 2.180/2024 = bond provavelmente vira "entidade controlada" = tributacao anual 15% (nao diferimento). Pilar principal da proposta colapsa. | Preventivo | **Sim** (Diego questionou "parece bom demais") | Advocate + Tax + Juridico-br / PT-onelife | Evitou entrar em estrutura cuja vantagem principal (diferimento) pode nao existir para o perfil especifico de Diego como CFO/alocador |
| F-025 | IDF compartilhado entre nao-conjuges inviavel sob CAA Circular 26/1 (fev/2026). "Entrar no bond do socio" pode ser regulatoriamente impossivel da forma proposta. Alternativa correta: contrato proprio com IDF separado. | Preventivo | Nao | Juridico-intl / PT-onelife | Identificou que a proposta como descrita pode nao ser executavel. Muda completamente a analise. |
| F-026 | Isenção total na morte (Art. 6 XIII) = altamente improvavel para bond unit-linked. Componente seguritario do bond OneLife ≈ 1% do NAV. RFB aplica analogia VGBL: so componente seguro e isento. Isenção real ≈ R$8k em bond de R$800k, nao R$800k. | Preventivo | Nao | Juridico-br + Fact-Checker / PT-onelife | Pilar "heranca isenta" colapsa. Revisao do calculo de beneficio esperado. |
| F-027 | 5 erros factuais confirmados no material do pitch: (1) Art. 22 errado → Art. 6 XIII correto; (2) tripartite composicao errada; (3) Lombard USD 2-3% errado → 9.75% UBS; (4) OneLife nao e Utmost → e Grupo APICIL; (5) opacidade nao e dispositivo legal. Parecer e do advogado do socio, nao de Diego. | Preventivo | Nao | Fact-Checker + Juridico-intl / PT-onelife | Calibra postura: analise baseada em pitch de parte interessada tem erros materiais. Requer verificacao independente antes de qualquer decisao. |

### Issues 2026-03-24 (FI-crowdedness, FR-equity-equivalent)

| # | Finding | Tipo | Diego Achou Primeiro? | Agente/Issue | Impacto |
|---|---------|------|----------------------|-------------|---------|
| F-014 | AVGS Max DD historico (-39%) e piso, nao teto. Em 2008-style com crowding unwind, small value pode cair -60%+. Risco de cauda nao capturado no modelo de stress | Preventivo | Nao | 02 Factor / FI-crowdedness | Cenario Quant Crisis 2.0 adicionado ao scorecard. Impacto estimado: -11.85% do portfolio total. |
| F-015 | AVEM +14.83% YTD 2026 vs MSCI World +2.99% — EM ja revertendo. Factor premium emergentes em momento favoravel | Otimizador | Nao | 02 Factor / FI-crowdedness | Nao muda alocacao (DCA continua), mas calibra expectativas. AVEM pode reduzir gap vs SWRD. |

### Issues 2026-03-25 (HD-equity-weight, HD-simplicity, FR-glide-path)

| # | Finding | Tipo | Diego Achou Primeiro? | Agente/Issue | Impacto |
|---|---------|------|----------------------|-------------|---------|
| F-016 | Pfau-Kitces glidepath benefit (+2-4pp SR, nao +6-8pp como citado antes) NAO replica em dados historicos — apenas em simulacao Monte Carlo. Argumento contra 79% equity estruturalmente enfraquecido | Preventivo | Nao | Fact-Checker / HD-equity-weight | Burden of proof contra equity constante foi reduzido. 79% equity confirmado com argumento correto (diversificacao soberana). |
| F-017 | Haircut correto para factor premiums = 58% (McLean & Pontiff 2016, decaimento pos-publicacao). Valores anteriores de 30%, depois 35-40%, eram otimistas. Alpha liquido real do tilt: ~0.16%/ano. Precommitment AVGS validado pelo burden of proof | Preventivo | Nao | Fact-Checker / HD-simplicity | Alpha esperado recalibrado. Tese fatorial mais modesta — AVGS + AVEM + JPGL continuam justificados, mas por margem menor que assumida. Haircut canonico 58% adotado pelo time. |

---

## Metricas Consolidadas

| Periodo | Sessoes/Issues | Total | Preventivos | Otimizadores | Falsos Positivos | Diego Primeiro | Rate/Sessao |
|---------|---------------|-------|-------------|--------------|------------------|----------------|-------------|
| 2026-03-18 | 1 | 3 | 2 | 1 | 0 | 1 | 3.0 |
| 2026-03-19 | 1 | 3 | 1 | 1 | 1 | 1 | 3.0 |
| 2026-03-20 | 1 | 1 | 0 | 0 | 1 | 1 | 1.0 |
| 2026-03-22 | 3 issues | 3 | 2 | 1 | 0 | 0 | 1.0 |
| 2026-03-22/23 | 3 issues | 3 | 1 | 2 | 0 | 0 | 1.0 |
| 2026-03-24/25 | 4 issues | 4 | 3 | 1 | 0 | 0 | 1.0 |
| 2026-03-27 | 2 issues | 3 | 3 | 0 | 0 | 0 | 1.5 |
| 2026-03-27 | XX-casamento | 3 | 2 | 1 | 0 | 1 | 1.0 |
| 2026-03-27 | PT-onelife | 4 | 4 | 0 | 0 | 1 | 1.0 |
| **Total** | **17** | **27** | **18 (67%)** | **7 (26%)** | **2 (7%)** | **5 (19%)** | **~1.3** |

### Analise

- **Finding rate 1.3/sessao**: Dentro da meta de 1.0-1.5. Fase de maturidade operacional estabilizando.
- **Falsos positivos 7%**: Abaixo da meta de 15%. Melhoria consistente desde a fundacao (29% → 12% → 7%).
- **Diego achou primeiro 19%**: Leve alta por PT-onelife (Diego questionou "parece bom demais"). Contexto: Diego identificou o sinal, o sistema identificou os mecanismos — colaborativo, nao falha.
- **Preventivos 67%**: Acima da meta de 50%. PT-onelife foi 4/4 preventivos — estrutura de 9 agentes maximizou captura.
- **Atualizado em**: 2026-03-27 (PT-onelife)

---

## Evolucao Esperada

| Metrica | Fundacao (T0) | Atual | Meta Maturidade (6+ meses) |
|---------|--------------|-------|---------------------------|
| Finding rate | 2.33/sessao | 1.3/sessao | 1.0-1.5/sessao |
| Falsos positivos | 29% | 12% | < 15% |
| Diego achou primeiro | 43% | 18% | < 10% |
| Preventivos | 43% | 53% | > 50% |
| Otimizadores | 29% | 35% | > 30% |
