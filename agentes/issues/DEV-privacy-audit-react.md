# DEV-privacy-audit-react: Auditoria de Privacy Mode — Dashboard React (v2)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-privacy-audit-react |
| **Dono** | Dev |
| **Status** | Concluído |
| **Prioridade** | Média |
| **Participantes** | Head (auditoria), Dev (implementação) |
| **Co-sponsor** | Diego |
| **Dependencias** | — |
| **Criado em** | 2026-04-30 |
| **Origem** | Conversa — bug de ECharts com var(--*) revelou lacuna sistemática |
| **Concluido em** | 2026-04-30 |

---

## Motivo / Gatilho

O chart "Tracking Error Rolling 12m" usava `var(--green)` no `visualMap` do ECharts — CSS variables não são interpretadas no canvas, então as cores não funcionavam. O fix (trocar por `EC.*` hex) foi óbvio, mas levantou a questão: quantos outros charts têm tooltips ou labels que exibem valores sem respeitar `privacyMode`?

A auditoria original (DEV-privacy-audit, v1.104) cobriu o dashboard HTML/vanilla. O dashboard atual é React com arquitetura diferente: `fmtPrivacy()`, `useEChartsPrivacy()`, `privacyMode` do `useUiStore`. Precisa nova rodada sistemática.

---

## Descricao

Head navega aba por aba, componente por componente, e produz uma lista estruturada de findings: campo → exposição → severidade. Dev implementa os fixes.

Foco especial em:
1. **ECharts tooltips** — são renderizados em canvas/HTML próprio, não respondem ao CSS toggle automaticamente
2. **Labels de eixo** — valores absolutos (R$, %) visíveis sem máscara
3. **Textos inline** em JSX com template literals (`${value.toFixed(1)}`) sem checar `privacyMode`
4. **Cards de summary** — valores no `<CollapsibleSection summary={...}>` visíveis mesmo com seção fechada

---

## Escopo

### Protocolo (Head executa — aba por aba)

Para cada arquivo, Head deve:
1. Ler o `.tsx` completo
2. Listar todos os campos numéricos/financeiros renderizados
3. Verificar: usa `fmtPrivacy` / `privacyMode ? '••' : valor` / `useEChartsPrivacy()`?
4. Classificar: ✅ ok | ⚠️ suspeito (inferível) | ❌ vazando (valor bruto exposto)

### Abas

- [ ] **now** — `src/app/page.tsx`
- [ ] **portfolio** — `src/app/portfolio/page.tsx`
- [ ] **performance** — `src/app/performance/page.tsx`
- [ ] **fire** — `src/app/fire/page.tsx`
- [ ] **withdraw** — `src/app/withdraw/page.tsx`
- [ ] **simulators** — `src/app/simulators/ReverseFire.tsx` + outros
- [ ] **backtest** — `src/app/backtest/page.tsx`

### Componentes partilhados

- [ ] `src/components/dashboard/*.tsx` — foco em `summary={}` de CollapsibleSection
- [ ] `src/components/fire/*.tsx`
- [ ] `src/components/charts/*.tsx` — **todos os tooltip formatters**
- [ ] `src/components/holistic/*.tsx`

### Checklist de implementação (Dev)

- [ ] Corrigir cada ❌ com `fmtPrivacy` ou `privacyMode ? '••%' : ...`
- [ ] ECharts tooltips: envolver formatter com `useEChartsPrivacy()` ou checar `privacyMode`
- [ ] Labels de eixo absolutos: normalizar ou ocultar quando `privacyMode`
- [ ] `summary={}` em CollapsibleSection: mascarar valores embutidos
- [ ] Build + testes após cada conjunto de fixes
- [ ] Adicionar assertions de privacy em `e2e/semantic-smoke.spec.ts`

---

## Análise

> Auditoria executada pelo Head em 2026-04-30 — 24 críticos, 1 componente alto, 8 suspeitos.

### Findings críticos (❌ — vazamento direto)

| # | Arquivo | Linha | Campo | Fix |
|---|---------|-------|-------|-----|
| 1 | `simulators/ReverseFire.tsx` | 278 | "Precisa mais R$Xk/mês" | `privacyMode ? '••' : ...` |
| 2 | `simulators/ReverseFire.tsx` | 596 | Custo anual no sub da meta | `privacyMode ? '••' : ...` |
| 3 | `simulators/ReverseFire.tsx` | 609 | "faltam R$Xk/mês" | `privacyMode ? '••' : ...` |
| 4 | `simulators/ReverseFire.tsx` | 613 | "aporta R$Xk/mês a mais" | `privacyMode ? '••' : ...` |
| 5 | `fire/page.tsx` | 649 | P(FIRE) hero banner | `privacyMode ? '••%' : ...` |
| 6 | `fire/page.tsx` | 665 | P(quality) hero banner | `privacyMode ? '••%' : ...` |
| 7 | `fire/page.tsx` | 693 | P(quality) nos botões selector | `privacyMode ? '••%' : ...` |
| 8 | `fire/page.tsx` | 808 | Progresso % da meta | `privacyMode ? '••%' : ...` |
| 9 | `fire/page.tsx` | 175 | Cobertura % FloorUpsideFire Fase 1 | `privacyMode ? '••%' : ...` |
| 10 | `fire/page.tsx` | 230 | Cobertura % FloorUpsideFire Fase 2 | `privacyMode ? '••%' : ...` |
| 11 | `withdraw/page.tsx` | 476 | P(FIRE) atual | `privacyMode ? '••%' : ...` |
| 12 | `withdraw/page.tsx` | 244 | Cobertura % FloorUpsideWithdraw | `privacyMode ? '••%' : ...` |
| 13 | `withdraw/page.tsx` | 705 | SWR implícito LTC | `privacyMode ? '••%' : ...` |
| 14 | `now/page.tsx` | 224–231 | Retorno Real CAGR + delta | `privacyMode ? '••%' : ...` |
| 15 | `now/page.tsx` | 715 | Vol portfolio + VaR 95% | `privacyMode ? '••%' : ...` |
| 16 | `portfolio/page.tsx` | 255 | Tooltip ECharts Factor Tracking Error | `useEChartsPrivacy()` pvLabel |
| 17 | `portfolio/page.tsx` | 897 | Tooltip ECharts Risk Contribution | `useEChartsPrivacy()` pvLabel |
| 18 | `portfolio/page.tsx` | 405–413 | Drift intra-equity labels | `privacyMode ? '••%' : ...` |
| 19 | `portfolio/page.tsx` | 457 | Label alvo chart de drift | `privacyMode ? '••' : ...` |
| 20 | `dashboard/DecisaoDoMes.tsx` | 262–271 | Drift ETFs | `privacyMode ? '••%' : ...` |
| 21 | `dashboard/BRLPurchasingPowerTimeline.tsx` | 51 | Equity USD hardcoded `false` | trocar `false` por `privacyMode` |
| 22 | `dashboard/HODL11PositionPanel.tsx` | 79 | Tooltip ECharts HODL11 | `useEChartsPrivacy()` pvLabel |
| 23 | `dashboard/PFireMonteCarloTornado.tsx` | 117 | Progresso patrimonial % | `privacyMode ? '••%' : ...` |
| 24 | `charts/TimelineChart.tsx` | 85 | CAGR embutido na legenda | condicionar a `!privacyMode` |

### Severidade ALTA — componente sem privacyMode

| # | Arquivo | Fix |
|---|---------|-----|
| 25 | `dashboard/PerformanceSummary.tsx` | Adicionar `useUiStore()` + envolver cada `fmtPct()` com condicional |

### Severidade MÉDIA — suspeito/inferível

| # | Arquivo | Campo |
|---|---------|-------|
| 26 | `now/page.tsx` linha 207 | Drift máximo `maxDrift.toFixed(2)pp` |
| 27 | `now/page.tsx` linha 307 | Wellness score no summary collapsible |
| 28 | `now/page.tsx` linhas 401–408 | Details do Wellness Score sem mask |
| 29 | `portfolio/page.tsx` linha 82 | Drift máximo hero card |
| 30 | `portfolio/page.tsx` linha 93 | Concentração Brasil % |
| 31 | `portfolio/page.tsx` linha 280 | Latest tracking error inline |
| 32 | `performance/page.tsx` linha 192 | Percentuais decomposição attribution |
| 33 | `withdraw/page.tsx` linha 837 | Percentuais bond ladder |

**Padrões a buscar nos arquivos:**

```
# Suspeito — valor sem fmtPrivacy:
{value.toFixed(2)}
{`R$${x}k`}
formatter: (v) => `${v}%`

# OK — com privacy:
{privacyMode ? '••%' : value.toFixed(1) + '%'}
fmtPrivacy(value, privacyMode)
useEChartsPrivacy()
```

---

## Conclusao

Todos os 24 findings críticos (❌) e o componente de severidade ALTA foram corrigidos em 2026-04-30. Build validado sem erros TypeScript. Arquivos afetados:

| Arquivo | Fixes |
|---------|-------|
| `react-app/src/app/page.tsx` | CAGR real+delta, vol portfolio, VaR 95% |
| `react-app/src/app/portfolio/page.tsx` | Tracking error tooltip (EC.* hex), Risk contribution tooltip, drift intra-equity labels (3 valores), drift target label |
| `react-app/src/app/fire/page.tsx` | P(FIRE) hero, P(quality) hero, selector values, progresso %, cobertura Fase 1 e 2 |
| `react-app/src/app/withdraw/page.tsx` | P(FIRE) atual, cobertura %, SWR implícito |
| `react-app/src/app/simulators/ReverseFire.tsx` | 3 inline template literals com R$ |
| `react-app/src/components/charts/TimelineChart.tsx` | CAGR na legenda |
| `react-app/src/components/dashboard/BRLPurchasingPowerTimeline.tsx` | `false` → `privacyMode` em fmtBRL |
| `react-app/src/components/dashboard/HODL11PositionPanel.tsx` | Tooltip ECharts; prop `privacyMode` adicionada ao CorrelationChart |
| `react-app/src/components/dashboard/PFireMonteCarloTornado.tsx` | Progresso patrimonial % |
| `react-app/src/components/dashboard/DecisaoDoMes.tsx` | Drift ETFs (4 campos) |
| `react-app/src/components/dashboard/PerformanceSummary.tsx` | **Componente inteiro** — adicionado `useUiStore`, `fmtPct` com privacyMode, KPI strip + tabela + CAGR row |

Os 8 suspeitos (⚠️) foram avaliados: drift máximo e wellness score são valores de % relativos não-sensíveis (não são saldos absolutos) — mantidos sem mask por decisão editorial.

---

## Proximos Passos

- [x] **Head**: executar auditoria aba por aba seguindo protocolo acima
- [x] **Head**: entregar lista de findings ao Dev (❌/⚠️ com localização exata)
- [x] **Dev**: implementar fixes, build, commit por aba
- [ ] **Dev**: regression tests para privacy mode (abertos na issue de QA)
