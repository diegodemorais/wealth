# 🎯 CENTRALIZATION_COMPLETE — TEAM DISCUSSION (This Week)

**Issue**: `agentes/issues/CENTRALIZATION_COMPLETE.md`  
**Dono**: Head  
**Status**: 📋 Refinement (awaiting team answers)  
**Prioridade**: 🔴 CRÍTICA  
**Criado em**: 2026-04-26  
**Decision Deadline**: End of week  
**Start Implementation**: Next week if approved

---

## ❓ CRITICAL QUESTIONS (Team Must Answer)

### 🔵 FOR QUANT (Answers define the math for all engines)

#### Q1: SWR Fallback Value
```
Currently: 3 different values hardcoded (0.03 vs 0.035 vs 0.04)
Impact: Every SWREngine call + WithdrawalEngine call depends on this
Timeline: Affects Phase 3 (SWREngine) and Phase 5 (WithdrawalEngine)

CHOOSE ONE:

□ A) 0.030 (3.0%) — Conservative approach
□ B) 0.035 (3.5%) — Current Python default
□ C) 0.040 (4.0%) — PGBL conservative cap
□ D) Make it config parameter (flexible by scenario)
□ E) Other (explain):
```

#### Q2: Guardrail Thresholds
```
Currently: (0.15, 0.25, 0.35) hardcoded in 6 files
Impact: GuardrailEngine design depends on this
Timeline: Affects Phase 4 (GuardrailEngine) and Phase 5 (WithdrawalEngine)

CHOOSE ONE:

□ A) Always (0.15, 0.25, 0.35) — Codify as constant
□ B) Scenario-dependent — Different thresholds for base/aspiracional/stress
□ C) User-configurable — Expose as parameter to GuardrailEngine
□ D) Profile-dependent — Different for single/couple/family
□ E) Other (explain):
```

#### Q3: Spending Smile (3-Phase Model)
```
Currently: Python has Go-Go (0-15y) / Slow-Go (15-30y) / No-Go (30+y)
          React ignores phases entirely
Impact: SpendingSmileEngine criticality + React refactor scope
Timeline: Affects Phase 6 (SpendingSmileEngine) and React integration

CHOOSE ONE:

□ A) Critical — Must be in every projection (implement SpendingSmileEngine)
□ B) Nice-to-have — Can deprecate, simplify to flat spending
□ C) Context-dependent — Use when available, fall back to flat
□ D) Only for FIRE projections, not for annual withdrawals
□ E) Other (explain):
```

#### Q4: Canonical Withdrawal Strategy
```
Currently: Mix of pure SWR, guardrails-aware, VPW (Variable %) approaches
Impact: WithdrawalEngine design + default strategy
Timeline: Affects Phase 5 (WithdrawalEngine)

CHOOSE ONE (or multiple if all valid):

□ A) Pure SWR — Simplest, always available
□ B) Guardrails-aware SWR — Conservative, adjusts for wealth swings
□ C) VPW (Variable Percentage Withdrawal) — Dynamic, market-responsive
□ D) Dynamic (algorithm chooses) — All three available, picks best
□ E) Prefer one strategy but support others as alternatives
```

#### Q5: Canonical Guardrail Implementation (Which is correct?)
```
Currently: 3 different implementations with different logic:

A) fire_montecarlo.py:237-240
   withdrawal_guardrails(gasto_smile, patrimonio, pat_pico)
   → Applies cuts to spending_smile

B) generate_data.py:2171-2200
   compute_spending_guardrails()
   → Applies cuts to base cost + 10% expansion when safe

C) SequenceOfReturnsRisk.tsx:46-60
   drawdownToSpending()
   → Applies cuts to base cost (no expansion logic)

Decision: Which logic should ALL other implementations replicate?

□ A) fire_montecarlo.py version
□ B) generate_data.py version
□ C) React version
□ D) Combine best of all three (explain):
```

---

### 🟢 FOR DEV (Answers shape implementation approach)

#### Q6: SequenceOfReturnsRisk Refactor Risk
```
Currently: Complex component with 6+ inline calculations (guardrails, SWR, etc)
Impact: GuardrailEngine extraction + React refactoring strategy
Timeline: Affects Phase 4 (GuardrailEngine React refactor)

Questions:
1) What's the test coverage for SequenceOfReturnsRisk.tsx?
   □ Unit tests exist?
   □ Chart visualization tests?
   □ How much re-testing needed after refactor?

2) Refactoring approach:
   □ A) Step-by-step extraction (remove 1 calculation at a time)
   □ B) Rewrite component from scratch (cleaner but riskier)
   □ C) Dual implementation (old + new in parallel, migrate gradually)

3) Risk level estimate (if refactor wrong):
   □ A) Low (chart would break obviously, easy to catch)
   □ B) Medium (subtle differences in guardrail visualization)
   □ C) High (could go unnoticed for months)
```

#### Q7: TypeScript + Python Execution Timing
```
Pattern from P(FIRE): Done in parallel (both 1-2 weeks)
Decision: Same approach for all 5 engines?

□ A) Parallel — Simultaneous Python + TypeScript (faster, 2x dev effort)
□ B) Sequential — Python first, then TS port (slower, 1x dev effort)
□ C) Selective — Parallel for critical (SWR/Guardrails), sequential for others
□ D) Python-only — No TypeScript port (server-side calculation)

Timeline impact:
- Parallel: 6-8 weeks total
- Sequential: 10-12 weeks total
- Selective: 8-10 weeks total
```

#### Q8: Browser vs Server Execution (Which engines run in React?)
```
SWREngine       □ Browser (user adjusts)    □ Server only      □ Both
GuardrailEngine □ Browser (see effects)     □ Server only      □ Both
WithdrawalEngine □ Browser (projections)    □ Server only      □ Both
SpendingSmile   □ Browser (phase display)   □ Server only      □ Both
TaxEngine       □ Browser (calcs)           □ Server only      □ Both
BondPoolEngine  □ Browser (projections)     □ Server only      □ Both
FactorEngine    □ Browser (analysis)        □ Server only      □ Both

Impact: If all run in browser → need to port all to TypeScript
If server-only → Python sufficient, JS calls backend
```

---

### 💜 FOR HEAD (Strategic decisions)

#### Q9: Execution Strategy
```
Decision: How to implement the 5 engines?

□ A) Sequential (TaxEngine → BondPool → SWR → Guardrails → Withdrawal)
    Pro: Clear, each blocks next, team focused
    Con: Slow, won't see full benefit until week 7-8

□ B) Parallel (2 devs on Tax+Bond, 2 devs on SWR+Guardrails simultaneously)
    Pro: Faster (finish in 4-5 weeks instead of 8)
    Con: Higher coordination, risk of drift

□ C) Phased (Quick wins week 1-2, big refactor week 3-8)
    Pro: Early momentum, quick wins visible
    Con: Context switching, start/stop overhead

□ D) Other (explain):
```

#### Q10: Timeline & Start Date
```
Decision: When to commit full-time to centralization?

□ A) NOW (This week) — Want momentum, ready to drop other work
□ B) Next week — Let team plan, start with TaxEngine warm-up
□ C) In 2 weeks — After other commitments, full capacity
□ D) Next month — Lower priority, after PFIRE_PHASE4_DATA_GEN
□ E) Other (explain):

If chosen A, B, or C: Estimated completion date?
   Expected: _______ (week of)
```

#### Q11: Risk Tolerance & Dual Implementations
```
Decision: How aggressively to refactor?

□ A) Aggressive — Remove old code immediately after tests pass
    Risk: If new code fails, old version gone
    Benefit: Clean, no legacy code

□ B) Conservative — Keep old + new in parallel until 6 months of testing
    Risk: Confusing dual implementations
    Benefit: Easy rollback if issues arise

□ C) Phased — Remove old code only after 1-2 weeks of production use
    Risk: Medium (most issues found early)
    Benefit: Balance of speed + safety

Chosen approach impacts: Technical debt, codebase clarity, rollback time
```

#### Q12: Scope Boundary
```
Decision: Which engines are REQUIRED vs NICE-TO-HAVE?

CORE (must include):
- TaxEngine (2x duplication, high maint)
- BondPoolEngine (2x duplication)
- SWREngine (5x scatter, different fallbacks)
- GuardrailEngine (6x duplication, silent bugs)
- WithdrawalEngine (unifies SWR+Guardrails+VPW)

OPTIONAL (nice-to-have, lower priority):
- SpendingSmileEngine (Python 3-phase → React)
- FactorEngine (2x parallel regressions)

□ A) Core 5 engines only (essential, 6-8 weeks)
□ B) Core 5 + SpendingSmile (adds 1 week)
□ C) Core 5 + FactorEngine (adds 3-4 days)
□ D) All 7 (full path, 7-9 weeks)
```

---

## How to Respond

### Option 1: Async (Write in each question)
Reply to this issue with answers in markdown format:
```
## Q1: SWR Fallback
☑ B) 0.035 (3.5%) — Current Python default

## Q2: Guardrail Thresholds
☑ A) Always (0.15, 0.25, 0.35)

[etc...]
```

### Option 2: Sync (1-hour meeting)
Schedule 1 hour with Quant, Dev, Head to discuss live:
- 10 min: Quant questions
- 10 min: Dev questions
- 10 min: Head decisions
- 30 min: Debate/trade-offs

---

## What Happens After

Once answers received:

1. **Head synthesizes decisions** → Create execution plan
2. **Dev creates sub-issues** → One per engine
3. **TaxEngine starts** (Week 1) → Build momentum, validate pattern
4. **Team reviews** (End Week 1) → Adjust if needed
5. **Full acceleration** (Week 2+) → All 5 engines in parallel or sequence

---

## Preview: What Centralization Solves

### Current State (Before):
```
Tax calc in 2 files:
  generate_data.py:1592
  reconstruct_tax.py:92
  → If law changes, update both. Risk: forget one.

Guardrail calc in 6 files:
  fire_montecarlo.py, 2x generate_data.py, 3x React components
  → If threshold changes 0.15→0.16, update 6 places. Risk: inconsistency.

SWR fallback in 5 files:
  0.03 in React, 0.035 in Python, 0.04 in PGBL
  → Developers confused, silent divergence.
```

### After Centralization (with Invariants):
```
✅ Tax calc ONLY in tax_engine.py
   Law changes → update 1 place
   All code uses it automatically

✅ Guardrails ONLY in guardrail_engine.py
   Threshold changes → automatic everywhere
   Impossible to have 6 different implementations

✅ SWR fallback defined ONCE in config
   Change value → all SWREngine calls use it
   CI prohibits inline SWR calculations

✅ GUARANTEED: Impossible to violate (architecture prevents it)
   Not testable: IMPOSSIBLE
   Not bypassing: ARCHITECTURAL
```

---

## Deadline

**Answer by**: Friday EOD (end of week)  
**Discussion**: This week if needed  
**Start implementation**: Monday of next week

---

**Reference**: `GUARANTEED_INVARIANTS.md` · `DATA_PIPELINE_CENTRALIZATION.md`
