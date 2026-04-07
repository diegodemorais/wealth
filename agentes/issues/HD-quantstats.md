# HD-quantstats: Portfolio analytics visual com QuantStats

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-quantstats |
| **Dono** | Head |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | Head (lead), Factor, FIRE, Advocate, Bookkeeper |
| **Co-sponsor** | Factor |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap identificado vs QuantStats/pyfolio |
| **Concluido em** | — |

---

## Motivo / Gatilho

Nosso `portfolio_analytics.py` calcula métricas básicas mas não gera visualizações (tear sheets, drawdown charts, rolling returns). QuantStats (5k+ stars) gera HTML reports completos com 1 linha de código. Gap identificado no scan de repos open-source (2026-04-07).

---

## Descricao

Avaliar e integrar QuantStats (ou alternativa superior) nos scripts existentes para gerar portfolio analytics visuais automatizados.

---

## Escopo — Roteiro Padrão de Integração

- [ ] **1. Instalar e configurar**: `pip install quantstats`, testar import, verificar compatibilidade com nosso Python stack
- [ ] **2. Mapear features**: listar todas as métricas e visualizações disponíveis (Sharpe, Sortino, drawdowns, rolling returns, monthly heatmap, etc.)
- [ ] **3. Avaliar o que temos**: comparar output do `portfolio_analytics.py` atual vs QuantStats — o que QuantStats faz que nós não fazemos?
- [ ] **4. Prova de conceito**: gerar tear sheet HTML com dados reais da carteira (SWRD, AVGS, AVEM via proxies canônicos)
- [ ] **5. Integrar**: plugar QuantStats no `portfolio_analytics.py` ou criar script dedicado. Benchmark vs VWRA e shadow portfolios
- [ ] **6. Reportar ao time**: apresentar output visual, métricas novas, e diferenças vs approach atual
- [ ] **7. Sintetizar e decidir**: manter como ferramenta permanente? Substituir analytics existente? Adicionar ao check-in mensal?

---

## Raciocínio

**Argumento central:** Visualizações são críticas para detectar padrões que tabelas numéricas escondem (drawdowns, correlações rolantes, regimes de volatilidade). QuantStats é a ferramenta padrão da indústria com 5k+ stars e zero custo.

**Incerteza reconhecida:** Nossos dados de carteira são curtos (meses). Valor real virá com proxies históricos ou após 1+ ano de tracking.

---

## Analise

*(preencher durante execução)*

---

## Conclusao

*(preencher ao finalizar)*
