# HD-correlacoes-regime: Correlações regime-dependent — stress vs calm

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-correlacoes-regime |
| **Dono** | 00 Head |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Criado em** | 2026-03-31 |
| **Origem** | Revisão proativa — stress test assume correlações fixas, mas em crises correlações convergem para ~0.95. Maior blind spot quantitativo atual. |

---

## Problema

O stress test de Quant Crisis 2.0 em `portfolio_analytics.py` usa choques fixos:
- AVGS -60%, JPGL -40% (crise 2.0)
- Correlações usadas: médias do período completo (calm + stress)

**O blind spot:** correlações entre ETFs de equity convergem em crises. Dados reais (COVID 2020):
- SWRD↔AVGS normal: ~0.86 → em crise: ~0.95
- SWRD↔JPGL normal: ~0.95 → em crise: ~0.97

Se o modelo usa correlações de calm para simular stress, **subestima o impacto real de uma crise** porque assume que os ETFs se diversificam — mas em crises eles todos caem juntos.

---

## Escopo

### Análise a fazer

1. **Classificar regimes** usando VIX: calm (VIX < 20), stress (VIX 20-30), crise (VIX > 30)
2. **Calcular matrizes de correlação** por regime para SWRD/AVGS/AVEM/JPGL
3. **Re-rodar stress test** com correlações de crise
4. **Comparar** impacto no portfolio vs modelo atual

### Dados

- VIX: `yfinance` ticker "^VIX"
- ETFs: retornos diários já disponíveis via `yfinance`
- Período: 2020-2026 (inclui COVID crash, subida de juros 2022, normalização 2023-2026)

### Output esperado

| Correlação | Calm (VIX<20) | Stress (VIX 20-30) | Crise (VIX>30) |
|-----------|---------------|---------------------|----------------|
| SWRD↔AVGS | ? | ? | ? |
| SWRD↔AVEM | ? | ? | ? |
| SWRD↔JPGL | ? | ? | ? |
| AVGS↔AVEM | ? | ? | ? |
| AVGS↔JPGL | ? | ? | ? |
| AVEM↔JPGL | ? | ? | ? |

### Decisão que habilita

- Recalibrar cenários de stress com correlações realistas
- Avaliar se o bond tent (IPCA+ 18%) é suficiente dado o drawdown real com correlações de crise
- Pode mudar o sizing do IPCA+ se equity é mais correlacionado em crise do que assumido

---

## Prioridade e timing

Não urgente para decisões imediatas. Útil para a **próxima revisão anual** (jan/2027) quando reavaliarmos alocação IPCA+ vs equity.

Implementação: extensão do `portfolio_analytics.py` com análise de regime usando VIX.
