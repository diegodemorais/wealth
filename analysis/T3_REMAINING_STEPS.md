# Remaining Steps — T5 to T8 (Backlog)

**Status**: ⏸️ PAUSED — To be addressed after HD-ALIGNMENT issue  
**Date**: 2026-04-15

---

## Tarefa 5: Charts Centralizados & Builder Pattern

**Status**: 📋 Backlog  
**Prioridade**: 🟡 MÉDIA  
**Esforço**: Complexa | 5-7 dias  
**Depende de**: Tarefa 4 (Colapsáveis & Resize) — ✅ FEITO

### Objetivo
Consolidar 42 componentes de chart espalhados em 3 pastas (`/components/charts/`, `/components/dashboard/`, `/components/*/`) num padrão único de builder centralizado em `chartSetup.ts`.

### Contexto
- **HTML (DashHTML v2.77)**: 60 builders centralizados em funções
- **React (atual)**: 42 componentes espalhados, cada um com seu theme setup
- **Problema**: Manutenção dura, refactors lentos, inconsistência visual

### Escopo
- [ ] Auditar todos 42 componentes de chart
- [ ] Criar `chartSetup.ts` com factory functions para cada tipo
- [ ] Centralizar theme setup (colors, tooltips, labels, axis formatting)
- [ ] Documentar cada builder e campos de data.json necessários
- [ ] Remover inline theme setup dos componentes (refactor para usar factory)
- [ ] Testes unitários: `chartSetup.test.ts` com sample data para cada tipo
- [ ] Screenshot regression testing (vs baseline)
- [ ] Validar que nenhum chart >50 linhas de theme setup

### Arquivos Impactados
- `chartSetup.ts` (NEW)
- 42 componentes em `/components/charts/`
- `types/dashboard.ts` (documenting chart types)

### Validação
- Grep: Nenhum chart component >50 linhas de theme
- Tests: `chartSetup.test.ts` passa com sample data
- Regression: Screenshots idênticas pré/pós refactor
- Performance: Bundle size não aumenta

---

## Tarefa 6: Tailwind CSS Refactor

**Status**: 📋 Backlog  
**Prioridade**: 🟢 BAIXA  
**Esforço**: Média | 2-3 dias  
**Depende de**: Tarefa 5 (opcional, mas recomendado)

### Objetivo
Converter inline styles → Tailwind classes, organizar `dashboard.css` em 5 seções, reduzir CSS size 5-10%.

### Contexto
- **Tailwind 4.2.2**: Espera HSL format, mas `dashboard.css` tem HEX/HSL misto
- **Problema**: CSS size inchado (~11.7 KB + Tailwind bundle), inline styles espalhados
- **Oportunidade**: Consolidar, remover `!important`, usar specificity corretamente

### Escopo
- [ ] Configurar `tailwind.config.ts` para importar CSS vars como tokens
- [ ] Converter todos inline `style={{}}` em primitives → `className="flex gap-2.5"`
- [ ] Organizar `dashboard.css` em 5 seções:
  1. CSS vars + reset
  2. Layout (containers, grids, spacing)
  3. Components (kpi, badges, tables, cards)
  4. Responsive breakpoints (1024px, 900px, 768px, 640px, 480px)
  5. Privacy mode
- [ ] Validar CSS size redução 5-10%
- [ ] Lighthouse score (CSS size impact)
- [ ] Dark mode preparation (for future OPT-006)

### Arquivos Impactados
- `tailwind.config.ts` (import CSS vars)
- `src/styles/dashboard.css` (reorganize + comment)
- 15+ primitives components (convert style → className)
- `next.config.js` (verify CSS handling)

### Validação
- Lighthouse: CSS size -5-10%
- Visual regression: Components idênticos pré/pós
- Console: Zero style warnings
- Bundle: No growth in JS size

---

## PASSO 5: Componentes React Base

**Status**: 📋 Backlog  
**Prioridade**: 🟡 MÉDIA  
**Esforço**: Média | 2-3 dias

### Objetivo
Criar/refactor componentes primitivos reutilizáveis (HeroStrip, Section, KpiCard, etc.) com props bem documentadas.

### Escopo
- [ ] Documentar props de cada primitivo
- [ ] Criar Storybook stories para visualização
- [ ] Unificar styling (inline vs CSS vs Tailwind)
- [ ] Adicionar TypeScript types completas

---

## PASSO 6: Integração Charts (Chart.js Wrapper)

**Status**: 📋 Backlog  
**Prioridade**: 🟡 MÉDIA  
**Esforço**: Média | 2-3 dias

### Objetivo
Criar abstração consistente para Chart.js + ECharts com mesmo padrão.

### Escopo
- [ ] Auditar todos charts (quais usam Chart.js vs ECharts?)
- [ ] Decidir: 90%+ ECharts vs manter Chart.js para alguns
- [ ] Criar chart wrapper component com props unificadas
- [ ] Standardizar tooltip, legend, axis formatting

---

## PASSO 7: State Management (Redux/Zustand)

**Status**: 📋 Backlog  
**Prioridade**: 🟡 MÉDIA  
**Esforço**: Complexa | 3-4 dias

### Objetivo
Expandir e melhorar gerenciamento de estado (Zustand).

### Escopo
- [ ] Revisar `dashboardStore.ts` (já bem estruturado)
- [ ] Adicionar undo/redo para simulador
- [ ] Implement persisted state (localStorage) para preferências
- [ ] Add error boundaries + recovery
- [ ] Performance optimization (memoization, selectors)

---

## PASSO 8: Testes (Unit, Integration, Visual)

**Status**: 📋 Backlog  
**Prioridade**: 🟡 MÉDIA  
**Esforço**: Complexa | 3-5 dias

### Objetivo
Expandir cobertura de testes além do atual 192/192.

### Escopo
- [ ] Component snapshot tests
- [ ] E2E tests com Playwright/Cypress
- [ ] Visual regression tests (Percy, Chromatic)
- [ ] Accessibility tests (axe, a11y)
- [ ] Performance tests (Lighthouse CI)
- [ ] Data calculation tests (fire_montecarlo.py integration)
- [ ] API contract tests (data.json schema validation)

---

## Timeline

If executed after HD-ALIGNMENT:

| Task | Duration | Estimated Start |
|------|----------|-----------------|
| Tarefa 5: Charts | 5-7 days | v0.1.140 |
| Tarefa 6: Tailwind | 2-3 days | v0.1.145 |
| PASSO 5: Primitives | 2-3 days | v0.1.147 |
| PASSO 6: Chart Integration | 2-3 days | v0.1.150 |
| PASSO 7: State Mgmt | 3-4 days | v0.1.153 |
| PASSO 8: Tests | 3-5 days | v0.1.157 |
| **Total** | **~4 weeks** | **After HD-ALIGNMENT** |

---

## Status Summary

| Task | Status | Blocker | Notes |
|------|--------|---------|-------|
| T5: Charts | 📋 Backlog | No | Can start anytime |
| T6: Tailwind | 📋 Backlog | No | Optional, improves maintainability |
| PASSO 5-8 | 📋 Backlog | No | Post-MVP enhancements |

---

**Paused**: 2026-04-15  
**Reason**: Opening HD-ALIGNMENT issue (design/data fidelity) as higher priority  
**Next Review**: After HD-ALIGNMENT completion
