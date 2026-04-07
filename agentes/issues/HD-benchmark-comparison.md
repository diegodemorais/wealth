# HD-benchmark-comparison: Benchmark comparison visual com shadow portfolios

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-benchmark-comparison |
| **Dono** | Advocate |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | Advocate (lead), Factor, Head, Bookkeeper, Quant |
| **Co-sponsor** | Factor |
| **Dependencias** | HD-quantstats |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap vs Ghostfolio/QuantStats benchmark features. Shadow portfolios existem no scorecard (HD-scorecard) mas sem visualização. |
| **Concluido em** | — |

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
