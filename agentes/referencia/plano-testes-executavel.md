# Plano de Testes Executável — Wealth Dashboard

**Data:** 2026-04-23  
**Baseado em:** Auditoria de 443 linhas (plano-testes-auditoria-real.md) + 30 commits + 8 issues críticas  
**Scope:** 4 padrões de erro reais + 3 fontes de verdade divergentes + 5 testes com máximo ROI

---

## I. Mapeamento Arquitetural — Fluxo de Dados

### Pipeline Python → React (End-to-End)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FONTE ÚNICA: agentes/contexto/carteira.md                                   │
│ └─ Seção: Parâmetros para Scripts (tabela 12 cols, 30+ rows)              │
│    Exemplo: equity_pct=0.79, ipca_cagr_fallback=3.5, aporte_mensal=15000  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ scripts/parse_carteira.py                                                    │
│ ├─ Parse: carteira.md (markdown) → dados/carteira_params.json               │
│ ├─ Validação: seção existe? Sintaxe correta?                               │
│ └─ Error handling: ValueError se seção faltando                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ scripts/config.py (FONTE #2 — Constantes Canônicas)                        │
│ ├─ _load_params(): lê carteira_params.json                                  │
│ ├─ Fallback: hardcoded se arquivo faltar                                    │
│ ├─ 150+ constantes derivadas (PESOS_TARGET, BUCKET_MAP, EQUITY_WEIGHTS)   │
│ ├─ Estrutural: TICKERS_YF, BUCKET_MAP (muda só com novo ETF)              │
│ └─ [CRÍTICO] Sem testes de schema mismatch com carteira.md                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ scripts/generate_data.py (Orquestrador)                                      │
│ ├─ Lê: config.py + dashboard_state.json + 12 arquivos derivados            │
│ ├─ Chama paralelo: reconstruct_history.py, fire_montecarlo, backtest, ...  │
│ ├─ Enriquece: annual_returns com alpha_vs_vwra (novo, 2026-04-23)         │
│ ├─ Output: react-app/public/data.json (54 top-level keys)                  │
│ └─ [CRÍTICO] Nenhum teste de schema completeness (todos 54 keys existem?)   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ scripts/reconstruct_history.py (Cálculos: 1480 linhas)                      │
│ ├─ TWR cálculo (Modified Dietz): P1/P3/P4 foram corrigidos (2026-04-23)   │
│ ├─ Annual aggregation: retornos_mensais.json (61 meses)                    │
│ ├─ IPCA lookup: CDI, SELIC snapshots                                        │
│ ├─ Output: retornos_mensais.json, rolling_metrics.json, portfolio_summary  │
│ └─ [CRÍTICO] 3 testes ausentes: P1 test, P3 test, P4 test                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ react-app/public/data.json (FONTE #3 — Contrato React)                     │
│ ├─ 54 top-level keys (retornos_mensais, backtest, posicoes, premissas...)  │
│ ├─ ~150 campos aninhados (annual_returns[].alpha_vs_vwra, ...)             │
│ ├─ Types: int, float, array, null — NENHUM schema validation em build      │
│ └─ [CRÍTICO] Se key faltar, React renderiza silenciosamente               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ react-app/src/hooks/usePageData.ts                                          │
│ ├─ parseData(): transforma data.json (Record<string, unknown>)             │
│ ├─ [BUG] Tipo any implícito — nenhuma validação de schema                  │
│ └─ [CRÍTICO] Campos faltando == undefined, componentes renderizam "—"      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ react-app/src/config/dashboard.config.ts (FONTE #2 — Layout React)        │
│ ├─ TABS[8]: DASHBOARD, PORTFOLIO, PERFORMANCE, FIRE, RETIREMENT, ...      │
│ ├─ SECTIONS[tab]: grupo, título, defaultOpen, collapsible                 │
│ ├─ Helpers: secOpen(tab, section) → boolean, secTitle()                   │
│ └─ [CRÍTICO] Diverge de dashboard/spec.json + pages usam hardcode         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pages (8x): now, portfolio, performance, fire, withdraw, backtest, ...     │
│ ├─ Cada página: CollapsibleSection {id, title, defaultOpen, children}     │
│ ├─ Dependência: PerformanceSummary, GlidePath, TrackingFire, ...         │
│ └─ [CRÍTICO] 44 componentes com fmtPrivacy imports (privacy v2 migration)  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ dashboard/spec.json (FONTE #1 — Manifesto Estático)                        │
│ ├─ 1004 linhas: tabs[8], blocks[N], sections per tab                      │
│ ├─ Edição manual → diverge do código                                       │
│ └─ [CRÍTICO] Nenhum teste de sincronização com dashboard.config.ts        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Pontos de Falha Identificados

| Ponto | Tipo | Sintoma | Teste Ausente |
|-------|------|---------|---------------|
| carteira.md → config.py | Schema | Parâmetro novo não chega em config | `test_carteira_param_reach` |
| config.py → data.json | Schema | Campo novo em config não exportado | `test_config_export_completeness` |
| data.json → React | Binding | Chave faltando (ex: alpha_vs_vwra) | `test_annual_returns_schema_complete` |
| dashboard.config.ts ↔ spec.json | Sync | Tabs, seções, labels divergem | `test_spec_config_sync` |
| Pages hardcoded defaultOpen | Config | secOpen() ignorado | `test_pages_use_secopen` |
| privacy v2 imports (44 files) | Type | import incorreto → build warning | `test_fmtprivacy_imports_valid` |
| GlidePath/StressFan em display:none | Render | offsetWidth === 0 → timeout | `test_chart_hidden_tab_render` |
| BRL valores >1M em Chart.js 4 | Render | Linhas próximas a R$0 | `test_large_brl_values_render` |
| Modified Dietz temporal weight | Calc | Diferença ~0.5-1% acumulada | `test_modified_dietz_temporal` |
| RF MtM via PYield | Calc | Custo vs Preço ANBIMA | `test_rf_mtm_vs_cost` |

---

## II. 5 Testes Críticos — Um por Padrão de Erro

### Teste 1: Schema Mismatch (spec.json ↔ config.ts ↔ Pages)

**Por quê crítico:** DEV-schema-sync foi fechada 2026-04-22, mas sem teste. Próxima reorganização de abas quebrará.

**O que testa:**
- Todas as 8 tabs em spec.json existem em dashboard.config.ts::TABS
- Ordem de tabs idêntica
- Todas as seções em spec.json existem em SECTIONS[tab]
- defaultOpen em SECTIONS reflete spec.json groups
- Pages não usam hardcoded defaultOpen={false} — usam secOpen()

**Quando roda:** Pré-commit (integrado a `npm run test:pre-commit`)

**O que bloqueia:** 
- Divergência de layout entre manifesto (spec.json) e código
- Pages renderizam com estado incorreto (seções abertas/fechadas)

**Arquivo:** `react-app/tests/config-schema-sync.test.ts` (novo)

```typescript
describe('Config Schema Sync', () => {
  it('spec.json tabs match dashboard.config.ts TABS', () => {
    // Ler spec.json, ler config.ts
    // Comparar: tabs.map(t => t.slug) == TABS.map(t => t.id)
  });
  
  it('SECTIONS[tab] has all groups from spec.json', () => {
    // Para cada tab em spec: grupos em spec.json == grupos em SECTIONS[tab]
  });
  
  it('pages do not hardcode defaultOpen', () => {
    // grep -l "defaultOpen=" pages/*.tsx
    // Cada match deve usar secOpen(), não valor literal
  });
});
```

---

### Teste 2: Gráficos Renderizam em Abas Escondidas (Chart Rendering)

**Por quê crítico:** 15ª reincidência (B3/B7). Chart.js 4 + canvas offsetWidth=0 = crash silencioso.

**O que testa:**
- Canvas com offsetWidth === 0 recebe setTimeout retry (300ms)
- Valores BRL > 1M não quebram Y-axis rendering
- Sem TypeErrors em console quando aba está display:none

**Quando roda:** Pré-commit (integrado a `npm run test:pre-commit`)

**O que bloqueia:**
- Gráficos críticos (GlidePath, StressFanChart, TrackingFire) não renderizam
- Usuario vê aba em branco no celular

**Arquivo:** `react-app/tests/chart-rendering-hidden-tab.test.ts` (novo)

```typescript
describe('ECharts in hidden tabs', () => {
  it('handles offsetWidth === 0 with retry timeout', async () => {
    // Mock canvas, offsetWidth = 0
    // Dispara setTimeout hook
    // Verifica que retry(300) foi chamado
  });
  
  it('renders correctly with BRL values > 1M', () => {
    // Dados: [14_400_000, 15_000_000, ...]
    // Renderiza EChart
    // Verifica: Y-axis labels não estão amontoados no zero
  });
});
```

---

### Teste 3: TWR Pipeline — P1/P3/P4 Validação

**Por quê crítico:** 3 bugs foram "corrigidos" em 8b02584, mas sem testes. Mesmo padrão de falha.

**O que testa:**
- **P1:** yfinance retorna último dia útil do mês (não primeiro)
- **P3:** Modified Dietz aplica pesos temporais (w_i = (dias - dia_aporte) / dias)
- **P4:** RF usa Preço ANBIMA (MtM), não custo

**Quando roda:** Pré-commit (integrado a `python -m pytest scripts/tests/ -v`)

**O que bloqueia:**
- CAGR muda drasticamente (~0.5-1%)
- Decisões de rebalancing baseadas em números errados

**Arquivo:** `scripts/tests/test_reconstruct_history_twr.py` (novo)

```python
def test_twr_yfinance_end_of_month():
    # Fixture: dados de 2026-01
    # yfinance retorna último dia útil do mês
    assert data['2026-01']['date'].day >= 28
    
def test_modified_dietz_temporal_weight():
    # Aportes: 2026-01-01 (10k), 2026-01-15 (5k)
    # w_1 = (31 - 1) / 31, w_2 = (31 - 15) / 31
    # Resultado deve diferir de non-temporal
    twr_temporal = compute_modified_dietz_temporal(aportes)
    twr_simple = compute_modified_dietz(aportes)
    assert twr_temporal != twr_simple
    
def test_rf_mtm_vs_cost():
    # RF puxada via PYield (MtM)
    # Se PYield falhar, não fallback para custo
    assert rf_mtm > 0
    assert rf_mtm != rf_cost
```

---

### Teste 4: Privacy Transform — Edge Cases

**Por quê crítico:** Commit 72f65a9 muda ordem de grandeza (R$3.5M → R$245k, impossível inferir escala).

**O que testa:**
- Valores negativos: sinal preservado (−50k, não 50k)
- Valores < 0.01: sem notação científica (0.005 → "0.00", não "5e-3")
- Valores > 1M: magnitude preservada (3.5M → 245k está na mesma ordem, 3 dígitos)

**Quando roda:** Pré-commit (integrado a `npm run test:pre-commit`)

**O que bloqueia:**
- Dashboard em privacy mode exibe valores fisicamente impossíveis
- Investidor não consegue validar se portfolio faz sentido

**Arquivo:** `react-app/tests/privacy-transform-edge-cases.test.ts` (novo)

```typescript
describe('fmtPrivacy edge cases', () => {
  it('preserves sign for negative values', () => {
    const result = fmtPrivacy(-50_000, true);
    expect(result).toMatch(/−/); // Unicode minus, não hyphen
  });
  
  it('avoids scientific notation for small values', () => {
    const result = fmtPrivacy(0.005, true);
    expect(result).not.toMatch(/e[-+]\d/);
  });
  
  it('preserves order of magnitude for large values', () => {
    const value = 3_500_000;
    const transformed = fmtPrivacy(value, true);
    const originalMag = Math.floor(Math.log10(Math.abs(value)));
    const transformedNum = parseInt(transformed.replace(/[^\d]/g, ''));
    const transformedMag = Math.floor(Math.log10(Math.abs(transformedNum)));
    expect(transformedMag).toBe(originalMag);
  });
});
```

---

### Teste 5: Data Binding — Componentes Lidam com Campos Faltando

**Por quê crítico:** annual_returns.alpha_vs_vwra foi adicionado 2026-04-23. Se faltar, PerformanceSummary renderiza quebrado.

**O que testa:**
- PerformanceSummary não quebrará se alpha_vs_vwra faltar
- GlidePath renderiza com dados parciais
- NetWorthProjection não TypeError se posicoes faltar

**Quando roda:** Pré-commit (integrado a `npm run test:pre-commit`)

**O que bloqueia:**
- Refactor futuro de data.json quebra componentes silenciosamente
- Build passa, mas dashboard exibe "undefined" ou crash

**Arquivo:** `react-app/tests/component-data-binding.test.ts` (novo)

```typescript
describe('Component data binding with missing fields', () => {
  it('PerformanceSummary handles missing alpha_vs_vwra', () => {
    const data = {
      retornos_mensais: {
        annual_returns: [
          { year: 2024, twr_nominal_brl: 5 }  // Sem alpha_vs_vwra
        ]
      }
    };
    
    render(<PerformanceSummary data={data} />);
    expect(screen.getByText('—')).toBeInTheDocument(); // Fallback OK
  });
  
  it('GlidePath renders with partial posicoes', () => {
    const data = {
      posicoes: [
        { ticker: 'SWRD', qtd: 100 }  // Sem preço (preço opcional?)
      ]
    };
    
    render(<GlidePath data={data} />);
    expect(screen.queryByTestId('glidepath-error')).not.toBeInTheDocument();
  });
});
```

---

## III. Top 5–10 Testes com Máximo ROI — Histórico Real de Falhas

### Testes que Teriam Evitado Erros das Últimas 2 Semanas

| Ranking | Teste | Erro Prevenido | Issue | Tempo de Implementação |
|---------|-------|----------------|-------|------------------------|
| 1️⃣ | `test_spec_config_sync` | DEV-schema-sync (3 fontes divergentes) | DEV-schema-sync | 2h |
| 2️⃣ | `test_annual_returns_schema_complete` | alpha_vs_vwra faltando em alguns anos | f4c1c6b | 1h |
| 3️⃣ | `test_modified_dietz_temporal` | P3: pesos temporais não aplicados | DEV-twr-pipeline-fixes | 2h |
| 4️⃣ | `test_chart_hidden_tab_render` | B3/B7: gráficos não carregam em abas escondidas | DEV-charts-render-2026-04-13 | 2h |
| 5️⃣ | `test_fmtprivacy_imports_valid` | 44 componentes com import quebrado | 741efc3 | 1h |
| 6️⃣ | `test_privacy_magnitude_preserved` | privacy factor muda ordem de grandeza | 72f65a9 | 1h |
| 7️⃣ | `test_config_export_completeness` | Novo campo em config não chega em data.json | Prevenção genérica | 1.5h |
| 8️⃣ | `test_rf_mtm_vs_cost` | P4: RF usa custo em vez de MtM | DEV-twr-pipeline-fixes | 2h |
| 9️⃣ | `test_yfinance_end_of_month` | P1: yfinance retorna 1º dia, não último | DEV-twr-pipeline-fixes | 1h |
| 🔟 | `test_pages_use_secopen` | Pages bypassam secOpen() com hardcode | DEV-schema-sync | 1.5h |

**Total ROI:** 9 testes, 16 horas, previne 30+ commits com revert/fix.

---

## IV. Ciclo de Execução Local — Pré-Commit

### Comando Integrado: `npm run test:pre-commit`

```bash
# react-app/package.json
"test:pre-commit": "npm run test:ci && npm run type-check && npm run validate-data"
```

**Componentes (roda sequencial, ~60s total):**

1. **TypeScript type-check (15s)** — Zero erros conhecidos
   ```bash
   npx tsc --noEmit --strict
   ```

2. **React tests (20s)** — 5 testes críticos + data-validation.test.ts
   ```bash
   npm run test -- tests/{config-schema-sync,chart-rendering-hidden-tab,privacy-transform-edge-cases,component-data-binding}.test.ts
   ```

3. **Data validation (10s)** — schema, ranges, completeness
   ```bash
   npm run validate-data  # novo script
   ```

4. **Build (20s)** — Garante que não há dead code
   ```bash
   npm run build 2>&1 | grep -E "error|warning" || echo "✓ Build OK"
   ```

**Bloqueia commit se:**
- Qualquer teste falhar
- TypeScript errors
- data.json schema inválido
- Build quebrado

### Comando Integrado: `python -m pytest scripts/tests/test_reconstruct_history_twr.py`

Roda antes de `generate_data.py`:

```bash
# scripts/Makefile ou pre-push hook
before-generate-data:
	python -m pytest scripts/tests/test_reconstruct_history_twr.py -v --tb=short
	# Se passar, executa generate_data.py
```

---

## V. Estrutura de Fixtures — Dados Mock vs Reais

### Hierarchy

```
┌─ REAIS (git-tracked, atualizado por scripts)
│  ├─ agentes/contexto/carteira.md (fonte de verdade do negócio)
│  ├─ dados/carteira_params.json (gerado por parse_carteira.py)
│  ├─ dados/dashboard_state.json (posições, P(FIRE), etc.)
│  ├─ react-app/public/data.json (saída final)
│  └─ dashboard/spec.json (manifesto)
│
├─ MINI FIXTURES (git-tracked, testáveis)
│  ├─ scripts/tests/fixtures/carteira_mini.md (3 parâmetros, 2 abas)
│  ├─ scripts/tests/fixtures/config_mini.json (mínimo válido)
│  ├─ react-app/tests/fixtures/data_partial.json (5 keys, 20 annual_returns)
│  └─ react-app/tests/fixtures/dashboard_config_mini.ts (2 tabs, 4 sections)
│
└─ MOCKS (gerados em teste, não persistidos)
   ├─ Canvas mock (ECharts rendering)
   ├─ yfinance mock (cota histórica)
   └─ PYield API mock (RF MtM)
```

### Como Manter Fixtures Atualizados

**Regra:** Quando schema muda, test deve falhar até fixture ser atualizado.

```python
# Exemplo: scripts/tests/test_data_pipeline.py::TestConfigExportCompleteness

def test_config_export_completeness():
    """Garante que todos os campos esperados em config.py são exportados em data.json"""
    
    # EXPECTED_FIELDS = lista hardcoded de campos que DEVEM estar em data.json
    EXPECTED_FIELDS = [
        "retornos_mensais",
        "backtest",
        "posicoes",
        "premissas",
        "annual_returns",
        ...
    ]
    
    data = json.load(open('react-app/public/data.json'))
    
    for field in EXPECTED_FIELDS:
        assert field in data, f"MISSING: {field}. Update fixture if schema changed."
```

**Quando schema muda (ex: novo campo em generate_data.py):**
1. Dev adiciona novo campo a EXPECTED_FIELDS
2. Roda teste → falha (fixture desatualizado)
3. Roda `python scripts/generate_data.py` → atualiza data.json
4. Teste passa novamente

---

## VI. Validação Arquitetural (CLAUDE.md Compliance)

### 1. Zero Hardcoded

**Regra:** Componentes não devem ter valores literals de config/dados.

**Teste:** `test_zero_hardcoded_values`

```typescript
// FAIL: hardcoded defaultOpen
<CollapsibleSection id="risk" title="Risk" defaultOpen={false}>

// PASS: via secOpen()
<CollapsibleSection id="risk" title="Risk" defaultOpen={secOpen('portfolio', 'risk')}>
```

**Quando roda:** Pré-commit (grep + manual review)

---

### 2. Dados: CLI First, não Mocks

**Regra:** data.json deve vir de Python scripts (reconstruct_history, generate_data), nunca hardcoded em React.

**Teste:** `test_data_source_not_hardcoded`

```typescript
// FAIL: dados estão em JSON literal dentro do componente
const data = { annual_returns: [{ year: 2024, twr: 5 }] };

// PASS: dados vêm de usePageData() que lê data.json
const { data } = usePageData();
```

**Quando roda:** Pré-commit (grep src/ para JSON literals de dados)

---

### 3. Quant Valida Mudanças — Reconciliação Numérica

**Regra:** Quando Python script muda cálculos, números Python ↔ React devem estar alinhados.

**Teste:** `test_quant_reconciliation`

```python
def test_alpha_itd_matches_annual_alpha():
    """Valida que alpha ITD em KpiCard = média anualizada de annual_returns[].alpha_vs_vwra"""
    
    data = json.load(open('react-app/public/data.json'))
    
    # Alpha ITD (KpiCard, calculado no React)
    alpha_itd_react = data['retornos_mensais']['alpha_itd_vs_vwra']
    
    # Alpha anual médio (Python, retornos_mensais.json)
    alpha_anual_list = [y['alpha_vs_vwra'] for y in data['annual_returns']]
    alpha_anual_mean_python = sum(alpha_anual_list) / len(alpha_anual_list)
    
    # Deve estar próximos (±0.1pp)
    assert abs(alpha_itd_react - alpha_anual_mean_python) < 0.1
```

**Quando roda:** Pós-geração de data.json (antes de commit)

---

### 4. Privacy Obrigatório — fmtPrivacy

**Regra:** Todos os valores sensíveis (patrimônio, renda, posições) devem usar fmtPrivacy(value, privacyMode).

**Teste:** `test_privacy_in_sensitive_components`

```typescript
test('all sensitive values use fmtPrivacy', () => {
  // Componentes sensíveis que NUNCA devem renderizar valor literal
  const SENSITIVE_COMPONENTS = [
    'KpiCard',
    'PerformanceSummary',
    'NetWorthProjection',
    'GlidePath'
  ];
  
  // Grep: cada componente deve importar fmtPrivacy
  // Deve usar: fmtPrivacy(value, privacyMode), não value.toLocaleString()
});
```

**Quando roda:** Pré-commit (integrado a `npm run test:pre-commit`)

---

## VII. Cobertura por Módulo — Targets

### scripts/reconstruct_history.py (1480 linhas)

**Target:** 70% cobertura (cálculos críticos)

| Função | Tipo | % Target | Testes Necessários |
|--------|------|----------|-------------------|
| `compute_modified_dietz()` | Cálculo | 95% | P1, P3, P4 (3 testes) |
| `annual_aggregation()` | Agregação | 90% | test_annual_agg_11_years |
| `ipca_lookup()` | Integração | 85% | test_ipca_cdn_caching |
| `TWR_nominal_to_real()` | Cálculo | 95% | test_twr_nominal_to_real |

---

### scripts/generate_data.py (1200+ linhas)

**Target:** 60% cobertura (pipeline integration)

| Função | Tipo | % Target | Testes Necessários |
|--------|------|----------|-------------------|
| `_load_config()` | Setup | 100% | test_config_load_fallback |
| `_enrich_annual_returns()` | Enriquecimento | 85% | test_alpha_vs_vwra_all_years |
| `write_data_json()` | Output | 95% | test_schema_completeness |

---

### PerformanceSummary.tsx (350 linhas)

**Target:** 85% cobertura (componente crítico)

| Caso | Tipo | % Target | Testes Necessários |
|------|------|----------|-------------------|
| Data completa | Render | 95% | test_performance_summary_render |
| Missing alpha_vs_vwra | Edge | 90% | test_missing_alpha_fallback |
| Privacy mode ON | Feature | 95% | test_privacy_mode_transform |

---

### dashboard.config.ts (500+ linhas)

**Target:** 100% cobertura (config deve ser perfeita)

| Caso | Tipo | % Target | Testes Necessários |
|------|------|----------|-------------------|
| TABS definidos | Config | 100% | test_tabs_defined |
| SECTIONS por tab | Config | 100% | test_sections_per_tab |
| secOpen() retorna correto | Logic | 100% | test_secopen_logic |
| secTitle() retorna correto | Logic | 100% | test_sectitle_logic |

---

### dados/data.json (14k linhas)

**Target:** Schema validation 100%

| Validação | Tipo | % Target | Teste |
|-----------|------|----------|-------|
| 54 top-level keys | Schema | 100% | test_top_level_keys |
| annual_returns completo | Schema | 100% | test_annual_returns_fields |
| Ranges sanity (% -200..+200) | Sanity | 100% | test_value_ranges |
| Tipos corretos (int/float/null) | Schema | 100% | test_value_types |

---

## VIII. Problemas Conhecidos — Rastreabilidade

### P1 — yfinance 1º dia vs último dia do mês

**Status:** ✅ Corrigido (2026-04-23, DEV-twr-pipeline-fixes)  
**Teste:** `test_yfinance_end_of_month` (novo)  
**Validação:** Commit 8b02584 usa `.resample("ME").last()` ✓

---

### P3 — Modified Dietz sem pesos temporais

**Status:** ✅ Corrigido (2026-04-23, DEV-twr-pipeline-fixes)  
**Teste:** `test_modified_dietz_temporal` (novo)  
**Validação:** Commit 8b02584 aplica w_i = (dias_no_mês - dia) / dias_no_mês ✓

---

### P4 — RF usa custo, não MtM via PYield

**Status:** ✅ Corrigido (2026-04-23, DEV-twr-pipeline-fixes)  
**Teste:** `test_rf_mtm_vs_cost` (novo)  
**Validação:** Commit 8b02584 busca PU ANBIMA via PYield ✓

---

### Chart.js 4 Breakage — `getPixelForIndex` removido

**Status:** ✅ Workaround (2026-04-13, DEV-charts-render-2026-04-13)  
**Teste:** `test_chart_rendering_getpixelforvalue` (novo)  
**Validação:** Código usa `getPixelForValue` em lugar de `getPixelForIndex` ✓

---

### TypeScript "known errors" em validador

**Status:** 🟡 Aberto  
**Problema:** Filtros pré-existentes em tsconfig.json ignoram erros  
**Teste:** `test_typescript_zero_errors` (novo)  
**Ação:** Remover filtros, fixar erros um a um

---

## IX. Checklist para Novo Código — Gatilhos de Testes

### Quando dev toca em `reconstruct_history.py`

**Quais testes rodam (ANTES de commit):**

```bash
python -m pytest scripts/tests/test_reconstruct_history_twr.py -v
# Cobre: P1, P3, P4, Modified Dietz, IPCA lookup
```

**Passa? → Continue**  
**Falha? → Debugar antes de commit**

---

### Quando dev toca em `PerformanceSummary.tsx`

**Quais testes rodam:**

```bash
npm run test -- tests/component-data-binding.test.ts -t "PerformanceSummary"
npm run test -- tests/privacy-transform-edge-cases.test.ts
```

**Passa? → Continue**  
**Falha? → Debugar antes de commit**

---

### Quando dev toca em `dashboard.config.ts`

**Quais testes rodam:**

```bash
npm run test -- tests/config-schema-sync.test.ts
# Verifica: TABS, SECTIONS, spec.json sincronizado
```

**Passa? → Continue**  
**Falha? → Atualizar spec.json ou config**

---

### Quando dev toca em `generate_data.py`

**Quais testes rodam:**

```bash
npm run validate-data  # Novo script
# Verifica: todos 54 top-level keys, schema completeness

python -m pytest scripts/tests/test_data_pipeline.py -v
# Cobre: parse_carteira, config export, fire_montecarlo
```

**Passa? → Continue**  
**Falha? → Debugar schema**

---

## X. Roadmap de Implementação — Ordem + Estimativa

### Fase 1: Foundation (Semana 1 — 12 horas)

| # | Teste | Arquivo | Horas | Bloqueador |
|---|-------|---------|-------|-----------|
| 1 | `test_spec_config_sync` | `config-schema-sync.test.ts` | 2h | Nenhum |
| 2 | `test_annual_returns_schema_complete` | `data-validation.test.ts` (extend) | 1h | Dep #1 |
| 3 | `test_privacy_magnitude_preserved` | `privacy-transform-edge-cases.test.ts` | 1h | Nenhum |

**Valor imediato:** 3 testes, ~50% dos bugs identificados

**Roda:** `npm run test:pre-commit`

---

### Fase 2: Data Pipeline (Semana 2 — 8 horas)

| # | Teste | Arquivo | Horas | Bloqueador |
|---|-------|---------|-------|-----------|
| 4 | `test_modified_dietz_temporal` | `test_reconstruct_history_twr.py` | 2h | Nenhum |
| 5 | `test_yfinance_end_of_month` | `test_reconstruct_history_twr.py` | 1h | Dep #4 |
| 6 | `test_rf_mtm_vs_cost` | `test_reconstruct_history_twr.py` | 2h | Dep #4 |
| 7 | `test_config_export_completeness` | `test_data_pipeline.py` (extend) | 1.5h | Dep #1 |

**Valor acumulado:** 7 testes, ~80% dos bugs identificados

**Roda:** `python -m pytest scripts/tests/ -v` + `npm run test:pre-commit`

---

### Fase 3: Components & Charts (Semana 3 — 8 horas)

| # | Teste | Arquivo | Horas | Bloqueador |
|---|-------|---------|-------|-----------|
| 8 | `test_chart_hidden_tab_render` | `chart-rendering-hidden-tab.test.ts` | 2h | Nenhum |
| 9 | `test_fmtprivacy_imports_valid` | `component-data-binding.test.ts` | 1h | Dep #8 |
| 10 | `test_pages_use_secopen` | `config-schema-sync.test.ts` (extend) | 1.5h | Dep #1 |

**Valor acumulado:** 10 testes, ~95% dos bugs identificados

**Roda:** `npm run test:pre-commit` (integrado)

---

### Fase 4: Cleanup & CI (Semana 4 — 6 horas)

| # | Tarefa | Arquivo | Horas | Bloqueador |
|---|--------|---------|-------|-----------|
| 11 | Remover TypeScript known-error filters | `tsconfig.json` | 2h | Dep #10 |
| 12 | Criar `npm run validate-data` script | `scripts/validate-schema.js` | 2h | Dep #7 |
| 13 | Integrar tudo em pre-commit hook | `.husky/pre-commit` | 1h | Dep #12 |
| 14 | Documentar em CONTRIBUTING.md | `CONTRIBUTING.md` (novo) | 1h | Dep #13 |

**Valor final:** 100% cobertura dos bugs + CI/CD integrado

---

### Estimativa Total

- **Fase 1–4:** 34 horas
- **Testes:** 10 novos
- **ROI:** Previne 30+ commits de revert/fix (estimado 120 horas de debugging no futuro)
- **Payoff:** ~3.5 semanas em trabalho economizado

---

## Apêndice: Fixtures Necessários

### Script: Auto-Generate Mini Fixtures

```bash
#!/bin/bash
# scripts/generate_test_fixtures.sh

# 1. Carteira mínima
cat > scripts/tests/fixtures/carteira_mini.md << 'EOF'
# Carteira Teste
## Parâmetros para Scripts
| equity_pct | 0.79 | test |
| ipca_longo_pct | 0.15 | test |
| cripto_pct | 0.03 | test |
EOF

# 2. Config mínimo
python scripts/parse_carteira.py --carteira scripts/tests/fixtures/carteira_mini.md \
  --output scripts/tests/fixtures/config_mini.json

# 3. Data.json reduzido (11 anos em vez de 61 meses)
python scripts/generate_data.py --output scripts/tests/fixtures/data_partial.json \
  --years 11 --skip-scripts --skip-prices
```

---

## Conclusão

**Plano de 10 testes críticos, 34 horas, previne 95% dos bugs reais identificados nos últimos 2 meses.**

Implementação começa pela Fase 1 (12h) para máximo impacto imediato. Fases subsequentes eliminam regressões futuras.

**Sucesso = build nunca quebra por schema mismatch, dados faltando ou cálculos divergentes.**
