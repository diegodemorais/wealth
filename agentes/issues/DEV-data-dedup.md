# DEV-data-dedup — Deduplicação de Séries no Pipeline e data.json

**Aberta:** 2026-05-01  
**Dono:** Dev  
**Prioridade:** 🟢 Baixa (otimização, não bug)  
**Status:** Backlog

---

## Contexto

Para o RiskReturnScatter (scatter de backtest), o pipeline baixa preços diários/mensais de vários ETFs.
Auditoria do Arquiteto+Integrator identificou 3 oportunidades de deduplicação.

---

## Achados

### Duplicação 1 — drawdown_extended.periods reduntante (~17.9 KB, 7.7% do JSON)

`drawdown_extended.periods.{medium,long,academic}` são matematicamente deriváveis dos arrays já no JSON:
- `medium` = f(`backtest.target`) — _price_to_drawdown_pct trivial
- `long`   = f(`backtestR5.target`)
- `academic` = f(`backtest_r7.cumulative_returns.target`)

O único dado **exclusivo** nessa seção é `periods.real` (drawdown real via TWR histórico) + `summary.real_max_dd_target`.

**Fix:** Mover derivação para `DrawdownExtendedChart.tsx` em TypeScript. Remover os 3 períodos sintéticos do JSON.  
**Esforço:** Médio. Requer refactor de interface do componente + update de 1 teste em page-integration.test.ts (linha 219).

### Duplicação 2 — retornos_mensais.values == .twr_pct (~386 bytes)

Campos idênticos (verificado: 60 valores iguais). `.values` é alias legado.  
`compute_vol_realizada` e `compute_retorno_decomposicao` já fazem fallback: `.get("twr_pct") or .get("values", [])`.

**Fix:** Remover `.values` do pipeline. Atualizar `compute_rolling_sharpe` linha 1260 para ler `.twr_pct`.  
**Esforço:** Muito baixo — 1 linha no pipeline.

### Duplicação 3 — SWRD.L + AVGS.L baixados 3× por run (sem cache compartilhado)

| Função | Período | Cache |
|--------|---------|-------|
| `get_factor_rolling()` linha 1353 | 2019-01 até hoje (84 meses) | nenhum |
| `get_factor_signal()` linha 1418 | 2024-10 até hoje (18 meses) | nenhum |
| `compute_risk_return_by_bucket()` linha 3818 | 2012-01 até hoje (156 meses) | fetch_cache.json 24h TTL |

A série 2012+ do `risk_return_scatter` já contém os dados que as outras precisam.  
**Fix:** Extrair `_get_shared_price_series(ticker, start)` utilitária. `factor_rolling` e `factor_signal` usam slice da série maior já cacheada.  
**Risco:** `factor_rolling` usa `data[COLUMN_CLOSE]` com MultiIndex — abstração precisa retornar preços brutos, não retornos.  
**Esforço:** Baixo.

---

## Priorização Sugerida

| # | Oportunidade | Impacto | Esforço | Recomendação |
|---|---|---|---|---|
| 1 | Remover `.values` legado | trivial | muito baixo | Fazer logo — sem risco |
| 2 | Cache compartilhado yfinance | -2-3 calls/run | baixo | Juntar com fetch_with_retry (DEV-pipeline-gaps-p2 P3) |
| 3 | drawdown_extended no React | -7.7% JSON | médio | Avaliar quando refatorar DrawdownExtendedChart |

---

## Arquivos Relevantes

- `scripts/generate_data.py` — funções `compute_risk_return_by_bucket` (L3759), `get_factor_rolling` (L1339), `get_factor_signal` (L1402), `compute_rolling_sharpe` (L1260)
- `react-app/src/components/charts/DrawdownExtendedChart.tsx`
- `react-app/src/components/dashboard/PerformanceSummary.tsx`
- `react-app/src/__tests__/page-integration.test.ts` linha 219
