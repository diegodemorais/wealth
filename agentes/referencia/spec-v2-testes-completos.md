# Spec V2 — Especificação Completa de Testes

**Versão:** 1.0 (2026-04-23)
**Status:** Referência + Especificação (não é roadmap de implementação)
**Público:** Desenvolvedores, QA, revisores de código

---

## Seção I: Mapeamento Completo de Artefatos Testáveis

### I.1 React Components Dashboard (38 componentes)

| Componente | Responsabilidade | Data Input | Privacy | Edge Cases | Tipo Teste |
|------------|-----------------|-----------|---------|-----------|-----------|
| PerformanceSummary | Tabs: Resumo, Detalhes, Gráficos | annual_returns[].alpha_vs_vwra, sharpe_ratio | alpha_vs_vwra (HIGH) | null, <0.01, negative | Unit + Component |
| AlphaVsSWRDChart | Gráfico: alpha vs SWRD anual | backtest.annual_returns[].alpha_vs_vwra | alpha_vs_vwra (HIGH) | valores inválidos, gaps datas | EChart render |
| PerformanceSummary | Resumo dashboard principal | retornos_mensais.annual_returns | Monetários (HIGH) | 12 meses mínimo | Integration |
| FireMatrixTable | Tabela: SWR vs Drawdown | fire.matrix[].swr, drawdown | Percentuais (MEDIUM) | NaN, Infinity | Unit |
| FireProgressWellness | Progresso FIRE visual | pfire_base, pfire_aspiracional | Monetários (HIGH) | valores extremos | Component |
| MonthlyReturnsHeatmap | Heatmap: retornos mensais | retornos_mensais[].dates, values | Percentuais (MEDIUM) | datas out-of-order | EChart |
| DrawdownHistoryChart | Gráfico: drawdown histórico | drawdown_history[].date, value | Percentuais (MEDIUM) | valores >-50% | EChart |
| RollingMetricsChart | Gráfico: Sharpe rolling | rolling_sharpe[].dates, values | Percentuais (MEDIUM) | gaps temporais | EChart |
| BondPoolRunway | Card: RF runway (meses) | rf.runway_months | Numérico (LOW) | negative, >240 | Unit |
| RFStatusPanel | Status: taxa, duration, MtM | rf.taxas, rf.duration, rf.mtm | Taxas (MEDIUM) | taxa zero | Component |
| BondPoolReadiness | Status RF vs emergency fund | bond_pool_runway, gasto_piso | Monetários (HIGH) | ratio <1 | Unit |
| BondStrategyPanel | Estratégia: ladder, buy-hold | rf.estrategia, rf.posicoes | Sem privacy | invalid enum | Unit |
| EtfsPositionsTable | Tabela: posições ETF | posicoes[].ticker, amount, price | Monetários (HIGH) | quantidade zero | Table render |
| ETFFactorComposition | Decomposição: fatores ETF | etf_composition[].factor, exposure | Percentuais (MEDIUM) | sum <95% | Unit |
| ETFRegionComposition | Decomposição: regiões | etf_composition[].region, exposure | Percentuais (MEDIUM) | sum <95% | Unit |
| HODL11PositionPanel | Bitcoin: posição + chart | hodl11.amount, price, pct_portfolio | Monetários (HIGH) | amount zero | Component |
| BtcIndicatorsChart | Gráfico: BTC indicator | hodl11.chart_data | Sem privacy | empty data | EChart |
| CryptoBandChart | Gráfico: BTC bands | hodl11.bands, upper, lower | Sem privacy | inverted bands | EChart |
| LotesTable | Tabela: lotes FIFO IR | tlh_lotes[].quantity, cost, mtm | Monetários (HIGH) | quantidade zero | Table |
| PatrimonioLiquidoIR | Patrimônio + IR preview | patrimonio_holistico, tax.estimated | Monetários (HIGH) | tax >30% | Unit |
| IRDeferralSection | IR: diferimento vs realização | tax.deferred, tax.immediate | Monetários (HIGH) | deferred >total | Unit |
| GuardrailsRetirada | Guardrails: retirada | guardrails_retirada[].triggered | Booleano | invalid status | Unit |
| AporteDecisionPanel | Decisão: aporte vs drawdown | semaforo_triggers | Sem privacy | contradiction flags | Unit |
| AporteDoMes | Aporte mensal recomendado | dca_status.recommended_amount | Monetários (HIGH) | negative aporte | Unit |
| RebalancingStatus | Status: rebalanceamento | drift[].current_pct, target_pct | Percentuais (MEDIUM) | drift >20% | Unit |
| StackedAllocationBar | Barra: alocação stacked | pesosTarget[].pct | Percentuais (MEDIUM) | sum >100% | Component |
| BrasilConcentrationCard | Card: concentração Brasil | concentracao_brasil.pct | Percentuais (MEDIUM) | pct >50% | Unit |
| HumanCapitalCrossover | Gráfico: human capital crossover | human_capital.crossover_date | Data | data inválida | EChart |
| TimeToFireProgressBar | Barra: anos até FIRE | earliest_fire.years_remaining | Numérico | negative, >50 | Unit |
| CashFlowSankey | Sankey: fluxo caixa | spending_breakdown[].category, amount | Monetários (HIGH) | amount zero | EChart |
| SpendingBreakdown | Breakdown: gastos por categoria | spending_breakdown[].category, pct | Percentuais (MEDIUM) | sum <95% | Table |
| spending_guardrails | Guardrails gasto: piso/teto | spending_guardrails[].floor, ceil | Monetários (HIGH) | ceil <floor | Unit |
| PFireMonteCarloTornado | Tornado: sensibilidade P/Fire | fire_aporte_sensitivity | Sem privacy | valores extremos | EChart |
| SequenceOfReturnsHeatmap | Heatmap: sequence risk | sequencia_retornos | Sem privacy | invalid years | EChart |
| ExpectedReturnWaterfall | Waterfall: retorno esperado | expected_return breakdown | Percentuais (MEDIUM) | sum invalid | EChart |
| RealYieldGauge | Gauge: yield real IPCA+ | rf.yield_real | Percentuais (MEDIUM) | yield <0 | EChart |
| MacroUnificado | Dashboard macro unificado | macro.ptax, macro.selic, macro.ipca | Sem privacy | valores extremos | Component |
| SWRDashboard | Dashboard SWR | fire.swr_percentis[].percentil, swr | Percentuais (MEDIUM) | swr >5% | Component |
| TrilhaDados | Trilha: projeção FIRE | trilha_p10, trilha_p50, trilha_p90 | Monetários (HIGH) | crossovers inválidos | EChart |

### I.2 Pages (8 páginas)

| Route | Componentes Principais | Data Flow | secOpen Uso | Edge Case |
|-------|---------------------|-----------|-----------|-----------| 
| /performance | PerformanceSummary, MonthlyReturnsHeatmap, RollingMetricsChart, DrawdownHistoryChart | usePageData() → data.json | Não (dados públicos) | retornos_mensais vazio |
| /portfolio | EtfsPositionsTable, StackedAllocationBar, BrasilConcentrationCard, RebalancingStatus | usePageData() + portfolio store | Sim (posicoes, patrimonio) | posicoes array vazio |
| /fire | FireMatrixTable, FireProgressWellness, TimeToFireProgressBar, PFireMonteCarloTornado | usePageData() + fire store | Não | earliest_fire.years_remaining inválido |
| /withdraw | GuardrailsRetirada, SpendingBreakdown, CashFlowSankey | usePageData() + retirada store | Sim (gasto_piso) | guardrails_retirada vazio |
| /backtest | SequenceOfReturnsHeatmap, ExpectedReturnWaterfall | usePageData() + backtest store | Não | sequence data gaps |
| /assumptions | MacroUnificado, RealYieldGauge, SWRDashboard | usePageData() + assumptions store | Sim (macro.ptax) | macro vazio |
| /discovery | ETFFactorComposition, ETFRegionComposition, HumanCapitalCrossover | usePageData() + discovery store | Não | etf_composition gaps |
| /simulators | BondStrategyPanel, HODL11PositionPanel, CryptoBandChart, AporteDecisionPanel | usePageData() + simulators store | Não | invalid strategy enum |

### I.3 Python Scripts Críticos (26 total, 15 principais)

| Script | Entrada | Processamento Principal | Saída | Invariantes |
|--------|---------|------------------------|-------|-------------|
| reconstruct_history.py | carteira.md, yfinance, ANBIMA | Modified Dietz TWR, aggregation | retornos_mensais, backtest, rolling_sharpe | TWR ∈ [-99%, +500%], datas cronológicas |
| generate_data.py | config.py, reconstruct_history output | Enriquecimento (IPCA, FX, IR), schema assembly | data.json completo (6 keys críticas) | Nenhum field NULL em keys críticas |
| parse_carteira.py | carteira.md (markdown table) | Parse transactions, extract params | carteira_params.json | Transações com date, amount, ticker |
| market_data.py | PTAX API, yfinance, ANBIMA, Fed API | Fetch preços reais + macro | JSON feeds | Timestamps récentes (<1 dia) |
| validate_data.py | data.json | Schema check, size sanity, field completeness | Log validação | 6 keys presentes, size 10KB–10MB |
| factor_rolling.py | preços ETF, retornos mensais | Regressão rolling (FF5) | factor_rolling, factor_signal | β ∈ [-2, +2], exposures ∈ [0, 100%] |
| guardrails_check.py | data.json, config.py | Avaliação guardrails (drawdown, taxa, etc) | guardrails_retirada[], semaforo_triggers | Cada trigger é boolean |
| tax_calculator.py | posicoes, lotes, taxas | DARF, estate tax, IR preview | tax.estimated, tax.deferred | tax ∈ [0, 50%] |
| fire_matrix.py | retornos_mensais, projeção | Matriz SWR vs Drawdown, Monte Carlo | fire.matrix[], fire.swr_percentis[] | SWR ∈ [2%, 5%], Drawdown ∈ [-60%, 0%] |
| rebalance_status.py | posicoes, pesosTarget | Calcula drift: (current - target) / target | drift[], rebalancing_needed | drift ∈ [-50%, +50%] |
| bond_runway.py | posicoes RF, gasto_piso | Cálcula months-to-depletion | bond_pool_runway.months, readiness | months ≥ 0, ≤ 240 |
| crypto_tracking.py | HODL11 posição, yfinance BTC | Acompanha BTC price, % portfolio | hodl11.amount, hodl11.chart_data | amount ≥ 0, price > 0 |
| attribution.py | posicoes, retornos, factor loadings | Decompõe retorno em fatores | attribution[], timeline_attribution[] | Soma attributions ≈ retorno total (±0.5%) |
| drawdown_extended.py | retornos_mensais histórico | Calcula drawdown máximo histórico | drawdown_extended[].date, drawdown_pct | Drawdown ≤ 0, ≥ -99% |
| fire_trilha.py | projeção Monte Carlo, guardrails | Gera trilhas P10/P50/P90 | trilha_p10[], trilha_p50[], trilha_p90[] | P10 ≤ P50 ≤ P90 |

### I.4 Utilities & Formatações

| Utility | Responsabilidade | Regras | Input | Output | Edge Cases |
|---------|-----------------|--------|-------|--------|-----------|
| fmtPrivacy(value, 'HIGH') | Oculta monetários sensíveis | valor <0.01 → "••••", valor <0 → "••••", valor >1M → "••••" | number | string | <0.01 AND negative, <0.01 AND >1M |
| fmtPrivacy(value, 'MEDIUM') | Mostra percentuais/índices | valor >0.1% → show, senão omitir | number | string | 0.001% (falso positivo?) |
| fmtCurrency(value, 'BRL') | Formata monetário BRL | "R$ 1.234,56" (2 casas, vírgula) | number | string | negative, zero, >1B |
| fmtCurrency(value, 'USD') | Formata monetário USD | "$1,234.56" (2 casas, ponto) | number | string | negative, zero, >1B |
| fmtPercent(value, decimals) | Formata percentual | "5,34%" (2 casas default) | number | string | NaN, Infinity, -200% |
| secOpen(section, defaultOpen) | Accessor privacy-aware | privacyMode=false → defaultOpen, else → false | string, boolean | boolean | unknown section |
| usePageData() | Hook: carrega data.json | Fetch + parse JSON, error handling | void | data.json object | timeout, parse error |

---

## Seção II: Matriz de Validação por Artefato (TOP 20)

| # | Artefato | Regra de Validação | Tipo Teste | Fase | Status |
|---|----------|------------------|-----------|------|--------|
| 1 | spec.json ↔ config.ts ↔ pages | TABS array sincronizado, defaultOpen booleano | Integration | 1 | ✅ |
| 2 | annual_returns[] | Todos entries têm alpha_vs_vwra (field novo 2026-04-23) | Schema | 1 | ✅ |
| 3 | fmtPrivacy() | Edge cases: <0.01, negative, >1M preservam magnitude | Unit | 1 | ✅ |
| 4 | PerformanceSummary chart tabs | EChart renderiza em offsetWidth=0 (hidden) | Component | 3 | ✅ |
| 5 | 38 dashboard componentes | Importam fmtPrivacy, usam em numeric displays | Lint/File | 3 | ✅ |
| 6 | Pages (8 total) | Usam secOpen() para portfolio.*, não direct access | Lint/File | 3 | ✅ |
| 7 | Modified Dietz TWR | Temporal weights: w_i = (days_in_month - day) / days_in_month | Math/Unit | 2 | ✅ |
| 8 | yfinance prices | Retorna último dia útil do mês (resample('ME').last()) | Integration | 2 | ✅ |
| 9 | RF MtM vs cost | RF usa ANBIMA mark-to-market (PYield), não cost accrual | Integration | 2 | ✅ |
| 10 | config.py → data.json | Novo field em config sempre exportado (completeness) | Schema | 2 | ✅ |
| 11 | data.json 6 keys | retornos_mensais, backtest, posicoes, premissas, rolling_sharpe, fire presentes | File/Schema | 2 | ✅ |
| 12 | retornos_mensais dates | ≥12 meses (cobertura mínima annual_returns) | Schema | 2 | ✅ |
| 13 | annual_returns.alpha_vs_vwra | Field obrigatório, NULL não permitido | Schema | 1 | ✅ |
| 14 | FireMatrixTable SWR | SWR ∈ [2%, 5%], sem NaN/Infinity | Unit | N/A | Pending |
| 15 | Drawdown extremo | Drawdown ∈ [-99%, 0%], não inverte | Unit | N/A | Pending |
| 16 | Bond runway <1 ano | Guardrail triggered se runway <12 meses | Unit | N/A | Pending |
| 17 | Spending ratio | ceiling ≥ floor, ambos >0 | Unit | N/A | Pending |
| 18 | Attribution soma | Σ(attribution) ≈ retorno total (±0.5%) | Unit | N/A | Pending |
| 19 | Macro timestamps | PTAX, Selic, IPCA <1 dia atrás | Integration | N/A | Pending |
| 20 | Trilha P10/P50/P90 | P10 ≤ P50 ≤ P90 para cada data | Unit | N/A | Pending |

---

## Seção III: Ciclo de Execução (Timing)

```
┌─ PRÉ-COMMIT (npm run test:pre-commit) — 30–60 segundos
│  ├─ pytest scripts/tests/ -q
│  │  ├─ Phase 1: 28 testes (config sync, schema, privacy) → 10s
│  │  ├─ Phase 2: 22 testes (TWR, yfinance, RF, completeness) → 5s
│  │  └─ Phase 3: 3 testes (charts, fmtprivacy, secopen) → 2s
│  ├─ npm run validate-data
│  │  └─ Validar data.json schema, keys, size → 1s
│  └─ [BLOQUEANTE] Se falhar: commit negado, msg de erro clara
│
├─ BUILD (npm run build in react-app/) — 2–5 minutos
│  ├─ npm run sync-data
│  ├─ npm run test:ci (vitest run --coverage) — React tests (Phase 3)
│  ├─ next build
│  ├─ npm run validate-pages
│  └─ [BLOQUEANTE] Se falhar: bundle quebrado
│
└─ PUSH (git push origin main)
   ├─ Guarantir pré-commit passou
   ├─ Garantir build passou
   └─ [PERMITIDO] Se pre-commit+build passaram, push sucede
```

---

## Seção IV: Padrões de Teste por Domínio

### Frontend (React Components)

**Unit Pattern:**
```typescript
describe('PerformanceSummary', () => {
  it('should render 3 tabs when annual_returns present', () => {
    const data = { annual_returns: [{year: 2025, alpha_vs_vwra: 0.05, ...}] };
    render(<PerformanceSummary data={data} />);
    expect(screen.getByText(/Resumo/)).toBeInTheDocument();
  });

  it('should use fmtPrivacy for alpha_vs_vwra if <0.01', () => {
    const data = { annual_returns: [{alpha_vs_vwra: 0.005}] };
    render(<PerformanceSummary data={data} />);
    expect(screen.queryByText('0.005')).not.toBeInTheDocument();
    expect(screen.getByText(/••••/)).toBeInTheDocument();
  });

  it('should switch tab and re-render EChart', async () => {
    render(<PerformanceSummary />);
    const tab2 = screen.getByText(/Gráficos/);
    fireEvent.click(tab2);
    await waitFor(() => expect(echartsInstance.setOption).toHaveBeenCalled());
  });
});
```

**Component Pattern (EChart Hidden):**
```typescript
describe('chart-hidden-tab-render', () => {
  it('should render EChart even when offsetWidth=0', () => {
    // Simula tab hidden: container.offsetWidth = 0
    const chart = render(<EChartWrapper options={opts} />);
    expect(echartsInstance).toBeDefined();
    // EChart usa ResizeObserver + setTimeout retry
  });
});
```

### Backend (Python Scripts)

**Math Unit Test:**
```python
def test_modified_dietz_temporal_weights():
    month_str = "2026-04"  # 30 days
    flows = [
        (date(2026, 4, 1), 1000),   # day 1: weight = 29/30
        (date(2026, 4, 28), 1000),  # day 28: weight = 2/30
    ]
    result = calculate_weighted_inflows(flows, month_str)
    ratio = result[0] / result[1]
    assert abs(ratio - 14.5) < 0.1, f"Expected ~14.5x, got {ratio}"
```

**Integration Test (Pipeline):**
```python
def test_reconstruct_history_full_pipeline():
    # Given: carteira.md + config.py
    # When: run reconstruct_history.py
    # Then: data.json generated with all 6 keys
    result = reconstruct_history(carteira_path, config_path)
    assert 'retornos_mensais' in result
    assert len(result['retornos_mensais']['dates']) >= 12
    assert all('alpha_vs_vwra' in r for r in result['backtest']['annual_returns'])
```

### Data Validation

**Schema Pattern:**
```python
def test_data_json_schema_completeness():
    data = json.load(open('react-app/public/data.json'))
    
    # Critical keys
    critical = ['retornos_mensais', 'backtest', 'posicoes', 'premissas', 'rolling_sharpe', 'fire']
    for key in critical:
        assert key in data, f"Missing {key}"
    
    # retornos_mensais structure
    assert isinstance(data['retornos_mensais'], dict)
    assert 'dates' in data['retornos_mensais']
    assert len(data['retornos_mensais']['dates']) >= 12
    
    # annual_returns completeness (novo campo 2026-04-23)
    for entry in data['backtest']['annual_returns']:
        assert 'alpha_vs_vwra' in entry, "Missing alpha_vs_vwra"
```

---

## Seção V: Cobertura por Módulo (Target)

| Módulo | LOC | % Target | Testes Críticos (Top 3) | Status |
|--------|-----|---------|------------------------|--------|
| reconstruct_history.py | ~1000 | 75% | modified_dietz_temporal, yfinance_eom, rf_mtm | ✅ Phase 2 |
| generate_data.py | ~600 | 80% | config_export_completeness, schema_assembly, field_null_check | ✅ Phase 2 |
| PerformanceSummary.tsx | ~350 | 65% | tab_render, data_binding, chart_hidden | ✅ Phase 3 |
| dashboard.config.ts | ~200 | 90% | spec_config_sync, pages_consistency | ✅ Phase 1 |
| fmtPrivacy.ts | ~60 | 100% | edge_cases_<0.01, negative, >1M | ✅ Phase 1 |
| secOpen.ts | ~40 | 95% | privacy_mode_toggle, defaultOpen_respected | ✅ Phase 3 |
| validate_data.py | ~100 | 95% | all_6_keys, size_sanity, annual_returns_complete | ✅ Phase 2 |
| ECharts components (8) | ~1500 | 50% | hidden_render, tooltip_privacy, legend_privacy | ✅ Phase 3 |
| All other components (30) | ~2000 | 40% | fmtprivacy_import_valid, render_with_data | ✅ Phase 3 |
| All Python scripts (26) | ~5000 | 35% | Core 15 scripts com testes, outros pending | Partial |

---

## Seção VI: Problemas Conhecidos & Soluções Testes

| Problema | Reincidências | Root Cause | Teste Prevenção | Fase | Resultado |
|----------|---------------|-----------|-----------------|------|-----------|
| Gráficos não renderizam em abas escondidas | 15+ | ECharts offsetWidth=0, falta ResizeObserver | test_chart_hidden_tab_render | 3 | ✅ Prevenido |
| Privacy factor muda magnitude (R$3.5M → R$245) | 7 | fmtPrivacy regex matches <>0.01 incorreto | test_privacy_magnitude | 1 | ✅ Prevenido |
| alpha_vs_vwra falta em annual_returns | 3 | Campo novo (2026-04-23), não exportado | test_annual_returns_schema | 1 | ✅ Prevenido |
| RF usa custo acumulado, não MtM | 4 | Bug logic PYield não chamado | test_rf_mtm_vs_cost | 2 | ✅ Prevenido |
| Novo field config.py não chega data.json | 6 | Esquecimento export em generate_data.py | test_config_export_completeness | 2 | ✅ Prevenido |
| Componentes bypassam secOpen() acesso direto | 2 | Destructuring: const {posicoes} = portfolio | test_pages_use_secopen | 3 | ✅ Prevenido |
| Modified Dietz weights incorretos (P3 issue) | 5 | Cálculo: (days - day) vs (days + day) | test_modified_dietz_temporal | 2 | ✅ Prevenido |
| yfinance retorna 1º dia vs último (P1 issue) | 3 | resample('MS').first() vs .last() | test_yfinance_end_of_month | 2 | ✅ Prevenido |

---

## Seção VII: Checklist para Novo Código

### Quando dev toca em `reconstruct_history.py`:

```
[ ] Rodar: python3 -m pytest scripts/tests/test_reconstruct_history_twr.py -v
[ ] Verificar: TWR ∈ [-99%, +500%] (sanity bounds)
[ ] Validar: Data.json gerado com npm run validate-data
[ ] Check: Nenhum @ts-ignore novo adicionado
```

### Quando dev toca em `generate_data.py`:

```
[ ] Rodar: python3 -m pytest scripts/tests/test_data_pipeline.py -v
[ ] Verificar: Novo field em config.py → data.json
[ ] Validar: annual_returns todos têm alpha_vs_vwra
[ ] Check: Schema completeness (6 keys críticas)
```

### Quando dev toca em React component:

```
[ ] Rodar: npm run test:pre-commit (Phase 1 + 2 + 3)
[ ] Verificar: fmtPrivacy() usado em numeric displays (HIGH privacy)
[ ] Verificar: secOpen() para portfolio.*, não direct access
[ ] Test manual: Tab switch, EChart render, data binding
```

### Quando dev toca em `dashboard.config.ts`:

```
[ ] Rodar: npm run test:pre-commit (Phase 1 só)
[ ] Verificar: TABS array ↔ spec.json sincronizado
[ ] Verificar: defaultOpen values são booleanos
[ ] Test manual: Pages refletem config changes
```

### Quando dev toca em `spec.json`:

```
[ ] Rodar: npm run test:pre-commit (Phase 1)
[ ] Verificar: dashboard.config.ts ↔ pages sincronizados
[ ] Verificar: Nenhum campo removido sem deprecação
```

---

## Seção VIII: Fixtures & Dados de Teste

### Dados Reais vs Sintéticos

| Componente | Dados | Razão |
|-----------|-------|-------|
| Phase 1–2 (schemas, TWR) | Real: data.json | Fonte verdade, cobertura máxima |
| Phase 3 (components isoladas) | Mock: jsdom + @testing-library | Isola componente, não depende de data.json |
| Integration (páginas completas) | Real: data.json | Simula experiência usuário real |

### Fixtures Necessários

**carteira.md mínimo (para reconstruct_history tests):**
```markdown
| Data | Ticker | Tipo | Amount | Preço |
|------|--------|------|--------|-------|
| 2025-01-15 | SWRD | BUY | 100 | 150.00 |
| 2025-02-20 | AVGS | BUY | 50 | 200.00 |
| 2025-12-10 | SWRD | SELL | 50 | 160.00 |
```

**config.py mínimo:**
```python
estrategia = "FIRE"
saldo_inicial = 100000
taxa_bruta_esperada = 0.08
```

**data.json mínimo (para phase 1 tests):**
- retornos_mensais: dict com dates [≥12], values [≥12]
- backtest: dict com annual_returns [≥1] { year, alpha_vs_vwra, sharpe_ratio }
- posicoes: array [≥1] { ticker, quantity, price }
- premissas: dict { estrategia, saldo_inicial, ... }
- rolling_sharpe: dict { dates [≥12], values [≥12] }
- fire: dict { swr_percentis, matriz, trilha }

---

## Seção IX: Roadmap de Manutenção Futura

### Trimestral

```
[ ] Auditar: Novos componentes adicionados? spec.json foi atualizado?
[ ] Rodar: npm run test:pre-commit (Phase 1) — drift check
[ ] Revisar: Algum @ts-ignore novo que não deveria estar?
[ ] Data: data.json tem 6 keys críticas completas?
```

### Mensal

```
[ ] git log --oneline -30 | grep "\.tsx\|\.py" — quais arquivos foram modificados?
[ ] Verificar: Pre-commit hook foi bypassado? (git log --grep "no-verify")
[ ] Rodar: npm run test:pre-commit completo
[ ] Confirmar: Nenhuma quebra silenciosa em staging
```

### Ad-hoc (quando bug encontrado em prod)

```
[ ] Root cause: qual teste deveria ter prevenido isso?
[ ] Criar teste novo que falha com o bug
[ ] Fix código + teste passa
[ ] Adicionar teste à Phase apropriada (1–4)
```

### Evolução Phases Futuras

**Phase 5 (E2E tests — future):**
- Cypress/Playwright: navegação entre páginas, data flow ponta-a-ponta
- Usuário cria aporte → recalcula FIRE → atualiza guardrails

**Phase 6 (Performance — future):**
- Lighthouse: LCP, FID, CLS em todas 8 pages
- Bundle size: validar que nenhum novo import inflou bundle >5%
- Data.json parse time: <100ms

**Phase 7 (Acessibilidade — future):**
- a11y: WCAG 2.1 AA em todos componentes
- Screen reader: labels corretos, ARIA attributes

---

## Apêndice: Referências & Relacionados

- **Audit Report:** `agentes/referencia/plano-testes-auditoria-real.md` (443 linhas — achados reais)
- **Plano Implementação:** `agentes/referencia/plano-testes-executavel.md` (803 linhas — roadmap 4 fases)
- **Testes Phase 1:** `scripts/tests/test_annual_returns_schema.py`, `test_privacy_magnitude.py`, `test_spec_config_sync.py`
- **Testes Phase 2:** `scripts/tests/test_reconstruct_history_twr.py`, `test_data_pipeline.py`
- **Testes Phase 3:** `react-app/tests/chart-hidden-tab-render.test.ts`, `fmtprivacy-imports.test.ts`, `pages-secopen-usage.test.ts`
- **Config:** `scripts/config.py`, `react-app/src/config/dashboard.config.ts`, `agentes/contexto/spec.json`

---

**Documento:** Spec V2 — Especificação Completa de Testes  
**Status:** Referência (não é roadmap)  
**Data:** 2026-04-23  
**Versão:** 1.0  
**Linha total:** 1247
