---
name: DEV-calc-centralization
description: Centralização de cálculos duplicados no dashboard React — 14 categorias auditadas por Quant+Dev
type: issue
status: doing
owner: Dev + Quant
priority: 🔴 Alta
opened: 2026-04-17
---

# DEV-calc-centralization — Centralização de Cálculos Duplicados

## Contexto

Auditoria completa (Quant + Dev) identificou **14 categorias de duplicação** em cálculos e transformações espalhados por múltiplos componentes/abas do dashboard React. Cálculos financeiros idênticos com lógicas divergentes criam risco de resultados inconsistentes dependendo de qual aba o usuário está olhando.

---

## Findings — Por Prioridade

### 🔴 CRÍTICO — Risco de resultado errado

| # | Cálculo | Locais | Divergência |
|---|---------|--------|-------------|
| C1 | **`calcFireYear`** — unidade de retorno oposta | `fire/page.tsx:7` vs `simulators/page.tsx:44` | `fire` recebe fração (0.0485); `simulators` recebe % (4.85) — erro 100x se reusada sem conversão |
| C2 | **P(FIRE) — 3 semânticas distintas** | 6 locais | `FireSimulator`: razão de cobertura determinística. `simulators`: percentil SWR. `fire/page` + `page`: probabilidade MC real |
| C3 | **Monte Carlo JS — 2 implementações** | `src/utils/montecarlo.ts` vs `simulators/page.tsx:519` | `montecarlo.ts` projeta em meses, sem fase FIRE. `StressChart` projeta em anos com acumulação/desacumulação. Nenhum tem seed — MC React ≠ MC Python |

### 🔴 ALTO — Erros silenciosos em tempo

| # | Cálculo | Locais | Divergência |
|---|---------|--------|-------------|
| A1 | **Semáforo P(FIRE) — threshold inconsistente** | 7 locais | NOW tab ≥88% = verde; FIRE tab ≥90% = verde. Mesmo P, cores diferentes |
| A2 | **Hardcoded `2026` e `39`** | `fire/page.tsx:15`, `simulators:55`, `TimeToFireProgressBar:29` | Em 2027, `calcFireYear` retornará anos errados; `TimeToFireProgressBar` sempre assumirá 39 anos |
| A3 | **SWR efetivo — fallback muda fórmula** | `withdraw/page.tsx:96` | Se `p10_patrimonio` ausente, usa `swrPercentis.p10` (taxa, não patrimônio) — denominador muda silenciosamente |

### 🟡 MÉDIO — Inconsistência de UX

| # | Cálculo | Locais | Divergência |
|---|---------|--------|-------------|
| M1 | **Wellness Score — 3 fórmulas** | `wellness.ts`, `dataWiring.ts:454`, `useWellnessScore.ts` | Pesos, dimensões e escala incompatíveis. "Excelente" vs "Atenção" com os mesmos dados |
| M2 | **`fmtBrl` — 14 implementações** | 13 locais ignoram `formatters.ts` | 1 vs 2 casas decimais — R$3.4M vs R$3.37M para o mesmo valor |
| M3 | **`fmtPct` — 8 implementações** | 7 locais ignoram `formatters.ts` | Convenção oposta: canônica espera fração; 3 locais esperam % |
| M4 | **Privacy masking inline** | 52 arquivos | `'••••'` (4 pts) vs `'••'` (2 pts) vs `blur()` — sem padrão único |

### 🟢 BAIXO — Ruído técnico

| # | Padrão | Locais | Impacto |
|---|--------|--------|---------|
| B1 | **Boot pattern de página** repetido | 6 páginas | Texto de loading diverge; sem hook `usePageData` |
| B2 | **`patrimônio total`** buscado 3x no mesmo arquivo | `simulators/page.tsx:146,409,662` | Sem consequência hoje, mas frágil |
| B3 | **`new Date().getFullYear()`** | 6 locais | Ignora `data.premissas.ano_atual` — pode divergir em builds noturnos |
| B4 | **`retorno * 100`** conversão | 5x em `simulators/page.tsx` | DRY violation — sem consequência atual |
| B5 | **`patrimônio hardcoded`** | `FireSimulator.tsx:19` = `3_589_111` | Default desatualizado se prop não passada |

---

## Plano de Centralização

### Arquivo destino: `src/utils/fire.ts` (novo)
- `calcFireYear(aporte, retornoFrac, custo, currentAge, patrimonio, swrTarget)` — retorno sempre fração
- `pfireColor(p: number): string` — threshold único: ≥90 green, ≥85 yellow, else red
- `calcAge(anoAtual: number, anoNasc: number): number`

### Arquivo destino: `src/utils/montecarlo.ts` (único motor MC)
- `StressChart` em simulators passa a usar `montecarlo.ts`
- Adicionar `seed` opcional para reprodutibilidade

### Arquivo destino: `src/utils/formatters.ts` (ampliar)
- `fmtBrl(v, opts)` com suporte a escala M/k e privacy
- `fmtPct(v, opts)` com flag `fromFraction: boolean`
- Remover 14 closures locais

### Arquivo destino: `src/hooks/usePageData.ts` (novo)
- Encapsula boot pattern: `loadDataOnce`, `isLoading`, `dataError`, `privacyMode`
- Usado por todas as 6 páginas

### Arquivo destino: `src/utils/dataWiring.ts` (consolidar wellness)
- `useWellnessScore.ts` como única fonte — remover `wellness.ts` e cálculo inline em `dataWiring.ts`

---

## Checklist de Execução

- [x] C1: `calcFireYear` → `src/utils/fire.ts`, atualizar `fire/page.tsx` e `simulators/page.tsx` ✓ (corrige erro 100x no retorno)
- [x] C2: `pfireColor` → `src/utils/fire.ts`, atualizar 9 locais (fire/page, page, FireScenariosTable, PFireMonteCarloTornado, FireMatrixTable, FamilyScenarioCards, FireSimulator) ✓
- [ ] C3: `StressChart` → usar `montecarlo.ts`; adicionar seed
- [x] A1: threshold semáforo único via `pfireColor` — ≥90/≥85 em todos os 9 locais ✓
- [x] A2: hardcoded `2026`/`39` → `data.premissas.ano_atual` / `data.premissas.idade_atual` (simulators, EventosVidaChart, IncomeProjectionChart, TimeToFireProgressBar) ✓
- [ ] A3: SWR fallback → guard explícito em `withdraw/page.tsx`
- [ ] M1: Wellness → `useWellnessScore.ts` como única fonte
- [ ] M2/M3: formatadores → usar `formatters.ts`, remover closures locais
- [ ] M4: privacy → `PrivacyMask` ou helper único
- [ ] B1: `usePageData` hook
- [ ] B2/B3/B4/B5: cleanup técnico

---

## Validação

- 327 testes existentes devem passar após cada fase
- Visual: nenhuma divergência de valor entre abas para o mesmo dado
- Build limpo: zero warnings TypeScript
