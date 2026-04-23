# Plano de Testes Sistemático — 2026

## I. Auditoria do Status Quo

### Testes Existentes

#### React (Frontend)
- **Framework:** Vitest (11+ suites)
- **Localização:** `react-app/src/__tests__/`, `react-app/tests/`
- **Cobertura atual:** ~15 test files, mas fragmentada
  - `privacy-mode.test.ts` → privacy transforms (v2 migration)
  - `component-render.test.tsx` → component rendering
  - `schema-validation.test.ts` → data.json schema
  - `no-hardcoded.test.ts` → architetural rules
  - Outros: routing, asset integrity, calc centralization, data wiring, formatters, etc.
- **Execução:** `npm run test:ci` (com coverage)
- **Problema:** Testes legados com `any` implícito, filtros de erros pré-existentes (`.next/dev/types/validator.ts`, `asset-integrity.test.ts`)

#### Python (Backend)
- **Framework:** pytest
- **Localização:** `scripts/tests/test_data_pipeline.py`
- **Cobertura:** parse_carteira, config, fire_montecarlo (3 areas críticas)
- **Execução:** `python -m pytest scripts/tests/test_data_pipeline.py -v`
- **Problema:** NÃO integrado ao build local, não roda automaticamente

#### E2E (Integration)
- **Framework:** Playwright + Cypress
- **Status:** Parcialmente configurado em `quick_dashboard_test.sh`
- **Problema:** Script referencia `run_all_dashboard_tests.py` que não existe (broken)

#### Validação Manual
- **Script:** `scripts/quick_dashboard_test.sh`
- **Faz:** TypeScript type-check, build, Playwright local render
- **Status:** NÃO integrado ao `npm run build` automaticamente
- **Problema:** Desenvolvedor deve rodar manualmente (não é enforced)

### Gaps Críticos Identificados

| Categoria | Status | Impacto |
|-----------|--------|--------|
| **Python → JSON validação** | ❌ Não existe | Alto — schema mudanças passam sem validação |
| **Data schema end-to-end** | ⚠️ Parcial (React-side only) | Alto — novos campos em Python não são validados antes de React |
| **Privacy transforms** | ✅ Teste existe | Médio — mas pode ter edge cases não cobertos (valores negativos, <0.01) |
| **Integração Python ↔ React** | ❌ Não existe | Alto — mudanças em reconstruct_history.py quebram React sem feedback |
| **Cálculos numéricos** | ⚠️ Parcial (formatters, montecarlo) | Alto — alpha, TWR, CAGR não têm testes de precisão |
| **CLAUDE.md compliance** | ⚠️ Parcial (no-hardcoded.test.ts) | Médio — "Zero hardcoded", "Dados em tempo real" não validados 100% |
| **Performance** | ❌ Não existe | Baixo — mas `npm run test:ci` demora (blocking issue) |

---

## II. Mapeamento de Risco por Arquitetura

### Criticalidade por Módulo

```
CRÍTICO (bloqueia deploy):
  ├─ Python: reconstruct_history.py (TWR cálculo, schema)
  ├─ Python: generate_data.py (enriquecimento, aggregação)
  ├─ Python: backtest_portfolio.py (alpha, returns)
  ├─ React: PerformanceSummary.tsx (tabelas, KPI cards)
  ├─ React: components/primitives/KpiCard.tsx (reutilizável)
  └─ Data: data.json schema (todos os consumidores)

MÉDIO (regressão comum):
  ├─ Python: attribution, fire_montecarlo
  ├─ React: privacy transforms (44+ componentes)
  ├─ React: pages (NOW, Performance, Fire, Portfolio)
  └─ Data: rolling_sharpe, backtest_r7

BAIXO (raramente quebra):
  ├─ React: UI (button, card primitives)
  ├─ Python: tax, fx_utils
  └─ Config (constants, premissas)
```

### Fluxos de Erro Mais Comuns (Últimas 4 semanas)

| Erro | Root Cause | Detectado Por | Prevenção |
|------|-----------|---------------|-----------|
| Alpha ITD vs alpha anual inconsistência | Python calcula, React não alinha na tfoot | Visual review | Teste de reconciliação (Python ↔ React) |
| Privacy factor 7% muda ordem de grandeza | Transform não respeita threshold em valores <0.01 | Visual review | Edge case test: privacy(0.001), privacy(-1000) |
| Schema mismatch (novo campo em Python) | annual_returns.alpha_vs_vwra não existe em React | Build error | Schema validation test (pre-React) |
| Component render com dados parciais | Backtest vazio, annual_returns undefined | Vitest catch, mas nem sempre | Fixture com dados reais vs mock |

---

## III. Estratégia de Testes Redesenhada

### 3.1 Testes Unitários

#### Python (Backend)

**Escopo:** Funções isoladas em scripts críticos

**Cobertura esperada:**
- `reconstruct_history.py`
  - TWR cálculo (Modified Dietz, temporal weights)
  - Annual aggregation (composto, edge cases: YTD, partial years)
  - IPCA/CDI lookups (BCB API fallback)
  - **NEW:** alpha anual (target vs shadowA por ano)
  
- `generate_data.py`
  - Data enriquecimento (adiciona novo campo sem corromper existentes)
  - Type preservation (integer, float, null handling)
  - **NEW:** alpha_vs_vwra adicionado a todos os anos
  
- `backtest_portfolio.py`
  - Returns cálculo (target, shadowA)
  - Metrics agregação (CAGR, Sharpe, etc.)
  
- `fire_montecarlo.py`
  - Spending smile (3 fases, transições)
  - Guardrails (bandas, cortes)
  - Percentis (P10, P50, P90 consistency)

**Fixtures:**
- Dados reais (últimos 5 anos) para testes de integração
- Dados sintéticos (mini dataset) para testes unitários
- Edge cases: zero values, negative, NaN, None

**Execução:** `pytest scripts/tests/ -v --cov=scripts`

#### React (Frontend)

**Escopo:** Component rendering, data wiring, transforms

**Cobertura esperada:**
- `PerformanceSummary.tsx`
  - Tabela anual (headers, células, footer/CAGR)
  - KPI strip (4 cards: CAGR real, nominal, alpha, max DD)
  - Data validation (missing fields, type errors)
  - **NEW:** alpha column exists, color-coding correct, CAGR row shows ITD alpha
  
- `KpiCard.tsx` (primitiva reutilizável)
  - Rendering (label, value, accent, delta, progress, sub)
  - Color semaphores (green ≥4.5%, yellow 3-4.5%, red <3%)
  - Delta calc (quando presente vs undefined)
  - **NEW:** test per page using it (NOW, Performance, Fire)
  
- `Privacy transforms`
  - `usePrivacyTransform()` hook
  - Edge cases: values <0.01, negative, >1M, undefined
  - **NEW:** test privacy=true vs false side-by-side
  
- Utils (formatters, hooks)
  - `fmtPct()`, `fmtPrivacy()`, `returnColor()`
  - Rounding, sign, edge cases

**Fixtures:**
- Mock data.json (completo vs parcial, missing fields)
- Real data.json snapshot para regression tests

**Execução:** `npm run test:ci` (via Vitest)

### 3.2 Testes de Integração

#### Python → JSON

**O que testa:**
- `generate_data.py` output é valid JSON
- Todos os campos esperados presentes (schema compliance)
- Tipos corretos (int, float, null, array)
- Dados não são corruptos (aggregation correctness)

**Exemplo:**
```python
def test_annual_returns_has_alpha_for_all_years():
    """Verifica que annual_returns tem alpha_vs_vwra para todos os anos."""
    data = json.load(open('react-app/public/data.json'))
    annual_returns = data['retornos_mensais']['annual_returns']
    
    assert len(annual_returns) > 0
    for row in annual_returns:
        assert 'year' in row
        assert 'alpha_vs_vwra' in row or row['year'] == 2021  # 2021 pode ter dados parciais
        if 'alpha_vs_vwra' in row:
            assert -50 < row['alpha_vs_vwra'] < 50  # sanity range
```

**Execução:** `pytest scripts/tests/test_data_integration.py -v`

#### React → JSON

**O que testa:**
- Componentes leem campos corretos de data.json
- Type errors detectados em build (TypeScript)
- Missing fields handled gracefully (fallback, —, loading state)

**Exemplo:**
```tsx
describe('PerformanceSummary', () => {
  it('renders alpha column when data has alpha_vs_vwra', () => {
    const data = { retornos_mensais: { annual_returns: [
      { year: 2024, alpha_vs_vwra: -3.56, ... },
    ] } };
    
    render(<PerformanceSummary data={data} />);
    expect(screen.getByText('-3.56pp')).toBeInTheDocument();
  });
  
  it('renders — when alpha_vs_vwra missing', () => {
    const data = { retornos_mensais: { annual_returns: [
      { year: 2024, ... }, // sem alpha_vs_vwra
    ] } };
    
    render(<PerformanceSummary data={data} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
```

**Execução:** `npm run test:ci` (Vitest)

#### Full End-to-End (Python → JSON → React → HTML)

**O que testa:**
- Build completo sem erros (npm run build)
- HTML gerado é válido (Playwright)
- Nenhuma console error ou hydration mismatch
- Pages não têm broken links, missing assets

**Execução:** `./scripts/test-e2e.sh` (Playwright)

### 3.3 Testes de Regressão

**Trigados automaticamente quando:**
- Mudança em `reconstruct_history.py`, `generate_data.py`, `backtest_portfolio.py`
- Mudança em `data.json` schema
- Mudança em componentes críticos (PerformanceSummary, KpiCard, Privacy)

**O que roda:**
1. Python unit tests
2. data.json validation (schema + completeness)
3. React component tests
4. Playwright local render
5. Build success

### 3.4 Testes de Premissas (CLAUDE.md Compliance)

**O que testa:**
- "Zero hardcoded": nenhum valor hardcoded em React (exceto theme, static strings)
- "Dados em tempo real: CLI primeiro": dados vêm de reconstruct_history, não mocks
- "Quant valida mudanças": números batem entre Python e React (reconciliação)
- "Privacy obrigatório": todo valor sensível usa privacyMode transform

**Exemplo:**
```tsx
// no-hardcoded.test.ts
test('PerformanceSummary nao tem valores hardcoded', () => {
  const source = fs.readFileSync('react-app/src/components/dashboard/PerformanceSummary.tsx', 'utf-8');
  
  // permitido: theme vars, static strings, config imports
  const forbidden = [
    /4\.5/,  // premissas (devem vir de data.json)
    /0\.16/,  // alpha (vem de data.json)
    /3\.56/,  // exemplo de valor (vem de data.json)
  ];
  
  forbidden.forEach(pattern => {
    expect(source).not.toMatch(pattern);
  });
});
```

**Execução:** `npm run test:ci` (Vitest)

### 3.5 Testes de Dados (Sanidade)

**O que testa:**
- Completeness: nenhum campo crítico vazio
- Consistency: relações entre tabelas (annual_returns ↔ rolling_sharpe, etc.)
- Ranges: valores estão dentro de limites físicos (% entre -200 e +200, etc.)
- Precision: arredondamento consistente (2 decimais para %, 4 para valores USD)

**Exemplo:**
```python
def test_data_completeness():
    """Verifica que data.json tem todos os campos esperados."""
    data = json.load(open('react-app/public/data.json'))
    
    required_keys = [
        'retornos_mensais',
        'rolling_sharpe',
        'backtest',
        'posicoes',
        'premissas',
        # ... mais
    ]
    
    for key in required_keys:
        assert key in data, f"Missing required key: {key}"
    
    # Campos aninhados críticos
    assert 'annual_returns' in data['retornos_mensais']
    assert len(data['retornos_mensais']['annual_returns']) > 0
    
    for row in data['retornos_mensais']['annual_returns']:
        assert 'year' in row
        assert 'twr_nominal_brl' in row
        assert 'alpha_vs_vwra' in row
```

**Execução:** `pytest scripts/tests/test_data_validation.py -v`

---

## IV. Definição de Ciclo: Execução Local no Build

### 4.1 Fluxo de Desenvolvimento

```
1. Código local: edita arquivo (Python ou React)
   ↓
2. PRÉ-COMMIT (automático ou manual):
   npm run test:pre-commit
   └─ TypeScript type-check
   └─ Vitest (React)
   └─ pytest (Python)
   └─ data.json validation
   └─ Playwright local render
   ↓
3. Git COMMIT (só passa se testes OK)
   git add && git commit
   ↓
4. Build (npm run build — roda testes novamente)
   └─ Garante consistência
   └─ Bloqueia se falhar
   ↓
5. Git PUSH (só push se build OK)
   git push origin branch
   ↓
6. GitHub Pages (recebe APENAS código testado)
   └─ Deploy é rápido (sem CI/CD overhead)
   └─ Sem feedback loop remoto
```

### 4.2 Comandos de Teste

#### Teste Rápido (antes de commit)
```bash
npm run test:pre-commit
# Roda: TypeScript + Vitest (React rápido) + pytest (Python rápido)
# Tempo: ~30-45s
# Blocking: SIM (falha = não permite commit)
```

#### Teste Completo (antes de push)
```bash
npm run test:full
# Roda: TypeScript + Vitest + pytest + Playwright + data validation
# Tempo: ~3-5 min
# Blocking: SIM (falha = não permite push)
```

#### Teste Específico
```bash
npm run test -- PerformanceSummary     # React test file
pytest scripts/tests/ -k reconstruct   # Python test by pattern
npm run test:e2e                       # Playwright (requer build)
```

#### Develop (Watch Mode)
```bash
npm run test:watch     # Vitest em watch, re-roda quando arquivo muda
pytest --watch         # pytest-watch plugin para Python (opcional)
```

### 4.3 Integração no Build

**package.json** (React):
```json
{
  "scripts": {
    "test:pre-commit": "tsc --noEmit && vitest run && python -m pytest scripts/tests/test_data_pipeline.py",
    "test:full": "npm run test:pre-commit && npm run validate:data && playwright test --project=local",
    "build": "npm run sync-data && npm run test:pre-commit && next build && npm run post-build",
    "test": "vitest",
    "test:ci": "vitest run --coverage"
  }
}
```

**Makefile** (Python, para facilitar):
```makefile
.PHONY: test-all test-py test-react test-e2e

test-all:
	@echo "🧪 Running full test suite..."
	pytest scripts/tests/ -v --cov=scripts
	cd react-app && npm run test:full

test-py:
	pytest scripts/tests/ -v

test-react:
	cd react-app && npm run test:full

test-e2e:
	cd react-app && playwright test
```

---

## V. Métricas & SLOs

| Métrica | Target | Current | Owner |
|---------|--------|---------|-------|
| **Cobertura Python** (% lines) | 70% | ⚠️ ~30% (só test_data_pipeline) | Dev |
| **Cobertura React** (% statements) | 65% | ⚠️ ~40% (fragmentado) | Dev |
| **Tempo suite completa** | <5 min | ⚠️ ~10-15 min (com Playwright) | Dev |
| **Tempo pre-commit** | <60s | ? (não medido) | Dev |
| **Test execution time** | <2s por teste | ⚠️ 3-5s (legacy Cypress overhead) | Dev |
| **False positive rate** | <5% | ⚠️ ~10% (filtros de erros pré-existentes) | Dev |
| **Schema validation** | 100% (todos os anos têm alpha) | ⚠️ Não existe teste | Dev |

### SLO: Zero Regressões Visuais/Numéricos

**Definição:** Nenhum erro que passa pelos testes locais pode aparecer em GitHub Pages.

**Mecanismo:** 
- Build local roda testes (bloqueante)
- GitHub Pages recebe APENAS código testado
- Deployment é fast (5-10s, sem CI/CD)

---

## VI. Checklist para Novo Código

### Antes de `git commit`

- [ ] `npm run test:pre-commit` passa (React + Python + TypeScript)
- [ ] Novo campo em data.json? Adicionei validação em pytest
- [ ] Novo componente React? Adicionei teste de render + data binding
- [ ] Cálculo numérico novo (alpha, TWR, etc.)? Adicionei reconciliação (Python = React)
- [ ] Mudança em privacy? Adicionei edge case test (valores <0.01, negativos, >1M)
- [ ] Mudança em CLAUDE.md? Validei compliance (no hardcoded, CLI first, etc.)

### Antes de `git push`

- [ ] `npm run test:full` passa (inclui Playwright)
- [ ] `npm run build` passa sem warnings
- [ ] data.json não tem erros (schema, tipos, ranges)
- [ ] Se toquei em Python, pytest foi rodado
- [ ] Se toquei em React, Vitest foi rodado
- [ ] TypeScript type-check limpo (sem filtros de "known errors")

### Antes de Merge

- [ ] Todos os testes passam em `main`
- [ ] Coverage não diminuiu (ou justificado em PR)
- [ ] Nenhum TODOs/FIXMEs novos deixados

---

## VII. Roadmap de Implementação

### Fase 1 (Esta semana): Setup & Automação
- [ ] Criar `scripts/test-all.sh` que roda Python + React + Playwright
- [ ] Integrar testes no `npm run build` (hoje só `npm run test:ci`)
- [ ] Fix broken `run_all_dashboard_tests.py` ou remover se não usado
- [ ] Remove filtros de "known errors" em TypeScript (fix pre-existing errors)
- [ ] Documentar: `/docs/testing.md` (guia rápido para dev)

### Fase 2 (Próximas 2 semanas): Cobertura
- [ ] Python: adicionar testes para reconstruct_history (TWR), generate_data (enriquecimento)
- [ ] Python: adicionar schema validation (annual_returns sempre tem alpha_vs_vwra)
- [ ] React: adicionar testes para PerformanceSummary (tabela, KPI cards, CAGR row)
- [ ] React: adicionar reconciliação (KpiCard alpha ITD vs tabela alpha anual)
- [ ] Data: adicionar `test_data_validation.py` (completeness, consistency, ranges)

### Fase 3 (Próximas 4 semanas): CLAUDE.md Compliance
- [ ] Validar "Zero hardcoded" (test + eslint rule)
- [ ] Validar "Dados em tempo real" (mock vs real fixtures)
- [ ] Reconciliação Quant: alpha Python ↔ React (automático)
- [ ] Privacy edge cases (values <0.01, negative, >1M)

### Fase 4 (Ongoing): Maintenance
- [ ] Coverage reports (publicar % por módulo)
- [ ] Performance benchmarks (tempo de build, suite)
- [ ] Regression suite (snapshot tests para tabelas, gráficos)

---

## VIII. Decisões Arquiteturais

### Por que Local Builds, Não CI/CD Remoto?

**Razões:**
1. **Feedback rápido:** Dev fica sabendo de erro em 30s, não esperando GitHub Actions
2. **Sem overhead:** GitHub Pages é estático, sem build remoto
3. **Prevenção na origem:** Não permite commit ruins chegar ao repo
4. **Segurança:** Nenhum código não-testado em main

### Por que Vitest + pytest, Não um só framework?

**Razões:**
1. **Separação de contextos:** Python scripts precisam de pytest; React precisa de jsdom + React Testing Library
2. **Especialização:** Vitest é otimizado para React; pytest para data/scripts
3. **Tradição do projeto:** Já existem ambos, apenas formalizar cobertura

### Por que Não Cypress/E2E para Tudo?

**Razões:**
1. **Lento:** E2E é 10x mais lento que unit tests (não deve ser primary feedback loop)
2. **Frágil:** Testes E2E quebram com mudanças pequenas (maintainability)
3. **Uso:** E2E vale para happy path + critical flows, não cobertura 100%
4. **Localização:** Usa Playwright (mais rápido que Cypress) para local render validation

---

## IX. FAQ & Troubleshooting

**P: Tempo de `npm run test:full` é 10min, target é 5min. O que fazer?**
A: Paralelizar Vitest + pytest (rodam em paralelo), ou remover testes lentos para nightly. Medir tempo por suite.

**P: Tenho um teste que falha em CI mas passa localmente (flaky).**
A: Típico de E2E/Playwright com timing. Usar waits explícitos, não implícitos. Rerun 3x antes de falhar.

**P: Como mockear data.json para testes?**
A: Criar `__fixtures__/data.mock.json` com subset mínimo de dados. Use em testes unitários. Use snapshot real para integração.

**P: Um teste está "preso" no legacy code. Como remover sem quebrar?**
A: Marcar como `xit()` (skip), abrir issue, migrar em follow-up. Não deixar código quebrado.

**P: Devo testar cada cor/semáforo ou só a lógica?**
A: Testar lógica (cagrSemaphore(4.5) = green). Visual testing (cores reais) é manual ou Playwright snapshot.

---

## X. Documentação para Referência

**Arquivos a atualizar:**
- `CLAUDE.md`: adicionar seção "Testing Strategy"
- `docs/testing.md` (novo): guia rápido para dev
- `scripts/README.md`: documenta script de teste

**Referências:**
- Vitest docs: https://vitest.dev
- pytest docs: https://docs.pytest.org
- Playwright docs: https://playwright.dev

---

**Documento válido a partir de:** 2026-04-23
**Próxima revisão:** 2026-05-23 (1 mês)
**Dono:** Head (você) + Dev (para implementação)
