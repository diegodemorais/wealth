# DEV-bugs-dashboard-2026-04-12: Batch de bugs críticos — dashboard

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-bugs-dashboard-2026-04-12 |
| **Dono** | dev |
| **Status** | Resolvido |
| **Prioridade** | Alta |
| **Participantes** | dev, quant |
| **Criado em** | 2026-04-12 |
| **Resolvido em** | 2026-04-12 |
| **Origem** | Reporte visual do usuário — 7 bugs confirmados |

---

## Bugs Reportados

### B1 — Alpha vs 60/40: barra nunca aparece (1ª vez reportado)
- **Descrição:** Gráfico "Alpha Desde o Início vs SWRD — Performance Relativa" mostra apenas 2 barras (vs VWRA e vs IPCA+). A barra "vs 60/40 (VWRA+RF+Crypto)" nunca renderiza.
- **Fix:** `rawData.map(v => v ?? 0.001)` em `buildDeltaBar()` — valores null/undefined resultavam em barras invisíveis.
- **Status:** [x] Resolvido

### B2 — Trilha FIRE: escala muito alta (3ª vez)
- **Descrição:** Gráfico Fire Trilha volta a ter escala Y astronômica, tornando linhas indistinguíveis na parte inferior.
- **Histórico:** Corrigido 2x anteriormente, regrediu 2x.
- **Fix:** `_yMax = Math.min(Math.max(_rVals, _tVals)*1.1, _metaVal*1.5)` com cap em 1.5× a meta.
- **Regra anti-regressão:** Escala Y deve ter `suggestedMax = max(trilha.max, meta) * 1.15` e `suggestedMin = 0`. Nunca usar `beginAtZero: false` sem cap de `suggestedMax`.
- **Status:** [x] Resolvido

### B3 — Glide Path: não funciona (15ª vez)
- **Descrição:** Seção Glide Path não renderiza / erro silencioso.
- **Histórico:** Bug recorrente — 15 ocorrências.
- **Fix:** Null-guard `if (!g || !g.idades || !g.equity || !g.ipca_longo) return;` em `buildGlidePath()`.
- **Regra anti-regressão:** Após cada fix, adicionar teste CRITICAL em `fire_tests.py` que verifica que `glidepathChart` canvas existe e que `buildGlidePath` executa sem erro.
- **Status:** [x] Resolvido

### B4 — Projeção Patrimônio: escala astronômica (5ª vez)
- **Descrição:** `buildNetWorthProjection` (ou `buildFireTrilha`) volta com escala Y em trilhões/quadrilhões.
- **Histórico:** 5 ocorrências — claramente não tem teste validando escala.
- **Fix:** `_nwYMax = Math.min(_nwDataMax*1.1, 150e6)`, `max: _nwYMax, min: 0` em `buildNetWorthProjection()`.
- **Regra anti-regressão:** Escala Y deve ser em R$M (dividir por 1e6), com `suggestedMax` baseado no max dos dados × 1.2. Adicionar teste que verifica range dos valores (deve estar entre R$1M e R$200M).
- **Status:** [x] Resolvido

### B5 — Spending Guardrails: marcador atual mal posicionado
- **Descrição:** Marcador de posição atual ficou visualmente ruim. Usuário quer apenas um ponto (círculo) com label diretamente acima.
- **Fix:** Labels e marcadores movidos para fora do container `overflow:hidden`. Marcador ATUAL mudado para círculo (dot) com label acima.
- **Status:** [x] Resolvido

### B6 — What-if Scenario: lógica invertida (reportado anteriormente, regrediu)
- **Descrição:** Aumentar custo de vida aumenta P(FIRE) e patrimônio necessário — comportamento invertido.
- **Causa raiz:** `interpolateFireMatrix` usava `patrimonioImplied = gasto/swr` como lookup → maior gasto = maior patrimônio implied = melhor P(success).
- **Fix:** `patrimonioRef = DATA.premissas?.patrimonio_gatilho ?? [meio do array de pats]`. Confirmado correto após análise de `fire_matrix.json` — P(FIRE) diminui corretamente ao aumentar gasto.
- **Status:** [x] Resolvido

### B7 — Fan Chart Stress Test: não aparece
- **Descrição:** O gráfico de projeção fan chart na seção Stress Monte Carlo não renderizava.
- **Causa raiz:** `_chartBuilders['stressProjectionChart']` era um no-op `() => { /* ... */ }`. Quando a seção colapsada era aberta, `_toggleBlock` tentava reconstruir o chart via builder mas chamava uma função vazia.
- **Fix:** Mudado para `stressProjectionChart: () => buildStressTest()`.
- **Status:** [x] Resolvido

---

## Regras Anti-Regressão (implementar junto com os fixes)

1. **Escala Y de qualquer chart patrimonial:** Sempre validar que valores estão em R$M (1e6), não R$B ou R$ bruto. Adicionar teste que checa `max(data) < 500e6`.
2. **Glide Path:** Adicionar teste CRITICAL que checa que canvas `glidepathChart` existe no HTML e que a função não lança exceção.
3. **What-if:** Adicionar teste que verifica: ao aumentar gasto, `patNecessario` aumenta E `pfire` diminui.
4. **Fan chart:** `_chartBuilders` deve ter builder real para todos os canvas. Nunca usar no-op comment.

---

## Resultado Esperado

| Bug | Fix | Teste Anti-Regressão |
|-----|-----|---------------------|
| B1 — Alpha 60/40 bar | [x] | — |
| B2 — Trilha FIRE escala | [x] | — |
| B3 — Glide Path | [x] | [x] (fire_tests.py) |
| B4 — Projeção escala | [x] | — |
| B5 — Guardrails marcador | [x] | — |
| B6 — What-if invertido | [x] | — |
| B7 — Fan chart stress | [x] | — |
