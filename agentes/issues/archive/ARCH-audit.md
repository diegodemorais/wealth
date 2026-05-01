# ARCH-audit: Auditoria de Arquitetura do Dashboard React

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | ARCH-audit |
| **Dono** | Arquiteto / Dev |
| **Status** | Concluído |
| **Prioridade** | Alta |
| **Participantes** | Arquiteto (auditoria), Dev (implementação) |
| **Criado em** | 2026-04-30 |
| **Origem** | Solicitação pós-auditoria privacy |
| **Concluído em** | 2026-04-30 |

---

## Findings por Categoria

### A. File Structure & Responsabilidade

**Severidade: ALTO**

Todas as 8 páginas excedem 500 LOC (limite recomendado). 6 de 8 excedem 750 LOC:

| Arquivo | LOC | Status |
|---------|-----|--------|
| `src/app/simulators/page.tsx` | 1840 | CRÍTICO — 4 sub-componentes inline |
| `src/app/fire/page.tsx` | 1636 | ALTO — 2 sub-componentes inline |
| `src/app/portfolio/page.tsx` | 1252 | ALTO |
| `src/app/assumptions/page.tsx` | 1107 | ALTO |
| `src/app/performance/page.tsx` | 893 | MÉDIO |
| `src/app/withdraw/page.tsx` | 865 | MÉDIO |
| `src/app/page.tsx` | 778 | MÉDIO |
| `src/app/backtest/page.tsx` | 755 | MÉDIO |

**Componentes inline que deveriam ser extraídos:**

- `fire/page.tsx:43` — `FloorUpsideFire` (render component com props e EChart interno)
- `fire/page.tsx:295` — `ContributionReturnsCrossover` (render component)
- `simulators/page.tsx:71` — `FireSimuladorSection` (seção standalone ~500 LOC)
- `simulators/page.tsx:568` — `WhatIfSection` (seção standalone ~800 LOC)
- `simulators/page.tsx:1381` — `StressChart` (chart component com props)
- `simulators/page.tsx:1514` — `StressTestSection` (seção standalone)
- `simulators/page.tsx:1627` — `CascadeSection` (seção standalone)

**Dado:** 7 sub-componentes definidos inline em arquivos de página.
**Interpretação:** Páginas grandes não causam bugs diretos, mas dificultam revisão, aumentam conflitos de merge, e contradizem "flat by default / extrair só no 2º uso real" do CLAUDE.md — pois esses componentes já têm mais de 1 uso potencial (simulators tem 4 seções independentes).

---

### B. Data Flow

**Severidade: MÉDIO**

**Inconsistência no padrão de data loading:**

- `src/app/page.tsx` (home) **não usa `usePageData()`** — implementa manualmente o mesmo padrão (`loadDataOnce`, `useDashboardStore`, `useUiStore`) com 6 linhas duplicadas. Todos os outros 7 pages usam `usePageData()` corretamente.
- `src/components/primitives/VersionFooter.tsx` chama `loadDataOnce` diretamente em um componente de apresentação — acopla um primitive à store sem necessidade (o dado já está na store quando VersionFooter renderiza).

**Dado:** `page.tsx` duplica 6 seletores de store que `usePageData()` já encapsula.
**Interpretação:** Não é um bug — `loadDataOnce` é idempotente. Mas cria divergência: se `usePageData()` for atualizado (ex: adicionar `derived`), `page.tsx` fica dessincronizado.

**Data flow OK:**
- Centralização via Zustand + `loadDataOnce()` está correta.
- Nenhum componente faz fetch próprio de dados (anti-pattern ausente).
- `dataWiring.ts` encapsula corretamente todo o compute derivado.

---

### C. Type Safety

**Severidade: ALTO**

**`any` em interfaces de componentes (props tipadas como `any`):**

| Arquivo | Tipo | Impacto |
|---------|------|---------|
| `src/components/dashboard/PerformanceSummary.tsx:35` | `data: any` | Sem verificação estática dos campos usados |
| `src/components/dashboard/BondStrategyPanel.tsx:17-23` | `bondPoolReadiness: any`, `bondPoolRunway: any`, `bondPoolRunwayByProfile: any`, `rf: any` | 4 props sem tipo |
| `src/components/charts/SurplusGapChart.tsx:26` | `data: any` | Props sem contrato |

**`any` explícita em parâmetros de ECharts formatters (aceitável como trade-off):**

Arquivos: `SequenceOfReturnsRisk.tsx`, `DrawdownHistoryChart.tsx`, `RollingMetricsChart.tsx` e outros — o pattern `formatter: (params: any) => ...` é idiomático para ECharts e a tipagem correta exige importar `CallbackDataParams` da lib. Não é crítico, mas pode ser melhorado.

**`any` em `DashboardData` (tipos/dashboard.ts):**

```typescript
fire?: any;        // linha 103
drift?: any;       // linha 109
rf?: any;          // linha 110
hodl11?: any;      // linha 111
[key: string]: any // linha 114
```

Isso força os consumidores a usar `(data as any)?.campo` em vez de receber type safety. Contagem de `as any` casts em arquivos de app: **226 ocorrências**.

**`handleChartResize` — dead code duplicado:**

Em 7 componentes, a função `handleChartResize` é **definida mas nunca chamada**. O hook `useChartResize()` em `src/hooks/useChartResize.ts` já implementa a funcionalidade corretamente e é usado em outros componentes:

Arquivos com dead code:
- `src/components/dashboard/HumanCapitalCrossover.tsx:10`
- `src/components/dashboard/BtcIndicatorsChart.tsx:10`
- `src/components/dashboard/RollingMetricsChart.tsx:10`
- `src/components/dashboard/DrawdownHistoryChart.tsx:11`
- `src/components/dashboard/AlphaVsSWRDChart.tsx:9`
- `src/components/charts/EventosVidaChart.tsx:9`
- `src/components/charts/DrawdownExtendedChart.tsx:10`

---

### D. ECharts Patterns

**Severidade: CRÍTICO (corrigido nesta sessão)**

**Bug confirmado:** `SequenceOfReturnsRisk.tsx` usava `'var(--card)'` em `itemStyle.borderColor` dentro de opções ECharts (canvas rendering). CSS variables não são resolvidas em contexto de canvas — o browser interpreta como string literal inválida, resultando em borda com cor `undefined`.

Linhas com o bug (antes da correção):
- `SequenceOfReturnsRisk.tsx:209` — heatmap `itemStyle.borderColor`
- `SequenceOfReturnsRisk.tsx:320` — scatter `itemStyle.borderColor` (linha series)
- `SequenceOfReturnsRisk.tsx:334` — scatter `itemStyle.borderColor` (guardrail points)

**Correção aplicada:** substituído por `EC.card` (constante hex `'#161b22'`) de `@/utils/echarts-theme`.

**Padrão correto já documentado** em `echarts-theme.ts`:
> "ECharts option objects are serialized and passed to the canvas renderer — they cannot receive CSS vars directly."

**Outros arquivos verificados** — CSS vars em outros chart files (`DrawdownHistoryChart`, `BtcIndicatorsChart`, etc.) estão exclusivamente em `style={}` props de elementos HTML (legítimo) ou em `style` inline de divs React — não em opções de canvas ECharts. Apenas `SequenceOfReturnsRisk.tsx` tinha o bug no canvas.

---

### E. Privacy Completeness

**Severidade: MÉDIO**

Componentes que não importam `privacyMode`, `fmtPrivacy`, ou `useEChartsPrivacy`:

| Arquivo | Contexto | Risco |
|---------|----------|-------|
| `src/components/dashboard/DrawdownRecoveryTable.tsx` | Exibe `depth_pct` (% de queda) — valor percentual público, não monetário | BAIXO — não expõe valores BRL |
| `src/components/fire/PFireDistribution.tsx` | Exibe percentuais de probabilidade (P(FIRE) %) — não monetários | BAIXO — não expõe valores BRL |

**Dado:** `DrawdownRecoveryTable` e `PFireDistribution` exibem apenas percentuais (drawdown %, P(FIRE) %), que não são dados financeiros sensíveis no contexto de privacy mode (que oculta valores patrimoniais em BRL/USD).

**Interpretação:** Não são violações de privacy genuínas — privacy mode foi projetado para ocultar valores monetários, não percentuais/probabilidades. Verificar com dev se a intenção é cobrir percentuais também.

**Sem violação encontrada em:** `ui/`, `auth/`, `layout/Footer.tsx` (exibe apenas data de geração).

---

### F. Performance

**Severidade: MÉDIO**

**`useMemo` ausente em opções de chart não memoizadas:**

Em `src/app/page.tsx` (home, 778 LOC), há inline computation de `wellnessSummary` (linhas 74-105) dentro do body da função componente, sem `useMemo`. Inclui múltiplos `.find()` sobre arrays de configuração. Recalcula em todo re-render de qualquer store subscriber.

**`useMemo` com dependência implícita em `data`:**

Em `src/app/fire/page.tsx`, `useMemo` nos charts usa `data` como dependência via `(data as any)?.campo`. Como `data` é um objeto grande da store, qualquer mudança regenera todos os charts simultaneamente — correto mas não granular.

**`handleChartResize` não conectado (dead code — ver C):**

7 componentes definem a função mas nunca a chamam. Esses componentes não têm resize handling. Quando estão dentro de `<CollapsibleSection>` e o usuário expande, o chart não recebe resize — pode aparecer cortado ou com dimensões erradas no primeiro render.

**Dado:** `useChartResize()` hook existe e funciona (usado corretamente em `GuardrailsMechanismChart`, `GlidePathChart`, etc.). Os 7 componentes com dead code estão sem resize handling efetivo.

---

## Implementações já feitas nesta sessão

| Fix | Arquivo | Linhas | Descrição |
|-----|---------|--------|-----------|
| ECharts CSS var bug | `src/components/fire/SequenceOfReturnsRisk.tsx` | 209, 320, 334 | Substituído `'var(--card)'` por `EC.card` em `itemStyle.borderColor` nos três pontos que passavam CSS vars ao canvas ECharts |

---

## Backlog para o Dev

Ordenado por severidade e esforço estimado:

### P1 — CRÍTICO / ALTO (resolver próximo sprint)

1. **`handleChartResize` dead code × 7 componentes** (ALTO — afeta UX real)
   - Substituir a função inline morta pelo hook `useChartResize()` em cada arquivo
   - Afeta: `HumanCapitalCrossover.tsx`, `BtcIndicatorsChart.tsx`, `RollingMetricsChart.tsx`, `DrawdownHistoryChart.tsx`, `AlphaVsSWRDChart.tsx`, `EventosVidaChart.tsx`, `DrawdownExtendedChart.tsx`
   - Padrão correto: `const chartRef = useChartResize(); <EChart ref={chartRef} ...>`
   - Impacto: charts dentro de CollapsibleSection não redimensionam corretamente após expand

2. **`PerformanceSummary.tsx` — `data: any` em Props** (ALTO — interface pública)
   - Arquivo: `src/components/dashboard/PerformanceSummary.tsx:35`
   - Ação: definir interface `PerformanceSummaryData` com os campos realmente acessados

3. **`BondStrategyPanel.tsx` — 4 props `any`** (ALTO — interface pública)
   - Arquivo: `src/components/dashboard/BondStrategyPanel.tsx:17-23`
   - Ação: definir `BondPoolReadiness`, `BondPoolRunway`, `RFData` interfaces mínimas

### P2 — MÉDIO (próximas 2 semanas)

4. **`page.tsx` (home) — migrar para `usePageData()`** (MÉDIO — debt de consistência)
   - Arquivo: `src/app/page.tsx:28-39`
   - Remover 6 seletores manuais, usar `const { data, derived, isLoading, dataError, privacyMode } = usePageData()`
   - Nota: `derived` precisa ser adicionado ao retorno de `usePageData()` (hoje retorna só `data`)

5. **`wellnessSummary` — adicionar `useMemo`** (MÉDIO — performance)
   - Arquivo: `src/app/page.tsx:74-105`
   - Dependências: `data, d, privacyMode`

6. **Inline sub-componentes em `simulators/page.tsx`** (MÉDIO — manutenibilidade)
   - Extrair para `src/app/simulators/` ou `src/components/simulators/`:
     - `FireSimuladorSection` → `simulators/FireSimuladorSection.tsx`
     - `WhatIfSection` → `simulators/WhatIfSection.tsx`
     - `StressChart` + `StressTestSection` → `simulators/StressTestSection.tsx`
     - `CascadeSection` → `simulators/CascadeSection.tsx`

7. **Inline sub-componentes em `fire/page.tsx`** (MÉDIO — manutenibilidade)
   - Extrair para `src/components/fire/`:
     - `FloorUpsideFire` (linha 43) → `src/components/fire/FloorUpsideFire.tsx`
     - `ContributionReturnsCrossover` (linha 295) → `src/components/fire/ContributionReturnsCrossover.tsx`

### P3 — BAIXO (backlog)

8. **ECharts formatter `params: any`** — substituir por `CallbackDataParams` do echarts
   - Vários arquivos; impacto baixo (parâmetro de callback interno)

9. **`DashboardData` interface — campos `any` em `types/dashboard.ts`**
   - Gradualmente tipar `fire`, `drift`, `rf`, `hodl11` com interfaces mínimas
   - Reduz os 226 `as any` casts nos arquivos de app e componentes

10. **`VersionFooter.tsx` — remover `loadDataOnce` direto**
    - Componente de apresentação não deveria disparar data load; layout já carrega dados

---

## Notas de Referência

- `EC.*` constantes: `src/utils/echarts-theme.ts`
- Hook resize correto: `src/hooks/useChartResize.ts`
- Hook data loading: `src/hooks/usePageData.ts`
- CLAUDE.md invariante: "flat by default: inline primeiro, extrair só no 2º uso real"
- CLAUDE.md invariante: "any proibido em código novo"
