# HD-benchmark-comparison: Benchmark comparison visual com shadow portfolios

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-benchmark-comparison |
| **Dono** | Advocate |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | Advocate (lead), Factor, Head, Bookkeeper, Quant |
| **Co-sponsor** | Factor |
| **Dependencias** | HD-quantstats |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap vs Ghostfolio/QuantStats benchmark features. Shadow portfolios existem no scorecard (HD-scorecard) mas sem visualização. |
| **Concluido em** | 2026-04-07 |

---

## Motivo / Gatilho

Temos shadow portfolios definidos no scorecard (HD-scorecard): Portfolio A (VWRA puro), Portfolio B (60/40), Portfolio C (sem factor tilt). Mas a comparação é numérica em tabela. Ghostfolio e QuantStats geram visualizações comparativas automáticas. Gap identificado no scan (2026-04-07).

---

## Descricao

Criar visualização comparativa automatizada da carteira real vs shadow portfolios e benchmarks padrão (VWRA, MSCI ACWI, 60/40). Detectar alpha/underperformance de forma visual e quantitativa.

---

## Escopo — Roteiro Padrão de Integração

- [ ] **1. Mapear benchmarks**: definir os N portfolios para comparação — (a) carteira real, (b) VWRA puro, (c) 60/40 global, (d) carteira sem factor tilt (SWRD 100%), (e) MSCI ACWI
- [ ] **2. Avaliar ferramentas**: QuantStats `vs` benchmark, Ghostfolio comparison view, matplotlib/plotly custom
- [ ] **3. Avaliar o que temos**: shadow portfolios no scorecard — extrair dados, formatar para comparação
- [ ] **4. Prova de conceito**: gerar gráfico comparativo de performance cumulativa (12m rolling) com proxies canônicos
- [ ] **5. Métricas comparativas**: alpha, tracking error, information ratio, excess drawdown, rolling Sharpe diff
- [ ] **6. Reportar ao time**: Advocate stress-testa se carteira real está gerando alpha vs simplicidade (HD-simplicity)
- [ ] **7. Sintetizar e decidir**: incorporar no check-in trimestral? Qual formato (HTML, PNG, tabela)?

---

## Raciocínio

**Argumento central:** "Complexity must justify itself" (HD-simplicity). A melhor forma de verificar é comparação visual contínua vs a alternativa simples (VWRA). Se factor tilt + 50/30/20 não superar VWRA em risk-adjusted terms após 2+ anos, devemos simplificar.

**Incerteza reconhecida:** Horizonte curto (<2 anos de dados reais) gera muito ruído. Proxies históricos ajudam mas não são substituto perfeito.

**Falsificação:** Se carteira real underperformar VWRA por >1pp/ano em 3 anos rolling com Sharpe inferior, gatilho de simplificação.

---

## Conclusao

`--benchmarks` flag adicionada ao `portfolio_analytics.py`. Compara Target 50/30/20 vs Shadow A (VWRA) e Shadow B (SWRD 100%). Métricas: CAGR, Vol, Sharpe, Sortino, MaxDD, Tracking Error vs Target.

**Resultado ao vivo (261 dias, abr/2025–abr/2026):**

| Portfolio | Retorno | Sharpe | MaxDD |
|-----------|---------|--------|-------|
| Target 50/30/20 | +23.25% | 1.42 | -14.00% |
| Shadow A — VWRA | +17.66% | 1.13 | -13.33% |
| Shadow B — SWRD100 | +16.43% | 1.06 | -13.41% |

Alpha vs VWRA: +4.67%/ano (raw, sem significância com <2 anos).

**Decisão:** Usar `--benchmarks` nas revisões trimestrais. Alertar se Target underperformar VWRA por >1pp/ano em 3 anos rolling (gatilho de simplificação).
