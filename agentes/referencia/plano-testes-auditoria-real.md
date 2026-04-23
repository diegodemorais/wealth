# Auditoria Real do Plano de Testes — Baseada em Commits, Issues e Arquitetura

**Data:** 2026-04-23  
**Escopo:** Últimas 2 semanas (30 commits) + issues abertas  
**Metodologia:** Review de commits + análise de issues + mapeamento de arquivos críticos

---

## I. Padrões de Erro Identificados (2 últimas semanas)

### Erro 1: Schema Mismatch — Divergência entre Múltiplas Fontes de Verdade

**Incidência:** DEV-schema-sync (issue aberta 2026-04-22, fechada 2026-04-22)

**Problema:** Reorganização de abas criou 3 fontes de verdade divergentes:
- `dashboard/spec.json` — manifesto do layout (991 linhas)
- `react-app/src/config/dashboard.config.ts` — TABS + SECTIONS config
- Pages individuais com hardcode direto

**Sintoma:** Pages bypassavam `secOpen()/secTitle()` com hardcoded defaultOpen

**Por que não foi detectado:** Não há teste de "spec.json ↔ dashboard.config.ts ↔ Pages são sincronizados"

**Teste necessário:**
```python
def test_schema_sync():
    """Garante que spec.json e dashboard.config.ts estão sincronizados."""
    spec = json.load(open('dashboard/spec.json'))
    config = import_module('react-app/src/config/dashboard.config.ts')
    
    # Todas as abas em spec.json existem em config.TABS
    spec_tabs = {tab['slug'] for tab in spec['tabs']}
    config_tabs = {tab['slug'] for tab in config.TABS}
    assert spec_tabs == config_tabs, f"Mismatch: {spec_tabs} vs {config_tabs}"
```

---

### Erro 2: Gráficos Não Renderizam (Padrão Recorrente)

**Incidência:** DEV-charts-render-2026-04-13 (5ª + 15ª + 3ª reincidência de bugs similares)

**Problemas específicos:**

| Bug | Componente | Raiz | Reincidência |
|-----|-----------|------|-------------|
| B2 | TrackingFire | Chart.js 4 renderer quebrado com valores BRL grandes (14.4M) | 3ª+ |
| B3 | GlidePath | Canvas offsetWidth === 0 (aba escondida) | 15ª+ |
| B4 | NetWorthProjection | Método `getPixelForIndex()` removido em Chart.js 4 | 5ª+ |
| B7 | StressFanChart | offsetWidth === 0 + timeout insuficiente | 2ª+ |

**Padrão:** Erros persistem porque:
1. **Sem testes de renderização:** Nenhum teste roda gráficos em abas escondidas
2. **Chart.js 4 migration não foi auditada:** Breakage de API não foi documentado
3. **Testes canvas-dependent não existem:** Mocks do canvas não validam escala de números

**Teste necessário:**
```typescript
describe('ECharts rendering in hidden tabs', () => {
  it('renders correctly when tab is display:none', () => {
    const tab = document.querySelector('[style*="display:none"]');
    const canvas = tab.querySelector('canvas');
    
    expect(canvas).toBeInTheDocument();
    // Trigger resize/recalc
    window.dispatchEvent(new Event('resize'));
    
    // Verify no TypeErrors in console
    expect(console.error).not.toHaveBeenCalled();
  });

  it('handles BRL values > 1M without renderer artifacts', () => {
    const chart = new EChart({ data: { values: [14_400_000, 15_000_000] } });
    const rendered = chart.render();
    
    // Y-axis labels should be readable (not clustered at zero)
    expect(rendered.querySelectorAll('.y-axis-label').length).toBeGreaterThan(3);
  });
});
```

---

### Erro 3: TWR Pipeline — 3 Bugs Críticos em Cálculos (AINDA ABERTOS)

**Incidência:** DEV-twr-pipeline-fixes (aberta 2026-04-23, ainda BACKLOG)

**3 Problemas:**

| ID | Problema | Impacto | Status |
|----|----------|--------|--------|
| P4 | RF usa custo em vez de MtM | Patrimônio subestimado R$15-25k | Não testado |
| P1 | yfinance retorna 1º dia mês, não último | Mismatch com snapshot end-of-month | Não testado |
| P3 | Modified Dietz sem peso temporal | Acumulado ~0.5-1% errado em 5 anos | Não testado |

**Commit 8b02584 tentou fix todos 3** — mas mudou 880 linhas em múltiplos arquivos:
- `scripts/reconstruct_history.py` (+268 linhas)
- `dados/retornos_mensais.json` (618 linhas modificadas)
- `dados/rolling_metrics.json` (548 linhas)
- `dados/portfolio_summary.json` (26 linhas)
- `dados/historico_carteira.csv` (110 linhas)

**Por que não foi detectado:**
1. **Sem testes de reconciliação:** Não há teste que compare CAGR antes/depois
2. **Sem snapshot tests:** Dados.json mudou, mas não há teste que valide as mudanças são corretas
3. **Sem validação de premissas:** Quant não validou que RF MtM está correto

**Teste necessário:**
```python
def test_twr_recalc_reconciliation():
    """Valida que TWR recalculation com fixes P1/P3/P4 está correto."""
    before = json.load(open('dados/retornos_mensais.backup.json'))
    after = json.load(open('dados/retornos_mensais.json'))
    
    # CAGR não deve mudar drasticamente (flag de erro)
    before_cagr = before['twr_real_brl_pct']
    after_cagr = after['twr_real_brl_pct']
    assert abs(before_cagr - after_cagr) < 1.0, f"CAGR delta too large: {before_cagr} → {after_cagr}"
    
    # RF contribution deveria aumentar (~1-2%)
    before_rf_contrib = before['decomposicao']['rf_xp'][-1]
    after_rf_contrib = after['decomposicao']['rf_xp'][-1]
    assert after_rf_contrib > before_rf_contrib, "RF contribution should increase with MtM fix"

def test_modified_dietz_with_temporal_weight():
    """Valida que pesos temporais estão sendo aplicados."""
    from scripts.reconstruct_history import compute_modified_dietz_temporal
    
    # Testar com aportes conhecidos
    aportes = [
        ('2026-01-01', 10000),  # início do mês
        ('2026-01-15', 5000),   # meio do mês
    ]
    twr = compute_modified_dietz_temporal(aportes, retornos_mensais)
    
    # Resultado deve diferir de non-temporal
    twr_non_temporal = compute_modified_dietz(aportes, retornos_mensais)
    assert twr != twr_non_temporal, "Temporal weight should produce different result"
```

---

### Erro 4: Privacy Factor Muda Ordem de Grandeza

**Incidência:** Commit 72f65a9 (2026-04-23, fix: privacy factor 7%)

**Problema:** Transform de privacyMode 7% está mudando a ordem de grandeza
- R$3.5M → R$245k (impossível inferir escala)
- Proporções preservadas, mas gráficos enganam

**Por que não foi detectado:**
1. **Sem testes de edge cases:** Nenhum teste de valor > 1M com privacy
2. **Sem testes visuais:** Ordem de grandeza não é validada

**Teste necessário:**
```typescript
describe('privacyTransform edge cases', () => {
  it('preserves order of magnitude for large values (>1M)', () => {
    const value = 3_500_000;
    const transformed = fmtPrivacy(value, true);
    
    // Transformado deve estar no mesmo intervalo de magnitude
    const original_magnitude = Math.floor(Math.log10(value));
    const transformed_num = parseInt(transformed.replace(/[^\d]/g, ''));
    const transformed_magnitude = Math.floor(Math.log10(transformed_num));
    
    expect(transformed_magnitude).toBe(original_magnitude);
  });

  it('does not transform negative values incorrectly', () => {
    const value = -50_000;
    const transformed = fmtPrivacy(value, true);
    expect(transformed).toContain('−'); // Mantém sinal
  });

  it('handles values < 0.01 without scientific notation', () => {
    const value = 0.005;
    const transformed = fmtPrivacy(value, true);
    expect(transformed).not.toMatch(/e[-+]\d/); // Sem 1e-3
  });
});
```

---

### Erro 5: Privacy v2 Migration — 44 Componentes Quebrados

**Incidência:** Commit 741efc3 (2026-04-23)

**Problema:** Migração de `••••` → `fmtPrivacy()` adicionou imports em 44 componentes, quebrou FireMatrixTable

**Sintoma:** Build passou, mas tipo error em FireMatrixTable importado incorretamente

**Por que não foi detectado:**
1. **TypeScript type-check com filtros pré-existentes:** Erros estão sendo ignorados (`.next/dev/types/validator.ts`, `asset-integrity.test.ts`)
2. **Sem teste de cobertura de imports:** Nenhum teste valida que todas as 44 mudanças estão corretas

**Teste necessário:**
```typescript
test('all components using fmtPrivacy have correct imports', () => {
  const filesUsingFmtPrivacy = glob.sync('src/**/*.{ts,tsx}');
  
  filesUsingFmtPrivacy.forEach(file => {
    const source = fs.readFileSync(file, 'utf-8');
    
    if (source.includes('fmtPrivacy(')) {
      expect(source).toMatch(/import.*fmtPrivacy.*from.*privacyTransform/);
    }
  });
});
```

---

## II. Mapeamento de Arquivos Críticos — Fontes de Verdade

### Data Pipeline (Python Scripts) — 6.3k linhas

```
agentes/contexto/carteira.md (Fonte de Verdade #1)
├─ Tabela: Parâmetros para Scripts (12 colunas, +30 rows)
│  └─ Premissas: PESOS_TARGET, APORTE_MENSAL, IDADE_ATUAL, etc.
│
scripts/parse_carteira.py
├─ Lê carteira.md → carteira_params.json
├─ Extrai tabela (seção "Parâmetros para Scripts")
│  └─ Validação: seção existe? Colunas corretas?
│
scripts/config.py (Fonte de Verdade #2 — Python)
├─ Importa carteira_params.json
├─ Define constantes: PESOS_TARGET, EQUITY_PCT, IPCA_CAGR_FALLBACK, etc.
├─ 6k+ linhas de valores canônicos
│  └─ Problema: Hardcoded fallbacks se carteira_params.json falta
│
scripts/generate_data.py (Pipeline orquestrador)
├─ Chama: reconstruct_history.py → retornos_mensais.json
├─ Chama: backtest_portfolio.py → backtest.json
├─ Chama: get_attribution() → attribution data
├─ Enriquece: annual_returns com alpha_vs_vwra (novo, 2026-04-23)
│  └─ Problema: Nova lógica não testada
├─ Saída: react-app/public/data.json (Fonte de Verdade #3 — JSON)
│  └─ 54 chaves de top-level, ~150 campos aninhados
│
scripts/reconstruct_history.py (Cálculos críticos)
├─ TWR cálculo (Modified Dietz — AINDA COM 3 BUGS P1/P3/P4)
├─ Annual aggregation
├─ IPCA/CDI lookups
├─ Output: retornos_mensais.json
```

### React Config & Data Binding (TypeScript) — ~2k linhas

```
react-app/public/data.json (Entrada única)
├─ Gerada por generate_data.py
├─ 54 top-level keys: retornos_mensais, backtest, posicoes, premissas, ...
│  └─ Problema: Schema não validado em React build
│
react-app/src/config/dashboard.config.ts (Fonte de Verdade #2 — React)
├─ TABS: [DASHBOARD, PORTFOLIO, PERFORMANCE, ...]
├─ SECTIONS: por tab, com defaultOpen/title
├─ Helper: secOpen(tab, section) → boolean
│  └─ Problema: Diverge de spec.json + pages usam hardcode
│
react-app/src/hooks/usePageData.ts
├─ Lê data.json → parseData()
├─ Tipo: `Record<string, unknown>` (❌ any implícito)
│  └─ Problema: Sem validação de schema, campos podem faltar
│
dashboard/spec.json (Fonte de Verdade #3 — Manifesto)
├─ Mapa de tabs/blocks/sections
├─ 991 linhas de JSON estático
│  └─ Problema: Edições manuais não sincronizam com código
```

### Problema Arquitetural Identificado

**3 Fontes de Verdade Divergentes:**
1. `dashboard/spec.json` — manifesto estático (edição manual)
2. `react-app/src/config/dashboard.config.ts` — config dinâmica (código)
3. Pages individuais — hardcoded (disperso em 7 arquivos)

**Risco:** Mudanças em um lugar não refletem nos outros.  
**Solução necessária:** Testar sincronização cross-sources.

---

## III. Problemas Recorrentes — Padrão de Falha

### Padrão 1: Component Data Binding — Campos Faltando

**Exemplos:**
- `PerformanceSummary.tsx` espera `annual_returns[].alpha_vs_vwra` (novo em 2026-04-23)
- Mas se `reconstruct_history.py` não preenche, React renderiza quebrado
- Sem tipo error, componente exibe "—" silenciosamente

**Teste necessário:**
```typescript
test('PerformanceSummary handles missing alpha_vs_vwra gracefully', () => {
  const dataWithoutAlpha = {
    retornos_mensais: {
      annual_returns: [
        { year: 2024, twr_nominal_brl: 5, ... }  // Sem alpha_vs_vwra
      ]
    }
  };
  
  render(<PerformanceSummary data={dataWithoutAlpha} />);
  expect(screen.getByText('—')).toBeInTheDocument(); // Fallback OK
});
```

### Padrão 2: Python → JSON Schema Evolution

**Histórico:**
- `annual_returns` começou sem `alpha_vs_vwra`
- Commit 8b02584 adicionou `alpha_vs_vwra` a alguns anos
- Commit f4c1c6b finalizou para todos os anos
- Mas nenhum teste validou que TODOS os anos têm o campo

**Teste necessário:**
```python
def test_annual_returns_schema_complete():
    """Garante que annual_returns tem todos os campos esperados para todos os anos."""
    data = json.load(open('react-app/public/data.json'))
    annual_returns = data['retornos_mensais']['annual_returns']
    
    required_fields = ['year', 'months', 'ytd', 'twr_nominal_brl', 'twr_real_brl', 'alpha_vs_vwra']
    
    for row in annual_returns:
        for field in required_fields:
            assert field in row, f"Year {row['year']} missing field: {field}"
            assert row[field] is not None or row[field] == 0, f"Year {row['year']}.{field} is null"
```

### Padrão 3: Type Errors Silenciosos em TypeScript

**Exemplos:**
- Commit 741efc3: FireMatrixTable quebrou, mas tipo check ignorou
- Razão: Filtros de "known errors" em TypeScript config

**Teste necessário:**
```bash
# Remover filtros de erros pré-existentes
# tsc --noEmit deve ser PURO (zero erros)
```

---

## IV. Arquitetura de Validação Necessária

### Validações Faltando

| Validação | Tipo | Frequência | Owner |
|-----------|------|-----------|-------|
| schema.json ↔ config.ts ↔ pages | Integration | Pré-commit | Dev |
| carteira.md → config.py → data.json | Pipeline | Pré-commit | Dev + Quant |
| TypeScript puro (zero known errors) | Build | Pré-commit | Dev |
| Todos os fields em data.json existem | Schema | Pré-commit | Dev |
| data.json tipos corretos (int/float/null) | Schema | Pré-commit | Dev |
| RC values within reasonable ranges | Sanity | Pré-commit | Dev + Quant |
| Component can render with missing fields | Unit | Pré-commit | Dev |
| React + Python numbers match (alpha) | Integration | Pré-commit | Dev + Quant |

---

## V. Cronologia de Mudanças & Testes Que Falharam

| Semana | Commit | O que mudou | Teste que faltou | Erro |
|--------|--------|-----------|-----------------|------|
| Sem 1 | 8b02584 | TWR recalc (P1/P3/P4) | Reconciliação CAGR | Silencioso, 3 bugs ainda abertos |
| Sem 1 | 379745e | Privacy v2 (••→transform) | Edge cases (neg, <0.01, >1M) | Privacy factor 7% muda magnitude |
| Sem 2 | 741efc3 | +44 imports fmtPrivacy | Cobertura de imports | FireMatrixTable quebrado |
| Sem 2 | DEV-tab-reorganization | Reorg abas | Schema sync | Spec.json ↔ config.ts divergem |
| Sem 2 | f4c1c6b | Alpha anual na tabela | Dados completos + reconciliação ITD | Alpha linha CAGR faltava |

---

## VI. Escopo Real do Plano de Testes

### Priority 1 — Crítico (Bloqueia Deploy)

1. **Schema Validation Pipeline**
   - `carteira.md` → `config.py` → `data.json` é válido
   - Todos os campos esperados estão presentes
   - Tipos corretos (int, float, null, array)
   - Ranges sanity (% entre -200 e +200, valores > 0)

2. **Reconciliação Python ↔ React**
   - Alpha ITD (KpiCard) = alpha anualizado
   - Alpha anual (tabela) = retorno target - retorno VWRA
   - CAGR real = (1 + nominal) / (1 + ipca) - 1
   - Números decimais alinhados

3. **TypeScript Type-Check Puro**
   - Zero erros conhecidos (remover filtros)
   - Imports corretos em 44+ componentes

### Priority 2 — Alto (Previne Regressão)

4. **Chart Rendering em Tabs Escondidas**
   - ECharts renderiza corretamente em `display:none`
   - Timeout retry para `offsetWidth === 0`
   - Valores BRL > 1M sem renderer artifacts

5. **Privacy Transform Edge Cases**
   - Valores negativos: sinal preservado
   - Valores < 0.01: sem scientific notation
   - Valores > 1M: ordem de grandeza preservada

6. **Component Data Binding**
   - Componentes renderizam com dados faltando
   - Fallback a "—" ou loading state

### Priority 3 — Médio (Nice-to-Have)

7. **TWR Pipeline Validation**
   - P1: yfinance fim-de-mês
   - P3: Modified Dietz com pesos temporais
   - P4: RF MtM via PYield

---

## VII. Checklist para Próximos Commits

**Antes de `git commit`:**
- [ ] Mudei Python? Rodi `pytest scripts/tests/ -v`
- [ ] Mudei React? Rodi `npm run test:ci`
- [ ] Mudei data.json schema? Validei todas as chaves esperadas existem
- [ ] Mudei privacy? Testes de edge case (neg, <0.01, >1M)?
- [ ] Mudei multiple arquivos? Sincronização entre spec.json, config.ts, pages?
- [ ] TypeScript type-check é puro (zero known errors)?

---

## VIII. Próximas Ações

1. **Hoje:** Criar teste schema sync (spec.json ↔ config.ts)
2. **Amanhã:** Criar teste TWR reconciliation (CAGR antes/depois)
3. **Semana:** Criar teste privacy edge cases + chart rendering
4. **Sprint:** Remover filtros de TypeScript, fixar erros
5. **Ongoing:** Adicionar testes conforme surgem novos commits

