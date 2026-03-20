# RF-003: Duration Risk de Renda+ 2065 em Regime de Inflacao

## Status: Concluida
## Data: 2026-03-20
## Responsaveis: 03 RF (lead), 08 Macro, 10 Advocate
## Prioridade: Alta

## Contexto

Renda+ 2065 tem duration de 43.6 -- extremamente sensivel a movimentos de taxa. O curso Chicago Booth (David & Veronesi 2013) mostra que em regime de alta inflacao, correlacao stock-bond fica POSITIVA: bonds e stocks caem juntos. Isso significa que Renda+ 2065 NAO seria hedge em cenario inflacionario -- amplificaria perdas.

Diego tem 3.2% da carteira (R$112k) em Renda+ 2065 a taxa media de ~6.87%. Taxa atual em marco 2026: IPCA+ 7.02-7.10%. Gatilho de compra (>=6.5%) esta ativo. A pergunta central: devemos continuar comprando?

---

## 1. Modelagem de Cenarios de Taxa no PU

### Parametros

- **Taxa atual (base)**: IPCA+ 7.10%
- **Duration modificada**: 43.6
- **Convexidade estimada**: ~1,657 (para zero-coupon-like bond: D^2 / (1+y)^2 = 43.6^2 / 1.071^2)

### Formula

DP/P = -Duration x Dy + 0.5 x Convexity x (Dy)^2

### Cenarios

| Cenario | Taxa | Dy (pp) | Efeito Duration | Efeito Convexidade | Variacao PU | Interpretacao |
|---------|------|---------|-----------------|-------------------|-------------|---------------|
| **Venda (gatilho)** | 6.0% | -1.10% | +48.0% | +1.0% | **+49.0%** | Gatilho de venda. Ganho bruto ~49%, liquido ~41.6% (IR 15%) |
| **Bull moderado** | 5.0% | -2.10% | +91.6% | +3.7% | **+95.2%** | Quase dobra. Cenario de convergencia para media historica |
| **Bear moderado** | 8.0% | +0.90% | -39.2% | +0.7% | **-38.6%** | Piora fiscal moderada. Perda de quase 40% |
| **Bear severo** | 9.0% | +1.90% | -82.8% | +3.0% | **-79.8%** | Crise fiscal. Perda cataclismica |
| **Panico** | 10.0% | +2.90% | -126.4% | +7.0% | **-119.5%** | Matematicamente >100% = ruina do PU (floor perto de zero) |

### Notas criticas sobre os cenarios de alta

- A formula linear + convexidade e uma **aproximacao**. Para movimentos grandes (>2pp), o preco real diverge da formula. Na pratica:
  - A 9.0%, a perda real seria algo como **-55% a -65%** (nao -80%), porque convexidade protege mais do que a aproximacao quadratica sugere
  - A 10.0%, a perda seria **-65% a -75%** (nao -120%)
- Para maior precisao, usei a formula de repricing direto: PU_novo/PU_atual = ((1+y_atual)/(1+y_novo))^Duration_Macaulay

### Repricing direto (formula exata para zero-coupon)

PU_novo/PU_atual = (1.071 / (1+y_novo))^43.6

| Cenario | Taxa | PU_novo / PU_atual | Variacao % |
|---------|------|--------------------|------------|
| 6.0% | 6.0% | (1.071/1.060)^43.6 = 1.0104^43.6 | **+57.0%** |
| 5.0% | 5.0% | (1.071/1.050)^43.6 = 1.020^43.6 | **+137.4%** |
| 8.0% | 8.0% | (1.071/1.080)^43.6 = 0.9917^43.6 | **-30.4%** |
| 9.0% | 9.0% | (1.071/1.090)^43.6 = 0.9826^43.6 | **-53.0%** |
| 10.0% | 10.0% | (1.071/1.100)^43.6 = 0.9736^43.6 | **-68.5%** |

> **A formula exata e mais confiavel para movimentos grandes.** Uso esta daqui para frente.

### Resumo final de cenarios (formula exata)

| Cenario | Taxa | Variacao PU | Impacto em R$ (base R$112k) | Impacto na carteira (3.2%) |
|---------|------|-------------|-----------------------------|-----------------------------|
| Bull forte | 5.0% | **+137%** | +R$153.9k | Seria ~7.6% da carteira |
| **Gatilho venda** | **6.0%** | **+57%** | **+R$63.8k** | Ganho bruto. Liq (IR 15%): **+R$54.3k (+48.5%)** |
| Base | 7.1% | 0% | R$0 | Status quo |
| Bear moderado | 8.0% | **-30%** | -R$33.6k | Carteira perde ~1.0% |
| **Bear severo** | **9.0%** | **-53%** | **-R$59.4k** | **Carteira perde ~1.7%** |
| **Panico** | **10.0%** | **-69%** | **-R$76.7k** | **Carteira perde ~2.2%** |

---

## 2. Correlacao Stock-Bond em Regime de Inflacao

### Framework teorico: David & Veronesi (2013)

- Em regime de **medo de inflacao** (1970s-80s, 2022-23): correlacao stock-bond **POSITIVA**. Bonds e stocks caem juntos. 60/40 falha.
- Em regime de **medo de deflacao** (2000s-2010s): correlacao **NEGATIVA**. Bonds sobem quando stocks caem. Hedge funciona.
- O regime e determinado por como o mercado interpreta sinais inflacionarios: se inflacao sinaliza fraqueza economica futura (deflation fear) vs. erosao de poder de compra (inflation fear).

### Brasil em marco 2026

- **Selic**: 14.75% (corte de 0.25pp em 18/mar/2026, primeiro corte desde mai/2024)
- **IPCA 12m**: 3.81% (dentro da meta, abaixo do teto de 4.5%)
- **Expectativas**: mercado projeta IPCA 4.06% para 2026, Selic terminal ~12.25%
- **Taxas reais longas**: IPCA+ 7%+ (NTN-B 2045 e Renda+ 2065)

**Diagnostico de regime**: O Brasil esta em transicao. A inflacao corrente esta controlada (3.81%), mas as taxas reais longas em 7%+ precificam **premio de risco fiscal elevado**, nao inflacao corrente. O mercado teme:
1. Trajetoria da divida publica
2. Risco de dominancia fiscal futura
3. Incerteza sobre arcabouco fiscal pos-2026

Este e um regime MISTO: inflacao controlada no curto prazo, mas risco fiscal no longo prazo sustenta taxas reais historicamente altas. A correlacao stock-bond tende a ser **positiva** neste ambiente -- se o cenario fiscal piorar, TANTO equity BR quanto bonds longos cairao juntos.

### Evidencia historica brasileira

**2013 (Taper Tantrum + inicio da crise fiscal):**
- NTN-B longas (2035/2045): taxas subiram de ~4.5% para ~6.5%+ em poucos meses
- Ibovespa: caiu de ~62k para ~47k (-24%)
- **Correlacao positiva**: ambos cairam juntos

**2014-2015 (crise fiscal Dilma):**
- NTN-B longas: taxas subiram acima de 7%
- Ibovespa: caiu de ~51k para ~43k
- **Correlacao positiva novamente**: fiscal risk drive both down

**Marco 2020 (COVID):**
- NTN-B 2045 (sem cupom): **-34% em 30 dias** (fonte: Arena do Pavini)
- Ibovespa: caiu de ~113k para ~63k (-44%)
- **Correlacao fortemente positiva**: liquidity crisis hit everything
- Recuperacao: NTN-B recuperou em semanas/meses conforme BC cortou juros; equity levou mais tempo

**2024 (fiscal scare):**
- NTN-B longas: taxas subiram para 7%+
- Ibovespa: underperformed EM peers significativamente
- **Correlacao positiva**: fiscal risk novamente

### Conclusao sobre correlacao

No Brasil, em **todos os episodios de stress recentes**, a correlacao stock-bond foi **POSITIVA**. Bonds longos brasileiros NAO funcionam como hedge de equity em crise. Isso confirma David & Veronesi (2013) para o caso brasileiro: quando o driver e risco fiscal/inflacionario, ambos caem juntos.

**Implicacao direta**: Renda+ 2065 nao diversifica a carteira de Diego em cenario de stress. Amplifica a direcionalidade.

---

## 3. Risco Especifico da Posicao Tatica

O Renda+ 2065 e posicao **TATICA** -- compra por marcacao a mercado, nao por carrego ate 2065/2084. Isso cria riscos especificos:

### 3.1 Risco de liquidez forçada

- Diego **precisa vender** em algum momento para realizar o ganho
- O Tesouro Direto garante recompra, mas a taxa de mercado no momento da venda determina o PU
- Em crise, o Tesouro pode ampliar spread de recompra (bid-ask), aumentando custo de saida

### 3.2 Assimetria amplificada pela duration

- Duration de 43.6 amplifica TUDO: ganhos E perdas
- **Upside (taxa cai 1.1pp para 6.0%)**: +57% bruto, +48.5% liquido
- **Downside (taxa sobe 1.9pp para 9.0%)**: -53%
- **Ratio upside/downside**: 48.5% / 53% = 0.91x -- **ligeiramente desfavoravel**
- Para comparacao, um titulo com duration 15 teria ratio mais equilibrado

### 3.3 Tempo de recuperacao

Se a taxa sobe para 9% e Diego decide manter pelo carrego (regra atual):
- O carrego e IPCA+6.87% (taxa de compra), o que e excelente
- Mas a **recuperacao do PU** so acontece se taxas caem de volta
- Em 2013-2015, NTN-B longas levaram **2-3 anos** para voltar a niveis anteriores
- Em 2020, recuperaram em **3-6 meses** (BC cortou juros rapidamente)
- Cenario atual: se o driver for fiscal (nao ciclico), a recuperacao pode ser **lenta**

### 3.4 Custo de oportunidade

- Enquanto o capital esta preso em Renda+ 2065 desvalorizado, nao pode ser alocado em equity (que e o foco principal da carteira)
- R$112k representam ~4.5 meses de aportes

---

## 4. Stress Test: Cenario Worst Case

### Cenario: Desancoragem fiscal + inflacao persistente

**Premissas:**
- Gastos publicos fora de controle pos-eleicoes
- IPCA sobe para 6-8%
- Selic volta a subir para 16-17%
- Taxa real do Renda+ 2065 vai a 9-10%

**Impacto na posicao:**

| Metrica | Taxa a 9% | Taxa a 10% |
|---------|-----------|------------|
| Perda no PU | -53% | -69% |
| Perda em R$ | -R$59.4k | -R$76.7k |
| Valor residual | R$52.6k | R$35.3k |
| Impacto na carteira total | -1.7% | -2.2% |
| Meses de aporte perdidos | 2.4 | 3.1 |

**Tempo para recuperacao:**
- Se taxas revertessem para 7% em 3 anos: carrego de IPCA+6.87% + recuperacao do PU = retorno total positivo
- Se taxas ficassem em 9%+ por 5+ anos (cenario japao-invertido / dominancia fiscal): capital efetivamente preso com retorno inferior ao equity

**Correlacao com equity no cenario:**
- Se Ibovespa tambem cai 20-30% (como em 2013-2015), a carteira total de Diego perderia:
  - Equity (-25% x 89%): -22.3%
  - Renda+ (-53% x 3.2%): -1.7%
  - **Total**: ~-24% ou **-R$836k**
- Renda+ contribui com 7% da perda total, apesar de ser apenas 3.2% da carteira

---

## 5. Avaliacao dos Gatilhos e Recomendacao

### 5.1 Gatilho de venda (taxa <= 6.0%): ADEQUADO

- A 6.0%, o ganho bruto e +57%, liquido +48.5%
- Considerando que NTN-B longas ficaram <= 6.0% em 50.8% dos dias historicos (dado do perfil RF), ha probabilidade razoavel de atingir
- **Recomendacao**: manter gatilho de venda em 6.0%. Sem alteracao.

### 5.2 Gatilho de compra (taxa >= 6.5%): ADEQUADO, MAS COM RESSALVAS

- Taxa atual de 7.10% esta acima do gatilho
- O gatilho em si e razoavel -- 6.5%+ e historicamente raro e oferece bom carrego
- **Ressalva**: a questao nao e o gatilho, e o **teto de alocacao**

### 5.3 Teto de alocacao (5%): **REDUZIR PARA 3.5%**

Esta e a recomendacao central desta issue.

**Racional:**

1. **Duration risk e desproporcional**: com duration 43.6, cada 1% da carteira em Renda+ 2065 se comporta como ~4.4% em risco efetivo. A 5%, seria como ter ~22% de risco direcional em taxas reais -- incompativel com uma carteira 89% equity
2. **Correlacao positiva em stress**: Renda+ NAO diversifica. Adiciona risco direcional na mesma direcao do equity em cenarios de stress fiscal
3. **Posicao tatica, nao estrutural**: posicoes taticas devem ter tamanho limitado. 3.2% ja e uma boa posicao de trade
4. **Assimetria desfavoravel a niveis maiores**: cada R$1 adicional em Renda+ 2065 tem risco de -53% a -69% vs. upside de +48.5% liquido
5. **Custo de oportunidade**: JPGL esta -19.7% underweight. Cada R$25k em Renda+ e R$25k que nao vai para equity, que tem expectativa de retorno superior nos proximos 11 anos
6. **Evidencia SVB**: o curso de Chicago Booth usa o colapso do SVB como case study de duration mismatch. Guardar as proporcoes, o principio e o mesmo: concentrar risco em duration ultra-longa e perigoso

**Por que 3.5% e nao 3.0% ou 2.0%:**
- 3.2% atual esta proximo de 3.5%, permitindo mais uma tranche pequena (~R$10.5k) se Diego quiser
- 3.5% limita a perda maxima em cenario de panico (10%) a **~2.4% da carteira** (~R$84k)
- Abaixo de 3%, o potencial de ganho absoluto fica pouco relevante para justificar a complexidade de monitoramento

### 5.4 DCA adicional: **PARAR**

- Diego ja tem 3.2% (R$112k)
- O teto recomendado e 3.5%, o que permite no maximo mais ~R$10.5k
- **Na pratica: nao vale a pena**. O risco-retorno marginal de adicionar mais R$10k e ruim considerando o custo de oportunidade (JPGL)
- Recomendacao: **parar o DCA em Renda+ 2065**. A posicao de 3.2% esta adequada. Nao comprar mais

### 5.5 Regra de panico (9%+: manter): ADEQUADA COM AJUSTE

- Manter pelo carrego de IPCA+6.87% e correto -- e um yield real excepcional
- Mas adicionar: **se taxa atingir 9%+, nao comprar mais** (mesmo que esteja abaixo do teto)
- O gatilho de compra deve ser desativado em cenario de panico fiscal

---

## 6. Resumo das Decisoes (pendente aprovacao de Diego)

| Item | Antes | Proposta | Racional |
|------|-------|----------|----------|
| Teto de alocacao | 5% | **3.5%** | Duration risk desproporcional; correlacao positiva em stress |
| DCA adicional | Ativo (comprar ate 5%) | **Parar** | 3.2% ja esta proximo do novo teto; custo de oportunidade alto |
| Gatilho de venda | Taxa <= 6.0% | **Manter 6.0%** | Adequado; +48.5% liquido |
| Gatilho de compra | Taxa >= 6.5% | **Manter 6.5%, mas suspender acima de 9%** | Em panico fiscal, nao adicionar risco |
| Regra de panico | Manter se 9%+ | **Manter + nao comprar mais** | Carrego e bom, mas nao aumentar exposicao |

---

## 7. Nota de Autonomia Critica

Devo registrar uma tensao com meu proprio perfil. O perfil RF diz "decisoes TATICAS sobre Renda+ sao do agente 06 Risco. RF so assume Renda+ se aos 48 entrar em ladder estrutural." No entanto, a issue RF-003 me foi atribuida como lead porque o risco central e de **duration** -- que e core expertise de renda fixa.

Minha analise e inequivoca: **a posicao atual de 3.2% esta no limite do que e sensato para um trade tatico com duration 43.6 em uma carteira 89% equity**. O teto de 5% era agressivo demais. O fato de que correlacao stock-bond e positiva em stress no Brasil torna cada ponto percentual adicional em Renda+ um aumento de risco, nao diversificacao.

Se Diego discordar e quiser manter o teto de 5%, peço que registre explicitamente que aceita o risco de perder ate -3.5% da carteira total (~R$122k) em cenario de panico, com correlacao positiva ao equity.

---

## Referencias

### Academicas
- David & Veronesi (2013): "What Ties Return Volatilities to Price Valuations and Fundamentals?" Journal of Political Economy, Vol 121, No 4. Stock-bond correlation e regime-dependent: inflation fear -> positiva
- Brixton, Brooks, Hecht, Ilmanen, Maloney & McQuinn (2023): "Changing stock-bond correlation" (JPM). Correlacao muda drasticamente ao longo do tempo
- Veronesi, Chicago Booth: TN_Day_3B_Bond_Valuation_and_Portfolio_Management. Duration, convexity, SVB case
- Neville, Draaisma, Funnell, Harvey & Van Hemert (2021): Factor performance during inflation

### Dados de mercado (marco 2026)
- Selic: 14.75% (corte de 0.25pp em 18/mar/2026). Fonte: BCB/Copom
- IPCA 12m: 3.81%. Fonte: IBGE
- Renda+ 2065 taxa: IPCA+ 7.02-7.10%. Fonte: Tesouro Direto
- NTN-B 2045 queda COVID mar/2020: -34% em 30 dias. Fonte: Arena do Pavini
- NTN-B taxa >= 7%: apenas 9.69% dos dias (2045 sem cupom). Fonte: InfoMoney/estudo historico

### Historico
- 2013 (taper tantrum): NTN-B longas de ~4.5% para ~6.5%. Ibovespa -24%. Correlacao positiva
- 2014-2015 (crise fiscal): NTN-B longas acima de 7%. Ibovespa queda. Correlacao positiva
- 2020 (COVID): NTN-B 2045 -34% em 30 dias. Ibovespa -44%. Correlacao positiva

---

## Origem
Scan Chicago Booth (HD-003), 2026-03-20
