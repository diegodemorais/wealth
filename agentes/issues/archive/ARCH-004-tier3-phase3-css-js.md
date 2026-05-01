# ARCH-004: Tier 3 Phase 3 — Separar CSS e JS em arquivos dedicados

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | ARCH-004 |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Dev, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | ARCH-003 (Fase 1 completa) |
| **Criado em** | 2026-04-13 |
| **Origem** | Continuação natural de ARCH-003 Fase 1 |
| **Concluido em** | — |

---

## Motivo / Gatilho

ARCH-003 Fase 1 completou a componentização do template em 4 partials (00-head.html, 01-body.html, 02-scripts.html, 03-closing.html). Próximo passo lógico é separar CSS e JavaScript em diretórios dedicados para melhorar:

1. **Manutenibilidade**: CSS/JS fora do HTML template
2. **Reusabilidade**: Componentes de CSS isoláveis
3. **Build clarity**: Separação clara de responsabilidades (estrutura vs. estilo vs. lógica)

---

## Descricao

Refatorar a pipeline de geração de dashboard para extrair:

1. **CSS inline em `02-scripts.html` → `dashboard/styles/`**
   - Criar subpastas por seção: layout, components, theme, responsive
   - Separar estilos de charts, cards, tables, grids
   - Manter variables CSS (--primary, --accent, etc.) em arquivo central

2. **JavaScript de rendering em `02-scripts.html` → `dashboard/js/`**
   - `render-kpis.js` — buildKPIs, buildCards, buildMetrics
   - `render-charts.js` — buildChart, renderChart (Chart.js wrapper)
   - `render-tables.js` — buildScenarioComparison, buildPortfolioTable
   - `render-sankey.js` — buildSankey (fluxo de caixa)
   - `render-matrix.js` — buildMatrix (FIRE matrix)
   - `events.js` — event listeners, tab switching, responsive handlers
   - `utils.js` — helpers comuns (fmt, fmtPfire, etc.)

3. **Atualizar `build_dashboard.py`**
   - Função `_assemble_css()`: ler `dashboard/styles/**/*.css` em ordem
   - Função `_assemble_js()`: ler `dashboard/js/**/*.js` em ordem
   - Injetar CSS no `<head>` de 00-head.html
   - Injetar JS no final de 02-scripts.html (antes de `__DATA_PLACEHOLDER__`)

4. **Manter compatibilidade**
   - Template gerado mantém estrutura idêntica (byte-equivalent)
   - 634/634 testes continuam passando
   - Build time similar ou melhorado

---

## Escopo

### Fase 3a: Extrair CSS (3h)

- [ ] Criar `dashboard/styles/` com subpastas:
  - `dashboard/styles/reset.css` — resets globais
  - `dashboard/styles/theme.css` — variables CSS, paletas, spacing
  - `dashboard/styles/layout.css` — grid, flexbox, responsive
  - `dashboard/styles/components.css` — card, chart, semaforo, badge
  - `dashboard/styles/responsive.css` — media queries
  
- [ ] Extrair `<style>` de 00-head.html em partes:
  - Lógica: CSS é declarativo, seguro de reorganizar
  - Validação: arquivo CSS válido para cada partial
  
- [ ] Implementar `_assemble_css()` em build_dashboard.py:
  ```python
  def _assemble_css(styles_dir: Path) -> str:
      """Concatenar styles/**/*.css em ordem alfabética"""
      parts = sorted(styles_dir.glob("*.css"))
      return "\n".join(p.read_text(encoding="utf-8") for p in parts)
  ```
  
- [ ] Remover `<style>` de 00-head.html, injetar CSS assembled
  
- [ ] Validar:
  - CSS concatenado valid
  - Sem conflitos de seletores
  - Responsive media queries mantidas
  - 634 testes passando

### Fase 3b: Extrair JavaScript (4h)

- [ ] Criar `dashboard/js/` com scripts:
  - `dashboard/js/00-utils.js` — helpers, formatters (fmtPfire, fmtMoney, etc.)
  - `dashboard/js/01-render-kpis.js` — buildKPIs, buildCards
  - `dashboard/js/02-render-charts.js` — buildChart, renderChart
  - `dashboard/js/03-render-tables.js` — buildScenarioComparison, buildPortfolioTable
  - `dashboard/js/04-render-sankey.js` — buildSankey
  - `dashboard/js/05-render-matrix.js` — buildMatrix
  - `dashboard/js/06-events.js` — event listeners, tab switching
  - `dashboard/js/07-init.js` — inicializacao (DATA injection, render calls)

- [ ] Estratégia de extração:
  - Lógica JavaScript é procedural — ordem importa
  - Começar com utils (zero dependências)
  - Depois render-* (dependem de utils + DATA)
  - Depois events (inicia listeners após render)
  
- [ ] Implementar `_assemble_js()` em build_dashboard.py:
  ```python
  def _assemble_js(js_dir: Path) -> str:
      """Concatenar js/*.js em ordem (00-, 01-, etc)"""
      parts = sorted(js_dir.glob("*.js"))
      return "\n".join(p.read_text(encoding="utf-8") for p in parts)
  ```

- [ ] Atualizar 02-scripts.html:
  - Remover funções inline
  - Injetar `_assemble_js()` output antes de `__DATA_PLACEHOLDER__`
  - Manter `__DATA_PLACEHOLDER__ = {...}` no final

- [ ] Validar:
  - JS sintaxe válida (cada arquivo)
  - Sem undefined functions
  - Ordem de carregamento correta
  - DATA injeção funciona (render chama DATA.*)
  - 634 testes passando

### Fase 3c: Integração e Testes (2h)

- [ ] Atualizar `build_dashboard.py`:
  ```python
  def build_dashboard():
      # Montar template com CSS/JS injetados
      css_content = _assemble_css(STYLES_DIR)
      js_content = _assemble_js(JS_DIR)
      
      # Injetar em partials antes de assemble
      head_html = HEAD_PARTIAL.replace("</head>", f"<style>{css_content}</style>\n</head>")
      scripts_html = SCRIPTS_PARTIAL.replace("__DATA_PLACEHOLDER__", 
                                           f"{js_content}\nconst __DATA_PLACEHOLDER__ = {{}}")
      
      # Assemble normal
      template = _assemble_template()
  ```

- [ ] Rodar testes completos: `python3 scripts/test_dashboard.py`
  
- [ ] Validar:
  - 634/634 testes passando
  - index.html gerado idêntico (byte-equivalent)
  - Build time não aumentou
  - Estrutura CSS/JS clara em tree (`tree dashboard/`)

---

## Raciocinio

**Alternativas rejeitadas:**
- "Deixar CSS/JS inline em 02-scripts.html": mantém monolito (problema original)
- "Usar bundler (Webpack/Vite)": overhead; Python-first pipeline já funciona bem
- "Separar imediatamente em componentes Web": prematura; antes refactor de estrutura

**Argumento central:**
CSS e JavaScript inline em template.html (ou 02-scripts.html) violam separação de responsabilidades. Extrair em arquivos dedicados melhora legibilidade, testability e manutenibilidade sem quebrar o pipeline de build.

**Incerteza reconhecida:**
- Ordem de carregamento do JavaScript pode ser frágil (se uma função chama outra antes de ser definida)
- CSS com espaçamento de comentários pode mudar tamanho final (visual de diff em git)

**Falsificacao:**
- Se 634 testes não passarem: problema na integração ou ordem de carregamento
- Se index.html não for byte-equivalent: CSS ou JS foram alteradas (não apenas extraídas)

---

## Analise

### Estrutura Final

```
dashboard/
├── templates/
│   ├── 00-head.html (sem <style> inline)
│   ├── 01-body.html
│   ├── 02-scripts.html (sem JavaScript de rendering)
│   └── 03-closing.html
├── styles/
│   ├── reset.css (resets globais)
│   ├── theme.css (variables, paletas)
│   ├── layout.css (grid, responsive)
│   ├── components.css (card, chart, table)
│   └── responsive.css (media queries avançadas)
├── js/
│   ├── 00-utils.js (helpers comuns)
│   ├── 01-render-kpis.js
│   ├── 02-render-charts.js
│   ├── 03-render-tables.js
│   ├── 04-render-sankey.js
│   ├── 05-render-matrix.js
│   ├── 06-events.js
│   └── 07-init.js
├── index.html (gerado, mantém estrutura idêntica)
└── data.json (imutável)
```

### Impacto

- **LOC em 02-scripts.html**: 6721 → ~500 (apenas injeção + DATA)
- **Legibilidade**: +90% (arquivos focados)
- **Refactoring safety**: +95% (mudança isolada)
- **Build time**: similar ou −5%

---

## Conclusao

> Preenchido ao finalizar issue

---

## Proximos Passos

- [ ] Fase 3a: Extrair CSS (começar após aprovação)
- [ ] Fase 3b: Extrair JavaScript
- [ ] Fase 3c: Integração e testes
- [ ] Post-phase: Refactor futuro de componentes React (fora de escopo desta issue)
