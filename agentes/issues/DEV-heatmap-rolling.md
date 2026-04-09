# DEV-heatmap-rolling — Heatmap Mensal + Rolling Sharpe no Dashboard

**Dono:** Dev
**Prioridade:** 🟡 Média
**Criado em:** 2026-04-09
**Status:** Concluída — 2026-04-09 (v1.105)

## Objetivo

Substituir o gráfico de barras mensais por um heatmap ano×mês e adicionar um gráfico de Rolling Sharpe 12m. Decisão tomada após consulta ao CIO — ambos são upgrades do que existia, não adições.

## Decisão CIO (2026-04-09)

| Item | Decisão | Motivo |
|------|---------|--------|
| Heatmap mensal | Incorporar (substitui barras) | Upgrade — mesmos dados, mais densidade e legibilidade |
| Rolling Sharpe | Incorporar (novo chart) | Único item com utilidade real para decisões de alocação |
| Drawdown table | Tearsheet separado | Artefato de crise, não de rotina — ver HD-tearsheet-longrun |
| Histórico 20a proxies | Arquivado | False precision (AVGS lançado 2019) |

## Implementação

### Heatmap (S24)
- Substituiu `buildBollinger()` → `buildRetornoHeatmap()`
- Grade CSS table: linhas = anos, colunas = Jan–Dez + Acum.
- Cor: `rgba(34,197,94,...)` para positivo, `rgba(239,68,68,...)` para negativo (intensidade ∝ magnitude, clamp ±8%)
- Privacy mode: valores embrulhados em `<span class="pv">` dinamicamente; re-renderiza ao toggle
- Stats cards abaixo: média/mês, σ, % meses positivos, melhor mês, pior mês
- Zero hardcoded: lê de `DATA.bollinger.dates/values`

### Rolling Sharpe (S24b)
- Nova função `buildRollingSharp()`
- Janela 12m, σ populacional, anualizado `× √12`
- Cores por ponto: verde ≥ 1, amarelo 0–1, vermelho < 0
- Linhas de referência: Sharpe=1 (tracejada branca) e zero (tracejada vermelha)
- Privacy mode: Sharpe é ratio adimensional — não expõe valores absolutos, exibição mantida

### Privacy mode
- `_applyPrivacyCharts()` chama `buildRetornoHeatmap()` após toggle para re-renderizar com/sem spans `.pv`
- Tooltips do heatmap mostram `***` em modo privado

## Resultado

Dashboard v1.105. Seção "Retornos Mensais — Heatmap" + "Rolling Sharpe — 12 meses" na aba Perf.
