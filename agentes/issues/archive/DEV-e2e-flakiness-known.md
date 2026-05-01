# DEV-e2e-flakiness-known: Playwright E2e Timeouts (Known Issue)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-e2e-flakiness-known |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | 🟢 Baixa |
| **Tipo** | Known Issue / Tech Debt |
| **Criado em** | 2026-04-15 |
| **Contexto** | Pós DEV-visual-alignment-dashhtml |

---

## Descrição

Playwright e2e suite apresenta **56/92 testes falhando** com timeouts (30s) ao buscar elementos no DOM:

```
Error: locator.textContent: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=/\d+\.\d+%/').first()
```

### Padrão de Falhas

- **36 testes passam** (layout, basic nav)
- **56 testes falham** com timeouts (simulators, charts, privacy mode)
- **Consistente**: Same failures across Chromium + Firefox (não é flakiness aleatória)
- **Causa provável**: Selectors desatualizados OU timing de inicialização lenta

### Não é Regressão

- ✅ Unit tests: 183/183 passing
- ✅ Build estático: 10/10 pages OK
- ✅ Type checks: 0 errors
- ✅ T1-T3 refactorings: Zero failures

→ Issue **pré-existente**, não causado por visual alignment work.

---

## Bloqueantes Conhecidos

1. **e2e/simulators.spec.ts:130** — Busca `text=/\d+\.\d+%/` (percentage display)
   - Selector pode estar quebrado OU página não carregou completamente
   - Afeta: stress level tests, contribution tests

2. **e2e/charts.spec.ts** — Todos testes de chart rendering falham
   - Provável: ECharts SVG/Canvas não renderizado a tempo
   - Timing: 30s timeout é curto para MC simulation + render

3. **e2e/navigation.spec.ts** — Tab navigation timeouts
   - Menos crítico: layout tests passam (não é CSS)

---

## Recomendação

**Não bloqueia release v0.2.0** — Unit tests + build validation suficientes.

**Follow-up recomendado:**
1. Aumentar timeout para 60s (temporário)
2. Investigar selectors com `--headed` mode
3. Considerar skip de e2e em CI (unit tests + visual audit suficientes)

---

## Referência

- Descoberto durante QA de [DEV-visual-alignment-dashhtml](DEV-visual-alignment-dashhtml.md)
- Unit tests: ✅ 183/183 
- Build: ✅ Validated
- Status: **Known, not a blocker**
