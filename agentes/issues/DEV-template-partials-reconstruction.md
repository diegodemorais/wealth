# DEV-template-partials-reconstruction: Reconstruir Partials com Conteúdo Completo (ARCH-003 Continuation)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-template-partials-reconstruction |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Quant, Head |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-14 |
| **Origem** | Incidente: partials incompletos causaram empty nested divs no dashboard mobile |
| **Concluido em** | — |

---

## Motivo / Gatilho

Dashboard v2.238 identificou que 11 de 12 partials em `dashboard/templates/` estavam **completamente vazios** de conteúdo (apenas divs estruturais). Resultado: usuários viam apenas divs aninhadas em vez de gráficos, tabelas, KPIs.

**Root cause**: Durante ARCH-003 (Template Componentization), foram extraídos apenas os divs estruturais (linhas 1100+) de template.html, mas o **conteúdo real** (linhas 42-1000: headings, canvases, tables) nunca foi movido para os partials.

**Solução temporária (v2.238)**: Reverted para `dashboard/template.html` como fallback (tem conteúdo, mas HTML malformado). Partials foram renomeados para `dashboard/templates.incomplete/`.

**Status**: Dashboard estável agora, mas **partials permanecem incompletos**. Próximo ciclo precisa reconstruir partials com conteúdo completo para eliminar fallback.

---

## Descricao

Reconstruir `dashboard/templates/*.html` com conteúdo **completo e validado**:

1. **Extração correta do conteúdo**: Identificar secções de conteúdo em template.html (atualmente espalhadas linhas 42-1000)
2. **Mapping de conteúdo → tabs**: Qual conteúdo pertence a cada tab (hoje, carteira, perf, fire, retiro, simuladores, backtest)
3. **Reconstrução dos partials**: Recriar cada partial (03-08) com conteúdo + estrutura
4. **Validação de cobertura**: Garantir 100% de cobertura (esperado: todas as canvases, todas as tabelas, todos os KPIs)
5. **Teste integrado**: Confirmar que build usa partials (não fallback) e 634/634 testes passam

---

## Escopo

### Fase 1: Análise de Conteúdo (2h)

- [ ] Executar `scripts/reconstruct_partials.py` (analysis tool já existe)
  - Identifica estrutura de template.html
  - Lista tab content ranges
  - Gera mapping de seções

- [ ] Documentar expected elements per partial:
  - `02-tab-hoje.html`: tornadoChart, sankey, bondPool, backtest
  - `03-tab-carteira.html`: donuts, stackedAlloc, posicoes
  - `04-tab-perf.html`: timeline, attrib, rolling, heatmap
  - `05-tab-fire.html`: trackingFireChart, scenarioCompareBody, fireMatrix, netWorth
  - `06-tab-retiro.html`: bondPool, guardrails, incomeChart, swr
  - `07-tab-simuladores.html`: scenarios, stressProjection, simuladorFire
  - `08-tab-backtest.html`: backtest, shadowChart, backtestR7

- [ ] Validar contra `scripts/validate_partials.py` (coverage por tab)

### Fase 2: Extração + Reconstrução (4h)

- [ ] Extrair conteúdo de template.html por tab
  - Respeitar `data-in-tab="..."` attributes
  - Preservar IDs de elementos (chartsConfigs, table definitions, etc)
  - Manter inline CSS/JS associados

- [ ] Recriar 03-08 com conteúdo completo
  - 03-tab-carteira.html: ~1.5KB → ~15-20KB (com conteúdo)
  - 04-tab-perf.html: ~850B → ~12-18KB
  - 05-tab-fire.html: ~741B → ~10-15KB
  - 06-tab-retiro.html: ~446B → ~8-12KB
  - 07-tab-simuladores.html: já ~10.8KB (verificar completude)
  - 08-tab-backtest.html: ~383B → ~5-8KB

- [ ] Preservar estrutura de montagem:
  ```
  build_dashboard.py:
    - Lê partials 00→10 em ordem
    - Concatena em memória
    - Aplica __DATA_PLACEHOLDER__
    - Gera index.html
  ```
  **Nenhuma mudança ao build process — apenas conteúdo dos partials**

### Fase 3: Validação (2h)

- [ ] Executar `scripts/validate_partials.py`:
  - Esperado: 100% content coverage por tab
  - Esperado: 0 HTML errors (tag balance, nesting)
  - Esperado: Todos os 12 partials com status ✓ OK

- [ ] Build e teste:
  ```bash
  python3 scripts/build_dashboard.py
  python3 scripts/test_dashboard.py
  ./scripts/quick_dashboard_test.sh
  ```
  - Esperado: 634/634 tests ✅
  - Esperado: Playwright validation ✅
  - Esperado: index.html gerado com todos os elementos

- [ ] Visual inspection:
  - Verificar que build usa partials (não fallback)
  - Confirmar que todos charts, tables, KPIs rendeirizam
  - Testar em mobile viewport

### Fase 4: Limpeza (0.5h)

- [ ] Remover `dashboard/templates.incomplete/` (fallback não mais necessário)
- [ ] Validar que NENHUMA referência ao fallback permanece
- [ ] Commit + Push

---

## Raciocinio

**Alternativas rejeitadas:**
- **Continuar com fallback**: Risco — template.html é malformado (unclosed divs, invalid HTML). Browser corrige silenciosamente. Quando mudanças acontecerem, pode quebrar.
- **Jinja2 full refactor**: Bom long-term (ARCH-004), mas complexo para immediate fix. Requer template engine, mudança no build pipeline.
- **Recriar do zero**: Risco de perder conteúdo. Melhor extrair do que existe.

**Argumento central:**
Partials são o design correto (divide monolith, melhora manutenibilidade). A implementação falhou porque conteúdo e estrutura foram separados. Reconstruir partials **com conteúdo** resolve o problema estrutural sem mudança ao build ou arquitetura.

**Incerteza reconhecida:**
- Exatamente quais elementos pertencem a cada tab (template.html é ambíguo)
- Se há duplicação de conteúdo entre tabs (Sankey aparece em retiro + hoje?)
- Se há conteúdo dinâmico vs estático (JS que gera elementos dynamically)

**Falsificacao:**
- Se `validate_partials.py` mostra <100% coverage após reconstrução → partials incompletos
- Se build size cresce >10% vs current → duplicação suspeita
- Se 634/634 tests não passam → content loss ou HTML errors

---

## Analise

*A ser preenchido durante execução.*

---

## Conclusao

*Preenchido ao finalizar.*

---

## Proximos Passos

- [ ] Agendar para próximo sprint (MEDIUM priority)
- [ ] Alocar 2 dias Dev time (~8h total)
- [ ] Usar scripts existentes: `validate_partials.py`, `reconstruct_partials.py`, `build_dashboard.py`
- [ ] Resultado esperado: partials 100% completos, fallback removido, v2.239 pronto para deploy
