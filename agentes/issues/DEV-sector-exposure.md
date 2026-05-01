# DEV-sector-exposure: Exposição Setorial Bottom-Up

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-sector-exposure |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | P2 — Média |
| **Participantes** | Dev (implementação), Head (decisão design) |
| **Dependencias** | Holdings públicos iShares/Avantis (idem DEV-overlap-detection) |
| **Criado em** | 2026-05-01 |
| **Origem** | Benchmark Morningstar (X-Ray sector exposure) — XX-benchmark-morningstar |

---

## Descrição

Decompor a alocação equity total (SWRD + AVGS + AVEM) por **setor econômico** (GICS 11 setores), usando os holdings reais de cada ETF. Detectar concentration setorial implícita — ex: "minha carteira tem 28% em Technology efetivo, não os 20% que SWRD reporta isolado".

Equivalente ao **Sector Exposure** do Morningstar X-Ray (decompõe fundos em ações reais, agrega por setor).

---

## Valor

- Visualizar exposição real a Tech, Financials, Healthcare, Energy, etc.
- Comparar exposição setorial entre SWRD (market-cap) e AVGS+AVEM (value tilts)
- Identificar concentration setorial implícita antes de eventos setoriais (ex: regulação Tech)

---

## Dados Necessários

### Fontes (idem DEV-overlap-detection)

Holdings CSVs dos emissores incluem campo de setor GICS para cada ação.

| ETF | Setor disponível no CSV? |
|-----|------------------------|
| SWRD (SSGA) | Sim — GICS Sector column |
| AVGS (Avantis) | Sim — Sector column |
| AVEM (Avantis) | Sim — Sector column |

**Nota:** pode ser implementado no mesmo script `reconstruct_overlap.py` (reutilizar download de holdings).

---

## Especificação Técnica

### Backend (`scripts/reconstruct_overlap.py` — extensão)

```python
GICS_SECTORS = [
    'Information Technology', 'Financials', 'Health Care', 'Consumer Discretionary',
    'Industrials', 'Communication Services', 'Consumer Staples', 'Energy',
    'Materials', 'Real Estate', 'Utilities'
]

def compute_sector_exposure(holdings_per_etf, weights_carteira):
    # Para cada ETF: agrupa holdings por setor, soma pesos
    # Pondera pela alocação da carteira (SWRD×40% + AVGS×23.7% + AVEM×15.8%)
    # Normaliza pelo total equity (79.5% do portfolio)
    # Retorna: {sector: weight_pct} para a carteira equity total

# Output em data.json:
# sector_exposure.by_sector: {sector: {total_pct, swrd_pct, avgs_pct, avem_pct}}
# sector_exposure.dominant: str  # setor com maior peso
# sector_exposure.as_of: str     # data dos holdings
```

### Frontend (`react-app/src/components/charts/SectorExposureChart.tsx`)

Visualização principal: **stacked horizontal bar** por setor.

- Eixo Y: 11 setores GICS
- Eixo X: % do portfolio equity
- Barras empilhadas: SWRD (azul) + AVGS (verde) + AVEM (teal)
- Tooltip: contribuição de cada ETF + total do setor + benchmark (MSCI World sector weight)
- Ordenado por peso decrescente

Visualização secundária (opcional): **radar/spider chart** — exposição setorial da carteira vs. MSCI World benchmark.

### Localização no Dashboard

```
Portfolio → Seção "Composição & Overlap"
  ├── ETFFactorComposition (existente)
  ├── FactorProfileChart (novo)
  ├── OverlapChart (DEV-overlap-detection)
  └── SectorExposureChart (esta feature)
```

---

## Decisões em Aberto

1. **Normalização**: % do portfolio total (inclui RF) vs. % do portfolio equity apenas?
   → Recomendação: % do equity (79.5%), mais legível para comparação com benchmarks
2. **Benchmark de comparação**: MSCI World sector weights (disponível no SSGA/MSCI site)
3. **Frequência**: mensal (mesmo ciclo dos holdings)
4. **Real Estate**: incluir? SWRD tem REIT exposure não trivial

---

## Dependência com DEV-overlap-detection

Ambas as features usam os mesmos holdings CSVs. Recomendado: implementar juntas no mesmo script de download/parse, evitar download duplicado. `reconstruct_overlap.py` vira `reconstruct_holdings.py` cobrindo ambas.

---

## Próximos Passos

1. Implementar junto com DEV-overlap-detection (mesma sprint)
2. Verificar se holdings SSGA para SWRD.L incluem setor GICS
3. Dev implementa `SectorExposureChart.tsx`
4. Head valida: Technology deve ser ~25-30% (SWRD é market-cap, heavy Tech)
