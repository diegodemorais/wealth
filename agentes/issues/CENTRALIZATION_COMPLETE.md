# CENTRALIZATION_COMPLETE — Core & Dashboard Full Refactor (Path C)

**ID**: CENTRALIZATION_COMPLETE  
**Dono**: Head (coordena) + Quant + Dev  
**Status**: 🎯 In Planning  
**Prioridade**: 🔴 CRÍTICA  
**Criado em**: 2026-04-26  
**Timeline estimada**: 6-8 semanas  
**Bloqueador**: Respostas das perguntas críticas para Quant/Dev/Head

---

## Visão Geral

**Objetivo**: Eliminar TODAS as duplicações de lógica de cálculo no core e dashboard.  
**Abordagem**: Invariantes arquiteturais (como P(FIRE)) — garantir que **é impossível** fazer cálculos fora do motor centralizado.  
**Resultado**: Zero duplication, zero silent bugs, auditable end-to-end.

---

## Sub-Tasks (Quebrado em 5 Motores)

### 1️⃣ **TaxEngine** — Consolidar IR Diferido
**Status**: 🟢 Ready (baixo risco)  
**Duração**: 3-4 dias  
**Responsável**: Head + Dev

**Escopo**:
```python
# BEFORE: 2 implementações idênticas
generate_data.py:1592-1650        compute_tax_diferido()
reconstruct_tax.py:92-130+        compute_tax_diferido()

# AFTER: 1 motor centralizado
scripts/tax_engine.py             TaxEngine.calculate()
```

**Invariantes Garantidas**:
```python
# 1. CANNOT call compute_tax_diferido() outside TaxEngine
#    → grep prohibition test
# 2. TaxResult ALWAYS has source field (Literal['lei14754', 'heuristic'])
# 3. TaxResult ALWAYS has is_canonical = True for Lei 14.754
# 4. Impossible to mutate tax value without validation
```

**Input Validation** (TaxRequest.__post_init__):
```python
✓ etf_holdings sum > 0
✓ cost_basis_by_etf keys ⊆ holdings keys
✓ All values >= 0
```

**Output Validation** (TaxResult.__post_init__):
```python
✓ is_canonical == True (always)
✓ source == 'lei14754' for canonical calcs
✓ ir_diferido_total >= sum(ir_by_etf)
✓ darf_obligation >= 0
```

**Tests**:
- [ ] Python: 8 tests (valid request, invalid request, scenarios, edge cases)
- [ ] Prohibition: grep catches `compute_tax_diferido()` outside module
- [ ] Integration: both generate_data.py and reconstruct_tax.py use TaxEngine

---

### 2️⃣ **BondPoolEngine** — Consolidar Runway
**Status**: 🟢 Ready (baixo risco)  
**Duração**: 3-4 dias  
**Responsável**: Dev + Quant

**Escopo**:
```python
# BEFORE: 2 implementações
reconstruct_fire_data.py:310-361        gen_bond_pool_runway()
generate_data.py:2099-2160              _compute_bond_pool_runway_by_profile()

# AFTER: 1 motor
scripts/bond_pool_engine.py             BondPoolEngine.calculate()
```

**Invariantes**:
```python
# 1. Single formula: pool(t) = pool(t-1) × (1+r) − saque(t)
#    Implemented ONCE, used EVERYWHERE
# 2. Profile-aware: Different INSS by marital status
# 3. Impossible to get pool calculation outside BondPoolEngine
# 4. Result trajectory always validated
```

**Validation**:
```python
✓ pool_inicial > 0
✓ custo_vida_anual > 0
✓ retorno_real_anual > -1 (can't lose >100%)
✓ trajectory always descending or stable
```

**Tests**:
- [ ] Single vs couple profiles
- [ ] Different real return rates
- [ ] Deficit year detection
- [ ] Prohibition: grep catches `pool(t-1) * (1+r)` inline

---

### 3️⃣ **SWREngine** — Consolidar Safe Withdrawal Rate
**Status**: 🟡 Needs Quant input  
**Duração**: 1 semana  
**Responsável**: Quant + Dev

**Escopo**:
```python
# BEFORE: 5 implementações, 3 fallbacks diferentes
fire_montecarlo.py       → 0.035
SurplusGapChart.tsx      → 0.03
SequenceOfReturnsRisk    → 0.04
+ 2 mais

# AFTER: 1 canonical SWREngine
scripts/swr_engine.py    SWREngine.calculate()
react-app/utils/swr.ts   SWREngine.calculate()
```

**Invariantes**:
```python
# 1. Single SWR calculation: swr = annual_withdrawal / starting_capital
# 2. Fallback value centralized in config
# 3. THREE strategies available: pure-swr, vpw, guardrails-aware
# 4. Impossible to use different fallback in different places
```

**Input Validation**:
```python
✓ patrimonio > 0
✓ annual_withdrawal >= 0
✓ strategy in ['swr', 'vpw', 'guardrails']
```

**Output Validation**:
```python
✓ swr >= 0 and <= 0.10 (sanity check)
✓ confidence >= 0 and <= 1
✓ source in ['calculation', 'fallback']
```

**❓ CRITICAL QUESTIONS FOR QUANT**:
1. **Fallback value**: Should be 0.03 or 0.035 or 0.04?
2. **Strategy default**: Always pure SWR, or start with guardrails-aware?
3. **VPW**: Should be option, or alternative to SWR?

---

### 4️⃣ **GuardrailEngine** — Consolidar Guardrails + Spending
**Status**: 🟠 Complex (6 implementações)  
**Duração**: 2-3 semanas  
**Responsável**: Quant + Dev (refactor SequenceOfReturnsRisk)

**Escopo**:
```python
# BEFORE: 6+ implementações
fire_montecarlo.py:181-187              GUARDRAILS = [0.15, 0.25, 0.35]
fire_montecarlo.py:362-368              aplicar_guardrail()
SequenceOfReturnsRisk.tsx:46-60         drawdownToSpending()
SequenceOfReturnsRisk.tsx:273-281       guardrail logic (diferentes)
SequenceOfReturnsRisk.tsx:460-463       hardcoded bands
GuardrailsMechanismChart.tsx:27-33      getSpendingCut()

# AFTER: 1 canonical engine
scripts/guardrail_engine.py             GuardrailEngine.calculate()
react-app/utils/guardrail.ts            GuardrailEngine.calculate()
```

**Invariantes**:
```python
# 1. Thresholds defined ONCE (Literal[0.15, 0.25, 0.35]) or configurable
# 2. Cut function: guardrail_cut(drawdown%, wealth) -> spending_reduction
#    Identical in Python and TypeScript
# 3. Expansion logic: +10% when safe (codified)
# 4. Impossible to use different thresholds in different places
# 5. Impossible to calculate cuts outside GuardrailEngine
```

**Input Validation**:
```python
✓ base_spending > 0
✓ wealth > 0
✓ peak_wealth >= wealth
✓ drawdown_pct in [0, 1]
```

**Output Validation**:
```python
✓ recommended_spending >= 0
✓ guardrail_band in ['upper', 'safe', 'lower']
✓ recommended <= base_spending (can only cut)
✓ When safe: recommended >= base_spending * 0.90 (expansion possible)
```

**React Refactor**:
```typescript
// OLD (6 different implementations):
const cut = ...  // different logic in each component

// NEW:
import { GuardrailEngine } from '@/utils/guardrail';
const result = GuardrailEngine.calculate(request);
const cut = result.recommended_spending;
```

**❓ CRITICAL QUESTIONS FOR QUANT**:
1. **Thresholds**: Always (0.15, 0.25, 0.35), or scenario-dependent?
2. **Expansion**: Always +10%, or context-dependent?
3. **Canonical**: Which implementation is correct? (MC vs generate_data vs React)

---

### 5️⃣ **WithdrawalEngine** — Unificar SWR + VPW + Guardrails
**Status**: 🔴 Complex (requires SWREngine + GuardrailEngine)  
**Duração**: 2-3 semanas  
**Responsável**: Quant + Dev (major refactor)  
**Bloqueador**: SWREngine + GuardrailEngine must complete first

**Escopo**:
```python
# AFTER Phase 4 & 5: Single engine for ALL withdrawal strategies
scripts/withdrawal_engine.py     WithdrawalEngine.calculate()
react-app/utils/withdrawal.ts    WithdrawalEngine.calculate()

# Replaces:
- fire_montecarlo.py strategies (SWR, guardrails, custom)
- All React withdrawal calculations
```

**Invariants**:
```python
# 1. WithdrawalRequest specifies strategy (enum)
# 2. WithdrawalResult ALWAYS includes:
#    - recommended_withdrawal
#    - swr
#    - confidence
#    - safety_band
#    - strategy_used
# 3. Identical results Python ↔ TypeScript with same seed
# 4. Impossible to calculate withdrawal outside WithdrawalEngine
```

**Input Validation**:
```python
✓ patrimonio > 0
✓ base_withdrawal >= 0
✓ strategy in ['swr', 'vpw', 'guardrails', 'dynamic']
✓ All supporting params valid (passed to SWREngine/GuardrailEngine)
```

**Tests**:
- [ ] 4 strategies produce different results (SWR < VPW < Guardrails < Dynamic)
- [ ] Python == TypeScript (seed-based)
- [ ] Confidence scoring works
- [ ] Prohibition: grep catches inline withdrawal calculations

---

### 6️⃣ **SpendingSmileEngine** — Export Python 3-Phase pra React
**Status**: 🟡 Medium (Python logic exists, needs TS port)  
**Duração**: 1-2 semanas  
**Responsável**: Dev + Quant

**Escopo**:
```python
# BEFORE: Python-only
fire_montecarlo.py:163-170             SPENDING_SMILE dict
fire_montecarlo.py:338-362             gasto_spending_smile() function
# React: custo_vida_base only (ignores phases)

# AFTER: Canonical spendingSmile
scripts/spending_engine.py              SpendingSmileEngine.calculate()
react-app/utils/spending.ts             SpendingSmileEngine.calculate()
```

**Invariantes**:
```python
# 1. 3-phase model: Go-Go, Slow-Go, No-Go (codified)
# 2. Adjustments: (100%, 80%, 60%) or configurable
# 3. Python == TypeScript output (same spending curve)
# 4. Impossible to ignore spending phases in projections
```

**Output**:
```python
class SpendingSmileResult:
    spending_by_year: dict  # year -> annual spending
    phase_transitions: dict  # {go_go: [0,15], slow_go: [15,30], ...}
    total_lifetime_spending: float
    source: Literal['canonical', 'approximation']
```

**React Integration**:
```typescript
// OLD: useFireProjection() ignores phases
// NEW: SpendingSmileEngine provides phase-aware spending
const smile = SpendingSmileEngine.calculate(request);
// Use smile.spending_by_year in chart projections
```

**Tests**:
- [ ] Phase transitions at correct ages
- [ ] Spending adjustments (100%, 80%, 60%)
- [ ] Python ↔ TypeScript consistency

---

### 7️⃣ **FactorEngine** — Consolidar Regressões FF5+MOM
**Status**: 🟢 Low priority (backend only)  
**Duração**: 3-4 dias  
**Responsável**: Dev + Quant

**Escopo**:
```python
# BEFORE: 2 parallel implementations
reconstruct_factor.py:181-220           compute_factor_loadings()
backtest_portfolio.py:793-850+          _factor_regression_r7()

# AFTER: 1 canonical
scripts/factor_engine.py                FactorEngine.calculate()
```

**Invariantes**:
```python
# 1. Single OLS regression: FF5 + Momentum
# 2. Identical formula in both Python modules
# 3. Impossible to run factor regression outside FactorEngine
```

---

## Guaranteed Architectural Invariants (Across All Engines)

### ✅ Pattern: MANDATORY CENTRALIZATION

**Rule 1: Single Source of Truth**
```python
# ❌ IMPOSSIBLE: Calculation outside engine
withdrawal = custo / patrimonio  # grep catches this

# ✅ REQUIRED: Go through engine
result = WithdrawalEngine.calculate(request)
withdrawal = result.recommended_withdrawal
```

**Rule 2: Validation Layers**
```python
# ❌ IMPOSSIBLE: Invalid request passes
request = WithdrawalRequest(patrimonio=-1)  # __post_init__ raises

# ✅ GUARANTEED: Result is valid
result = WithdrawalEngine.calculate(valid_request)
assert result.confidence >= 0 and result.confidence <= 1  # __post_init__ validates
```

**Rule 3: Rastreability**
```python
# Every result tracks origin
class Result:
    source: Literal['calculation', 'fallback', 'approximation']
    version: str  # "1.0.0" — schema version
    _audit_trail: dict  # What inputs were used
```

**Rule 4: Cross-Platform Consistency**
```python
# Same request + seed = identical results (Python ↔ TypeScript)
request = WithdrawalRequest(..., seed=42)
py_result = WithdrawalEngine.calculate(request)  # Python

ts_result = WithdrawalEngine.calculate(request)  # TypeScript
assert py_result.recommended_withdrawal == ts_result.recommended_withdrawal
```

**Rule 5: Prohibition Testing**
```bash
# Automated grep tests catch violations
pytest scripts/tests/test_centralization_prohibitions.py
# Fails if finds:
#   - "swr = " (outside WithdrawalEngine)
#   - "guardrail_cut(" (outside GuardrailEngine)
#   - "pool(t)" inline (outside BondPoolEngine)
#   - "tax_diferido =" inline (outside TaxEngine)
```

---

## Acceptance Criteria

### Phase 1: Answers & Planning (This Week)

- [ ] **Quant answers questions**:
  - SWR fallback: 0.03 or 0.035 or 0.04?
  - Guardrail thresholds: fixed or scenario-dependent?
  - Spending Smile critical or optional?
  - Which withdrawal strategy is canonical?

- [ ] **Dev assesses risk**:
  - Impact on SequenceOfReturnsRisk refactor?
  - TypeScript+Python in parallel or sequential?
  - Browser vs server: which engines run where?

- [ ] **Head decides**:
  - Order of implementation (TaxEngine first, then BondPoolEngine, then SWREngine?)
  - Timeline: all in 6-8 weeks, or spread?
  - When to start: this week or next month?

### Phase 2: Implementation (6-8 weeks)

Each sub-task must satisfy:
- [ ] Python implementation with validation layers
- [ ] TypeScript port (where applicable)
- [ ] 8+ unit tests (valid request, invalid request, edge cases)
- [ ] Prohibition tests (grep + pytest)
- [ ] Cross-platform tests (Python == TypeScript for same seed)
- [ ] Integration tests (old code removed, new code used everywhere)
- [ ] Documentation (invariants, usage, examples)

---

## Execution Order (Proposed)

Based on dependencies and risk:

1. **TaxEngine** (Week 1) — Low risk, quick win, unblocks taxes
2. **BondPoolEngine** (Week 2) — Low risk, quick win
3. **SWREngine** (Week 3-4) — Needs Quant answers, medium complexity
4. **GuardrailEngine** (Week 4-6) — High complexity, refactor React
5. **WithdrawalEngine** (Week 6-7) — Depends on SWR+Guardrail
6. **SpendingSmileEngine** (Week 7-8) — Lower priority, nice-to-have
7. **FactorEngine** (After) — Backend only, can wait

---

## Resources Needed

- **Quant**: 4-5 hours (answer questions, validate formulas)
- **Dev**: 40-50 hours (code + refactor)
- **Head**: 10-15 hours (coordination, integration)
- **CI/CD**: Extend prohibition tests, schema validation
- **Docs**: Write GUARANTEE.md (architectural invariants)

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking React charts (GuardrailEngine) | Comprehensive test suite before removing old code |
| Python ↔ TS divergence | Identical test cases with seed-based comparison |
| Incomplete refactor (old code lingers) | Prohibition tests + grep in CI |
| Scope creep | Strict sub-task boundaries, no feature additions |

---

## Questions for Team (START NOW)

### 🔵 QUANT — CRITICAL QUESTIONS

**1. SWR Fallback Value**
```
Current state: 3 different values (0.03, 0.035, 0.04)
Decision needed: Which is canonical? (Impacts SWREngine + WithdrawalEngine)

A) 0.030 (3.0%) — Conservative
B) 0.035 (3.5%) — Current python default
C) 0.040 (4.0%) — PGBL assumption
D) Config.py should expose it as parameter
```

**2. Guardrail Thresholds**
```
Current state: (0.15, 0.25, 0.35) hardcoded in 6 places
Decision needed: Are these ALWAYS these values, or scenario-dependent?

A) Always (0.15, 0.25, 0.35) — Codify as constant
B) Scenario-dependent — Need config by scenario
C) User-configurable — Expose as parameter to GuardrailEngine
D) Varies by marital status/profile
```

**3. Spending Smile Criticality**
```
Current state: Python has 3-phase (Go-Go/Slow-Go/No-Go), React ignores it
Decision needed: How important is phase-aware spending?

A) Critical — Must be in every projection (SpendingSmileEngine required)
B) Nice-to-have — Can deprecate, simplify to flat spending
C) Context-dependent — Use when available, fall back to flat
D) Only for FIRE projections, not for annual withdrawals
```

**4. Withdrawal Strategy Default**
```
Current state: Mix of SWR-only, guardrails-aware, VPW strategies
Decision needed: Which should be PRIMARY strategy?

A) Pure SWR — Simplest, always available
B) Guardrails-aware SWR — Conservative, adjusts for market
C) VPW (Variable Percentage Withdrawal) — Dynamic, most complex
D) Dynamic (chooses based on context) — Requires all above
```

**5. Canonical Guardrail Implementation**
```
Current state: Python (MC path) vs generate_data vs React show different logic
Decision needed: Which is correct? (Others must replicate)

A) fire_montecarlo.py:237-240 (withdrawal_guardrails function)
B) generate_data.py:2171-2200 (compute_spending_guardrails function)
C) SequenceOfReturnsRisk.tsx:46-60 (drawdownToSpending function)
D) Combine best of all three
```

---

### 🟢 DEV — TECHNICAL QUESTIONS

**1. SequenceOfReturnsRisk Refactor Risk**
```
Current state: Complex component with 6 inline calculations
Concern: Breaking charts during GuardrailEngine extraction

Questions:
- Test coverage for SequenceOfReturnsRisk.tsx currently at what level?
- What's risk of breaking Drawdown-to-Spending visualization?
- Recommend refactoring step-by-step or rewrite?
```

**2. TypeScript + Python Timing**
```
Current state: P(FIRE) done in parallel (both 1-2 weeks)
Decision needed: Same for all 5 engines?

A) Parallel — Type-safe TypeScript alongside Python (faster, 2x work)
B) Sequential — Python first, then TypeScript port (slower, 1x work)
C) Selective — Parallel for critical (SWR/Guardrails), sequential for others
```

**3. Browser vs Server Execution**
```
Which engines need to run in React (browser)?
- SWREngine: Yes (users adjust spending)
- GuardrailEngine: Yes (display guardrail effects)
- WithdrawalEngine: Yes (projection charts)
- SpendingSmileEngine: Yes (phase awareness)
- TaxEngine: No (backend only)
- BondPoolEngine: Maybe (projection charts)
- FactorEngine: No (analytics only)

Concern: If all run in browser, need to port all to TypeScript.
```

---

### 💜 HEAD — STRATEGIC QUESTIONS

**1. Execution Priority**
```
Option A: Sequential (TaxEngine → BondPoolEngine → SWREngine → GuardrailEngine → WithdrawalEngine)
- Advantage: Clear, each blocks next, team focused
- Disadvantage: Slow, won't see full benefit until week 7-8

Option B: Parallel (Tax+Bond on 2 devs, SWR+Guardrails on 2 devs)
- Advantage: Faster (finish in 4-5 weeks instead of 8)
- Disadvantage: Higher coordination, risk of drift

Option C: Phased (Quick wins Week 1-2, then big refactor Week 3-8)
- Advantage: Early wins build momentum
- Disadvantage: Context switching
```

**2. When to Start**
```
A) NOW (This week) — Want momentum, ready to drop other work
B) Next week — Let team plan, start with TaxEngine (low risk warm-up)
C) In 2 weeks — After other commitments, have full team capacity
D) Next month — Lower priority, do after PFIRE_PHASE4_DATA_GEN
```

**3. Risk Tolerance**
```
A) High — Refactor aggressively, remove old code immediately
B) Medium — Dual implementations (old + new) until 100% tested
C) Conservative — Old code lingers until 6 months, proves new works

Impacts: How many "if (useNewEngine)" flags in code?
```

**4. Scope Boundary**
```
Must include (Core 5): TaxEngine, BondPoolEngine, SWREngine, GuardrailEngine, WithdrawalEngine
Optional (Nice-to-have): SpendingSmileEngine, FactorEngine

Include everything (Path C full), or cut to Core 5?
```

---

## Success Metrics

When CENTRALIZATION_COMPLETE is done:

```
✅ Zero duplication of calculation logic
✅ Zero inline magic numbers (fallback values in config)
✅ Zero silent bugs from inconsistent implementations
✅ 100% test coverage (unit + integration + prohibition)
✅ Python ↔ TypeScript consistency validated
✅ Impossible to do calculations outside engines (architectural guarantee)
✅ Every result is auditable (source + version tracking)
✅ Full documentation of invariants
```

---

## Next Steps

1. **Team discusses questions THIS WEEK** (Quant, Dev, Head)
2. **Head decides path + timeline** (all-in or phased)
3. **Create sub-issues** (one per engine)
4. **Start TaxEngine** (unblock, build momentum)

---

**Última atualização**: 2026-04-26  
**Status**: Aguardando respostas das perguntas do time
