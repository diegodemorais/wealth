# HD-ARCHITECT-P3 — Refactor 323 Hardcoding Violations

**Status**: 🟦 Em Andamento  
**Dono**: Head + Dev  
**Prioridade**: 🔴 CRÍTICA  
**Parent Issue**: HD-ARCHITECT (P0 ✅ | P1 ✅ | P2 ✅ | P3 🟦)  
**Blocker**: Pre-commit hook blocks commits with hardcoding violations

---

## Objetivo

Executar refatoração dos 323 hardcoding violations detectados em P2, categorizados por tipo e severidade. **Goal**: Zero violations, all values centralized in config.py ou data.json, código limpo para auditorias futuras.

---

## Violations Summary

**Total**: 323 violations across 4 categories

| Tipo | Count | Severidade | Exemplo |
|------|-------|-----------|---------|
| Numeric Literals | 251 | 🔴 Alta | `window = 200`, `comparison with 0.5` |
| Duplicate Strings | 54 | 🟡 Média | `"SWRD.L"` (5x), `"VWRA.L"` (5x), `"Close"` (9x) |
| TypeScript Constants | 17 | 🔴 Alta | `const BAR_MAX = 6.5;`, `const retornoUSD = 0.07;` |
| Inline Calculations | 1 | 🔴 CRÍTICA | `estate_tax = (us_exposure - 60000) * 0.40` |

---

## P3.1: CRÍTICA — Inline Calculations (1 violation)

**Must fix immediately** — blocks architectural compliance.

### Task 1: Refactor Estate Tax Calculation

**Location**: `analysis/ibkr_analysis.py:348`

```python
# ❌ CURRENT (inline)
estate_tax = (us_exposure - 60000) * 0.40

# ✅ TARGET
from tax_engine import TaxEngine
tax_engine = TaxEngine()
estate_tax = tax_engine.calculate_us_estate_tax(us_exposure)
```

**Refactoring Steps**:
1. Check if `tax_engine.py` has `calculate_us_estate_tax()` method
2. If not: add method with 60000 exemption and 0.40 rate in config
3. Replace line 348 with engine call
4. Verify: `python3 -m pytest scripts/tests/tax_engine.test.py -v`

**Dev Task**: `DEV-P3-001-estate-tax-refactor`

---

## P3.2: HIGH — TypeScript React Constants (17 violations)

**Severidade**: 🔴 Alta — values in UI components hardcoded instead of config.json

### Task Group: Move React Numeric Constants to Config

**Violations**:
1. `react-app/src/components/dashboard/HODL11PositionPanel.tsx:43` — `const BAR_MAX = 6.5;`
2. `react-app/src/components/dashboard/BRLPurchasingPowerTimeline.tsx:30` — `const retornoUSD = 0.07;`
3. `react-app/src/components/dashboard/DARFObligationsPanel.tsx:50` — `const TAX_RATE_FOREIGN = 0.15;`
4. `react-app/src/components/charts/GuardrailsChart.tsx:45` — `const SAUDE_INFLATOR = 0.050;`
5. `react-app/src/components/charts/GuardrailsChart.tsx:47` — `const SAUDE_DECAY = 0.50;`
6. + 12 more in GuardrailsChart, PortfolioPerformanceChart, PFIREGaugeChart

**Refactoring Pattern**:

```typescript
// ❌ CURRENT (hardcoded)
const BAR_MAX = 6.5;

// ✅ TARGET (from data.json)
import { useConfig } from '@/hooks/useConfig';
const { config } = useConfig();
const BAR_MAX = config.ui.hodl11.barMax ?? 6.5; // fallback during migration
```

**Parallel Tasks** (Dev can execute independently):

| Task ID | Component | Constant | Value | File:Line |
|---------|-----------|----------|-------|----------|
| `DEV-P3-002` | HODL11 | BAR_MAX | 6.5 | HODL11PositionPanel.tsx:43 |
| `DEV-P3-003` | BRLTimeline | retornoUSD | 0.07 | BRLPurchasingPowerTimeline.tsx:30 |
| `DEV-P3-004` | DARFPanel | TAX_RATE_FOREIGN | 0.15 | DARFObligationsPanel.tsx:50 |
| `DEV-P3-005` | GuardrailsChart | SAUDE_INFLATOR | 0.050 | GuardrailsChart.tsx:45 |
| `DEV-P3-006` | GuardrailsChart | SAUDE_DECAY | 0.50 | GuardrailsChart.tsx:47 |
| `DEV-P3-007` | GuardrailsChart | 12 more | various | GuardrailsChart.tsx |

**Blockers**: Need `data.json` schema extension for UI config constants. Check: `agentes/referencia/GUARANTEED_INVARIANTS.md` for allowed keys in `_meta.ui` section.

**Dev Instructions**:
1. For each constant, add to `data.json::_meta.ui.{component}.{constantName}`
2. Create `useConfig()` hook if not exists (ref: `react-app/src/hooks/`)
3. Replace hardcoded const with: `config.ui.{component}.{constantName} ?? fallback`
4. Test: `npm run build && npm run test`

---

## P3.3: MEDIUM — Duplicate Strings (54 violations)

**Severidade**: 🟡 Média — string literals repeated 5-9 times

### Task Group: Centralize String Constants to config.py

**Top Duplicates** (priority order):

| String | Count | Files Affected | Suggested Const |
|--------|-------|-----------------|-----------------|
| `"SWRD.L"` | 5 | backtest_portfolio.py:62,77,84,91,101 | TICKER_SWRD_LSE |
| `"VWRA.L"` | 5 | backtest_portfolio.py:63,78,85,92,102 | TICKER_VWRA_LSE |
| `"Close"` | 9 | backtest_portfolio.py:176,178,192,194,427,429,442,444 | COLUMN_CLOSE |
| `"Delta (pp)"` | 5 | backtest_portfolio.py:266,281,308,325,1294 | COLUMN_DELTA_PP |
| `"%Y-%m"` | 7 | backtest_portfolio.py:336,491-494,978-979 | DATE_FORMAT_YM |
| + 49 more | various | across scripts | TICKER_*, COLUMN_*, LABEL_* |

**Refactoring Pattern**:

```python
# ❌ CURRENT (duplicated)
if etf == "SWRD.L":
    weight = 0.50
if etf == "VWRA.L":
    return True

# ✅ TARGET
from config import TICKER_SWRD_LSE, TICKER_VWRA_LSE
if etf == TICKER_SWRD_LSE:
    weight = 0.50
if etf == TICKER_VWRA_LSE:
    return True
```

**Parallel Tasks** (Dev can execute in parallel):

| Task ID | File | String | Count | Lines |
|---------|------|--------|-------|-------|
| `DEV-P3-008` | backtest_portfolio.py | "SWRD.L" | 5 | 62,77,84,91,101 |
| `DEV-P3-009` | backtest_portfolio.py | "VWRA.L" | 5 | 63,78,85,92,102 |
| `DEV-P3-010` | backtest_portfolio.py | "Close" | 9 | 176,178,192,194,427,429,442,444 |
| `DEV-P3-011` | backtest_portfolio.py | "Delta (pp)" | 5 | 266,281,308,325,1294 |
| `DEV-P3-012` | backtest_portfolio.py | "%Y-%m" | 7 | 336,491-494,978-979 |
| `DEV-P3-013-P3-061` | various scripts | remaining 49 | 103 total | various |

**Dev Instructions**:
1. Create constants in `scripts/config.py` under appropriate sections:
   - Tickers: `TICKER_*`
   - DataFrame columns: `COLUMN_*`
   - Date formats: `DATE_FORMAT_*`
   - Labels: `LABEL_*`
2. Search-replace in file: `"string"` → `CONST_NAME`
3. Add import: `from config import CONST_NAME`
4. Test: `python3 scripts/{script}.py` (verify no regressions)

**Gating**: Pre-commit blocks commits with duplicate strings >5x (`.architectignore` whitelist updated per fix).

---

## P3.4: HIGH — Numeric Literals (251 violations)

**Severidade**: 🔴 Alta — magic numbers in calculations, thresholds, loop counters

### Categorized Breakdown

#### P3.4.1: Calculation Constants (Priority 1)

Numbers used in financial calculations (SWR, tax, guardrails). Must move to engines.

**Example**:
```python
# ❌ CURRENT
window = 200  # SMA window for volatility
threshold = 0.35  # drawdown threshold
if z < 0.5:  # z-score threshold
```

**Example violations**:
- `scripts/btc_indicators.py:59` — `window = 200` → `VOLATILITY_WINDOW` in config
- `scripts/btc_indicators.py:99,101` — `comparison with 20`, `80` → probability thresholds
- `scripts/btc_indicators.py:191,193` — `z < 0.5`, `z < 1.2` → z-score thresholds

**Dev Strategy**:
1. Classify each number: is it a universal constant (SMA window) or domain-specific (z-score)?
2. For universal: add to `config.py` under `CALCULATION_CONSTANTS`
3. For domain-specific: add to respective engine (swr_engine, guardrail_engine, etc.)
4. Replace inline number with import + constant reference

**Sample Tasks**:

| Task ID | File | Violation | Type | Suggested Const | Severity |
|---------|------|-----------|------|-----------------|----------|
| `DEV-P3-062` | scripts/btc_indicators.py:59 | `window = 200` | SMA window | SMA_VOLATILITY_WINDOW | 🔴 High |
| `DEV-P3-063` | scripts/btc_indicators.py:99 | `pct_above < 20` | Probability threshold | BTC_OVERBOUGHT_THRESHOLD_PCT | 🟡 Medium |
| `DEV-P3-064` | scripts/btc_indicators.py:101 | `pct_above < 80` | Probability threshold | BTC_OVERSOLD_THRESHOLD_PCT | 🟡 Medium |
| `DEV-P3-065` | scripts/btc_indicators.py:191 | `z < 0.5` | Z-score threshold | Z_SCORE_MINOR_EXTREME | 🔴 High |
| `DEV-P3-066` | scripts/btc_indicators.py:193 | `z < 1.2` | Z-score threshold | Z_SCORE_MAJOR_EXTREME | 🔴 High |

#### P3.4.2: Loop Counters & Temporary Vars (Priority 4 — LOW)

Loop ranges, temporary iteration variables. Safe to whitelist if they serve no business logic.

**Examples** (auto-whitelisted in `.architectignore`):
```python
for i in range(10):  # iteration counter
for _ in range(5):   # throwaway var
x = [0] * 100  # array initialization
```

**Dev Strategy**: Most are already whitelisted. If flagged, confirm they're truly temporary. Add to `.architectignore` if appropriate with comment.

#### P3.4.3: Financial Parameters (Priority 2)

Specific to portfolio (equity allocation, bond duration, guardrail levels). Must be in config.py.

**Potential violations**:
- Equity allocation percentages (0.79, 0.50, etc.)
- Bond duration weights
- Guardrail thresholds (e.g., -0.35 for max drawdown)

**Dev Strategy**: For each violation:
1. Read context: is this a universal constant or portfolio-specific?
2. If portfolio-specific → add to `agentes/contexto/carteira.md` (Parâmetros para Scripts)
3. Run `python3 scripts/parse_carteira.py` to update `scripts/config.py`
4. Replace hardcoded number with import from config

---

## P3.5: Integration with Pre-Commit & CI

### Pre-Commit Gating

After refactoring each violation, test pre-commit hook:

```bash
# Test that the violation is now gone
python3 scripts/detect_hardcoding.py --staged --report

# Commit should fail if new violations introduced
git add {file}
git commit -m "P3: Refactor {violation_type} in {file}"
# Should pass silently if no violations
```

### Testing Checklist (Per Refactoring)

- [ ] No new violations introduced (pre-commit passes)
- [ ] Existing functionality preserved (test suite passes if applicable)
- [ ] Config constant documented in config.py or data.json
- [ ] Import added at file top
- [ ] Hardcoded value replaced

---

## P3.6: Parallel Execution Strategy

**Execution Model**: Dev can work on categories in parallel, no cross-dependencies within categories.

### Phase 1 (Week 1) — CRÍTICA + HIGH
- **P3.1**: Estate tax refactor (1 task, 30 min) → BLOCKS other tax work
- **P3.2**: React constants (17 tasks, 3-4 hours, parallelizable)
- **P3.4.1**: Financial calculation constants (est. 40-50 violations, 4-5 hours)

### Phase 2 (Week 2) — MEDIUM
- **P3.3**: Duplicate strings (54 tasks, 2-3 hours, fully parallelizable)
- **P3.4.3**: Financial parameters in config (est. 50 violations)

### Phase 3 (Week 3) — LOW
- **P3.4.2**: Loop counters & temp vars (est. 60-70 violations, mostly whitelisted)
- Finalize `.architectignore` whitelist

**Total Effort**: ~10-12 developer hours across 3 weeks

---

## Definition of Done

### P3.1 (Inline Calculations)
- [x] Estate tax refactor → tax_engine
- [ ] No `estate_tax =` pattern found in codebase (grep confirmation)
- [ ] Tax engine tests pass
- [ ] Pre-commit validates: `python3 scripts/detect_hardcoding.py --report | grep -c "INLINE_CALCULATION"` = 0

### P3.2 (TypeScript Constants)
- [ ] All 17 React constants moved to data.json `_meta.ui.*`
- [ ] `useConfig()` hook created/updated
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm run test`
- [ ] Pre-commit: no NUMERIC_TS violations

### P3.3 (Duplicate Strings)
- [ ] All 54 strings centralized to config.py
- [ ] Each constant prefixed appropriately (TICKER_*, COLUMN_*, LABEL_*)
- [ ] Search-replace verified per file
- [ ] Pre-commit: `python3 scripts/detect_hardcoding.py --report | grep -c "DUPLICATE_STRING"` = 0

### P3.4 (Numeric Literals)
- [ ] All 251 literals categorized (calculation / financial / temp)
- [ ] Calculation constants added to config.py
- [ ] Financial parameters traced to carteira.md
- [ ] Loop counters verified & whitelisted as appropriate
- [ ] Pre-commit: `python3 scripts/detect_hardcoding.py --report | grep -c "NUMERIC_LITERAL"` = 0

### Overall P3
- [ ] All 323 violations → 0 remaining
- [ ] Pre-commit hook validation: `python3 scripts/detect_hardcoding.py --report` = "✅ No violations found"
- [ ] CI passes (GitHub Actions if integrated)
- [ ] Documentation updated: `agentes/referencia/hardcoding-patterns.md` (case studies added)
- [ ] Board updated: P3 → Done

---

## Deliverables

| Deliverable | Status | Responsible |
|-------------|--------|-------------|
| P3.1 Inline Calc Refactor | 🟦 Pending | Dev + Tax |
| P3.2 React Constants Config | 🟦 Pending | Dev |
| P3.3 Duplicate Strings Centralize | 🟦 Pending | Dev |
| P3.4 Numeric Literals Classify & Refactor | 🟦 Pending | Dev + Architect review |
| Pre-commit Validation Report | 🟦 Pending | Architect (sign-off) |
| Zero-Violation Confirmation | 🟦 Pending | Bookkeeper (audit) |

---

## Timeline

| Phase | Tasks | Estimate | Start | End |
|-------|-------|----------|-------|-----|
| P3.1 | 1 (Estate Tax) | 30 min | Week 1 Mon | Week 1 Mon |
| P3.2 | 17 (React Constants) | 3-4h | Week 1 Tue | Week 1 Thu |
| P3.4.1 | ~50 (Calc Constants) | 4-5h | Week 1 Fri | Week 2 Fri |
| P3.3 | 54 (Strings) | 2-3h | Week 2 Mon | Week 2 Wed |
| P3.4.3 | ~50 (Financial Params) | 3-4h | Week 2 Thu | Week 3 Tue |
| P3.4.2 | ~70 (Loop Counters/Temp) | 1-2h | Week 3 Wed | Week 3 Thu |
| **Total** | **323 violations** | **~15 hours** | **Week 1** | **Week 3** |

---

## Task Inventory (Detailed)

### P3.1 Tasks
- **DEV-P3-001**: Refactor estate_tax calculation to tax_engine

### P3.2 Tasks (React Constants)
- **DEV-P3-002**: HODL11PositionPanel.tsx — BAR_MAX
- **DEV-P3-003**: BRLPurchasingPowerTimeline.tsx — retornoUSD
- **DEV-P3-004**: DARFObligationsPanel.tsx — TAX_RATE_FOREIGN
- **DEV-P3-005**: GuardrailsChart.tsx — SAUDE_INFLATOR
- **DEV-P3-006**: GuardrailsChart.tsx — SAUDE_DECAY
- **DEV-P3-007**: GuardrailsChart.tsx — 12 additional constants
- **DEV-P3-008** through **DEV-P3-018**: PortfolioPerformanceChart, PFIREGaugeChart, etc. (5 more)

### P3.3 Tasks (Strings)
- **DEV-P3-019**: backtest_portfolio.py — "SWRD.L" (5x)
- **DEV-P3-020**: backtest_portfolio.py — "VWRA.L" (5x)
- **DEV-P3-021**: backtest_portfolio.py — "Close" (9x)
- **DEV-P3-022**: backtest_portfolio.py — "Delta (pp)" (5x)
- **DEV-P3-023**: backtest_portfolio.py — "%Y-%m" (7x)
- **DEV-P3-024** through **DEV-P3-076**: Remaining 49 duplicate strings (tracked in full report)

### P3.4 Tasks (Numeric Literals — partial list, 251 total)
- **DEV-P3-077**: scripts/btc_indicators.py — window = 200
- **DEV-P3-078**: scripts/btc_indicators.py — pct_above < 20
- **DEV-P3-079**: scripts/btc_indicators.py — pct_above < 80
- ... (237 more tasks covering all numeric literals)

---

## Success Metrics

| Metric | Target | Current | EOD Target |
|--------|--------|---------|-----------|
| Total Violations | 0 | 323 | 0 ✅ |
| Pre-commit Gate | Pass | Fail (323) | Pass ✅ |
| Test Suite | 100% | TBD | 100% ✅ |
| CI/CD | Green | TBD | Green ✅ |
| Code Review | 0 comments (hardcoding) | 323 flagged | 0 flagged ✅ |

---

## References

- `agentes/issues/HD-ARCHITECT-P2.md` — Detection (323 violations found)
- `agentes/referencia/hardcoding-patterns.md` — Refactoring patterns
- `agentes/contexto/carteira.md` — Financial parameters (source of truth)
- `scripts/config.py` — Configuration constants
- `scripts/detect_hardcoding.py` — Validator (--report flag)
- `.git/hooks/pre-commit` — Enforcement (lines 57-66)

---

**Created**: 2026-04-27  
**Status**: 🟦 Em Andamento  
**Parent**: HD-ARCHITECT  
**Blocker**: None (starts immediately after P2 detection)  
**Critical Path**: P3.1 (estate tax) → enables other tax refactoring
