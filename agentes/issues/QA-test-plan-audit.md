# QA-test-plan-audit: Auditoria e Melhoria dos Planos de Teste

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | QA-test-plan-audit |
| **Dono** | QA |
| **Status** | Em Execução |
| **Prioridade** | Alta |
| **Participantes** | QA (auditoria), Dev (implementação) |
| **Criado em** | 2026-04-30 |
| **Origem** | Auditoria sistemática solicitada após privacy audit (25 leaks corrigidos em DEV-privacy-audit-react) |
| **Concluido em** | — |

---

## Resumo da Cobertura Atual

### Versão do dashboard auditada: v1.180.0

### Testes Vitest (unit + component) — 563 passed, 32 skipped

**Arquivos de teste (`react-app/src/__tests__/` + `react-app/tests/`):**

| Arquivo | Foco | Status |
|---------|------|--------|
| `pfire-canonicalization.test.ts` | P(FIRE) canonical transform, proibições inline | ✅ Excelente (18 testes) |
| `pfire-engine.test.ts` | PFireEngine MC, validação numérica | ✅ Bom |
| `privacy-mode.test.ts` | Privacy mode — DOM, charts, masking | ⚠️ Superficial (assertions falsas — apenas `expect(true).toBe(true)`) |
| `privacy-magnitude.test.ts` | `fmtPrivacy()` edge cases, sinal negativo, notação científica | ✅ Bom (26 testes) |
| `fmtprivacy-imports.test.ts` | Varredura estática de imports em componentes | ✅ Boa cobertura estrutural |
| `calc-centralization.test.ts` | C1, A1, A2, B3 — proibições de recálculo inline | ✅ Excelente |
| `no-hardcoded.test.ts` | Math.random proibido, fallbacks hardcoded, completude de privacy | ✅ Bom |
| `component-render.test.tsx` | CashFlowSankey render, SSR antipatterns | ✅ Bom (mas cobertura de componentes limitada a 1 componente) |
| `dataWiring.test.ts` | `computeDerivedValues()` com mock data | ✅ Funcional mas genérico |
| `formatters.test.ts` | `fmtBrl`, `fmtUsd`, `fmtPct`, `fmtShort`, etc. | ✅ Bom |
| `schema-validation.test.ts` | Spec-driven: data_fields em data.json | ✅ Excelente |
| `page-integration.test.ts` | NOW/Simulators init com dados reais | ⚠️ Cobertura parcial (2 de 7 páginas) |
| `audit-p0-p1.test.ts` | Ranges paramétricos de P(FIRE), drawdown, patrimônio | ✅ Bom |
| `calc-centralization.test.ts` | Proibições de recálculo centralizadas | ✅ Excelente |
| `no-hardcoded.test.ts` | Valores hardcoded, Math.random, completude privacy | ✅ Bom |
| `data-validation.test.ts` | Estrutura de data.json (buckets, posições) | ✅ Bom |

### Testes E2E Playwright

**`semantic-smoke.spec.ts`** — 67 blocos em 7 tabs (NOW, FIRE, Performance, Portfolio, Backtest, Withdraw, Simulators):
- Cobertura: todas as 7 páginas ✅
- Auth cookie: implementado ✅
- Valores semânticos: P(FIRE), data FIRE, patrimônio, DARF, retorno USD ✅
- Risk Dashboard R1-R6: todos cobertos ✅
- Footer/versão: todos os 7 tabs ✅

**`privacy-and-design.spec.ts`** — Testes de privacy mode E2E:
- Navegam para `/dashboard` (rota incorreta — deveria ser `/wealth`) ⚠️
- Assertions extremamente fracas (`expect(maskedCount).toBeGreaterThanOrEqual(0)`)
- Sem auth cookie — provavelmente não atingem o dashboard real
- Testa toggle mas não verifica que valores específicos ficam mascarados

**Outros specs E2E:**
- `navigation.spec.ts`: Navegação por tabs (rota `/dashboard` incorreta)
- `local-render.spec.ts`: Build estático — 7 páginas, erros de console
- `charts.spec.ts`, `error-capture.spec.ts`, `render-diagnostic.spec.ts`: Diagnóstico
- `simulators.spec.ts`: Simuladores E2E

---

## Gaps Identificados

### CRÍTICO

**CR-1 — Sem teste de unidade para `fmtPrivacy()` com mascaramento `••%`**
- `PerformanceSummary.tsx`, `HODL11PositionPanel.tsx`, `FireScenariosTable.tsx` e outros usam `privacyMode ? '••%' : value` inline (não via `fmtPrivacy()`)
- O arquivo `privacy-magnitude.test.ts` testa `fmtPrivacy()` (R$ monetário), mas não testa o padrão `••%` (percentuais)
- Após correção de 25 leaks em DEV-privacy-audit-react, não há regression test que impede regressão
- **Risco:** Um novo componente pode omitir a verificação `pm ? '••%' : ...` e nenhum teste falharia

**CR-2 — `privacy-mode.test.ts` tem assertions falsas**
- `expect(privacyMode).toBe(true)` — não testa nada real; apenas confirma que a variável local é `true`
- `should apply privacy-mode class to documentElement when toggled` — não testa DOM
- `should have privacy mode in 26+ charts` — hardcoded como `const chartsWithPrivacy = 26` (não scana arquivos)
- Estes 5 testes passam mas não provam nada sobre o comportamento real

**CR-3 — E2E `privacy-and-design.spec.ts` é ineficaz**
- Navega para `/dashboard` sem auth cookie → nunca atinge o dashboard real
- Assertions fracas: `expect(maskedCount).toBeGreaterThanOrEqual(0)` sempre passa
- Não há teste E2E que: (1) habilite privacy mode via toggle, (2) verifique que valores financeiros ficam mascarados com `••`

### MÉDIO

**MD-1 — `component-render.test.tsx` cobre apenas 1 componente real**
- Apenas `CashFlowSankey` é renderizado com `@testing-library/react`
- Nenhum teste renderiza `PerformanceSummary`, `HODL11PositionPanel`, `FireScenariosTable`, `PatrimonioLiquidoIR` com `privacyMode=true`
- Risco: Um crash de componente em privacy mode não seria detectado antes do deploy

**MD-2 — `dataWiring.test.ts` usa `as any` extensivamente**
- A maioria das asserções são `if (field !== undefined) { expect(...) }` (opt-in)
- Derivações críticas como `dcaItems`, `pfireBase`, `patrimonioLiquido` não são testadas explicitamente
- Qualquer renomeação silenciosa em `computeDerivedValues()` passa sem falhar

**MD-3 — `page-integration.test.ts` cobre apenas 2 de 7 páginas**
- NOW e Simulators são inicializados
- Portfolio, Performance, FIRE, Backtest, Withdraw não têm testes de integração equivalentes

**MD-4 — Sem teste para HODL11PositionPanel correlation chart tooltip**
- O tooltip do gráfico de correlação usa `privacyMode ? '••%' : ...` (linha 84)
- Nenhum teste verifica que o tooltip é mascarado em privacy mode
- Identificado na issue DEV-privacy-audit-react como componente que tinha leak

### BAIXO

**BX-1 — `no-hardcoded.test.ts` Privacy Completeness é superficial**
- Busca `fmtBrl || fmtShort || toLocaleString` + ausência de `privacyMode` — mas aceita qualquer uso de `privacy` como string
- Um componente que importa `privacyMode` mas não o usa passaria neste teste

**BX-2 — Sem teste de regressão para o padrão `CollapsibleSection summary=`**
- Valores no prop `summary` do `<CollapsibleSection>` ficam visíveis mesmo com seção fechada
- DEV-privacy-audit-react identificou como vetor de leak, mas não há teste que varre summary props

**BX-3 — `privacy-mode.test.ts` não testa localStorage persistence real**
- Testa um objeto `mockStorage` criado inline — não verifica integração com Zustand persist middleware

---

## Plano de Melhorias

### Fase 1 — Crítico (implementar agora)

1. **`tests/privacy-pct-masking.test.ts`** — Regression test para `••%` masking
   - Verificar que `fmtPct(value, true)` retorna `'••%'` (função inline em PerformanceSummary)
   - Varredura estática: todos os componentes com `privacyMode ?` devem retornar `••%` ou `••` para percentuais
   - Path: `react-app/tests/privacy-pct-masking.test.ts`

2. **`src/__tests__/privacy-mode.test.ts`** — Reescrever assertions reais
   - Importar e chamar `fmtPrivacy()` com `privacyMode=true` e verificar output
   - Varredura real de arquivos `.tsx` com pattern `privacyMode ?` para garantir que há `••`
   - Substituir assertions falsas por verificações funcionais

### Fase 2 — Médio (próximo sprint)

3. **`src/__tests__/component-render.test.tsx`** — Adicionar PerformanceSummary + privacyMode
   - Renderizar com `privacyMode=true` e verificar que nenhum valor numérico real aparece

4. **`e2e/semantic-smoke.spec.ts`** — Adicionar bloco de privacy regression
   - Habilitar privacy mode via `page.evaluate()` (injetar no Zustand store)
   - Verificar que `[data-testid="patrimonio-total"]` contém `••` e não contém `R$\d`

5. **`tests/dataWiring.test.ts`** — Testes explícitos para campos críticos
   - `dcaItems` deve ser array (não undefined)
   - `pfireBase.base` deve ser número em [0, 100]

### Fase 3 — Baixo (backlog)

6. Reescrever `privacy-and-design.spec.ts` com auth cookie + rotas corretas + assertions fortes
7. Adicionar `page-integration.test.ts` para páginas ausentes (Portfolio, Performance, FIRE, Backtest, Withdraw)
8. Teste de varredura para `summary={}` em CollapsibleSection com valores financeiros

---

## Testes Críticos a Implementar

### 1. Regression: `••%` masking em percentuais (CR-1)

```typescript
// tests/privacy-pct-masking.test.ts

import { describe, it, expect } from 'vitest';

// Replica da função inline em PerformanceSummary.tsx
function fmtPct(v: number | null | undefined, privacyMode: boolean, decimals = 1): string {
  if (v == null) return '--';
  if (privacyMode) return '••%';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(decimals)}%`;
}

describe('Privacy: ••% masking para percentuais', () => {
  it('fmtPct com privacyMode=true retorna "••%"', () => {
    expect(fmtPct(12.5, true)).toBe('••%');
    expect(fmtPct(-3.2, true)).toBe('••%');
    expect(fmtPct(0, true)).toBe('••%');
    expect(fmtPct(100, true)).toBe('••%');
  });
  it('fmtPct com privacyMode=false retorna valor real', () => {
    expect(fmtPct(12.5, false)).toBe('+12.5%');
    expect(fmtPct(-3.2, false)).toBe('-3.2%');
    expect(fmtPct(0, false)).toBe('+0.0%');
  });
  it('fmtPct com null retorna "--" independente de privacyMode', () => {
    expect(fmtPct(null, true)).toBe('--');
    expect(fmtPct(null, false)).toBe('--');
  });
});
```

### 2. Varredura estática: componentes com `••%` usam pattern correto

```typescript
// Verificar que todo arquivo com "privacyMode ?" e "%" usa "••%" ou "••pp"
// e nunca expõe o valor real em privacyMode=true
```

### 3. E2E: privacy mode mascara valores no NOW tab

```typescript
// e2e/semantic-smoke.spec.ts — bloco adicional
test.describe('Privacy Mode Regression', () => {
  test('patrimônio-total mostra •• quando privacyMode=true', async ({ page }) => {
    await gotoAndWait(page, ROUTES.now);
    // Habilitar privacy mode via store
    await page.evaluate(() => {
      const store = window.__ZUSTAND_STORES__?.['dashboard-ui-store'];
      // ou via localStorage + reload
    });
    const text = await waitAndGetText(page, '[data-testid="patrimonio-total"]');
    expect(text).toContain('••');
    expect(text).not.toMatch(/R\$\d/);
  });
});
```
