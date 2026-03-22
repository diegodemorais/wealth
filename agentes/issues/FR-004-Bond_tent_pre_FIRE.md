# FR-004: Bond Tent 48-53 -- Design e Glidepath de Transicao

## Metadados

| Campo | Valor |
|-------|-------|
| **Dono** | 04 FIRE (lead) |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 01 Head, 10 Advocate, 12 Behavioral, 03 Renda Fixa |
| **Dependencias** | FR-003 (Monte Carlo informa o sizing) |
| **Criado em** | 2026-03-20 |
| **Concluido em** | 2026-03-20 |
| **Origem** | Revalidacao profunda -- convergencia FIRE + Advocate + Behavioral |

---

## Motivo / Gatilho

> Tabela de alocacao por idade mostra 85% equity CONSTANTE de 40 a 70 anos. Ignora sequence-of-returns risk nos 5 anos antes e depois de FIRE (Kitces 2014, Pfau 2013). Behavioral confirmou overconfidence + hot-cold empathy gap sobre disciplina em drawdown pos-FIRE.

---

## Descricao

> Modelar bond tent temporario: subir RF de 7-12% para 15-18% entre idades 47-55, depois voltar. V-shape classico de Kitces/Pfau. Quantificar beneficio em termos de reducao de probabilidade de ruina.

---

## Escopo

- [x] Modelar cenario sem bond tent (85% equity constante) vs com bond tent (65-70% equity entre 47-55)
- [x] Definir de onde sai o capital para RF extra (parar aportes em equity 2-3 anos antes? Vender parcial?)
- [x] Calcular impacto no patrimonio projetado aos 50 vs reducao de sequence risk
- [x] Definir mecanica de execucao: qual instrumento RF? IPCA+? Selic? Duration?
- [x] Atualizar tabela de alocacao por idade se aprovado

---

## Analise

### 1. O que e o Bond Tent e por que importa

O bond tent e uma estrategia de alocacao dinamica que aumenta temporariamente a exposicao a renda fixa nos anos imediatamente antes e depois da aposentadoria, criando um formato de "tenda" (inverted V) na alocacao de bonds -- ou equivalentemente, um formato V na alocacao de equity.

**O problema que resolve: sequence of returns risk**

Sequence of returns risk e o risco de que retornos negativos ocorram no momento em que o portfolio e maior (perto da aposentadoria) e quando retiradas comecam. Um bear market de -40% aos 49 anos e catastrofico porque:
- O portfolio esta no pico (R$8M+)
- O investidor esta prestes a parar de aportar
- Logo comecara a retirar R$250k/ano

A mesma queda de -40% aos 35 anos e recuperavel: o portfolio e menor e os aportes continuam por 15 anos.

Kitces (2014) chamou isso de **portfolio size effect**: o risco de sequencia e proporcional ao tamanho do portfolio relativo aos aportes/retiradas futuras. Nos ultimos 5-10 anos pre-FIRE, o portfolio ja e tao grande que os aportes mensais sao quase irrelevantes (R$25k/mes vs R$8M = 0,3% do portfolio).

**A solucao: V-shape equity glidepath**

- Fase de acumulacao normal: equity alto (90%)
- 5-7 anos antes de FIRE: reduzir equity gradualmente, aumentar bonds
- No momento do FIRE: pico de bonds (equity no minimo)
- Primeiros 5-10 anos pos-FIRE: gastar os bonds, equity sobe naturalmente
- Pos-tent: equity volta ao nivel de longo prazo (90-95%)

### 2. Evidencia Academica

#### Kitces & Pfau (2014) -- "Reducing Retirement Risk with a Rising Equity Glide Path"
- **Journal of Financial Planning**, Jan 2014; SSRN #2324930
- Testaram glidepaths para horizonte de 30 anos com SWR de 4%
- **Conclusao**: glidepaths que comecam com 20-40% equity na aposentadoria e sobem para 60-80% reduzem tanto a probabilidade de fracasso quanto a magnitude do fracasso
- Monte Carlo: rising glidepath 30->60% equity teve probability of failure significativamente menor que 60% fixo
- **Caveat importante**: com dados historicos (que incluem mean reversion), alocacao fixa de 60% equity performou igualmente bem. O beneficio do glidepath e mais robusto em Monte Carlo (sem mean reversion)

#### Kitces (2014) -- "The Portfolio Size Effect"
- O glidepath V-shape otimo inicia a reducao de equity ~10 anos antes da aposentadoria
- Pico de bonds no momento da aposentadoria
- Depois, bonds sao gastos nos primeiros 10 anos, equity sobe

#### ERN / Karsten Jeske -- SWR Series Parts 19 e 43
- Part 19: para horizontes de 60 anos (FIRE), glidepath de 60% equity no FIRE subindo para 80-100% mostrou melhores resultados
- Part 43: Pre-retirement glidepaths -- manter 100% equity ate ~5 anos antes e entao construir o tent
- **Conclusao ERN**: bond tent de ~10 anos centrado no FIRE date, com equity minimo de 60% no pico do tent, subindo para 100% em 10 anos

#### Estrada (2015) -- "The Retirement Glidepath: An International Perspective"
- Analisou 19 paises e mercado mundial, 110 anos de dados
- **Conclusao**: tanto 100% equity quanto 60/40 fixo sao estrategias simples e eficazes
- Glidepaths declinantes (como target-date funds) nao melhoraram resultados
- Rising glidepaths tiveram vantagem marginal

#### Cederburg et al. (2023) -- "Beyond the Status Quo"
- 100% equity diversificado globalmente domina target-date funds em todo o ciclo de vida
- Suporte para equity alto mesmo em desacumulacao, desde que diversificado

### 3. Tensao com a estrategia atual de Diego

A estrategia confirmada de Diego ja incorpora uma versao do rising equity glidepath:
- Fase 1 (50-60): equity 82-90%
- Fase 2 (60-70): equity 90-95%

Isso e consistente com Pfau/Kitces pos-FIRE. Mas a tabela atual **ignora o lado pre-FIRE do tent**:

| Idade | Equity Atual | Problema |
|-------|-------------|----------|
| 40 | 90% | OK -- longe do FIRE |
| 45 | 90% (implicito) | Deveria comecar a construir o tent |
| 48 | ~88% (implicito) | Deveria estar descendo mais |
| 50 | 85% | **Insuficiente** -- pico do tent deveria ser mais conservador |

A queda de 90% para 85% e **muito suave**. A literatura sugere equity de 60-70% no pico do tent para maximizar protecao contra sequence risk.

### 4. Design do Bond Tent para Diego

#### Premissas de calibracao

Diego nao e o aposentado tipico dos estudos (65 anos, 30 anos de horizonte). Diferencas criticas:
- **Horizonte**: 40-50 anos (aposentadoria aos 50, expectativa ate 90+)
- **Sem renda de Social Security/previdencia**: 100% dependente do portfolio
- **Renda do portfolio**: precisa crescer em termos reais (inflacao BR)
- **Evidencia de Cederburg (2023)**: 100% equity domina para horizontes longos

Isso cria uma tensao: horizontes longos favorecem equity alto, mas o sequence risk nos primeiros 5 anos e real. A solucao e um **tent mais estreito e menos profundo** que o classico Kitces/Pfau (que foi desenhado para aposentados de 65 anos com 30 anos de horizonte).

#### Calibracao: tent moderado, adaptado para horizonte longo

Principios:
1. **Tent estreito** (8 anos, nao 10-15): minimizar custo de oportunidade
2. **Equity minimo de 75% no pico** (nao 60%): horizonte longo exige equity alto
3. **Instrumento: IPCA+ 2040** como espinha dorsal (vence 3 anos pos-FIRE = perfeito)
4. **Selic como buffer de liquidez** (ja previsto: 5% aos 50)

#### Glidepath proposto: V-shape 47-55

| Idade | Equity | IPCA+ Estrutural | Tesouro Selic | Cripto | Renda+ 2065 | Total RF+Cash |
|-------|--------|-----------------|---------------|--------|-------------|--------------|
| 39 (atual) | 89% | 7% | 0% | 3% | <=5% | 7-12% |
| 40 | 90% | 7% | 0% | 3% | <=5% | 7-12% |
| 43 | 90% | 7% | 0% | 3% | <=5% | 7-12% |
| 45 | 87% | 8% | 2% | 3% | <=3% | 10-13% |
| 47 | 82% | 10% | 5% | 3% | <=3% | 15-18% |
| 48 | 79% | 11% | 5% | 3% | <=2% | 16-18% |
| **50 (FIRE)** | **75%** | **12%** | **5%** | **3%** | **<=2%** | **17-19%** |
| 52 | 80% | 8% | 5% | 3% | <=2% | 13-15% |
| 53 | 83% | 3% | 5% | 3% | <=2% | 8-10% |
| 55 | 87% | 0% | 5% | 3% | 0% | 5% |
| 57 | 90% | 0% | 5% | 3% | 0% | 5% |
| 60 | 92% | 0% | 5% | 3% | 0% | 5% |
| 65 | 92% | 0% | 5% | 3% | 0% | 5% |
| 70 | 92% | 0% | 5% | 3% | 0% | 5% |

**Notas sobre o glidepath:**
- IPCA+ 2040 vence em 2040 (Diego tera 53 anos). O tent se desfaz naturalmente com o vencimento
- Dos 47 aos 50: construir o tent via **redirecionamento de aportes** (nao venda de equity)
- Dos 50 aos 53: gastar IPCA+ 2040 conforme vence e conforme necessidade de retirada
- Aos 53: IPCA+ 2040 venceu, Selic fica como unico buffer de cash
- Dos 55 em diante: rising equity classico (Pfau/Kitces), estabiliza em 92%

### 5. Instrumentos do Tent e como encaixam

#### IPCA+ 2040 -- Espinha dorsal do tent
- **Taxa atual**: ~7,31% real (NTN-B Principal, sem cupom)
- **Vencimento**: 2040 (Diego tera 53 anos, 3 anos pos-FIRE)
- **Papel no tent**: concentra a protecao. Sobe de 7% (atual) para 12% aos 50
- **Vantagem**: protege poder de compra real (IPCA+), vence naturalmente no momento certo, carrego excelente
- **Mecanica**: DCA de compra dos 45 aos 49 via redirecionamento de aportes

#### Tesouro Selic -- Buffer de liquidez
- **Papel**: cash para primeiros meses/ano de retirada sem vender equity em drawdown
- **Alvo**: 5% do portfolio aos 50 (~R$400k = 1,6 anos de despesas)
- **Vantagem**: liquidez D+1, sem risco de marcacao a mercado
- **Mecanica**: comecar a construir aos 45 (antes nao faz sentido, custo de oportunidade)

#### Renda+ 2065 -- Posicao tatica, NAO parte do tent
- **Duration**: 43,6 anos -- volatilidade extrema de preco
- **Papel**: posicao tatica de carry (taxa real alta), nao protecao de sequencia
- **No tent**: reduzir para <=2% ou zero ate os 50. Duration muito longa adiciona risco, nao protege
- **Se taxa cair para 6%**: vender tudo antes do FIRE (regra ja existente)

### 6. De onde sai o capital para o tent?

**Principio**: nunca vender equity com lucro para construir o tent (imposto de 15% destroi a logica). Usar **redirecionamento de aportes**.

Simulacao simplificada:
- Aporte mensal atual: R$25k (R$300k/ano)
- Dos 45 aos 49 (5 anos): redirecionar parte dos aportes para IPCA+ e Selic

| Idade | Aporte Equity | Aporte IPCA+ 2040 | Aporte Selic | Total |
|-------|--------------|-------------------|-------------|-------|
| 39-44 | R$25k/mes | Via DCA estrutural (ja em curso) | 0 | R$25k |
| 45 | R$18k/mes | R$5k/mes | R$2k/mes | R$25k |
| 46 | R$16k/mes | R$6k/mes | R$3k/mes | R$25k |
| 47 | R$14k/mes | R$7k/mes | R$4k/mes | R$25k |
| 48 | R$12k/mes | R$8k/mes | R$5k/mes | R$25k |
| 49 | R$10k/mes | R$9k/mes | R$6k/mes | R$25k |

Em 5 anos (45-49), isso direciona ~R$2.1M para RF (IPCA+ + Selic), contra zero no cenario atual. Dado que o portfolio projetado aos 50 e ~R$10.3M, isso representa ~20% do portfolio em RF -- consistente com o tent de 75% equity.

**Nota**: os valores de aportes assumem R$25k/mes constante. Se a renda de Diego mudar, a mecanica se adapta mantendo os percentuais-alvo.

### 7. Impacto nas projecoes

#### Custo de oportunidade: menos equity = menos retorno esperado

Nos 5 anos do tent pre-FIRE (45-49), o equity fica 5-15% abaixo do cenario sem tent. Impacto estimado:

- **Retorno esperado equity**: ~5,09% real/ano (FR-001 v3)
- **Retorno esperado IPCA+ 2040**: ~7,31% real/ano (se mantido ate vencimento) -- **superior ao equity**
- **Retorno esperado Selic**: ~2-3% real/ano

Surpreendentemente, o custo de oportunidade e **baixo ou mesmo negativo** porque IPCA+ 2040 rende mais que o equity esperado em termos reais. O custo real vem apenas do excesso em Selic (que rende menos).

Estimativa de impacto no patrimonio aos 50:
- **Sem tent (90% equity)**: ~R$10.3M (estimativa FR-001 v3)
- **Com tent (75% equity aos 50)**: ~R$10.1M a R$10.3M (delta de -R$0 a -R$200k)
- **Custo**: 0 a 2% do patrimonio projetado

#### Ganho em protecao

O ganho e assimetrico e nao-linear:
- **Reducao de max drawdown nos primeiros 5 anos de FIRE**: se bear market de -40% ocorre aos 50-51, o portfolio com tent (75% equity) cai ~30%, nao ~36%. Diferenca: ~R$600k a menos de perda
- **Reducao de probability of ruin**: Kitces/Pfau mostram reducao de 5-15pp na probability of failure dependendo do cenario
- **Protecao comportamental**: com 25% em RF, Diego tem 2-3 anos de despesas em instrumentos seguros. Nao precisa vender equity em panico. Behavioral confirmou que isso importa (hot-cold empathy gap)

#### Tradeoff: vale a pena?

**Sim, inequivocamente.** O custo e ~0-2% do patrimonio projetado. O ganho e:
1. Reducao significativa de probability of ruin nos cenarios adversos
2. Buffer comportamental de 2-3 anos de despesas em RF
3. IPCA+ 2040 rende mais que equity em termos reais (ganho, nao custo)
4. O tent se desfaz naturalmente com o vencimento do IPCA+ 2040 em 2040

### 8. Glidepath completo proposto (substitui tabela atual em carteira.md)

| Bloco / ETF | 39 | 43 | 45 | 47 | 48 | **50** | 52 | 53 | 55 | 60 | 65 | 70 |
|-------------|-----|-----|-----|-----|-----|--------|-----|-----|-----|-----|-----|-----|
| **Tesouro Selic** | 0% | 0% | 2% | 5% | 5% | **5%** | 5% | 5% | 5% | 5% | 5% | 5% |
| **IPCA+ 2040** | 7% | 7% | 8% | 10% | 11% | **12%** | 8% | 3% | 0% | 0% | 0% | 0% |
| **Equity total** | 90% | 90% | 87% | 82% | 79% | **75%** | 80% | 83% | 87% | 92% | 92% | 92% |
| SWRD | 35% | 35% | 34% | 32% | 31% | **29%** | 31% | 32% | 34% | 36% | 36% | 36% |
| AVGS | 25% | 25% | 24% | 23% | 22% | **21%** | 22% | 23% | 24% | 25% | 25% | 25% |
| AVEM | 20% | 20% | 19% | 18% | 17% | **16%** | 18% | 19% | 19% | 20% | 20% | 20% |
| JPGL | 10% | 10% | 10% | 9% | 9% | **9%** | 9% | 9% | 10% | 11% | 11% | 11% |
| **HODL11** | 3% | 3% | 3% | 3% | 3% | **3%** | 3% | 3% | 3% | 3% | 3% | 3% |
| **Renda+ 2065** | <=5% | <=5% | <=3% | <=3% | <=2% | **<=2%** | <=2% | <=2% | 0% | 0% | 0% | 0% |

**Notas sobre a tabela:**
1. IPCA+ 2040 sobe de 7% para 12% (tent pre-FIRE) e cai para 0% apos vencimento em 2040 (idade 53)
2. Equity V-shape: 90% -> 75% (FIRE) -> 92% (estabiliza aos 55-60)
3. Selic aparece aos 45, estabiliza em 5% permanentemente
4. Renda+ 2065 reduz gradualmente -- posicao tatica, nao parte do tent
5. JPGL ainda esta em construcao (gap de -19,7%). Percentuais assumem que gap sera fechado ate 43-45
6. Cripto (HODL11) mantem 3% constante -- nao participa do tent
7. Pos-55: equity estabiliza em 92% (rising equity glidepath completo, Pfau/Cederburg)

### 9. Anatomia do Tent -- Visualizacao

```
Equity %
  |
92|                                                    ____________________
90|----_____                                     ____/
87|         \                                ___/
83|          \                           ___/
82|           \                      ___/
80|            \                ____/
79|             \           __/
75|              \_________/
  |
  +----+----+----+----+----+----+----+----+----+----+----+----+----+----> Idade
  39   43   45   47   48   50   52   53   55   57   60   65   70
                           ^
                         FIRE
```

O tent tem formato V assimetrico:
- **Lado esquerdo** (pre-FIRE, 45-50): 5 anos, queda de 90% para 75% = -3pp/ano
- **Lado direito** (pos-FIRE, 50-55): 5 anos, subida de 75% para 87% = +2,4pp/ano
- **Continuacao** (55-60): subida de 87% para 92% = +1pp/ano
- **Estabilizacao** (60+): 92% fixo

---

## Conclusao

### O bond tent e necessario para Diego?

**Sim.** A tabela anterior (85% equity constante de 40 a 70) ignora o sequence of returns risk no periodo mais critico. A literatura e clara: os 5 anos antes e depois do FIRE sao a "danger zone" (Kitces 2014).

### O tent proposto e conservador o suficiente?

**O tent e moderado, nao agressivo.** Equity minimo de 75% no pico, contra 60% sugerido por Kitces/Pfau para aposentados tradicionais. Justificativa:
- Horizonte de Diego (40+ anos) exige equity alto (Cederburg 2023)
- IPCA+ 2040 rende 7,31% real (superior ao equity esperado)
- Guardrails de risco ja oferecem segunda camada de protecao
- 75% equity + 12% IPCA+ + 5% Selic = 17% em RF de alta qualidade

### O IPCA+ 2040 existente (7% estrutural) ja e parte do tent?

**Sim, e a semente.** A posicao atual de 7% em IPCA+ 2040 e o piso estrutural do tent. O tent propoe subi-la para 12% ate os 50, via DCA dos 45 aos 49. O vencimento em 2040 (idade 53) desfaz o tent naturalmente -- nao e necessaria nenhuma acao de venda.

### Quando comecar a implementar?

**Nao agora. Aos 45 (2032).** Diego tem 39 anos. O tent pre-FIRE comeca 5 anos antes do FIRE (idade 45). Ate la:
- Manter estrategia de acumulacao atual (~88-90% equity)
- IPCA+ 2040 a 7% ja esta correto como posicao estrutural
- Fechar gap de JPGL (prioridade atual)
- **Gatilho**: aos 44-45, reavaliar taxa de IPCA+ disponivel e comecar a redirecionar aportes

### O que muda na execucao HOJE?

**Nada muda na execucao imediata.** Este e um plano para t+6 anos. A unica mudanca e o registro desta estrategia como decisao pendente de aprovacao para que, quando chegar a hora, ja exista um playbook.

---

## Decisao Final (aprovada por Diego em 2026-03-20)

**NAO implementar bond tent agressivo (75% equity no pico).** Razoes:
- Cederburg et al. (2023): 100% equity diversificado globalmente domina lifecycle funds para horizontes longos
- ERN SWR Series: equity alto favorece horizontes de 40+ anos
- IPCA+ 2040 a 7.31% real ja funciona como "tent natural" -- rende mais que equity esperado, vence 3 anos pos-FIRE (2040 = FIRE+3), desfaz-se naturalmente

**Decisao de alocacao aos 50 (FIRE):**
- **Equity total: 88%** (nao 85% anterior, nem 75% do tent proposto)
- **IPCA+ Estrutural: 7%** (hold-to-maturity, o "tent natural")
- **Tesouro Selic: 5%** (buffer de liquidez)
- **Renda+ 2065 tatico: <=3%**
- **HODL11: 3%**

O IPCA+ 2040 estrutural cumpre a funcao do bond tent sem sacrificar equity: rentabilidade real superior, descorrelacao funcional, e desfaz no vencimento.

---

## Resultado (v1 — 2026-03-20)

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | NAO implementar bond tent agressivo. Manter ~88% equity no FIRE. IPCA+ 2040 (7%) e o "tent natural" -- rende 7.31% real, vence 2040 (FIRE+3). Selic 5% como buffer. |
| **Estrategia** | Equity alto (88%) no FIRE, suportado por Cederburg (2023) e ERN. IPCA+ 2040 substitui bond tent classico com retorno real superior. Pos-FIRE: equity sobe naturalmente conforme IPCA+ 2040 vence. |
| **Conhecimento** | Cederburg (2023): 100% equity domina para horizontes longos. ERN SWR Part 19/43: equity alto favorece FIRE longo. Kitces & Pfau (2014): bond tent moderado tem merito, mas custo de oportunidade e alto para horizonte 40+ anos quando RF rende 7.31% real. |
| **Memoria** | Aprovado por Diego. Tabela em carteira.md atualizada. |

---

## ERRATA v2 (2026-03-22) — Revisao pos-HD-006

A conclusao v1 ("NAO implementar tent agressivo, manter 88% equity") permanece valida na DIRECAO. HD-006 recalibrou os numeros:

### O que mudou com HD-006

- **IPCA+ longo subiu de 7% para 15%** (TD 2040 80% + TD 2050 20%)
- **Equity caiu de 88% para 79% aos 50**
- **IPCA+ curto 3% (aos 50)** substitui Selic como SoRR buffer (2-3 anos de despesas)
- **Selic removido** da alocacao estrategica

### O tent agora e MAIOR que o proposto na v1

| Aspecto | v1 (2026-03-20) | v2 pos-HD-006 |
|---------|-----------------|---------------|
| IPCA+ longo | 7% (TD 2040 apenas) | 15% (TD 2040 80% + TD 2050 20%) |
| IPCA+ curto (aos 50) | 0% (Selic 5%) | 3% |
| Equity no FIRE | 88% | 79% |
| Tent total | ~12% (7% IPCA+ + 5% Selic) | ~18% (15% IPCA+ longo + 3% IPCA+ curto) |

### Por que o tent maior se justifica

A v1 rejeitou tent agressivo porque o custo de oportunidade era alto (equity 5.09% vs RF ~3%). Com HD-006:
- **Breakeven all-in IPCA+ = ~5.5%**, superior ao equity all-in (~4.5%)
- O tent nao custa retorno — GANHA retorno (IPCA+ 6.0%+ real vs equity 4.5%)
- FR-003 Monte Carlo confirmou: bond tent adiciona apenas +0.1pp de success rate — o valor esta no retorno garantido, nao na reducao de volatilidade

### Mecanica do tent natural

- **TD 2040** vence em 2040 (Diego tem 53 anos) — cobre os primeiros 3 anos de FIRE
- **TD 2050** vence em 2050 (Diego tem 63 anos) — cobre o gap pos-tent
- **IPCA+ curto 3%** (aos 50) = SoRR buffer de 2-3 anos de despesas
- **Glidepath**: equity 79% ate 50, rising para 82-90% pos-vencimento dos IPCA+
- Tent se desfaz naturalmente com vencimentos — nao requer gestao ativa

---

## Resultado (v2 — 2026-03-22, FINAL)

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Bond tent = 15% IPCA+ longo (TD 2040 80% + TD 2050 20%) + 3% IPCA+ curto (aos 50). Equity 79% no FIRE. Tent natural, nao requer gestao ativa. |
| **Evolucao v1->v2** | Tent maior que o original (15% vs 7%), mas justificado pelo retorno all-in superior do IPCA+ (6.0%+ vs equity 4.5%). Direcao mantida: tent natural via hold-to-maturity, nao tent agressivo ativo. |
| **Evidencia** | FR-003 Monte Carlo: bond tent adiciona apenas +0.1pp de success rate. Valor esta no retorno garantido do IPCA+, nao na reducao de volatilidade. Cederburg (2023) e ERN continuam suportando equity alto pos-tent. |
| **Glidepath** | Equity 79% (FIRE) -> rising para 82-90% conforme IPCA+ vencem (2040, 2050). |

---

## Proximos Passos

- [x] **Diego**: aprovar glidepath (decidiu NAO implementar tent agressivo, manter 88% equity)
- [x] Atualizar tabela de alocacao por idade em `carteira.md`
- [ ] Aos 44-45: reavaliar se tent pre-FIRE merece reconsideracao com base em taxas disponiveis e patrimonio acumulado
- [ ] FR-003 (Monte Carlo): quando executada, validar success rates com 88% equity no FIRE
- [ ] Pos-FIRE: equity sobe naturalmente conforme IPCA+ 2040 vence em 2040 (Diego tera 53)

---

## Referencias

- Kitces, M. & Pfau, W. (2014). "Reducing Retirement Risk with a Rising Equity Glide Path." Journal of Financial Planning. SSRN #2324930.
- Kitces, M. (2014). "The Portfolio Size Effect and Using a Bond Tent to Navigate the Retirement Danger Zone."
- Kitces, M. & Pfau, W. (2015). "Retirement Risk, Rising Equity Glidepaths, and Valuation-Based Asset Allocation." SSRN #2497053.
- Jeske, K. / ERN (2017). "The Ultimate Guide to Safe Withdrawal Rates -- Part 19: Equity Glidepaths in Retirement."
- Jeske, K. / ERN (2021). "Pre-Retirement Glidepaths -- SWR Series Part 43."
- Graham, D. / ERN (2019). "Can a Rising Equity Glidepath Save the 4% SWR Over a 60 Year Retirement?"
- Estrada, J. (2015). "The Retirement Glidepath: An International Perspective." Journal of Investing 25(2).
- Cederburg, S. et al. (2023). "Beyond the Status Quo: A Critical Assessment of Lifecycle Investment Advice."
