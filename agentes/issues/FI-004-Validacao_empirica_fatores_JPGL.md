# FI-004: Validacao Empirica dos Fatores de JPGL

## Status: Aberta
## Data: 2026-03-20
## Responsaveis: 02 Factor (lead), 10 Advocate
## Prioridade: Alta

## Contexto
JPGL e o maior gap da carteira (-19.7%). O curso Chicago Booth mostra que value premium diminuiu pos-1990 (de ~7% para ~2%), momentum tem crash risk (-73% em 2009 no long-short), e smart beta ETFs sofrem de data mining ("The Smart Beta Mirage", 2021). Precisamos validar se JPGL entrega o que promete antes de continuar aportando massivamente.

## Escopo
- Decompor JPGL em factor loadings (value, momentum, low-vol, quality) via regressao Fama-French 5 + momentum
- Comparar back-test vs live returns do indice subjacente
- Avaliar crash risk do momentum component (Daniel & Moskowitz 2012/2016)
- Verificar se "Smart Beta Mirage" se aplica ao JPGL
- Comparar com VWRA: qual o alpha esperado liquido de custos?

## Referencias do curso
- Veronesi: TN_Day_2C_Value_Growth_Momentum (value premium compression, momentum crashes)
- Koijen: PM Slides 4 (smart beta mirage, data mining em ETF launches)
- Barroso & Santa-Clara (2015): volatility-timed momentum
- "The Smart Beta Mirage" (2021)

## Origem
Scan Chicago Booth (HD-003), 2026-03-20
