# FINDING: Phase 3 — Critical P50/P90 Ordering Bug

**Severity**: CRITICAL — Blocks FIRE calculations
**Status**: Identified, Documented, Needs Fix
**Date**: 2026-04-24
**Found By**: Phase 3 QA Test (test_trilha_percentis_ordered_at_each_point)

---

## Issue

Monte Carlo percentiles violate ordering at point 61:
- Expected: P10 ≤ P50 ≤ P90 (always)
- **Actual**: P50 (3,668,959) > P90 (3,637,720) at month 61

This breaks the fundamental invariant of percentile ordering.

---

## Root Cause

Identified by Quant specialist:  
File: `react-app/src/utils/montecarlo.ts`, function `getPercentileAtMonth()`

```typescript
// BUG: || operator treats 0 as falsy
const values = trajectories.map(t => t[month] || t[t.length - 1])
```

When a trajectory reaches zero (ruina), the `||` operator substitutes the last value. This:
1. Artificially inflates the percentile value
2. Breaks ordering when different percentiles get different substitutions
3. Causes P10 (lower percentile, more likely to hit ruina) to appear higher than P90

---

## Evidence

Test output:
```
E           AssertionError: P50[61]=3668959.0 should be <= P90[61]=3637720.0
```

Point 61 = month 61 ≈ 5 years into 14-year projection

---

## Impact

- **P(FIRE) calculations**: Potentially underestimated (bad percentiles inflate P50)
- **Guardrails**: If guardrails use percentiles, they're miscalibrated
- **Risk perception**: User sees false confidence in projections

---

## Fix Required

**Option 1** (Correct): Remove the fallback substitution
```typescript
const values = trajectories.map(t => t[month]).filter(v => v !== undefined)
return values[Math.floor(values.length * percentile)]
```

**Option 2** (Workaround): Use explicit zero instead of last value
```typescript
const values = trajectories.map(t => t[month] !== undefined ? t[month] : 0)
```

**Recommendation**: Option 1 (correct approach — drop short trajectories, percentile over remaining ones)

---

## Test Coverage

Phase 3 Test Failing:
- `test_trilha_percentis_ordered_at_each_point` (FAILS at point 61)

---

## Next Steps

1. Fix `getPercentileAtMonth` in `montecarlo.ts`
2. Re-run Phase 3 tests (should pass after fix)
3. Validate P(FIRE) values haven't changed unexpectedly
4. Re-run Phases 3-8 tests
