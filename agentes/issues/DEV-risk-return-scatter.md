# DEV-risk-return-scatter: Gráfico Retorno vs. Risco por Classe de Ativos

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-risk-return-scatter |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Dev (implementação), Head (decisão de design), Bookkeeper (validação dados) |
| **Dependencias** | backtest_portfolio.py (TWR e volatilidade por classe) |
| **Criado em** | 2026-05-01 |
| **Origem** | Benchmark competitivo (Portfolio Visualizer, Morningstar fazem versões similares) + demanda Diego |

---

## Descrição

Gráfico de dispersão (scatter plot) que posiciona cada classe de ativos da carteira de Diego pelo seu **retorno real (TWR)** no eixo Y e sua **volatilidade (desvio padrão anualizado)** no eixo X. Permite visualizar a eficiência de cada bucket no espaço risco-retorno — equivalente ao plot de mean-variance do Portfolio Visualizer.

---

## Classes de Ativos (Bubbles)

| Bucket | Composição | Proxy para backtest |
|--------|-----------|---------------------|
| **Equity Global** | SWRD | MSCI World (VTI+VXUS ou SWRD.L histórico) |
| **Equity EM Value** | AVEM | MSCI EM (EEM ou AVEM desde inception 2022) |
| **Equity Developed Value** | AVGS | MSCI World Small Value (AVDV ou IJS+EFV proxy) |
| **RF Estratégica** | Renda+ 2065 / Tesouro IPCA+ | IPCA+ histórico ANBIMA / NTN-B desde 2006 |
| **RF Tática** | Pool de títulos IPCA+ curtos | Selic histórica ou CDI como proxy |
| **Crypto** | HODL11 (Bitcoin) | BTC-USD desde 2014 (yfinance) |

*(Opcional: Carteira Total como bubble adicional — ponto consolidado)*

---

## Especificação do Gráfico

### Eixos
- **X:** Volatilidade anualizada (desvio padrão dos retornos mensais × √12), em %
- **Y:** Retorno TWR anualizado, em % real (deflacionado por IPCA ou nominal — definir)
- **Tamanho da bubble:** Peso atual na carteira (% alocação)
- **Cor:** Por bucket (usar paleta EC.* do echarts-theme)

### Interatividade
- Hover: tooltip com nome do bucket, retorno exato, volatilidade, peso, período
- Clique: highlight da bubble selecionada
- Legenda interativa para mostrar/ocultar buckets

### Seletor de Períodos
Dropdown ou segmented control com os períodos disponíveis:
- **Desde início** (máximo histórico com proxy)
- **10 anos** (2016–2025)
- **5 anos** (2021–2025)
- **3 anos** (2023–2025)
- **Período real** (apenas dados reais IBKR, sem proxy) — pode ser menor para AVEM/AVGS (inception 2022)
- *(Adicionar períodos conforme os já definidos no backtest_portfolio.py existente)*

### Linha de Referência (opcional)
- Linha diagonal tracejada representando Sharpe ratio = 0.5 (retorno/risco = 0.5) como referência visual de eficiência

---

## Dados

### Fontes de dados reais (prioritário)
- `backtest_portfolio.py` — já calcula TWR e pode calcular volatilidade por classe
- `dados/dashboard_state.json` — retornos históricos por bucket se disponíveis
- `react-app/public/data.json` — dados agregados do pipeline

### Proxies para períodos históricos longos
| Bucket | Proxy | Fonte | Período |
|--------|-------|-------|---------|
| Equity Global | SWRD.L ou VTI+VXUS | yfinance | desde 1993 |
| Equity EM Value | EEM ou AVDV proxy | yfinance | desde 2003 |
| Equity Dev. Value | AVDV ou IJS+EFV | yfinance | desde 2001 |
| RF Estratégica | NTN-B (ANBIMA) | pyield | desde 2006 |
| RF Tática | CDI/Selic | python-bcb | desde 1995 |
| Crypto | BTC-USD | yfinance | desde 2014 |

### Cálculo no pipeline
1. Para cada bucket + período selecionado: calcular retornos mensais usando preços ajustados
2. TWR anualizado = `(produto de (1 + r_mensal))^(12/n_meses) - 1`
3. Volatilidade anualizada = `std(r_mensal) × √12`
4. Persistir em `data.json` como `risk_return_scatter.periods.{periodo}.{bucket}` com `{twr, vol, weight}`

---

## Implementação Sugerida

### Backend (Python)
- Novo script `scripts/reconstruct_risk_return.py` ou adicionar função em `backtest_portfolio.py`
- Calcula retorno e vol para cada bucket × período
- Persiste em `dados/dashboard_state.json` via `update_dashboard_state`
- Injetado em `generate_data.py` como campo `risk_return_scatter`

### Frontend (React/ECharts)
- Novo componente `RiskReturnScatter.tsx` em `react-app/src/components/charts/`
- ECharts `scatter` series com `symbolSize` proporcional ao peso
- Seletor de período: `SegmentedControl` ou `Select` acima do gráfico
- Integrar na página de Portfolio ou como seção nova

---

## Decisões Pendentes (Head)

1. **Retorno nominal ou real?** Real (deflacionado IPCA) é mais útil para comparação de poder de compra. Nominal é mais simples de calcular e entender. Sugestão: real.
2. **Onde no dashboard?** Seção de Portfolio/Backtest, ou painel novo "Análise de Risco"?
3. **Incluir Carteira Total?** Um ponto adicional mostrando onde a carteira consolidada cai no espaço risco-retorno seria útil.
4. **Linha de Sharpe?** Visual bonito mas pode poluir — opcional.

---

## Próximos Passos

1. Head aprova escopo e decisões acima
2. Dev implementa `reconstruct_risk_return.py` com proxies e dados reais
3. Dev implementa `RiskReturnScatter.tsx`
4. Bookkeeper valida números vs. cálculo manual spot-check
