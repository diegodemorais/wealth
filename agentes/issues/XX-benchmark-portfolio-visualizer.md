# XX-benchmark-portfolio-visualizer: Investigação — Portfolio Visualizer

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | XX-benchmark-portfolio-visualizer |
| **Dono** | Head |
| **Status** | Investigação Concluída — Aguardando Decisão |
| **Prioridade** | Média |
| **Participantes** | Head (decisão), Dev (implementação eventual) |
| **Dependencias** | — |
| **Criado em** | 2026-05-01 |
| **Origem** | Benchmark competitivo das 3 ferramentas de investimento mais famosas do mundo |

---

## Visão Geral

**Portfolio Visualizer** (portfoliovisualizer.com) é a ferramenta de referência para investidores individuais em backtesting histórico, simulações Monte Carlo, factor analysis e otimização de portfolio. É o benchmark de facto em Bogleheads e comunidades FIRE.

**Modelo:** Freemium — tier gratuito (10 anos histórico, 15 ativos), Basic $360/ano (150 ativos, histórico completo), Pro $660/ano.

---

## Features Mapeadas

| Módulo | O que faz |
|--------|-----------|
| **Backtest Portfolio** | Testa alocação contra histórico real. CAGR, Sharpe, Sortino, drawdown. Dados mensais desde 1972. |
| **Backtest Dynamic Allocation** | Simula glide paths com mudança de pesos ao longo do tempo (growth → income). |
| **Monte Carlo Simulation** | Sustentabilidade da carteira sob saques. Distribuição de outcomes, prob. de sucesso. |
| **Factor Regression Analysis** | Decompõe retornos em fatores: CAPM, FF3/5, Carhart 4-factor, q-factor, BAB, quality. Kenneth French data. |
| **Efficient Frontier Optimization** | Curva risco-retorno; otimiza via mean-variance, CVaR, drawdown ou Sharpe. |
| **Correlation Matrix** | Heatmap de correlações Pearson (diária/mensal/anual). Rolling correlations. |
| **Tactical Allocation** | Modelos baseados em momentum, moving averages, CAPE, risk parity. |

### Visualizações

- Time series: evolução do patrimônio com aportes/saques
- Rolling returns heatmap (1y, 3y, 5y móveis)
- Drawdown chart desde pico
- Monte Carlo histogram (survival rates)
- Efficient frontier scatter (risco x retorno)
- Factor loadings bar chart
- Correlation heatmap

### FIRE/Aposentadoria

- Monte Carlo com saques variáveis (RMD approach: 1/life_expectancy)
- Múltiplos fluxos de caixa (renda passiva, saques maiores em datas específicas)
- Linear glide path (growth → income automático)
- **Não tem:** guardrails dinâmicos (Guyton-Klinger, spending rules condicionais)

---

## Pontos Fortes

1. **Backtesting robusto** — dados desde 1972, sem survivor bias em nível de asset class
2. **Factor analysis sofisticado** — Kenneth French data, 5+ modelos de fatores
3. **Monte Carlo confiável** — suporta correlações, inflação, múltiplos cenários
4. **UI intuitiva** — investidor leigo consegue usar sem programação
5. **Credibilidade** — benchmark padrão em Bogleheads
6. **Rebalance customizável** — bandas (5% absoluto, 25% relativo) ou calendário

## Limitações

1. **Paywall** — histórico completo exige $360/ano
2. **Sem guardrails automáticos** — spending dinâmico é manual
3. **Sem integração com brokers** — dados manuais; sem IBKR, Nubank
4. **Sem tracking real-time** — ferramenta analítica pontual, não operacional
5. **Sem tax optimizer** — sem FIFO, wash sales, loss harvesting
6. **ETFs internacionais limitados** — AVEM, BOVA11, BRL pode ter dados incompletos
7. **Correlações estáticas** — não captura fat tails em crise

---

## Comparação com Dashboard Diego

| Aspecto | Portfolio Visualizer | Dashboard Diego |
|--------|----------------------|-----------------|
| Backtesting histórico 50+ anos | ✅ Excelente | ⚠️ Implementável (backtest_portfolio.py existe) |
| Monte Carlo com guardrails | ⚠️ Básico, sem guardrails | ✅ Nativo (fire_montecarlo.py + guardrail_engine.py) |
| Factor analysis (FF5) | ✅ Excelente | ⚠️ Parcial (factor_regression.py existe) |
| Tracking real-time vs meta | ❌ Nenhum | ✅ Diário |
| Tax optimization | ❌ Nenhum | ✅ Parcial (tax_engine.py, FIFO) |
| Integração IBKR | ❌ Nenhum | ✅ ibkr_lotes.py |
| Customização UI | ⚠️ Fixa | ✅ Total |
| Custo | $360–660/ano | ~0 |

**Conclusão:** Portfolio Visualizer = análise pontual (simulação). Dashboard Diego = sistema de decisão contínuo (tracking + alertas + guardrails). São complementares, não concorrentes.

---

## Oportunidades de Implementação (para avaliação Head)

1. **Rolling returns heatmap** — visualização de retornos móveis (1y, 3y, 5y) no dashboard. Alta legibilidade para identificar sequências ruins.
2. **Efficient frontier interativo** — plotar carteira atual vs. fronteira ótima (risco x retorno esperado). Útil para revisões anuais.
3. **Glide path visualization** — gráfico mostrando evolução de alocação equity→renda ao longo do tempo até FIRE. Mais visual que a tabela atual.
4. **Factor loadings explícitos no dashboard** — barra de exposição a market/size/value/momentum/quality para SWRD+AVGS+AVEM combinados.

---

## Próximos Passos

- [ ] Head decide quais features valem implementar (ver seção acima)
- [ ] Para cada feature aprovada: abrir issue de implementação específica com Dev

---

## Fontes

- [portfoliovisualizer.com](https://www.portfoliovisualizer.com/)
- [Backtest Portfolio](https://www.portfoliovisualizer.com/backtest-portfolio)
- [Factor Analysis](https://www.portfoliovisualizer.com/factor-analysis)
- [Monte Carlo](https://www.portfoliovisualizer.com/monte-carlo-simulation)
- [Efficient Frontier](https://www.portfoliovisualizer.com/efficient-frontier)
- [Pricing](https://www.portfoliovisualizer.com/pricing)
- [Bogleheads: Portfolio Visualizer Discussion](https://www.bogleheads.org/blog/portfolio/portfolio-visualizer/)
- [Rob Berger Review](https://robberger.com/tools/portfolio-visualizer/)
