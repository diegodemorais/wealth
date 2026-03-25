# Literatura Contrária — Referência do Cético

> Biblioteca de papers e autores que desafiam as teses centrais da carteira.
> Fonte primária do agente 17-cetico.
> Atualizar quando novo paper relevante for encontrado.

---

## Tese: Factor premiums são reais e persistem

### Contra: São majoritariamente data mining

- **Harvey, Liu & Zhu (2016)** — "...and the Cross-Section of Expected Returns", *Review of Financial Studies*
  - 316 fatores publicados. Para ser estatisticamente significativo com correção para múltiplos testes, t-stat deveria ser ≥3.0, não ≥2.0. A maioria não passa no novo threshold.
  - Conclusão: a maioria dos fatores documentados é artefato de data mining no conjunto de dados históricos.

- **Hou, Xue & Zhang (2020)** — "Replicating Anomalies", *Review of Financial Studies*
  - Tentaram replicar 452 anomalias publicadas. 65% falharam em replicar com dados e metodologia padrão.
  - Implicação: o "zoo of factors" é em grande parte ruído estatístico.

- **Green, Hand & Zhang (2017)** — "The Characteristics that Provide Independent Information about Average US Monthly Stock Returns"
  - De 94 características testadas, apenas 24 são independentemente significativas.

### Contra: Decaem rapidamente após publicação

- **McLean & Pontiff (2016)** — "Does Academic Research Destroy Stock Return Predictability?", *Journal of Finance*
  - 97 variáveis preditoras. Decay out-of-sample: 26%. Decay pós-publicação adicional: 32% (total pós-pub: 58%).
  - Mecanismo: arbitrageurs leram o paper e exploraram antes dos ETFs.

- **Linnainmaa & Roberts (2018)** — "The History of the Cross-Section of Stock Returns", *Review of Financial Studies*
  - Muitos fatores não existiam antes do período de descoberta — são spurious in-sample.

### Contra: O período de dados é não-representativo

- **Dimson, Marsh & Staunton** — *Credit Suisse Global Investment Returns Yearbook* (anual)
  - Retornos históricos de equity nos EUA são outlier global. Survivorship bias: países que "quebraram" (Rússia 1917, China 1949, Alemanha WWII) foram excluídos dos estudos.
  - Retorno real de equity global ex-US: ~3.5%/ano, não 5%+.

---

## Tese: Value premium é robusto e deve persistir

### Contra: Value está morto nos EUA

- **Asness, Frazzini, Israel, Moskowitz, Pedersen (2015, atualizado 2020)** — AQR admitindo underperformance
  - Cliff Asness publicou explicitamente que value teve a pior década de sua história 2010-2020 e que a explicação não é clara. Disponível em AQR.com.

- **Fama & French (2021)** — os próprios criadores do modelo reconhecem que o HML desapareceu em large caps nos EUA pós-1990. O value premium vivo é em small caps e mercados internacionais.

- **Arnott, Beck, Kalesnik & West (2019)** — "Alice in Factorland", *Journal of Portfolio Management*
  - Value spread alto pode ser explicado por mudanças estruturais na economia (intangibles, tech), não por irracionalidade do mercado. Pode não reverter.
  - Research Affiliates: CAPE-based expected returns para US value = ~3-4% real. Não é excess return.

### Contra: Intangibles mudam a definição de "value"

- **Lev & Gu (2016)** — "The End of Accounting and the Path Forward for Investors and Managers"
  - Book value não captura intangibles (software, marcas, capital humano). "Value" via P/B é proxy quebrado na economia moderna.

---

## Tese: Small cap premium existe e é capturable

### Contra: Não existe após ajuste para qualidade

- **Asness, Frazzini, Israel & Moskowitz (2015)** — "Size Matters If You Control Your Junk"
  - O small cap premium só existe em small caps de *qualidade*. Small cap junk (empresas pequenas e de baixa qualidade) destrói retorno. AVGS acerta ao combinar size + value/quality, mas o premium bruto de SMB é enganoso.

- **Van Dijk (2011)** — "Is Size Dead?", *Journal of Banking & Finance*
  - Small cap premium nos EUA desapareceu após ser documentado por Banz (1981). Classic post-publication decay.

---

## Tese: Momentum premium é robusto

### Contra: Crashes periódicos severos

- **Daniel & Moskowitz (2016)** — "Momentum Crashes", *Journal of Financial Economics*
  - Momentum sofre crashes de -40 a -60% em períodos curtos (jan/2001, mar-maio/2009). Esses crashes ocorrem exatamente quando o mercado se recupera de bear markets — o pior momento possível para um investidor de longo prazo.

- **Barroso & Santa-Clara (2015)** — momentum tem Sharpe ratio aparentemente alto, mas com tail risk extremo que Sharpe não captura.

---

## Tese: Factor investing via ETFs captura os premiums

### Contra: Crowding e capacity

- **Greenwood & Hanson (2012)** — "Share Issuance and Factor Timing", *Journal of Finance*
  - Capital flows para fatores destroem os premiums. Quando todos compram value, o spread fecha.

- **Frazzini, Israel & Moskowitz (2018)** — capacity constraints por fator (UMD ~$52B break-even para rebalanceamento diário).

- **Lou & Polk (2022)** — comomentum como proxy de crowding. Crowding alto → reversão do momentum.

### Contra: ETFs capturam mal o que os papers medem

- **Novy-Marx & Velikov (2016)** — "A Taxonomy of Anomalies and Their Trading Costs", *Review of Financial Studies*
  - A maioria das anomalias não é implementável após custos de transação, especialmente em small caps onde o spread é amplo.
  - ETFs com rebalanceamento trimestral ou semestral capturam momentum defasado — exatamente o que Daniel & Moskowitz (2016) mostra como mais perigoso.

---

## Tese: 100% equity é ótimo para longo prazo

### Contra: Depende fortemente do horizonte e da necessidade de liquidez

- **Cederburg, O'Doherty, Wang & Yaron (2023)** — "Beyond the Status Quo: A Critical Assessment of Lifecycle Investment Advice", *NBER*
  - 100% equity é ótimo para horizontes de 30+ anos com *renda contínua*. Para quem tem data marcada (FIRE aos 50) e patrimônio-alvo, a alocação ótima é diferente.

- **Cocco, Gomes & Maenhout (2005)** — "Consumption and Portfolio Choice over the Life Cycle", *Review of Financial Studies*
  - Com capital humano correlacionado com equity (trabalhadores de setor cíclico), a alocação ótima em equity financeiro é *menor*, não maior.

- **Bernstein (2002)** — *The Four Pillars of Investing*
  - Investidor que precisa do dinheiro não pode se dar ao luxo de 100% equity. O risco relevante não é volatilidade média — é o risco de precisar vender no pior momento.

### Contra: Sequence of returns risk com data marcada

- **Pfau (2013)** — "A Broader Framework for Determining an Efficient Frontier for Retirement Income"
  - Com data de FIRE marcada, um drawdown de -40% nos 3-5 anos anteriores destrói o plano mesmo que os retornos de longo prazo sejam positivos. Glidepath reduz esse risco sem custo material em P(FIRE).

- **Pfau & Kitces (2014)** — "Reducing Retirement Risk with a Rising Equity Glidepath", *Journal of Financial Planning*
  - Glidepath em forma de "V" (reduzir equity antes do FIRE date, aumentar gradualmente depois) domina equity constante alto em P(sucesso) para FIRE com data marcada.
  - Mecanismo: os 3-5 anos antes e depois da data de FIRE são o ponto de máxima exposição ao sequence risk. Reduzir equity nessa janela e reconstruir depois captura a proteção sem custo de longo prazo.
  - **Relevância para Diego**: diretamente contra "79% equity constante dos 39 aos 50". Acionado pela issue FR-glide-path.

---

## Tese: Bond tent (bonds longos) descorrelaciona de equity em crises

### Contra: Correlacao inverte em regimes inflacionarios

- **Anarkulova, Cederburg & O'Doherty (2022)** — "Stocks for the Long Run? Evidence from a Broad Sample of Developed Markets", *Journal of Financial Economics*
  - Em 38 países desenvolvidos por 120 anos, a correlação bonds-equity é positiva em ~40% do tempo.
  - Mais importante: a correlação inverte para positiva especificamente em regimes de alta inflação — exatamente quando o bond tent deveria proteger.
  - Mecanismo: em bear markets deflacionários (recessão), bonds sobem e equity cai → correlação negativa → tent funciona. Em bear markets inflacionários (estagflação), bonds E equity caem → correlação positiva → tent falha.
  - **Ressalva para Diego**: NTN-B é indexada ao IPCA, o que mitiga parcialmente esse problema. A crítica se aplica integralmente a bonds nominais. A literatura não tem tratamento extenso de indexed bonds em economias emergentes.
  - **Relevância para Diego**: Brasil tem viés inflacionário estrutural. O cenário em que o tent mais falha (estagflação) é o cenário mais provável de estresse fiscal brasileiro. Acionado pela issue MA-bond-correlation.

- **Ilmanen (2022)** — *Investing Amid Low Expected Returns*, Wiley/AQR
  - Bonds longos em ambiente inflacionário têm retorno real negativo. Bond tent é proteção contra deflação/recessão, não contra inflação.

---

## Tese: IPCA+ brasileiro é ativo seguro para hold-to-maturity

### Contra: Risco soberano brasileiro é subestimado

- **Reinhart & Rogoff (2009)** — *This Time Is Different: Eight Centuries of Financial Folly*
  - Brasil defaultou 7 vezes em dívida interna/externa entre 1826-2004. "O governo não vai dar calote na dívida doméstica em moeda local" foi o que todos disseram antes do Plano Collor (1990) e antes da crise de 2002.
  - Confisco/congelamento de ativos (Collor 1990) é forma de default parcial que não aparece em estatísticas de default.

- **Dalio/Bridgewater** — princípios de diversificação geopolítica: nenhum país deve ter mais de 25-30% do portfólio financeiro, independente das taxas correntes.

---

## Tese: Mercados emergentes oferecem premium sustentável

### Contra: O premium compensa risco, não é "alpha grátis"

- **Harvey (1995)** — "Predictable Risk and Returns in Emerging Markets", *Review of Financial Studies*
  - EM premium existe mas é compensação por riscos reais: instabilidade política, controles de capital, risco cambial, menor proteção ao investidor.

- **Vanguard Research (2019)** — "Global Equity Investing: The Benefits of Diversification and Sizing Your Allocation"
  - EM correlações com DM aumentaram nos últimos 20 anos. O benefício de diversificação diminuiu justamente quando mais capital entrou em EM.

- **Rouwenhorst (1999)** — fatores em mercados emergentes: existem, mas com magnitude menor e menos consistência que em mercados desenvolvidos.

---

## Como usar esta biblioteca

**Cético (agente 17)**: Para cada tese que o time apresentar, buscar aqui o melhor contra-argumento. Se não houver, pesquisar e adicionar.

**Advocate**: Consultar antes de qualquer validação de premissa. A pergunta é: "Qual paper aqui refuta o que o Factor está dizendo?"

**Head**: Quando o time convergir unanimemente, verificar se alguma entrada desta biblioteca foi ignorada.

**Atualização**: Quando um agente encontrar paper relevante não listado aqui durante uma issue, adicionar ao arquivo correspondente.
