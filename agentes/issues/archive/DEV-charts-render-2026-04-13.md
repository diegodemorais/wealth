# DEV-charts-render-2026-04-13: B2/B3/B4/B7 — Gráficos não renderizam corretamente

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-charts-render-2026-04-13 |
| **Dono** | dev |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | dev, quant, head |
| **Criado em** | 2026-04-13 |
| **Fechado em** | 2026-04-13 |
| **Origem** | Reporte visual Diego — 4 gráficos quebrados persistentemente |

---

## Sintomas

| Bug | Gráfico | Sintoma | Recorrência |
|-----|---------|---------|-------------|
| B2 | Trilha FIRE | Linhas realizado/projeção desenhadas próximas a R$0 | 3ª+ vez |
| B3 | Glide Path | Não carregava | 15ª+ vez |
| B4 | Projeção Patrimônio P10/P50/P90 | Gráfico inteiro quebrado (TypeError silencioso) | 5ª+ vez |
| B7 | Stress Test Fan Chart | Não carregava | 2ª+ vez |

---

## Root Causes e Fixes

### B2 — Tracking FIRE (linhas próximas a R$0)

**Causa:** Chart.js 4.4.7 dataset renderer produz linhas incorretas para valores BRL grandes (ex: 14.4M). Causa exata no renderer desconhecida — bug ou comportamento não-documentado com escalas muito grandes.

**Fix (v1.214):** Bypass completo do dataset renderer. Projeção e Realizado desenhados via canvas API direta no `afterDraw` com `getPixelForValue()`. Datasets permanecem vazios só para exibir a legenda.

**Fix adicional (v1.215):** Linha Meta movida de volta para dataset normal do Chart.js (valor constante = funciona no renderer padrão). Simplifica o código.

### B3 — Glide Path + B7 — Stress Fan (não carregavam)

**Causa:** Canvas dentro de aba escondida (`.tab-hidden` → `display:none!important`) tem `offsetWidth === 0`. Guard existente impedia rendering e não havia mecanismo de retry para seções não-colapsáveis.

**Fix (v1.212):** Padrão `setTimeout(buildFn, 300)` quando `offsetWidth === 0` — retry simples que aguarda o layout mobile completar.

### B4 — Net Worth Projection (TypeError silencioso)

**Causa:** Plugin `verticalTodayLine` chamava `x.getPixelForIndex(aHojeIdx)` — método removido no Chart.js 4. TypeError derrubava a função inteira sem exibir nada.

**Fix (v1.214):** Substituído por `x.getPixelForValue(aHojeIdx)`.

### Eruda (bônus)

Botão de console móvel adicionado ao header (v1.211) — permitiu debugging no celular que identificou os erros B2/B4.

---

## Aprendizados

1. **Chart.js 4 quebrou `getPixelForIndex`** — usar sempre `getPixelForValue` para posicionamento em afterDraw.
2. **Dataset renderer do Chart.js 4 é frágil com valores numéricos muito grandes** — para linhas críticas com dados BRL raw, afterDraw + canvas API é mais confiável.
3. **`offsetWidth === 0` em abas escondidas** — qualquer chart fora da aba ativa precisa do padrão setTimeout retry (ou dimensões explícitas no canvas antes do Chart.js).
4. **Eruda é valioso** — debug mobile economizou várias sessões de tentativa e erro.

---

## Commits

| Versão | Commit | O que mudou |
|--------|--------|-------------|
| v1.211 | — | Eruda button adicionado |
| v1.212 | — | setTimeout retry para B3/B7 |
| v1.213 | — | afterDraw-only para B2 (aplicado ao template) |
| v1.214 | 953774f | Build B2 + fix B4 getPixelForIndex + debug logs removidos |
| v1.215 | 7676532 | Meta FIRE de volta a dataset normal |

---

## Referência

- `dashboard/template.html`: `buildTrackingFire` (L6847), `buildGlidePath` (L2216), `buildNetWorthProjection` (L4283), `buildStressFanChart` (L4672)
- Issue anterior: `DEV-bugs-dashboard-2026-04-12.md`
