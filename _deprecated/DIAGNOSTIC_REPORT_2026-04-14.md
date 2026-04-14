# Dashboard Component Test — Diagnostic Report

**Data:** 2026-04-14  
**Total Componentes:** 66  
**Status:** 35 com problemas, 31 OK

---

## Executive Summary

| Status | Qty | Causa |
|--------|-----|-------|
| ✅ OK | 31 | Funcionando corretamente |
| ❌ MISSING | 23 | Não existem no index.html compilado |
| ⚠️ EMPTY | 8 | Elemento existe mas sem dados renderizados |
| 🙈 HIDDEN | 4 | Elemento ocultado por CSS/JS |
| 🔴 NO_MAPPING | 5 | htmlId = '—' (não mapeado) |

---

## TIPO 1: MISSING (23 componentes)

### Sub-tipo 1A: Em template.html mas não copiado para 01-body.html (18)

**RAÍZ CAUSA:** Quando `dashboard/templates/` foi criado para decomposição do template em partials, essas 18 seções **não foram copiadas** para `01-body.html`. O build script prioriza partials sobre template.html (fallback), então essas seções nunca aparecem.

**CORREÇÃO:** Copiar as 18 seções do `template.html` para `01-body.html` nas posições corretas.

#### Distribuição por Tab

| Tab | Qty | Componentes |
|-----|-----|-------------|
| **backtest** | 1 | `backtest-regime-longo` |
| **fire** | 3 | `fire-trilha`, `simulador-fire`, `what-if-cenarios` |
| **now** | 2 | `kpi-grid-primario`, `exposicao-cambial` |
| **performance** | 4 | `alpha-itd-swrd`, `fee-custo-complexidade`, `hodl11-pnl`, `information-ratio` |
| **portfolio** | 8 | `drift-semaforo-etf`, `duration-renda-plus`, `etf-composicao-regiao`, `intra-equity-pesos`, `ir-diferido`, `posicoes-etfs-ibkr`, `rf-posicoes`, `tlh-monitor` |

### Sub-tipo 1B: Spec fantasma (5)

Esses componentes aparecem como NOT_FOUND no teste de 23 faltando, mas estão marcados como NO_HTML_ID no diagnostico final. Ver **Tipo 4** abaixo.

---

## TIPO 2: EMPTY (8 componentes)

**RAÍZ CAUSA:** Elemento **encontrado e visível** em index.html, mas **JavaScript não renderizou dados**. Causas possíveis:

- (A) Função JS responsável não foi chamada
- (B) Dados obrigatórios não chegaram em data.json
- (C) Seletor CSS/ID na função JS diverge do HTML real

**INVESTIGAÇÃO:** Para cada componente, procurar a função JS que deveria populá-lo:

```bash
grep -rn "htmlId" scripts/ | grep -E "chart|table|render|populate"
```

### Lista de componentes EMPTY

| specId | htmlId | Tipo | Nota de Investigação |
|--------|--------|------|----------------------|
| `calc-aporte` | `calcAporte` | slider | Procurar event listeners em `input#calcAporte` |
| `drawdown-historico` | `drawdownHistNota` | chart-area | Procurar `new Chart(id='drawdownHistNota')` |
| `factor-loadings-chart` | `factorLoadingsChart` | chart-bar | Procurar inicialização do gráfico |
| `ipca-dca-semaforo` | `kpiIpcaSemaforo` | semaforo | Procurar função que renderiza HTML |
| `lumpy-events` | `lumpyEventsBody` | table | Procurar popula `<tbody id='lumpyEventsBody'>` |
| `minilog` | `minilogBody` | table | Procurar popula `<tbody id='minilogBody'>` |
| `renda-plus-semaforo` | `kpiRendaSemaforo` | semaforo | Procurar função que renderiza HTML |
| `retorno-decomposicao` | `simRetorno` | waterfall | Procurar inicialização do gráfico waterfall |

---

## TIPO 3: HIDDEN (4 componentes)

**RAÍZ CAUSA:** Elemento **renderizado com sucesso** (`rendered=true`), mas **oculto por CSS ou JS imperativo**:
- `display: none`
- `visibility: hidden`
- `style.display = 'none'` em JS

**INTENÇÃO:** Pode ser intencional (feature flag) ou bug. Investigar contexto.

### Lista de componentes HIDDEN

| specId | htmlId | Tab | Renderizado | Status |
|--------|--------|-----|-------------|--------|
| `bond-pool-strip` | `kpiBondPool` | now | ✅ Yes | Check por CSS `.pv` ou `visibility` |
| `factor-signal-kpi` | `kpiFactorSignal` | now | ✅ Yes | Check por CSS `.pv` ou `visibility` |
| `spending-breakdown` | `spendingChart` | retiro | ✅ Yes | Check por CSS ou `.hidden` class |
| `ter-carteira` | `terCarteira` | now | ✅ Yes | Check por CSS `.pv` ou `visibility` |

**Próximas ações:**
```bash
grep -n "display:none\|visibility:hidden\|\.pv\|\.hidden" dashboard/templates/*.html
```

---

## TIPO 4: NO HTML ID / NOT MAPPED (5 componentes)

**RAÍZ CAUSA:** Specs definidos em `spec.json` mas **sem htmlId válido** em `spec_html_mapping.json`. Marcados com `htmlId: "—"` (placeholder).

**SOLUÇÃO:** Uma de duas:
1. Atribuir `htmlId` válido em `spec_html_mapping.json` (se componente implementado)
2. Remover spec se ainda não implementado

### Lista de componentes NO_MAPPING

| specId | Tab | Label | Status |
|--------|-----|-------|--------|
| `bond-pool-readiness` | retiro | Bond Pool — Readiness Detail | gauge |
| `bond-pool-runway` | retiro | Bond Pool — Projeção até FIRE Day | chart-area |
| `evolucao-carteira` | performance | Evolução Patrimonial | chart-line |
| `income-lifecycle` | retiro | Projeção de Renda — Ciclo de Vida | chart-line |
| `stress-test-mc` | simuladores | Stress Test MC — Bear Market | slider |

---

## TIPO 5: OK (31 componentes) ✅

### Por Tab

**backtest (2)**
- `backtest-metricas` ✅
- `shadow-portfolios` ✅

**fire (6)**
- `earliest-fire` ✅
- `eventos-vida` ✅
- `fire-matrix` ✅
- `glide-path` ✅
- `net-worth-projection` ✅
- `pfire-familia` ✅

**now (12)**
- `cambio-mercado` ✅
- `drift-maximo-kpi` ✅
- `fire-countdown` ✅
- `hodl11-status` ✅
- `kpi-grid-mercado` ✅
- `macro-strip` ✅
- `patrimonio-total-hero` ✅
- `pfire-hero` ✅
- `savings-rate` ✅
- `stress-cenarios` ✅
- `tornado-sensitivity` ✅
- `wellness-score` ✅

**performance (4)**
- `cagr-patrimonial-twr` ✅
- `factor-rolling-avgs` ✅
- `heatmap-retornos` ✅
- `rolling-sharpe` ✅

**portfolio (3)**
- `custo-base-bucket` ✅
- `geo-donut` ✅
- `stacked-alloc` ✅

**retiro (4)**
- `guardrails-retirada` ✅
- `income-fases` ✅
- `sankey-cashflow` ✅
- `swr-percentis` ✅

---

## Plano de Ação Priorizado

### Prioridade 1 (BLOQUEANTE): Tipo 1A — MISSING (18)
- **Esforço:** Alto (copiar 18 seções de 5-8 linhas cada ≈ 120 linhas)
- **Impacto:** Alto (18 componentes ficarão OK imediatamente após build)
- **Ação:** Copiar seções do template.html para 01-body.html

### Prioridade 2 (IMPORTANTE): Tipo 2 — EMPTY (8)
- **Esforço:** Médio-Alto (investigar cada função JS)
- **Impacto:** Médio (8 componentes deixarão de estar vazios)
- **Ação:** Investigar e debugar cada função renderizadora

### Prioridade 3 (INVESTIGAÇÃO): Tipo 3 — HIDDEN (4)
- **Esforço:** Baixo
- **Impacto:** Baixo-Médio (verificar se ocultação é intencional)
- **Ação:** Investigar contexto (feature flag vs bug)

### Prioridade 4 (MAPPING): Tipo 4 — NO_MAPPING (5)
- **Esforço:** Baixo
- **Impacto:** Médio (desbloqueia testes para componentes já implementados)
- **Ação:** Atribuir htmlId ou remover spec

---

## Arquivos a Modificar

1. `/Users/diegodemorais/claude/code/wealth/dashboard/templates/01-body.html` — adicionar 18 seções
2. `/Users/diegodemorais/claude/code/wealth/dashboard/tests/spec_html_mapping.json` — mapear 5 specs
3. `scripts/build_dashboard.py` — nenhuma mudança necessária (já prioriza partials)
4. `scripts/build_dashboard.js` — investigar 8 funções vazias

---

## Próximos Passos

1. **Diego revisa** este relatório
2. **Dev** começa por **Prioridade 1** (cópia das 18 seções)
3. Após cópia, rodar `python3 scripts/build_dashboard.py` e re-executar teste
4. Com Prioridade 1 resolvida (18 → OK), mover para Prioridade 2
