# DEV-charts-recorrente-2026-04-12: 4 gráficos recorrentes quebrados

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-charts-recorrente-2026-04-12 |
| **Dono** | dev |
| **Status** | Resolvido |
| **Prioridade** | Alta |
| **Criado em** | 2026-04-12 |

## Bugs

### B1 — netWorthProjection: fill inválido
- **Causa raiz:** P50 dataset tinha `fill: '-2'` que é inválido (P90=index 0, P50=index 1, `fill: '-2'` = index -1 inexistente). P10 tinha `fill: false` quando deveria preencher o cone inferior.
- **Fix:** `fill: '-1'` para P50 (preenche cone P50→P90), `fill: '-1'` para P10 (preenche cone P10→P50)
- **Linha:** template.html ~4371

### B2 — glideChart: não aparece em seção colapsível
- **Causa raiz:** Guard `if (!_glideCanvas || _glideCanvas.offsetWidth === 0) return;` disparava race condition ao abrir seção — layout não propagara para o canvas filho ainda.
- **Fix:** Retry via `requestAnimationFrame` quando offsetWidth ainda for 0 após separar o guard em duas etapas (`!_glideCanvas` vs `offsetWidth === 0`).
- **Linha:** template.html ~2234

### B3 — stressProjectionChart: fan chart não aparece
- **Causa raiz:** Guard `if (ctx.offsetWidth === 0) return;` em `buildStressFanChart` podia disparar mesmo com o `setTimeout(100ms)` no caller — em browsers mais lentos ou seções colapsíveis, o reflow ainda não completara.
- **Fix:** Retry com `setTimeout(200ms)` adicional quando guard dispara — passa todos os parâmetros para re-invocar `buildStressFanChart`.
- **Linha:** template.html ~4678

### B4 — fireTrilhaChart: escala comprime dados
- **Causa raiz:** Hard `min: 0` e hard `max: _yMax` (até R$15.85M) comprimia o realizado (R$3.52M = ~22% da altura). `_yMin` estava hard-coded em 0.
- **Fix 1:** `_yMin` calculado como `Math.max(0, Math.min(..._rVals) * 0.8)` para acompanhar o dado mínimo real.
- **Fix 2:** `suggestedMin`/`suggestedMax` ao invés de `min`/`max` — Chart.js auto-ajusta para que os dados ocupem a área visível de forma informativa.
- **Linha:** template.html ~6877, ~6904

## Resultado

- Dashboard: v1.202
- Testes: 277/277 PASS — DEPLOY APPROVED
