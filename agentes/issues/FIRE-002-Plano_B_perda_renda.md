# FIRE-002: Plano B — Perda de Renda e Decada Perdida

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FIRE-002-Plano_B_perda_renda |
| **Dono** | 04 FIRE (lead), 00 Head |
| **Status** | Done |
| **Prioridade** | Critica |
| **Participantes** | 04 FIRE, 00 Head, 10 Advocate |
| **Dependencias** | FR-003 (Monte Carlo), HD-006 (premissas) |
| **Criado em** | 2026-03-20 |
| **Origem** | Debate 2026-03-20 (Advocate), escopo expandido 2026-03-22 |
| **Concluido em** | 2026-03-22 |
| **Revisao** | 2026-03-22 v2: CORRECAO — perda de renda = aposentadoria forcada (gastos imediatos, nao aos 50) |

---

## Motivo / Gatilho

> A premissa "renda se mantem ate os 50" sustenta todo o modelo FIRE. Se Diego perde renda antes dos 50, ele NAO espera ate os 50 para comecar a gastar — ele comeca a gastar IMEDIATAMENTE. Perda de renda = aposentadoria forcada. Isso muda dramaticamente a analise: horizonte mais longo, patrimonio menor, SWR mais alto.

---

## Descricao

> Modelar cenarios de perda de renda como aposentadoria forcada: aportes param E gastos comecam na mesma idade. Para cada cenario: patrimonio, SWR, viabilidade ate 90, e acao necessaria. Inclui cenarios combinados com decada perdida.

---

## Escopo

- [x] Parte A: Perda de renda aos 42, 45, 48 — com retirada imediata (retorno base 4.57%)
- [x] Parte B: Perda de renda + retorno adverso (3% e 2% desacumulacao)
- [x] Parte C: Decada perdida na acumulacao + perda de renda + retorno adverso (combinado maximo)
- [x] Parte D: Tabela de salvamento (renda part-time, corte de custo)
- [x] Parte E: Plano B concreto e gatilhos

---

## ERRATA v1 -> v2 (2026-03-22)

> **Erro critico da v1**: A analise anterior assumiu "aportes param, patrimonio cresce a 5.84% sem saques ate os 50, gastos comecam aos 50". O CORRETO e: **aportes param E gastos de R$250k/ano comecam IMEDIATAMENTE na idade da perda**. Perda de renda = aposentadoria forcada. Diego apontou o erro.
>
> Impacto: na v1, perda aos 42 gerava patrimonio de R$8.0M aos 50 (SWR 3.12%). Na v2, perda aos 42 com saques imediatos gera patrimonio declinante desde o dia 1 (SWR 4.92% aos 42). Cenarios piores em TODOS os casos isolados — mas conclusao muda significativamente nos combinados.

---

## Premissas (HD-006 final, 2026-03-22)

| Parametro | Valor | Fonte |
|-----------|-------|-------|
| Patrimonio marco 2026 | R$3,482,633 | carteira.md |
| Aporte anual | R$300,000 | carteira.md |
| Retorno portfolio acumulacao | 5.84% real | HD-006: ponderado 79% eq + 15% IPCA+ + 3% cripto + 3% Renda+ |
| Retorno desacumulacao conservador | 4.57% real liquido | HD-006: IR 15% sobre nominal (100% vendido) |
| Custo de vida base | R$250,000/ano | carteira.md |
| Guardrails | Piso R$180k | carteira.md (Kitces & Fitzpatrick 2024) |
| Horizonte | Ate 90 anos | |

### Projecao-base de patrimonio (FR-001 v4, retorno 5.84%)

Patrimonio FIM de cada idade com aportes normais:

| Idade | Pat. Fim (c/ aportes) |
|-------|----------------------:|
| 39 | R$3,986,007 |
| 40 | R$4,518,790 |
| 41 | R$5,082,687 |
| 42 | R$5,679,515 |
| 43 | R$6,311,208 |
| 44 | R$6,979,823 |
| 45 | R$7,687,545 |
| 46 | R$8,436,697 |
| 47 | R$9,229,760 |
| 48 | R$10,069,378 |
| 49 | R$10,958,429 |
| **50** | **R$10,958,429** (FIRE) |

---

## Analise

### Parte A: Perda de Renda com Retorno Base (4.57%)

**Premissa chave v2**: "Perda aos X" = ultimo aporte completo foi em idade X-1. Patrimonio = fim de X-1. A partir de X, comeca a SACAR R$250k/ano imediatamente. Retorno: 4.57% real liquido (desacumulacao conservadora, HD-006).

#### Cenario A1: Perda aos 42

Patrimonio ao perder renda (fim idade 41): **R$5,082,687**
SWR inicial: 250k / 5,083k = **4.92%**
Horizonte: **48 anos** (42-90)

| Idade | Patrimonio | Retorno 4.57% | Retirada | Pat. Fim |
|-------|----------:|-------------:|---------:|---------:|
| 42 | 5,082,687 | 232,278 | 250,000 | 5,064,965 |
| 45 | 5,006,793 | 228,810 | 250,000 | 4,985,604 |
| 50 | 4,890,709 | 223,505 | 250,000 | 4,864,215 |
| 55 | 4,745,562 | 216,873 | 250,000 | 4,712,435 |
| 60 | 4,564,076 | 208,579 | 250,000 | 4,522,655 |
| 65 | 4,337,152 | 198,208 | 250,000 | 4,285,360 |
| 70 | 4,053,416 | 185,241 | 250,000 | 3,988,657 |
| 75 | 3,698,643 | 169,028 | 250,000 | 3,617,671 |
| 80 | 3,255,049 | 148,756 | 250,000 | 3,153,805 |
| 85 | 2,700,396 | 123,408 | 250,000 | 2,573,804 |
| **90** | **2,006,879** | — | — | — |

**Sobrevive ate 90: SIM** (pat final ~R$2.0M)

O patrimonio DECLINA continuamente (retirada > retorno) mas lentamente. A taxa liquida de 4.57% gera ~R$232k/ano sobre R$5.1M — deficit de apenas ~R$18k/ano inicialmente. O deficit cresce mas nunca consome o patrimonio em 48 anos.

**SWR corrente ao longo do tempo**: Sobe de 4.92% (42) para 12.5% (90). O patrimonio sobrevive no deterministico, mas a SWR alta torna-o vulneravel a volatilidade.

#### Cenario A2: Perda aos 45

Patrimonio ao perder renda (fim idade 44): **R$6,979,823**
SWR inicial: 250k / 6,980k = **3.58%**
Horizonte: **45 anos** (45-90)

| Idade | Patrimonio | Retorno 4.57% | Retirada | Pat. Fim |
|-------|----------:|-------------:|---------:|---------:|
| 45 | 6,979,823 | 318,978 | 250,000 | 7,048,801 |
| 50 | 7,443,957 | 340,189 | 250,000 | 7,534,145 |
| 55 | 7,938,044 | 362,769 | 250,000 | 8,050,813 |
| 60 | 8,555,832 | 391,002 | 250,000 | 8,696,834 |
| 65 | 9,328,290 | 426,303 | 250,000 | 9,504,593 |
| 70 | 10,294,141 | 470,442 | 250,000 | 10,514,583 |
| 75 | 11,501,805 | 525,632 | 250,000 | 11,777,437 |
| 80 | 13,011,820 | 594,640 | 250,000 | 13,356,460 |
| 85 | 14,899,886 | 680,925 | 250,000 | 15,330,811 |
| **90** | **17,260,650** | — | — | — |

**Sobrevive ate 90: SIM** (pat final ~R$17.3M e CRESCENDO)

Com SWR de 3.58%, o retorno de 4.57% SUPERA a retirada. Patrimonio cresce perpetuamente. Cenario robusto.

#### Cenario A3: Perda aos 48

Patrimonio ao perder renda (fim idade 47): **R$9,229,760**
SWR inicial: 250k / 9,230k = **2.71%**
Horizonte: **42 anos** (48-90)

| Idade | Patrimonio | Retorno 4.57% | Retirada | Pat. Fim |
|-------|----------:|-------------:|---------:|---------:|
| 48 | 9,229,760 | 421,800 | 250,000 | 9,401,560 |
| 50 | 9,769,073 | 446,447 | 250,000 | 9,965,519 |
| 55 | 10,845,279 | 495,630 | 250,000 | 11,090,909 |
| 60 | 12,190,926 | 557,125 | 250,000 | 12,498,051 |
| 70 | 15,977,261 | 730,161 | 250,000 | 16,457,422 |
| 80 | 21,896,830 | 1,000,685 | 250,000 | 22,647,515 |
| **90** | **31,151,504** | — | — | — |

**Sobrevive ate 90: SIM** (pat final ~R$31.2M e crescendo forte)

SWR de 2.71% com retorno 4.57% = patrimonio TRIPLICA ate 90. Cenario ultra-robusto. Impacto da perda de renda aos 48 e desprezivel.

#### Resumo Parte A (retorno base 4.57%)

| Cenario | Pat. Inicio | SWR Inicial | Pat. aos 90 | Sobrevive? | Veredicto |
|---------|----------:|:----------:|----------:|:---------:|-----------|
| **Perda aos 42** | R$5,083k | **4.92%** | R$2,007k | SIM | Sobrevive no deterministico. SWR alta = vulneravel a vol |
| **Perda aos 45** | R$6,980k | **3.58%** | R$17,261k | SIM | Patrimonio cresce. Robusto |
| **Perda aos 48** | R$9,230k | **2.71%** | R$31,152k | SIM | Ultra-robusto. Impacto desprezivel |

**FIRE agent**: Diferenca critica vs v1: na v1, perda aos 42 gerava R$8.0M aos 50 com SWR 3.12% — parecia confortavel. Na v2, a realidade e SWR de 4.92% aos 42 com patrimonio declinante. Sobrevive no deterministico, mas a vulnerabilidade a volatilidade e MUITO maior. Perda aos 42 agora e um cenario de atenccao real, nao apenas teorico.

**Head**: Concordo. E a perda aos 45 e 48 continua tranquila porque 4.57% > SWR (3.58% e 2.71%). O ponto de inflexao e claro: **se SWR > retorno desacum, patrimonio declina. Se SWR < retorno desacum, patrimonio cresce.** O threshold e SWR = 4.57%, que corresponde a patrimonio de ~R$5.47M (250k/0.0457). Qualquer patrimonio acima disso e auto-sustentavel no deterministico.

---

### Parte B: Perda de Renda + Retorno Adverso (desacumulacao)

Agora testamos: e se alem de perder a renda, o retorno de desacumulacao for pior que 4.57%?

Premissa: acumulacao ate a perda ocorre com retorno NORMAL (5.84%). Apenas o retorno pos-perda cai.

#### B1: Perda aos 42 + Retorno 3% desacum

Pat: R$5,082,687 | SWR: 4.92% | Retorno: 3%

| Idade | Patrimonio |
|-------|----------:|
| 42 | 5,082,687 |
| 50 | 4,091,977 |
| 55 | 3,416,439 |
| 60 | 2,633,305 |
| 65 | 1,725,439 |
| 70 | 672,972 |
| **73** | **FALHA** |

**NAO sobrevive.** Falha aos 73 (31 anos de horizonte, precisava 48).

#### B2: Perda aos 42 + Retorno 2% desacum

Pat: R$5,082,687 | SWR: 4.92% | Retorno: 2%

| Idade | Patrimonio |
|-------|----------:|
| 42 | 5,082,687 |
| 50 | 3,635,624 |
| 55 | 2,713,013 |
| 60 | 1,694,376 |
| 65 | 569,717 |
| **68** | **FALHA** |

**NAO sobrevive.** Falha aos 68 (26 anos).

#### B3: Perda aos 45 + Retorno 3% desacum

Pat: R$6,979,823 | SWR: 3.58% | Retorno: 3%

| Idade | Patrimonio |
|-------|----------:|
| 45 | 6,979,823 |
| 50 | 6,717,171 |
| 55 | 6,459,758 |
| 60 | 6,161,347 |
| 65 | 5,815,405 |
| 70 | 5,414,365 |
| 75 | 4,949,449 |
| 80 | 4,410,484 |
| 85 | 3,785,675 |
| **90** | **R$3,061,351** |

**Sobrevive ate 90: SIM** (pat final R$3.06M). Patrimonio declina lentamente mas o colchao e grande o suficiente.

#### B4: Perda aos 45 + Retorno 2% desacum

Pat: R$6,979,823 | SWR: 3.58% | Retorno: 2%

| Idade | Patrimonio |
|-------|----------:|
| 45 | 6,979,823 |
| 50 | 6,283,384 |
| 55 | 5,636,354 |
| 60 | 4,921,980 |
| 65 | 4,133,254 |
| 70 | 3,262,436 |
| 75 | 2,300,983 |
| 80 | 1,239,461 |
| 85 | 67,455 |
| **86** | **FALHA** |

**NAO sobrevive.** Falha aos 86 (41 anos de horizonte, precisava 45).

#### Resumo Parte B

| Cenario | Retorno Desacum | Falha? | Idade da falha | Horizonte efetivo |
|---------|:--------------:|:------:|:--------------:|:-----------------:|
| Perda 42 + 4.57% | 4.57% | NAO | — | 48+ anos |
| **Perda 42 + 3%** | 3% | **SIM** | **73** | 31 anos |
| **Perda 42 + 2%** | 2% | **SIM** | **68** | 26 anos |
| Perda 45 + 4.57% | 4.57% | NAO | — | 45+ anos |
| Perda 45 + 3% | 3% | NAO | — | Pat R$3.06M aos 90 |
| **Perda 45 + 2%** | 2% | **SIM** | **86** | 41 anos |
| Perda 48 + qualquer | qualquer | NAO | — | Ultra-robusto |

**FIRE agent**: O padrao e claro. Perda aos 42 e o cenario critico — qualquer retorno abaixo de 4.57% comeca a comprometer o horizonte. Perda aos 45 aguenta ate 3% mas falha a 2%. Perda aos 48 e a prova de quase tudo.

---

### Parte C: Decada Perdida na Acumulacao + Perda de Renda + Retorno Adverso

Cenario maximo de stress: retorno de ACUMULACAO tambem e adverso (3% em vez de 5.84%), resultando em patrimonio menor no momento da perda.

Patrimonios com acumulacao a 3%:

| Idade da perda | Pat. com acum 5.84% | Pat. com acum 3% | Deficit |
|:--------------:|--------------------:|------------------:|--------:|
| 42 (fim 41) | R$5,082,687 | R$4,732,837 | -6.9% |
| 45 (fim 44) | R$6,979,823 | R$6,098,969 | -12.6% |

#### C1: Acum 3% + Perda 42 + Desacum 2%

Pat: R$4,732,837 | SWR: 5.28% | Retorno: 2%

| Idade | Patrimonio |
|-------|----------:|
| 42 | 4,732,837 |
| 50 | 3,217,521 |
| 55 | 2,251,394 |
| 60 | 1,184,710 |
| 65 | 7,006 |
| **66** | **FALHA** |

**FALHA aos 66.** Horizonte: apenas 24 anos. Este e o pior cenario combinado.

#### C2: Acum 3% + Perda 42 + Desacum 3%

Pat: R$4,732,837 | SWR: 5.28% | Retorno: 3%

| Idade | Patrimonio |
|-------|----------:|
| 42 | 4,732,837 |
| 50 | 3,745,000 |
| 60 | 2,100,000 |
| **70** | **FALHA** |

**FALHA aos 70.** Horizonte: 28 anos.

#### C3: Acum 3% + Perda 45 + Desacum 2%

Pat: R$6,098,969 | SWR: 4.10% | Retorno: 2%

| Idade | Patrimonio |
|-------|----------:|
| 45 | 6,098,969 |
| 50 | 5,291,399 |
| 55 | 4,541,122 |
| 60 | 3,712,756 |
| 65 | 2,798,173 |
| 70 | 1,788,399 |
| 75 | 673,527 |
| **78** | **FALHA** |

**FALHA aos 78.** Horizonte: 33 anos.

#### C4: Acum 3% + Perda 45 + Desacum 3%

Pat: R$6,098,969 | SWR: 4.10% | Retorno: 3%

| Idade | Patrimonio |
|-------|----------:|
| 45 | 6,098,969 |
| 50 | 5,665,385 |
| 55 | 5,240,450 |
| 60 | 4,747,834 |
| 65 | 4,176,757 |
| 70 | 3,514,723 |
| 75 | 2,747,243 |
| 80 | 1,857,523 |
| 85 | 826,095 |
| **89** | **FALHA** |

**FALHA aos 89** — por 1 ano! Quase sobrevive.

#### Resumo Parte C (cenarios combinados)

| Cenario | Pat. Inicio | SWR | Retorno | Falha? | Idade |
|---------|----------:|:---:|:------:|:------:|:-----:|
| Acum 3% + Perda 42 + Desacum 2% | R$4,733k | 5.28% | 2% | **SIM** | **66** |
| Acum 3% + Perda 42 + Desacum 3% | R$4,733k | 5.28% | 3% | **SIM** | **70** |
| Acum 3% + Perda 45 + Desacum 2% | R$6,099k | 4.10% | 2% | **SIM** | **78** |
| Acum 3% + Perda 45 + Desacum 3% | R$6,099k | 4.10% | 3% | **SIM** | **89** |

---

### Parte D: Tabela de Salvamento

Para cada cenario que falha: qual corte de custo ou renda part-time salva?

#### D1: Retorno base (4.57%), perda isolada

| Cenario | Falha? | Custo maximo para sobreviver | Renda part-time para manter R$250k |
|---------|:------:|:--------------------------:|:----------------------------------:|
| Perda 42 | NAO | R$250k funciona | Nenhuma necessaria |
| Perda 45 | NAO | R$250k funciona | Nenhuma necessaria |
| Perda 48 | NAO | R$250k funciona | Nenhuma necessaria |

#### D2: Retorno adverso, perda isolada (acum normal)

| Cenario | Custo maximo | Renda part-time p/ R$250k |
|---------|:-----------:|:------------------------:|
| Perda 42 + ret 3% | R$190k/ano (R$15.8k/mes) | R$65k/ano (R$5.4k/mes) |
| Perda 42 + ret 2% | R$160k/ano (R$13.3k/mes) | R$90k/ano (R$7.5k/mes) |
| Perda 45 + ret 3% | R$250k funciona | Nenhuma |
| Perda 45 + ret 2% | R$230k/ano (R$19.2k/mes) | R$20k/ano (R$1.7k/mes) |

#### D3: Decada perdida na acumulacao + perda + retorno adverso

| Cenario | Custo maximo | Renda part-time p/ R$250k |
|---------|:-----------:|:------------------------:|
| Acum 3% + Perda 42 + ret 2% | R$150k/ano (R$12.5k/mes) | R$100k/ano (R$8.3k/mes) |
| Acum 3% + Perda 42 + ret 3% | R$180k/ano (R$15.0k/mes) | R$65k/ano (R$5.4k/mes) |
| Acum 3% + Perda 45 + ret 2% | R$200k/ano (R$16.7k/mes) | R$50k/ano (R$4.2k/mes) |
| Acum 3% + Perda 45 + ret 3% | Quase sobrevive (falha 89) | R$10-15k/ano (R$1k/mes) |

---

### Parte E: Plano B Concreto e Gatilhos

(Mantido da v1 com atualizacoes de contexto)

#### Human capital como hedge

Diego com 42-50 anos e expertise tech tem capacidade de gerar R$120-180k/ano em consultoria part-time (10h/semana). Esse e o hedge mais eficaz contra sequence of returns risk (Kitces 2018).

A tabela D3 mostra que mesmo no PIOR cenario combinado (acum 3% + perda 42 + ret 2%), uma renda part-time de R$8.3k/mes salva o plano com R$250k de custo. Isso e consultoria tech a meio periodo — realista.

#### Guardrails como segunda linha

Piso dos guardrails: R$180k/ano. Abaixo do custo maximo de sobrevivencia em todos os cenarios exceto os mais extremos (acum 3% + perda 42 + ret 2%, onde custo maximo e R$150k).

#### Gatilhos de acao

| Gatilho | Condicao | Acao | Urgencia |
|---------|----------|------|----------|
| **Perda total de renda** | Demissao/burnout/fechamento PJ | Reduzir custo para R$200k. Buscar consultoria part-time em 30 dias. NAO mexer no portfolio | Alta |
| **Reducao de renda >50%** | Renda cai de R$25k para <R$12.5k/mes | Reduzir aporte para zero. Custo de vida no portfolio se necessario | Media |
| **Retorno do portfolio <2% real por 3+ anos** | Decada perdida em andamento | Manter alocacao. NAO vender equity. Considerar renda part-time preventivamente | Monitorar |
| **Patrimonio aos 45 < R$6M** | Combinacao de retorno baixo + perda | Adiar FIRE. Consultoria part-time obrigatoria | Media |
| **Drawdown >35% no primeiro ano pos-perda** | Crash severo | Cortar para piso R$180k. Consultoria part-time. Guardrails automaticos | Alta |

#### Reserva e seguro

- **Reserva atual (R$87k, ~4 meses)**: Suficiente. O patrimonio investido e a defesa real
- **Seguro de renda**: NAO recomendado. Custo-beneficio negativo com R$3.48M investidos (e crescendo)

---

## Conclusao

### Resultado principal (v2 — corrigido)

**A correcao muda o quadro: perda de renda aos 42 agora e um cenario de atencao real, nao apenas teorico.**

Detalhamento:

1. **Com retorno base (4.57%), R$250k sobrevive em TODOS os cenarios de perda isolada.** Mas perda aos 42 gera SWR de 4.92% — patrimonio declina continuamente e chega a R$2.0M aos 90. Sobrevive no deterministico, porem vulneravel a volatilidade. Perda aos 45+ e tranquila (patrimonio cresce).

2. **O ponto de inflexao e SWR = 4.57%.** Patrimonio de R$5.47M (250k/0.0457) e o threshold acima do qual o portfolio se sustenta indefinidamente no deterministico. Perda aos 42 (R$5.08M) fica ABAIXO desse threshold. Perda aos 45 (R$6.98M) fica ACIMA.

3. **Retorno adverso + perda de renda e severo.** Perda aos 42 com retorno 3% falha aos 73. Com retorno 2% falha aos 68. Perda aos 45 aguenta 3% mas falha a 2% (aos 86).

4. **Cenarios combinados (decada perdida acum + perda + ret adverso) sao devastadores.** Acum 3% + perda 42 + desacum 2% falha aos 66. Mas: renda part-time de R$8.3k/mes salva o plano.

5. **O Plano B real continua sendo human capital.** Em todos os cenarios de falha, consultoria tech part-time de R$5-8k/mes e suficiente para salvar o plano. Essa capacidade e a variavel mais importante a preservar.

6. **Nenhuma acao preventiva necessaria AGORA.** A probabilidade dos cenarios combinados (3+ fatores adversos simultaneos) e muito baixa (<3%). A melhor protecao e continuar maximizando aportes (JPGL) e manter skills monetizaveis.

### Veredicto por cenario (v2)

| Cenario | Prob. | Retorno | Sobrevive? | Acao |
|---------|:-----:|:-------:|:----------:|------|
| Perda 42, ret base | ~5% | 4.57% | SIM (R$2M aos 90) | R$250k funciona, mas vulner. a vol |
| Perda 45, ret base | ~10% | 4.57% | SIM (R$17M aos 90) | Robusto |
| Perda 48, ret base | ~5% | 4.57% | SIM (R$31M aos 90) | Ultra-robusto |
| Perda 42 + ret 3% | ~2% | 3% | NAO (falha 73) | Custo R$190k ou renda R$5.4k/mes |
| Perda 42 + ret 2% | ~1% | 2% | NAO (falha 68) | Custo R$160k ou renda R$7.5k/mes |
| Perda 45 + ret 3% | ~3% | 3% | SIM (R$3M aos 90) | OK |
| Perda 45 + ret 2% | ~2% | 2% | NAO (falha 86) | Custo R$230k ou renda R$1.7k/mes |
| Acum 3% + Perda 42 + ret 2% | <1% | 2% | NAO (falha 66) | Custo R$150k ou renda R$8.3k/mes |
| Acum 3% + Perda 45 + ret 2% | ~1% | 2% | NAO (falha 78) | Custo R$200k ou renda R$4.2k/mes |

### Debate Head vs FIRE

**FIRE agent**: A v1 pintou um quadro otimista demais. Perda de renda aos 42 com SWR 3.12% parecia quase irrelevante. A v2 mostra que SWR 4.92% e uma situacao realmente tensa — o patrimonio sangra R$18k/ano inicialmente e o sangramento CRESCE com o tempo. No deterministico funciona, mas bastam 2-3 anos de retorno ruim no inicio para empurrar para falha.

**Head**: Concordo, mas preciso manter a perspectiva. Perda de renda aos 42 com retorno base (4.57%) AINDA SOBREVIVE. A questao real e: a combinacao com retorno adverso. E isso exige 2+ fatores adversos simultaneos. O Plano B (human capital) resolve TODOS os cenarios — de R$1.7k/mes (perda 45 + ret 2%) ate R$8.3k/mes (worst case). Para um profissional de tech senior, isso e factivel.

**FIRE agent**: Justo. Mas registro que a SWR de 4.92% no cenario perda-42 e acima do que qualquer paper considera seguro para horizonte de 48 anos. ERN (Karsten 2018-2025) recomenda no maximo 3.5% para 40+ anos. 4.92% estaria em territorio de SR ~45-50% no Monte Carlo com vol de 15%.

**Head**: Exatamente por isso o human capital hedge e critico. E nao e algo a ser desenvolvido no momento da crise — Diego ja tem as skills. O gatilho e simples: perdeu renda, comeca consultoria em 30 dias.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Sem mudanca necessaria |
| **Estrategia** | Human capital hedge confirmado como defesa primaria. R$250k sobrevive em todos os cenarios isolados com ret base. Cenarios combinados exigem renda part-time de R$2-8k/mes |
| **Conhecimento** | v2 corrigida: perda de renda = aposentadoria forcada imediata. Perda aos 42 gera SWR 4.92% (vulneravel). Perda aos 45+ e robusta. Threshold de auto-sustentabilidade: pat R$5.47M |
| **Memoria** | Atualizar memoria FIRE e Head com correcao |

---

## Proximos Passos

- [x] Corrigir FIRE-002 com cenarios de retirada imediata
- [x] Registrar correcao na memoria FIRE e Head
- [ ] Revisao anual: validar premissas de renda e capacidade de freelancing
- [ ] Se patrimonio aos 45 < R$6M: reavaliar FIRE date
- [ ] Se decada perdida em andamento: acionar consultoria part-time proativamente
