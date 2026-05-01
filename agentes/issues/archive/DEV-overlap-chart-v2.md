---
ID: DEV-overlap-chart-v2
Titulo: Overlap Chart v2 — ticker + labels + top-5 concentração
Dono: Dev
Prioridade: 🟡 Média
Dependências: —
---

## Contexto

O gráfico de Overlap ETFs (OverlapChart, aba PORTFOLIO) está funcional mas precisa de duas melhorias de legibilidade e um gráfico complementar.

## Tarefas

### 1. Ticker nas labels do eixo Y

**Atual:** `Samsung Electroni...` (só nome, truncado)
**Novo:** `Samsung Electroni... (005930)` ou melhor ainda `(005930) Samsung Elec...`

Formato preferível: ticker entre parênteses no início ou no fim da label, compacto. O ticker pode ser obtido dos dados proxy sintéticos existentes (ou adicionado ao `generate_data.py`).

### 2. Label de % inline nas barras

Cada segmento de barra (SWRD / AVGS / AVEM) deve mostrar o valor de `%` da carteira diretamente no segmento, compacto (ex: `0.42%`). Se o segmento for muito estreito para caber, omitir (threshold ~0.05%).

### 3. Novo gráfico ao lado: Top 5 Concentrações Totais

**Objetivo:** comparar ao gráfico de overlap, mostrando as 5 maiores posições da carteira por peso total agregado — independente de haver overlap.

- Mesmo formato visual (bar chart horizontal ECharts)
- Mesma paleta de cores por ETF (SWRD azul claro / AVGS azul médio / AVEM ciano)
- Label inline com % total
- Ticker no eixo Y
- Pode ou não ter overlap — mostra o peso consolidado de cada ação somando participação de todos os ETFs

**Layout sugerido:** os dois gráficos lado a lado (grid-cols-2) dentro do mesmo `CollapsibleSection` (id `overlap`), na aba PORTFOLIO.

### Dados

Os dados proxy sintéticos em `generate_data.py` já têm as posições por ETF. O que provavelmente precisa ser adicionado:
- Campo `ticker` por empresa (pode ser sintético/proxy)
- Agregação top-5 por peso total

## Critérios de aceite

- [ ] Ticker visível no eixo Y de ambos os gráficos
- [ ] % inline nas barras (omitir se segmento < 0.05%)
- [ ] Segundo gráfico Top-5 ao lado, mesmo formato
- [ ] Privacy mode respeitado nos dois gráficos
- [ ] Build passa + testes existentes não quebram
- [ ] Changelog adicionado
