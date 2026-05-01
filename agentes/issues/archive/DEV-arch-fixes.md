# DEV-arch-fixes: Implementar Backlog de Arquitetura (ARCH-audit)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-arch-fixes |
| **Dono** | Dev |
| **Status** | Done ✅ |
| **Concluido em** | 2026-04-30 |
| **Prioridade** | 🟡 Média |
| **Participantes** | Dev (implementação) |
| **Criado em** | 2026-04-30 |
| **Origem** | ARCH-audit concluída — backlog P1/P2/P3 extraído |
| **Concluido em** | — |

---

## Contexto

Auditoria de arquitetura ARCH-audit (2026-04-30) identificou issues em 6 categorias. Um bug crítico (CSS vars em canvas ECharts) já foi corrigido. Esta issue implementa o restante do backlog priorizado.

Referência completa: `agentes/issues/ARCH-audit.md` § Backlog para o Dev.

---

## Backlog Priorizado

### P1 — CRÍTICO / ALTO

- [ ] **`handleChartResize` dead code × 7 componentes** — substituir função inline morta por `useChartResize()` hook
  - `HumanCapitalCrossover.tsx`, `BtcIndicatorsChart.tsx`, `RollingMetricsChart.tsx`, `DrawdownHistoryChart.tsx`, `AlphaVsSWRDChart.tsx`, `EventosVidaChart.tsx`, `DrawdownExtendedChart.tsx`
  - Padrão correto: `const chartRef = useChartResize(); <EChart ref={chartRef} ...>`
  - Impacto: charts em CollapsibleSection não redimensionam corretamente após expand

- [ ] **`PerformanceSummary.tsx` — `data: any`** — definir interface `PerformanceSummaryData`
  - Arquivo: `src/components/dashboard/PerformanceSummary.tsx:35`

- [ ] **`BondStrategyPanel.tsx` — 4 props `any`** — definir interfaces mínimas
  - Arquivo: `src/components/dashboard/BondStrategyPanel.tsx:17-23`
  - Interfaces: `BondPoolReadiness`, `BondPoolRunway`, `RFData`

### P2 — MÉDIO

- [ ] **`page.tsx` (home) — migrar para `usePageData()`**
  - Arquivo: `src/app/page.tsx:28-39`
  - Remover 6 seletores manuais; verificar se `derived` precisa ser adicionado ao hook

- [ ] **`wellnessSummary` — adicionar `useMemo`**
  - Arquivo: `src/app/page.tsx:74-105`
  - Dependências: `data, d, privacyMode`

- [ ] **Extrair sub-componentes inline de `simulators/page.tsx`**
  - `FireSimuladorSection` → `src/app/simulators/FireSimuladorSection.tsx`
  - `WhatIfSection` → `src/app/simulators/WhatIfSection.tsx`
  - `StressChart` + `StressTestSection` → `src/app/simulators/StressTestSection.tsx`
  - `CascadeSection` → `src/app/simulators/CascadeSection.tsx`

- [ ] **Extrair sub-componentes inline de `fire/page.tsx`**
  - `FloorUpsideFire` (linha 43) → `src/components/fire/FloorUpsideFire.tsx`
  - `ContributionReturnsCrossover` (linha 295) → `src/components/fire/ContributionReturnsCrossover.tsx`

### P3 — BAIXO

- [ ] **ECharts formatter `params: any`** — substituir por `CallbackDataParams`
- [ ] **`DashboardData` interface** — gradualmente tipar `fire`, `drift`, `rf`, `hodl11` (reduz 226 `as any` casts)
- [ ] **`VersionFooter.tsx`** — remover `loadDataOnce` direto de componente de apresentação

---

## Conclusao

> A preencher após implementação.
