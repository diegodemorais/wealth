# DEV-charts-render-2026-04-13: B2/B3/B4/B7 — Gráficos não renderizam corretamente

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-charts-render-2026-04-13 |
| **Dono** | dev |
| **Status** | Doing |
| **Prioridade** | Alta |
| **Participantes** | dev, quant, head |
| **Criado em** | 2026-04-13 |
| **Origem** | Reporte visual Diego — 4 gráficos quebrados persistentemente |

---

## Sintomas

| Bug | Gráfico | Sintoma | Recorrência |
|-----|---------|---------|-------------|
| B2 | Trilha FIRE | Valores errados, incluindo meta | 3ª+ vez |
| B3 | Glide Path | Não carrega | **15ª+ vez** |
| B4 | Projeção Patrimônio P10/P50/P90 | Valores errados | 5ª+ vez |
| B7 | Stress Test Fan Chart | Não carrega | 2ª+ vez |

---

## Diagnóstico (sessão 2026-04-13)

### Dados: CORRETOS — confirmados campo a campo no index.html

```
FIRE TRILHA:  226 datas, 61 realizados (até R$3.52M), trilha até R$14.4M, meta R$13.4M ✓
GLIDE PATH:   5 idades, soma=100% todas, bate com carteira.md ✓
NET WORTH:    52 anos, P10/P50/P90 corretos, ano_fire=2040 ✓
STRESS TEST:  shock -40%, pat R$2.08M, P(FIRE) 80.6%, todos campos ✓
```

Template e index.html em sync (zero diff nas 4 funções JS). Build rodou corretamente.

**Conclusão: problema é 100% renderização JS, não dados.**

### Dados esperados por gráfico

#### B2 — Trilha FIRE (fire_trilha → buildFireTrilha)

| Data | Realizado (R$) | Projetado (R$) | Meta (R$) |
|------|---------------|----------------|-----------|
| 2021-04 | 257.684 | 257.684 | 13.400.000 |
| 2023-04 | 938.992 | 1.112.370 | 13.400.000 |
| 2025-04 | 3.055.328 | 2.051.971 | 13.400.000 |
| 2026-03 | 3.519.199 | 2.556.219 | 13.400.000 |
| 2030-04 | — | 5.993.757 | 13.400.000 |
| 2035-04 | — | 8.713.019 | 13.400.000 |
| 2040-01 | — | 14.408.729 | 13.400.000 |

Escala Y esperada: ~R$0 a ~R$16M. Meta = horizontal em R$13.4M.
Nota: aporte_mensal_premissa = R$33k (carteira.md diz R$25k — corrigir).

#### B3 — Glide Path (glide → buildGlidePath)

| Idade | Equity | IPCA+ L | IPCA+ C | Crypto | Renda+ | Total |
|-------|--------|---------|---------|--------|--------|-------|
| 39 | 79% | 15% | 0% | 3% | 3% | 100% |
| 40 | 79% | 15% | 0% | 3% | 3% | 100% |
| 50 | 79% | 15% | 3% | 3% | 0% | 100% |
| 60 | 94% | 0% | 3% | 3% | 0% | 100% |
| 70 | 94% | 0% | 3% | 3% | 0% | 100% |

Gráfico: stacked area, Y 0-100%, 5 pontos.

#### B4 — Projeção Patrimônio (net_worth_projection → buildNetWorthProjection)

| Ano | P10 (R$M) | P50 (R$M) | P90 (R$M) | Gatilho |
|-----|-----------|-----------|-----------|---------|
| 2026 | 3.48 | 3.48 | 3.48 | 13.40 |
| 2030 | 4.43 | 5.11 | 5.86 | 13.40 |
| 2035 | 5.98 | 8.25 | 11.22 | 13.40 |
| 2040 | 8.08 | 13.33 | 21.50 | 13.40 |

Slice até ano_fire=2040 (15 pontos). Escala Y: ~R$3M a ~R$25M.

#### B7 — Stress Test Fan (stress_test → buildStressTest → MC browser-side)

Inputs do MC no browser:
- pat_pos_shock = R$2.083.000
- aporte_anual = R$396.000 (33k×12)
- retorno_real = 4.85%, vol = 16.8%
- 14 anos acumulação + 40 anos aposentadoria
- 500 trajetórias, bandas P5/P25/P50/P75/P95

---

## Causas prováveis (investigar)

### B3 e B7 — Não carregam (seção collapsible)

Ambos estão em `<div class="section collapsible">`. CSS: `.collapsible .collapse-body { display: none }`.

Fluxo:
1. `_initTabCharts('fire')` chama `buildGlidePath()` / `buildStressTest()`
2. Canvas tem `offsetWidth === 0` (seção fechada) → função retorna sem renderizar
3. Ao abrir: `_toggleBlock` → double-RAF + `getBoundingClientRect()` → chama builder
4. **Hipótese: o double-RAF + forced reflow não é suficiente em todos os browsers**

Evidência: B3 tem 15 ocorrências, mesmo padrão em todas. Cada "fix" adicionou mais guards (RAF, offsetWidth, retry) mas nenhum resolve definitivamente.

**Proposta de fix:** remover guard de `offsetWidth === 0`. Em vez disso, definir dimensões explícitas no canvas (`width`/`height` attributes) antes de chamar Chart.js. Chart.js com `responsive: true` ajusta depois, mas a primeira renderização não depende de reflow.

### B2 e B4 — Valores errados (investigar visualmente)

Dados confirmados corretos no JSON. JS parece correto na leitura estática. Possíveis causas:
- Scale Y com `suggestedMin/suggestedMax` sendo ignorados pelo Chart.js
- `responsive: true` + `maintainAspectRatio: false` + container `overflow: hidden` gerando dimensões inconsistentes
- Erro silencioso em função anterior na lista `_initTabCharts` abortando a execução

**Precisa debugging no browser (console JS)** para identificar erros silenciosos.

---

## Próximos passos

1. [ ] Abrir dashboard no browser, ir na tab FIRE, abrir console JS
2. [ ] Verificar erros/warnings no console ao carregar a tab
3. [ ] Verificar erros ao expandir seções collapsible (B3, B7)
4. [ ] Para B2/B4: descrever o que aparece visualmente (escala? valores? linhas?)
5. [ ] Aplicar fixes no template.html, rebuild, testar
6. [ ] Adicionar testes anti-regressão definitivos

---

## Referência

- `dashboard/template.html`: funções `buildFireTrilha` (L6827), `buildGlidePath` (L2216), `buildNetWorthProjection` (L4283), `buildStressTest` (L4530)
- `dashboard/index.html`: dados em L6126 (fire_trilha), L3645 (glide), L7815 (net_worth_projection), L8038 (stress_test)
- `scripts/build_dashboard.py`: `_compute_net_worth_projection` (L295), `_compute_stress_test` (L439)
- Issue anterior: `DEV-bugs-dashboard-2026-04-12.md` (7 bugs, 9 testes anti-regressão)
