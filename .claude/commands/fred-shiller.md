# FRED + Shiller — Macro Global e Valuation

Voce e o agente macro buscando dados de contexto macroeconômico global e valuation via FRED (St. Louis Fed) e Robert Shiller (Yale). FRED cobre macro/juros/inflação global; Shiller cobre CAPE, retornos históricos de longo prazo e dados de valuation desde 1871.

## Fontes

### FRED — Federal Reserve Bank of St. Louis

API aberta e gratuita. Base URL: `https://fred.stlouisfed.org/graph/fredgraph.csv?id={series_id}`

Não requer chave de API para CSV simples.

### Robert Shiller — Yale

Excel único com dados mensais desde 1871:
`http://www.econ.yale.edu/~shiller/data/ie_data.xls`

Contém: S&P 500 preço, dividendos, earnings, CAPE (P/E10), retornos reais, yields de bonds longos.

---

## Séries FRED Relevantes para a Carteira

### Taxas de Juros e RF Global

| Série | ID FRED | Relevância |
|-------|---------|-----------|
| Fed Funds Rate | `FEDFUNDS` | Taxa base USD — contexto para retornos USD |
| US 10y Treasury Yield | `DGS10` | Benchmark RF longo USD |
| US 10y Real Yield (TIPS) | `DFII10` | Taxa real USD — comparar vs IPCA+ BR |
| US 30y Treasury Yield | `DGS30` | Referência longa |
| Spread 10y-2y (yield curve) | `T10Y2Y` | Recessão signal |

### Inflação Global

| Série | ID FRED | Relevância |
|-------|---------|-----------|
| US CPI YoY | `CPIAUCSL` | Deflator para retornos USD reais |
| US Core PCE | `PCEPILFE` | Inflação preferida do Fed |
| Euro Area CPI | `CP0000EZ19M086NEST` | Contexto UCITS |

### Macro / Crescimento

| Série | ID FRED | Relevância |
|-------|---------|-----------|
| US GDP Real | `GDPC1` | Ciclo econômico |
| Global PMI Manufacturing | WebSearch fallback | Contexto recessão |
| VIX | `VIXCLS` | Risk-off signal |
| Credit Spread (HY-IG) | `BAMLH0A0HYM2` | Stress de crédito |

### Câmbio

| Série | ID FRED | Relevância |
|-------|---------|-----------|
| BRL/USD (PTAX) | `DEXBZUS` | Histórico longo BRL/USD — crítico para FR-currency-mismatch |
| DXY (dólar index) | `DTWEXBGS` | Força do dólar global |

---

## Como Executar

### Dados FRED — WebFetch direto

```
WebFetch: https://fred.stlouisfed.org/graph/fredgraph.csv?id={SERIES_ID}
```

Retorna CSV com duas colunas: `DATE, VALUE`. Parsear diretamente.

Para múltiplas séries em paralelo — fazer WebFetch simultâneo:
```python
import pandas as pd
from io import StringIO

# Exemplo: BRL/USD histórico
url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXBZUS"
# WebFetch retorna o CSV como string
df = pd.read_csv(StringIO(csv_content))
df['DATE'] = pd.to_datetime(df['DATE'])
df = df.dropna()
```

### Dados Shiller — Download Excel

```bash
curl -L "http://www.econ.yale.edu/~shiller/data/ie_data.xls" -o /tmp/shiller_data.xls
```

```python
import pandas as pd
df = pd.read_excel('/tmp/shiller_data.xls', sheet_name='Data', header=7)
# Colunas: Date, P (price), D (dividends), E (earnings), CPI, Date (frac),
#           Rate_GS10 (10y yield), Price_real, Dividend_real, Earnings_real,
#           CAPE (P/E10), TR_Price (total return), Real_TR_Price
```

---

## Casos de Uso

### A) Contexto macro atual (rápido)

Buscar em paralelo: Fed Funds, US 10y real yield, VIX, BRL/USD, spread HY.
Comparar taxa real USD vs IPCA+ BR → qual oferece melhor risco/retorno real?

### B) Histórico BRL/USD para FR-currency-mismatch-fire

```
WebFetch FRED DEXBZUS (histórico desde 1994)
```
Calcular: janelas de 5 e 10 anos onde BRL apreciou vs USD. Quantas? Magnitude média?
Impacto em carteira ~60% USD se BRL apreciar 20% no início do FIRE.

### C) CAPE e valuation global para premissas de retorno

```
Shiller ie_data.xls → CAPE histórico
```
Comparar CAPE atual do S&P500 vs médias históricas.
Complementar com Research Affiliates AAI (já usado) para expected returns forward-looking.

### D) Taxa real USD vs IPCA+ para decisão de alocação RF

```
FRED DFII10 (TIPS 10y real) vs taxa IPCA+ atual (via /macro-bcb)
```
Se taxa real USD > IPCA+ Brasil: questionar alocação RF.
Se IPCA+ Brasil > TIPS + spread cambial esperado: IPCA+ dominante.

---

## Formato do Relatório

```
## FRED + Shiller Snapshot — {data}

### Taxas Globais

| Indicador | Valor Atual | 1 ano atrás | Tendência |
|-----------|-------------|-------------|-----------|
| Fed Funds | X.XX% | X.XX% | ↑/↓/→ |
| US 10y Treasury | X.XX% | X.XX% | |
| US 10y Real (TIPS) | X.XX% | X.XX% | |
| Spread 10y-2y | X bps | X bps | |
| VIX | XX | XX | |

### Comparação Taxa Real (contexto para alocação RF)

| Ativo RF | Taxa Real Atual | Risco |
|----------|----------------|-------|
| IPCA+ 2040 (BR) | X.XX% | Soberano BR |
| TIPS 10y (US) | X.XX% | Soberano US |
| Diferencial | +X.XX% BR | Risco cambial BR/USD |

### CAPE (Shiller)

| Índice | CAPE Atual | Média Histórica | Percentil |
|--------|-----------|----------------|-----------|
| S&P 500 | XX.X | 16.8 (1871-hoje) | XXº |

### BRL/USD Histórico (FRED DEXBZUS) — se solicitado

| Janela | Apreciação BRL | Depreciação BRL | Neutro |
|--------|---------------|----------------|--------|
| Janelas 5 anos (1994-2024) | X de Y | X de Y | X de Y |
| Janelas 10 anos | X de Y | X de Y | X de Y |

### Impacto para a Carteira

{O que os dados dizem sobre premissas de retorno, alocação RF, risco cambial}
```

## Regras

- FRED atualiza diariamente para séries diárias/mensais — dados sempre frescos
- Shiller atualiza mensalmente (~5 dias após o mês fechar)
- CAPE não é timing tool — é contexto de valuation de longo prazo, não sinal de entrada/saída
- BRL/USD histórico do FRED (DEXBZUS) começa em 1994 — usar para análise de ciclos cambiais

## Frequência Recomendada

- **Ao executar FR-currency-mismatch-fire**: BRL/USD histórico obrigatório
- **Em revisões de premissas de retorno**: CAPE + TIPS vs IPCA+
- **Em contexto macro full-path**: complementa `/macro-bcb` com perspectiva global
- **Trimestral**: snapshot de taxas reais globais junto com revisão da carteira
