# Centralization Analysis — Core & Dashboard Opportunities

**Date**: 2026-04-26  
**Scope**: Python core + React dashboard  
**Status**: 📋 Exploratory (Quant + Dev + Head analysis)

---

## Overview

Following the success of P(FIRE) centralization (Phase 1-3), I've scanned the codebase for other candidates. **Found 7 HIGH-PRIORITY areas** with duplication/scatter that should be centralized.

---

## Critical Issues (Duplication Across 4+ Locations)

### 🔴 1. GUARDRAILS LOGIC — DUPLICATED 6X WITH INCONSISTENCIES

**Current State:**
- Python: `fire_montecarlo.py:181-187` defines GUARDRAILS tuple `(0.15, 0.25, 0.35)`
- Python: `fire_montecarlo.py:362-368` implements `aplicar_guardrail()` with hardcoded thresholds
- React: `SequenceOfReturnsRisk.tsx:46-60` duplicates in `drawdownToSpending()`
- React: `SequenceOfReturnsRisk.tsx:273-281` reimplements guardrail logic differently
- React: `SequenceOfReturnsRisk.tsx:460-463` hardcodes bands in data structure
- React: `GuardrailsMechanismChart.tsx:27-33` implements `getSpendingCut()` separately

**Problem:**
```python
# Python uses:
GUARDRAILS = [0.15, 0.25, 0.35]  # Drawdown thresholds
# React displays:
"0–15%" / "15–25%" / "25–35%"     # Same numbers, different context
```

Silent conversion bugs when thresholds change — must update 6 locations.

**Centralization Opportunity:**
Create `GuardrailEngine` (similar to PFireEngine) with:
- Single source of truth for thresholds
- Canonical guardrail cut calculations
- Shared logic: `guardrailCut(drawdown_pct, wealth) → spending_reduction_pct`

---

### 🔴 2. SWR (SAFE WITHDRAWAL RATE) — SCATTERED, FALLBACKS INCONSISTENT

**Current State:**
| Location | Fallback | Context |
|----------|----------|---------|
| `fire_montecarlo.py:207` | 0.035 (3.5%) | SWR_FALLBACK |
| `fire_montecarlo.py:406, 465` | Inline | custo / patrimonio |
| `fire.ts:68, 75` | Inline | calcFireYear() |
| `SurplusGapChart.tsx:64` | 0.03 (3%) | swr_gatilho ?? 0.03 |
| `SequenceOfReturnsRisk.tsx:83` | 0.04 (4%) | PGBL hardcoded |

**Problem:**
- 5 different SWR implementations
- 3 different fallback values (0.03 vs 0.035 vs 0.04)
- No unified withdrawal strategy (SWR vs VPW vs dynamic guardrails)
- If SWR assumption changes, 5+ files to update

**Centralization Opportunity:**
Create `WithdrawalEngine` with:
- Single SWR calculation
- VPW (Variable Percentage Withdrawal) as alternative
- Dynamic guardrail-aware withdrawal
- Canonical source for fallback values

```python
# Canonical interface
class WithdrawalRequest:
    patrimonio: float
    custo_anual: float
    age: int
    strategy: Literal['swr', 'vpw', 'guardrails']
    
class WithdrawalResult:
    annual_withdrawal: float
    swr: float
    confidence: float  # How safe is this withdrawal?
```

---

### 🔴 3. TAX (IR DIFERIDO) — DUPLICATED IDENTICALLY IN 2 FILES

**Current State:**
```
generate_data.py:1592-1650        compute_tax_diferido()
reconstruct_tax.py:92-130+        compute_tax_diferido()  ← SAME FUNCTION
```

**Problem:**
- Identical logic in two places
- When tax law changes (Lei 14.754/2023 updates), must change both
- Already happened once (IR update in 2026-04-22)

**Centralization Opportunity:**
Create `TaxEngine` module:
```python
class TaxRequest:
    etf_holdings: dict  # {"SWRD": 1500, "AVGS": 700}
    cost_basis_by_etf: dict
    ucits_status: bool
    
class TaxResult:
    ir_diferido_total: float
    ir_by_etf: dict
    darf_obligation: float
    source: Literal['lei14754', 'heuristic']
```

---

### 🔴 4. BOND POOL RUNWAY — DUPLICATED WITH VARIATION

**Current State:**
```
reconstruct_fire_data.py:310-361     gen_bond_pool_runway()
generate_data.py:2099-2160           _compute_bond_pool_runway_by_profile()
```

**Difference:**
- Both use: `pool(t) = pool(t-1) × (1+r_real) − saque(t)`
- Second adds profile-specific INSS deductions
- Same underlying model, different inputs

**Centralization Opportunity:**
Create `BondPoolEngine`:
```python
class BondPoolRequest:
    pool_inicial: float
    custo_vida_anual: float
    retorno_real_anual: float
    profiles: Optional[list]  # Different INSS for different marital status
    
class BondPoolResult:
    runway_anos: float
    pool_trajectory: list  # Year-by-year depletion
    deficit_year: Optional[int]  # When pool runs out
```

---

## High-Priority Issues (Scattered, Not Duplicated)

### 🟠 5. SPENDING SMILE (PHASE-BASED SPENDING) — PYTHON ONLY

**Current State:**
```python
# Python only:
fire_montecarlo.py:163-170      SPENDING_SMILE dict
fire_montecarlo.py:338-362      gasto_spending_smile() function

# React:
useFireProjection() just uses custo_vida_base directly — no phase adjustment
```

**Problem:**
- Frontend may show inaccurate lifetime spending (ignores Go-Go/Slow-Go/No-Go phases)
- If user adjusts spending smile in backend, React doesn't reflect it
- No cross-platform consistency (Python has 3-phase, React has 1-flat)

**Centralization Opportunity:**
Expose `SpendingSmileEngine` to React:
```typescript
const spendingSmile = calculateSpendingSmile({
    baseSpending: 250_000,
    goGoYears: [0, 15],      // 100% of base
    slowGoYears: [15, 30],   // 80% of base  
    noGoYears: [30, 100],    // 60% of base
    withGuardrails: true     // Apply drawdown adjustments
})
// Result: spending curve for projection charts
```

---

### 🟠 6. GUARDRAILS + SPENDING INTERACTION — THREE SEPARATE IMPLEMENTATIONS

**Current State:**
```python
# MC path:
fire_montecarlo.py:237-240          withdrawal_guardrails(gasto_smile, pat, pat_pico)
                                    → applies cuts to spending_smile

# Data generation path:
generate_data.py:2171-2200          compute_spending_guardrails()
                                    → applies cuts to base cost, expands 10% when safe

# React path:
SequenceOfReturnsRisk.tsx:46-60     drawdownToSpending() inline
                                    → applies cuts to base cost
```

**Problem:**
- Three different logic paths for the same concept
- Inconsistent expansion triggers (10% in one, guardrail logic in another)
- React chart may show different guardrail effects than Python MC

**Centralization Opportunity:**
Unify into `SpendingGuardrailsEngine`:
```python
class SpendingGuardrailRequest:
    base_spending: float
    wealth: float
    peak_wealth: float
    drawdown_pct: float
    
class SpendingGuardrailResult:
    recommended_spending: float
    guardrail_band: Literal['upper', 'safe', 'lower']
    explanation: str  # "Safe spending: +10% expansion possible"
```

---

### 🟠 7. FACTOR LOADINGS/ATTRIBUTION — SCATTERED ACROSS 2 FILES

**Current State:**
```
reconstruct_factor.py:181-220       compute_factor_loadings() — OLS FF5+MOM
backtest_portfolio.py:793-850+      _factor_regression_r7() — same regression
```

**Problem:**
- Two parallel implementations of factor regression
- If factor formula changes (e.g., add momentum premium), both need updates
- Different test coverage (one tested, one not)

**Centralization Opportunity:**
Create `FactorEngine`:
```python
class FactorRequest:
    returns: list[float]
    factors: dict  # {"mkt_rf": [...], "smb": [...], "hml": [...]}
    
class FactorResult:
    loadings: dict  # {"mkt_rf": 1.05, "smb": -0.12, "hml": 0.08}
    alpha: float
    r_squared: float
    t_stats: dict
```

---

## Well-Implemented (NO CHANGE NEEDED) ✅

| Area | Location | Status |
|------|----------|--------|
| Allocation & Rebalancing | config.py + backtest.py | ✅ Centralized, single source |
| P(FIRE) Canonicalization | pfire-canonical.ts/.py | ✅ Centralized with guards |
| Monte Carlo Engine | montecarlo.ts/.py | ✅ Canonical implementation |
| PREMISSAS Constants | config.py / fire_montecarlo.py | ✅ Centralized in code |

---

## Summary Table: Priority Ranking

| ID | Issue | Type | Impact | Effort | Priority |
|----|-------|------|--------|--------|----------|
| 1 | Guardrails 6x duplication | Scatter | High (silent bugs) | Medium | 🔴 Critical |
| 2 | SWR 5x scatter | Scatter | High (wrong withdrawals) | Medium | 🔴 Critical |
| 3 | Tax 2x duplication | Duplication | Medium (maintenance) | Low | 🔴 High |
| 4 | Bond Pool 2x duplication | Duplication | Medium (maintenance) | Low | 🟠 High |
| 5 | Spending Smile Python-only | Scatter | Medium (incomplete React) | Medium | 🟠 Medium |
| 6 | Guardrails+Spending 3x impl | Scatter | Medium (inconsistency) | High | 🟠 Medium |
| 7 | Factor Loadings 2x impl | Duplication | Low (backend only) | Low | 🟢 Low |

---

## Recommendation for Team Discussion

### Quick Wins (1-2 days each)
1. **Tax Consolidation** — Extract common logic to `tax_engine.py`, import in both places
2. **Bond Pool Consolidation** — Merge two implementations into one `bond_pool_engine.py`
3. **SWR Constants** — Move all fallback values to config.py, expose to React

### Medium Effort (3-5 days each)
4. **Guardrails Consolidation** — Create `GuardrailEngine` (Python + TypeScript)
   - Single source for thresholds
   - Canonical cut calculations
   - Update 6 React components to use it

5. **Spending Smile Export** — Expose Python `SPENDING_SMILE` to React
   - Create spendingSmile.ts with 3-phase logic
   - Use in FireScenariosTable and projections

### Larger Refactor (1-2 weeks)
6. **Withdrawal Strategy Engine** — Unify SWR, VPW, guardrails logic
   - Single `WithdrawalEngine` for all strategies
   - Canonical calculation both platforms
   - Similar architecture to PFireEngine

---

## Questions for Quant, Dev, Head

**For Quant:**
1. Are the guardrail thresholds (0.15, 0.25, 0.35) truly canonical, or can they vary by scenario?
2. Is SWR 3.5% the right fallback, or should it be 3.0%? (saw 3 different values)
3. Should Spending Smile be part of canonical P(FIRE) calculation or optional?

**For Dev:**
1. What's the feasibility of extracting guardrails to shared utility?
2. Can we safely refactor SequenceOfReturnsRisk.tsx to use centralized guardrail logic without breaking charts?
3. Should WithdrawalEngine be Python-first (like PFireEngine) then ported to TS?

**For Head:**
1. Is consistency more important than incremental changes (big refactor vs quick fixes)?
2. Should we prioritize guardrails/SWR (high impact) or start with tax/bond pool (quick wins)?
3. Do you want a formal issue + board for each centralization, or batch them?

---

## Next Steps

Create issue: `CENTRALIZATION_PRIORITY_TRIAGE`  
Convene: Quant + Dev + Head discussion (1-2 hours)  
Decision: Which items to tackle in what order
