# XX-benchmark-morningstar: Investigação — Morningstar

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | XX-benchmark-morningstar |
| **Dono** | Head |
| **Status** | Investigação Concluída — Aguardando Decisão |
| **Prioridade** | Média |
| **Participantes** | Head (decisão), Dev (implementação eventual) |
| **Dependencias** | — |
| **Criado em** | 2026-05-01 |
| **Origem** | Benchmark competitivo das 3 ferramentas de investimento mais famosas do mundo |

---

## Visão Geral

**Morningstar** (morningstar.com) é a plataforma global de referência em pesquisa e análise de investimentos. Cobre ~3.200 fundos (mutual funds + ETFs), com ratings proprietários (Star + Medalist), análise qualitativa por 130+ analistas globais, e ferramentas de portfolio analysis (X-Ray).

**Modelo:** Free tier (editorial + dados básicos) + Morningstar Investor Premium (USD 249/ano). Versão Enterprise para RIAs (Morningstar Direct).

---

## Features Mapeadas

### Portfolio X-Ray (flagship feature)

Análise holdings-level que "explode" fundos/ETFs em componentes reais:

- **Asset Class Breakdown** — desagrega ações (dom/intl), renda fixa, commodities
- **Sector Exposure** — alocação econômica bottom-up dos holdings reais (technology, healthcare, financials…)
- **Stock Style Box (9x9)** — plota exposição média em mercap (small/mid/large) × estilo (value/blend/growth)
- **World Regions** — exposição geográfica implícita
- **Stock Intersection** — identifica overlaps entre fundos (quais ações aparecem em múltiplos ETFs)
- **Holdings Breakdown** — contribuição marginal de cada fundo ao portfolio total (2025)

### ETF/Fund Screener

200+ datapoints filtráveis: Style Box, sector, TER, Sharpe, standard deviation, Morningstar Risk, performance (1y/3y/5y/10y), Factor Profile (value/momentum/quality/yield/volatility/liquidity), AI-powered natural language search.

### Ratings

- **Star Rating (1–5):** risco-ajustado vs. peers na categoria. Top 10% = 5 estrelas. Atualizado mensalmente. Preditivo moderado.
- **Medalist Rating (Gold/Silver/Bronze/Neutral/Negative):** análise qualitativa por analistas (People/Parent/Process/Performance/Price). ~3.200 estratégias cobertas.

### Factor Profile

7 fatores expostos por ETF: Value, Growth, Momentum, Quality, Yield, Volatility, Liquidity. Descritivo — não prescritivo (não diz se caro/barato vs. histórico).

### Retirement Planning Tools

Monte Carlo via Wealth Forecast Engine. Inputs: alocação, idade, savings rate, desired income, Social Security. Output: prob. de sucesso + income distribution. **Metodologia interna, não publicada academicamente.**

---

## Visualizações

- Style Box 9×9 (mercap × estilo)
- Sector pie/stacked bar (bottom-up dos holdings)
- Time series (performance, rolling returns)
- Factor scatter plots (exposição multifator 2D)
- Heatmaps (sector/region performance rankings)
- Stock Intersection bubble chart (overlap por ação)

---

## Pontos Fortes

1. **X-Ray holdings-level** — incomparável para overlap detection entre ETFs; abre a "caixa preta" de cada fundo
2. **Cobertura broad** — SWRD, AVGS, AVEM, HODL11: todos têm dados e análise
3. **Factor transparency** — Factor Profile padronizado permite comparar exposição entre ETFs (AVGS vs AVEM em value/momentum)
4. **Medalist Ratings** — análise estruturada de gestão (People/Parent/Process) vs. scores puramente estatísticos
5. **Screener com 200 datapoints** — poder bruto de filtering; AI-powered

## Limitações

1. **Portfolio Manager descontinuado (2024–2025)** — tracking contínuo foi removido; X-Ray agora é análise one-shot, não dashboard live. Exodus de usuários documentado em Bogleheads.
2. **Sem tracking real-time** — visão estática, não operacional
3. **Star Ratings: baixa preditabilidade** — excelentes para marketing, fracos para previsão de performance futura
4. **Factor Profile: descritivo, não prescritivo** — mostra exposure, não diz se fator está barato/caro
5. **Retirement Planner básico** — Monte Carlo simplificado; inferior a modelos acadêmicos (Cederburg 2023 etc.)
6. **Data lag** — holdings X-Ray pode estar 1–3 meses atrasado (fund reporting delay)
7. **Sem tax planning** — nenhum TLH, FIFO, ou análise de ganhos realizados
8. **Sem rebalancing guidance** — identifica desvios, mas não calcula aportes ótimos

---

## Comparação com Dashboard Diego

| Feature | Morningstar | Dashboard Diego | Winner |
|---------|-------------|-----------------|--------|
| Holdings decomposition (X-Ray) | ✅ Holdings-level, multi-fund | ⚠️ Possível se dados disponíveis | Morningstar |
| Real-time portfolio tracking | ❌ Descontinuado | ✅ Live (IBKR + yfinance) | Diego |
| Factor analysis (FF5) | ⚠️ Factor Profile (7 fatores, descritivo) | ✅ factor_regression.py (prescritivo) | Diego |
| Tax-loss harvesting | ❌ Não | ✅ tax_engine.py + FIFO | Diego |
| Expected returns integration | ❌ Não | ✅ Pode integrar AQR/RA/Vanguard | Diego |
| Overlap detection entre ETFs | ✅ Excelente | ❌ Não implementado | Morningstar |
| Research/Ratings qualitativas | ✅ Medalist + analistas | ❌ Não | Morningstar |
| Custo | USD 249/ano | ~0 | Diego |

**Conclusão:** Morningstar complementa o dashboard — research + análise estática vs. tracking + decisão operacional.

---

## Oportunidades de Implementação (para avaliação Head)

1. **Overlap detection entre ETFs** — visualizar quais ações aparecem em SWRD + AVGS + AVEM simultaneamente, e em qual peso. Dados disponíveis via ETF holdings públicos (iShares, Avantis). **Alta utilidade para evitar concentration risk implícita.**
2. **Style Box do portfolio consolidado** — plotar posição da carteira combinada SWRD+AVGS+AVEM em mercap × estilo (large value, large blend, etc.). Entender tilt real consolidado.
3. **Factor Profile comparativo** — barra lado a lado de SWRD vs AVGS vs AVEM em value/momentum/quality. Morningstar já tem o conceito; implementável com dados públicos (AQR, Ken French).
4. **Sector exposure bottom-up** — decompor alocação total por setor econômico (tech, health, financials…) via holdings de cada ETF. Detectar concentration setorial implícita.

---

## Próximos Passos

- [ ] Head decide quais features valem implementar (ver seção acima)
- [ ] Para cada feature aprovada: abrir issue de implementação específica com Dev

---

## Fontes

- [Morningstar X-Ray Help Center](https://www.morningstar.com/help-center/portfolio/xray)
- [Morningstar Rating Methodology](https://www.morningstar.com/content/dam/marketing/shared/research/methodology/771945_Morningstar_Rating_for_Funds_Methodology.pdf)
- [Morningstar Factor Profile Guide](https://advisor.morningstar.com/enterprise/MorningstarFactorProfileUserGuide.pdf)
- [ETF Screener](https://www.morningstar.com/etfs/screener)
- [Pricing](https://www.morningstar.com/help-center/premium-and-portfolio-manager/premium-membership)
- [Bogleheads: Free Portfolio Tool Ending](https://www.bogleheads.org/forum/viewtopic.php?t=379918)
- [Bogleheads: Morningstar X-Ray Discussion](https://www.bogleheads.org/forum/viewtopic.php?t=437134)
