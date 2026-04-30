# DEV-qa-improvements: Implementar Melhorias de Testes (QA-test-plan-audit)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-qa-improvements |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | 🟡 Média |
| **Participantes** | Dev (implementação) |
| **Criado em** | 2026-04-30 |
| **Origem** | QA-test-plan-audit concluída — plano de melhorias extraído |
| **Concluido em** | — |

---

## Contexto

Auditoria QA-test-plan-audit (2026-04-30) identificou 3 gaps críticos, 4 médios e 3 baixos nos testes do dashboard. Esta issue implementa o plano de melhorias em 3 fases.

Referência completa: `agentes/issues/QA-test-plan-audit.md` § Plano de Melhorias e § Testes Críticos a Implementar.

---

## Fase 1 — Crítico

- [ ] **`tests/privacy-pct-masking.test.ts`** — regression test para `••%` masking em percentuais (CR-1)
  - Verificar que `fmtPct(value, true)` retorna `'••%'`
  - Varredura estática: todos os componentes com `privacyMode ?` retornam `••%` para percentuais
  - Template no arquivo QA-test-plan-audit.md § Testes Críticos

- [ ] **`src/__tests__/privacy-mode.test.ts`** — reescrever assertions reais (CR-2)
  - Substituir os 5 testes com `expect(true).toBe(true)` por verificações funcionais
  - Importar e chamar `fmtPrivacy()` com `privacyMode=true` e verificar output real
  - Varredura real de arquivos `.tsx` com pattern `privacyMode ?` para garantir `••`

- [ ] **`e2e/privacy-and-design.spec.ts`** — corrigir rota + auth + assertions (CR-3)
  - Rota incorreta `/dashboard` → corrigir para rota real do app
  - Adicionar auth cookie (mesmo padrão do `semantic-smoke.spec.ts`)
  - Assertions fortes: toggle privacy mode → verificar `••` em `[data-testid="patrimonio-total"]`

## Fase 2 — Médio

- [ ] **`src/__tests__/component-render.test.tsx`** — adicionar `PerformanceSummary` com `privacyMode=true` (MD-1)
  - Renderizar e verificar que nenhum valor numérico real aparece

- [ ] **`e2e/semantic-smoke.spec.ts`** — bloco privacy regression (MD-1)
  - Habilitar privacy mode via `page.evaluate()` (Zustand store ou localStorage)
  - Verificar `[data-testid="patrimonio-total"]` contém `••` e não contém `R$\d`

- [ ] **`tests/dataWiring.test.ts`** — testes explícitos para campos críticos (MD-2)
  - `dcaItems` deve ser array (não undefined)
  - `pfireBase.base` deve ser número em [0, 100]

- [ ] **`src/__tests__/page-integration.test.ts`** — cobrir 5 páginas ausentes (MD-3)
  - Portfolio, Performance, FIRE, Backtest, Withdraw

## Fase 3 — Baixo

- [ ] Reescrever `privacy-and-design.spec.ts` completamente (auth + rotas + assertions fortes) (BX-1)
- [ ] Varredura para `summary={}` em `<CollapsibleSection>` com valores financeiros (BX-2)
- [ ] `privacy-mode.test.ts` — testar localStorage persistence real via Zustand persist (BX-3)

---

## Conclusao

> A preencher após implementação.
