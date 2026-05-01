# DEV-overlap-detection: Overlap Detection entre ETFs

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-overlap-detection |
| **Dono** | Dev |
| **Status** | Done ✅ |
| **Prioridade** | P2 — Média |
| **Participantes** | Dev (implementação), Head (decisão design) |
| **Dependencias** | Holdings públicos iShares/Avantis |
| **Criado em** | 2026-05-01 |
| **Concluido em** | 2026-05-01 |
| **Origem** | Benchmark Morningstar (X-Ray overlap detection) — XX-benchmark-morningstar |

---

## Descrição

Visualizar quais ações aparecem simultaneamente em SWRD + AVGS + AVEM, e em qual peso consolidado. Detectar concentration risk implícita (ex: Apple, Microsoft aparecem em peso significativo em todos os três ETFs).

Equivalent ao **Stock Intersection** do Morningstar X-Ray, mas com dados reais dos ETFs da carteira.

---

## Valor

- Evitar concentration risk implícita (ex: exposição real a Big Tech muito maior que o aparente)
- Quantificar overlap entre SWRD (market-cap world) e AVGS/AVEM (value tilts)
- Insight: "qual % da minha carteira é efetivamente diversificada vs. duplicada?"

---

## Dados Necessários

### Fontes de Holdings (públicas, atualizadas mensalmente)

| ETF | Emissor | URL Holdings |
|-----|---------|-------------|
| SWRD | SSGA (State Street) | [SSGA SWRD holdings CSV](https://www.ssga.com/library-content/products/fund-data/etfs/gl/holdings-daily-gl-spy.xlsx) — verificar URL exato para SWRD.L |
| AVGS | Avantis / American Century | [Avantis fund page](https://www.avantisinvestors.com/avantis-investments/avantis-international-small-cap-value-etf/) → Holdings tab |
| AVEM | Avantis / American Century | Mesmo padrão, AVEM |

**Alternativa via yfinance:** `yf.Ticker('SWRD.L').get_info()` não dá holdings detalhados. Usar `yf.Ticker('SWRD.L').get_institutional_holders()` também não. **Necessário scraping direto dos CSVs dos emissores.**

---

## Especificação Técnica

### Backend (`scripts/reconstruct_overlap.py`)

```python
# 1. Download holdings de cada ETF (CSV do emissor)
# 2. Normalizar: ticker_isin, name, weight_pct
# 3. Merge por ISIN: encontrar ISINs presentes em ≥2 ETFs
# 4. Calcular peso consolidado: weighted avg considerando alocação da carteira
#    ex: SWRD 40% do portfolio × peso_ação_no_SWRD = contribuição da ação
# 5. Top 20 ações por overlap (maior peso combinado)
# 6. Persistir em data.json como overlap_detection

def compute_overlap(holdings_swrd, holdings_avgs, holdings_avem, weights_carteira):
    # weights_carteira = {'SWRD': 0.40, 'AVGS': 0.237, 'AVEM': 0.158}
    # Retorna: [{'isin', 'name', 'in_etfs': ['SWRD','AVGS'], 'weight_combined_pct', 'weight_per_etf': {...}}]
    pass

# Output em data.json:
# overlap_detection.top_overlaps: list[{isin, name, weight_combined, etfs_detail}]
# overlap_detection.total_overlap_pct: float  # % do portfolio em ações duplicadas
# overlap_detection.unique_pct: float          # % efetivamente diversificado
```

### Frontend (`react-app/src/components/charts/OverlapChart.tsx`)

Visualização: **horizontal bar** ou **bubble chart** das top 20 ações em overlap.

- Cada linha: nome da ação + barra dividida por ETF (stacked bar com cores por ETF)
- Tooltip: peso em cada ETF + peso combinado na carteira total
- Métrica resumo: "X% da carteira tem overlap direto entre ETFs"
- Seção: Portfolio → após Factor Profile

### Localização no Dashboard

```
Portfolio → Seção "Composição & Overlap"
  ├── ETFFactorComposition (existente)
  ├── FactorProfileChart (novo — DEV em andamento)
  └── OverlapChart (esta feature)
```

---

## Decisões em Aberto

1. **Frequência de atualização**: mensal (holdings mudam pouco)
2. **Limite de ações**: Top 20 por peso combinado (legível) vs. todas (completo mas ruído)
3. **Tratamento de ações exclusivas**: incluir como "sem overlap" ou focar só em sobreposições?
4. **ISIN vs ticker**: usar ISIN como chave primária (mais confiável entre emissores diferentes)

---

## Próximos Passos

1. Dev verifica URLs exatas dos holdings CSVs (SWRD.L é IE-listed, pode ter URL diferente)
2. Dev implementa `reconstruct_overlap.py` com download + merge
3. Dev implementa `OverlapChart.tsx`
4. Head valida top overlaps vs. senso comum (Apple/MSFT devem aparecer)
