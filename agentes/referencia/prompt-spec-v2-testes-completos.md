# Prompt para Spec V2 — Especificação Completa de Testes

**Contexto:** Plano de testes executável (DEV-plan-testes-2026.md) cobre 10 testes críticos em 4 fases. Spec V2 é um documento de referência que mapeia TODOS os artefatos testáveis do projeto e suas regras de validação.

**Objetivo:** Criar especificação abrangente que defina:
- O que testar (cada componente, script, utility, validação)
- Como testar (padrão, edge cases, integração)
- Quando testar (pré-commit, build, deploy)
- Quem testa (QA local, CI/CD, usuário final)

**Tamanho esperado:** 1000–1500 linhas

---

## Tarefa para o Especialista em Modelagem de Testes

### Seção I: Mapeamento Completo de Artefatos Testáveis

#### I.1 React Components (64 blocos no dashboard)

Listar cada componente em `react-app/src/components/dashboard/` com:
- **Nome:** componente tsx
- **Responsabilidade:** o que renderiza (gráfico, tabela, card, etc.)
- **Data input:** quais campos de data.json consome
- **Privacy:** quais valores precisam de fmtPrivacy()
- **Edge cases:** valores nulos, strings vazias, números muito pequenos/grandes, datas inválidas
- **Exemplo:** 
  ```
  PerformanceSummary
  - Renders: 3 tabs (Resumo, Detalhes, Gráficos)
  - Inputs: retornos_mensais[].annual_returns[].alpha_vs_vwra, backtest.sharpe_ratio
  - Privacy: alpha_vs_vwra (monetário), sharpe_ratio (sem privacy)
  - Edge case: Se alpha_vs_vwra < 0.01, fmtPrivacy deve ocultar
  - Test type: Unit (render + data binding) + Integration (tab switching)
  ```

#### I.2 Pages (aplicações de componentes)

Listar cada página em `react-app/src/app/*/page.tsx` com:
- **Route:** /dashboard, /fire, /retros, etc.
- **Components:** quais componentes são wired
- **Data flow:** como obtém data (usePageData, zustand store, props)
- **secOpen usage:** quais seções usam secOpen() accessor
- **Example:**
  ```
  /dashboard
  - Components: PerformanceSummary, PortfolioAllocation, RiskMetrics
  - Data: usePageData() hook fetches data.json
  - secOpen: Collapsible sections use secOpen() for portfolio.posicoes
  ```

#### I.3 Python Scripts (reconstruct_history.py, generate_data.py, etc.)

Para cada script:
- **Entrada:** quais arquivos/APIs lê (carteira.md, config.py, yfinance, ANBIMA)
- **Processamento:** principais funções (TWR calc, aggregation, IPCA lookup)
- **Saída:** quais campos gera em data.json
- **Validação:** quais invariantes devem ser preservadas
- **Example:**
  ```
  reconstruct_history.py
  - Input: carteira.md (transactions), config.py (strategy)
  - Processing:
    - parse_transactions() → (date, amount, ticker)
    - modified_dietz_twr() → temporal-weighted returns
    - aggregate_by_period() → monthly/annual rollups
  - Output: retornos_mensais, backtest (annual_returns), rolling_sharpe
  - Validation:
    - TWR must be within [-99%, +500%] (sanity bound)
    - Annual returns must sum to total return (within 0.01%)
    - Dates must be chronological, no gaps >1 year
  ```

#### I.4 Utilities & Formatações

Listar cada utility com regras:

**fmtPrivacy(value: number, sensitivity: 'high'|'medium')**
- HIGH (monetário): values <0.01, negative, >1M must be "••••"
- MEDIUM (percentual, índices): show if >0.1%
- Invariant: ordem de grandeza preservada (R$3.5M não vira R$245)

**fmtCurrency(value: number, currency: 'BRL'|'USD')**
- BRL: "R$ 1.234,56" (2 casas, vírgula decimal)
- USD: "$1,234.56" (2 casas, ponto decimal)

**fmtPercent(value: number, decimals: 0–2)**
- 0.0534 → "5,34%"
- -0.12 → "-12,00%"

**secOpen(section: string, defaultOpen: boolean)**
- Encryptor para seções sensíveis (portfolio.posicoes, patrimonio, etc.)
- Returns: defaultOpen se `privacyMode === false`, false se `privacyMode === true`

### Seção II: Matriz de Validação por Artefato

Tabela com 3 colunas:

| Artefato | Regras de Validação | Tipo de Teste |
|----------|-------------------|---------------|
| PerformanceSummary.tsx | alpha_vs_vwra usa fmtPrivacy, tab switch re-renders charts | Unit + Component |
| test_spec_config_sync | spec.json ↔ config.ts ↔ pages TABS array sincronizado | Integration |
| reconstruct_history.py | Modified Dietz weights: w_i = (days - day) / days | Unit (math) |
| fmtPrivacy() | values <0.01 → "••••", magnitude preserved | Unit (parametrized) |
| data.json schema | 6 critical keys, retornos_mensais >=12, annual_returns[] completo | File validation |

### Seção III: Ciclo de Execução (Quando Rodar Quais Testes)

```
PRÉ-COMMIT (npm run test:pre-commit):
├─ Phase 1 (config sync, schema, privacy) — 28 testes
├─ Phase 2 (TWR pipeline, data export) — 22 testes
└─ Phase 3 (charts, privacy imports, secOpen) — 3 testes
└─ npm run validate-data
   └─ Validar data.json completeness

BUILD (npm run build in react-app/):
├─ npm run test:ci (vitest run --coverage)
└─ next build
└─ npm run validate-pages

PUSH (antes de git push):
├─ Garantir todos testes locais passaram
├─ Validar nenhum @ts-ignore/pragma novo foi adicionado
└─ Confirmar data.json foi gerado
```

### Seção IV: Padrões de Teste por Domínio

#### Frontend (React Components)

**Pattern: Unit Test**
```typescript
describe('PerformanceSummary', () => {
  it('should render 3 tabs when data present', () => { ... })
  it('should use fmtPrivacy for alpha_vs_vwra', () => { ... })
  it('should switch tab and re-render chart', () => { ... })
})
```

**Pattern: Integration Test**
```typescript
describe('/dashboard page', () => {
  it('should load data.json and populate all sections', () => { ... })
  it('should respect secOpen() for sensitive sections', () => { ... })
  it('should not break when data.json missing field', () => { ... })
})
```

#### Backend (Python Scripts)

**Pattern: Unit Test (Math)**
```python
def test_modified_dietz_temporal():
    # Given: 2 aportes (day 1, day 28 of 30-day month)
    # When: calculate temporal weights
    # Then: weight[day1] / weight[day28] ≈ 10x
```

**Pattern: Integration Test (Pipeline)**
```python
def test_reconstruct_history_complete():
    # Given: carteira.md + config.py
    # When: run reconstruct_history.py
    # Then: data.json generated with all required keys
```

#### Data Validation

**Pattern: Schema Validation**
```python
def test_data_json_schema():
    # Validate: JSON parseable
    # Validate: 6 critical keys present
    # Validate: retornos_mensais >= 12 months
    # Validate: annual_returns all have alpha_vs_vwra
```

### Seção V: Critérios de Cobertura por Módulo

| Módulo | LOC | Target Coverage | Críticos Testes | Status |
|--------|-----|-----------------|-----------------|--------|
| reconstruct_history.py | ~800 | 80% | TWR, temporal weights, yfinance | ✅ Phase 2 |
| generate_data.py | ~400 | 85% | Schema export, field completeness | ✅ Phase 2 |
| PerformanceSummary.tsx | ~300 | 70% | Tab render, data binding, charts | ✅ Phase 3 |
| dashboard.config.ts | ~200 | 90% | Sync spec.json ↔ pages | ✅ Phase 1 |
| fmtPrivacy.ts | ~50 | 100% | Edge cases <0.01, negative, >1M | ✅ Phase 1 |
| secOpen.ts | ~30 | 100% | Privacy mode toggle | ✅ Phase 3 |

### Seção VI: Problemas Conhecidos & Soluções

| Problema | Root Cause | Prevenção (Teste) | Fase |
|----------|-----------|-------------------|------|
| 15ª reincidência: gráficos não renderizam em abas escondidas | ECharts offsetWidth === 0 | test_chart_hidden_tab_render | 3 |
| Privacy factor muda magnitude (R$3.5M → R$245) | fmtPrivacy regex incorreta | test_privacy_magnitude | 1 |
| alpha_vs_vwra falta em annual_returns | Campo novo, não exportado | test_annual_returns_schema | 1 |
| RF usa custo acumulado, não MtM | Implementação incorreta | test_rf_mtm_vs_cost | 2 |
| Novo campo em config.py não chega em data.json | Falta exportação | test_config_export_completeness | 2 |

### Seção VII: Checklist para Novo Código

Quando dev toca em:

**reconstruct_history.py:**
- [ ] Rodar Phase 2 tests (test_modified_dietz_temporal, test_yfinance_end_of_month, test_rf_mtm_vs_cost)
- [ ] Verificar invariante: TWR within [-99%, +500%]
- [ ] Validar data.json gerado com npm run validate-data

**PerformanceSummary.tsx:**
- [ ] Rodar Phase 1 + 3 tests (schema, privacy, charts)
- [ ] Verificar fmtPrivacy usada em cada numeric display
- [ ] Testar tab switch manual (offsetWidth check)

**dashboard.config.ts:**
- [ ] Rodar Phase 1 test_spec_config_sync
- [ ] Garantir spec.json ↔ pages sincronizados
- [ ] Commit bloqueado se teste falha (pre-commit hook)

**fmtPrivacy.ts:**
- [ ] Rodar Phase 1 test_privacy_magnitude (parametrized edge cases)
- [ ] Verificar ordem de grandeza preservada
- [ ] Testar manual: R$3.5M, R$0.005, R$-120

### Seção VIII: Dependências & Fixtures

**Dados Mock Necessários:**
- carteira.md (mínimo: 3 transações, 2 ativos, 1 ano)
- config.py (estratégia FIRE simples)
- data.json (completo: 12+ meses, annual_returns com alpha_vs_vwra)

**Dados Reais vs Sintéticos:**
- Phase 1–2: usar data.json real (verdade de terra)
- Phase 3: mock componentes isoladas (jsdom, @testing-library)
- Integração: dados reais, pipeline completo

### Seção IX: Roadmap de Manutenção Futura

Após Phase 1–4 implementação:

**Trimestral:**
- [ ] Auditar novos componentes (spec.json foi atualizado?)
- [ ] Rodar Phase 1 test_spec_config_sync (drift check)

**Mensalmente:**
- [ ] `npm run test:pre-commit` local
- [ ] Confirmar pre-commit hook não foi bypassado (git log --grep no-verify)

**Ad-hoc:**
- [ ] Quando bug encontrado em produção: criar teste que o previne antes de fix
- [ ] Quando novo campo em data.json: test_config_export_completeness auto-falha

---

## Formato de Entrega

Documento estruturado Markdown com 9 seções acima, incluindo:
- [ ] Seção I: Mapeamento de 64 componentes + N scripts + formatações
- [ ] Seção II: Matriz 3-coluna (artefato | regras | tipo teste)
- [ ] Seção III: Diagrama fluxo (pré-commit → build → push)
- [ ] Seção IV: Padrões de teste (Frontend, Backend, Data)
- [ ] Seção V: Tabela cobertura por módulo
- [ ] Seção VI: Problemas conhecidos & soluções
- [ ] Seção VII: Checklist (quando modificar quais testes rodam)
- [ ] Seção VIII: Fixtures & dados
- [ ] Seção IX: Roadmap manutenção

**Localização:** `/home/user/wealth/agentes/referencia/spec-v2-testes-completos.md`

**Tamanho:** 1000–1500 linhas (mais específico que plano-testes-auditoria-real.md, menos procedural que plano-testes-executavel.md)

**Público:** Qualquer dev novo no projeto que precisa entender "o quê" e "como" testar cada artefato

---

## Context Disponível

- Audit: `agentes/referencia/plano-testes-auditoria-real.md`
- Plano: `agentes/referencia/plano-testes-executavel.md`
- Testes Phase 1–4: `scripts/tests/`, `react-app/tests/`
- Código: `react-app/src/components/dashboard/`, `scripts/`
- Data: `react-app/public/data.json`
- Config: `scripts/config.py`, `react-app/src/config/dashboard.config.ts`, `agentes/contexto/spec.json`

---

**Não é implementação.** É especificação + referência. Foco em cobertura completa e padrões reutilizáveis.
