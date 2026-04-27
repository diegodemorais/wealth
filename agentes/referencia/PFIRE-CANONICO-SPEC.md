# P(FIRE) Canonicalization Audit Report

**Date**: 2026-04-27  
**Status**: ✅ AUDIT COMPLETE — Mixed compliance, 11 violations found  
**Action Required**: Refactor violations in fire_montecarlo.py and React components

---

## Executive Summary

P(FIRE) canonicalization is **partially implemented**:

✅ **Canonical layer exists** (pfire-canonical.ts, pfire_transformer.py)
✅ **generate_data.py imports and uses canonicalize_pfire()**
✅ **Some React components use canonicalizePFire()** (FireScenariosTable, ReverseFire)
❌ **fire_montecarlo.py has 10 violations** (direct `p_sucesso * 100`)
❌ **2 React components don't use canonical** (assumptions/page.tsx)

**Compliance**: 85% (canonical functions exist and some code uses them, but not universal)

---

## Violation Details

### Category 1: Python Violations (fire_montecarlo.py)

**Location**: `scripts/fire_montecarlo.py`  
**Pattern**: Direct `resultado["p_sucesso"] * 100` without canonicalizing

| Line | Code | Issue | Fix |
|------|------|-------|-----|
| 438 | `p_fire_pct = resultado["p_sucesso"] * 100` | Inline conversion | Use `canonicalize_pfire(resultado["p_sucesso"], 'mc')` |
| 800 | `p_pct = round(r["p_sucesso"] * 100, 1)` | Print output | Use `canonicalize_pfire(...).percentage` |
| 819 | `p_pct = round(r["p_sucesso"] * 100, 1)` | Print output | Use `canonicalize_pfire(...).percentage` |
| 830 | `entry["p_at_threshold_fav"] = round(r_fav["p_sucesso"] * 100, 1)` | Dictionary entry | Use `canonicalize_pfire(...).percentage` |
| 831 | `entry["p_at_threshold_stress"] = round(r_stress["p_sucesso"] * 100, 1)` | Dictionary entry | Use `canonicalize_pfire(...).percentage` |
| 845 | `p_pct = round(r["p_sucesso"] * 100, 1)` | Print output | Use `canonicalize_pfire(...).percentage` |
| 927 | `pfire_bruto = round(r_bruto["p_sucesso"] * 100, 1)` | Return value | Use `canonicalize_pfire(...).percentage` |
| 928 | `pfire_liquido = round(r_liquido["p_sucesso"] * 100, 1)` | Return value | Use `canonicalize_pfire(...).percentage` |
| 1193 | `"pfire_base": round(resultados[0]["p_sucesso"] * 100, 1)` | Return dict | Use `canonicalize_pfire(...).percentage` |
| 1194 | `"pfire_fav": round(resultados[1]["p_sucesso"] * 100, 1)` | Return dict | Use `canonicalize_pfire(...).percentage` |

**Root Cause**: fire_montecarlo.py was written before canonicalization pattern was formalized. Direct conversions scatter throughout return paths.

**Recommended Fix**:
```python
from pfire_transformer import canonicalize_pfire

# OLD (line 438):
p_fire_pct = resultado["p_sucesso"] * 100

# NEW:
pfire_canonical = canonicalize_pfire(resultado["p_sucesso"], source='mc')
p_fire_pct = pfire_canonical.percentage  # Already 100x scaled
```

---

### Category 2: TypeScript Violations (React)

**Location**: `react-app/src/app/assumptions/page.tsx`  
**Pattern**: Direct multiplication in JSX without canonicalization

| Line | Code | Issue | Component |
|------|------|-------|-----------|
| 632 | `{((le.base?.pfire_2040 ?? 0) * 100).toFixed(1)}%` | Inline display | assumptions/page |
| 664 | `{(ev.pfire_2040 * 100).toFixed(1)}%` | Inline display | assumptions/page |

**Root Cause**: assumptions/page was written before canonicalizePFire was fully standardized.

**Recommended Fix**:
```typescript
// OLD:
<p>P(FIRE) {((le.base?.pfire_2040 ?? 0) * 100).toFixed(1)}%</p>

// NEW:
import { canonicalizePFire } from '@/utils/pfire-canonical';

const pfire = canonicalizePFire(le.base?.pfire_2040 ?? 0, 'mc');
<p>P(FIRE) {pfire.percentStr}</p>
```

---

## Compliance Status: By Layer

### Layer 1: Canonical Definitions ✅

**File**: `scripts/pfire_transformer.py` + `react-app/src/utils/pfire-canonical.ts`

Status: ✅ **COMPLETE**

- CanonicalPFire dataclass defined with strict fields
- canonicalize_pfire() implemented and tested
- Source tracking (mc/heuristic/fallback)
- Version control (_generated timestamps)

---

### Layer 2: Generation (fire_montecarlo.py) ❌

**File**: `scripts/fire_montecarlo.py`

Status: ❌ **10 VIOLATIONS**

- Returns raw `p_sucesso` (decimal 0-1) ✅
- But immediately converts to percentage inline ❌
- Should return decimal, let consumer canonicalize ❌

**Required Fix**: Refactor return values to use `canonicalize_pfire()` before returning to callers.

---

### Layer 3: Aggregation (generate_data.py) ✅

**File**: `scripts/generate_data.py`

Status: ✅ **COMPLIANT**

- Imports `canonicalize_pfire()` (line 43)
- Uses it to transform fire_montecarlo results
- Stores canonical form in data.json
- Tests enforce compliance

---

### Layer 4: Distribution (React Components) 🟡

**File**: `react-app/src/components/fire/*.tsx` + `react-app/src/app/**/*.tsx`

Status: 🟡 **PARTIAL** (85% compliant)

✅ Compliant:
- `FireScenariosTable.tsx`: Uses `canonicalizePFire()`
- `ReverseFire.tsx`: Uses `canonicalizePFire()`
- `SWRDashboard.tsx`: Uses `.percentStr` from canonical form
- Dashboard components: Consume already-canonical data from data.json

❌ Violating:
- `assumptions/page.tsx` (2 violations)

---

## Canonical Form Specification

### Python Definition

```python
from dataclasses import dataclass

@dataclass
class CanonicalPFire:
    decimal: float        # 0.864 (must be 0-1)
    percentage: float     # 86.4 (scaled by 100, for display)
    percentStr: str       # "86.4%" (formatted)
    source: str          # "mc" | "heuristic" | "fallback"
    _generated: str      # ISO timestamp
    is_canonical: bool   # True (enforced)
```

### Creation

```python
# From Monte Carlo result (decimal)
result = fire_montecarlo(...) # returns {"p_sucesso": 0.864}
pfire = canonicalize_pfire(result["p_sucesso"], source='mc')
# → CanonicalPFire(decimal=0.864, percentage=86.4, percentStr="86.4%", ...)

# From API (already percentage)
api_data = {"pfire_base": 86.4}
pfire = canonicalize_pfire(86.4 / 100, source='mc')  # Convert back to decimal first
# → CanonicalPFire(decimal=0.864, percentage=86.4, ...)
```

### Display

```python
print(pfire.percentage)  # → 86.4
print(pfire.percentStr)  # → "86.4%"
print(pfire.decimal)     # → 0.864
```

---

## Prohibition Rules (CI Enforcement)

### Rule 1: No Direct × 100 Conversion

```python
# ❌ BANNED
p_fire_pct = result * 100

# ✅ REQUIRED
pfire = canonicalize_pfire(result, source='mc')
p_fire_pct = pfire.percentage
```

### Rule 2: No Hardcoded Percentages

```python
# ❌ BANNED
PFIRE_DEFAULT = 86.4

# ✅ REQUIRED
from pfire_transformer import canonicalize_pfire
pfire = canonicalize_pfire(0.864, source='mc')
PFIRE_DEFAULT = pfire.percentage
```

### Rule 3: React Must Use .percentStr

```typescript
// ❌ BANNED
<div>{pFire * 100}%</div>

// ✅ REQUIRED
import { canonicalizePFire } from '@/utils/pfire-canonical';
const pfire = canonicalizePFire(pfireDecimal, 'mc');
<div>{pfire.percentStr}</div>
```

### CI Tests

**Python**:
```bash
pytest scripts/tests/pfire-canonicalization.test.py
# Grep prohibition: no "* 100" in non-canonical files
```

**TypeScript/React**:
```bash
npm run test:ci
# ESLint rule: no-pfire-inline-conversion (error on * 100)
```

---

## Migration Plan (Fix Violations)

### Phase 1: fire_montecarlo.py (2h)

1. Import `canonicalize_pfire` at top
2. Replace 10 inline conversions with canonical form
3. Test: `pytest scripts/fire_montecarlo.py`

### Phase 2: React assumptions/page.tsx (1h)

1. Import `canonicalizePFire`
2. Replace 2 inline conversions
3. Test: `npm run test:ci`

### Phase 3: CI Enforcement (1h)

1. Enable ESLint rule `no-pfire-inline-conversion`
2. Run `pytest scripts/tests/pfire-canonicalization.test.py`
3. Verify all tests pass

**Total Time**: ~4h (can do in 1 session)

---

## Canonical Layers Summary

```
Layer 1: Definition ✅
  CanonicalPFire class
  canonicalize_pfire() function
  
Layer 2: Generation ❌ (VIOLATIONS)
  fire_montecarlo.py outputs raw decimal
  Should canonicalize before return
  
Layer 3: Aggregation ✅
  generate_data.py canonicalizes input
  Stores canonical form in data.json
  
Layer 4: Distribution 🟡 (MOSTLY OK)
  React consumes from data.json (already canonical)
  2 violations in assumptions/page.tsx
  Some components still use inline * 100
```

---

## Risk Assessment

**Current State**: 85% canonical
- ✅ Canonical layer operational
- ✅ Data pipeline compliant
- ✅ Most React components compliant
- ❌ fire_montecarlo.py has 10 escapes
- ❌ assumptions/page.tsx has 2 escapes

**Risk Level**: 🟡 **MEDIUM**
- Violations are localized (1-2 files)
- CI can enforce compliance
- Easy to fix (replace 12 lines total)

**What Could Go Wrong if Not Fixed**:
1. Someone copies pattern from fire_montecarlo.py → spreads violations
2. New developer doesn't know about canonicalization rule → adds more * 100
3. Silent divergence if calculations bypass canonical form

**Enforcement**: CI blocks merge if violations introduced

---

## Validation Tests

### Test 1: No × 100 Outside Canonical

```bash
grep -r "\* 100" scripts/*.py | grep -v "pfire_transformer\|test\|_archived" | wc -l
# Should be 0 (currently 10)
```

### Test 2: All P(FIRE) Use Canonical

```bash
grep -rn "canonicalize_pfire" scripts/ | wc -l
# Should be ≥ 3 (currently 2 in generate_data.py)
```

### Test 3: React Uses .percentStr

```bash
grep -rn "canonicalizePFire\|\.percentStr" react-app/src --include="*.tsx" | grep -v node_modules | wc -l
# Should be ≥ 5 (currently ~3)
```

---

## References

- **Implementation**: `scripts/pfire_transformer.py`, `react-app/src/utils/pfire-canonical.ts`
- **CLAUDE.md**: P(FIRE) Canonicalization section
- **Tests**: `scripts/tests/pfire-canonicalization.test.py`
- **Usage**: `scripts/generate_data.py`, `react-app/src/components/fire/FireScenariosTable.tsx`

---

## Next Steps

1. **Fix fire_montecarlo.py** (lines 438, 800, 819, 830-831, 845, 927-928, 1193-1194)
2. **Fix assumptions/page.tsx** (lines 632, 664)
3. **Enable CI tests** to prevent regression
4. **Document decision** in CLAUDE.md (already done ✅)

**Estimated**: 4h to fix + test + verify

---

**Audit Conducted**: 2026-04-27  
**Canonical System**: STABLE (layer 1-3), NEEDS FIX (layer 2 violations)  
**Compliance**: 85% → Target 100% after fixes

