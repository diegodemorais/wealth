# DEV-efficient-frontier: Fronteira Eficiente Interativa

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-efficient-frontier |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | P3 — Baixa |
| **Participantes** | Dev (implementação), Head (decisão design), Quant (validação da otimização) |
| **Dependencias** | backtest_portfolio.py (retornos e covariâncias históricas) |
| **Criado em** | 2026-05-01 |
| **Origem** | Benchmark Portfolio Visualizer (Efficient Frontier) — XX-benchmark-portfolio-visualizer |

---

## Descrição

Plotar a fronteira eficiente de mean-variance para as classes de ativos da carteira de Diego (SWRD, AVGS, AVEM, RF Estratégica, RF Tática, Crypto). Mostrar a posição atual da carteira em relação à fronteira ótima de Markowitz.

Ferramenta de uso em **revisões anuais** — não operacional diário. Útil para justificar/questionar alocação atual.

---

## Valor

- Visualizar se a carteira atual está próxima da fronteira eficiente ou pode melhorar Sharpe
- Comparar múltiplas alocações (atual vs. proposta) no espaço risco-retorno
- Identificar combinações que maximizam Sharpe ou minimizam volatilidade para dado retorno

---

## Especificação Técnica

### Backend (`scripts/reconstruct_efficient_frontier.py`)

```python
import numpy as np
from scipy.optimize import minimize

# Inputs: retornos anuais esperados e covariâncias históricas
# Calculados a partir de backtest histórico (proxy data do risk_return_scatter)

def compute_efficient_frontier(
    returns: dict,    # {'SWRD': 0.12, 'AVGS': 0.15, 'RF_EST': 0.08, ...}
    cov_matrix: dict, # matriz de covariâncias históricas
    n_portfolios: int = 200
) -> list:
    # 1. Para cada nível de retorno alvo (do min ao max)
    # 2. Minimizar volatilidade via scipy.optimize com constraints:
    #    - sum(weights) = 1
    #    - weights >= 0 (sem short selling)
    #    - optional: bounds por ativo (ex: max 5% Crypto)
    # 3. Retornar lista de {vol, ret, weights, sharpe}

# Output em data.json:
# efficient_frontier.points: list[{vol, ret, sharpe, weights}]
# efficient_frontier.current: {vol, ret, sharpe, weights}  # carteira atual
# efficient_frontier.max_sharpe: {vol, ret, sharpe, weights}
# efficient_frontier.min_vol: {vol, ret, sharpe, weights}
```

**Nota Quant:** Markowitz é sensível a erros de estimação em retornos esperados. Usar retornos históricos como proxy pode superestimar diversificação. Considerar shrinkage (Ledoit-Wolf) para covariâncias. Documentar limitações no tooltip do gráfico.

### Frontend (`react-app/src/components/charts/EfficientFrontierChart.tsx`)

ECharts scatter com duas séries:
1. **Fronteira eficiente:** linha curva de pontos (vol, ret) ao longo da fronteira
2. **Carteira atual:** bubble destacada com peso maior
3. **Portfolios de referência:** Max Sharpe (estrela) e Min Vol (triângulo) como marcadores

Interatividade:
- Hover na fronteira: tooltip mostrando pesos ótimos para aquele ponto
- Clicar num ponto: destaca diferença vs. carteira atual
- Toggle: incluir/excluir ativos da otimização

### Localização no Dashboard

```
Portfolio → Seção "Análise de Risco" → após RollingReturnsHeatmap
  (colapsado por default — uso em revisões, não diário)
```

---

## Limitações Conhecidas (Documentar no UI)

1. **Markowitz clássico não considera:**
   - Regimes de mercado (correlações mudam em crise)
   - Custos de transação do rebalancing
   - Impostos (come-cotas, IRPF)
2. **Retornos esperados históricos ≠ retornos futuros**
3. **Criptoativos distorcem a fronteira** — considerar análise sem HODL11 como toggle

---

## Decisões em Aberto

1. Usar retornos históricos (proxy) ou AQR Expected Returns como inputs?
2. Incluir Crypto na otimização por default? (alta vol distorce)
3. Mostrar apenas fronteira histórica ou também "fronteira aspiracional" com retornos do Head?
4. Frequência de recálculo: mensal (automatizado) ou só em revisões?

---

## Próximos Passos

1. Quant valida metodologia (shrinkage? Black-Litterman?)
2. Dev implementa Python + frontend
3. Head avalia posição atual vs. fronteira e decisões de alocação
