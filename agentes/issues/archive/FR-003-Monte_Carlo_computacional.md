# FR-003-Monte_Carlo_computacional: Monte Carlo computacional com parametros reais

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-003-Monte_Carlo_computacional |
| **Dono** | 04 FIRE |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 10 Advocate, 02 Factor, 03 Renda Fixa |
| **Dependencias** | HD-006 (premissas finais) |
| **Criado em** | 2026-03-20 |
| **Origem** | Revalidacao profunda (Advocate 2026-03-20) |
| **Concluido em** | 2026-03-22 |

---

## Motivo / Gatilho

> FR-001 usou aproximacoes analiticas para Monte Carlo. O Advocate identificou que nunca foi rodado um Monte Carlo computacional real com 10.000 trajetorias. A projecao de R$10,3M aos 50 e uma estimativa pontual sem distribuicao de probabilidades. Precisamos de numeros reais.

---

## Descricao

> Rodar simulacao Monte Carlo computacional com parametros calibrados da carteira real de Diego. Objetivo: obter distribuicao de probabilidades do patrimonio aos 50 e success rate do FIRE com diferentes withdrawal rates.

---

## Escopo

- [x] Definir parametros: retorno esperado por asset class (equity, IPCA+, Renda+, crypto), volatilidade, correlacoes
- [x] Calibrar com dados historicos reais (nao assumir normalidade — fat tails)
- [x] Simular 10.000 trajetorias de acumulacao (2026-2037)
- [x] Simular 10.000 trajetorias de desacumulacao (2037-2082, 45 anos)
- [x] Testar cenarios: R$250k, R$300k, R$350k, R$400k custo de vida
- [x] Testar com e sem guardrails (Kitces & Fitzpatrick risk-based)
- [x] Testar com e sem bond tent (48-53)
- [x] Reportar: percentis 5/25/50/75/95, success rate, worst-case patrimonio
- [x] Comparar com aproximacoes de FR-001 — quao longe estavam?

---

## Analise

### Metodologia

- **10,000 trajetorias** com seed fixa (42) para reproducibilidade
- **Fat tails**: t-distribution df=5 (Cont 2001, "Empirical properties of asset returns"). NAO assume normalidade
- **Correlacoes**: Equity-IPCA+ 0.1, Equity-Cripto 0.3, IPCA+-Renda+ 0.5
- **Retornos geometricos**: mu_g = mu_a - sigma^2/2 (conversao aritmetico -> geometrico)
- **Script**: `dados/monte_carlo_fr003.py`

### Premissas (HD-006 final, 2026-03-22)

| Parametro | Valor | Fonte |
|-----------|-------|-------|
| Patrimonio inicial | R$ 3,482,633 | carteira.md |
| Aporte anual | R$ 300,000 | carteira.md |
| Equity return real BRL | 5.89% | HD-006: DMS 2025 + factor premiums + dep BRL 0.5% |
| Equity volatilidade | 16% | DMS: equity global ~16% |
| IPCA+ return HTM | 6.0% | HD-006: 7.16% bruto, IR sobre nominal, 14a |
| IPCA+ volatilidade | 5% | MtM, irrelevante para HTM |
| Cripto return | 5.0% | Estimativa conservadora |
| Cripto volatilidade | 60% | Crypto historico |
| Renda+ return | 5.34% | Proxy conservador |
| Renda+ volatilidade | 15% | Duration 43.6 |
| Alocacao | 79% eq / 15% IPCA+ / 3% cripto / 3% Renda+ | HD-006 |
| Desacum conservador | 4.57% real liquido | IR 15% sobre nominal (100% vendido) |
| Desacum venda parcial | 5.00% real liquido | Venda fracao, maior parte diferida |
| Desacum volatilidade | 15% | Equity dominante pos-50 |
| Fat tails | t-distribution df=5 | Cont (2001) |

### Guardrails modelados (Kitces & Fitzpatrick 2024)

| Drawdown | Corte na retirada |
|----------|-------------------|
| 0-15% | 0% (retirada normal) |
| 15-25% | -10% |
| 25-35% | -20% |
| >35% | Piso R$ 180k |
| Upside >25% acima do pico | +10% (permanente, teto R$ 350k) |

---

### 1. Patrimonio aos 50 (Distribuicao)

| Percentil | Valor |
|-----------|-------|
| **P5 (pessimista)** | **R$ 5,877,586** |
| P25 (conservador) | R$ 8,266,785 |
| **P50 (mediana)** | **R$ 10,563,298** |
| P75 (favoravel) | R$ 13,566,660 |
| P95 (otimista) | R$ 19,646,983 |
| Media | R$ 11,476,415 |
| Deterministico (FR-001 v4) | R$ 10,958,429 |
| Desvio padrao | R$ 5,149,851 |

| Probabilidade | Threshold |
|---------------|-----------|
| P(>= R$ 10M) | **56.0%** |
| P(>= R$ 8M) | **77.8%** |
| P(>= R$ 6M) | **94.4%** |

**Interpretacao**: A mediana (R$ 10.56M) esta proxima do deterministico (R$ 10.96M). A media e mais alta (R$ 11.48M) por conta da skewness positiva (fat tails geram upside extremo). **94% de chance de ter pelo menos R$ 6M aos 50** — mesmo no cenario pessimista, o plano nao colapsa.

O desvio padrao de R$ 5.1M e grande — reflete a volatilidade real de 11 anos com 79% equity + cripto. O P5 de R$ 5.88M ainda permitiria SWR de 4.25% a R$250k (viavel com guardrails).

---

### 2. Success Rates da Desacumulacao

#### Cenario Conservador (retorno liquido 4.57%)

| Custo/ano | SEM guardrails | COM guardrails | Delta |
|-----------|:--------------:|:--------------:|:-----:|
| R$ 250k | **81.4%** | **90.9%** | +9.5pp |
| R$ 300k | 72.7% | 88.8% | +16.1pp |
| R$ 350k | 63.6% | 87.1% | +23.5pp |
| R$ 400k | 55.2% | 85.6% | +30.4pp |

#### Cenario Venda Parcial (retorno liquido 5.00%)

| Custo/ano | SEM guardrails | COM guardrails | Delta |
|-----------|:--------------:|:--------------:|:-----:|
| R$ 250k | **85.4%** | **92.8%** | +7.4pp |
| R$ 300k | 76.8% | 91.3% | +14.5pp |
| R$ 350k | 68.7% | 89.7% | +21.0pp |
| R$ 400k | 59.6% | 88.3% | +28.7pp |

#### P5 do patrimonio (piores 5% das trajetorias)

| Custo/ano | P5 aos 70 (conserv, com guard) | P5 aos 95 |
|-----------|:------------------------------:|:---------:|
| R$ 250k | R$ 2,216,953 | R$ 0 |
| R$ 300k | R$ 1,938,062 | R$ 0 |
| R$ 350k | R$ 1,700,303 | R$ 0 |
| R$ 400k | R$ 1,588,256 | R$ 0 |

**Nota**: P5 aos 95 = 0 em todos os cenarios significa que os piores 5% das trajetorias falham antes dos 95 anos. Porem, a mediana aos 95 mostra patrimonio robusto (R$ 8-24M). O risco esta na cauda esquerda (fat tails).

---

### 3. SWR Implicito (baseado na distribuicao de patrimonio aos 50)

| Custo/ano | SWR mediano | P5 (otimista) | P95 (pessimista) |
|-----------|:-----------:|:-------------:|:----------------:|
| R$ 250k | **2.37%** | 1.27% | 4.25% |
| R$ 300k | 2.84% | 1.53% | 5.10% |
| R$ 350k | **3.31%** | 1.78% | 5.95% |
| R$ 400k | 3.79% | 2.04% | 6.81% |

**Interpretacao**: O SWR mediano de R$250k (2.37%) e ultra-conservador. R$350k (3.31%) fica abaixo do threshold de 3.5% na mediana. No P95 (patrimonio mais baixo), R$250k ja fica em 4.25% — na zona de risco.

---

### 4. Comparacao FR-001 (analitico) vs FR-003 (Monte Carlo)

| Custo/ano | FR-001 (analitico) | FR-003 (MC, sem guard) | Delta |
|-----------|:------------------:|:----------------------:|:-----:|
| R$ 250k | ~87% | **81.4%** | **-5.6pp** |
| R$ 350k | ~70% | **63.6%** | **-6.4pp** |
| R$ 400k | ~58% | **54.6%** | **-3.4pp** |

**FR-001 superestimava success rates em 3-6pp.** Causa: aproximacao analitica nao captura fat tails (t-distribution df=5 gera drawdowns mais severos que normal). A heuristica de FR-001 era conservadora mas nao o suficiente.

**Com guardrails**, porem, o MC mostra numeros MELHORES que FR-001 estimava para custos altos: R$350k com guardrails = 87.1% (MC) vs ~82-85% (FR-001). Guardrails sao mais eficazes do que a heuristica previa.

---

### 5. Stress: Decada Perdida

Premissa: retorno 3% na acumulacao, 2% na desacumulacao, vol 20%.

| Metrica | Valor |
|---------|-------|
| Patrimonio P5 aos 50 | R$ 4,124,227 |
| Patrimonio mediana aos 50 | R$ 8,135,056 |

| Custo/ano | SR sem guardrails | SR com guardrails |
|-----------|:-----------------:|:-----------------:|
| R$ 250k | **31.7%** | **42.6%** |
| R$ 350k | 18.4% | 38.4% |

**Decada perdida e devastadora**: mesmo R$250k com guardrails tem apenas 42.6% de success rate. FR-001 estimava ~72% — estava **muito otimista** para este cenario. Fat tails + retorno baixo + vol alta = combinacao letal.

**Implicacao**: se Diego entrar em FIRE durante uma decada perdida, o plano exige adaptacao radical (renda part-time, corte para piso, ou adiamento). Guardrails ajudam (+11pp para R$250k), mas nao salvam sozinhos.

---

### 6. Bond Tent (IPCA+ 2040 vence aos 53)

| Custo/ano | Sem tent (guardrails) | Com tent (guardrails) | Delta |
|-----------|:---------------------:|:---------------------:|:-----:|
| R$ 250k | 90.8% | 90.9% | **+0.1pp** |
| R$ 350k | 87.2% | 87.3% | **+0.1pp** |

**Bond tent tem impacto desprezivel na simulacao.** Razao: com 15% em IPCA+ por apenas 3 anos, a reducao de volatilidade (de 15% para ~13.8%) e marginal. O tent natural de Diego (IPCA+ 2040 que vence aos 53) protege mas nao muda o jogo.

**Nota**: O valor real do IPCA+ 2040 esta no retorno garantido (6.0% real liquido) e no cash flow previsivel, nao na reducao de SoRR.

---

## Conclusao

### Resultados-chave

1. **Patrimonio mediano aos 50: R$ 10.56M** — alinhado com deterministico (R$ 10.96M). Dispersao alta: P5 R$ 5.88M a P95 R$ 19.65M

2. **R$ 250k com guardrails: ~91% success rate** — robusto. FR-001 estimava ~95-97%, MC mostra ~91%. Ainda dentro da zona segura

3. **R$ 350k com guardrails: ~87% success rate** — viavel. FR-001 estimava ~82-85%, MC mostra ~87%. Guardrails mais eficazes do que o estimado

4. **FR-001 superestimava em 3-6pp sem guardrails**, mas subestimava guardrails para custos altos. Net effect: FR-001 era razoavel, nao estava dramaticamente errado

5. **Decada perdida e o cenario killer**: success rates caem para 30-40%. Fat tails tornam isso PIOR que FR-001 estimava. Unica defesa: renda part-time ou corte radical

6. **Bond tent (IPCA+ 2040) nao muda success rate** de forma mensuravel. Valor esta no retorno garantido, nao na protecao de SoRR

### Veredicto por custo de vida

| Custo | SWR mediano | SR com guardrails (conserv) | Veredicto |
|-------|:-----------:|:---------------------------:|-----------|
| R$ 250k | 2.37% | **90.9%** | SEGURO. Folga ampla. Over-saved para este custo |
| R$ 300k | 2.84% | **88.8%** | VIAVEL. Boa margem |
| R$ 350k | 3.31% | **87.1%** | VIAVEL com guardrails obrigatorios |
| R$ 400k | 3.79% | **85.6%** | MARGINAL. Guardrails agressivos + renda part-time como backup |

### Calibracao critica

O MC usa cenario conservador (4.57%) que assume venda de 100% do retorno. Na pratica, Diego vende fracao (cenario venda parcial, 5.00%), que daria:
- R$ 250k: **92.8%**
- R$ 350k: **89.7%**

A realidade estara entre os dois cenarios. Margem confortavel para R$ 250-300k. R$ 350k viavel. R$ 400k arriscado.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Sem mudanca necessaria. 79% equity / 15% IPCA+ / 3% cripto validado |
| **Estrategia** | Guardrails sao OBRIGATORIOS para R$ 300k+ (delta de +16-30pp). Decada perdida exige plano B (FIRE-002). Bond tent e irrelevante para SoRR |
| **Conhecimento** | Patrimonio mediano R$ 10.56M. SR 91% (R$250k) / 87% (R$350k) com guardrails. FR-001 errava 3-6pp sem guardrails mas acertava direcao. Fat tails tornam decada perdida 30pp pior que estimado |
| **Memoria** | Registrar: "FR-003 Done. MC 10k trajetorias, t-dist df=5. Pat mediano R$10.56M. SR R$250k: 91% (guard), R$350k: 87% (guard). FR-001 errava 3-6pp sem guard, acertava com guard. Decada perdida: 31-43% (pior que FR-001). Bond tent: +0.1pp (irrelevante)" |

---

## Proximos Passos

- [ ] Registrar na memoria dos agentes FIRE e Head
- [ ] Atualizar FR-001 com nota de validacao ("MC confirmou: success rates razoaveis, fat tails penalizam 3-6pp sem guardrails")
- [ ] FIRE-002 (Plano B perda de renda) torna-se MAIS urgente — decada perdida sem plano B e inviavel
- [ ] FR-005 (FIRE bands custo R$300-400k) pode ser simplificada com dados do MC
- [ ] Considerar rodar MC com retornos desfavoraveis (dep BRL 0%) e favoraveis (dep BRL 1.5%)
