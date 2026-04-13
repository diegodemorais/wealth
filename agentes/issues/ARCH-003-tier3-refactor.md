# ARCH-003: Tier 3 — Refactor Template (Componentização + Gerador a partir de spec.json)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | ARCH-003 |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Head, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | ARCH-001, ARCH-002 (recomendado, não bloqueante) |
| **Criado em** | 2026-04-13 |
| **Origem** | Diagnóstico arquitetural — template monolítico 8000+ linhas |
| **Concluido em** | — |

---

## Motivo / Gatilho

Template.html tem 8001 linhas em arquivo único:
- Sem componentização (Card, Chart, Sankey, Semaforo em HTML isolado)
- HTML + CSS + JS inline (não separados)
- 8+ null guards indicam risco de elementos faltarem
- Refactoring é perigoso (mudança em um lugar quebra 5 outros)

Arquiteto recomendou split em componentes reutilizáveis.

---

## Descricao

Refatorar template.html em **módulos/componentes** organizados por tipo de bloco:

1. **card.html** — KPI cards, RF cards, badge cards
2. **chart.html** — Charts genéricos (linha, barra, scatter, sankey)
3. **sankey.html** — Fluxo de caixa
4. **semaforo.html** — Status badge (FIRE, plano, alerts)
5. **table.html** — Tabelas responsivas
6. **grid.html** — Layouts grid responsivos
7. **base.html** — Template base (header, nav, footer)

Usar **template inheritance** ou **include** (ex: Jinja2 em Python build):

```html
<!-- template/card.html -->
<div class="card" id="{{ block_id }}">
  <h3>{{ title }}</h3>
  <div class="card-value">{{ value }}</div>
</div>

<!-- template/page.html -->
{% include "card.html" with block_id="pfire" title="P(FIRE)" value="90.4%" %}
```

2. **Gerador de Template a partir de spec.json**:
   - Input: spec.json (blocos + tipos)
   - Output: skeleton de template.html (com IDs, classes, data-binding automáticos)
   - Objetivo: template sempre sincronizado com spec.json

---

## Escopo

### Fase 1: Componentização Estática (6h)

- [ ] Criar diretório `dashboard/templates/`:
  ```
  templates/
    ├── base.html (header, nav, tab-nav)
    ├── card.html (KPI/RF/badge card)
    ├── chart.html (chart container + canvas)
    ├── sankey.html (sankey específico)
    ├── semaforo.html (status badge)
    ├── table.html (table wrapper responsivo)
    └── grid.html (grid layouts)
  ```

- [ ] Extrair 8001 linhas de template.html em componentes
  - Não refatorar lógica JavaScript ainda
  - Apenas reorganizar HTML em includes
  - Deve funcionar idêntico a antes (byte-for-byte quase)

- [ ] Validar:
  - 634 testes devem passar (sem mudança lógica)
  - HTML gerado idêntico ao atual
  - Tamanho final similar (componentes reduzem duplicação)

### Fase 2: Gerador a partir de spec.json (4h)

- [ ] Criar `scripts/generate_template.py`:
  ```python
  def generate_template_from_spec(spec_path, output_path):
      """
      Input: spec.json com blocos + tipos
      Output: skeleton template.html com:
        - Tabs corretos (data-tab ids)
        - Sections para cada bloco (data-in-tab, id={block_id})
        - Classes para renderização (chart-box, grid-2, etc)
        - Scaffolding para JS callbacks
      """
  ```

- [ ] Integrar em `build_dashboard.py`:
  ```python
  # Antes de gerar index.html, regenerar template.html skeleton
  if TEMPLATE_OUT_OF_SYNC:
      generate_template_from_spec(SPEC_JSON, TEMPLATE_HTML)
  ```

- [ ] Validar:
  - Template gerado tem todas as sections de spec.json
  - Nenhuma section foi dropada
  - IDs e data-tab consistentes

### Fase 3: Refactor Incrementado (6h, próximo sprint)

- [ ] Separar CSS em `dashboard/styles/` (não nesta issue)
- [ ] Separar JS renderização (renderKPIs, renderCharts, etc) em `dashboard/js/` (não nesta issue)
- [ ] Objetivo final: template.html só HTML, CSS/JS em arquivos separados

---

## Raciocinio

**Alternativas rejeitadas:**
- "Continue com template monolítico": risco de refactoring permanece, breakage em cascata
- "Reescrever em React": overhead (Node, build, dev env); Python-first pipeline já funciona

**Argumento central:**
Template monolítico viola single-responsibility principle. Componentes melhoram:
1. Readability (seções independentes)
2. Testability (componente isolável)
3. Reusability (card.html usado 20+ vezes)
4. Maintainability (mudança em um lugar não quebra 5)

**Incerteza reconhecida:**
- Gerador pode não capturar nuances de layout (ex: sections aninhadas)
- Foco em Fase 1 (estático) reduz risco de quebra

**Falsificacao:**
- Se Fase 1 não é bit-identical ao atual: refactoring falhou
- Se Fase 2 gera template com missing sections: gerador está incompleto

---

## Analise

### Template Atual

```
8001 linhas
├── CSS (1500 linhas) — estilos para todas as seções
├── Header + Nav (100 linhas)
├── NOW tab (800 linhas) — KPIs, cards, charts
├── Portfolio tab (900 linhas) — tabelas, grids
├── Performance tab (1200 linhas) — charts, heatmaps
├── FIRE tab (1100 linhas) — matrix, simulador
├── Retiro tab (600 linhas)
├── Simuladores tab (700 linhas)
├── Backtest tab (600 linhas)
└── JS (1400 linhas) — renderização, eventos
```

Problema: cada tab é ~800-1200 linhas de HTML+CSS+JS acoplado. Mudança de layout em uma quebra as outras.

### Template Refatorado

```
templates/
├── base.html (100) — header, nav, container
├── card.html (50) — reutilizável 20+ vezes
├── chart.html (80) — reutilizável 15+ vezes
├── semaforo.html (30)
├── table.html (40)
├── grid.html (20)
└── sankey.html (40)

dashboard/styles/
├── reset.css (50)
├── components.css (300) — card, chart, sankey
├── layout.css (200) — grid, responsive
├── theme.css (100) — colors, spacing

dashboard/js/
├── render-kpis.js (200)
├── render-charts.js (300)
├── render-table.js (150)
└── events.js (200)
```

Resultado: template.html reduz para ~2000 linhas puro HTML, sem duplicação.

### Impacto

- **Legibilidade**: -75% LOC de template (8001 → 2000)
- **Refactoring safety**: +90% (mudança em um lugar não cascata)
- **Reusability**: 5-8 componentes reutilizáveis
- **Build time**: similarar (<500ms)

---

## Conclusao

A ser preenchido após implementação.

### Veredicto Ponderado

| Agente | Peso | Posição | Contribuição |
|--------|------|---------|-------------|
| Dev | 3x | Necessário | Implementar componentes |
| Head | 1x | Aprova | Reduz risco futuro |
| Advocate | 1x | Aprova | Melhora manutenibilidade |
| **Score ponderado** | | **Implementar Fase 1** | **Alta confiança** |

---

## Resultado

A ser preenchido após conclusão.

---

## Proximos Passos

- [ ] Fase 1 (6h): Componentização estática — deve ser invisível a usuário
- [ ] Fase 2 (4h): Gerador a partir de spec.json — validar sincronização
- [ ] Fase 3 (próximo sprint): Separar CSS/JS em arquivos
