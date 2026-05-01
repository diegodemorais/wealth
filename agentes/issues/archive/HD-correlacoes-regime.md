# HD-correlacoes-regime: Correlações regime-dependent — stress vs calm

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-correlacoes-regime |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Média |
| **Criado em** | 2026-03-31 |
| **Concluido em** | 2026-03-31 |
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

---

## Análise (2026-03-31)

### Dados

- 1.474 dias úteis (6 anos, abr/2020 = COVID crash capturado)
- Proxies: AVUV (≈AVGS) e VWO (≈AVEM) — UCITS sem histórico de crise

### Cobertura de regimes

| Regime | Dias | % |
|--------|------|---|
| Calm (VIX <20) | 818 | 55% |
| Stress (VIX 20-30) | 535 | 36% |
| Crise (VIX >30) | 121 | 8% |

### Correlações por regime

| Par | Calm | Stress | Crise | Δ(crise-calm) |
|-----|------|--------|-------|--------------|
| SWRD ↔ AVGS(proxy) | 0.456 | 0.525 | 0.453 | **-0.004** ✅ estável |
| SWRD ↔ AVEM(proxy) | 0.495 | 0.514 | 0.509 | +0.014 ✅ estável |
| SWRD ↔ JPGL | 0.838 | 0.941 | **0.964** | **+0.126** ⚠️ converge |
| AVGS(p) ↔ AVEM(p) | 0.450 | 0.532 | **0.742** | **+0.292** ⚠️ converge |
| AVGS(p) ↔ JPGL | 0.535 | 0.562 | 0.490 | -0.046 ✅ estável |
| AVEM(p) ↔ JPGL | 0.448 | 0.456 | 0.488 | +0.041 ✅ estável |

### Impacto no stress test (SWRD -30%)

| Modelo | Impacto equity | Impacto portfolio | R$ perdido |
|--------|---------------|-------------------|------------|
| Correlações calm (atual) | -21.9% | -17.3% | R$584k |
| Correlações crise (real) | -22.7% | -18.0% | R$606k |
| Pior caso (corr=1.0) | -30.0% | -23.7% | R$799k |

Gap calm→crise: +R$22k de perda subestimada — **material mas não decisivo**.

### Achados principais

1. **SWRD ↔ JPGL converge em crise** (0.838 → 0.964): JPGL perde seu benefício de diversificação no pior momento. Faz sentido — multi-factor com momentum tende a vender o que está em baixa, mas em crise tudo está em baixa.

2. **AVGS ↔ AVEM converge significativamente** (0.450 → 0.742): small value e EM são ambos "risco puro" em crise — ambos vendidos juntos em flight-to-quality.

3. **Surpresa: SWRD ↔ AVGS estável** (0.456 → 0.453): small value NÃO converge com o mercado amplo em crises. Isso valida o papel de AVGS como diversificador real dentro do bloco equity.

4. **Gap financeiro é pequeno** (~R$22k em R$3.4M): a subestimação do stress test é real mas de magnitude limitada.

---

## Conclusão

**Hipótese confirmada parcialmente.** Correlações convergem em crises, mas não uniformemente:
- Convergência real: SWRD↔JPGL e AVGS↔AVEM
- Diversificação preservada: SWRD↔AVGS (surpresa positiva)

**Nenhuma mudança de alocação necessária.** A análise reforça a estratégia existente:
- Diversificação intra-equity é parcial — não protege em crise
- O bond tent (IPCA+ 15%) é a proteção real de sequence of return risk
- AVGS mantém seu papel como diversificador vs mercado mesmo em crises

**Para revisão jan/2027:** monitorar se SWRD↔AVGS mantém essa descorrelação à medida que AVGS cresce em AUM e adota perfil mais mainstream.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Script** | `portfolio_analytics.py --correlacoes` implementado |
| **Conhecimento** | SWRD↔JPGL converge (0.838→0.964). AVGS↔AVEM converge (0.450→0.742). SWRD↔AVGS estável — diversificação real |
| **Decisão** | Sem mudança de alocação. Bond tent é a proteção real, não diversificação intra-equity |
| **Revisão** | Retestar em jan/2027 com dados AVGS.L real (substituir proxy AVUV) |
