# CENTRALIZATION_COMPLETE — Team Responses (2026-04-26)

**Status**: Responses compiled · Ready for Head synthesis and execution plan  
**Decision Window**: Q1-Q12 all answered · Ready to start Phase 1 next week  
**Next**: Head creates sub-issues for each engine

---

## QUANT RESPONSES (Q1-Q5)

### Q1: SWR Fallback Value
**☑ D) Make it config parameter — with default 0.030 from carteira.md**

- Current `swr_gatilho = 0.030` in carteira.md is the approved threshold (from FR-swr-revisao 2026-04-13)
- The 0.035 in fire_montecarlo.py is edge case (when patrimonio unknown, shouldn't happen)
- The 0.04 in React is PGBL/Katia anuidade calculation, not portfolio SWR
- **Implementation**: `config.py` exports `SWR_FALLBACK = carteira_params["swr_gatilho"]` (0.030)
- Scenarios needing different values pass explicitly as parameter, never globally
- **Tradeoff**: Configurable adds parameter, but guarantees fallback never diverges from approved baseline

---

### Q2: Guardrail Thresholds
**☑ A) Always (0.15, 0.25, 0.35) — codify as constant**

- Documented in carteira.md §Guardrails (approved 2026-03-20) with explicit cuts and floors
- Already in carteira_params.json and imported by fire_montecarlo.py
- Scenario-dependent thresholds would create silent divergence (P(FIRE) base vs stress incomparable)
- Profile-dependent already handled by category elasticity (FR-guardrails-categoria-elasticidade)
- **Single valid exception**: Annual P(FIRE) gate can alter `custo_vida_base`, but guardrail thresholds stay fixed
- **Risk**: Any other approach creates inconsistency between portfolio central estimate (86.4%) and individual projection details

---

### Q3: Spending Smile
**☑ A) Critical — must implement SpendingSmileEngine**

- Spending smile is not conveniência — it's canonical in fire_montecarlo.py (all simulations use it)
- Go-Go R$242k / Slow-Go R$200k / No-Go R$187k documented in carteira_params.json
- **Problem identified**: React ignores phases entirely, creating inconsistency with P(FIRE) calculation
- Blanchett 2014 ("Estimating True Cost of Retirement"): real spending falls ~1-2%/year post-65
- For Diego (retire at 53): 30 of 40 retirement years in Slow-Go/No-Go phases
- **Without smile in React**: projections overestimate average spending, diverge from the 86.4% baseline that was calculated with phases

---

### Q4: Canonical Withdrawal Strategy
**☑ E) Guardrails-aware SWR as primary; others as alternatives (not default)**

- Current default in fire_montecarlo.py is `strategy="guardrails"` (approved)
- P(FIRE) 86.4% was calculated with guardrails — any other strategy as default makes number incomparable
- Pure SWR: simplest but inadequate for 40-year horizon (ERN Part 28 shows guardrails reduce ruin probability without excess conservatism)
- VPW: invalid for first 7 years because bond pool creates structured desacumulacao (pool runway exists specifically to avoid VPW in early years)
- **Keep all strategies calculated** for dashboard comparison, but only guardrails feeds canonical P(FIRE)

---

### Q5: Canonical Guardrail Implementation
**☑ A) fire_montecarlo.py:237-240 (apply to gasto_smile, not flat base)**

Implementation comparison:

| Location | Logic | Input | Error |
|----------|-------|-------|-------|
| **A) fire_montecarlo.py** | Apply cuts to `gasto_smile` | Spending-adjusted for phase | ✅ Correct |
| **B) generate_data.py** | Apply cuts + 10% expansion when P(FIRE)>90% | `custoVidaBase` flat | ⚠️ Display-only (correct for dashboard bands, not for simulation) |
| **C) React** | Apply cuts to `custoVidaBase` | Flat cost | ❌ **BUG**: ignores phase adjustment, produces larger cuts in absolute terms |

**Root cause in React**: After year 15, `custoVidaBase` (R$250k) > `gasto_smile` Slow-Go (R$200k). Guardrail cuts applied to larger base = wrong absolute spending.

**Action required**: GuardrailEngine uses logic from A, receiving phase-adjusted spending as input (not raw cost base).

---

## DEV RESPONSES (Q6-Q8)

### Q6: SequenceOfReturnsRisk Refactor Risk
**☑ C) Dual implementation (old + new in parallel, migrate gradually)**

**Test coverage analysis:**
- **Zero unit tests** for SequenceOfReturnsRisk component specifically
- Chart rendering mocked (jsdom can't render ECharts)
- No visual regression tests before/after refactor
- **Risk Level: HIGH** — unnoticed divergence possible (calculation is correct on paper but wrong in effect)

**Why C (dual implementation)?**
- A (step-by-step extraction): Component too tightly coupled (drawdownToSpending + heatmap memoization), partial extraction risky
- B (rewrite from scratch): 477 lines, 8+ transformations, 1 off-by-one error → all 4 visual sections wrong
- **C best**: Keep old in production, build SequenceOfReturnsRiskV2.tsx calling GuardrailEngine
  - Side-by-side comparison on staging (1–2 weeks)
  - Visual diff: heatmap cells matching to within 5%
  - Full parity validated → switch over → delete V1 after 1 week monitoring

**Effort estimate**: 4–6 weeks (engine + port + V2 component + validation)

---

### Q7: TypeScript + Python Execution Timing
**☑ C) Selective — Parallel for critical (SWR/Guardrails), sequential for others**

**Timeline: 8–10 weeks total**

| Phase | Weeks | Engines | Strategy |
|-------|-------|---------|----------|
| **Phase 1** | 1–2 | SWREngine + GuardrailEngine | Parallel (2 devs on Python SWR + Python Guardrails, 2 devs on TS ports) |
| **Phase 2** | 3–4 | WithdrawalEngine | Sequential (depends on SWR + Guardrails locked + tested) |
| **Phase 3** | 5–6 | TaxEngine + BondPool | Sequential + parallel testing (no cross-dependency) |
| **Phase 4** | 7–8 | SpendingSmile + FactorEngine | Optional/sequential |

**Why selective?**
- SWR + Guardrails are foundational; WithdrawalEngine blocks on both
- TaxEngine, BondPool are independent (can be done in any order)
- Full parallel would create complexity debt without saving time (WithdrawalEngine bottleneck)

---

### Q8: Browser vs Server Execution

**Choice: Conditional split**

**Browser (interactive, user adjusts, instant feedback):**
- ☑ **SWREngine** — user adjusts withdrawal rate, sees heatmap update <500ms
- ☑ **GuardrailEngine** — drawdown thresholds, real-time spending cuts
- ☑ **SpendingSmile** — phase display (go-go/slow-go/no-go), toggle scenarios
- ☑ **BondPoolEngine** — duration matching, ladder rebalancing

**Server (heavy/law-dependent, pre-computed, returns to client):**
- ☑ **TaxEngine** — tax law changes frequently, centralize to avoid shipping new JS
- ☑ **WithdrawalEngine** — complex strategy selection (best of 3), server enforces rules
- ☑ **FactorEngine** — factor model regression, heavy computation

**Rationale:**
- Browser: <500ms feedback, privacy preserved, offline capable, frequent changes during session
- Server: centralized law enforcement, heavy computation, auditability, infrequent updates, strategy consistency

---

## HEAD RESPONSES (Q9-Q12)

### Q9: Execution Strategy
**☑ C) Phased — Quick wins weeks 1–2, structured parallel weeks 3–8**

**Phase 1 — Quick Wins (Weeks 1–2):**
- Tax consolidation (1 day) + Bond consolidation (1 day) + SWR constants (2 hours)
- Zero behavioral risk (functionally identical, 2 locations each)
- Validates invariant pattern on low-stakes targets before GuardrailEngine (6 locations, complex)
- Effort: 3–5 days

**Phase 2 — Structured Parallel (Weeks 3–6):**
- SWREngine + GuardrailEngine in parallel (once Q5 canonical logic answered)
- SequenceOfReturnsRisk extraction happens within Phase 2 as sequential subtask
- Python and TypeScript ports can run in parallel but against locked specification

**Phase 3 — WithdrawalEngine Sequential (Weeks 6–8):**
- Cannot start until Phase 2 (SWR + Guardrails) locked and tested
- Unifies SWR + Guardrails + VPW synthesis layer

**Why not pure parallel (B)?**
- Skips invariant validation step that P(FIRE) Phase 3 proved essential
- 6-location guardrail scatter means parallel error could produce silently wrong P(FIRE) before old code is removed

**Why not pure sequential (A)?**
- Tax + Bond + SWR constants are genuinely independent within Phase 1
- Sequential wastes a week on parallelizable work

**Coordination:** 30-minute sync after Phase 1 to review learnings before Phase 2 start

---

### Q10: Timeline & Start Date
**☑ B) Next week — Start Phase 1 with Tax + Bond + SWR constants. Full capacity from Week 2.**

**Rationale:**
- This week closes Q1–Q8 team answers before implementation starts
- Q5 (canonical guardrail logic) is blocking dependency for GuardrailEngine design
- Starting implementation before Q5 answered = building against wrong invariant (failure mode we're preventing)

**Detailed timeline:**

| Week | Milestone |
|------|-----------|
| **Week 1 (Apr 28)** | Q1–Q8 responses finalized. Tax + Bond consolidation. SWR constants → config.py |
| **Week 2 (May 5)** | SWREngine Python. Review Phase 1 learnings. |
| **Weeks 3–4 (May 12)** | GuardrailEngine (Python + TS). SequenceOfReturnsRisk extraction. |
| **Weeks 5–6 (May 26)** | GuardrailEngine React refactor complete. SWREngine TS port. Tests passing. |
| **Weeks 7–8 (Jun 9)** | WithdrawalEngine (Python + TS). VPW + guardrails + SWR unification. |
| **Week 8 end (Jun 16)** | All 5 core engines in production. Old code removed. |

**Estimated completion: week of 2026-06-09 to 2026-06-16 (core 5 engines)**

**Critical path note**: Q5 (canonical guardrail implementation) blocks Phase 2. If no answer by Thu EOD, Phase 2 slips 1:1 per day delayed.

---

### Q11: Risk Tolerance & Dual Implementations
**☑ C) Phased — Remove old code after 1–2 weeks production use (asymmetric per engine)**

**Phase 1 (Tax + Bond + SWR):** Remove immediately after tests pass
- Functionally identical duplications
- Keeping two copies creates more risk than benefit (drift, confusion)

**Phase 2–3 (SWREngine, GuardrailEngine, WithdrawalEngine):** 2-week parallel window
- Keep old and new side-by-side for exactly 2 weeks production use
- Regression gate: new engine must match old baseline within **±0.5pp on P(FIRE)** (currently 86.4%)
- If divergence detected, signal structural issue (not just refactoring)
- Invariant tests must include baseline comparison

**Why not conservative (6 months)?**
- Defeats the centralization goal (scattered logic for 6 months)
- P(FIRE) Phase 3 template removed after 2 weeks with zero issues

**Why not aggressive (immediate)?**
- GuardrailEngine with 6 scattered locations is exactly the silent-bug scenario we're solving
- 2-week window specifically catches unnoticed divergence

**Rollback commitment:** During parallel window, old code paths remain callable via feature flag/fallback import (one-line revert if needed)

---

### Q12: Scope Boundary
**☑ C) Core 5 engines + FactorEngine (adds 3–4 days during Phase 2 slack)**

**Core 5: Non-negotiable**
- GuardrailEngine: 6 locations, causing active maintenance risk
- SWREngine: 5 locations, 3 different fallbacks, causing confusion
- TaxEngine + BondPool: 1-day cleanups each
- WithdrawalEngine: synthesis layer that makes the other 4 coherent
- **Total effort**: 6–8 weeks (critical path WithdrawalEngine)

**FactorEngine: Include**
- 2 parallel FF5+MOM regressions (backend only, low refactor risk)
- 3–4 days effort
- Fits in Phase 2 slack (between GuardrailEngine Python and React refactor)
- Avoids separate issue, context-switch overhead
- Follows CLAUDE.md rule: "inline first, extract on 2nd real duplication" (this is the 2nd)

**SpendingSmileEngine: Defer**
- Depends on Q3 (Quant) answer on criticality (open question)
- Only makes sense post-WithdrawalEngine (withdrawal cuts interact with phases)
- Would extend critical path 1 week (not in Phase 2 slack like FactorEngine)
- Becomes immediate priority if Q3 returns "critical"

**Revised scope:**
- **In scope**: Core 5 + FactorEngine = **6–8 weeks** (no time increase because FactorEngine fits in slack)
- **Deferred**: SpendingSmileEngine (blocked by Q3 answer)

---

## SYNTHESIS & NEXT STEPS

### Decisions Locked
- ✅ Q1: SWR fallback = config param (default 0.030)
- ✅ Q2: Guardrails always (0.15, 0.25, 0.35)
- ✅ Q3: Spending Smile critical (implement)
- ✅ Q4: Guardrails-aware SWR primary (others as alternatives)
- ✅ Q5: fire_montecarlo.py canonical (apply to gasto_smile, not flat base)
- ✅ Q6: Dual implementation for React (old+new parallel, 2-week validation)
- ✅ Q7: Selective parallel (SWR+Guardrails weeks 1–2, WithdrawalEngine week 3+, 8–10 weeks total)
- ✅ Q8: Browser for interactive (SWR, Guardrails, SpendingSmile, BondPool), server for heavy/law (Tax, Withdrawal, Factor)
- ✅ Q9: Phased execution (quick wins → structured parallel)
- ✅ Q10: Start next week (Phase 1), complete ~Jun 9–16 (core 5 + FactorEngine)
- ✅ Q11: Asymmetric removal (Phase 1 immediate, Phases 2–3 after 2-week parallel validation)
- ✅ Q12: Core 5 + FactorEngine (6–8 weeks), SpendingSmile deferred

### Head Action Items
1. **Create sub-issues** (one per engine):
   - CENTAL-TAX-001: TaxEngine consolidation
   - CENTAL-BOND-001: BondPoolEngine consolidation
   - CENTAL-SWR-FALLBACK-001: SWR constants to config.py
   - CENTAL-SWR-001: SWREngine (Python + TypeScript)
   - CENTAL-GUARDRAILS-001: GuardrailEngine (Python + TypeScript + React refactor)
   - CENTAL-WITHDRAWAL-001: WithdrawalEngine (Python + TypeScript)
   - CENTAL-FACTOR-001: FactorEngine consolidation (optional, Phase 2 slack)

2. **Create milestone branches**:
   - phase-1-quick-wins (Tax + Bond + SWR)
   - phase-2-swr-guardrails (SWREngine + GuardrailEngine)
   - phase-3-withdrawal (WithdrawalEngine)

3. **Lock Q5 answer** before Phase 2 branch creation (guardrail logic must be canonical, not debatable)

### Data Pipeline Coordination
Parallel issue DATA_PIPELINE_CENTRALIZATION follows similar invariant pattern:
- DataPipelineEngine orchestrates snapshot synchronization
- Snapshot versioning (_window_id, _schema_version)
- Input/output validation
- Prohibition tests
- 7-day archive + rollback safety

Both issues can run in parallel (2–3 weeks for DATA_PIPELINE core) without blocking each other. Sync point: both use same guarantee pattern, share validation/prohibition test framework.

---

**Compilation Date**: 2026-04-26  
**Responses from**: Quant, Dev, Head  
**Status**: Ready for implementation kickoff (Phase 1 starts next week)
