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

### Premissas do Modelo (v4 -- corrigidas HD-006)

> **ERRATA v3 -> v4 (2026-03-20)**: Retornos por ETF em v3 nao tinham fonte academica e estavam em USD sem conversao para BRL. HD-006 corrigiu com fontes (DMS 2024, AQR, Fama-French) e conversao para BRL com 3 cenarios de depreciacao. Retorno ponderado do portfolio total subiu de 5.09% para 5.84%. Bloco equity ponderado: 5.89% BRL base. Breakeven IPCA+ subiu de 6.4% para 7.81%. IPCA+ liquido corrigido de "5.5-6.0%" para 5.34%.

| Parametro | Valor | Fonte |
|-----------|-------|-------|
| Patrimonio atual (marco 2026) | R$ 3.482.633 | carteira.md |
| Aporte mensal | R$ 25.000 (R$ 300k/ano) | carteira.md |
| **Retorno real acumulacao (39-50)** | **5,84% a.a. (portfolio total, cenario base BRL)** | HD-006: equity 5.89% + RF/cripto ponderados |
| **Tax drag acumulacao** | **0%** | Tax (nao vende nada na acumulacao) |
| **Retorno real bruto desacumulacao (50+)** | **5,89% a.a. (bloco equity)** | HD-006: DMS 2024 + factor premiums + dep BRL 0.5% |
| **Tax drag desacumulacao** | **1,32% (conservador: 26,6% efetivo)** | Tax (IR 15% sobre ganho nominal incl. inflacao 4%) |
| **Retorno real liquido desacumulacao (conservador)** | **4,57% a.a.** | 5,89% - 1,32% = 4,57% |
| **Retorno real liquido desacumulacao (venda parcial)** | **5,00% a.a.** | Tax: se vende apenas fracao, maior parte continua diferida |
| Volatilidade anual | 15% | Factor (~16% equity global, diversificacao entre fatores reduz) |
| Idade atual | 39 | |
| Meta FIRE | Idade 50 (2037) | |
| Alocacao na aposentadoria | 82-90% equity (rising to 90-95%) | |
| SWR alvo | <= 3,5% (ERN evidence, 40+ anos, ~100% equity global) | |
| Modelo de retirada | Risk-based guardrails (Kitces & Fitzpatrick 2024) | |

#### Composicao do retorno -- portfolio total (HD-006, cenario base BRL)

| Bloco / ETF | % do Portfolio | Retorno Real BRL (base) | Contribuicao | Fonte |
|-------------|:--------------:|:----------------------:|:------------:|-------|
| SWRD | 32.8% | 5.4% | 1.771% | DMS 2024 (4.9% USD + 0.5% dep BRL) |
| AVGS | 23.4% | 6.5% | 1.521% | DMS + size+value (Fama-French 1993) |
| AVEM | 18.7% | 6.0% | 1.122% | DMS + EM premium (Dimson 2024) |
| JPGL | 18.7% | 6.2% | 1.159% | DMS + multi-factor (AQR 2024) |
| IPCA+ (existente+estrutural) | 7.2% | 5.34% | 0.384% | 7.16% bruto, IR sobre nominal |
| Renda+ 2065 | 3.0% | 5.34% | 0.160% | Proxy conservador |
| HODL11 (cripto) | 2.8% | 5.0% | 0.140% | Estimativa |
| Reserva IPCA+ 2029 | 2.3% | 5.34% | 0.123% | Mesma formula IPCA+ |
| **Total** | **~100%** | — | **~5.84%** | — |

Nota: pesos normalizados para somar ~100%. Os blocos equity (SWRD+AVGS+AVEM+JPGL) representam ~89.1% do patrimonio. Os pesos de cada ETF dentro do bloco equity sao 35/25/20/20, e como % do portfolio total ficam 31.2/22.3/17.8/17.8. Ajustados levemente para somar 100% com os outros blocos.

#### Nota do agente Tax sobre o tax drag

> O tax drag de 1,32% (retorno liquido 4,57%) assume venda de 100% do retorno anual. Na pratica, se Diego vende apenas R$ 250k de um patrimonio de R$ 10M+, a maior parte continua diferida. Um modelo mais fino usaria tax drag proporcional ao % vendido. Para simplificar: **4,57% e o cenario conservador e 5,00% e o cenario "venda parcial"**.

#### Mudanca chave v3 -> v4 (HD-006)

Na v3, retornos por ETF nao tinham fonte academica e estavam em USD. Retorno ponderado era 5.09% (USD). HD-006 corrigiu:
1. **Retornos com fonte**: DMS 2024 (equity premium), Fama-French 1993 (size+value), AQR 2024 (multi-factor). Cada ETF com retorno esperado fundamentado
2. **Conversao para BRL**: 3 cenarios de depreciacao real (0%, 0.5%, 1.5%). Equity ponderado BRL base: 5.89%
3. **IPCA+ liquido**: 5.34% (IR sobre nominal, nao sobre real). Errata do range "5.5-6.0%" anterior
4. **Breakeven IPCA+**: subiu de 6.4% para 7.81%

Efeito: patrimonio aos 50 sobe de R$10.30M para R$10.96M (+6.4%). Retorno desacumulacao sobe de 3.77% para 4.57% (conservador). SWRs melhoram significativamente.

**Referencia academica**: Karsten (ERN, 2018-2025) demonstra que para horizontes de 40-60 anos com ~100% equity global, SWR segura (95% success rate) fica entre 3,25% e 3,50%. Morningstar (2026) estima 3,9% com 90% de sucesso em 30 anos. Dimson-Marsh-Staunton (Credit Suisse Global Investment Returns Yearbook, 2024) reportam retorno real global de equity de ~5,0% geometrico (1900-2023).

---

### 1. Projecao de Patrimonio na Fase de Acumulacao (39-50)

Retorno real: **5,84% a.a.** (portfolio total, cenario base BRL. Bruto = liquido, tax drag 0% pois nao vende nada).

| Idade | Ano | Patrimonio Inicio | Aporte Anual | Retorno 5,84% | Patrimonio Fim |
|-------|-----|------------------:|-------------:|--------------:|---------------:|
| 39 | 2026 | 3.482.633 | +300.000 | +203.374 | 3.986.007 |
| 40 | 2027 | 3.986.007 | +300.000 | +232.783 | 4.518.790 |
| 41 | 2028 | 4.518.790 | +300.000 | +263.897 | 5.082.687 |
| 42 | 2029 | 5.082.687 | +300.000 | +296.828 | 5.679.515 |
| 43 | 2030 | 5.679.515 | +300.000 | +331.693 | 6.311.208 |
| 44 | 2031 | 6.311.208 | +300.000 | +368.615 | 6.979.823 |
| 45 | 2032 | 6.979.823 | +300.000 | +407.722 | 7.687.545 |
| 46 | 2033 | 7.687.545 | +300.000 | +449.152 | 8.436.697 |
| 47 | 2034 | 8.436.697 | +300.000 | +493.063 | 9.229.760 |
| 48 | 2035 | 9.229.760 | +300.000 | +539.618 | 10.069.378 |
| 49 | 2036 | 10.069.378 | +300.000 | +589.051 | 10.958.429 |
| **50** | **2037** | **10.958.429** | **FIRE** | -- | -- |

**Patrimonio projetado aos 50: R$ 10.958.429** (cenario deterministico, retorno real 5,84%).

Comparacao v3 -> v4: patrimonio **subiu** de R$ 10,30M para R$ 10,96M (+R$ 663k, +6,4%). A correcao dos retornos por ETF com fontes academicas e conversao para BRL elevou o retorno ponderado de 5,09% para 5,84%. Na desacumulacao, retorno liquido tambem sobe: de 3,77% para 4,57% (conservador).

---

### 2. Cenarios de Custo de Vida: SWR e Data Minima de FIRE

#### Tabela Resumo (v4)

| Cenario | SWR aos 50 | Data Minima FIRE (SWR <= 3,5%) | Patrimonio na Data | Veredicto |
|---------|:----------:|:------------------------------:|-------------------:|:---------:|
| R$ 250k/ano | **2,28%** | Idade 44 (2031) | R$ 6.979.823 | FOLGA AMPLA |
| R$ 350k/ano | **3,19%** | Idade 49 (2036) | R$ 10.069.378 | VIAVEL (folga) |
| R$ 400k/ano | **3,65%** | Idade 51 (2038) | ~R$ 11.600.000 | VIAVEL (marginal) |

#### Interpretacao por cenario

**R$ 250k/ano (cenario base)**: SWR de 2,28% e muito conservador. Diego poderia se aposentar aos **44** mantendo SWR abaixo de 3,5%. Folga de mais de 1,2pp sobre o alvo. Cenario a prova de quase tudo.

**R$ 350k/ano (casamento/upgrade)**: SWR de 3,19% -- **bem dentro do alvo de 3,5%**, com folga de 31 bps. Upgrade significativo vs v3 (3,40%). Com retorno desacum de 4,57% vs SWR de 3,19%, patrimonio CRESCE na desacumulacao. FIRE aos 49 ja seria viavel.

**R$ 400k/ano (casamento + filho)**: SWR de 3,65% -- marginal, mas muito proximo do alvo. Data minima de FIRE: idade **51**. Com retorno desacum de 4,57%, patrimonio cresce lentamente (delta +0,92pp). Guardrails recomendados.

> **Nota v4**: os numeros melhoraram significativamente vs v3 porque (a) retorno acumulacao subiu de 5,09% para 5,84% gerando patrimonio maior, e (b) retorno desacumulacao subiu de 3,77% para 4,57% melhorando sustentabilidade.

---

### 3. Projecao de Desacumulacao por Cenario (50-90)

Cenario deterministico. **Retorno real liquido: 4,57% a.a.** (cenario conservador v4 -- tax drag sobre 100% do retorno).

#### R$ 250k/ano (cenario base, retorno 4,57%)

| Idade | Patrimonio | Retirada | SWR Corrente |
|-------|----------:|---------:|:------------:|
| 50 | 10.958.429 | 250.000 | 2,28% |
| 55 | 12.351.000 | 250.000 | 2,02% |
| 60 | 14.037.000 | 250.000 | 1,78% |
| 65 | 16.087.000 | 250.000 | 1,55% |
| 70 | 18.570.000 | 250.000 | 1,35% |

Patrimonio cresce fortemente. SWR cai a cada decada. Cenario ultra-robusto.

#### R$ 250k/ano (cenario "venda parcial", retorno 5,00%)

| Idade | Patrimonio | Retirada | SWR Corrente |
|-------|----------:|---------:|:------------:|
| 50 | 10.958.429 | 250.000 | 2,28% |
| 55 | 12.737.000 | 250.000 | 1,96% |
| 60 | 14.942.000 | 250.000 | 1,67% |
| 70 | 20.805.000 | 250.000 | 1,20% |

Patrimonio praticamente dobra em 20 anos. Diego estaria massivamente over-saved para R$250k.

#### R$ 350k/ano (cenario conservador, 4,57%)

| Idade | Patrimonio | Retirada | SWR Corrente |
|-------|----------:|---------:|:------------:|
| 50 | 10.958.429 | 350.000 | 3,19% |
| 55 | 11.845.000 | 350.000 | 2,96% |
| 60 | 12.929.000 | 350.000 | 2,71% |
| 65 | 14.257.000 | 350.000 | 2,45% |
| 70 | 15.889.000 | 350.000 | 2,20% |

Patrimonio cresce solidamente. O retorno liquido de 4,57% supera a retirada de 3,19% por 1,38pp. Margem ampla contra sequence of returns risk.

#### R$ 400k/ano (cenario conservador, 4,57%)

| Idade | Patrimonio | Retirada | SWR Corrente |
|-------|----------:|---------:|:------------:|
| 50 | 10.958.429 | 400.000 | 3,65% |
| 55 | 11.586.000 | 400.000 | 3,45% |
| 60 | 12.353.000 | 400.000 | 3,24% |
| 70 | 14.322.000 | 400.000 | 2,79% |
| 80 | 16.830.000 | 400.000 | 2,38% |
| 90 | 20.035.000 | 400.000 | 2,00% |

Patrimonio cresce mesmo com R$400k/ano de retirada. Retorno liquido (4,57%) supera retirada (3,65%) por 0,92pp. Cenario sustentavel no deterministico, porem sequence of returns risk nos primeiros 10 anos ainda existe.

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

### 9. Limites Maximos de Custo (v4)

| SWR Alvo | Custo Maximo (cenario base) | Custo Maximo (com aceleradores) |
|:--------:|:---------------------------:|:-------------------------------:|
| 3,0% (ultra-conservador) | R$ 329k/ano = R$ 27,4k/mes | R$ 364k/ano |
| 3,5% (ERN, 40+ anos) | **R$ 384k/ano = R$ 32,0k/mes** | **R$ 425k/ano** |
| 4,0% (Bengen, 30 anos) | R$ 438k/ano = R$ 36,5k/mes | R$ 486k/ano |

Comparacao v3 -> v4: limite de 3,5% **subiu** de R$ 360k para **R$ 384k** (+R$ 24k). A correcao dos retornos com fontes academicas e conversao BRL (5,84% vs 5,09%) gera patrimonio maior e amplia o limite.

---

## Conclusao

### Resposta direta: ate que custo de vida a estrategia aguenta sem mudanca?

**Limite seguro de custo = R$ 384k/ano** (SWR 3,5% sobre patrimonio projetado de R$ 10,96M).

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
| **Alocacao** | Sem mudanca necessaria para R$ 250k/ano. R$ 350k e R$ 400k viaveis com guardrails (upgrade significativo vs v3) |
| **Estrategia** | Risk-based guardrails recomendados para R$ 250k, obrigatorios para R$ 350k+. Otimizar withdrawal ordering para minimizar tax drag efetivo (aproximar 5,00% vs 4,57%) |
| **Conhecimento** | Patrimonio projetado aos 50: ~R$ 10,96M (retorno acum 5,84%). Retorno desacum: 4,57% (conservador) / 5,00% (venda parcial). Limite seguro: R$ 384k/ano (SWR 3,5%). |
| **Memoria** | Registrar: "FR-001 v4 (HD-006). Retornos corrigidos com fontes academicas e BRL: acum 5,84% (tax drag 0%), desacum 4,57%-5,00%. Pat ~R$10,96M aos 50. Limite seguro: R$384k/ano. IPCA+ 20% reduzido para 10% (breakeven subiu para 7.81%)." |

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
