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

---

## Motivo / Gatilho

> A premissa "renda se mantem ate os 50" sustenta todo o modelo FIRE. Se Diego perde renda antes dos 50, o gap de aportes pode inviabilizar o plano. Alem disso, FR-003 mostrou que **decada perdida** (retorno 3% acum / 2% desacum) tem success rate de apenas 31-43% — o cenario mais perigoso do portfolio. Precisamos de scenario planning concreto para ambos os riscos, separados e combinados.

---

## Descricao

> Modelar cenarios de perda de renda e retornos baixos prolongados. Para cada cenario: patrimonio aos 50, SWR, viabilidade, e acao necessaria. Definir Plano B concreto: reserva, skills, custo minimo, gatilhos.

---

## Escopo

- [x] Parte A: Perda de renda aos 42, 45, 48 — patrimonio, SWR, viabilidade
- [x] Parte B: Decada perdida (3%, 1%, combinado com perda de renda)
- [x] Parte C: Plano B concreto (reserva, skills, custo minimo, seguro, gatilhos)
- [x] Parte D: Tabela de recomendacao (acao agora vs acao se acontecer)

---

## Premissas (HD-006 final, 2026-03-22)

| Parametro | Valor | Fonte |
|-----------|-------|-------|
| Patrimonio marco 2026 | R$3,482,633 | carteira.md |
| Aporte anual | R$300,000 | carteira.md |
| Retorno portfolio acumulacao | 5.84% real | HD-006: ponderado 79% eq + 15% IPCA+ + 3% cripto + 3% Renda+ |
| Equity BRL real base | 5.89% | HD-006: DMS 2025 + factor premiums + dep 0.5% |
| IPCA+ longo liquido HTM | 6.0% | HD-006: 7.16% bruto, IR nominal, 14a |
| Cripto base conservadora | 0% real | Stress: sem contribuicao |
| Retorno desacumulacao conservador | 4.57% real liquido | HD-006: IR 15% sobre nominal (100% vendido) |
| Retorno desacumulacao venda parcial | 5.00% real liquido | HD-006: vende fracao, maior parte diferida |
| Custo de vida base | R$250,000/ano | carteira.md |
| SWR alvo | <= 3.5% | ERN evidence, 40+ anos |
| Guardrails | Kitces & Fitzpatrick 2024 | carteira.md |

### Projecao-base de patrimonio (FR-001 v4, retorno 5.84%)

Referencia — patrimonio FIM de cada idade com aportes normais:

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

### Parte A: Perda de Renda

**Premissa**: "Perda aos X" = ultimo aporte completo foi em idade X-1. Patrimonio no momento da perda = patrimonio FIM de X-1 na tabela-base. Apos perda, patrimonio cresce apenas por retorno (5.84% real), sem aportes, ate os 50.

#### Projecao sem aportes apos perda

**Cenario A1: Perda aos 42 (8 anos sem aportes)**

Patrimonio ao perder renda (fim idade 41): **R$5,082,687**

| Idade | Pat. Inicio | Retorno 5.84% | Pat. Fim |
|-------|------------:|------------:|----------:|
| 42 | 5,082,687 | 296,828 | 5,379,515 |
| 43 | 5,379,515 | 314,163 | 5,693,678 |
| 44 | 5,693,678 | 332,511 | 6,026,189 |
| 45 | 6,026,189 | 351,929 | 6,378,118 |
| 46 | 6,378,118 | 372,481 | 6,750,599 |
| 47 | 6,750,599 | 394,235 | 7,144,834 |
| 48 | 7,144,834 | 417,258 | 7,562,092 |
| 49 | 7,562,092 | 441,626 | 8,003,718 |
| **50** | **8,003,718** | — | **FIRE** |

- **Pat. aos 50**: R$8,003,718
- **Deficit vs base**: -R$2,954,711 (-27.0%)
- **SWR R$250k**: 250k / 8,004k = **3.12%** — VIAVEL (< 3.5%)
- **SWR R$350k**: 350k / 8,004k = **4.37%** — NAO VIAVEL

**Renda minima para salvar R$350k**: Precisa patrimonio de R$10M (SWR 3.5%). Gap = R$10M - R$8.0M = R$2.0M em 8 anos. Aporte necessario: ~R$2.0M / 8 / 1.03 (ajuste retorno) = **~R$230k/ano freelancing** (~R$19k/mes).

Para manter o mesmo patrimonio da base (R$10.96M): gap R$2.95M em 8 anos = **~R$340k/ano** (inviavel como freelancing puro — seria quase a renda atual).

**Cenario A2: Perda aos 45 (5 anos sem aportes)**

Patrimonio ao perder renda (fim idade 44): **R$6,979,823**

| Idade | Pat. Inicio | Retorno 5.84% | Pat. Fim |
|-------|------------:|------------:|----------:|
| 45 | 6,979,823 | 407,622 | 7,387,445 |
| 46 | 7,387,445 | 431,427 | 7,818,872 |
| 47 | 7,818,872 | 456,622 | 8,275,494 |
| 48 | 8,275,494 | 483,288 | 8,758,782 |
| 49 | 8,758,782 | 511,513 | 9,270,295 |
| **50** | **9,270,295** | — | **FIRE** |

- **Pat. aos 50**: R$9,270,295
- **Deficit vs base**: -R$1,688,134 (-15.4%)
- **SWR R$250k**: 250k / 9,270k = **2.70%** — VIAVEL (folga ampla)
- **SWR R$350k**: 350k / 9,270k = **3.78%** — NAO VIAVEL (marginal)

**Renda minima para R$350k viavel**: Precisa R$10M. Gap = R$730k em 5 anos. Aporte: ~R$730k / 5 / 1.03 = **~R$142k/ano freelancing** (~R$12k/mes).

**Cenario A3: Perda aos 48 (2 anos sem aportes)**

Patrimonio ao perder renda (fim idade 47): **R$9,229,760**

| Idade | Pat. Inicio | Retorno 5.84% | Pat. Fim |
|-------|------------:|------------:|----------:|
| 48 | 9,229,760 | 539,018 | 9,768,778 |
| 49 | 9,768,778 | 570,497 | 10,339,275 |
| **50** | **10,339,275** | — | **FIRE** |

- **Pat. aos 50**: R$10,339,275
- **Deficit vs base**: -R$619,154 (-5.7%)
- **SWR R$250k**: 250k / 10,339k = **2.42%** — VIAVEL (folga enorme)
- **SWR R$350k**: 350k / 10,339k = **3.39%** — VIAVEL (< 3.5%)

**Nenhuma renda adicional necessaria** para R$250k. Para R$350k: ja viavel sem ajuste.

#### Resumo Parte A

| Cenario | Pat. aos 50 | Deficit | SWR R$250k | SWR R$350k | R$250k viavel? | R$350k viavel? |
|---------|------------:|--------:|:----------:|:----------:|:--------------:|:--------------:|
| Base (aportes ate 50) | R$10,958k | — | 2.28% | 3.19% | SIM | SIM |
| **Perda aos 42** | R$8,004k | -27.0% | **3.12%** | 4.37% | **SIM** | NAO |
| **Perda aos 45** | R$9,270k | -15.4% | **2.70%** | 3.78% | **SIM** | NAO (marginal) |
| **Perda aos 48** | R$10,339k | -5.7% | **2.42%** | 3.39% | **SIM** | **SIM** |

**Conclusao Parte A**: R$250k/ano sobrevive a perda de renda em QUALQUER idade (ate perda aos 42 fica em 3.12%). R$350k so e viavel se perda ocorrer apos os 47. Para R$350k com perda antes dos 47, consultoria part-time de R$12-19k/mes fecha o gap.

---

### Parte B: Decada Perdida

#### Cenario B1: Retorno 3% acumulacao + 2% desacumulacao (GMO worst case)

**Acumulacao com retorno 3% real**:

| Idade | Pat. Inicio | Aporte | Retorno 3% | Pat. Fim |
|-------|------------:|-------:|-----------:|---------:|
| 39 | 3,482,633 | 300,000 | 104,479 | 3,887,112 |
| 40 | 3,887,112 | 300,000 | 116,613 | 4,303,725 |
| 41 | 4,303,725 | 300,000 | 129,112 | 4,732,837 |
| 42 | 4,732,837 | 300,000 | 141,985 | 5,174,822 |
| 43 | 5,174,822 | 300,000 | 155,245 | 5,630,067 |
| 44 | 5,630,067 | 300,000 | 168,902 | 6,098,969 |
| 45 | 6,098,969 | 300,000 | 182,969 | 6,581,938 |
| 46 | 6,581,938 | 300,000 | 197,458 | 7,079,396 |
| 47 | 7,079,396 | 300,000 | 212,382 | 7,591,778 |
| 48 | 7,591,778 | 300,000 | 227,753 | 8,119,531 |
| 49 | 8,119,531 | 300,000 | 243,586 | 8,663,117 |
| **50** | **8,663,117** | — | — | **FIRE** |

- **Pat. aos 50**: R$8,663,117
- **Deficit vs base**: -R$2,295,312 (-20.9%)
- **SWR R$250k**: 250k / 8,663k = **2.89%**

**Desacumulacao com retorno 2% real**:

| Idade | Pat. Inicio | Retirada R$250k | Retorno 2% | Pat. Fim |
|-------|------------:|----------------:|-----------:|---------:|
| 50 | 8,663,117 | -250,000 | 173,262 | 8,586,379 |
| 55 | 8,266,000 | -250,000 | 165,320 | 8,181,320 |
| 60 | 7,840,000 | -250,000 | 156,800 | 7,746,800 |
| 65 | 7,381,000 | -250,000 | 147,620 | 7,278,620 |
| 70 | 6,884,000 | -250,000 | 137,680 | 6,771,680 |
| 75 | 6,345,000 | -250,000 | 126,900 | 6,221,900 |
| 80 | 5,758,000 | -250,000 | 115,160 | 5,623,160 |
| 85 | 5,117,000 | -250,000 | 102,340 | 4,969,340 |
| 90 | 4,414,000 | -250,000 | 88,280 | 4,252,280 |

**Sobrevive ate 90**: SIM no deterministico (pat. ~R$4.25M aos 90). Mas FR-003 Monte Carlo mostrou **SR = 42.6% com guardrails** para esse cenario. A volatilidade mata: 57% das trajetorias falham por sequence of returns risk, mesmo que o deterministico sobreviva.

**Desacumulacao R$350k com retorno 2%**:

| Idade | Pat. aprox. |
|-------|------------:|
| 50 | 8,663,000 |
| 60 | 6,850,000 |
| 70 | 4,680,000 |
| 80 | 2,080,000 |
| ~85 | ~0 |

**Sobrevive ate 90**: NAO. Falha por volta dos 84-85. FR-003: SR = 38.4% com guardrails.

#### Cenario B2: Retorno 1% acumulacao + 0% desacumulacao (Japao pos-1989)

**Acumulacao com retorno 1% real**:

| Idade | Pat. Inicio | Aporte | Retorno 1% | Pat. Fim |
|-------|------------:|-------:|-----------:|---------:|
| 39 | 3,482,633 | 300,000 | 34,826 | 3,817,459 |
| 40 | 3,817,459 | 300,000 | 38,175 | 4,155,634 |
| 41 | 4,155,634 | 300,000 | 41,556 | 4,497,190 |
| 42 | 4,497,190 | 300,000 | 44,972 | 4,842,162 |
| 43 | 4,842,162 | 300,000 | 48,422 | 5,190,584 |
| 44 | 5,190,584 | 300,000 | 51,906 | 5,542,490 |
| 45 | 5,542,490 | 300,000 | 55,425 | 5,897,915 |
| 46 | 5,897,915 | 300,000 | 58,979 | 6,256,894 |
| 47 | 6,256,894 | 300,000 | 62,569 | 6,619,463 |
| 48 | 6,619,463 | 300,000 | 66,195 | 6,985,658 |
| 49 | 6,985,658 | 300,000 | 69,857 | 7,355,515 |
| **50** | **7,355,515** | — | — | **FIRE** |

- **Pat. aos 50**: R$7,355,515
- **Deficit vs base**: -R$3,602,914 (-32.9%)
- **SWR R$250k**: 250k / 7,356k = **3.40%** — VIAVEL (marginal, mas < 3.5%)

**Desacumulacao com retorno 0% real**:

Patrimonio simplesmente diminui pela retirada. R$7,356k - R$250k/ano = dura 29.4 anos. **Falha aos ~79 anos.**

Com R$350k: dura 21 anos. **Falha aos ~71.**

Com guardrails (corte para R$180k piso):
- R$7,356k / R$180k = 40.9 anos. **Sobrevive ate ~91** no piso.
- Mas lifestyle em R$180k por decadas e austeridade severa.

#### Cenario B3: Decada perdida + perda de renda aos 45

**Combinacao mais perigosa**: retorno 3% acum, aportes cessam aos 45, desacumulacao 2%.

Patrimonio aos 45 (retorno 3%, com aportes): R$6,581,938 (da tabela B1)

Patrimonio aos 50 (retorno 3%, sem aportes):

| Idade | Pat. Inicio | Retorno 3% | Pat. Fim |
|-------|------------:|-----------:|---------:|
| 45 | 6,581,938 | 197,458 | 6,779,396 |
| 46 | 6,779,396 | 203,382 | 6,982,778 |
| 47 | 6,982,778 | 209,483 | 7,192,261 |
| 48 | 7,192,261 | 215,768 | 7,408,029 |
| 49 | 7,408,029 | 222,241 | 7,630,270 |
| **50** | **7,630,270** | — | **FIRE** |

- **Pat. aos 50**: R$7,630,270
- **SWR R$250k**: 250k / 7,630k = **3.28%** — VIAVEL (marginal)

**Desacumulacao R$250k com retorno 2%**:

Deterministico: pat ~R$4.6M aos 90. Sobrevive.

Mas estocasticamente (vol 20%): SR estimado ~35-40%. Combinacao de patrimonio menor + retorno baixo + fat tails e devastadora.

**SWR R$350k**: 350k / 7,630k = **4.59%** — NAO VIAVEL. Falha ~83 no deterministico.

**Renda necessaria para R$250k viavel (estocastico)**: Para subir SR de ~38% para ~70%, precisa patrimonio ~R$10M (SWR ~2.5% com retorno 2%). Gap = R$2.4M. Com 5 anos apos perda: **~R$440k/ano** — inviavel. Alternativa: **cortar custo para R$180k** (piso guardrails). SWR = 180k/7,630k = **2.36%**. Sobrevive melhor.

#### Resumo Parte B

| Cenario | Retorno Acum | Retorno Desacum | Pat. aos 50 | SWR R$250k | Sobrevive 90 (det.)? | SR estimado (MC, guard) |
|---------|:------------:|:---------------:|------------:|:----------:|:--------------------:|:-----------------------:|
| **Base** | 5.84% | 4.57% | R$10,958k | 2.28% | SIM | **90.9%** |
| **B1: GMO** | 3% | 2% | R$8,663k | 2.89% | SIM (det.) | **~42.6%** |
| **B2: Japao** | 1% | 0% | R$7,356k | 3.40% | NAO (79) | **<20%** |
| **B3: GMO + perda 45** | 3% + stop 45 | 2% | R$7,630k | 3.28% | SIM (det.) | **~35-40%** |

---

### Parte C: Plano B Concreto

#### C1. Reserva de contingencia

**Situacao atual**: 2.5% em IPCA+ 2029 (~R$87k) = 4.2 meses de custo de vida.

**Precisa aumentar?** Nao necessariamente. A reserva protege contra emergencias de curto prazo (saude, despesas inesperadas), nao contra perda de renda prolongada. Contra perda de renda, o patrimonio investido E a defesa — R$5-8M investidos renderiam R$290-467k/ano a 5.84%, cobrindo o custo de vida mesmo sem aportes.

**Recomendacao**: Manter reserva atual (~4 meses). Nao aumentar alem de 6 meses. Capital parado em reserva tem custo de oportunidade alto (perde o retorno de equity/IPCA+ longo). A verdadeira protecao contra perda de renda e:
1. O patrimonio ja acumulado (R$3.48M hoje, crescendo)
2. A capacidade de gerar renda alternativa (consultoria tech)
3. Os guardrails de retirada (corte de R$250k para R$180k se necessario)

#### C2. Skills monetizaveis

Diego tem expertise em tecnologia (PJ no Simples Nacional, opera 2 empresas). Renda realista de consultoria tech:

| Modalidade | Renda estimada/ano | Nota |
|------------|-------------------:|------|
| Consultoria tech senior (20h/semana) | R$240-360k | Rate R$200-300/hora, mercado SR-SP. Conservador |
| Consultoria tech senior (10h/semana) | R$120-180k | Part-time, compativel com semi-FIRE |
| Advisory/board de startups (5h/semana) | R$60-120k | Menor esforco, acesso via networking |
| Freelance projetos (intermitente) | R$80-150k | Volatil, sem previsibilidade |

**Renda part-time realista**: R$120-180k/ano (10h/semana consultoria senior). Isso cobre o custo de vida no piso dos guardrails (R$180k) ou complementa a retirada do portfolio.

**Evidencia**: Kitces (2018) documenta que a capacidade de gerar renda na primeira decada de aposentadoria e o hedge mais eficaz contra sequence of returns risk — mais que bond tent, mais que guardrails. Chamado de "human capital as a hedge".

#### C3. Custo de vida minimo

**Piso dos guardrails**: R$180k/ano (R$15k/mes).

Composicao provavel:
| Item | Valor/mes | Valor/ano |
|------|----------:|----------:|
| Moradia (aluguel Pinheiros) | R$5,000 | R$60,000 |
| Alimentacao | R$3,000 | R$36,000 |
| Saude (plano + extras) | R$2,500 | R$30,000 |
| Transporte | R$1,000 | R$12,000 |
| Contas/servicos | R$1,500 | R$18,000 |
| Lazer/viagens (reduzido) | R$2,000 | R$24,000 |
| **Total** | **R$15,000** | **R$180,000** |

**Viavel?** SIM, mas com restricoes significativas. Viagens internacionais seriam raras, entretenimento limitado. E um piso de austeridade, nao de conforto. Diego aguentaria por 2-3 anos, nao por 20.

**Um piso mais realista para longo prazo**: R$200k/ano (R$16.7k/mes). Adiciona margem para imprevistos e evita fadiga de austeridade.

#### C4. Seguro de renda

**Seguro de invalidez temporaria / perda de renda**:
- Custo estimado: 2-4% da renda segurada/ano
- Para segurar R$300k/ano de renda: R$6-12k/ano de premio
- Periodo de carencia: 30-90 dias tipico
- Cobertura: 12-24 meses tipico

**Analise custo-beneficio**:
- Custo: ~R$10k/ano durante 11 anos = R$110k + custo de oportunidade (~R$160k a 5.84%)
- Beneficio: protege contra perda de renda por 12-24 meses
- **Mas**: seguro de renda NAO cobre desemprego voluntario, burnout, ou decisao de parar. Cobre invalidez/doenca.

**Veredicto**: NAO recomendado. O patrimonio investido de Diego (R$3.48M e crescendo) ja funciona como "auto-seguro" contra perda de renda. O custo do seguro seria melhor investido em JPGL (onde tem o maior gap). Para invalidez de longo prazo: seguro de vida com cobertura DIT seria mais relevante, mas isso e agenda da revisao de premissas de vida (casamento).

#### C5. Gatilhos de acao

Quando Diego deve comecar a se preocupar?

| Gatilho | Condicao | Acao | Urgencia |
|---------|----------|------|----------|
| **Perda total de renda** | Demissao/burnout/fechamento PJ | Reduzir custo para R$200k. Buscar consultoria part-time em 30 dias. NAO mexer no portfolio | Alta |
| **Reducao de renda >50%** | Renda cai de R$25k para <R$12.5k/mes | Reduzir aporte para zero. Custo de vida no portfolio se necessario. Buscar renda complementar | Media |
| **Retorno do portfolio <2% real por 3+ anos** | Decada perdida em andamento | Manter alocacao. NAO vender equity. Considerar adiamento do FIRE em 2-3 anos | Monitorar |
| **Patrimonio aos 45 < R$6M** | Combinacao de retorno baixo + perda | Adiar FIRE para 52-53. Consultoria part-time obrigatoria nos primeiros 5 anos | Media |
| **Patrimonio aos 48 < R$8M** | Qualquer causa | FIRE aos 50 exige custo R$250k com guardrails rigorosos. Consultoria part-time como backup | Baixa |
| **Drawdown >35% no primeiro ano de FIRE** | Crash severo no inicio da desacumulacao | Cortar para piso R$180k. Consultoria part-time. Guardrails automaticos | Alta |

---

### Parte D: Tabela de Recomendacao

| Cenario | Probabilidade | Acao necessaria AGORA | Acao SE acontecer |
|---------|:------------:|----------------------|-------------------|
| **Perda renda aos 42** | Baixa (~5%) | NENHUMA | R$250k funciona (SWR 3.12%). Consultoria part-time R$12-19k/mes se quiser R$350k |
| **Perda renda aos 45** | Baixa-media (~10%) | NENHUMA | R$250k com folga (SWR 2.70%). Consultoria R$12k/mes para R$350k |
| **Perda renda aos 48** | Baixa (~5%) | NENHUMA | Sem impacto material. Ate R$350k viavel (SWR 3.39%) |
| **Decada perdida (GMO)** | Media (~15-20%) | NENHUMA — asset allocation ja e a defesa | Guardrails agressivos + consultoria part-time 5-10 anos. Possivel adiamento FIRE 2-3 anos |
| **Decada perdida (Japao)** | Muito baixa (~2-5%) | NENHUMA — cenario extremo nao justifica seguro | Adiar FIRE para 55+. Consultoria obrigatoria. Custo R$180k. Reavaliar tudo |
| **GMO + perda renda 45** | Muito baixa (~2-3%) | NENHUMA | R$250k funciona (SWR 3.28% det.). Mas SR ~35-40% no MC. Consultoria + piso R$180k |

---

## Conclusao

### Resultado principal

**O plano FIRE de Diego e resiliente a perda de renda em todos os cenarios analisados, DESDE QUE o custo de vida se mantenha em R$250k/ano.**

Detalhamento:

1. **Perda de renda nao e o risco dominante.** Mesmo perdendo renda aos 42 (pior cenario), o patrimonio acumulado (R$5.08M) cresce para R$8.0M aos 50 so com retorno. SWR de 3.12% para R$250k — viavel. O patrimonio ja investido e a defesa principal.

2. **Decada perdida E o risco dominante.** FR-003 confirmou: SR de 31-43% com guardrails. No deterministico sobrevive, mas a volatilidade (fat tails) destroi 57-69% das trajetorias. Nenhuma acao de portfolio resolve isso — a unica defesa e:
   - Capacidade de gerar renda (human capital hedge)
   - Guardrails agressivos (cortar para piso)
   - Possivel adiamento do FIRE

3. **A combinacao (decada perdida + perda de renda) e severa mas rara.** Probabilidade estimada: 2-3% (ambos eventos simultaneos). SR ~35-40%. Exigiria austeridade (R$180k) + consultoria. Nao justifica acao preventiva alem do que ja esta no plano.

4. **Nenhuma acao preventiva necessaria AGORA.**
   - Reserva atual (R$87k) e suficiente
   - Seguro de renda NAO recomendado (custo-beneficio negativo com R$3.48M investidos)
   - Aumentar RF nao ajuda (IPCA+ ja em 15%, mais reduziria retorno esperado)
   - A melhor "protecao" e continuar aportando em JPGL (maior gap) para maximizar patrimonio

5. **O Plano B real e human capital.**
   Diego com 42-50 anos e expertise tech tem capacidade de gerar R$120-180k/ano em consultoria part-time (10h/semana). Esse e o hedge mais eficaz contra sequence of returns risk (Kitces 2018). Nao precisa ser exercido agora, mas precisa ser mantido como opcao.

### Veredicto por cenario

| Cenario | Veredicto |
|---------|-----------|
| Perda renda (qualquer idade) | **Risco aceitavel.** R$250k viavel em todos os cenarios. Portfolio ja protege |
| Decada perdida GMO (3%/2%) | **Risco alto mas sem acao preventiva eficaz.** Guardrails + human capital sao a defesa |
| Decada perdida Japao (1%/0%) | **Risco extremo, probabilidade muito baixa.** Plano FIRE nao sobrevive — requer reestruturacao total |
| Combinado GMO + perda renda | **Risco severo, probabilidade muito baixa (~2-3%).** Austeridade + consultoria. Aceitar e monitorar |

### Uma nota de honestidade

O cenario de decada perdida (SR 31-43%) e assustador. Mas e importante contextualizar:

- Decada perdida global (todos os mercados, todos os fatores) ao mesmo tempo e historicamente raro. Japao pos-1989 era concentrado em um pais com valuations extremas (CAPE >80). O portfolio de Diego e globalmente diversificado (35 paises, 4 fatores)
- Factor tilt (small value, multifator) historicamente performou MELHOR em decadas perdidas de large cap (Arnott, Harvey & Markowitz 2019)
- O retorno de IPCA+ 2040 (6.0% real liquido) e GARANTIDO independente de decada perdida em equity — os 15% protegem cash flow por 3 anos
- Diego tera 50 anos com skills monetizaveis — a opcao de voltar a trabalhar e real

**A recomendacao final e: aceitar o risco, monitorar os gatilhos, e manter a capacidade de gerar renda como opcao aberta. Nao fazer nada agora.**

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Sem mudanca necessaria. 79% equity / 15% IPCA+ / 3% cripto validado |
| **Estrategia** | Plano B definido: human capital hedge (consultoria R$120-180k/ano) como principal defesa contra cenarios adversos. Guardrails + piso R$180k como backup. Gatilhos de acao documentados |
| **Conhecimento** | Perda de renda nao e risco dominante (R$250k viavel mesmo com perda aos 42). Decada perdida e o killer (SR 31-43%). Combinacao rara (~2-3%) mas severa. Nenhuma acao preventiva justificada |
| **Memoria** | Registrar na memoria de FIRE e Head |

---

## Proximos Passos

- [x] Registrar na memoria FIRE e Head
- [ ] Revisao anual: validar premissas de renda e capacidade de freelancing
- [ ] Se patrimonio aos 45 < R$6M: reavaliar FIRE date (gatilho documentado)
- [ ] Se decada perdida em andamento (retorno <2% por 3+ anos): acionar consultoria part-time proativamente
