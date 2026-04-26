# Guaranteed Invariants — Architectural Enforcement

**Date**: 2026-04-26  
**Purpose**: Define non-negotiable rules for all centralized engines  
**Reference**: Pattern from P(FIRE) Centralization (Phases 1-3)

---

## Core Principle

**Invariants are GUARANTEED by architecture, not by testing.**

Testing can fail (bugs in tests, false negatives). Invariants are enforced so that violating code:
1. Won't compile (TypeScript)
2. Will fail at __post_init__ (Python dataclass)
3. Will be caught by prohibition tests (grep-based QA)

---

## 5 Rules for Every Centralized Engine

### Rule 1️⃣ — SINGLE SOURCE OF TRUTH (No Duplication)

**Requirement**: Calculation logic ONLY in one file/module.

```python
# ❌ VIOLATES invariant — calc in 2 places
generate_data.py:1592     def compute_tax_diferido():
reconstruct_tax.py:92     def compute_tax_diferido()   # DUPLICATE

# ✅ SATISFIES invariant — single authoritative version
scripts/tax_engine.py      class TaxEngine:
                               def calculate(request) -> TaxResult
```

**Enforcement**:
- `grep -r "def compute_tax" scripts/` → Should return ONLY tax_engine.py
- Prohibition test fails if finds duplication
- Code review catches any second implementation

---

### Rule 2️⃣ — INPUT VALIDATION (Fail Fast)

**Requirement**: Every request validated before calculation.

```python
@dataclass
class WithdrawalRequest:
    patrimonio: float
    annual_withdrawal: float
    strategy: Literal['swr', 'vpw', 'guardrails']
    
    def __post_init__(self):
        if self.patrimonio <= 0:
            raise ValueError("patrimonio must be > 0")
        if self.annual_withdrawal < 0:
            raise ValueError("withdrawal cannot be negative")
        if self.strategy not in ['swr', 'vpw', 'guardrails']:
            raise ValueError(f"unknown strategy: {self.strategy}")
```

**Guarantee**: Invalid request = immediate exception, not silent error.

---

### Rule 3️⃣ — OUTPUT VALIDATION (Enforce Invariants)

**Requirement**: Every result validates its own invariants.

```python
@dataclass
class WithdrawalResult:
    recommended_withdrawal: float
    swr: float
    confidence: float
    source: Literal['calculation', 'fallback', 'approximation']
    
    def __post_init__(self):
        # Invariant 1: Results are always valid numbers
        if not (self.recommended_withdrawal >= 0):
            raise ValueError(f"withdrawal must be >= 0, got {self.recommended_withdrawal}")
        
        # Invariant 2: SWR is in valid range
        if not (0 <= self.swr <= 1):
            raise ValueError(f"swr must be in [0,1], got {self.swr}")
        
        # Invariant 3: Confidence is probability
        if not (0 <= self.confidence <= 1):
            raise ValueError(f"confidence must be in [0,1], got {self.confidence}")
        
        # Invariant 4: Source is tracked
        if self.source not in ['calculation', 'fallback', 'approximation']:
            raise ValueError(f"unknown source: {self.source}")
```

**Guarantee**: Impossible to construct invalid result — __post_init__ catches it.

---

### Rule 4️⃣ — RASTREABILITY (Audit Trail)

**Requirement**: Every result declares its origin.

```python
@dataclass
class TaxResult:
    ir_diferido_total: float
    ir_by_etf: dict
    source: Literal['lei14754', 'heuristic']  # ALWAYS tracked
    version: str  # "2.0" — schema version
    _audit_trail: dict  # What inputs were used
    
    # User can ask: "Where did this tax number come from?"
    # Answer is in source + _audit_trail
```

**Guarantee**: No "magic" tax numbers — always traceable to calculation or fallback.

---

### Rule 5️⃣ — PROHIBITION (Grep-Based QA)

**Requirement**: Impossible to use calculation inline.

```bash
# Automated test: CI fails if finds these patterns

❌ grep: "ir_diferido = " (outside TaxEngine)
❌ grep: "swr = " (outside SWREngine)
❌ grep: "guardrail_cut = " (outside GuardrailEngine)
❌ grep: "pool(t) = " (outside BondPoolEngine)
❌ grep: "withdrawal = " inline (outside WithdrawalEngine)

# If violations found:
pytest scripts/tests/test_centralization_prohibitions.py
→ FAIL: "Found 3 inline calculations"
→ CI blocks merge
```

**Enforcement**:
```python
# test_centralization_prohibitions.py
def test_no_inline_tax_calculations():
    """CI prohibits compute_tax_diferido outside TaxEngine"""
    violations = subprocess.run(
        ['grep', '-r', 'ir_diferido.*=', 'scripts/', 'react-app/src'],
        capture_output=True
    ).stdout.decode().split('\n')
    
    # Filter false positives (comments, TaxEngine itself)
    violations = [v for v in violations 
                  if 'tax_engine.py' not in v  # TaxEngine is exempt
                  and '//' not in v]  # Comments are ok
    
    assert len(violations) == 0, f"Found inline tax calcs:\n" + '\n'.join(violations)
```

---

## Pattern: How to Build Guaranteed Invariants

### Example: GuardrailEngine

**Problem**: Guardrails coded in 6 places, different thresholds.

**Solution**:

#### Step 1: Define Single Source

```python
# scripts/guardrail_engine.py
class GuardrailEngine:
    # Thresholds defined ONCE
    THRESHOLDS = [0.15, 0.25, 0.35]  # Drawdown levels
    
    @staticmethod
    def calculate(request: GuardrailRequest) -> GuardrailResult:
        # Single formula for cuts
        ...
```

#### Step 2: Validate Input

```python
@dataclass
class GuardrailRequest:
    base_spending: float
    wealth: float
    peak_wealth: float
    drawdown_pct: float
    
    def __post_init__(self):
        assert self.base_spending > 0
        assert self.wealth > 0
        assert self.peak_wealth >= self.wealth
        assert 0 <= self.drawdown_pct <= 1
```

#### Step 3: Validate Output

```python
@dataclass
class GuardrailResult:
    recommended_spending: float
    guardrail_band: Literal['upper', 'safe', 'lower']
    cut_pct: float
    
    def __post_init__(self):
        # Invariant: Cut cannot exceed 100%
        assert 0 <= self.cut_pct <= 1
        # Invariant: Result is reasonable
        assert self.recommended_spending >= 0
        # Invariant: Band is canonical
        assert self.guardrail_band in ['upper', 'safe', 'lower']
```

#### Step 4: Remove All Other Implementations

```python
# ❌ DELETE these:
fire_montecarlo.py:362-368        aplicar_guardrail()        # REMOVE
SequenceOfReturnsRisk.tsx:46-60   drawdownToSpending()       # REMOVE
GuardrailsMechanismChart.tsx:27   getSpendingCut()           # REMOVE
# + 3 more

# ✅ REPLACE with:
from scripts.guardrail_engine import GuardrailEngine
result = GuardrailEngine.calculate(request)
```

#### Step 5: Prohibition Test

```bash
# CI test to prevent re-introduction of duplicates
grep -r "aplicar_guardrail\|drawdownToSpending\|getSpendingCut" scripts/ react-app/
# Must return ONLY comments or history, no executable code
```

---

## Validation Checklist (For Each Engine)

- [ ] **Single Source**: Calculation only in ONE file
- [ ] **Input Validation**: All __post_init__ checks pass
- [ ] **Output Validation**: Result __post_init__ enforces invariants
- [ ] **Source Tracking**: Result has source field (Literal with allowed values)
- [ ] **Prohibition Tests**: grep tests prevent re-duplication
- [ ] **Unit Tests**: 8+ test cases (valid, invalid, edge cases)
- [ ] **Integration Tests**: Old code removed, new code used everywhere
- [ ] **Cross-Platform**: Python ↔ TypeScript consistent (where applicable)
- [ ] **Documentation**: Invariants documented and examples provided

---

## Impossible Operations (By Design)

After centralization, these become architecturally IMPOSSIBLE:

### Before (P(FIRE) — could happen):
```python
pfire_decimal = 0.863
pct = pfire_decimal * 100  # ❌ Anyone can do this
# Result: scattered conversions, silent bugs
```

### After (P(FIRE) centralized — impossible):
```python
# ❌ This compiles but fails at runtime:
pfire_decimal = 0.863
pct = pfire_decimal * 100  # Not from canonicalizePFire()

# ✅ This is the ONLY way:
from pfire_canonical import canonicalizePFire
canonical = canonicalizePFire(0.863, 'mc')
pct = canonical.percentage  # Guaranteed correct form
```

---

## For Each New Engine (Apply This Template)

### GuardrailEngine Invariants

```python
# INVARIANT 1: Thresholds are immutable
GuardrailEngine.THRESHOLDS = (0.15, 0.25, 0.35)  # Read-only

# INVARIANT 2: Cut formula is centralized
# cut = apply_guardrail(drawdown%, base_spending) → [0, 1]
# Implemented ONCE in GuardrailEngine.calculate()

# INVARIANT 3: Result is always valid
result = GuardrailEngine.calculate(request)
assert result.cut_pct >= 0 and result.cut_pct <= 1
assert result.guardrail_band in ['upper', 'safe', 'lower']

# INVARIANT 4: No calculation outside engine
# grep -r "cut_pct\|guardrail_cut" → only GuardrailEngine
```

### WithdrawalEngine Invariants

```python
# INVARIANT 1: Strategies are enumerated
strategies: Literal['swr', 'vpw', 'guardrails', 'dynamic']

# INVARIANT 2: Single calculation point
result = WithdrawalEngine.calculate(request)

# INVARIANT 3: Result has confidence score [0, 1]
assert 0 <= result.confidence <= 1

# INVARIANT 4: Python == TypeScript (same seed)
py_result = WithdrawalEngine.calculate(req, seed=42)
ts_result = WithdrawalEngine.calculate(req, seed=42)
assert py_result.recommended == ts_result.recommended
```

---

## Why Invariants Matter

**Scenario**: Tax law changes (Lei 14.754/2023 update).

### Without Invariants (Current state):
```
Tax calc in 2 files:
- generate_data.py:1592-1650
- reconstruct_tax.py:92-130

Developer updates ONE file, forgets other → Silent bug.
Months later, tax calculations diverge without warning.
```

### With Invariants (After centralization):
```
Tax calc in 1 file: tax_engine.py

Developer updates TaxEngine.
All code using TaxEngine uses NEW calculation automatically.
Prohibition test prevents re-duplication.
Cannot have divergent tax logic.
```

---

## Enforcement Across Organization

| Who | Responsibility |
|-----|-----------------|
| **Quant** | Define canonical formulas (invariants must match math) |
| **Dev** | Implement invariants (validation, prohibition tests) |
| **Head** | Audit compliance (no exceptions, no "just for now" hacks) |
| **CI/CD** | Enforce at merge time (prohibition tests block PRs) |

---

## References

- `pfire-canonical.ts` / `pfire_transformer.py` — Exemplar (P(FIRE))
- `test_pfire_engine.py` — Test pattern with invariant validation
- `validate_pfire_centralization.sh` — Validation script template

---

**Last Updated**: 2026-04-26  
**Pattern Owner**: Head  
**Applies To**: All centralized engines (Tax, Bond Pool, SWR, Guardrails, Withdrawal, Spending Smile, Factor)
