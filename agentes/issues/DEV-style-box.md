# DEV-style-box: Style Box do Portfolio Consolidado

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-style-box |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | P3 — Baixa |
| **Participantes** | Dev (implementação), Head (decisão design) |
| **Dependencias** | Holdings públicos ETFs + dados de estilo (valor de mercado, P/B, P/E por ação) |
| **Criado em** | 2026-05-01 |
| **Origem** | Benchmark Morningstar (Style Box 9×9) — XX-benchmark-morningstar |

---

## Descrição

Plotar a posição da carteira equity consolidada (SWRD + AVGS + AVEM) no grid **mercap × estilo** (Large/Mid/Small × Value/Blend/Growth). Entender o tilt real combinado dos 3 ETFs — ex: "minha carteira equity está em Large Value ou Large Blend?"

Equivalente ao **Stock Style Box 9×9** do Morningstar.

---

## Valor

- Verificar se o tilt Value (objetivo) está de fato presente no portfolio consolidado
- Comparar com benchmark (MSCI World = Large Blend)
- Monitorar drift de estilo ao longo do tempo

---

## Dados Necessários

### Opção A — Via Factor Loadings (aproximação, sem holdings detalhados)

Usar os factor loadings já computados (HML para Value/Growth, SMB para Size):
- **HML loading** → posição no eixo Value-Growth (HML alto = Value; HML baixo/negativo = Growth)
- **SMB loading** → posição no eixo Size (SMB alto = Small; SMB baixo = Large)
- Mapear para grade 3×3 por threshold (ex: HML >0.3 = Value; HML -0.3 a 0.3 = Blend; <-0.3 = Growth)

**Prós:** Já temos os dados. Rápido de implementar.
**Contras:** Aproximação, não coincide exatamente com Morningstar (metodologia diferente).

### Opção B — Via Holdings Bottom-Up (preciso, requer mais dados)

Para cada ação nos holdings dos ETFs: calcular P/B, P/E, mercap médio.
- **Mercap:** Large >$10B; Mid $2-10B; Small <$2B
- **Estilo:** P/B e crescimento de lucros → Value/Blend/Growth

**Prós:** Metodologia Morningstar-equivalente.
**Contras:** Requer dados de fundamentals por ação (não gratuitos facilmente).

**Recomendação:** Implementar Opção A primeiro (factor-based, mais rápido), Opção B como evolução futura.

---

## Especificação Técnica (Opção A)

### Backend (adição ao `generate_data.py`)

```python
def compute_style_box(factor_loadings):
    # Para cada ETF: mapear HML e SMB loadings para posição 3x3
    # Portfolio consolidado: média ponderada (50% SWRD, 30% AVGS, 20% AVEM)
    
    def classify_value(hml):
        if hml > 0.25: return 'Value'
        if hml < -0.10: return 'Growth'
        return 'Blend'
    
    def classify_size(smb):
        if smb > 0.20: return 'Small'
        if smb < -0.05: return 'Large'
        return 'Mid'
    
    # Retorna: {'swrd': {value: 'Blend', size: 'Large'}, 'avgs': {...}, 'portfolio': {...}}
    # + posição numérica (x: -1 a +1 em Value, y: -1 a +1 em Size) para scatter
```

### Frontend (`react-app/src/components/charts/StyleBoxChart.tsx`)

Visualização: **grade 3×3** com células coloridas por intensidade.

- 9 células: Small Value, Small Blend, Small Growth / Mid... / Large Value, Blend, Growth
- Bolinha indicando posição do portfolio consolidado
- Bolinhas menores para cada ETF individual (com cor própria)
- Tooltip: loading exato, período de estimação, disclaimer metodológico

Implementação: CSS grid 3×3 puro (sem ECharts necessário para este layout simples).

### Localização

```
Portfolio → Seção "Factor Loadings" → abaixo de FactorProfileChart
```

---

## Limitações

1. **Classificação por factor loadings ≠ classificação Morningstar** (Morningstar usa P/B, mercap real)
2. **Loadings são backwards-looking** (3-5 anos de regressão) — drift de estilo pode não estar capturado imediatamente
3. **AVGS + AVEM são explicitamente value** — resultado esperado é Large-to-Mid Value; surpreendente seria detectar Growth

---

## Decisões em Aberto

1. Opção A (factor) vs. Opção B (holdings bottom-up)?
2. Incluir benchmark MSCI World como referência na grade?
3. Mostrar drift temporal (style box ao longo de 4 períodos: 2020/2021/2022/2023)?

---

## Próximos Passos

1. Head decide Opção A vs. B
2. Se Opção A: Dev implementa em ~1 dia (dados já existem)
3. Se Opção B: aguardar DEV-overlap-detection (mesmos holdings CSV)
