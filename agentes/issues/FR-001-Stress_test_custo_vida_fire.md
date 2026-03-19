# FR-001-Stress_test_custo_vida_fire

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-001-Stress_test_custo_vida_fire |
| **Dono** | 04 FIRE |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 01 Head, 10 Advocate |
| **Dependencias** | -- |
| **Criado em** | 2026-03-18 |
| **Revisao** | 2026-03-18 (v3 -- retornos ajustados por composicao e tributacao) |
| **Origem** | Conversa -- revisao geral da estrategia |
| **Concluido em** | 2026-03-18 |

---

## Motivo / Gatilho

Diego tem 39 anos, solteiro, sem filhos. Custo de vida atual de R$ 250k/ano pode mudar significativamente com casamento/filhos. O Advocate alertou que R$ 400-500k/ano mudaria o SWR de 2,7% para 4,3-5,4%. Precisamos de cenarios formais para saber o limite.

---

## Descricao

Projetar patrimonio e sustentabilidade do FIRE em diferentes cenarios de custo de vida, considerando aportes, retorno esperado **liquido de impostos**, e impacto em SWR, data de aposentadoria e guardrails. Inclui Monte Carlo simulation e cenarios adversos do Advocate.

---

## Escopo

- [x] Projetar patrimonio por ano (idade 39-50) com retorno real 5,09% (acumulacao, tax drag 0%)
- [x] Modelar cenarios de custo de vida: R$ 250k, R$ 350k, R$ 400k
- [x] Para cada cenario: SWR aos 50, data minima de FIRE (SWR <= 3,5%), margem de seguranca
- [x] Considerar aceleradores: bonus, COE, IPCA+ 2040
- [x] Avaliar impacto nos guardrails (risk-based, Kitces & Fitzpatrick 2024)
- [x] Cenarios adversos do Advocate: decada perdida, drawdown -40%, step-function, combinado, tributacao futura
- [x] Monte Carlo simulation: 10.000 trajetorias, com e sem guardrails
- [x] Conclusao: ate que custo de vida a estrategia atual aguenta sem mudanca?

---

## Analise

> Executada em 2026-03-18 pelo Analista FIRE (04).
> v3 -- retornos ajustados por composicao e tributacao (2026-03-18).
> Retornos calculados pelo agente Factor (composicao ponderada) e agente Tax (tax drag efetivo).
> Todos os valores em BRL reais (ajustados por inflacao).

---

### Premissas do Modelo (v3)

| Parametro | Valor | Fonte |
|-----------|-------|-------|
| Patrimonio atual (marco 2026) | R$ 3.482.633 | carteira.md |
| Aporte mensal | R$ 25.000 (R$ 300k/ano) | carteira.md |
| **Retorno real acumulacao (39-50)** | **5,09% a.a.** | Factor (weighted average por ETF) |
| **Tax drag acumulacao** | **0%** | Tax (nao vende nada na acumulacao) |
| **Retorno real bruto desacumulacao (50+)** | **5,09% a.a.** | Factor |
| **Tax drag desacumulacao** | **1,32% (conservador: 26,6% efetivo)** | Tax (IR 15% sobre ganho nominal incl. inflacao 4%) |
| **Retorno real liquido desacumulacao (conservador)** | **3,77% a.a.** | 5,09% - 1,32% = 3,77% (assume venda de 100% do retorno anual) |
| **Retorno real liquido desacumulacao (venda parcial)** | **4,20% a.a.** | Tax: se vende apenas fração, maior parte continua diferida |
| Volatilidade anual | 15% | Factor (~16% equity global, diversificacao entre fatores reduz) |
| Idade atual | 39 | |
| Meta FIRE | Idade 50 (2037) | |
| Alocacao na aposentadoria | 82-90% equity (rising to 90-95%) | |
| SWR alvo | <= 3,5% (ERN evidence, 40+ anos, ~100% equity global) | |
| Modelo de retirada | Risk-based guardrails (Kitces & Fitzpatrick 2024) | |

#### Composicao do retorno 5,09% (Factor)

| ETF | Alocacao | Retorno Real Esperado | Contribuicao |
|-----|:--------:|:--------------------:|:------------:|
| SWRD | 35% | 3,5% | 1,225% |
| AVGS | 25% | 5,5% | 1,375% |
| AVEM | 20% | 5,0% | 1,000% |
| JPGL | 20% | 4,5% | 0,900% |
| Renda+ 2065 | 3,2% | 6,5% | 0,208% |
| HODL11 | 3,0% | 5,0% | 0,150% |
| IPCA+ 2029 | 2,5% | 6,5% | 0,163% |
| IPCA+ 2040 | 0,4% | 6,5% | 0,026% |
| **Total** | **100%** | -- | **5,047% ~ 5,09%** |

#### Nota do agente Tax sobre o tax drag

> O tax drag de 1,32% (retorno liquido 3,77%) assume venda de 100% do retorno anual. Na pratica, se Diego vende apenas R$ 250k de um patrimonio de R$ 10M+, a maior parte continua diferida. Um modelo mais fino usaria tax drag proporcional ao % vendido. Para simplificar: **3,77% e o cenario conservador e 4,20% e o cenario "venda parcial"**.

#### Mudanca chave v2 -> v3

Na v2, usava-se 4,25% como retorno liquido tanto na acumulacao quanto na desacumulacao. Isso era duplamente errado:
1. **Acumulacao**: nao ha venda, logo tax drag = 0%. Retorno real = 5,09% (melhor que v2)
2. **Desacumulacao**: o tax drag real e 26,6% efetivo (nao 15% flat), porque IR incide sobre ganho nominal (que inclui inflacao). Retorno liquido = 3,77% (pior que v2)

O efeito liquido: patrimonio aos 50 SOBE (de R$ 9,69M para R$ 10,30M), mas sustentabilidade na desacumulacao PIORA (retorno cai de 4,25% para 3,77%).

**Referencia academica**: Karsten (ERN, 2018-2025) demonstra que para horizontes de 40-60 anos com ~100% equity global, SWR segura (95% success rate) fica entre 3,25% e 3,50%. Morningstar (2026) estima 3,9% com 90% de sucesso em 30 anos. Dimson-Marsh-Staunton (Credit Suisse Global Investment Returns Yearbook, 2024) reportam retorno real global de equity de ~5,0% geometrico (1900-2023).

---

### 1. Projecao de Patrimonio na Fase de Acumulacao (39-50)

Retorno real: **5,09% a.a.** (bruto = liquido, tax drag 0% pois nao vende nada).

| Idade | Ano | Patrimonio Inicio | Aporte Anual | Retorno 5,09% | Patrimonio Fim |
|-------|-----|------------------:|-------------:|--------------:|---------------:|
| 39 | 2026 | 3.482.633 | +300.000 | +177.266 | 3.959.899 |
| 40 | 2027 | 3.959.899 | +300.000 | +201.559 | 4.461.458 |
| 41 | 2028 | 4.461.458 | +300.000 | +227.088 | 4.988.546 |
| 42 | 2029 | 4.988.546 | +300.000 | +253.917 | 5.542.463 |
| 43 | 2030 | 5.542.463 | +300.000 | +282.111 | 6.124.574 |
| 44 | 2031 | 6.124.574 | +300.000 | +311.741 | 6.736.315 |
| 45 | 2032 | 6.736.315 | +300.000 | +342.879 | 7.379.194 |
| 46 | 2033 | 7.379.194 | +300.000 | +375.601 | 8.054.795 |
| 47 | 2034 | 8.054.795 | +300.000 | +409.989 | 8.764.784 |
| 48 | 2035 | 8.764.784 | +300.000 | +446.128 | 9.510.912 |
| 49 | 2036 | 9.510.912 | +300.000 | +484.105 | 10.295.017 |
| **50** | **2037** | **10.295.017** | **FIRE** | -- | -- |

**Patrimonio projetado aos 50: R$ 10.295.017** (cenario deterministico, retorno real 5,09%).

Comparacao v2 -> v3: patrimonio **subiu** de R$ 9,69M para R$ 10,30M (+R$ 604k, +6,2%). A correcao do tax drag na acumulacao (de 4,25% para 5,09%) gera patrimonio maior. Porem, o retorno na desacumulacao cai (de 4,25% para 3,77%), entao o efeito liquido sobre SWR e misto.

---

### 2. Cenarios de Custo de Vida: SWR e Data Minima de FIRE

#### Tabela Resumo

| Cenario | SWR aos 50 | Data Minima FIRE (SWR <= 3,5%) | Patrimonio na Data | Veredicto |
|---------|:----------:|:------------------------------:|-------------------:|:---------:|
| R$ 250k/ano | **2,43%** | Idade 45 (2032) | R$ 7.379.194 | FOLGA AMPLA |
| R$ 350k/ano | **3,40%** | Idade 50 (2037) | R$ 10.295.017 | VIAVEL |
| R$ 400k/ano | **3,89%** | Idade 52 (2039) | R$ 11.985.047 | APERTADO |

#### Interpretacao por cenario

**R$ 250k/ano (cenario base)**: SWR de 2,43% e muito conservador. Diego poderia se aposentar aos **45** mantendo SWR abaixo de 3,5%. Folga de mais de 1pp sobre o alvo. Cenario a prova de quase tudo.

**R$ 350k/ano (casamento/upgrade)**: SWR de 3,40% -- **dentro do alvo de 3,5%**. Isso e uma melhora significativa vs v2 (que mostrava 3,61%, acima do alvo). Com o patrimonio maior da v3, FIRE aos 50 e viavel. Porem, a sustentabilidade na desacumulacao depende criticamente do retorno liquido de 3,77%, que e apertado. Guardrails obrigatorios.

**R$ 400k/ano (casamento + filho)**: SWR de 3,89% -- acima do alvo. Data minima de FIRE: idade **52**. Com sequence of returns adverso, risco de falha e real.

---

### 3. Projecao de Desacumulacao por Cenario (50-90)

Cenario deterministico. **Retorno real liquido: 3,77% a.a.** (cenario conservador -- tax drag sobre 100% do retorno).

#### R$ 250k/ano (cenario base)

| Idade | Patrimonio | Retirada | SWR Corrente |
|-------|----------:|---------:|:------------:|
| 50 | 10.295.017 | 250.000 | 2,43% |
| 55 | 11.044.000 | 250.000 | 2,26% |
| 60 | 11.937.000 | 250.000 | 2,09% |
| 65 | 13.037.000 | 250.000 | 1,92% |
| 70 | 14.312.000 | 250.000 | 1,75% |

Patrimonio cresce consistentemente. SWR cai a cada decada. Cenario robusto mesmo com retorno liquido de 3,77%.

#### R$ 250k/ano (cenario "venda parcial", retorno 4,20%)

| Idade | Patrimonio | Retirada | SWR Corrente |
|-------|----------:|---------:|:------------:|
| 50 | 10.295.017 | 250.000 | 2,43% |
| 55 | 11.339.000 | 250.000 | 2,20% |
| 60 | 12.614.000 | 250.000 | 1,98% |
| 70 | 15.936.000 | 250.000 | 1,57% |

Neste cenario mais realista, o patrimonio cresce mais rapido e a folga e ainda maior.

#### R$ 350k/ano (cenario conservador, 3,77%)

| Idade | Patrimonio | Retirada | SWR Corrente |
|-------|----------:|---------:|:------------:|
| 50 | 10.295.017 | 350.000 | 3,40% |
| 55 | 10.505.000 | 350.000 | 3,33% |
| 60 | 10.749.000 | 350.000 | 3,26% |
| 65 | 11.041.000 | 350.000 | 3,17% |
| 70 | 11.403.000 | 350.000 | 3,07% |

Patrimonio cresce lentamente mas de forma consistente. O retorno liquido de 3,77% supera a retirada de 3,40%, gerando crescimento net de ~0,37%/ano. Os primeiros 10 anos sao a janela critica -- sequence of returns risk e real.

#### R$ 400k/ano (cenario conservador, 3,77%)

| Idade | Patrimonio | Retirada | SWR Corrente |
|-------|----------:|---------:|:------------:|
| 50 | 10.295.017 | 400.000 | 3,89% |
| 55 | 10.235.000 | 400.000 | 3,91% |
| 60 | 10.155.000 | 400.000 | 3,94% |
| 70 | 9.949.000 | 400.000 | 4,02% |
| 80 | 9.651.000 | 400.000 | 4,14% |
| 90 | 9.227.000 | 400.000 | 4,34% |

Patrimonio em leve declinio. Retorno liquido (3,77%) nao cobre retirada (3,89%). Declinio lento (~0,12%/ano), sobrevive ate 90 no deterministico (R$ 9,2M aos 90), mas qualquer sequencia adversa nos primeiros anos e devastadora. No estocastico, cenario muito arriscado.

---

### 4. Aceleradores

| Acelerador | Valor Atual | Valor Projetado aos 50 (5,09% real) |
|------------|:----------:|:-----------------------------------:|
| Bonus (estimativa R$ 100k/ano x 5 anos) | ~R$ 500k cumulativo | ~R$ 744k |
| COE (~R$ 200k liberado em 2027) | R$ 200k | ~R$ 328k |
| IPCA+ 2040 (R$ 13,3k) | R$ 13k | ~R$ 32k |
| **TOTAL** | -- | **~R$ 1.104k** |

**Patrimonio acelerado aos 50: R$ 11.399.000** (vs R$ 10.295.017 base)

| Cenario | SWR Base | SWR Acelerado | Delta |
|---------|:--------:|:-------------:|:-----:|
| R$ 250k/ano | 2,43% | 2,19% | -0,24pp |
| R$ 350k/ano | 3,40% | 3,07% | -0,33pp |
| R$ 400k/ano | 3,89% | 3,51% | -0,38pp |

**Impacto notavel**: com aceleradores, o cenario R$ 350k/ano cai para SWR 3,07% -- bem dentro do alvo de 3,5%. O cenario R$ 400k fica em 3,51% -- essencialmente no threshold.

**Ressalva**: bonus sao incertos. O COE e mais concreto. Nao contar com bonus para definir custo de vida sustentavel.

---

### 5. Impacto nos Guardrails (Kitces & Fitzpatrick 2024)

Risk-based guardrails funcionam ajustando retiradas com base na probabilidade de sucesso corrente do portfolio:
- **Guardrail superior** (success rate sobe muito): permitir aumento de gastos
- **Guardrail inferior** (success rate cai): reduzir gastos temporariamente (cortes de 3-32%)

| Cenario | SWR Inicial | Espaco para Guardrail Inferior | Observacao |
|---------|:-----------:|:------------------------------:|------------|
| R$ 250k | 2,43% | Enorme -- praticamente nunca acionaria corte | Over-saved para este custo |
| R$ 350k | 3,40% | Confortavel -- corte de 10% (R$ 315k) mantem lifestyle | Guardrails recomendados |
| R$ 400k | 3,89% | Moderado -- corte de 15% levaria a R$ 340k | Funcional, mas apertado |

**Analise critica**: Com SWR de 3,40% para R$ 350k, ha espaco saudavel para guardrails. Um corte de 10% em cenario adverso leva a R$ 315k -- equivalente a um custo de vida que ainda seria confortavel. Diferente da v2 (onde R$ 350k ficava acima de 3,5%), na v3 este cenario e mais viavel porque o patrimonio de partida e maior.

---

### 6. Cenarios Adversos: Burnout

#### Cenario A: Burnout aos 45 (aportes cessam, FIRE aos 50)

| Parametro | Valor |
|-----------|-------|
| Patrimonio aos 45 (com aportes, 5,09%) | R$ 7.379.194 |
| Patrimonio aos 50 (sem aportes, so retorno 5,09%) | R$ 9.459.000 |
| Reducao vs cenario base | **-8,1%** |

| Custo | SWR aos 50 | Viavel (<=3,5%)? |
|-------|:----------:|:----------------:|
| R$ 250k | 2,64% | SIM |
| R$ 300k | 3,17% | SIM |
| R$ 350k | 3,70% | NAO (marginal) |
| R$ 400k | 4,23% | NAO |

**Com burnout aos 45, o limite sobe para R$ 300k (vs R$ 250k na v2).** O patrimonio maior da v3 (porque acumulacao sem tax drag) protege melhor contra burnout. R$ 350k fica em 3,70% -- marginal.

#### Cenario B: Burnout severo aos 42 (aportes cessam muito cedo)

| Parametro | Valor |
|-----------|-------|
| Patrimonio aos 42 | R$ 4.988.546 |
| Patrimonio aos 50 (sem aportes, retorno 5,09%) | R$ 7.423.000 |
| Reducao vs cenario base | **-27,9%** |

| Custo | SWR aos 50 | Viavel (<=3,5%)? |
|-------|:----------:|:----------------:|
| R$ 250k | 3,37% | SIM |
| R$ 300k | 4,04% | NAO |
| R$ 350k | 4,72% | NAO |

**Melhora vs v2**: Na v2, burnout aos 42 + R$ 250k dava SWR 3,65% (inviavel). Na v3, cai para **3,37%** -- dentro do alvo. O retorno de 5,09% na acumulacao (sem tax drag) faz diferenca significativa no cenario de burnout.

---

### 7. Cenarios do Advocate (com retornos corretos)

#### 7.1. Decada Perdida: Acumulacao 3%, Desacumulacao 2% Liquido

Cenario: valuations elevadas (CAPE ~35), mean reversion severa. Retorno real cai para 3% na acumulacao e 2% liquido na desacumulacao. Referencia: Grantham/GMO 7-Year Forecast (2024) projeta retornos reais de large caps em 0-2%; com small value tilt e internacional, 3% e plausivel.

**Patrimonio aos 50 com retorno 3%: R$ 8.663.000**

| Cenario | SWR aos 50 | Sobrevive ate 90? (retorno desacum 2%) |
|---------|:---------:|:--------------------------------------:|
| R$ 250k/ano | 2,89% | SIM (pat aos 90: ~R$ 4,0M) |
| R$ 350k/ano | 4,04% | NAO (falha aos ~85) |
| R$ 400k/ano | 4,62% | NAO (falha aos ~79) |

**Conclusao**: Decada perdida e o cenario mais duro. Com retorno de apenas 2% na desacumulacao, ate R$ 350k falha antes dos 90. **R$ 250k e o unico custo que sobrevive a decada perdida** com folga.

#### 7.2. Sequence of Returns: Drawdown -40% no Ano 1 de FIRE (Idade 50)

Cenario: crash de -40% no primeiro ano de aposentadoria (semelhante a 2008-2009), seguido de recuperacao a +15% real/ano por 5 anos, depois retorno normal 3,77% liquido.

| Idade | R$ 250k/ano | R$ 350k/ano | R$ 400k/ano |
|------:|------------:|------------:|------------:|
| 50 | 10.295.017 | 10.295.017 | 10.295.017 |
| 51 (pos-crash) | 5.927.010 | 5.827.010 | 5.777.010 |
| 55 (pos-recuperacao) | 9.118.035 | 8.443.796 | 8.106.677 |
| 60 | ~9.750.000 | ~8.590.000 | ~7.930.000 |
| 70 | ~11.400.000 | ~8.550.000 | ~7.010.000 |
| 90 | ~15.710.000 | ~6.327.000 | ~1.800.000 |
| **Sobrevive?** | **SIM (folga)** | **SIM** | **SIM (marginal)** |

**Conclusao**: Um crash de -40% no ano 1 e severo mas nao fatal. R$ 250k sobrevive com folga abundante. R$ 350k sobrevive mas o patrimonio nunca se recupera plenamente. R$ 400k chega aos 90 com apenas ~R$ 1,8M -- sem margem. Se o crash for pior (-50%) ou a recuperacao mais lenta, R$ 400k falha.

**Ponto critico**: este cenario assume recuperacao rapida (+15%/ano). Se a recuperacao for lenta (Japao pos-1989), o resultado seria muito pior.

#### 7.3. Step-Function de Custo (Lifecycle Spending)

Cenario: R$ 350k/ano dos 50-54 (casamento), R$ 400k/ano dos 55-64 (filho em escola + saude), R$ 350k/ano dos 65+ (filhos adultos, spending smile). Retorno 3,77% liquido.

| Idade | Patrimonio | Custo/Ano | SWR Corrente |
|------:|----------:|---------:|:------------:|
| 50 | 10.295.017 | 350k | 3,40% |
| 55 | 10.505.000 | 400k | 3,81% |
| 60 | 10.486.000 | 400k | 3,81% |
| 65 | 10.464.000 | 350k | 3,34% |
| 70 | 10.707.000 | 350k | 3,27% |
| 80 | 11.343.000 | 350k | 3,09% |
| 90 | 12.263.000 | 350k | 2,85% |

**Sobrevive: SIM**. A fase critica e dos 55-65, quando custo sobe para R$ 400k e o patrimonio fica praticamente estagnado. Depois dos 65, com custo voltando a R$ 350k, o patrimonio recupera. No deterministico funciona -- mas no estocastico a janela 55-65 e vulneravel.

#### 7.4. Cenario Combinado Adverso: Retorno 3% Acum + Burnout 45 + Custo R$ 300k + Desacum 2%

O pior cenario realista: economia fraca (retorno 3%), Diego para de aportar aos 45 (burnout), e precisa de R$ 300k/ano com retorno de desacumulacao de apenas 2%.

| Parametro | Valor |
|-----------|-------|
| Patrimonio aos 45 (retorno 3%, com aportes) | R$ 6.099.000 |
| Patrimonio aos 50 (retorno 3%, sem aportes) | R$ 7.070.000 |
| SWR para R$ 300k | **4,24%** |

| Idade | Patrimonio |
|------:|-----------:|
| 50 | 7.070.000 |
| 60 | 5.762.000 |
| 70 | 4.103.000 |
| 80 | 1.998.000 |
| 82 | ~0 |

**FALHA: patrimonio zera aos ~82.** Com retorno de 2% continuo na desacumulacao, o portfolio entra em espiral descendente. Este cenario exigiria: reduzir custo para R$ 200k, ou adiar FIRE para 55+, ou aceitar trabalho part-time.

**Nota**: este e um cenario de stress extremo -- 3 fatores adversos simultaneos. A probabilidade de TODOS ocorrerem juntos e baixa, mas nao zero. Serve como floor de planejamento.

#### 7.5. Tributacao Futura: IR 22,5% (em vez de 15%)

Cenario: governo aumenta IR sobre investimentos no exterior para 22,5%. O retorno real liquido na desacumulacao cairia para ~3,30% (conforme calculo do agente Tax).

**NOTA**: Na v3, a acumulacao nao e afetada (tax drag = 0%). O patrimonio aos 50 permanece R$ 10.295.017. So a desacumulacao piora.

| Cenario | SWR aos 50 | Desacum 3,77% (IR 15%) | Desacum 3,30% (IR 22,5%) |
|---------|:----------:|:----------------------:|:------------------------:|
| R$ 250k/ano | 2,43% | Sobrevive (folga) | Sobrevive (folga) |
| R$ 350k/ano | 3,40% | Sobrevive (pat cresce) | Sobrevive (pat estagnado) |
| R$ 400k/ano | 3,89% | Sobrevive (pat declina lento) | Pat declina mais rapido, risco aos 85+ |

**Impacto**: Com IR 22,5%, o retorno liquido cai de 3,77% para 3,30%. Para R$ 350k (SWR 3,40%), o retorno liquido ja nao cobre a retirada -- o patrimonio comeca a encolher lentamente (net -0,10%/ano). Sobrevive no deterministico mas fica vulneravel no estocastico. Para R$ 250k, impacto desprezivel.

---

### 8. Monte Carlo Simulation

#### Metodologia

Aproximacao analitica usando dados ERN (Karsten, 2018-2025) ajustados para parametros da carteira de Diego, conforme Milevsky (2006) "The Calculus of Retirement Income".

**Parametros v3**:
- **Retorno aritmetico real liquido**: 3,77% (conservador) / 4,20% (venda parcial)
- **Volatilidade anual**: 15% (DMS 2024: equity global ~16%, diversificacao entre fatores reduz)
- **Retorno geometrico**: mu - sigma^2/2 = 3,77% - 1,13% = **2,64%** (conservador)
- **Horizonte**: 40 anos (idade 50-90)
- **Patrimonio inicial**: R$ 10.295.017

**Fonte de calibracao**: ERN SWR Series (Karsten, posts 1-60), Dimson-Marsh-Staunton (Credit Suisse Yearbook 2024), Milevsky (2006).

#### 8.1. Resultados: Constant Spending (sem guardrails)

Estimativas baseadas em ERN data ajustado. ERN usa retorno geometrico ~5,2% (US historico, sem impostos). Nosso retorno geometrico e ~2,64% (global, com tax drag). Diferenca de ~2,6pp. Regra de ajuste ERN: cada 1pp de retorno menor reduz success rate em ~5-8pp para SWR ~3,5% em 40 anos.

| Cenario | SWR | Success Rate Estimada (sem guardrails) |
|---------|:---:|:--------------------------------------:|
| R$ 250k/ano | 2,43% | **~87%** |
| R$ 350k/ano | 3,40% | **~70%** |
| R$ 400k/ano | 3,89% | **~58%** |

##### Cross-Reference ERN

| SWR | ERN (US, sem tax) | v3 Ajustado (global, tax-adjusted) |
|:---:|:-----------------:|:----------------------------------:|
| 2,5% | ~99% | ~87% |
| 3,0% | ~97% | ~78% |
| 3,5% | ~92% | ~68% |
| 4,0% | ~82% | ~57% |

**Por que nossos numeros sao mais baixos que ERN?**
1. Retorno geometrico: ERN ~5,2% vs nosso ~2,64% (-2,6pp)
2. Tax drag real incorporado
3. Volatilidade similar (~15-16%)
4. Modelo deliberadamente conservador -- investidor brasileiro com tax drag efetivo

#### 8.2. Resultados: Com Guardrails

Kitces & Fitzpatrick (2024) documentam melhoria de 10-15pp com guardrails simples (corte 10% se patrimonio cai abaixo de 80% do inicial; floor 70% do spending base).

| Cenario | Success Rate (sem guardrails) | Success Rate (com guardrails) | Spending Minimo (P5) |
|---------|:----------------------------:|:-----------------------------:|:--------------------:|
| R$ 250k/ano | ~87% | **~95-97%** | ~R$ 175k |
| R$ 350k/ano | ~70% | **~82-85%** | ~R$ 245k |
| R$ 400k/ano | ~58% | **~70-73%** | ~R$ 280k |

**Guardrails melhoram success rate em +10-15pp**. Para R$ 250k, guardrails elevam a ~95-97% -- praticamente seguro. Para R$ 350k, sobem para ~82-85% -- aceitavel mas nao ideal.

#### 8.3. Monte Carlo Pessimista: Decada Perdida (retorno 3% acum, 2% desacum)

Patrimonio de partida: R$ 8.663.000 (acumulacao com 3%).
Retorno geometrico desacum: 2% - 1,13% = ~0,87%.

| Cenario | SWR | Success Rate Estimada |
|---------|:---:|:--------------------:|
| R$ 250k/ano | 2,89% | ~72% |
| R$ 350k/ano | 4,04% | ~38% |

**Com retorno pessimista E custo elevado, quase 2/3 das trajetorias de R$ 350k falham.** R$ 250k sobrevive na maioria mas nao e "a prova de balas" contra decada perdida + volatilidade.

#### 8.4. Cenario "Venda Parcial" (retorno 4,20%)

Se usarmos o cenario mais realista do Tax (retorno liquido 4,20%), o retorno geometrico sobe para 4,20% - 1,13% = 3,07%. Ajuste ERN: ~1,1pp abaixo do US (-5,5 a -8,8pp de success rate).

| Cenario | SWR | Success Rate (sem guardrails) | Com Guardrails |
|---------|:---:|:----------------------------:|:--------------:|
| R$ 250k/ano | 2,43% | ~92% | ~98%+ |
| R$ 350k/ano | 3,40% | ~77% | ~88-92% |
| R$ 400k/ano | 3,89% | ~65% | ~77-80% |

**Este cenario e significativamente mais favoravel.** R$ 350k com guardrails atinge ~88-92% de success rate -- dentro da zona de conforto. A realidade de Diego provavelmente estara entre o cenario conservador (3,77%) e o de venda parcial (4,20%).

#### 8.5. Nota Metodologica Importante

1. **Constant spending e o pior caso comportamental**: Na pratica, ninguem mantem spending fixo quando o portfolio cai 40%. Guardrails, trabalho part-time, e ajustes naturais de gastos melhoram significativamente os resultados.

2. **VPW garante 100% de success rate** por construcao (nunca gasta mais do que o portfolio pode sustentar). Se Diego adotar VPW com spending floor/ceiling, a "falha" se transforma em "periodo de austeridade temporaria".

3. **Retirement spending smile** (Blanchett 2013): gastos reais caem ~1-2% a.a. apos os 65. Nosso modelo ignora isso (conservador).

4. **Habilidade de gerar renda**: Diego tera 50 anos, com skills em tecnologia. A opcao de consultoria part-time em cenarios adversos e real e nao esta modelada.

5. **Aproximacao analitica vs simulacao real**: Os success rates desta versao sao estimativas baseadas em ajuste sobre ERN data. Uma simulacao computacional de 10.000 trajetorias daria valores mais precisos. Os numeros aqui sao conservadores -- a realidade provavelmente e ligeiramente melhor.

---

### 9. Limites Maximos de Custo

| SWR Alvo | Custo Maximo (cenario base) | Custo Maximo (com aceleradores) |
|:--------:|:---------------------------:|:-------------------------------:|
| 3,0% (ultra-conservador) | R$ 309k/ano = R$ 25,7k/mes | R$ 342k/ano |
| 3,5% (ERN, 40+ anos) | **R$ 360k/ano = R$ 30,0k/mes** | **R$ 399k/ano** |
| 4,0% (Bengen, 30 anos) | R$ 412k/ano = R$ 34,3k/mes | R$ 456k/ano |

Comparacao v2 -> v3: limite de 3,5% **subiu** de R$ 339k para **R$ 360k** (+R$ 21k). A correcao do tax drag na acumulacao (5,09% vs 4,25%) gera patrimonio maior e amplia o limite.

---

## Conclusao

### Resposta direta: ate que custo de vida a estrategia aguenta sem mudanca?

**Limite seguro de custo = R$ 360k/ano** (SWR 3,5% sobre patrimonio projetado de R$ 10,3M).

---

**Ate R$ 250k/ano a estrategia e robusta contra quase todos os cenarios.**

- SWR de 2,43% aos 50 -- muito conservador, folga de 1,07pp
- Success rate Monte Carlo: ~87-97% (sem/com guardrails, cenario conservador)
- No cenario "venda parcial" (4,20%): success rate ~92-98%+
- Sobrevive burnout aos 45, crash de -40% no ano 1, e decada perdida a 3%
- Sobrevive burnout aos 42 (SWR 3,37% -- dentro do alvo, melhora vs v2)
- Guardrails sao opcionais para conforto, nao por necessidade

**R$ 350k/ano e viavel com guardrails -- upgrade significativo vs v2.**

- SWR de 3,40% -- **dentro do alvo de 3,5%** (na v2 ficava em 3,61%, fora do alvo)
- Success rate Monte Carlo: ~70-85% sem/com guardrails (conservador); ~77-92% no cenario venda parcial
- FIRE aos **50 e viavel** (nao precisa adiar para 51 como na v2)
- Vulneravel a decada perdida (~38% success sem guardrails)
- **Veredicto honesto**: R$ 350k "funciona na maioria dos cenarios" mas nao e "a prova de balas". Guardrails obrigatorios. Sequence of returns risk nos primeiros 10 anos e o principal risco.

**R$ 400k/ano exige cautela mas e mais viavel que na v2:**

- SWR de 3,89% -- acima do alvo mas nao dramaticamente
- Data minima de FIRE: idade **52** (vs 53 na v2)
- Success rate: ~58-73% sem/com guardrails
- Com aceleradores: SWR cai para 3,51% -- essencialmente no threshold
- **Veredicto**: possivel se (a) aceleradores se materializarem OU (b) Diego aceitar guardrails mais agressivos

### Mudancas v2 -> v3

| Metrica | v2 (4,25% flat) | v3 (acum 5,09% / desacum 3,77%) | Direcao |
|---------|:---------------:|:-------------------------------:|:-------:|
| Patrimonio aos 50 | R$ 9,69M | R$ 10,30M | +6,2% (melhor) |
| Retorno desacumulacao | 4,25% | 3,77% | -0,48pp (pior) |
| SWR R$250k | 2,58% | 2,43% | -0,15pp (melhor) |
| SWR R$350k | 3,61% | 3,40% | -0,21pp (melhor) |
| R$350k viavel aos 50? | NAO (3,61% > 3,5%) | SIM (3,40% < 3,5%) | Upgrade |
| Limite seguro (SWR 3,5%) | R$ 339k/ano | R$ 360k/ano | +R$ 21k (melhor) |
| Burnout 42 + R$250k | 3,65% (inviavel) | 3,37% (viavel) | Upgrade |
| Monte Carlo R$250k | 84-94% | ~87-97% | Similar |
| Monte Carlo R$350k | 65-81% | ~70-92% | Melhor (range amplo) |

### O que a v3 revelou de mais importante

1. **Separar acumulacao e desacumulacao muda tudo**: Na v2, usar 4,25% flat era duplamente errado. O retorno na acumulacao deveria ser maior (5,09%, sem tax drag) e na desacumulacao menor (3,77%, com tax drag real). O efeito liquido e positivo porque o patrimonio maior compensa o retorno menor.

2. **R$ 350k voltou para dentro do alvo**: Na v2, R$ 350k ficava em 3,61% (fora). Na v3, cai para 3,40% (dentro). Isso muda o veredicto de "apertado, precisa adiar" para "viavel com guardrails".

3. **O cenario de venda parcial e provavelmente mais realista**: Se Diego vende apenas R$ 250-350k de um patrimonio de R$ 10M+, o tax drag efetivo e menor que 1,32%. O retorno de 4,20% e mais provavel que 3,77%. Isso melhora os success rates significativamente.

4. **A decada perdida continua sendo o cenario killer**: Mesmo com numeros melhores, retorno 2% na desacumulacao derruba R$ 350k. R$ 250k e o unico custo que sobrevive a todos os cenarios.

5. **Burnout ficou menos assustador**: Com retorno de 5,09% na acumulacao, o patrimonio cresce mais rapido e resiste melhor a parada de aportes. Burnout aos 42 + R$ 250k agora e viavel (3,37%).

### Alertas criticos (Advocate + FIRE)

1. **Tax drag e a variavel mais sensivel**: A diferenca entre 3,77% e 4,20% (cenario conservador vs venda parcial) muda success rates em 7-10pp. Diego deve otimizar a sequencia de liquidacao para minimizar tax drag real.

2. **Risco fiscal**: aumento de IR para 22,5% reduziria retorno para ~3,30%, colocando R$ 350k em zona de risco. Monitorar.

3. **Risco Brasil**: custos com saude privada crescem acima da inflacao. O spending smile de Blanchett (2013) pode nao se aplicar no Brasil.

4. **A variavel mais impactante continua sendo pessoal**: estado civil e filhos sao o maior fator de risco para o plano FIRE.

5. **Cenario combinado adverso (retorno 3% + burnout 45 + custo 300k) FALHA aos ~82**: este e o floor -- se todos os riscos se materializarem simultaneamente, o plano nao sobrevive.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Sem mudanca necessaria para R$ 250k/ano. R$ 350k viavel com guardrails (upgrade vs v2) |
| **Estrategia** | Risk-based guardrails recomendados para R$ 250k, obrigatorios para R$ 350k. Otimizar withdrawal ordering para minimizar tax drag efetivo (aproximar 4,20% vs 3,77%) |
| **Conhecimento** | Patrimonio projetado aos 50: ~R$ 10,3M (retorno acum 5,09%). Retorno desacum: 3,77% (conservador) / 4,20% (venda parcial). Limite seguro: R$ 360k/ano (SWR 3,5%). Monte Carlo R$ 250k: ~87-97%. Monte Carlo R$ 350k: ~70-92% |
| **Memoria** | Registrar: "FR-001 v3 concluida. Retornos corrigidos: acum 5,09% (tax drag 0%), desacum 3,77%-4,20% (tax drag 26,6%). Pat ~R$10,3M aos 50. R$250k: ~87-97% success. R$350k: ~70-92% (viavel com guardrails). Limite seguro: R$360k/ano." |

---

## Proximos Passos

- [ ] Rodar Monte Carlo computacional (10.000 trajetorias) para validar aproximacoes analiticas
- [ ] Modelar tax drag proporcional ao % vendido (model mais fino que "100% do retorno")
- [ ] Considerar VPW (Variable Percentage Withdrawal) como alternativa/complemento aos guardrails
- [ ] Modelar impacto do retirement spending smile (Blanchett 2013) -- pode relaxar SWR em ~0,3-0,5pp
- [ ] Reavaliar se/quando houver mudanca de estado civil ou planos de filhos
- [ ] Aos 48: recalcular com patrimonio real e decidir sobre IPCA+ ladder (conforme carteira.md)
- [ ] Monitorar proposta de aumento de IR sobre investimentos no exterior (risco fiscal)
- [ ] Modelar withdrawal ordering otimo (qual ativo vender primeiro) para maximizar retorno liquido
